# Context Caching & Fallback Logic

> **Problema:** Como NOUS gerencia context que é lido múltiplas vezes? E o que faz quando informação NÃO existe?

---

## 1. Context Caching Strategy

### Problema

```typescript
// Cenário ruim (SEM cache):
User: "Como está minha saúde?"
→ NOUS lê context:health.bloodwork do Firestore

User: "E meu colesterol especificamente?"
→ NOUS lê context:health.bloodwork NOVAMENTE (desperdício!)

User: "Está dentro do normal?"
→ NOUS lê context:health.bloodwork PELA TERCEIRA VEZ 🤦
```

**Resultado:** Lento + custo alto + UX ruim

### Solução: Three-Layer Cache

```
┌─────────────────────────────────────────┐
│   Layer 1: Memory Cache (in-session)   │
│   TTL: Até fim da sessão               │
│   Storage: RAM (objeto JavaScript)      │
└─────────────────────────────────────────┘
              ↓ (cache miss)
┌─────────────────────────────────────────┐
│   Layer 2: Redis Cache (cross-session) │
│   TTL: Configurável (5min - 1h)        │
│   Storage: Redis (Firebase extension)  │
└─────────────────────────────────────────┘
              ↓ (cache miss)
┌─────────────────────────────────────────┐
│   Layer 3: Firestore (source of truth) │
│   TTL: Indefinido                      │
│   Storage: Database                     │
└─────────────────────────────────────────┘
```

### Implementação

```typescript
// core/context-manager.ts

class ContextManager {
  private memoryCache: Map<string, CachedContext> = new Map();
  private redis: RedisClient;

  async loadContext(
    userId: string,
    path: string,
    options: LoadOptions = {}
  ): Promise<ContextData> {
    const cacheKey = `${userId}:${path}`;

    // Layer 1: Memory cache (fastest)
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && !this.isExpired(memCached)) {
      console.log(`[CACHE HIT] Memory: ${path}`);
      return memCached.data;
    }

    // Layer 2: Redis cache (fast)
    const redisCached = await this.redis.get(cacheKey);
    if (redisCached) {
      console.log(`[CACHE HIT] Redis: ${path}`);
      const data = JSON.parse(redisCached);

      // Populate memory cache
      this.memoryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: this.getTTL(path)
      });

      return data;
    }

    // Layer 3: Firestore (source of truth)
    console.log(`[CACHE MISS] Fetching from Firestore: ${path}`);
    const doc = await db
      .collection('users').doc(userId)
      .collection('context')
      .doc(path)
      .get();

    if (!doc.exists) {
      throw new ContextNotFoundError(path);
    }

    const data = doc.data() as ContextData;

    // Populate both caches
    this.memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.getTTL(path)
    });

    await this.redis.set(
      cacheKey,
      JSON.stringify(data),
      'EX',
      this.getTTL(path)
    );

    return data;
  }

  /**
   * TTL baseado em tipo de contexto
   */
  private getTTL(path: string): number {
    // Context estático (muda raramente) → cache longo
    if (path.startsWith('goals.') || path.startsWith('values.')) {
      return 3600; // 1 hora
    }

    // Context dinâmico (muda frequentemente) → cache curto
    if (path.startsWith('finance.balance') || path.startsWith('health.vitals')) {
      return 300; // 5 minutos
    }

    // Default
    return 900; // 15 minutos
  }

  /**
   * Invalidate cache quando context é atualizado
   */
  async invalidateCache(userId: string, path: string) {
    const cacheKey = `${userId}:${path}`;

    // Clear memory
    this.memoryCache.delete(cacheKey);

    // Clear Redis
    await this.redis.del(cacheKey);

    console.log(`[CACHE INVALIDATE] ${path}`);
  }
}
```

### Firestore Trigger para Invalidação

