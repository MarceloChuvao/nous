# NOUS OS - Tech Stack Pragmática

> **Filosofia:** Implementando o NOUS OS com tecnologia pragmática
> **Mapping:** LangGraph (Kernel) + Firestore (FS) + Vector DB (Memory)
> **Objetivo:** Construir um Sistema Operacional, não apenas um Chatbot

---

## Mapping: The OS Implementation

| OS Component | Tech Stack Implementation |
| :--- | :--- |
| **Kernel** | **LangGraph** (State Management, Orchestration) |
| **Process** | **Cloud Run** (Python Agents) / **Flowise** (No-code Agents) |
| **Memory (RAM)** | **LLM Context Window** (Claude Sonnet 200k) |
| **Memory (Swap)** | **Redis / Firestore** (Active State) |
| **Memory (Disk)** | **Pinecone/Weaviate** (Vector) + **Firestore** (Structured) |
| **Drivers** | **MCP Servers** (Model Context Protocol) |
| **Permissions** | **Middleware Proxy** (Custom Python/Node Wrapper) |

---

## Por que Flowise + LangGraph + Firebase?

### ✅ Vantagens do Flowise (No-Code Builder)

1. **MVP em 2-4 semanas (vs 6 meses)**
   - Flowise JÁ É um no-code builder pronto
   - ReactFlow + LangGraph integration nativa
   - Não precisa construir do zero

2. **Open-Source (MIT License)**
   - Fork e customiza quando quiser
   - Comunidade ativa
   - Usado por empresas reais

3. **LangGraph Integration Nativa**
   - Workflows stateful prontos
   - Human-in-the-loop suportado
   - Checkpointing automático

4. **Embedável**
   - Roda via iframe ou API
   - Integra com Next.js facilmente
   - Branding pode ser customizado depois

5. **Estratégia Faseada**
   - **MVP**: Usa Flowise AS-IS (embedado)
   - **v2**: Fork e customiza com branding NOUS

### ✅ Vantagens do LangGraph (Stateful Workflows)

1. **State Management Nativo**
   - Checkpointing no Firestore
   - Resume from any point
   - Long-running executions (horas/dias)

2. **Human-in-the-Loop**
   - Pause/resume workflows
   - User pode consultar DURANTE execução
   - Bidirectional communication

3. **Scheduled Tasks**
   - Cron-like scheduling
   - Condition monitoring (15 dias checando preço)
   - Auto-execution quando condição satisfeita

4. **Sub-agents (Nested Graphs)**
   - Agent chama sub-agent
   - Context isolation
   - Result aggregation

5. **Cenário Real que Requer LangGraph:**
   ```
   Usuário: "Liga pra Claro e cancela internet"

   Agent de Ligação (15 minutos):
     ├─ Inicia ligação
     │  Durante (paralelo):
     │  ├─ User: "Qual meu CPF?"
     │  ├─ NOUS responde
     │  └─ Agent usa resposta
     └─ Confirma cancelamento

   Firebase stateless NÃO CONSEGUE fazer isso!
   LangGraph + Checkpointing = RESOLVE perfeitamente
   ```

### ✅ Vantagens do Firebase

1. **Zero DevOps**
   - Sem servidores para gerenciar
   - Sem PostgreSQL para configurar
   - Sem Redis para manter
   - **Foco 100% em construir agents**

2. **Real-time nativo**
   - Logs aparecem instantaneamente
   - Context sincroniza automaticamente
   - Perfeito para NOUS (mente em tempo real)

3. **Custo inicial ZERO**
   - Free tier generoso
   - Paga só quando crescer
   - Perfeito para projeto pessoal

4. **Deploy em 1 comando**
   - `firebase deploy`
   - Pronto. Online em segundos.

5. **Integração perfeita com Next.js**
   - Documentação extensa
   - Comunidade gigante
   - Muitos exemplos

### ✅ Quando migrar para PostgreSQL + Rust?

**Só quando realmente precisar:**
- > 1M logs/dia (Firestore fica caro)
- Queries SQL complexas (analytics pesadas)
- Performance crítica (< 10ms response time)

**Para MVP:** Firebase é 10x mais rápido de desenvolver

---

## Stack Proposta: Flowise + LangGraph + Firebase + Next.js

```
┌─────────────────────────────────────────────────────────┐
│              NOUS OS Platform Stack (MVP)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (LENS)                                        │
│  ├─ Next.js 14+ (App Router)                           │
│  ├─ TypeScript                                         │
│  ├─ ShadCN UI (components)                             │
│  ├─ TailwindCSS (styling)                              │
│  ├─ Firebase SDK (client)                              │
│  └─ WebSockets (real-time bidirectional)               │
│                                                         │
│  Creator Tools (B2C2C) 🆕                               │
│  ├─ Flowise (embedado via iframe/API)                  │
│  │   ├─ ReactFlow (drag-and-drop)                      │
│  │   ├─ LangGraph visual builder                       │
│  │   ├─ Testing sandbox                                │
│  │   └─ Publishing pipeline                            │
│  │                                                      │
│  └─ Marketplace                                         │
│      ├─ Browse/Search agents                           │
│      ├─ Install one-click                              │
│      ├─ Ratings & Reviews                              │
│      └─ Revenue share (70/30)                          │
│                                                         │
│  Orchestration Layer (Stateful) 🆕                      │
│  ├─ LangGraph (workflows complexos)                    │
│  │   ├─ State checkpointing (Firestore)                │
│  │   ├─ Human-in-the-loop nodes                        │
│  │   ├─ Sub-agents (nested graphs)                     │
│  │   ├─ Scheduled tasks (cron monitoring)              │
│  │   └─ Long-running execution (horas/dias)            │
│  │                                                      │
│  └─ Python Runtime (Cloud Run)                         │
│      ├─ LangGraph app execution                        │
│      ├─ FastAPI endpoints                              │
│      └─ Firebase Admin SDK                             │
│                                                         │
│  Firebase Services (Serverless)                         │
│  ├─ Firestore (database + state checkpointing)        │
│  ├─ Firebase Auth (autenticação)                       │
│  ├─ Firebase Storage (VAULT - arquivos)               │
│  ├─ Firebase Functions (lightweight APIs)             │
│  ├─ Firebase Scheduler (cron jobs)                    │
│  └─ Firebase Hosting (deploy frontend)                │
│                                                         │
│  AI/ML                                                  │
│  ├─ LangChain / LangGraph (orchestration)              │
│  ├─ Anthropic SDK (Claude Sonnet 4)                    │
│  ├─ OpenAI SDK (GPT-4 fallback)                        │
│  └─ Pydantic 2.0 (validation)                          │
│                                                         │
│  Infrastructure                                         │
│  ├─ Docker (Flowise + agents)                          │
│  ├─ Google Cloud Run (stateful agents)                 │
│  ├─ Vercel (Next.js hosting)                           │
│  └─ (ZERO DevOps - tudo managed)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Backend: Firebase + Python Agents

### Por que Firebase Firestore?

✅ **NoSQL real-time**
- Sincronização automática (perfeito para NOUS)
- Queries simples e rápidas
- Escala automaticamente

✅ **Zero setup**
- Sem migrations
- Sem ORM complexo
- Sem servidor para gerenciar

✅ **Offline-first**
- Cache local automático
- Sincroniza quando volta online

✅ **Segurança built-in**
- Rules declarativas
- Auth integrado
- Row-level security

### Estrutura Firestore

```
firestore/
└── users/
    └── {userId}/
        ├── identity/
        │   ├── persona (document)
        │   ├── boundaries (document)
        │   └── priorities (document)
        │
        ├── context/ (collection)
        │   └── {contextPath}/ (ex: health.history)
        │       ├── data (document)
        │       └── versions/ (subcollection)
        │
        ├── agents/ (collection)
        │   └── {agentId}/
        │       ├── config (document)
        │       ├── state (document)
        │       └── executions/ (subcollection)
        │
        ├── logs/ (collection)
        │   └── {logId}/
        │       ├── timestamp
        │       ├── type
        │       ├── agent
        │       └── data
        │
        └── vault/ (collection - metadata)
            └── {fileId}/
                ├── path
                ├── storage_ref (Firebase Storage)
                ├── size
                └── sync_sources
```

### Estrutura Python Agents (Cloud Run)

```python
nous-agents/
├── functions/               # Firebase Functions (Node.js)
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── orchestrator.ts # CORE dispatcher
│   │   └── triggers/
│   │       ├── onAgentCall.ts
│   │       └── onContextUpdate.ts
│   └── package.json
│
├── agents/                  # Python agents (Cloud Run)
│   ├── requirements.txt
│   ├── Dockerfile
│   │
│   ├── core/
│   │   ├── base_agent.py   # Base Agent class
│   │   ├── firebase_client.py
│   │   └── logger.py
│   │
│   ├── health/
│   │   ├── physician/
│   │   │   ├── main.py     # FastAPI app
│   │   │   └── agent.py
│   │   └── requirements.txt
│   │
│   ├── finance/
│   │   ├── advisor/
│   │   │   ├── main.py
│   │   │   └── agent.py
│   │   └── requirements.txt
│   │
│   └── security/
│       └── guardian/
│           ├── main.py
│           └── agent.py
│
└── shared/
    ├── protocols/
    │   ├── mcp_client.py
    │   ├── fhir_client.py
    │   └── open_banking.py
    └── utils/
        └── validators.py
```

---

## Dois Tipos de Agents: Markdown vs Python

### 📝 Markdown Agents (80% dos casos)

**Formato:** Markdown + YAML (tipo Claude Skills)

**Quando usar:**
- Agent simples (prompt bem escrito resolve)
- Sem lógica complexa
- Não precisa de integrações específicas
- Desenvolvedor não técnico

**Vantagens:**
- ✅ **Zero código** - Qualquer pessoa pode criar
- ✅ **Deploy instantâneo** - Salva no Firestore e pronto
- ✅ **Baixo custo** - Sem Cloud Run, só LLM calls
- ✅ **Fácil auditoria** - Texto legível

**Exemplo:** `@finance/budget-advisor.md`

```markdown
# @finance/budget-advisor

