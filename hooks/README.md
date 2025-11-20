# HOOKS - Sistema de Automação por Eventos

> **Inspirado em:** Daniel Miessler's Personal AI Infrastructure (PAI)
>
> **Objetivo:** Permitir automação proativa sem polling. NOUS reage a eventos automaticamente.

---

## O que são HOOKS?

**HOOKS** são gatilhos automáticos que executam ações quando eventos específicos acontecem.

Exemplo simples:
```
Evento: Novo exame de sangue adicionado ao CONTEXT
Hook detecta: Colesterol alto
Ação automática: Agenda consulta com cardiologista
```

**Sem hooks:** Você precisa perguntar "NOUS, veja meu exame"
**Com hooks:** NOUS analisa automaticamente e te notifica se houver problema

---

## Tipos de Hooks

### 1️⃣ `onContextUpdate`
Dispara quando qualquer dado no CONTEXT muda.

```yaml
# hooks/health-monitor.yml
hook: onContextUpdate
name: "Monitor de Saúde Crítico"
watch: "context:health.*"

conditions:
  - path: "context:health.bloodwork.cholesterol"
    operator: ">"
    value: 240
    severity: "high"

  - path: "context:health.bloodwork.glucose"
    operator: ">"
    value: 126
    severity: "high"

actions:
  - type: "call_agent"
    agent: "@health/physician"
    input: "Analise os últimos resultados e sugira próximos passos"
    priority: "P1"

  - type: "notify"
    channel: "push"
    message: "⚠️ Resultados de exame requerem atenção"

  - type: "log"
    level: "warning"
    message: "Health metrics out of normal range"
```

**Uso real:**
- Detectar problemas de saúde automaticamente
- Monitorar gastos (se ultrapassar orçamento)
- Alertar sobre prazos importantes

---

### 2️⃣ `onAgentComplete`
Dispara após um agent terminar de executar.

```yaml
# hooks/finance-logger.yml
hook: onAgentComplete
name: "Logger de Decisões Financeiras"
agent: "@finance/advisor"

conditions:
  - output_contains: "recomendo investir"

actions:
  - type: "update_context"
    path: "context:finance.recommendations"
    append: true
    data: "{{agent.output}}"

  - type: "call_agent"
    agent: "@finance/tax-analyzer"
    input: "Qual o impacto fiscal desta recomendação?"

  - type: "log"
    path: "logs/finance_decisions"
    data: "{{agent.full_execution}}"
```

**Uso real:**
- Criar pipeline de agents (um chama o outro)
- Logging automático de decisões importantes
- Validação cruzada (segundo agent revisa primeiro)

---

### 3️⃣ `onSchedule`
Dispara em horários específicos (cron-like).

```yaml
# hooks/weekly-review.yml
hook: onSchedule
name: "Revisão Semanal Automática"
schedule: "0 9 * * MON"  # Segunda-feira 9h

actions:
  - type: "call_agent"
    agent: "@life/weekly-planner"
    input: "Prepare minha revisão semanal"

  - type: "call_agent"
    agent: "@health/wellness-coach"
    input: "Como foi minha semana em saúde?"

  - type: "call_agent"
    agent: "@finance/budget-tracker"
    input: "Resumo financeiro da última semana"

  - type: "synthesize"
    agents_results: ["weekly-planner", "wellness-coach", "budget-tracker"]
    model: "claude-sonnet-4"
    prompt: "Crie um resumo executivo da semana e sugira prioridades"

  - type: "notify"
    channel: "email"
    subject: "📊 Sua Revisão Semanal"
    body: "{{synthesis.output}}"
```

**Uso real:**
- Revisões semanais automáticas
- Check-ups de saúde mensais
- Lembrete de pagar contas
- Backup de dados

---

### 4️⃣ `onThreshold`
Dispara quando limites são ultrapassados.

```yaml
# hooks/cost-control.yml
hook: onThreshold
name: "Controle de Custos Diário"
watch: "usage.cost_daily"

conditions:
  - operator: ">"
    value: 45.00  # R$ 45 (90% do limite de R$ 50)
    severity: "high"

actions:
  - type: "pause_agents"
    agents: ["all"]
    except: ["@core/emergency"]

  - type: "notify"
    channel: "push"
    message: "⚠️ Limite de custo diário atingido (90%)"
    priority: "urgent"

  - type: "log"
    type: "security_event"
    severity: "high"
    event_type: "cost_limit_exceeded"
```

**Uso real:**
- Proteger contra gastos excessivos
- Alertar sobre uso anormal de agents
- Detectar possível agent com bug (loop infinito)

---

### 5️⃣ `onProtocolCall`
Dispara antes/depois de chamadas a protocolos externos.

