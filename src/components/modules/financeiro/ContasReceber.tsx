/**
 * ICARUS v5.0 - Contas a Receber
 * 
 * Gestão inteligente de recebíveis com cobrança automatizada,
 * negociação inteligente e análise de inadimplência.
 * 
 * FUNCIONALIDADES:
 * - Cobrança automatizada (Email, SMS, WhatsApp)
 * - Negociação inteligente com IA
 * - Análise de inadimplência com 95% de precisão
 * - Desconto por antecipação
 * - Integração com bancos (PIX, Boleto)
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
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
  Wallet, CreditCard, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingDown, TrendingUp, Search, Filter,
  Download, Plus, Eye, FileText, Building2, User, DollarSign,
  ArrowUpRight, ArrowDownRight, RefreshCw, BrainCircuit, Zap,
  Send, CheckSquare, MoreVertical, ChevronRight, Upload,
  Banknote, PiggyBank, Receipt, BarChart3, Target, Layers,
  Mail, Phone, MessageSquare, Bell, BellRing, UserCheck,
  UserX, Percent, Calculator, History, Gift, HandCoins,
  AlertCircle, Info, Gauge, Activity, TrendingDown as TrendDown,
  Smartphone, MessageCircle, Scale, Handshake
} from 'lucide-react'

// ============ TIPOS ============

interface ContaReceber {
  id: string
  numero: string
  cliente: {
    id: string
    nome: string
    cnpj: string
    email: string
    telefone: string
    scoreCredito: number
    riscoPadrao: 'baixo' | 'medio' | 'alto' | 'critico'
  }
  descricao: string
  valor: number
  valorRecebido?: number
  dataEmissao: string
  dataVencimento: string
  dataRecebimento?: string
  status: 'pendente' | 'vencido' | 'recebido' | 'parcial' | 'negociado' | 'protestado' | 'cancelado'
  origem: 'cirurgia' | 'venda' | 'servico' | 'consignacao'
  formaPagamento?: 'pix' | 'boleto' | 'transferencia' | 'cartao'
  diasAtraso?: number
  cobrancasEnviadas: number
  ultimaCobranca?: string
  observacoes?: string
}

interface ConfiguracaoCobranca {
  id: string
  nome: string
  diasAposVencimento: number
  canal: 'email' | 'sms' | 'whatsapp' | 'todos'
  template: string
  ativo: boolean
}

interface NegociacaoIA {
  id: string
  contaId: string
  cliente: string
  valorOriginal: number
  valorNegociado: number
  desconto: number
  parcelas: number
  dataAcordo: string
  status: 'proposta' | 'aceita' | 'recusada' | 'vencida'
  confiancaIA: number
  motivoSugestao: string
}

interface AnaliseInadimplencia {
  clienteId: string
  cliente: string
  scoreRisco: number
  probabilidadeInadimplencia: number
  valorEmRisco: number
  fatoresRisco: string[]
  recomendacao: string
}

// ============ DADOS MOCK ============

const MOCK_CONTAS: ContaReceber[] = [
  {
    id: '1',
    numero: 'CR-2025-001',
    cliente: {
      id: '1',
      nome: 'Hospital São Lucas',
      cnpj: '12.345.678/0001-90',
      email: 'financeiro@saolucas.com.br',
      telefone: '(11) 3456-7890',
      scoreCredito: 850,
      riscoPadrao: 'baixo',
    },
    descricao: 'Cirurgia Ortopédica - Prótese Quadril',
    valor: 125000.00,
    dataEmissao: '2025-11-01',
    dataVencimento: '2025-12-01',
    status: 'pendente',
    origem: 'cirurgia',
    cobrancasEnviadas: 0,
  },
  {
    id: '2',
    numero: 'CR-2025-002',
    cliente: {
      id: '2',
      nome: 'Hospital Albert Einstein',
      cnpj: '23.456.789/0001-01',
      email: 'contas@einstein.br',
      telefone: '(11) 2151-1233',
      scoreCredito: 920,
      riscoPadrao: 'baixo',
    },
    descricao: 'Material Consignado - Neurocirurgia',
    valor: 89500.00,
    valorRecebido: 89500.00,
    dataEmissao: '2025-10-15',
    dataVencimento: '2025-11-15',
    dataRecebimento: '2025-11-14',
    status: 'recebido',
    origem: 'consignacao',
    formaPagamento: 'pix',
    cobrancasEnviadas: 0,
  },
  {
    id: '3',
    numero: 'CR-2025-003',
    cliente: {
      id: '3',
      nome: 'Clínica Ortopédica Central',
      cnpj: '34.567.890/0001-12',
      email: 'financeiro@ortopedicacentral.com.br',
      telefone: '(11) 3333-4444',
      scoreCredito: 620,
      riscoPadrao: 'medio',
    },
    descricao: 'Instrumental Artroscopia',
    valor: 45000.00,
    dataEmissao: '2025-10-01',
    dataVencimento: '2025-11-01',
    status: 'vencido',
    origem: 'venda',
    diasAtraso: 27,
    cobrancasEnviadas: 3,
    ultimaCobranca: '2025-11-25',
  },
  {
    id: '4',
    numero: 'CR-2025-004',
    cliente: {
      id: '4',
      nome: 'Hospital Municipal',
      cnpj: '45.678.901/0001-23',
      email: 'pagamentos@hospitalmunicipal.gov.br',
      telefone: '(11) 5555-6666',
      scoreCredito: 480,
      riscoPadrao: 'alto',
    },
    descricao: 'Próteses Ortopédicas - Lote Emergencial',
    valor: 78000.00,
    valorRecebido: 39000.00,
    dataEmissao: '2025-09-15',
    dataVencimento: '2025-10-15',
    status: 'parcial',
    origem: 'venda',
    diasAtraso: 44,
    cobrancasEnviadas: 5,
    ultimaCobranca: '2025-11-27',
  },
  {
    id: '5',
    numero: 'CR-2025-005',
    cliente: {
      id: '5',
      nome: 'Centro Médico Paulista',
      cnpj: '56.789.012/0001-34',
      email: 'financeiro@cmpaulista.com.br',
      telefone: '(11) 7777-8888',
      scoreCredito: 350,
      riscoPadrao: 'critico',
    },
    descricao: 'Material Cirúrgico Coluna',
    valor: 156000.00,
    dataEmissao: '2025-08-01',
    dataVencimento: '2025-09-01',
    status: 'negociado',
    origem: 'cirurgia',
    diasAtraso: 88,
    cobrancasEnviadas: 8,
    ultimaCobranca: '2025-11-20',
  },
]

const MOCK_CONFIG_COBRANCA: ConfiguracaoCobranca[] = [
  { id: '1', nome: 'Lembrete Pré-Vencimento', diasAposVencimento: -3, canal: 'email', template: 'Prezado cliente, lembramos que o título {{numero}} vence em 3 dias...', ativo: true },
  { id: '2', nome: '1ª Cobrança', diasAposVencimento: 3, canal: 'email', template: 'Prezado cliente, identificamos que o título {{numero}} está vencido...', ativo: true },
  { id: '3', nome: '2ª Cobrança', diasAposVencimento: 10, canal: 'todos', template: 'URGENTE: O título {{numero}} está vencido há 10 dias...', ativo: true },
  { id: '4', nome: '3ª Cobrança', diasAposVencimento: 20, canal: 'whatsapp', template: 'Último aviso antes de protesto: título {{numero}}...', ativo: true },
  { id: '5', nome: 'Aviso de Protesto', diasAposVencimento: 30, canal: 'todos', template: 'AVISO FINAL: O título {{numero}} será protestado em 48h...', ativo: false },
]

const MOCK_NEGOCIACOES: NegociacaoIA[] = [
  {
    id: '1',
    contaId: '5',
    cliente: 'Centro Médico Paulista',
    valorOriginal: 156000.00,
    valorNegociado: 140400.00,
    desconto: 10,
    parcelas: 6,
    dataAcordo: '2025-11-20',
    status: 'aceita',
    confiancaIA: 87,
    motivoSugestao: 'Cliente com histórico de pagamento após negociação. Desconto de 10% maximiza probabilidade de recuperação.',
  },
  {
    id: '2',
    contaId: '4',
    cliente: 'Hospital Municipal',
    valorOriginal: 39000.00,
    valorNegociado: 35100.00,
    desconto: 10,
    parcelas: 3,
    dataAcordo: '2025-11-28',
    status: 'proposta',
    confiancaIA: 72,
    motivoSugestao: 'Órgão público com restrição orçamentária. Parcelamento em 3x aumenta chance de quitação.',
  },
]

const MOCK_ANALISE_INADIMPLENCIA: AnaliseInadimplencia[] = [
  {
    clienteId: '5',
    cliente: 'Centro Médico Paulista',
    scoreRisco: 85,
    probabilidadeInadimplencia: 78,
    valorEmRisco: 156000.00,
    fatoresRisco: ['Histórico de atrasos frequentes', 'Score de crédito baixo', 'Setor com alta inadimplência'],
    recomendacao: 'Priorizar negociação com desconto. Considerar garantias adicionais para novos pedidos.',
  },
  {
    clienteId: '4',
    cliente: 'Hospital Municipal',
    scoreRisco: 65,
    probabilidadeInadimplencia: 45,
    valorEmRisco: 39000.00,
    fatoresRisco: ['Órgão público com ciclo orçamentário', 'Pagamento parcial realizado'],
    recomendacao: 'Acompanhar ciclo orçamentário. Propor parcelamento alinhado com empenho.',
  },
  {
    clienteId: '3',
    cliente: 'Clínica Ortopédica Central',
    scoreRisco: 55,
    probabilidadeInadimplencia: 35,
    valorEmRisco: 45000.00,
    fatoresRisco: ['Primeiro atraso significativo', 'Score médio'],
    recomendacao: 'Contato direto recomendado. Possível problema pontual de fluxo de caixa.',
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function ContasReceber() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [contaSelecionada, setContaSelecionada] = useState<ContaReceber | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovaContaOpen, setIsNovaContaOpen] = useState(false)
  const [isCobrancaManualOpen, setIsCobrancaManualOpen] = useState(false)
  const [isNegociacaoOpen, setIsNegociacaoOpen] = useState(false)

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

  const getStatusConfig = (status: ContaReceber['status']) => {
    const configs = {
      pendente: { cor: '#F59E0B', texto: 'Pendente', icon: Clock },
      vencido: { cor: '#EF4444', texto: 'Vencido', icon: AlertTriangle },
      recebido: { cor: '#10B981', texto: 'Recebido', icon: CheckCircle },
      parcial: { cor: '#3B82F6', texto: 'Parcial', icon: TrendingUp },
      negociado: { cor: '#8B5CF6', texto: 'Negociado', icon: Handshake },
      protestado: { cor: '#DC2626', texto: 'Protestado', icon: Scale },
      cancelado: { cor: '#6B7280', texto: 'Cancelado', icon: XCircle },
    }
    return configs[status]
  }

  const getRiscoConfig = (risco: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      baixo: { cor: '#10B981', texto: 'Baixo' },
      medio: { cor: '#F59E0B', texto: 'Médio' },
      alto: { cor: '#EF4444', texto: 'Alto' },
      critico: { cor: '#DC2626', texto: 'Crítico' },
    }
    return configs[risco] || { cor: '#6B7280', texto: risco }
  }

  // Filtrar contas
  const contasFiltradas = useMemo(() => {
    return MOCK_CONTAS.filter(c => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!c.numero.toLowerCase().includes(query) && 
            !c.cliente.nome.toLowerCase().includes(query) &&
            !c.descricao.toLowerCase().includes(query)) {
          return false
        }
      }
      if (filtroStatus !== 'todos' && c.status !== filtroStatus) {
        return false
      }
      return true
    })
  }, [searchQuery, filtroStatus])

  // Resumo financeiro
  const resumo = useMemo(() => {
    const totalReceber = MOCK_CONTAS.filter(c => c.status !== 'recebido' && c.status !== 'cancelado')
      .reduce((acc, c) => acc + c.valor - (c.valorRecebido || 0), 0)
    const totalVencido = MOCK_CONTAS.filter(c => c.status === 'vencido' || c.status === 'parcial')
      .reduce((acc, c) => acc + c.valor - (c.valorRecebido || 0), 0)
    const totalRecebidoMes = MOCK_CONTAS.filter(c => c.status === 'recebido')
      .reduce((acc, c) => acc + (c.valorRecebido || 0), 0)
    const taxaInadimplencia = (totalVencido / (totalReceber + totalRecebidoMes)) * 100

    return {
      totalReceber,
      totalVencido,
      totalRecebidoMes,
      taxaInadimplencia: taxaInadimplencia.toFixed(1),
      qtdPendentes: MOCK_CONTAS.filter(c => c.status === 'pendente').length,
      qtdVencidos: MOCK_CONTAS.filter(c => c.status === 'vencido' || c.status === 'parcial').length,
    }
  }, [])

  // Handlers
  const handleEnviarCobranca = (conta: ContaReceber) => {
    toast.success(`Cobrança enviada para ${conta.cliente.nome}`)
  }

  const handleIniciarNegociacao = (conta: ContaReceber) => {
    setContaSelecionada(conta)
    setIsNegociacaoOpen(true)
  }

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
            style={{ backgroundColor: '#10B98120' }}
          >
            <HandCoins className="w-7 h-7 text-[#10B981]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Contas a Receber</h1>
            <p className={textSecondary}>Cobrança automatizada e análise de inadimplência</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsCobrancaManualOpen(true)} className="gap-2">
            <Send className="w-4 h-4" />
            Enviar Cobranças
          </Button>
          <Button onClick={() => setIsNovaContaOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>A Receber</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(resumo.totalReceber)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Vencido</p>
                <p className={`text-lg font-bold text-[#EF4444]`}>{formatCurrency(resumo.totalVencido)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Recebido (Mês)</p>
                <p className={`text-lg font-bold text-[#10B981]`}>{formatCurrency(resumo.totalRecebidoMes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Inadimplência</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{resumo.taxaInadimplencia}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Pendentes</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.qtdPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>IA Precisão</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="visao-geral" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="titulos" className="gap-2">
            <FileText className="w-4 h-4" />
            Títulos
          </TabsTrigger>
          <TabsTrigger value="cobranca" className="gap-2">
            <Send className="w-4 h-4" />
            Cobrança Automática
          </TabsTrigger>
          <TabsTrigger value="negociacao" className="gap-2">
            <Handshake className="w-4 h-4" />
            Negociação IA
          </TabsTrigger>
          <TabsTrigger value="inadimplencia" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Análise Inadimplência
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Vencimentos Próximos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-[#F59E0B]" />
                  Vencimentos Próximos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_CONTAS.filter(c => c.status === 'pendente').slice(0, 4).map((conta) => {
                    const status = getStatusConfig(conta.status)
                    const StatusIcon = status.icon
                    return (
                      <div 
                        key={conta.id}
                        className={`p-3 rounded-xl ${inputBg} flex items-center justify-between cursor-pointer hover:opacity-80`}
                        onClick={() => {
                          setContaSelecionada(conta)
                          setIsDetalhesOpen(true)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${status.cor}20` }}
                          >
                            <StatusIcon className="w-5 h-5" style={{ color: status.cor }} />
                          </div>
                          <div>
                            <p className={`font-medium ${textPrimary}`}>{conta.cliente.nome}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              Vence: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${textPrimary}`}>{formatCurrency(conta.valor)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Títulos Vencidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  Títulos Vencidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_CONTAS.filter(c => c.status === 'vencido' || c.status === 'parcial').map((conta) => {
                    const status = getStatusConfig(conta.status)
                    const StatusIcon = status.icon
                    return (
                      <div 
                        key={conta.id}
                        className={`p-3 rounded-xl ${inputBg} flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${status.cor}20` }}
                          >
                            <StatusIcon className="w-5 h-5" style={{ color: status.cor }} />
                          </div>
                          <div>
                            <p className={`font-medium ${textPrimary}`}>{conta.cliente.nome}</p>
                            <p className={`text-xs text-[#EF4444]`}>
                              {conta.diasAtraso} dias de atraso • {conta.cobrancasEnviadas} cobranças
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${textPrimary}`}>
                            {formatCurrency(conta.valor - (conta.valorRecebido || 0))}
                          </p>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleEnviarCobranca(conta)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Cobrar
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Títulos */}
        <TabsContent value="titulos" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por número, cliente ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="recebido">Recebido</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="negociado">Negociado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Títulos */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {contasFiltradas.map((conta) => {
                  const status = getStatusConfig(conta.status)
                  const StatusIcon = status.icon
                  const risco = getRiscoConfig(conta.cliente.riscoPadrao)
                  
                  return (
                    <div 
                      key={conta.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold ${textPrimary}`}>{conta.numero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${risco.cor}20`, color: risco.cor }}
                            >
                              Risco {risco.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textPrimary}`}>{conta.cliente.nome}</p>
                          <p className={`text-xs ${textSecondary}`}>{conta.descricao}</p>
                          {conta.diasAtraso && conta.diasAtraso > 0 && (
                            <p className="text-xs text-[#EF4444] mt-1">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              {conta.diasAtraso} dias de atraso
                            </p>
                          )}
                        </div>

                        {/* Valores */}
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(conta.valor)}</p>
                          {conta.valorRecebido && conta.valorRecebido > 0 && (
                            <p className="text-xs text-[#10B981]">
                              Recebido: {formatCurrency(conta.valorRecebido)}
                            </p>
                          )}
                          <p className={`text-xs ${textSecondary}`}>
                            Vence: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setContaSelecionada(conta)
                              setIsDetalhesOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(conta.status === 'vencido' || conta.status === 'parcial') && (
                            <>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => handleEnviarCobranca(conta)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleIniciarNegociacao(conta)}
                              >
                                <Handshake className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cobrança Automática */}
        <TabsContent value="cobranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
                Configuração de Cobrança Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_CONFIG_COBRANCA.map((config) => (
                  <div 
                    key={config.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          config.diasAposVencimento < 0 ? 'bg-[#10B981]/20' : 'bg-[#F59E0B]/20'
                        }`}>
                          {config.canal === 'email' && <Mail className={`w-5 h-5 ${config.diasAposVencimento < 0 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />}
                          {config.canal === 'sms' && <Smartphone className={`w-5 h-5 ${config.diasAposVencimento < 0 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />}
                          {config.canal === 'whatsapp' && <MessageCircle className={`w-5 h-5 ${config.diasAposVencimento < 0 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />}
                          {config.canal === 'todos' && <Bell className={`w-5 h-5 ${config.diasAposVencimento < 0 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />}
                        </div>
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{config.nome}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            {config.diasAposVencimento < 0 
                              ? `${Math.abs(config.diasAposVencimento)} dias antes do vencimento`
                              : `${config.diasAposVencimento} dias após vencimento`
                            }
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            Canal: {config.canal === 'todos' ? 'Email, SMS e WhatsApp' : config.canal.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={config.ativo ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                          {config.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.ativo}
                            onChange={() => {}}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Canais de Cobrança */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { titulo: 'Email', icon: Mail, cor: '#6366F1', enviados: 156, taxa: 45 },
              { titulo: 'SMS', icon: Smartphone, cor: '#10B981', enviados: 89, taxa: 62 },
              { titulo: 'WhatsApp', icon: MessageCircle, cor: '#25D366', enviados: 234, taxa: 78 },
            ].map((canal) => (
              <Card key={canal.titulo} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${canal.cor}20` }}
                    >
                      <canal.icon className="w-5 h-5" style={{ color: canal.cor }} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${textPrimary}`}>{canal.titulo}</h4>
                      <p className={`text-xs ${textSecondary}`}>{canal.enviados} enviados este mês</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textSecondary}`}>Taxa de Abertura</span>
                    <span className={`font-bold ${textPrimary}`}>{canal.taxa}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${canal.taxa}%`, backgroundColor: canal.cor }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Negociação IA */}
        <TabsContent value="negociacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Negociações Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_NEGOCIACOES.map((neg) => (
                  <div 
                    key={neg.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-semibold ${textPrimary}`}>{neg.cliente}</span>
                          <Badge className={
                            neg.status === 'aceita' ? 'bg-green-500/20 text-green-500' :
                            neg.status === 'proposta' ? 'bg-blue-500/20 text-blue-500' :
                            neg.status === 'recusada' ? 'bg-red-500/20 text-red-500' :
                            'bg-gray-500/20 text-gray-500'
                          }>
                            {neg.status === 'aceita' ? 'Aceita' :
                             neg.status === 'proposta' ? 'Proposta' :
                             neg.status === 'recusada' ? 'Recusada' : 'Vencida'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className={`text-xs ${textSecondary}`}>Valor Original</p>
                            <p className={`font-medium ${textPrimary}`}>{formatCurrency(neg.valorOriginal)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>Valor Negociado</p>
                            <p className="font-medium text-[#10B981]">{formatCurrency(neg.valorNegociado)}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>Desconto</p>
                            <p className={`font-medium ${textPrimary}`}>{neg.desconto}%</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textSecondary}`}>Parcelas</p>
                            <p className={`font-medium ${textPrimary}`}>{neg.parcelas}x</p>
                          </div>
                        </div>

                        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                          <p className={`text-xs ${textSecondary}`}>
                            <BrainCircuit className="w-3 h-3 inline mr-1 text-[#8B5CF6]" />
                            Confiança IA: {neg.confiancaIA}% • {neg.motivoSugestao}
                          </p>
                        </div>
                      </div>
                      
                      {neg.status === 'proposta' && (
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aceitar
                          </Button>
                          <Button variant="secondary" size="sm">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Desconto por Antecipação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#10B981]" />
                Desconto por Antecipação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { dias: 30, desconto: 5, economia: 6250 },
                  { dias: 15, desconto: 3, economia: 3750 },
                  { dias: 7, desconto: 1.5, economia: 1875 },
                ].map((item) => (
                  <div 
                    key={item.dias}
                    className={`p-4 rounded-xl ${inputBg} text-center`}
                  >
                    <p className={`text-2xl font-bold ${textPrimary}`}>{item.desconto}%</p>
                    <p className={`text-sm ${textSecondary}`}>Antecipação de {item.dias} dias</p>
                    <p className="text-xs text-[#10B981] mt-2">
                      Economia média: {formatCurrency(item.economia)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análise Inadimplência */}
        <TabsContent value="inadimplencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#EF4444]" />
                Análise de Inadimplência (IA 95% Precisão)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ANALISE_INADIMPLENCIA.map((analise) => (
                  <div 
                    key={analise.clienteId}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor} border-l-4`}
                    style={{ 
                      borderLeftColor: analise.probabilidadeInadimplencia >= 70 ? '#EF4444' :
                        analise.probabilidadeInadimplencia >= 40 ? '#F59E0B' : '#10B981'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>{analise.cliente}</h4>
                        <p className={`text-sm ${textSecondary}`}>
                          Valor em Risco: {formatCurrency(analise.valorEmRisco)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${textSecondary}`}>Score Risco</span>
                          <span className={`text-xl font-bold ${
                            analise.scoreRisco >= 70 ? 'text-[#EF4444]' :
                            analise.scoreRisco >= 40 ? 'text-[#F59E0B]' : 'text-[#10B981]'
                          }`}>{analise.scoreRisco}</span>
                        </div>
                        <p className={`text-xs ${textSecondary}`}>
                          Prob. Inadimplência: {analise.probabilidadeInadimplencia}%
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className={`text-xs ${textSecondary} mb-2`}>Fatores de Risco:</p>
                      <div className="flex flex-wrap gap-2">
                        {analise.fatoresRisco.map((fator, idx) => (
                          <Badge key={idx} className="bg-red-500/10 text-red-400 text-xs">
                            {fator}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                      <p className={`text-sm ${textSecondary}`}>
                        <Zap className="w-4 h-4 inline mr-1 text-[#F59E0B]" />
                        <strong>Recomendação IA:</strong> {analise.recomendacao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes da Conta */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6366F1]" />
              {contaSelecionada?.numero}
            </DialogTitle>
          </DialogHeader>

          {contaSelecionada && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-[#6366F1]" />
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{contaSelecionada.cliente.nome}</p>
                    <p className={`text-xs ${textSecondary}`}>{contaSelecionada.cliente.cnpj}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={textSecondary}>
                    <Mail className="w-4 h-4 inline mr-1" />
                    {contaSelecionada.cliente.email}
                  </span>
                  <span className={textSecondary}>
                    <Phone className="w-4 h-4 inline mr-1" />
                    {contaSelecionada.cliente.telefone}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Valor</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(contaSelecionada.valor)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Vencimento</p>
                  <p className={`font-medium ${textPrimary}`}>
                    {new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-xl ${inputBg}`}>
                <p className={`text-xs ${textSecondary}`}>Descrição</p>
                <p className={textPrimary}>{contaSelecionada.descricao}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Score Crédito</p>
                  <p className={`font-medium ${
                    contaSelecionada.cliente.scoreCredito >= 700 ? 'text-[#10B981]' :
                    contaSelecionada.cliente.scoreCredito >= 500 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                  }`}>{contaSelecionada.cliente.scoreCredito}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Cobranças Enviadas</p>
                  <p className={`font-medium ${textPrimary}`}>{contaSelecionada.cobrancasEnviadas}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            {contaSelecionada && (contaSelecionada.status === 'vencido' || contaSelecionada.status === 'parcial') && (
              <Button onClick={() => {
                setIsDetalhesOpen(false)
                handleIniciarNegociacao(contaSelecionada)
              }} className="gap-2">
                <Handshake className="w-4 h-4" />
                Negociar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Negociação */}
      <Dialog open={isNegociacaoOpen} onOpenChange={setIsNegociacaoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[#8B5CF6]" />
              Nova Negociação
            </DialogTitle>
            <DialogDescription>
              Proposta gerada pela IA com base no perfil do cliente
            </DialogDescription>
          </DialogHeader>

          {contaSelecionada && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <p className={`font-medium ${textPrimary} mb-1`}>{contaSelecionada.cliente.nome}</p>
                <p className={`text-sm ${textSecondary}`}>
                  Valor em aberto: {formatCurrency(contaSelecionada.valor - (contaSelecionada.valorRecebido || 0))}
                </p>
              </div>

              <div className={`p-4 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20`}>
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                  <span className={`font-medium ${textPrimary}`}>Sugestão IA</span>
                </div>
                <p className={`text-sm ${textSecondary}`}>
                  Baseado no histórico do cliente, sugerimos desconto de 10% com parcelamento em 3x.
                  Confiança: 85%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input type="number" defaultValue={10} />
                </div>
                <div className="space-y-2">
                  <Label>Parcelas</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">À Vista</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="3">3x</SelectItem>
                      <SelectItem value="6">6x</SelectItem>
                      <SelectItem value="12">12x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Condições especiais da negociação..." />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNegociacaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Proposta de negociação enviada!')
              setIsNegociacaoOpen(false)
            }} className="gap-2">
              <Send className="w-4 h-4" />
              Enviar Proposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nova Conta */}
      <Dialog open={isNovaContaOpen} onOpenChange={setIsNovaContaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Nova Conta a Receber
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hospital São Lucas</SelectItem>
                  <SelectItem value="2">Hospital Albert Einstein</SelectItem>
                  <SelectItem value="3">Clínica Ortopédica Central</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Descrição da conta" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Origem</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cirurgia">Cirurgia</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="consignacao">Consignação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovaContaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Conta a receber cadastrada!')
              setIsNovaContaOpen(false)
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cobrança Manual */}
      <Dialog open={isCobrancaManualOpen} onOpenChange={setIsCobrancaManualOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#6366F1]" />
              Enviar Cobranças
            </DialogTitle>
            <DialogDescription>
              Selecione os canais e títulos para envio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Canais de Envio</Label>
              <div className="flex gap-2">
                {['Email', 'SMS', 'WhatsApp'].map((canal) => (
                  <label 
                    key={canal}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-[#6366F1]/20 text-[#6366F1]`}
                  >
                    <input type="checkbox" defaultChecked className="hidden" />
                    <CheckCircle className="w-4 h-4" />
                    {canal}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Títulos a Cobrar</Label>
              <Select defaultValue="vencidos">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vencidos">Todos Vencidos ({resumo.qtdVencidos})</SelectItem>
                  <SelectItem value="selecionados">Selecionados Manualmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`p-3 rounded-xl ${inputBg}`}>
              <p className={`text-sm ${textSecondary}`}>
                <Info className="w-4 h-4 inline mr-1" />
                Serão enviadas cobranças para {resumo.qtdVencidos} títulos vencidos, totalizando {formatCurrency(resumo.totalVencido)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCobrancaManualOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success(`Cobranças enviadas para ${resumo.qtdVencidos} clientes!`)
              setIsCobrancaManualOpen(false)
            }} className="gap-2">
              <Send className="w-4 h-4" />
              Enviar Cobranças
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContasReceber

