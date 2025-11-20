# NOUS Boundaries Configuration

> Define limites e regras invioláveis que o NOUS deve respeitar.

---

## Limites de Custo

### Diário
```yaml
daily_limits:
  total: 50.00           # R$ 50 por dia (total)
  per_agent: 10.00       # R$ 10 por agent
  per_module: 5.00       # R$ 5 por módulo
  per_mcp_call: 0.50     # R$ 0.50 por chamada MCP

  alert_at: 40.00        # Alertar em 80% (R$ 40)
  hard_stop: true        # Parar ao atingir limite
```

**Ação ao exceder:** Pausar agents e notificar usuário

### Mensal
```yaml
monthly_limits:
  total: 500.00          # R$ 500 por mês
  alert_at: 400.00       # Alertar em 80%

  breakdown:
    health: 150.00       # R$ 150 para saúde
    finance: 100.00      # R$ 100 para finanças
    work: 150.00         # R$ 150 para trabalho
    misc: 100.00         # R$ 100 diversos
```

---

## Permissões por Contexto

### /context/health
```yaml
permissions:
  read:
    - health.history      ✅ Agents podem ler sem confirmação
    - health.exams        ✅ Agents podem ler sem confirmação
    - health.medications  ⚠️  Apenas com permissão explícita
    - health.genetics     ❌ NUNCA sem confirmação

  write:
    - health.analysis     ✅ Agents podem escrever análises
    - health.history      ❌ NUNCA modificar histórico diretamente

  share_external:
    - hospitals           ⚠️  Apenas via FHIR com confirmação
    - pharmacies          ⚠️  Apenas receitas, não histórico completo
    - insurance           ❌ NUNCA sem confirmação explícita múltipla
```

### /context/finance
```yaml
permissions:
  read:
    - finance.balance     ✅ Agents podem ler
    - finance.transactions ✅ Agents podem ler
    - finance.investments ⚠️  Apenas @finance/advisor
    - finance.tax_data    ❌ Requer autenticação extra

  write:
    - finance.analysis    ✅ Pode escrever análises
    - finance.budget      ✅ Pode sugerir ajustes

  transactions:
    small_value:          # < R$ 100
      auto_approve: true  # Pode executar se configurado
      notification: sms   # Notifica por SMS

    medium_value:         # R$ 100 - R$ 1.000
      auto_approve: false
      require: confirmation
      notification: push + sms

    large_value:          # > R$ 1.000
      auto_approve: false
      require: confirmation + 2FA
      notification: push + sms + email
```

### /context/work
```yaml
permissions:
  read:
    - work.calendar       ✅ Agents podem ler
    - work.tasks          ✅ Agents podem ler
    - work.emails         ⚠️  Apenas títulos, não conteúdo
    - work.proprietary    ❌ NUNCA sem confirmação

  write:
    - work.calendar       ⚠️  Apenas sugestões, não commits
    - work.tasks          ✅ Pode criar/atualizar tarefas

  share_external:
    - team_members        ⚠️  Apenas informações não-sensíveis
    - clients             ❌ NUNCA sem aprovação explícita
```

### /context/personal
```yaml
permissions:
  read:
    - personal.journal    ⚠️  Apenas para análise de bem-estar
    - personal.relationships ✅ Para lembretes e sugestões
    - personal.goals      ✅ Para alinhamento de decisões

  write:
    - personal.journal    ❌ NUNCA modificar entradas do usuário
    - personal.insights   ✅ Pode adicionar insights

  share_external:
    - NUNCA               ❌ Dados pessoais NÃO saem do NOUS
```

---

## Context Integrity (Anti-Hallucination)

> **Inspirado em:** Daniel Miessler's Personal AI Infrastructure (PAI)
>
> **Problema:** LLMs podem "alucinar" (inventar) informações sobre você que não existem no CONTEXT.
>
> **Solução:** Enforcement rigoroso de Context Integrity - garantir que agents APENAS usem dados reais.

### Regras Fundamentais

