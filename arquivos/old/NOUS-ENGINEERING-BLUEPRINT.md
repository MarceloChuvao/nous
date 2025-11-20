# NOUS OS: Engineering Blueprint

**Version:** 1.0.0
**Status:** READY FOR DEV
**Target Audience:** Senior Engineers (Backend, Frontend, DevOps)

---

## 1. Project Structure (Monorepo)

We will use TurboRepo or Nx for managing the workspace.

```text
/
├── packages/
│   ├── shared/                 # Shared Types & Schemas
│   │   ├── src/
│   │   │   ├── schemas/        # Zod Schemas (Domain, Agent, Context)
│   │   │   └── types/          # TS Interfaces
│   │   └── package.json
│   └── sdk/                    # Client SDK for Kernel Interaction
├── apps/
│   ├── web/                    # Next.js 14 User App (LENS)
│   │   ├── app/
│   │   ├── components/card-engine/
│   │   └── lib/kernel/
│   └── kernel/                 # Firebase Functions (The OS Core)
│       ├── src/
│       │   ├── api/            # HTTP Triggers (Dispatcher)
│       │   ├── triggers/       # Firestore/Storage Triggers
│       │   ├── vfs/            # Virtual File System Logic
│       │   └── agents/         # Agent Runtimes
│       └── package.json
└── firebase.json
```

---

## 2. Data Layer Specification

### 2.1 Shared Schemas (`packages/shared/src/schemas/core.ts`)

These are the **Universal Truths** of the system.

```typescript
import { z } from 'zod';

// --- Domain Registry ---
export const DomainManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  theme: z.object({
    primary: z.string(),
    bg: z.string()
  }),
  subdomains: z.array(z.object({
    id: z.string(),
    name: z.string(),
    layout: z.enum(['grid', 'list', 'feed'])
  }))
});
export type DomainManifest = z.infer<typeof DomainManifestSchema>;

// --- Agent Registry ---
export const AgentManifestSchema = z.object({
  id: z.string(), // e.g., "@health/physician"
  version: z.string(),
  permissions: z.object({
    read: z.array(z.string()), // ["context.health.*"]
    write: z.array(z.string())
  }),
  configSchema: z.record(z.any()) // JSON Schema for user settings
});
export type AgentManifest = z.infer<typeof AgentManifestSchema>;

// --- Universal Context ---
export const ContextBlockSchema = z.object({
  id: z.string(),
  schemaId: z.string(), // "health-exam-v1"
  timestamp: z.number(),
  data: z.record(z.any()), // Flexible Payload
  metadata: z.object({
    source: z.string(),
    confidence: z.number().optional()
  })
});
export type ContextBlock = z.infer<typeof ContextBlockSchema>;
```

### 2.2 Firestore Security Rules (`firestore.rules`)

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // System Registry: Read-only for auth users
    match /system/domains/{domainId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }

    // User Space: Owner access only
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 3. Kernel Layer Specification (`apps/kernel`)

### 3.1 The Dispatcher (`src/api/dispatcher.ts`)

This is the entry point for all Agent interactions.

```typescript
import * as functions from 'firebase-functions';
import { db } from '../config';
import { AgentManifest } from '@nous/shared';

export const dispatch = functions.https.onCall(async (data, context) => {
  const { agentId, action, payload } = data;
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  // 1. Load Agent Manifest
  const agentSnap = await db.doc(`system/agents/${agentId}`).get();
  if (!agentSnap.exists) throw new Error('Agent not found');
  const agent = agentSnap.data() as AgentManifest;

  // 2. Permission Check (Simplified)
  // In production, check if 'action' targets a path allowed in 'agent.permissions'
  console.log(`[Kernel] Dispatching ${agentId}:${action} for ${uid}`);

  // 3. Route to Runtime (Example: Local execution for MVP)
  // In production, this would call a separate Cloud Run service
  const result = await executeAgent(agent, action, payload, uid);

  // 4. Log Execution
  await db.collection(`users/${uid}/logs`).add({
    agentId, action, timestamp: Date.now(), status: 'success'
  });

  return result;
});
```

### 3.2 The Virtual File System (`src/vfs/index.ts`)

```typescript
export class VFS {
  constructor(private uid: string) {}

  async write(path: string, data: any): Promise<void> {
    if (path.startsWith('context/')) {
      // Write to Firestore
      const docPath = `users/${this.uid}/${path}`;
      await db.doc(docPath).set(data, { merge: true });
      
      // Side Effect: Trigger Vector Embedding (Async)
      await pubsub.topic('vector-embed').publishJSON({ uid: this.uid, path, data });
    } 
    else if (path.startsWith('vault/')) {
      // Write to Storage
      // ... implementation
    }
  }
}
```

---

## 4. Domain Implementation Details

### 4.1 Health Domain (`packages/shared/src/schemas/health.ts`)

```typescript
export const HealthExamSchema = z.object({
  provider: z.string(),
  date: z.string().datetime(),
  type: z.enum(['blood', 'imaging', 'checkup']),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    status: z.enum(['normal', 'high', 'low', 'critical'])
  }))
});
export type HealthExam = z.infer<typeof HealthExamSchema>;
```

### 4.2 The Librarian Agent (`apps/kernel/src/agents/core/librarian.ts`)

**System Prompt:**
```text
You are the Librarian of NOUS OS.
Your goal is to extract structured data from raw text.
You will receive:
1. Raw Text (OCR output)
2. Target Schema Name (e.g., "HealthExam")

Output ONLY valid JSON matching the Target Schema.
If data is missing, use null. Do not hallucinate.
```

---

## 5. Frontend Specification (`apps/web`)

### 5.1 The Universal Card (`components/card-engine/UniversalCard.tsx`)

```typescript
import { CardConfig, ContextBlock } from '@nous/shared';

interface Props {
  config: CardConfig;
  data: ContextBlock;
}

export const UniversalCard: React.FC<Props> = ({ config, data }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Icon name={config.icon} className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">{config.title}</h3>
      </div>
      
      <div className={`grid gap-4 ${config.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {config.variables.map((variable) => {
          const value = resolvePath(data.data, variable.key); // Helper to get "metrics[0].value"
          
          switch (variable.display) {
            case 'badge':
              return <Badge value={value} rules={variable.rules} />;
            case 'currency':
              return <Currency value={value} />;
            case 'chart':
              return <MiniChart data={value} />;
            default:
              return <span className="text-lg font-bold">{value}</span>;
          }
        })}
      </div>
    </div>
  );
};
```

### 5.2 State Management (`lib/store/useKernel.ts`)

```typescript
import { create } from 'zustand';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

interface KernelState {
  isProcessing: boolean;
  dispatch: (agentId: string, action: string, payload: any) => Promise<any>;
}

export const useKernel = create<KernelState>((set) => ({
  isProcessing: false,
  dispatch: async (agentId, action, payload) => {
    set({ isProcessing: true });
    try {
      const fn = httpsCallable(functions, 'dispatch');
      const result = await fn({ agentId, action, payload });
      return result.data;
    } finally {
      set({ isProcessing: false });
    }
  }
}));
```

---

## 6. Execution Plan (Dev Team)

1.  **Init:** `npx create-turbo@latest`
2.  **Shared:** Copy `packages/shared` schemas.
3.  **Backend:** `firebase init functions`. Implement `dispatcher.ts`.
4.  **Frontend:** `npx create-next-app`. Implement `UniversalCard.tsx`.
5.  **Health:** Add `HealthExamSchema` and deploy `@skills/ocr`.
