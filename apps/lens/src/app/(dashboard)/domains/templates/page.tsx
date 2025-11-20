'use client'

import { Suspense, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateCard } from '@/components/domains/template-card'
import { TemplatePreviewDialog } from '@/components/domains/template-preview-dialog'
import { SubdomainCard } from '@/components/domains/subdomain-card'
import { CardCustomizationDialog } from '@/components/domains/card-customization-dialog'
import { FINANCIAL_TEMPLATES } from '@/lib/templates-data'
import { LIFE_DOMAINS } from '@/lib/domains-data'
import { MOCK_FINANCIAL_SUBDOMAINS } from '@/lib/subdomains-data'
import { Template, SubdomainWithConfig, VariableConfig } from '@/types/domain'
import { ArrowLeft, Plus } from 'lucide-react'

function TemplatesPageContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const domainId = searchParams.get('domain') || 'financial'

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [subdomains, setSubdomains] = useState(MOCK_FINANCIAL_SUBDOMAINS)
  const [editingSubdomain, setEditingSubdomain] = useState<SubdomainWithConfig | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cardKey, setCardKey] = useState(0)

  const domain = LIFE_DOMAINS.find((d) => d.id === domainId)
  const templates = FINANCIAL_TEMPLATES // TODO: filtrar por domainId quando tiver outros domínios

  const handleUseTemplate = (template: Template) => {
    console.log('Installing template:', template.id)
    // TODO: Instalar template (criar subdomains + agents)
    // Por enquanto, apenas navega para o domain page
    router.push(`/domains/${domainId}`)
  }

  const handleSaveConfig = (configs: VariableConfig[]) => {
    if (!editingSubdomain) return

    const updatedSubdomains = subdomains.map((s) =>
      s.id === editingSubdomain.id
        ? { ...s, variableConfigs: configs }
        : s
    )

    setSubdomains(updatedSubdomains)
    setCardKey((prev) => prev + 1)
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {domain.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {domain.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="my-domains">My Domains</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Choose a pre-configured template to get started quickly
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/domains/${domainId}`)}
            >
              Start From Scratch
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => {
                  setPreviewTemplate(template)
                  setPreviewOpen(true)
                }}
                onUse={() => handleUseTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>

        {/* My Domains Tab */}
        <TabsContent value="my-domains" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Your active subdomains in {domain.name}
            </p>
            <Button onClick={() => router.push(`/domains/templates?domain=${domainId}`)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subdomain
            </Button>
          </div>

          {subdomains.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-4">
                No subdomains yet. Choose a template or start from scratch.
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
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onUse={() => {
          if (previewTemplate) {
            handleUseTemplate(previewTemplate)
          }
          setPreviewOpen(false)
        }}
      />

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

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <TemplatesPageContent />
    </Suspense>
  )
}
