# PHASE-FRONTEND-7: Subdomain Page with 6 Tabs

> **Objetivo:** Criar página de subdomain com tabs Overview, Agents, Logs, Tasks, Context, Chat
> **Duração:** 8-10 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-6-DOMAIN-PAGE concluído

---

## 📋 O que vamos fazer

1. ✅ Criar página `/domains/[domainId]/[subdomainId]`
2. ✅ Tab Overview: Raw agent outputs
3. ✅ Tab Agents: List de agents com botão "Add Agent"
4. ✅ Tab Logs: Activity log
5. ✅ Tab Tasks: Scheduled tasks
6. ✅ Tab Context: Data sources e configurações
7. ✅ Tab Chat: Interface de conversação

---

## 🎯 Estrutura de Tabs

```
Overview   - Shows raw data outputs from all agents
Agents     - List of active agents + "Add Agent" button
Logs       - Activity log from all agents
Tasks      - Scheduled and running tasks
Context    - Data sources and configuration
Chat       - Conversational interface
```

---

## 📦 Passo 1: Mock Data de Agent Outputs

**Caminho:** `src/lib/agent-outputs-data.ts`

```typescript
export const MOCK_AGENT_OUTPUTS = {
  'cashflow-monitor': {
    agentName: '@financial/cashflow-monitor',
    lastUpdated: '2025-01-20T14:30:00Z',
    data: {
      currentBalance: {
        value: 5420.50,
        currency: 'BRL',
        accounts: [
          { name: 'Conta Corrente', balance: 3200.00 },
          { name: 'Poupança', balance: 2220.50 }
        ]
      },
      monthlyIncome: {
        value: 8500.00,
        currency: 'BRL',
        sources: ['Salário']
      },
      monthlyExpenses: {
        value: 3079.50,
        currency: 'BRL',
        breakdown: {
          food: 1234.50,
          transport: 456.00,
          shopping: 789.00,
          health: 234.00,
          other: 366.00
        }
      },
      savingsRate: {
        value: 0.36,
        trend: 'increasing'
      }
    }
  },
  'bank-sync': {
    agentName: '@financial/bank-sync',
    lastUpdated: '2025-01-20T15:00:00Z',
    data: {
      syncStatus: 'success',
      lastSync: '2025-01-20T15:00:00Z',
      transactionsImported: 127,
      accountsConnected: ['Nubank', 'Inter']
    }
  }
}

export const MOCK_LOGS = [
  {
    id: '1',
    agent: '@financial/cashflow-monitor',
    message: 'Balance updated: R$ 5.420',
    timestamp: '2025-01-20T14:30:00Z',
    type: 'info'
  },
  {
    id: '2',
    agent: '@financial/bank-sync',
    message: 'Successfully synced 12 new transactions',
    timestamp: '2025-01-20T15:00:00Z',
    type: 'success'
  },
  {
    id: '3',
    agent: '@financial/cashflow-monitor',
    message: 'Expense detected: R$ 85.50 at Restaurante Italiano',
    timestamp: '2025-01-20T13:15:00Z',
    type: 'info'
  },
  {
    id: '4',
    agent: '@financial/bank-sync',
    message: 'Retrying connection to Nubank API...',
    timestamp: '2025-01-20T12:00:00Z',
    type: 'warning'
  }
]

export const MOCK_TASKS = [
  {
    id: '1',
    agent: '@financial/cashflow-monitor',
    name: 'Update balance',
    status: 'running',
    frequency: 'Every 5 minutes',
    lastRun: '2025-01-20T14:30:00Z',
    nextRun: '2025-01-20T14:35:00Z'
  },
  {
    id: '2',
    agent: '@financial/bank-sync',
    name: 'Sync transactions',
    status: 'scheduled',
    frequency: 'Every hour',
    lastRun: '2025-01-20T15:00:00Z',
    nextRun: '2025-01-20T16:00:00Z'
  },
  {
    id: '3',
    agent: '@financial/cashflow-predictor',
    name: 'Generate forecast',
    status: 'paused',
    frequency: 'Daily at 9 AM',
    lastRun: '2025-01-19T09:00:00Z',
    nextRun: null
  }
]
```

---

## 🏠 Passo 2: Página do Subdomain

