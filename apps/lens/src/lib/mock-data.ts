export const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  avatar: null
}

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

export const mockActivities = [
  { id: '1', text: 'Exame de sangue atualizado', time: '2h atrás', type: 'health' },
  { id: '2', text: 'Gasto em restaurante detectado', time: '5h atrás', type: 'finance' },
  { id: '3', text: 'Lembrete: Tomar vitamina D', time: '1d atrás', type: 'reminder' }
]
