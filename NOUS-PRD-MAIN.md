# NOUS OS - Product Requirements Document (Main)

> **Version:** 2.2.0
> **Last Updated:** 2025-01-19
> **Status:** Production Ready - Modular Architecture
>
> **Purpose:** This is the main PRD that provides a high-level overview and references detailed specifications by phase.

---

## 📚 Document Structure

This PRD is organized as a modular system for easier navigation and implementation:

### Core Documents

1. **[NOUS-PRD-MAIN.md](./NOUS-PRD-MAIN.md)** (this file)
   - Vision & Philosophy
   - High-level architecture
   - Core concepts overview
   - References to detailed specs

### Phase-Specific Implementation

2. **[Phase 0: Foundation](./phases/PHASE-0-FOUNDATION.md)** ⭐ START HERE
   - Data Layer (VFS, Firestore schemas)
   - Authentication & Security basics
   - CORE Agent implementation
   - Timeline: Weeks 1-4

3. **[Phase 1: Health Vertical](./phases/PHASE-1-HEALTH.md)**
   - Health agents (@health/physician, @health/nutritionist)
   - Medical document processing (OCR)
   - Health dashboard
   - Timeline: Weeks 5-12

4. **[Phase 2: Finance Vertical](./phases/PHASE-2-FINANCE.md)**
   - Finance agents (@finance/advisor)
   - Open Banking integration
   - Transaction categorization
   - Timeline: Weeks 13-18

5. **[Phase 3: Platform (B2C2C)](./phases/PHASE-3-PLATFORM.md)**
   - Creator Studio (Flowise)
   - Agent marketplace
   - Revenue system
   - Timeline: Weeks 19-22

### Technical Specifications

6. **[Security & Privacy Spec](./specs/SECURITY-SPEC.md)** 🔒 CRITICAL
   - Zero-Trust architecture
   - Agent sandboxing
   - Encryption service
   - Anomaly detection

7. **[Compliance Spec (LGPD/GDPR)](./specs/COMPLIANCE-SPEC.md)** ⚖️ LEGAL REQUIREMENT
   - Data Protection Officer
   - Consent management
   - Data subject rights
   - Breach notification

8. **[Monitoring & Observability Spec](./specs/MONITORING-SPEC.md)**
   - Dashboards (System, Agent, User, Cost, Security)
   - Alerting rules (P0-P3)
   - SLOs (99.9% uptime)
   - Incident response

9. **[CORE Agent Spec](./working/CORE-AGENT-SPEC.md)** (already exists)
   - LangGraph workflow
   - Conversation memory (RAG)
   - Voice integration
   - Intent understanding

10. **[Data Layer Spec](./specs/DATA-LAYER-SPEC.md)**
    - IDENTITY, CONTEXT, PROFILE, VAULT
    - VFS abstraction
    - Firestore schemas
    - Vector DB (Pinecone)

11. **[Performance & Cost Optimization Spec](./specs/PERFORMANCE-SPEC.md)**
    - Multi-layer caching
    - LLM cost optimization
    - Database optimization

---

## 1. Vision & Philosophy

### What is NOUS OS?

**NOUS OS** is an **Operating System for Human Life** - a digital extension of your mind that:

- **Knows you deeply:** Understands your values, priorities, health, finances, and goals
- **Acts proactively:** Monitors, analyzes, and takes action without constant prompting
- **Respects boundaries:** Operates within strict limits you define
- **Evolves with you:** Learns from every interaction and adapts to your changing needs

### Core Principles

#### 1. Privacy First
- Your data NEVER leaves your control
- End-to-end encryption
- You own 100% of your data
- Export/delete anytime

#### 2. Proactive Intelligence
- Don't ask → NOUS monitors and alerts
- Automation via HOOKS (event-driven)
- Context-aware decisions

#### 3. Human Agency
- NOUS suggests, YOU decide
- Explicit approval for critical actions
- Transparent reasoning

#### 4. Platform Thinking
- B2C2C model (Users + Creators + Marketplace)
- Creators build agents visually (no-code)
- Revenue sharing ecosystem

### Inspiration

