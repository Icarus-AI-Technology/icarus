import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSupabase } from '@/hooks/useSupabase'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  FileText, Plus, Search, Filter, Download, Eye, Send,
  CheckCircle2, XCircle, Clock, AlertCircle, FileCode, Printer
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

type InvoiceStatus = 'draft' | 'issued' | 'approved' | 'cancelled' | 'denied'
type InvoiceType = 'nfe' | 'nfce' | 'nfse'

interface Invoice {
  id: string
  number: string
  series: string
  type: InvoiceType
  customer_id: string
  customer_name: string
  customer_document: string
  issue_date: string
  amount: number
  tax_amount: number
  status: InvoiceStatus
  xml_url?: string
  pdf_url?: string
  authorization_code?: string
  notes?: string
  created_at: string
}

interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
  tax_rate: number
}

export function FaturamentoNFe() {
  const { supabase, isConfigured } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Form state
  const [invoiceForm, setInvoiceForm] = useState({
    customer_id: '',
    type: 'nfe' as InvoiceType,
    notes: ''
  })

  // Mock data
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      number: '000001',
      series: '1',
      type: 'nfe',
      customer_id: '1',
      customer_name: 'Hospital Santa Casa',
      customer_document: '12.345.678/0001-90',
      issue_date: '2025-01-15',
      amount: 35000,
      tax_amount: 4200,
      status: 'approved',
      authorization_code: '135250123456789012345678901234567890123456',
      created_at: '2025-01-15T10:00:00'
    },
    {
      id: '2',
      number: '000002',
      series: '1',
      type: 'nfe',
      customer_id: '2',
      customer_name: 'Hospital Albert Einstein',
      customer_document: '23.456.789/0001-01',
      issue_date: '2025-01-16',
      amount: 45000,
      tax_amount: 5400,
      status: 'approved',
      authorization_code: '135250234567890123456789012345678901234567',
      created_at: '2025-01-16T14:30:00'
    },
    {
      id: '3',
      number: '000003',
      series: '1',
      type: 'nfe',
      customer_id: '3',
      customer_name: 'Hospital Sírio-Libanês',
      customer_document: '34.567.890/0001-12',
      issue_date: '2025-01-17',
      amount: 65000,
      tax_amount: 7800,
      status: 'issued',
      created_at: '2025-01-17T09:15:00'
    },
    {
      id: '4',
      number: '000004',
      series: '1',
      type: 'nfe',
      customer_id: '4',
      customer_name: 'Clínica Morumbi',
      customer_document: '45.678.901/0001-23',
      issue_date: '2025-01-18',
      amount: 22000,
      tax_amount: 2640,
      status: 'draft',
      created_at: '2025-01-18T11:00:00'
    },
    {
      id: '5',
      number: '000005',
      series: '1',
      type: 'nfe',
      customer_id: '5',
      customer_name: 'Hospital São Luiz',
      customer_document: '56.789.012/0001-34',
      issue_date: '2025-01-12',
      amount: 18000,
      tax_amount: 2160,
      status: 'cancelled',
      notes: 'Cancelada a pedido do cliente',
      created_at: '2025-01-12T16:45:00'
    }
  ]

  // Analytics data
  const monthlyRevenue = [
    { month: 'Jul', faturamento: 285000, nfs: 12 },
    { month: 'Ago', faturamento: 320000, nfs: 14 },
    { month: 'Set', faturamento: 298000, nfs: 11 },
    { month: 'Out', faturamento: 385000, nfs: 16 },
    { month: 'Nov', faturamento: 420000, nfs: 18 },
    { month: 'Dez', faturamento: 512000, nfs: 22 },
  ]

  const statusDistribution = [
    { name: 'Aprovadas', value: 65, color: '#10B981' },
    { name: 'Emitidas', value: 20, color: '#6366F1' },
    { name: 'Rascunho', value: 10, color: '#F59E0B' },
    { name: 'Canceladas', value: 5, color: '#EF4444' },
  ]

  const typeDistribution = [
    { name: 'NF-e', value: 70, color: '#6366F1' },
    { name: 'NFC-e', value: 20, color: '#10B981' },
    { name: 'NFS-e', value: 10, color: '#F59E0B' },
  ]

  useEffect(() => {
    loadInvoices()
  }, [isConfigured])

  const loadInvoices = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        setInvoices(mockInvoices)
        setLoading(false)
      }, 500)
      return
    }

    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .order('issue_date', { ascending: false })

      if (error) throw error

      setInvoices(data || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Erro ao carregar notas fiscais')
      setInvoices(mockInvoices)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!invoiceForm.customer_id) {
      toast.error('Selecione um cliente')
      return
    }

    const nextNumber = String(invoices.length + 1).padStart(6, '0')

    const newInvoice: Invoice = {
      id: String(invoices.length + 1),
      number: nextNumber,
      series: '1',
      type: invoiceForm.type,
      customer_id: invoiceForm.customer_id,
      customer_name: 'Cliente Demo',
      customer_document: '00.000.000/0000-00',
      issue_date: new Date().toISOString().split('T')[0],
      amount: 0,
      tax_amount: 0,
      status: 'draft',
      notes: invoiceForm.notes || undefined,
      created_at: new Date().toISOString()
    }

    setInvoices([newInvoice, ...invoices])
    toast.success('Nota fiscal criada com sucesso!')
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleIssueInvoice = async (invoice: Invoice) => {
    if (invoice.status !== 'draft') {
      toast.error('Apenas notas em rascunho podem ser emitidas')
      return
    }

    toast.info('Emitindo nota fiscal...')

    setTimeout(() => {
      const updatedInvoices = invoices.map(inv =>
        inv.id === invoice.id
          ? { ...inv, status: 'issued' as InvoiceStatus }
          : inv
      )
      setInvoices(updatedInvoices)
      toast.success('Nota fiscal emitida com sucesso!')
    }, 1500)
  }

  const handleCancelInvoice = async (invoice: Invoice) => {
    if (invoice.status === 'cancelled') {
      toast.error('Nota já está cancelada')
      return
    }

    if (invoice.status === 'draft') {
      toast.error('Apenas notas emitidas/aprovadas podem ser canceladas')
      return
    }

    if (!confirm(`Deseja realmente cancelar a NF-e ${invoice.number}?`)) {
      return
    }

    toast.info('Cancelando nota fiscal...')

    setTimeout(() => {
      const updatedInvoices = invoices.map(inv =>
        inv.id === invoice.id
          ? { ...inv, status: 'cancelled' as InvoiceStatus }
          : inv
      )
      setInvoices(updatedInvoices)
      toast.success('Nota fiscal cancelada com sucesso!')
    }, 1500)
  }

  const handleDownloadXML = (invoice: Invoice) => {
    if (!invoice.xml_url && invoice.status !== 'approved') {
      toast.error('XML disponível apenas para notas aprovadas')
      return
    }
    toast.success('Download do XML iniciado')
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    if (!invoice.pdf_url && invoice.status !== 'approved') {
      toast.error('DANFE disponível apenas para notas aprovadas')
      return
    }
    toast.success('Download do DANFE (PDF) iniciado')
  }

  const resetForm = () => {
    setInvoiceForm({
      customer_id: '',
      type: 'nfe',
      notes: ''
    })
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>
      case 'issued':
        return <Badge variant="info">Emitida</Badge>
      case 'approved':
        return <Badge variant="success">Aprovada</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>
      case 'denied':
        return <Badge variant="destructive">Denegada</Badge>
    }
  }

  const getTypeLabel = (type: InvoiceType) => {
    switch (type) {
      case 'nfe':
        return 'NF-e'
      case 'nfce':
        return 'NFC-e'
      case 'nfse':
        return 'NFS-e'
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch =
        inv.number.includes(debouncedSearch) ||
        inv.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        inv.customer_document.includes(debouncedSearch)

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      const matchesType = typeFilter === 'all' || inv.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [invoices, debouncedSearch, statusFilter, typeFilter])

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    count: invoices.length,
    approved: invoices.filter(inv => inv.status === 'approved').length,
    cancelled: invoices.filter(inv => inv.status === 'cancelled').length,
    avgAmount: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length : 0,
    taxTotal: invoices.reduce((sum, inv) => sum + inv.tax_amount, 0)
  }

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Faturamento NF-e"
        subtitle="Emissão e gestão de notas fiscais eletrônicas"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Faturamento NF-e</h1>
          <p className="text-muted-foreground">
            Emissão e gestão de notas fiscais eletrônicas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova NF-e
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Nota Fiscal</DialogTitle>
              <DialogDescription>
                Preencha os dados básicos da nota fiscal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                <Select
                  value={invoiceForm.customer_id}
                  onValueChange={(value) => setInvoiceForm({ ...invoiceForm, customer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hospital Santa Casa</SelectItem>
                    <SelectItem value="2">Hospital Albert Einstein</SelectItem>
                    <SelectItem value="3">Hospital Sírio-Libanês</SelectItem>
                    <SelectItem value="4">Clínica Morumbi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Nota</Label>
                <Select
                  value={invoiceForm.type}
                  onValueChange={(value: InvoiceType) => setInvoiceForm({ ...invoiceForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nfe">NF-e (Nota Fiscal Eletrônica)</SelectItem>
                    <SelectItem value="nfce">NFC-e (Nota Fiscal Consumidor)</SelectItem>
                    <SelectItem value="nfse">NFS-e (Nota Fiscal Serviço)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
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
              <Button onClick={handleCreateInvoice}>
                Criar Nota
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
              Faturamento Total
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.count} notas emitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              NFs Aprovadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Autorizadas pela SEFAZ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por nota fiscal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impostos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.taxTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de tributos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Notas Fiscais</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Notas Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número, cliente ou CNPJ..."
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
                    <SelectItem value="issued">Emitidas</SelectItem>
                    <SelectItem value="approved">Aprovadas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="nfe">NF-e</SelectItem>
                    <SelectItem value="nfce">NFC-e</SelectItem>
                    <SelectItem value="nfse">NFS-e</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma nota fiscal encontrada
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {getTypeLabel(invoice.type)} {invoice.number}/{invoice.series}
                            </span>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer_name} • {invoice.customer_document}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Emissão: {formatDate(invoice.issue_date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatCurrency(invoice.amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            Impostos: {formatCurrency(invoice.tax_amount)}
                          </div>
                        </div>
                      </div>

                      {invoice.authorization_code && (
                        <div className="text-xs text-muted-foreground mb-3 font-mono">
                          Chave: {invoice.authorization_code}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>

                        {invoice.status === 'draft' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleIssueInvoice(invoice)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Emitir
                          </Button>
                        )}

                        {invoice.status === 'approved' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadXML(invoice)}
                            >
                              <FileCode className="h-4 w-4 mr-1" />
                              XML
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(invoice)}
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              DANFE
                            </Button>
                          </>
                        )}

                        {(invoice.status === 'issued' || invoice.status === 'approved') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvoice(invoice)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
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
          <Card>
            <CardHeader>
              <CardTitle>Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="faturamento"
                    stroke="#6366F1"
                    strokeWidth={2}
                    name="Faturamento"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="nfs"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Qtd NFs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
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
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1">
                      {typeDistribution.map((entry, index) => (
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `${getTypeLabel(selectedInvoice.type)} ${selectedInvoice.number}/${selectedInvoice.series}`}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <div className="font-medium">{selectedInvoice.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedInvoice.customer_document}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data de Emissão</Label>
                  <div className="font-medium">{formatDate(selectedInvoice.issue_date)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <div className="font-medium">{getTypeLabel(selectedInvoice.type)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">Valor Total</Label>
                  <div className="text-xl font-bold">{formatCurrency(selectedInvoice.amount)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Impostos</Label>
                  <div className="text-xl font-bold text-yellow-600">
                    {formatCurrency(selectedInvoice.tax_amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Líquido</Label>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedInvoice.amount - selectedInvoice.tax_amount)}
                  </div>
                </div>
              </div>

              {selectedInvoice.authorization_code && (
                <div>
                  <Label className="text-muted-foreground">Chave de Acesso</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {selectedInvoice.authorization_code}
                  </div>
                </div>
              )}

              {selectedInvoice.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">{selectedInvoice.notes}</div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Criada em: {formatDateTime(selectedInvoice.created_at)}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            {selectedInvoice?.status === 'approved' && (
              <>
                <Button variant="outline" onClick={() => handleDownloadXML(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-1" />
                  XML
                </Button>
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-1" />
                  DANFE
                </Button>
              </>
            )}
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              setSelectedInvoice(null)
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
