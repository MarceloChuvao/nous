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
