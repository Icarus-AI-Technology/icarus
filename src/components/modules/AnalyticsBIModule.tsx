import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { 
  Brain, 
  LayoutDashboard, 
  Database, 
  Calendar,
  Play,
  Save,
  Download,
  Plus,
  Search
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
  ResponsiveContainer 
} from 'recharts'
import { toast } from 'sonner'

/**
 * Módulo: Analytics BI
 * Categoria: Dashboard & Analytics
 * Descrição: Business Intelligence com query builder e visualizações customizáveis
 * Design System: Dark Glass Medical
 */

export function AnalyticsBIModule() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboards')
  const [searchQuery, setSearchQuery] = useState('')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  // Tabs do carrossel
  const carouselTabs = [
    { id: 'dashboards', label: 'Dashboards', count: 8, delta: 2, icon: LayoutDashboard },
    { id: 'consultas', label: 'Consultas', count: 24, delta: 5, icon: Search },
    { id: 'datasets', label: 'Datasets', count: 15, delta: 3, icon: Database },
    { id: 'agendamentos', label: 'Agendados', count: 6, delta: 1, icon: Calendar },
  ]

  // Mock data - dashboards
  const mockDashboards = [
    { 
      id: 1, 
      nome: 'Visão Financeira', 
      visualizacoes: 12, 
      atualizacao: '2 horas atrás',
      status: 'ativo'
    },
    { 
      id: 2, 
      nome: 'Performance Cirurgias', 
      visualizacoes: 8, 
      atualizacao: '5 minutos atrás',
      status: 'ativo'
    },
    { 
      id: 3, 
      nome: 'Análise de Estoque', 
      visualizacoes: 15, 
      atualizacao: '1 dia atrás',
      status: 'ativo'
    },
  ]

  // Mock data - consultas salvas
  const mockConsultas = [
    { 
      id: 1, 
      nome: 'Top 10 Produtos', 
      dataset: 'produtos_opme', 
      execucoes: 142,
      ultima: '30 min atrás'
    },
    { 
      id: 2, 
      nome: 'Faturamento por Convênio', 
      dataset: 'financeiro', 
      execucoes: 89,
      ultima: '2 horas atrás'
    },
  ]

  // Mock data - gráfico de exemplo
  const sampleData = [
    { mes: 'Jan', vendas: 42, cirurgias: 28 },
    { mes: 'Fev', vendas: 58, cirurgias: 35 },
    { mes: 'Mar', vendas: 45, cirurgias: 32 },
    { mes: 'Abr', vendas: 68, cirurgias: 41 },
    { mes: 'Mai', vendas: 72, cirurgias: 48 },
    { mes: 'Jun', vendas: 85, cirurgias: 52 },
  ]

  const handleExecutarConsulta = () => {
    toast.info('Executando consulta SQL...')
  }

  const handleSalvarDashboard = () => {
    toast.success('Dashboard salvo com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-500/10 ${
            isDark
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <Brain className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Analytics BI</h1>
            <p className={`mt-1 ${textSecondary}`}>Business Intelligence e análise de dados</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Dashboard
          </Button>
        </div>
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
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
        </TabsList>

        {/* Tab Dashboards */}
        <TabsContent value="dashboards" className="space-y-4">
          {/* Barra de busca */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <Input
                    placeholder="Buscar dashboards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="secondary">
                  Filtrar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Dashboards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDashboards.map((dashboard) => (
              <Card key={dashboard.id} className="hover:shadow-xl transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{dashboard.nome}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-none">
                      {dashboard.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`space-y-2 ${textSecondary}`}>
                    <div className="flex justify-between">
                      <span>Visualizações:</span>
                      <span className="font-semibold">{dashboard.visualizacoes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atualização:</span>
                      <span className="font-semibold">{dashboard.atualizacao}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1">
                      Abrir
                    </Button>
                    <Button size="sm" variant="secondary">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Preview de Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Preview: Visão Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData}>
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
                  <Line type="monotone" dataKey="vendas" stroke="#6366F1" strokeWidth={2} />
                  <Line type="monotone" dataKey="cirurgias" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Consultas */}
        <TabsContent value="consultas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Query Builder SQL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg font-mono text-sm ${
                isDark ? 'bg-slate-900/50' : 'bg-slate-100'
              }`}>
                <div className={textSecondary}>
                  <span className="text-purple-500">SELECT</span>{' '}
                  produto, <span className="text-blue-500">SUM</span>(quantidade){' '}
                  <span className="text-purple-500">AS</span> total
                </div>
                <div className={textSecondary}>
                  <span className="text-purple-500">FROM</span> vendas
                </div>
                <div className={textSecondary}>
                  <span className="text-purple-500">WHERE</span> data{' '}
                  <span className="text-purple-500">BETWEEN</span>{' '}
                  <span className="text-green-500">'2025-01-01'</span>{' '}
                  <span className="text-purple-500">AND</span>{' '}
                  <span className="text-green-500">'2025-06-30'</span>
                </div>
                <div className={textSecondary}>
                  <span className="text-purple-500">GROUP BY</span> produto
                </div>
                <div className={textSecondary}>
                  <span className="text-purple-500">ORDER BY</span> total{' '}
                  <span className="text-purple-500">DESC</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExecutarConsulta}>
                  <Play className="w-4 h-4 mr-2" />
                  Executar
                </Button>
                <Button variant="secondary">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="secondary">
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Consultas Salvas */}
          <Card>
            <CardHeader>
              <CardTitle>Consultas Salvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockConsultas.map((consulta) => (
                  <div 
                    key={consulta.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50 hover:bg-slate-800/30' : 'border-slate-200 hover:bg-slate-50'
                    } cursor-pointer transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>{consulta.nome}</h4>
                        <p className={`text-sm ${textMuted}`}>
                          Dataset: {consulta.dataset} • {consulta.execucoes} execuções
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-500/20 text-slate-400 border-none">
                          {consulta.ultima}
                        </Badge>
                        <Button size="sm">
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Datasets */}
        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datasets Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { nome: 'produtos_opme', registros: 2842, colunas: 28 },
                  { nome: 'cirurgias', registros: 1523, colunas: 45 },
                  { nome: 'financeiro', registros: 8945, colunas: 32 },
                  { nome: 'estoque', registros: 3621, colunas: 24 },
                  { nome: 'convenios', registros: 142, colunas: 18 },
                  { nome: 'fornecedores', registros: 285, colunas: 22 },
                ].map((dataset) => (
                  <Card key={dataset.nome} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <Database className={`w-8 h-8 mb-3 ${textMuted}`} />
                      <h4 className={`font-semibold ${textPrimary} mb-2`}>{dataset.nome}</h4>
                      <div className={`text-sm ${textSecondary} space-y-1`}>
                        <div>Registros: {dataset.registros.toLocaleString('pt-BR')}</div>
                        <div>Colunas: {dataset.colunas}</div>
                      </div>
                      <Button size="sm" className="w-full mt-4">
                        Explorar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Agendamentos */}
        <TabsContent value="agendamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'Faturamento Mensal', frequencia: 'Mensal', proxima: '01/01/2026', ativo: true },
                  { nome: 'Performance Semanal', frequencia: 'Semanal', proxima: '30/12/2025', ativo: true },
                  { nome: 'Estoque Crítico', frequencia: 'Diário', proxima: '30/12/2025', ativo: true },
                ].map((agendamento, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>{agendamento.nome}</h4>
                        <p className={`text-sm ${textMuted}`}>
                          {agendamento.frequencia} • Próxima: {agendamento.proxima}
                        </p>
                      </div>
                      <Badge className={`${
                        agendamento.ativo 
                          ? 'bg-emerald-500/20 text-emerald-500' 
                          : 'bg-slate-500/20 text-slate-400'
                      } border-none`}>
                        {agendamento.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
