import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFinancial } from '@/hooks/useFinancial'
import { AccountFormDialog } from '@/components/financial/AccountFormDialog'
import { PaymentDialog } from '@/components/financial/PaymentDialog'
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
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable' | 'cashflow' | 'summary'>(
    'summary'
  )

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
            <Button onClick={reload} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
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
