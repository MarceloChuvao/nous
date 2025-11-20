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

export interface MCP {
  id: string
  name: string
  description: string
  provider: string // e.g., "Nubank", "OpenAI", "Google"
  isRequired: boolean
  isConnected: boolean
  icon?: LucideIcon
}

export interface MarketplaceAgent {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  tags: string[]
  rating: number // 0-5
  installs: number
  version: string
  author: string
  requiredMCPs: MCP[]
  optionalMCPs: MCP[]
  dataCollected: string[]
  updateFrequency: string
}

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
