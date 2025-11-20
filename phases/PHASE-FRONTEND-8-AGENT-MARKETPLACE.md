# PHASE-FRONTEND-8: Agent Marketplace

> **Objetivo:** Criar marketplace de agents com busca, preview e instalação
> **Duração:** 6-8 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-7-SUBDOMAIN concluído

---

## 📋 O que vamos fazer

1. ✅ Criar tipos de MarketplaceAgent e MCP
2. ✅ Criar mock data de agents disponíveis
3. ✅ Criar Agent Marketplace Dialog (3 steps)
4. ✅ Step 1: Search com sugestões
5. ✅ Step 2: Results com agent cards
6. ✅ Step 3: Configure com MCPs selection
7. ✅ Integrar com botão "Add Agent"

---

## 🎯 Fluxo do Marketplace

```
User clicks "Add Agent" in Agents tab
  ↓
Dialog opens: SEARCH STEP
  - Enter query OR click suggestion
  ↓
RESULTS STEP
  - Browse matching agents
  - Click agent to select
  ↓
CONFIGURE STEP
  - Select required MCPs (integrations)
  - Select optional MCPs
  ↓
Click "Install Agent"
  - Agent added to subdomain
  - Starts collecting data
```

---

## 📦 Passo 1: Tipos de Marketplace

**Atualizar:** `src/types/domain.ts`

```typescript
export interface MCP {
  id: string
  name: string
  description: string
  provider: string // e.g., "Nubank", "OpenAI", "Google"
  isRequired: boolean
  isConnected: boolean
  icon?: LucideIcon
}

export interface MarketplaceAgent {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  tags: string[]
  rating: number // 0-5
  installs: number
  version: string
  author: string
  requiredMCPs: MCP[]
  optionalMCPs: MCP[]
  dataCollected: string[]
  updateFrequency: string
}
```

---

## 🗂️ Passo 2: Mock Data de Agents

**Caminho:** `src/lib/marketplace-data.ts`

```typescript
import { MarketplaceAgent } from '@/types/domain'

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    id: 'cashflow-monitor',
    name: 'Cash Flow Monitor',
    description: 'Real-time balance tracking across all accounts',
    longDescription: 'Monitors your bank accounts in real-time, calculates current balance, tracks income and expenses, and provides savings rate insights.',
    category: 'Financial',
    tags: ['balance', 'tracking', 'real-time'],
    rating: 4.8,
    installs: 12453,
    version: '1.2.0',
    author: 'NOUS Financial Team',
    requiredMCPs: [
      {
        id: 'nubank-api',
        name: 'Nubank API',
        description: 'Connect to Nubank account',
        provider: 'Nubank',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [
      {
        id: 'inter-api',
        name: 'Inter API',
        description: 'Connect to Inter account',
        provider: 'Inter',
        isRequired: false,
        isConnected: false
      }
    ],
    dataCollected: [
      'Current balance',
      'Monthly income',
      'Monthly expenses',
      'Savings rate',
      'Account breakdown'
    ],
    updateFrequency: 'Every 5 minutes'
  },
  {
    id: 'cashflow-predictor',
    name: 'Cash Flow Predictor',
    description: 'AI-powered cash flow forecasting',
    longDescription: 'Uses machine learning to predict your future cash flow based on historical patterns, upcoming bills, and income trends.',
    category: 'Financial',
    tags: ['ai', 'prediction', 'forecasting'],
    rating: 4.6,
    installs: 8920,
    version: '2.1.3',
    author: 'NOUS AI Labs',
    requiredMCPs: [
      {
        id: 'openai-api',
        name: 'OpenAI API',
        description: 'AI processing for predictions',
        provider: 'OpenAI',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [],
    dataCollected: [
      '30-day forecast',
      '90-day forecast',
      'Predicted expenses',
      'Predicted income',
      'Cash flow alerts'
    ],
    updateFrequency: 'Daily at 9 AM'
  },
  {
    id: 'bank-sync',
    name: 'Bank Transaction Sync',
    description: 'Automatically import bank transactions',
    longDescription: 'Connects to your bank via API and automatically imports all transactions, categorizes them, and keeps your data up-to-date.',
    category: 'Financial',
    tags: ['sync', 'transactions', 'automation'],
    rating: 4.9,
    installs: 15678,
    version: '2.0.1',
    author: 'NOUS Financial Team',
    requiredMCPs: [
      {
        id: 'nubank-api',
        name: 'Nubank API',
        description: 'Connect to Nubank account',
        provider: 'Nubank',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [
      {
        id: 'inter-api',
        name: 'Inter API',
        description: 'Connect to Inter account',
        provider: 'Inter',
        isRequired: false,
        isConnected: false
      },
      {
        id: 'c6-api',
        name: 'C6 Bank API',
        description: 'Connect to C6 account',
        provider: 'C6 Bank',
        isRequired: false,
        isConnected: false
      }
    ],
    dataCollected: [
      'Transaction history',
      'Merchant data',
      'Categories',
      'Payment methods',
      'Transaction timestamps'
    ],
    updateFrequency: 'Every hour'
  },
  {
    id: 'transaction-categorizer',
    name: 'AI Transaction Categorizer',
    description: 'Automatically categorize expenses with AI',
    longDescription: 'Uses natural language processing to intelligently categorize your transactions into food, transport, shopping, health, and more.',
    category: 'Financial',
    tags: ['ai', 'categorization', 'automation'],
    rating: 4.7,
    installs: 10234,
    version: '1.5.2',
    author: 'NOUS AI Labs',
    requiredMCPs: [
      {
        id: 'openai-api',
        name: 'OpenAI API',
        description: 'AI processing for categorization',
        provider: 'OpenAI',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [],
    dataCollected: [
      'Transaction categories',
      'Spending breakdown',
      'Category trends',
      'Merchant patterns'
    ],
    updateFrequency: 'Real-time as transactions arrive'
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Track spending against budget limits',
    longDescription: 'Set monthly budgets for different categories and get alerts when you approach or exceed limits.',
    category: 'Financial',
    tags: ['budget', 'alerts', 'tracking'],
    rating: 4.5,
    installs: 9876,
    version: '1.0.8',
    author: 'NOUS Financial Team',
    requiredMCPs: [],
    optionalMCPs: [
      {
        id: 'telegram-bot',
        name: 'Telegram Bot',
        description: 'Receive budget alerts via Telegram',
        provider: 'Telegram',
        isRequired: false,
        isConnected: false
      }
    ],
    dataCollected: [
      'Budget usage %',
      'Remaining budget',
      'Over-budget categories',
      'Budget trends'
    ],
    updateFrequency: 'Every 30 minutes'
  }
]

export const SEARCH_SUGGESTIONS = [
  'Track my bank balance',
  'Predict future expenses',
  'Categorize transactions',
  'Monitor budget',
  'Sync bank accounts'
]
```

