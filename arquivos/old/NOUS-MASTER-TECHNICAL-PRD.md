# NOUS OS: Master Technical Product Requirements Document

**Version:** 4.0 (Definitive - Unified)
**Date:** November 2025
**Status:** APPROVED FOR ENGINEERING
**Sources:** `PRD.md`, `PRD-USER-APP.md`, `TECH-STACK-PRAGMATICA.md`

---

## 1. Executive Summary & Vision

**NOUS OS** is a distributed **Operating System for AI Agents**. It organizes a user's digital life through specialized "Processes" (Agents) and a unified "Memory" (Context).

### 1.1 Core Philosophy
*   **Foundation First:** We build a generic Kernel and VFS *before* building specific features.
*   **Universal Schemas:** Data structures (`Context`, `Agent`) are agnostic to the domain.
*   **Agentic Architecture:** Logic resides in Agents, not in the backend API.
*   **Visual OS:** The UI is a projection of the system state, rendered dynamically via a "Card Engine".

---

## 2. System Architecture

### 2.1 High-Level Components
1.  **The Kernel (Backend):** Firebase Functions + LangGraph acting as the central orchestrator.
2.  **The VFS (Virtual File System):** Unified abstraction (`fs.read`, `fs.write`) over Firestore, Storage, and Vector DB.
3.  **The User Space (LENS):** A Next.js 14 Hybrid App (SSG/SSR/CSR) serving as the interface.
4.  **The Drivers (Skills):** Stateless tools (OCR, Banking API) exposed via MCP.

### 2.2 Technology Stack (Pragmatic)
*   **Frontend:** Next.js 14 (App Router), TailwindCSS, ShadCN UI, Zustand.
*   **Backend:** Firebase (Functions, Firestore, Auth, Storage).
*   **Orchestration:** LangGraph (Stateful Workflows) + Flowise (Future No-Code).
*   **AI:** Claude 3.5 Sonnet (Primary), OpenAI GPT-4o (Fallback).
*   **Runtimes:**
    *   **Markdown Agents:** Pure Prompt + YAML (80% of cases).
    *   **Python Agents:** Cloud Run Containers (20% of cases).

---

## 3. Module 0: The Foundation (Core OS)

### 3.1 Universal Data Schemas (`packages/shared`)

#### **A. Domain Registry**
```typescript
// system/domains/{domainId}
export const DomainManifestSchema = z.object({
  id: z.string(),          // "health"
  name: z.string(),
  icon: z.string(),
  theme: z.object({ primary: z.string(), bg: z.string() }),
  subdomains: z.array(z.object({
    id: z.string(),
    name: z.string(),
    layout: z.enum(['grid', 'list', 'feed'])
  }))
});
```

#### **B. Agent Registry**
```typescript
// system/agents/{agentId}
export const AgentManifestSchema = z.object({
  id: z.string(),          // "@health/physician"
  type: z.enum(['markdown', 'python']), // CRITICAL DISTINCTION
  version: z.string(),
  config: z.object({
    model: z.string().default('claude-3-5-sonnet'),
    temperature: z.number(),
    permissions: z.object({
      read: z.array(z.string()),
      write: z.array(z.string())
    })
  }),
  // For Markdown Agents:
  systemPrompt: z.string().optional(),
  // For Python Agents:
  implementation: z.object({
    cloudRunUrl: z.string()
  }).optional()
});
```

#### **C. Universal Context (The VFS Block)**
```typescript
// users/{uid}/context/{domain}/{docId}
export const ContextBlockSchema = z.object({
  id: z.string(),
  schemaId: z.string(),
  timestamp: z.number(),
  data: z.record(z.any()),
  metadata: z.object({
    source: z.string(),
    confidence: z.number().optional()
  })
});
```

### 3.2 Kernel Specifications (`apps/kernel`)

#### **A. The Dispatcher API**
*   **Endpoint:** `POST /api/kernel/dispatch`
*   **Logic Flow:**
    1.  **Auth:** Verify Firebase Token.
    2.  **Load Manifest:** Fetch `system/agents/{agentId}`.
    3.  **Permission Check:** Validate `agent.permissions` against request.
    4.  **Runtime Switch:**
        *   **Case Markdown:** Load `systemPrompt`, inject Context, call LLM directly.
        *   **Case Python:** Proxy request to `agent.implementation.cloudRunUrl`.
    5.  **Log:** Write to `users/{uid}/logs`.