```yaml
# hooks/financial-transaction-guard.yml
hook: onProtocolCall
name: "Guardião de Transações Financeiras"
protocol: "open_banking"
trigger: "before"  # Antes da transação

conditions:
  - transaction.amount > 1000.00
  - transaction.type == "payment"

actions:
  - type: "require_approval"
    method: "2FA"
    timeout: 300  # 5 minutos
    message: "Aprovar pagamento de R$ {{transaction.amount}}?"

  - type: "call_agent"
    agent: "@finance/fraud-detector"
    input: "Esta transação parece legítima?"
    wait: true  # Bloqueia até resposta

  - type: "log"
    type: "financial_transaction"
    details: "{{transaction}}"
```

**Uso real:**
- Segurança financeira (2FA para valores altos)
- Detecção de fraude
- Auditoria de transações

---

### 6️⃣ `onVaultChange`
Dispara quando arquivos no VAULT mudam.

```yaml
# hooks/medical-document-processor.yml
hook: onVaultChange
name: "Processador de Documentos Médicos"
watch: "vault:health/exams/**"

conditions:
  - file_type: "pdf"
  - file_name_contains: ["exame", "resultado", "laudo"]

actions:
  - type: "call_agent"
    agent: "@health/document-analyzer"
    input:
      file: "{{vault.file_path}}"
      task: "Extrair dados estruturados deste exame"

  - type: "update_context"
    path: "context:health.exams"
    append: true
    data: "{{agent.output}}"

  - type: "trigger_hook"
    hook: "onContextUpdate"  # Dispara outro hook!
```

**Uso real:**
- Upload de exame → Extração automática → Análise → Alerta se necessário
- OCR automático de documentos
- Organização inteligente de arquivos

---

---

## 🆕 Integração com Nova Arquitetura (Flowise + LangGraph)

### HOOKS com Flowise Agents

Hooks podem disparar agents criados no Flowise (no-code):

```yaml
# hooks/health-monitor-flowise.yml
hook: onContextUpdate
name: "Monitor de Colesterol (Flowise Agent)"
watch: "context:health.bloodwork"

conditions:
  - path: "context:health.bloodwork.cholesterol"
    operator: ">"
    value: 200

actions:
  - type: "call_agent"
    agent: "@health/cholesterol-monitor"
    runtime: "flowise"  # ← Especifica que é agent do Flowise
    input: "Analise os últimos resultados de colesterol"
```

### HOOKS com LangGraph Workflows

Hooks podem disparar workflows stateful complexos:

```yaml
# hooks/buy-ticket-scheduled.yml
hook: onSchedule
name: "Compra de Passagem Agendada"
schedule: "0 */1 * * *"  # A cada 1 hora

actions:
  - type: "call_workflow"
    workflow: "ticket_monitor"
    runtime: "langgraph"  # ← Especifica workflow LangGraph
    state:
      destination: "São Paulo"
      max_price: 500
      frequency: "1h"
      deadline: "15 days"

  - type: "create_working_task"  # ← Cria task em WORKING
    task_name: "buy-ticket-sao-paulo"
    link_to_workflow: true
```

### Hook com Human-in-the-Loop

Hooks podem disparar workflows que pausam para aprovação:

```yaml
# hooks/financial-transaction-approval.yml
hook: onProtocolCall
name: "Guardião de Transações (com Aprovação)"
protocol: "open_banking"
trigger: "before"

conditions:
  - transaction.amount > 1000

actions:
  - type: "call_workflow"
    workflow: "financial_transaction_guard"
    runtime: "langgraph"
    state:
      transaction: "{{transaction}}"
      require_approval: true  # ← Workflow pausa para aprovação
```

**Workflow LangGraph:**
```python
# workflows/financial_transaction_guard.py
workflow.add_node("analyze", analyze_transaction)
workflow.add_node("wait_approval", wait_approval_node)  # ← PAUSA
workflow.add_node("execute", execute_transaction)

# Só executa se aprovado
workflow.add_conditional_edges("wait_approval", should_execute)
```

### Vantagens da Integração

| Tipo de Hook | Runtime | Vantagens |
|--------------|---------|-----------|
| **Agent Simples** | Firebase Function | Rápido (< 1s), barato |
| **Agent Flowise** | Flowise | No-code, visual builder |
| **Workflow LangGraph** | Cloud Run | Stateful, long-running, human-in-the-loop |

**Quando usar cada um:**

```yaml
Firebase Function:
  - Hook simples (< 30s execution)
  - Stateless
  - Ex: Notificação, update CONTEXT

Flowise Agent:
  - Criado por creator no marketplace
  - No-code configuration
  - Ex: Agent de terceiro

LangGraph Workflow:
  - Execução longa (minutos/horas/dias)
  - Precisa de state (checkpointing)
  - Human-in-the-loop
  - Ex: Compra agendada, ligação telefônica, monitoramento 24/7
```