**Four-Layer Personal AI Infrastructure** (Daniel Miessler):

1. **IDENTITY** - Who you are (values, boundaries, priorities)
2. **CONTEXT** - Current state (health metrics, bank balance, active tasks)
3. **PROFILE** - Complete history (queryable life log)
4. **AGENTS** - Specialized AI workers that act on your behalf

---

## 2. System Architecture (High-Level)

```
┌────────────────────────────────────────────────────────────┐
│                        NOUS OS                             │
│              (Operating System for Life)                   │
└────────────────────────────────────────────────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      ↓                     ↓                     ↓
┌──────────┐          ┌──────────┐          ┌──────────┐
│   LENS   │          │  KERNEL  │          │   VFS    │
│(Next.js) │ ←────────│ (CORE    │─────────→│(Storage) │
│Frontend  │          │  Agent)  │          │Abstract  │
└──────────┘          └──────────┘          └──────────┘
 🎤 Voice                   │                     │
 💬 Text             ┌──────┴──────┐              │
                     ↓             ↓              │
              ┌────────────┐ ┌───────────┐       │
              │ Sub-Agents │ │  Modules  │       │
              │  (Python,  │ │  (#vision,│←──────┘
              │  Markdown, │ │  #search, │
              │  Flowise)  │ │  #calc)   │
              └────────────┘ └───────────┘
                     │             │
                     ↓             ↓
              ┌────────────────────────────┐
              │       DATA LAYER           │
              ├────────────────────────────┤
              │ IDENTITY  │  CONTEXT       │
              │ PROFILE   │  VAULT         │
              │ HOOKS     │  WORKING       │
              │ LOGS      │  OUTPUT_FORMAT │
              └────────────────────────────┘
```

### Key Components

#### LENS (Frontend)
- Next.js 14 with App Router
- Voice-first interface (Whisper + TTS)
- Real-time updates (Server-Sent Events)
- Beautiful UI with Tailwind CSS

