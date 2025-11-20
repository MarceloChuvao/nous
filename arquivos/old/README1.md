# WORKING - Active Task Collaboration

> **Inspirado em:** Daniel Miessler's `~/.claude/working/` directory (Personal AI Infrastructure)
>
> **Objetivo:** Espaço para colaboração ativa e persistente em tasks complexas que exigem múltiplas sessões

---

## O que é WORKING?

**WORKING** é um diretório para tasks em andamento - projetos que você e NOUS estão trabalhando JUNTOS ao longo do tempo.

**Problema que resolve:**

Sem WORKING:
- "Onde paramos ontem?" → Preciso explicar tudo de novo
- Contexto se perde entre sessões
- Progresso não é visível
- Cada sessão recomeça do zero

Com WORKING:
- Estado persistente de tasks ativas
- Updates incrementais salvos automaticamente
- Histórico de progresso visível
- Retomar de onde parou instantaneamente

---

## Estrutura

```
working/
├── README.md (este arquivo)
│
├── active/ (tasks em andamento)
│   ├── implement-health-agent/
│   │   ├── task.md (descrição + objetivos)
│   │   ├── progress.md (atualizações diárias)
│   │   ├── blockers.md (problemas encontrados)
│   │   ├── decisions.md (decisões tomadas)
│   │   └── files/ (arquivos relacionados)
│   │
│   ├── redesign-dashboard/
│   │   ├── task.md
│   │   ├── progress.md
│   │   ├── mockups/
│   │   └── feedback.md
│   │
│   └── debug-firebase-sync/
│       ├── task.md
│       ├── progress.md
│       └── logs/
│
├── archive/ (tasks completadas)
│   └── 2025-11/
│       ├── build-hooks-system/
│       └── integrate-pai-concepts/
│
└── templates/
    ├── task-template.md
    ├── progress-template.md
    └── blocker-template.md
```

---

## Como Funciona

### 1. Criar Nova Task

```typescript
// Firestore: users/{userId}/working/active/{taskId}/

{
  id: "implement-health-agent",
  title: "Implement @health/physician Agent",
  created: "2025-11-12T10:00:00Z",
  status: "active", // active | paused | blocked | completed
  priority: "high",

  description: `
    Build the core health agent that can:
    - Analyze medical exams
    - Integrate with FHIR protocol
    - Call #vision-radiology module
    - Provide health recommendations
  `,

  objectives: [
    "Design agent architecture",
    "Implement Markdown agent config",
    "Test with sample exam data",
    "Deploy to Cloud Run"
  ],

  progress: {
    current_phase: "Implementation",
    completed_objectives: [
      "Design agent architecture"
    ],
    next_steps: [
      "Write Markdown config",
      "Test with sample data"
    ]
  },

  collaborators: ["user", "@nous/core"],

  related_files: [
    "agents/health/physician/agent.md",
    "context/health/sample-exam.json"
  ],

  // 🆕 Integração com LangGraph
  workflow: {
    thread_id: null,  // ← Link com LangGraph execution
    workflow_name: null,
    runtime: null  // "langgraph" | "flowise" | null
  },

  updates: [] // Array of progress updates (subcollection)
}
```

### 2. Daily Progress Updates

```markdown
# Progress Update - 2025-11-12

## What I did today:
- ✅ Wrote Markdown agent config
- ✅ Added permissions for health context
- ✅ Tested with sample exam (cholesterol data)

## Blockers:
- ❌ FHIR API authentication not working
  - Error: "Invalid OAuth token"
  - Need to regenerate credentials

## Decisions made:
- Decided to use Claude Sonnet 4 instead of GPT-4
  - Reason: Better at medical terminology
  - Cost: Similar (~$0.15/request)

## Tomorrow:
- Fix FHIR authentication
- Test with real exam data from VAULT
- Deploy beta version
```

**Salvo automaticamente em:** `working/active/implement-health-agent/updates/2025-11-12.md`

### 3. Retomar Sessão

Usuário volta no dia seguinte:

```typescript
User: "Vamos continuar com o health agent"

NOUS:
  1. Load working/active/implement-health-agent/task.md
  2. Read último progress update (2025-11-12.md)
  3. Identificar: "Blocker: FHIR auth"

Response:
  "Retomando implementação do @health/physician agent.

  Ontem você:
  ✅ Finalizou Markdown config
  ✅ Testou com dados de exemplo

  Bloqueio atual:
  ❌ FHIR API authentication (OAuth token inválido)

  Vamos resolver a autenticação primeiro?"
```

**Zero explicação necessária** - NOUS já sabe onde paramos!

---

## Templates

### task-template.md

