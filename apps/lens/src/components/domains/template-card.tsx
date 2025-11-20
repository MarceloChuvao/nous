import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Template } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Bot } from 'lucide-react'

interface TemplateCardProps {
  template: Template
  onPreview: () => void
  onUse: () => void
}

export function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {template.name}
          </h3>
          {template.isPopular && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Popular
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{template.description}</p>
        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
          <span className="flex items-center space-x-1">
            <Bot className="w-3 h-3" />
            <span>{template.agentCount} agents</span>
          </span>
          <span>{template.subdomains.length} subdomains</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Preview Cards */}
        <div className={`grid gap-3 mb-4 ${
          template.previewCards.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {template.previewCards.map((card, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                {card.title}
              </h4>
              <div className="space-y-1">
                {card.variables.slice(0, 2).map((variable, vIdx) => (
                  <div key={vIdx} className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">{variable.label}</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {variable.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={onPreview}>
            Ver
          </Button>
          <Button className="flex-1" onClick={onUse}>
            Use This Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
