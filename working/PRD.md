# Product Requirements Document (PRD)
## NOUS - AI Agent Multi-Domain Management System

**Version:** 1.0  
**Last Updated:** December 19, 2024  
**Focus Domain:** Financial (Reference Implementation)

---

## 1. Executive Summary

NOUS is a hierarchical AI agent management system that organizes user data across **12 Life Domains**. Each domain contains **Subdomains** (specific focus areas), which contain **Agents** (AI workers that collect, process, and analyze data). The system provides a visual dashboard for monitoring agent outputs, configuring displays, and interacting conversationally with data.

The **Financial domain** serves as the reference implementation, demonstrating the complete architecture and interaction patterns that should be replicated across all other domains.

---

## 2. System Architecture

### 2.1 Hierarchy Structure

\`\`\`
Life Domains (12 total)
└── Domain (e.g., Financial)
    └── Subdomain (e.g., Cash Flow, Investments)
        └── Agents (e.g., cashflow-monitor, bank-sync)
            └── Data Collection + Storage
\`\`\`

### 2.2 Core Components

#### 2.2.1 Life Domains Page (`/domains`)
- **Purpose:** Entry point showing all 12 life domains
- **Components:**
  - Grid of domain cards (3 columns, responsive)
  - Each card shows: Icon, Name, Description, Subdomain count
  - Hover effect with subtle border highlight
  - Click navigates to `/domains/templates?domain={id}`

#### 2.2.2 Templates & My Domains Page (`/domains/templates`)
- **Purpose:** Choose pre-configured templates OR view existing subdomains
- **Structure:**
  - **Header:** "Back to Domains" button + Title + "Start From Scratch" button (only visible in Templates tab)
  - **Tabs:** Templates | My Domains
  
- **Templates Tab:**
  - Pre-configured templates grouped by use case
  - Each template shows:
    - Title + Popular badge (if applicable)
    - Description + Agent count
    - Preview cards with actual data structure
    - Action buttons: "Ver" (preview) + "Use This Template"
  - Card layout rules:
    - 2 cards side-by-side: show in 2-column grid
    - 1 card: show full width
    - Consistent spacing and shadows

- **My Domains Tab:**
  - Renders the complete Financial Domain Page
  - Shows all created subdomains with customizable cards
  - Pass `hideBackButton={true}` prop to avoid duplicate navigation

#### 2.2.3 Domain Page (`/domains/financial`)
- **Purpose:** Dashboard of all subdomains within a domain
- **Header:**
  - Back button → `/domains`
  - Domain icon + title + description
  - "Add Subdomain" button
  - "Configure" button

- **Subdomain Cards:**
  - Grid layout (2 columns, responsive)
  - Each card displays:
    - Icon + Title
    - Dynamic variables (configured via drag-drop)
    - Active agent badges
    - Edit button (opens customization dialog)
    - "View Details" button → navigates to subdomain page
  
- **Card Customization Dialog:**
  - **Left Panel:** Available variables + Style editor
  - **Right Panel:** 2-column grid preview
  - **Features:**
    - Drag variables from available list to grid
    - Click variable in grid to edit styling
    - Configure: font size, weight, color, display type
    - Remove variables from grid (X button)
    - Save configuration updates card rendering

#### 2.2.4 Subdomain Page (`/domains/financial/cashflow`)
- **Purpose:** Detailed view of a subdomain with agent outputs
- **Header:**
  - Back button → parent domain
  - Subdomain icon + title + description
  - "Configure" button

- **Tabs:**
  1. **Overview:** Shows raw data outputs from all agents
     - No custom formatting
     - Displays JSON-like structure
     - Automatic updates as agents collect data
     - Informational note explaining automation
  
  2. **Agents:** List of active agents
     - Agent cards with status, description, stats
     - "Add Agent" button → Agent Marketplace
     - "View Details" button → Agent detail page
     - Configure/Pause actions
  
  3. **Logs:** Activity log from all agents
     - Filter by agent dropdown
     - Chronological list with timestamps
     - Color-coded by agent
  
  4. **Tasks:** Scheduled and running tasks
     - Filter by agent
     - Shows status, frequency, last/next run
  
  5. **Context:** Data sources and configuration
     - Connected accounts
     - Budget configuration
     - Data source details
  
  6. **Chat:** Conversational interface
     - Chat with subdomain AI
     - Quick question suggestions
     - Natural language queries

#### 2.2.5 Agent Detail Page (`/domains/financial/cashflow/agents/[agentId]`)
- **Purpose:** Configure agent behavior and view storage details
- **Header:**
  - Back button → subdomain
  - Agent icon + name + description
  - Status badge + version

- **Quick Stats:** 4-card grid showing status, active since, data points, storage size

- **Tabs:**
  1. **Storage & Context:**
     - Database type and connection info
     - List of database tables
     - Record counts and date ranges
     - Storage size
     - Data retention explanation
  
  2. **Settings:**
     - Update frequency
     - Alert thresholds
     - Comparison toggles
     - Danger zone (pause/delete agent)

---

## 3. Key Functional Requirements

### 3.1 Card Customization System

**Requirement:** Users must be able to customize how data appears in subdomain cards without writing code.

**Implementation:**
- **Drag-and-Drop Interface:** Variables can be dragged from "Available Variables" list into a 2-column grid
- **Visual Editing:** Click any variable in preview to edit its styling
- **Layout Control:** Variables arranged in grid (row/column positioning)
- **Style Options:**
  - Font size: xs, sm, base, lg, xl, 2xl
  - Font weight: normal, medium, semibold, bold
  - Color: default, green, red, blue, amber
  - Display type: text, number, badge, progress, percentage
- **Persistence:** Configuration saves to state and re-renders card
- **Grid Rules:**
  - 2 columns maximum per row
  - Variables can span full width or half width
  - Automatic layout calculation based on enabled variables

### 3.2 Agent Marketplace

**Requirement:** Users can discover and install new agents from a marketplace.

**Flow:**
1. Click "Add Agent" in Agents tab
2. **Search Step:** Enter natural language query or click suggestion
3. **Results Step:** Browse matching agents with ratings, installs, tags
4. **Configure Step:** Select required and optional MCPs (integrations)
5. **Install:** Agent added to subdomain and starts collecting data

**Agent Card Structure:**
- Name + description
- Star rating + install count
- Tags for categorization
- Required MCP connections
- Preview of data it collects

### 3.3 Dynamic Overview Tab

**Requirement:** Overview tab must show raw agent outputs automatically without manual configuration.

**Behavior:**
- Iterates through all active agents
- Displays each agent's collected data in structured format
- Shows data type, values, and last updated timestamp
- No formatting or customization needed
- Real-time updates as agents process data
- Link to agent detail pages for advanced configuration

### 3.4 Template System

**Requirement:** New users should be able to start quickly with pre-configured templates.

**Template Structure:**
- Name + description
- List of included subdomains
- List of pre-configured agents
- Preview cards showing expected data structure
- One-click installation
- "Ver" button to preview before installing

**Template Types:**
- Personal Finance Manager (2 subdomains)
- Investment Portfolio Tracker (1 subdomain)
- Debt Management System (1 subdomain)

---

## 4. Data Model

### 4.1 Domain
\`\`\`typescript
interface Domain {
  id: string // e.g., "financial"
  name: string // e.g., "Financial"
  icon: LucideIcon
  description: string
  subdomains: number // count
  color: string // Tailwind class
}
\`\`\`

### 4.2 Subdomain
\`\`\`typescript
interface Subdomain {
  id: string // e.g., "cashflow"
  name: string // e.g., "Cash Flow"
  icon: LucideIcon
  description: string
  agents: Agent[]
  variableConfigs: VariableConfig[]
}
\`\`\`

### 4.3 Agent
\`\`\`typescript
interface Agent {
  id: string // e.g., "cashflow-monitor"
  name: string // e.g., "@financial/cashflow-monitor"
  description: string
  status: "active" | "paused" | "error"
  activeSince: string
  version: string
  color: string
  bgColor: string
  collectedData: DataPoint[]
  storage: StorageConfig
  settings: AgentSettings
}
\`\`\`

### 4.4 Variable Configuration
\`\`\`typescript
interface VariableConfig {
  id: string
  name: string
  enabled: boolean // shown in card or not
  agent: string // which agent provides this data
  fontSize: string
  fontWeight: string
  color: string
  displayType: "text" | "number" | "badge" | "progress" | "percentage"
  layoutPosition: { row: number, col: number }
}
\`\`\`

### 4.5 Data Point
\`\`\`typescript
interface DataPoint {
  key: string
  label: string
  value: string
  type: "currency" | "percentage" | "number" | "text"
  lastUpdated: string
  source: string
  showInOverview: boolean
}
\`\`\`

---

## 5. User Interaction Patterns

### 5.1 Navigation Flow

\`\`\`
Domains Page
  ↓ (click domain)
Templates Page (Templates tab)
  ↓ (select template OR "Start From Scratch")
Domain Page (shows subdomains)
  ↓ (click subdomain card)
Subdomain Page (tabs: Overview, Agents, Logs, Tasks, Context, Chat)
  ↓ (click agent in Agents tab)
Agent Detail Page (tabs: Storage & Context, Settings)
\`\`\`

### 5.2 Card Editing Flow

\`\`\`
Domain Page
  ↓ (click edit/pencil icon on card)
Card Customization Dialog Opens
  ↓ (drag variables, edit styles)
Preview Updates in Real-Time
  ↓ (click "Save Configuration")
Dialog Closes + Card Re-renders with New Layout
\`\`\`

### 5.3 Agent Installation Flow

\`\`\`
Subdomain Page → Agents Tab
  ↓ (click "Add Agent")
Marketplace Dialog: Search Step
  ↓ (enter query)
Marketplace Dialog: Results Step
  ↓ (click agent card)
Marketplace Dialog: Configure Step
  ↓ (select MCPs)
Click "Install Agent"
  ↓
Agent Added to Subdomain + Starts Collecting Data
\`\`\`

---

## 6. UI/UX Guidelines

### 6.1 Consistent Card Design
- **Border:** `border` with hover effect `hover:border-primary/50`
- **Shadow:** `shadow-sm` default, `hover:shadow-md` on hover
- **Padding:** `p-4` for CardContent, `p-6` for CardHeader
- **Spacing:** `space-y-4` for vertical stacks
- **Icons:** Wrapped in colored background circle (e.g., `bg-green-100 text-green-600`)

### 6.2 Button Hierarchy
- **Primary action:** Solid button (`<Button>`)
- **Secondary action:** Outline button (`<Button variant="outline">`)
- **Destructive action:** Red button (`<Button variant="destructive">`)
- **Ghost action:** Ghost button for less emphasis (`<Button variant="ghost">`)

### 6.3 Agent Representation
- **Icon:** Bot icon with agent-specific color
- **Name:** Full namespace (e.g., `@financial/cashflow-monitor`)
- **Badge:** Status badge (active, paused, error)
- **Color coding:** Each agent has unique color for logs/tasks

### 6.4 Tab Navigation
- Use shadcn Tabs component
- Always show all tabs, no hidden/dynamic tabs
- Active tab highlighted with underline
- Tab count in parentheses where applicable

---

## 7. Technical Implementation Notes

### 7.1 State Management
- **Card Configuration:** Stored in component state, persisted to backend on save
- **Drag State:** `draggedItem` tracks currently dragged variable
- **Card Key:** Increment `cardKey` to force re-render after config change

### 7.2 Drag and Drop Logic
\`\`\`typescript
// When dropping variable into grid cell
handleDrop(targetRow, targetCol) {
  // If cell empty: move variable there
  // If cell occupied: swap positions
  // Update layoutPosition for affected variables
}
\`\`\`

### 7.3 Dynamic Rendering
\`\`\`typescript
// Cards render based on variableConfigs array
const enabledVars = variableConfigs.filter(v => v.enabled)
// Create grid structure from layoutPositions
// Render variables in correct rows/columns
\`\`\`

### 7.4 Agent Output Display
\`\`\`typescript
// Overview tab iterates agents and displays raw data
{Object.entries(agentOutputs).map(([agentId, output]) => (
  <Card>
    <pre>{JSON.stringify(output.data, null, 2)}</pre>
  </Card>
))}
\`\`\`

---

## 8. Extensibility & Replication

### 8.1 Creating New Domains

To create a new domain (e.g., "Health & Wellness"):

1. **Add to domains array** in `/domains/page.tsx`
2. **Create templates page** at `/domains/templates/page.tsx` with health-specific templates
3. **Create domain page** at `/domains/health/page.tsx` (copy financial structure)
4. **Create subdomain pages** for each health subdomain
5. **Define agents** specific to health tracking
6. **Configure data models** for health metrics

### 8.2 Key Abstraction Points

**Domain-agnostic components:**
- Card customization dialog
- Agent marketplace
- Tab structure (Overview, Agents, Logs, Tasks, Context, Chat)
- Drag-and-drop grid system

**Domain-specific customization:**
- Agent definitions (name, data collected, storage)
- Variable types and display formats
- Template configurations
- MCP connections

---

## 9. Future Enhancements

### 9.1 Conversational AI Integration
- **Global AI Assistant:** Chat interface accessible from anywhere
- **Context-aware queries:** "Show my cash flow" auto-navigates and displays
- **Auto-configuration:** AI suggests card layouts based on data
- **Proactive insights:** Agents send notifications with analysis

### 9.2 Agent Automation
- **Inter-agent communication:** Cashflow triggers Budget alerts
- **Conditional workflows:** "If X then Y" logic
- **Smart suggestions:** AI recommends new agents based on usage

### 9.3 Voice Interface
- Voice commands to query data
- Hands-free navigation
- Audio alerts from agents

### 9.4 Mobile App
- Native iOS/Android apps
- Push notifications from agents
- Offline data access

---

## 10. Success Metrics

### 10.1 Usability
- Time to first subdomain creation: < 2 minutes
- Card customization completion rate: > 80%
- Agent marketplace discovery: > 60% users install 1+ agent

### 10.2 Engagement
- Daily active users checking agent outputs
- Average number of agents per subdomain: 3-5
- Chat interactions per session: > 2

### 10.3 Data Quality
- Agent uptime: > 99%
- Data freshness: < 6 hours lag
- Agent accuracy: > 90% (for categorization/prediction agents)

---

## Appendix A: Financial Domain Reference

This section documents the complete Financial domain implementation as the canonical reference.

### Subdomains
1. **Cash Flow** - Income/expense tracking
2. **Investments** - Portfolio management
3. **Budget & Planning** - Savings goals
4. **Debt & Credit** - Debt tracking, credit score
5. **Taxes** - Tax filing, refunds
6. **Insurance** - Policy tracking

### Agents (Cash Flow Example)
1. **cashflow-monitor** - Real-time balance tracking
2. **cashflow-predictor** - AI forecasting
3. **bank-sync** - Transaction import
4. **transaction-categorizer** - AI categorization

### Variable Examples
- Current Balance (currency, large number display)
- Income/Expenses (currency, colored text)
- Budget Usage (percentage, progress bar)
- Savings Rate (percentage, text)

---

**End of PRD**