#### KERNEL (Backend Orchestration)
- **CORE Agent**: Stateful conversational interface (LangGraph)
- Sub-agents: Specialized workers (@health/*, @finance/*, @life/*)
- Modules: Reusable capabilities (#vision, #search, #calculations)
- Context Manager: Loads IDENTITY, CONTEXT, PROFILE

#### VFS (Virtual File System)
- Unified API over Firestore + Storage + Vector DB
- Abstraction layer for data access
- Handles caching, permissions, encryption

#### DATA LAYER
- **IDENTITY**: Who you are (values, boundaries, priorities)
- **CONTEXT**: Current state (health, finance, calendar)
- **PROFILE**: Historical life log (queryable API)
- **VAULT**: Multi-cloud file sync
- **HOOKS**: Event-driven automation
- **WORKING**: Active tasks
- **LOGS**: Immutable audit trail

---

## 3. Core Concepts

### 3.1 IDENTITY
Define who you are - your values, boundaries, and priorities.

**Files:**
- `identity/persona.md` - How NOUS communicates
- `identity/boundaries.md` - Hard limits (financial, health, privacy)
- `identity/priorities.md` - P0-P4 conflict resolution matrix

**See:** [Data Layer Spec](./specs/DATA-LAYER-SPEC.md) for implementation details.

### 3.2 CONTEXT
Current state of your life - structured, queryable data.

**Structure:**
```
context:health.bloodwork[latest]
context:finance.balance
context:calendar.today
```

**See:** [Phase 0: Foundation](./phases/PHASE-0-FOUNDATION.md) for schemas.

### 3.3 PROFILE
Queryable API for your complete life history.

**Query examples:**
```typescript
profile.query("What was my last meeting with client X?")
profile.query("When did I start taking medication Y?")
profile.query("How has my cholesterol changed over 2 years?")
```

**See:** [profile/README.md](./profile/README.md) for full specification.

### 3.4 CORE Agent
The conversational interface - your primary way to interact with NOUS.

**Key features:**
- Stateful (remembers conversation)
- Voice-first (Whisper + TTS)
- Memory (RAG over conversation history)
- Intelligent routing (knows where to search)
- Delegates to sub-agents when needed

**See:** [CORE Agent Spec](./working/CORE-AGENT-SPEC.md) for implementation.

---

## 4. Technical Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Real-time:** Server-Sent Events
- **Voice:** Web Audio API + HTML5 Audio

### Backend
- **Runtime:** Firebase Functions (Node.js) + Cloud Run (Python)
- **Database:** Firestore (primary)
- **Storage:** Cloud Storage (multi-region)
- **Vector DB:** Pinecone (for RAG)
- **Auth:** Firebase Auth + 2FA
- **Orchestration:** LangGraph (CORE Agent)

### AI & Voice
- **LLM:** Claude Sonnet 4 (primary), Haiku (simple), Opus (complex)
- **Embeddings:** text-embedding-3-small (OpenAI)
- **Voice Input:** Whisper API
- **Voice Output:** OpenAI TTS (tts-1-hd)

### Infrastructure
- **Cloud:** Google Cloud Platform
- **Region:** southamerica-east1 (primary), us-central1 (secondary)
- **CDN:** Cloud CDN
- **Monitoring:** Cloud Monitoring + Grafana
- **Alerting:** PagerDuty (P0), Slack (P1-P3)

---

## 5. Implementation Phases

### ⭐ Phase 0: Foundation (Weeks 1-4)
**Goal:** Core infrastructure ready for agent development

**Deliverables:**
- ✅ Monorepo setup (TurboRepo)
- ✅ Firebase project configured
- ✅ Data Layer (VFS, schemas)
- ✅ CORE Agent (basic)
- ✅ Security middleware
- ✅ Authentication flow

**See:** [Phase 0 Implementation Plan](./phases/PHASE-0-FOUNDATION.md)

---

### 🏥 Phase 1: Health Vertical (Weeks 5-12)
**Goal:** First vertical live - users can manage health data with AI assistance

**Deliverables:**
- ✅ @health/physician agent
- ✅ Medical document OCR
- ✅ Health dashboard
- ✅ Medication reminders (HOOKS)

**See:** [Phase 1 Implementation Plan](./phases/PHASE-1-HEALTH.md)

---

### 💰 Phase 2: Finance Vertical (Weeks 13-18)
**Goal:** Second vertical live - users can manage finances with AI

**Deliverables:**
- ✅ @finance/advisor agent
- ✅ Open Banking integration
- ✅ Transaction categorization
- ✅ Financial dashboard

**See:** [Phase 2 Implementation Plan](./phases/PHASE-2-FINANCE.md)

---

### 🛍️ Phase 3: Platform (B2C2C) (Weeks 19-22)
**Goal:** Creator marketplace live

**Deliverables:**
- ✅ Creator Studio (Flowise)
- ✅ Agent marketplace
- ✅ Payment processing
- ✅ Revenue sharing

**See:** [Phase 3 Implementation Plan](./phases/PHASE-3-PLATFORM.md)

---

## 6. Critical Requirements (Before Launch)

### 🔒 Security (P0)
- [ ] Zero-Trust architecture implemented
- [ ] Agent sandboxing active
- [ ] Encryption service (AES-256-GCM)
- [ ] Anomaly detection
- [ ] Security dashboard

**See:** [Security Spec](./specs/SECURITY-SPEC.md)

### ⚖️ Compliance (P0)
- [ ] LGPD compliance (DPO, consent, data rights)
- [ ] GDPR compliance (if EU users)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie policy

**See:** [Compliance Spec](./specs/COMPLIANCE-SPEC.md)

### 📊 Monitoring (P0)
- [ ] System health dashboard
- [ ] Alerting configured (P0-P3)
- [ ] SLOs defined (99.9% uptime)
- [ ] On-call rotation setup

**See:** [Monitoring Spec](./specs/MONITORING-SPEC.md)

---

## 7. Success Metrics

### User Metrics (Target: End of 2025)
- **MAU:** 10,000
- **Retention D7:** 60%
- **Retention D30:** 40%
- **NPS:** > 50

### Platform Metrics
- **Creators:** 500+
- **Marketplace Agents:** 500+
- **Revenue Split:** 70/30 (creator/platform)

### Technical Metrics
- **API Uptime:** 99.9%
- **P95 Latency:** < 2s
- **Cost per User:** < $12/month (target after optimization)

### Business Metrics
- **MRR:** $200K
- **CAC:** < $50
- **LTV:CAC:** > 3:1

---

## 8. Getting Started

### For Developers

1. **Read Foundation Phase:**
   - [Phase 0: Foundation](./phases/PHASE-0-FOUNDATION.md)
   - Setup monorepo, Firebase, implement VFS

2. **Review Critical Specs:**
   - [Security Spec](./specs/SECURITY-SPEC.md)
   - [Data Layer Spec](./specs/DATA-LAYER-SPEC.md)
   - [CORE Agent Spec](./working/CORE-AGENT-SPEC.md)

3. **Follow Implementation Plan:**
   - Each phase has detailed backlog
   - Technical design decisions documented
   - Code examples provided

### For Product/Business

1. **Understand Vision:**
   - This document (sections 1-2)
   - [NOUS-COMO-FUNCIONA.md](./NOUS-COMO-FUNCIONA.md)

2. **Review Compliance:**
   - [Compliance Spec](./specs/COMPLIANCE-SPEC.md)
   - Legal requirements (LGPD/GDPR)

3. **Track Progress:**
   - Each phase has milestone dates
   - Success metrics defined

---

## 9. Document Index

### Core PRD
- **[NOUS-PRD-MAIN.md](./NOUS-PRD-MAIN.md)** - This document

### Implementation Phases
- **[Phase 0: Foundation](./phases/PHASE-0-FOUNDATION.md)** - Weeks 1-4
- **[Phase 1: Health](./phases/PHASE-1-HEALTH.md)** - Weeks 5-12
- **[Phase 2: Finance](./phases/PHASE-2-FINANCE.md)** - Weeks 13-18
- **[Phase 3: Platform](./phases/PHASE-3-PLATFORM.md)** - Weeks 19-22

### Technical Specifications
- **[Security Spec](./specs/SECURITY-SPEC.md)** - Zero-Trust, encryption, sandboxing
- **[Compliance Spec](./specs/COMPLIANCE-SPEC.md)** - LGPD/GDPR
- **[Monitoring Spec](./specs/MONITORING-SPEC.md)** - Dashboards, alerting, SLOs
- **[CORE Agent Spec](./working/CORE-AGENT-SPEC.md)** - Conversational AI
- **[Data Layer Spec](./specs/DATA-LAYER-SPEC.md)** - VFS, schemas, CONTEXT
- **[Performance Spec](./specs/PERFORMANCE-SPEC.md)** - Caching, optimization

### Supporting Documents
- **[NOUS-COMO-FUNCIONA.md](./NOUS-COMO-FUNCIONA.md)** - How NOUS works (user-facing)
- **[NOUS-MELHORIAS-E-GAPS.md](./NOUS-MELHORIAS-E-GAPS.md)** - Improvements & gaps analysis
- **[output_formats/README.md](./output_formats/README.md)** - Response templates
- **[profile/README.md](./profile/README.md)** - Profile API (life log)
- **[hooks/README.md](./hooks/README.md)** - Event-driven automation

---

## 10. Version History

```yaml
v2.2.0 (2025-01-19):
  - Reorganized into modular structure (main PRD + phase docs + specs)
  - Added critical production sections (Security, Compliance, Monitoring)
  - Total documentation: ~6,000 lines across 15+ files
  - Status: Production-ready

v2.1.0 (2025-01-19):
  - Replaced Dispatcher with CORE Agent (stateful, conversational)
  - Added voice support (Whisper + TTS)
  - Added conversation memory (RAG)

v2.0.0 (2025-01-19):
  - Unified all previous PRDs into single document

v1.x (2025-01-12):
  - Multiple separate documents with conflicts
```

---

**This is the single source of truth for NOUS OS.**

All implementation details are referenced from this main document. Start with [Phase 0: Foundation](./phases/PHASE-0-FOUNDATION.md) for hands-on development.
