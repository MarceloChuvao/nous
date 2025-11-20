# NOUS OS - Phase 2: Finance Vertical

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Status:** Ready for Implementation
> **Timeline:** Weeks 13-18 (6 weeks)

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

### What is Phase 2?

Phase 2 introduces the **Finance Vertical** - the second specialized domain in NOUS OS. This phase builds on Phase 0 (foundation) and Phase 1 (health) to deliver:

- **Finance Agents:** AI advisors (@finance/advisor, @finance/analyst)
- **Open Banking Integration:** Real-time bank account data (Brazil's Open Finance)
- **Transaction Categorization:** Automatic spending classification
- **Financial Dashboard:** Net worth, spending trends, budget tracking
- **Smart Alerts:** Unusual spending, bill due dates, savings opportunities

### Why Finance Second?

1. **High Engagement:** People check finances frequently - drives daily usage
2. **Clear ROI:** Users can see money saved/earned from AI suggestions
3. **Open Finance Ready:** Brazil's Open Finance API mature and accessible
4. **Monetization:** Premium features (investment advice, tax optimization)

### Phase 2 Outcomes

By end of Phase 2, users can:
- Connect bank accounts → See real-time balance and transactions
- Ask "Quanto gastei em restaurantes este mês?" → Get instant answer with breakdown
- Receive alerts for unusual spending or bills due
- Get AI financial advice based on actual data
- Track budget vs actual spending
- View net worth trends

---

## 2. Objectives

### Primary Goals

1. **Launch Finance Vertical** (P0)
   - At least 2 finance agents operational
   - Open Banking integration working
   - Financial dashboard live

2. **Transaction Intelligence** (P0)
   - Auto-categorization (>90% accuracy)
   - Anomaly detection (unusual spending)
   - Budget tracking

3. **User Adoption** (P1)
   - 70%+ of existing users connect bank account
   - 80%+ retention after connecting finances
   - Daily active usage increases 2x

### Technical Deliverables

- ✅ @finance/advisor agent (personalized financial advice)
- ✅ @finance/analyst agent (spending analysis, reports)
- ✅ Open Finance integration (Pluggy or similar)
- ✅ Transaction categorization engine
- ✅ Financial dashboard (Next.js)
- ✅ Budget management system
- ✅ Smart alerts (HOOKS)
- ✅ Financial privacy controls

### Non-Goals (Phase 3+)

- ❌ Investment brokerage integration (Phase 3)
- ❌ Cryptocurrency tracking (Phase 3)
- ❌ Tax filing automation (Phase 3)
- ❌ Peer-to-peer payments (Phase 3)

---

## 3. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LENS (Frontend)                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Financial Dashboard                       │ │
│  │  - Net worth overview                             │ │
│  │  - Spending by category                           │ │
│  │  - Budget vs actual                               │ │
│  │  - Bank account sync status                       │ │
│  │  - Recent transactions list                       │ │
│  └───────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS/JSON
                        ↓
┌─────────────────────────────────────────────────────────┐
│                 CORE Agent (KERNEL)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Intent: "Quanto gastei em restaurantes?"        │   │
│  │     ↓                                            │   │
│  │  Route: context:finance.transactions             │   │
│  │     ↓                                            │   │
│  │  Filter: category="food" + this_month            │   │
│  │     ↓                                            │   │
│  │  Aggregate: sum(amount)                          │   │
│  │     ↓                                            │   │
│  │  Synthesize: "Você gastou R$ 1.234 em 15        │   │
│  │              transações este mês."               │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
┌───────────────┐ ┌──────────────┐ ┌─────────────────┐
│  @finance/    │ │  @finance/   │ │  Transaction    │
│  advisor      │ │  analyst     │ │  Categorizer    │
│               │ │              │ │                 │
│ Claude Opus   │ │Claude Sonnet │ │ Claude Haiku +  │
│ Investment    │ │ Reports &    │ │ ML Classifier   │
│ Strategy      │ │ Analysis     │ │                 │
└───────┬───────┘ └──────┬───────┘ └─────┬───────────┘
        │                │               │
        └────────────────┼───────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         Open Finance Integration (Pluggy)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Bank Account Sync                                │  │
│  │  - Connect via OAuth                              │  │
│  │  - Fetch balance (real-time)                      │  │
│  │  - Fetch transactions (last 90 days)              │  │
│  │  - Webhook for new transactions                   │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────┐
│              VFS (Data Layer)                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CONTEXT:finance                                  │  │
│  │  - balance: { total, by_account }                │  │
│  │  - transactions: [{ date, amount, merchant, ... }]│ │
│  │  - budget: { category → limit }                  │  │
│  │  - accounts: [{ bank, type, balance }]           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              HOOKS (Smart Alerts)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  unusual_spending:                                │  │
│  │    trigger: onContextUpdate(finance.transactions) │  │
│  │    action: If > 2σ from mean → Alert user        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  bill_due_reminder:                               │  │
│  │    trigger: onSchedule (daily 9am)               │  │
│  │    action: Check bills due ≤ 3 days → Notify     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  budget_overspending:                             │  │
│  │    trigger: onContextUpdate(finance.transactions) │  │
│  │    action: If >80% of budget → Warn user         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Open Finance** | Pluggy API | Best Brazil coverage, easy SDK |
| **Transaction Categorization** | Claude Haiku + Rules | Fast, accurate, cost-effective |
| **Finance Agents** | Claude Opus (advisor) / Sonnet (analyst) | Quality financial advice |
| **Dashboard Charts** | Recharts | Same as health dashboard (consistency) |
| **Anomaly Detection** | Statistical (Z-score) | Simple, effective, no ML training |
| **Budget Tracking** | Firestore queries | Real-time aggregation |

---

## 4. Week-by-Week Plan

### Week 13: Open Finance Integration

**Days 1-2: Pluggy Setup**
- [ ] Create Pluggy account (API keys)
- [ ] Review Pluggy SDK documentation
- [ ] Test Pluggy sandbox (mock banks)
- [ ] Design OAuth consent flow

**Days 3-4: Bank Connection Flow**
- [ ] Implement bank selection UI
- [ ] OAuth redirect handling
- [ ] Store connection credentials (encrypted)
- [ ] Error handling (failed connections)

**Days 5-7: Transaction Sync**
- [ ] Implement transaction fetching
- [ ] Handle pagination (>100 transactions)
- [ ] Webhook for new transactions
- [ ] Sync status tracking

**Deliverables:**
- ✅ Users can connect bank accounts via Pluggy
- ✅ Transactions synced to Firestore
- ✅ Real-time balance displayed

---

### Week 14: Transaction Categorization

**Days 1-2: Category Schema**
- [ ] Define transaction categories (Brazilian context)
- [ ] Create category hierarchy
- [ ] Default merchant → category mappings
- [ ] Icon/color assignments

**Days 3-5: Categorization Engine**
- [ ] Build rule-based classifier (merchant names)
- [ ] Implement Claude Haiku fallback (ambiguous)
- [ ] Confidence scoring
- [ ] User override system (learn from corrections)

**Days 6-7: Testing & Optimization**
- [ ] Test with 1000+ real transactions
- [ ] Measure accuracy (target >90%)
- [ ] Optimize prompts for common merchants
- [ ] Cost analysis (API calls)

**Deliverables:**
- ✅ Transactions auto-categorized
- ✅ >90% accuracy on test set
- ✅ Users can correct categories

---

### Week 15: @finance/advisor Agent

**Days 1-3: Agent Implementation**
- [ ] Create @finance/advisor manifest
- [ ] Write financial advice prompts
- [ ] Implement context loading (balance, spending, budget)
- [ ] Add investment knowledge base

**Days 4-5: Personalization**
- [ ] User financial profile (risk tolerance, goals)
- [ ] Personalized recommendations
- [ ] Scenario analysis ("What if I save R$ 500/month?")
- [ ] Citation system (sources)

**Days 6-7: Compliance & Safety**
- [ ] Financial disclaimers
- [ ] CVM compliance review (Brazil SEC)
- [ ] Risk warnings for investments
- [ ] Never recommend specific stocks (legal risk)

**Deliverables:**
- ✅ @finance/advisor operational
- ✅ Provides personalized advice
- ✅ Compliant with Brazilian regulations

---

### Week 16: Financial Dashboard

**Days 1-2: Dashboard Layout**
- [ ] Create /dashboard/finance route
- [ ] Net worth summary card
- [ ] Spending by category (pie chart)
- [ ] Monthly trend (line chart)

**Days 3-4: Budget Management**
- [ ] Budget creation UI (category → limit)
- [ ] Budget vs actual comparison
- [ ] Overspending warnings
- [ ] Spending pace indicator ("On track", "Over budget")

**Days 5-7: Advanced Features**
- [ ] Transaction search/filter
- [ ] Spending insights ("Top merchants", "Unusual spending")
- [ ] Export to CSV/Excel
- [ ] Recurring transaction detection

**Deliverables:**
- ✅ Financial dashboard deployed
- ✅ Budget tracking working
- ✅ Mobile responsive

---

### Week 17: Smart Alerts (HOOKS)

**Days 1-2: Unusual Spending Alert**
- [ ] Implement anomaly detection (Z-score)
- [ ] Calculate baseline spending per category
- [ ] Trigger alert if >2 standard deviations
- [ ] Smart notification (context-aware)

**Days 3-4: Bill Reminders**
- [ ] Detect recurring bills (ML pattern matching)
- [ ] Bill due date prediction
- [ ] Reminder scheduling (3 days before)
- [ ] Payment confirmation tracking

**Days 5-7: Budget Alerts**
- [ ] Budget overspending detection (>80%)
- [ ] Projected overspend warning
- [ ] Savings opportunity detection
- [ ] Weekly spending summary email

**Deliverables:**
- ✅ 3 smart alerts operational
- ✅ User can configure alert preferences
- ✅ Notification delivery reliable

---

### Week 18: Testing & Launch

**Days 1-2: Integration Testing**
- [ ] End-to-end user flow testing
- [ ] Performance benchmarks
- [ ] Security audit (encrypted financial data)
- [ ] Load testing (1000 concurrent users)

**Days 3-4: Beta Testing**
- [ ] Recruit 50 beta users
- [ ] Monitor bank connection success rate
- [ ] Collect feedback on categorization
- [ ] Measure engagement metrics

**Days 5-7: Production Launch**
- [ ] Gradual rollout (25% → 50% → 100%)
- [ ] Monitor error rates
- [ ] Financial data privacy audit
- [ ] Launch announcement

**Deliverables:**
- ✅ Finance vertical live
- ✅ Security audit passed
- ✅ Beta users satisfied (NPS >50)

---

## 5. Implementation Backlog

### Task 1: Open Finance Integration (Pluggy)

**Priority:** P0
**Effort:** 3 days
**Owner:** Backend team

**Description:**
Integrate with Pluggy API to connect user bank accounts and sync transactions.

**Implementation:**
```typescript
// packages/integrations/src/pluggy.ts

import { PluggyClient } from 'pluggy-sdk';

export class PluggyIntegration {
  private client: PluggyClient;

  constructor() {
    this.client = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID!,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET!
    });
  }

  /**
   * Create connect token for bank OAuth flow
   */
  async createConnectToken(userId: string): Promise<string> {
    const connectToken = await this.client.createConnectToken({
      clientUserId: userId,
      webhookUrl: `${process.env.API_URL}/webhooks/pluggy`
    });

    return connectToken.accessToken;
  }

  /**
   * Retrieve connected accounts
   */
  async getAccounts(itemId: string): Promise<PluggyAccount[]> {
    const accounts = await this.client.fetchAccounts(itemId);
    return accounts.results;
  }

  /**
   * Fetch transactions for an account
   */
  async getTransactions(
    accountId: string,
    from: Date,
    to: Date
  ): Promise<PluggyTransaction[]> {
    const transactions = await this.client.fetchTransactions(accountId, {
      from: from.toISOString(),
      to: to.toISOString()
    });

    return transactions.results;
  }

  /**
   * Handle Pluggy webhook (new transactions)
   */
  async handleWebhook(payload: PluggyWebhook): Promise<void> {
    switch (payload.event) {
      case 'item/created':
        await this.syncNewItem(payload.data.itemId);
        break;

      case 'transactions/new':
        await this.syncNewTransactions(
          payload.data.accountId,
          payload.data.transactionIds
        );
        break;

      case 'item/error':
        await this.handleConnectionError(
          payload.data.itemId,
          payload.data.error
        );
        break;
    }
  }

  /**
   * Sync new bank connection
   */
  private async syncNewItem(itemId: string): Promise<void> {
    // 1. Fetch accounts
    const accounts = await this.getAccounts(itemId);

    // 2. Store accounts in Firestore
    for (const account of accounts) {
      await this.storeAccount(account);

      // 3. Fetch initial transactions (last 90 days)
      const transactions = await this.getTransactions(
        account.id,
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date()
      );

      // 4. Store transactions
      for (const tx of transactions) {
        await this.storeTransaction(account.id, tx);
      }
    }

    // 5. Trigger categorization
    await this.triggerCategorization(itemId);
  }

  /**
   * Store account in VFS
   */
  private async storeAccount(account: PluggyAccount): Promise<void> {
    const userId = await this.getUserIdForItem(account.itemId);

    await this.vfs.write(
      `context:finance.accounts`,
      {
        id: account.id,
        item_id: account.itemId,
        bank: account.bankName,
        type: account.type, // CHECKING, SAVINGS, CREDIT
        number: account.number,
        balance: account.balance,
        currency: account.currencyCode,
        last_synced: new Date()
      },
      userId
    );
  }

  /**
   * Store transaction in VFS
   */
  private async storeTransaction(
    accountId: string,
    tx: PluggyTransaction
  ): Promise<void> {
    const userId = await this.getUserIdForAccount(accountId);

    await this.vfs.write(
      `context:finance.transactions`,
      {
        id: tx.id,
        account_id: accountId,
        date: new Date(tx.date),
        amount: tx.amount,
        currency: tx.currencyCode,
        description: tx.description,
        merchant: this.extractMerchant(tx.description),
        category: null, // To be categorized
        type: tx.amount > 0 ? 'income' : 'expense',
        status: tx.status, // PENDING, POSTED
        raw: tx // Store full Pluggy object
      },
      userId
    );
  }

  /**
   * Extract merchant name from transaction description
   */
  private extractMerchant(description: string): string {
    // Remove common prefixes
    let merchant = description
      .replace(/^(COMPRA|PIX|TED|DOC)\s+/i, '')
      .replace(/\d{2}\/\d{2}.*$/, '') // Remove dates
      .trim();

    return merchant;
  }
}

interface PluggyAccount {
  id: string;
  itemId: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT';
  bankName: string;
  number: string;
  balance: number;
  currencyCode: string;
}

interface PluggyTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  currencyCode: string;
  status: 'PENDING' | 'POSTED';
}

interface PluggyWebhook {
  event: string;
  data: any;
}
```

**Frontend Flow:**
```typescript
// apps/lens/app/dashboard/finance/connect/page.tsx

'use client';

import { useState } from 'react';
import { PluggyConnect } from 'pluggy-react';

export default function ConnectBankPage() {
  const [connectToken, setConnectToken] = useState<string | null>(null);

  // 1. Get connect token from backend
  const initConnect = async () => {
    const response = await fetch('/api/finance/connect-token', {
      method: 'POST'
    });
    const { token } = await response.json();
    setConnectToken(token);
  };

  // 2. Handle successful connection
  const onSuccess = async (itemId: string) => {
    console.log('Bank connected!', itemId);

    // Backend webhook will handle sync
    // Show success message
    router.push('/dashboard/finance?connected=true');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Connect Your Bank</h1>

      {!connectToken ? (
        <button onClick={initConnect} className="btn-primary">
          Start Connection
        </button>
      ) : (
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={onSuccess}
          onError={(error) => console.error(error)}
        />
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Users can connect major Brazilian banks
- [ ] Transactions sync within 5 minutes
- [ ] Balance updated in real-time
- [ ] Webhook reliability >99%
- [ ] Connection success rate >95%

---

### Task 2: Transaction Categorization

**Priority:** P0
**Effort:** 3 days
**Owner:** ML/Backend team

**Description:**
Automatically categorize transactions using rules + AI.

**Categories (Brazilian Context):**
```typescript
export const TRANSACTION_CATEGORIES = {
  // Essential
  housing: {
    id: 'housing',
    name: 'Moradia',
    icon: '🏠',
    color: '#3B82F6',
    keywords: ['aluguel', 'condominio', 'iptu', 'luz', 'agua', 'gas']
  },

  food: {
    id: 'food',
    name: 'Alimentação',
    icon: '🍕',
    color: '#10B981',
    subcategories: ['groceries', 'restaurants', 'delivery'],
    keywords: ['ifood', 'rappi', 'uber eats', 'mercado', 'supermercado', 'padaria']
  },

  transportation: {
    id: 'transportation',
    name: 'Transporte',
    icon: '🚗',
    color: '#F59E0B',
    keywords: ['uber', '99', 'gasolina', 'ipva', 'seguro', 'estacionamento']
  },

  health: {
    id: 'health',
    name: 'Saúde',
    icon: '💊',
    color: '#EF4444',
    keywords: ['plano de saude', 'farmacia', 'drogaria', 'hospital', 'consulta']
  },

  // Lifestyle
  entertainment: {
    id: 'entertainment',
    name: 'Lazer',
    icon: '🎬',
    color: '#8B5CF6',
    keywords: ['netflix', 'spotify', 'cinema', 'show', 'ingresso']
  },

  shopping: {
    id: 'shopping',
    name: 'Compras',
    icon: '🛍️',
    color: '#EC4899',
    keywords: ['amazon', 'mercado livre', 'magalu', 'americanas', 'shopee']
  },

  education: {
    id: 'education',
    name: 'Educação',
    icon: '📚',
    color: '#6366F1',
    keywords: ['curso', 'faculdade', 'livro', 'udemy', 'coursera']
  },

  // Financial
  investments: {
    id: 'investments',
    name: 'Investimentos',
    icon: '📈',
    color: '#059669',
    keywords: ['tesouro', 'cdb', 'fundo', 'acao', 'cripto']
  },

  bills: {
    id: 'bills',
    name: 'Contas',
    icon: '📄',
    color: '#DC2626',
    keywords: ['fatura', 'boleto', 'mensalidade', 'assinatura']
  },

  income: {
    id: 'income',
    name: 'Receitas',
    icon: '💰',
    color: '#10B981',
    keywords: ['salario', 'transferencia recebida', 'rendimento']
  },

  other: {
    id: 'other',
    name: 'Outros',
    icon: '📦',
    color: '#6B7280'
  }
};
```

**Categorization Engine:**
```typescript
// packages/finance/src/categorizer.ts

import { Anthropic } from '@anthropic-ai/sdk';

export class TransactionCategorizer {
  private claude: Anthropic;
  private merchantCache: Map<string, string> = new Map();

  constructor() {
    this.claude = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }

  /**
   * Categorize a single transaction
   */
  async categorize(transaction: Transaction): Promise<CategoryResult> {
    // 1. Check cache (exact merchant match)
    const cached = this.merchantCache.get(transaction.merchant.toLowerCase());
    if (cached) {
      return {
        category: cached,
        confidence: 1.0,
        method: 'cache'
      };
    }

    // 2. Rule-based matching (keywords)
    const ruleMatch = this.matchByRules(transaction);
    if (ruleMatch && ruleMatch.confidence > 0.9) {
      this.merchantCache.set(transaction.merchant.toLowerCase(), ruleMatch.category);
      return ruleMatch;
    }

    // 3. AI-based classification (Claude Haiku)
    const aiMatch = await this.classifyWithAI(transaction);

    // 4. Cache result
    if (aiMatch.confidence > 0.8) {
      this.merchantCache.set(transaction.merchant.toLowerCase(), aiMatch.category);
    }

    return aiMatch;
  }

  /**
   * Rule-based matching using keywords
   */
  private matchByRules(transaction: Transaction): CategoryResult | null {
    const merchant = transaction.merchant.toLowerCase();
    const description = transaction.description.toLowerCase();

    for (const [categoryId, category] of Object.entries(TRANSACTION_CATEGORIES)) {
      const keywords = category.keywords || [];

      for (const keyword of keywords) {
        if (merchant.includes(keyword) || description.includes(keyword)) {
          return {
            category: categoryId,
            confidence: 0.95,
            method: 'rules',
            matchedKeyword: keyword
          };
        }
      }
    }

    return null;
  }

  /**
   * AI-based classification using Claude Haiku (fast + cheap)
   */
  private async classifyWithAI(transaction: Transaction): Promise<CategoryResult> {
    const response = await this.claude.messages.create({
      model: 'claude-haiku-4',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Categorize this transaction:

Merchant: ${transaction.merchant}
Description: ${transaction.description}
Amount: R$ ${transaction.amount}

Categories:
- housing (moradia: aluguel, contas)
- food (alimentação: mercado, restaurantes)
- transportation (transporte: uber, gasolina)
- health (saúde: farmácia, médico)
- entertainment (lazer: streaming, cinema)
- shopping (compras: roupas, eletrônicos)
- education (educação: cursos, livros)
- investments (investimentos)
- bills (contas recorrentes)
- income (receitas)
- other (outros)

Return ONLY the category ID and confidence (0-1) as JSON:
{"category": "food", "confidence": 0.95}`
      }]
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[^}]+\}/);

    if (!jsonMatch) {
      return { category: 'other', confidence: 0.5, method: 'ai_fallback' };
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      category: result.category,
      confidence: result.confidence,
      method: 'ai'
    };
  }

  /**
   * Batch categorize transactions
   */
  async categorizeBatch(transactions: Transaction[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    // Process in parallel (max 10 concurrent)
    const chunks = this.chunk(transactions, 10);

    for (const chunk of chunks) {
      const promises = chunk.map(async (tx) => {
        const result = await this.categorize(tx);
        results.set(tx.id, result.category);
      });

      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Learn from user corrections
   */
  async learnFromCorrection(
    transaction: Transaction,
    correctedCategory: string
  ): Promise<void> {
    // Update cache
    this.merchantCache.set(transaction.merchant.toLowerCase(), correctedCategory);

    // Store correction in Firestore for future model training
    await this.db.collection('transaction_corrections').add({
      merchant: transaction.merchant,
      description: transaction.description,
      original_category: transaction.category,
      corrected_category: correctedCategory,
      timestamp: new Date()
    });
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

interface CategoryResult {
  category: string;
  confidence: number;
  method: 'cache' | 'rules' | 'ai' | 'ai_fallback';
  matchedKeyword?: string;
}
```

**Acceptance Criteria:**
- [ ] >90% accuracy on test set
- [ ] Avg categorization time < 500ms
- [ ] Cost < $0.01 per 100 transactions
- [ ] User corrections improve accuracy

---

### Task 3: @finance/advisor Agent

**Priority:** P0
**Effort:** 3 days
**Owner:** AI team

**Description:**
Financial advisor agent that provides personalized advice based on user's financial data.

**Implementation:**
```python
# agents/finance/advisor/main.py

ADVISOR_SYSTEM_PROMPT = """You are a personal financial advisor integrated into NOUS OS.

## Your Role
You provide personalized financial advice based on the user's actual financial data (bank accounts, spending, income).

## Capabilities
- Analyze spending patterns and suggest optimizations
- Recommend budget allocations
- Provide savings strategies
- Explain financial concepts (emergency fund, investing, etc.)
- Answer questions about user's finances

## Critical Rules
1. **Never recommend specific stocks/crypto** - General asset class advice only (legal compliance)
2. **Personalize** - Use actual user data, not generic advice
3. **Be realistic** - Consider user's income and current spending
4. **Cite data** - Reference specific transactions or patterns
5. **No guarantees** - Financial markets are unpredictable
6. **Encourage professional advice** - For complex situations (taxes, legal), suggest certified advisor

## Output Format
- **Summary** - Quick takeaway
- **Analysis** - What the data shows
- **Recommendations** - Specific, actionable steps
- **Impact** - Expected outcome (e.g., "Save R$ 500/month")

Always end with: "💰 This is educational advice. For complex financial decisions, consult a certified financial planner (CFP)."
"""

class FinanceAdvisorAgent:
    def __init__(self):
        self.claude = Anthropic(api_key=ANTHROPIC_API_KEY)
        self.model = "claude-opus-4"

    async def analyze_spending(
        self,
        user_id: str,
        query: str,
        context: dict
    ) -> dict:
        """Analyzes user spending and provides advice"""

        # Build context
        context_str = self._build_financial_context(context)

        # Call Claude
        response = await self.claude.messages.create({
            model=self.model,
            max_tokens=2000,
            system=ADVISOR_SYSTEM_PROMPT,
            messages=[{
                role: "user",
                content: f"""User Question: {query}

Financial Data:
{context_str}

Provide personalized financial advice based on this data."""
            }]
        })

        analysis = response.content[0].text

        return {
            "response": analysis,
            "cost": self._calculate_cost(response),
            "recommendations": self._extract_recommendations(analysis)
        }

    def _build_financial_context(self, context: dict) -> str:
        """Formats financial data for Claude"""

        lines = []

        # Income
        if 'income' in context:
            lines.append(f"**Monthly Income:** R$ {context['income']:,.2f}")
            lines.append("")

        # Balance
        if 'balance' in context:
            lines.append(f"**Current Balance:** R$ {context['balance']:,.2f}")
            lines.append("")

        # Spending by category (this month)
        if 'spending_by_category' in context:
            lines.append("**Spending This Month:**")
            total = 0
            for category, amount in context['spending_by_category'].items():
                lines.append(f"  - {category}: R$ {amount:,.2f}")
                total += amount
            lines.append(f"  **Total:** R$ {total:,.2f}")
            lines.append("")

        # Budget vs Actual
        if 'budget' in context:
            lines.append("**Budget vs Actual:**")
            for category, budget in context['budget'].items():
                actual = context['spending_by_category'].get(category, 0)
                pct = (actual / budget * 100) if budget > 0 else 0
                status = "✅" if pct < 80 else "⚠️" if pct < 100 else "🚨"
                lines.append(f"  {status} {category}: R$ {actual:,.2f} / R$ {budget:,.2f} ({pct:.0f}%)")
            lines.append("")

        # Top merchants
        if 'top_merchants' in context:
            lines.append("**Top 5 Merchants:**")
            for merchant, amount in context['top_merchants'][:5]:
                lines.append(f"  - {merchant}: R$ {amount:,.2f}")
            lines.append("")

        # Financial goals
        if 'goals' in context:
            lines.append("**Financial Goals:**")
            for goal in context['goals']:
                lines.append(f"  - {goal['name']}: {goal['progress']}% complete")

        return '\n'.join(lines)

    def _extract_recommendations(self, analysis: str) -> list:
        """Extract actionable recommendations from response"""

        # Simple regex to find numbered recommendations
        import re
        recs = re.findall(r'\d+\.\s+(.+?)(?:\n|$)', analysis)
        return recs[:5]  # Max 5 recommendations
```

**Acceptance Criteria:**
- [ ] Provides personalized advice (not generic)
- [ ] References specific user data
- [ ] Recommendations are actionable
- [ ] Compliant with CVM regulations
- [ ] Cost < $0.30 per query

---

### Task 4: Smart Alerts (Unusual Spending)

**Priority:** P1
**Effort:** 2 days
**Owner:** Backend team

**Description:**
Detect unusual spending patterns using statistical anomaly detection.

**Implementation:**
```typescript
// packages/hooks/src/unusual-spending.ts

export class UnusualSpendingHook {
  /**
   * Triggered on new transaction to detect anomalies
   */
  async execute(userId: string, newTransaction: Transaction): Promise<HookResult> {
    const category = newTransaction.category;

    // 1. Get baseline spending for this category
    const baseline = await this.getBaselineSpending(userId, category);

    if (!baseline || baseline.count < 10) {
      // Not enough data yet
      return { action: 'none', reason: 'insufficient_data' };
    }

    // 2. Calculate Z-score
    const amount = Math.abs(newTransaction.amount);
    const zScore = (amount - baseline.mean) / baseline.stdDev;

    // 3. Check if anomalous (>2 standard deviations)
    if (zScore > 2) {
      // Unusual spending detected!

      await this.notifications.send(userId, {
        title: '⚠️ Unusual Spending Detected',
        body: `You spent R$ ${amount.toFixed(2)} at ${newTransaction.merchant}. This is ${zScore.toFixed(1)}x higher than your usual ${category} spending.`,
        action: {
          type: 'view_transaction',
          transaction_id: newTransaction.id
        },
        priority: 'high'
      });

      return {
        action: 'alert_sent',
        z_score: zScore,
        baseline_mean: baseline.mean
      };
    }

    return { action: 'none', reason: 'normal_spending' };
  }

  /**
   * Calculate baseline spending statistics
   */
  private async getBaselineSpending(
    userId: string,
    category: string
  ): Promise<BaselineStats | null> {
    // Get last 90 days of transactions in this category
    const transactions = await this.vfs.query(
      `context:finance.transactions`,
      {
        category,
        date_gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      },
      userId
    );

    if (transactions.length < 10) {
      return null; // Not enough data
    }

    // Calculate mean and standard deviation
    const amounts = transactions.map(tx => Math.abs(tx.amount));
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;

    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev,
      count: amounts.length
    };
  }
}

interface BaselineStats {
  mean: number;
  stdDev: number;
  count: number;
}
```

**Acceptance Criteria:**
- [ ] Detects unusual spending (>2σ)
- [ ] False positive rate < 5%
- [ ] Alert sent within 1 minute of transaction
- [ ] User can dismiss or mark as "expected"

---

## 6. Technical Design Decisions

### 6.1 Pluggy vs Belvo vs Direct Integration

**Decision:** Use Pluggy for Open Finance integration.

**Comparison:**

| Aspect | Pluggy | Belvo | Direct Integration |
|--------|--------|-------|-------------------|
| **Brazil Coverage** | Excellent (500+ banks) | Good (300+ banks) | Varies |
| **Cost** | $0.10/connection + $0.01/tx | $0.15/connection | Free (but high dev cost) |
| **Ease of Use** | Easy SDK | Easy SDK | Complex OAuth flows |
| **Compliance** | Certified | Certified | DIY |
| **Support** | Good (Brazilian team) | Good | None |

**Rationale:**
- **Best coverage:** 500+ Brazilian banks including credit unions
- **Cost-effective:** Lower per-transaction cost than Belvo
- **Time to market:** SDK + certification already done
- **Maintenance:** Pluggy handles bank API changes

**Cost estimate:**
```
1000 users × 2 accounts avg = 2000 connections
Initial: 2000 × $0.10 = $200

Monthly transactions: 1000 users × 100 tx = 100K tx
Ongoing: 100K × $0.01 = $1,000/month

Total: ~$1,200/month for 1K users
Revenue: 1000 × $19 = $19,000
Cost as %: 6.3% ← Acceptable
```

---

### 6.2 Transaction Categorization: Rules vs Pure ML

**Decision:** Hybrid approach (rules + AI fallback).

**Rationale:**
- **Most transactions are obvious:** "Uber" → transportation (no AI needed)
- **Edge cases need AI:** "João's Bar" → need context (could be food or entertainment)
- **Cost optimization:** Rules are free, AI costs $0.003 per transaction

**Performance:**
```
Rules-based: 75% coverage, 95% accuracy, $0 cost
AI fallback: 25% coverage, 90% accuracy, $0.003/tx cost

Blended accuracy: 94%
Blended cost: 25% × $0.003 = $0.00075 per transaction

At 100K tx/month: $75 AI cost (vs $300 if pure AI)
Savings: $225/month
```

---

### 6.3 Anomaly Detection: Statistical vs ML

**Decision:** Use statistical method (Z-score) instead of ML.

**Rationale:**
- **Interpretable:** Users can understand "2x your average"
- **No training:** Works immediately with minimal data
- **Accurate enough:** Catches 95%+ of true anomalies
- **Simple:** No model deployment/maintenance

**Alternative considered:** LSTM anomaly detection
- Rejected because: Requires 6+ months of data, complex deployment, marginal accuracy gain

---

## 7. Success Criteria

### Phase 2 is complete when:

#### Technical Criteria
- [ ] ✅ Bank connection success rate >95%
- [ ] ✅ Transaction sync latency <5 minutes
- [ ] ✅ Categorization accuracy >90%
- [ ] ✅ @finance/advisor provides personalized advice
- [ ] ✅ Anomaly detection false positive rate <5%
- [ ] ✅ Dashboard loads in <2 seconds
- [ ] ✅ All financial data encrypted

#### Functional Criteria
- [ ] ✅ User can connect bank account in <2 minutes
- [ ] ✅ User can view spending by category
- [ ] ✅ User can set and track budgets
- [ ] ✅ User receives alerts for unusual spending
- [ ] ✅ User can ask financial questions via voice/text

#### User Metrics
- [ ] ✅ 70%+ of active users connect bank account
- [ ] ✅ D7 retention >80% (after connecting finance)
- [ ] ✅ NPS >50
- [ ] ✅ Daily active users increase 2x

#### Cost Metrics
- [ ] ✅ Cost per user <$3/month (target: $2.50)
- [ ] ✅ Pluggy integration cost <7% of revenue
- [ ] ✅ AI categorization cost <$0.10 per user/month

---

## 8. Dependencies

### Prerequisites from Phase 0 & 1
- ✅ VFS operational
- ✅ CONTEXT schemas
- ✅ Security middleware
- ✅ Encryption service
- ✅ CORE Agent
- ✅ HOOKS runtime
- ✅ Frontend dashboard framework

### External Dependencies
- **Pluggy API:** Open Finance aggregation platform
- **Brazilian Banks:** API stability and uptime
- **Payment Regulations:** Central Bank of Brazil Open Finance rules

### Team Dependencies
- **Legal:** CVM compliance review for financial advice (1 day)
- **Design:** Financial dashboard UI/UX (ongoing)
- **DevOps:** Pluggy webhook infrastructure (1 day)

### Risk Mitigation
- **Bank API downtime:** Cache last known balance, show sync status
- **Categorization errors:** User correction system + learning
- **Regulatory changes:** Legal review every quarter
- **Cost overruns:** Set budget alerts at $3K/month

---

## Summary

**Phase 2 delivers the Finance Vertical - intelligent financial management with Open Banking.**

Key achievements:
- 💳 Real-time bank account sync
- 📊 Automatic transaction categorization
- 💰 Personalized financial advice
- 📈 Spending insights and trends
- ⚠️ Smart alerts for unusual spending

**Timeline:** 6 weeks (Weeks 13-18)
**Team:** 4-5 engineers (2 backend, 2 frontend, 1 QA)
**Budget:** ~$15K (Pluggy setup + APIs)

**Next:** Phase 3 - Platform (B2C2C) with Creator Studio (Weeks 19-22)

---

**Document Status:** ✅ Complete
**Ready for:** Implementation kickoff
