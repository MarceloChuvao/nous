# PHASE-FRONTEND-4: Life Domains Grid

> **Objetivo:** Criar página inicial com grid dos 12 Life Domains
> **Duração:** 3-4 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-3-AUTH concluído

---

## 📋 O que vamos fazer

1. ✅ Criar tipos de domínios
2. ✅ Criar página `/domains` com grid de 12 domínios
3. ✅ Componente de DomainCard
4. ✅ Navegação para templates ao clicar

---

## 🎯 Estrutura de Navegação

```
/domains (esta fase)
  ↓ (clica em domínio)
/domains/templates?domain={id} (próxima fase)
  ↓ (escolhe template OU "Start From Scratch")
/domains/{domainId} (fase 6)
```

---

## 📦 Passo 1: Tipos de Domínios

**Caminho:** `src/types/domain.ts`

```typescript
import { LucideIcon } from 'lucide-react'

export interface Domain {
  id: string
  name: string
  icon: LucideIcon
  description: string
  subdomains: number // count of subdomains
  color: string // Tailwind color class
}

export interface Subdomain {
  id: string
  name: string
  icon: LucideIcon
  description: string
  domainId: string
  agentCount: number
}

export interface Agent {
  id: string
  name: string // e.g., "@financial/cashflow-monitor"
  description: string
  status: 'active' | 'paused' | 'error'
  activeSince: string
  version: string
  color: string
  bgColor: string
}
```

---

## 🗂️ Passo 2: Mock Data dos 12 Domínios

**Caminho:** `src/lib/domains-data.ts`

```typescript
import {
  DollarSign,
  Heart,
  Briefcase,
  Users,
  GraduationCap,
  Home,
  Sparkles,
  Target,
  Globe,
  Lightbulb,
  Shield,
  TrendingUp
} from 'lucide-react'
import { Domain } from '@/types/domain'

export const LIFE_DOMAINS: Domain[] = [
  {
    id: 'financial',
    name: 'Financial',
    icon: DollarSign,
    description: 'Manage money, investments, and budget',
    subdomains: 0,
    color: 'blue'
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: Heart,
    description: 'Track fitness, nutrition, and medical data',
    subdomains: 0,
    color: 'red'
  },
  {
    id: 'career',
    name: 'Career & Professional',
    icon: Briefcase,
    description: 'Career growth, skills, and networking',
    subdomains: 0,
    color: 'purple'
  },
  {
    id: 'relationships',
    name: 'Relationships',
    icon: Users,
    description: 'Family, friends, and social connections',
    subdomains: 0,
    color: 'pink'
  },
  {
    id: 'learning',
    name: 'Learning & Development',
    icon: GraduationCap,
    description: 'Education, courses, and skill building',
    subdomains: 0,
    color: 'indigo'
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: Home,
    description: 'Household, maintenance, and organization',
    subdomains: 0,
    color: 'green'
  },
  {
    id: 'personal',
    name: 'Personal Growth',
    icon: Sparkles,
    description: 'Mindfulness, habits, and self-improvement',
    subdomains: 0,
    color: 'amber'
  },
  {
    id: 'goals',
    name: 'Goals & Projects',
    icon: Target,
    description: 'Track goals, milestones, and projects',
    subdomains: 0,
    color: 'cyan'
  },
  {
    id: 'travel',
    name: 'Travel & Experiences',
    icon: Globe,
    description: 'Trips, adventures, and memories',
    subdomains: 0,
    color: 'teal'
  },
  {
    id: 'creativity',
    name: 'Creativity & Hobbies',
    icon: Lightbulb,
    description: 'Creative projects and hobbies',
    subdomains: 0,
    color: 'orange'
  },
  {
    id: 'security',
    name: 'Security & Legal',
    icon: Shield,
    description: 'Legal docs, insurance, and protection',
    subdomains: 0,
    color: 'slate'
  },
  {
    id: 'legacy',
    name: 'Legacy & Impact',
    icon: TrendingUp,
    description: 'Long-term impact and contributions',
    subdomains: 0,
    color: 'emerald'
  }
]
```

---

## 🎴 Passo 3: Componente DomainCard

**Caminho:** `src/components/domains/domain-card.tsx`

```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Domain } from '@/types/domain'
import { LucideIcon } from 'lucide-react'

interface DomainCardProps {
  domain: Domain
  onClick: () => void
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'hover:border-blue-300' },
  red: { bg: 'bg-red-100', text: 'text-red-600', border: 'hover:border-red-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'hover:border-purple-300' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'hover:border-pink-300' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'hover:border-indigo-300' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'hover:border-green-300' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'hover:border-amber-300' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'hover:border-cyan-300' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'hover:border-teal-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'hover:border-orange-300' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'hover:border-slate-300' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'hover:border-emerald-300' }
}

export function DomainCard({ domain, onClick }: DomainCardProps) {
  const Icon = domain.icon
  const colors = colorMap[domain.color] || colorMap.blue

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:shadow-md ${colors.border}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {domain.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {domain.description}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{domain.subdomains} subdomains</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🏠 Passo 4: Página Domains

**Caminho:** `src/app/(dashboard)/domains/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { DomainCard } from '@/components/domains/domain-card'
import { LIFE_DOMAINS } from '@/lib/domains-data'

export default function DomainsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Life Domains</h1>
        <p className="text-gray-600 mt-2">
          Organize your life across 12 key domains. Click any domain to get started.
        </p>
      </div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LIFE_DOMAINS.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            onClick={() => router.push(`/domains/templates?domain=${domain.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Passo 5: Atualizar Navbar

**Atualizar:** `src/components/layout/navbar.tsx`

Trocar o link do dashboard para apontar para `/domains`:

```typescript
const navigation = [
  { name: 'Domains', href: '/domains', icon: Home }, // ← ALTERADO
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Tipos criados em `src/types/domain.ts`
- [ ] ✅ Mock data dos 12 domínios criado
- [ ] ✅ Componente DomainCard criado
- [ ] ✅ Página `/domains` criada
- [ ] ✅ Grid de 3 colunas (responsivo)
- [ ] ✅ Hover effects funcionando
- [ ] ✅ Click navega para `/domains/templates?domain={id}`
- [ ] ✅ Navbar atualizada para apontar para `/domains`

---

## 🧪 Como Testar

1. Faça login
2. Clique em "Domains" na navbar
3. Veja grid com 12 domínios
4. Hover sobre um card (deve ter borda colorida + shadow)
5. Clique em qualquer domínio → deve navegar para `/domains/templates?domain={id}`
6. Teste responsividade:
   - Mobile: 1 coluna
   - Tablet: 2 colunas
   - Desktop: 3 colunas

---

## 📱 Responsividade

- **Mobile (< 768px):** 1 coluna
- **Tablet (768px - 1024px):** 2 colunas
- **Desktop (> 1024px):** 3 colunas

---

## ➡️ Próximo Passo

**Continue para:** `PHASE-FRONTEND-5-TEMPLATES.md`

Onde você vai criar a página de templates com os tabs "Templates" e "My Domains".

---

**Status:** 🟢 Domains Page Completo
**Tempo Estimado:** ~3-4 horas
