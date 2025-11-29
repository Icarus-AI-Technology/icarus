import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { KPICard } from '@/components/ui/KPICard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import { useEstoque } from '@/hooks/useEstoque'
import { toast } from 'sonner'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  TrendingUp,
  Brain,
  ArrowUpDown,
  BarChart3,
  RefreshCw,
  X,
  Boxes,
  MapPin,
  Activity
} from 'lucide-react'
import { InteractiveChart } from '@/components/charts/InteractiveCharts'

// Componente de carrossel de tabs
import CadastroTabsCarousel, { CarouselTab } from '@/components/cadastros/CadastroTabsCarousel'

/**
 * Módulo: Estoque IA (#19)
 * Categoria: Estoque & Consignação
 * Design System: Dark Glass Medical (Neumorphism 3D)
 * 
 * Sub-Módulos:
 * - Produtos
 * - Movimentações
 * - Previsão de Demanda (IA)
 * - Ponto de Pedido
 * - Inventário
 * 
 * Formulários:
 * 1. Cadastrar/Editar Produto
 * 2. Registrar Movimentação (Entrada/Saída)
 * 3. Configurar Ponto de Pedido
 * 
 * IA/ML:
 * - Previsão de Demanda (ARIMA + Prophet)
 * - Ponto de Pedido Inteligente
 * - Detecção de Anomalias
 * - Sugestão de Compra
 */

// Types
interface Produto {
  id: string
  codigo: string
  nome: string
  categoria: string
  grupo: string
  fabricante: string
  registro_anvisa: string
  estoque_atual: number
  estoque_minimo: number
  estoque_maximo: number
  ponto_pedido: number
  preco_custo: number
  preco_venda: number
  localizacao: string
  status: 'normal' | 'baixo' | 'critico' | 'excesso'
}

interface Movimentacao {
  id: string
  produto_id: string
  produto_nome: string
  tipo: 'entrada' | 'saida'
  quantidade: number
  motivo: string
  documento?: string
  data: string
  usuario: string
}

// Mock data
const mockProdutos: Produto[] = [
  {
    id: '1',
    codigo: 'OPME-001',
    nome: 'Prótese de Quadril Zimmer',
    categoria: 'Ortopedia',
    grupo: 'Próteses',
    fabricante: 'Zimmer Biomet',
    registro_anvisa: '80102710045',
    estoque_atual: 15,
    estoque_minimo: 10,
    estoque_maximo: 50,
    ponto_pedido: 15,
    preco_custo: 8500,
    preco_venda: 12500,
    localizacao: 'A1-01',
    status: 'normal',
  },
  {
    id: '2',
    codigo: 'OPME-002',
    nome: 'Parafusos Pediculares 6.5mm',
    categoria: 'Coluna',
    grupo: 'Fixadores',
    fabricante: 'Synthes',
    registro_anvisa: '80102710046',
    estoque_atual: 5,
    estoque_minimo: 20,
    estoque_maximo: 100,
    ponto_pedido: 30,
    preco_custo: 450,
    preco_venda: 750,
    localizacao: 'B2-03',
    status: 'critico',
  },
  {
    id: '3',
    codigo: 'OPME-003',
    nome: 'Âncoras de Sutura 5.5mm',
    categoria: 'Artroscopia',
    grupo: 'Suturas',
    fabricante: 'Arthrex',
    registro_anvisa: '80102710047',
    estoque_atual: 45,
    estoque_minimo: 15,
    estoque_maximo: 60,
    ponto_pedido: 20,
    preco_custo: 380,
    preco_venda: 620,
    localizacao: 'C3-02',
    status: 'normal',
  },
  {
    id: '4',
    codigo: 'OPME-004',
    nome: 'Stent Coronário DES',
    categoria: 'Cardiologia',
    grupo: 'Stents',
    fabricante: 'Medtronic',
    registro_anvisa: '80102710048',
    estoque_atual: 8,
    estoque_minimo: 10,
    estoque_maximo: 30,
    ponto_pedido: 12,
    preco_custo: 4200,
    preco_venda: 6800,
    localizacao: 'D1-01',
    status: 'baixo',
  },
]

const mockMovimentacoes: Movimentacao[] = [
  {
    id: '1',
    produto_id: '1',
    produto_nome: 'Prótese de Quadril Zimmer',
    tipo: 'saida',
    quantidade: 2,
    motivo: 'Cirurgia - Paciente João Silva',
    documento: 'CIR-2025-001',
    data: '2025-11-28',
    usuario: 'Maria Santos',
  },
  {
    id: '2',
    produto_id: '2',
    produto_nome: 'Parafusos Pediculares 6.5mm',
    tipo: 'entrada',
    quantidade: 50,
    motivo: 'Compra - NF 12345',
    documento: 'NF-12345',
    data: '2025-11-27',
    usuario: 'Carlos Lima',
  },
]

