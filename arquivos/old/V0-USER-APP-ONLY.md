# NOUS OS - Protótipo User App (v0)

> **Foco:** Apenas telas do usuário final que USA o NOUS
> **Escopo:** Dashboard, Logs, Context, Working, Chat
> **NÃO inclui:** Creator tools, no-code builder, marketplace de criação

---

## 📱 Telas (Somente User App)

### 1. Dashboard (Home)
### 2. Chat with NOUS
### 3. My Agents (instalados)
### 4. Logs & History
### 5. Working Tasks
### 6. Context (meus dados)
### 7. Settings

---

## 1️⃣ Dashboard (Home) - `/dashboard`

**O que mostra:**
- Resumo do dia
- Tasks ativas
- Logs recentes
- Quick chat
- Agents instalados

```
┌────────────────────────────────────────────────────────────┐
│  NOUS                    [Notifications] [User Menu ▼]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Good morning, Alex 👋                                     │
│  Here's what's happening today                             │
│                                                            │
│  ┌──────────────────────────────────────────────┐         │
│  │ 🎯 Active Tasks (2)                          │         │
│  ├──────────────────────────────────────────────┤         │
│  │ 🎫 Buy Ticket to São Paulo                   │         │
│  │    Day 3 of 15 • R$ 480 found ✅             │         │
│  │    [View Details →]                          │         │
│  │                                              │         │
│  │ 📞 Cancel Internet (Claro)                   │         │
│  │    Call in progress (12 min)                 │         │
│  │    [Ask Info] [View Call →]                  │         │
│  └──────────────────────────────────────────────┘         │
│                                                            │
│  ┌──────────────────────────────────────────────┐         │
│  │ 📋 Recent Activity (last 24h)                │         │
│  ├──────────────────────────────────────────────┤         │
│  │ 🩺 Health check completed                    │         │
│  │    2 hours ago                               │         │
│  │                                              │         │
│  │ 💰 Budget alert triggered                    │         │
│  │    5 hours ago                               │         │
│  │                                              │         │
│  │ 🔔 Weekly review sent                        │         │
│  │    Yesterday at 9:00                         │         │
│  │                                              │         │
│  │ [View All Logs →]                            │         │
│  └──────────────────────────────────────────────┘         │
│                                                            │
│  ┌──────────────────────────────────────────────┐         │
│  │ 🤖 My Agents (4 active)                      │         │
│  ├──────────────────────────────────────────────┤         │
│  │ [🩺 Physician] [💰 Finance] [🏋️ Fitness]    │         │
│  │ [📊 Planner]                                 │         │
│  │                                              │         │
│  │ [Manage Agents →]                            │         │
│  └──────────────────────────────────────────────┘         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Prompt para v0 - Dashboard:

```
Create a clean dashboard for a personal AI operating system called NOUS.

Layout:
- Top header: "NOUS" logo on left, notifications bell icon, user menu dropdown on right
- Greeting section: "Good morning, [Name] 👋" with subtitle
- Three main cards vertically stacked:

Card 1: "Active Tasks (2)"
- Title with emoji 🎯
- Two task items, each showing:
  - Emoji + task name
  - Progress/status line (subtle text)
  - [View Details →] link
- Use Card component with subtle shadow

Card 2: "Recent Activity (last 24h)"
- Title with emoji 📋
- List of 3-4 activity items:
  - Each item: emoji + description + timestamp
  - Timestamp in gray, small text
- [View All Logs →] link at bottom

Card 3: "My Agents (4 active)"
- Title with emoji 🤖
- Horizontal row of agent pills/badges:
  - [🩺 Physician] [💰 Finance] [🏋️ Fitness] [📊 Planner]
- [Manage Agents →] link

Style:
- Clean, minimal, lots of white space
- Use shadcn/ui Card, Badge components
- Font: Inter
- Accent color: blue (#3b82f6)
- Cards have subtle border and shadow
- Links in blue with arrow icon (lucide-react)

Responsive: Stack cards vertically on mobile
```

---

## 2️⃣ Chat Interface - `/chat`

**O que mostra:**
- Conversa com NOUS
- Histórico de mensagens
- Input de texto
- Sugestões rápidas

```
┌────────────────────────────────────────────────────────────┐
│  ← Back                Chat with NOUS                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Previous messages scrollable area]                       │
│                                                            │
│  ┌──────────────────────────────────────┐                 │
│  │ You: Analyze my last bloodwork       │                 │
│  │ 2 hours ago                          │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  ┌──────────────────────────────────────┐                 │
│  │ NOUS:                                │                 │
│  │ I've analyzed your bloodwork from    │                 │
│  │ Dec 15. Overall looking good! ✅     │                 │
│  │                                      │                 │
│  │ Key findings:                        │                 │
│  │ • Cholesterol: 185 mg/dL (normal)    │                 │
│  │ • Glucose: 92 mg/dL (normal)         │                 │
│  │                                      │                 │
│  │ All values within healthy range.     │                 │
│  │ 2 hours ago                          │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Quick actions:                                            │
│  [📊 Show my context] [🩺 Health summary] [💰 Finances]  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Type your message...                          [Send ↑]   │
└────────────────────────────────────────────────────────────┘
```

### Prompt para v0 - Chat:

```
Create a chat interface for NOUS OS (AI assistant).

