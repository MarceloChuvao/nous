# PHASE-FRONTEND-5: Dashboards de Saúde e Finanças

> **Objetivo:** Criar dashboards especializados com gráficos e dados mockados
> **Duração:** 6-8 horas
> **Status:** 🟡 Pronto para Iniciar
> **Dependência:** PHASE-FRONTEND-4-DASHBOARD concluído

---

## 📋 O que vamos fazer

1. ✅ Dashboard de Saúde (métricas, medicamentos, exames)
2. ✅ Dashboard de Finanças (transações, gráficos, budget)
3. ✅ Componentes de gráficos (Recharts)
4. ✅ Mock data completo

---

## 💊 Parte 1: Dashboard de Saúde

### 1.1 Mock Data de Saúde

**Atualizar:** `src/lib/mock-data.ts`

```typescript
export const mockHealthData = {
  bloodwork: {
    date: '2025-01-15',
    cholesterol_total: { value: 185, unit: 'mg/dL', status: 'normal', change: -2.3 },
    glucose: { value: 92, unit: 'mg/dL', status: 'normal', change: 1.2 },
    hdl: { value: 55, unit: 'mg/dL', status: 'normal' },
    ldl: { value: 110, unit: 'mg/dL', status: 'normal' },
  },
  medications: [
    {
      id: '1',
      name: 'Vitamina D',
      dosage: '2000 UI',
      frequency: 'Diário',
      time: '09:00',
      taken_today: true
    },
    {
      id: '2',
      name: 'Ômega 3',
      dosage: '1000 mg',
      frequency: 'Diário',
      time: '20:00',
      taken_today: false
    }
  ],
  cholesterolHistory: [
    { month: 'Set', value: 195 },
    { month: 'Out', value: 192 },
    { month: 'Nov', value: 188 },
    { month: 'Dez', value: 190 },
    { month: 'Jan', value: 185 },
  ]
}
```

### 1.2 Página de Saúde

**Caminho:** `src/app/(dashboard)/health/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { Heart, Activity, Pill, TrendingDown } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockHealthData } from '@/lib/mock-data'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function HealthPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || !isAuthenticated) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saúde</h1>
        <p className="text-gray-600 mt-1">Acompanhe suas métricas de saúde</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Colesterol Total"
          value={`${mockHealthData.bloodwork.cholesterol_total.value} ${mockHealthData.bloodwork.cholesterol_total.unit}`}
          change={mockHealthData.bloodwork.cholesterol_total.change}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Glicose"
          value={`${mockHealthData.bloodwork.glucose.value} ${mockHealthData.bloodwork.glucose.unit}`}
          change={mockHealthData.bloodwork.glucose.change}
          icon={TrendingDown}
          color="blue"
        />
        <StatCard
          title="HDL (Bom)"
          value={`${mockHealthData.bloodwork.hdl.value} ${mockHealthData.bloodwork.hdl.unit}`}
          icon={Heart}
          color="green"
        />
        <StatCard
          title="LDL (Ruim)"
          value={`${mockHealthData.bloodwork.ldl.value} ${mockHealthData.bloodwork.ldl.unit}`}
          icon={Activity}
          color="yellow"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cholesterol Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico de Colesterol
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockHealthData.cholesterolHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Medications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Medicamentos</h2>
            <Pill className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {mockHealthData.medications.map((med) => (
              <div key={med.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{med.name}</p>
                  <p className="text-sm text-gray-600">{med.dosage} • {med.frequency} • {med.time}</p>
                </div>
                <input
                  type="checkbox"
                  checked={med.taken_today}
                  className="mt-1"
                  readOnly
                />
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" variant="outline">
            Adicionar Medicamento
          </Button>
        </Card>
      </div>

      {/* Upload Exam */}
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload de Exames
          </h3>
          <p className="text-gray-600 mb-4">
            Faça upload de seus exames de sangue para análise automática
          </p>
          <Button>Upload PDF/Imagem</Button>
        </div>
      </Card>
    </div>
  )
}
```

