# NOUS OS - Performance & Cost Optimization Specification

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Status:** Ongoing Optimization
> **Applies To:** All Phases

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Multi-Layer Caching](#2-multi-layer-caching)
3. [LLM Cost Optimization](#3-llm-cost-optimization)
4. [Database Optimization](#4-database-optimization)
5. [Frontend Performance](#5-frontend-performance)
6. [Network Optimization](#6-network-optimization)
7. [Cost Monitoring](#7-cost-monitoring)
8. [Implementation Guide](#8-implementation-guide)

---

## 1. Overview

### Performance Goals

| Metric | Target | Current (Baseline) | Status |
|--------|--------|-------------------|--------|
| **API Latency (P95)** | <2 seconds | ~3 seconds | 🔴 Needs work |
| **Dashboard Load** | <2 seconds | ~4 seconds | 🔴 Needs work |
| **Cache Hit Rate** | >80% | ~40% | 🔴 Needs work |
| **LLM Cost per User** | <$2/month | $3.50/month | 🟡 Close |
| **Infrastructure Cost per User** | <$1/month | $1.20/month | 🟡 Close |

### Cost Breakdown (Per 1000 Users)

```yaml
current_monthly_costs:
  llm_apis: $3,500      # Claude, OpenAI
  infrastructure: $1,200 # Cloud Run, Firestore
  vector_db: $70        # Pinecone
  monitoring: $100      # Grafana, PagerDuty
  other: $130           # Misc services
  total: $5,000

  cost_per_user: $5.00/month
  revenue_per_user: $19/month
  gross_margin: 73.7%

optimized_monthly_costs:
  llm_apis: $2,000      # ↓ 43% via caching + prompt engineering
  infrastructure: $800   # ↓ 33% via optimization
  vector_db: $70        # Same
  monitoring: $100      # Same
  other: $130           # Same
  total: $3,100

  cost_per_user: $3.10/month
  revenue_per_user: $19/month
  gross_margin: 83.7% ✨
```

### Optimization Priorities

1. **LLM Cost** (P0) - Biggest cost, biggest opportunity
2. **Caching** (P0) - Improves speed AND reduces cost
3. **Database Queries** (P1) - Affects latency
4. **Frontend Bundle Size** (P1) - Affects load time
5. **API Payload Size** (P2) - Network optimization

---

## 2. Multi-Layer Caching

### 2.1 Cache Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Request Flow                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Request                                           │
│       ↓                                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │  Layer 1: Memory Cache (In-Process)          │      │
│  │  - Latency: ~1ms                             │      │
│  │  - TTL: 5 minutes                            │      │
│  │  - Storage: LRU map (256 MB)                 │      │
│  └─────────────┬────────────────────────────────┘      │
│                │ MISS                                   │
│                ↓                                        │
│  ┌──────────────────────────────────────────────┐      │
│  │  Layer 2: Redis (Distributed)                │      │
│  │  - Latency: ~10ms                            │      │
│  │  - TTL: 1 hour                               │      │
│  │  - Storage: 2 GB                             │      │
│  └─────────────┬────────────────────────────────┘      │
│                │ MISS                                   │
│                ↓                                        │
│  ┌──────────────────────────────────────────────┐      │
│  │  Layer 3: Firestore                          │      │
│  │  - Latency: ~100ms                           │      │
│  │  - TTL: Persistent                           │      │
│  └─────────────┬────────────────────────────────┘      │
│                │                                        │
│                ↓                                        │
│           Response                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 What to Cache

```typescript
// packages/cache/src/cache-config.ts

export const CACHE_CONFIG = {
  // User data (rarely changes)
  user_profile: {
    layers: ['memory', 'redis'],
    ttl: {
      memory: 300, // 5 minutes
      redis: 3600  // 1 hour
    }
  },

  // Context data (changes moderately)
  context_health: {
    layers: ['redis'],
    ttl: {
      redis: 600 // 10 minutes
    }
  },

  context_finance: {
    layers: ['redis'],
    ttl: {
      redis: 300 // 5 minutes (fresher for finance)
    }
  },

  // Agent responses (LLM outputs - can be expensive)
  agent_response: {
    layers: ['memory', 'redis'],
    ttl: {
      memory: 600,  // 10 minutes
      redis: 86400  // 24 hours
    },
    key_strategy: 'semantic', // Hash of query intent
    invalidate_on: ['context_update']
  },

  // Embeddings (expensive to compute)
  embeddings: {
    layers: ['redis'],
    ttl: {
      redis: 2592000 // 30 days
    }
  },

  // API responses (third-party APIs)
  external_api: {
    layers: ['redis'],
    ttl: {
      redis: 300 // 5 minutes
    }
  }
};
```

### 2.3 Cache Implementation

```typescript
// packages/cache/src/multi-layer-cache.ts

import Redis from 'ioredis';
import LRU from 'lru-cache';

export class MultiLayerCache {
  private memory: LRU<string, any>;
  private redis: Redis;

  constructor() {
    // Layer 1: Memory (in-process)
    this.memory = new LRU({
      max: 1000, // Max 1000 items
      maxSize: 256 * 1024 * 1024, // 256 MB
      sizeCalculation: (value) => JSON.stringify(value).length,
      ttl: 5 * 60 * 1000 // 5 minutes
    });

    // Layer 2: Redis (distributed)
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
  }

  /**
   * Get value from cache (checks layers in order)
   */
  async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    const layers = config?.layers || ['memory', 'redis'];

    // Check memory first
    if (layers.includes('memory')) {
      const memoryValue = this.memory.get(key);
      if (memoryValue !== undefined) {
        this.metrics.recordHit('memory');
        return memoryValue as T;
      }
    }

    // Check Redis second
    if (layers.includes('redis')) {
      const redisValue = await this.redis.get(key);
      if (redisValue) {
        const parsed = JSON.parse(redisValue);
        this.metrics.recordHit('redis');

        // Backfill memory cache
        if (layers.includes('memory')) {
          this.memory.set(key, parsed);
        }

        return parsed as T;
      }
    }

    this.metrics.recordMiss();
    return null;
  }

  /**
   * Set value in cache (writes to all layers)
   */
  async set<T>(key: string, value: T, config?: CacheConfig): Promise<void> {
    const layers = config?.layers || ['memory', 'redis'];
    const ttl = config?.ttl || {};

    // Write to memory
    if (layers.includes('memory')) {
      this.memory.set(key, value, {
        ttl: (ttl.memory || 300) * 1000 // Convert to ms
      });
    }

    // Write to Redis
    if (layers.includes('redis')) {
      await this.redis.setex(
        key,
        ttl.redis || 3600,
        JSON.stringify(value)
      );
    }
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(key: string): Promise<void> {
    this.memory.delete(key);
    await this.redis.del(key);
  }

  /**
   * Invalidate by pattern (Redis only)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * Semantic caching for agent responses
   */
  async getSemanticallyCached(query: string): Promise<any | null> {
    // Generate embedding for query
    const embedding = await this.embeddings.create(query);

    // Find similar queries in vector DB
    const similar = await this.vectorDB.query({
      vector: embedding,
      topK: 1,
      filter: { type: 'agent_response' },
      includeMetadata: true
    });

    // If similarity >0.95, use cached response
    if (similar.matches[0]?.score > 0.95) {
      const cacheKey = similar.matches[0].id;
      return await this.get(cacheKey);
    }

    return null;
  }

  /**
   * Cache agent response with semantic key
   */
  async setSemanticallyCached(query: string, response: any): Promise<void> {
    const embedding = await this.embeddings.create(query);
    const cacheKey = `agent_response:${hash(query)}`;

    // Store in cache
    await this.set(cacheKey, response, {
      layers: ['redis'],
      ttl: { redis: 86400 } // 24 hours
    });

    // Store embedding in vector DB
    await this.vectorDB.upsert({
      vectors: [{
        id: cacheKey,
        values: embedding,
        metadata: {
          type: 'agent_response',
          query,
          timestamp: new Date().toISOString()
        }
      }]
    });
  }
}

interface CacheConfig {
  layers?: ('memory' | 'redis')[];
  ttl?: {
    memory?: number;
    redis?: number;
  };
}
```

### 2.4 Cache Invalidation

```typescript
// packages/cache/src/invalidation.ts

export class CacheInvalidation {
  /**
   * Invalidate cache when context updates
   */
  async onContextUpdate(userId: string, domain: string): Promise<void> {
    // Invalidate user's context cache
    await this.cache.invalidatePattern(`context:${userId}:${domain}:*`);

    // Invalidate agent responses that used this context
    await this.cache.invalidatePattern(`agent_response:${userId}:${domain}:*`);
  }

  /**
   * Invalidate cache when profile updates
   */
  async onProfileUpdate(userId: string): Promise<void> {
    await this.cache.invalidatePattern(`profile:${userId}:*`);
  }

  /**
   * Scheduled cache cleanup (remove old entries)
   */
  async scheduledCleanup(): Promise<void> {
    // Redis automatically expires keys, but clean up memory cache
    this.cache.memory.purgeStale();
  }
}
```

---

## 3. LLM Cost Optimization

### 3.1 Prompt Caching (Claude)

Claude offers **prompt caching** - reuse of long prompts across requests.

**Savings:** Up to 90% cost reduction for cached portions.

```typescript
// packages/llm/src/claude-cached.ts

export class CachedClaudeClient {
  private anthropic: Anthropic;

  async chat(
    systemPrompt: string,
    userMessage: string,
    context?: string
  ): Promise<string> {
    // Use prompt caching for system prompt + context
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' } // Cache this
        },
        {
          type: 'text',
          text: `User Context:\n${context}`,
          cache_control: { type: 'ephemeral' } // Cache this too
        }
      ],
      messages: [
        {
          role: 'user',
          content: userMessage // Only this changes per request
        }
      ]
    });

    return response.content[0].text;
  }
}
```

**Cost Impact:**
```
Without caching:
- System prompt: 500 tokens @ $0.003/1K = $0.0015
- Context: 1500 tokens @ $0.003/1K = $0.0045
- User message: 50 tokens @ $0.003/1K = $0.00015
- Total input: $0.00615

With caching (after first request):
- System prompt: 500 tokens @ $0.0003/1K = $0.00015 (90% off)
- Context: 1500 tokens @ $0.0003/1K = $0.00045 (90% off)
- User message: 50 tokens @ $0.003/1K = $0.00015
- Total input: $0.00075

Savings: 88% on input tokens
```

### 3.2 Model Selection (Complexity-Based)

Route requests to appropriate model based on complexity.

```typescript
// packages/llm/src/model-router.ts

export class ModelRouter {
  /**
   * Select best model for query based on complexity
   */
  selectModel(query: string, context?: any): ModelConfig {
    const complexity = this.assessComplexity(query, context);

    if (complexity === 'simple') {
      return {
        provider: 'anthropic',
        model: 'claude-haiku-4',
        cost_per_1k: { input: 0.0008, output: 0.004 }
      };
    }

    if (complexity === 'medium') {
      return {
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        cost_per_1k: { input: 0.003, output: 0.015 }
      };
    }

    // complex
    return {
      provider: 'anthropic',
      model: 'claude-opus-4',
      cost_per_1k: { input: 0.015, output: 0.075 }
    };
  }

  private assessComplexity(query: string, context?: any): 'simple' | 'medium' | 'complex' {
    // Simple: factual queries, direct data lookups
    if (this.isFactualQuery(query)) {
      return 'simple';
    }

    // Complex: medical interpretation, financial advice
    if (this.requiresExpertise(query)) {
      return 'complex';
    }

    // Medium: everything else
    return 'medium';
  }

  private isFactualQuery(query: string): boolean {
    const factualPatterns = [
      /quanto.*gastei/i,
      /qual.*meu.*saldo/i,
      /quando.*foi/i,
      /quantas.*vezes/i
    ];

    return factualPatterns.some(pattern => pattern.test(query));
  }

  private requiresExpertise(query: string): boolean {
    const expertPatterns = [
      /interpreta.*exame/i,
      /análise.*médica/i,
      /estratégia.*investimento/i,
      /deveria.*investir/i
    ];

    return expertPatterns.some(pattern => pattern.test(query));
  }
}
```

**Cost Impact:**
```
Example query: "Quanto gastei em restaurantes este mês?"

Current (always Sonnet):
- Sonnet: $0.003 input + $0.015 output = ~$0.005 per query

Optimized (Haiku for simple queries):
- Haiku: $0.0008 input + $0.004 output = ~$0.0015 per query

Savings: 70% for simple queries (60% of all queries)
Overall: 42% cost reduction
```

### 3.3 Response Streaming (Reduce Perceived Latency)

Stream responses instead of waiting for complete response.

```typescript
// packages/llm/src/streaming.ts

export class StreamingLLMClient {
  async chatStream(
    prompt: string,
    onChunk: (text: string) => void
  ): Promise<void> {
    const stream = await this.anthropic.messages.stream({
      model: 'claude-sonnet-4',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        onChunk(chunk.delta.text);
      }
    }
  }
}
```

**User Experience:**
- Without streaming: Wait 3 seconds → See full response
- With streaming: Wait 0.5 seconds → See text appearing (perceived latency: 0.5s)

---

## 4. Database Optimization

### 4.1 Firestore Query Optimization

**Bad (expensive):**
```typescript
// Fetches ALL transactions, then filters in app
const transactions = await firestore
  .collection('users')
  .doc(userId)
  .collection('transactions')
  .get();

const thisMonth = transactions.docs.filter(doc =>
  doc.data().date >= startOfMonth
);
```

**Good (efficient):**
```typescript
// Firestore filters server-side
const transactions = await firestore
  .collection('users')
  .doc(userId)
  .collection('transactions')
  .where('date', '>=', startOfMonth)
  .get();
```

**Cost Impact:**
```
Bad: 1000 reads (fetch all) + app filtering
Good: 50 reads (only this month)

Savings: 95% fewer reads
```

### 4.2 Composite Indexes

**Required for multi-field queries:**
```typescript
// Query
const query = firestore
  .collection('transactions')
  .where('userId', '==', userId)
  .where('category', '==', 'food')
  .where('date', '>=', startDate)
  .orderBy('date', 'desc');

// Requires composite index
```

**firestore.indexes.json:**
```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 4.3 Batch Operations

**Bad:**
```typescript
for (const tx of transactions) {
  await firestore.collection('transactions').doc(tx.id).update({
    categorized: true
  });
}
// 100 transactions = 100 write operations
```

**Good:**
```typescript
const batch = firestore.batch();
for (const tx of transactions) {
  const ref = firestore.collection('transactions').doc(tx.id);
  batch.update(ref, { categorized: true });
}
await batch.commit();
// 100 transactions = 1 batch operation
```

---

## 5. Frontend Performance

### 5.1 Code Splitting

```typescript
// apps/lens/next.config.js

module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor code
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // Separate charts library (used only in dashboard)
        charts: {
          test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
          name: 'charts',
          priority: 20
        }
      }
    };
    return config;
  }
};
```

**Impact:**
- Initial bundle: 500 KB → 200 KB (60% smaller)
- Dashboard page lazy loads charts: +100 KB only when needed

### 5.2 Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  width={40}
  height={40}
  alt="User avatar"
  loading="lazy" // Lazy load
  quality={75} // Reduce quality slightly
/>
```

**Impact:**
- Original image: 500 KB
- Optimized (WebP, compressed): 50 KB (90% smaller)

### 5.3 Server-Side Rendering (SSR)

```typescript
// apps/lens/app/dashboard/page.tsx

export default async function DashboardPage() {
  // Fetch data server-side
  const userData = await fetchUserData();

  return (
    <div>
      <UserDashboard data={userData} />
    </div>
  );
}
```

**Impact:**
- Without SSR: Blank page → JS loads → Fetch data → Render (3 seconds)
- With SSR: Pre-rendered HTML arrives immediately (0.5 seconds)

---

## 6. Network Optimization

### 6.1 GraphQL (Reduce Over-Fetching)

**REST (over-fetching):**
```typescript
// Fetches entire user object (20 fields)
const user = await fetch('/api/users/123');

// Only need name and email
const { name, email } = user;
```

**GraphQL (precise fetching):**
```graphql
query {
  user(id: "123") {
    name
    email
  }
}
```

**Impact:**
- REST response: 5 KB
- GraphQL response: 0.5 KB (90% smaller)

### 6.2 Compression (gzip/brotli)

```typescript
// apps/api/src/middleware/compression.ts

import compression from 'compression';

app.use(compression({
  level: 6, // Balance speed vs compression
  threshold: 1024 // Only compress responses >1KB
}));
```

**Impact:**
- JSON response: 50 KB
- Compressed: 5 KB (90% smaller)

---

## 7. Cost Monitoring

### 7.1 Cost Dashboard

```yaml
dashboard:
  name: "NOUS - Cost Monitoring"

  panels:
    - title: "Total Cost (MTD)"
      query: "sum(cost_usd) WHERE month = current_month"
      threshold: 5000 # Alert if >$5K

    - title: "Cost by Service"
      type: "pie_chart"
      breakdown:
        - LLM APIs
        - Infrastructure
        - Vector DB
        - Monitoring

    - title: "Cost per User"
      query: "sum(cost_usd) / count(active_users)"
      target: 3.10

    - title: "LLM Cost Breakdown"
      breakdown:
        - Claude Sonnet
        - Claude Haiku
        - Claude Opus
        - OpenAI
```

### 7.2 Budget Alerts

```yaml
alerts:
  - name: "MonthlyBudgetExceeded"
    condition: "sum(cost_usd) > $5000 in current month"
    severity: "P1"
    action: "Notify CFO + Engineering Lead"

  - name: "CostPerUserHigh"
    condition: "cost_per_user > $5"
    severity: "P2"
    action: "Investigate high-cost users"

  - name: "LLMCostSpike"
    condition: "llm_cost_daily > $500"
    severity: "P2"
    action: "Check for runaway agent loops"
```

---

## 8. Implementation Guide

### Week 1: Caching
- [ ] Implement multi-layer cache
- [ ] Add semantic caching for agent responses
- [ ] Monitor cache hit rate

### Week 2: LLM Optimization
- [ ] Enable prompt caching (Claude)
- [ ] Implement model selection (complexity-based)
- [ ] Add response streaming

### Week 3: Database Optimization
- [ ] Review and optimize Firestore queries
- [ ] Create composite indexes
- [ ] Convert to batch operations where possible

### Week 4: Frontend Optimization
- [ ] Implement code splitting
- [ ] Optimize images
- [ ] Enable SSR for key pages

### Ongoing
- [ ] Monitor cost dashboard weekly
- [ ] Review slow queries monthly
- [ ] A/B test optimizations

---

## Summary

**Performance and cost optimization is an ongoing process.**

Key strategies:
- ✅ Multi-layer caching (memory → Redis → Firestore)
- ✅ LLM optimization (prompt caching, model selection)
- ✅ Database optimization (indexes, batching)
- ✅ Frontend optimization (code splitting, SSR)
- ✅ Cost monitoring (dashboards, alerts)

**Target:** Reduce cost per user from $5.00 to $3.10 (38% reduction)

**Impact:** Increase gross margin from 73.7% to 83.7%

---

**Document Status:** ✅ Complete
**All Specifications Complete!**
