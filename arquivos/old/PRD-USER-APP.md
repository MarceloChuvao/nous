# Product Requirements Document (PRD)
# NOUS OS - User Application (Web App MVP)

**Version:** 1.0
**Date:** January 2025
**Status:** Draft
**Product Type:** Hybrid Web Application (SSR + CSR)
**Platform:** Firebase + Next.js 14 App Router

---

## 📋 Executive Summary

**What:** NOUS OS User Application - interface web para usuários gerenciarem suas vidas através de AI agents personalizados.

**Why:** Pessoas precisam de uma forma simples e visual para interagir com seus agents, monitorar tasks de longa duração, e acessar seus dados pessoais estruturados.

**Who:** Pessoas que querem automatizar e otimizar aspectos de suas vidas (saúde, finanças, produtividade, etc).

**Platform Type:** Hybrid Web Application
- **Landing/Marketing:** SSG (Static Site Generation) - fast load, SEO
- **Dashboard/Chat/Working:** CSR (Client-Side Rendering) - real-time interactivity
- **Logs/Context/Settings:** SSR (Server-Side Rendering) - SEO-friendly, fast initial load

**Scope (MVP):**
- ✅ Dashboard com overview diário
- ✅ Chat interface com NOUS
- ✅ Gerenciamento de agents instalados
- ✅ Timeline de logs e histórico
- ✅ Monitoramento de tasks longas (working)
- ✅ Visualização de context (dados pessoais)
- ✅ Configurações básicas

**Out of Scope (v1):**
- ❌ Creator tools (no-code builder)
- ❌ Marketplace de agents
- ❌ Agent creation/editing
- ❌ Billing/payments
- ❌ Mobile native apps

---

## 🏗️ Platform Architecture & Rendering Strategy

### Architecture Type: **Hybrid Web Application**

NOUS OS usa uma estratégia híbrida que combina o melhor de SSR, CSR, e SSG, aproveitando o Next.js 14 App Router para otimizar performance, SEO, e interatividade.

### Rendering Strategy por Página:

| Page | Route | Strategy | Reason | Real-time |
|------|-------|----------|--------|-----------|
| **Landing** | `/` | SSG | SEO + fast load (marketing) | ❌ |
| **Login/Signup** | `/login` | SSG | Fast initial load | ❌ |
| **Dashboard** | `/dashboard` | CSR | Real-time updates, dynamic data | ✅ Firestore |
| **Chat** | `/chat` | CSR | Real-time messages, typing indicators | ✅ Firestore |
| **My Agents** | `/agents` | SSR → CSR | Fast initial load, then real-time status | ✅ Firestore |
| **Logs** | `/logs` | SSR + ISR | SEO-friendly, cached with revalidation | ❌ |
| **Working Tasks** | `/working` | CSR | Real-time progress updates | ✅ Firestore |
| **Context** | `/context` | SSR → CSR | Fast load, then editable | ❌ |
| **Settings** | `/settings` | SSR → CSR | Fast load, then interactive forms | ❌ |

### Strategy Definitions:

**SSG (Static Site Generation):**
- Built at build time
- Fastest load (served from CDN)
- Best for marketing/public pages
- No per-request computation

**SSR (Server-Side Rendering):**
- Rendered on server per request
- Fast initial load with data
- SEO-friendly (crawlers see content)
- Good for data-heavy pages

**CSR (Client-Side Rendering):**
- Rendered in browser
- Best for real-time interactivity
- Firestore listeners for live updates
- Requires JavaScript

**SSR → CSR (Progressive Enhancement):**
- Initial load: SSR (fast, SEO)
- After hydration: CSR (interactive)
- Best of both worlds

**ISR (Incremental Static Regeneration):**
- Static but revalidates periodically
- Good for semi-dynamic content (logs)
- Cache + freshness

### Technical Implementation:

```typescript
// app/dashboard/page.tsx (CSR)
'use client'
export default function Dashboard() {
  // Real-time Firestore listeners
  const { data } = useRealtimeTasks();
  return <DashboardUI tasks={data} />;
}

// app/logs/page.tsx (SSR)
export default async function Logs() {
  // Server-side data fetch
  const logs = await getLogsFromFirestore();
  return <LogsUI logs={logs} />;
}

// app/agents/page.tsx (SSR → CSR)
export default async function Agents() {
  // SSR: Initial data
  const agents = await getAgentsFromFirestore();
  return <AgentsUI initialAgents={agents} />; // CSR takes over
}
```

### Why Hybrid?

**✅ Benefits:**
1. **Performance:** SSG/SSR = fast initial loads, CSR = smooth interactions
2. **SEO:** SSR/SSG pages are crawlable (logs, context, landing)
3. **Real-time:** CSR with Firestore listeners (dashboard, chat, working)
4. **Flexibility:** Choose best strategy per page
5. **Progressive Enhancement:** Works without JS (SSR), better with JS (CSR)

**📊 Performance Targets:**
- Landing page (SSG): < 1s FCP (First Contentful Paint)
- Dashboard (CSR): < 2s TTI (Time to Interactive)
- Logs (SSR): < 1.5s FCP
- Real-time updates: < 500ms latency

