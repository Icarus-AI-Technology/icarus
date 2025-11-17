import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { formatCurrency, formatDate, daysOverdue } from '@/lib/utils/formatters'
import { validateAmount } from '@/lib/utils/validators'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  DollarSign, Calendar, AlertCircle, CheckCircle2, Clock,
  TrendingDown, Search, Filter, Download, Eye, CreditCard
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

type ReceivableStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'

interface Receivable {
  id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  due_date: string
  amount: number
  amount_paid: number
  status: ReceivableStatus
  payment_method?: string
  notes?: string
  days_overdue?: number
  created_at: string
}

interface Payment {
  id: string
  receivable_id: string
  amount: number
  payment_date: string
  payment_method: string
  notes?: string
}

export function ContasReceber() {
  const { supabase, isConfigured } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [agingFilter, setAgingFilter] = useState<string>('all')
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    notes: ''
  })

  // Mock data
  const mockReceivables: Receivable[] = [
    {
      id: '1',
      invoice_number: 'NF-2025-001',
      customer_id: '1',
      customer_name: 'Hospital Santa Casa',
      due_date: '2025-01-25',
      amount: 35000,
      amount_paid: 0,
      status: 'overdue',
      days_overdue: 7,
      created_at: '2025-01-15'
    },
    {
      id: '2',
      invoice_number: 'NF-2025-002',
      customer_id: '2',
      customer_name: 'Hospital Albert Einstein',
      due_date: '2025-02-15',
      amount: 45000,
      amount_paid: 45000,
      status: 'paid',
      payment_method: 'bank_transfer',
      created_at: '2025-01-16'
    },
    {
      id: '3',
      invoice_number: 'NF-2025-003',
      customer_id: '3',
      customer_name: 'Hospital Sírio-Libanês',
      due_date: '2025-02-20',
      amount: 65000,
      amount_paid: 30000,
      status: 'partial',
      created_at: '2025-01-10'
    },
    {
      id: '4',
      invoice_number: 'NF-2025-004',
      customer_id: '4',
      customer_name: 'Clínica Morumbi',
      due_date: '2025-02-28',
      amount: 22000,
      amount_paid: 0,
      status: 'pending',
      created_at: '2025-01-18'
    },
    {
      id: '5',
      invoice_number: 'NF-2024-089',
      customer_id: '5',
      customer_name: 'Hospital São Luiz',
      due_date: '2025-01-10',
      amount: 18000,
      amount_paid: 0,
      status: 'overdue',
      days_overdue: 22,
      created_at: '2024-12-20'
    }
  ]

  // Analytics data
  const agingData = [
    { range: 'A vencer', valor: 87000, count: 8, color: '#10B981' },
    { range: '1-30 dias', valor: 35000, count: 3, color: '#F59E0B' },
    { range: '31-60 dias', valor: 18000, count: 2, color: '#EF4444' },
    { range: '60+ dias', valor: 12000, count: 1, color: '#991B1B' },
  ]

  const statusDistribution = [
    { name: 'Pendentes', value: 35, color: '#6366F1' },
    { name: 'Parciais', value: 25, color: '#F59E0B' },
    { name: 'Pagos', value: 30, color: '#10B981' },
    { name: 'Vencidos', value: 10, color: '#EF4444' },
  ]

  const receivablesTrend = [
    { month: 'Jul', recebido: 185000, previsto: 200000 },
    { month: 'Ago', recebido: 220000, previsto: 210000 },
    { month: 'Set', recebido: 198000, previsto: 220000 },
    { month: 'Out', recebido: 245000, previsto: 230000 },
    { month: 'Nov', recebido: 278000, previsto: 250000 },
    { month: 'Dez', recebido: 312000, previsto: 280000 },
  ]

  useEffect(() => {
    loadReceivables()
  }, [isConfigured])

  const loadReceivables = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        const enrichedReceivables = mockReceivables.map(r => ({
          ...r,
          days_overdue: calculateDaysOverdue(r.due_date, r.status)
        }))
        setReceivables(enrichedReceivables)
        setLoading(false)
      }, 500)
      return
    }

    try {
      const { data, error } = await supabase
        .from('contas_receber')
        .select('*')
        .order('due_date', { ascending: true })

      if (error) throw error

      const enrichedData = (data || []).map(r => ({
        ...r,
        days_overdue: calculateDaysOverdue(r.due_date, r.status),
        status: getReceivableStatus(r)
      }))

      setReceivables(enrichedData)
    } catch (error) {
      console.error('Error loading receivables:', error)
      toast.error('Erro ao carregar contas a receber')
      setReceivables(mockReceivables)
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysOverdue = (dueDate: string, status: ReceivableStatus): number | undefined => {
    if (status !== 'overdue') return undefined
    const days = daysOverdue(dueDate)
    return days > 0 ? days : 0
  }

  const getReceivableStatus = (receivable: {
    status?: string
    amount_paid: number
    amount: number
    due_date: string
  }): ReceivableStatus => {
    if (receivable.status === 'cancelled') return 'cancelled'
    if (receivable.amount_paid >= receivable.amount) return 'paid'

    const days = daysOverdue(receivable.due_date)

    if (days > 0) return 'overdue'
    if (receivable.amount_paid > 0) return 'partial'
    return 'pending'
  }

  const handlePayment = async () => {
    if (!selectedReceivable) return

    const remaining = selectedReceivable.amount - selectedReceivable.amount_paid
    const validation = validateAmount(paymentForm.amount, remaining)

    if (!validation.valid) {
      toast.error(validation.error || 'Valor inválido')
      return
    }

    const paymentAmount = validation.value!

    if (!isConfigured) {
      // Mock payment
      const updatedReceivables = receivables.map(r => {
        if (r.id === selectedReceivable.id) {
          const newAmountPaid = r.amount_paid + paymentAmount
          return {
            ...r,
            amount_paid: newAmountPaid,
            status: newAmountPaid >= r.amount ? 'paid' as ReceivableStatus :
                    newAmountPaid > 0 ? 'partial' as ReceivableStatus : r.status,
            payment_method: paymentForm.payment_method
          }
        }
        return r
      })
      setReceivables(updatedReceivables)
      toast.success('Pagamento registrado com sucesso!')
      resetPaymentForm()
      setIsPaymentDialogOpen(false)
      setSelectedReceivable(null)
      return
    }

    try {
      const newAmountPaid = selectedReceivable.amount_paid + paymentAmount

      const { error } = await supabase
        .from('contas_receber')
        .update({
          amount_paid: newAmountPaid,
          status: newAmountPaid >= selectedReceivable.amount ? 'paid' : 'partial'
        })
        .eq('id', selectedReceivable.id)

      if (error) throw error

      toast.success('Pagamento registrado com sucesso!')
      loadReceivables()
      resetPaymentForm()
      setIsPaymentDialogOpen(false)
      setSelectedReceivable(null)
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Erro ao registrar pagamento')
    }
  }

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      notes: ''
    })
  }

  const getStatusBadge = (status: ReceivableStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="info">Pendente</Badge>
      case 'partial':
        return <Badge variant="warning">Parcial</Badge>
      case 'paid':
        return <Badge variant="success">Pago</Badge>
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>
    }
  }

  const filteredReceivables = useMemo(() => {
    return receivables.filter(rec => {
      const matchesSearch =
        rec.invoice_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        rec.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesStatus = statusFilter === 'all' || rec.status === statusFilter

      const matchesAging =
        agingFilter === 'all' ||
        (agingFilter === 'current' && rec.status !== 'overdue') ||
        (agingFilter === '1-30' && rec.days_overdue && rec.days_overdue >= 1 && rec.days_overdue <= 30) ||
        (agingFilter === '31-60' && rec.days_overdue && rec.days_overdue >= 31 && rec.days_overdue <= 60) ||
        (agingFilter === '60+' && rec.days_overdue && rec.days_overdue > 60)

      return matchesSearch && matchesStatus && matchesAging
    })
  }, [receivables, debouncedSearch, statusFilter, agingFilter])

  const stats = {
    total: receivables.reduce((sum, r) => sum + (r.amount - r.amount_paid), 0),
    overdue: receivables.filter(r => r.status === 'overdue').reduce((sum, r) => sum + (r.amount - r.amount_paid), 0),
    received: receivables.reduce((sum, r) => sum + r.amount_paid, 0),
    avgDays: 42,
    count: receivables.length,
    overdueCount: receivables.filter(r => r.status === 'overdue').length
  }

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Contas a Receber"
        subtitle="Gestão de recebíveis e cobranças"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contas a Receber</h1>
          <p className="text-muted-foreground">
            Gestão de recebíveis e cobranças
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total a Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.count} títulos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencido
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overdue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overdueCount} títulos em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recebido no Período
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.received)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prazo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDays} dias</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo médio de recebimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Títulos</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Títulos a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por NF ou cliente..."
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
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="partial">Parciais</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="overdue">Vencidos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={agingFilter} onValueChange={setAgingFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Períodos</SelectItem>
                    <SelectItem value="current">A vencer</SelectItem>
                    <SelectItem value="1-30">1-30 dias</SelectItem>
                    <SelectItem value="31-60">31-60 dias</SelectItem>
                    <SelectItem value="60+">60+ dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredReceivables.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum título encontrado
                  </div>
                ) : (
                  filteredReceivables.map((rec) => {
                    const remaining = rec.amount - rec.amount_paid
                    const percentPaid = (rec.amount_paid / rec.amount) * 100

                    return (
                      <div
                        key={rec.id}
                        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{rec.invoice_number}</span>
                              {getStatusBadge(rec.status)}
                              {rec.days_overdue && rec.days_overdue > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {rec.days_overdue} dias
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rec.customer_name} • Venc: {formatDate(rec.due_date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(remaining)}</div>
                            <div className="text-xs text-muted-foreground">
                              de {formatCurrency(rec.amount)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${percentPaid}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {percentPaid.toFixed(0)}%
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReceivable(rec)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          {rec.status !== 'paid' && rec.status !== 'cancelled' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedReceivable(rec)
                                setPaymentForm({
                                  ...paymentForm,
                                  amount: String(remaining)
                                })
                                setIsPaymentDialogOpen(true)
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Baixar
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

        {/* Aging Tab */}
        <TabsContent value="aging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aging Report - Análise de Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="valor" fill="#6366F1" name="Valor">
                    {agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {agingData.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-1">{item.range}</div>
                      <div className="text-2xl font-bold" style={{ color: item.color }}>
                        {formatCurrency(item.valor)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.count} título{item.count !== 1 ? 's' : ''}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Recebimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={receivablesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="recebido"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Recebido"
                    />
                    <Line
                      type="monotone"
                      dataKey="previsto"
                      stroke="#6366F1"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Previsto"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              {selectedReceivable?.invoice_number} - {selectedReceivable?.customer_name}
            </DialogDescription>
          </DialogHeader>
          {selectedReceivable && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="font-bold">{formatCurrency(selectedReceivable.amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Já Pago</div>
                  <div className="font-bold">{formatCurrency(selectedReceivable.amount_paid)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Saldo Devedor</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedReceivable.amount - selectedReceivable.amount_paid)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_amount">Valor do Pagamento *</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Data do Pagamento *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Forma de Pagamento</Label>
                  <Select
                    value={paymentForm.payment_method}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_notes">Observações</Label>
                <Input
                  id="payment_notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Informações adicionais"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsPaymentDialogOpen(false)
              resetPaymentForm()
              setSelectedReceivable(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handlePayment}>
              Confirmar Pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Título</DialogTitle>
            <DialogDescription>
              {selectedReceivable?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {selectedReceivable && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <div className="font-medium">{selectedReceivable.customer_name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReceivable.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data de Vencimento</Label>
                  <div className="font-medium">{formatDate(selectedReceivable.due_date)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dias de Atraso</Label>
                  <div className="font-medium">
                    {selectedReceivable.days_overdue ? (
                      <span className="text-red-600">{selectedReceivable.days_overdue} dias</span>
                    ) : (
                      <span className="text-green-600">Em dia</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">Valor Total</Label>
                  <div className="text-xl font-bold">{formatCurrency(selectedReceivable.amount)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Já Pago</Label>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedReceivable.amount_paid)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Saldo</Label>
                  <div className="text-xl font-bold text-red-600">
                    {formatCurrency(selectedReceivable.amount - selectedReceivable.amount_paid)}
                  </div>
                </div>
              </div>

              {selectedReceivable.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">{selectedReceivable.notes}</div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              setSelectedReceivable(null)
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
