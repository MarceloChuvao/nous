'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { LIFE_DOMAINS } from '@/lib/domains-data'
import { Database, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ContextPage() {
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

  const financialDomain = LIFE_DOMAINS.find((d) => d.id === 'financial')

  // Mock data for each subdomain's context
  const subdomainsWithContext = MOCK_FINANCIAL_SUBDOMAINS.map((subdomain) => ({
    ...subdomain,
    domainId: 'financial',
    domainName: financialDomain?.name || 'Financial',
    dataSources: [
      { name: 'Checking Account (Banco X)', status: 'connected', type: 'Bank' },
      { name: 'Savings Account (Banco X)', status: 'connected', type: 'Bank' }
    ],
    configuration: [
      { key: 'Monthly Limit', value: 'R$ 5,000' },
      { key: 'Alert Threshold', value: '90%' },
      { key: 'Categories', value: '8 active' }
    ]
  }))

  const totalSources = subdomainsWithContext.reduce((sum, s) => sum + s.dataSources.length, 0)
  const connectedSources = subdomainsWithContext.reduce(
    (sum, s) => sum + s.dataSources.filter(ds => ds.status === 'connected').length,
    0
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Context</h1>
        <p className="text-gray-600">
          Overview of data sources and configurations across all subdomains
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Subdomains</p>
            <p className="text-3xl font-bold text-gray-900">{subdomainsWithContext.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Data Sources</p>
            <p className="text-3xl font-bold text-gray-900">{totalSources}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Connected</p>
            <p className="text-3xl font-bold text-green-600">{connectedSources}</p>
          </CardContent>
        </Card>
      </div>

      {/* Subdomains by Domain */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{financialDomain?.name}</h2>
          <Badge variant="secondary" className="text-xs">
            {subdomainsWithContext.length} {subdomainsWithContext.length === 1 ? 'subdomain' : 'subdomains'}
          </Badge>
        </div>

        <div className="space-y-4">
          {subdomainsWithContext.map((subdomain) => {
            const Icon = subdomain.icon
            return (
              <Card
                key={subdomain.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/domains/${subdomain.domainId}/${subdomain.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {subdomain.name}
                        </h3>
                        <p className="text-sm text-gray-600">{subdomain.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/domains/${subdomain.domainId}/${subdomain.id}`)
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Data Sources */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Data Sources
                      </h4>
                      <div className="space-y-2">
                        {subdomain.dataSources.map((source, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Database className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {source.name}
                                </p>
                                <p className="text-xs text-gray-600">{source.type}</p>
                              </div>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Configuration */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Configuration
                      </h4>
                      <div className="space-y-2">
                        {subdomain.configuration.map((config, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-600">{config.key}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {config.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {subdomainsWithContext.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No data context</h3>
            <p className="text-gray-600 mb-6">
              Create subdomains to start configuring data sources
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