```typescript
// functions/src/triggers/onContextUpdate.ts

export const invalidateCacheOnUpdate = functions.firestore
  .document('users/{userId}/context/{contextPath}')
  .onWrite(async (change, context) => {
    const { userId, contextPath } = context.params;

    // Invalidate cache quando context muda
    await contextManager.invalidateCache(userId, contextPath);

    // Também executa hooks (se houver)
    await HookManager.executeHooksForEvent(userId, 'onContextUpdate', {
      contextPath,
      before: change.before.data(),
      after: change.after.data()
    });
  });
```

### Benefícios

- ✅ **Performance**: Memory cache = ~1ms, Redis = ~5ms, Firestore = ~50ms
- ✅ **Cost**: Reduz reads do Firestore em ~80%
- ✅ **UX**: Respostas instantâneas
- ✅ **Smart TTL**: Cache longo para dados estáticos, curto para dinâmicos

---

## 2. Fallback Logic: O que fazer quando contexto NÃO existe?

### Problema

```typescript
User: "Como está meu colesterol?"

Agent @health/physician tenta:
  → loadContext('health.bloodwork')
    → ❌ NOT FOUND

E agora? 🤷
```

### Solução: Fallback Chain

```
┌─────────────────────────────────────────────────┐
│  Step 1: Check Primary Source (CONTEXT)        │
│  → context:health.bloodwork                     │
└─────────────────────────────────────────────────┘
              ↓ (not found)
┌─────────────────────────────────────────────────┐
│  Step 2: Check Historical Data (PROFILE)       │
│  → profile.query("bloodwork history")           │
│  → Returns: Old exams (if any)                  │
└─────────────────────────────────────────────────┘
              ↓ (still not found)
┌─────────────────────────────────────────────────┐
│  Step 3: Check Raw Files (VAULT)               │
│  → vault.search("*.pdf", tags: ["exam", "lab"])│
│  → Found: exam-2024.pdf (but not processed)    │
└─────────────────────────────────────────────────┘
              ↓ (still not found)
┌─────────────────────────────────────────────────┐
│  Step 4: Ask User                               │
│  → ESCALATE to CORE                             │
│  → CORE asks user to provide                    │
│  → Offer: "Quer que eu te ajude a agendar?"    │
└─────────────────────────────────────────────────┘
```

### Implementação: Agent Error Handling

```typescript
// agents/health/physician.ts

export class PhysicianAgent extends Agent {
  async _execute(userId: string, input: string): Promise<AgentResponse> {
    try {
      // Tenta carregar context
      const bloodwork = await this.loadContext(userId, 'health.bloodwork');

      return this.analyzeBloodwork(bloodwork, input);

    } catch (error) {
      if (error instanceof ContextNotFoundError) {
        // Context não existe → Fallback chain
        return await this.handleMissingContext(userId, 'health.bloodwork', input);
      }

      throw error;
    }
  }

  /**
   * Fallback chain quando context não existe
   */
  private async handleMissingContext(
    userId: string,
    contextPath: string,
    originalInput: string
  ): Promise<AgentResponse> {
    // Step 1: Check PROFILE (historical)
    const historical = await this.checkProfile(userId, contextPath);
    if (historical) {
      return {
        status: 'partial_success',
        output: `Não tenho dados recentes, mas baseado em histórico:\n\n${historical}`,
        suggestion: 'Recomendo adicionar dados atualizados ao CONTEXT.',
        actions: [
          {
            type: 'schedule_exam',
            label: 'Agendar novo exame'
          }
        ]
      };
    }

    // Step 2: Check VAULT (unprocessed files)
    const vaultFiles = await this.checkVault(userId, contextPath);
    if (vaultFiles.length > 0) {
      return {
        status: 'needs_processing',
        output: `Encontrei ${vaultFiles.length} arquivo(s) no VAULT que podem conter essa informação, mas ainda não foram processados.`,
        actions: [
          {
            type: 'process_vault_files',
            label: 'Processar arquivos',
            files: vaultFiles
          }
        ]
      };
    }

    // Step 3: Escalate to CORE (ask user)
    return {
      status: 'missing_data',
      output: `Não encontrei dados de ${contextPath}.`,
      escalation: {
        to: 'CORE',
        reason: 'missing_required_context',
        contextPath,
        originalInput
      },
      actions: [
        {
          type: 'provide_data',
          label: 'Adicionar dados manualmente'
        },
        {
          type: 'schedule_collection',
          label: 'Agendar coleta (exame de sangue)'
        }
      ]
    };
  }

  private async checkProfile(userId: string, contextPath: string): Promise<string | null> {
    try {
      const result = await profile.query(userId, `historical data for ${contextPath}`);
      return result.data;
    } catch {
      return null;
    }
  }

  private async checkVault(userId: string, contextPath: string): Promise<VaultFile[]> {
    // Search VAULT for related files
    const tags = this.extractTagsFromPath(contextPath); // ex: ["health", "bloodwork"]
    return await vault.search(userId, { tags, fileTypes: ['pdf', 'jpg', 'png'] });
  }
}
```

