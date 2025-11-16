import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFinancial } from '@/hooks/useFinancial'
import { AccountFormDialog } from '@/components/financial/AccountFormDialog'
import { PaymentDialog } from '@/components/financial/PaymentDialog'
import { ExportService } from '@/services/export.service'
import { DREService } from '@/services/dre.service'
import { ForecastService } from '@/services/forecast.service'
import {
  type FinancialAccount,
  type FinancialAccountFormData,
  type PaymentData,
  type AccountType,
} from '@/types/financial.types'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  DollarSign as PayIcon,
  Filter,
  X,
  FileText,
  Download,
  FileSpreadsheet,
  BarChart3,
  Activity,
  Target,
  Percent,
  Brain,
  Zap,
  AlertTriangle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function FinanceiroAvancado() {
  const {
    accounts,
    bankAccounts,
    summary,
    monthlyData,
    loading,
    error,
    reload,
    createAccount,
    updateAccount,
    deleteAccount,
    payAccount,
  } = useFinancial()
  const [activeTab, setActiveTab] = useState<
    'receivable' | 'payable' | 'cashflow' | 'summary' | 'dre' | 'forecast'
  >('summary')

  // Dialog states
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<FinancialAccount | undefined>(undefined)
  const [defaultAccountType, setDefaultAccountType] = useState<AccountType>('receivable')

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'receivable' | 'payable'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Handlers
  const handleCreateAccount = (type: AccountType) => {
    setDefaultAccountType(type)
    setSelectedAccount(undefined)
    setAccountFormOpen(true)
  }

  const handleEditAccount = (account: FinancialAccount) => {
    setSelectedAccount(account)
    setAccountFormOpen(true)
  }

  const handlePayAccount = (account: FinancialAccount) => {
    setSelectedAccount(account)
    setPaymentDialogOpen(true)
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteAccount(accountId)
      } catch (error) {
        console.error('Error deleting account:', error)
        alert('Erro ao excluir conta. Tente novamente.')
      }
    }
  }

  const handleAccountFormSubmit = async (data: FinancialAccountFormData) => {
    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, data)
      } else {
        await createAccount(data)
      }
      setAccountFormOpen(false)
      setSelectedAccount(undefined)
    } catch (error) {
      console.error('Error submitting account:', error)
      throw error
    }
  }

  const handlePaymentSubmit = async (data: PaymentData) => {
    try {
      await payAccount(data)
      setPaymentDialogOpen(false)
      setSelectedAccount(undefined)
    } catch (error) {
      console.error('Error submitting payment:', error)
      throw error
    }
  }

  // Export handlers
  const handleExportPDF = () => {
    if (!summary) return
    ExportService.exportFinancialReportPDF(summary, receivableAccounts, payableAccounts, monthlyData)
  }

  const handleExportExcel = () => {
    ExportService.exportAccountsExcel(receivableAccounts, payableAccounts)
  }

  const handleExportCashFlowCSV = () => {
    ExportService.exportCashFlowCSV(monthlyData)
  }

  const handleExportCashFlowExcel = () => {
    ExportService.exportCashFlowExcel(monthlyData)
  }

  const handleExportDRE = () => {
    if (!dreData) return
    DREService.exportDREtoPDF(dreData, dreIndicators)
  }

  // Calculate DRE data
  const dreComparative = useMemo(() => {
    if (accounts.length === 0) return null
    return DREService.calculateComparativeDRE(accounts)
  }, [accounts])

  const dreData = dreComparative?.current || null
  const drePrevious = dreComparative?.previous || null
  const dreComparison = dreComparative?.comparison || null

  const dreIndicators = useMemo(() => {
    if (!dreData) return null
    return DREService.calculateIndicators(dreData)
  }, [dreData])

  const dreHistory = useMemo(() => {
    if (accounts.length === 0) return []
    return DREService.getMonthlyDREHistory(accounts, 6)
  }, [accounts])

  // Calculate Forecast data (AI Predictions)
  const forecastData = useMemo(() => {
    if (accounts.length === 0 || monthlyData.length === 0) return null
    return ForecastService.generateForecast(accounts, monthlyData, 90)
  }, [accounts, monthlyData])

  const anomalies = useMemo(() => {
    if (accounts.length === 0 || monthlyData.length === 0) return []
    return ForecastService.detectAnomalies(accounts, monthlyData)
  }, [accounts, monthlyData])

  const smartAlerts = useMemo(() => {
    if (!forecastData) return []
    return ForecastService.generateSmartAlerts(accounts, forecastData, anomalies)
  }, [accounts, forecastData, anomalies])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <h2 className="text-red-400 font-bold text-lg mb-2">Erro ao carregar dados</h2>
          <p className="text-red-300">{error.message}</p>
          <Button onClick={reload} className="mt-4">
            Tentar novamente
          </Button>
        </Card>
      </div>
    )
  }

  // Apply filters
  const filteredAccounts = accounts.filter((account) => {
    // Type filter
    if (typeFilter !== 'all' && account.type !== typeFilter) return false

    // Status filter
    if (statusFilter !== 'all' && account.status !== statusFilter) return false

    // Date range filter
    if (startDate && account.due_date < startDate) return false
    if (endDate && account.due_date > endDate) return false

    return true
  })

  const receivableAccounts = filteredAccounts.filter((a) => a.type === 'receivable')
  const payableAccounts = filteredAccounts.filter((a) => a.type === 'payable')

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('all')
    setTypeFilter('all')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters =
    statusFilter !== 'all' || typeFilter !== 'all' || startDate !== '' || endDate !== ''

  // Prepare chart data
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#EC4899']

  const receivablesByStatus = [
    {
      name: 'Pago',
      value: receivableAccounts.filter((a) => a.status === 'paid').length,
      amount: receivableAccounts
        .filter((a) => a.status === 'paid')
        .reduce((sum, a) => sum + a.final_amount, 0),
    },
    {
      name: 'Pendente',
      value: receivableAccounts.filter((a) => a.status === 'pending').length,
      amount: receivableAccounts
        .filter((a) => a.status === 'pending')
        .reduce((sum, a) => sum + a.final_amount, 0),
    },
    {
      name: 'Vencido',
      value: receivableAccounts.filter((a) => a.status === 'overdue').length,
      amount: receivableAccounts
        .filter((a) => a.status === 'overdue')
        .reduce((sum, a) => sum + a.final_amount, 0),
    },
  ].filter((item) => item.value > 0)

  const payablesByCategory = payableAccounts.reduce(
    (acc, account) => {
      const existing = acc.find((item) => item.name === account.category)
      if (existing) {
        existing.value += account.final_amount
        existing.count += 1
      } else {
        acc.push({
          name:
            account.category === 'purchase'
              ? 'Compras'
              : account.category === 'expense'
                ? 'Despesas'
                : account.category === 'salary'
                  ? 'Salários'
                  : account.category === 'rent'
                    ? 'Aluguel'
                    : account.category === 'tax'
                      ? 'Impostos'
                      : 'Outros',
          value: account.final_amount,
          count: 1,
        })
      }
      return acc
    },
    [] as Array<{ name: string; value: number; count: number }>
  )

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Financeiro Avançado</h1>
              <p className="text-gray-400 mt-1">Gestão completa de contas e fluxo de caixa</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Export Dropdown */}
              <div className="relative group">
                <Button variant="default" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-2">
                    <button
                      onClick={handleExportPDF}
                      className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="font-medium">Relatório PDF</p>
                        <p className="text-xs text-gray-400">Resumo completo</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="font-medium">Contas Excel</p>
                        <p className="text-xs text-gray-400">Receber e Pagar</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCashFlowCSV}
                      className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-medium">Fluxo CSV</p>
                        <p className="text-xs text-gray-400">Dados mensais</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCashFlowExcel}
                      className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="font-medium">Fluxo Excel</p>
                        <p className="text-xs text-gray-400">Análise detalhada</p>
                      </div>
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleExportDRE}
                      className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      disabled={!dreData}
                    >
                      <BarChart3 className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="font-medium">DRE PDF</p>
                        <p className="text-xs text-gray-400">Demonstração completa</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <Button onClick={reload} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* KPIs Grid - 8 Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* A Receber - Pendente */}
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">A Receber (Pendente)</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.receivables.pending)}
                </p>
                <p className="text-xs text-green-400 mt-2">
                  {receivableAccounts.filter((a) => a.status === 'pending').length} contas
                </p>
              </Card>

              {/* A Receber - Vencido */}
              <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">A Receber (Vencido)</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.receivables.overdue)}
                </p>
                <p className="text-xs text-yellow-400 mt-2">
                  {receivableAccounts.filter((a) => a.status === 'overdue').length} contas
                </p>
              </Card>

              {/* A Pagar - Pendente */}
              <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                <div className="flex items-center justify-between mb-4">
                  <TrendingDown className="w-8 h-8 text-red-400" />
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">A Pagar (Pendente)</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.payables.pending)}
                </p>
                <p className="text-xs text-red-400 mt-2">
                  {payableAccounts.filter((a) => a.status === 'pending').length} contas
                </p>
              </Card>

              {/* A Pagar - Vencido */}
              <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-400" />
                  <span className="text-2xl">🔴</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">A Pagar (Vencido)</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.payables.overdue)}
                </p>
                <p className="text-xs text-orange-400 mt-2">
                  {payableAccounts.filter((a) => a.status === 'overdue').length} contas
                </p>
              </Card>

              {/* Saldo Bancário */}
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <CreditCard className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl">🏦</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Saldo Bancário</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.bankAccounts.totalBalance)}
                </p>
                <p className="text-xs text-blue-400 mt-2">
                  {summary.bankAccounts.accountCount} contas
                </p>
              </Card>

              {/* Fluxo Líquido */}
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Fluxo Líquido</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.cashFlow.netFlow)}
                </p>
                <p className="text-xs text-purple-400 mt-2">Receitas - Despesas</p>
              </Card>

              {/* Receitas Pagas */}
              <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Receitas Pagas</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.receivables.paid)}
                </p>
                <p className="text-xs text-cyan-400 mt-2">
                  {receivableAccounts.filter((a) => a.status === 'paid').length} contas
                </p>
              </Card>

              {/* Despesas Pagas */}
              <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="w-8 h-8 text-indigo-400" />
                  <span className="text-2xl">✔️</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Despesas Pagas</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(summary.payables.paid)}
                </p>
                <p className="text-xs text-indigo-400 mt-2">
                  {payableAccounts.filter((a) => a.status === 'paid').length} contas
                </p>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-100">Filtros</h3>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                  className="ml-auto text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="receivable">A Receber</option>
                  <option value="payable">A Pagar</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="overdue">Vencido</option>
                  <option value="paid">Pago</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  Mostrando {filteredAccounts.length} de {accounts.length} contas
                </p>
              </div>
            )}
          </Card>

          {/* Tabs */}
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="mb-6">
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
                <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
                <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="dre">DRE</TabsTrigger>
                <TabsTrigger value="forecast">
                  <Brain className="w-4 h-4 mr-2" />
                  Projeções IA
                </TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">
                      Fluxo de Caixa - Últimos 12 Meses
                    </h3>
                    {monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                          <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#F3F4F6' }}
                            formatter={(value: number) =>
                              new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(value)
                            }
                          />
                          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                          <Line
                            type="monotone"
                            dataKey="income"
                            name="Receitas"
                            stroke="#10B981"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="expense"
                            name="Despesas"
                            stroke="#EF4444"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="netFlow"
                            name="Fluxo Líquido"
                            stroke="#6366F1"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-gray-500">Nenhum dado disponível</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Receivables by Status - PieChart */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-4">
                        Contas a Receber por Status
                      </h3>
                      {receivablesByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={receivablesByStatus}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {receivablesByStatus.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: '#F3F4F6' }}
                              formatter={(value: number, name: string, entry: any) => [
                                `${value} contas - ${new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(entry.payload.amount)}`,
                                name,
                              ]}
                            />
                            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center">
                          <p className="text-gray-500">Nenhum dado disponível</p>
                        </div>
                      )}
                    </div>

                    {/* Payables by Category - BarChart */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-4">
                        Contas a Pagar por Categoria
                      </h3>
                      {payablesByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={payablesByCategory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                              dataKey="name"
                              stroke="#9CA3AF"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              style={{ fontSize: '12px' }}
                              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: '#F3F4F6' }}
                              formatter={(value: number, name: string, entry: any) => [
                                `${entry.payload.count} contas - ${new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(value)}`,
                                'Total',
                              ]}
                            />
                            <Bar dataKey="value" fill="#EF4444" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center">
                          <p className="text-gray-500">Nenhum dado disponível</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Receivable Tab */}
              <TabsContent value="receivable">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-100">
                      Contas a Receber ({receivableAccounts.length})
                    </h3>
                    <Button
                      onClick={() => handleCreateAccount('receivable')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nova Conta
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50 border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                            Descrição
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                            Valor
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                            Vencimento
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {receivableAccounts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                              Nenhuma conta a receber
                            </td>
                          </tr>
                        ) : (
                          receivableAccounts.map((account) => (
                            <tr key={account.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {account.description}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300 text-right">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(account.final_amount)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300 text-center">
                                {new Date(account.due_date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`
                                  inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium
                                  ${
                                    account.status === 'paid'
                                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                      : account.status === 'overdue'
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                  }
                                `}
                                >
                                  {account.status === 'paid'
                                    ? 'Pago'
                                    : account.status === 'overdue'
                                      ? 'Vencido'
                                      : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {account.status !== 'paid' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handlePayAccount(account)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      title="Registrar Pagamento"
                                    >
                                      <PayIcon className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditAccount(account)}
                                    title="Editar"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAccount(account.id)}
                                    className="hover:bg-red-500/10 hover:border-red-500/50"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Payable Tab */}
              <TabsContent value="payable">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-100">
                      Contas a Pagar ({payableAccounts.length})
                    </h3>
                    <Button
                      onClick={() => handleCreateAccount('payable')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nova Conta
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50 border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                            Descrição
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                            Valor
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                            Vencimento
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {payableAccounts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                              Nenhuma conta a pagar
                            </td>
                          </tr>
                        ) : (
                          payableAccounts.map((account) => (
                            <tr key={account.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {account.description}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300 text-right">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(account.final_amount)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-300 text-center">
                                {new Date(account.due_date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`
                                  inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium
                                  ${
                                    account.status === 'paid'
                                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                      : account.status === 'overdue'
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                  }
                                `}
                                >
                                  {account.status === 'paid'
                                    ? 'Pago'
                                    : account.status === 'overdue'
                                      ? 'Vencido'
                                      : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {account.status !== 'paid' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handlePayAccount(account)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      title="Registrar Pagamento"
                                    >
                                      <PayIcon className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditAccount(account)}
                                    title="Editar"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAccount(account.id)}
                                    className="hover:bg-red-500/10 hover:border-red-500/50"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Cash Flow Tab */}
              <TabsContent value="cashflow">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">
                      Fluxo de Caixa Acumulado - Últimos 12 Meses
                    </h3>
                    {monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={monthlyData}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                          <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#F3F4F6' }}
                            formatter={(value: number) =>
                              new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(value)
                            }
                          />
                          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                          <Area
                            type="monotone"
                            dataKey="income"
                            name="Receitas"
                            stroke="#10B981"
                            fillOpacity={1}
                            fill="url(#colorIncome)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="expense"
                            name="Despesas"
                            stroke="#EF4444"
                            fillOpacity={1}
                            fill="url(#colorExpense)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="netFlow"
                            name="Fluxo Líquido"
                            stroke="#6366F1"
                            fillOpacity={1}
                            fill="url(#colorNet)"
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center">
                        <p className="text-gray-500">Nenhum dado disponível</p>
                      </div>
                    )}
                  </div>

                  {/* Monthly Data Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">
                      Detalhamento Mensal
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800/50 border-b border-white/10">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                              Mês
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                              Receitas
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                              Despesas
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                              Fluxo Líquido
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {monthlyData.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                Nenhum dado disponível
                              </td>
                            </tr>
                          ) : (
                            monthlyData.slice().reverse().map((data) => {
                              const isPositive = data.netFlow >= 0
                              return (
                                <tr key={data.month} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-300">
                                    {data.month}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-green-400 text-right font-medium">
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    }).format(data.income)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-red-400 text-right font-medium">
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    }).format(data.expense)}
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-sm text-right font-bold ${
                                      isPositive ? 'text-blue-400' : 'text-red-400'
                                    }`}
                                  >
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    }).format(data.netFlow)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                                        isPositive
                                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                      }`}
                                    >
                                      {isPositive ? '↑ Positivo' : '↓ Negativo'}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* DRE Tab */}
              <TabsContent value="dre">
                {!dreData ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">Carregando DRE...</h3>
                    <p className="text-gray-500 text-sm">Calculando demonstração de resultados</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* DRE Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">
                          Demonstração de Resultados do Exercício
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Período: {new Date(dreData.period.start).toLocaleDateString('pt-BR')} até{' '}
                          {new Date(dreData.period.end).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        onClick={handleExportDRE}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                      >
                        <Download className="w-4 h-4" />
                        Exportar DRE
                      </Button>
                    </div>

                    {/* Comparative Cards */}
                    {dreComparison && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-blue-400" />
                            <div>
                              <p className="text-sm text-gray-400">Crescimento Receita</p>
                              <p className={`text-2xl font-bold ${dreComparison.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dreComparison.revenueGrowth >= 0 ? '+' : ''}
                                {dreComparison.revenueGrowth.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                          <div className="flex items-center gap-3">
                            <Target className="w-8 h-8 text-green-400" />
                            <div>
                              <p className="text-sm text-gray-400">Crescimento Lucro</p>
                              <p className={`text-2xl font-bold ${dreComparison.profitGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dreComparison.profitGrowth >= 0 ? '+' : ''}
                                {dreComparison.profitGrowth.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                          <div className="flex items-center gap-3">
                            <Percent className="w-8 h-8 text-purple-400" />
                            <div>
                              <p className="text-sm text-gray-400">Variação Margem</p>
                              <p className={`text-2xl font-bold ${dreComparison.marginChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dreComparison.marginChange >= 0 ? '+' : ''}
                                {dreComparison.marginChange.toFixed(2)}pp
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* DRE Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody className="divide-y divide-white/5">
                          <tr className="bg-indigo-600/20">
                            <td colSpan={2} className="px-4 py-3 text-sm font-bold text-indigo-300">
                              RECEITAS OPERACIONAIS
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Vendas e Cirurgias</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.revenue.sales)}
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Serviços</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.revenue.services)}
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Outras Receitas</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.revenue.other)}
                            </td>
                          </tr>
                          <tr className="bg-green-600/10 font-bold">
                            <td className="px-4 py-3 text-sm text-green-300">Total de Receitas</td>
                            <td className="px-4 py-3 text-sm text-green-300 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.revenue.total)}
                            </td>
                          </tr>
                          <tr><td colSpan={2} className="py-2"></td></tr>
                          <tr className="bg-red-600/20">
                            <td colSpan={2} className="px-4 py-3 text-sm font-bold text-red-300">
                              CUSTOS OPERACIONAIS
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Materiais</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.costs.materials)}
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Mão de Obra</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.costs.labor)}
                            </td>
                          </tr>
                          <tr className="bg-red-600/10 font-bold">
                            <td className="px-4 py-3 text-sm text-red-300">Total de Custos</td>
                            <td className="px-4 py-3 text-sm text-red-300 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.costs.total)}
                            </td>
                          </tr>
                          <tr><td colSpan={2} className="py-2"></td></tr>
                          <tr className="bg-green-600/20">
                            <td className="px-4 py-3 text-base font-bold text-green-300">LUCRO BRUTO</td>
                            <td className="px-4 py-3 text-base font-bold text-green-300 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.result.grossProfit)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="px-4 py-1 text-xs text-gray-500">
                              Margem Bruta: {dreData.result.grossMargin.toFixed(2)}%
                            </td>
                          </tr>
                          <tr><td colSpan={2} className="py-2"></td></tr>
                          <tr className="bg-red-600/20">
                            <td colSpan={2} className="px-4 py-3 text-sm font-bold text-red-300">
                              DESPESAS OPERACIONAIS
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Despesas Administrativas</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.expenses.administrative)}
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Despesas de Vendas</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.expenses.sales)}
                            </td>
                          </tr>
                          <tr className="hover:bg-white/5">
                            <td className="px-8 py-2 text-sm text-gray-300">Despesas Financeiras</td>
                            <td className="px-4 py-2 text-sm text-gray-100 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.expenses.financial)}
                            </td>
                          </tr>
                          <tr className="bg-red-600/10 font-bold">
                            <td className="px-4 py-3 text-sm text-red-300">Total de Despesas</td>
                            <td className="px-4 py-3 text-sm text-red-300 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.expenses.total)}
                            </td>
                          </tr>
                          <tr><td colSpan={2} className="py-2"></td></tr>
                          <tr className="bg-indigo-600/20">
                            <td className="px-4 py-3 text-base font-bold text-indigo-300">RESULTADO OPERACIONAL</td>
                            <td className="px-4 py-3 text-base font-bold text-indigo-300 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.result.operatingProfit)}
                            </td>
                          </tr>
                          <tr><td colSpan={2} className="py-2"></td></tr>
                          <tr className="bg-green-600/30">
                            <td className="px-4 py-4 text-lg font-bold text-green-200">RESULTADO LÍQUIDO</td>
                            <td className="px-4 py-4 text-lg font-bold text-green-200 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dreData.result.netProfit)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="px-4 py-1 text-xs text-gray-500">
                              Margem Líquida: {dreData.result.netMargin.toFixed(2)}%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Indicators Cards */}
                    {dreIndicators && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">Indicadores Financeiros</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <p className="text-sm text-gray-400 mb-1">ROI (Return on Investment)</p>
                            <p className="text-2xl font-bold text-blue-400">{dreIndicators.roi.toFixed(2)}%</p>
                          </Card>
                          <Card className="p-4">
                            <p className="text-sm text-gray-400 mb-1">EBITDA</p>
                            <p className="text-2xl font-bold text-green-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(dreIndicators.ebitda)}
                            </p>
                          </Card>
                          <Card className="p-4">
                            <p className="text-sm text-gray-400 mb-1">Margem Operacional</p>
                            <p className="text-2xl font-bold text-indigo-400">{dreIndicators.operationalMargin.toFixed(2)}%</p>
                          </Card>
                          <Card className="p-4">
                            <p className="text-sm text-gray-400 mb-1">Margem de Contribuição</p>
                            <p className="text-2xl font-bold text-purple-400">{dreIndicators.contributionMarginRatio.toFixed(2)}%</p>
                          </Card>
                          <Card className="p-4">
                            <p className="text-sm text-gray-400 mb-1">Ponto de Equilíbrio</p>
                            <p className="text-2xl font-bold text-orange-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(dreIndicators.breakEvenPoint)}
                            </p>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Evolution Chart */}
                    {dreHistory.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">Evolução - Últimos 6 Meses</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={dreHistory.map((dre, i) => ({
                            month: new Date(dre.period.start).toLocaleDateString('pt-BR', { month: 'short' }),
                            revenue: dre.revenue.total,
                            costs: dre.costs.total,
                            profit: dre.result.netProfit,
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                            />
                            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                            <Line type="monotone" dataKey="revenue" name="Receitas" stroke="#10B981" strokeWidth={2} />
                            <Line type="monotone" dataKey="costs" name="Custos" stroke="#EF4444" strokeWidth={2} />
                            <Line type="monotone" dataKey="profit" name="Lucro Líquido" stroke="#6366F1" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Forecast Tab - AI Predictions */}
              <TabsContent value="forecast">
                {!forecastData ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">
                      Dados insuficientes para gerar previsões. Adicione mais transações financeiras.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">Projeções Financeiras com IA</h2>
                        <p className="text-gray-400">IcarusBrain - Previsões inteligentes baseadas em Machine Learning</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Precisão do Modelo</p>
                          <p className="text-2xl font-bold text-green-400">{forecastData.accuracy.overall.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Smart Alerts Section */}
                    {smartAlerts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          Alertas Inteligentes ({smartAlerts.length})
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {smartAlerts.slice(0, 5).map((alert) => (
                            <Card
                              key={alert.id}
                              className={`p-4 border ${
                                alert.type === 'danger'
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : alert.type === 'warning'
                                  ? 'bg-yellow-500/10 border-yellow-500/30'
                                  : alert.type === 'success'
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-blue-500/10 border-blue-500/30'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {alert.severity === 'critical' && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                                {alert.severity === 'high' && <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />}
                                {alert.severity === 'medium' && <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />}
                                {alert.severity === 'low' && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />}
                                <div className="flex-1">
                                  <h4 className={`font-semibold ${
                                    alert.type === 'danger' ? 'text-red-300' :
                                    alert.type === 'warning' ? 'text-yellow-300' :
                                    alert.type === 'success' ? 'text-green-300' :
                                    'text-blue-300'
                                  }`}>
                                    {alert.title}
                                  </h4>
                                  <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                                  <span className="text-xs text-gray-500 mt-2 inline-block">
                                    {alert.category} • {alert.severity}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trend Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className={`p-4 border ${
                        forecastData.trends.revenue === 'growing'
                          ? 'bg-green-500/10 border-green-500/30'
                          : forecastData.trends.revenue === 'declining'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Tendência de Receita</span>
                          {forecastData.trends.revenue === 'growing' && <TrendingUp className="w-5 h-5 text-green-400" />}
                          {forecastData.trends.revenue === 'declining' && <TrendingDown className="w-5 h-5 text-red-400" />}
                          {forecastData.trends.revenue === 'stable' && <Activity className="w-5 h-5 text-gray-400" />}
                        </div>
                        <p className={`text-2xl font-bold ${
                          forecastData.trends.revenue === 'growing'
                            ? 'text-green-400'
                            : forecastData.trends.revenue === 'declining'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}>
                          {forecastData.trends.revenue === 'growing' ? 'Crescimento' : forecastData.trends.revenue === 'declining' ? 'Queda' : 'Estável'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Precisão: {forecastData.accuracy.revenue.toFixed(1)}%
                        </p>
                      </Card>

                      <Card className={`p-4 border ${
                        forecastData.trends.expenses === 'growing'
                          ? 'bg-red-500/10 border-red-500/30'
                          : forecastData.trends.expenses === 'declining'
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Tendência de Despesas</span>
                          {forecastData.trends.expenses === 'growing' && <TrendingUp className="w-5 h-5 text-red-400" />}
                          {forecastData.trends.expenses === 'declining' && <TrendingDown className="w-5 h-5 text-green-400" />}
                          {forecastData.trends.expenses === 'stable' && <Activity className="w-5 h-5 text-gray-400" />}
                        </div>
                        <p className={`text-2xl font-bold ${
                          forecastData.trends.expenses === 'growing'
                            ? 'text-red-400'
                            : forecastData.trends.expenses === 'declining'
                            ? 'text-green-400'
                            : 'text-gray-400'
                        }`}>
                          {forecastData.trends.expenses === 'growing' ? 'Crescimento' : forecastData.trends.expenses === 'declining' ? 'Queda' : 'Estável'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Precisão: {forecastData.accuracy.expenses.toFixed(1)}%
                        </p>
                      </Card>

                      <Card className={`p-4 border ${
                        forecastData.trends.profitability === 'improving'
                          ? 'bg-green-500/10 border-green-500/30'
                          : forecastData.trends.profitability === 'declining'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Rentabilidade</span>
                          {forecastData.trends.profitability === 'improving' && <TrendingUp className="w-5 h-5 text-green-400" />}
                          {forecastData.trends.profitability === 'declining' && <TrendingDown className="w-5 h-5 text-red-400" />}
                          {forecastData.trends.profitability === 'stable' && <Activity className="w-5 h-5 text-gray-400" />}
                        </div>
                        <p className={`text-2xl font-bold ${
                          forecastData.trends.profitability === 'improving'
                            ? 'text-green-400'
                            : forecastData.trends.profitability === 'declining'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}>
                          {forecastData.trends.profitability === 'improving' ? 'Melhorando' : forecastData.trends.profitability === 'declining' ? 'Piorando' : 'Estável'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {forecastData.seasonality.detected ? `Sazonalidade: ${forecastData.seasonality.pattern}` : 'Sem sazonalidade'}
                        </p>
                      </Card>
                    </div>

                    {/* Forecast Chart - 90 Days Prediction */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        Projeção 30/60/90 Dias - Receitas vs Despesas
                      </h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart
                          data={forecastData.periods.map((period) => ({
                            date: new Date(period.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
                            revenue: period.revenue.predicted,
                            revenueLower: period.revenue.lower,
                            revenueUpper: period.revenue.upper,
                            expenses: period.expenses.predicted,
                            expensesLower: period.expenses.lower,
                            expensesUpper: period.expenses.upper,
                            cashFlow: period.cashFlow.predicted,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
                          <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                            labelStyle={{ color: '#F3F4F6' }}
                            formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                          />
                          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                          <Area type="monotone" dataKey="revenue" name="Receita Prevista" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                          <Area type="monotone" dataKey="expenses" name="Despesas Previstas" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={2} />
                          <Line type="monotone" dataKey="cashFlow" name="Fluxo de Caixa" stroke="#6366F1" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
                        <span>● Intervalo de confiança mostrado em área sombreada</span>
                        <span>● Modelo atualizado em tempo real</span>
                      </div>
                    </Card>

                    {/* Anomalies Detection */}
                    {anomalies.length > 0 && (
                      <Card className="p-6 bg-orange-500/5 border-orange-500/20">
                        <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Anomalias Detectadas ({anomalies.length})
                        </h3>
                        <div className="space-y-3">
                          {anomalies.slice(0, 3).map((anomaly, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-orange-500/20"
                            >
                              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                anomaly.severity === 'high' ? 'text-red-400' :
                                anomaly.severity === 'medium' ? 'text-orange-400' :
                                'text-yellow-400'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-200">
                                    {anomaly.type === 'revenue' ? 'Receita' : 'Despesa'} Anormal
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(anomaly.date).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{anomaly.description}</p>
                                <div className="flex gap-4 mt-2 text-xs">
                                  <span className="text-gray-500">
                                    Esperado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(anomaly.expected)}
                                  </span>
                                  <span className="text-gray-500">
                                    Real: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(anomaly.actual)}
                                  </span>
                                  <span className={`font-semibold ${anomaly.deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* AI Model Info */}
                    <Card className="p-4 bg-purple-500/5 border-purple-500/20">
                      <div className="flex items-center gap-3">
                        <Brain className="w-8 h-8 text-purple-400" />
                        <div>
                          <h4 className="font-semibold text-purple-300">IcarusBrain v2.0 - Machine Learning Financeiro</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Algoritmos: Linear Regression, Exponential Smoothing, Z-score Anomaly Detection, Seasonality Analysis
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Treino: {monthlyData.length} períodos</span>
                            <span>Confiança: {forecastData.periods[0]?.revenue.confidence || 0}%</span>
                            <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Dialogs */}
        <AccountFormDialog
          open={accountFormOpen}
          onOpenChange={setAccountFormOpen}
          account={selectedAccount}
          defaultType={defaultAccountType}
          bankAccounts={bankAccounts}
          onSubmit={handleAccountFormSubmit}
        />

      {selectedAccount && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          account={selectedAccount}
          bankAccounts={bankAccounts}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  )
}
