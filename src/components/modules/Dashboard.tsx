import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import { useDashboardKPIs, useDashboardStats } from '@/hooks/queries/useDashboardData'
import {
  Calendar, Package, DollarSign, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Clock, Brain
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export function Dashboard() {
  // React Query hooks for data fetching
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()

  // Combined loading state
  const loading = kpisLoading || statsLoading

  // Extract chart data from stats (with fallback to empty arrays)
  const revenueData = stats?.revenueData || []
  const surgeriesData = stats?.surgeriesData || []
  const productCategoryData = stats?.productCategoryData || []

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Dashboard"
        subtitle="Visão geral do sistema ICARUS v5.0"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema ICARUS v5.0
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cirurgias Hoje */}
        <Card className="neu-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cirurgias Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.surgeriesToday || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {(kpis?.surgeriesChange || 0) > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={(kpis?.surgeriesChange || 0) > 0 ? 'text-green-500' : 'text-red-500'}>
                {(kpis?.surgeriesChange || 0) > 0 ? '+' : ''}{kpis?.surgeriesChange || 0}
              </span>
              <span className="ml-1">desde ontem</span>
            </div>
          </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className="neu-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Crítico
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.criticalStock || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Produtos abaixo do mínimo
            </p>
          </CardContent>
        </Card>

        {/* Faturamento */}
        <Card className="neu-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis?.revenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{kpis?.revenueChange || 0}%</span>
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* IA Status */}
        <Card className="neu-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              IcarusBrain
            </CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {(kpis?.aiStatus || 'offline') === 'online' ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl font-bold">Online</span>
                </>
              ) : (
                <>
                  <Clock className="h-6 w-6 text-yellow-500" />
                  <span className="text-xl font-bold">Offline</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema de IA ativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai">IA Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Faturamento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#6366F1"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Surgeries Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cirurgias da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={surgeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cirurgias" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87.5%</div>
                <Badge variant="success" className="mt-2">+5.2% este mês</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tempo Médio Cirurgia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2h 45m</div>
                <Badge variant="info" className="mt-2">-15 min vs média</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Satisfação Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.8/5.0</div>
                <Badge variant="success" className="mt-2">Excelente</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>Insights de Inteligência Artificial</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 Oportunidade de Otimização
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  O IcarusBrain identificou que aumentar o estoque de produtos de Cardiologia
                  em 15% pode reduzir perdas de vendas em até R$ 12.500/mês.
                </p>
                <Badge variant="info" className="mt-2">Confiança: 92%</Badge>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <div className="font-medium text-green-900 dark:text-green-100 mb-2">
                  ✅ Previsão Positiva
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Tendência de crescimento de 18% em cirurgias de Ortopedia
                  para o próximo trimestre baseado em dados históricos.
                </p>
                <Badge variant="success" className="mt-2">Confiança: 88%</Badge>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <div className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Atenção Necessária
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  3 clientes com alto risco de inadimplência detectados.
                  Recomenda-se contato proativo para negociação.
                </p>
                <Badge variant="warning" className="mt-2">Confiança: 85%</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
