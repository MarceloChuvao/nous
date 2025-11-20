export const MOCK_AGENT_OUTPUTS = {
  'cashflow-monitor': {
    agentName: '@financial/cashflow-monitor',
    lastUpdated: '2025-01-20T14:30:00Z',
    data: {
      currentBalance: {
        value: 5420.50,
        currency: 'BRL',
        accounts: [
          { name: 'Conta Corrente', balance: 3200.00 },
          { name: 'Poupança', balance: 2220.50 }
        ]
      },
      monthlyIncome: {
        value: 8500.00,
        currency: 'BRL',
        sources: ['Salário']
      },
      monthlyExpenses: {
        value: 3079.50,
        currency: 'BRL',
        breakdown: {
          food: 1234.50,
          transport: 456.00,
          shopping: 789.00,
          health: 234.00,
          other: 366.00
        }
      },
      savingsRate: {
        value: 0.36,
        trend: 'increasing'
      }
    }
  },
  'bank-sync': {
    agentName: '@financial/bank-sync',
    lastUpdated: '2025-01-20T15:00:00Z',
    data: {
      syncStatus: 'success',
      lastSync: '2025-01-20T15:00:00Z',
      transactionsImported: 127,
      accountsConnected: ['Nubank', 'Inter']
    }
  },
  'portfolio-sync': {
    agentName: '@financial/portfolio-sync',
    lastUpdated: '2025-01-20T14:45:00Z',
    data: {
      portfolioValue: 45320.00,
      positions: [
        { ticker: 'ITSA4', shares: 100, value: 1200.00 },
        { ticker: 'PETR4', shares: 50, value: 1500.00 }
      ],
      monthlyReturn: 0.032,
      totalReturn: 0.125
    }
  }
}

export const MOCK_LOGS = [
  {
    id: '1',
    agent: '@financial/cashflow-monitor',
    message: 'Balance updated: R$ 5.420',
    timestamp: '2025-01-20T14:30:00Z',
    type: 'info'
  },
  {
    id: '2',
    agent: '@financial/bank-sync',
    message: 'Successfully synced 12 new transactions',
    timestamp: '2025-01-20T15:00:00Z',
    type: 'success'
  },
  {
    id: '3',
    agent: '@financial/cashflow-monitor',
    message: 'Expense detected: R$ 85.50 at Restaurante Italiano',
    timestamp: '2025-01-20T13:15:00Z',
    type: 'info'
  },
  {
    id: '4',
    agent: '@financial/bank-sync',
    message: 'Retrying connection to Nubank API...',
    timestamp: '2025-01-20T12:00:00Z',
    type: 'warning'
  },
  {
    id: '5',
    agent: '@financial/portfolio-sync',
    message: 'Portfolio value updated: R$ 45.320',
    timestamp: '2025-01-20T14:45:00Z',
    type: 'success'
  },
  {
    id: '6',
    agent: '@financial/portfolio-sync',
    message: 'Market data synchronized from B3',
    timestamp: '2025-01-20T14:45:00Z',
    type: 'info'
  }
]

export const MOCK_TASKS = [
  {
    id: '1',
    agent: '@financial/cashflow-monitor',
    name: 'Update balance',
    status: 'running',
    frequency: 'Every 5 minutes',
    lastRun: '2025-01-20T14:30:00Z',
    nextRun: '2025-01-20T14:35:00Z'
  },
  {
    id: '2',
    agent: '@financial/bank-sync',
    name: 'Sync transactions',
    status: 'scheduled',
    frequency: 'Every hour',
    lastRun: '2025-01-20T15:00:00Z',
    nextRun: '2025-01-20T16:00:00Z'
  },
  {
    id: '3',
    agent: '@financial/cashflow-predictor',
    name: 'Generate forecast',
    status: 'paused',
    frequency: 'Daily at 9 AM',
    lastRun: '2025-01-19T09:00:00Z',
    nextRun: null
  },
  {
    id: '4',
    agent: '@financial/portfolio-sync',
    name: 'Sync portfolio data',
    status: 'running',
    frequency: 'Every 15 minutes',
    lastRun: '2025-01-20T14:45:00Z',
    nextRun: '2025-01-20T15:00:00Z'
  }
]