---

## Arquitetura Técnica

### Firebase Functions Implementation

```typescript
// functions/src/hooks/onContextUpdate.ts
import * as functions from 'firebase-functions';
import { executeHook } from './executor';

export const onContextUpdateTrigger = functions.firestore
  .document('users/{userId}/context/{contextPath}')
  .onWrite(async (change, context) => {
    const { userId, contextPath } = context.params;

    // Buscar hooks ativos que monitoram este caminho
    const hooksSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('hooks')
      .where('type', '==', 'onContextUpdate')
      .where('watch', 'array-contains', `context:${contextPath}`)
      .where('enabled', '==', true)
      .get();

    // Executar cada hook
    for (const hookDoc of hooksSnapshot.docs) {
      const hook = hookDoc.data();

      // Verificar condições
      const shouldExecute = await evaluateConditions(
        hook.conditions,
        change.after.data(),
        change.before.data()
      );

      if (shouldExecute) {
        await executeHook(userId, hook, {
          change,
          contextPath,
          timestamp: new Date()
        });
      }
    }
  });
```

### Hook Executor

```typescript
// functions/src/hooks/executor.ts
async function executeHook(userId: string, hook: Hook, event: any) {
  console.log(`[HOOK] Executing: ${hook.name}`);

  for (const action of hook.actions) {
    switch (action.type) {
      case 'call_agent':
        await executeAgent(userId, action.agent, action.input);
        break;

      case 'notify':
        await sendNotification(userId, action.channel, action.message);
        break;

      case 'update_context':
        await updateContext(userId, action.path, action.data);
        break;

      case 'log':
        await createLog(userId, action.type, action.data);
        break;

      case 'pause_agents':
        await pauseAgents(userId, action.agents);
        break;

      case 'require_approval':
        await requestApproval(userId, action.method, action.message);
        break;
    }
  }

  // Log hook execution
  await db.collection('users').doc(userId).collection('logs').add({
    type: 'hook_execution',
    hook: hook.name,
    timestamp: new Date(),
    event,
    status: 'completed'
  });
}
```

---

## Interface Web (Next.js)

### Hook Manager UI

```typescript
// app/dashboard/hooks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function HooksPage() {
  const { user } = useAuth();
  const [hooks, setHooks] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection('users')
      .doc(user.uid)
      .collection('hooks')
      .onSnapshot(snapshot => {
        setHooks(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });

    return unsubscribe;
  }, [user]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Automation Hooks</h1>

      <div className="grid gap-4">
        {hooks.map(hook => (
          <HookCard key={hook.id} hook={hook} />
        ))}
      </div>

      <button
        onClick={() => router.push('/dashboard/hooks/create')}
        className="btn-primary mt-6"
      >
        + Create New Hook
      </button>
    </div>
  );
}

function HookCard({ hook }) {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{hook.name}</h3>
          <p className="text-gray-600">{hook.type}</p>
        </div>

        <Toggle
          checked={hook.enabled}
          onChange={(enabled) => updateHook(hook.id, { enabled })}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-700">
          <strong>Watches:</strong> {hook.watch}
        </p>

        <p className="text-sm text-gray-700 mt-2">
          <strong>Actions:</strong> {hook.actions.length} configured
        </p>
      </div>

      {hook.last_executed && (
        <p className="text-xs text-gray-500 mt-4">
          Last executed: {formatDate(hook.last_executed)}
        </p>
      )}
    </div>
  );
}
```

---

## Exemplos Práticos de HOOKS

### 1. Auto-agendamento Médico

```yaml
hook: onContextUpdate
name: "Auto-agendar Consultas"
watch: "context:health.exams"

conditions:
  - path: "context:health.exams.latest.needs_followup"
    operator: "=="
    value: true

actions:
  - type: "call_agent"
    agent: "@health/scheduling-assistant"
    input: "Agende consulta de retorno com base no último exame"

  - type: "notify"
    message: "📅 Consulta de retorno agendada automaticamente"
```

**Resultado:** Você faz exame → NOUS detecta que precisa retorno → Agenda automaticamente

---

### 2. Proteção Anti-Fraude

```yaml
hook: onProtocolCall
name: "Detector de Fraude"
protocol: "open_banking"
trigger: "before"

conditions:
  - transaction.amount > 500
  - OR:
    - hour < 6 OR hour > 23  # Horário suspeito
    - recipient not in trusted_list

actions:
  - type: "pause_transaction"
    duration: 300

  - type: "call_agent"
    agent: "@finance/fraud-detector"
    input: "Analisar suspeita: {{transaction}}"

  - type: "require_approval"
    method: "2FA"
    message: "Transação suspeita detectada. Confirmar?"
```