```markdown
# [Task Title]

**Created:** [Date]
**Priority:** [High/Medium/Low]
**Status:** [Active/Paused/Blocked/Completed]

---

## Objective

[What are we trying to achieve?]

---

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Context

[Why is this task important?]
[What problem does it solve?]

---

## Approach

1. Step 1
2. Step 2
3. Step 3

---

## Resources

- [Link to docs]
- [Related files]
- [External references]

---

## Notes

[Any important context or considerations]
```

### progress-template.md

```markdown
# Progress Update - [Date]

## ✅ Completed Today

- Item 1
- Item 2

## 🚧 In Progress

- Item 1 (50% done)
- Item 2 (started)

## ❌ Blockers

- Blocker 1: [Description]
  - Attempted: [What you tried]
  - Need: [What's needed to unblock]

## 💡 Decisions Made

- Decision 1: [What] → Reason: [Why]
- Decision 2: [What] → Reason: [Why]

## 📋 Next Steps

1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3

## 📊 Overall Progress

[X]% complete - [Current phase]

---

**Time spent today:** [Hours]
**Estimated remaining:** [Hours/Days]
```

---

## UI: Working Tasks Dashboard

```typescript
// app/dashboard/working/page.tsx

export default function WorkingPage() {
  const [activeTasks, setActiveTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection('users').doc(user.uid)
      .collection('working')
      .where('status', '==', 'active')
      .orderBy('priority', 'desc')
      .onSnapshot(snapshot => {
        setActiveTasks(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });

    return unsubscribe;
  }, [user]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Active Tasks</h1>
        <Button onClick={() => router.push('/dashboard/working/new')}>
          + New Task
        </Button>
      </div>

      <div className="grid gap-4">
        {activeTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }) {
  const progressPercent = (
    task.progress.completed_objectives.length /
    task.objectives.length * 100
  ).toFixed(0);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.status}</p>
        </div>
        <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
          {task.priority}
        </Badge>
      </div>

      <Progress value={progressPercent} className="mt-4" />
      <p className="text-sm text-gray-700 mt-2">
        {progressPercent}% complete - {task.progress.current_phase}
      </p>

      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => resumeTask(task.id)}>
          Resume
        </Button>
        <Button size="sm" variant="outline" onClick={() => viewDetails(task.id)}>
          Details
        </Button>
      </div>
    </Card>
  );
}
```

---

## Automatic Updates by NOUS

NOUS atualiza working/ automaticamente durante colaboração:

```typescript
// Durante conversa com NOUS sobre task ativa

User: "Consegui resolver o problema da autenticação FHIR"

NOUS (internamente):
  1. Detecta que user está falando de task ativa
  2. Load working/active/implement-health-agent/
  3. Identificar: Blocker "FHIR auth" foi mencionado
  4. Update progress.md:
     - Move "FHIR auth" de blockers para completed
     - Add note: "User resolved FHIR authentication issue"
  5. Update task status

NOUS (resposta):
  "Ótimo! Marquei o blocker de autenticação FHIR como resolvido.

  Próximos passos:
  1. Testar com dados reais do VAULT
  2. Deploy beta version

  Quer que eu te ajude com os testes?"
```

**Working/ é colaborativo** - ambos (user + NOUS) atualizam.

---

## Example: Real Task Flow

### Day 1 - Início
```
User: "Vamos implementar o agent de saúde"

NOUS creates:
  working/active/implement-health-agent/
    ├── task.md (objectives, approach)
    ├── progress.md (empty)
    └── files/
```

### Day 2 - Progresso
```
User: "Terminei o config, mas FHIR não funciona"

NOUS updates:
  progress.md:
    ✅ Config complete
    ❌ Blocker: FHIR auth

  next_steps:
    - Debug FHIR
```

### Day 3 - Desbloqueio
```
User: "FHIR resolvido!"

NOUS updates:
  progress.md:
    ✅ FHIR auth resolved

  Status: 60% complete
```

### Day 4 - Finalização
```
User: "Deploy feito!"

NOUS:
  1. Move task to archive/
  2. Update status: completed
  3. Create summary report
```

---

## Integration with NOUS CORE

```typescript
// CORE automaticamente verifica working/ quando user interage

export async function handleUserMessage(userId: string, message: string) {
  // 1. Check if message relates to active task
  const activeTasks = await db
    .collection('users').doc(userId)
    .collection('working')
    .where('status', '==', 'active')
    .get();

  for (const task of activeTasks.docs) {
    const taskData = task.data();

    // Check if message mentions task
    if (messageRelatesToTask(message, taskData)) {
      // Load task context
      const taskContext = await loadTaskContext(userId, task.id);

      // Inject into NOUS context
      return {
        ...baseContext,
        activeTask: taskContext,
        message: `[Active Task: ${taskData.title}]\n\n${message}`
      };
    }
  }

  return baseContext;
}
```

**NOUS sempre sabe qual task está ativa** e carrega contexto automaticamente.