#### **B. The Virtual File System (VFS)**
*   **Interface:** `write(path, data)`, `read(path)`, `query(domain, filters)`.
*   **Storage Strategy:**
    *   `vault/*` -> Google Cloud Storage (Files).
    *   `context/*` -> Firestore (Structured Data).
    *   **Vector Sync:** Firestore Triggers automatically embed `context/*` writes to Pinecone.

---

## 4. Frontend Specifications (LENS)

### 4.1 Hybrid Rendering Strategy
We use Next.js 14 App Router to optimize for Performance and SEO.

| Page | Route | Strategy | Reason |
| :--- | :--- | :--- | :--- |
| **Landing** | `/` | **SSG** | SEO, Fast Load |
| **Dashboard** | `/dashboard` | **CSR** | Real-time Firestore Listeners |
| **Logs** | `/logs` | **SSR + ISR** | SEO-friendly, Cached |
| **Agents** | `/agents` | **SSR -> CSR** | Fast Initial Load + Interactive |
| **Working** | `/working` | **CSR** | Real-time Progress Bars |

### 4.2 Core Pages & Components

#### **A. Dashboard (`/dashboard`)**
*   **Type:** CSR (`use client`).
*   **Components:**
    *   **Greeting:** Personalized based on time.
    *   **Active Tasks:** Real-time list of running workflows (from `users/{uid}/working`).
    *   **Recent Activity:** Last 5 logs (from `users/{uid}/logs`).
    *   **My Agents:** Grid of active agents.

#### **B. Domain Page (`/domains/[id]`)**
*   **Type:** CSR.
*   **Components:**
    *   **Universal Card Grid:** Renders `ContextBlock` data using `CardConfig`.
    *   **Edit Mode:** Allows Drag-and-Drop of variables.

#### **C. Card Customization System**
*   **Requirement:** Users must customize cards without code.
*   **Implementation:**
    *   **Drag-and-Drop:** React DnD. Move variables from "Available" to "Grid".
    *   **Style Editor:** Click variable to set `fontSize`, `color`, `displayType` (Badge, Text, Chart).
    *   **Persistence:** Save `CardConfig` to `users/{uid}/settings/cards`.

---

## 5. Module 1: The Health Vertical (Implementation)

### 5.1 Data Layer
*   **Schema:** `HealthExam` (Provider, Date, Metrics[]).

### 5.2 Logic Layer (Agents)

#### **A. OCR Driver (`@skills/ocr`)**
*   **Type:** Python Function (Google Vision API).
*   **Input:** GCS Path.
*   **Output:** Markdown.

#### **B. Librarian Agent (`@core/librarian`)**
*   **Type:** **Markdown Agent**.
*   **Prompt:** "Extract JSON matching `HealthExamSchema` from OCR text..."
*   **Config:** `model: "claude-3-5-sonnet"`.

#### **C. Physician Agent (`@health/physician`)**
*   **Type:** **Python Agent** (Complex Logic).
*   **Runtime:** Cloud Run.
*   **Logic:**
    1.  Fetch History (VFS).
    2.  Analyze Trends (Pandas/LLM).
    3.  Generate Report.

---

## 6. Module 2: The Finance Vertical (Validation)

### 6.1 Data Layer
*   **Schema:** `Transaction` (Amount, Merchant, Category).

### 6.2 Logic Layer
*   **Driver:** `@skills/banking` (Plaid).
*   **Agent:** `@finance/categorizer` (**Markdown Agent**).
    *   **Prompt:** "Categorize this transaction based on merchant name..."

---

## 7. Engineering Standards

### 7.1 Security Rules (`firestore.rules`)
*   **User Space:** `users/{uid}` is private (Owner Read/Write).
*   **System Space:** `system/agents` is Public Read-Only.

### 7.2 CI/CD
*   **Monorepo:** TurboRepo.
*   **Deploy:** GitHub Actions -> Firebase Hosting (Web) + Functions (Kernel).
