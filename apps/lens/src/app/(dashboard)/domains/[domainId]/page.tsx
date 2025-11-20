'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SubdomainCard } from '@/components/domains/subdomain-card'
import { CardCustomizationDialog } from '@/components/domains/card-customization-dialog'
import { LIFE_DOMAINS } from '@/lib/domains-data'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { SubdomainWithConfig, VariableConfig } from '@/types/domain'
import { ArrowLeft, Plus, Settings } from 'lucide-react'

export default function DomainPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const domainId = params.domainId as string

  const [subdomains, setSubdomains] = useState(MOCK_FINANCIAL_SUBDOMAINS)
  const [editingSubdomain, setEditingSubdomain] = useState<SubdomainWithConfig | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cardKey, setCardKey] = useState(0) // Force re-render

  const domain = LIFE_DOMAINS.find((d) => d.id === domainId)

  const handleSaveConfig = (configs: VariableConfig[]) => {
    if (!editingSubdomain) return

    const updatedSubdomains = subdomains.map((s) =>
      s.id === editingSubdomain.id
        ? { ...s, variableConfigs: configs }
        : s
    )

    setSubdomains(updatedSubdomains)
    setCardKey((prev) => prev + 1) // Force card re-render
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!domain) {
    return <div>Domain not found</div>
  }

  const Icon = domain.icon

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/domains')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Domains
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{domain.name}</h1>
              <p className="text-gray-600 mt-1">{domain.description}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button onClick={() => router.push(`/domains/templates?domain=${domainId}`)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subdomain
            </Button>
          </div>
        </div>
      </div>

      {/* Subdomains Grid */}
      {subdomains.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">
            No subdomains yet. Add your first subdomain to get started.
          </p>
          <Button onClick={() => router.push(`/domains/templates?domain=${domainId}`)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subdomain
          </Button>
        </div>
      ) : (
        <div key={cardKey} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subdomains.map((subdomain) => (
            <SubdomainCard
              key={subdomain.id}
              subdomain={subdomain}
              onEdit={() => {
                setEditingSubdomain(subdomain)
                setDialogOpen(true)
              }}
              onViewDetails={() => router.push(`/domains/${domainId}/${subdomain.id}`)}
            />
          ))}
        </div>
      )}

      {/* Customization Dialog */}
      <CardCustomizationDialog
        subdomain={editingSubdomain}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingSubdomain(null)
        }}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
