# Frontend-Backend Integration Plan

> **Status:** Frontend Complete ✅ | Backend Pending 🚧
> **Last Updated:** 2025-01-20

---

## 📋 Overview

Este documento mapeia o **frontend implementado** (Phases 5-9) com o **backend documentado** (Phases 0-3) para guiar a integração.

---

## ✅ Frontend Implementado (Concluído)

### PHASE-FRONTEND-5: Templates & My Domains
- ✅ UI de templates pré-configurados
- ✅ Preview de templates
- ✅ Sistema de instalação de templates (mock)

**Mock Data:**
- `templates-data.ts` - 3 templates financeiros

### PHASE-FRONTEND-6: Domain Page com Cards Customizáveis
- ✅ Grid de subdomain cards
- ✅ Editor drag-and-drop
- ✅ Customização de variáveis (font, color, layout)

**Mock Data:**
- `subdomains-data.ts` - 3 subdomains
- `MOCK_VARIABLE_VALUES` - Valores para renderização

### PHASE-FRONTEND-7: Subdomain Page com 6 Tabs
- ✅ Tab Overview (raw JSON outputs)
- ✅ Tab Agents (lista + "Add Agent")
- ✅ Tab Logs (com filtros)
- ✅ Tab Tasks (scheduled tasks)
- ✅ Tab Context (data sources)
- ✅ Tab Chat (interface de conversação)

**Mock Data:**
- `agent-outputs-data.ts` - Outputs, logs, tasks

### PHASE-FRONTEND-8: Agent Marketplace
- ✅ Search em 3 steps (Search → Results → Configure)
- ✅ MCP selection (required + optional)
- ✅ Agent installation flow

**Mock Data:**
- `marketplace-data.ts` - 5 agents disponíveis

### PHASE-FRONTEND-9: Chat Interface
- ✅ Store Zustand com context-aware
- ✅ Chat global (`/chat`)
- ✅ Chat integrado no subdomain
- ✅ Quick questions
- ✅ Typing indicator

---

## 🚧 Backend a Implementar (Conforme PRDs)

### PHASE-0-FOUNDATION (Weeks 1-4)

#### 1. **Data Layer (VFS + Firestore)**
**Referência:** `PHASE-0-FOUNDATION.md` - Section "Data Layer Implementation"

**O que fazer:**
```typescript
// Conectar frontend → Firestore schemas
// Substituir mock data por queries reais

// Exemplo: subdomains-data.ts
export async function getSubdomains(domainId: string) {
  const subdomainsRef = collection(db, 'users', userId, 'domains', domainId, 'subdomains')
  const snapshot = await getDocs(subdomainsRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

**Schemas Firestore necessários:**
- `users/{userId}/domains/{domainId}` - Domain data
- `users/{userId}/domains/{domainId}/subdomains/{subdomainId}` - Subdomain config
- `users/{userId}/domains/{domainId}/subdomains/{subdomainId}/agents/{agentId}` - Agent instances
- `users/{userId}/domains/{domainId}/subdomains/{subdomainId}/variable_configs` - Card customization

**Endpoints a criar:**
- `GET /api/domains` - Lista domains do usuário
- `GET /api/domains/:domainId/subdomains` - Lista subdomains
- `POST /api/domains/:domainId/subdomains` - Cria subdomain
- `PATCH /api/domains/:domainId/subdomains/:id/config` - Atualiza card config

---

#### 2. **Authentication (Firebase Auth)**
**Referência:** `PHASE-0-FOUNDATION.md` - Section "Security Foundation"

**Já implementado no frontend:**
- ✅ `useAuth()` hook
- ✅ Login/Signup pages
- ✅ Protected routes

**Backend a fazer:**
- Configurar Firebase Auth server-side
- Middleware de autenticação para Functions
- Token validation

---

#### 3. **CORE Agent (MVP)**
**Referência:** `PHASE-0-FOUNDATION.md` - Section "CORE Agent Implementation"

**Frontend conectado em:**
- `chat.ts` - Store do chat (mock)
- `/chat` page

**Backend a fazer:**
```typescript
// Firebase Function
export const sendMessage = functions.https.onCall(async (data, context) => {
  const { message, context: chatContext } = data

  // 1. Classificar intent
  const intent = await classifyIntent(message)

  // 2. Se context específico, usar agent do subdomain
  if (chatContext) {
    const [domainId, subdomainId] = chatContext.split('/')
    const agents = await getSubdomainAgents(context.auth.uid, domainId, subdomainId)
    // Delegar para agent apropriado
  }

  // 3. Gerar resposta
  const response = await generateResponse(message, intent)

  return { role: 'assistant', content: response }
})
```

**WebSocket/SSE para real-time:**
```typescript
// Substituir timeout no chat.ts por WebSocket
const ws = new WebSocket('wss://your-project.firebaseapp.com/chat')
ws.send(JSON.stringify({ message, context }))
ws.onmessage = (event) => {
  addMessage(JSON.parse(event.data))
}
```

---

### PHASE-1-HEALTH (Weeks 5-12)

**Não implementado no frontend ainda** - Vertical de Saúde

Quando for implementar:
- Health dashboard
- Medical document upload
- OCR processing
- @health/physician agent
- @health/nutritionist agent

---

### PHASE-2-FINANCE (Weeks 13-18)

#### **Open Banking Integration**
**Referência:** `PHASE-2-FINANCE.md` - Section "Open Finance Integration"

**Frontend preparado:**
- ✅ Tab "Context" no subdomain (mostra data sources)
- ✅ Mock: Nubank, Inter connected

**Backend a fazer:**
```typescript
// Integração com Pluggy (Open Finance Brasil)
import { PluggyClient } from 'pluggy-sdk'

