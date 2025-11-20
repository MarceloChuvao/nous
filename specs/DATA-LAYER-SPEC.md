# Data Layer Specification

> **Version:** 1.0.0
> **Related Phase:** Phase 0 - Foundation
> **Status:** Implementation Ready

---

## Table of Contents

1. [Overview](#overview)
2. [VFS (Virtual File System)](#vfs-virtual-file-system)
3. [IDENTITY](#identity)
4. [CONTEXT](#context)
5. [PROFILE](#profile)
6. [VAULT](#vault)
7. [WORKING](#working)
8. [LOGS](#logs)
9. [Firestore Schemas](#firestore-schemas)
10. [Implementation Guide](#implementation-guide)

---

## 1. Overview

### Purpose

The Data Layer provides a **unified abstraction** over all data storage systems (Firestore, Cloud Storage, Vector DB), making it easy for agents to access user data without worrying about underlying implementation.

### Architecture

```
┌────────────────────────────────────────────────────┐
│              VFS (Virtual File System)             │
│              Unified Data Access API               │
├────────────────────────────────────────────────────┤
│                                                    │
│  read(path)  write(path, data)  list(path)        │
│  delete(path)  exists(path)  query(criteria)      │
│                                                    │
└─────────────────┬──────────────────────────────────┘
                  │
      ┌───────────┼───────────┬──────────────┐
      ↓           ↓           ↓              ↓
┌──────────┐ ┌─────────┐ ┌─────────┐  ┌──────────┐
│Firestore │ │ Storage │ │Vector DB│  │  Cache   │
│(Primary) │ │ (Files) │ │  (RAG)  │  │  (Redis) │
└──────────┘ └─────────┘ └─────────┘  └──────────┘
```

### Key Concepts

**Path-based access:**
```typescript
// Read current health data
const bloodwork = await vfs.read("context:health.bloodwork");

// Read historical data
const history = await vfs.read("profile:health_history");

// Read identity
const persona = await vfs.read("identity:persona");
```

**Automatic encryption:**
- PII fields automatically encrypted
- Transparent to caller

**Caching:**
- Frequently accessed data cached (Redis)
- Automatic invalidation

---

## 2. VFS (Virtual File System)

### Interface

```typescript
// packages/vfs/src/types.ts

export interface VFS {
  /**
   * Read data from path
   * @param path - Format: "collection:document.field" or "collection:document"
   * @returns Data at path (decrypted if PII)
   */
  read(path: string): Promise<any>;

  /**
   * Write data to path
   * @param path - Where to write
   * @param data - What to write (will be encrypted if PII)
   */
  write(path: string, data: any): Promise<void>;

  /**
   * List items at path
   * @param path - Collection path
   * @returns Array of document IDs
   */
  list(path: string): Promise<string[]>;

  /**
   * Delete data at path
   * @param path - What to delete
   */
  delete(path: string): Promise<void>;

  /**
   * Check if path exists
   * @param path - Path to check
   */
  exists(path: string): Promise<boolean>;

  /**
   * Query data with criteria
   * @param collection - Collection to query
   * @param criteria - Query criteria
   */
  query(collection: string, criteria: QueryCriteria): Promise<any[]>;
}

export interface QueryCriteria {
  where?: Array<[string, WhereFilterOp, any]>;
  orderBy?: [string, "asc" | "desc"];
  limit?: number;
  startAfter?: any;
}
```

### Implementation

```typescript
// packages/vfs/src/firestore-vfs.ts

import { Firestore } from "firebase-admin/firestore";
import { EncryptionService } from "@nous/security";

export class FirestoreVFS implements VFS {
  constructor(
    private db: Firestore,
    private encryption: EncryptionService,
    private cache: CacheService
  ) {}

  async read(path: string): Promise<any> {
    // 1. Check cache first
    const cached = await this.cache.get(path);
    if (cached) {
      return cached;
    }

    // 2. Parse path
    const { userId, collection, docId, field } = this.parsePath(path);

    // 3. Read from Firestore
    const docRef = this.db
      .collection("users")
      .doc(userId)
      .collection(collection)
      .doc(docId);

    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      throw new VFSError(`Path not found: ${path}`, "NOT_FOUND");
    }

    let data = snapshot.data();

    // 4. Decrypt if PII
    if (this.isPII(collection, field)) {
      data = await this.encryption.decrypt(data, userId);
    }

    // 5. Extract field if specified
    const result = field ? data[field] : data;

    // 6. Cache result
    await this.cache.set(path, result, { ttl: 300 }); // 5 min

    return result;
  }

  async write(path: string, data: any): Promise<void> {
    const { userId, collection, docId, field } = this.parsePath(path);

    // 1. Encrypt if PII
    let dataToWrite = data;
    if (this.isPII(collection, field)) {
      dataToWrite = await this.encryption.encrypt(data, userId);
    }

    // 2. Write to Firestore
    const docRef = this.db
      .collection("users")
      .doc(userId)
      .collection(collection)
      .doc(docId);

    if (field) {
      // Update specific field
      await docRef.set({ [field]: dataToWrite }, { merge: true });
    } else {
      // Update entire document
      await docRef.set(dataToWrite, { merge: true });
    }

    // 3. Invalidate cache
    await this.cache.delete(path);

    // 4. Log access
    await this.logAccess(userId, "write", path);
  }

  async list(path: string): Promise<string[]> {
    const { userId, collection } = this.parsePath(path);

    const snapshot = await this.db
      .collection("users")
      .doc(userId)
      .collection(collection)
      .get();

    return snapshot.docs.map(doc => doc.id);
  }

  async delete(path: string): Promise<void> {
    const { userId, collection, docId } = this.parsePath(path);

    await this.db
      .collection("users")
      .doc(userId)
      .collection(collection)
      .doc(docId)
      .delete();

    await this.cache.delete(path);
    await this.logAccess(userId, "delete", path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.read(path);
      return true;
    } catch (error) {
      if (error.code === "NOT_FOUND") {
        return false;
      }
      throw error;
    }
  }

  async query(
    collection: string,
    criteria: QueryCriteria
  ): Promise<any[]> {
    const { userId } = this.getCurrentUser();

    let query = this.db
      .collection("users")
      .doc(userId)
      .collection(collection);

    // Apply where clauses
    if (criteria.where) {
      for (const [field, op, value] of criteria.where) {
        query = query.where(field, op, value);
      }
    }

    // Apply orderBy
    if (criteria.orderBy) {
      const [field, direction] = criteria.orderBy;
      query = query.orderBy(field, direction);
    }

    // Apply limit
    if (criteria.limit) {
      query = query.limit(criteria.limit);
    }

    // Apply pagination
    if (criteria.startAfter) {
      query = query.startAfter(criteria.startAfter);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Helper: Parse path string
  private parsePath(path: string): ParsedPath {
    // Format: "collection:document.field"
    // Example: "context:health.bloodwork"
    // Example: "identity:persona"

    const [collection, rest] = path.split(":");
    if (!rest) {
      throw new VFSError(`Invalid path format: ${path}`, "INVALID_PATH");
    }

    const [docId, field] = rest.split(".");

    return {
      userId: this.getCurrentUser().userId,
      collection,
      docId,
      field
    };
  }

  // Helper: Check if data is PII (requires encryption)
  private isPII(collection: string, field?: string): boolean {
    const piiCollections = ["context", "profile"];
    const piiFields = [
      "bloodwork",
      "medications",
      "balance",
      "transactions",
      "cpf",
      "rg",
      "passport"
    ];

    if (!piiCollections.includes(collection)) {
      return false;
    }

    if (!field) {
      return true; // Entire document in PII collection
    }

    return piiFields.includes(field);
  }

  // Helper: Log data access for audit
  private async logAccess(
    userId: string,
    operation: "read" | "write" | "delete",
    path: string
  ): Promise<void> {
    await this.db.collection("logs").add({
      timestamp: new Date(),
      userId,
      type: "data_access",
      operation,
      path
    });
  }

  // Helper: Get current authenticated user
  private getCurrentUser(): { userId: string } {
    // Get from request context (set by middleware)
    const context = getRequestContext();
    if (!context || !context.userId) {
      throw new VFSError("No authenticated user", "UNAUTHENTICATED");
    }
    return { userId: context.userId };
  }
}
```

---

## 3. IDENTITY

### Purpose

Defines **who the user is**: their values, communication style, boundaries, and priorities.

### Structure

```
users/{userId}/identity/
  ├── persona          (How NOUS communicates)
  ├── boundaries       (Hard limits NOUS must respect)
  └── priorities       (P0-P4 conflict resolution matrix)
```

### Schemas

#### 3.1 Persona

```typescript
// packages/types/src/identity/persona.ts

export interface Persona {
  // Core personality
  role: string; // "Personal AI assistant"
  relationship: string; // "Trusted advisor"
  approach: string; // "Proactive but respectful"

  // Communication style
  tone: {
    general: "direct" | "friendly" | "formal";
    health: string; // Specific guidelines
    finance: string;
    personal: string;
  };

  // Language preferences
  language: "pt-BR" | "en-US";
  technical_terms: "portuguese" | "english" | "mixed";

  // Emoji usage
  emoji_usage: {
    health: "minimal" | "moderate" | "liberal";
    finance: "minimal" | "moderate" | "liberal";
    casual: "minimal" | "moderate" | "liberal";
  };

  // Red lines (never do these)
  red_lines: {
    medical: string[]; // "Never diagnose", "Never prescribe"
    financial: string[]; // "Never guarantee returns"
    privacy: string[]; // "Never share data"
    autonomy: string[]; // "Never take irreversible actions"
  };

  // Examples
  examples: {
    good: string[];
    bad: string[];
  };
}
```

**Default Persona:**
```typescript
const DEFAULT_PERSONA: Persona = {
  role: "Personal AI assistant and life orchestrator",
  relationship: "Trusted advisor, not servant",
  approach: "Proactive but respectful of autonomy",

  tone: {
    general: "direct",
    health: "Serious but not alarmist, always cite sources",
    finance: "Clear and actionable, risk-aware",
    personal: "Non-judgmental, empathetic"
  },

  language: "pt-BR",
  technical_terms: "english",

  emoji_usage: {
    health: "minimal",
    finance: "moderate",
    casual: "moderate"
  },

  red_lines: {
    medical: [
      "Never diagnose conditions",
      "Never prescribe medications",
      "Never contradict medical professionals",
      "Never minimize serious symptoms"
    ],
    financial: [
      "Never guarantee returns",
      "Never make transactions > R$1000 without approval",
      "Never give tax/legal advice",
      "Never push specific investments"
    ],
    privacy: [
      "Never share data with third parties without permission",
      "Never discuss user data with others",
      "Never store unnecessary PII"
    ],
    autonomy: [
      "Never take irreversible actions without approval",
      "Never delete user data without confirmation",
      "Never override explicit user preferences"
    ]
  },

  examples: {
    good: [
      "Seu colesterol está em 185 mg/dL, dentro da faixa normal (<200).",
      "Você gastou R$ 1.850 no supermercado em dezembro, 12% acima da média."
    ],
    bad: [
      "Relaxa, teu colesterol tá de boa 😎",
      "Seus níveis séricos de lipoproteína de baixa densidade..."
    ]
  }
};
```

#### 3.2 Boundaries

```typescript
// packages/types/src/identity/boundaries.ts

export interface Boundaries {
  // Financial boundaries
  financial: {
    automatic_approval_max: number; // BRL, max for auto-approval
    requires_confirmation_range: [number, number]; // BRL range
    requires_explicit_approval_min: number; // BRL, min for explicit
    never_without_approval: string[]; // Transaction types
    max_daily_auto_transactions: number;
  };

  // Health boundaries
  health: {
    never_diagnose: boolean;
    never_prescribe: boolean;
    always_cite_sources: boolean;
    emergency_threshold: string; // When to call 911
  };

  // Privacy boundaries
  privacy: {
    encryption_required: string[]; // Data types
    never_share: string[]; // Data categories
    data_retention_days: number;
    require_2fa_for: string[]; // Actions requiring 2FA
  };

  // Autonomy boundaries
  autonomy: {
    max_auto_actions_per_day: number;
    reversibility_check: boolean; // Check if action is reversible
    require_approval_for: string[]; // Action types
  };

  // Scope boundaries
  scope: {
    allowed_domains: string[]; // Web domains agents can access
    allowed_integrations: string[]; // External services
    max_cost_per_query: number; // USD, max LLM cost per query
  };
}
```

**Default Boundaries:**
```typescript
const DEFAULT_BOUNDARIES: Boundaries = {
  financial: {
    automatic_approval_max: 100, // R$ 100
    requires_confirmation_range: [100, 1000],
    requires_explicit_approval_min: 1000,
    never_without_approval: [
      "transfer_to_third_party",
      "volatile_investment",
      "insurance_cancellation",
      "property_sale"
    ],
    max_daily_auto_transactions: 5
  },

  health: {
    never_diagnose: true,
    never_prescribe: true,
    always_cite_sources: true,
    emergency_threshold: "chest_pain, difficulty_breathing, severe_bleeding"
  },

  privacy: {
    encryption_required: [
      "health_data",
      "financial_data",
      "personal_documents",
      "passwords"
    ],
    never_share: ["health", "finance", "documents"],
    data_retention_days: 2555, // 7 years (tax law)
    require_2fa_for: ["financial_transaction", "data_export", "account_deletion"]
  },

  autonomy: {
    max_auto_actions_per_day: 10,
    reversibility_check: true,
    require_approval_for: [
      "delete_data",
      "send_email",
      "make_purchase",
      "schedule_appointment"
    ]
  },

  scope: {
    allowed_domains: ["*.gov.br", "*.edu", "trusted-health-sites.com"],
    allowed_integrations: ["open_banking", "fhir", "google_calendar"],
    max_cost_per_query: 0.50 // $0.50 USD max per query
  }
};
```

#### 3.3 Priorities

```typescript
// packages/types/src/identity/priorities.ts

export interface Priorities {
  // P0-P4 matrix
  matrix: {
    P0: PriorityLevel; // Emergências (life-threatening)
    P1: PriorityLevel; // Urgente (fraud, deadlines)
    P2: PriorityLevel; // Importante (meetings, commitments)
    P3: PriorityLevel; // Otimização (savings, improvements)
    P4: PriorityLevel; // Conveniência (suggestions)
  };

  // Conflict resolution rules
  conflict_resolution: ConflictRule[];

  // User overrides (custom priorities)
  user_overrides: Override[];
}

export interface PriorityLevel {
  name: string;
  description: string;
  examples: string[];
  response_protocol: ResponseProtocol;
}

export interface ResponseProtocol {
  interruption: "immediate" | "within_5min" | "respect_context" | "never";
  channels: ("push" | "sms" | "call" | "email" | "in_app")[];
  escalation: string;
  user_approval: "not_required" | "required_soon" | "required" | "optional";
}

export interface ConflictRule {
  scenario: string;
  priority_a: "P0" | "P1" | "P2" | "P3" | "P4";
  priority_b: "P0" | "P1" | "P2" | "P3" | "P4";
  winner: "P0" | "P1" | "P2" | "P3" | "P4" | "ask_user";
  reasoning: string;
}
```

**Default Priorities:**
```typescript
const DEFAULT_PRIORITIES: Priorities = {
  matrix: {
    P0: {
      name: "Emergências",
      description: "Life-threatening situations",
      examples: [
        "Chest pain detected",
        "Active fraud (transaction happening now)",
        "Home security breach"
      ],
      response_protocol: {
        interruption: "immediate",
        channels: ["push", "sms", "call"],
        escalation: "Call emergency services if no response in 30s",
        user_approval: "not_required"
      }
    },
    P1: {
      name: "Urgente",
      description: "Threats to security or wellbeing",
      examples: [
        "Suspicious transaction detected",
        "Legal deadline in <24h",
        "High fever (non-emergency)"
      ],
      response_protocol: {
        interruption: "within_5min",
        channels: ["push", "sms"],
        escalation: "Notify immediately",
        user_approval: "required_soon"
      }
    },
    P2: {
      name: "Importante",
      description: "Commitments and important tasks",
      examples: [
        "Scheduled meeting",
        "Work deadline (<48h)",
        "Important appointment"
      ],
      response_protocol: {
        interruption: "respect_context",
        channels: ["push", "email"],
        escalation: "Progressive reminders",
        user_approval: "required"
      }
    },
    P3: {
      name: "Otimização",
      description: "Improvements and optimizations",
      examples: [
        "Save money (promotion detected)",
        "Health improvement suggestion",
        "Productivity tip"
      ],
      response_protocol: {
        interruption: "never",
        channels: ["email", "in_app"],
        escalation: "Weekly summary",
        user_approval: "optional"
      }
    },
    P4: {
      name: "Conveniência",
      description: "Nice-to-have suggestions",
      examples: [
        "Weather forecast",
        "Recipe suggestion",
        "Article recommendation"
      ],
      response_protocol: {
        interruption: "never",
        channels: ["in_app"],
        escalation: "None",
        user_approval: "optional"
      }
    }
  },

  conflict_resolution: [
    {
      scenario: "P0 emergency vs P2 meeting",
      priority_a: "P0",
      priority_b: "P2",
      winner: "P0",
      reasoning: "Life-threatening situations always override meetings"
    },
    {
      scenario: "P1 fraud vs P2 work deadline",
      priority_a: "P1",
      priority_b: "P2",
      winner: "P1",
      reasoning: "Financial security takes precedence"
    },
    {
      scenario: "P2 meeting vs P3 savings opportunity",
      priority_a: "P2",
      priority_b: "P3",
      winner: "P2",
      reasoning: "Commitments override optimizations"
    }
  ],

  user_overrides: []
};
```

---

## 4. CONTEXT

### Purpose

Stores **current state** of user's life: health metrics, financial balance, calendar, etc.

### Structure

```
users/{userId}/context/
  ├── health           (Current health data)
  ├── finance          (Current financial state)
  ├── calendar         (Today's schedule)
  ├── location         (Current location)
  └── preferences      (Current preferences)
```

### Schemas

#### 4.1 Health Context

```typescript
// packages/types/src/context/health.ts

export interface HealthContext {
  // Latest bloodwork
  bloodwork: {
    date: Date;
    cholesterol: number; // mg/dL
    glucose: number; // mg/dL
    hemoglobin: number; // g/dL
    [key: string]: any; // Other metrics
  } | null;

  // Current medications
  medications: Medication[];

  // Recent exams
  exams: Exam[];

  // Vital signs (if wearable connected)
  vitals: {
    heart_rate?: number; // bpm
    blood_pressure?: { systolic: number; diastolic: number };
    blood_oxygen?: number; // %
    temperature?: number; // °C
    last_updated: Date;
  } | null;

  // Activity
  activity: {
    steps_today: number;
    calories_burned: number;
    exercise_minutes: number;
    last_updated: Date;
  } | null;
}

export interface Medication {
  name: string;
  dose: string; // "500mg"
  frequency: string; // "2x/dia"
  start_date: Date;
  end_date?: Date;
  prescribed_by: string;
  reminders: boolean;
}

export interface Exam {
  date: Date;
  type: string; // "Blood test", "X-ray", etc
  result: string;
  doctor: string;
  file_url?: string; // Link to VAULT
}
```

#### 4.2 Finance Context

```typescript
// packages/types/src/context/finance.ts

export interface FinanceContext {
  // Current balance
  balance: {
    checking: number; // BRL
    savings: number;
    investments: number;
    total: number;
    last_updated: Date;
  };

  // Recent transactions
  transactions: Transaction[];

  // Monthly budget
  budget: {
    income: number;
    fixed_expenses: number;
    variable_expenses: number;
    savings_target: number;
    month: string; // "2025-01"
  };

  // Upcoming bills
  bills: Bill[];

  // Financial goals
  goals: FinancialGoal[];
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number; // BRL (negative = expense)
  category: string;
  description: string;
  account: string;
  status: "pending" | "completed" | "cancelled";
}

export interface Bill {
  name: string;
  amount: number;
  due_date: Date;
  status: "pending" | "paid" | "overdue";
  auto_pay: boolean;
}

export interface FinancialGoal {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: Date;
  priority: "high" | "medium" | "low";
}
```

#### 4.3 Calendar Context

```typescript
// packages/types/src/context/calendar.ts

export interface CalendarContext {
  today: CalendarDay;
  week: CalendarDay[];
}

export interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  tasks: Task[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  description?: string;
  type: "meeting" | "appointment" | "reminder" | "other";
}

export interface Task {
  id: string;
  title: string;
  due_date?: Date;
  priority: "P0" | "P1" | "P2" | "P3" | "P4";
  status: "todo" | "in_progress" | "done" | "cancelled";
  tags: string[];
}
```

---

## 5. PROFILE

### Purpose

Queryable API for **complete life history**: all conversations, decisions, life events.

### Structure

```
users/{userId}/profile/
  ├── conversations/      (All chats with NOUS)
  ├── decisions/          (Important decisions made)
  ├── life_events/        (Milestones, significant events)
  └── embeddings/         (Vector embeddings for RAG)
```

### API

```typescript
// packages/profile/src/api.ts

export class ProfileAPI {
  /**
   * Query profile using natural language
   */
  static async query(userId: string, question: string): Promise<ProfileResponse> {
    // 1. Generate embedding for question
    const embedding = await generateEmbedding(question);

    // 2. Vector search for relevant documents
    const results = await vectorDB.query({
      vector: embedding,
      filter: { userId },
      top_k: 5
    });

    // 3. Synthesize answer from results
    const answer = await llm.synthesize({
      question,
      context: results,
      systemPrompt: "Answer based on user's life history..."
    });

    return {
      answer,
      sources: results.map(r => r.metadata)
    };
  }

  /**
   * Add conversation turn to profile
   */
  static async addConversation(
    userId: string,
    turn: ConversationTurn
  ): Promise<void> {
    // 1. Store in Firestore
    await db
      .collection("users")
      .doc(userId)
      .collection("profile")
      .collection("conversations")
      .add({
        timestamp: new Date(),
        user_message: turn.user_message,
        nous_response: turn.nous_response,
        intent: turn.intent,
        entities: turn.entities
      });

    // 2. Generate embedding
    const embedding = await generateEmbedding(
      `User: ${turn.user_message}\nNOUS: ${turn.nous_response}`
    );

    // 3. Store in vector DB
    await vectorDB.upsert({
      id: turn.id,
      values: embedding,
      metadata: {
        userId,
        timestamp: turn.timestamp,
        type: "conversation"
      }
    });
  }
}
```

**See:** [profile/README.md](../profile/README.md) for complete specification.

---

## 6. VAULT

### Purpose

Multi-cloud file synchronization and storage.

**See:** Phase 1 for full VAULT implementation (file uploads, OCR, etc).

Phase 0: Basic structure only.

---

## 7. WORKING

### Purpose

Active tasks and ongoing workflows.

```typescript
export interface Working {
  tasks: Task[];
  workflows: Workflow[];
}

export interface Workflow {
  id: string;
  name: string;
  status: "running" | "paused" | "completed" | "failed";
  steps: WorkflowStep[];
  current_step: number;
  started_at: Date;
}
```

---

## 8. LOGS

### Purpose

Immutable audit trail of all system events.

```typescript
export interface Log {
  timestamp: Date;
  type: "agent_call" | "data_access" | "security_event" | "system";
  userId: string;
  agent?: string;
  action: string;
  details: any;
  ip?: string;
  device?: string;
}
```

**See:** [logs/schema.json](../logs/schema.json) for complete schema.

---

## 9. Firestore Schemas

### Collection Structure

```
/users
  /{userId}
    /identity
      /persona
      /boundaries
      /priorities
    /context
      /health
      /finance
      /calendar
      /location
      /preferences
    /profile
      /conversations
      /decisions
      /life_events
      /embeddings
    /vault
      /files
      /metadata
    /working
      /tasks
      /workflows
    /logs
      /{logId}

/global
  /agents          # Agent registry
  /marketplace     # Agent marketplace
```

### Security Rules

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Global collections (read-only for authenticated users)
    match /global/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }

    // Logs (append-only)
    match /logs/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable
    }
  }
}
```

---

## 10. Implementation Guide

### Step 1: Install Dependencies

```bash
pnpm add firebase-admin @google-cloud/firestore
pnpm add -D @types/node
```

### Step 2: Initialize VFS

```typescript
// packages/vfs/src/index.ts
export { FirestoreVFS } from "./firestore-vfs";
export { VFS, QueryCriteria } from "./types";
```

### Step 3: Use in Agent

```typescript
import { FirestoreVFS } from "@nous/vfs";

const vfs = new FirestoreVFS(db, encryptionService, cacheService);

// Read health data
const bloodwork = await vfs.read("context:health.bloodwork");

// Write new data
await vfs.write("context:health.medications", [
  { name: "Aspirin", dose: "100mg", frequency: "1x/day" }
]);

// Query
const recentLogs = await vfs.query("logs", {
  where: [["timestamp", ">", sevenDaysAgo]],
  orderBy: ["timestamp", "desc"],
  limit: 100
});
```

---

**Next:** [Security Spec](./SECURITY-SPEC.md) - Zero-Trust architecture, encryption, sandboxing
