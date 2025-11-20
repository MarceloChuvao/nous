# NOUS OS: Master Activity Backlog

**Status:** READY FOR EXECUTION
**Purpose:** A granular, atomic list of every engineering task required to build NOUS OS.
**Reference:** `NOUS-ENGINEERING-BLUEPRINT.md`

---

## 🏗️ Phase 0: The Foundation (Infrastructure & Core)

### 0.1 Repository & Environment Setup
- [ ] **0.1.1** Initialize Monorepo (TurboRepo/Nx)
- [ ] **0.1.2** Configure Root `package.json` (Workspaces)
- [ ] **0.1.3** Configure Root `tsconfig.json` (Base Typescript Config)
- [ ] **0.1.4** Configure ESLint & Prettier (Shared Config)
- [ ] **0.1.5** Initialize `packages/shared` workspace
- [ ] **0.1.6** Initialize `apps/kernel` workspace (Firebase Functions)
- [ ] **0.1.7** Initialize `apps/web` workspace (Next.js 14)
- [ ] **0.1.8** Setup Firebase Project (Enable Firestore, Auth, Storage, Functions)

### 0.2 Shared Library (`packages/shared`)
- [ ] **0.2.1** Install `zod` dependency
- [ ] **0.2.2** Create `src/schemas/domain.ts`
    - [ ] Define `DomainManifestSchema`
    - [ ] Export `DomainManifest` Type
- [ ] **0.2.3** Create `src/schemas/agent.ts`
    - [ ] Define `AgentManifestSchema`
    - [ ] Export `AgentManifest` Type
- [ ] **0.2.4** Create `src/schemas/context.ts`
    - [ ] Define `ContextBlockSchema`
    - [ ] Export `ContextBlock` Type
- [ ] **0.2.5** Create `src/schemas/logs.ts`
    - [ ] Define `LogEntrySchema`
- [ ] **0.2.6** Configure build script (tsup/tsc)

### 0.3 Database Layer (Firestore)
- [ ] **0.3.1** Create `firestore.rules` file
- [ ] **0.3.2** Implement Rule: Read-only access for `system/domains`
- [ ] **0.3.3** Implement Rule: Read-only access for `system/agents`
- [ ] **0.3.4** Implement Rule: Owner-only access for `users/{uid}`
- [ ] **0.3.5** Create `firestore.indexes.json`
- [ ] **0.3.6** Define Index: `users/{uid}/context` (Collection Group)

### 0.4 Kernel Service (`apps/kernel`)
- [ ] **0.4.1** Install `firebase-admin`, `firebase-functions`, `zod`
- [ ] **0.4.2** Configure `src/config.ts` (Firebase Admin Init)
- [ ] **0.4.3** Create `src/middleware/auth.ts` (Verify Auth Token)
- [ ] **0.4.4** Create `src/middleware/permissions.ts`
    - [ ] Implement `checkPermission(agent, resource)` logic
- [ ] **0.4.5** Create `src/vfs/adapter.ts`
    - [ ] Implement `FirestoreAdapter.write()`
    - [ ] Implement `StorageAdapter.write()`
- [ ] **0.4.6** Create `src/vfs/index.ts` (Main VFS Class)
    - [ ] Implement `vfs.write(path, data)` routing logic
- [ ] **0.4.7** Create `src/api/dispatcher.ts`
    - [ ] Define `onCall` handler
    - [ ] Implement Agent Manifest loading
    - [ ] Implement Permission Validation
    - [ ] Implement Agent Runtime invocation
- [ ] **0.4.8** Create `src/index.ts` (Export functions)

### 0.5 Frontend Core (`apps/web`)
- [ ] **0.5.1** Install `firebase`, `zustand`, `lucide-react`
- [ ] **0.5.2** Configure `lib/firebase.ts` (Client Init)
- [ ] **0.5.3** Create `lib/store/useKernel.ts`
    - [ ] Implement `dispatch` action (Callable Function)