> Analisa gastos e sugere economia

## Config

```yaml
name: "@finance/budget-advisor"
version: "1.0.0"
type: "markdown"  # ← Markdown agent

model: "claude-sonnet-4"
temperature: 0.7

permissions:
  context:
    read: ["finance.transactions", "finance.budget"]

modules:
  - "#data-analyzer"
```

## System Prompt

Você é um consultor financeiro que analisa transações.

**Contexto:**
- Transações: {context:finance.transactions}
- Orçamento: {context:finance.budget}

**Tarefa:** Identifique oportunidades de economia.
```

**Storage no Firestore:**

```javascript
// Firestore: users/{userId}/agents/@finance/budget-advisor
{
  name: "@finance/budget-advisor",
  type: "markdown",  // ← Tipo importante!
  version: "1.0.0",
  config: {
    model: "claude-sonnet-4",
    temperature: 0.7,
    permissions: { ... }
  },
  systemPrompt: "Você é um consultor financeiro...",
  examples: [ ... ],
  installedAt: "2025-01-15T10:00:00Z",
  enabled: true
}
```

---

### 🐍 Python Agents (20% dos casos)

**Formato:** Código Python + Dockerfile

**Quando usar:**
- Lógica complexa (orquestração multi-modelo)
- Integrações específicas (APIs proprietárias)
- Processamento pesado
- Múltiplas etapas condicionales

**Vantagens:**
- ✅ **Poder total** - Qualquer lógica possível
- ✅ **Performance** - Processamento eficiente
- ✅ **Integrações** - Controle total de APIs

**Exemplo:** `@health/physician` (agent complexo)

```yaml
# config.yaml
name: "@health/physician"
version: "3.0.0"
type: "python"  # ← Python agent

implementation:
  runtime: "cloud-run"
  source: "github.com/nous-os/agents/health/physician"
  cloudRunUrl: "https://physician-agent-xxx.run.app"

model: "claude-sonnet-4"
temperature: 0.3

permissions:
  context:
    read: ["health.history", "health.exams"]

modules:
  - "#vision-radiology"
  - "#ocr-medical"
```

**Storage no Firestore:**

```javascript
// Firestore: users/{userId}/agents/@health/physician
{
  name: "@health/physician",
  type: "python",  // ← Python agent
  version: "3.0.0",
  config: {
    model: "claude-sonnet-4",
    temperature: 0.3,
    permissions: { ... }
  },
  implementation: {
    runtime: "cloud-run",
    cloudRunUrl: "https://physician-agent-xxx.run.app"
  },
  installedAt: "2025-01-15T10:00:00Z",
  enabled: true
}
```

---

## Execução: CORE decide qual tipo

### Firebase Function: `executeAgent`

```typescript
// functions/src/executeAgent.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';

const db = admin.firestore();
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const executeAgent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userId = context.auth.uid;
  const { agentName, query, contextRequested } = data;

  // 1. Load agent from Firestore
  const agentDoc = await db
    .collection('users').doc(userId)
    .collection('agents').doc(agentName)
    .get();

  if (!agentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Agent not found');
  }

  const agent = agentDoc.data();

  // 2. Check permissions
  await checkPermissions(userId, agent, contextRequested);

  // 3. Execute based on type
  if (agent.type === 'markdown') {
    return await executeMarkdownAgent(userId, agent, query, contextRequested);
  } else if (agent.type === 'python') {
    return await executePythonAgent(userId, agent, query, contextRequested);
  }
});

// Executa Markdown agent (direto via Claude)
async function executeMarkdownAgent(
  userId: string,
  agent: any,
  query: string,
  contextRequested: string[]
) {
  // 1. Load user context from Firestore
  const context = await loadUserContext(userId, contextRequested);

  // 2. Render system prompt com template variables
  const systemPrompt = renderTemplate(agent.systemPrompt, context);

  // 3. Call Claude
  const response = await claude.messages.create({
    model: agent.config.model,
    temperature: agent.config.temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: query }],
    max_tokens: 4096
  });

  // 4. Log execution
  await logExecution(userId, agent.name, {
    type: 'markdown',
    query,
    output: response.content[0].text,
    cost: calculateCost(response.usage)
  });

  return {
    output: response.content[0].text,
    cost: calculateCost(response.usage),
    type: 'markdown'
  };
}

// Executa Python agent (chama Cloud Run)
async function executePythonAgent(
  userId: string,
  agent: any,
  query: string,
  contextRequested: string[]
) {
  // 1. Call Cloud Run endpoint
  const response = await fetch(agent.implementation.cloudRunUrl + '/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      query,
      context_requested: contextRequested
    })
  });

  const result = await response.json();

  // 2. Log execution (já feito pelo Python agent)
  // Python agent escreve direto no Firestore

  return {
    ...result,
    type: 'python'
  };
}

