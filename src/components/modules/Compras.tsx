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
import { useSupabase } from '@/hooks/useSupabase'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency, formatDate, daysOverdue } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  ShoppingCart, Plus, Search, Filter, Eye, Send, CheckCircle2,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'

interface PurchaseOrder {
  id: string
  po_number: string
  supplier_id: string
  supplier_name: string
  order_date: string
  expected_delivery: string
  delivery_date?: string
  total_amount: number
  status: PurchaseOrderStatus
  notes?: string
  items_count: number
  received_items: number
  created_at: string
}

interface Supplier {
  id: string
  name: string
  document: string
  contact: string
  email: string
  rating: number
}

interface POItem {
  id: string
  purchase_order_id: string
  product_id: string
  product_code: string
  product_name: string
  quantity: number
  received_quantity: number
  unit_price: number
  total: number
}

export function Compras() {
  const { supabase, isConfigured } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [poItems, setPOItems] = useState<POItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [supplierFilter, setSupplierFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Form state
  const [poForm, setPOForm] = useState({
    supplier_id: '',
    expected_delivery: '',
    notes: ''
  })

  // Mock data
  const mockSuppliers: Supplier[] = [
    { id: '1', name: 'Medtronic Brasil', document: '12.345.678/0001-90', contact: '(11) 3456-7890', email: 'vendas@medtronic.com.br', rating: 4.8 },
    { id: '2', name: 'Boston Scientific', document: '23.456.789/0001-01', contact: '(11) 2345-6789', email: 'comercial@boston.com.br', rating: 4.5 },
    { id: '3', name: 'Stryker do Brasil', document: '34.567.890/0001-12', contact: '(11) 4567-8901', email: 'pedidos@stryker.com.br', rating: 4.9 },
    { id: '4', name: 'Johnson & Johnson Medical', document: '45.678.901/0001-23', contact: '(11) 5678-9012', email: 'atendimento@jnj.com.br', rating: 4.7 }
  ]

  const mockPurchaseOrders: PurchaseOrder[] = [
    {
      id: '1',
      po_number: 'PO-2025-001',
      supplier_id: '1',
      supplier_name: 'Medtronic Brasil',
      order_date: '2025-01-15',
      expected_delivery: '2025-02-15',
      total_amount: 120000,
      status: 'confirmed',
      items_count: 10,
      received_items: 0,
      created_at: '2025-01-15T10:00:00'
    },
    {
      id: '2',
      po_number: 'PO-2025-002',
      supplier_id: '3',
      supplier_name: 'Stryker do Brasil',
      order_date: '2025-01-16',
      expected_delivery: '2025-02-20',
      total_amount: 180000,
      status: 'sent',
      items_count: 8,
      received_items: 0,
      created_at: '2025-01-16T14:00:00'
    },
    {
      id: '3',
      po_number: 'PO-2025-003',
      supplier_id: '2',
      supplier_name: 'Boston Scientific',
      order_date: '2025-01-10',
      expected_delivery: '2025-02-10',
      delivery_date: '2025-02-08',
      total_amount: 95000,
      status: 'received',
      items_count: 12,
      received_items: 12,
      created_at: '2025-01-10T09:00:00'
    },
    {
      id: '4',
      po_number: 'PO-2025-004',
      supplier_id: '4',
      supplier_name: 'Johnson & Johnson Medical',
      order_date: '2025-01-18',
      expected_delivery: '2025-02-28',
      total_amount: 75000,
      status: 'draft',
      items_count: 6,
      received_items: 0,
      created_at: '2025-01-18T11:00:00'
    }
  ]

  const mockPOItems: POItem[] = [
    {
      id: '1',
      purchase_order_id: '1',
      product_id: '1',
      product_code: 'STN-CARD-001',
      product_name: 'Stent Coronário Farmacológico',
      quantity: 10,
      received_quantity: 0,
      unit_price: 12000,
      total: 120000
    }
  ]

  // Analytics data
  const monthlyPurchases = [
    { month: 'Jul', valor: 285000, pedidos: 8 },
    { month: 'Ago', valor: 320000, pedidos: 10 },
    { month: 'Set', valor: 298000, pedidos: 9 },
    { month: 'Out', valor: 385000, pedidos: 12 },
    { month: 'Nov', valor: 420000, pedidos: 14 },
    { month: 'Dez', valor: 470000, pedidos: 15 },
  ]

  const supplierDistribution = [
    { name: 'Medtronic', value: 35, color: '#6366F1' },
    { name: 'Stryker', value: 28, color: '#10B981' },
    { name: 'Boston Sci.', value: 20, color: '#F59E0B' },
    { name: 'J&J', value: 12, color: '#8B5CF6' },
    { name: 'Outros', value: 5, color: '#6B7280' },
  ]

  const statusDistribution = [
    { name: 'Confirmados', value: 45, color: '#10B981' },
    { name: 'Enviados', value: 30, color: '#6366F1' },
    { name: 'Recebidos', value: 20, color: '#8B5CF6' },
    { name: 'Rascunho', value: 5, color: '#F59E0B' },
  ]

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured])

  const loadData = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        setPurchaseOrders(mockPurchaseOrders)
        setSuppliers(mockSuppliers)
        setLoading(false)
      }, 500)
      return
    }

    try {
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('order_date', { ascending: false })

      if (poError) throw poError

      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')

      if (suppliersError) throw suppliersError

      setPurchaseOrders(poData || [])
      setSuppliers(suppliersData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
      setPurchaseOrders(mockPurchaseOrders)
      setSuppliers(mockSuppliers)
    } finally {
      setLoading(false)
    }
  }

  const loadPOItems = async (poId: string) => {
    setPOItems(mockPOItems.filter(i => i.purchase_order_id === poId))
  }

  const handleCreatePO = async () => {
    if (!poForm.supplier_id || !poForm.expected_delivery) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const newPO: PurchaseOrder = {
      id: String(purchaseOrders.length + 1),
      po_number: `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier_id: poForm.supplier_id,
      supplier_name: suppliers.find(s => s.id === poForm.supplier_id)?.name || '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: poForm.expected_delivery,
      total_amount: 0,
      status: 'draft',
      notes: poForm.notes || undefined,
      items_count: 0,
      received_items: 0,
      created_at: new Date().toISOString()
    }

    setPurchaseOrders([newPO, ...purchaseOrders])
    toast.success('Pedido de compra criado com sucesso!')
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleSendPO = async (po: PurchaseOrder) => {
    if (po.status !== 'draft') {
      toast.error('Apenas pedidos em rascunho podem ser enviados')
      return
    }

    if (po.items_count === 0) {
      toast.error('Adicione itens ao pedido antes de enviar')
      return
    }

    toast.info('Enviando pedido ao fornecedor...')

    setTimeout(() => {
      const updatedPOs = purchaseOrders.map(p =>
        p.id === po.id ? { ...p, status: 'sent' as PurchaseOrderStatus } : p
      )
      setPurchaseOrders(updatedPOs)
      toast.success('Pedido enviado com sucesso!')
    }, 1500)
  }

  const handleConfirmPO = async (po: PurchaseOrder) => {
    if (po.status !== 'sent') {
      toast.error('Apenas pedidos enviados podem ser confirmados')
      return
    }

    const updatedPOs = purchaseOrders.map(p =>
      p.id === po.id ? { ...p, status: 'confirmed' as PurchaseOrderStatus } : p
    )
    setPurchaseOrders(updatedPOs)
    toast.success('Pedido confirmado pelo fornecedor!')
  }

  const handleReceivePO = async (po: PurchaseOrder) => {
    if (po.status !== 'confirmed') {
      toast.error('Apenas pedidos confirmados podem ser recebidos')
      return
    }

    const updatedPOs = purchaseOrders.map(p =>
      p.id === po.id
        ? {
            ...p,
            status: 'received' as PurchaseOrderStatus,
            delivery_date: new Date().toISOString().split('T')[0],
            received_items: p.items_count
          }
        : p
    )
    setPurchaseOrders(updatedPOs)
    toast.success('Recebimento registrado! Estoque atualizado.')
  }

  const handleCancelPO = async (po: PurchaseOrder) => {
    if (po.status === 'received' || po.status === 'cancelled') {
      toast.error('Este pedido não pode ser cancelado')
      return
    }

    if (!confirm(`Deseja realmente cancelar o pedido ${po.po_number}?`)) {
      return
    }

    const updatedPOs = purchaseOrders.map(p =>
      p.id === po.id ? { ...p, status: 'cancelled' as PurchaseOrderStatus } : p
    )
    setPurchaseOrders(updatedPOs)
    toast.success('Pedido cancelado!')
  }

  const resetForm = () => {
    setPOForm({
      supplier_id: '',
      expected_delivery: '',
      notes: ''
    })
  }

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>
      case 'sent':
        return <Badge variant="info">Enviado</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmado</Badge>
      case 'received':
        return <Badge variant="success">Recebido</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
    }
  }

  const getDaysUntilDelivery = (expectedDate: string): number => {
    return -daysOverdue(expectedDate)
  }

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch =
        po.po_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        po.supplier_name.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesStatus = statusFilter === 'all' || po.status === statusFilter
      const matchesSupplier = supplierFilter === 'all' || po.supplier_id === supplierFilter

      return matchesSearch && matchesStatus && matchesSupplier
    })
  }, [purchaseOrders, debouncedSearch, statusFilter, supplierFilter])

  const stats = {
    total: purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0),
    count: purchaseOrders.length,
    pending: purchaseOrders.filter(po => po.status === 'sent' || po.status === 'confirmed').length,
    avgDeliveryDays: 28,
    avgAmount: purchaseOrders.length > 0 ? purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0) / purchaseOrders.length : 0
  }

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Compras"
        subtitle="Gestão de pedidos e fornecedores"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Compras</h1>
          <p className="text-muted-foreground">
            Gestão de pedidos e fornecedores
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Pedido de Compra</DialogTitle>
              <DialogDescription>
                Preencha os dados do pedido
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor *</Label>
                <Select
                  value={poForm.supplier_id}
                  onValueChange={(value) => setPOForm({ ...poForm, supplier_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_delivery">Previsão de Entrega *</Label>
                <Input
                  id="expected_delivery"
                  type="date"
                  value={poForm.expected_delivery}
                  onChange={(e) => setPOForm({ ...poForm, expected_delivery: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={poForm.notes}
                  onChange={(e) => setPOForm({ ...poForm, notes: e.target.value })}
                  placeholder="Instruções especiais, etc"
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
              <Button onClick={handleCreatePO}>
                Criar Pedido
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
              Total Compras
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.count} pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando entrega
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prazo Médio
            </CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDeliveryDays} dias</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo de entrega
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Pedidos de Compra</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número ou fornecedor..."
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
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviados</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="received">Recebidos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Fornecedores</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredPOs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pedido encontrado
                  </div>
                ) : (
                  filteredPOs.map((po) => {
                    const daysUntil = getDaysUntilDelivery(po.expected_delivery)

                    return (
                      <div
                        key={po.id}
                        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{po.po_number}</span>
                              {getStatusBadge(po.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">{po.supplier_name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Pedido: {formatDate(po.order_date)} • Entrega prevista: {formatDate(po.expected_delivery)}
                              {daysUntil > 0 && po.status !== 'received' && (
                                <span className="ml-2">({daysUntil} dias)</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(po.total_amount)}</div>
                            <div className="text-xs text-muted-foreground">
                              {po.received_items}/{po.items_count} itens recebidos
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPO(po)
                              loadPOItems(po.id)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Itens
                          </Button>

                          {po.status === 'draft' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSendPO(po)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Enviar
                            </Button>
                          )}

                          {po.status === 'sent' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleConfirmPO(po)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}

                          {po.status === 'confirmed' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleReceivePO(po)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Receber
                            </Button>
                          )}

                          {po.status !== 'received' && po.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelPO(po)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">{supplier.document}</div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">{supplier.contact}</span>
                          <span className="text-muted-foreground">{supplier.email}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{supplier.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Avaliação</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compras Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyPurchases}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="valor"
                    stroke="#6366F1"
                    strokeWidth={2}
                    name="Valor"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pedidos"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Pedidos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Fornecedor</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={supplierDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {supplierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1">
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View PO Items Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Itens do Pedido</DialogTitle>
            <DialogDescription>
              {selectedPO?.po_number} - {selectedPO?.supplier_name}
            </DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedPO.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="text-xl font-bold">{formatCurrency(selectedPO.total_amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Data do Pedido</div>
                  <div className="font-medium">{formatDate(selectedPO.order_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Previsão Entrega</div>
                  <div className="font-medium">{formatDate(selectedPO.expected_delivery)}</div>
                </div>
              </div>

              <div className="space-y-2">
                {poItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum item adicionado
                  </div>
                ) : (
                  poItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">{item.product_code}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            Qtd: {item.quantity} • Preço: {formatCurrency(item.unit_price)}
                          </div>
                          <div className="font-bold">{formatCurrency(item.total)}</div>
                          {item.received_quantity > 0 && (
                            <div className="text-xs text-green-600">
                              Recebido: {item.received_quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedPO.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">{selectedPO.notes}</div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              setSelectedPO(null)
              setPOItems([])
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
