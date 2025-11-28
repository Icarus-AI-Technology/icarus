/**
 * ICARUS v5.0 - Manufatura Leve com MRP Integrado
 * 
 * Módulo para gestão de manufatura leve e MRP (Material Requirements Planning)
 * focado em montagem de kits cirúrgicos OPME.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'
import {
  Factory, Package, Cog, Calendar, TrendingUp, AlertTriangle,
  Plus, Search, Filter, Play, Pause, CheckCircle, Clock,
  BarChart2, Layers, Box, Truck, BrainCircuit, RefreshCw,
  ListChecks, Settings, FileText, ArrowRight
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

// ============ TIPOS ============

interface OrdemProducao {
  id: string
  codigo: string
  produto: string
  quantidade: number
  quantidadeProduzida: number
  status: 'planejada' | 'em_producao' | 'pausada' | 'finalizada' | 'cancelada'
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  dataInicio: string
  dataPrevisao: string
  dataConclusao?: string
  responsavel: string
  centro_custo: string
  observacoes?: string
}

interface ComponenteMRP {
  id: string
  codigo: string
  nome: string
  tipo: 'materia_prima' | 'componente' | 'embalagem'
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number
  leadTime: number // dias
  fornecedor: string
  custoUnitario: number
  demandaPrevista: number
  necessidadeLiquida: number
  sugestaoCompra: number
}

interface SimulacaoMRP {
  id: string
  nome: string
  dataCriacao: string
  cenario: string
  periodos: number
  resultado: {
    custoTotal: number
    itensComprar: number
    alertasEstoque: number
  }
}

// ============ DADOS MOCK ============

const ordensProducaoMock: OrdemProducao[] = [
  {
    id: '1',
    codigo: 'OP-2025-001',
    produto: 'Kit Artroscopia Joelho Completo',
    quantidade: 50,
    quantidadeProduzida: 35,
    status: 'em_producao',
    prioridade: 'alta',
    dataInicio: '2025-11-25',
    dataPrevisao: '2025-11-30',
    responsavel: 'Carlos Silva',
    centro_custo: 'Montagem A'
  },
  {
    id: '2',
    codigo: 'OP-2025-002',
    produto: 'Kit Prótese Quadril Cimentada',
    quantidade: 30,
    quantidadeProduzida: 30,
    status: 'finalizada',
    prioridade: 'media',
    dataInicio: '2025-11-20',
    dataPrevisao: '2025-11-27',
    dataConclusao: '2025-11-26',
    responsavel: 'Maria Santos',
    centro_custo: 'Montagem B'
  },
  {
    id: '3',
    codigo: 'OP-2025-003',
    produto: 'Kit Coluna Cervical',
    quantidade: 20,
    quantidadeProduzida: 0,
    status: 'planejada',
    prioridade: 'urgente',
    dataInicio: '2025-11-29',
    dataPrevisao: '2025-12-05',
    responsavel: 'João Oliveira',
    centro_custo: 'Montagem A'
  },
  {
    id: '4',
    codigo: 'OP-2025-004',
    produto: 'Kit Trauma Membro Superior',
    quantidade: 40,
    quantidadeProduzida: 15,
    status: 'pausada',
    prioridade: 'media',
    dataInicio: '2025-11-22',
    dataPrevisao: '2025-12-02',
    responsavel: 'Ana Costa',
    centro_custo: 'Montagem C',
    observacoes: 'Aguardando componente importado'
  }
]

const componentesMRPMock: ComponenteMRP[] = [
  {
    id: '1',
    codigo: 'MP-001',
    nome: 'Parafuso Cortical 3.5mm',
    tipo: 'componente',
    estoqueAtual: 500,
    estoqueMinimo: 200,
    estoqueMaximo: 1000,
    leadTime: 15,
    fornecedor: 'Synthes Brasil',
    custoUnitario: 45.00,
    demandaPrevista: 350,
    necessidadeLiquida: 0,
    sugestaoCompra: 0
  },
  {
    id: '2',
    codigo: 'MP-002',
    nome: 'Placa LCP 4.5mm',
    tipo: 'componente',
    estoqueAtual: 80,
    estoqueMinimo: 50,
    estoqueMaximo: 200,
    leadTime: 30,
    fornecedor: 'DePuy Synthes',
    custoUnitario: 1200.00,
    demandaPrevista: 120,
    necessidadeLiquida: 40,
    sugestaoCompra: 70
  },
  {
    id: '3',
    codigo: 'MP-003',
    nome: 'Haste Intramedular Fêmur',
    tipo: 'componente',
    estoqueAtual: 25,
    estoqueMinimo: 30,
    estoqueMaximo: 100,
    leadTime: 45,
    fornecedor: 'Zimmer Biomet',
    custoUnitario: 3500.00,
    demandaPrevista: 40,
    necessidadeLiquida: 15,
    sugestaoCompra: 45
  },
  {
    id: '4',
    codigo: 'EMB-001',
    nome: 'Bandeja Estéril Grande',
    tipo: 'embalagem',
    estoqueAtual: 1000,
    estoqueMinimo: 500,
    estoqueMaximo: 2000,
    leadTime: 7,
    fornecedor: 'Embalagens Médicas',
    custoUnitario: 15.00,
    demandaPrevista: 400,
    necessidadeLiquida: 0,
    sugestaoCompra: 0
  },
  {
    id: '5',
    codigo: 'MP-004',
    nome: 'Componente Acetabular',
    tipo: 'componente',
    estoqueAtual: 15,
    estoqueMinimo: 20,
    estoqueMaximo: 80,
    leadTime: 60,
    fornecedor: 'Smith & Nephew',
    custoUnitario: 4800.00,
    demandaPrevista: 25,
    necessidadeLiquida: 10,
    sugestaoCompra: 35
  }
]

const producaoSemanalMock = [
  { semana: 'Sem 1', planejado: 45, realizado: 42, eficiencia: 93 },
  { semana: 'Sem 2', planejado: 50, realizado: 48, eficiencia: 96 },
  { semana: 'Sem 3', planejado: 55, realizado: 52, eficiencia: 95 },
  { semana: 'Sem 4', planejado: 48, realizado: 50, eficiencia: 104 }
]

const distribuicaoStatusMock = [
  { name: 'Em Produção', value: 35, color: '#3B82F6' },
  { name: 'Planejada', value: 25, color: '#8B5CF6' },
  { name: 'Finalizada', value: 30, color: '#10B981' },
  { name: 'Pausada', value: 10, color: '#F59E0B' }
]

// ============ COMPONENTE PRINCIPAL ============

export function ManufaturaLeveMRP() {
  const { isDark } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [showNovaOrdem, setShowNovaOrdem] = useState(false)
  const [showSimulacaoMRP, setShowSimulacaoMRP] = useState(false)

  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'

  // Filtrar ordens
  const ordensFiltradas = useMemo(() => {
    return ordensProducaoMock.filter(ordem => {
      const matchSearch = ordem.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ordem.produto.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'todos' || ordem.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [searchTerm, statusFilter])

  // Componentes com alerta de estoque
  const componentesAlerta = useMemo(() => {
    return componentesMRPMock.filter(c => c.estoqueAtual <= c.estoqueMinimo)
  }, [])

  // KPIs
  const kpis = useMemo(() => ({
    ordensAtivas: ordensProducaoMock.filter(o => o.status === 'em_producao').length,
    eficienciaMedia: Math.round(producaoSemanalMock.reduce((acc, s) => acc + s.eficiencia, 0) / producaoSemanalMock.length),
    alertasEstoque: componentesAlerta.length,
    valorSugestaoCompra: componentesMRPMock.reduce((acc, c) => acc + (c.sugestaoCompra * c.custoUnitario), 0)
  }), [componentesAlerta])

  const getStatusBadge = (status: OrdemProducao['status']) => {
    const configs = {
      planejada: { label: 'Planejada', className: 'bg-purple-500/20 text-purple-400' },
      em_producao: { label: 'Em Produção', className: 'bg-blue-500/20 text-blue-400' },
      pausada: { label: 'Pausada', className: 'bg-amber-500/20 text-amber-400' },
      finalizada: { label: 'Finalizada', className: 'bg-emerald-500/20 text-emerald-400' },
      cancelada: { label: 'Cancelada', className: 'bg-red-500/20 text-red-400' }
    }
    const config = configs[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPrioridadeBadge = (prioridade: OrdemProducao['prioridade']) => {
    const configs = {
      baixa: { label: 'Baixa', className: 'bg-slate-500/20 text-slate-400' },
      media: { label: 'Média', className: 'bg-blue-500/20 text-blue-400' },
      alta: { label: 'Alta', className: 'bg-amber-500/20 text-amber-400' },
      urgente: { label: 'Urgente', className: 'bg-red-500/20 text-red-400' }
    }
    const config = configs[prioridade]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleIniciarProducao = (ordemId: string) => {
    toast.success('Produção iniciada com sucesso!')
  }

  const handlePausarProducao = (ordemId: string) => {
    toast.info('Produção pausada')
  }

  const handleFinalizarProducao = (ordemId: string) => {
    toast.success('Ordem de produção finalizada!')
  }

  const handleExecutarMRP = () => {
    toast.info('Executando cálculo MRP...')
    setTimeout(() => {
      toast.success('MRP calculado com sucesso! 3 sugestões de compra geradas.')
    }, 2000)
  }

  const handleGerarOrdemCompra = (componenteId: string) => {
    toast.success('Ordem de compra gerada e enviada para aprovação')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2 flex items-center gap-3`}>
            <Factory className="w-8 h-8 text-[#6366F1]" />
            Manufatura Leve & MRP
          </h1>
          <p className={textSecondary}>
            Gestão de produção e planejamento de materiais para kits OPME
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleExecutarMRP}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Executar MRP
          </Button>
          <Dialog open={showNovaOrdem} onOpenChange={setShowNovaOrdem}>
            <DialogTrigger asChild>
              <Button className="btn-quick-action flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Ordem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Ordem de Produção</DialogTitle>
              </DialogHeader>
              <NovaOrdemForm onClose={() => setShowNovaOrdem(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Ordens Ativas</p>
                <p className={`text-3xl font-bold ${textPrimary}`}>{kpis.ordensAtivas}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Play className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Eficiência Média</p>
                <p className={`text-3xl font-bold ${textPrimary}`}>{kpis.eficienciaMedia}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Alertas Estoque</p>
                <p className={`text-3xl font-bold ${textPrimary}`}>{kpis.alertasEstoque}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Sugestão Compra</p>
                <p className={`text-3xl font-bold ${textPrimary}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(kpis.valorSugestaoCompra)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ordens" className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="ordens" className="flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Ordens de Produção
          </TabsTrigger>
          <TabsTrigger value="mrp" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            MRP - Materiais
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="simulacao" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Simulação IA
          </TabsTrigger>
        </TabsList>

        {/* Tab: Ordens de Produção */}
        <TabsContent value="ordens" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por código ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2 rounded-xl ${inputBg} ${textPrimary} min-w-[180px]`}
                >
                  <option value="todos">Todos os Status</option>
                  <option value="planejada">Planejada</option>
                  <option value="em_producao">Em Produção</option>
                  <option value="pausada">Pausada</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Ordens */}
          <div className="space-y-3">
            {ordensFiltradas.map((ordem) => (
              <Card key={ordem.id} className="neu-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Info Principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-mono font-bold ${textPrimary}`}>{ordem.codigo}</span>
                        {getStatusBadge(ordem.status)}
                        {getPrioridadeBadge(ordem.prioridade)}
                      </div>
                      <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>{ordem.produto}</h3>
                      <div className={`text-sm ${textSecondary} flex flex-wrap gap-4`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Previsão: {new Date(ordem.dataPrevisao).toLocaleDateString('pt-BR')}
                        </span>
                        <span>Responsável: {ordem.responsavel}</span>
                        <span>Centro: {ordem.centro_custo}</span>
                      </div>
                    </div>

                    {/* Progresso */}
                    <div className="w-full lg:w-48">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={textSecondary}>Progresso</span>
                        <span className={textPrimary}>
                          {ordem.quantidadeProduzida}/{ordem.quantidade}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full transition-all"
                          style={{ width: `${(ordem.quantidadeProduzida / ordem.quantidade) * 100}%` }}
                        />
                      </div>
                      <p className={`text-xs ${textSecondary} mt-1 text-right`}>
                        {Math.round((ordem.quantidadeProduzida / ordem.quantidade) * 100)}%
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      {ordem.status === 'planejada' && (
                        <Button
                          size="sm"
                          onClick={() => handleIniciarProducao(ordem.id)}
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {ordem.status === 'em_producao' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handlePausarProducao(ordem.id)}
                            className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleFinalizarProducao(ordem.id)}
                            className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {ordem.status === 'pausada' && (
                        <Button
                          size="sm"
                          onClick={() => handleIniciarProducao(ordem.id)}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {ordem.observacoes && (
                    <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'} border-l-4 border-amber-500`}>
                      <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        {ordem.observacoes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: MRP - Materiais */}
        <TabsContent value="mrp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#6366F1]" />
                Planejamento de Necessidades de Materiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Código</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Material</th>
                      <th className={`text-center py-3 px-4 ${textSecondary} font-medium`}>Estoque</th>
                      <th className={`text-center py-3 px-4 ${textSecondary} font-medium`}>Mínimo</th>
                      <th className={`text-center py-3 px-4 ${textSecondary} font-medium`}>Demanda</th>
                      <th className={`text-center py-3 px-4 ${textSecondary} font-medium`}>Necessidade</th>
                      <th className={`text-center py-3 px-4 ${textSecondary} font-medium`}>Sugestão</th>
                      <th className={`text-center py-3 px-4 ${textSecondary} font-medium`}>Lead Time</th>
                      <th className={`text-center py-3 px-4 ${textSecondary} font-medium`}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentesMRPMock.map((comp) => (
                      <tr 
                        key={comp.id} 
                        className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'} hover:bg-slate-800/30`}
                      >
                        <td className={`py-3 px-4 font-mono text-sm ${textPrimary}`}>{comp.codigo}</td>
                        <td className={`py-3 px-4 ${textPrimary}`}>
                          <div>
                            <p className="font-medium">{comp.nome}</p>
                            <p className={`text-xs ${textSecondary}`}>{comp.fornecedor}</p>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-center ${
                          comp.estoqueAtual <= comp.estoqueMinimo ? 'text-red-400' : textPrimary
                        }`}>
                          {comp.estoqueAtual}
                          {comp.estoqueAtual <= comp.estoqueMinimo && (
                            <AlertTriangle className="w-4 h-4 inline ml-1 text-red-400" />
                          )}
                        </td>
                        <td className={`py-3 px-4 text-center ${textSecondary}`}>{comp.estoqueMinimo}</td>
                        <td className={`py-3 px-4 text-center ${textPrimary}`}>{comp.demandaPrevista}</td>
                        <td className={`py-3 px-4 text-center ${
                          comp.necessidadeLiquida > 0 ? 'text-amber-400 font-semibold' : textSecondary
                        }`}>
                          {comp.necessidadeLiquida}
                        </td>
                        <td className={`py-3 px-4 text-center ${
                          comp.sugestaoCompra > 0 ? 'text-emerald-400 font-semibold' : textSecondary
                        }`}>
                          {comp.sugestaoCompra}
                        </td>
                        <td className={`py-3 px-4 text-center ${textSecondary}`}>{comp.leadTime}d</td>
                        <td className="py-3 px-4 text-center">
                          {comp.sugestaoCompra > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleGerarOrdemCompra(comp.id)}
                              className="bg-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/30"
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Produção Semanal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#6366F1]" />
                  Produção Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={producaoSemanalMock}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E2E8F0'} />
                    <XAxis dataKey="semana" stroke={isDark ? '#64748B' : '#64748B'} />
                    <YAxis stroke={isDark ? '#64748B' : '#64748B'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1F35' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="planejado" name="Planejado" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="realizado" name="Realizado" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#10B981]" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribuicaoStatusMock}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {distribuicaoStatusMock.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1F35' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Eficiência */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
                  Eficiência de Produção (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={producaoSemanalMock}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E2E8F0'} />
                    <XAxis dataKey="semana" stroke={isDark ? '#64748B' : '#64748B'} />
                    <YAxis domain={[80, 110]} stroke={isDark ? '#64748B' : '#64748B'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1F35' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="eficiencia"
                      name="Eficiência %"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                    />
                    {/* Linha de meta 100% */}
                    <Line
                      type="monotone"
                      dataKey={() => 100}
                      name="Meta"
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Simulação IA */}
        <TabsContent value="simulacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Simulação MRP com Inteligência Artificial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-[#1A1F35]' : 'bg-slate-50'}`}>
                <p className={textSecondary}>
                  O módulo de simulação IA permite criar cenários de demanda e analisar
                  o impacto no planejamento de materiais, custos e prazos de entrega.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cenário 1 */}
                <Card className="neu-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>Cenário Otimista</h4>
                        <p className={`text-xs ${textSecondary}`}>+20% demanda</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={textSecondary}>Custo Adicional:</span>
                        <span className="text-amber-400">R$ 85.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Itens a Comprar:</span>
                        <span className={textPrimary}>12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Lead Time Médio:</span>
                        <span className={textPrimary}>25 dias</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 btn-quick-action" size="sm">
                      Simular
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Cenário 2 */}
                <Card className="neu-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>Cenário Base</h4>
                        <p className={`text-xs ${textSecondary}`}>Demanda atual</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={textSecondary}>Custo Adicional:</span>
                        <span className="text-emerald-400">R$ 45.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Itens a Comprar:</span>
                        <span className={textPrimary}>5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Lead Time Médio:</span>
                        <span className={textPrimary}>18 dias</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 btn-quick-action" size="sm">
                      Simular
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Cenário 3 */}
                <Card className="neu-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>Cenário Pessimista</h4>
                        <p className={`text-xs ${textSecondary}`}>-15% demanda</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={textSecondary}>Custo Adicional:</span>
                        <span className="text-emerald-400">R$ 25.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Itens a Comprar:</span>
                        <span className={textPrimary}>3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Lead Time Médio:</span>
                        <span className={textPrimary}>12 dias</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 btn-quick-action" size="sm">
                      Simular
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recomendação IA */}
              <div className={`p-4 rounded-xl border-l-4 border-[#8B5CF6] ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <div className="flex items-start gap-3">
                  <BrainCircuit className="w-6 h-6 text-[#8B5CF6] mt-0.5" />
                  <div>
                    <h4 className={`font-semibold ${textPrimary} mb-1`}>Recomendação IcarusBrain</h4>
                    <p className={`text-sm ${textSecondary}`}>
                      Com base nos dados históricos e tendências de mercado, recomendo manter o 
                      <strong className="text-[#8B5CF6]"> Cenário Base</strong> com ajuste de +5% 
                      no estoque de segurança para Hastes Intramedulares, devido ao aumento de 
                      cirurgias de trauma previsto para dezembro.
                    </p>
                    <Badge className="mt-2 bg-[#8B5CF6]/20 text-[#8B5CF6]">
                      Confiança: 87%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============ COMPONENTE: FORMULÁRIO NOVA ORDEM ============

function NovaOrdemForm({ onClose }: { onClose: () => void }) {
  const { isDark } = useTheme()
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Ordem de produção criada com sucesso!')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
            Produto
          </label>
          <select className={`w-full px-4 py-2 rounded-xl ${inputBg} ${textPrimary}`} required>
            <option value="">Selecione o produto...</option>
            <option value="kit-artro">Kit Artroscopia Joelho Completo</option>
            <option value="kit-quadril">Kit Prótese Quadril Cimentada</option>
            <option value="kit-coluna">Kit Coluna Cervical</option>
            <option value="kit-trauma">Kit Trauma Membro Superior</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
            Quantidade
          </label>
          <Input type="number" placeholder="0" min="1" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
            Data Início
          </label>
          <Input type="date" required />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
            Data Previsão
          </label>
          <Input type="date" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
            Prioridade
          </label>
          <select className={`w-full px-4 py-2 rounded-xl ${inputBg} ${textPrimary}`} required>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
            Centro de Custo
          </label>
          <select className={`w-full px-4 py-2 rounded-xl ${inputBg} ${textPrimary}`} required>
            <option value="montagem-a">Montagem A</option>
            <option value="montagem-b">Montagem B</option>
            <option value="montagem-c">Montagem C</option>
          </select>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
          Responsável
        </label>
        <select className={`w-full px-4 py-2 rounded-xl ${inputBg} ${textPrimary}`} required>
          <option value="">Selecione o responsável...</option>
          <option value="carlos">Carlos Silva</option>
          <option value="maria">Maria Santos</option>
          <option value="joao">João Oliveira</option>
          <option value="ana">Ana Costa</option>
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
          Observações
        </label>
        <textarea
          className={`w-full px-4 py-2 rounded-xl ${inputBg} ${textPrimary} min-h-[80px]`}
          placeholder="Observações adicionais..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="btn-quick-action">
          <Plus className="w-4 h-4 mr-2" />
          Criar Ordem
        </Button>
      </div>
    </form>
  )
}

export default ManufaturaLeveMRP

