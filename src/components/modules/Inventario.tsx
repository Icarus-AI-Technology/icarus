import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import { useLotes, useLogisticaStats } from '@/hooks/queries/useLogistica'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  ClipboardCheck, Plus, Search, Filter, Eye, CheckCircle2,
  AlertTriangle, TrendingUp, Calendar
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

type InventoryStatus = 'in_progress' | 'completed' | 'approved' | 'cancelled'

interface Inventory {
  id: string
  code: string
  description: string
  start_date: string
  end_date?: string
  status: InventoryStatus
  responsible: string
  items_counted: number
  total_items: number
  divergences: number
  accuracy: number
  notes?: string
  created_at: string
}

interface InventoryItem {
  id: string
  inventory_id: string
  product_id: string
  product_code: string
  product_name: string
  system_quantity: number
  counted_quantity?: number
  difference: number
  unit_value: number
  total_difference_value: number
  counted: boolean
}

export function Inventario() {
  const [loading, setLoading] = useState(true)
  
  // React Query hooks
  const { data: _lotesData } = useLotes()
  const { data: _logisticaStats } = useLogisticaStats()
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCountDialogOpen, setIsCountDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Form state
  const [inventoryForm, setInventoryForm] = useState({
    description: '',
    responsible: '',
    notes: ''
  })

  const [countForm, setCountForm] = useState({
    counted_quantity: ''
  })

  // Mock data
  const mockInventories: Inventory[] = [
    {
      id: '1',
      code: 'INV-2025-001',
      description: 'Inventário Mensal - Janeiro 2025',
      start_date: '2025-01-15',
      end_date: '2025-01-16',
      status: 'approved',
      responsible: 'João Silva',
      items_counted: 145,
      total_items: 145,
      divergences: 8,
      accuracy: 94.5,
      created_at: '2025-01-15T08:00:00'
    },
    {
      id: '2',
      code: 'INV-2025-002',
      description: 'Inventário Spot - Cardiologia',
      start_date: '2025-01-18',
      status: 'in_progress',
      responsible: 'Maria Santos',
      items_counted: 32,
      total_items: 45,
      divergences: 2,
      accuracy: 93.8,
      created_at: '2025-01-18T09:00:00'
    },
    {
      id: '3',
      code: 'INV-2024-012',
      description: 'Inventário Anual 2024',
      start_date: '2024-12-20',
      end_date: '2024-12-22',
      status: 'approved',
      responsible: 'Carlos Oliveira',
      items_counted: 312,
      total_items: 312,
      divergences: 15,
      accuracy: 95.2,
      created_at: '2024-12-20T08:00:00'
    }
  ]

  const mockInventoryItems: InventoryItem[] = [
    {
      id: '1',
      inventory_id: '2',
      product_id: '1',
      product_code: 'STN-CARD-001',
      product_name: 'Stent Coronário Farmacológico',
      system_quantity: 10,
      counted_quantity: 8,
      difference: -2,
      unit_value: 12000,
      total_difference_value: -24000,
      counted: true
    },
    {
      id: '2',
      inventory_id: '2',
      product_id: '2',
      product_code: 'PRT-ORTO-001',
      product_name: 'Prótese de Quadril Cerâmica',
      system_quantity: 15,
      counted_quantity: 15,
      difference: 0,
      unit_value: 22000,
      total_difference_value: 0,
      counted: true
    },
    {
      id: '3',
      inventory_id: '2',
      product_id: '3',
      product_code: 'MCP-CARD-001',
      product_name: 'Marcapasso Definitivo',
      system_quantity: 12,
      difference: 0,
      unit_value: 25000,
      total_difference_value: 0,
      counted: false
    }
  ]

  // Analytics data
  const divergencesByCategory = [
    { category: 'Cardiologia', divergences: 5, color: '#EF4444' },
    { category: 'Ortopedia', divergences: 2, color: '#F59E0B' },
    { category: 'Neurocirurgia', divergences: 1, color: '#10B981' },
    { category: 'Oftalmologia', divergences: 0, color: '#6366F1' },
  ]

  const accuracyTrend = [
    { month: 'Jul', acuracia: 92.5 },
    { month: 'Ago', acuracia: 93.8 },
    { month: 'Set', acuracia: 94.2 },
    { month: 'Out', acuracia: 95.1 },
    { month: 'Nov', acuracia: 94.8 },
    { month: 'Dez', acuracia: 95.2 },
  ]

  useEffect(() => {
    loadInventories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured])

  const loadInventories = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        setInventories(mockInventories)
        setLoading(false)
      }, 500)
      return
    }

    try {
      const { data, error } = await supabase
        .from('inventories')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error

      setInventories(data || [])
    } catch (error) {
      console.error('Error loading inventories:', error)
      toast.error('Erro ao carregar inventários')
      setInventories(mockInventories)
    } finally {
      setLoading(false)
    }
  }

  const loadInventoryItems = async (inventoryId: string) => {
    setInventoryItems(mockInventoryItems.filter(i => i.inventory_id === inventoryId))
  }

  const handleCreateInventory = async () => {
    if (!inventoryForm.description || !inventoryForm.responsible) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const newInventory: Inventory = {
      id: String(inventories.length + 1),
      code: `INV-2025-${String(inventories.length + 1).padStart(3, '0')}`,
      description: inventoryForm.description,
      start_date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      responsible: inventoryForm.responsible,
      items_counted: 0,
      total_items: 0,
      divergences: 0,
      accuracy: 0,
      notes: inventoryForm.notes || undefined,
      created_at: new Date().toISOString()
    }

    setInventories([newInventory, ...inventories])
    toast.success('Inventário criado com sucesso!')
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleCountItem = async () => {
    if (!selectedItem || !countForm.counted_quantity) {
      toast.error('Informe a quantidade contada')
      return
    }

    const countedQty = parseInt(countForm.counted_quantity)
    const difference = countedQty - selectedItem.system_quantity
    const totalDiffValue = difference * selectedItem.unit_value

    const updatedItems = inventoryItems.map(item =>
      item.id === selectedItem.id
        ? {
            ...item,
            counted_quantity: countedQty,
            difference: difference,
            total_difference_value: totalDiffValue,
            counted: true
          }
        : item
    )

    setInventoryItems(updatedItems)
    toast.success('Contagem registrada com sucesso!')
    setIsCountDialogOpen(false)
    setSelectedItem(null)
    resetCountForm()
  }

  const handleCompleteInventory = async (inventory: Inventory) => {
    if (inventory.status !== 'in_progress') {
      toast.error('Apenas inventários em andamento podem ser finalizados')
      return
    }

    const updatedInventories = inventories.map(inv =>
      inv.id === inventory.id
        ? {
            ...inv,
            status: 'completed' as InventoryStatus,
            end_date: new Date().toISOString().split('T')[0]
          }
        : inv
    )

    setInventories(updatedInventories)
    toast.success('Inventário finalizado! Aguardando aprovação.')
  }

  const handleApproveInventory = async (inventory: Inventory) => {
    if (inventory.status !== 'completed') {
      toast.error('Apenas inventários finalizados podem ser aprovados')
      return
    }

    if (!confirm('Ao aprovar, os ajustes de estoque serão aplicados. Confirmar?')) {
      return
    }

    const updatedInventories = inventories.map(inv =>
      inv.id === inventory.id
        ? { ...inv, status: 'approved' as InventoryStatus }
        : inv
    )

    setInventories(updatedInventories)
    toast.success('Inventário aprovado! Ajustes aplicados ao estoque.')
  }

  const resetForm = () => {
    setInventoryForm({
      description: '',
      responsible: '',
      notes: ''
    })
  }

  const resetCountForm = () => {
    setCountForm({
      counted_quantity: ''
    })
  }

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="info">Em Andamento</Badge>
      case 'completed':
        return <Badge variant="warning">Finalizado</Badge>
      case 'approved':
        return <Badge variant="success">Aprovado</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
    }
  }

  const filteredInventories = useMemo(() => {
    return inventories.filter(inv => {
      const matchesSearch =
        inv.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        inv.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        inv.responsible.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [inventories, debouncedSearch, statusFilter])

  const stats = {
    total: inventories.length,
    inProgress: inventories.filter(i => i.status === 'in_progress').length,
    avgAccuracy: inventories.reduce((sum, i) => sum + i.accuracy, 0) / inventories.length || 0,
    totalDivergences: inventories.reduce((sum, i) => sum + i.divergences, 0)
  }

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Inventário"
        subtitle="Controle físico de estoque"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventário</h1>
          <p className="text-muted-foreground">
            Controle físico de estoque e auditoria
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Inventário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Inventário</DialogTitle>
              <DialogDescription>
                Inicie uma nova contagem de estoque
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={inventoryForm.description}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, description: e.target.value })}
                  placeholder="Ex: Inventário Mensal - Janeiro 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável *</Label>
                <Input
                  id="responsible"
                  value={inventoryForm.responsible}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, responsible: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={inventoryForm.notes}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                  placeholder="Informações adicionais"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateInventory}>
                Criar Inventário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Inventários
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.inProgress} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acuracidade Média
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.avgAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Divergências
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalDivergences}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Este ano
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Último Inventário
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventories[0] ? formatDate(inventories[0].start_date) : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {inventories[0]?.responsible}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Inventários</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Inventários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, descrição ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Finalizados</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredInventories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum inventário encontrado
                  </div>
                ) : (
                  filteredInventories.map((inventory) => (
                    <div
                      key={inventory.id}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{inventory.code}</span>
                            {getStatusBadge(inventory.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">{inventory.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Responsável: {inventory.responsible} • Início: {formatDate(inventory.start_date)}
                            {inventory.end_date && ` • Fim: ${formatDate(inventory.end_date)}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Acuracidade: <span className="text-green-600">{inventory.accuracy.toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inventory.items_counted}/{inventory.total_items} itens
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(inventory.items_counted / inventory.total_items) * 100 || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {inventory.divergences} divergência{inventory.divergences !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInventory(inventory)
                            loadInventoryItems(inventory.id)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Itens
                        </Button>

                        {inventory.status === 'in_progress' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCompleteInventory(inventory)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Finalizar
                          </Button>
                        )}

                        {inventory.status === 'completed' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveInventory(inventory)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Divergências por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={divergencesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="divergences" fill="#6366F1" name="Divergências">
                      {divergencesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução de Acuracidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={accuracyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Line
                      type="monotone"
                      dataKey="acuracia"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Acuracidade"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Items Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Itens do Inventário</DialogTitle>
            <DialogDescription>
              {selectedInventory?.code} - {selectedInventory?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {inventoryItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item carregado
              </div>
            ) : (
              <div className="space-y-2">
                {inventoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">{item.product_code}</div>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Sistema</div>
                            <div className="font-medium">{item.system_quantity}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Contado</div>
                            <div className="font-medium">
                              {item.counted ? item.counted_quantity : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Diferença</div>
                            <div className={`font-medium ${item.difference < 0 ? 'text-red-600' : item.difference > 0 ? 'text-green-600' : ''}`}>
                              {item.counted ? (item.difference > 0 ? '+' : '') + item.difference : '-'}
                            </div>
                          </div>
                        </div>
                        {selectedInventory?.status === 'in_progress' && !item.counted && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedItem(item)
                              setIsCountDialogOpen(true)
                            }}
                          >
                            Contar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              setSelectedInventory(null)
              setInventoryItems([])
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Count Item Dialog */}
      <Dialog open={isCountDialogOpen} onOpenChange={setIsCountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Contagem</DialogTitle>
            <DialogDescription>
              {selectedItem?.product_name}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Quantidade Sistema</div>
                  <div className="text-2xl font-bold">{selectedItem.system_quantity}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Valor Unitário</div>
                  <div className="text-xl font-bold">{formatCurrency(selectedItem.unit_value)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="counted_quantity">Quantidade Contada *</Label>
                <Input
                  id="counted_quantity"
                  type="number"
                  value={countForm.counted_quantity}
                  onChange={(e) => setCountForm({ ...countForm, counted_quantity: e.target.value })}
                  placeholder="0"
                  autoFocus
                />
              </div>

              {countForm.counted_quantity && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Diferença</div>
                  <div className={`text-2xl font-bold ${
                    (parseInt(countForm.counted_quantity) - selectedItem.system_quantity) < 0
                      ? 'text-red-600'
                      : (parseInt(countForm.counted_quantity) - selectedItem.system_quantity) > 0
                      ? 'text-green-600'
                      : ''
                  }`}>
                    {(parseInt(countForm.counted_quantity) - selectedItem.system_quantity) > 0 ? '+' : ''}
                    {parseInt(countForm.counted_quantity) - selectedItem.system_quantity}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Valor: {formatCurrency((parseInt(countForm.counted_quantity) - selectedItem.system_quantity) * selectedItem.unit_value)}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsCountDialogOpen(false)
              setSelectedItem(null)
              resetCountForm()
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCountItem}>
              Confirmar Contagem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
