/**
 * ICARUS v5.0 - Module Template
 *
 * Este é o template base para criar novos módulos do ICARUS.
 * Siga este padrão para garantir consistência em todos os 58 módulos.
 *
 * CHECKLIST DE CRIAÇÃO:
 * ✅ 4-5 KPIs no topo
 * ✅ 3-5 abas de navegação
 * ✅ Integração Supabase
 * ✅ (Opcional) Serviços IA
 * ✅ 100% OraclusX DS compliant
 *
 * COMO USAR:
 * 1. Copie este arquivo para o nome do seu módulo
 * 2. Substitua "ModuleTemplate" pelo nome do módulo
 * 3. Substitua os KPIs com métricas relevantes
 * 4. Customize as abas conforme necessário
 * 5. Implemente a lógica de negócio
 * 6. Teste e documente
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

// ==========================================
// TYPES - Defina suas interfaces aqui
// ==========================================

interface DataItem {
  id: string
  nome: string
  status: string
  created_at: string
  // Adicione campos relevantes
}

// ==========================================
// COMPONENT
// ==========================================

export function ModuleTemplate() {
  // ==========================================
  // 1. STATE E HOOKS
  // ==========================================

  const { supabase } = useSupabase()
  const { predict, chat } = useIcarusBrain()

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<DataItem[]>([])

  // KPI States
  const [kpi1, setKpi1] = useState(0)
  const [kpi2, setKpi2] = useState(0)
  const [kpi3, setKpi3] = useState(0)
  const [kpi4, setKpi4] = useState(0)

  // ==========================================
  // 2. EFFECTS
  // ==========================================

  useEffect(() => {
    fetchData()
  }, [])

  // ==========================================
  // 3. DATA FETCHING
  // ==========================================

  async function fetchData() {
    setLoading(true)

    try {
      // Substitua 'table_name' pelo nome da tabela no Supabase
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setItems(data)
        calculateKPIs(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateKPIs(data: DataItem[]) {
    // Calcule os KPIs baseado nos dados
    setKpi1(data.length)
    setKpi2(data.filter((item) => item.status === 'ativo').length)
    // ... outros cálculos
  }

  // ==========================================
  // 4. HANDLERS
  // ==========================================

  async function handleCreate() {
    // Implementar criação
    console.log('Criar novo item')
  }

  async function handleEdit(id: string) {
    // Implementar edição
    console.log('Editar item:', id)
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from('table_name').delete().eq('id', id)

      if (error) throw error

      // Atualizar lista
      fetchData()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  async function handleAIAnalysis() {
    try {
      const response = await chat('Analise os dados e forneça insights', {
        contexto: 'module_template',
      })

      console.log('Resposta IA:', response)
    } catch (error) {
      console.error('Erro ao analisar com IA:', error)
    }
  }

  // ==========================================
  // 5. RENDER
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse-soft text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* ==========================================
          SEÇÃO 1: KPIs
          Substitua com métricas relevantes do módulo
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(kpi1)}</p>
                <p className="text-xs text-green-600 mt-1">↑ 8 novos este mês</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(kpi2)}
                </p>
                <p className="text-xs text-green-600 mt-1">↑ 12.5%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Em Crescimento</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(kpi3)}</p>
                <p className="text-xs text-gray-600 mt-1">Este mês</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Requer Atenção</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(kpi4)}</p>
                <p className="text-xs text-red-600 mt-1">Ação necessária</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          SEÇÃO 2: ABAS
          Customize conforme necessidade do módulo
          ========================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
        </TabsList>

        {/* ==========================================
            ABA 1: OVERVIEW
            Visão geral com gráficos e estatísticas
            ========================================== */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Dashboard com gráficos e estatísticas principais.
                </p>
                {/* Adicione gráficos aqui (Chart.js, Recharts, etc) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="neu-soft">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Gráfico 1</h4>
                      <div className="h-48 bg-muted rounded flex items-center justify-center">
                        [Gráfico de Barras]
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="neu-soft">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Gráfico 2</h4>
                      <div className="h-48 bg-muted rounded flex items-center justify-center">
                        [Gráfico de Pizza]
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            ABA 2: LISTA
            Lista completa com CRUD
            ========================================== */}
        <TabsContent value="list" className="space-y-4">
          {/* Header com ações */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Todos os Registros</h3>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input placeholder="Buscar..." />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana">Esta Semana</SelectItem>
                    <SelectItem value="mes">Este Mês</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">Limpar Filtros</Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">ID</th>
                      <th className="text-left py-3">Nome</th>
                      <th className="text-left py-3">Status</th>
                      <th className="text-left py-3">Data</th>
                      <th className="text-center py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum registro encontrado
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="py-3">{item.id.slice(0, 8)}</td>
                          <td className="py-3">{item.nome}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                item.status === 'ativo'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3">
                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(item.id)}
                                aria-label="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                aria-label="Deletar"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            ABA 3: RELATÓRIOS
            Relatórios disponíveis para exportação
            ========================================== */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📊 Relatório Geral
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📈 Análise de Tendências
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📉 Relatório Detalhado
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📋 Exportar para Excel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📄 Exportar para PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            ABA 4: IA
            Análises e previsões por IA
            ========================================== */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise por IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Use inteligência artificial para obter insights e previsões.
                </p>

                <Button onClick={handleAIAnalysis} className="w-full">
                  🤖 Analisar com IA
                </Button>

                <Card className="neu-pressed">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Insights Recentes</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Tendência de crescimento identificada</li>
                      <li>• Recomenda-se atenção aos itens críticos</li>
                      <li>• Projeção otimista para próximo trimestre</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