---

## 🎨 Passo 3: Agent Marketplace Dialog

**Caminho:** `src/components/domains/agent-marketplace-dialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MarketplaceAgent, MCP } from '@/types/domain'
import { MARKETPLACE_AGENTS, SEARCH_SUGGESTIONS } from '@/lib/marketplace-data'
import { Search, Star, Download, Bot, ChevronRight, Check } from 'lucide-react'

interface AgentMarketplaceDialogProps {
  open: boolean
  onClose: () => void
  onInstall: (agent: MarketplaceAgent, selectedMCPs: MCP[]) => void
}

type Step = 'search' | 'results' | 'configure'

export function AgentMarketplaceDialog({
  open,
  onClose,
  onInstall
}: AgentMarketplaceDialogProps) {
  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MarketplaceAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [selectedMCPs, setSelectedMCPs] = useState<MCP[]>([])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)

    // Simple search: filter by name, description, or tags
    const results = MARKETPLACE_AGENTS.filter((agent) => {
      const lowerQuery = searchQuery.toLowerCase()
      return (
        agent.name.toLowerCase().includes(lowerQuery) ||
        agent.description.toLowerCase().includes(lowerQuery) ||
        agent.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
    })

    setSearchResults(results)
    setStep('results')
  }

  const handleSelectAgent = (agent: MarketplaceAgent) => {
    setSelectedAgent(agent)
    // Pre-select all required MCPs
    setSelectedMCPs(agent.requiredMCPs)
    setStep('configure')
  }

  const handleToggleMCP = (mcp: MCP) => {
    if (mcp.isRequired) return // Can't unselect required MCPs

    const isSelected = selectedMCPs.some((m) => m.id === mcp.id)
    if (isSelected) {
      setSelectedMCPs(selectedMCPs.filter((m) => m.id !== mcp.id))
    } else {
      setSelectedMCPs([...selectedMCPs, mcp])
    }
  }

  const handleInstall = () => {
    if (selectedAgent) {
      onInstall(selectedAgent, selectedMCPs)
      handleClose()
    }
  }

  const handleClose = () => {
    setStep('search')
    setQuery('')
    setSearchResults([])
    setSelectedAgent(null)
    setSelectedMCPs([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent Marketplace</DialogTitle>
          <DialogDescription>
            Discover and install agents to automate your data collection
          </DialogDescription>
        </DialogHeader>

        {/* SEARCH STEP */}
        {step === 'search' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="What do you want to track?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearch(query)
                  }
                }}
                className="pl-10"
                autoFocus
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quick Suggestions
              </h3>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Popular Agents
              </h3>
              <div className="space-y-2">
                {MARKETPLACE_AGENTS.slice(0, 3).map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectAgent(agent)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {agent.description}
                        </p>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{agent.rating}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>{agent.installs.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS STEP */}
        {step === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {searchResults.length} agents found for "{query}"
              </p>
              <Button variant="ghost" size="sm" onClick={() => setStep('search')}>
                ← Back to Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((agent) => (
                <Card
                  key={agent.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectAgent(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-blue-600" />
                        <h3 className="text-base font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{agent.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{agent.rating}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{agent.installs.toLocaleString()}</span>
                      </span>
                      <span>{agent.version}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CONFIGURE STEP */}
        {step === 'configure' && selectedAgent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAgent.name}
                </h3>
                <p className="text-sm text-gray-600">Configure agent settings</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('results')}>
                ← Back to Results
              </Button>
            </div>

            {/* Long Description */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{selectedAgent.longDescription}</p>
            </div>

            {/* Required MCPs */}
            {selectedAgent.requiredMCPs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Required Integrations
                </h4>
                <div className="space-y-2">
                  {selectedAgent.requiredMCPs.map((mcp) => (
                    <div
                      key={mcp.id}
                      className="p-3 border-2 border-blue-300 bg-blue-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {mcp.name}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1">
                            {mcp.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Provider: {mcp.provider}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Required
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional MCPs */}
            {selectedAgent.optionalMCPs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Optional Integrations
                </h4>
                <div className="space-y-2">
                  {selectedAgent.optionalMCPs.map((mcp) => {
                    const isSelected = selectedMCPs.some((m) => m.id === mcp.id)
                    return (
                      <div
                        key={mcp.id}
                        onClick={() => handleToggleMCP(mcp)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {mcp.name}
                            </h5>
                            <p className="text-xs text-gray-600 mt-1">
                              {mcp.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Provider: {mcp.provider}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <Check className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Data Collected */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Data This Agent Collects
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedAgent.dataCollected.map((data) => (
                  <div key={data} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">{data}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Frequency */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Update Frequency</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {selectedAgent.updateFrequency}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'configure' && (
            <Button onClick={handleInstall}>
              Install Agent
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🔗 Passo 4: Integrar com Subdomain Page

**Atualizar:** `src/app/(dashboard)/domains/[domainId]/[subdomainId]/page.tsx`

Adicionar state e handler:

```typescript
import { AgentMarketplaceDialog } from '@/components/domains/agent-marketplace-dialog'
import { MarketplaceAgent, MCP } from '@/types/domain'