### Responsive Design:

**Mobile-First Approach:**
- Base styles for mobile (< 768px)
- Progressive enhancement for tablet/desktop
- Touch-friendly targets (min 44x44px)
- Works offline with Firestore persistence

**Breakpoints:**
```css
mobile: < 768px (base)
tablet: 768px - 1024px
desktop: > 1024px
```

**Adaptation Strategy:**
- Mobile: Bottom navigation, full-screen modals
- Tablet: Sidebar navigation, split views
- Desktop: Multi-column layouts, hover states

---

## 🎯 Goals & Objectives

### Business Goals
1. **Validar Product-Market Fit:** Testar se usuários adotam um OS pessoal com AI agents
2. **Coletar Feedback:** Entender padrões de uso e necessidades reais
3. **Preparar para B2C2C:** Construir base para futura plataforma de creators

### Product Goals
1. **Clareza Visual:** Usuário entende instantaneamente o que está acontecendo
2. **Real-time Feedback:** Tasks longas mostram progresso em tempo real
3. **Confiança:** Logs transparentes de tudo que agents fazem
4. **Controle:** Usuário pode pausar, cancelar, ou configurar qualquer agent

### Success Metrics (MVP)
- **Engagement:** Usuário acessa app ≥3x/semana
- **Retention:** 60% dos usuários voltam após 7 dias
- **Agent Usage:** Média de 2+ agents ativos por usuário
- **Task Completion:** 80% das working tasks completam com sucesso
- **Chat Usage:** 5+ mensagens/semana por usuário ativo

---

## 👥 User Personas

### Persona 1: "Alex - O Otimizador"
**Perfil:**
- 32 anos, trabalha em tech
- Quer otimizar saúde, finanças, e produtividade
- Já usa apps de tracking (Oura, YNAB, Notion)
- Comfort com tecnologia

**Needs:**
- Ver todos os dados em um lugar
- Automações que economizam tempo
- Transparência do que agents fazem

**Pain Points:**
- Apps fragmentados (10+ apps diferentes)
- Automações quebram e não avisa
- Difícil entender "por que" agent tomou decisão

### Persona 2: "Maria - A Ocupada"
**Perfil:**
- 45 anos, médica
- Vida super atarefada
- Quer delegar tarefas administrativas
- Não é "tech-savvy"

**Needs:**
- Interface simples e clara
- Agents que "simplesmente funcionam"
- Notificações só quando importante

**Pain Points:**
- Não tem tempo para configurar sistemas complexos
- Frustra quando tech não funciona como esperado
- Precisa confiar que agent fará certo

---

## 📖 User Stories

### Epic 1: Monitoring & Visibility

**US-1.1:** Como usuário, quero ver um dashboard com resumo do dia, para entender rapidamente o que está acontecendo.
- **Acceptance Criteria:**
  - Shows greeting with user name and time of day
  - Displays active tasks (max 5)
  - Shows recent activity (last 24h)
  - Lists active agents
  - All cards clickable to details

**US-1.2:** Como usuário, quero ver timeline completa de logs, para auditar tudo que agents fizeram.
- **Acceptance Criteria:**
  - Events grouped by date (Today, Yesterday, etc)
  - Shows agent executions, hooks triggered, workflows
  - Includes metadata (duration, cost, status)
  - Expandable details on click
  - Filter by type, agent, date
  - Search by keyword

**US-1.3:** Como usuário, quero monitorar tasks de longa duração, para saber progresso de workflows complexos.
- **Acceptance Criteria:**
  - Shows all active tasks
  - Displays progress bar with percentage
  - Real-time updates (WebSocket or polling)
  - Contextual actions (pause, cancel, ask info)
  - Shows completed tasks (last 7 days)

### Epic 2: Interaction

**US-2.1:** Como usuário, quero conversar com NOUS via chat, para fazer perguntas e dar comandos.
- **Acceptance Criteria:**
  - Real-time chat interface
  - Message history persists
  - Supports text input
  - Quick action buttons for common tasks
  - Auto-scroll to latest message
  - Shows typing indicator

**US-2.2:** Como usuário, quero fazer perguntas DURANTE execução de task longa, para agent ter informações necessárias.
- **Acceptance Criteria:**
  - Button "Ask Info" on active tasks
  - Opens chat context with task
  - Agent receives answer in real-time
  - User sees answer was delivered

### Epic 3: Agent Management

**US-3.1:** Como usuário, quero ver todos meus agents instalados, para saber quais estão ativos.
- **Acceptance Criteria:**
  - List all installed agents
  - Shows status (active, paused)
  - Displays last execution time
  - Shows execution count (today)
  - Lists permissions (read/write access)

**US-3.2:** Como usuário, quero pausar/resumir agents, para controlar quando executam.
- **Acceptance Criteria:**
  - Pause button on active agents
  - Resume button on paused agents
  - Visual status indicator (color)
  - Confirmation before pausing critical agents

**US-3.3:** Como usuário, quero ver informações sobre agent, para entender o que faz.
- **Acceptance Criteria:**
  - Info button opens modal/drawer
  - Shows description, permissions, creator
  - Lists recent executions
  - Shows configuration options