### CORE: Handling Escalations

```typescript
// core/escalation-handler.ts

export class EscalationHandler {
  async handleEscalation(
    userId: string,
    escalation: AgentEscalation
  ): Promise<CoreResponse> {
    switch (escalation.reason) {
      case 'missing_required_context':
        return await this.handleMissingContext(userId, escalation);

      case 'permission_denied':
        return await this.handlePermissionDenied(userId, escalation);

      case 'agent_error':
        return await this.handleAgentError(userId, escalation);

      default:
        return this.unknownEscalation(escalation);
    }
  }

  private async handleMissingContext(
    userId: string,
    escalation: AgentEscalation
  ): Promise<CoreResponse> {
    const { contextPath, originalInput } = escalation;

    // Carregar user preferences (IDENTITY)
    const identity = await this.loadIdentity(userId);

    // Decidir como interagir com user
    if (identity.preferences.auto_ask_missing_data) {
      // User prefere que NOUS pergunte automaticamente
      return {
        type: 'ask_user',
        message: this.craftUserQuestion(contextPath, originalInput),
        options: [
          { label: 'Adicionar agora', action: 'provide_data' },
          { label: 'Agendar coleta', action: 'schedule' },
          { label: 'Ignorar', action: 'skip' }
        ]
      };
    } else {
      // User prefere notificação silenciosa
      return {
        type: 'silent_notification',
        notification: {
          title: 'Dados faltando',
          body: `${contextPath} não encontrado. Clique para adicionar.`,
          priority: 'low'
        }
      };
    }
  }

  private craftUserQuestion(contextPath: string, originalInput: string): string {
    // Gera pergunta amigável para o user
    const pathMap = {
      'health.bloodwork': 'exames de sangue',
      'finance.balance': 'saldo bancário atual',
      'health.weight': 'peso atual'
    };

    const friendlyName = pathMap[contextPath] || contextPath;

    return `Para responder "${originalInput}", preciso de ${friendlyName}.

Você pode:
1. Adicionar dados manualmente
2. Fazer upload de arquivo (PDF, imagem)
3. Agendar coleta (se for exame)

O que prefere?`;
  }
}
```

---

## 3. Agent Communication Protocol

### Quando agent precisa de dados de OUTRO agent

```typescript
// Example: @finance/tax-planner precisa de dados do @finance/advisor

export class TaxPlannerAgent extends Agent {
  async _execute(userId: string, input: string): Promise<AgentResponse> {
    // Precisa de recomendações de investimento do advisor
    const investmentAdvice = await this.callOtherAgent(
      userId,
      '@finance/advisor',
      'Quais são as recomendações de investimento atuais?'
    );

    if (investmentAdvice.status === 'missing_data') {
      // Advisor também não tem dados → Escalate
      return {
        status: 'blocked',
        output: 'Não posso calcular impostos sem dados de investimentos.',
        escalation: {
          to: 'CORE',
          reason: 'dependency_missing_data',
          dependency: '@finance/advisor',
          originalInput: input
        }
      };
    }

    // Continue com cálculo de impostos...
    return this.calculateTaxes(investmentAdvice.data);
  }

  private async callOtherAgent(
    userId: string,
    agentName: string,
    query: string
  ): Promise<AgentResponse> {
    // CORE orchestrates inter-agent communication
    return await this.core.executeAgent(userId, agentName, query);
  }
}
```

