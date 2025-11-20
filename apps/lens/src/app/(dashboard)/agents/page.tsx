'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { LIFE_DOMAINS } from '@/lib/domains-data'
import { Bot, ArrowRight, Settings } from 'lucide-react'

export default function MyAgentsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // Get financial domain
  const financialDomain = LIFE_DOMAINS.find((d) => d.id === 'financial')

  // Collect all agents from all subdomains
  const allAgents = MOCK_FINANCIAL_SUBDOMAINS.flatMap((subdomain) =>
    subdomain.agents.map((agent) => ({
      ...agent,
      subdomainId: subdomain.id,
      subdomainName: subdomain.name,
      domainId: 'financial',
      domainName: financialDomain?.name || 'Financial'
    }))
  )

  // Group agents by domain
  const agentsByDomain = allAgents.reduce((acc, agent) => {
    if (!acc[agent.domainName]) {
      acc[agent.domainName] = []
    }
    acc[agent.domainName].push(agent)
    return acc
  }, {} as Record<string, typeof allAgents>)

  const totalAgents = allAgents.length
  const activeAgents = allAgents.filter((a) => a.status === 'active').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Agents</h1>
        <p className="text-gray-600">
          Manage all AI agents across your domains
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Agents</p>
            <p className="text-3xl font-bold text-gray-900">{totalAgents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Active Agents</p>
            <p className="text-3xl font-bold text-green-600">{activeAgents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Domains</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.keys(agentsByDomain).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents by Domain */}
      {Object.entries(agentsByDomain).map(([domainName, agents]) => (
        <div key={domainName} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{domainName}</h2>
            <Badge variant="secondary" className="text-xs">
              {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
            </Badge>
          </div>

          <div className="space-y-3">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="border-l-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderLeftColor: agent.color.replace('text-', '#') || '#3B82F6' }}
                onClick={() => router.push(`/domains/${agent.domainId}/${agent.subdomainId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-3 rounded-lg ${agent.bgColor}`}>
                        <Bot className={`w-6 h-6 ${agent.color}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {agent.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 text-xs"
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>📂 {agent.subdomainName}</span>
                          <span>•</span>
                          <span>
                            Active since{' '}
                            {new Date(agent.activeSince).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>v{agent.version}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Pausing agent:', agent.name)
                          // TODO: Implement pause functionality
                        }}
                      >
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(
                            `/domains/${agent.domainId}/${agent.subdomainId}/agents/${agent.id}`
                          )
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/domains/${agent.domainId}/${agent.subdomainId}`)
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {totalAgents === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by exploring domains and installing agents
            </p>
            <Button onClick={() => router.push('/domains')}>
              Explore Domains
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