### Epic 4: Data Management

**US-4.1:** Como usuário, quero ver meus dados organizados por domínio (health, finance, etc), para ter contexto do que agents sabem.
- **Acceptance Criteria:**
  - Tabs for each domain (health, finance, goals, personal, work)
  - Nested tree structure for data
  - Status indicators (normal, warning)
  - Last updated timestamps

**US-4.2:** Como usuário, quero editar meus dados, para manter informações atualizadas.
- **Acceptance Criteria:**
  - Edit button on each domain card
  - Inline editing or modal form
  - Validation for data types
  - Save confirmation

**US-4.3:** Como usuário, quero fazer upload de arquivos (exames, PDFs), para agents processarem.
- **Acceptance Criteria:**
  - Upload button with drag & drop
  - Accepts PDF, images, CSV
  - Shows upload progress
  - File appears in relevant domain

### Epic 5: Settings & Preferences

**US-5.1:** Como usuário, quero configurar notificações, para controlar quando sou avisado.
- **Acceptance Criteria:**
  - Checkboxes for notification types
  - Options: email, push, weekly summaries, execution alerts
  - Save changes button
  - Confirmation toast

**US-5.2:** Como usuário, quero configurar privacidade, para controlar compartilhamento de dados.
- **Acceptance Criteria:**
  - Toggle switches for privacy settings
  - Options: share data with agents, allow marketplace access
  - Description text explaining each setting

---

## ⚙️ Functional Requirements

### FR-1: Dashboard (`/dashboard`)

**Description:** Home page showing daily overview and quick access.

**Components:**
- Header (logo, notifications, user menu)
- Greeting section (personalized)
- Active Tasks card (shows 2-5 tasks)
- Recent Activity card (last 24h, max 5 items)
- My Agents card (shows active agents)

**Interactions:**
- Click task → Navigate to `/working/{task_id}`
- Click activity → Navigate to `/logs?id={log_id}`
- Click agent badge → Navigate to `/agents`
- "View All Logs" → Navigate to `/logs`
- "Manage Agents" → Navigate to `/agents`

**Data Sources:**
- `users/{uid}/working/tasks` (Firestore)
- `users/{uid}/logs/events` (Firestore, last 24h)
- `users/{uid}/agents/installed` (Firestore)

**Real-time Updates:**
- Active tasks update via Firestore listener
- Recent activity updates every 30s

### FR-2: Chat Interface (`/chat`)

**Description:** Real-time chat with NOUS orchestrator.

**Components:**
- Header (back button, title)
- Message list (scrollable)
- Quick action buttons
- Input bar (text + send button)

**Message Types:**
- User message (right-aligned, blue)
- NOUS message (left-aligned, gray)
- System message (centered, italic)

**Interactions:**
- Type message + Enter/Click send → Send to NOUS
- Click quick action → Auto-fills input with command
- Messages scroll to bottom automatically
- Input autofocus on page load

**Data Sources:**
- `users/{uid}/chat/messages` (Firestore)
- Real-time listener for new messages

**API Integration:**
- POST `/api/chat` - Send user message
- GET `/api/chat/history` - Load chat history
- WebSocket or Firestore listener for real-time

**Special Features:**
- Markdown rendering in NOUS messages
- Code blocks with syntax highlighting
- Typing indicator when NOUS is responding

### FR-3: My Agents (`/agents`)

**Description:** List of installed agents with management controls.

**Components:**
- Header (title, settings button)
- Active agents section
- Paused agents section
- Agent cards

**Agent Card Info:**
- Icon emoji + name
- Description (1 line)
- Status indicator (● active, ⏸ paused)
- Last run timestamp
- Executions today count
- Permissions list
- Action buttons

**Interactions:**
- Click "Configure" → Opens config modal/drawer
- Click "Pause" → Pauses agent (confirmation)
- Click "Resume" → Resumes agent
- Click "Info" → Opens info modal with details
- Click settings icon → Navigate to agent settings page

**Data Sources:**
- `users/{uid}/agents/installed` (Firestore)
- `users/{uid}/agents/{agent_id}/executions` (for counts)

### FR-4: Logs & History (`/logs`)

**Description:** Timeline of all events (agents, hooks, workflows).

**Components:**
- Header (title, search input, filter dropdown)
- Timeline (grouped by date)
- Log entry cards

**Log Entry Types:**
1. **Agent Execution**
   - Agent name
   - Action/description
   - Duration, cost
   - Status (success/error)
   - Expandable details

2. **Hook Triggered**
   - Hook name
   - Condition
   - Actions executed
   - Duration

3. **Workflow Checkpoint**
   - Workflow name
   - Current phase
   - Progress data
   - Status

4. **Errors/Warnings**
   - Error message
   - Stack trace (expandable)
   - Affected agent/workflow

**Interactions:**
- Click "View Details" → Expands card with full data
- Type in search → Filters entries
- Select filter → Shows only selected type
- Infinite scroll or pagination

**Data Sources:**
- `users/{uid}/logs/events` (Firestore)
- Indexed by timestamp (descending)
- Filter by: type, agent_id, date_range

