import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  UserX,
  Calendar,
  Brain,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { toast } from 'sonner'

/**
 * Módulo: Analytics de Predição
 * Categoria: Dashboard & Analytics
 * Descrição: Previsões e análises preditivas com ML
 * Design System: Dark Glass Medical
 */

export function AnalyticsPredicaoModule() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('demanda')
  const [modeloAtivo, setModeloAtivo] = useState('prophet')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  // Tabs do carrossel
  const carouselTabs = [
    { id: 'demanda', label: 'Demanda', count: 85, delta: 12, icon: TrendingUp },
    { id: 'inadimplencia', label: 'Inadimplência', count: 24, delta: -3, icon: AlertTriangle },
    { id: 'churn', label: 'Churn', count: 8, delta: -2, icon: UserX },
    { id: 'estoque', label: 'Estoque', count: 42, delta: 5, icon: Package },
  ]

  // Mock data - Previsão de demanda (histórico + previsão)
  const demandaData = [
    { mes: 'Jul', real: 145, previsao: null, lower: null, upper: null },
    { mes: 'Ago', real: 158, previsao: null, lower: null, upper: null },
    { mes: 'Set', real: 142, previsao: null, lower: null, upper: null },
    { mes: 'Out', real: 167, previsao: null, lower: null, upper: null },
    { mes: 'Nov', real: 182, previsao: null, lower: null, upper: null },
    { mes: 'Dez', real: 195, previsao: null, lower: null, upper: null },
    // Previsão
    { mes: 'Jan', real: null, previsao: 205, lower: 190, upper: 220 },
    { mes: 'Fev', real: null, previsao: 212, lower: 195, upper: 229 },
    { mes: 'Mar', real: null, previsao: 218, lower: 198, upper: 238 },
    { mes: 'Abr', real: null, previsao: 225, lower: 203, upper: 247 },
    { mes: 'Mai', real: null, previsao: 235, lower: 210, upper: 260 },
    { mes: 'Jun', real: null, previsao: 242, lower: 215, upper: 269 },
  ]

  // Mock data - Score de inadimplência
  const inadimplenciaData = [
    { mes: 'Jul', score: 0.12 },
    { mes: 'Ago', score: 0.14 },
    { mes: 'Set', score: 0.11 },
    { mes: 'Out', score: 0.15 },
    { mes: 'Nov', score: 0.13 },
    { mes: 'Dez', score: 0.10 },
    // Previsão
    { mes: 'Jan', score: 0.09 },
    { mes: 'Fev', score: 0.08 },
    { mes: 'Mar', score: 0.08 },
  ]

  // Mock data - Alertas preditivos
  const alertas = [
    { 
      tipo: 'Estoque Crítico', 
      produto: 'Stent Coronariano', 
      previsao: '5 dias', 
      severidade: 'alta' 
    },
    { 
      tipo: 'Inadimplência', 
      cliente: 'Hospital São Lucas', 
      probabilidade: '78%', 
      severidade: 'media' 
    },
    { 
      tipo: 'Churn', 
      cliente: 'Clínica Cardiológica', 
      probabilidade: '65%', 
      severidade: 'media' 
    },
    { 
      tipo: 'Demanda Elevada', 
      produto: 'Cateter Guia', 
      previsao: '15 dias', 
      severidade: 'baixa' 
    },
  ]

  const handleReprocessar = () => {
    toast.info('Reprocessando modelo preditivo...')
  }

  const handleExportar = () => {
    toast.success('Exportando previsões...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-500/10 ${
            isDark
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <Brain className="w-7 h-7 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Analytics de Predição</h1>
            <p className={`mt-1 ${textSecondary}`}>Previsões e análises preditivas com ML</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModeloAtivo(modeloAtivo === 'prophet' ? 'arima' : 'prophet')}>
            <Brain className="w-4 h-4 mr-2" />
            {modeloAtivo === 'prophet' ? 'Prophet' : 'ARIMA'}
          </Button>
          <Button variant="secondary" onClick={handleReprocessar}>
            <Calendar className="w-4 h-4 mr-2" />
            Reprocessar
          </Button>
          <Button onClick={handleExportar}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>Acurácia Modelo</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>94.2%</div>
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
              +2.1%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>MAE (Erro Médio)</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>8.5</div>
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
              -1.2
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>Previsões Ativas</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>159</div>
            <Badge className="mt-2 bg-blue-500/20 text-blue-500 border-none">
              +12
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>Alertas Críticos</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>4</div>
            <Badge className="mt-2 bg-red-500/20 text-red-500 border-none">
              +1
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Carrossel */}
      <CadastroTabsCarousel
        tabs={carouselTabs}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demanda">Demanda</TabsTrigger>
          <TabsTrigger value="inadimplencia">Inadimplência</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        {/* Tab Demanda */}
        <TabsContent value="demanda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Demanda - Próximos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={demandaData}>
                  <defs>
                    <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="mes" stroke={textMuted} />
                  <YAxis stroke={textMuted} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <ReferenceLine x="Dez" stroke="#EF4444" strokeDasharray="3 3" label="Hoje" />
                  
                  {/* Intervalo de confiança */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="url(#confidence)"
                    fillOpacity={0.3}
                    name="Limite Superior"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="url(#confidence)"
                    fillOpacity={0.3}
                    name="Limite Inferior"
                  />
                  
                  {/* Dados reais */}
                  <Line 
                    type="monotone" 
                    dataKey="real" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 5 }}
                    name="Realizado"
                  />
                  
                  {/* Previsão */}
                  <Line 
                    type="monotone" 
                    dataKey="previsao" 
                    stroke="#6366F1" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#6366F1', r: 5 }}
                    name="Previsão"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Próximo Mês</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>205 un.</div>
                <div className={`text-sm ${textSecondary} mt-1`}>
                  IC 95%: 190 - 220
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Tendência</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>+5.1%</div>
                <div className={`text-sm ${textSecondary} mt-1`}>
                  Crescimento mensal
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Sazonalidade</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>Detectada</div>
                <div className={`text-sm ${textSecondary} mt-1`}>
                  Pico em Mar/Abr
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Inadimplência */}
        <TabsContent value="inadimplencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score de Inadimplência (ML)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={inadimplenciaData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="mes" stroke={textMuted} />
                  <YAxis stroke={textMuted} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#scoreGradient)"
                    name="Score Inadimplência"
                  />
                  <ReferenceLine y={0.10} stroke="#F59E0B" strokeDasharray="3 3" label="Meta 10%" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes de Alto Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'Hospital São Lucas', score: 0.85, valor: 'R$ 45.200' },
                  { nome: 'Clínica Santa Maria', score: 0.72, valor: 'R$ 28.900' },
                  { nome: 'Hospital Regional', score: 0.68, valor: 'R$ 15.600' },
                ].map((cliente, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>{cliente.nome}</h4>
                        <p className={`text-sm ${textMuted}`}>Valor em aberto: {cliente.valor}</p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-500 border-none">
                        {(cliente.score * 100).toFixed(0)}% risco
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Churn */}
        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Churn - Clientes em Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    nome: 'Clínica Cardiológica', 
                    probabilidade: 0.65, 
                    fatores: ['Sem compras há 45 dias', 'NPS baixo'],
                    valor: 'R$ 125.000/mês'
                  },
                  { 
                    nome: 'Hospital Central', 
                    probabilidade: 0.52, 
                    fatores: ['Reclamações recentes', 'Concorrente ativo'],
                    valor: 'R$ 98.500/mês'
                  },
                ].map((cliente, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>{cliente.nome}</h4>
                        <p className={`text-sm ${textMuted}`}>Receita média: {cliente.valor}</p>
                      </div>
                      <Badge className={`${
                        cliente.probabilidade > 0.6 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-amber-500/20 text-amber-500'
                      } border-none`}>
                        {(cliente.probabilidade * 100).toFixed(0)}% churn
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cliente.fatores.map((fator, i) => (
                        <Badge 
                          key={i}
                          className="bg-slate-500/20 text-slate-400 border-none text-xs"
                        >
                          {fator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Estoque */}
        <TabsContent value="estoque" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Ruptura de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { produto: 'Stent Coronariano', atual: 12, minimo: 20, ruptura: '5 dias' },
                  { produto: 'Cateter Guia', atual: 28, minimo: 30, ruptura: '8 dias' },
                  { produto: 'Balão Angioplastia', atual: 45, minimo: 40, ruptura: '12 dias' },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${textPrimary}`}>{item.produto}</h4>
                        <div className={`text-sm ${textSecondary} mt-1`}>
                          Estoque: {item.atual} un. • Mínimo: {item.minimo} un.
                        </div>
                        {/* Barra de progresso */}
                        <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              item.atual < item.minimo ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(item.atual / item.minimo) * 100}%` }}
                          />
                        </div>
                      </div>
                      <Badge className={`ml-4 ${
                        item.atual < item.minimo 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-amber-500/20 text-amber-500'
                      } border-none`}>
                        {item.ruptura}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertas Preditivos */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Preditivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertas.map((alerta, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  isDark ? 'border-slate-700/50' : 'border-slate-200'
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alerta.severidade === 'alta' ? 'text-red-500' :
                    alerta.severidade === 'media' ? 'text-amber-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <h4 className={`font-semibold ${textPrimary}`}>{alerta.tipo}</h4>
                    <p className={`text-sm ${textMuted}`}>
                      {alerta.produto || alerta.cliente} • 
                      {alerta.previsao ? ` Previsão: ${alerta.previsao}` : ` Probabilidade: ${alerta.probabilidade}`}
                    </p>
                  </div>
                </div>
                <Button size="sm">
                  Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