---

### 3. Otimização de Investimentos

```yaml
hook: onSchedule
name: "Rebalanceamento Mensal"
schedule: "0 10 1 * *"  # Dia 1 de cada mês, 10h

actions:
  - type: "call_agent"
    agent: "@finance/portfolio-analyzer"
    input: "Analise meu portfólio atual"

  - type: "call_agent"
    agent: "@finance/investment-advisor"
    input: "Sugira rebalanceamento baseado na análise"

  - type: "require_approval"
    method: "explicit"
    message: "Aprovar rebalanceamento: {{advisor.output}}"

  - type: "protocol_call"
    protocol: "open_banking"
    action: "rebalance_portfolio"
    params: "{{advisor.recommendations}}"
```

---

## Segurança e Limites

### Boundaries para HOOKS

```yaml
# Definido em identity/boundaries.md

hook_limits:
  max_hooks_per_user: 50
  max_actions_per_hook: 10
  max_execution_time: 30000  # 30 segundos
  max_daily_executions: 1000

hook_permissions:
  free_tier:
    - onSchedule: 5 hooks
    - onContextUpdate: 10 hooks
    - onThreshold: 5 hooks

  premium_tier:
    - onSchedule: 50 hooks
    - onContextUpdate: unlimited
    - onThreshold: unlimited
    - onProtocolCall: 10 hooks

  concierge_tier:
    - all: unlimited
    - custom_hooks: yes

security_rules:
  - Hooks financeiros SEMPRE requerem aprovação
  - Hooks que modificam CONTEXT sensível requerem confirmação
  - Custo de hooks conta no limite diário
  - Hooks não podem criar outros hooks (prevenir recursão)
  - Hooks pausam automaticamente após 3 falhas consecutivas
```

---

## Logging de HOOKS

Todo hook executado gera log estruturado:

```json
{
  "type": "hook_execution",
  "timestamp": "2025-11-12T14:30:00Z",
  "hook": {
    "id": "hook_abc123",
    "name": "Monitor de Saúde Crítico",
    "type": "onContextUpdate"
  },
  "trigger": {
    "context_path": "context:health.bloodwork",
    "change_type": "update",
    "new_value": { "cholesterol": 245 },
    "old_value": { "cholesterol": 185 }
  },
  "conditions_met": true,
  "actions_executed": [
    {
      "type": "call_agent",
      "agent": "@health/physician",
      "status": "success",
      "cost": 0.15,
      "duration_ms": 3500
    },
    {
      "type": "notify",
      "channel": "push",
      "status": "success"
    }
  ],
  "total_cost": 0.15,
  "total_duration_ms": 3800,
  "status": "completed"
}
```

---

## Hook Templates (Marketplace)

Usuários podem instalar hooks pré-configurados:

```yaml
# marketplace/hooks/health-monitor-basic.yml
template: "Basic Health Monitor"
description: "Monitora exames e alerta sobre valores anormais"
category: "health"
author: "@nous/official"
price: "free"

install:
  - hook: onContextUpdate
    watch: "context:health.*"
    conditions: [...]
    actions: [...]
```

---

## Prioridades de Execução

Quando múltiplos hooks disparam simultaneamente:

```yaml
priority_order:
  P0: emergency_hooks      # Saúde crítica
  P1: security_hooks       # Fraude, invasão
  P2: financial_hooks      # Transações, limites
  P3: automation_hooks     # Conveniência
  P4: logging_hooks        # Auditoria
```

---

## Roadmap: HOOKS

### MVP (Fase 1)
- ✅ onContextUpdate (básico)
- ✅ onSchedule (cron simples)
- ✅ onThreshold (limites de custo)

### Fase 2
- ✅ onAgentComplete
- ✅ onProtocolCall
- ✅ Hook marketplace (templates)
- ✅ UI completa de gerenciamento

### Fase 3
- ✅ onVaultChange
- ✅ Hooks compostos (um hook dispara outro)
- ✅ Conditions avançadas (AI-powered)
- ✅ Hook analytics (métricas de uso)

---

## Conclusão

**HOOKS transformam NOUS de reativo para PROATIVO.**

Sem hooks:
- Você pergunta → NOUS responde

Com hooks:
- NOUS monitora → Detecta problema → Age automaticamente

**Exemplos reais:**
- Upload exame → Análise automática → Alerta se houver problema
- Gasto alto → Pausa compras → Te notifica
- Segunda-feira 9h → Revisão semanal automática → Email com resumo

HOOKS são o que torna NOUS um verdadeiro "Sistema Operacional" e não apenas um chatbot inteligente.