**Caminho:** `src/app/(dashboard)/domains/[domainId]/[subdomainId]/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { MOCK_AGENT_OUTPUTS, MOCK_LOGS, MOCK_TASKS } from '@/lib/agent-outputs-data'
import { ArrowLeft, Settings, Plus, Bot, Filter } from 'lucide-react'
import { useState } from 'react'

export default function SubdomainPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const domainId = params.domainId as string
  const subdomainId = params.subdomainId as string

  const [logFilter, setLogFilter] = useState<string>('all')
  const [taskFilter, setTaskFilter] = useState<string>('all')

  const subdomain = MOCK_FINANCIAL_SUBDOMAINS.find((s) => s.id === subdomainId)

  if (isLoading || !isAuthenticated) return null

  if (!subdomain) {
    return <div>Subdomain not found</div>
  }

  const Icon = subdomain.icon

  const filteredLogs = logFilter === 'all'
    ? MOCK_LOGS
    : MOCK_LOGS.filter((log) => log.agent === logFilter)

  const filteredTasks = taskFilter === 'all'
    ? MOCK_TASKS
    : MOCK_TASKS.filter((task) => task.agent === taskFilter)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/domains/${domainId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {domainId}
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subdomain.name}</h1>
              <p className="text-gray-600 mt-1">{subdomain.description}</p>
            </div>
          </div>

          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents ({subdomain.agents.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Auto-updating:</strong> This overview shows raw data collected by your agents.
              As agents process data, this view updates automatically. No configuration needed.
            </p>
          </div>

          {Object.entries(MOCK_AGENT_OUTPUTS).map(([agentId, output]) => (
            <Card key={agentId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {output.agentName}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    Updated {new Date(output.lastUpdated).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(output.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AGENTS TAB */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Manage agents that collect and process data for this subdomain
            </p>
            <Button onClick={() => {/* TODO: Open marketplace */}}>
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subdomain.agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${agent.bgColor}`}>
                        <Bot className={`w-5 h-5 ${agent.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-600">{agent.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Active Since</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(agent.activeSince).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Version</p>
                      <p className="text-sm font-medium text-gray-900">{agent.version}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/domains/${domainId}/${subdomainId}/agents/${agent.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Activity log from all agents</p>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Agents</option>
                {subdomain.agents.map((agent) => (
                  <option key={agent.id} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const agent = subdomain.agents.find((a) => a.name === log.agent)
                  return (
                    <div key={log.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${agent?.bgColor || 'bg-gray-100'}`}>
                          <Bot className={`w-4 h-4 ${agent?.color || 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {log.agent}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                log.type === 'success' ? 'bg-green-100 text-green-700' :
                                log.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {log.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{log.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Scheduled and running tasks</p>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Agents</option>
                {subdomain.agents.map((agent) => (
                  <option key={agent.id} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const agent = subdomain.agents.find((a) => a.name === task.agent)
              return (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${agent?.bgColor || 'bg-gray-100'}`}>
                          <Bot className={`w-4 h-4 ${agent?.color || 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{task.name}</h4>
                          <p className="text-xs text-gray-600">{task.agent}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Frequency: {task.frequency}</span>
                            {task.lastRun && (
                              <span>Last: {new Date(task.lastRun).toLocaleString()}</span>
                            )}
                            {task.nextRun && (
                              <span>Next: {new Date(task.nextRun).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${
                          task.status === 'running' ? 'bg-green-100 text-green-700' :
                          task.status === 'paused' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* CONTEXT TAB */}
        <TabsContent value="context" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nubank</p>
                      <p className="text-xs text-gray-600">Bank account connection</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Connected
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Inter</p>
                      <p className="text-xs text-gray-600">Bank account connection</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Connected
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Monthly Budget</label>
                  <input
                    type="text"
                    value="R$ 5.000"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Savings Goal</label>
                  <input
                    type="text"
                    value="40%"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHAT TAB */}
        <TabsContent value="chat">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Chat interface will be implemented in Phase 9
              </p>
              <p className="text-sm text-gray-500">
                Ask questions about your cash flow data in natural language
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Mock data de agent outputs criado
- [ ] ✅ Mock data de logs criado
- [ ] ✅ Mock data de tasks criado
- [ ] ✅ Página `/domains/[domainId]/[subdomainId]` criada
- [ ] ✅ Tab Overview mostrando raw outputs
- [ ] ✅ Tab Agents com lista de agents
- [ ] ✅ Tab Logs com filtro por agent
- [ ] ✅ Tab Tasks com filtro por agent
- [ ] ✅ Tab Context com data sources
- [ ] ✅ Tab Chat com placeholder
- [ ] ✅ Botão "Add Agent" visível
- [ ] ✅ Botão "View Details" navega para agent detail page

---

## 🧪 Como Testar

1. Acesse `/domains/financial`
2. Clique em "View Details" no card "Cash Flow"
3. Navega para `/domains/financial/cashflow`
4. Veja 6 tabs disponíveis
5. **Tab Overview:**
   - Vê raw JSON outputs de 2 agents
   - Vê nota explicativa sobre auto-update
6. **Tab Agents:**
   - Vê 2 agent cards
   - Clique "Add Agent" (ainda sem função)
   - Clique "View Details" (navega para agent detail - próxima fase)
7. **Tab Logs:**
   - Vê 4 log entries
   - Filtre por agent → vê logs apenas daquele agent
8. **Tab Tasks:**
   - Vê 3 tasks com status
   - Filtre por agent → vê tasks apenas daquele agent
9. **Tab Context:**
   - Vê 2 connected accounts
   - Vê configurações (budget, savings goal)
10. **Tab Chat:**
    - Vê placeholder para próxima fase

---

## 📱 Responsividade

- **Mobile/Tablet (< 1024px):** 1 coluna de agent cards
- **Desktop (> 1024px):** 2 colunas de agent cards

---

## ➡️ Próximo Passo

**Continue para:** `PHASE-FRONTEND-8-AGENT-MARKETPLACE.md`

Onde você vai criar o marketplace de agents com busca e instalação.

---

**Status:** 🟢 Subdomain Page Completo
**Tempo Estimado:** ~8-10 horas
