'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { ArrowLeft, Bot, Database, Settings } from 'lucide-react'

export default function AgentDetailPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const domainId = params.domainId as string
  const subdomainId = params.subdomainId as string
  const agentId = params.agentId as string

  const subdomain = MOCK_FINANCIAL_SUBDOMAINS.find((s) => s.id === subdomainId)
  const agent = subdomain?.agents.find((a) => a.id === agentId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!agent || !subdomain) {
    return <div>Agent not found</div>
  }

  const Icon = subdomain.icon

  // Mock storage data
  const storageData = {
    databaseType: 'PostgreSQL',
    connectionString: 'postgres://localhost:5432/nous_financial',
    tables: [
      { name: 'balance_history', records: 365, dateRange: 'Jan 2024 - Present' },
      { name: 'transactions', records: 1243, dateRange: 'Jan 2024 - Present' },
      { name: 'monthly_summary', records: 12, dateRange: 'Jan 2024 - Present' }
    ],
    storageSize: '2.3 MB',
    dataPoints: 6
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/domains/${domainId}/${subdomainId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {subdomain.name}
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${agent.bgColor}`}>
              <Bot className={`w-8 h-8 ${agent.color}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-gray-600 mt-1">{agent.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {agent.status}
            </Badge>
            <span className="text-sm text-gray-600">v{agent.version}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{agent.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Active Since</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Date(agent.activeSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Data Points</p>
            <p className="text-2xl font-bold text-gray-900">{storageData.dataPoints.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Storage Size</p>
            <p className="text-2xl font-bold text-gray-900">{storageData.storageSize}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="storage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="storage">Storage & Context</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* STORAGE & CONTEXT TAB */}
        <TabsContent value="storage" className="space-y-6">
          {/* Data Storage */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Storage</h3>
                <p className="text-sm text-blue-600">Where this agent stores data for historical comparisons and analysis</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">Database Type</p>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{storageData.databaseType}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">Total Records</p>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">1,450</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Database Tables</h4>
                <div className="space-y-2">
                  {storageData.tables.map((table) => (
                    <div key={table.name} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Database className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-mono font-semibold text-gray-900">{table.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Oldest Record</p>
                          <p className="font-medium text-gray-900">Jan 1, 2024</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Latest Record</p>
                          <p className="font-medium text-gray-900">2 hours ago</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Storage Size</p>
                          <p className="font-medium text-gray-900">2.3 MB</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Retention</h3>
                <p className="text-sm text-blue-600">How historical data enables comparisons</p>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Month-over-Month Comparisons</p>
                    <p className="text-sm text-gray-600">Stores monthly snapshots to calculate trends like "+8.2% from last month"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Historical Averages</p>
                    <p className="text-sm text-gray-600">Maintains daily records to compute average daily balance over time periods</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm">View Raw Data</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-6">
          {/* Agent Configuration */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Agent Configuration</h3>
                <p className="text-sm text-blue-600">Configure how this agent operates and collects data</p>
              </div>

              <div className="space-y-6 mb-6">
                {/* Update Frequency */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Update Frequency</p>
                    <p className="text-sm text-gray-600">How often the agent checks for new data</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Every 6 hours</p>
                </div>

                {/* Compare with Last Month */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Compare with Last Month</p>
                    <p className="text-sm text-gray-600">Enable month-over-month comparisons</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Track Daily Average */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Track Daily Average</p>
                    <p className="text-sm text-gray-600">Calculate and store daily balance averages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Alert Threshold */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Alert Threshold</p>
                    <p className="text-sm text-gray-600">Trigger alerts when balance drops below (%)</p>
                  </div>
                  <p className="text-sm font-medium text-blue-600">90%</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button size="sm">Save Settings</Button>
                <Button variant="outline" size="sm">Reset to Default</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>

              <div className="space-y-4">
                {/* Pause Agent */}
                <div className="flex items-center justify-between pb-4 border-b border-red-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Pause Agent</p>
                    <p className="text-sm text-gray-700">Temporarily stop this agent from running</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                    Pause
                  </Button>
                </div>

                {/* Delete Agent */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Delete Agent</p>
                    <p className="text-sm text-gray-700">Permanently remove this agent and its data</p>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