// Helper: Render template com contexto
function renderTemplate(template: string, context: any): string {
  let rendered = template;

  // Replace {context:path} com valores reais
  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{context:${key}}`;
    rendered = rendered.replace(
      new RegExp(placeholder, 'g'),
      JSON.stringify(value, null, 2)
    );
  }

  return rendered;
}

// Helper: Load context do Firestore
async function loadUserContext(
  userId: string,
  paths: string[]
): Promise<Record<string, any>> {
  const context: Record<string, any> = {};

  for (const path of paths) {
    const doc = await db
      .collection('users').doc(userId)
      .collection('context').doc(path)
      .get();

    if (doc.exists) {
      context[path] = doc.data();
    }
  }

  return context;
}
```

---

### Comparação: Markdown vs Python Execution

| Aspecto | Markdown | Python |
|---------|----------|--------|
| **Latency** | ~2s (1 LLM call) | ~3-5s (HTTP + LLM) |
| **Custo** | Só LLM ($0.003) | LLM + Cloud Run ($0.01) |
| **Complexidade** | Simples | Pode orquestrar múltiplos |
| **Deploy** | Instant (Firestore) | Build + Cloud Run |
| **Escalabilidade** | Auto (Firebase) | Auto (Cloud Run) |
| **Debugging** | Fácil (logs Claude) | Médio (stacktrace) |

---

### Exemplo: Agent Base Class (Firebase)

```python
# agents/core/base_agent.py
from typing import List, Dict, Any
from pydantic import BaseModel
from firebase_admin import firestore, initialize_app
from datetime import datetime
import asyncio

# Initialize Firebase Admin
initialize_app()
db = firestore.client()

class AgentConfig(BaseModel):
    """Configuração de um agent."""
    name: str
    version: str
    model: str = "claude-sonnet-4"
    temperature: float = 0.7
    modules_required: List[str] = []
    data_access: List[str] = []
    cost_limit: float = 10.0

class Agent:
    """Classe base para todos os agents."""

    def __init__(self, config: AgentConfig):
        self.config = config
        self.db = db

    async def run(self, user_id: str, input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa o agent.

        Args:
            user_id: ID do usuário
            input: Input do usuário + contexto

        Returns:
            Output estruturado
        """
        # 1. Load user's boundaries from Firestore
        boundaries = await self._load_boundaries(user_id)

        # 2. Validate permissions
        self._check_permissions(
            boundaries,
            input.get("context_requested", [])
        )

        # 3. Execute agent logic
        result = await self._execute(user_id, input)

        # 4. Log to Firestore (real-time!)
        await self._log_execution(user_id, input, result)

        return result

    async def _load_boundaries(self, user_id: str) -> Dict:
        """Carrega boundaries do Firestore."""
        doc = self.db.collection('users').document(user_id)\
            .collection('identity').document('boundaries').get()
        return doc.to_dict() if doc.exists else {}

    def _check_permissions(self, boundaries: Dict, context_paths: List[str]):
        """Verifica se agent pode acessar contextos."""
        for path in context_paths:
            allowed = boundaries.get('permissions', {}).get(path, {}).get('read', [])
            if self.config.name not in allowed:
                raise PermissionError(
                    f"Agent {self.config.name} não pode acessar {path}"
                )

    async def _log_execution(self, user_id: str, input: Dict, result: Dict):
        """Salva log no Firestore (aparece em real-time no frontend!)."""
        log_ref = self.db.collection('users').document(user_id)\
            .collection('logs').document()

        log_ref.set({
            'timestamp': firestore.SERVER_TIMESTAMP,
            'type': 'agent_call',
            'agent': self.config.name,
            'version': self.config.version,
            'input': input,
            'output': result.get('output'),
            'cost_total': result.get('cost', 0.0),
            'duration_total_ms': result.get('duration_ms', 0),
            'status': result.get('status', 'success')
        })

    async def _execute(self, user_id: str, input: Dict) -> Dict:
        """Implementado por cada agent."""
        raise NotImplementedError
```

### Exemplo: Agent Concreto (Physician)

```python
# agents/health/physician/agent.py
from agents.core.base_agent import Agent, AgentConfig
from typing import Dict, Any
from anthropic import AsyncAnthropic

class PhysicianAgent(Agent):
    """Agent médico generalista."""

    def __init__(self):
        config = AgentConfig(
            name="@health/physician",
            version="1.0.0",
            model="claude-sonnet-4",
            data_access=["context:health.history", "context:health.exams"]
        )
        super().__init__(config)
        self.claude = AsyncAnthropic()

    async def _execute(self, user_id: str, input: Dict) -> Dict:
        """Analisa caso médico."""
        start_time = datetime.now()

        # 1. Load user's health context from Firestore
        health_context = await self._load_health_context(user_id)

        # 2. Se tem imagem (raio-X), usa vision
        findings = None
        if input.get("image_url"):
            findings = await self._analyze_image(input["image_url"])

        # 3. Consulta PubMed via MCP (se necessário)
        research = None
        if findings and findings.get("abnormality"):
            research = await self._query_pubmed(findings["abnormality"])

        # 4. Sintetiza resposta usando Claude
        response = await self._synthesize_response(
            query=input["user_query"],
            health_context=health_context,
            findings=findings,
            research=research
        )

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)

        return {
            "output": response,
            "findings": findings,
            "research_papers": research.get("papers", []) if research else [],
            "cost": self._calculate_cost(),
            "duration_ms": duration_ms,
            "status": "success"
        }

    async def _load_health_context(self, user_id: str) -> Dict:
        """Carrega contexto de saúde do Firestore."""
        history_doc = self.db.collection('users').document(user_id)\
            .collection('context').document('health.history').get()

        exams_query = self.db.collection('users').document(user_id)\
            .collection('context').document('health.exams')\
            .collection('exams').order_by('date', direction='DESCENDING').limit(10)

        return {
            "history": history_doc.to_dict() if history_doc.exists else {},
            "recent_exams": [doc.to_dict() for doc in exams_query.stream()]
        }

    async def _analyze_image(self, image_url: str) -> Dict:
        """Analisa imagem médica usando Claude Vision."""
        response = await self.claude.messages.create(
            model="claude-sonnet-4",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "url", "url": image_url}
                    },
                    {
                        "type": "text",
                        "text": "Analyze this medical image. Identify any abnormalities."
                    }
                ]
            }]
        )
        return {"analysis": response.content[0].text}
```

---

## Frontend: Next.js 14+ + ShadCN

### Por que Next.js + ShadCN?

✅ **Next.js 14 App Router**
- Routing automático (file-based)
- Server Components (performance)
- API routes integradas
- SSR + SSG + ISR
- Deploy trivial (Vercel)

✅ **ShadCN UI**
- Componentes prontos + acessíveis
- Você POSSUI o código (customizável 100%)
- Tailwind-based
- Dark mode built-in
- TypeScript first-class

✅ **Developer Experience**
- Hot reload instantâneo
- Type safety completa
- Menos boilerplate que Vite + React Router

### Estrutura do Frontend (Next.js)

```
lens/
├── app/                       # App Router (Next.js 14+)
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Dashboard (/)
│   │
│   ├── agents/                # /agents
│   │   ├── page.tsx           # Marketplace
│   │   └── [id]/
│   │       └── page.tsx       # Agent detail
│   │
│   ├── logs/                  # /logs
│   │   ├── page.tsx           # Timeline
│   │   └── [id]/
│   │       └── page.tsx       # Log detail
│   │
│   ├── vault/                 # /vault
│   │   └── page.tsx           # File explorer
│   │
│   ├── settings/              # /settings
│   │   ├── page.tsx
│   │   ├── identity/
│   │   │   └── page.tsx       # IDENTITY config
│   │   └── boundaries/
│   │       └── page.tsx       # BOUNDARIES config
│   │
│   └── api/                   # API Routes
│       ├── agents/
│       │   └── route.ts       # GET/POST /api/agents
│       ├── logs/
│       │   └── route.ts
│       └── vault/
│           └── route.ts
│
├── components/                # Componentes reutilizáveis
│   ├── ui/                    # ShadCN components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── dashboard/
│   │   ├── context-status.tsx
│   │   ├── agents-list.tsx
│   │   └── chat-interface.tsx
│   │
│   ├── agents/
│   │   ├── marketplace.tsx
│   │   ├── agent-card.tsx
│   │   └── config-modal.tsx
│   │
│   ├── logs/
│   │   ├── timeline.tsx
│   │   ├── log-entry.tsx
│   │   └── search-bar.tsx
│   │
│   └── vault/
│       ├── file-explorer.tsx
│       ├── sources-list.tsx
│       └── sync-status.tsx
│
├── lib/
│   ├── api.ts                 # API client functions
│   ├── utils.ts               # Utilities (cn, etc)
│   └── types.ts               # TypeScript types
│
├── hooks/
│   ├── use-agents.ts          # React Query hooks
│   ├── use-logs.ts
│   └── use-vault.ts
│
├── styles/
│   └── globals.css            # Tailwind + ShadCN styles
│
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Exemplo: Page Component (Next.js 14 App Router)

```typescript
// lens/app/logs/page.tsx
import { Suspense } from 'react';
import { Timeline } from '@/components/logs/timeline';
import { SearchBar } from '@/components/logs/search-bar';
import { Skeleton } from '@/components/ui/skeleton';

interface LogsPageProps {
  searchParams: {
    date?: string;
    agent?: string;
  };
}

export default function LogsPage({ searchParams }: LogsPageProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Histórico & Logs</h1>
        <SearchBar />
      </div>

      <Suspense fallback={<TimelineSkeleton />}>
        <Timeline
          dateFilter={searchParams.date}
          agentFilter={searchParams.agent}
        />
      </Suspense>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
```

```typescript
// lens/components/logs/timeline.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { LogEntry } from './log-entry';

interface TimelineProps {
  dateFilter?: string;
  agentFilter?: string;
}

export function Timeline({ dateFilter, agentFilter }: TimelineProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Firestore query (real-time!)
    let logsQuery = query(
      collection(db, 'users', user.uid, 'logs'),
      orderBy('timestamp', 'desc')
    );

    // Add filters
    if (agentFilter) {
      logsQuery = query(logsQuery, where('agent', '==', agentFilter));
    }

    // Real-time listener - logs aparecem automaticamente!
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, dateFilter, agentFilter]);

  if (isLoading) {
    return <div className="animate-pulse">Carregando logs...</div>;
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <LogEntry key={log.id} log={log} />
      ))}
    </div>
  );
}
```

```typescript
// lens/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Setup: Next.js + Firebase + ShadCN

```bash
# 1. Criar projeto Next.js
npx create-next-app@latest lens --typescript --tailwind --app
cd lens

# 2. Instalar Firebase
npm install firebase firebase-admin

# 3. Inicializar ShadCN
npx shadcn-ui@latest init

# 4. Instalar componentes ShadCN
npx shadcn-ui@latest add button dialog dropdown-menu table skeleton card

# 5. Configurar Firebase CLI
npm install -g firebase-tools
firebase login
firebase init

# Selecionar:
# - Firestore
# - Functions (Node.js)
# - Hosting
# - Storage
```

**Vantagens desta stack:**
- ✅ **Zero DevOps** - Firebase gerencia tudo
- ✅ **Real-time** - Logs aparecem instantaneamente
- ✅ **Offline-first** - Cache automático
- ✅ **Auth built-in** - Google, email, etc.
- ✅ **Deploy em 1 comando** - `firebase deploy`
- ✅ **Free tier generoso** - Grátis para começar

---

## Firebase Functions: CORE Orchestrator

### Exemplo: Trigger quando agent é chamado

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Triggered quando usuário chama agent via frontend
export const callAgent = functions.https.onCall(async (data, context) => {
  // 1. Verifica autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const userId = context.auth.uid;
  const { agentName, query, contextRequested } = data;

  // 2. Load agent config
  const agentDoc = await db
    .collection('users').doc(userId)
    .collection('agents').doc(agentName)
    .get();

  if (!agentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Agent not found');
  }

  const agentConfig = agentDoc.data();

  // 3. Check boundaries
  const boundariesDoc = await db
    .collection('users').doc(userId)
    .collection('identity').doc('boundaries')
    .get();

  const boundaries = boundariesDoc.data();
  const allowed = checkPermissions(boundaries, agentName, contextRequested);

  if (!allowed) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Agent does not have permission to access requested context'
    );
  }

  // 4. Call Python agent via Cloud Run
  const agentUrl = agentConfig.cloudRunUrl;
  const response = await fetch(agentUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      query,
      context_requested: contextRequested
    })
  });

  const result = await response.json();

  // 5. Log será criado automaticamente pelo agent Python
  // (via Firebase Admin SDK)

  return result;
});

function checkPermissions(boundaries: any, agentName: string, contextPaths: string[]): boolean {
  for (const path of contextPaths) {
    const allowed = boundaries?.permissions?.[path]?.read || [];
    if (!allowed.includes(agentName)) {
      return false;
    }
  }
  return true;
}
```

### Exemplo: Trigger real-time quando CONTEXT muda

```typescript
// functions/src/triggers/onContextUpdate.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Trigger quando contexto de saúde é atualizado
export const onHealthContextUpdate = functions.firestore
  .document('users/{userId}/context/health.{docId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const newData = change.after.data();
    const oldData = change.before.data();

    // Exemplo: Detectar valores anormais
    if (newData.blood_pressure) {
      const [systolic, diastolic] = newData.blood_pressure.split('/').map(Number);

      // Pressão alta detectada!
      if (systolic > 140 || diastolic > 90) {
        // Criar log de alerta
        await db.collection('users').doc(userId).collection('logs').add({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          type: 'security_event',
          severity: 'high',
          event_type: 'health_alert',
          description: `Pressão alta detectada: ${newData.blood_pressure}`,
          action_taken: 'notified_user'
        });

        // Poderia também chamar @health/physician automaticamente
        // ou enviar notificação push
      }
    }
  });
```

---

## HOOKS: Automação Proativa por Eventos

> **Inspirado em:** Daniel Miessler's Personal AI Infrastructure (PAI)
>
> **Objetivo:** Transformar NOUS de reativo → proativo via event-driven automation

### O que são HOOKS?

HOOKS são gatilhos automáticos que executam ações quando eventos específicos acontecem.

**Tipos principais:**
1. `onContextUpdate` - Dispara quando CONTEXT muda
2. `onAgentComplete` - Dispara após agent terminar execução
3. `onSchedule` - Dispara em horários específicos (cron-like)
4. `onThreshold` - Dispara quando limites são ultrapassados
5. `onProtocolCall` - Dispara antes/depois de chamadas externas
6. `onVaultChange` - Dispara quando arquivos no VAULT mudam

### Implementação Firebase

```typescript
// functions/src/hooks/manager.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Hook Manager: Executa hooks quando eventos ocorrem
 */
