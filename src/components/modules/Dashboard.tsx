import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KPICard } from '@/components/ui/KPICard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import { useDashboardKPIs, useDashboardStats } from '@/hooks/queries/useDashboardData'
import { useTheme } from '@/hooks/useTheme'
import { useDashboardRealtime } from '@/hooks/useRealtimeSubscription'
import {
  Calendar, DollarSign, AlertCircle, BrainCircuit,
  TrendingUp, Clock, Star, Activity, BarChart2, PieChart as PieChartIcon
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Custom tooltip style for charts
const CustomTooltip = ({ active, payload, label, isDark = true }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; isDark?: boolean }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className={`px-4 py-3 rounded-xl ${
          isDark 
            ? 'bg-[#1A1F35] text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
            : 'bg-white text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.15)]'
        }`}
      >
        <p className={`text-sm font-medium ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>{label}</p>
        <p className="text-lg font-bold">
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
  const { isDark } = useTheme()
  
  // React Query hooks for data fetching
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  
  // Enable real-time updates for dashboard data
  useDashboardRealtime()

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

  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const chartGridColor = isDark ? '#252B44' : '#E2E8F0'
  const chartLabelColor = isDark ? '#64748B' : '#64748B'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`} data-testid="dashboard-heading">Dashboard</h1>
        <p className={textSecondary}>
          Visão geral do sistema ICARUS v5.0
        </p>
      </div>

      {/* KPIs - Dark neumorphic cards with colored icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cirurgias Hoje - Calendar (Cyan) */}
        <KPICard
          title="Cirurgias Hoje"
          value={kpis?.surgeriesToday || 0}
          icon={Calendar}
          iconColor="#2DD4BF"
          trend={{
            value: Math.abs(kpis?.surgeriesChange || 0),
            direction: (kpis?.surgeriesChange || 0) > 0 ? 'up' : (kpis?.surgeriesChange || 0) < 0 ? 'down' : 'stable'
          }}
        />

        {/* Estoque Crítico - AlertCircle (Red) */}
        <KPICard
          title="Estoque Crítico"
          value={kpis?.criticalStock || 0}
          icon={AlertCircle}
          iconColor="#EF4444"
        />

        {/* Faturamento - DollarSign (Green) */}
        <KPICard
          title="Faturamento"
          value={formatCurrency(kpis?.revenue || 0)}
          icon={DollarSign}
          iconColor="#10B981"
          trend={{
            value: kpis?.revenueChange || 0,
            direction: 'up'
          }}
        />

        {/* IA Status - BrainCircuit (Purple) */}
        <KPICard
          title="IcarusBrain"
          value={(kpis?.aiStatus || 'offline') === 'online' ? 'Online' : 'Offline'}
          icon={BrainCircuit}
          iconColor="#8B5CF6"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList 
          className={`${inputBg} p-1 rounded-xl ${
            isDark 
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}
        >
          <TabsTrigger 
            value="overview" 
            className={`data-[state=active]:bg-[${isDark ? '#1A1F35' : '#FFFFFF'}] data-[state=active]:text-${isDark ? 'white' : 'slate-900'} ${textSecondary} rounded-lg px-4 py-2 transition-all`}
          >
            <BarChart2 className="w-4 h-4 mr-2 text-[#6366F1]" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className={`data-[state=active]:bg-[${isDark ? '#1A1F35' : '#FFFFFF'}] data-[state=active]:text-${isDark ? 'white' : 'slate-900'} ${textSecondary} rounded-lg px-4 py-2 transition-all`}
          >
            <Activity className="w-4 h-4 mr-2 text-[#10B981]" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="ai"
            className={`data-[state=active]:bg-[${isDark ? '#1A1F35' : '#FFFFFF'}] data-[state=active]:text-${isDark ? 'white' : 'slate-900'} ${textSecondary} rounded-lg px-4 py-2 transition-all`}
          >
            <BrainCircuit className="w-4 h-4 mr-2 text-[#8B5CF6]" />
            IA Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#6366F1]" />
                  Faturamento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="month" stroke={chartLabelColor} fontSize={12} />
                    <YAxis stroke={chartLabelColor} fontSize={12} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
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
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#10B981]" />
                  Cirurgias da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={surgeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="dia" stroke={chartLabelColor} fontSize={12} />
                    <YAxis stroke={chartLabelColor} fontSize={12} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
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
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#F59E0B]" />
                Distribuição por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name || ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversion Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.02)]'
                        : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                  </div>
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${textPrimary}`}>87.5%</div>
                <Badge 
                  className="mt-2 bg-[#10B981]/20 text-[#10B981] border-none"
                >
                  +5.2% este mês
                </Badge>
              </CardContent>
            </Card>

            {/* Surgery Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.02)]'
                        : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[#3B82F6]" strokeWidth={2.5} />
                  </div>
                  Tempo Médio Cirurgia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${textPrimary}`}>2h 45m</div>
                <Badge 
                  className="mt-2 bg-[#3B82F6]/20 text-[#3B82F6] border-none"
                >
                  -15 min vs média
                </Badge>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.02)]'
                        : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
                    }`}
                  >
                    <Star className="w-4 h-4 text-[#F59E0B]" strokeWidth={2.5} />
                  </div>
                  Satisfação Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${textPrimary}`}>4.8/5.0</div>
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-500 shadow-[0_4px_15px_rgba(99,102,241,0.4)]"
                >
                  <BrainCircuit className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <CardTitle>Insights de Inteligência Artificial</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Insight 1 - Optimization */}
              <div 
                className={`p-4 rounded-xl border-l-4 border-l-blue-500 ${
                  isDark 
                    ? 'bg-[#1A1F35] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                    : 'bg-slate-50 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                  <Activity className="w-5 h-5 text-[#3B82F6]" />
                  Oportunidade de Otimização
                </div>
                <p className={`text-sm ${textSecondary}`}>
                  O IcarusBrain identificou que aumentar o estoque de produtos de Cardiologia
                  em 15% pode reduzir perdas de vendas em até R$ 12.500/mês.
                </p>
                <Badge className="mt-3 bg-[#3B82F6]/20 text-[#3B82F6] border-none">
                  Confiança: 92%
                </Badge>
              </div>

              {/* AI Insight 2 - Positive Forecast */}
              <div 
                className={`p-4 rounded-xl border-l-4 border-l-emerald-500 ${
                  isDark 
                    ? 'bg-[#1A1F35] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                    : 'bg-slate-50 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  Previsão Positiva
                </div>
                <p className={`text-sm ${textSecondary}`}>
                  Tendência de crescimento de 18% em cirurgias de Ortopedia
                  para o próximo trimestre baseado em dados históricos.
                </p>
                <Badge className="mt-3 bg-[#10B981]/20 text-[#10B981] border-none">
                  Confiança: 88%
                </Badge>
              </div>

              {/* AI Insight 3 - Attention Needed */}
              <div 
                className={`p-4 rounded-xl border-l-4 border-l-amber-500 ${
                  isDark 
                    ? 'bg-[#1A1F35] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                    : 'bg-slate-50 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                  <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                  Atenção Necessária
                </div>
                <p className={`text-sm ${textSecondary}`}>
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
