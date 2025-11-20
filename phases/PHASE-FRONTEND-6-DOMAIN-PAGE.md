# PHASE-FRONTEND-6: Domain Page & Card Customization

> **Objetivo:** Criar página do domínio com cards customizáveis via drag-and-drop
> **Duração:** 8-10 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-5-TEMPLATES concluído

---

## 📋 O que vamos fazer

1. ✅ Criar tipos de VariableConfig
2. ✅ Criar SubdomainCard component
3. ✅ Criar Card Customization Dialog com drag-and-drop
4. ✅ Criar página `/domains/financial`
5. ✅ Implementar sistema de customização
6. ✅ Persistir configuração de cards

---

## 🎯 Funcionalidade Principal

**Card Customization System:**
- Usuário clica em "Edit" no card
- Abre dialog com 2 painéis:
  - **Left:** Available variables + Style editor
  - **Right:** Preview grid (2 colunas)
- Drag variables para o grid
- Click variable para editar estilo
- Save → card re-renderiza com novo layout

---

## 📦 Passo 1: Tipos de VariableConfig

**Atualizar:** `src/types/domain.ts`

```typescript
export interface VariableConfig {
  id: string
  name: string // e.g., "currentBalance"
  label: string // e.g., "Current Balance"
  enabled: boolean // shown in card or not
  agent: string // which agent provides this data
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold'
  color: 'default' | 'green' | 'red' | 'blue' | 'amber'
  displayType: 'text' | 'number' | 'badge' | 'progress' | 'percentage'
  layoutPosition: { row: number; col: number } // 0-indexed
}

export interface SubdomainWithConfig {
  id: string
  name: string
  icon: LucideIcon
  description: string
  agents: Agent[]
  variableConfigs: VariableConfig[]
}
```

---

## 🗂️ Passo 2: Mock Data de Subdomains

**Caminho:** `src/lib/subdomains-data.ts`

```typescript
import { DollarSign, TrendingUp, PiggyBank } from 'lucide-react'
import { SubdomainWithConfig, Agent, VariableConfig } from '@/types/domain'

export const MOCK_FINANCIAL_SUBDOMAINS: SubdomainWithConfig[] = [
  {
    id: 'cashflow',
    name: 'Cash Flow',
    icon: DollarSign,
    description: 'Track income, expenses, and balance',
    agents: [
      {
        id: 'cashflow-monitor',
        name: '@financial/cashflow-monitor',
        description: 'Real-time balance tracking',
        status: 'active',
        activeSince: '2025-01-10',
        version: '1.2.0',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        id: 'bank-sync',
        name: '@financial/bank-sync',
        description: 'Sync with bank APIs',
        status: 'active',
        activeSince: '2025-01-10',
        version: '2.0.1',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      }
    ],
    variableConfigs: [
      {
        id: 'currentBalance',
        name: 'currentBalance',
        label: 'Current Balance',
        enabled: true,
        agent: '@financial/cashflow-monitor',
        fontSize: '2xl',
        fontWeight: 'bold',
        color: 'default',
        displayType: 'number',
        layoutPosition: { row: 0, col: 0 }
      },
      {
        id: 'monthlyIncome',
        name: 'monthlyIncome',
        label: 'Monthly Income',
        enabled: true,
        agent: '@financial/cashflow-monitor',
        fontSize: 'base',
        fontWeight: 'medium',
        color: 'green',
        displayType: 'number',
        layoutPosition: { row: 1, col: 0 }
      },
      {
        id: 'monthlyExpenses',
        name: 'monthlyExpenses',
        label: 'Monthly Expenses',
        enabled: true,
        agent: '@financial/cashflow-monitor',
        fontSize: 'base',
        fontWeight: 'medium',
        color: 'red',
        displayType: 'number',
        layoutPosition: { row: 1, col: 1 }
      },
      {
        id: 'savingsRate',
        name: 'savingsRate',
        label: 'Savings Rate',
        enabled: false,
        agent: '@financial/cashflow-monitor',
        fontSize: 'sm',
        fontWeight: 'normal',
        color: 'default',
        displayType: 'percentage',
        layoutPosition: { row: 2, col: 0 }
      }
    ]
  },
  {
    id: 'investments',
    name: 'Investments',
    icon: TrendingUp,
    description: 'Portfolio tracking and analysis',
    agents: [
      {
        id: 'portfolio-sync',
        name: '@financial/portfolio-sync',
        description: 'Sync investment data',
        status: 'active',
        activeSince: '2025-01-12',
        version: '1.0.5',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      }
    ],
    variableConfigs: [
      {
        id: 'portfolioValue',
        name: 'portfolioValue',
        label: 'Portfolio Value',
        enabled: true,
        agent: '@financial/portfolio-sync',
        fontSize: '2xl',
        fontWeight: 'bold',
        color: 'default',
        displayType: 'number',
        layoutPosition: { row: 0, col: 0 }
      },
      {
        id: 'monthlyReturn',
        name: 'monthlyReturn',
        label: 'Monthly Return',
        enabled: true,
        agent: '@financial/portfolio-sync',
        fontSize: 'lg',
        fontWeight: 'semibold',
        color: 'green',
        displayType: 'percentage',
        layoutPosition: { row: 1, col: 0 }
      }
    ]
  }
]

// Mock values para renderizar nos cards
export const MOCK_VARIABLE_VALUES: Record<string, string> = {
  currentBalance: 'R$ 5.420',
  monthlyIncome: 'R$ 8.500',
  monthlyExpenses: 'R$ 3.079',
  savingsRate: '36%',
  portfolioValue: 'R$ 45.320',
  monthlyReturn: '+3.2%'
}
```