export class HookManager {
  static async executeHooksForEvent(
    userId: string,
    eventType: string,
    eventData: any
  ) {
    // Buscar hooks ativos para este evento
    const hooksSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('hooks')
      .where('type', '==', eventType)
      .where('enabled', '==', true)
      .get();

    // Executar cada hook
    for (const hookDoc of hooksSnapshot.docs) {
      const hook = hookDoc.data();

      // Verificar condições
      const shouldExecute = await this.evaluateConditions(
        hook.conditions,
        eventData
      );

      if (shouldExecute) {
        await this.executeHookActions(userId, hook, eventData);
      }
    }
  }

  static async evaluateConditions(
    conditions: any[],
    eventData: any
  ): Promise<boolean> {
    // Avaliar cada condição
    for (const condition of conditions || []) {
      const value = this.getValueByPath(eventData, condition.path);

      switch (condition.operator) {
        case '>':
          if (!(value > condition.value)) return false;
          break;
        case '<':
          if (!(value < condition.value)) return false;
          break;
        case '==':
          if (value !== condition.value) return false;
          break;
        // ... outros operadores
      }
    }
    return true;
  }

  static async executeHookActions(
    userId: string,
    hook: any,
    eventData: any
  ) {
    for (const action of hook.actions) {
      switch (action.type) {
        case 'call_agent':
          await this.callAgent(userId, action.agent, action.input);
          break;

        case 'notify':
          await this.sendNotification(userId, action.channel, action.message);
          break;

        case 'update_context':
          await this.updateContext(userId, action.path, action.data);
          break;

        case 'log':
          await this.createLog(userId, action.log_type, action.data);
          break;

        case 'pause_agents':
          await this.pauseAgents(userId, action.agents);
          break;
      }
    }

    // Log hook execution
    await db.collection('users').doc(userId).collection('logs').add({
      type: 'hook_execution',
      hook_name: hook.name,
      event_data: eventData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });
  }

  private static getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }

  private static async callAgent(userId: string, agent: string, input: string) {
    // Chamar agent via callAgent function
    const callable = functions.httpsCallable('callAgent');
    await callable({ agent, query: input });
  }

  private static async sendNotification(
    userId: string,
    channel: string,
    message: string
  ) {
    // Implementar notificações (FCM, email, SMS)
    console.log(`[NOTIFICATION] ${channel}: ${message}`);
  }

  private static async updateContext(
    userId: string,
    path: string,
    data: any
  ) {
    await db
      .collection('users')
      .doc(userId)
      .collection('context')
      .doc(path)
      .set(data, { merge: true });
  }

  private static async createLog(
    userId: string,
    logType: string,
    data: any
  ) {
    await db.collection('users').doc(userId).collection('logs').add({
      type: logType,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  private static async pauseAgents(userId: string, agents: string[]) {
    for (const agent of agents) {
      await db
        .collection('users')
        .doc(userId)
        .collection('agents')
        .doc(agent)
        .update({ enabled: false });
    }
  }
}
```

### Hooks como Triggers Firebase

```typescript
// functions/src/hooks/triggers.ts

/**
 * onContextUpdate Hook Trigger
 */
export const onContextUpdateHook = functions.firestore
  .document('users/{userId}/context/{contextPath}')
  .onWrite(async (change, context) => {
    const { userId, contextPath } = context.params;

    await HookManager.executeHooksForEvent(userId, 'onContextUpdate', {
      contextPath,
      before: change.before.data(),
      after: change.after.data(),
      timestamp: new Date()
    });
  });

/**
 * onSchedule Hook Trigger (via Cloud Scheduler)
 */
export const onScheduleHook = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    // Buscar todos os usuários com hooks scheduled
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Buscar hooks de schedule ativos
      const hooksSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('hooks')
        .where('type', '==', 'onSchedule')
        .where('enabled', '==', true)
        .get();

      for (const hookDoc of hooksSnapshot.docs) {
        const hook = hookDoc.data();

        // Verificar se deve executar agora
        if (shouldExecuteNow(hook.schedule)) {
          await HookManager.executeHooksForEvent(
            userId,
            'onSchedule',
            { schedule: hook.schedule, timestamp: new Date() }
          );
        }
      }
    }
  });

function shouldExecuteNow(cronSchedule: string): boolean {
  // Implementar parser de cron
  // Por simplicidade, você pode usar uma lib como 'cron-parser'
  return true; // placeholder
}

/**
 * onThreshold Hook - Cost Monitoring
 */
export const onThresholdCheck = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Calcular custo diário
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logsSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('logs')
        .where('timestamp', '>=', today)
        .where('type', '==', 'agent_call')
        .get();

      let totalCost = 0;
      logsSnapshot.forEach(doc => {
        totalCost += doc.data().cost_total || 0;
      });

      // Verificar se ultrapassou threshold
      const boundariesDoc = await db
        .collection('users')
        .doc(userId)
        .collection('identity')
        .doc('boundaries')
        .get();

      const dailyLimit = boundariesDoc.data()?.daily_limits?.total || 50;

      if (totalCost > dailyLimit * 0.9) {
        await HookManager.executeHooksForEvent(userId, 'onThreshold', {
          metric: 'cost_daily',
          value: totalCost,
          limit: dailyLimit,
          percentage: (totalCost / dailyLimit) * 100
        });
      }
    }
  });
```

### Estrutura Firestore: HOOKS

```
users/{userId}/
  └── hooks/ (collection)
      └── {hookId}/
          ├── name: "Monitor de Saúde Crítico"
          ├── type: "onContextUpdate"
          ├── enabled: true
          ├── watch: "context:health.*"
          ├── conditions: [
          │     {
          │       path: "bloodwork.cholesterol",
          │       operator: ">",
          │       value: 240
          │     }
          │   ]
          ├── actions: [
          │     {
          │       type: "call_agent",
          │       agent: "@health/physician",
          │       input: "Analise últimos resultados"
          │     },
          │     {
          │       type: "notify",
          │       channel: "push",
          │       message: "⚠️ Exame requer atenção"
          │     }
          │   ]
          ├── created_at: timestamp
          └── last_executed: timestamp
```

### UI: Hook Manager (Next.js)

```typescript
// app/dashboard/hooks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

export default function HooksPage() {
  const { user } = useAuth();
  const [hooks, setHooks] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'hooks')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hooksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHooks(hooksData);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Automation Hooks</h1>
        <Button onClick={() => router.push('/dashboard/hooks/create')}>
          + Create Hook
        </Button>
      </div>

      <div className="grid gap-4">
        {hooks.map(hook => (
          <HookCard key={hook.id} hook={hook} />
        ))}
      </div>
    </div>
  );
}

function HookCard({ hook }) {
  const [enabled, setEnabled] = useState(hook.enabled);

  const toggleHook = async () => {
    await db
      .collection('users')
      .doc(user.uid)
      .collection('hooks')
      .doc(hook.id)
      .update({ enabled: !enabled });

    setEnabled(!enabled);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{hook.name}</h3>
          <p className="text-sm text-gray-600">{hook.type}</p>
        </div>

        <Switch checked={enabled} onCheckedChange={toggleHook} />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm">
          <strong>Watches:</strong> {hook.watch}
        </p>
        <p className="text-sm">
          <strong>Actions:</strong> {hook.actions?.length || 0} configured
        </p>
        {hook.last_executed && (
          <p className="text-xs text-gray-500">
            Last executed: {new Date(hook.last_executed.toDate()).toLocaleString()}
          </p>
        )}
      </div>
    </Card>
  );
}
```

### Exemplo Prático: Auto-Agendamento Médico

```yaml
# Hook configurado pelo usuário via UI

name: "Auto-Agendar Consultas de Retorno"
type: onContextUpdate
watch: "context:health.exams"
enabled: true

conditions:
  - path: "latest.needs_followup"
    operator: "=="
    value: true

actions:
  - type: call_agent
    agent: "@health/scheduling-assistant"
    input: "Agende consulta de retorno baseado no último exame"

  - type: notify
    channel: push
    message: "📅 Consulta de retorno agendada automaticamente"

  - type: log
    log_type: automation_success
    data: "Auto-scheduled follow-up appointment"
```

**Resultado:**
1. Usuário faz upload de exame no VAULT
2. Agent extrai dados → Atualiza `context:health.exams`
3. **Hook detecta** que `needs_followup == true`
4. **Automaticamente** chama `@health/scheduling-assistant`
5. Consulta agendada sem intervenção do usuário
6. Usuário recebe notificação confirmando

### Segurança e Limites

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

  premium_tier:
    - onSchedule: 50 hooks
    - onContextUpdate: unlimited

  concierge_tier:
    - all: unlimited
    - custom_hooks: yes
```

**Documentação completa:** Veja `hooks/README.md` para mais detalhes e exemplos.

---

## CORE: Context Cache & Fallback Logic

> **Problema:** Como gerenciar context que é lido múltiplas vezes? E o que fazer quando dados NÃO existem?

### Three-Layer Cache Strategy

```typescript
// core/context-manager.ts

class ContextManager {
  private memoryCache: Map<string, CachedContext> = new Map();
  private redis: RedisClient;

  /**
   * Load context com cache automático
   */
  async loadContext(
    userId: string,
    path: string,
    options: LoadOptions = {}
  ): Promise<ContextData> {
    const cacheKey = `${userId}:${path}`;

    // Layer 1: Memory cache (fastest - ~1ms)
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && !this.isExpired(memCached)) {
      console.log(`[CACHE HIT] Memory: ${path}`);
      return memCached.data;
    }

    // Layer 2: Redis cache (fast - ~5ms)
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

    // Layer 3: Firestore (source of truth - ~50ms)
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
   * Smart TTL baseado em tipo de contexto
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

export const contextManager = new ContextManager();
```

### Auto Cache Invalidation (Firebase Trigger)

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

### Performance Benefits

```yaml
performance_improvements:
  cache_hit_rate:
    memory: 70%  # Maioria das requests (in-session)
    redis: 20%   # Cross-session
    firestore: 10% # Cache miss

  response_time:
    with_cache: 1-5ms (memory/redis)
    without_cache: 50ms+ (firestore)
    improvement: 10-50x faster

  cost_reduction:
    firestore_reads: -80% (menos reads)
    monthly_savings: ~R$ 50-100 (scale)
```

