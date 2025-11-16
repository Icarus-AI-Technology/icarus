import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSupabase } from '@/hooks/useSupabase'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, AlertCircle,
  Calendar, Download, Filter, Search, CheckCircle2, Clock,
  XCircle, BarChart3, PieChart as PieChartIcon
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  surgery_id: string
  issue_date: string
  due_date: string
  total_amount: number
  status: 'draft' | 'issued' | 'paid' | 'cancelled'
  payment_date?: string
}

interface AccountReceivable {
  id: string
  invoice_id: string
  invoice_number?: string
  customer_name: string
  due_date: string
  amount: number
  amount_paid: number
  status: 'pending' | 'partial' | 'paid' | 'overdue'
}

interface FinancialMetrics {
  totalRevenue: number
  revenueGrowth: number
  receivables: number
  overdue: number
  averageTicket: number
  profitMargin: number
}

export function Financeiro() {
  const { supabase, isConfigured } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [receivables, setReceivables] = useState<AccountReceivable[]>([])
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    receivables: 0,
    overdue: 0,
    averageTicket: 0,
    profitMargin: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('30')

  // Mock data
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'NF-2025-001',
      customer_name: 'Hospital Santa Casa',
      surgery_id: '1',
      issue_date: '2025-01-15',
      due_date: '2025-02-14',
      total_amount: 35000,
      status: 'issued'
    },
    {
      id: '2',
      invoice_number: 'NF-2025-002',
      customer_name: 'Hospital Albert Einstein',
      surgery_id: '2',
      issue_date: '2025-01-16',
      due_date: '2025-02-15',
      total_amount: 45000,
      status: 'paid',
      payment_date: '2025-01-20'
    },
    {
      id: '3',
      invoice_number: 'NF-2025-003',
      customer_name: 'Hospital Sírio-Libanês',
      surgery_id: '3',
      issue_date: '2025-01-10',
      due_date: '2025-01-25',
      total_amount: 65000,
      status: 'issued'
    },
    {
      id: '4',
      invoice_number: 'NF-2025-004',
      customer_name: 'Hospital Santa Casa',
      surgery_id: '4',
      issue_date: '2025-01-12',
      due_date: '2025-02-11',
      total_amount: 28000,
      status: 'paid',
      payment_date: '2025-01-18'
    }
  ]

  const mockReceivables: AccountReceivable[] = [
    {
      id: '1',
      invoice_id: '1',
      invoice_number: 'NF-2025-001',
      customer_name: 'Hospital Santa Casa',
      due_date: '2025-02-14',
      amount: 35000,
      amount_paid: 0,
      status: 'pending'
    },
    {
      id: '2',
      invoice_id: '3',
      invoice_number: 'NF-2025-003',
      customer_name: 'Hospital Sírio-Libanês',
      due_date: '2025-01-25',
      amount: 65000,
      amount_paid: 30000,
      status: 'partial'
    },
    {
      id: '3',
      invoice_id: '5',
      invoice_number: 'NF-2024-089',
      customer_name: 'Clínica Morumbi',
      due_date: '2025-01-10',
      amount: 22000,
      amount_paid: 0,
      status: 'overdue'
    }
  ]

  // Chart data
  const revenueData = [
    { month: 'Jul', receita: 185000, despesas: 142000, lucro: 43000 },
    { month: 'Ago', receita: 220000, despesas: 165000, lucro: 55000 },
    { month: 'Set', receita: 198000, despesas: 155000, lucro: 43000 },
    { month: 'Out', receita: 245000, despesas: 178000, lucro: 67000 },
    { month: 'Nov', receita: 278000, despesas: 195000, lucro: 83000 },
    { month: 'Dez', receita: 312000, despesas: 218000, lucro: 94000 },
  ]

  const cashFlowData = [
    { dia: '01', entrada: 45000, saida: 28000 },
    { dia: '05', entrada: 38000, saida: 32000 },
    { dia: '10', entrada: 52000, saida: 41000 },
    { dia: '15', entrada: 61000, saida: 38000 },
    { dia: '20', entrada: 48000, saida: 45000 },
    { dia: '25', entrada: 55000, saida: 35000 },
    { dia: '30', entrada: 58000, saida: 39000 },
  ]

  const categoryDistribution = [
    { name: 'Produtos OPME', value: 65, color: '#6366F1' },
    { name: 'Serviços', value: 25, color: '#10B981' },
    { name: 'Consultoria', value: 10, color: '#F59E0B' },
  ]

  const paymentMethodsData = [
    { method: 'Boleto', count: 45, color: '#6366F1' },
    { method: 'Transferência', count: 32, color: '#10B981' },
    { method: 'Cartão', count: 18, color: '#8B5CF6' },
    { method: 'Cheque', count: 5, color: '#F59E0B' },
  ]

  useEffect(() => {
    loadFinancialData()
  }, [isConfigured, periodFilter])

  const loadFinancialData = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        setInvoices(mockInvoices)
        setReceivables(mockReceivables)
        calculateMetrics(mockInvoices, mockReceivables)
        setLoading(false)
      }, 500)
      return
    }

    try {
      // Calculate date range based on period filter
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(periodFilter))

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .gte('issue_date', startDate.toISOString())
        .lte('issue_date', endDate.toISOString())
        .order('issue_date', { ascending: false })

      if (invoicesError) throw invoicesError

      // Fetch accounts receivable
      const { data: receivablesData, error: receivablesError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .order('due_date', { ascending: true })

      if (receivablesError) throw receivablesError

      setInvoices(invoicesData || [])
      setReceivables(receivablesData || [])
      calculateMetrics(invoicesData || [], receivablesData || [])
    } catch (error) {
      console.error('Error loading financial data:', error)
      toast.error('Erro ao carregar dados financeiros')
      // Fallback to mock data
      setInvoices(mockInvoices)
      setReceivables(mockReceivables)
      calculateMetrics(mockInvoices, mockReceivables)
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (invoicesData: Invoice[], receivablesData: AccountReceivable[]) => {
    const paidInvoices = invoicesData.filter(i => i.status === 'paid')
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const totalReceivables = receivablesData
      .filter(r => r.status !== 'paid')
      .reduce((sum, r) => sum + (r.amount - r.amount_paid), 0)
    const overdueAmount = receivablesData
      .filter(r => r.status === 'overdue')
      .reduce((sum, r) => sum + (r.amount - r.amount_paid), 0)
    const averageTicket = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0

    setMetrics({
      totalRevenue,
      revenueGrowth: 12.5,
      receivables: totalReceivables,
      overdue: overdueAmount,
      averageTicket,
      profitMargin: 28.4
    })
  }

  const handleExportData = () => {
    toast.success('Exportando relatório financeiro...')
    // Implementation for CSV/PDF export
  }

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>
      case 'issued':
        return <Badge variant="info">Emitida</Badge>
      case 'paid':
        return <Badge variant="success">Paga</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>
    }
  }

  const getReceivableStatusBadge = (status: AccountReceivable['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="info">Pendente</Badge>
      case 'partial':
        return <Badge variant="warning">Parcial</Badge>
      case 'paid':
        return <Badge variant="success">Pago</Badge>
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, debouncedSearch, statusFilter])

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Financeiro"
        subtitle="Analytics e gestão financeira completa"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financeiro</h1>
          <p className="text-muted-foreground">
            Analytics e gestão financeira completa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{metrics.revenueGrowth}%</span>
              <span className="ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(metrics.receivables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {receivables.filter(r => r.status !== 'paid').length} faturas pendentes
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
              {formatCurrency(metrics.overdue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ação necessária
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageTicket)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por cirurgia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="invoices">Notas Fiscais</TabsTrigger>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Revenue vs Profit */}
          <Card>
            <CardHeader>
              <CardTitle>Receita vs Lucro (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    name="Receita"
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorLucro)"
                    name="Lucro"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cash Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="entrada" fill="#10B981" name="Entradas" />
                    <Bar dataKey="saida" fill="#EF4444" name="Saídas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Receita por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={paymentMethodsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="method" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1">
                      {paymentMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Indicadores Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <div>
                      <div className="text-sm text-muted-foreground">Margem de Lucro</div>
                      <div className="text-2xl font-bold text-green-600">{metrics.profitMargin}%</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div>
                      <div className="text-sm text-muted-foreground">Taxa de Recebimento</div>
                      <div className="text-2xl font-bold text-blue-600">94.2%</div>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-blue-500" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                    <div>
                      <div className="text-sm text-muted-foreground">Prazo Médio Recebimento</div>
                      <div className="text-2xl font-bold text-purple-600">38 dias</div>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número ou cliente..."
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
                    <SelectItem value="paid">Pagas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
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
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <div className="font-medium">{invoice.invoice_number}</div>
                          <div className="text-sm text-muted-foreground">{invoice.customer_name}</div>
                        </div>
                        <div>
                          <div className="text-sm">Emissão</div>
                          <div className="text-sm font-medium">{formatDate(invoice.issue_date)}</div>
                        </div>
                        <div>
                          <div className="text-sm">Vencimento</div>
                          <div className="text-sm font-medium">{formatDate(invoice.due_date)}</div>
                        </div>
                        <div>
                          <div className="text-sm">Valor</div>
                          <div className="text-sm font-bold">{formatCurrency(invoice.total_amount)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          {getInvoiceStatusBadge(invoice.status)}
                          {invoice.payment_date && (
                            <div className="text-xs text-muted-foreground ml-2">
                              Pago: {formatDate(invoice.payment_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receivables Tab */}
        <TabsContent value="receivables" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    receivables
                      .filter(r => r.status === 'pending')
                      .reduce((sum, r) => sum + (r.amount - r.amount_paid), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {receivables.filter(r => r.status === 'pending').length} contas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parciais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(
                    receivables
                      .filter(r => r.status === 'partial')
                      .reduce((sum, r) => sum + (r.amount - r.amount_paid), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {receivables.filter(r => r.status === 'partial').length} contas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    receivables
                      .filter(r => r.status === 'overdue')
                      .reduce((sum, r) => sum + (r.amount - r.amount_paid), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {receivables.filter(r => r.status === 'overdue').length} contas
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {receivables.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma conta a receber
                  </div>
                ) : (
                  receivables.map((receivable) => {
                    const remaining = receivable.amount - receivable.amount_paid
                    const percentPaid = (receivable.amount_paid / receivable.amount) * 100

                    return (
                      <div
                        key={receivable.id}
                        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium">{receivable.customer_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {receivable.invoice_number} - Vence: {formatDate(receivable.due_date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(remaining)}</div>
                            <div className="text-xs text-muted-foreground">
                              de {formatCurrency(receivable.amount)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${percentPaid}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {percentPaid.toFixed(0)}%
                            </span>
                            {getReceivableStatusBadge(receivable.status)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