export const connectBank = functions.https.onCall(async (data, context) => {
  const { bankId } = data

  const client = new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET
  })

  // 1. Criar item de conexão
  const item = await client.createItem({
    type: 'bank',
    parameters: { connector: bankId }
  })

  // 2. Salvar no Firestore
  await db.collection('users').doc(context.auth.uid)
    .collection('bank_connections').doc(item.id).set({
      bankId,
      itemId: item.id,
      status: 'connected',
      connectedAt: new Date()
    })

  return { itemId: item.id }
})
```

**Endpoints a criar:**
- `POST /api/finance/connect-bank` - Conectar banco
- `GET /api/finance/transactions` - Buscar transações
- `GET /api/finance/balance` - Saldo atual
- `POST /api/finance/sync` - Sincronizar dados

---

#### **Transaction Categorization**
**Referência:** `PHASE-2-FINANCE.md` - Section "Transaction Intelligence"

**Frontend preparado:**
- ✅ Tab "Overview" mostra raw data
- ✅ Tab "Logs" mostra transações

**Backend a fazer:**
```typescript
// Agent de categorização
export const categorizeTransaction = async (transaction: Transaction) => {
  const prompt = `Categorize this transaction:
  Merchant: ${transaction.merchant}
  Amount: ${transaction.amount}
  Description: ${transaction.description}

  Categories: food, transport, shopping, health, entertainment, other`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  })

  return response.choices[0].message.content
}
```

---

#### **@finance/advisor Agent**
**Referência:** `PHASE-2-FINANCE.md` - Section "Finance Agents"

**Frontend preparado:**
- ✅ Agent Marketplace tem `cashflow-monitor`, `cashflow-predictor`, etc
- ✅ Tab "Agents" mostra agents ativos

**Backend a fazer:**
```typescript
// Agent que analisa gastos e dá conselhos
export class FinanceAdvisorAgent {
  async analyze(userId: string) {
    // 1. Buscar transações do mês
    const transactions = await this.getTransactions(userId)

    // 2. Calcular métricas
    const totalIncome = this.calculateIncome(transactions)
    const totalExpenses = this.calculateExpenses(transactions)
    const savingsRate = (totalIncome - totalExpenses) / totalIncome

    // 3. Gerar insights com LLM
    const insights = await this.generateInsights({
      income: totalIncome,
      expenses: totalExpenses,
      savingsRate,
      breakdown: this.categorizeExpenses(transactions)
    })

    return insights
  }
}
```

---

### PHASE-3-PLATFORM (Weeks 19-22)

#### **Agent Marketplace Backend**
**Referência:** `PHASE-3-PLATFORM.md` - Section "Agent Marketplace"

**Frontend preparado:**
- ✅ `AgentMarketplaceDialog` implementado
- ✅ Search, Results, Configure steps
- ✅ MCP selection

**Backend a fazer:**

```typescript
// Endpoint para buscar agents no marketplace
export const searchAgents = functions.https.onCall(async (data) => {
  const { query } = data

  const agentsRef = db.collection('marketplace_agents')
  let agentsQuery = agentsRef.where('published', '==', true)

  if (query) {
    agentsQuery = agentsQuery.where('tags', 'array-contains', query.toLowerCase())
  }

  const snapshot = await agentsQuery.get()
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
})