---

## Arquiving

```yaml
archive_rules:
  when:
    - status: completed
    - status: cancelled
    - inactive_for: 90_days

  where:
    - working/archive/{year}-{month}/{task-name}/

  retain:
    - All files
    - Full history
    - Searchable

  cleanup:
    - Remove from active/
    - Keep in archive indefinitely
    - User can delete manually
```

---

## Benefits

### Sem WORKING:
- ❌ Contexto perdido entre sessões
- ❌ Precisa re-explicar tudo
- ❌ Progresso não rastreado
- ❌ Decisões esquecidas
- ❌ Blockers não documentados

### Com WORKING:
- ✅ Contexto persistente
- ✅ Retomar instantaneamente
- ✅ Progresso visível
- ✅ Decisões documentadas
- ✅ Blockers rastreados
- ✅ Colaboração async (user + NOUS)

---

## Comparison: WORKING vs CONTEXT vs PROFILE

| Aspect | CONTEXT | PROFILE | WORKING |
|--------|---------|---------|---------|
| **Purpose** | Current state | Life history | Active tasks |
| **Timeframe** | Now | Past | Present→Future |
| **Structure** | Domains (health, finance) | Timeline + logs | Tasks + progress |
| **Update frequency** | As needed | Continuous | Daily |
| **Use case** | "What's my current weight?" | "When did I last see doctor?" | "Where are we on the project?" |

**Todos complementares:**
- CONTEXT = Estado atual do usuário
- PROFILE = História completa
- WORKING = Projetos em andamento

---

## Real-World Example: Daniel Miessler

Daniel usa `~/.claude/working/` para:

1. **Blog post em andamento**
   ```
   working/active/blog-pai-article/
   ├── outline.md (structure)
   ├── draft.md (current version)
   ├── research/ (links, notes)
   └── feedback.md (review notes)
   ```

2. **Website development**
   ```
   working/active/website-analytics/
   ├── requirements.md
   ├── progress.md
   ├── code/ (snippets)
   └── blockers.md
   ```

**Resultado:** Claude pode retomar exatamente de onde parou, mesmo dias depois.

---

## Roadmap

### MVP
- ✅ Basic task structure (Firestore)
- ✅ Progress tracking
- ✅ UI dashboard

### Fase 2
- ✅ Auto-detection (NOUS detecta task ativa)
- ✅ Templates customizáveis
- ✅ Archive system

### Fase 3
- ✅ Task dependencies (Task B depende de Task A)
- ✅ Collaborative tasks (múltiplos users)
- ✅ GitHub integration (sync com issues)

---

## 🆕 Integração com LangGraph Workflows

### WORKING + LangGraph = Match Perfeito

WORKING é **IDEAL** para workflows LangGraph de longa duração!

#### Cenário: Compra de Passagem (15 dias monitorando preço)

```typescript
// 1. Hook cria WORKING task e inicia workflow
{
  id: "buy-ticket-sao-paulo",
  title: "Comprar Passagem para São Paulo < R$500",
  status: "active",
  created: "2025-01-15T10:00:00Z",

  // Link com LangGraph workflow
  workflow: {
    thread_id: "thread_abc123",  // ← Execution ID do LangGraph
    workflow_name: "ticket_monitor",
    runtime: "langgraph"
  },

  objectives: [
    "Monitorar preços a cada 1 hora",
    "Comprar quando < R$500",
    "Deadline: 15 dias"
  ],

  progress: {
    current_phase: "Monitoring",
    total_checks: 66,
    best_price_found: 480,
    last_check: "2025-01-18T14:00:00Z"
  }
}
```

#### Workflow Atualiza WORKING Automaticamente

```python
# workflows/ticket_monitor.py
from langgraph.graph import StateGraph

def monitor_price_node(state: TicketState):
    # 1. Busca preço
    price = fetch_flight_price(state.destination)

    # 2. Atualiza WORKING progress automaticamente
    await update_working_progress(
        task_id=state.working_task_id,
        update={
            "last_check": datetime.now(),
            "current_price": price,
            "total_checks": state.total_checks + 1,
            "best_price_found": min(state.best_price_found, price)
        }
    )

    # 3. Adiciona log de execução
    await add_working_log(
        task_id=state.working_task_id,
        log={
            "timestamp": datetime.now(),
            "checkpoint": state.total_checks,
            "price": price,
            "action": "Checked price"
        }
    )

    return {"current_price": price, "total_checks": state.total_checks + 1}

# Workflow roda por 15 dias
workflow = StateGraph(TicketState)
workflow.add_node("monitor", monitor_price_node)
workflow.add_node("check_condition", check_price_condition)
workflow.add_node("buy", buy_ticket_node)
```

#### User Consulta Progresso em Tempo Real

