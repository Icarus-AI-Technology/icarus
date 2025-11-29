import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { 
  Layout, 
  Grid,
  Share2,
  Settings,
  Plus,
  Download,
  Eye
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { toast } from 'sonner'

/**
 * Módulo: BI Dashboard Interactive
 * Categoria: Dashboard & Analytics
 * Descrição: Dashboards interativos com drag-and-drop
 * Design System: Dark Glass Medical
 */

export function BIDashboardInteractive() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('widgets')
  
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'widgets', label: 'Widgets', count: 24, delta: 4, icon: Grid },
    { id: 'layouts', label: 'Layouts', count: 8, delta: 2, icon: Layout },
    { id: 'compartilhados', label: 'Compartilhados', count: 12, delta: 3, icon: Share2 },
    { id: 'configuracoes', label: 'Config', count: 5, delta: 0, icon: Settings },
  ]

  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Fev', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Abr', value: 450 },
  ]

  const pieData = [
    { name: 'A', value: 40 },
    { name: 'B', value: 30 },
    { name: 'C', value: 20 },
    { name: 'D', value: 10 },
  ]

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/10 ${
            isDark
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <Layout className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>BI Dashboard Interactive</h1>
            <p className={`mt-1 ${textSecondary}`}>Dashboards customizáveis e interativos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Widget
          </Button>
        </div>
      </div>

      <CadastroTabsCarousel
        tabs={carouselTabs}
        active={activeTab}
        onChange={setActiveTab}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="compartilhados">Compartilhados</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="space-y-4">
          {/* Grid de widgets drag-and-drop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Vendas Mensais</span>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none">
                    Ativo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="name" stroke={textMuted} />
                    <YAxis stroke={textMuted} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Distribuição</span>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none">
                    Ativo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Galeria de Widgets Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['KPI Card', 'Gráfico Linha', 'Gráfico Barra', 'Tabela', 'Mapa', 'Gauge', 'Timeline', 'Funil'].map((widget) => (
                  <div
                    key={widget}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50 hover:bg-slate-800/30' : 'border-slate-200 hover:bg-slate-50'
                    } cursor-pointer transition-colors text-center`}
                    onClick={() => toast.info(`Adicionando widget: ${widget}`)}
                  >
                    <Grid className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                    <p className={`text-sm font-medium ${textPrimary}`}>{widget}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layouts Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'Executivo Geral', widgets: 8, atualizado: '2 horas atrás' },
                  { nome: 'Operacional', widgets: 12, atualizado: '1 dia atrás' },
                  { nome: 'Comercial', widgets: 6, atualizado: '3 dias atrás' },
                ].map((layout, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    } flex items-center justify-between`}
                  >
                    <div>
                      <h4 className={`font-semibold ${textPrimary}`}>{layout.nome}</h4>
                      <p className={`text-sm ${textMuted}`}>
                        {layout.widgets} widgets • Atualizado {layout.atualizado}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="secondary">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compartilhados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboards Compartilhados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-center py-12 ${textMuted}`}>
                <Share2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Compartilhe dashboards com sua equipe</p>
                <Button className="mt-4">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Tema Padrão
                  </label>
                  <select className={`w-full p-3 rounded-lg ${
                    isDark ? 'bg-slate-800/70 text-white' : 'bg-slate-100 text-slate-900'
                  } border border-slate-600`}>
                    <option>Dark Glass Medical</option>
                    <option>Light</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Auto-Refresh
                  </label>
                  <select className={`w-full p-3 rounded-lg ${
                    isDark ? 'bg-slate-800/70 text-white' : 'bg-slate-100 text-slate-900'
                  } border border-slate-600`}>
                    <option>Desativado</option>
                    <option>1 minuto</option>
                    <option>5 minutos</option>
                    <option>15 minutos</option>
                  </select>
                </div>
                <Button className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