**Filters:**
- All (default)
- Agents
- Hooks
- Workflows
- Errors

### FR-5: Working Tasks (`/working`)

**Description:** Active long-running workflows with progress tracking.

**Components:**
- Header (title, "+ New Task" button)
- Active tasks section
- Completed tasks section (last 7 days)
- Task cards

**Task Card Info:**
- Icon emoji + name
- Priority badge (High/Medium/Low)
- Status text
- Progress bar (0-100%)
- Metadata (started, goal, checks)
- Latest updates (bullet list)
- Contextual action buttons

**Interactions:**
- Click "View Full History" → Navigate to `/working/{task_id}/history`
- Click "Pause" → Pauses workflow
- Click "Cancel" → Cancels workflow (confirmation)
- Click "Ask Info" → Opens chat context with task
- Click "+ New Task" → Opens task creation modal

**Data Sources:**
- `users/{uid}/working/tasks` (Firestore)
- Real-time listener for progress updates

**Real-time Updates:**
- Progress bar updates via Firestore listener
- Latest updates section refreshes every 30s

**Progress Bar Colors:**
- 0-30%: blue
- 31-70%: yellow
- 71-100%: green

### FR-6: Context (My Data) (`/context`)

**Description:** Personal data organized by domains.

**Components:**
- Header (title, "+ Add Data" button)
- Tab navigation (Health, Finance, Goals, Personal, Work)
- Domain cards (one per tab)

**Domain Card Structure:**
- Header (emoji + name, Edit button)
- Nested data (tree structure)
- Status indicators (✅ ⚠️)
- Action buttons (domain-specific)

**Example Domains:**

1. **Health:**
   - Bloodwork (with values + status)
   - Medications (list)
   - Vitals (weight, height, BMI)
   - Actions: [Upload Exam] [Add Medication]

2. **Finance:**
   - Account balance
   - Monthly summary (income, expenses, savings)
   - Actions: [Connect Bank] [Add Transaction]

3. **Goals:**
   - Active goals (with progress)
   - Completed goals
   - Actions: [Add Goal] [Review Progress]

**Interactions:**
- Click tab → Load domain data
- Click "Edit" → Inline editing or modal
- Click action button → Domain-specific action
- Click "+ Add Data" → Opens data type selector

**Data Sources:**
- `users/{uid}/context/{domain}` (Firestore)
- Real-time listener for updates from agents

### FR-7: Settings (`/settings`)

**Description:** User preferences and configuration.

**Components:**
- Sidebar navigation
- Content area (forms/toggles)

**Sections:**

1. **Profile:**
   - Name (text input)
   - Email (text input, read-only or editable)
   - [Update Profile] button

2. **Notifications:**
   - Email notifications (checkbox)
   - Push notifications (checkbox)
   - Weekly summaries (checkbox)
   - Agent execution alerts (checkbox)
   - [Save Changes] button

3. **Privacy:**
   - Share data with agents (toggle)
   - Allow agent marketplace (toggle)
   - Description text for each

4. **Agents:**
   - Default permissions
   - Auto-approve executions (toggle)

5. **Billing (future):**
   - Current plan
   - Usage stats
   - Payment method

**Interactions:**
- Click sidebar item → Load section
- Change setting → Enable save button
- Click "Save Changes" → POST to API
- Show confirmation toast

**Data Sources:**
- `users/{uid}/profile` (Firestore)
- `users/{uid}/settings` (Firestore)

---

## 🔒 Non-Functional Requirements

### NFR-1: Performance

**Requirement:** App deve ser rápida e responsiva em todas as páginas.

**Metrics por Tipo de Página:**

| Page Type | Strategy | FCP Target | LCP Target | TTI Target | Notes |
|-----------|----------|------------|------------|------------|-------|
| **Landing** | SSG | < 1.0s | < 1.5s | < 2.0s | Served from CDN |
| **Login** | SSG | < 1.0s | < 1.5s | < 2.0s | Minimal JS |
| **Dashboard** | CSR | < 2.0s | < 2.5s | < 3.0s | Real-time data |
| **Chat** | CSR | < 2.0s | < 2.5s | < 3.0s | Firestore listener |
| **Logs** | SSR+ISR | < 1.5s | < 2.0s | < 2.5s | Cached (60s) |
| **Agents** | SSR→CSR | < 1.5s | < 2.0s | < 2.5s | Hybrid |
| **Working** | CSR | < 2.0s | < 2.5s | < 3.0s | Real-time updates |
| **Context** | SSR→CSR | < 1.5s | < 2.0s | < 2.5s | Hybrid |
| **Settings** | SSR→CSR | < 1.5s | < 2.0s | < 2.5s | Hybrid |

**Core Web Vitals Goals:**
- **FCP (First Contentful Paint):** < 1.8s average
- **LCP (Largest Contentful Paint):** < 2.5s average
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTI (Time to Interactive):** < 3.0s average

**Real-time Performance:**
- Firestore listener latency: < 500ms
- WebSocket message delivery: < 200ms
- API response time: < 300ms (p95)
- Smooth animations: 60fps (16.6ms per frame)