---

### Fallback Chain: What if Context Doesn't Exist?

```typescript
// agents/base-agent.ts

export abstract class Agent {
  /**
   * Execute agent com fallback automático
   */
  async execute(userId: string, input: string): Promise<AgentResponse> {
    try {
      return await this._execute(userId, input);
    } catch (error) {
      if (error instanceof ContextNotFoundError) {
        return await this.handleMissingContext(userId, error.contextPath, input);
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

    // Step 1: Check PROFILE (historical data)
    console.log(`[FALLBACK] Checking PROFILE for ${contextPath}`);
    const historical = await this.checkProfile(userId, contextPath);

    if (historical) {
      return {
        status: 'partial_success',
        output: `Não tenho dados recentes, mas baseado em histórico:\n\n${historical}`,
        metadata: {
          source: 'PROFILE',
          data_age: historical.age_days
        },
        suggestions: [
          {
            type: 'update_context',
            label: 'Adicionar dados atualizados',
            action: { contextPath, type: 'manual_input' }
          },
          {
            type: 'schedule_collection',
            label: 'Agendar coleta de novos dados',
            action: { contextPath, type: 'schedule' }
          }
        ]
      };
    }

    // Step 2: Check VAULT (unprocessed files)
    console.log(`[FALLBACK] Checking VAULT for ${contextPath}`);
    const vaultFiles = await this.checkVault(userId, contextPath);

    if (vaultFiles.length > 0) {
      return {
        status: 'needs_processing',
        output: `Encontrei ${vaultFiles.length} arquivo(s) no VAULT que podem conter essa informação.`,
        metadata: {
          source: 'VAULT',
          files: vaultFiles.map(f => f.name)
        },
        suggestions: [
          {
            type: 'process_files',
            label: 'Processar arquivos agora (~30s)',
            action: { files: vaultFiles, processor: this.getProcessor(contextPath) }
          },
          {
            type: 'view_files',
            label: 'Ver arquivos originais',
            action: { files: vaultFiles }
          }
        ]
      };
    }

    // Step 3: Escalate to CORE (ask user)
    console.log(`[FALLBACK] Escalating to CORE - no data found`);
    return {
      status: 'missing_data',
      output: `Não encontrei dados de ${this.getFriendlyName(contextPath)}.`,
      escalation: {
        to: 'CORE',
        reason: 'missing_required_context',
        contextPath,
        originalInput
      },
      suggestions: [
        {
          type: 'provide_data',
          label: 'Adicionar dados manualmente',
          action: { contextPath, type: 'manual_input' }
        },
        {
          type: 'upload_file',
          label: 'Upload de arquivo (PDF/foto)',
          action: { contextPath, type: 'file_upload' }
        },
        {
          type: 'schedule_collection',
          label: this.getCollectionLabel(contextPath),
          action: { contextPath, type: 'schedule' }
        }
      ]
    };
  }

  private async checkProfile(userId: string, contextPath: string): Promise<any | null> {
    try {
      const result = await profile.query(
        userId,
        `historical data for ${contextPath}`
      );
      return result.data ? { ...result.data, age_days: result.age_days } : null;
    } catch {
      return null;
    }
  }

  private async checkVault(userId: string, contextPath: string): Promise<VaultFile[]> {
    const tags = this.extractTagsFromPath(contextPath);
    return await vault.search(userId, {
      tags,
      fileTypes: ['pdf', 'jpg', 'png'],
      status: 'unprocessed'
    });
  }

  private getFriendlyName(contextPath: string): string {
    const map = {
      'health.bloodwork': 'exames de sangue',
      'finance.balance': 'saldo bancário',
      'health.weight': 'peso atual',
      'finance.transactions': 'transações financeiras'
    };
    return map[contextPath] || contextPath;
  }

  private getCollectionLabel(contextPath: string): string {
    const map = {
      'health.bloodwork': 'Agendar exame de sangue',
      'health.weight': 'Adicionar peso manualmente',
      'finance.balance': 'Sincronizar conta bancária'
    };
    return map[contextPath] || 'Coletar dados';
  }

  abstract _execute(userId: string, input: string): Promise<AgentResponse>;
}
```

### CORE: Escalation Handler

```typescript
// core/escalation-handler.ts

export class EscalationHandler {
  /**
   * Handle escalations de agents
   */
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

    // Load user preferences
    const identity = await db
      .collection('users').doc(userId)
      .collection('identity').doc('preferences')
      .get();

    const prefs = identity.data();

    // Decidir como interagir com user
    if (prefs?.auto_ask_missing_data) {
      // User prefere que NOUS pergunte automaticamente
      return {
        type: 'ask_user',
        priority: 'high',
        message: this.craftUserQuestion(contextPath, originalInput),
        options: [
          {
            label: 'Adicionar agora',
            action: 'provide_data',
            contextPath
          },
          {
            label: 'Upload arquivo',
            action: 'upload_file',
            contextPath
          },
          {
            label: 'Agendar coleta',
            action: 'schedule',
            contextPath
          },
          {
            label: 'Ignorar por agora',
            action: 'skip'
          }
        ],
        timeout: 300 // 5 minutos
      };
    } else {
      // User prefere notificação silenciosa
      return {
        type: 'silent_notification',
        notification: {
          title: 'Dados faltando',
          body: `${this.getFriendlyName(contextPath)} não encontrado. Clique para adicionar.`,
          priority: 'low',
          action: { type: 'open_context_editor', contextPath }
        }
      };
    }
  }

  private craftUserQuestion(contextPath: string, originalInput: string): string {
    const friendlyName = this.getFriendlyName(contextPath);

    return `Para responder "${originalInput}", preciso de ${friendlyName}.

Como gostaria de proceder?`;
  }

  private getFriendlyName(contextPath: string): string {
    const map = {
      'health.bloodwork': 'seus exames de sangue',
      'finance.balance': 'seu saldo bancário atual',
      'health.weight': 'seu peso atual'
    };
    return map[contextPath] || contextPath;
  }
}

export const escalationHandler = new EscalationHandler();
```

### User Experience: Fluxos Visuais

#### Scenario 1: Cache Hit (Fast)

```
User: "Como está meu colesterol?"

[CACHE HIT - Memory cache - 1ms]

Response:
┌─────────────────────────────────────┐
│ Baseado em context:health.bloodwork │
│ (atualizado em 2025-11-10)          │
│                                     │
│ Colesterol: 185 mg/dL ✅            │
│ Status: Normal (< 200)              │
└─────────────────────────────────────┘
```

#### Scenario 2: PROFILE Found (Partial Success)

```
User: "Como está meu colesterol?"

[CACHE MISS → PROFILE found old data]

Response:
┌─────────────────────────────────────┐
│ ⚠️ Dados não recentes               │
│                                     │
│ Em 2024-10-15:                      │
│ Colesterol: 190 mg/dL               │
│                                     │
│ [Botão: Adicionar dados atuais]    │
│ [Botão: Agendar novo exame]        │
└─────────────────────────────────────┘
```

#### Scenario 3: VAULT Found (Needs Processing)

```
User: "Como está meu colesterol?"

[CACHE MISS → PROFILE empty → VAULT found file]

Response:
┌─────────────────────────────────────┐
│ 📄 Arquivo encontrado no VAULT      │
│                                     │
│ exam-2025-11.pdf (ainda não         │
│ processado)                         │
│                                     │
│ [Botão: Processar agora (~30s)]    │
│ [Botão: Ver arquivo original]      │
└─────────────────────────────────────┘
```

#### Scenario 4: Escalation (Ask User)

```
User: "Como está meu colesterol?"

[CACHE MISS → PROFILE empty → VAULT empty → ESCALATE]

Response:
┌─────────────────────────────────────┐
│ Dados de exames de sangue não       │
│ encontrados.                         │
│                                     │
│ Como gostaria de proceder?          │
│                                     │
│ [Upload de exame (PDF/foto)]       │
│ [Adicionar valor manualmente]      │
│ [Agendar exame de sangue]          │
│ [Ignorar por agora]                │
└─────────────────────────────────────┘
```

#### Scenario 5: Multiple Missing Data (⚠️ BATCH RESOLUTION)

> **Problema:** Usuário resolve um dado faltando, depois aparece outro, depois outro... UX horrível!
>
> **Solução:** Pre-flight check + Warning Center mostrando TODOS os problemas de uma vez.

```
User: "Faça uma análise completa da minha saúde e finanças"

[Agent faz PRE-FLIGHT CHECK antes de executar]
[Detecta 3 contextos faltando]

Response:
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ INFORMAÇÕES NECESSÁRIAS                                   │
│                                                             │
│ Para completar sua análise, preciso de 3 informações:      │
│                                                             │
│ ❌ Exames de sangue (context:health.bloodwork)              │
│    └─ Último: 2024-08 (há 3 meses)                         │
│    └─ [Upload PDF] [Adicionar manual] [Agendar exame]     │
│                                                             │
│ ❌ Saldo bancário atual (context:finance.balance)           │
│    └─ Nenhum registro encontrado                            │
│    └─ [Conectar banco] [Adicionar manual]                  │
│                                                             │
│ ❌ Meta de curto prazo (context:goals.short_term)           │
│    └─ Nunca definida                                        │
│    └─ [Definir agora] [Pular por enquanto]                │
│                                                             │
│ [Resolver todos agora] [Resolver depois] [Continuar sem]  │
└─────────────────────────────────────────────────────────────┘
```

**Como funciona:**