```yaml
context_integrity_rules:
  1_never_claim_without_load:
    description: "NUNCA afirme conhecer informação sem ter carregado o contexto"
    enforcement: "critical"
    examples:
      ❌ BAD: "Seu colesterol está em 185" (sem ter lido context:health)
      ✅ GOOD: "Não tenho acesso ao seu colesterol. Devo carregar context:health?"

  2_always_cite_sources:
    description: "SEMPRE cite qual contexto foi usado na resposta"
    enforcement: "required"
    examples:
      ❌ BAD: "Você tem consulta amanhã"
      ✅ GOOD: "Baseado em context:health.appointments, você tem consulta amanhã às 14h"

  3_timestamp_validation:
    description: "Sempre mencione quando o dado foi atualizado"
    enforcement: "recommended"
    examples:
      ❌ BAD: "Seu saldo é R$ 1.500"
      ✅ GOOD: "Baseado em context:finance.balance (atualizado em 2025-11-10), seu saldo é R$ 1.500"

  4_explicit_unknowns:
    description: "Se contexto não existe, diga claramente 'não sei'"
    enforcement: "critical"
    examples:
      ❌ BAD: "Você provavelmente pesa 75kg" (chute)
      ✅ GOOD: "Não tenho seu peso registrado em context:health. Gostaria de adicionar?"

  5_no_inference_on_personal_data:
    description: "NUNCA inferir dados pessoais não registrados"
    enforcement: "critical"
    examples:
      ❌ BAD: "Como você tem 35 anos, deve estar pensando em filhos"
      ✅ GOOD: "Não tenho informação sobre seus planos familiares. Isso é relevante para a decisão?"
```

### Enforcement Técnico