**Implementation:**
- **SSG/SSR:** Pre-render static/dynamic content on server
- **Code Splitting:** Automatic per route (Next.js)
- **Image Optimization:** next/image with WebP, lazy loading
- **Firestore Indexes:** Composite indexes for complex queries
- **Caching:** SWR with stale-while-revalidate
- **Bundle Size:** < 200KB initial JS bundle
- **Route Prefetching:** Next.js Link with prefetch
- **CDN:** Vercel Edge Network for static assets
- **Compression:** Gzip/Brotli for all assets

### NFR-2: Security

**Requirement:** Dados do usuário devem ser protegidos.

**Security Measures:**
- Firebase Auth (required for all routes)
- Row-level security (Firestore rules)
- HTTPS only
- XSS protection (sanitize inputs)
- CSRF tokens for mutations
- Rate limiting on API routes

**Firestore Rules Example:**
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;

  match /working/tasks/{taskId} {
    allow read: if request.auth.uid == userId;
    allow write: if request.auth.uid == userId;
  }
}
```

### NFR-3: Reliability

**Requirement:** App deve funcionar consistentemente.

**Metrics:**
- Uptime: 99.5% (MVP acceptable)
- Error rate: < 1% of requests
- Data loss: 0 (Firestore backups)

**Implementation:**
- Error boundaries (React)
- Fallback UI for loading/errors
- Retry logic for failed requests
- Firestore offline persistence
- Health check endpoints

### NFR-4: Usability

**Requirement:** Interface deve ser intuitiva.

**Standards:**
- WCAG 2.1 Level AA compliance (accessibility)
- Mobile-first responsive design
- Touch targets: min 44x44px
- Contrast ratios: min 4.5:1
- Keyboard navigation support
- Screen reader friendly

### NFR-5: Scalability

**Requirement:** App deve escalar com crescimento de usuários.

**Design for:**
- 100 concurrent users (MVP)
- 1,000 users total (MVP)
- 10,000 log entries per user
- Real-time updates for 100 users

**Firebase Limits:**
- Firestore: 1M document reads/day (free tier)
- Cloud Functions: 2M invocations/month (free tier)
- Storage: 5GB (free tier)

**Optimization:**
- Pagination for logs (limit 50 per page)
- Lazy loading for images
- Firestore query limits
- Background sync for non-critical data

---

## 💻 Technical Requirements

### Tech Stack

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** React 18
- **Component Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **Icons:** lucide-react
- **Styling:** Tailwind CSS
- **State Management:** React Context + SWR/React Query
- **Forms:** React Hook Form + Zod validation
- **Real-time:** Firestore listeners

**Backend:**
- **Platform:** Firebase
  - **Auth:** Firebase Authentication
  - **Database:** Firestore
  - **Functions:** Cloud Functions (Node.js)
  - **Storage:** Firebase Storage
  - **Hosting:** Firebase Hosting or Vercel
- **Orchestration:** LangGraph (Python, Cloud Run)
- **Creator Tools:** Flowise (future)

**Deployment:**
- **Frontend:** Vercel (recommended for Next.js)
  - Automatic SSR/SSG/ISR support
  - Edge Functions for API routes
  - CDN for static assets
- **Functions:** Firebase Cloud Functions
- **Agents:** Cloud Run (Python containers)

### Rendering Strategy Implementation

**Next.js 14 App Router Structure:**
```
app/
├── (public)/
│   ├── page.tsx                    # Landing (SSG)
│   └── login/
│       └── page.tsx                # Login (SSG)
├── (protected)/
│   ├── layout.tsx                  # Auth middleware
│   ├── dashboard/
│   │   └── page.tsx                # CSR ('use client')
│   ├── chat/
│   │   └── page.tsx                # CSR ('use client')
│   ├── agents/
│   │   └── page.tsx                # SSR → CSR (async + client components)
│   ├── logs/
│   │   └── page.tsx                # SSR + ISR (revalidate: 60)
│   ├── working/
│   │   └── page.tsx                # CSR ('use client')
│   ├── context/
│   │   └── page.tsx                # SSR → CSR
│   └── settings/
│       └── page.tsx                # SSR → CSR
└── api/
    └── [...routes]                 # API Routes (Edge or Node.js)
```

**Implementation Examples:**

**1. CSR (Dashboard, Chat, Working):**
```typescript
// app/(protected)/dashboard/page.tsx
'use client'

import { useRealtimeData } from '@/hooks/useFirestore'

export default function Dashboard() {
  const { tasks, loading } = useRealtimeData('users/{uid}/working/tasks')

  if (loading) return <SkeletonLoader />
  return <DashboardUI tasks={tasks} />
}
```

**2. SSR (Logs with ISR):**
```typescript
// app/(protected)/logs/page.tsx
import { getLogs } from '@/lib/firestore'

export const revalidate = 60 // ISR: revalidate every 60s

export default async function Logs() {
  const logs = await getLogs()
  return <LogsUI logs={logs} />
}
```

**3. SSR → CSR (Agents):**
```typescript
// app/(protected)/agents/page.tsx
import { getAgents } from '@/lib/firestore'
import AgentsClient from './agents-client'