```typescript
// agents/base-agent.ts

export abstract class Agent {
  /**
   * 1. PRE-FLIGHT CHECK: Detecta TODOS os contextos necessários antes de executar
   */
  async execute(userId: string, input: string): Promise<AgentResponse> {
    // Dry run para detectar contextos necessários
    const requiredContexts = await this.getRequiredContexts(userId, input);

    // Verifica quais estão faltando
    const missing: MissingContext[] = [];
    for (const contextPath of requiredContexts) {
      const exists = await this.checkContextExists(userId, contextPath);
      if (!exists) {
        const fallbackResult = await this.checkFallbacks(userId, contextPath);
        missing.push({
          contextPath,
          friendlyName: this.getFriendlyName(contextPath),
          fallbackStatus: fallbackResult.status,  // 'profile_old' | 'vault_found' | 'not_found'
          fallbackData: fallbackResult.data,
          suggestions: this.getSuggestions(contextPath, fallbackResult)
        });
      }
    }

    // Se tem múltiplos contextos faltando, agrupa tudo
    if (missing.length > 0) {
      return {
        status: 'missing_multiple_data',
        output: null,
        escalation: {
          to: 'CORE',
          reason: 'batch_missing_context',
          missingContexts: missing,  // LISTA de todos os problemas
          originalInput: input
        }
      };
    }

    // Se tudo OK, executa normalmente
    try {
      return await this._execute(userId, input);
    } catch (error) {
      // Fallback individual para erros não previstos
      if (error instanceof ContextNotFoundError) {
        return await this.handleMissingContext(userId, error.contextPath, input);
      }
      throw error;
    }
  }

  /**
   * Método abstrato: cada agent declara quais contextos precisa
   */
  abstract getRequiredContexts(userId: string, input: string): Promise<string[]>;

  /**
   * Checa fallbacks (PROFILE → VAULT) sem escalar ainda
   */
  private async checkFallbacks(
    userId: string,
    contextPath: string
  ): Promise<FallbackResult> {
    // Check PROFILE
    const historical = await this.checkProfile(userId, contextPath);
    if (historical) {
      return {
        status: 'profile_old',
        data: historical,
        message: `Último registro: ${historical.date} (há ${historical.age_days} dias)`
      };
    }

    // Check VAULT
    const vaultFiles = await this.checkVault(userId, contextPath);
    if (vaultFiles.length > 0) {
      return {
        status: 'vault_found',
        data: vaultFiles,
        message: `${vaultFiles.length} arquivo(s) encontrado(s), não processados`
      };
    }

    // Nada encontrado
    return {
      status: 'not_found',
      data: null,
      message: 'Nenhum registro encontrado'
    };
  }

  private getSuggestions(
    contextPath: string,
    fallbackResult: FallbackResult
  ): Suggestion[] {
    const base: Suggestion[] = [];

    // Se tem arquivo no VAULT, sugere processar
    if (fallbackResult.status === 'vault_found') {
      base.push({
        type: 'process_vault',
        label: 'Processar arquivo (~30s)',
        action: { files: fallbackResult.data, contextPath },
        priority: 'high'
      });
    }

    // Se tem dados antigos no PROFILE, sugere atualizar
    if (fallbackResult.status === 'profile_old') {
      base.push({
        type: 'update_context',
        label: 'Atualizar dados',
        action: { contextPath, type: 'manual_input' },
        priority: 'medium'
      });
    }

    // Sempre oferece upload
    base.push({
      type: 'upload_file',
      label: 'Upload arquivo (PDF/foto)',
      action: { contextPath, type: 'file_upload' },
      priority: 'medium'
    });

    // Sempre oferece adicionar manual
    base.push({
      type: 'manual_input',
      label: 'Adicionar manualmente',
      action: { contextPath, type: 'manual_input' },
      priority: 'low'
    });

    // Context-specific actions
    const specific = this.getContextSpecificSuggestions(contextPath);

    return [...base, ...specific];
  }

  private getContextSpecificSuggestions(contextPath: string): Suggestion[] {
    const map: Record<string, Suggestion[]> = {
      'health.bloodwork': [
        {
          type: 'schedule_exam',
          label: 'Agendar exame de sangue',
          action: { type: 'schedule', service: 'labtest' },
          priority: 'medium'
        }
      ],
      'finance.balance': [
        {
          type: 'connect_bank',
          label: 'Conectar conta bancária',
          action: { type: 'open_banking' },
          priority: 'high'
        }
      ],
      'goals.short_term': [
        {
          type: 'define_goal',
          label: 'Definir meta agora (2 min)',
          action: { type: 'guided_wizard', wizard: 'goals' },
          priority: 'medium'
        }
      ]
    };

    return map[contextPath] || [];
  }
}
```

**CORE: Batch Escalation Handler**

```typescript
// core/escalation-handler.ts

export class EscalationHandler {
  async handleEscalation(
    userId: string,
    escalation: AgentEscalation
  ): Promise<CoreResponse> {
    switch (escalation.reason) {
      // NOVO: Múltiplos contextos faltando
      case 'batch_missing_context':
        return await this.handleBatchMissingContext(userId, escalation);

      // Casos individuais (fallback se pre-flight falhar)
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

  /**
   * NOVO: Lida com múltiplos contextos faltando ao mesmo tempo
   */
  private async handleBatchMissingContext(
    userId: string,
    escalation: AgentEscalation
  ): Promise<CoreResponse> {
    const { missingContexts, originalInput } = escalation;

    // Load user preferences
    const prefs = await this.getUserPreferences(userId);

    // Cria painel de avisos
    return {
      type: 'show_warning_panel',
      priority: 'high',
      panel: {
        title: '⚠️ INFORMAÇÕES NECESSÁRIAS',
        subtitle: `Para completar sua solicitação, preciso de ${missingContexts.length} informações:`,
        items: missingContexts.map(ctx => ({
          icon: '❌',
          title: ctx.friendlyName,
          contextPath: ctx.contextPath,
          status: this.getStatusLabel(ctx.fallbackStatus),
          statusDetails: ctx.fallbackData?.message,
          suggestions: ctx.suggestions,
          expanded: false  // User pode expandir para ver detalhes
        })),
        actions: [
          {
            label: 'Resolver todos agora',
            action: 'batch_resolve',
            style: 'primary',
            handler: async () => {
              // Abre wizard multi-step para resolver tudo
              return await this.openBatchResolutionWizard(
                userId,
                missingContexts
              );
            }
          },
          {
            label: 'Resolver depois',
            action: 'save_to_tasks',
            style: 'secondary',
            handler: async () => {
              // Salva em working/tasks para resolver depois
              await this.createResolutionTasks(userId, missingContexts);
              return { success: true, message: 'Salvo em suas tarefas' };
            }
          },
          {
            label: 'Continuar sem esses dados',
            action: 'partial_execution',
            style: 'tertiary',
            handler: async () => {
              // Tenta executar parcialmente com dados disponíveis
              return await this.attemptPartialExecution(
                userId,
                originalInput,
                missingContexts
              );
            }
          }
        ],
        dismissible: true,
        persistentId: `missing-data-${Date.now()}`  // User pode fechar e voltar depois
      }
    };
  }

  /**
   * Wizard multi-step para resolver múltiplos contextos
   */
  private async openBatchResolutionWizard(
    userId: string,
    missingContexts: MissingContext[]
  ): Promise<WizardResponse> {
    return {
      type: 'wizard',
      steps: missingContexts.map((ctx, idx) => ({
        stepNumber: idx + 1,
        totalSteps: missingContexts.length,
        title: `Adicionar ${ctx.friendlyName}`,
        contextPath: ctx.contextPath,
        inputType: this.getInputType(ctx.contextPath),
        suggestions: ctx.suggestions,
        canSkip: this.isOptional(ctx.contextPath),
        validation: this.getValidation(ctx.contextPath)
      })),
      onComplete: async (results) => {
        // Salva todos os contextos coletados
        await Promise.all(
          results.map(r => this.saveContext(userId, r.contextPath, r.data))
        );

        // Re-executa agent original
        return {
          success: true,
          message: 'Dados salvos! Executando sua solicitação...',
          action: 'retry_original_request'
        };
      }
    };
  }

  /**
   * Cria tarefas em working/ para resolver depois
   */
  private async createResolutionTasks(
    userId: string,
    missingContexts: MissingContext[]
  ): Promise<void> {
    const tasksRef = db.collection('users').doc(userId).collection('working').doc('active');

    await tasksRef.set({
      tasks: missingContexts.map(ctx => ({
        id: `resolve-${ctx.contextPath}`,
        type: 'resolve_missing_context',
        title: `Adicionar ${ctx.friendlyName}`,
        contextPath: ctx.contextPath,
        suggestions: ctx.suggestions,
        priority: this.getPriority(ctx.contextPath),
        createdAt: new Date().toISOString(),
        status: 'pending'
      }))
    }, { merge: true });
  }

  /**
   * Tenta executar parcialmente (sem dados faltantes)
   */
  private async attemptPartialExecution(
    userId: string,
    originalInput: string,
    missingContexts: MissingContext[]
  ): Promise<PartialExecutionResponse> {
    // Avisa ao agent quais contextos estão faltando
    const partialContext = {
      available: await this.getAvailableContexts(userId),
      missing: missingContexts.map(c => c.contextPath),
      instruction: 'Execute parcialmente com dados disponíveis. Indique limitações.'
    };

    return {
      status: 'partial_execution',
      warning: `⚠️ Executando sem ${missingContexts.length} informação(ões). Resultado pode estar incompleto.`,
      partialContext
    };
  }

  private getStatusLabel(status: FallbackStatus): string {
    const map = {
      'profile_old': '⚠️ Dados antigos encontrados',
      'vault_found': '📄 Arquivo encontrado (não processado)',
      'not_found': '❌ Nenhum registro'
    };
    return map[status] || status;
  }

  private getInputType(contextPath: string): InputType {
    const map: Record<string, InputType> = {
      'health.bloodwork': 'file_upload',  // PDF do exame
      'finance.balance': 'number',         // Valor numérico
      'goals.short_term': 'text',          // Texto livre
      'health.weight': 'number'
    };
    return map[contextPath] || 'text';
  }

  private isOptional(contextPath: string): boolean {
    // Alguns contextos são obrigatórios, outros opcionais
    const required = [
      'health.bloodwork',  // Necessário para análise médica
      'finance.balance'    // Necessário para análise financeira
    ];
    return !required.includes(contextPath);
  }
}
```

