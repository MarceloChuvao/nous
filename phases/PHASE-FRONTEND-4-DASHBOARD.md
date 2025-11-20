# PHASE-FRONTEND-4: Dashboard Principal

> **Objetivo:** Criar dashboard com layout, navbar e cards de estatísticas
> **Duração:** 4-5 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-3-AUTH concluído

---

## 📋 O que vamos fazer

1. ✅ Criar Navbar com navegação
2. ✅ Criar layout do dashboard
3. ✅ Criar componente StatCard
4. ✅ Criar dashboard principal com dados mockados
5. ✅ Adicionar seção de atividade recente

---

## 🧭 Passo 1: Navbar

**Caminho:** `src/components/layout/navbar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, DollarSign, Settings, MessageSquare } from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Saúde', href: '/health', icon: Heart },
  { name: 'Finanças', href: '/finance', icon: DollarSign },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg" />
              <span className="text-xl font-bold text-gray-900">NOUS</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    {
                      'bg-primary-50 text-primary-700': isActive,
                      'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isActive
                    }
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400" />
          </div>
        </div>
      </div>
    </nav>
  )
}
```

---

## 🏗️ Passo 2: Dashboard Layout

**Caminho:** `src/app/(dashboard)/layout.tsx`

```typescript
import { Navbar } from '@/components/layout/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </>
  )
}
```

---

## 📊 Passo 3: StatCard Component

**Caminho:** `src/components/dashboard/stat-card.tsx`

```typescript
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow'
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600'
}

export function StatCard({ title, value, change, icon: Icon, color = 'blue' }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>

          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}
```

---

## 🏠 Passo 4: Dashboard Principal

**Caminho:** `src/app/(dashboard)/dashboard/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth'
import { Heart, DollarSign, MessageSquare, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth()

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
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Aqui está um resumo do seu dia
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Colesterol Total"
          value="185 mg/dL"
          change={-2.3}
          icon={Heart}
          color="green"
        />

        <StatCard
          title="Saldo Total"
          value="R$ 5.420"
          change={12.5}
          icon={DollarSign}
          color="blue"
        />

        <StatCard
          title="Conversas (7d)"
          value="24"
          icon={MessageSquare}
          color="purple"
        />

        <StatCard
          title="Meta de Economia"
          value="78%"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Recent Activity & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Atividade Recente
          </h2>
          <div className="space-y-3">
            {[
              { text: 'Exame de sangue atualizado', time: '2h atrás', type: 'health' },
              { text: 'Gasto em restaurante detectado', time: '5h atrás', type: 'finance' },
              { text: 'Lembrete: Tomar vitamina D', time: '1d atrás', type: 'reminder' }
            ].map((activity, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Sugeridas
          </h2>
          <div className="space-y-3">
            {[
              'Agendar check-up anual',
              'Revisar orçamento do mês',
              'Atualizar meta de economia'
            ].map((suggestion, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-900">{suggestion}</p>
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2">
                  Ver detalhes →
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
```

---

## 📄 Passo 5: Mock Data Helper

**Caminho:** `src/lib/mock-data.ts`

```typescript
export const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  avatar: null
}

export const mockHealthData = {
  cholesterol: { value: 185, unit: 'mg/dL', status: 'normal', change: -2.3 },
  glucose: { value: 92, unit: 'mg/dL', status: 'normal' },
  hdl: { value: 55, unit: 'mg/dL', status: 'normal' }
}

export const mockFinanceData = {
  balance: 5420.50,
  monthlyChange: 12.5,
  accounts: [
    { name: 'Conta Corrente', bank: 'Nubank', balance: 3200.00 },
    { name: 'Poupança', bank: 'Nubank', balance: 2220.50 }
  ]
}

export const mockActivities = [
  { id: '1', text: 'Exame de sangue atualizado', time: '2h atrás', type: 'health' },
  { id: '2', text: 'Gasto em restaurante detectado', time: '5h atrás', type: 'finance' },
  { id: '3', text: 'Lembrete: Tomar vitamina D', time: '1d atrás', type: 'reminder' }
]
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Navbar criada com navegação
- [ ] ✅ Dashboard layout criado
- [ ] ✅ StatCard component criado
- [ ] ✅ Dashboard principal funcionando
- [ ] ✅ Cards de estatística renderizando
- [ ] ✅ Atividade recente aparecendo
- [ ] ✅ Ações sugeridas aparecendo
- [ ] ✅ Layout responsivo (mobile/tablet/desktop)

---

## 🧪 Como Testar

1. Faça login
2. Acesse `/dashboard`
3. Veja:
   - ✅ Navbar no topo
   - ✅ Mensagem de boas-vindas com seu nome
   - ✅ 4 cards de estatísticas
   - ✅ Seção de atividade recente
   - ✅ Seção de ações sugeridas
4. Clique nos itens da navbar (devem navegar para rotas vazias por enquanto)

---

## 📱 Responsividade

O dashboard é responsivo:

- **Mobile (< 768px):** Cards em 1 coluna
- **Tablet (768px - 1024px):** Cards em 2 colunas
- **Desktop (> 1024px):** Cards em 4 colunas

Teste redimensionando a janela!

---

## ➡️ Próximo Passo

**Continue para:** `PHASE-FRONTEND-5-VERTICALS.md`

Onde você vai criar os dashboards de Saúde e Finanças.

---

**Status:** 🟢 Dashboard Completo
**Tempo Gasto:** ~4-5 horas
