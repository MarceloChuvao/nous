import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Template } from '@/types/domain'
import { Bot } from 'lucide-react'

interface TemplatePreviewDialogProps {
  template: Template | null
  open: boolean
  onClose: () => void
  onUse: () => void
}

export function TemplatePreviewDialog({
  template,
  open,
  onClose,
  onUse
}: TemplatePreviewDialogProps) {
  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Subdomains */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Included Subdomains ({template.subdomains.length})
            </h3>
            <div className="space-y-2">
              {template.subdomains.map((subdomain) => {
                const Icon = subdomain.icon
                return (
                  <div
                    key={subdomain.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {subdomain.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {subdomain.description}
                        </p>
                        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                          <Bot className="w-3 h-3" />
                          <span>{subdomain.agents.length} agents</span>
                        </div>
                      </div>
                    </div>

                    {/* Agents List */}
                    <div className="mt-3 pl-11 space-y-1">
                      {subdomain.agents.map((agent) => (
                        <div key={agent} className="text-xs text-gray-600 font-mono">
                          {agent}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onUse}>
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
