# NOUS OS - Phase 3: Platform (B2C2C)

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Status:** Ready for Implementation
> **Timeline:** Weeks 19-22 (4 weeks)

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Objectives](#2-objectives)
3. [Architecture](#3-architecture)
4. [Week-by-Week Plan](#4-week-by-week-plan)
5. [Implementation Backlog](#5-implementation-backlog)
6. [Technical Design Decisions](#6-technical-design-decisions)
7. [Success Criteria](#7-success-criteria)
8. [Dependencies](#8-dependencies)

---

## 1. Overview

### What is Phase 3?

Phase 3 transforms NOUS from a product into a **platform** - enabling creators to build and monetize custom agents. This is the **B2C2C** (Business-to-Consumer-to-Consumer) model:

- **Business (NOUS):** Provides platform infrastructure
- **Consumer (Creators):** Build agents using no-code tools
- **Consumer (End Users):** Discover and use creator agents

### Key Components

1. **Creator Studio:** No-code agent builder (Flowise-based)
2. **Agent Marketplace:** Discover and install community agents
3. **Revenue System:** Payment processing + revenue sharing (70/30 split)
4. **Agent Runtime:** Isolated execution environment for creator agents
5. **Quality Control:** Agent review and moderation

### Why Platform Thinking?

- **Scalability:** Creators build agents faster than our team could
- **Diversity:** Niche use cases covered (astrology, recipe planner, habit tracker)
- **Revenue:** Marketplace fee + premium agent subscriptions
- **Network Effects:** More agents → More users → More creators

### Phase 3 Outcomes

By end of Phase 3, NOUS becomes a platform where:
- Creators can build agents visually (no coding)
- Users can discover agents in marketplace
- Payments flow automatically (70% to creator, 30% to platform)
- Quality is maintained (review process, ratings)

---

## 2. Objectives

### Primary Goals

1. **Launch Creator Studio** (P0)
   - Visual agent builder (Flowise integration)
   - Agent testing environment
   - Publishing workflow

2. **Launch Agent Marketplace** (P0)
   - Browse and search agents
   - Install agents with one click
   - Ratings and reviews

3. **Enable Monetization** (P0)
   - Payment processing (Stripe)
   - Revenue sharing (70/30)
   - Creator payouts

### Technical Deliverables

- ✅ Creator Studio (Flowise embedded)
- ✅ Agent manifest specification
- ✅ Agent marketplace (frontend + backend)
- ✅ Payment processing (Stripe integration)
- ✅ Revenue sharing system
- ✅ Agent review pipeline
- ✅ Agent sandboxing (security)

### Success Metrics

- **Creators:** 500+ by end of 2025
- **Marketplace Agents:** 500+ published agents
- **Installations:** 10K+ agent installs
- **Revenue Split:** 70% to creators, 30% to platform
- **Quality:** Average agent rating >4.0 stars

### Non-Goals (Post-Launch)

- ❌ White-label platform (Phase 4+)
- ❌ API-only access (Phase 4+)
- ❌ Enterprise features (Phase 4+)

---

## 3. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 CREATOR EXPERIENCE                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Creator Studio (Flowise)                 │  │
│  │  - Drag-and-drop agent builder                   │  │
│  │  - Visual workflow editor                        │  │
│  │  - Test environment                              │  │
│  │  - Publish to marketplace                        │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Agent Manifest (YAML)                    │  │
│  │  - name, description, icon                       │  │
│  │  - capabilities, permissions                     │  │
│  │  - pricing (free/paid)                           │  │
│  │  - workflow definition                           │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Review Queue                             │  │
│  │  - Automated safety checks                       │  │
│  │  - Manual review (if flagged)                    │  │
│  │  - Approve/Reject                                │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Marketplace (Published)                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   USER EXPERIENCE                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Agent Marketplace                        │  │
│  │  - Browse by category                            │  │
│  │  - Search by keyword                             │  │
│  │  - Filter (free/paid, rating, popular)           │  │
│  │  - View details (description, reviews)           │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Install Agent                            │  │
│  │  - Grant permissions (user approval)             │  │
│  │  - Payment (if paid agent)                       │  │
│  │  - Add to user's agent list                      │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Use Agent                                │  │
│  │  CORE Agent → Delegate → Creator Agent          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 PLATFORM BACKEND                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Agent Runtime (Sandboxed)                │  │
│  │  - Load agent manifest                           │  │
│  │  - Execute Flowise workflow                      │  │
│  │  - Enforce resource limits                       │  │
│  │  - Track usage (for billing)                     │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Usage Tracking                           │  │
│  │  - Count agent calls                             │  │
│  │  - Measure execution time                        │  │
│  │  - Calculate cost (LLM API usage)                │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Revenue Distribution                     │  │
│  │  - Calculate creator earnings (70%)              │  │
│  │  - Platform fee (30%)                            │  │
│  │  - Monthly payouts via Stripe                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Creator Studio** | Flowise (embedded) | Open-source, visual, LangChain-based |
| **Agent Runtime** | FlowiseAI execution engine | Mature, supports LangGraph |
| **Marketplace** | Next.js + Firestore | Same stack, fast development |
| **Payment Processing** | Stripe Connect | Built-in revenue sharing |
| **Agent Storage** | Firestore + Cloud Storage | Manifest + workflow JSON |
| **Sandboxing** | Cloud Run (gVisor) | Isolation per agent |

---

## 4. Week-by-Week Plan

### Week 19: Creator Studio (Flowise Integration)

**Days 1-2: Flowise Setup**
- [ ] Install Flowise locally
- [ ] Test Flowise with sample workflows
- [ ] Review Flowise API documentation
- [ ] Plan embedding strategy (iframe vs native)

**Days 3-5: Creator Studio Implementation**
- [ ] Create /studio route (Next.js)
- [ ] Embed Flowise editor (iframe)
- [ ] Implement save workflow endpoint
- [ ] Agent testing environment

**Days 6-7: Publishing Flow**
- [ ] Agent manifest generation
- [ ] Icon/thumbnail upload
- [ ] Pricing configuration
- [ ] Submit for review button

**Deliverables:**
- ✅ Creator Studio accessible to creators
- ✅ Creators can build agents visually
- ✅ Creators can submit agents for review

---

### Week 20: Agent Marketplace

**Days 1-2: Marketplace UI**
- [ ] Create /marketplace route
- [ ] Grid layout (agent cards)
- [ ] Search functionality
- [ ] Category filters

**Days 3-4: Agent Details Page**
- [ ] Agent description + screenshots
- [ ] Creator profile
- [ ] Reviews and ratings
- [ ] Install button

**Days 5-7: Installation Flow**
- [ ] Permission approval UI
- [ ] Payment modal (if paid agent)
- [ ] Install confirmation
- [ ] Add agent to user's dashboard

**Deliverables:**
- ✅ Marketplace live and searchable
- ✅ Users can browse and install agents
- ✅ Payment flow working

---

### Week 21: Revenue System

**Days 1-2: Stripe Connect Setup**
- [ ] Create Stripe Connect account
- [ ] Implement creator onboarding (KYC)
- [ ] Configure revenue sharing (70/30)
- [ ] Test payouts in sandbox

**Days 3-4: Usage Tracking**
- [ ] Track agent executions
- [ ] Measure LLM token usage
- [ ] Calculate cost per execution
- [ ] Store billing data

**Days 5-7: Payout System**
- [ ] Calculate monthly earnings per creator
- [ ] Generate payout reports
- [ ] Automated monthly transfers
- [ ] Email notifications (payouts sent)

**Deliverables:**
- ✅ Stripe Connect integrated
- ✅ Creators receive payouts
- ✅ Platform earns 30% fee

---

### Week 22: Quality Control & Launch

**Days 1-2: Review Pipeline**
- [ ] Automated safety checks (prompt injection, PII exposure)
- [ ] Manual review queue
- [ ] Approval/rejection workflow
- [ ] Creator notifications

**Days 3-4: Moderation Tools**
- [ ] User reporting (flag agent)
- [ ] Admin dashboard (review reports)
- [ ] Agent suspension/removal
- [ ] Creator banning

**Days 5-7: Launch**
- [ ] Seed marketplace with 20+ high-quality agents
- [ ] Creator onboarding guide
- [ ] Launch announcement (blog + social)
- [ ] Monitor usage metrics

**Deliverables:**
- ✅ Platform live with moderation
- ✅ 20+ agents in marketplace
- ✅ Creator onboarding smooth

---

## 5. Implementation Backlog

### Task 1: Creator Studio (Flowise Integration)

**Priority:** P0
**Effort:** 3 days
**Owner:** Frontend + Platform team

**Description:**
Embed Flowise visual agent builder into NOUS Creator Studio.

**Implementation:**
```typescript
// apps/lens/app/studio/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorStudioPage() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Initialize Flowise
  useEffect(() => {
    // Load existing workflow or create new
    const initWorkflow = async () => {
      const response = await fetch('/api/studio/workflow');
      const { id } = await response.json();
      setWorkflowId(id);
    };

    initWorkflow();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    // Get workflow data from Flowise iframe
    const flowiseIframe = document.getElementById('flowise-editor') as HTMLIFrameElement;
    const workflowData = await getWorkflowFromFlowise(flowiseIframe);

    // Save to backend
    await fetch('/api/studio/workflow', {
      method: 'POST',
      body: JSON.stringify({
        id: workflowId,
        data: workflowData
      })
    });

    setIsSaving(false);
  };

  const handlePublish = async () => {
    // Open publish modal
    router.push(`/studio/publish?workflow=${workflowId}`);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Creator Studio</h1>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-secondary"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handlePublish}
            className="btn-primary"
          >
            Publish to Marketplace
          </button>
        </div>
      </div>

      {/* Flowise Editor (embedded) */}
      <div className="flex-1">
        {workflowId && (
          <iframe
            id="flowise-editor"
            src={`${FLOWISE_URL}/canvas/${workflowId}`}
            className="w-full h-full border-0"
            allow="clipboard-write"
          />
        )}
      </div>
    </div>
  );
}

// Helper: Extract workflow data from Flowise
async function getWorkflowFromFlowise(iframe: HTMLIFrameElement): Promise<any> {
  return new Promise((resolve) => {
    // Post message to Flowise iframe
    iframe.contentWindow?.postMessage({ action: 'getWorkflow' }, '*');

    // Listen for response
    window.addEventListener('message', (event) => {
      if (event.data.type === 'workflowData') {
        resolve(event.data.workflow);
      }
    }, { once: true });
  });
}
```

**Backend (Workflow Storage):**
```typescript
// apps/api/src/studio/workflow.ts

export class WorkflowService {
  /**
   * Create or update workflow
   */
  async saveWorkflow(
    creatorId: string,
    workflowId: string,
    workflowData: any
  ): Promise<void> {
    await this.db
      .collection('creator_workflows')
      .doc(workflowId)
      .set({
        creator_id: creatorId,
        workflow_data: workflowData,
        updated_at: new Date(),
        status: 'draft'
      }, { merge: true });
  }

  /**
   * Load workflow for editing
   */
  async loadWorkflow(creatorId: string, workflowId: string): Promise<any> {
    const doc = await this.db
      .collection('creator_workflows')
      .doc(workflowId)
      .get();

    if (!doc.exists) {
      throw new Error('Workflow not found');
    }

    const data = doc.data();

    // Verify ownership
    if (data.creator_id !== creatorId) {
      throw new Error('Unauthorized');
    }

    return data.workflow_data;
  }
}
```

**Acceptance Criteria:**
- [ ] Flowise editor loads in <2 seconds
- [ ] Workflows save reliably
- [ ] Creators can test workflows before publishing
- [ ] Workflows export to agent manifest

---

### Task 2: Agent Manifest Specification

**Priority:** P0
**Effort:** 1 day
**Owner:** Platform team

**Description:**
Define standard format for agent metadata and configuration.

**Manifest Schema:**
```yaml
# agent.manifest.yml

# Basic Info
agent_id: "@creator/habit-tracker"
name: "Habit Tracker"
version: "1.0.0"
description: "Track daily habits and build streaks"
icon: "https://storage.googleapis.com/nous-agents/icons/habit-tracker.png"
screenshots:
  - "https://..."
  - "https://..."

# Creator
creator:
  id: "creator_abc123"
  name: "João Silva"
  verified: true

# Capabilities
capabilities:
  - "Track daily habits"
  - "Streak calculation"
  - "Reminder notifications"
  - "Progress reports"

# Permissions Required
permissions:
  - read_context_data
  - write_context_data
  - send_notifications

# Pricing
pricing:
  type: "paid" # or "free"
  price_monthly: 4.99 # USD
  trial_days: 7

# Technical
runtime:
  type: "flowise"
  workflow_id: "wf_xyz789"

  # Resource limits
  max_execution_time: 30 # seconds
  max_memory_mb: 256
  max_api_calls: 100 # per execution

# Flowise Workflow
workflow:
  nodes:
    - id: "chatOpenAI_0"
      type: "ChatOpenAI"
      data:
        modelName: "gpt-4"
        temperature: 0.7
    - id: "conversationChain_0"
      type: "ConversationChain"
      data:
        llm: "chatOpenAI_0"

# Metadata
category: "productivity"
tags: ["habits", "tracking", "streaks"]
min_nous_version: "1.0.0"

# Safety
content_rating: "everyone" # everyone, mature
data_usage: "minimal" # minimal, moderate, extensive
privacy_policy_url: "https://..."

# Support
support_email: "joao@example.com"
documentation_url: "https://..."
```

**Validation:**
```typescript
// packages/agents/src/manifest-validator.ts

import Ajv from 'ajv';

const MANIFEST_SCHEMA = {
  type: 'object',
  required: ['agent_id', 'name', 'version', 'description', 'creator', 'permissions'],
  properties: {
    agent_id: {
      type: 'string',
      pattern: '^@[a-z0-9-]+/[a-z0-9-]+$'
    },
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 50
    },
    version: {
      type: 'string',
      pattern: '^\d+\.\d+\.\d+$'
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 500
    },
    creator: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      }
    },
    permissions: {
      type: 'array',
      items: {
        enum: [
          'read_context_data',
          'write_context_data',
          'read_profile',
          'send_notifications',
          'access_internet'
        ]
      }
    },
    pricing: {
      type: 'object',
      properties: {
        type: { enum: ['free', 'paid'] },
        price_monthly: { type: 'number', minimum: 0 }
      }
    }
  }
};

export class ManifestValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv();
  }

  validate(manifest: any): ValidationResult {
    const valid = this.ajv.validate(MANIFEST_SCHEMA, manifest);

    if (!valid) {
      return {
        valid: false,
        errors: this.ajv.errors || []
      };
    }

    // Additional safety checks
    const safetyChecks = this.runSafetyChecks(manifest);

    return {
      valid: safetyChecks.passed,
      errors: safetyChecks.errors
    };
  }

  private runSafetyChecks(manifest: any): { passed: boolean; errors: any[] } {
    const errors: any[] = [];

    // 1. Check for excessive permissions
    if (manifest.permissions.includes('access_internet') && !manifest.creator.verified) {
      errors.push({
        field: 'permissions',
        message: 'Unverified creators cannot request internet access'
      });
    }

    // 2. Check pricing is reasonable
    if (manifest.pricing?.price_monthly > 50) {
      errors.push({
        field: 'pricing',
        message: 'Price exceeds maximum allowed ($50/month)'
      });
    }

    // 3. Check resource limits
    if (manifest.runtime?.max_execution_time > 60) {
      errors.push({
        field: 'runtime.max_execution_time',
        message: 'Execution time exceeds maximum (60 seconds)'
      });
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Manifest schema documented
- [ ] Validation enforced on publish
- [ ] Safety checks prevent malicious agents
- [ ] Versioning supported

---

### Task 3: Agent Marketplace (Frontend)

**Priority:** P0
**Effort:** 3 days
**Owner:** Frontend team

**Description:**
Build marketplace UI for discovering and installing agents.

**Implementation:**
```typescript
// apps/lens/app/marketplace/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { AgentCard } from '@/components/AgentCard';
import { SearchBar } from '@/components/SearchBar';

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');

  useEffect(() => {
    fetchAgents();
  }, [category, searchQuery, sortBy]);

  const fetchAgents = async () => {
    const params = new URLSearchParams({
      category: category !== 'all' ? category : '',
      search: searchQuery,
      sort: sortBy
    });

    const response = await fetch(`/api/marketplace/agents?${params}`);
    const data = await response.json();
    setAgents(data.agents);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
      <p className="text-gray-600 mb-8">
        Discover agents built by the NOUS community
      </p>

      {/* Search & Filters */}
      <div className="mb-8 flex gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search agents..."
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select"
        >
          <option value="all">All Categories</option>
          <option value="productivity">Productivity</option>
          <option value="health">Health</option>
          <option value="finance">Finance</option>
          <option value="entertainment">Entertainment</option>
          <option value="education">Education</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="select"
        >
          <option value="popular">Most Popular</option>
          <option value="recent">Recently Added</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No agents found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

// components/AgentCard.tsx
export function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
      onClick={() => router.push(`/marketplace/agents/${agent.id}`)}
    >
      {/* Icon/Screenshot */}
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
        {agent.icon ? (
          <img src={agent.icon} alt={agent.name} className="w-20 h-20" />
        ) : (
          <span className="text-6xl">🤖</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{agent.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {agent.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>⭐ {agent.rating.toFixed(1)} ({agent.reviews_count})</span>
          <span>📥 {formatInstalls(agent.installs)}</span>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">by</span>
          <span className="text-xs font-medium">{agent.creator.name}</span>
          {agent.creator.verified && <span className="text-blue-500">✓</span>}
        </div>

        {/* Price */}
        {agent.pricing.type === 'free' ? (
          <div className="text-sm font-semibold text-green-600">Free</div>
        ) : (
          <div className="text-sm font-semibold">
            ${agent.pricing.price_monthly}/month
            {agent.pricing.trial_days && (
              <span className="text-xs text-gray-500 ml-1">
                ({agent.pricing.trial_days}-day trial)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatInstalls(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
```

**Acceptance Criteria:**
- [ ] Marketplace loads in <2 seconds
- [ ] Search works accurately
- [ ] Filters work (category, sort)
- [ ] Mobile responsive
- [ ] Agent cards show key info

---

### Task 4: Revenue System (Stripe Connect)

**Priority:** P0
**Effort:** 3 days
**Owner:** Backend + Payments team

**Description:**
Implement payment processing and revenue sharing using Stripe Connect.

**Implementation:**
```typescript
// packages/payments/src/stripe-connect.ts

import Stripe from 'stripe';

export class StripeConnectService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  /**
   * Create Stripe Connect account for creator
   */
  async onboardCreator(creatorId: string, email: string): Promise<string> {
    // 1. Create Connect account
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'BR',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual'
    });

    // 2. Create account link for onboarding
    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.APP_URL}/studio/onboarding/refresh`,
      return_url: `${process.env.APP_URL}/studio/onboarding/complete`,
      type: 'account_onboarding'
    });

    // 3. Store account ID
    await this.db.collection('creators').doc(creatorId).update({
      stripe_account_id: account.id,
      stripe_onboarding_complete: false
    });

    return accountLink.url;
  }

  /**
   * Process agent subscription payment
   */
  async processSubscription(
    userId: string,
    agentId: string,
    priceMonthly: number
  ): Promise<Subscription> {
    const agent = await this.getAgent(agentId);
    const creator = await this.getCreator(agent.creator_id);

    if (!creator.stripe_account_id) {
      throw new Error('Creator not onboarded to Stripe');
    }

    // Calculate revenue split
    const creatorAmount = Math.floor(priceMonthly * 0.70 * 100); // 70% in cents
    const platformFee = Math.floor(priceMonthly * 0.30 * 100); // 30% in cents

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: await this.getOrCreateStripeCustomer(userId),
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: agent.name,
            description: agent.description,
            images: [agent.icon]
          },
          recurring: {
            interval: 'month'
          },
          unit_amount: priceMonthly * 100 // Convert to cents
        }
      }],
      application_fee_percent: 30, // Platform fee
      transfer_data: {
        destination: creator.stripe_account_id
      },
      metadata: {
        agent_id: agentId,
        user_id: userId,
        creator_id: creator.id
      }
    });

    // Store subscription
    await this.db.collection('subscriptions').doc(subscription.id).set({
      user_id: userId,
      agent_id: agentId,
      creator_id: creator.id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price_monthly: priceMonthly,
      creator_amount: creatorAmount / 100,
      platform_fee: platformFee / 100,
      created_at: new Date()
    });

    return subscription;
  }

  /**
   * Calculate monthly payouts for creators
   */
  async calculateMonthlyPayouts(): Promise<Map<string, number>> {
    const payouts = new Map<string, number>();

    // Get all active subscriptions
    const subscriptions = await this.db
      .collection('subscriptions')
      .where('status', '==', 'active')
      .get();

    // Aggregate by creator
    for (const doc of subscriptions.docs) {
      const sub = doc.data();
      const current = payouts.get(sub.creator_id) || 0;
      payouts.set(sub.creator_id, current + sub.creator_amount);
    }

    return payouts;
  }

  /**
   * Execute monthly payout to creator
   */
  async executePayouts(): Promise<void> {
    const payouts = await this.calculateMonthlyPayouts();

    for (const [creatorId, amount] of payouts) {
      const creator = await this.getCreator(creatorId);

      if (!creator.stripe_account_id) continue;
      if (amount < 10) continue; // Minimum $10 payout

      try {
        // Create payout
        await this.stripe.transfers.create({
          amount: Math.floor(amount * 100), // Convert to cents
          currency: 'usd',
          destination: creator.stripe_account_id,
          description: `NOUS Creator Payout - ${new Date().toISOString().slice(0, 7)}`
        });

        // Log payout
        await this.db.collection('payouts').add({
          creator_id: creatorId,
          amount,
          status: 'completed',
          month: new Date().toISOString().slice(0, 7),
          created_at: new Date()
        });

        // Notify creator
        await this.notifications.send(creatorId, {
          title: '💰 Payout Sent',
          body: `You received $${amount.toFixed(2)} for your agents this month.`
        });

      } catch (error) {
        console.error(`Payout failed for creator ${creatorId}:`, error);

        // Log failed payout
        await this.db.collection('payouts').add({
          creator_id: creatorId,
          amount,
          status: 'failed',
          error: error.message,
          month: new Date().toISOString().slice(0, 7),
          created_at: new Date()
        });
      }
    }
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    const user = await this.db.collection('users').doc(userId).get();
    const userData = user.data();

    if (userData?.stripe_customer_id) {
      return userData.stripe_customer_id;
    }

    // Create customer
    const customer = await this.stripe.customers.create({
      email: userData?.email,
      metadata: { user_id: userId }
    });

    // Store customer ID
    await user.ref.update({ stripe_customer_id: customer.id });

    return customer.id;
  }
}
```

**Cron Job (Monthly Payouts):**
```typescript
// functions/src/cron/monthly-payouts.ts

export const monthlyPayouts = functions.pubsub
  .schedule('0 0 1 * *') // First day of month at midnight
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const stripeConnect = new StripeConnectService();

    console.log('Starting monthly creator payouts...');

    await stripeConnect.executePayouts();

    console.log('Monthly payouts complete');
  });
```

**Acceptance Criteria:**
- [ ] Creator onboarding completes in <5 minutes
- [ ] Payment processing reliable (>99%)
- [ ] Revenue split accurate (70/30)
- [ ] Payouts automated (monthly)
- [ ] Creators notified of payouts

---

## 6. Technical Design Decisions

### 6.1 Flowise vs Custom Agent Builder

**Decision:** Use Flowise (embedded) instead of building custom visual editor.

**Rationale:**
- **Time to market:** Flowise is production-ready (6 months saved)
- **Features:** Drag-and-drop, testing, LangChain integration already built
- **Open source:** Can fork and customize if needed
- **Community:** Active development, regular updates

**Trade-offs:**
- Less control over UX
- Dependency on external project

**Mitigation:**
- Embed via iframe (can replace later if needed)
- Contribute back to Flowise project
- Fork if development stalls

---

### 6.2 Revenue Split: 70/30 vs 80/20

**Decision:** 70% to creator, 30% to platform.

**Rationale:**
- **Industry standard:** App Store (70/30), Stripe (similar)
- **Costs:** Platform covers hosting, LLM API, support
- **Competitive:** Better than most alternatives

**Example calculation:**
```
Agent subscription: $10/month
Creator earns: $7/month
Platform earns: $3/month

Platform costs per user:
- LLM API: $2
- Infrastructure: $0.50
- Payment processing: $0.40
- Net margin: $0.10

Creator margin: $7 (100% after their work is done)
```

**Alternative considered:** 80/20 split
- Rejected because: Platform margin too thin ($0 after costs)

---

### 6.3 Agent Review: Automated vs Manual

**Decision:** Hybrid (automated checks + manual review if flagged).

**Rationale:**
- **Scalability:** Can't manually review 500+ agents
- **Quality:** Automated checks catch obvious issues (malware, PII exposure)
- **Safety:** Manual review for edge cases

**Automated checks:**
- Prompt injection detection
- PII exposure scan
- Excessive permission requests
- Resource limit violations

**Manual review triggers:**
- Agent requesting internet access
- Agent dealing with sensitive data (health, finance)
- User reports (>3 reports → review queue)

---

## 7. Success Criteria

### Phase 3 is complete when:

#### Technical Criteria
- [ ] ✅ Creator Studio functional (can build agents)
- [ ] ✅ Marketplace live and searchable
- [ ] ✅ Payment processing working (Stripe Connect)
- [ ] ✅ Revenue split accurate (70/30)
- [ ] ✅ Automated payouts functioning
- [ ] ✅ Agent sandboxing enforced
- [ ] ✅ Review pipeline operational

#### Functional Criteria
- [ ] ✅ Creator can build agent in <30 minutes
- [ ] ✅ Creator can publish to marketplace
- [ ] ✅ User can discover agents via search/browse
- [ ] ✅ User can install agent with 1 click
- [ ] ✅ User can subscribe to paid agent
- [ ] ✅ Creator receives monthly payout

#### Platform Metrics
- [ ] ✅ 500+ creators onboarded
- [ ] ✅ 500+ agents in marketplace
- [ ] ✅ 10K+ agent installations
- [ ] ✅ Average agent rating >4.0 stars
- [ ] ✅ Platform GMV >$10K/month

#### Cost Metrics
- [ ] ✅ Platform takes home 30% of revenue
- [ ] ✅ Payment processing fees <3% of GMV
- [ ] ✅ Infrastructure cost <20% of platform revenue

---

## 8. Dependencies

### Prerequisites from Phases 0-2
- ✅ Agent execution runtime
- ✅ CORE Agent delegation
- ✅ VFS and CONTEXT
- ✅ Security middleware
- ✅ Frontend framework
- ✅ Authentication system

### External Dependencies
- **Flowise:** Visual agent builder (open source)
- **Stripe Connect:** Payment processing + revenue sharing
- **Cloud Run:** Agent sandboxing

### Team Dependencies
- **Legal:** Creator terms of service (2 days)
- **Design:** Marketplace UI/UX (ongoing)
- **DevOps:** Flowise hosting infrastructure (1 day)

### Risk Mitigation
- **Flowise breaks:** Have fork ready, can deploy independently
- **Payment issues:** Stripe has 99.99% uptime SLA
- **Low-quality agents:** Review pipeline + community moderation
- **Creator fraud:** KYC via Stripe, manual review for high earners

---

## Summary

**Phase 3 transforms NOUS into a platform - enabling creators to build and monetize agents.**

Key achievements:
- 🛠️ Creator Studio (visual agent builder)
- 🛍️ Agent Marketplace (discover and install)
- 💰 Revenue sharing (70/30 split)
- 🔒 Quality control (review pipeline)
- 📊 Platform economics proven

**Timeline:** 4 weeks (Weeks 19-22)
**Team:** 5-6 engineers (2 backend, 2 frontend, 1 payments, 1 QA)
**Budget:** ~$20K (Stripe setup + infrastructure)

**Next:** Scale platform (Phase 4+) - Enterprise features, API access, white-label

---

**Document Status:** ✅ Complete
**Ready for:** Implementation kickoff
