import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/hooks/useTheme'
import { Plus, Search, Filter, Download, Upload } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * ICARUS v5.0 - Template Padrão de Módulo
 * Design System: Dark Glass Medical (Neumorphism 3D)
 * 
 * Este template serve como base para todos os módulos do sistema
 * Personalizar: title, description, icon, tableColumns, actions
 */

interface ModuleTemplateProps {
  title: string
  description: string
  icon: LucideIcon
  iconColor: string
  stats?: Array<{
    label: string
    value: string | number
    trend?: {
      value: number
      direction: 'up' | 'down' | 'stable'
    }
  }>
  tableColumns?: string[]
  tableData?: Array<Record<string, unknown>>
  onAdd?: () => void
  onSearch?: (query: string) => void
  onFilter?: () => void
  onExport?: () => void
  onImport?: () => void
}

export function ModuleTemplate({
  title,
  description,
  icon: Icon,
  iconColor,
  stats = [],
  tableColumns = [],
  tableData = [],
  onAdd,
  onSearch,
  onFilter,
  onExport,
  onImport
}: ModuleTemplateProps) {
  const { isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDark 
                ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
                : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
            }`}
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="w-7 h-7" style={{ color: iconColor }} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>{title}</h1>
            <p className={`mt-1 ${textSecondary}`}>{description}</p>
          </div>
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {stat.value}
                </div>
                {stat.trend && (
                  <Badge 
                    className={`mt-2 ${
                      stat.trend.direction === 'up' 
                        ? 'bg-[#10B981]/20 text-[#10B981]' 
                        : stat.trend.direction === 'down'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#64748B]/20 text-[#64748B]'
                    } border-none`}
                  >
                    {stat.trend.direction === 'up' ? '+' : stat.trend.direction === 'down' ? '-' : ''}
                    {stat.trend.value}%
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            {onSearch && (
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {onFilter && (
                <Button variant="secondary" onClick={onFilter}>
                  <Filter className="w-4 h-4" />
                </Button>
              )}
              {onExport && (
                <Button variant="secondary" onClick={onExport}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {onImport && (
                <Button variant="secondary" onClick={onImport}>
                  <Upload className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {tableColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    {tableColumns.map((column, index) => (
                      <th 
                        key={index}
                        className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? (
                    tableData.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex}
                        className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5 transition-colors`}
                      >
                        {tableColumns.map((column, colIndex) => (
                          <td 
                            key={colIndex}
                            className={`py-3 px-4 ${textPrimary}`}
                          >
                            {String(row[column.toLowerCase()] || '-')}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td 
                        colSpan={tableColumns.length}
                        className={`py-8 text-center ${textMuted}`}
                      >
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {tableColumns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon 
              className={`w-16 h-16 mx-auto mb-4 ${textMuted}`} 
              style={{ color: iconColor, opacity: 0.5 }}
            />
            <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>
              Módulo em Desenvolvimento
            </h3>
            <p className={textMuted}>
              Este módulo está sendo implementado conforme o plano ICARUS v5.0
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