- [ ] **0.5.4** Create `components/card-engine/types.ts` (CardConfig)
- [ ] **0.5.5** Create `components/card-engine/parts/Badge.tsx`
- [ ] **0.5.6** Create `components/card-engine/parts/MiniChart.tsx`
- [ ] **0.5.7** Create `components/card-engine/UniversalCard.tsx`
    - [ ] Implement Prop Interface
    - [ ] Implement Variable Resolution Logic (`lodash.get`)
    - [ ] Implement Rendering Switch
- [ ] **0.5.8** Create `app/dashboard/page.tsx` (Grid Layout)

---

## 🏥 Phase 1: Health Vertical Implementation

### 1.1 Health Data Layer
- [ ] **1.1.1** Update `packages/shared/src/schemas/index.ts`
- [ ] **1.1.2** Create `src/schemas/health.ts`
    - [ ] Define `HealthExamSchema` (Zod)
    - [ ] Export `HealthExam` Type
- [ ] **1.1.3** Create `system/domains/health.json` (Manifest)
- [ ] **1.1.4** Create `system/agents/health-physician.json` (Manifest)

### 1.2 Ingestion & Drivers (`apps/kernel`)
- [ ] **1.2.1** Create `src/triggers/onFileUpload.ts`
    - [ ] Detect `vault/health/raw` uploads
    - [ ] Trigger `ingest.file` event
- [ ] **1.2.2** Create `src/drivers/ocr.ts`
    - [ ] Install `@google-cloud/vision`
    - [ ] Implement `extractText(gcsPath)` function

### 1.3 Agent Logic (`apps/kernel/src/agents`)
- [ ] **1.3.1** Create `core/librarian.ts`
    - [ ] Define System Prompt ("Extract JSON...")
    - [ ] Implement LLM Call (OpenAI/Gemini)
    - [ ] Implement Schema Validation (`HealthExamSchema.parse`)
    - [ ] Implement VFS Write (`context/health/exams`)
- [ ] **1.3.2** Create `health/physician.ts`
    - [ ] Define System Prompt ("Analyze Trends...")
    - [ ] Implement Context Retrieval (Fetch previous exams)
    - [ ] Implement Analysis Generation
    - [ ] Implement VFS Write (`context/health/analysis`)

### 1.4 Frontend Integration (`apps/web`)
- [ ] **1.4.1** Create `components/upload/HealthUploader.tsx`
    - [ ] Implement Drag & Drop
    - [ ] Implement Upload to `vault/health/raw`
- [ ] **1.4.2** Create `config/cards/health-latest.json`
    - [ ] Define Layout Config (Badge for Cholesterol)
- [ ] **1.4.3** Update `app/dashboard/page.tsx` to load Health Cards

---

## 💰 Phase 2: Finance Vertical Implementation

### 2.1 Finance Data Layer
- [ ] **2.1.1** Create `packages/shared/src/schemas/finance.ts`
    - [ ] Define `TransactionSchema`
- [ ] **2.1.2** Create `system/domains/finance.json`

### 2.2 Drivers & Agents
- [ ] **2.2.1** Create `src/drivers/banking.ts` (Mock/Plaid)
- [ ] **2.2.2** Create `finance/categorizer.ts`
    - [ ] Implement Classification Logic

### 2.3 Frontend Integration
- [ ] **2.3.1** Create `config/cards/finance-spend.json`
    - [ ] Define Layout Config (Chart for Balance)

---

## 🚀 Phase 3: Platform Logic

### 3.1 Marketplace
- [ ] **3.1.1** Create `src/api/installAgent.ts`
    - [ ] Implement Manifest Copy Logic
    - [ ] Implement Permission Grant Logic
- [ ] **3.1.2** Create `app/marketplace/page.tsx`
    - [ ] List Agents from `system/agents`
    - [ ] Implement "Install" Button
