import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KPICard } from '@/components/ui/KPICard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import { useDashboardKPIs, useDashboardStats } from '@/hooks/queries/useDashboardData'
import {
  Calendar, DollarSign,
  AlertCircle, Brain
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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
        <KPICard
          title="Cirurgias Hoje"
          value={kpis?.surgeriesToday || 0}
          icon={Calendar}
          trend={{
            value: Math.abs(kpis?.surgeriesChange || 0),
            direction: (kpis?.surgeriesChange || 0) > 0 ? 'up' : (kpis?.surgeriesChange || 0) < 0 ? 'down' : 'stable'
          }}
          variant="default"
        />

        {/* Estoque Crítico */}
        <KPICard
          title="Estoque Crítico"
          value={kpis?.criticalStock || 0}
          icon={AlertCircle}
          variant="danger"
        />

        {/* Faturamento */}
        <KPICard
          title="Faturamento"
          value={formatCurrency(kpis?.revenue || 0)}
          icon={DollarSign}
          trend={{
            value: kpis?.revenueChange || 0,
            direction: 'up'
          }}
          variant="success"
        />

        {/* IA Status */}
        <KPICard
          title="IcarusBrain"
          value={(kpis?.aiStatus || 'offline') === 'online' ? 'Online' : 'Offline'}
          icon={Brain}
          variant="primary"
        />
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