---

## 🎴 Passo 3: SubdomainCard Component

**Caminho:** `src/components/domains/subdomain-card.tsx`

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubdomainWithConfig } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Pencil } from 'lucide-react'
import { MOCK_VARIABLE_VALUES } from '@/lib/subdomains-data'

interface SubdomainCardProps {
  subdomain: SubdomainWithConfig
  onEdit: () => void
  onViewDetails: () => void
}

const fontSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl'
}

const fontWeightMap = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
}

const colorMap = {
  default: 'text-gray-900',
  green: 'text-green-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600'
}

export function SubdomainCard({ subdomain, onEdit, onViewDetails }: SubdomainCardProps) {
  const Icon = subdomain.icon
  const enabledVars = subdomain.variableConfigs.filter((v) => v.enabled)

  // Build grid structure from layoutPositions
  const maxRow = Math.max(...enabledVars.map((v) => v.layoutPosition.row))
  const rows: Array<Array<typeof enabledVars[0] | null>> = []

  for (let r = 0; r <= maxRow; r++) {
    rows[r] = [null, null] // 2 columns max
  }

  enabledVars.forEach((variable) => {
    const { row, col } = variable.layoutPosition
    if (rows[row]) {
      rows[row][col] = variable
    }
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {subdomain.name}
              </h3>
              <p className="text-xs text-gray-600">{subdomain.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>

        {/* Active Agents */}
        <div className="flex flex-wrap gap-2 mt-3">
          {subdomain.agents.map((agent) => (
            <Badge key={agent.id} variant="secondary" className="text-xs">
              {agent.name}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Dynamic Variables Grid */}
        <div className="space-y-3 mb-4">
          {rows.map((row, rowIdx) => {
            const filledCells = row.filter((cell) => cell !== null)
            if (filledCells.length === 0) return null

            return (
              <div
                key={rowIdx}
                className={`grid gap-3 ${
                  filledCells.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {row.map((variable, colIdx) => {
                  if (!variable) return null

                  const value = MOCK_VARIABLE_VALUES[variable.name] || 'N/A'

                  return (
                    <div key={`${rowIdx}-${colIdx}`}>
                      <p className="text-xs text-gray-600 mb-1">{variable.label}</p>
                      <p
                        className={`
                          ${fontSizeMap[variable.fontSize]}
                          ${fontWeightMap[variable.fontWeight]}
                          ${colorMap[variable.color]}
                        `}
                      >
                        {value}
                      </p>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 🎨 Passo 4: Card Customization Dialog (PARTE 1/2 - Estrutura)

**Caminho:** `src/components/domains/card-customization-dialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SubdomainWithConfig, VariableConfig } from '@/types/domain'
import { MOCK_VARIABLE_VALUES } from '@/lib/subdomains-data'
import { X } from 'lucide-react'

interface CardCustomizationDialogProps {
  subdomain: SubdomainWithConfig | null
  open: boolean
  onClose: () => void
  onSave: (configs: VariableConfig[]) => void
}

export function CardCustomizationDialog({
  subdomain,
  open,
  onClose,
  onSave
}: CardCustomizationDialogProps) {
  const [configs, setConfigs] = useState<VariableConfig[]>([])
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<VariableConfig | null>(null)

  // Initialize configs when dialog opens
  useState(() => {
    if (subdomain) {
      setConfigs(JSON.parse(JSON.stringify(subdomain.variableConfigs)))
    }
  })

  if (!subdomain) return null

  const enabledVars = configs.filter((v) => v.enabled)
  const disabledVars = configs.filter((v) => !v.enabled)
  const selected = configs.find((v) => v.id === selectedVariable)

  // Grid rendering logic
  const maxRow = Math.max(...enabledVars.map((v) => v.layoutPosition.row), 0)
  const gridRows: Array<Array<VariableConfig | null>> = []
  for (let r = 0; r <= maxRow; r++) {
    gridRows[r] = [null, null]
  }
  enabledVars.forEach((v) => {
    const { row, col } = v.layoutPosition
    if (gridRows[row]) {
      gridRows[row][col] = v
    }
  })

  // Drag handlers
  const handleDragStart = (variable: VariableConfig) => {
    setDraggedItem(variable)
  }

  const handleDrop = (targetRow: number, targetCol: number) => {
    if (!draggedItem) return

    const updatedConfigs = [...configs]
    const draggedIndex = updatedConfigs.findIndex((v) => v.id === draggedItem.id)

    // If dragging from disabled list, enable it
    if (!draggedItem.enabled) {
      updatedConfigs[draggedIndex].enabled = true
    }

    // Update position
    updatedConfigs[draggedIndex].layoutPosition = { row: targetRow, col: targetCol }

    // Check if cell is occupied
    const occupied = updatedConfigs.find(
      (v) =>
        v.enabled &&
        v.id !== draggedItem.id &&
        v.layoutPosition.row === targetRow &&
        v.layoutPosition.col === targetCol
    )

    if (occupied) {
      // Swap positions
      const occupiedIndex = updatedConfigs.findIndex((v) => v.id === occupied.id)
      updatedConfigs[occupiedIndex].layoutPosition = draggedItem.layoutPosition
    }

    setConfigs(updatedConfigs)
    setDraggedItem(null)
  }

  const handleRemoveFromGrid = (variableId: string) => {
    const updatedConfigs = configs.map((v) =>
      v.id === variableId ? { ...v, enabled: false } : v
    )
    setConfigs(updatedConfigs)
    if (selectedVariable === variableId) {
      setSelectedVariable(null)
    }
  }

  const handleStyleChange = (
    field: keyof VariableConfig,
    value: string
  ) => {
    if (!selectedVariable) return
    const updatedConfigs = configs.map((v) =>
      v.id === selectedVariable ? { ...v, [field]: value } : v
    )
    setConfigs(updatedConfigs)
  }

  const handleSave = () => {
    onSave(configs)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize {subdomain.name} Card</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT PANEL */}
          <div className="space-y-4">
            {/* Available Variables */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Available Variables
              </h3>
              <div className="space-y-2">
                {disabledVars.map((variable) => (
                  <div
                    key={variable.id}
                    draggable
                    onDragStart={() => handleDragStart(variable)}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {variable.label}
                    </p>
                    <p className="text-xs text-gray-500">{variable.agent}</p>
                  </div>
                ))}
                {disabledVars.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    All variables are in use
                  </p>
                )}
              </div>
            </div>

            {/* Style Editor */}
            {selected && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Style Editor: {selected.label}
                </h3>
                <div className="space-y-3">
                  {/* Font Size */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Font Size
                    </label>
                    <select
                      value={selected.fontSize}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="xs">Extra Small</option>
                      <option value="sm">Small</option>
                      <option value="base">Base</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                      <option value="2xl">2X Large</option>
                    </select>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Font Weight
                    </label>
                    <select
                      value={selected.fontWeight}
                      onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Color
                    </label>
                    <select
                      value={selected.color}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="default">Default (Gray)</option>
                      <option value="green">Green</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="amber">Amber</option>
                    </select>
                  </div>

                  {/* Display Type */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Display Type
                    </label>
                    <select
                      value={selected.displayType}
                      onChange={(e) => handleStyleChange('displayType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="badge">Badge</option>
                      <option value="percentage">Percentage</option>
                      <option value="progress">Progress Bar</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Preview Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Card Preview
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px]">
              <div className="space-y-3">
                {gridRows.map((row, rowIdx) => {
                  const filledCells = row.filter((cell) => cell !== null)
                  if (filledCells.length === 0) {
                    // Empty row - drop zones
                    return (
                      <div key={rowIdx} className="grid grid-cols-2 gap-3">
                        {[0, 1].map((colIdx) => (
                          <div
                            key={colIdx}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(rowIdx, colIdx)}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white min-h-[80px] flex items-center justify-center text-xs text-gray-400"
                          >
                            Drop here
                          </div>
                        ))}
                      </div>
                    )
                  }

                  return (
                    <div
                      key={rowIdx}
                      className={`grid gap-3 ${
                        filledCells.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {row.map((variable, colIdx) => {
                        if (!variable) return null

                        const value = MOCK_VARIABLE_VALUES[variable.name] || 'N/A'
                        const isSelected = selectedVariable === variable.id

                        return (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            draggable
                            onDragStart={() => handleDragStart(variable)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(rowIdx, colIdx)}
                            onClick={() => setSelectedVariable(variable.id)}
                            className={`
                              p-3 bg-white rounded-lg border-2 cursor-move relative
                              ${isSelected ? 'border-blue-500' : 'border-gray-200'}
                              hover:border-blue-300
                            `}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFromGrid(variable.id)
                              }}
                              className="absolute top-1 right-1 p-1 hover:bg-gray-100 rounded"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>

                            <p className="text-xs text-gray-600 mb-1">
                              {variable.label}
                            </p>
                            <p
                              className={`
                                ${variable.fontSize === 'xs' ? 'text-xs' : ''}
                                ${variable.fontSize === 'sm' ? 'text-sm' : ''}
                                ${variable.fontSize === 'base' ? 'text-base' : ''}
                                ${variable.fontSize === 'lg' ? 'text-lg' : ''}
                                ${variable.fontSize === 'xl' ? 'text-xl' : ''}
                                ${variable.fontSize === '2xl' ? 'text-2xl' : ''}
                                ${variable.fontWeight === 'normal' ? 'font-normal' : ''}
                                ${variable.fontWeight === 'medium' ? 'font-medium' : ''}
                                ${variable.fontWeight === 'semibold' ? 'font-semibold' : ''}
                                ${variable.fontWeight === 'bold' ? 'font-bold' : ''}
                                ${variable.color === 'default' ? 'text-gray-900' : ''}
                                ${variable.color === 'green' ? 'text-green-600' : ''}
                                ${variable.color === 'red' ? 'text-red-600' : ''}
                                ${variable.color === 'blue' ? 'text-blue-600' : ''}
                                ${variable.color === 'amber' ? 'text-amber-600' : ''}
                              `}
                            >
                              {value}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}

                {/* Empty row at bottom for new drops */}
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map((colIdx) => (
                    <div
                      key={colIdx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(maxRow + 1, colIdx)}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white min-h-[80px] flex items-center justify-center text-xs text-gray-400"
                    >
                      Drop here
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🏠 Passo 5: Página do Domínio

**Caminho:** `src/app/(dashboard)/domains/[domainId]/page.tsx`

```typescript
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

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <domain.icon className="w-8 h-8 text-blue-600" />
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
            <Button>
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
          <Button>
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
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Tipos VariableConfig e SubdomainWithConfig criados
- [ ] ✅ Mock data de subdomains criado
- [ ] ✅ SubdomainCard component criado
- [ ] ✅ Card renderiza variáveis em grid 2 colunas
- [ ] ✅ CardCustomizationDialog criado
- [ ] ✅ Drag and drop de variáveis funcionando
- [ ] ✅ Style editor funcionando (fontSize, fontWeight, color, displayType)
- [ ] ✅ Preview em tempo real funcionando
- [ ] ✅ Save configuration atualiza card
- [ ] ✅ Página `/domains/financial` criada
- [ ] ✅ Grid de subdomains funcionando
- [ ] ✅ Botões "Add Subdomain" e "Configure" visíveis

---

## 🧪 Como Testar

1. Acesse `/domains/templates?domain=financial`
2. Clique em "Use This Template" OU "Start From Scratch"
3. Navega para `/domains/financial`
4. Veja 2 cards de subdomains (Cash Flow, Investments)
5. Click em "Edit" (ícone de lápis) no card
6. Abre dialog de customização:
   - **Left:** Available variables + Style editor
   - **Right:** Preview grid
7. Arraste uma variável de "Available" para o grid → deve aparecer
8. Clique em uma variável no grid → Style editor atualiza
9. Mude font size, weight, color → preview atualiza em tempo real
10. Clique no X para remover variável do grid
11. Clique "Save Configuration" → dialog fecha e card atualiza
12. Verifique que o card reflete as novas configurações

---

## 📱 Responsividade

- **Mobile/Tablet (< 1024px):** 1 coluna de subdomains
- **Desktop (> 1024px):** 2 colunas de subdomains

Dialog de customização:
- **Desktop:** 2 painéis lado a lado
- **Mobile:** Pode ter scroll horizontal (melhorar na próxima iteração)

---

## ➡️ Próximo Passo

**Continue para:** `PHASE-FRONTEND-7-SUBDOMAIN.md`

Onde você vai criar a página do subdomain com 6 tabs (Overview, Agents, Logs, Tasks, Context, Chat).

---

**Status:** 🟢 Domain Page & Customization Completo
**Tempo Estimado:** ~8-10 horas
