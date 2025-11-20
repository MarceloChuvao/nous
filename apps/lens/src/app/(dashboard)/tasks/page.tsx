'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { MOCK_TASKS } from '@/lib/agent-outputs-data'
import { LIFE_DOMAINS } from '@/lib/domains-data'
import { Bot, Clock, ArrowRight, Play, Pause } from 'lucide-react'
import { useState } from 'react'

export default function TasksPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'running' | 'scheduled' | 'paused'>('all')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const financialDomain = LIFE_DOMAINS.find((d) => d.id === 'financial')

  // Map tasks to include domain/subdomain info
  const allTasks = MOCK_TASKS.map((task) => {
    const subdomain = MOCK_FINANCIAL_SUBDOMAINS.find((s) =>
      s.agents.some((a) => a.name === task.agent)
    )
    const agent = subdomain?.agents.find((a) => a.name === task.agent)

    return {
      ...task,
      subdomainId: subdomain?.id || 'unknown',
      subdomainName: subdomain?.name || 'Unknown',
      domainId: 'financial',
      domainName: financialDomain?.name || 'Financial',
      agentColor: agent?.color || 'text-blue-600',
      agentBgColor: agent?.bgColor || 'bg-blue-100'
    }
  })

  const filteredTasks = filter === 'all'
    ? allTasks
    : allTasks.filter(t => t.status === filter)

  const runningCount = allTasks.filter(t => t.status === 'running').length
  const scheduledCount = allTasks.filter(t => t.status === 'scheduled').length
  const pausedCount = allTasks.filter(t => t.status === 'paused').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Tasks</h1>
        <p className="text-gray-600">
          Monitor scheduled and running tasks across all agents
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900">{allTasks.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Running</p>
            <p className="text-3xl font-bold text-green-600">{runningCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Scheduled</p>
            <p className="text-3xl font-bold text-blue-600">{scheduledCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Paused</p>
            <p className="text-3xl font-bold text-gray-600">{pausedCount}</p>
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
          variant={filter === 'running' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('running')}
        >
          Running
        </Button>
        <Button
          variant={filter === 'scheduled' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('scheduled')}
        >
          Scheduled
        </Button>
        <Button
          variant={filter === 'paused' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('paused')}
        >
          Paused
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/domains/${task.domainId}/${task.subdomainId}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${task.agentBgColor}`}>
                    <Clock className={`w-6 h-6 ${task.agentColor}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {task.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          task.status === 'running' ? 'bg-green-100 text-green-700' :
                          task.status === 'paused' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Bot className="w-4 h-4" />
                        <span>{task.agent}</span>
                      </div>
                      <span>•</span>
                      <span>📂 {task.subdomainName}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Frequency: {task.frequency}</span>
                      {task.lastRun && (
                        <>
                          <span>•</span>
                          <span>Last: {new Date(task.lastRun).toLocaleString()}</span>
                        </>
                      )}
                      {task.nextRun && (
                        <>
                          <span>•</span>
                          <span>Next: {new Date(task.nextRun).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {task.status === 'paused' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Resuming task:', task.name)
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Pausing task:', task.name)
                      }}
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/domains/${task.domainId}/${task.subdomainId}`)
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

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} tasks
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Tasks will appear here as agents schedule them'
                : `No ${filter} tasks at the moment`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