// Endpoint para instalar agent
export const installAgent = functions.https.onCall(async (data, context) => {
  const { agentId, subdomainId, mcps } = data

  // 1. Buscar manifest do agent
  const agentDoc = await db.collection('marketplace_agents').doc(agentId).get()
  const agentManifest = agentDoc.data()

  // 2. Validar MCPs required
  const missingMCPs = agentManifest.requiredMCPs.filter(
    mcp => !mcps.includes(mcp.id)
  )
  if (missingMCPs.length > 0) {
    throw new functions.https.HttpsError('failed-precondition', 'Missing required MCPs')
  }

  // 3. Criar instância do agent no user subdomain
  await db.collection('users').doc(context.auth.uid)
    .collection('domains').doc('financial')
    .collection('subdomains').doc(subdomainId)
    .collection('agents').doc(agentId).set({
      agentId,
      manifestVersion: agentManifest.version,
      mcps,
      status: 'active',
      installedAt: new Date()
    })

  // 4. Iniciar coleta de dados
  await this.startAgentExecution(context.auth.uid, agentId)

  return { success: true }
})
```

---

#### **Creator Studio (Flowise)**
**Referência:** `PHASE-3-PLATFORM.md` - Section "Creator Studio"

**Não implementado no frontend**

**Backend a fazer:**
- Integrar Flowise como iframe
- Agent manifest builder
- Publishing workflow
- Sandboxed execution

---

## 🔄 Roadmap de Integração

### Semana 1-2: Foundation Backend
- [ ] Configurar Firebase Functions
- [ ] Implementar schemas Firestore
- [ ] Conectar Auth frontend ↔ backend
- [ ] CRUD de domains/subdomains

### Semana 3-4: CORE Agent + Chat
- [ ] Implementar CORE Agent (LangChain)
- [ ] WebSocket para chat real-time
- [ ] Context-aware responses
- [ ] Substituir mock em `chat.ts`

### Semana 5-6: Finance - Open Banking
- [ ] Integrar Pluggy (Open Finance)
- [ ] Sincronização de transações
- [ ] API endpoints de finance
- [ ] Conectar Tab Context → Firestore

### Semana 7-8: Finance - Agents
- [ ] @finance/cashflow-monitor agent
- [ ] @finance/cashflow-predictor agent
- [ ] Agent outputs → Tab Overview
- [ ] Logs real-time → Tab Logs

### Semana 9-10: Agent Marketplace Backend
- [ ] Marketplace database (published agents)
- [ ] Search API
- [ ] Install API
- [ ] Agent execution runtime

### Semana 11-12: Card Persistence
- [ ] Salvar variable_configs no Firestore
- [ ] Load configs do user
- [ ] Sync drag-and-drop → database

---

## 🎯 Endpoints Necessários

### Authentication
- `POST /api/auth/login` - ✅ Firebase Auth (já funciona)
- `POST /api/auth/signup` - ✅ Firebase Auth (já funciona)

### Domains & Subdomains
- `GET /api/domains` - Lista domains
- `GET /api/domains/:id/subdomains` - Lista subdomains
- `POST /api/domains/:id/subdomains` - Cria subdomain
- `PATCH /api/domains/:domainId/subdomains/:id/config` - Atualiza config

### Agents
- `GET /api/agents/marketplace` - Busca agents no marketplace
- `POST /api/agents/install` - Instala agent
- `GET /api/agents/:id/outputs` - Busca outputs do agent
- `GET /api/agents/:id/logs` - Busca logs do agent
- `GET /api/agents/:id/tasks` - Busca tasks do agent

### Chat
- `WebSocket wss://...​/chat` - Chat real-time
- `POST /api/chat/message` - Envia mensagem (fallback)

### Finance (Open Banking)
- `POST /api/finance/connect-bank` - Conecta banco
- `GET /api/finance/transactions` - Lista transações
- `GET /api/finance/balance` - Saldo atual
- `POST /api/finance/sync` - Sincroniza dados

---

## 📚 Referências

- **Backend Architecture:** `phases/PHASE-0-FOUNDATION.md`
- **Health Vertical:** `phases/PHASE-1-HEALTH.md`
- **Finance Vertical:** `phases/PHASE-2-FINANCE.md`
- **Platform (Marketplace):** `phases/PHASE-3-PLATFORM.md`
- **Frontend Phases:** `phases/PHASE-FRONTEND-5-TEMPLATES.md` até `PHASE-FRONTEND-9-CHAT.md`

---

**Next Step:** Começar pela **Semana 1-2** (Foundation Backend) para conectar o frontend com Firestore.
