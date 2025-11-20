'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AgentMarketplaceDialog } from '@/components/domains/agent-marketplace-dialog'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { QuickQuestions } from '@/components/chat/quick-questions'
import { useChatStore } from '@/store/chat'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { MOCK_AGENT_OUTPUTS, MOCK_LOGS, MOCK_TASKS } from '@/lib/agent-outputs-data'
import { MarketplaceAgent, MCP } from '@/types/domain'
import { ArrowLeft, Settings, Plus, Bot, Filter } from 'lucide-react'

export default function SubdomainPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const domainId = params.domainId as string
  const subdomainId = params.subdomainId as string

  const [logFilter, setLogFilter] = useState<string>('all')
  const [taskFilter, setTaskFilter] = useState<string>('all')
  const [marketplaceOpen, setMarketplaceOpen] = useState(false)

  const { messages, isTyping, sendMessage, setContext } = useChatStore()

  // Set context when component mounts
  useEffect(() => {
    setContext(`${domainId}/${subdomainId}`)
    return () => setContext(null)
  }, [domainId, subdomainId, setContext])

  const handleInstallAgent = (agent: MarketplaceAgent, mcps: MCP[]) => {
    console.log('Installing agent:', agent.name)
    console.log('Selected MCPs:', mcps)
    // TODO: Adicionar agent ao subdomain
    // TODO: Conectar MCPs
    // TODO: Iniciar coleta de dados
  }

  const subdomain = MOCK_FINANCIAL_SUBDOMAINS.find((s) => s.id === subdomainId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

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
          {/* Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Automated Overview
                </h3>
                <p className="text-sm text-blue-800">
                  This overview displays raw data collected by your {subdomain.agents.length} active agents.
                  All information updates automatically as agents process new data.
                </p>
              </div>
            </div>
          </div>

          {/* Agent Output Cards */}
          {Object.entries(MOCK_AGENT_OUTPUTS).map(([agentId, output]) => {
            const agent = subdomain.agents.find((a) => a.id === agentId)
            const data = output.data as any

            return (
              <Card key={agentId} className="border-l-4" style={{ borderLeftColor: agent?.color.replace('text-', '#') || '#3B82F6' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-1.5 rounded ${agent?.bgColor || 'bg-blue-100'}`}>
                      <Bot className={`w-4 h-4 ${agent?.color || 'text-blue-600'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {output.agentName}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm font-mono text-gray-700">
                    {Object.entries(data).map(([key, value]) => {
                      // Format arrays specially
                      if (Array.isArray(value)) {
                        return (
                          <div key={key}>
                            <span className="text-gray-600">{key}:</span>{' '}
                            <span className="text-gray-900">{value.length} items</span>
                            <div className="ml-4 mt-1 space-y-1">
                              {value.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs">
                                  <span className="text-gray-600">[{idx}]</span>{' '}
                                  <span className="text-gray-900">{typeof item === 'object' ? JSON.stringify(item) : item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={key}>
                          <span className="text-gray-600">{key}:</span>{' '}
                          <span className="text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      updated: {output.lastUpdated}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* AGENTS TAB */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Active Agents ({subdomain.agents.length})
              </h2>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                All Running
              </Badge>
            </div>
            <Button onClick={() => setMarketplaceOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          </div>

          <div className="space-y-4">
            {subdomain.agents.map((agent) => {
              // Mock data for tasks and logs count
              const activeTasks = MOCK_TASKS.filter(t => t.agent === agent.name).length
              const totalLogs = MOCK_LOGS.filter(l => l.agent === agent.name).length

              return (
                <Card key={agent.id} className="border-l-4" style={{ borderLeftColor: agent.color.replace('text-', '#') || '#3B82F6' }}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${agent.bgColor}`}>
                          <Bot className={`w-5 h-5 ${agent.color}`} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {agent.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <p className="font-medium text-gray-900">Active</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Active Since</p>
                        <p className="font-medium text-gray-900">
                          {new Date(agent.activeSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Active Tasks</p>
                        <p className="font-medium text-gray-900">{activeTasks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total Logs</p>
                        <p className="font-medium text-gray-900">{totalLogs}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/domains/${domainId}/${subdomainId}/agents/${agent.id}`)}
                      >
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50">
                        Pause Agent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
              <h3 className="text-lg font-semibold text-gray-900">Data Context</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connected Accounts */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Connected Accounts</h4>
                <div className="space-y-2 text-sm text-gray-700 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">├─</span>
                    <span>Checking Account (Banco X)</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">└─</span>
                    <span>Savings Account (Banco X)</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </div>

              {/* Budget Configuration */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Budget Configuration</h4>
                <div className="space-y-2 text-sm text-gray-700 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">├─</span>
                    <span>Monthly Limit: R$ 5,000</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">├─</span>
                    <span>Alert Threshold: 90%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">└─</span>
                    <span>Categories: 8 active</span>
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Data Sources</h4>
                <div className="space-y-2 text-sm text-gray-700 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">├─</span>
                    <span>Bank API (Real-time sync)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">├─</span>
                    <span>Manual entries: 3 this month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">└─</span>
                    <span>Last sync: 10 minutes ago</span>
                  </div>
                </div>
              </div>

              {/* Manage Button */}
              <div className="pt-4">
                <Button variant="outline" size="sm">
                  Manage Data Sources
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHAT TAB */}
        <TabsContent value="chat" className="h-[600px] flex flex-col">
          <Card className="flex-1 flex flex-col">
            <MessageList messages={messages} isTyping={isTyping} />
            <QuickQuestions
              questions={[
                `What is my current ${subdomain.name.toLowerCase()} status?`,
                `Show me my ${subdomain.name.toLowerCase()} data`,
                'What trends do you see?',
                'Any recommendations?'
              ]}
              onSelect={sendMessage}
            />
            <ChatInput
              onSend={sendMessage}
              disabled={isTyping}
              placeholder={`Ask about ${subdomain.name}...`}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agent Marketplace Dialog */}
      <AgentMarketplaceDialog
        open={marketplaceOpen}
        onClose={() => setMarketplaceOpen(false)}
        onInstall={handleInstallAgent}
      />
    </div>
  )
}