#### Four-Layer Context Enforcement
(Baseado em Daniel Miessler's approach)

```yaml
layer_1_documentation:
  description: "Documentar sistema de contexto para os agents"
  implementation:
    - Incluir CONTEXT.md em toda chamada de agent
    - Explicar estrutura de pastas (health/, finance/, etc)
    - Listar quais contextos agent TEM permissão para acessar

layer_2_hook_injection:
  description: "Hook que injeta check de contexto em toda interação"
  implementation:
    - onAgentExecute hook SEMPRE inclui:
      """
      ANTES de responder, verifique:
      1. Você carregou os contextos necessários?
      2. Os dados estão atualizados?
      3. Você tem permissão para acessá-los?

      SE NÃO: Diga "Preciso carregar [contexto]. Posso?"
      """

layer_3_aggressive_instructions:
  description: "Instruções explícitas no system prompt"
  implementation:
    - Adicionar ao system prompt de TODOS os agents:
      """
      🚨 CRITICAL RULE: DO NOT LIE ABOUT USER DATA

      - NEVER claim to know information you haven't loaded
      - NEVER infer personal data (age, weight, relationships, etc)
      - ALWAYS cite context path when referencing user data
      - IF uncertain, say "I don't have that information"

      Violation = Agent pause + Security log
      """

layer_4_logging_and_audit:
  description: "Log toda acesso a contexto"
  implementation:
    - Toda leitura de CONTEXT gera log:
      {
        "type": "context_access",
        "agent": "@health/physician",
        "path": "context:health.bloodwork",
        "operation": "read",
        "timestamp": "2025-11-12T14:30:00Z",
        "granted": true
      }

    - Usuário pode auditar: "Qual contexto o agent usou?"
    - Sistema detecta discrepâncias (agent menciona dado não carregado)
```

### Validation em Runtime

```typescript
// functions/src/agents/contextIntegrityCheck.ts

/**
 * Valida se agent respeitou Context Integrity
 */
async function validateContextIntegrity(
  userId: string,
  agent: string,
  input: string,
  output: string,
  contextLoaded: string[]
): Promise<{ valid: boolean; violations: string[] }> {

  const violations: string[] = [];

  // 1. Check: Agent mencionou dados pessoais?
  const personalDataMentions = extractPersonalDataReferences(output);

  for (const mention of personalDataMentions) {
    // Ex: mention = "seu colesterol é 185"
    const requiredContext = mapDataToContext(mention); // → "context:health.bloodwork"

    if (!contextLoaded.includes(requiredContext)) {
      violations.push(
        `Agent referenced ${requiredContext} without loading it`
      );
    }
  }

  // 2. Check: Agent citou fontes?
  const hasCitations = output.includes('context:') ||
                       output.includes('baseado em') ||
                       output.includes('de acordo com');

  if (personalDataMentions.length > 0 && !hasCitations) {
    violations.push('Agent referenced user data without citing source');
  }

  // 3. Check: Agent disse "não sei" quando apropriado?
  const claimsKnowledge = /você (tem|é|está)/i.test(output);
  const admitsUnknown = /não (tenho|sei|possuo)/i.test(output);

  if (claimsKnowledge && contextLoaded.length === 0) {
    violations.push('Agent claimed knowledge without loading any context');
  }

  // Log violations
  if (violations.length > 0) {
    await logSecurityEvent(userId, {
      type: 'context_integrity_violation',
      severity: 'medium',
      agent,
      violations,
      action_taken: 'logged'
    });
  }

  return {
    valid: violations.length === 0,
    violations
  };
}
```

### Penalidades por Violação

```yaml
violation_handling:
  first_violation:
    action: "warning_to_user"
    message: "⚠️ Agent {{agent}} mencionou dados sem carregar contexto"
    log_level: "warning"

  second_violation:
    action: "pause_agent"
    duration: 3600  # 1 hora
    message: "🚨 Agent {{agent}} violou Context Integrity 2x. Pausado por 1h."
    log_level: "error"

  third_violation:
    action: "disable_agent"
    message: "❌ Agent {{agent}} desabilitado por violações repetidas"
    require_manual_review: true
    log_level: "critical"

  marketplace_agents:
    # Agents da comunidade têm regras mais rígidas
    first_violation:
      action: "flag_for_review"
      notify_marketplace: true

    second_violation:
      action: "remove_from_marketplace"
      refund_users: true
```

### User Transparency

#### Context Access Report
Usuário pode ver exatamente o que cada agent acessou:

```typescript
// UI: Dashboard > Privacy > Context Access Log

[2025-11-12 14:30] @health/physician
  ✅ Read: context:health.bloodwork (2025-11-10)
  ✅ Read: context:health.medications (current)
  ❌ Denied: context:health.genetics (not granted)

[2025-11-12 10:15] @finance/advisor
  ✅ Read: context:finance.transactions (last 30 days)
  ✅ Read: context:finance.budget (2025-11)
  ⚠️  Attempted: context:finance.tax_data (requires 2FA)
```

#### Hallucination Detection UI

```typescript
// Se sistema detecta possível alucinação
<Alert type="warning">
  🤔 Possível inconsistência detectada

  Agent @health/physician disse:
  "Seu colesterol está em 240"

  Mas não carregou context:health.bloodwork

  [Reportar] [Ignorar] [Ver Contexto Usado]
</Alert>
```

### Exemples Práticos

#### ❌ Violação de Context Integrity

```yaml
User: "Como está minha saúde?"

Agent: "@health/physician"
Output: "Sua saúde está ótima! Seu colesterol está em 185,
         pressão 120/80, e você não tem nenhum problema."

Context Loaded: []  # NENHUM!

Violation: ❌ Agent inventou dados sem carregar contexto
Action: Warning + Log security event
```

#### ✅ Context Integrity Correto

```yaml
User: "Como está minha saúde?"

Agent: "@health/physician"

# Primeiro, verifica permissões
Permission Check:
  - context:health.bloodwork → Granted ✅
  - context:health.exams → Granted ✅

# Carrega contextos necessários
Context Loaded:
  - context:health.bloodwork (updated: 2025-11-10)
  - context:health.exams (updated: 2025-11-08)

Output: "Baseado em seus últimos exames:

         **Bloodwork (2025-11-10):**
         - Colesterol: 185 mg/dL ✅ (normal)
         - Glicose: 92 mg/dL ✅ (normal)

         **Physical Exam (2025-11-08):**
         - Pressão: 120/80 ✅ (normal)

         No geral, seus indicadores estão dentro da normalidade.

         📊 Fonte: context:health.bloodwork, context:health.exams"

Integrity Check: ✅ PASSED
- All data referenced was loaded
- Sources cited
- Timestamps included
```

### Testing Context Integrity

```yaml
# Testes automatizados para garantir enforcement

test_cases:
  test_1_no_context_loaded:
    input: "Quanto eu tenho no banco?"
    context_loaded: []
    expected_output_contains: ["não tenho acesso", "devo carregar"]
    expected_output_NOT_contains: ["R$", "saldo"]

  test_2_cite_sources:
    input: "Qual meu último exame?"
    context_loaded: ["context:health.exams"]
    expected_output_contains: ["context:health", "2025-11"]
    expected_output_NOT_contains: ["provavelmente", "talvez"]

  test_3_stale_data_warning:
    input: "Quanto eu gastei este mês?"
    context_loaded: ["context:finance.transactions"]
    context_last_updated: "2025-10-15"  # 30 dias atrás
    expected_output_contains: ["dados podem estar desatualizados", "última atualização"]

  test_4_graceful_unknown:
    input: "Qual meu tipo sanguíneo?"
    context_loaded: ["context:health.profile"]
    context_data: { blood_type: null }
    expected_output_contains: ["não tenho registrado", "gostaria de adicionar"]
    expected_output_NOT_contains: ["A+", "O-", "AB"]  # Não pode chutar
```

---

## Data Retention

### Logs
```yaml
logs:
  system:
    retention: 30         # 30 dias
    auto_delete: true

  agents:
    retention: 90         # 90 dias
    auto_delete: false    # Usuário decide manualmente

  transactions:
    retention: 2555       # 7 anos (compliance fiscal)
    auto_delete: false
    encrypted: true

  conversations:
    retention: unlimited  # Indefinido
    user_control: true    # Usuário pode deletar a qualquer momento
```

### CONTEXT
```yaml
context:
  versioning: true        # Git-like versioning
  backup:
    frequency: weekly
    retention: unlimited
    encrypted: true

  deletion:
    auto: false           # NUNCA deleta automaticamente
    manual: requires_confirmation
```

### VAULT
```yaml
vault:
  sync:
    frequency: real-time
    conflict_resolution: ask_user

  deletion:
    local_delete: sync_to_cloud  # Deletar local = deletar na nuvem
    cloud_delete: keep_local     # Deletar na nuvem = manter local
    permanent: requires_2FA
```

---

## Third-Party Integration Limits

### MCP Servers
```yaml
mcp:
  max_calls_per_day:
    per_server: 50        # 50 chamadas por servidor/dia
    total: 200            # 200 chamadas totais/dia

  timeout: 10             # 10 segundos timeout

  failure_handling:
    consecutive_failures: 3
    action: disable_temporarily
    cooldown: 3600        # 1 hora
```

### Protocolos Externos
```yaml
protocols:
  e_commerce:
    max_purchases_per_day: 10
    max_value_per_day: 1000.00  # R$ 1.000

  healthcare_fhir:
    max_queries_per_day: unlimited  # Sem limite (emergências)
    require_encryption: true

  open_banking:
    max_transactions_per_day: 20
    max_value_per_transaction: 10000.00  # R$ 10.000
    require_2FA: true       # Sempre requer 2FA
```

---

## User Interruption Policy

### Quando PODE Interromper Usuário

#### 🚨 Emergências
- ✅ Emergência médica detectada
- ✅ Fraude financeira detectada
- ✅ Security breach detectado
- ✅ Deadline crítico em < 1 hora

#### ⏰ Horários Permitidos
```yaml
interruption_hours:
  weekdays:
    start: "07:00"
    end: "22:00"

  weekends:
    start: "08:00"
    end: "22:00"

  exceptions:
    emergencies: "anytime"  # Emergências a qualquer hora
```

### Quando NÃO PODE Interromper

#### ❌ Situações Proibidas
- ❌ Fora do horário configurado (22h-7h)
- ❌ Durante reuniões (via calendário)
- ❌ Modo "Do Not Disturb" ativo
- ❌ Localização = "cinema", "teatro", "igreja"
- ❌ Por coisas não urgentes

#### 📱 Canais de Notificação
```yaml
notification_channels:
  emergency:
    - push_notification
    - sms
    - phone_call         # Liga para o usuário
    - email

  important:
    - push_notification
    - email

  normal:
    - push_notification

  low_priority:
    - email_daily_digest
```

---

## Agent Sandbox Rules

### Isolamento
```yaml
sandbox:
  type: strict            # Isolamento rigoroso

  network_access:
    allowed_domains:      # Apenas domínios aprovados
      - "*.anthropic.com"
      - "*.openai.com"
      - "pubmed.ncbi.nlm.nih.gov"

    blocked:
      - "unknown_domains"
      - "suspicious_ips"

  filesystem_access:
    read:
      - "/context/*"      # Apenas conforme permissões
      - "/vault/*"        # Apenas conforme permissões

    write:
      - "/context/*/analysis/*"  # Apenas análises
      - "/logs/*"         # Logs próprios

    blocked:
      - "/identity/*"     # NUNCA modificar identity
      - "/system/*"       # NUNCA acessar sistema
```

### Rate Limiting
```yaml
rate_limits:
  api_calls:
    per_minute: 60
    per_hour: 500
    burst: 10

  cost:
    per_call: 1.00        # Máximo R$ 1 por chamada
    alert_at: 0.50        # Alertar se custo > R$ 0.50
```

---

## Security Rules

### Agent Installation
```yaml
installation:
  require_signature: true     # Agent deve ser assinado
  verify_checksum: true       # Verificar integridade

  source_trust:
    official_store: auto_approve
    community_verified: require_review
    unknown: block

  review_checklist:
    - Check permissions requested
    - Review source code (if open-source)
    - Check author reputation
    - Verify ratings > 4.0
    - Confirm no security alerts
```

### Runtime Monitoring
```yaml
monitoring:
  @security/guardian:
    always_on: true
    priority: critical

    watch_for:
      - unusual_data_access
      - high_api_costs
      - external_communication_attempts
      - permission_violations
      - suspicious_patterns

    action_on_detection:
      1. pause_agent
      2. log_incident
      3. notify_user
      4. request_decision
```

---

## Compliance

### GDPR / LGPD
```yaml
compliance:
  right_to_access: true       # Usuário pode ver TODOS os dados
  right_to_deletion: true     # Usuário pode deletar TUDO
  right_to_portability: true  # Exportar em formato legível
  right_to_rectification: true # Corrigir dados incorretos

  data_processing:
    purpose_limitation: true   # Dados só para fins declarados
    data_minimization: true    # Coletar apenas o necessário
    storage_limitation: true   # Retenção limitada conforme regras
```

### Audit Trail
```yaml
audit:
  log_all_access: true        # Toda acesso é logado
  immutable_logs: true        # Logs não podem ser alterados
  retention: 365              # Manter por 1 ano
  user_accessible: true       # Usuário pode revisar
```

---

## Version Control

```yaml
version: 1.0.0
last_updated: 2025-01-12
author: user

changelog:
  - 2025-01-12: Initial boundaries configuration
  - 2025-01-12: Defined cost limits and permissions
  - 2025-01-12: Established interruption policies
```

---

## Notes

**Customize este arquivo conforme suas necessidades:**

- **Limites de custo:** Ajuste baseado no seu orçamento
- **Horários:** Configure conforme sua rotina
- **Permissões:** Mais ou menos restritivo conforme seu conforto
- **Notificações:** Escolha canais que funcionam para você

**Regras de ouro:**
1. **Se em dúvida, seja mais restritivo** - pode relaxar depois
2. **Revise mensalmente** - suas necessidades mudam
3. **Teste limites** - veja se fazem sentido na prática

**Lembre-se:** Esses limites existem para **proteger você** e **dar controle total** sobre o NOUS.
