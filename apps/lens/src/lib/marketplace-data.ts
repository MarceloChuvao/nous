import { MarketplaceAgent } from '@/types/domain'

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    id: 'cashflow-monitor',
    name: 'Cash Flow Monitor',
    description: 'Real-time balance tracking across all accounts',
    longDescription: 'Monitors your bank accounts in real-time, calculates current balance, tracks income and expenses, and provides savings rate insights.',
    category: 'Financial',
    tags: ['balance', 'tracking', 'real-time'],
    rating: 4.8,
    installs: 12453,
    version: '1.2.0',
    author: 'NOUS Financial Team',
    requiredMCPs: [
      {
        id: 'nubank-api',
        name: 'Nubank API',
        description: 'Connect to Nubank account',
        provider: 'Nubank',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [
      {
        id: 'inter-api',
        name: 'Inter API',
        description: 'Connect to Inter account',
        provider: 'Inter',
        isRequired: false,
        isConnected: false
      }
    ],
    dataCollected: [
      'Current balance',
      'Monthly income',
      'Monthly expenses',
      'Savings rate',
      'Account breakdown'
    ],
    updateFrequency: 'Every 5 minutes'
  },
  {
    id: 'cashflow-predictor',
    name: 'Cash Flow Predictor',
    description: 'AI-powered cash flow forecasting',
    longDescription: 'Uses machine learning to predict your future cash flow based on historical patterns, upcoming bills, and income trends.',
    category: 'Financial',
    tags: ['ai', 'prediction', 'forecasting'],
    rating: 4.6,
    installs: 8920,
    version: '2.1.3',
    author: 'NOUS AI Labs',
    requiredMCPs: [
      {
        id: 'openai-api',
        name: 'OpenAI API',
        description: 'AI processing for predictions',
        provider: 'OpenAI',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [],
    dataCollected: [
      '30-day forecast',
      '90-day forecast',
      'Predicted expenses',
      'Predicted income',
      'Cash flow alerts'
    ],
    updateFrequency: 'Daily at 9 AM'
  },
  {
    id: 'bank-sync',
    name: 'Bank Transaction Sync',
    description: 'Automatically import bank transactions',
    longDescription: 'Connects to your bank via API and automatically imports all transactions, categorizes them, and keeps your data up-to-date.',
    category: 'Financial',
    tags: ['sync', 'transactions', 'automation'],
    rating: 4.9,
    installs: 15678,
    version: '2.0.1',
    author: 'NOUS Financial Team',
    requiredMCPs: [
      {
        id: 'nubank-api',
        name: 'Nubank API',
        description: 'Connect to Nubank account',
        provider: 'Nubank',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [
      {
        id: 'inter-api',
        name: 'Inter API',
        description: 'Connect to Inter account',
        provider: 'Inter',
        isRequired: false,
        isConnected: false
      },
      {
        id: 'c6-api',
        name: 'C6 Bank API',
        description: 'Connect to C6 account',
        provider: 'C6 Bank',
        isRequired: false,
        isConnected: false
      }
    ],
    dataCollected: [
      'Transaction history',
      'Merchant data',
      'Categories',
      'Payment methods',
      'Transaction timestamps'
    ],
    updateFrequency: 'Every hour'
  },
  {
    id: 'transaction-categorizer',
    name: 'AI Transaction Categorizer',
    description: 'Automatically categorize expenses with AI',
    longDescription: 'Uses natural language processing to intelligently categorize your transactions into food, transport, shopping, health, and more.',
    category: 'Financial',
    tags: ['ai', 'categorization', 'automation'],
    rating: 4.7,
    installs: 10234,
    version: '1.5.2',
    author: 'NOUS AI Labs',
    requiredMCPs: [
      {
        id: 'openai-api',
        name: 'OpenAI API',
        description: 'AI processing for categorization',
        provider: 'OpenAI',
        isRequired: true,
        isConnected: false
      }
    ],
    optionalMCPs: [],
    dataCollected: [
      'Transaction categories',
      'Spending breakdown',
      'Category trends',
      'Merchant patterns'
    ],
    updateFrequency: 'Real-time as transactions arrive'
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Track spending against budget limits',
    longDescription: 'Set monthly budgets for different categories and get alerts when you approach or exceed limits.',
    category: 'Financial',
    tags: ['budget', 'alerts', 'tracking'],
    rating: 4.5,
    installs: 9876,
    version: '1.0.8',
    author: 'NOUS Financial Team',
    requiredMCPs: [],
    optionalMCPs: [
      {
        id: 'telegram-bot',
        name: 'Telegram Bot',
        description: 'Receive budget alerts via Telegram',
        provider: 'Telegram',
        isRequired: false,
        isConnected: false
      }
    ],
    dataCollected: [
      'Budget usage %',
      'Remaining budget',
      'Over-budget categories',
      'Budget trends'
    ],
    updateFrequency: 'Every 30 minutes'
  }
]

export const SEARCH_SUGGESTIONS = [
  'Track my bank balance',
  'Predict future expenses',
  'Categorize transactions',
  'Monitor budget',
  'Sync bank accounts'
]