export default async function Agents() {
  const initialAgents = await getAgents()

  // Pass SSR data to client component
  return <AgentsClient initialAgents={initialAgents} />
}

// agents-client.tsx
'use client'
export default function AgentsClient({ initialAgents }) {
  const { agents } = useRealtimeAgents(initialAgents)
  return <AgentsUI agents={agents} />
}
```

**4. SSG (Landing):**
```typescript
// app/(public)/page.tsx
export default function Landing() {
  // No data fetching, static content
  return <LandingPage />
}
```

**State Management Strategy:**
- **Real-time data:** Firestore listeners (CSR pages)
- **Cached data:** SWR with Firestore (hybrid pages)
- **Form state:** React Hook Form
- **Global state:** React Context (user, auth)

**Data Fetching Patterns:**
```typescript
// hooks/useFirestore.ts
export function useRealtimeData(path: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, path), (snapshot) => {
      setData(snapshot.data())
      setLoading(false)
    })
    return () => unsubscribe()
  }, [path])

  return { data, loading }
}

// lib/firestore.ts (SSR)
export async function getLogs() {
  const snapshot = await getDocs(collection(db, 'logs'))
  return snapshot.docs.map(doc => doc.data())
}
```

### API Endpoints

**Chat:**
- `POST /api/chat` - Send message to NOUS
- `GET /api/chat/history` - Get chat history

**Agents:**
- `GET /api/agents` - List installed agents
- `POST /api/agents/{id}/pause` - Pause agent
- `POST /api/agents/{id}/resume` - Resume agent
- `GET /api/agents/{id}/config` - Get agent config
- `PUT /api/agents/{id}/config` - Update agent config

**Working:**
- `GET /api/working/tasks` - List active tasks
- `POST /api/working/tasks/{id}/pause` - Pause task
- `POST /api/working/tasks/{id}/cancel` - Cancel task
- `GET /api/working/tasks/{id}/history` - Get task history

**Logs:**
- `GET /api/logs` - Get logs (with filters, pagination)
- `GET /api/logs/{id}` - Get log details

**Context:**
- `GET /api/context/{domain}` - Get domain data
- `PUT /api/context/{domain}` - Update domain data
- `POST /api/context/upload` - Upload file

**Settings:**
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

### Data Models (Firestore)

**Users:**
```typescript
users/{uid}/
  profile: {
    name: string
    email: string
    created_at: timestamp
    avatar_url?: string
  }
  settings: {
    notifications: {
      email: boolean
      push: boolean
      weekly_summaries: boolean
      execution_alerts: boolean
    }
    privacy: {
      share_data: boolean
      allow_marketplace: boolean
    }
  }
```

**Agents:**
```typescript
users/{uid}/agents/installed/{agent_id}
  name: string
  description: string
  icon: string
  status: "active" | "paused"
  permissions: string[]
  last_run: timestamp
  executions_today: number
  created_at: timestamp
  config: {...}
```

**Working Tasks:**
```typescript
users/{uid}/working/tasks/{task_id}
  name: string
  icon: string
  priority: "high" | "medium" | "low"
  status: "running" | "paused" | "completed" | "failed"
  progress: number (0-100)
  started_at: timestamp
  goal: string
  metadata: {
    checks_done: number
    checks_total: number
    frequency: string
    best_result?: any
  }
  workflow: {
    thread_id: string
    workflow_name: string
    runtime: "langgraph"
  }
  latest_updates: Array<{
    message: string
    timestamp: timestamp
  }>
```

**Logs:**
```typescript
users/{uid}/logs/events/{log_id}
  type: "agent_execution" | "hook_triggered" | "workflow_checkpoint" | "error"
  timestamp: timestamp
  agent_name?: string
  workflow_name?: string
  description: string
  metadata: {
    duration_ms?: number
    cost_usd?: number
    status: "success" | "error"
    error_message?: string
  }
  details: {...}
```

**Context:**
```typescript
users/{uid}/context/{domain}
  last_updated: timestamp
  data: {
    // Domain-specific structure
    // Example for health:
    bloodwork: {
      last_date: string
      values: {
        cholesterol: { value: number, unit: string, status: "normal" | "warning" }
        glucose: { value: number, unit: string, status: "normal" | "warning" }
      }
    }
    medications: Array<{
      name: string
      dose: string
      frequency: string
    }>
    vitals: {
      weight: number
      height: number
      bmi: number
    }
  }
```

**Chat:**
```typescript
users/{uid}/chat/messages/{message_id}
  role: "user" | "assistant" | "system"
  content: string
  timestamp: timestamp
  metadata?: {
    agent?: string
    task_id?: string
  }
