# PHASE-FRONTEND-5: Templates & My Domains

> **Objetivo:** Criar página de templates com tabs e sistema de instalação
> **Duração:** 5-6 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-4-DOMAINS concluído

---

## 📋 O que vamos fazer

1. ✅ Criar estrutura de templates (mock data)
2. ✅ Criar página `/domains/templates` com tabs
3. ✅ Tab "Templates" com grid de templates
4. ✅ Tab "My Domains" que renderiza o domain page
5. ✅ Dialog de preview de template
6. ✅ Botão "Use This Template"

---

## 🎯 Estrutura de Navegação

```
/domains
  ↓ (clica em "Financial")
/domains/templates?domain=financial
  → Tab "Templates": mostra templates pré-configurados
  → Tab "My Domains": mostra domain page do Financial
```

---

## 📦 Passo 1: Tipos de Templates

**Atualizar:** `src/types/domain.ts`

```typescript
export interface Template {
  id: string
  name: string
  description: string
  domainId: string
  isPopular: boolean
  agentCount: number
  subdomains: {
    id: string
    name: string
    icon: LucideIcon
    description: string
    agents: string[] // agent names
  }[]
  previewCards: {
    title: string
    variables: { label: string; value: string }[]
  }[]
}
```

---

## 🗂️ Passo 2: Mock Data de Templates

**Caminho:** `src/lib/templates-data.ts`

```typescript
import { DollarSign, TrendingUp, CreditCard, PiggyBank } from 'lucide-react'
import { Template } from '@/types/domain'

export const FINANCIAL_TEMPLATES: Template[] = [
  {
    id: 'personal-finance-manager',
    name: 'Personal Finance Manager',
    description: 'Complete personal finance tracking with cash flow and budget management',
    domainId: 'financial',
    isPopular: true,
    agentCount: 4,
    subdomains: [
      {
        id: 'cashflow',
        name: 'Cash Flow',
        icon: DollarSign,
        description: 'Track income, expenses, and balance',
        agents: [
          '@financial/cashflow-monitor',
          '@financial/cashflow-predictor',
          '@financial/bank-sync'
        ]
      },
      {
        id: 'budget',
        name: 'Budget & Planning',
        icon: PiggyBank,
        description: 'Budget tracking and savings goals',
        agents: ['@financial/budget-tracker']
      }
    ],
    previewCards: [
      {
        title: 'Cash Flow',
        variables: [
          { label: 'Current Balance', value: 'R$ 5.420' },
          { label: 'Monthly Income', value: 'R$ 8.500' },
          { label: 'Monthly Expenses', value: 'R$ 3.079' }
        ]
      },
      {
        title: 'Budget & Planning',
        variables: [
          { label: 'Budget Usage', value: '67%' },
          { label: 'Savings Goal', value: '78%' }
        ]
      }
    ]
  },
  {
    id: 'investment-tracker',
    name: 'Investment Portfolio Tracker',
    description: 'Monitor stocks, crypto, and investment performance',
    domainId: 'financial',
    isPopular: false,
    agentCount: 2,
    subdomains: [
      {
        id: 'investments',
        name: 'Investments',
        icon: TrendingUp,
        description: 'Portfolio tracking and analysis',
        agents: [
          '@financial/portfolio-sync',
          '@financial/market-analyzer'
        ]
      }
    ],
    previewCards: [
      {
        title: 'Investments',
        variables: [
          { label: 'Portfolio Value', value: 'R$ 45.320' },
          { label: 'Monthly Return', value: '+3.2%' },
          { label: 'Total Return', value: '+12.5%' }
        ]
      }
    ]
  },
  {
    id: 'debt-management',
    name: 'Debt Management System',
    description: 'Track debts, credit cards, and payment schedules',
    domainId: 'financial',
    isPopular: false,
    agentCount: 2,
    subdomains: [
      {
        id: 'debt',
        name: 'Debt & Credit',
        icon: CreditCard,
        description: 'Debt tracking and credit monitoring',
        agents: [
          '@financial/debt-tracker',
          '@financial/credit-monitor'
        ]
      }
    ],
    previewCards: [
      {
        title: 'Debt & Credit',
        variables: [
          { label: 'Total Debt', value: 'R$ 12.400' },
          { label: 'Credit Score', value: '750' },
          { label: 'Next Payment', value: 'R$ 1.200 (Jan 25)' }
        ]
      }
    ]
  }
]
```

---

## 🎴 Passo 3: Componente TemplateCard

**Caminho:** `src/components/domains/template-card.tsx`

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Template } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Bot } from 'lucide-react'

interface TemplateCardProps {
  template: Template
  onPreview: () => void
  onUse: () => void
}

