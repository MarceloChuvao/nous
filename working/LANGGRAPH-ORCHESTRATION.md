# LangGraph Orchestration - Workflows Stateful no NOUS OS

> **Orquestração de workflows complexos, stateful e interativos usando LangGraph**

---

## 📋 Índice

1. [Por que LangGraph?](#por-que-langgraph)
2. [Arquitetura](#arquitetura)
3. [Workflows Stateful](#workflows-stateful)
4. [Human-in-the-Loop](#human-in-the-loop)
5. [Consultas Paralelas](#consultas-paralelas-durante-execução)
6. [Scheduled Tasks](#scheduled-tasks-monitoramento-247)
7. [Sub-Agents](#sub-agents-nested-graphs)
8. [Exemplos Práticos Completos](#exemplos-práticos-completos)
9. [Integração com Firebase](#integração-com-firebase)
10. [Deploy e Execução](#deploy-e-execução)

---

## Por que LangGraph?

### ❌ Problema: Firebase Stateless Não Resolve

**Cenário impossível com Firebase Functions stateless:**

```typescript
// Firebase Function (stateless)
export const callAgent = functions.https.onCall(async (data) => {
  // Executa
  const result = await agent.run(data.query);
  // Termina
  return result;
});

// PROBLEMAS:
❌ Não mantém state durante execução
❌ Cada call é isolada
❌ User não consegue consultar "no meio" da execução
❌ Execuções longas (> 60s) dão timeout
❌ Não há checkpointing (se cair, perde tudo)
```

### ✅ Solução: LangGraph Stateful Workflows

**Mesmo cenário com LangGraph:**

```python
from langgraph.graph import StateGraph
from langgraph.checkpoint.firestore import FirestoreSaver

# State compartilhado (salvo no Firestore)
class AgentState(TypedDict):
    user_id: str
    call_in_progress: bool
    call_transcript: list[str]
    user_queries: list[str]  # ← User pode adicionar durante execução
    agent_responses: list[str]

# Workflow
workflow = StateGraph(AgentState)
workflow.add_node("make_call", make_call_node)  # Roda 15 minutos

# Checkpointing (state salvo a cada passo)
checkpointer = FirestoreSaver(
    project_id="nous-os",
    collection_name="agent_states"
)

app = workflow.compile(checkpointer=checkpointer)

# RESOLVIDO:
✅ State compartilhado (agent e user veem mesmos dados)
✅ Checkpointing automático (resiliente a falhas)
✅ Long-running (horas/dias)
✅ User consulta DURANTE execução (paralelo)
✅ Resume from any checkpoint
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                  LangGraph Orchestration                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User                                                       │
│   │                                                         │
│   ├─ Inicia workflow                                        │
│   ├─ Consulta durante execução (paralelo)                  │
│   ├─ Aprova/rejeita em pause nodes                         │
│   └─ Recebe notificações real-time                         │
│        ↕ (WebSocket + Firestore listeners)                 │
│                                                             │
│  Firebase (Shared State)                                    │
│   ├─ agent_states/{user_id}/                               │
│   │   ├─ state: {...}                     ← Checkpointing  │
│   │   ├─ checkpoint_history: [...]                         │
│   │   └─ pending_queries: [...]          ← User queries    │
│   │                                                         │
│   └─ scheduled_tasks/{task_id}/                            │
│       ├─ conditions: {...}                                 │
│       ├─ last_check: timestamp                             │
│       └─ executions: [...]                                 │
│        ↕                                                    │
│                                                             │
│  LangGraph Runtime (Cloud Run)                              │
│   ├─ Workflow Executor                                     │
│   │   ├─ Stateful execution                                │
│   │   ├─ Checkpoint manager                                │
│   │   └─ Node execution engine                             │
│   │                                                         │
│   ├─ Query Handler (paralelo)                              │
│   │   ├─ Lê state do workflow em execução                  │
│   │   ├─ Processa query do user                            │
│   │   └─ Escreve resposta no shared state                  │
│   │                                                         │
│   └─ Scheduler (Cloud Tasks)                               │
│       ├─ Monitora condições (cron)                         │
│       ├─ Trigger execução quando satisfeito                │
│       └─ Fallback configurável                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflows Stateful

### Conceito: Checkpointing

LangGraph salva o state **automaticamente** a cada node executado:

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.firestore import FirestoreSaver
from typing import TypedDict

class WorkflowState(TypedDict):
    user_id: str
    step: int
    data: dict
    result: str | None

def step_1(state: WorkflowState):
    # Faz algo
    return {"step": 1, "data": {"processed": True}}
    # ← State é SALVO no Firestore aqui automaticamente

def step_2(state: WorkflowState):
    # Usa state do step anterior
    data = state["data"]
    return {"step": 2, "result": "done"}
    # ← State é SALVO novamente

# Configura workflow
workflow = StateGraph(WorkflowState)
workflow.add_node("step_1", step_1)
workflow.add_node("step_2", step_2)
workflow.add_edge("step_1", "step_2")

# Checkpointing no Firestore
checkpointer = FirestoreSaver(
    project_id="nous-os",
    collection_name="agent_states"
)

app = workflow.compile(checkpointer=checkpointer)

# Execute
result = await app.ainvoke(
    {"user_id": "user123"},
    config={"configurable": {"thread_id": "unique_execution_id"}}
)
```

**Firestore Structure:**

```
agent_states/
└── user123/
    └── executions/
        └── unique_execution_id/
            ├── state: {step: 2, data: {...}, result: "done"}
            ├── checkpoint_history:
            │   ├─ 0: {step: 0, data: null}
            │   ├─ 1: {step: 1, data: {processed: true}}
            │   └─ 2: {step: 2, result: "done"}
            └── metadata:
                ├─ started_at: "2025-01-15T10:00:00Z"
                ├─ last_updated: "2025-01-15T10:05:23Z"
                └─ status: "completed"
```

### Vantagem: Resume from Checkpoint

Se o processo cair, retoma de onde parou:

```python
# Processo caiu no meio do step_2

# Retomar execução
result = await app.ainvoke(
    None,  # ← Não precisa passar input novamente
    config={"configurable": {"thread_id": "unique_execution_id"}}
)

# LangGraph carrega automaticamente do último checkpoint
# e continua de onde parou!
```

---

## Human-in-the-Loop

### Conceito: Pause Nodes

Workflow pausa esperando input do usuário:

```python
from langgraph.graph import StateGraph, END

class ApprovalState(TypedDict):
    user_id: str
    script: str
    user_approved: bool | None

def prepare_script(state: ApprovalState):
    """Node 1: Prepara script"""
    script = generate_script()
    return {"script": script}

def wait_for_approval(state: ApprovalState):
    """Node 2: PAUSA esperando usuário aprovar"""
    # Este node não faz nada, apenas retorna state
    # Workflow PAUSA aqui até user responder
    return state

def execute_call(state: ApprovalState):
    """Node 3: Executa ligação"""
    if state["user_approved"]:
        make_phone_call(state["script"])
        return {"result": "Call completed"}
    return {"result": "Cancelled"}

# Workflow
workflow = StateGraph(ApprovalState)
workflow.add_node("prepare", prepare_script)
workflow.add_node("wait", wait_for_approval)  # ← PAUSE NODE
workflow.add_node("execute", execute_call)

workflow.set_entry_point("prepare")
workflow.add_edge("prepare", "wait")

# Edge condicional: só executa se aprovado
def should_execute(state):
    if state.get("user_approved") is None:
        return "wait"  # ← Fica no loop até user responder
    return "execute" if state["user_approved"] else END

workflow.add_conditional_edges("wait", should_execute)

app = workflow.compile(checkpointer=checkpointer)
```

**Fluxo de Execução:**

```typescript
// Frontend: Inicia workflow
const response = await fetch('/api/workflows/start', {
  method: 'POST',
  body: JSON.stringify({
    workflow: 'call_agent',
    user_id: 'user123'
  })
});

const { thread_id } = await response.json();
// → "execution_abc123"

// Workflow roda até o pause node
// State no Firestore:
// {
//   script: "Olá, quero cancelar...",
//   user_approved: null  ← Aguardando
// }

// Frontend mostra UI para aprovação
// User clica "Aprovar"

// Frontend atualiza state
await fetch('/api/workflows/resume', {
  method: 'POST',
  body: JSON.stringify({
    thread_id,
    update: { user_approved: true }
  })
});

// Workflow retoma e continua para o node "execute"
```

---

## Consultas Paralelas Durante Execução

### Cenário: Ligação Telefônica com Consultas

**User precisa consultar informações DURANTE a ligação:**

```python
from langgraph.graph import StateGraph

class CallState(TypedDict):
    user_id: str
    call_in_progress: bool
    call_transcript: list[str]
    user_queries: list[str]  # ← Queue de queries do user
    agent_responses: list[str]  # ← Respostas

def make_phone_call(state: CallState):
    """Node que faz ligação (roda por 15 minutos)"""

    call = start_call("0800-CLARO")
    state["call_in_progress"] = True

    # Loop durante ligação
    while call.is_active():
        # 1. Processa áudio
        audio = call.get_audio()
        transcript = transcribe(audio)
        state["call_transcript"].append(transcript)

        # 2. VERIFICA se user fez query (paralelo)
        if state["user_queries"]:
            query = state["user_queries"].pop(0)

            # Responde query
            response = handle_query(query, state)
            state["agent_responses"].append(response)

            # USA resposta na ligação
            if "conta" in query.lower():
                call.speak(f"Meu número é {response}")

        # 3. Atualiza state no Firestore (checkpoint)
        # LangGraph faz isso automaticamente

        sleep(1)  # Loop a cada segundo

    state["call_in_progress"] = False
    return state

workflow = StateGraph(CallState)
workflow.add_node("call", make_phone_call)
app = workflow.compile(checkpointer=checkpointer)
```

**User Query Handler (Firebase Function em Paralelo):**

```typescript
// functions/src/queryDuringCall.ts
export const queryDuringCall = functions.https.onCall(
  async (data, context) => {
    const { user_id, query } = data;

    // 1. Acessa state do workflow em execução
    const stateRef = admin.firestore()
      .collection('agent_states')
      .doc(user_id)
      .collection('executions')
      .where('call_in_progress', '==', true)
      .limit(1);

    const docs = await stateRef.get();
    if (docs.empty) {
      throw new Error('No call in progress');
    }

    const executionDoc = docs.docs[0];

    // 2. Adiciona query na fila
    await executionDoc.ref.update({
      user_queries: admin.firestore.FieldValue.arrayUnion(query)
    });

    // 3. Espera resposta (Firestore listener)
    return new Promise((resolve) => {
      const unsubscribe = executionDoc.ref.onSnapshot((snapshot) => {
        const state = snapshot.data()!;

        // Verifica se agent respondeu
        const responses = state.agent_responses || [];
        if (responses.length > 0) {
          const lastResponse = responses[responses.length - 1];
          unsubscribe();
          resolve({ response: lastResponse });
        }
      });
    });
  }
);
```

**Frontend Real-time:**

```typescript
// lens/components/call-in-progress.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

export function CallInProgress({ userId, executionId }: Props) {
  const [state, setState] = useState<any>(null);
  const [query, setQuery] = useState('');

  // Real-time listener no state
  useEffect(() => {
    const stateRef = doc(
      db,
      'agent_states',
      userId,
      'executions',
      executionId
    );

    const unsubscribe = onSnapshot(stateRef, (snapshot) => {
      setState(snapshot.data());
    });

    return () => unsubscribe();
  }, [userId, executionId]);

  // Envia query para o agent
  const handleQuery = async () => {
    await queryDuringCall({ user_id: userId, query });
    setQuery('');
  };

  return (
    <div>
      {/* Transcrição da ligação */}
      <div className="transcript">
        <h3>Ligação em andamento...</h3>
        {state?.call_transcript?.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {/* Consultar durante ligação */}
      <div className="query-box">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Qual meu CPF?"
        />
        <button onClick={handleQuery}>Consultar</button>

        {/* Respostas */}
        {state?.agent_responses?.map((response, i) => (
          <p key={i} className="response">{response}</p>
        ))}
      </div>
    </div>
  );
}
```

---

## Scheduled Tasks (Monitoramento 24/7)

### Cenário: Compra de Passagem (15 dias monitorando preço)

**User:** "Compre passagem para SP nos próximos 15 dias quando preço < R$ 500"

```python
from langgraph.graph import StateGraph, END
from datetime import datetime, timedelta

class TicketMonitorState(TypedDict):
    user_id: str
    destination: str
    max_price: float
    deadline: datetime
    check_frequency: str  # "1h", "15min", "real-time"
    current_price: float | None
    purchased: bool
    executions: list[dict]

def monitor_price_node(state: TicketMonitorState):
    """Node que monitora preço periodicamente"""

    # 1. Busca preço atual
    price = fetch_flight_price(state["destination"])
    state["current_price"] = price

    # 2. Log execution
    state["executions"].append({
        "timestamp": datetime.now().isoformat(),
        "price": price
    })

    # 3. Verifica se deadline passou
    if datetime.now() > state["deadline"]:
        return {"purchased": False, "reason": "Deadline reached"}

    return state

def check_condition_node(state: TicketMonitorState):
    """Verifica se condição foi satisfeita"""
    if state["current_price"] and state["current_price"] < state["max_price"]:
        return {"should_buy": True}
    return {"should_buy": False}

def buy_ticket_node(state: TicketMonitorState):
    """Compra passagem"""
    result = purchase_ticket(
        destination=state["destination"],
        price=state["current_price"]
    )
    return {"purchased": True, "ticket": result}

def notify_user_node(state: TicketMonitorState):
    """Notifica usuário"""
    if state["purchased"]:
        send_notification(
            state["user_id"],
            f"✅ Passagem comprada! R$ {state['current_price']}"
        )
    else:
        send_notification(
            state["user_id"],
            f"❌ Não encontrei passagem nas condições em 15 dias"
        )
    return state

# Workflow
workflow = StateGraph(TicketMonitorState)
workflow.add_node("monitor", monitor_price_node)
workflow.add_node("check", check_condition_node)
workflow.add_node("buy", buy_ticket_node)
workflow.add_node("notify", notify_user_node)

workflow.set_entry_point("monitor")
workflow.add_edge("monitor", "check")

# Conditional edges
def should_buy(state):
    if state.get("should_buy"):
        return "buy"
    # Se não deve comprar, volta a monitorar
    return "monitor"

def should_continue_monitoring(state):
    if state.get("purchased") or datetime.now() > state["deadline"]:
        return "notify"  # Termina
    return "monitor"  # Continua monitorando

workflow.add_conditional_edges("check", should_buy)
workflow.add_conditional_edges("buy", lambda s: "notify")
workflow.add_conditional_edges("monitor", should_continue_monitoring)

app = workflow.compile(checkpointer=checkpointer)
```

**Scheduler (Cloud Tasks):**

```python
# agents/scheduler/ticket_monitor.py
from google.cloud import tasks_v2
from datetime import timedelta

def schedule_ticket_monitoring(
    user_id: str,
    destination: str,
    max_price: float,
    frequency: str  # "1h", "15min"
):
    """Agenda task para monitorar preço"""

    client = tasks_v2.CloudTasksClient()
    project = 'nous-os'
    queue = 'ticket-monitoring'
    location = 'us-central1'

    parent = client.queue_path(project, location, queue)

    # Calcula intervalo
    interval_minutes = {
        "1h": 60,
        "15min": 15,
        "real-time": 1
    }[frequency]

    # Cria task recorrente (executa a cada intervalo por 15 dias)
    for day in range(15):
        for _ in range(24 * 60 // interval_minutes):
            task = {
                'http_request': {
                    'http_method': tasks_v2.HttpMethod.POST,
                    'url': 'https://langgraph-runtime.run.app/execute',
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'workflow': 'ticket_monitor',
                        'user_id': user_id,
                        'state': {
                            'destination': destination,
                            'max_price': max_price
                        }
                    }).encode()
                },
                'schedule_time': datetime.now() + timedelta(
                    days=day,
                    minutes=interval_minutes
                )
            }

            client.create_task(request={'parent': parent, 'task': task})
```

---

## Sub-Agents (Nested Graphs)

### Conceito: Agent chama Sub-Agent

```python
from langgraph.graph import StateGraph

# Sub-agent: Análise de Exame
class ExamAnalysisState(TypedDict):
    exam_data: dict
    findings: list[str]
    severity: str

def analyze_exam_subagent():
    """Sub-agent que analisa exame"""
    workflow = StateGraph(ExamAnalysisState)
    workflow.add_node("extract", extract_data_node)
    workflow.add_node("analyze", analyze_findings_node)
    workflow.add_node("classify", classify_severity_node)
    # ...
    return workflow.compile()

# Agent principal: Physician
class PhysicianState(TypedDict):
    user_id: str
    exams: list[dict]
    all_findings: list[dict]
    diagnosis: str

def process_exams_node(state: PhysicianState):
    """Node que processa múltiplos exames usando sub-agent"""

    exam_agent = analyze_exam_subagent()

    for exam in state["exams"]:
        # Chama sub-agent para cada exame
        result = exam_agent.invoke({"exam_data": exam})

        state["all_findings"].append({
            "exam_id": exam["id"],
            "findings": result["findings"],
            "severity": result["severity"]
        })

    return state

# Workflow principal
workflow = StateGraph(PhysicianState)
workflow.add_node("load_exams", load_exams_node)
workflow.add_node("process", process_exams_node)  # ← Chama sub-agent
workflow.add_node("diagnose", diagnose_node)
```

---

## Exemplos Práticos Completos

### Exemplo 1: Agent de Reclamação (Cancelamento de Internet)

```python
# agents/complaint/cancel_internet.py
from langgraph.graph import StateGraph, END
from typing import TypedDict

class CancelInternetState(TypedDict):
    user_id: str
    company: str
    account_number: str | None
    phone_number: str | None
    script: str | None
    user_approved: bool | None
    call_in_progress: bool
    call_transcript: list[str]
    user_queries: list[str]
    agent_responses: list[str]
    cancellation_confirmed: bool

# Node 1: Carrega informações do usuário
def load_user_info(state: CancelInternetState):
    context = load_context(state["user_id"], [
        "finance.subscriptions",
        "identity.phone"
    ])

    return {
        "account_number": context.get("claro_account"),
        "phone_number": context.get("phone")
    }

# Node 2: Prepara script
def prepare_script(state: CancelInternetState):
    script = f"""
    Olá, meu nome é {get_user_name(state['user_id'])}.
    Gostaria de cancelar minha internet.
    Meu número de conta é {state['account_number']}.
    """
    return {"script": script}

# Node 3: Espera aprovação (PAUSE)
def wait_approval(state: CancelInternetState):
    return state

# Node 4: Faz ligação
def make_call(state: CancelInternetState):
    call = start_phone_call("0800-CLARO")
    state["call_in_progress"] = True

    while call.is_active():
        # Processa áudio
        audio = call.get_audio()
        transcript = transcribe(audio)
        state["call_transcript"].append(transcript)

        # Responde queries do user
        if state["user_queries"]:
            query = state["user_queries"].pop(0)
            response = answer_query(query, state)
            state["agent_responses"].append(response)
            call.speak(response)

        # Fala script
        if "cancelamento" in transcript.lower():
            call.speak(state["script"])

        sleep(1)

    state["call_in_progress"] = False
    return state

# Node 5: Confirma cancelamento
def confirm_cancellation(state: CancelInternetState):
    # Atualiza CONTEXT
    update_context(state["user_id"], {
        "finance.subscriptions.claro": "cancelled"
    })

    return {"cancellation_confirmed": True}

# Build workflow
workflow = StateGraph(CancelInternetState)
workflow.add_node("load_info", load_user_info)
workflow.add_node("prepare", prepare_script)
workflow.add_node("wait", wait_approval)
workflow.add_node("call", make_call)
workflow.add_node("confirm", confirm_cancellation)

workflow.set_entry_point("load_info")
workflow.add_edge("load_info", "prepare")
workflow.add_edge("prepare", "wait")

# Só liga se aprovado
def should_call(state):
    if state.get("user_approved") is None:
        return "wait"
    return "call" if state["user_approved"] else END

workflow.add_conditional_edges("wait", should_call)
workflow.add_edge("call", "confirm")

checkpointer = FirestoreSaver(
    project_id="nous-os",
    collection_name="agent_states"
)

app = workflow.compile(checkpointer=checkpointer)
```

---

## Integração com Firebase

### Setup Completo

```python
# agents/core/firebase_setup.py
from google.cloud import firestore
from langgraph.checkpoint.firestore import FirestoreSaver
import firebase_admin
from firebase_admin import credentials

# Initialize Firebase Admin
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'nous-os',
})

db = firestore.Client()

# Firestore Checkpointer
def create_checkpointer():
    return FirestoreSaver(
        project_id="nous-os",
        collection_name="agent_states",
        client=db
    )
```

### Estrutura Firestore

```
agent_states/
└── {user_id}/
    └── executions/
        └── {thread_id}/
            ├── state: {...}
            ├── checkpoint_history: [...]
            ├── metadata:
            │   ├─ workflow: "cancel_internet"
            │   ├─ started_at: timestamp
            │   ├─ last_updated: timestamp
            │   └─ status: "in_progress" | "completed" | "failed"
            │
            └── logs:
                └── {log_id}/
                    ├─ timestamp
                    ├─ node_name
                    └─ output
```

---

## Deploy e Execução

### Deploy Agent (Cloud Run)

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY agents/ ./agents/

CMD ["uvicorn", "agents.api:app", "--host", "0.0.0.0", "--port", "8080"]
```

```python
# agents/api.py
from fastapi import FastAPI
from agents.complaint.cancel_internet import app as cancel_internet_workflow

api = FastAPI()

@api.post("/execute/{workflow_name}")
async def execute_workflow(workflow_name: str, data: dict):
    workflows = {
        "cancel_internet": cancel_internet_workflow
    }

    workflow = workflows.get(workflow_name)
    if not workflow:
        return {"error": "Workflow not found"}

    result = await workflow.ainvoke(
        data["state"],
        config={"configurable": {"thread_id": data["thread_id"]}}
    )

    return {"result": result}
```

### Executar Workflow (Frontend)

```typescript
// lib/langgraph-client.ts
export async function startWorkflow(
  workflowName: string,
  userId: string,
  initialState: any
) {
  const threadId = generateThreadId();

  const response = await fetch(
    `${LANGGRAPH_API}/execute/${workflowName}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: threadId,
        state: { user_id: userId, ...initialState }
      })
    }
  );

  return { thread_id: threadId, result: await response.json() };
}
```

---

## 🎯 Conclusão

LangGraph resolve os problemas críticos de workflows complexos:

✅ **Stateful** - Mantém state durante execução longa
✅ **Checkpointing** - Resiliente a falhas, resume de onde parou
✅ **Human-in-the-Loop** - Pausa para aprovação
✅ **Consultas Paralelas** - User consulta durante execução
✅ **Scheduled Tasks** - Monitora condições por dias/semanas
✅ **Sub-agents** - Workflows aninhados

**Integração perfeita com Firebase** para NOUS OS Platform! 🚀

---

**Última atualização:** 2025-01-15
**Versão:** 1.0.0