---

## 💰 Parte 2: Dashboard de Finanças

### 2.1 Mock Data de Finanças

**Atualizar:** `src/lib/mock-data.ts`

```typescript
export const mockFinanceData = {
  balance: 5420.50,
  monthlyIncome: 8500.00,
  monthlyExpenses: 3079.50,
  savingsGoal: 0.78, // 78%
  accounts: [
    { id: '1', name: 'Conta Corrente', bank: 'Nubank', balance: 3200.00 },
    { id: '2', name: 'Poupança', bank: 'Nubank', balance: 2220.50 }
  ],
  recentTransactions: [
    { id: '1', merchant: 'Restaurante Italiano', amount: -85.50, category: 'food', date: '2025-01-18' },
    { id: '2', merchant: 'Uber', amount: -25.00, category: 'transport', date: '2025-01-18' },
    { id: '3', merchant: 'Mercado', amount: -234.00, category: 'groceries', date: '2025-01-17' },
    { id: '4', merchant: 'Netflix', amount: -55.90, category: 'entertainment', date: '2025-01-15' },
    { id: '5', merchant: 'Salário', amount: 8500.00, category: 'income', date: '2025-01-05' }
  ],
  spendingByCategory: [
    { name: 'Alimentação', value: 1234.50, color: '#0ea5e9' },
    { name: 'Transporte', value: 456.00, color: '#a855f7' },
    { name: 'Compras', value: 789.00, color: '#f59e0b' },
    { name: 'Saúde', value: 234.00, color: '#10b981' },
  ]
}
```

### 2.2 Página de Finanças

**Caminho:** `src/app/(dashboard)/finance/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { DollarSign, TrendingUp, Wallet, Target } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockFinanceData } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function FinancePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || !isAuthenticated) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
        <p className="text-gray-600 mt-1">Gerencie seu dinheiro de forma inteligente</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(mockFinanceData.balance)}
          change={12.5}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Receita Mensal"
          value={formatCurrency(mockFinanceData.monthlyIncome)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Despesas Mensais"
          value={formatCurrency(mockFinanceData.monthlyExpenses)}
          icon={Wallet}
          color="red"
        />
        <StatCard
          title="Meta de Economia"
          value={`${Math.round(mockFinanceData.savingsGoal * 100)}%`}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending by Category */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Gastos por Categoria
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockFinanceData.spendingByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockFinanceData.spendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Accounts */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contas</h2>
          <div className="space-y-3">
            {mockFinanceData.accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-600">{account.bank}</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" variant="outline">
            Conectar Conta
          </Button>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transações Recentes
        </h2>
        <div className="space-y-2">
          {mockFinanceData.recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{tx.merchant}</p>
                <p className="text-sm text-gray-600">{tx.date}</p>
              </div>
              <p className={`text-lg font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

---

## 🎯 Checklist de Conclusão

- [ ] ✅ Dashboard de saúde criado
- [ ] ✅ Gráfico de colesterol funcionando
- [ ] ✅ Lista de medicamentos renderizando
- [ ] ✅ Dashboard de finanças criado
- [ ] ✅ Gráfico de pizza (gastos) funcionando
- [ ] ✅ Transações recentes listadas
- [ ] ✅ Mock data completo
- [ ] ✅ Formatação de moeda funcionando

---

## 🧪 Como Testar

1. Acesse `/health` - veja métricas e gráficos de saúde
2. Acesse `/finance` - veja saldo, gastos e transações
3. Teste responsividade (mobile/tablet/desktop)
4. Verifique se os gráficos renderizam corretamente

---

## ➡️ Próximo Passo

**Continue para:** `PHASE-FRONTEND-6-CHAT.md`

Onde você vai criar a interface de conversação com o agente.

---

**Status:** 🟢 Verticals Completos
**Tempo Gasto:** ~6-8 horas