const mockPrevisaoDemanda = [
  { mes: 'Dez', previsto: 45, real: 42 },
  { mes: 'Jan', previsto: 52, real: null },
  { mes: 'Fev', previsto: 48, real: null },
  { mes: 'Mar', previsto: 55, real: null },
]

const mockCategorias = [
  { id: '1', nome: 'Ortopedia' },
  { id: '2', nome: 'Coluna' },
  { id: '3', nome: 'Artroscopia' },
  { id: '4', nome: 'Cardiologia' },
  { id: '5', nome: 'Neurologia' },
]

const mockGrupos = [
  { id: '1', nome: 'Próteses' },
  { id: '2', nome: 'Fixadores' },
  { id: '3', nome: 'Suturas' },
  { id: '4', nome: 'Stents' },
  { id: '5', nome: 'Implantes' },
]

export function EstoqueIAModule() {
  const { isDark } = useTheme()
  const { data: produtosData } = useEstoque()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('produtos')
  const [isProdutoOpen, setIsProdutoOpen] = useState(false)
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false)
  const [isPontoPedidoOpen, setIsPontoPedidoOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  
  // Form state - Produto
  const [formProduto, setFormProduto] = useState({
    codigo: '',
    nome: '',
    categoria: '',
    grupo: '',
    fabricante: '',
    registro_anvisa: '',
    estoque_minimo: '',
    estoque_maximo: '',
    ponto_pedido: '',
    preco_custo: '',
    preco_venda: '',
    localizacao: '',
  })
  
  // Form state - Movimentação
  const [formMovimentacao, setFormMovimentacao] = useState({
    produto_id: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: '',
    motivo: '',
    documento: '',
  })
  
  // Form state - Ponto de Pedido
  const [formPontoPedido, setFormPontoPedido] = useState({
    estoque_minimo: '',
    estoque_maximo: '',
    ponto_pedido: '',
    usar_ia: true,
  })

  // Use mock data if Supabase data is not available
  const produtos = (produtosData as Produto[] | undefined) || mockProdutos

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'
  const cardBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-50'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const chartGridColor = isDark ? '#252B44' : '#E2E8F0'

  // Handlers
  const handleSaveProduto = useCallback(() => {
    if (!formProduto.codigo || !formProduto.nome || !formProduto.categoria) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    
    toast.success(selectedProduto ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!')
    setIsProdutoOpen(false)
    setSelectedProduto(null)
    setFormProduto({
      codigo: '',
      nome: '',
      categoria: '',
      grupo: '',
      fabricante: '',
      registro_anvisa: '',
      estoque_minimo: '',
      estoque_maximo: '',
      ponto_pedido: '',
      preco_custo: '',
      preco_venda: '',
      localizacao: '',
    })
  }, [formProduto, selectedProduto])

  const handleSaveMovimentacao = useCallback(() => {
    if (!formMovimentacao.produto_id || !formMovimentacao.quantidade || !formMovimentacao.motivo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    
    toast.success(`${formMovimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`)
    setIsMovimentacaoOpen(false)
    setFormMovimentacao({
      produto_id: '',
      tipo: 'entrada',
      quantidade: '',
      motivo: '',
      documento: '',
    })
  }, [formMovimentacao])

  const handleSavePontoPedido = useCallback(() => {
    if (!selectedProduto) return
    
    toast.success('Ponto de pedido configurado com sucesso!')
    setIsPontoPedidoOpen(false)
    setSelectedProduto(null)
  }, [selectedProduto])

  const openEditProduto = (produto: Produto) => {
    setSelectedProduto(produto)
    setFormProduto({
      codigo: produto.codigo,
      nome: produto.nome,
      categoria: produto.categoria,
      grupo: produto.grupo,
      fabricante: produto.fabricante,
      registro_anvisa: produto.registro_anvisa,
      estoque_minimo: String(produto.estoque_minimo),
      estoque_maximo: String(produto.estoque_maximo),
      ponto_pedido: String(produto.ponto_pedido),
      preco_custo: String(produto.preco_custo),
      preco_venda: String(produto.preco_venda),
      localizacao: produto.localizacao,
    })
    setIsProdutoOpen(true)
  }

  const openPontoPedido = (produto: Produto) => {
    setSelectedProduto(produto)
    setFormPontoPedido({
      estoque_minimo: String(produto.estoque_minimo),
      estoque_maximo: String(produto.estoque_maximo),
      ponto_pedido: String(produto.ponto_pedido),
      usar_ia: true,
    })
    setIsPontoPedidoOpen(true)
  }

  // Filter produtos
  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const stats = {
    totalProdutos: produtos.length,
    estoqueCritico: produtos.filter(p => p.status === 'critico').length,
    estoqueBaixo: produtos.filter(p => p.status === 'baixo').length,
    valorEstoque: produtos.reduce((acc, p) => acc + (p.estoque_atual * p.preco_custo), 0),
  }

  const getStatusBadge = (status: Produto['status']) => {
    const statusConfig = {
      normal: { color: 'bg-[#10B981]/20 text-[#10B981]', label: 'Normal' },
      baixo: { color: 'bg-[#8b5cf6]/20 text-[#8b5cf6]', label: 'Baixo' },
      critico: { color: 'bg-[#EF4444]/20 text-[#EF4444]', label: 'Crítico' },
      excesso: { color: 'bg-[#3B82F6]/20 text-[#3B82F6]', label: 'Excesso' },
    }
    const config = statusConfig[status]
    return <Badge className={`${config.color} border-none`}>{config.label}</Badge>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-[#1A1F35] text-white' : 'bg-white text-slate-900'} shadow-lg`}>
          <p className={`text-sm font-medium ${textSecondary}`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-lg font-bold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-violet-500/10 ${
              isDark
                ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
                : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
            }`}
          >
            <Brain className="w-7 h-7 text-violet-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Estoque IA</h1>
            <p className={`mt-1 ${textSecondary}`}>Gestão inteligente de estoque com IA preditiva</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsMovimentacaoOpen(true)}>
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Movimentação
          </Button>
          <Button onClick={() => { setSelectedProduto(null); setIsProdutoOpen(true) }}>
            <Plus className="w-4 h-4 mr-1" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Carrossel de Categorias de Estoque */}
      <CadastroTabsCarousel
        tabs={[
          { id: 'todos', label: 'Todos Produtos', count: stats.totalProdutos, delta: 47, icon: Package },
          { id: 'critico', label: 'Estoque Crítico', count: stats.estoqueCritico, icon: AlertTriangle },
          { id: 'baixo', label: 'Estoque Baixo', count: stats.estoqueBaixo, delta: 5, icon: TrendingUp },
          { id: 'normal', label: 'Estoque Normal', count: produtos.filter(p => p.status === 'normal').length, icon: Boxes },
          { id: 'consignado', label: 'Consignados', count: 45, delta: 3, icon: MapPin },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Produtos"
          value={stats.totalProdutos}
          icon={Package}
          iconColor="#8B5CF6"
        />
        <KPICard
          title="Estoque Crítico"
          value={stats.estoqueCritico}
          icon={AlertTriangle}
          iconColor="#EF4444"
        />
        <KPICard
          title="Estoque Baixo"
          value={stats.estoqueBaixo}
          icon={TrendingUp}
          iconColor="#8b5cf6"
        />
        <KPICard
          title="Valor em Estoque"
          value={formatCurrency(stats.valorEstoque)}
          icon={Activity}
          iconColor="#10B981"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="produtos" className="rounded-lg px-4 py-2">
            <Boxes className="w-4 h-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="movimentacoes" className="rounded-lg px-4 py-2">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Movimentações
          </TabsTrigger>
          <TabsTrigger value="previsao" className="rounded-lg px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            Previsão IA
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <Input
                  placeholder="Buscar por nome, código ou categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="secondary">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Tab */}
        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#8B5CF6]" />
                Produtos OPME
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Código</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Produto</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Categoria</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Estoque</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Status</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Localização</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProdutos.map((produto) => (
                      <tr
                        key={produto.id}
                        className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5 transition-colors`}
                      >
                        <td className={`py-3 px-4 ${textPrimary} font-mono text-sm`}>{produto.codigo}</td>
                        <td className={`py-3 px-4`}>
                          <div className={textPrimary}>{produto.nome}</div>
                          <div className={`text-xs ${textMuted}`}>{produto.fabricante}</div>
                        </td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{produto.categoria}</td>
                        <td className={`py-3 px-4`}>
                          <div className={textPrimary}>{produto.estoque_atual} un</div>
                          <div className={`text-xs ${textMuted}`}>Min: {produto.estoque_minimo}</div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(produto.status)}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {produto.localizacao}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditProduto(produto)}>
                              Editar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openPontoPedido(produto)}>
                              <Brain className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movimentações Tab */}
        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-[#3B82F6]" />
                Histórico de Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMovimentacoes.map((mov) => (
                  <div
                    key={mov.id}
                    className={`p-4 rounded-xl ${cardBg} ${
                      isDark
                        ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                        : 'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          mov.tipo === 'entrada' ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
                        }`}>
                          {mov.tipo === 'entrada' ? (
                            <TrendingUp className={`w-5 h-5 ${mov.tipo === 'entrada' ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-[#EF4444] rotate-180" />
                          )}
                        </div>
                        <div>
                          <div className={textPrimary}>{mov.produto_nome}</div>
                          <div className={`text-sm ${textMuted}`}>{mov.motivo}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${mov.tipo === 'entrada' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade} un
                        </div>
                        <div className={`text-sm ${textMuted}`}>{mov.data}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Previsão IA Tab */}
        <TabsContent value="previsao" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Previsão de Demanda com Drill-Down */}
            <InteractiveChart
              title="Previsão de Demanda (IA)"
              subtitle="Prophet + LightGBM - Acurácia 95%"
              type="area"
              data={mockPrevisaoDemanda}
              dataKey="previsto"
              xAxisKey="mes"
              showTrend
              enableDrillDown
              drillDownLevels={[
                {
                  name: 'Por Categoria',
                  data: [
                    { mes: 'Cardíaco', previsto: 450 },
                    { mes: 'Vascular', previsto: 320 },
                    { mes: 'Ortopédico', previsto: 180 },
                  ]
                },
                {
                  name: 'Por Produto',
                  data: [
                    { mes: 'Stent Abbott', previsto: 150 },
                    { mes: 'Cateter Medtronic', previsto: 120 },
                    { mes: 'Marcapasso Boston', previsto: 100 },
                  ]
                }
              ]}
              onExport={() => console.log('Exportar previsão')}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#10B981]" />
                  Sugestões de Compra (IA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {produtos.filter(p => p.status === 'critico' || p.status === 'baixo').map((produto) => (
                    <div
                      key={produto.id}
                      className={`p-4 rounded-xl ${cardBg} border-l-4 ${
                        produto.status === 'critico' ? 'border-l-[#EF4444]' : 'border-l-[#8b5cf6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={textPrimary}>{produto.nome}</div>
                          <div className={`text-sm ${textMuted}`}>
                            Estoque: {produto.estoque_atual} | Mínimo: {produto.estoque_minimo}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6] border-none">
                            Sugestão: +{produto.ponto_pedido - produto.estoque_atual} un
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Cadastrar/Editar Produto */}
      <Dialog open={isProdutoOpen} onOpenChange={setIsProdutoOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8B5CF6]" />
              {selectedProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do produto OPME
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  placeholder="OPME-001"
                  value={formProduto.codigo}
                  onChange={(e) => setFormProduto({ ...formProduto, codigo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registro_anvisa">Registro ANVISA</Label>
                <Input
                  id="registro_anvisa"
                  placeholder="80102710045"
                  value={formProduto.registro_anvisa}
                  onChange={(e) => setFormProduto({ ...formProduto, registro_anvisa: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input
                id="nome"
                placeholder="Nome completo do produto"
                value={formProduto.nome}
                onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formProduto.categoria}
                  onValueChange={(value) => setFormProduto({ ...formProduto, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo</Label>
                <Select
                  value={formProduto.grupo}
                  onValueChange={(value) => setFormProduto({ ...formProduto, grupo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGrupos.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.nome}>{grupo.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fabricante">Fabricante</Label>
                <Input
                  id="fabricante"
                  placeholder="Nome do fabricante"
                  value={formProduto.fabricante}
                  onChange={(e) => setFormProduto({ ...formProduto, fabricante: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  placeholder="A1-01"
                  value={formProduto.localizacao}
                  onChange={(e) => setFormProduto({ ...formProduto, localizacao: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  placeholder="10"
                  value={formProduto.estoque_minimo}
                  onChange={(e) => setFormProduto({ ...formProduto, estoque_minimo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque_maximo">Estoque Máximo</Label>
                <Input
                  id="estoque_maximo"
                  type="number"
                  placeholder="100"
                  value={formProduto.estoque_maximo}
                  onChange={(e) => setFormProduto({ ...formProduto, estoque_maximo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ponto_pedido">Ponto de Pedido</Label>
                <Input
                  id="ponto_pedido"
                  type="number"
                  placeholder="20"
                  value={formProduto.ponto_pedido}
                  onChange={(e) => setFormProduto({ ...formProduto, ponto_pedido: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
                <Input
                  id="preco_custo"
                  type="number"
                  placeholder="0,00"
                  value={formProduto.preco_custo}
                  onChange={(e) => setFormProduto({ ...formProduto, preco_custo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_venda">Preço de Venda (R$)</Label>
                <Input
                  id="preco_venda"
                  type="number"
                  placeholder="0,00"
                  value={formProduto.preco_venda}
                  onChange={(e) => setFormProduto({ ...formProduto, preco_venda: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsProdutoOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleSaveProduto}>
              <Package className="w-4 h-4 mr-1" />
              {selectedProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Registrar Movimentação */}
      <Dialog open={isMovimentacaoOpen} onOpenChange={setIsMovimentacaoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-[#3B82F6]" />
              Registrar Movimentação
            </DialogTitle>
            <DialogDescription>
              Registre uma entrada ou saída de estoque
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_mov">Tipo de Movimentação *</Label>
              <Select
                value={formMovimentacao.tipo}
                onValueChange={(value: 'entrada' | 'saida') => setFormMovimentacao({ ...formMovimentacao, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="produto_mov">Produto *</Label>
              <Select
                value={formMovimentacao.produto_id}
                onValueChange={(value) => setFormMovimentacao({ ...formMovimentacao, produto_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.codigo} - {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade_mov">Quantidade *</Label>
              <Input
                id="quantidade_mov"
                type="number"
                placeholder="0"
                value={formMovimentacao.quantidade}
                onChange={(e) => setFormMovimentacao({ ...formMovimentacao, quantidade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo_mov">Motivo *</Label>
              <Textarea
                id="motivo_mov"
                placeholder="Descreva o motivo da movimentação..."
                value={formMovimentacao.motivo}
                onChange={(e) => setFormMovimentacao({ ...formMovimentacao, motivo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento_mov">Documento (opcional)</Label>
              <Input
                id="documento_mov"
                placeholder="NF-12345 ou CIR-2025-001"
                value={formMovimentacao.documento}
                onChange={(e) => setFormMovimentacao({ ...formMovimentacao, documento: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsMovimentacaoOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleSaveMovimentacao}>
              <ArrowUpDown className="w-4 h-4 mr-1" />
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Configurar Ponto de Pedido */}
      <Dialog open={isPontoPedidoOpen} onOpenChange={setIsPontoPedidoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#8B5CF6]" />
              Configurar Ponto de Pedido
            </DialogTitle>
            <DialogDescription>
              {selectedProduto && `Produto: ${selectedProduto.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className={`p-4 rounded-xl ${cardBg} border-l-4 border-l-[#8B5CF6]`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-[#8B5CF6]" />
                <span className={`font-medium ${textPrimary}`}>Sugestão da IA</span>
              </div>
              <p className={`text-sm ${textSecondary}`}>
                Baseado no histórico de vendas e sazonalidade, a IA sugere um ponto de pedido de <strong>25 unidades</strong> para este produto.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="usar_ia"
                checked={formPontoPedido.usar_ia}
                onChange={(e) => setFormPontoPedido({ ...formPontoPedido, usar_ia: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="usar_ia" className={textSecondary}>
                Usar cálculo automático da IA (recomendado)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estoque_min_pp">Estoque Mínimo</Label>
                <Input
                  id="estoque_min_pp"
                  type="number"
                  value={formPontoPedido.estoque_minimo}
                  onChange={(e) => setFormPontoPedido({ ...formPontoPedido, estoque_minimo: e.target.value })}
                  disabled={formPontoPedido.usar_ia}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque_max_pp">Estoque Máximo</Label>
                <Input
                  id="estoque_max_pp"
                  type="number"
                  value={formPontoPedido.estoque_maximo}
                  onChange={(e) => setFormPontoPedido({ ...formPontoPedido, estoque_maximo: e.target.value })}
                  disabled={formPontoPedido.usar_ia}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ponto_pedido_pp">Ponto de Pedido</Label>
                <Input
                  id="ponto_pedido_pp"
                  type="number"
                  value={formPontoPedido.ponto_pedido}
                  onChange={(e) => setFormPontoPedido({ ...formPontoPedido, ponto_pedido: e.target.value })}
                  disabled={formPontoPedido.usar_ia}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPontoPedidoOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleSavePontoPedido}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