**Frontend: MissingDataPanel Component**

```tsx
// components/MissingDataPanel.tsx

interface MissingDataPanelProps {
  items: MissingContextItem[];
  onResolveAll: () => void;
  onResolveLater: () => void;
  onContinueWithout: () => void;
}

export function MissingDataPanel({ items, onResolveAll, onResolveLater, onContinueWithout }: MissingDataPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  return (
    <div className="missing-data-panel">
      <div className="panel-header">
        <AlertTriangle className="icon-warning" size={24} />
        <div>
          <h3>⚠️ INFORMAÇÕES NECESSÁRIAS</h3>
          <p>Para completar sua solicitação, preciso de {items.length} informações:</p>
        </div>
      </div>

      <div className="panel-body">
        {items.map(item => (
          <div key={item.contextPath} className="missing-item">
            <div className="item-header" onClick={() => toggleExpand(item.contextPath)}>
              <span className="icon">❌</span>
              <div className="item-info">
                <h4>{item.title}</h4>
                <p className="status">{item.status}</p>
                {item.statusDetails && <p className="details">{item.statusDetails}</p>}
              </div>
              <ChevronDown className={expandedItems.has(item.contextPath) ? 'expanded' : ''} />
            </div>

            {expandedItems.has(item.contextPath) && (
              <div className="item-suggestions">
                {item.suggestions.map(suggestion => (
                  <button
                    key={suggestion.type}
                    className={`suggestion-btn priority-${suggestion.priority}`}
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="panel-actions">
        <button className="btn-primary" onClick={onResolveAll}>
          Resolver todos agora
        </button>
        <button className="btn-secondary" onClick={onResolveLater}>
          Resolver depois
        </button>
        <button className="btn-tertiary" onClick={onContinueWithout}>
          Continuar sem esses dados
        </button>
      </div>
    </div>
  );
}
```

**Resultado: User resolve tudo de uma vez, não um por um! 🎯**

### Redis Setup (Firebase Extension)

```bash
# Install Firebase extension for Redis
firebase ext:install redis-cache

# Configure
firebase functions:config:set \
  redis.host="your-redis-host" \
  redis.port="6379" \
  redis.password="your-password"
```

### Monitoring Dashboard

```typescript
// Dashboard: Cache & Fallback Analytics

{
  "cache_performance": {
    "hit_rate": {
      "memory": 70%,
      "redis": 20%,
      "firestore": 10%
    },
    "avg_response_time": "3ms",
    "cost_savings": "R$ 87/mês"
  },

  "fallback_stats": {
    "total_fallbacks_30d": 145,
    "profile_found": 35% (51 cases),
    "vault_found": 20% (29 cases),
    "user_asked": 40% (58 cases),
    "still_missing": 5% (7 cases)
  },

  "escalation_stats": {
    "total_escalations_30d": 58,
    "resolved_automatically": 15%,
    "required_user_input": 80%,
    "abandoned": 5%
  }
}
```

**Documentação completa:** `core/CONTEXT-CACHE-AND-FALLBACK.md`

---

## AI Orchestration: LangChain / LlamaIndex

### Por que LangChain?

✅ **Abstração perfeita** para LLMs
✅ **Chains e Agents** prontos
✅ **Memory management** built-in
✅ **Multi-model** support

### Exemplo: Chain Simples

```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_anthropic import ChatAnthropic

# Setup
llm = ChatAnthropic(model="claude-sonnet-4")

template = """
Você é NOUS, a mente digital do usuário.

Baseado no contexto:
{context}

Responda a pergunta:
{question}

Resposta:
"""

prompt = PromptTemplate(template=template, input_variables=["context", "question"])
chain = LLMChain(llm=llm, prompt=prompt)

# Execute
result = await chain.arun(
    context=context_data,
    question="Como está minha saúde?"
)
```

---

## Deployment: Firebase + Vercel

### Firebase (Backend + Database)

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Functions (orchestrator)
firebase deploy --only functions

# Deploy tudo
firebase deploy
```

**firestore.rules** (Segurança):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Usuário só pode acessar seus próprios dados
      allow read, write: if request.auth.uid == userId;

      match /logs/{logId} {
        // Logs são append-only
        allow read: if request.auth.uid == userId;
        allow create: if request.auth.uid == userId;
        allow update, delete: if false;
      }

      match /context/{contextPath=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

**storage.rules** (VAULT):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      // VAULT pessoal
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Vercel (Frontend Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd lens
vercel

# Production deploy
vercel --prod
```

**Vantagens:**
- ✅ **Deploy automático** - Git push = deploy
- ✅ **Preview deployments** - Cada PR tem URL própria
- ✅ **Edge network** - CDN global automático
- ✅ **Zero config** - Funciona out of the box

---

## Roadmap de Implementação

### 🎯 Fase 1: MVP B2C (Firebase + Next.js) - **2-3 meses**

**Objetivo:** NOUS funcionando para uso pessoal (B2C)

**Target:** Pessoas físicas que querem gerenciar vida (não empresas)

**Stack:**
- Next.js 14 + ShadCN UI (frontend)
- Firebase (Firestore + Auth + Storage)
- Python agents em Cloud Run
- 3 agents básicos: @health/physician, @finance/advisor, @life/assistant

**Entregáveis:**
- ✅ Auth com Google/Email
- ✅ CONTEXT editável (health, finance, personal, goals)
- ✅ IDENTITY configurável (persona, boundaries, priorities)
- ✅ LOGS real-time
- ✅ VAULT com sync Google Drive
- ✅ Chat interface com NOUS
- ✅ Agent marketplace básico

**Tiers:**
- Free: 3 agents, CONTEXT limitado
- Premium: $10/mês - Agents ilimitados, CONTEXT completo

**Equipe:** 1-2 devs (você + alguém)

**Custo:** ~$0/mês (Firebase free tier)

**Não incluir no MVP:**
❌ Features de produtividade/marketing
❌ B2B features (empresas)
❌ Edição de vídeo/conteúdo
❌ Lead generation

**Foco total:**
✅ Gerenciar vida pessoal (saúde, finanças, relacionamentos)
✅ Decisões do dia a dia
✅ Bem-estar e objetivos de vida

---

### 📈 Fase 2: Scale B2C (Firebase + otimizações) - **+6 meses**

**Objetivo:** Suportar 1k-10k usuários (B2C)

**Adições:**
- Vector search para CONTEXT (Firestore Vector Search)
- 20+ agents especializados (marketplace)
- MCP servers integration (PubMed, Financial APIs)
- FHIR protocol support (hospitais/clínicas)
- Open Banking integration (bancos)
- Agent analytics dashboard
- Mobile apps (iOS + Android)
- Voice mode (conversas por voz)

**Tiers:**
- Free
- Premium ($10/mês)
- **Concierge ($500/mês)** - Done-for-you service:
  - Agendamos consultas médicas
  - Pagamos contas (após aprovação)
  - Gerenciamos calendário
  - Compramos presentes
  - Organizamos viagens
  - Suporte white-glove (consultor dedicado)

**Equipe:** 2-3 devs + 1 customer success (Concierge tier)

**Custo:** ~$200-500/mês (Firebase Blaze + Cloud Run)

**Target Concierge:** Executives, founders, médicos, advogados (pessoas com $ mas sem tempo)

---

### 🚀 Fase 3: Mainstream B2C - **+12 meses**

**Objetivo:** 100k+ usuários ativos (B2C puro)

**Adições:**
- 100+ agents no marketplace
- International expansion (Europa, Ásia, América Latina)
- Wearables integration (Apple Watch, Oura Ring)
- AR/VR experiments (Apple Vision Pro)
- NOUS Network (P2P entre usuários)
- API pública (developers podem construir em cima)

**Otimizações (se necessário):**
- PostgreSQL para analytics (Firestore mantém dados principais)
- Redis para cache pesado
- Rust para log processing (> 1M logs/dia)
- Kubernetes para agents (se Cloud Run ficar caro)

**Equipe:** 5-8 devs + 3-5 customer success (Concierge)

**Custo:** $2k-5k/mês

**Revenue esperado:** $500k-1M ARR (50k Premium + 1k Concierge + Marketplace)

---

### 🏢 Fase 4 (Opcional): Explorar B2B - **2027+**

**Só se B2C estiver validado e crescendo bem.**

**Possibilidades:**
- NOUS for Families ($30/mês - plano família)
- NOUS for Teams ($100/mês - pequenas equipes)
- White-label para empresas (casos específicos)

**Por que depois:**
- B2C precisa estar sólido primeiro
- B2B requer sales team diferente
- Distrai do foco principal (vida pessoal)
- Pode vir naturalmente (bottom-up adoption)

---

## Quando migrar de Firebase?

### ✅ Fique no Firebase se:
- < 10.000 usuários ativos
- < 100K operações/dia no Firestore
- < 1TB de storage no VAULT
- Custo < $500/mês

### ⏰ Migre partes para PostgreSQL se:
- Precisa de queries SQL complexas (analytics)
- Firestore está custando > $300/mês
- Precisa de joins complexos

### 🔥 Migre para Rust se:
- Log processing > 1M/dia
- Response time > 500ms
- Precisa de < 100ms latency

---

## Conclusão

### ✅ Comece com Firebase + Next.js

**Por quê:**
- **Zero DevOps** - Foco em agents, não em infraestrutura
- **Real-time nativo** - Perfeito para NOUS
- **Deploy em minutos** - `firebase deploy` e pronto
- **Custo ZERO inicial** - Free tier é generoso
- **Escala automaticamente** - Sem preocupações

### ⏳ Migre DEPOIS (se necessário)

**Sinais para migrar:**
- Firestore custa > $500/mês
- Precisa de SQL complexo
- Latency > 500ms

**Mas para 99% dos casos:** Firebase é suficiente.

---

**Recomendação final:**

👉 **MVP em Firebase PRIMEIRO** (2-3 meses)
👉 **Prove que funciona** (use você mesmo)
👉 **Ganhe os primeiros usuários** (100-1000)
👉 **Depois otimize** (se necessário)