Layout:
- Header: Back button, "Chat with NOUS" title
- Main area: Scrollable message list
  - User messages: Right-aligned, blue background
  - NOUS messages: Left-aligned, gray background
  - Each message shows timestamp below in small gray text
- Quick action buttons row above input:
  - Badge-style buttons with emoji + text
  - Examples: [📊 Show my context] [🩺 Health summary] [💰 Finances]
- Bottom: Fixed input bar
  - Text input (placeholder: "Type your message...")
  - Send button with up arrow icon (lucide-react ArrowUp)

Style:
- Claude-like chat interface
- User messages: bg-blue-500 text-white rounded-lg p-4
- NOUS messages: bg-gray-100 text-gray-900 rounded-lg p-4
- Use shadcn/ui Input, Button, Badge
- Input bar fixed at bottom with border-top
- Message padding: space-y-4

Interactions:
- Messages scroll to bottom automatically
- Input autofocus
- Quick action buttons clickable
```

---

## 3️⃣ My Agents - `/agents`

**O que mostra:**
- Agents que você tem instalados
- Status (ativo/pausado)
- Última execução
- Configurações rápidas

```
┌────────────────────────────────────────────────────────────┐
│  My Agents                               [Settings ⚙️]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Active (4)                                                │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 🩺 Health Physician                     │              │
│  ├─────────────────────────────────────────┤              │
│  │ Analyzes medical exams and vitals      │              │
│  │                                         │              │
│  │ Status: ● Active                        │              │
│  │ Last run: 2 hours ago                   │              │
│  │ Executions today: 3                     │              │
│  │                                         │              │
│  │ Permissions: health.* (read)            │              │
│  │                                         │              │
│  │ [⚙️ Configure] [⏸ Pause] [ℹ️ Info]      │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 💰 Finance Advisor                      │              │
│  ├─────────────────────────────────────────┤              │
│  │ Tracks spending and gives advice        │              │
│  │                                         │              │
│  │ Status: ● Active                        │              │
│  │ Last run: 1 day ago                     │              │
│  │ Executions today: 1                     │              │
│  │                                         │              │
│  │ Permissions: finance.* (read/write)     │              │
│  │                                         │              │
│  │ [⚙️ Configure] [⏸ Pause] [ℹ️ Info]      │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
│  Paused (1)                                                │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 🏋️ Fitness Trainer                      │              │
│  │ Status: ⏸ Paused                        │              │
│  │ [▶️ Resume]                              │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Prompt para v0 - My Agents:

```
Create an "My Agents" page showing installed AI agents.

Layout:
- Header: "My Agents" title with settings icon on right
- Two sections: "Active (4)" and "Paused (1)"
- Each agent is a card containing:
  - Large emoji icon + agent name (bold)
  - Short description (1 line, gray text)
  - Status indicator: ● Active (green) or ⏸ Paused (gray)
  - Metadata lines:
    - "Last run: X hours ago"
    - "Executions today: X"
  - "Permissions: domain.* (read/write)" in small text
  - Action buttons row:
    - [⚙️ Configure] [⏸ Pause] [ℹ️ Info] for active
    - [▶️ Resume] for paused

Style:
- Use shadcn/ui Card component
- Status indicator: small circle (•) with color
- Active: text-green-600
- Paused: text-gray-400
- Buttons: variant="outline" size="sm"
- Icons from lucide-react (Settings, Pause, Info, Play)
- Cards have subtle hover effect

Sections:
- Section headers: text-sm font-semibold text-gray-600
- Cards stacked vertically with space-y-4
```

---

## 4️⃣ Logs & History - `/logs`

**O que mostra:**
- Timeline de tudo que aconteceu
- Filtros (por tipo, agent, data)
- Search
- Detalhes expandíveis

