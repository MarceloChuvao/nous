'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { MOCK_LOGS } from '@/lib/agent-outputs-data'
import { LIFE_DOMAINS } from '@/lib/domains-data'
import { Bot, FileText, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function LogsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning'>('all')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const financialDomain = LIFE_DOMAINS.find((d) => d.id === 'financial')

  // Map logs to include domain/subdomain info
  const allLogs = MOCK_LOGS.map((log) => {
    const subdomain = MOCK_FINANCIAL_SUBDOMAINS.find((s) =>
      s.agents.some((a) => a.name === log.agent)
    )
    const agent = subdomain?.agents.find((a) => a.name === log.agent)

    return {
      ...log,
      subdomainId: subdomain?.id || 'unknown',
      subdomainName: subdomain?.name || 'Unknown',
      domainId: 'financial',
      domainName: financialDomain?.name || 'Financial',
      agentColor: agent?.color || 'text-blue-600',
      agentBgColor: agent?.bgColor || 'bg-blue-100'
    }
  })

  const filteredLogs = filter === 'all'
    ? allLogs
    : allLogs.filter(l => l.type === filter)

  const infoCount = allLogs.filter(l => l.type === 'info').length
  const successCount = allLogs.filter(l => l.type === 'success').length
  const warningCount = allLogs.filter(l => l.type === 'warning').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
        <p className="text-gray-600">
          View all activity and events from your agents
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900">{allLogs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Info</p>
            <p className="text-3xl font-bold text-blue-600">{infoCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Success</p>
            <p className="text-3xl font-bold text-green-600">{successCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Warning</p>
            <p className="text-3xl font-bold text-amber-600">{warningCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-sm text-gray-600">Filter:</span>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'info' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('info')}
        >
          Info
        </Button>
        <Button
          variant={filter === 'success' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('success')}
        >
          Success
        </Button>
        <Button
          variant={filter === 'warning' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('warning')}
        >
          Warning
        </Button>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card
            key={log.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/domains/${log.domainId}/${log.subdomainId}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${log.agentBgColor} mt-1`}>
                    <Bot className={`w-5 h-5 ${log.agentColor}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-semibold text-gray-900">
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
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{log.message}</p>
                    <span className="text-xs text-gray-500">📂 {log.subdomainName}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/domains/${log.domainId}/${log.subdomainId}`)
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} logs
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Activity logs will appear here as agents work'
                : `No ${filter} logs at the moment`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