🎯 **Foco:** Construir AGENTS incríveis, não gerenciar infraestrutura.

---

## Agent Marketplace: Ecossistema Aberto

### 🏪 Como Funciona

O marketplace NOUS é tipo:
- **NPM** para JavaScript
- **PyPI** para Python
- **Chrome Web Store** para extensões
- **Claude Skills** para habilidades

Mas para **agents de vida inteira**.

---

### 👨‍💻 Para Desenvolvedores: Como Publicar

#### 1️⃣ Criar Markdown Agent (5 minutos)

```bash
# Criar arquivo do agent
cat > @finance/budget-optimizer.md <<'EOF'
# @finance/budget-optimizer

> Otimiza seu orçamento mensal

## Config

```yaml
name: "@finance/budget-optimizer"
version: "1.0.0"
author: "@your-username"
type: "markdown"

model: "claude-sonnet-4"
temperature: 0.7

permissions:
  context:
    read: ["finance.transactions", "finance.budget"]

pricing:
  model: "subscription"
  price: 5.00  # R$/mês
```

## System Prompt

Você é um otimizador de orçamento...

EOF
```

#### 2️⃣ Publicar no Marketplace

```bash
# Instalar CLI
npm install -g @nous-os/cli

# Login
nous login

# Publicar
nous publish @finance/budget-optimizer.md

# Output:
# ✅ Agent publicado!
# 📦 @finance/budget-optimizer v1.0.0
# 🔗 https://marketplace.nous.ai/agents/@finance/budget-optimizer
```

#### 3️⃣ Monetizar (opcional)

```yaml
pricing:
  model: "subscription"
  price: 5.00  # R$/mês
  trial_days: 7

  # ou

  model: "pay-per-use"
  price_per_call: 0.10

  # ou

  model: "free"
```

**Revenue share:** 70% desenvolvedor, 30% NOUS (infraestrutura + pagamento)

---

### 🛒 Para Usuários: Como Instalar

#### Frontend (Next.js)

```typescript
// lens/app/marketplace/page.tsx
'use client';

import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AgentCard } from '@/components/marketplace/agent-card';
import { SearchBar } from '@/components/ui/search-bar';

export default function MarketplacePage() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');

  const searchAgents = async (query: string) => {
    const agentsRef = collection(db, 'marketplace', 'agents');
    const q = query(
      agentsRef,
      where('category', '==', 'finance'),
      orderBy('rating', 'desc')
    );

    const snapshot = await getDocs(q);
    setAgents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Agent Marketplace</h1>

      <SearchBar onSearch={searchAgents} />

      <div className="grid grid-cols-3 gap-4 mt-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// lens/components/marketplace/agent-card.tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function AgentCard({ agent }: { agent: any }) {
  const { user } = useAuth();

  const installAgent = async () => {
    if (!user) return;

    // Instalar agent no Firestore do usuário
    await setDoc(
      doc(db, 'users', user.uid, 'agents', agent.id),
      {
        ...agent,
        installedAt: new Date().toISOString(),
        enabled: true
      }
    );

    alert('Agent instalado com sucesso!');
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg">{agent.name}</h3>
      <p className="text-sm text-gray-600 mt-2">{agent.description}</p>

      <div className="flex items-center gap-2 mt-4">
        <span className="text-yellow-500">⭐ {agent.rating}</span>
        <span className="text-sm text-gray-500">
          ({agent.reviews} reviews)
        </span>
      </div>

      <div className="mt-4">
        <span className="font-bold">
          {agent.pricing.model === 'free'
            ? 'Grátis'
            : `R$ ${agent.pricing.price}/mês`}
        </span>
      </div>

      <Button onClick={installAgent} className="w-full mt-4">
        Instalar
      </Button>

      {/* Mostrar permissões */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm">
          Permissões necessárias
        </summary>
        <ul className="text-xs text-gray-600 mt-2">
          {agent.permissions?.context?.read?.map((perm: string) => (
            <li key={perm}>✅ Ler: {perm}</li>
          ))}
        </ul>
      </details>
    </Card>
  );
}
```

---

### 🔐 Segurança do Marketplace

#### Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Marketplace (público - read only)
    match /marketplace/agents/{agentId} {
      allow read: if true;  // Público
      allow write: if false;  // Só via admin SDK
    }

    // Agents instalados (privado)
    match /users/{userId}/agents/{agentId} {
      allow read, write: if request.auth.uid == userId;

      // Permissões validadas pelo sistema
      allow create: if validatePermissions(request.resource.data);
    }
  }

  function validatePermissions(agent) {
    // Agent só pode pedir permissões que marketplace aprovou
    let marketplaceAgent = get(/databases/$(database)/documents/marketplace/agents/$(agent.id));
    return agent.permissions == marketplaceAgent.data.permissions;
  }
}
```

#### Review Process (Manual)

```yaml
agent_submission:
  1. Developer publica agent
  2. Agent vai para "pending_review"
  3. NOUS team revisa:
     - ✅ Código malicioso? (se Python)
     - ✅ Permissões justificadas?
     - ✅ Prompt seguro? (sem jailbreak)
     - ✅ Descrição honesta?
  4. Se aprovado → marketplace público
  5. Se rejeitado → feedback ao dev
```

---

### 📊 Analytics para Desenvolvedores

```typescript
// Dashboard do desenvolvedor
{
  agent: "@finance/budget-optimizer",
  stats: {
    total_installs: 1250,
    active_users: 890,
    total_revenue: 4450.00,  // R$
    avg_rating: 4.7,
    total_reviews: 234
  },
  usage_this_month: {
    calls: 12500,
    avg_cost_per_call: 0.003,
    total_llm_cost: 37.50
  },
  revenue_breakdown: {
    gross: 4450.00,
    nous_fee: 1335.00,  // 30%
    net: 3115.00        // 70% para você
  }
}
```

---

### 🏆 Ranking e Descoberta

**Algoritmo de Ranking:**

```typescript
function calculateAgentScore(agent) {
  return (
    agent.rating * 0.4 +              // Qualidade (40%)
    Math.log(agent.installs) * 0.3 +  // Popularidade (30%)
    agent.activeUsers / agent.installs * 0.2 + // Engagement (20%)
    agent.monthlyGrowth * 0.1         // Trending (10%)
  );
}
```

**Categorias:**

```
Marketplace
├── 🔥 Trending (crescimento > 50%/mês)
├── ⭐ Top Rated (rating > 4.5)
├── 🆕 New (publicado < 30 dias)
├── 💰 Finance
├── 🏥 Health
├── 💼 Work
├── 🎓 Education
└── 🔒 Security
```

---

### 💡 Exemplo Completo: Fluxo de Vida

#### 1. Desenvolvedor cria agent

```bash
nous create @real-estate/broker --type markdown
# Edita @real-estate/broker.md
nous publish @real-estate/broker.md --price 10
```

#### 2. NOUS aprova (review)

```
✅ Aprovado após review
📦 Publicado em marketplace.nous.ai
```

#### 3. Usuário descobre no marketplace

```
Frontend → Busca "corretor imóveis"
        → Encontra @real-estate/broker
        → Rating: ⭐ 4.8 (340 reviews)
        → Preço: R$ 10/mês
```

#### 4. Usuário instala

```typescript
// Click "Instalar"
// Firestore cria documento:
users/{userId}/agents/@real-estate/broker {
  type: "markdown",
  enabled: true,
  installedAt: "2025-01-15",
  permissions: { ... }
}
```

#### 5. Usuário usa

```
User: "Encontre apartamento perto do trabalho, até R$ 300k"
NOUS → Chama @real-estate/broker (markdown agent)
     → Executa via Claude
     → Retorna sugestões
```

#### 6. Desenvolvedor recebe

```
Revenue this month: R$ 700
(70 usuários × R$ 10/mês)
Net (70%): R$ 490
```

---

## Quick Start: Comece Agora

### 1️⃣ Criar projeto Firebase (5 minutos)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Criar projeto
firebase projects:create nous-os

# Selecionar projeto
firebase use nous-os

# Inicializar (selecione Firestore, Functions, Hosting, Storage)
firebase init
```

### 2️⃣ Setup Next.js frontend (10 minutos)

```bash
# Criar projeto Next.js
npx create-next-app@latest lens --typescript --tailwind --app
cd lens

# Instalar Firebase
npm install firebase

# Instalar ShadCN
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog table

# Criar arquivo de config
touch .env.local
```

**.env.local:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3️⃣ Primeiro agent Python (15 minutos)

```bash
# Criar estrutura
mkdir -p agents/health/physician
cd agents/health/physician

# Criar requirements.txt
cat > requirements.txt <<EOF
fastapi==0.104.1
firebase-admin==6.2.0
anthropic==0.7.0
pydantic==2.5.0
uvicorn==0.24.0
EOF

# Criar agent
touch agent.py main.py Dockerfile
```

**main.py:**
```python
from fastapi import FastAPI
from agent import PhysicianAgent

app = FastAPI()
agent = PhysicianAgent()

@app.post("/run")
async def run_agent(data: dict):
    return await agent.run(data["user_id"], data)
```

### 4️⃣ Deploy tudo (5 minutos)

```bash
# Deploy Firebase
firebase deploy

# Deploy Next.js (Vercel)
cd lens
vercel

# Deploy agent (Cloud Run)
cd agents/health/physician
gcloud run deploy physician-agent --source .
```

**Total: 35 minutos do zero ao deploy! 🚀**

---

## Próximos Passos

1. **Leia NOUS-VISION.md** - Entenda a arquitetura completa
2. **Configure IDENTITY** - Customize persona, boundaries, priorities
3. **Crie seu CONTEXT** - Adicione dados de saúde, finanças, etc.
4. **Desenvolva agents** - Use os exemplos como base
5. **Teste com você mesmo** - Use NOUS no dia a dia
6. **Itere baseado em feedback** - Melhore continuamente

**Boa sorte! 🎯**