```
┌────────────────────────────────────────────────────────────┐
│  Logs & History            [Search...🔍] [Filter ▼]        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Today                                                     │
│  ───────────────────────────────────────────────────       │
│                                                            │
│  ┌──────────────────────────────────────────┐             │
│  │ 🩺 Agent Execution                       │             │
│  │ @health/physician                        │             │
│  ├──────────────────────────────────────────┤             │
│  │ "Analyzed bloodwork results"             │             │
│  │                                          │             │
│  │ 2 hours ago                              │             │
│  │ Duration: 2.3s • Cost: $0.03             │             │
│  │                                          │             │
│  │ [View Details ▼]                         │             │
│  └──────────────────────────────────────────┘             │
│                                                            │
│  ┌──────────────────────────────────────────┐             │
│  │ 🔔 Hook Triggered                        │             │
│  │ Budget threshold warning                 │             │
│  ├──────────────────────────────────────────┤             │
│  │ Condition: spending > R$ 3000            │             │
│  │ Actions executed: 2                      │             │
│  │                                          │             │
│  │ 5 hours ago                              │             │
│  │ Duration: 0.8s                           │             │
│  │                                          │             │
│  │ [View Details ▼]                         │             │
│  └──────────────────────────────────────────┘             │
│                                                            │
│  Yesterday                                                 │
│  ───────────────────────────────────────────────────       │
│                                                            │
│  ┌──────────────────────────────────────────┐             │
│  │ 🎯 Workflow Checkpoint                   │             │
│  │ Ticket monitoring (check #45)            │             │
│  ├──────────────────────────────────────────┤             │
│  │ Status: Running                          │             │
│  │ Price checked: R$ 650                    │             │
│  │                                          │             │
│  │ Yesterday at 14:00                       │             │
│  │ Duration: 1.2s                           │             │
│  │                                          │             │
│  │ [View Details ▼]                         │             │
│  └──────────────────────────────────────────┘             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Prompt para v0 - Logs:

```
Create a logs/history page showing timeline of events.

Layout:
- Header: "Logs & History" with search input and filter dropdown on right
- Timeline grouped by date:
  - Section headers: "Today", "Yesterday", "Jan 15", etc.
  - Horizontal line separator after each header
- Log entry cards, each containing:
  - Icon emoji + log type (bold)
  - Agent/workflow name (smaller, gray)
  - Description text (1-2 lines)
  - Metadata line (timestamp + duration + cost if applicable)
  - [View Details ▼] button

Log types and icons:
- 🩺 Agent Execution
- 🔔 Hook Triggered
- 🎯 Workflow Checkpoint
- ⚠️ Error/Warning
- ✅ Success

Style:
- Use shadcn/ui Card component
- Timeline layout: vertical stack
- Date headers: text-sm font-semibold text-gray-500 with border-b
- Entry cards: hover effect, clickable
- Metadata: text-sm text-gray-500
- [View Details] button: variant="ghost" size="sm"
- Icons from lucide-react for search, filter

Interactions:
- Cards expand on click to show full details
- Search filters entries
- Filter dropdown: [All] [Agents] [Hooks] [Workflows] [Errors]
```

---

## 5️⃣ Working Tasks - `/working`

**O que mostra:**
- Tasks ativas de longa duração
- Progress em tempo real
- Ações contextuais
- Logs da task

```
┌────────────────────────────────────────────────────────────┐
│  Active Tasks                             [+ New Task]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 🎫 Buy Ticket to São Paulo       [High] │              │
│  ├─────────────────────────────────────────┤              │
│  │                                         │              │
│  │ Status: Monitoring prices               │              │
│  │ Progress: ████████░░ 66%                │              │
│  │                                         │              │
│  │ ⏰ Started: 3 days ago                  │              │
│  │ 🎯 Goal: Find price < R$ 500           │              │
│  │ 🔍 Checks: 66 of ~360 (every 1 hour)   │              │
│  │                                         │              │
│  │ Latest Updates:                         │              │
│  │ • Best price found: R$ 480 ✅           │              │
│  │ • Last check: 15 minutes ago            │              │
│  │ • Next check: in 45 minutes             │              │
│  │                                         │              │
│  │ [View Full History] [Pause] [Cancel]    │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 📞 Cancel Internet (Claro)       [High] │              │
│  ├─────────────────────────────────────────┤              │
│  │                                         │              │
│  │ Status: Call in progress 🔴             │              │
│  │ Progress: ██████████░ 80%               │              │
│  │                                         │              │
│  │ ⏰ Started: 12 minutes ago              │              │
│  │ 📞 Connected to: 0800-CLARO             │              │
│  │                                         │              │
│  │ 💬 During this call, you can:           │              │
│  │ • Ask me for account info               │              │
│  │ • View call transcript                  │              │
│  │                                         │              │
│  │ [Ask Info] [View Transcript] [End Call]│              │
│  └─────────────────────────────────────────┘              │
│                                                            │
│  Completed (last 7 days)                                   │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ ✅ Schedule doctor appointment          │              │
│  │ Completed 2 days ago                    │              │
│  │ [View Details]                          │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Prompt para v0 - Working Tasks:

