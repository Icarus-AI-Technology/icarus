import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KPICard } from '@/components/ui/KPICard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import { useDashboardKPIs, useDashboardStats } from '@/hooks/queries/useDashboardData'
import {
  Calendar, DollarSign,
  AlertCircle, BrainCircuit
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Custom tooltip style for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="px-4 py-3 rounded-xl text-white"
        style={{
          background: '#1A1F35',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <p className="text-sm font-medium text-[#94A3B8]">{label}</p>
        <p className="text-lg font-bold text-white">
          {typeof payload[0].value === 'number' && payload[0].value > 1000 
            ? formatCurrency(payload[0].value) 
            : payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

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
        subtitle="Visão geral do sistema ICARUS v5.1"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#94A3B8]">
          Visão geral do sistema ICARUS v5.1
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
          icon={BrainCircuit}
          variant="primary"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList 
          className="bg-[#15192B] p-1 rounded-xl"
          style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.02)' }}
        >
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-[#1A1F35] data-[state=active]:text-white text-[#94A3B8] rounded-lg px-4 py-2 transition-all"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-[#1A1F35] data-[state=active]:text-white text-[#94A3B8] rounded-lg px-4 py-2 transition-all"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="ai"
            className="data-[state=active]:bg-[#1A1F35] data-[state=active]:text-white text-[#94A3B8] rounded-lg px-4 py-2 transition-all"
          >
            IA Insights
          </TabsTrigger>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#252B44" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ fill: '#6366F1', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#818CF8' }}
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#252B44" />
                    <XAxis dataKey="dia" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="cirurgias" 
                      fill="#10B981" 
                      radius={[8, 8, 0, 0]}
                    />
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
                  <Tooltip content={<CustomTooltip />} />
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
                <div className="text-3xl font-bold text-white">87.5%</div>
                <Badge 
                  className="mt-2 bg-[#10B981]/20 text-[#10B981] border-none"
                >
                  +5.2% este mês
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tempo Médio Cirurgia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">2h 45m</div>
                <Badge 
                  className="mt-2 bg-[#3B82F6]/20 text-[#3B82F6] border-none"
                >
                  -15 min vs média
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Satisfação Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">4.8/5.0</div>
                <Badge 
                  className="mt-2 bg-[#10B981]/20 text-[#10B981] border-none"
                >
                  Excelente
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <BrainCircuit className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <CardTitle>Insights de Inteligência Artificial</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: '#1A1F35',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)',
                  borderLeft: '4px solid #3B82F6'
                }}
              >
                <div className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="text-lg">💡</span> Oportunidade de Otimização
                </div>
                <p className="text-sm text-[#94A3B8]">
                  O IcarusBrain identificou que aumentar o estoque de produtos de Cardiologia
                  em 15% pode reduzir perdas de vendas em até R$ 12.500/mês.
                </p>
                <Badge className="mt-3 bg-[#3B82F6]/20 text-[#3B82F6] border-none">
                  Confiança: 92%
                </Badge>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{
                  background: '#1A1F35',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)',
                  borderLeft: '4px solid #10B981'
                }}
              >
                <div className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="text-lg">✅</span> Previsão Positiva
                </div>
                <p className="text-sm text-[#94A3B8]">
                  Tendência de crescimento de 18% em cirurgias de Ortopedia
                  para o próximo trimestre baseado em dados históricos.
                </p>
                <Badge className="mt-3 bg-[#10B981]/20 text-[#10B981] border-none">
                  Confiança: 88%
                </Badge>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{
                  background: '#1A1F35',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)',
                  borderLeft: '4px solid #F59E0B'
                }}
              >
                <div className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Atenção Necessária
                </div>
                <p className="text-sm text-[#94A3B8]">
                  3 clientes com alto risco de inadimplência detectados.
                  Recomenda-se contato proativo para negociação.
                </p>
                <Badge className="mt-3 bg-[#F59E0B]/20 text-[#F59E0B] border-none">
                  Confiança: 85%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
