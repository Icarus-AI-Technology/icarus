import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { 
  FileBarChart, 
  FileText,
  Calendar,
  Mail,
  Download,
  Plus,
  Play,
  Search
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Módulo: Relatórios Executivos
 * Categoria: Dashboard & Analytics
 * Descrição: Geração e agendamento de relatórios gerenciais
 * Design System: Dark Glass Medical
 */

export function RelatoriosExecutivos() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('templates')
  const [searchQuery, setSearchQuery] = useState('')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'templates', label: 'Templates', count: 15, delta: 3, icon: FileText },
    { id: 'gerados', label: 'Gerados', count: 142, delta: 24, icon: FileBarChart },
    { id: 'agendados', label: 'Agendados', count: 8, delta: 2, icon: Calendar },
    { id: 'distribuicao', label: 'Distribuição', count: 6, delta: 1, icon: Mail },
  ]

  const templatesList = [
    {
      nome: 'Relatório Mensal de Faturamento',
      descricao: 'Visão consolidada do faturamento mensal',
      categoria: 'Financeiro',
      formato: 'PDF',
      execucoes: 12
    },
    {
      nome: 'Performance de Vendas',
      descricao: 'Análise de vendas por período e região',
      categoria: 'Comercial',
      formato: 'Excel',
      execucoes: 24
    },
    {
      nome: 'Indicadores Operacionais',
      descricao: 'KPIs operacionais e logísticos',
      categoria: 'Operacional',
      formato: 'PDF',
      execucoes: 18
    },
  ]

  const relatoriosGerados = [
    {
      nome: 'Faturamento Nov/2025',
      template: 'Relatório Mensal de Faturamento',
      gerado: '15/12/2025 14:30',
      status: 'Concluído',
      tamanho: '2.4 MB'
    },
    {
      nome: 'Vendas Semana 50',
      template: 'Performance de Vendas',
      gerado: '14/12/2025 09:15',
      status: 'Concluído',
      tamanho: '1.8 MB'
    },
  ]

  const handleGerarRelatorio = () => {
    toast.success('Gerando relatório...')
  }

  const handleAgendarRelatorio = () => {
    toast.success('Relatório agendado com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-green-500/10 ${
            isDark
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <FileBarChart className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Relatórios Executivos</h1>
            <p className={`mt-1 ${textSecondary}`}>Geração e distribuição de relatórios gerenciais</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Download em Lote
          </Button>
          <Button onClick={handleGerarRelatorio}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Relatório
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
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="gerados">Gerados</TabsTrigger>
          <TabsTrigger value="agendados">Agendados</TabsTrigger>
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
        </TabsList>

        {/* Tab Templates */}
        <TabsContent value="templates" className="space-y-4">
          {/* Barra de busca */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <Input
                    placeholder="Buscar templates..."
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

          {/* Lista de Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesList.map((template, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm ${textSecondary} mb-4`}>
                    {template.descricao}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-indigo-500/20 text-indigo-500 border-none">
                      {template.categoria}
                    </Badge>
                    <Badge className="bg-slate-500/20 text-slate-400 border-none">
                      {template.formato}
                    </Badge>
                  </div>
                  <div className={`text-sm ${textMuted} mb-4`}>
                    {template.execucoes} execuções
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleGerarRelatorio}>
                      <Play className="w-3 h-3 mr-1" />
                      Gerar
                    </Button>
                    <Button size="sm" variant="secondary">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Gerados */}
        <TabsContent value="gerados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatoriosGerados.map((relatorio, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    } flex items-center justify-between`}
                  >
                    <div className="flex-1">
                      <h4 className={`font-semibold ${textPrimary}`}>{relatorio.nome}</h4>
                      <p className={`text-sm ${textMuted}`}>
                        {relatorio.template} • Gerado em {relatorio.gerado}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none">
                          {relatorio.status}
                        </Badge>
                        <span className={`text-xs ${textMuted}`}>{relatorio.tamanho}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm">
                        <Download className="w-3 h-3 mr-1" />
                        Baixar
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Mail className="w-3 h-3 mr-1" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Agendados */}
        <TabsContent value="agendados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    nome: 'Faturamento Mensal',
                    template: 'Relatório Mensal de Faturamento',
                    frequencia: 'Mensal',
                    proxima: '01/01/2026 08:00',
                    destinatarios: 3
                  },
                  {
                    nome: 'Performance Semanal',
                    template: 'Performance de Vendas',
                    frequencia: 'Semanal',
                    proxima: '30/12/2025 09:00',
                    destinatarios: 5
                  },
                ].map((agendamento, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${textPrimary}`}>{agendamento.nome}</h4>
                        <p className={`text-sm ${textSecondary} mt-1`}>
                          {agendamento.template}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className="bg-blue-500/20 text-blue-500 border-none">
                            {agendamento.frequencia}
                          </Badge>
                          <span className={`text-xs ${textMuted}`}>
                            Próxima: {agendamento.proxima}
                          </span>
                          <span className={`text-xs ${textMuted}`}>
                            {agendamento.destinatarios} destinatários
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4" onClick={handleAgendarRelatorio}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Distribuição */}
        <TabsContent value="distribuicao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listas de Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'Diretoria', emails: 5, relatorios: 12 },
                  { nome: 'Gerência', emails: 12, relatorios: 8 },
                  { nome: 'Comercial', emails: 8, relatorios: 6 },
                ].map((lista, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    } flex items-center justify-between`}
                  >
                    <div>
                      <h4 className={`font-semibold ${textPrimary}`}>{lista.nome}</h4>
                      <p className={`text-sm ${textMuted}`}>
                        {lista.emails} emails • {lista.relatorios} relatórios configurados
                      </p>
                    </div>
                    <Button size="sm" variant="secondary">
                      Gerenciar
                    </Button>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Nova Lista
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
