import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubdomainWithConfig } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Pencil } from 'lucide-react'
import { MOCK_VARIABLE_VALUES } from '@/lib/subdomains-data'

interface SubdomainCardProps {
  subdomain: SubdomainWithConfig
  onEdit: () => void
  onViewDetails: () => void
}

const fontSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl'
}

const fontWeightMap = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
}

const colorMap = {
  default: 'text-gray-900',
  green: 'text-green-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600'
}

export function SubdomainCard({ subdomain, onEdit, onViewDetails }: SubdomainCardProps) {
  const Icon = subdomain.icon
  const enabledVars = subdomain.variableConfigs.filter((v) => v.enabled)

  // Build grid structure from layoutPositions
  const maxRow = Math.max(...enabledVars.map((v) => v.layoutPosition.row))
  const rows: Array<Array<typeof enabledVars[0] | null>> = []

  for (let r = 0; r <= maxRow; r++) {
    rows[r] = [null, null] // 2 columns max
  }

  enabledVars.forEach((variable) => {
    const { row, col } = variable.layoutPosition
    if (rows[row]) {
      rows[row][col] = variable
    }
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {subdomain.name}
              </h3>
              <p className="text-xs text-gray-600">{subdomain.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Dynamic Variables Grid */}
        <div className="space-y-3 mb-4">
          {rows.map((row, rowIdx) => {
            const filledCells = row.filter((cell) => cell !== null)
            if (filledCells.length === 0) return null

            return (
              <div
                key={rowIdx}
                className={`grid gap-3 ${
                  filledCells.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {row.map((variable, colIdx) => {
                  if (!variable) return null

                  const value = MOCK_VARIABLE_VALUES[variable.name] || 'N/A'

                  // Render based on displayType
                  const renderValue = () => {
                    const baseClasses = `
                      ${fontSizeMap[variable.fontSize]}
                      ${fontWeightMap[variable.fontWeight]}
                      ${colorMap[variable.color]}
                    `

                    switch (variable.displayType) {
                      case 'badge':
                        return (
                          <Badge variant="secondary" className={baseClasses}>
                            {value}
                          </Badge>
                        )

                      case 'percentage':
                        return (
                          <p className={baseClasses}>
                            {typeof value === 'number' ? `${value}%` : value}
                          </p>
                        )

                      case 'progress':
                        const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
                        const percentage = isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue))
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs ${fontWeightMap[variable.fontWeight]}`}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  variable.color === 'green' ? 'bg-green-600' :
                                  variable.color === 'red' ? 'bg-red-600' :
                                  variable.color === 'blue' ? 'bg-blue-600' :
                                  variable.color === 'amber' ? 'bg-amber-600' :
                                  'bg-gray-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )

                      case 'number':
                        return (
                          <p className={baseClasses}>
                            {String(value)}
                          </p>
                        )

                      case 'text':
                      default:
                        return <p className={baseClasses}>{value}</p>
                    }
                  }

                  return (
                    <div key={`${rowIdx}-${colIdx}`}>
                      <p className="text-xs text-gray-600 mb-1">{variable.label}</p>
                      {renderValue()}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          View Details
        </Button>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Active Agents */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Active Agents:</p>
          <div className="flex flex-wrap gap-2">
            {subdomain.agents.map((agent) => (
              <Badge key={agent.id} variant="secondary" className="text-xs">
                {agent.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
