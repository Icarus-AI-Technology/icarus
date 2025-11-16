import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/useDashboard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Package,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function DashboardPrincipal() {
  const { kpis, monthlyRevenue, topProducts, surgeryBySpecialty, loading, error, reload } = useDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Carregando dashboard...</p>
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

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Dashboard Principal</h1>
              <p className="text-gray-400 mt-1">Visão geral do sistema ICARUS v5.0</p>
            </div>
            <Button onClick={reload} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>

          {/* KPIs Grid */}
          {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Cirurgias Hoje */}
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Cirurgias Hoje</h3>
                <p className="text-3xl font-bold text-gray-100">{kpis.todaySurgeries}</p>
                <p className="text-xs text-blue-400 mt-2">Agendadas para hoje</p>
              </Card>

              {/* Faturamento Mês */}
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-400" />
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Faturamento Mês</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(kpis.monthRevenue)}
                </p>
                <p className="text-xs text-green-400 mt-2">Mês atual</p>
              </Card>

              {/* Estoque Crítico */}
              <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Estoque Crítico</h3>
                <p className="text-3xl font-bold text-gray-100">{kpis.criticalStock}</p>
                <p className="text-xs text-yellow-400 mt-2">Produtos abaixo do mínimo</p>
              </Card>

              {/* Contas a Receber */}
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Contas a Receber</h3>
                <p className="text-3xl font-bold text-gray-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(kpis.accountsReceivable)}
                </p>
                <p className="text-xs text-purple-400 mt-2">Pendente</p>
              </Card>

              {/* Taxa de Aprovação */}
              <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Taxa de Aprovação</h3>
                <p className="text-3xl font-bold text-gray-100">{kpis.approvalRate.toFixed(1)}%</p>
                <p className="text-xs text-cyan-400 mt-2">Cirurgias confirmadas</p>
              </Card>

              {/* Total de Produtos */}
              <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-indigo-400" />
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Total de Produtos</h3>
                <p className="text-3xl font-bold text-gray-100">{kpis.totalProducts}</p>
                <p className="text-xs text-indigo-400 mt-2">Produtos ativos</p>
              </Card>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Faturamento Últimos 12 Meses
              </h3>
              {monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="month"
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
                      dataKey="revenue"
                      name="Faturamento"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={{ fill: '#6366F1', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="surgeries"
                      name="Cirurgias"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </Card>

            {/* Top Products Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Top 10 Produtos em Estoque
              </h3>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="name"
                      stroke="#9CA3AF"
                      style={{ fontSize: '10px' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="quantity" name="Quantidade" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">Nenhum produto disponível</p>
                </div>
              )}
            </Card>

            {/* Surgery by Specialty Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Cirurgias por Especialidade
              </h3>
              {surgeryBySpecialty.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={surgeryBySpecialty}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ specialty, percentage }) =>
                        `${specialty}: ${percentage.toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {surgeryBySpecialty.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">Nenhuma cirurgia agendada</p>
                </div>
              )}
            </Card>

            {/* Quick Actions / Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Nova Cirurgia
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Gerenciar Estoque
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Emitir Nota Fiscal
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Relatórios Financeiros
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Status do Sistema</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database</span>
                    <span className="text-green-400">✓ Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supabase Auth</span>
                    <span className="text-green-400">✓ Ativo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Realtime</span>
                    <span className="text-green-400">✓ Conectado</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
    </div>
  )
}