// Dentro do component:
const [marketplaceOpen, setMarketplaceOpen] = useState(false)

const handleInstallAgent = (agent: MarketplaceAgent, mcps: MCP[]) => {
  console.log('Installing agent:', agent.name)
  console.log('Selected MCPs:', mcps)
  // TODO: Adicionar agent ao subdomain
  // TODO: Conectar MCPs
  // TODO: Iniciar coleta de dados
}

// No botão "Add Agent":
<Button onClick={() => setMarketplaceOpen(true)}>
  <Plus className="w-4 h-4 mr-2" />
  Add Agent
</Button>

// Antes do final do return:
<AgentMarketplaceDialog
  open={marketplaceOpen}
  onClose={() => setMarketplaceOpen(false)}
  onInstall={handleInstallAgent}
/>
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Tipos MarketplaceAgent e MCP criados
- [ ] ✅ Mock data de 5 agents criado
- [ ] ✅ AgentMarketplaceDialog component criado
- [ ] ✅ Step 1: Search com input e sugestões
- [ ] ✅ Step 2: Results com agent cards
- [ ] ✅ Step 3: Configure com MCPs selection
- [ ] ✅ Required MCPs sempre selecionados
- [ ] ✅ Optional MCPs toggle
- [ ] ✅ Botão "Install Agent" funciona
- [ ] ✅ Integrado com página de subdomain

---

## 🧪 Como Testar

1. Acesse `/domains/financial/cashflow`
2. Vá para tab "Agents"
3. Clique em "Add Agent"
4. **Search Step:**
   - Digite "budget" → Enter
   - OU clique em sugestão "Track my bank balance"
5. **Results Step:**
   - Vê agents filtrados
   - Clique em um agent card
6. **Configure Step:**
   - Vê descrição longa do agent
   - Vê required MCPs (destacados em azul)
   - Vê optional MCPs (clique para toggle)
   - Vê lista de data collected
   - Vê update frequency
7. Clique "Install Agent"
8. Dialog fecha (agent ainda não é adicionado - próximo passo)

---

## 📱 Responsividade

- **Mobile (< 768px):** 1 coluna de agent cards
- **Desktop (> 768px):** 2 colunas de agent cards

---

## ➡️ Próximo Passo

**Continue para:** `PHASE-FRONTEND-9-CHAT.md`

Onde você vai criar a interface de conversação integrada.

---

**Status:** 🟢 Agent Marketplace Completo
**Tempo Estimado:** ~6-8 horas
