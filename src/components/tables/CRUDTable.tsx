import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreVertical,
  Loader2,
  Download,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { useModuleMutation } from '@/hooks/useModuleData'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'

/**
 * Tabela CRUD Genérica
 * Componente completo com busca, edição, exclusão e paginação
 */

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface CRUDTableProps<T> {
  tableName: string
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onCreate?: () => void
  enableSearch?: boolean
  enableExport?: boolean
  enableFilter?: boolean
  searchPlaceholder?: string
  title?: string
}

export function CRUDTable<T extends Record<string, any>>({
  tableName,
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
  enableSearch = true,
  enableExport = true,
  enableFilter = false,
  searchPlaceholder = 'Buscar...',
  title,
}: CRUDTableProps<T>) {
  const { isDark } = useTheme()
  const mutations = useModuleMutation(tableName)

  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  // Filtro de busca
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Handler de exclusão
  const handleDeleteClick = (row: T) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return

    try {
      await mutations.delete.mutateAsync(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      onDelete?.(itemToDelete)
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  // Exportar para CSV
  const handleExport = () => {
    const headers = columns.map(col => col.label).join(',')
    const rows = filteredData.map(row =>
      columns.map(col => {
        const key = col.key as keyof T
        return `"${row[key] || ''}"`
      }).join(',')
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName}-${new Date().toISOString()}.csv`
    a.click()
    
    toast.success('Dados exportados com sucesso!')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{title || 'Registros'}</CardTitle>
            
            <div className="flex flex-wrap gap-2">
              {enableSearch && (
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              )}
              
              {enableFilter && (
                <Button variant="secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              )}
              
              {enableExport && (
                <Button variant="secondary" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              )}
              
              {onCreate && (
                <Button onClick={onCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className={textMuted}>Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={`text-left py-3 px-4 font-semibold ${textSecondary}`}
                        style={{ width: column.width }}
                      >
                        {column.label}
                      </th>
                    ))}
                    <th className={`text-right py-3 px-4 font-semibold ${textSecondary}`}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border-b ${
                        isDark 
                          ? 'border-slate-800 hover:bg-slate-800/50' 
                          : 'border-slate-100 hover:bg-slate-50'
                      } transition-colors`}
                    >
                      {columns.map((column, colIndex) => {
                        const key = column.key as keyof T
                        const value = row[key]

                        return (
                          <td key={colIndex} className={`py-3 px-4 ${textPrimary}`}>
                            {column.render ? column.render(value, row) : String(value || '-')}
                          </td>
                        )
                      })}
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(row)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(row)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Contadores */}
          <div className={`mt-4 text-sm ${textMuted}`}>
            Mostrando {filteredData.length} de {data.length} registro(s)
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * Helper para renderizar badges de status
 */
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    ativo: { label: 'Ativo', className: 'bg-emerald-500/20 text-emerald-500' },
    inativo: { label: 'Inativo', className: 'bg-slate-500/20 text-slate-500' },
    pendente: { label: 'Pendente', className: 'bg-amber-500/20 text-amber-500' },
    concluido: { label: 'Concluído', className: 'bg-blue-500/20 text-blue-500' },
    cancelado: { label: 'Cancelado', className: 'bg-red-500/20 text-red-500' },
  }

  const config = statusConfig[status] || statusConfig.inativo

  return (
    <Badge className={`${config.className} border-none`}>
      {config.label}
    </Badge>
  )
}

/**
 * Helper para formatar datas
 */
export function formatDate(date: string | Date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

/**
 * Helper para formatar moeda
 */
export function formatCurrency(value: number) {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

