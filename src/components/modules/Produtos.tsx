/**
 * ICARUS v5.0 - Módulo de Produtos
 *
 * Exemplo completo de módulo usando o template base.
 * Este módulo demonstra todas as funcionalidades e padrões do ICARUS.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/ui/KPICard'
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
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

// ==========================================
// TYPES
// ==========================================

interface Produto {
  id: string
  nome: string
  codigo: string
  preco: number
  estoque: number
  categoria: string
  status: 'ativo' | 'inativo'
  created_at: string
}

interface AIForecast {
  valores: number[]
  confidence: number
}

// ==========================================
// COMPONENT
// ==========================================

export function Produtos() {
  // ==========================================
  // STATE E HOOKS
  // ==========================================

  const { supabase } = useSupabase()
  const { predict, chat } = useIcarusBrain()

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<string>('')

  // KPIs
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [valorEstoque, setValorEstoque] = useState(0)
  const [produtosAtivos, setProdutosAtivos] = useState(0)
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState(0)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    fetchProdutos()
  }, [])

  // ==========================================
  // DATA FETCHING
  // ==========================================

  async function fetchProdutos() {
    setLoading(true)

    try {
      // Simula dados (substitua por chamada real ao Supabase)
      const mockData: Produto[] = [
        {
          id: '1',
          nome: 'Prótese de Joelho Premium',
          codigo: 'PRO-001',
          preco: 15000,
          estoque: 25,
          categoria: 'Ortopedia',
          status: 'ativo',
          created_at: '2025-01-10',
        },
        {
          id: '2',
          nome: 'Marca-passo Cardíaco',
          codigo: 'CAR-002',
          preco: 28000,
          estoque: 8,
          categoria: 'Cardiologia',
          status: 'ativo',
          created_at: '2025-01-12',
        },
        {
          id: '3',
          nome: 'Kit Cirúrgico Básico',
          codigo: 'CIR-003',
          preco: 3500,
          estoque: 42,
          categoria: 'Cirurgia',
          status: 'ativo',
          created_at: '2025-01-15',
        },
        {
          id: '4',
          nome: 'Lente Intraocular',
          codigo: 'OFT-004',
          preco: 1200,
          estoque: 5,
          categoria: 'Oftalmologia',
          status: 'ativo',
          created_at: '2025-01-18',
        },
        {
          id: '5',
          nome: 'Cateter Venoso Central',
          codigo: 'ANE-005',
          preco: 450,
          estoque: 120,
          categoria: 'Anestesia',
          status: 'ativo',
          created_at: '2025-01-20',
        },
      ]

      setProdutos(mockData)
      calculateKPIs(mockData)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateKPIs(data: Produto[]) {
    setTotalProdutos(data.length)
    setValorEstoque(data.reduce((sum, p) => sum + p.preco * p.estoque, 0))
    setProdutosAtivos(data.filter((p) => p.status === 'ativo').length)
    setProdutosBaixoEstoque(data.filter((p) => p.estoque < 10).length)
  }

  // ==========================================
  // HANDLERS
  // ==========================================

  async function handleCreateProduto() {
    console.log('Abrir modal de criação de produto')
    // Implementar modal de criação
  }

  async function handleEditProduto(id: string) {
    console.log('Editar produto:', id)
    // Implementar modal de edição
  }

  async function handleDeleteProduto(id: string) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      // Simulação (substitua por chamada real)
      setProdutos(produtos.filter((p) => p.id !== id))
      console.log('Produto deletado:', id)
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
    }
  }

  async function handlePreverDemanda(produto: Produto) {
    setAiLoading(true)

    try {
      const forecast = await predict('demanda', {
        produto_id: produto.id,
        dias: 30,
      })

      console.log('Previsão de demanda:', forecast)
      alert(`Previsão para ${produto.nome}: ${JSON.stringify(forecast)}`)
    } catch (error) {
      console.error('Erro ao prever demanda:', error)
      alert('Erro ao processar previsão. Verifique a configuração da API.')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleAIAnalysis() {
    setAiLoading(true)

    try {
      const response = await chat(
        'Analise o estoque de produtos e forneça insights sobre quais itens precisam de reposição e quais têm boa performance.',
        {
          contexto: 'produtos',
        }
      )

      setAiInsights(response.resposta || 'Análise concluída.')
    } catch (error) {
      console.error('Erro ao analisar com IA:', error)
      setAiInsights(
        'Erro ao processar análise. Verifique a configuração da API Anthropic.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const produtosFiltrados = produtos.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'todos' || produto.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // ==========================================
  // RENDER
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* ==========================================
          SEÇÃO 1: KPIs
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Produtos */}
        <KPICard
          title="Total Produtos"
          value={formatNumber(totalProdutos)}
          icon={Package}
          trend={{ value: 8, direction: 'up' }}
          variant="default"
        />

        {/* Valor Estoque */}
        <KPICard
          title="Valor em Estoque"
          value={formatCurrency(valorEstoque)}
          icon={DollarSign}
          trend={{ value: 12.5, direction: 'up' }}
          variant="success"
        />

        {/* Produtos Ativos */}
        <KPICard
          title="Produtos Ativos"
          value={formatNumber(produtosAtivos)}
          icon={TrendingUp}
          variant="default"
        />

        {/* Baixo Estoque */}
        <KPICard
          title="Baixo Estoque"
          value={formatNumber(produtosBaixoEstoque)}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* ==========================================
          SEÇÃO 2: ABAS
          ========================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="list">Lista de Produtos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="ai">IA - Previsões</TabsTrigger>
        </TabsList>

        {/* ABA: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Resumo executivo do estoque de produtos médicos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="neu-soft">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">
                        Produtos por Categoria
                      </h4>
                      <div className="h-48 bg-muted rounded flex items-center justify-center">
                        [Gráfico de Pizza - Categorias]
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="neu-soft">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">
                        Movimentação de Estoque
                      </h4>
                      <div className="h-48 bg-muted rounded flex items-center justify-center">
                        [Gráfico de Linhas - Últimos 30 dias]
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="neu-pressed">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3">Alertas Recentes</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span>Lente Intraocular - estoque crítico (5 unidades)</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>
                          Marca-passo Cardíaco - abaixo do mínimo (8 unidades)
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: Lista */}
        <TabsContent value="list" className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Todos os Produtos</h3>
            <Button onClick={handleCreateProduto}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('todos')
                  }}
                >
                  Limpar Filtros
                </Button>
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
                      <th className="text-left py-3">Código</th>
                      <th className="text-left py-3">Nome</th>
                      <th className="text-left py-3">Categoria</th>
                      <th className="text-right py-3">Preço</th>
                      <th className="text-right py-3">Estoque</th>
                      <th className="text-center py-3">Status</th>
                      <th className="text-center py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          Nenhum produto encontrado
                        </td>
                      </tr>
                    ) : (
                      produtosFiltrados.map((produto) => (
                        <tr
                          key={produto.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3 font-mono text-sm">
                            {produto.codigo}
                          </td>
                          <td className="py-3">{produto.nome}</td>
                          <td className="py-3 text-sm text-gray-600">
                            {produto.categoria}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(produto.preco)}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={
                                produto.estoque < 10
                                  ? 'text-red-600 font-semibold'
                                  : ''
                              }
                            >
                              {produto.estoque}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                produto.status === 'ativo'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {produto.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditProduto(produto.id)}
                                aria-label="Editar produto"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteProduto(produto.id)}
                                aria-label="Deletar produto"
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

        {/* ABA: Relatórios */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📊 Relatório de Movimentações
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📈 Curva ABC de Produtos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📉 Produtos com Baixo Giro
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💰 Análise de Rentabilidade
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

        {/* ABA: IA */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Demanda por IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Selecione um produto para ver a previsão de demanda dos
                  próximos 30 dias.
                </p>

                {/* Lista de produtos para previsão */}
                <div className="space-y-2">
                  {produtos.slice(0, 5).map((produto) => (
                    <Button
                      key={produto.id}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handlePreverDemanda(produto)}
                      disabled={aiLoading}
                    >
                      <span>{produto.nome}</span>
                      <span className="text-gray-500">Prever →</span>
                    </Button>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <Button
                    onClick={handleAIAnalysis}
                    disabled={aiLoading}
                    className="w-full"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>🤖 Análise Geral do Estoque</>
                    )}
                  </Button>
                </div>

                {aiInsights && (
                  <Card className="neu-pressed">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Insights da IA</h4>
                      <p className="text-sm text-gray-700">{aiInsights}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
