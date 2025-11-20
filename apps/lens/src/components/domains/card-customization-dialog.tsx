'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SubdomainWithConfig, VariableConfig } from '@/types/domain'
import { MOCK_VARIABLE_VALUES } from '@/lib/subdomains-data'
import { X } from 'lucide-react'

interface CardCustomizationDialogProps {
  subdomain: SubdomainWithConfig | null
  open: boolean
  onClose: () => void
  onSave: (configs: VariableConfig[]) => void
}

export function CardCustomizationDialog({
  subdomain,
  open,
  onClose,
  onSave
}: CardCustomizationDialogProps) {
  const [configs, setConfigs] = useState<VariableConfig[]>([])
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<VariableConfig | null>(null)

  // Initialize configs when dialog opens
  useEffect(() => {
    if (subdomain && open) {
      setConfigs(JSON.parse(JSON.stringify(subdomain.variableConfigs)))
    }
  }, [subdomain, open])

  if (!subdomain) return null

  const enabledVars = configs.filter((v) => v.enabled)
  const disabledVars = configs.filter((v) => !v.enabled)
  const selected = configs.find((v) => v.id === selectedVariable)

  // Grid rendering logic
  const maxRow = Math.max(...enabledVars.map((v) => v.layoutPosition.row), 0)
  const gridRows: Array<Array<VariableConfig | null>> = []
  for (let r = 0; r <= maxRow; r++) {
    gridRows[r] = [null, null]
  }
  enabledVars.forEach((v) => {
    const { row, col } = v.layoutPosition
    if (gridRows[row]) {
      gridRows[row][col] = v
    }
  })

  // Drag handlers
  const handleDragStart = (variable: VariableConfig) => {
    setDraggedItem(variable)
  }

  const handleDrop = (targetRow: number, targetCol: number) => {
    if (!draggedItem) return

    const updatedConfigs = [...configs]
    const draggedIndex = updatedConfigs.findIndex((v) => v.id === draggedItem.id)

    // Save original position BEFORE updating
    const originalPosition = { ...draggedItem.layoutPosition }

    // If dragging from disabled list, enable it
    if (!draggedItem.enabled) {
      updatedConfigs[draggedIndex].enabled = true
    }

    // Check if target cell is occupied BEFORE updating position
    const occupied = updatedConfigs.find(
      (v) =>
        v.enabled &&
        v.id !== draggedItem.id &&
        v.layoutPosition.row === targetRow &&
        v.layoutPosition.col === targetCol
    )

    if (occupied) {
      // Swap: move occupied item to dragged item's ORIGINAL position
      const occupiedIndex = updatedConfigs.findIndex((v) => v.id === occupied.id)
      updatedConfigs[occupiedIndex].layoutPosition = originalPosition
    }

    // Update dragged item to target position
    updatedConfigs[draggedIndex].layoutPosition = { row: targetRow, col: targetCol }

    setConfigs(updatedConfigs)
    setDraggedItem(null)
  }

  const handleRemoveFromGrid = (variableId: string) => {
    const updatedConfigs = configs.map((v) =>
      v.id === variableId ? { ...v, enabled: false } : v
    )
    setConfigs(updatedConfigs)
    if (selectedVariable === variableId) {
      setSelectedVariable(null)
    }
  }

  const handleStyleChange = (
    field: keyof VariableConfig,
    value: string
  ) => {
    if (!selectedVariable) return
    const updatedConfigs = configs.map((v) =>
      v.id === selectedVariable ? { ...v, [field]: value } : v
    )
    setConfigs(updatedConfigs)
  }

  const handleSave = () => {
    onSave(configs)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize {subdomain.name} Card</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT PANEL */}
          <div className="space-y-4">
            {/* Available Variables */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Available Variables
              </h3>
              <div className="space-y-2">
                {disabledVars.map((variable) => (
                  <div
                    key={variable.id}
                    draggable
                    onDragStart={() => handleDragStart(variable)}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {variable.label}
                    </p>
                    <p className="text-xs text-gray-500">{variable.agent}</p>
                  </div>
                ))}
                {disabledVars.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    All variables are in use
                  </p>
                )}
              </div>
            </div>

            {/* Style Editor */}
            {selected && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Style Editor: {selected.label}
                </h3>
                <div className="space-y-3">
                  {/* Font Size */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Font Size
                    </label>
                    <select
                      value={selected.fontSize}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="xs">Extra Small</option>
                      <option value="sm">Small</option>
                      <option value="base">Base</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                      <option value="2xl">2X Large</option>
                    </select>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Font Weight
                    </label>
                    <select
                      value={selected.fontWeight}
                      onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Color
                    </label>
                    <select
                      value={selected.color}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="default">Default (Gray)</option>
                      <option value="green">Green</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="amber">Amber</option>
                    </select>
                  </div>

                  {/* Display Type */}
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Display Type
                    </label>
                    <select
                      value={selected.displayType}
                      onChange={(e) => handleStyleChange('displayType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="badge">Badge</option>
                      <option value="percentage">Percentage</option>
                      <option value="progress">Progress Bar</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Preview Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Card Preview
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px]">
              <div className="space-y-3">
                {gridRows.map((row, rowIdx) => {
                  const filledCells = row.filter((cell) => cell !== null)
                  if (filledCells.length === 0) {
                    // Empty row - drop zones
                    return (
                      <div key={rowIdx} className="grid grid-cols-2 gap-3">
                        {[0, 1].map((colIdx) => (
                          <div
                            key={colIdx}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(rowIdx, colIdx)}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white min-h-[80px] flex items-center justify-center text-xs text-gray-400"
                          >
                            Drop here
                          </div>
                        ))}
                      </div>
                    )
                  }

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
                        const isSelected = selectedVariable === variable.id

                        // Render value based on displayType
                        const renderValue = () => {
                          const baseClasses = `
                            ${variable.fontSize === 'xs' ? 'text-xs' : ''}
                            ${variable.fontSize === 'sm' ? 'text-sm' : ''}
                            ${variable.fontSize === 'base' ? 'text-base' : ''}
                            ${variable.fontSize === 'lg' ? 'text-lg' : ''}
                            ${variable.fontSize === 'xl' ? 'text-xl' : ''}
                            ${variable.fontSize === '2xl' ? 'text-2xl' : ''}
                            ${variable.fontWeight === 'normal' ? 'font-normal' : ''}
                            ${variable.fontWeight === 'medium' ? 'font-medium' : ''}
                            ${variable.fontWeight === 'semibold' ? 'font-semibold' : ''}
                            ${variable.fontWeight === 'bold' ? 'font-bold' : ''}
                            ${variable.color === 'default' ? 'text-gray-900' : ''}
                            ${variable.color === 'green' ? 'text-green-600' : ''}
                            ${variable.color === 'red' ? 'text-red-600' : ''}
                            ${variable.color === 'blue' ? 'text-blue-600' : ''}
                            ${variable.color === 'amber' ? 'text-amber-600' : ''}
                          `

                          switch (variable.displayType) {
                            case 'badge':
                              return (
                                <span className={`inline-block px-2 py-1 rounded-md bg-gray-100 ${baseClasses}`}>
                                  {value}
                                </span>
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
                                    <span className={`text-xs ${variable.fontWeight === 'bold' ? 'font-bold' : 'font-medium'}`}>
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
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            draggable
                            onDragStart={() => handleDragStart(variable)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(rowIdx, colIdx)}
                            onClick={() => setSelectedVariable(variable.id)}
                            className={`
                              p-3 bg-white rounded-lg border-2 cursor-move relative
                              ${isSelected ? 'border-blue-500' : 'border-gray-200'}
                              hover:border-blue-300
                            `}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFromGrid(variable.id)
                              }}
                              className="absolute top-1 right-1 p-1 hover:bg-gray-100 rounded"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </button>

                            <p className="text-xs text-gray-600 mb-1">
                              {variable.label}
                            </p>
                            {renderValue()}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}

                {/* Empty row at bottom for new drops */}
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map((colIdx) => (
                    <div
                      key={colIdx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(maxRow + 1, colIdx)}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white min-h-[80px] flex items-center justify-center text-xs text-gray-400"
                    >
                      Drop here
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
