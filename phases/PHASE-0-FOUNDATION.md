# Phase 0: Foundation

> **Timeline:** Weeks 1-4 (4 weeks)
> **Status:** 🚧 Ready to Start
> **Goal:** Core infrastructure ready for agent development

---

## 📋 Table of Contents

1. [Objectives](#objectives)
2. [Architecture Overview](#architecture-overview)
3. [Week-by-Week Plan](#week-by-week-plan)
4. [Implementation Backlog](#implementation-backlog)
5. [Technical Design Decisions](#technical-design-decisions)
6. [Success Criteria](#success-criteria)
7. [Dependencies & Prerequisites](#dependencies--prerequisites)

---

## 🎯 Objectives

### Primary Goals

1. **Infrastructure Setup**
   - Monorepo configured (TurboRepo)
   - Firebase project initialized
   - Development environment ready

2. **Data Layer Implementation**
   - VFS (Virtual File System) abstraction
   - Firestore schemas defined
   - IDENTITY, CONTEXT, PROFILE structures

3. **Security Foundation**
   - Authentication flow (Firebase Auth + 2FA)
   - Security middleware (basic)
   - Encryption service (PII fields)

4. **CORE Agent (MVP)**
   - Basic conversational interface
   - Text input/output (voice in Phase 1)
   - Intent classification
   - Simple data routing

5. **Frontend Shell**
   - Next.js 14 app initialized
   - Authentication UI
   - Basic chat interface
   - Dashboard skeleton

### Why This Phase Matters

**Without a solid foundation, everything built on top will be unstable.**

This phase establishes:
- Data structures that all agents will use
- Security patterns that protect user data
- Development patterns for future phases

---

## 🏗️ Architecture Overview

### Tech Stack (Phase 0)

```yaml
frontend:
  framework: "Next.js 14 (App Router)"
  language: "TypeScript"
  styling: "Tailwind CSS"
  state: "Zustand"
  auth: "Firebase Auth"

backend:
  runtime: "Firebase Functions (Node.js 18)"
  database: "Firestore"
  storage: "Cloud Storage"
  auth: "Firebase Auth + 2FA"

infrastructure:
  monorepo: "TurboRepo"
  package_manager: "pnpm"
  ci_cd: "GitHub Actions"
  hosting: "Vercel (frontend) + Firebase (backend)"
```

### System Diagram (Phase 0 Scope)

```
┌─────────────────────────────────────────────────────────┐
│                   NOUS (Phase 0)                        │
└─────────────────────────────────────────────────────────┘

┌──────────────┐          ┌──────────────┐
│   LENS (UI)  │◄────────►│   KERNEL     │
│              │   HTTP    │ (Functions)  │
│  Next.js 14  │          │              │
│              │          │  CORE Agent  │
│  - Auth UI   │          │  (Basic)     │
│  - Chat      │          │              │
│  - Dashboard │          │  - Text only │
└──────────────┘          │  - Intent    │
                          │  - Routing   │
                          └──────┬───────┘
                                 │
                          ┌──────▼────────┐
                          │   DATA LAYER  │
                          ├───────────────┤
                          │  VFS          │
                          │  ├─ Firestore │
                          │  ├─ Storage   │
                          │  └─ Auth      │
                          │               │
                          │  IDENTITY     │
                          │  CONTEXT      │
                          │  PROFILE      │
                          └───────────────┘
```

---

## 📅 Week-by-Week Plan

### Week 1: Project Setup & Infrastructure

**Days 1-2: Monorepo & Tooling**
- [ ] Initialize TurboRepo
- [ ] Configure pnpm workspaces
- [ ] Setup TypeScript configs
- [ ] Configure ESLint + Prettier
- [ ] Setup GitHub Actions (CI)

**Days 3-4: Firebase Project**
- [ ] Create Firebase project
- [ ] Enable Firestore
- [ ] Enable Cloud Storage
- [ ] Enable Firebase Auth
- [ ] Configure security rules (basic)

**Days 5-7: Next.js App**
- [ ] Initialize Next.js 14 app
- [ ] Configure Tailwind CSS
- [ ] Setup app router structure
- [ ] Install dependencies (Zustand, Firebase SDK)
- [ ] Configure environment variables

**Deliverable:** Working monorepo with Next.js + Firebase connected

---

### Week 2: Data Layer (VFS)

**Days 1-2: VFS Architecture**
- [ ] Design VFS interface
- [ ] Implement Firestore adapter
- [ ] Implement Storage adapter
- [ ] Create unified API

**Days 3-4: Firestore Schemas**
- [ ] Define IDENTITY schema
- [ ] Define CONTEXT schema
- [ ] Define PROFILE schema
- [ ] Create TypeScript types
- [ ] Write validation functions

**Days 5-7: IDENTITY Implementation**
- [ ] Create `identity/persona.md` structure
- [ ] Create `identity/boundaries.md` structure
- [ ] Create `identity/priorities.md` structure
- [ ] Implement IDENTITY loader
- [ ] Test IDENTITY access

**Deliverable:** VFS working, IDENTITY loadable from Firestore

---

### Week 3: Security & Authentication

**Days 1-2: Firebase Auth Setup**
- [ ] Implement email/password auth
- [ ] Implement Google OAuth
- [ ] Setup 2FA (TOTP)
- [ ] Create auth context (React)
- [ ] Build login/signup UI

**Days 3-4: Security Middleware**
- [ ] Create SecurityMiddleware class
- [ ] Implement authentication check
- [ ] Implement session validation
- [ ] Implement rate limiting
- [ ] Add audit logging

**Days 5-7: Encryption Service**
- [ ] Create EncryptionService class
- [ ] Implement PII encryption (AES-256-GCM)
- [ ] Setup Google Cloud KMS
- [ ] Test encryption/decryption
- [ ] Document encryption patterns

**Deliverable:** Secure auth flow, encrypted PII fields

---

### Week 4: CORE Agent (Basic) & Frontend

**Days 1-3: CORE Agent MVP**
- [ ] Create CoreAgent class
- [ ] Implement text input/output
- [ ] Implement intent classification
- [ ] Implement data routing (CONTEXT, PROFILE)
- [ ] Test basic queries

**Days 4-5: Frontend - Chat Interface**
- [ ] Build chat UI component
- [ ] Connect to CORE Agent API
- [ ] Display responses
- [ ] Handle loading states
- [ ] Error handling

**Days 6-7: Frontend - Dashboard**
- [ ] Build dashboard layout
- [ ] Display CONTEXT data
- [ ] Display PROFILE summary
- [ ] Navigation between pages
- [ ] Polish UI

**Deliverable:** Working chat interface that talks to CORE Agent

---

## 🔨 Implementation Backlog

### P0 (Critical - Must have)

#### 1. Monorepo Setup
```bash
# Initialize
npx create-turbo@latest

# Structure:
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── functions/    # Firebase Functions
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configs
└── docs/             # Documentation
```

**Acceptance Criteria:**
- ✅ `pnpm install` works
- ✅ `pnpm dev` starts all apps
- ✅ TypeScript no errors
- ✅ CI pipeline green

---

#### 2. Firebase Project Configuration

```typescript
// firebase.config.ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```

**Firestore Collections:**
```
users/
  {userId}/
    identity/      # Persona, boundaries, priorities
    context/       # Current state (health, finance, calendar)
    profile/       # Historical data
      conversations/
      decisions/
      life_events/
    working/       # Active tasks
    logs/          # Audit trail
```

**Acceptance Criteria:**
- ✅ Firestore initialized
- ✅ Collections created
- ✅ Security rules deployed
- ✅ Firebase SDK connected

---

#### 3. VFS (Virtual File System) Implementation

```typescript
// packages/vfs/src/index.ts

export interface VFS {
  // Read data
  read(path: string): Promise<any>;

  // Write data
  write(path: string, data: any): Promise<void>;

  // List items
  list(path: string): Promise<string[]>;

  // Delete
  delete(path: string): Promise<void>;

  // Check existence
  exists(path: string): Promise<boolean>;
}

export class FirestoreVFS implements VFS {
  async read(path: string): Promise<any> {
    // Parse path: "context:health.bloodwork"
    const { collection, doc, field } = parsePath(path);

    const snapshot = await db
      .collection(collection)
      .doc(doc)
      .get();

    if (!snapshot.exists) {
      throw new Error(`Path not found: ${path}`);
    }

    const data = snapshot.data();
    return field ? data[field] : data;
  }

  async write(path: string, data: any): Promise<void> {
    const { collection, doc, field } = parsePath(path);

    // Encrypt PII if needed
    const encrypted = await this.encryptIfNeeded(path, data);

    await db
      .collection(collection)
      .doc(doc)
      .set(field ? { [field]: encrypted } : encrypted, { merge: true });

    // Log access
    await this.logAccess("write", path);
  }

  // ... other methods
}
```

**Acceptance Criteria:**
- ✅ Can read/write IDENTITY
- ✅ Can read/write CONTEXT
- ✅ Can read/write PROFILE
- ✅ Paths resolve correctly
- ✅ Encryption works for PII

---

#### 4. IDENTITY Structures

```typescript
// packages/types/src/identity.ts

export interface Persona {
  tone: {
    general: "direct" | "friendly" | "formal";
    health: string;
    finance: string;
    personal: string;
  };
  emoji_usage: {
    health: "minimal" | "moderate" | "liberal";
    finance: "minimal" | "moderate" | "liberal";
    casual: "minimal" | "moderate" | "liberal";
  };
  language: "pt-BR" | "en-US";
  red_lines: string[]; // Never do these
}

export interface Boundaries {
  financial: {
    automatic_approval_max: number; // BRL
    requires_confirmation_range: [number, number]; // BRL
    requires_explicit_approval_min: number; // BRL
    never_without_approval: string[]; // Transaction types
  };
  health: {
    never_diagnose: boolean;
    never_prescribe: boolean;
    always_cite_sources: boolean;
  };
  privacy: {
    encryption_required: string[]; // Data types
    never_share: string[]; // Data categories
  };
  autonomy: {
    max_auto_actions_per_day: number;
    reversibility_check: boolean;
  };
}

export interface Priorities {
  matrix: {
    P0: Priority[]; // Emergências
    P1: Priority[]; // Urgente
    P2: Priority[]; // Importante
    P3: Priority[]; // Otimização
    P4: Priority[]; // Conveniência
  };
  conflict_resolution: ConflictRule[];
}
```

**Acceptance Criteria:**
- ✅ Types compile
- ✅ Can load from Firestore
- ✅ Validation works
- ✅ Used by CORE Agent

---

#### 5. Security Middleware (Basic)

```typescript
// apps/functions/src/security/middleware.ts

export class SecurityMiddleware {
  async validateRequest(request: Request): Promise<User> {
    // 1. Verify Firebase Auth token
    const token = request.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await this.getUserById(decodedToken.uid);

    // 2. Check session validity
    const session = await this.getSession(user.id);
    if (!session || session.expired) {
      throw new UnauthorizedError("Session expired");
    }

    // 3. Rate limiting (simple)
    const rateLimit = await this.checkRateLimit(user.id);
    if (rateLimit.exceeded) {
      throw new TooManyRequestsError("Rate limit exceeded");
    }

    // 4. Log access
    await this.logAccess(user.id, request);

    return user;
  }
}

// Usage in Cloud Function
export const coreAgentAPI = onRequest(async (req, res) => {
  try {
    const user = await securityMiddleware.validateRequest(req);

    // Process request
    const response = await coreAgent.process(user.id, req.body);

    res.json(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal error" });
    }
  }
});
```

**Acceptance Criteria:**
- ✅ Token validation works
- ✅ Rate limiting active
- ✅ Access logged
- ✅ Errors handled

---

#### 6. CORE Agent (MVP)

```typescript
// apps/functions/src/agents/core-agent.ts

export class CoreAgent {
  async process(userId: string, query: string): Promise<Response> {
    // 1. Load user context
    const identity = await this.loadIdentity(userId);
    const context = await this.loadRecentContext(userId);

    // 2. Classify intent
    const intent = await this.classifyIntent(query, context);

    // 3. Route to data source
    const dataSources = this.routeToDataSources(intent);

    // 4. Fetch data
    const data = await this.fetchData(userId, dataSources);

    // 5. Synthesize response
    const response = await this.synthesize({
      query,
      intent,
      data,
      identity,
      context
    });

    // 6. Log interaction
    await this.logInteraction(userId, query, response);

    return response;
  }

  private async classifyIntent(
    query: string,
    context: any
  ): Promise<Intent> {
    // Use LLM to classify
    const prompt = `
      User query: "${query}"
      Recent context: ${JSON.stringify(context)}

      Classify the intent:
      - health_query (asking about health data)
      - finance_query (asking about finances)
      - calendar_query (asking about schedule)
      - profile_query (asking about history)
      - general (other)
    `;

    const result = await llm.complete(prompt);
    return parseIntent(result);
  }

  private routeToDataSources(intent: Intent): string[] {
    const routes = {
      health_query: ["context:health.*", "profile:health_history"],
      finance_query: ["context:finance.*", "profile:transactions"],
      calendar_query: ["context:calendar.today"],
      profile_query: ["profile.*"]
    };

    return routes[intent.type] || [];
  }

  private async synthesize(params: SynthesisParams): Promise<string> {
    const { query, data, identity } = params;

    const prompt = `
      You are NOUS, a personal AI assistant.

      Persona: ${identity.persona}

      User asked: "${query}"

      Data available:
      ${JSON.stringify(data, null, 2)}

      Respond in a helpful, concise way following the persona guidelines.
    `;

    const response = await llm.complete(prompt);
    return response;
  }
}
```

**Acceptance Criteria:**
- ✅ Can process text queries
- ✅ Intent classification works
- ✅ Data routing works
- ✅ Responses are coherent
- ✅ Follows persona guidelines

---

#### 7. Frontend - Authentication

```typescript
// apps/web/src/contexts/AuthContext.tsx

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Login Page:**
```tsx
// apps/web/src/app/login/page.tsx

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8">Login to NOUS</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 mb-4 border rounded"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 mb-4 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ Login works
- ✅ Google OAuth works
- ✅ Session persists
- ✅ Protected routes work
- ✅ Logout works

---

#### 8. Frontend - Chat Interface

```tsx
// apps/web/src/components/Chat.tsx

export function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/core-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ query: input })
      });

      const data = await response.json();

      const assistantMessage = { role: "assistant", content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-200">
              <LoadingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask NOUS anything..."
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ Can send messages
- ✅ Receives responses
- ✅ Loading state shown
- ✅ Error handling
- ✅ Message history visible

---

### P1 (Important - Should have)

#### 9. Context Manager
- Load CONTEXT based on query intent
- Cache frequently accessed CONTEXT
- Invalidate cache on updates

#### 10. Profile API (Basic)
- Query recent conversations
- Query recent life events
- Simple text search

#### 11. Logging System
- Log all CORE Agent interactions
- Log security events
- Store in Firestore logs collection

---

### P2 (Nice to have)

#### 12. Dashboard Widgets
- Quick stats (recent activity)
- CONTEXT summary cards
- PROFILE timeline (recent)

#### 13. Settings Page
- User profile
- IDENTITY editor (basic)
- Account settings

---

## 🎨 Technical Design Decisions

### 1. Why TurboRepo?

**Decision:** Use TurboRepo for monorepo management

**Reasons:**
- Fast builds with caching
- Simple configuration
- Good TypeScript support
- Industry standard

**Alternatives considered:**
- Nx: More features but more complex
- Lerna: Older, less maintained

---

### 2. Why Firebase Functions (not Cloud Run)?

**Decision:** Start with Firebase Functions, migrate to Cloud Run later

**Reasons:**
- Easier setup
- Tight Firebase integration
- Good for MVP
- Can migrate to Cloud Run when needed (Phase 1+)

**Trade-offs:**
- Limited to Node.js (no Python yet)
- Cold start latency
- 9 minute timeout limit

---

### 3. Why Firestore (not PostgreSQL)?

**Decision:** Use Firestore as primary database

**Reasons:**
- Real-time capabilities
- Offline support
- Scalable
- No server management
- Good Firebase integration

**Trade-offs:**
- No SQL queries
- Limited transactions
- More expensive at scale

**Future:** Consider Cloud SQL for analytics/reporting

---

### 4. Why Next.js 14 (not Remix/SvelteKit)?

**Decision:** Use Next.js 14 with App Router

**Reasons:**
- Industry standard
- Excellent DX
- Server Components
- Large ecosystem
- Vercel deployment

**Trade-offs:**
- Some App Router quirks
- Learning curve

---

## ✅ Success Criteria

### Phase 0 is complete when:

#### Technical Criteria
- [ ] ✅ Monorepo builds without errors
- [ ] ✅ All tests passing (unit + integration)
- [ ] ✅ CI/CD pipeline green
- [ ] ✅ Can deploy to staging

#### Functional Criteria
- [ ] ✅ User can sign up and login
- [ ] ✅ User can ask basic questions via chat
- [ ] ✅ CORE Agent responds coherently
- [ ] ✅ IDENTITY data loads correctly
- [ ] ✅ CONTEXT data reads/writes work

#### Security Criteria
- [ ] ✅ Authentication required for all endpoints
- [ ] ✅ PII fields encrypted
- [ ] ✅ Rate limiting active
- [ ] ✅ Audit logging works

#### UX Criteria
- [ ] ✅ Login flow is smooth
- [ ] ✅ Chat interface is responsive
- [ ] ✅ Loading states are clear
- [ ] ✅ Errors are handled gracefully

---

## 📦 Dependencies & Prerequisites

### Required Accounts
- [ ] Google Cloud Platform account
- [ ] Firebase project created
- [ ] GitHub repository
- [ ] Vercel account (optional, for deployment)

### Required Tools
- [ ] Node.js 18+
- [ ] pnpm 8+
- [ ] Git
- [ ] VS Code (recommended)

### Required Knowledge
- [ ] TypeScript basics
- [ ] React fundamentals
- [ ] Firebase basics
- [ ] Firestore data modeling

### Helpful Resources
- [TurboRepo Docs](https://turbo.build/repo/docs)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 🚀 Getting Started

### 1. Clone repository
```bash
git clone <repo-url>
cd JARVA
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Setup Firebase
```bash
firebase login
firebase init
```

### 4. Configure environment
```bash
cp .env.example .env.local
# Fill in Firebase config
```

### 5. Start development
```bash
pnpm dev
```

---

## 📞 Support

**Questions?** Check:
- [Main PRD](../NOUS-PRD-MAIN.md)
- [Data Layer Spec](../specs/DATA-LAYER-SPEC.md)
- [Security Spec](../specs/SECURITY-SPEC.md)

**Issues?** Create GitHub issue with label `phase-0`