---

## 4. User Experience: Como isso aparece para o user?

### Scenario 1: Context exists (cache hit)

```
User: "Como está meu colesterol?"

[CACHE HIT - Memory]
Response (1ms): "Baseado em context:health.bloodwork (2025-11-10),
                 seu colesterol está em 185 mg/dL ✅ (normal < 200)"
```

### Scenario 2: Context doesn't exist → Has historical data

```
User: "Como está meu colesterol?"

[CACHE MISS → PROFILE found old data]
Response (500ms): "Não tenho dados recentes, mas em 2024-10-15
                   seu colesterol estava em 190 mg/dL.

                   [Botão: Agendar novo exame]
                   [Botão: Adicionar dados manualmente]"
```

### Scenario 3: No data anywhere → Ask user

```
User: "Como está meu colesterol?"

[CACHE MISS → PROFILE empty → VAULT empty → ESCALATE]
Response (200ms): "Não encontrei dados de colesterol.

                   Como posso ajudar?
                   [Botão: Upload de exame (PDF/foto)]
                   [Botão: Adicionar valor manualmente]
                   [Botão: Agendar exame de sangue]"
```

### Scenario 4: Data exists in VAULT (unprocessed)

```
User: "Como está meu colesterol?"

[CACHE MISS → PROFILE empty → VAULT found exam-2025.pdf]
Response (800ms): "Encontrei um exame no VAULT (exam-2025.pdf) que pode
                   conter essa informação, mas ainda não foi processado.

                   [Botão: Processar agora] (~30 segundos)
                   [Botão: Ver arquivo original]"
```

---

## 5. Configuration: User Controls Fallback Behavior

```yaml
# identity/preferences.md

fallback_behavior:
  missing_context:
    action: "ask_user" # ou "silent_notification", "auto_collect"
    urgency: "high" # quanto insistir

  use_historical_data:
    enabled: true
    max_age_days: 365 # Dados com + de 1 ano = avisar que estão velhos

  auto_process_vault:
    enabled: false # Se true, processa arquivos VAULT automaticamente
    file_types: ["pdf", "jpg", "png"]

  escalation_preference:
    immediate_questions: true # Perguntar imediatamente vs notificar depois
    interrupt_during: ["work_hours"] # Quando PODE interromper
```

---

## 6. Monitoring & Analytics

```typescript
// Dashboard: Context Health

{
  "context_coverage": {
    "health": 85%, // 85% dos contexts esperados existem
    "finance": 60%,
    "goals": 100%
  },

  "cache_hit_rate": {
    "memory": 70%,
    "redis": 20%,
    "firestore": 10%
  },

  "escalations_last_30d": {
    "missing_context": 45,
    "permission_denied": 3,
    "agent_error": 2
  },

  "fallback_success_rate": {
    "profile_found": 30%, // 30% das vezes, PROFILE tinha dados históricos
    "vault_found": 15%,   // 15% das vezes, VAULT tinha arquivo
    "user_provided": 50%, // 50% das vezes, user adicionou manualmente
    "still_missing": 5%   // 5% nunca foram resolvidos
  }
}
```

---

## Resumo: Como tudo funciona junto

1. **Agent precisa de context** → Check cache (3 layers)
2. **Cache miss** → Fetch Firestore → Populate cache
3. **Context not found** → Fallback chain:
   - Check PROFILE (histórico)
   - Check VAULT (arquivos)
   - Escalate to CORE
4. **CORE decide** → Baseado em user preferences:
   - Ask user immediately
   - Silent notification
   - Auto-collect (se possível)
5. **User responde** → Context updated → Cache invalidated
6. **Agent retry** → Now context exists → Success!

**Resultado:** Sistema robusto que NUNCA trava, sempre tem um plano B! ✅
