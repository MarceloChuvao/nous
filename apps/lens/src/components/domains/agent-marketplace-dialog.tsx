'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MarketplaceAgent, MCP } from '@/types/domain'
import { MARKETPLACE_AGENTS, SEARCH_SUGGESTIONS } from '@/lib/marketplace-data'
import { Search, Star, Download, Bot, ChevronRight, Check } from 'lucide-react'

interface AgentMarketplaceDialogProps {
  open: boolean
  onClose: () => void
  onInstall: (agent: MarketplaceAgent, selectedMCPs: MCP[]) => void
}

type Step = 'search' | 'results' | 'configure'

export function AgentMarketplaceDialog({
  open,
  onClose,
  onInstall
}: AgentMarketplaceDialogProps) {
  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MarketplaceAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [selectedMCPs, setSelectedMCPs] = useState<MCP[]>([])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)

    // Simple search: filter by name, description, or tags
    const results = MARKETPLACE_AGENTS.filter((agent) => {
      const lowerQuery = searchQuery.toLowerCase()
      return (
        agent.name.toLowerCase().includes(lowerQuery) ||
        agent.description.toLowerCase().includes(lowerQuery) ||
        agent.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
    })

    setSearchResults(results)
    setStep('results')
  }

  const handleSelectAgent = (agent: MarketplaceAgent) => {
    setSelectedAgent(agent)
    // Pre-select all required MCPs
    setSelectedMCPs(agent.requiredMCPs)
    setStep('configure')
  }

  const handleToggleMCP = (mcp: MCP) => {
    if (mcp.isRequired) return // Can't unselect required MCPs

    const isSelected = selectedMCPs.some((m) => m.id === mcp.id)
    if (isSelected) {
      setSelectedMCPs(selectedMCPs.filter((m) => m.id !== mcp.id))
    } else {
      setSelectedMCPs([...selectedMCPs, mcp])
    }
  }

  const handleInstall = () => {
    if (selectedAgent) {
      onInstall(selectedAgent, selectedMCPs)
      handleClose()
    }
  }

  const handleClose = () => {
    setStep('search')
    setQuery('')
    setSearchResults([])
    setSelectedAgent(null)
    setSelectedMCPs([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent Marketplace</DialogTitle>
          <DialogDescription>
            Discover and install agents to automate your data collection
          </DialogDescription>
        </DialogHeader>

        {/* SEARCH STEP */}
        {step === 'search' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="What do you want to track?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearch(query)
                  }
                }}
                className="pl-10"
                autoFocus
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quick Suggestions
              </h3>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Popular Agents
              </h3>
              <div className="space-y-2">
                {MARKETPLACE_AGENTS.slice(0, 3).map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectAgent(agent)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {agent.description}
                        </p>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{agent.rating}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>{agent.installs.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS STEP */}
        {step === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {searchResults.length} agents found for "{query}"
              </p>
              <Button variant="ghost" size="sm" onClick={() => setStep('search')}>
                ← Back to Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((agent) => (
                <Card
                  key={agent.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectAgent(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-blue-600" />
                        <h3 className="text-base font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{agent.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{agent.rating}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{agent.installs.toLocaleString()}</span>
                      </span>
                      <span>{agent.version}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CONFIGURE STEP */}
        {step === 'configure' && selectedAgent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAgent.name}
                </h3>
                <p className="text-sm text-gray-600">Configure agent settings</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('results')}>
                ← Back to Results
              </Button>
            </div>

            {/* Long Description */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{selectedAgent.longDescription}</p>
            </div>

            {/* Required MCPs */}
            {selectedAgent.requiredMCPs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Required Integrations
                </h4>
                <div className="space-y-2">
                  {selectedAgent.requiredMCPs.map((mcp) => (
                    <div
                      key={mcp.id}
                      className="p-3 border-2 border-blue-300 bg-blue-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {mcp.name}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1">
                            {mcp.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Provider: {mcp.provider}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Required
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional MCPs */}
            {selectedAgent.optionalMCPs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Optional Integrations
                </h4>
                <div className="space-y-2">
                  {selectedAgent.optionalMCPs.map((mcp) => {
                    const isSelected = selectedMCPs.some((m) => m.id === mcp.id)
                    return (
                      <div
                        key={mcp.id}
                        onClick={() => handleToggleMCP(mcp)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {mcp.name}
                            </h5>
                            <p className="text-xs text-gray-600 mt-1">
                              {mcp.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Provider: {mcp.provider}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <Check className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Data Collected */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Data This Agent Collects
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedAgent.dataCollected.map((data) => (
                  <div key={data} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">{data}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Frequency */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Update Frequency</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {selectedAgent.updateFrequency}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'configure' && (
            <Button onClick={handleInstall}>
              Install Agent
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