```
Create a working tasks page showing active long-running workflows.

Layout:
- Header: "Active Tasks" with [+ New Task] button on right
- Task cards (vertical stack):

Each task card contains:
- Top row: Emoji + task name (left) | Priority badge (right)
  - Priority: [High] red, [Medium] yellow, [Low] gray
- Status line: "Status: Monitoring" with optional status icon
- Progress bar: visual bar with percentage (0-100%)
- Metadata section (icon + text lines):
  - ⏰ Started: X days ago
  - 🎯 Goal: Description
  - 🔍 Progress metric
- "Latest Updates" section:
  - Bullet list of recent events
  - Use checkmarks ✅, warnings ⚠️ as needed
- Action buttons row at bottom:
  - Context-specific buttons
  - Examples: [View History] [Pause] [Cancel] [Ask Info]

Style:
- Use shadcn/ui Card, Badge, Progress components
- Progress bar colors:
  - 0-30%: blue
  - 31-70%: yellow
  - 71-100%: green
- Status icons: 🔴 for in-progress, ⏸ for paused
- Priority badges: variant based on priority
- Action buttons: variant="outline" size="sm"

Sections:
- Active tasks first
- "Completed (last 7 days)" section below
- Completed tasks collapsed/minimized
```

---

## 6️⃣ Context (My Data) - `/context`

**O que mostra:**
- Seus dados pessoais estruturados
- Por domínio (health, finance, etc)
- Edição rápida
- Upload de arquivos

```
┌────────────────────────────────────────────────────────────┐
│  Your Context                             [+ Add Data]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Health] [Finance] [Goals] [Personal] [Work]             │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 🩺 Health                         [Edit]│              │
│  ├─────────────────────────────────────────┤              │
│  │                                         │              │
│  │ Bloodwork (last: Dec 15, 2024)          │              │
│  │ ├─ Cholesterol: 185 mg/dL ✅            │              │
│  │ ├─ Glucose: 92 mg/dL ✅                 │              │
│  │ ├─ HDL: 55 mg/dL ✅                     │              │
│  │ └─ LDL: 110 mg/dL ✅                    │              │
│  │                                         │              │
│  │ Medications (2 active)                  │              │
│  │ ├─ Vitamin D: 2000 IU daily             │              │
│  │ └─ Omega-3: 1000mg daily                │              │
│  │                                         │              │
│  │ Vitals                                  │              │
│  │ ├─ Weight: 75 kg                        │              │
│  │ ├─ Height: 175 cm                       │              │
│  │ ├─ BMI: 24.5 ✅                         │              │
│  │ └─ Blood Pressure: 120/80 ✅            │              │
│  │                                         │              │
│  │ [Upload Exam] [Add Medication]          │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 💰 Finance                        [Edit]│              │
│  ├─────────────────────────────────────────┤              │
│  │                                         │              │
│  │ Account Balance                         │              │
│  │ R$ 12,450.00                            │              │
│  │                                         │              │
│  │ Monthly Summary                         │              │
│  │ ├─ Income: R$ 8,000                     │              │
│  │ ├─ Fixed Expenses: R$ 3,200             │              │
│  │ ├─ Variable: R$ 1,500                   │              │
│  │ └─ Savings: R$ 3,300 (41%)              │              │
│  │                                         │              │
│  │ [Connect Bank] [Add Transaction]        │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Prompt para v0 - Context:

```
Create a personal data context page organized by domains.

Layout:
- Header: "Your Context" with [+ Add Data] button on right
- Horizontal tab navigation:
  - [Health] [Finance] [Goals] [Personal] [Work]
  - Active tab highlighted in blue
- Content area with domain cards:

Each domain card:
- Header: Emoji + domain name | [Edit] button on right
- Content organized in nested sections:
  - Main sections (e.g., "Bloodwork", "Medications")
  - Subsection items with tree-like structure using ├─ └─
  - Values with status indicators (✅ normal, ⚠️ warning)
- Action buttons at bottom:
  - Domain-specific actions (e.g., [Upload Exam] [Add Medication])

Example structure for Health:
- Bloodwork (last: date)
  - Cholesterol: value ✅
  - Glucose: value ✅
- Medications (count)
  - Item 1
  - Item 2
- Vitals
  - Weight, Height, BMI