export function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {template.name}
          </h3>
          {template.isPopular && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Popular
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{template.description}</p>
        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
          <span className="flex items-center space-x-1">
            <Bot className="w-3 h-3" />
            <span>{template.agentCount} agents</span>
          </span>
          <span>{template.subdomains.length} subdomains</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Preview Cards */}
        <div className={`grid gap-3 mb-4 ${
          template.previewCards.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {template.previewCards.map((card, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                {card.title}
              </h4>
              <div className="space-y-1">
                {card.variables.slice(0, 2).map((variable, vIdx) => (
                  <div key={vIdx} className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">{variable.label}</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {variable.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={onPreview}>
            Ver
          </Button>
          <Button className="flex-1" onClick={onUse}>
            Use This Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 📄 Passo 4: Dialog de Preview

**Caminho:** `src/components/domains/template-preview-dialog.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Template } from '@/types/domain'
import { Bot } from 'lucide-react'

interface TemplatePreviewDialogProps {
  template: Template | null
  open: boolean
  onClose: () => void
  onUse: () => void
}

export function TemplatePreviewDialog({
  template,
  open,
  onClose,
  onUse
}: TemplatePreviewDialogProps) {
  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Subdomains */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Included Subdomains ({template.subdomains.length})
            </h3>
            <div className="space-y-2">
              {template.subdomains.map((subdomain) => {
                const Icon = subdomain.icon
                return (
                  <div
                    key={subdomain.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {subdomain.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {subdomain.description}
                        </p>
                        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                          <Bot className="w-3 h-3" />
                          <span>{subdomain.agents.length} agents</span>
                        </div>
                      </div>
                    </div>

                    {/* Agents List */}
                    <div className="mt-3 pl-11 space-y-1">
                      {subdomain.agents.map((agent) => (
                        <div key={agent} className="text-xs text-gray-600 font-mono">
                          {agent}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onUse}>
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🏠 Passo 5: Página Templates

**Caminho:** `src/app/(dashboard)/domains/templates/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateCard } from '@/components/domains/template-card'
import { TemplatePreviewDialog } from '@/components/domains/template-preview-dialog'
import { FINANCIAL_TEMPLATES } from '@/lib/templates-data'
import { LIFE_DOMAINS } from '@/lib/domains-data'
import { Template } from '@/types/domain'
import { ArrowLeft } from 'lucide-react'

export default function TemplatesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const domainId = searchParams.get('domain') || 'financial'

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const domain = LIFE_DOMAINS.find((d) => d.id === domainId)
  const templates = FINANCIAL_TEMPLATES // TODO: filtrar por domainId quando tiver outros domínios

  const handleUseTemplate = (template: Template) => {
    console.log('Installing template:', template.id)
    // TODO: Instalar template (criar subdomains + agents)
    // Por enquanto, apenas navega para o domain page
    router.push(`/domains/${domainId}`)
  }

  if (isLoading || !isAuthenticated) return null

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
        <TabsContent value="my-domains">
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">
              No subdomains yet. Choose a template or start from scratch.
            </p>
            <Button onClick={() => router.push(`/domains/${domainId}`)}>
              Create Subdomain
            </Button>
          </div>
          {/* TODO: Na próxima fase, vai renderizar o DomainPage aqui */}
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
    </div>
  )
}
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Tipos de Template criados
- [ ] ✅ Mock data de templates do Financial criado
- [ ] ✅ Componente TemplateCard criado
- [ ] ✅ Dialog de preview criado
- [ ] ✅ Página `/domains/templates` criada
- [ ] ✅ Tab "Templates" renderizando grid
- [ ] ✅ Tab "My Domains" com placeholder
- [ ] ✅ Botão "Ver" abre preview
- [ ] ✅ Botão "Use This Template" navega para domain page
- [ ] ✅ Botão "Start From Scratch" navega para domain page
- [ ] ✅ Botão "Back to Domains" volta para `/domains`

---

## 🧪 Como Testar

1. Acesse `/domains`
2. Clique em "Financial"
3. Deve navegar para `/domains/templates?domain=financial`
4. Veja 3 templates no grid
5. Clique em "Ver" → abre preview com subdomains e agents
6. Clique em "Use This Template" → navega para `/domains/financial`
7. Clique em tab "My Domains" → vê placeholder vazio
8. Clique "Start From Scratch" → navega para `/domains/financial`

---

## 📱 Responsividade

- **Mobile (< 1024px):** 1 coluna de templates
- **Desktop (> 1024px):** 2 colunas de templates

Preview cards dentro do template:
- **2 cards:** grid 2 colunas
- **1 card:** full width

---

## ➡️ Próximo Passo

**Continue para:** `PHASE-FRONTEND-6-DOMAIN-PAGE.md`

Onde você vai criar a página do domínio com cards customizáveis via drag-and-drop.

---

**Status:** 🟢 Templates Page Completo
**Tempo Estimado:** ~5-6 horas
