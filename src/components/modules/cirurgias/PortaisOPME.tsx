/**
 * ICARUS v5.0 - Portais OPME
 * 
 * Integração com portais de OPME para cotação automática,
 * comparação de preços e gestão de pedidos.
 * 
 * INTEGRAÇÕES:
 * - OPMENEXO
 * - Inpart Saúde
 * - EMS Ventura Saúde
 * - VSSupply
 * - Orizon OPME
 * - InfoSimples API (validação ANVISA/CFM)
 * 
 * FUNCIONALIDADES:
 * - Comparação automática de preços
 * - Sugestão automática de materiais por especialidade
 * - Otimização de custos por procedimento
 * - Antecipação de complicações baseada em histórico
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
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
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Globe, Link2, Package, DollarSign, TrendingDown, TrendingUp,
  Search, Filter, Download, Plus, Eye, RefreshCw, CheckCircle,
  XCircle, AlertTriangle, Clock, Zap, BrainCircuit, Target,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, ExternalLink,
  ShoppingCart, Truck, Calendar, Shield, FileText, Building2,
  Activity, Layers, Star, StarOff, Bell, Settings, ChevronRight,
  Percent, Calculator, Award, Crown, Medal, ThumbsUp, Info,
  Stethoscope, Heart, Bone, Brain, Syringe, Pill
} from 'lucide-react'

// ============ TIPOS ============

interface PortalOPME {
  id: string
  nome: string
  logo: string
  status: 'conectado' | 'desconectado' | 'erro' | 'manutencao'
  ultimaSincronizacao?: string
  produtosDisponiveis: number
  taxaResposta: number
  tempoMedioResposta: string
  apiOficial: boolean
  infoSimplesIntegrado: boolean
}

interface CotacaoOPME {
  id: string
  produto: {
    codigo: string
    nome: string
    registroAnvisa: string
    fabricante: string
    especialidade: string
  }
  cotacoes: CotacaoPortal[]
  melhorPreco: number
  piorPreco: number
  mediaPreco: number
  economiaMaxima: number
  dataConsulta: string
}

interface CotacaoPortal {
  portalId: string
  portalNome: string
  preco: number
  disponibilidade: 'disponivel' | 'sob_consulta' | 'indisponivel'
  prazoEntrega: string
  condicoes?: string
  validade: string
}

interface SugestaoIA {
  id: string
  tipo: 'material' | 'custo' | 'complicacao' | 'alternativa'
  titulo: string
  descricao: string
  impacto: 'alto' | 'medio' | 'baixo'
  economia?: number
  confianca: number
  baseadoEm: string
}

interface PedidoOPME {
  id: string
  numero: string
  portal: string
  status: 'rascunho' | 'enviado' | 'confirmado' | 'em_transito' | 'entregue' | 'cancelado'
  itens: Array<{
    codigo: string
    nome: string
    quantidade: number
    valorUnitario: number
  }>
  valorTotal: number
  dataPedido: string
  previsaoEntrega?: string
  cirurgiaId?: string
}

// ============ DADOS MOCK ============

const MOCK_PORTAIS: PortalOPME[] = [
  {
    id: '1',
    nome: 'OPMENEXO',
    logo: '🏥',
    status: 'conectado',
    ultimaSincronizacao: '2025-11-28T10:30:00',
    produtosDisponiveis: 15420,
    taxaResposta: 98.5,
    tempoMedioResposta: '1.2s',
    apiOficial: true,
    infoSimplesIntegrado: true,
  },
  {
    id: '2',
    nome: 'Inpart Saúde',
    logo: '💊',
    status: 'conectado',
    ultimaSincronizacao: '2025-11-28T10:25:00',
    produtosDisponiveis: 8750,
    taxaResposta: 95.2,
    tempoMedioResposta: '2.1s',
    apiOficial: false,
    infoSimplesIntegrado: true,
  },
  {
    id: '3',
    nome: 'EMS Ventura Saúde',
    logo: '🩺',
    status: 'conectado',
    ultimaSincronizacao: '2025-11-28T10:20:00',
    produtosDisponiveis: 12300,
    taxaResposta: 97.8,
    tempoMedioResposta: '1.5s',
    apiOficial: true,
    infoSimplesIntegrado: true,
  },
  {
    id: '4',
    nome: 'VSSupply',
    logo: '📦',
    status: 'desconectado',
    produtosDisponiveis: 6200,
    taxaResposta: 0,
    tempoMedioResposta: '-',
    apiOficial: false,
    infoSimplesIntegrado: false,
  },
  {
    id: '5',
    nome: 'Orizon OPME',
    logo: '🔬',
    status: 'conectado',
    ultimaSincronizacao: '2025-11-28T10:28:00',
    produtosDisponiveis: 9800,
    taxaResposta: 96.5,
    tempoMedioResposta: '1.8s',
    apiOficial: true,
    infoSimplesIntegrado: true,
  },
]

const MOCK_COTACOES: CotacaoOPME[] = [
  {
    id: '1',
    produto: {
      codigo: 'PROT-QUAD-001',
      nome: 'Prótese Total de Quadril Cimentada',
      registroAnvisa: '10349000001',
      fabricante: 'Zimmer Biomet',
      especialidade: 'Ortopedia',
    },
    cotacoes: [
      { portalId: '1', portalNome: 'OPMENEXO', preco: 14200, disponibilidade: 'disponivel', prazoEntrega: '3 dias', validade: '2025-12-05' },
      { portalId: '2', portalNome: 'Inpart Saúde', preco: 14850, disponibilidade: 'disponivel', prazoEntrega: '5 dias', validade: '2025-12-03' },
      { portalId: '3', portalNome: 'EMS Ventura', preco: 13950, disponibilidade: 'disponivel', prazoEntrega: '4 dias', validade: '2025-12-04' },
      { portalId: '5', portalNome: 'Orizon OPME', preco: 14500, disponibilidade: 'sob_consulta', prazoEntrega: '7 dias', validade: '2025-12-02' },
    ],
    melhorPreco: 13950,
    piorPreco: 14850,
    mediaPreco: 14375,
    economiaMaxima: 900,
    dataConsulta: '2025-11-28T10:30:00',
  },
  {
    id: '2',
    produto: {
      codigo: 'PROT-JOEL-001',
      nome: 'Prótese Total de Joelho',
      registroAnvisa: '10349000002',
      fabricante: 'Smith & Nephew',
      especialidade: 'Ortopedia',
    },
    cotacoes: [
      { portalId: '1', portalNome: 'OPMENEXO', preco: 23500, disponibilidade: 'disponivel', prazoEntrega: '3 dias', validade: '2025-12-05' },
      { portalId: '3', portalNome: 'EMS Ventura', preco: 22800, disponibilidade: 'disponivel', prazoEntrega: '5 dias', validade: '2025-12-04' },
      { portalId: '5', portalNome: 'Orizon OPME', preco: 24200, disponibilidade: 'disponivel', prazoEntrega: '4 dias', validade: '2025-12-02' },
    ],
    melhorPreco: 22800,
    piorPreco: 24200,
    mediaPreco: 23500,
    economiaMaxima: 1400,
    dataConsulta: '2025-11-28T10:30:00',
  },
  {
    id: '3',
    produto: {
      codigo: 'PARAF-PED-001',
      nome: 'Parafusos Pediculares Sistema Coluna',
      registroAnvisa: '10349000003',
      fabricante: 'Medtronic',
      especialidade: 'Neurocirurgia',
    },
    cotacoes: [
      { portalId: '1', portalNome: 'OPMENEXO', preco: 1850, disponibilidade: 'disponivel', prazoEntrega: '2 dias', validade: '2025-12-05' },
      { portalId: '2', portalNome: 'Inpart Saúde', preco: 1920, disponibilidade: 'disponivel', prazoEntrega: '3 dias', validade: '2025-12-03' },
      { portalId: '3', portalNome: 'EMS Ventura', preco: 1780, disponibilidade: 'disponivel', prazoEntrega: '2 dias', validade: '2025-12-04' },
    ],
    melhorPreco: 1780,
    piorPreco: 1920,
    mediaPreco: 1850,
    economiaMaxima: 140,
    dataConsulta: '2025-11-28T10:30:00',
  },
]

const MOCK_SUGESTOES_IA: SugestaoIA[] = [
  {
    id: '1',
    tipo: 'material',
    titulo: 'Sugestão de Material por Especialidade',
    descricao: 'Para cirurgia de artrodese lombar, recomendamos kit completo Medtronic com 8 parafusos pediculares + 2 hastes de titânio.',
    impacto: 'alto',
    confianca: 94,
    baseadoEm: '156 cirurgias similares realizadas',
  },
  {
    id: '2',
    tipo: 'custo',
    titulo: 'Otimização de Custo Identificada',
    descricao: 'Compra consolidada no portal EMS Ventura pode gerar economia de R$ 3.200 neste lote.',
    impacto: 'alto',
    economia: 3200,
    confianca: 89,
    baseadoEm: 'Análise de 45 cotações recentes',
  },
  {
    id: '3',
    tipo: 'complicacao',
    titulo: 'Alerta de Complicação Potencial',
    descricao: 'Histórico do paciente indica risco aumentado de infecção. Considerar kit antibiótico adicional.',
    impacto: 'medio',
    confianca: 78,
    baseadoEm: 'Análise de prontuário e literatura médica',
  },
  {
    id: '4',
    tipo: 'alternativa',
    titulo: 'Produto Alternativo Disponível',
    descricao: 'Prótese Stryker equivalente disponível com 15% de desconto no OPMENEXO.',
    impacto: 'medio',
    economia: 2130,
    confianca: 92,
    baseadoEm: 'Equivalência técnica validada',
  },
]

const MOCK_PEDIDOS: PedidoOPME[] = [
  {
    id: '1',
    numero: 'PED-2025-001',
    portal: 'EMS Ventura Saúde',
    status: 'em_transito',
    itens: [
      { codigo: 'PROT-QUAD-001', nome: 'Prótese Total de Quadril', quantidade: 2, valorUnitario: 13950 },
      { codigo: 'PARAF-001', nome: 'Parafusos Ortopédicos', quantidade: 12, valorUnitario: 85 },
    ],
    valorTotal: 28920,
    dataPedido: '2025-11-25',
    previsaoEntrega: '2025-11-29',
    cirurgiaId: 'CIR-001',
  },
  {
    id: '2',
    numero: 'PED-2025-002',
    portal: 'OPMENEXO',
    status: 'confirmado',
    itens: [
      { codigo: 'PROT-JOEL-001', nome: 'Prótese Total de Joelho', quantidade: 1, valorUnitario: 23500 },
    ],
    valorTotal: 23500,
    dataPedido: '2025-11-27',
    previsaoEntrega: '2025-12-02',
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function PortaisOPME() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('portais')
  const [searchQuery, setSearchQuery] = useState('')
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState<string>('todas')
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState<CotacaoOPME | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovaCotacaoOpen, setIsNovaCotacaoOpen] = useState(false)
  const [isSincronizando, setIsSincronizando] = useState(false)

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      conectado: { cor: '#10B981', texto: 'Conectado', icon: CheckCircle },
      desconectado: { cor: '#EF4444', texto: 'Desconectado', icon: XCircle },
      erro: { cor: '#EF4444', texto: 'Erro', icon: AlertTriangle },
      manutencao: { cor: '#F59E0B', texto: 'Manutenção', icon: Clock },
      disponivel: { cor: '#10B981', texto: 'Disponível', icon: CheckCircle },
      sob_consulta: { cor: '#F59E0B', texto: 'Sob Consulta', icon: Clock },
      indisponivel: { cor: '#EF4444', texto: 'Indisponível', icon: XCircle },
      rascunho: { cor: '#6B7280', texto: 'Rascunho', icon: FileText },
      enviado: { cor: '#3B82F6', texto: 'Enviado', icon: Truck },
      confirmado: { cor: '#8B5CF6', texto: 'Confirmado', icon: CheckCircle },
      em_transito: { cor: '#F59E0B', texto: 'Em Trânsito', icon: Truck },
      entregue: { cor: '#10B981', texto: 'Entregue', icon: CheckCircle },
      cancelado: { cor: '#EF4444', texto: 'Cancelado', icon: XCircle },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  const getImpactoConfig = (impacto: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      alto: { cor: '#EF4444', texto: 'Alto' },
      medio: { cor: '#F59E0B', texto: 'Médio' },
      baixo: { cor: '#10B981', texto: 'Baixo' },
    }
    return configs[impacto] || { cor: '#6B7280', texto: impacto }
  }

  // Handlers
  const handleSincronizar = useCallback(async () => {
    setIsSincronizando(true)
    toast.info('Sincronizando com portais OPME...')
    
    // Simular sincronização
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSincronizando(false)
    toast.success('Sincronização concluída! 4 portais atualizados.')
  }, [])

  const handleNovaCotacao = () => {
    setIsNovaCotacaoOpen(true)
  }

  const handleValidarAnvisa = async (registro: string) => {
    toast.info(`Validando registro ANVISA ${registro} via InfoSimples...`)
    // Aqui seria a chamada real para a API InfoSimples
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Registro ANVISA válido e ativo!')
  }

  // Stats
  const stats = useMemo(() => ({
    portaisConectados: MOCK_PORTAIS.filter(p => p.status === 'conectado').length,
    totalProdutos: MOCK_PORTAIS.reduce((acc, p) => acc + p.produtosDisponiveis, 0),
    cotacoesAtivas: MOCK_COTACOES.length,
    economiaTotal: MOCK_COTACOES.reduce((acc, c) => acc + c.economiaMaxima, 0),
    pedidosEmAberto: MOCK_PEDIDOS.filter(p => p.status !== 'entregue' && p.status !== 'cancelado').length,
  }), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDark
                ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
                : 'bg-slate-100'
            }`}
            style={{ backgroundColor: '#3B82F620' }}
          >
            <Globe className="w-7 h-7 text-[#3B82F6]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Portais OPME</h1>
            <p className={textSecondary}>Integração com portais e cotação automática</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={handleSincronizar} 
            disabled={isSincronizando}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSincronizando ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button onClick={handleNovaCotacao} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Cotação
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Portais</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.portaisConectados}/{MOCK_PORTAIS.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Produtos</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{(stats.totalProdutos / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Cotações</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.cotacoesAtivas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Economia</p>
                <p className={`text-xl font-bold text-[#10B981]`}>{formatCurrency(stats.economiaTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Pedidos</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.pedidosEmAberto}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="portais" className="gap-2">
            <Globe className="w-4 h-4" />
            Portais
          </TabsTrigger>
          <TabsTrigger value="cotacoes" className="gap-2">
            <Calculator className="w-4 h-4" />
            Cotações
          </TabsTrigger>
          <TabsTrigger value="sugestoes" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Sugestões IA
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Pedidos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Portais */}
        <TabsContent value="portais" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_PORTAIS.map((portal) => {
              const statusConfig = getStatusConfig(portal.status)
              const StatusIcon = statusConfig.icon
              return (
                <motion.div
                  key={portal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={cardBg}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center text-2xl">
                            {portal.logo}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${textPrimary}`}>{portal.nome}</h3>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${statusConfig.cor}20`, color: statusConfig.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.texto}
                            </Badge>
                          </div>
                        </div>
                        {portal.apiOficial && (
                          <Badge className="bg-[#10B981]/20 text-[#10B981] text-xs">
                            API Oficial
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>Produtos</span>
                          <span className={`font-medium ${textPrimary}`}>{portal.produtosDisponiveis.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>Taxa Resposta</span>
                          <span className={`font-medium ${portal.taxaResposta >= 95 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                            {portal.taxaResposta}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>Tempo Médio</span>
                          <span className={`font-medium ${textPrimary}`}>{portal.tempoMedioResposta}</span>
                        </div>
                      </div>

                      {portal.infoSimplesIntegrado && (
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'} mb-3`}>
                          <p className={`text-xs ${textSecondary} flex items-center gap-1`}>
                            <Shield className="w-3 h-3 text-[#8B5CF6]" />
                            InfoSimples integrado (ANVISA/CFM)
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="flex-1 gap-1">
                          <Settings className="w-4 h-4" />
                          Configurar
                        </Button>
                        {portal.status === 'conectado' && (
                          <Button size="sm" className="gap-1">
                            <Search className="w-4 h-4" />
                            Buscar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Info InfoSimples */}
          <Card className={`border-l-4 border-l-[#8B5CF6]`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${textPrimary} mb-1`}>Integração InfoSimples</h3>
                  <p className={`text-sm ${textSecondary} mb-3`}>
                    Validação automática de registros ANVISA e CFM em tempo real durante cotações e pedidos.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[#10B981]/20 text-[#10B981]">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      ANVISA Ativo
                    </Badge>
                    <Badge className="bg-[#10B981]/20 text-[#10B981]">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      CFM Ativo
                    </Badge>
                    <Badge className="bg-[#10B981]/20 text-[#10B981]">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Receita Federal
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cotações */}
        <TabsContent value="cotacoes" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={especialidadeFiltro} onValueChange={setEspecialidadeFiltro}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="ortopedia">Ortopedia</SelectItem>
                    <SelectItem value="neurocirurgia">Neurocirurgia</SelectItem>
                    <SelectItem value="cardiologia">Cardiologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Cotações */}
          <div className="space-y-3">
            {MOCK_COTACOES.map((cotacao) => (
              <Card key={cotacao.id} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-bold ${textPrimary}`}>{cotacao.produto.codigo}</span>
                        <Badge className="bg-[#6366F1]/20 text-[#6366F1] text-xs">
                          {cotacao.produto.especialidade}
                        </Badge>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-6 px-2"
                          onClick={() => handleValidarAnvisa(cotacao.produto.registroAnvisa)}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          ANVISA
                        </Button>
                      </div>
                      <p className={`font-medium ${textPrimary} mb-1`}>{cotacao.produto.nome}</p>
                      <p className={`text-sm ${textSecondary}`}>{cotacao.produto.fabricante}</p>
                      
                      {/* Cotações dos Portais */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {cotacao.cotacoes.map((cot) => {
                          const isMinimo = cot.preco === cotacao.melhorPreco
                          return (
                            <div 
                              key={cot.portalId}
                              className={`px-3 py-2 rounded-lg ${inputBg} ${isMinimo ? 'border-2 border-[#10B981]' : ''}`}
                            >
                              <p className={`text-xs ${textSecondary}`}>{cot.portalNome}</p>
                              <p className={`font-bold ${isMinimo ? 'text-[#10B981]' : textPrimary}`}>
                                {formatCurrency(cot.preco)}
                                {isMinimo && <Crown className="w-3 h-3 inline ml-1 text-[#F59E0B]" />}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className={`p-3 rounded-xl ${isDark ? 'bg-[#10B981]/10' : 'bg-green-50'} mb-2`}>
                        <p className={`text-xs ${textSecondary}`}>Economia Máxima</p>
                        <p className="text-lg font-bold text-[#10B981]">{formatCurrency(cotacao.economiaMaxima)}</p>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => {
                          setCotacaoSelecionada(cotacao)
                          setIsDetalhesOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Sugestões IA */}
        <TabsContent value="sugestoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Sugestões Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_SUGESTOES_IA.map((sugestao) => {
                  const impactoConfig = getImpactoConfig(sugestao.impacto)
                  const tipoIcon = {
                    material: Package,
                    custo: DollarSign,
                    complicacao: AlertTriangle,
                    alternativa: Layers,
                  }[sugestao.tipo]
                  const TipoIcon = tipoIcon || Info
                  
                  return (
                    <div 
                      key={sugestao.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${impactoConfig.cor}20` }}
                        >
                          <TipoIcon className="w-5 h-5" style={{ color: impactoConfig.cor }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${textPrimary}`}>{sugestao.titulo}</h4>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${impactoConfig.cor}20`, color: impactoConfig.cor }}
                            >
                              Impacto {impactoConfig.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary} mb-2`}>{sugestao.descricao}</p>
                          
                          <div className="flex items-center gap-4">
                            {sugestao.economia && (
                              <span className="text-sm text-[#10B981] font-medium">
                                <TrendingDown className="w-4 h-4 inline mr-1" />
                                Economia: {formatCurrency(sugestao.economia)}
                              </span>
                            )}
                            <span className={`text-xs ${textSecondary}`}>
                              <Target className="w-3 h-3 inline mr-1" />
                              Confiança: {sugestao.confianca}%
                            </span>
                            <span className={`text-xs ${textSecondary}`}>
                              <Info className="w-3 h-3 inline mr-1" />
                              {sugestao.baseadoEm}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* IA por Especialidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { titulo: 'Ortopedia', icon: Bone, cor: '#6366F1', sugestoes: 12 },
              { titulo: 'Neurocirurgia', icon: Brain, cor: '#8B5CF6', sugestoes: 8 },
              { titulo: 'Cardiologia', icon: Heart, cor: '#EF4444', sugestoes: 5 },
              { titulo: 'Geral', icon: Stethoscope, cor: '#10B981', sugestoes: 15 },
            ].map((esp) => (
              <Card key={esp.titulo} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${esp.cor}20` }}
                    >
                      <esp.icon className="w-5 h-5" style={{ color: esp.cor }} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${textPrimary}`}>{esp.titulo}</h4>
                      <p className={`text-xs ${textSecondary}`}>{esp.sugestoes} sugestões</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver Sugestões
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Pedidos */}
        <TabsContent value="pedidos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#8B5CF6]" />
                Pedidos OPME
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_PEDIDOS.map((pedido) => {
                  const statusConfig = getStatusConfig(pedido.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <div 
                      key={pedido.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{pedido.numero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${statusConfig.cor}20`, color: statusConfig.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>{pedido.portal}</p>
                          <p className={`text-xs ${textSecondary} mt-1`}>
                            {pedido.itens.length} itens • Pedido: {new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}
                          </p>
                          {pedido.previsaoEntrega && (
                            <p className={`text-xs ${textSecondary}`}>
                              <Truck className="w-3 h-3 inline mr-1" />
                              Previsão: {new Date(pedido.previsaoEntrega).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(pedido.valorTotal)}</p>
                          <Button variant="secondary" size="sm" className="mt-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes da Cotação */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#6366F1]" />
              Detalhes da Cotação
            </DialogTitle>
          </DialogHeader>

          {cotacaoSelecionada && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-1`}>{cotacaoSelecionada.produto.nome}</h4>
                <p className={`text-sm ${textSecondary}`}>
                  {cotacaoSelecionada.produto.fabricante} • ANVISA: {cotacaoSelecionada.produto.registroAnvisa}
                </p>
              </div>

              {/* Comparativo de Preços */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-3`}>Comparativo de Preços</h4>
                <div className="space-y-2">
                  {cotacaoSelecionada.cotacoes
                    .sort((a, b) => a.preco - b.preco)
                    .map((cot, idx) => {
                      const isMinimo = idx === 0
                      const dispConfig = getStatusConfig(cot.disponibilidade)
                      return (
                        <div 
                          key={cot.portalId}
                          className={`p-3 rounded-xl ${inputBg} flex items-center justify-between ${isMinimo ? 'border-2 border-[#10B981]' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            {isMinimo && <Crown className="w-5 h-5 text-[#F59E0B]" />}
                            <div>
                              <p className={`font-medium ${textPrimary}`}>{cot.portalNome}</p>
                              <p className={`text-xs ${textSecondary}`}>
                                Entrega: {cot.prazoEntrega} • Válido até: {new Date(cot.validade).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${isMinimo ? 'text-[#10B981]' : textPrimary}`}>
                              {formatCurrency(cot.preco)}
                            </p>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${dispConfig.cor}20`, color: dispConfig.cor }}
                            >
                              {dispConfig.texto}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Melhor Preço</p>
                  <p className="text-lg font-bold text-[#10B981]">{formatCurrency(cotacaoSelecionada.melhorPreco)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Média</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(cotacaoSelecionada.mediaPreco)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Economia Máx.</p>
                  <p className="text-lg font-bold text-[#10B981]">{formatCurrency(cotacaoSelecionada.economiaMaxima)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Criar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nova Cotação */}
      <Dialog open={isNovaCotacaoOpen} onOpenChange={setIsNovaCotacaoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Nova Cotação
            </DialogTitle>
            <DialogDescription>
              Busque preços em todos os portais conectados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                <Input placeholder="Buscar por código ou nome..." className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Registro ANVISA</Label>
              <div className="flex gap-2">
                <Input placeholder="00000000000" />
                <Button variant="secondary" className="gap-1">
                  <Shield className="w-4 h-4" />
                  Validar
                </Button>
              </div>
              <p className={`text-xs ${textSecondary}`}>
                <Info className="w-3 h-3 inline mr-1" />
                Validação automática via InfoSimples
              </p>
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" placeholder="1" defaultValue={1} />
            </div>

            <div className="space-y-2">
              <Label>Portais para Consulta</Label>
              <div className="flex flex-wrap gap-2">
                {MOCK_PORTAIS.filter(p => p.status === 'conectado').map((portal) => (
                  <label 
                    key={portal.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-[#6366F1]/20 text-[#6366F1]`}
                  >
                    <input type="checkbox" defaultChecked className="hidden" />
                    <CheckCircle className="w-4 h-4" />
                    {portal.nome}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovaCotacaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Cotação iniciada em 4 portais!')
              setIsNovaCotacaoOpen(false)
            }} className="gap-2">
              <Search className="w-4 h-4" />
              Iniciar Cotação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PortaisOPME