Style:
- Use shadcn/ui Card, Tabs components
- Tree structure: use text-gray-600 for branch characters (├─ └─)
- Status indicators: ✅ text-green-600, ⚠️ text-yellow-600
- Nested indentation: pl-4 for each level
- [Edit] button: variant="ghost" size="sm" on card header
- Action buttons: variant="outline" at card bottom

Values display:
- Metric name: font-medium
- Value: text-gray-900
- Status icon after value
```

---

## 7️⃣ Settings - `/settings`

**O que mostra:**
- Preferências
- Notificações
- Privacidade
- Billing (se houver)

```
┌────────────────────────────────────────────────────────────┐
│  Settings                                                  │
├────────────────────────────────────────────────────────────┤
│  [Sidebar]              [Content]                          │
│  ┌──────────┐          ┌────────────────────────────┐     │
│  │ Profile  │          │ Profile Settings           │     │
│  │ ────────│          │                            │     │
│  │ ● Notif.│          │ Name: Alex Santos          │     │
│  │   Privacy│          │ Email: alex@example.com    │     │
│  │   Agents │          │                            │     │
│  │   Billing│          │ [Update Profile]           │     │
│  └──────────┘          └────────────────────────────┘     │
│                                                            │
│                        ┌────────────────────────────┐     │
│                        │ Notifications              │     │
│                        │                            │     │
│                        │ □ Email notifications      │     │
│                        │ ✓ Push notifications       │     │
│                        │ ✓ Weekly summaries         │     │
│                        │ □ Agent execution alerts   │     │
│                        │                            │     │
│                        │ [Save Changes]             │     │
│                        └────────────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Prompt para v0 - Settings:

```
Create a settings page with sidebar navigation.

Layout:
- Left sidebar (fixed width ~200px):
  - List of setting sections
  - Sections: Profile, Notifications, Privacy, Agents, Billing
  - Active section has blue background + bold text
- Right content area:
  - Shows settings for selected section
  - Each section is a card with title + content

Example sections:

Profile:
- Name input field
- Email input field
- [Update Profile] button

Notifications:
- Checkbox list:
  - □ Email notifications
  - ✓ Push notifications
  - ✓ Weekly summaries
  - □ Agent execution alerts
- [Save Changes] button

Privacy:
- Toggle switches:
  - Share data with agents: [ON/OFF]
  - Allow agent marketplace: [ON/OFF]
- Description text under each toggle

Style:
- Use shadcn/ui Card, Input, Checkbox, Switch, Button
- Sidebar: bg-gray-50 with border-r
- Active section: bg-blue-50 text-blue-600
- Content cards: standard card styling
- Form inputs: full width within card
- Buttons: primary variant

Layout:
- Two-column layout (sidebar + content)
- Sidebar fixed, content scrollable
- Mobile: sidebar becomes dropdown/tabs
```

---

## 📱 Ordem de Implementação (Prioridade)

### Fase 1 (Essencial):
1. **Dashboard** ⭐⭐⭐ - Página principal
2. **Chat** ⭐⭐⭐ - Interação com NOUS
3. **My Agents** ⭐⭐ - Ver agents instalados

### Fase 2 (Visibilidade):
4. **Logs** ⭐⭐ - Ver histórico
5. **Working** ⭐⭐ - Tasks longas

### Fase 3 (Configuração):
6. **Context** ⭐ - Dados pessoais
7. **Settings** ⭐ - Preferências

---

## 🎨 Design System

### Cores:
```css
Primary: #3b82f6 (blue-500)
Success: #10b981 (green-500)
Warning: #f59e0b (yellow-500)
Danger: #ef4444 (red-500)
Gray: #6b7280 (gray-500)
Background: #ffffff
Card: #f9fafb (gray-50)
```

### Components (shadcn/ui):
- Card
- Button
- Badge
- Input
- Progress
- Tabs
- Checkbox
- Switch
- Accordion (para context)

### Icons (lucide-react):
- ArrowLeft (back)
- ArrowUp (send)
- Settings
- Filter
- Search
- Play/Pause
- Info
- Plus
- Check

---

## 🚀 Como Usar no v0

1. **Copie um prompt** (ex: Dashboard)
2. **Cole no v0.dev**
3. **Gere e ajuste**
4. **Exporte código**
5. **Próxima tela**

---

## 💡 Dicas:

- **Comece pelo Dashboard** - define o estilo visual
- **Use os layouts ASCII** como referência
- **Itere no v0** - gere, veja, ajuste, gere de novo
- **shadcn/ui + Tailwind** - já está nos prompts
- **Mobile-first** - designs são responsivos

---

**Pronto para começar pelo Dashboard! 🚀**
