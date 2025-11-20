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
  },
  {
    id: 'budget',
    name: 'Budget & Planning',
    icon: PiggyBank,
    description: 'Budget tracking and savings goals',
    agents: [
      {
        id: 'budget-tracker',
        name: '@financial/budget-tracker',
        description: 'Track spending vs budget',
        status: 'active',
        activeSince: '2025-01-08',
        version: '1.0.8',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
      }
    ],
    variableConfigs: [
      {
        id: 'budgetUsage',
        name: 'budgetUsage',
        label: 'Budget Usage',
        enabled: true,
        agent: '@financial/budget-tracker',
        fontSize: 'xl',
        fontWeight: 'bold',
        color: 'amber',
        displayType: 'percentage',
        layoutPosition: { row: 0, col: 0 }
      },
      {
        id: 'savingsGoal',
        name: 'savingsGoal',
        label: 'Savings Goal',
        enabled: true,
        agent: '@financial/budget-tracker',
        fontSize: 'base',
        fontWeight: 'medium',
        color: 'blue',
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
  monthlyReturn: '+3.2%',
  budgetUsage: '67%',
  savingsGoal: '78%'
}