```
User: "Como está a busca de passagem?"

NOUS:
  1. Load working/active/buy-ticket-sao-paulo/
  2. Lê workflow.thread_id
  3. Carrega state do LangGraph
  4. Lê progress.md

Response:
  "📊 Monitorando passagens para São Paulo há 3 dias:

  Progress:
  - Total de checks: 66 (a cada 1 hora)
  - Melhor preço encontrado: R$ 480 (hoje 14h)
  - Último check: há 15 minutos
  - Status: ✅ COMPRADO!

  Comprei o voo LA4325 às 14:23 por R$ 480.

  Ver detalhes completos: working/buy-ticket-sao-paulo/
  Ver execução LangGraph: thread_abc123"
```

#### Estrutura WORKING para Workflow Longo

```
working/active/buy-ticket-sao-paulo/
├── task.md
│   ├─ Objective: Comprar passagem < R$500
│   ├─ Workflow: ticket_monitor (LangGraph)
│   ├─ Thread ID: thread_abc123
│   └─ Duration: 15 dias
│
├── progress.md (ATUALIZADO AUTOMATICAMENTE)
│   ├─ Day 1: 24 checks, preço mínimo R$650
│   ├─ Day 2: 24 checks, preço mínimo R$580
│   ├─ Day 3: 18 checks, preço R$480 ✅ COMPRADO!
│   └─ Status: COMPLETED
│
├── execution_logs/
│   ├─ 2025-01-15_10h.json (check #1: R$720)
│   ├─ 2025-01-15_11h.json (check #2: R$695)
│   ├─ 2025-01-15_12h.json (check #3: R$650)
│   └─ ... (66 total checks)
│
└── langgraph_state.json (snapshot do state)
    ├─ thread_id: "thread_abc123"
    ├─ current_price: 480
    ├─ total_checks: 66
    ├─ purchased: true
    └─ checkpoint_history: [...]
```

### Outros Cenários com LangGraph + WORKING

#### 1. Ligação Telefônica (Cancelamento)

```typescript
{
  id: "cancel-internet-claro",
  title: "Cancelar Internet Claro",
  workflow: {
    thread_id: "thread_xyz789",
    workflow_name: "cancel_internet",
    runtime: "langgraph"
  },

  progress: {
    current_phase: "Call in Progress",
    call_duration: "12 minutes",
    user_queries: [
      { query: "Qual meu CPF?", answered: true },
      { query: "Qual protocolo?", answered: true }
    ],
    transcript: ["..."],
    status: "Cancellation confirmed"
  }
}
```

#### 2. Agent Creation (Creator Building)

```typescript
{
  id: "create-cholesterol-agent",
  title: "Criar Agent Monitor de Colesterol",
  workflow: {
    thread_id: null,  // Não usa workflow
    workflow_name: null,
    runtime: "flowise"  // Criado no Flowise
  },

  progress: {
    current_phase: "Testing",
    steps_completed: [
      "Designed workflow in Flowise",
      "Added nodes (trigger, check, notify)",
      "Configured permissions",
      "Tested with sample data"
    ],
    next_steps: [
      "Publish to marketplace"
    ]
  }
}
```

### Vantagens da Integração

| Aspecto | Sem WORKING | Com WORKING + LangGraph |
|---------|-------------|-------------------------|
| **Tracking** | ❌ Não rastreia | ✅ Progress em tempo real |
| **Visibilidade** | ❌ Black box | ✅ Transparente |
| **Retomar** | ❌ Estado perdido | ✅ Retoma de onde parou |
| **Histórico** | ❌ Sem logs | ✅ Checkpoint history completo |
| **User queries** | ❌ Não suporta | ✅ Consultas durante execução |

### API: Linking WORKING ↔ LangGraph

```typescript
// functions/src/working/linkWorkflow.ts

export const linkWorkflowToWorkingTask = functions.https.onCall(
  async (data, context) => {
    const { working_task_id, thread_id, workflow_name } = data;

    // 1. Update WORKING task
    await admin.firestore()
      .collection('users').doc(context.auth!.uid)
      .collection('working').doc(working_task_id)
      .update({
        'workflow.thread_id': thread_id,
        'workflow.workflow_name': workflow_name,
        'workflow.runtime': 'langgraph',
        'workflow.linked_at': admin.firestore.FieldValue.serverTimestamp()
      });

    // 2. Update LangGraph state (add working_task_id)
    await admin.firestore()
      .collection('agent_states').doc(context.auth!.uid)
      .collection('executions').doc(thread_id)
      .update({
        'working_task_id': working_task_id
      });

    return { success: true };
  }
);
```

---

**WORKING = Memória de trabalho persistente entre você e NOUS** 🧠

**+ LangGraph = Tracking perfeito de workflows longos e complexos** 🚀