```

### Authentication & Authorization

**Auth Providers:**
- Email/Password
- Google OAuth
- (Future: Apple, GitHub)

**Protected Routes:**
- All routes except `/login` require auth
- Middleware redirects to `/login` if unauthenticated

**Authorization:**
- User can only access their own data
- Firestore security rules enforce row-level security
- No admin/super user for MVP

---

## 🎨 UI/UX Requirements

### Design System

**Colors:**
```css
Primary: #3b82f6 (blue-500)
Success: #10b981 (green-500)
Warning: #f59e0b (yellow-500)
Danger: #ef4444 (red-500)
Gray: #6b7280 (gray-500)
Background: #ffffff
Card: #f9fafb (gray-50)
```

**Typography:**
- Font Family: Inter (Google Fonts)
- Heading: 700 weight
- Body: 400 weight
- Small: 300 weight

**Spacing:**
- Base unit: 4px (Tailwind default)
- Card padding: 16px (p-4)
- Section spacing: 24px (space-y-6)

**Components:**
- Use shadcn/ui components exclusively
- Maintain consistent styling across all pages
- Icons: lucide-react only

### Responsive Design

**Breakpoints:**
```css
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
```

**Mobile Adaptations:**
- Dashboard: Stack cards vertically
- Chat: Full screen, hide sidebar
- My Agents: Single column
- Logs: Compact card view
- Working: Full width cards
- Context: Tabs become dropdown
- Settings: Sidebar becomes top tabs

### Loading States

**Skeleton Loaders:**
- Dashboard cards: Show skeleton while loading
- Chat: Show typing indicator
- Logs: Show skeleton for entries
- Working: Animate progress bars

**Empty States:**
- Dashboard: "No active tasks" with CTA
- Agents: "No agents installed" with install button
- Logs: "No events yet" with explanation
- Working: "No active tasks" with create button

### Error States

**Error UI:**
- Toast notifications for temporary errors
- Inline error messages for form validation
- Full-page error for critical failures
- Retry button where applicable

**Error Messages:**
- Clear, user-friendly language
- No technical jargon
- Suggest action to resolve

---

## 📊 Success Metrics (Detailed)

### Activation Metrics
- **User signs up and completes onboarding:** 80% completion rate
- **User installs first agent:** Within 5 minutes of signup
- **User sends first chat message:** 90% of users within 10 minutes

### Engagement Metrics
- **Daily Active Users (DAU):** 30% of registered users
- **Weekly Active Users (WAU):** 60% of registered users
- **Session duration:** Average 10+ minutes per session
- **Pages per session:** 4+ pages

### Feature Usage
- **Chat usage:** 70% of users use chat weekly
- **Agent management:** 80% of users have 2+ agents active
- **Working tasks:** 50% of users have created a working task
- **Context views:** 40% of users view context weekly
- **Logs views:** 60% of users check logs weekly

### Quality Metrics
- **Error rate:** < 1% of requests
- **Load time:** 90% of pages load < 2s
- **Task success rate:** 80% of working tasks complete successfully
- **User-reported bugs:** < 5 per week (MVP)

### Retention Metrics
- **Day 1 retention:** 70%
- **Day 7 retention:** 60%
- **Day 30 retention:** 40%

---

## 🗓️ Roadmap & Timeline

### Phase 1: Foundation (Weeks 1-2)

**Week 1:**
- ✅ PRD approval
- ✅ Design system setup (Tailwind, shadcn/ui)
- ✅ Next.js project scaffolding
- ✅ Firebase setup (Auth, Firestore)
- ✅ Basic routing structure
- ✅ Authentication flow (login/signup)

**Week 2:**
- Dashboard (v0 → code → integration)
- Chat interface (v0 → code → integration)
- Basic API endpoints (chat, agents)
- Firestore data models implementation
- Real-time listeners setup

**Deliverable:** Working dashboard + chat

### Phase 2: Core Features (Weeks 3-4)

**Week 3:**
- My Agents page
- Logs & History page
- Working Tasks page (basic)
- API endpoints for agents, logs
- Firestore security rules

**Week 4:**
- Context page (all domains)
- Settings page
- File upload functionality
- Real-time updates for working tasks
- Polish & bug fixes

**Deliverable:** All 7 pages functional

### Phase 3: Polish & Testing (Week 5)

**Week 5:**
- Responsive design testing (mobile, tablet)
- Performance optimization
- Error handling & edge cases
- Accessibility audit
- User testing (5-10 beta users)
- Bug fixes

**Deliverable:** Production-ready MVP

### Phase 4: Launch (Week 6)

**Week 6:**
- Deploy to production (Vercel + Firebase)
- Monitoring setup (Sentry, Analytics)
- Launch to beta users (50-100)
- Collect feedback
- Iterate based on feedback

**Deliverable:** Public MVP

---

## 🚨 Dependencies & Risks

### Dependencies

**External:**
- Firebase (Firestore, Auth, Functions, Hosting)
- Vercel (deployment)
- LangGraph (Python orchestration layer)
- OpenAI/Anthropic API (for agents)

**Internal:**
- Backend team: API endpoints, orchestration
- Designer: Final design approval
- QA: Testing for launch

### Risks

**Risk 1: Real-time performance issues**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Load testing, Firestore optimization, fallback to polling

**Risk 2: Complex state management**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Use proven libraries (SWR/React Query), keep state simple

**Risk 3: Firebase costs exceed budget**
- **Impact:** Medium
- **Probability:** Low
- **Mitigation:** Monitor usage, implement pagination, set budget alerts

**Risk 4: User confusion with workflows**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** User testing, clear onboarding, tooltips/help text

**Risk 5: Scope creep**
- **Impact:** High
- **Probability:** High
- **Mitigation:** Strict adherence to PRD, no features outside MVP scope

---

## ❓ Open Questions

### ✅ Resolved

1. **Platform type (Webapp vs Site responsivo):**
   - **Decision:** Hybrid Web Application (SSR + CSR + SSG)
   - **Rationale:** Best of all worlds - SSG for landing, SSR for SEO pages, CSR for real-time
   - **Status:** Documented in Architecture section

### Technical

1. **Real-time strategy:** Firestore listeners vs WebSockets vs polling?
   - **Recommendation:** Firestore listeners (native, reliable)
   - **Status:** ✅ Decided

2. **State management:** Context + SWR vs Redux vs Zustand?
   - **Recommendation:** Context + SWR (simpler for MVP)
   - **Status:** ✅ Decided

3. **File uploads:** Direct to Storage vs via Cloud Function?
   - **Recommendation:** Direct to Storage with signed URLs
   - **Status:** ✅ Decided

4. **Chat history:** Firestore vs separate DB (PostgreSQL)?
   - **Recommendation:** Firestore (consistency, real-time)
   - **Status:** ✅ Decided

5. **Deployment platform:** Vercel vs Firebase Hosting?
   - **Recommendation:** Vercel (better Next.js support, automatic SSR/ISR)
   - **Status:** ✅ Decided

### Product
1. **Onboarding:** How do users get their first agent?
   - **Options:** Pre-installed demo agents, marketplace, invite-only
   - **Decision needed:** Week 1

2. **Notifications:** Push notifications in MVP or v2?
   - **Recommendation:** v2 (Web Push is complex)

3. **Billing:** Free tier limits for MVP?
   - **Recommendation:** No limits for MVP, focus on product-market fit

4. **Multi-device:** Session management across devices?
   - **Recommendation:** Single session for MVP, multi-session v2

### UX
1. **Empty states:** What CTAs to show when no data?
   - **Decision needed:** Design phase

2. **Error recovery:** Auto-retry vs manual retry?
   - **Recommendation:** Manual retry with clear messaging

3. **Mobile navigation:** Bottom tabs vs hamburger menu?
   - **Recommendation:** Bottom tabs (faster access)

---

## 📝 Appendix

### Glossary

**Product Terms:**
- **NOUS:** Master orchestrator agent that coordinates all sub-agents
- **Agent:** AI-powered assistant focused on a specific domain (health, finance, etc)
- **Working Task:** Long-running workflow (hours/days) with checkpointing
- **Hook:** Event-driven automation trigger (onContextUpdate, onSchedule, etc)
- **Context:** User's personal data organized by domains
- **Thread:** LangGraph execution session with persistent state
- **Checkpoint:** Saved state in a workflow, allowing resume after interruption

**Technical Terms:**
- **SSG (Static Site Generation):** Pages built at build time, served from CDN (fastest load)
- **SSR (Server-Side Rendering):** Pages rendered on server per request (SEO-friendly, fast initial load)
- **CSR (Client-Side Rendering):** Pages rendered in browser (best for real-time interactivity)
- **ISR (Incremental Static Regeneration):** Static pages that revalidate periodically (cache + freshness)
- **Hybrid Web App:** Application using multiple rendering strategies (SSG + SSR + CSR)
- **Progressive Enhancement:** Start with SSR (works without JS), enhance with CSR (interactive)
- **Hydration:** Process of attaching React event handlers to SSR-rendered HTML
- **FCP (First Contentful Paint):** Time until first text/image appears
- **LCP (Largest Contentful Paint):** Time until largest element appears
- **TTI (Time to Interactive):** Time until page is fully interactive
- **Core Web Vitals:** Google's metrics for user experience (FCP, LCP, FID, CLS)

### References

- [V0-USER-APP-ONLY.md](f:\JARVA\V0-USER-APP-ONLY.md) - Design guide
- [NOUS-VISION.md](f:\JARVA\NOUS-VISION.md) - Product vision
- [TECH-STACK-PRAGMATICA.md](f:\JARVA\TECH-STACK-PRAGMATICA.md) - Technical architecture
- [LANGGRAPH-ORCHESTRATION.md](f:\JARVA\LANGGRAPH-ORCHESTRATION.md) - Stateful workflows
- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 📊 Document Status

**Status:** ✅ Ready for Development Kickoff
**Version:** 1.0
**Last Updated:** January 2025

**Key Decisions Made:**
- ✅ Platform type: Hybrid Web Application (SSR + CSR + SSG)
- ✅ Deployment: Vercel (Next.js 14 App Router)
- ✅ Real-time: Firestore listeners
- ✅ State management: React Context + SWR
- ✅ Rendering strategy per page defined

**Next Steps:**
1. ✅ Design approval (V0-USER-APP-ONLY.md)
2. ⏳ Development kickoff (Week 1)
3. ⏳ Setup: Next.js + Firebase + shadcn/ui
4. ⏳ Implementation: Phase 1 (Dashboard + Chat)

**Contact:** [Product Owner Name]
