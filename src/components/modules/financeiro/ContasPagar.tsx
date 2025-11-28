/**
 * ICARUS v5.0 - Contas a Pagar
 * 
 * Gestão inteligente de pagamentos com aprovações automáticas,
 * pagamento em lote e conciliação bancária.
 * 
 * FUNCIONALIDADES:
 * - Gestão inteligente de vencimentos
 * - Aprovações automáticas por alçada
 * - Pagamento em lote (PIX, TED, DOC)
 * - Conciliação bancária automática
 * - IA para otimização de pagamentos
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
  Banknote, PiggyBank, Receipt, BarChart3, Target, Layers
} from 'lucide-react'

// ============ TIPOS ============

interface ContaPagar {
  id: string
  numero: string
  fornecedor: {
    id: string
    nome: string
    cnpj: string
  }
  descricao: string
  valor: number
  valorPago?: number
  dataEmissao: string
  dataVencimento: string
  dataPagamento?: string
  status: 'pendente' | 'vencida' | 'paga' | 'parcial' | 'aprovada' | 'cancelada'
  categoria: string
  centroCusto: string
  formaPagamento?: 'pix' | 'ted' | 'doc' | 'boleto' | 'debito'
  aprovador?: string
  observacoes?: string
  documentos?: string[]
}

interface ResumoFinanceiro {
  totalPendente: number
  totalVencido: number
  totalPago: number
  quantidadePendente: number
  quantidadeVencida: number
  mediaAtraso: number
  proximosVencimentos: number
}

// ============ DADOS MOCK ============

const MOCK_CONTAS: ContaPagar[] = [
  {
    id: '1',
    numero: 'CP-2025-001',
    fornecedor: { id: '1', nome: 'Zimmer Biomet Brasil', cnpj: '12.345.678/0001-90' },
    descricao: 'Próteses de Quadril - Lote 2025/001',
    valor: 125000.00,
    dataEmissao: '2025-11-15',
    dataVencimento: '2025-12-15',
    status: 'aprovada',
    categoria: 'Produtos OPME',
    centroCusto: 'Estoque',
  },
  {
    id: '2',
    numero: 'CP-2025-002',
    fornecedor: { id: '2', nome: 'Smith & Nephew', cnpj: '23.456.789/0001-01' },
    descricao: 'Instrumental Artroscopia',
    valor: 45000.00,
    dataEmissao: '2025-11-10',
    dataVencimento: '2025-11-28',
    status: 'vencida',
    categoria: 'Instrumental',
    centroCusto: 'Estoque',
  },
  {
    id: '3',
    numero: 'CP-2025-003',
    fornecedor: { id: '3', nome: 'Medtronic', cnpj: '34.567.890/0001-12' },
    descricao: 'Neuroestimuladores',
    valor: 89500.00,
    valorPago: 89500.00,
    dataEmissao: '2025-11-01',
    dataVencimento: '2025-11-25',
    dataPagamento: '2025-11-24',
    status: 'paga',
    categoria: 'Produtos OPME',
    centroCusto: 'Neurocirurgia',
    formaPagamento: 'ted',
  },
  {
    id: '4',
    numero: 'CP-2025-004',
    fornecedor: { id: '4', nome: 'Energia Elétrica SP', cnpj: '45.678.901/0001-23' },
    descricao: 'Fatura Energia - Nov/2025',
    valor: 8500.00,
    dataEmissao: '2025-11-20',
    dataVencimento: '2025-12-05',
    status: 'pendente',
    categoria: 'Utilidades',
    centroCusto: 'Administrativo',
  },
  {
    id: '5',
    numero: 'CP-2025-005',
    fornecedor: { id: '5', nome: 'Transportadora Express', cnpj: '56.789.012/0001-34' },
    descricao: 'Frete Contêineres Cirúrgicos',
    valor: 12300.00,
    valorPago: 6150.00,
    dataEmissao: '2025-11-18',
    dataVencimento: '2025-12-10',
    status: 'parcial',
    categoria: 'Logística',
    centroCusto: 'Operações',
    formaPagamento: 'pix',
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function ContasPagar() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovaContaOpen, setIsNovaContaOpen] = useState(false)
  const [isPagamentoLoteOpen, setIsPagamentoLoteOpen] = useState(false)
  const [contasSelecionadas, setContasSelecionadas] = useState<string[]>([])

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Filtrar contas
  const contasFiltradas = useMemo(() => {
    return MOCK_CONTAS.filter(c => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!c.numero.toLowerCase().includes(query) && 
            !c.fornecedor.nome.toLowerCase().includes(query) &&
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
  const resumo: ResumoFinanceiro = useMemo(() => ({
    totalPendente: MOCK_CONTAS.filter(c => c.status === 'pendente' || c.status === 'aprovada').reduce((acc, c) => acc + c.valor, 0),
    totalVencido: MOCK_CONTAS.filter(c => c.status === 'vencida').reduce((acc, c) => acc + c.valor, 0),
    totalPago: MOCK_CONTAS.filter(c => c.status === 'paga').reduce((acc, c) => acc + (c.valorPago || 0), 0),
    quantidadePendente: MOCK_CONTAS.filter(c => c.status === 'pendente' || c.status === 'aprovada').length,
    quantidadeVencida: MOCK_CONTAS.filter(c => c.status === 'vencida').length,
    mediaAtraso: 5,
    proximosVencimentos: MOCK_CONTAS.filter(c => {
      const venc = new Date(c.dataVencimento)
      const hoje = new Date()
      const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 7 && c.status !== 'paga'
    }).length,
  }), [])

  // Handlers
  const handlePagamentoLote = () => {
    if (contasSelecionadas.length === 0) {
      toast.error('Selecione ao menos uma conta para pagamento em lote')
      return
    }
    setIsPagamentoLoteOpen(true)
  }

  const handleConfirmarPagamentoLote = () => {
    toast.success(`${contasSelecionadas.length} pagamentos enviados para processamento`)
    setIsPagamentoLoteOpen(false)
    setContasSelecionadas([])
  }

  const toggleSelecaoConta = (id: string) => {
    setContasSelecionadas(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getStatusConfig = (status: ContaPagar['status']) => {
    const configs = {
      pendente: { cor: '#F59E0B', texto: 'Pendente', icon: Clock },
      vencida: { cor: '#EF4444', texto: 'Vencida', icon: AlertTriangle },
      paga: { cor: '#10B981', texto: 'Paga', icon: CheckCircle },
      parcial: { cor: '#3B82F6', texto: 'Parcial', icon: TrendingUp },
      aprovada: { cor: '#8B5CF6', texto: 'Aprovada', icon: CheckSquare },
      cancelada: { cor: '#6B7280', texto: 'Cancelada', icon: XCircle },
    }
    return configs[status]
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
            style={{ backgroundColor: '#EF444420' }}
          >
            <Wallet className="w-7 h-7 text-[#EF4444]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Contas a Pagar</h1>
            <p className={textSecondary}>Gestão inteligente de pagamentos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePagamentoLote} className="gap-2">
            <Layers className="w-4 h-4" />
            Pagamento em Lote
          </Button>
          <Button onClick={() => setIsNovaContaOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Pendente</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(resumo.totalPendente)}</p>
                <p className={`text-xs ${textSecondary}`}>{resumo.quantidadePendente} títulos</p>
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
                <p className={`text-xl font-bold text-[#EF4444]`}>{formatCurrency(resumo.totalVencido)}</p>
                <p className={`text-xs ${textSecondary}`}>{resumo.quantidadeVencida} títulos</p>
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
                <p className={`text-xs ${textSecondary}`}>Pago (Mês)</p>
                <p className={`text-xl font-bold text-[#10B981]`}>{formatCurrency(resumo.totalPago)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Próx. 7 dias</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{resumo.proximosVencimentos}</p>
                <p className={`text-xs ${textSecondary}`}>vencimentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="visao-geral" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="titulos" className="gap-2">
            <FileText className="w-4 h-4" />
            Títulos
          </TabsTrigger>
          <TabsTrigger value="aprovacoes" className="gap-2">
            <CheckSquare className="w-4 h-4" />
            Aprovações
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Conciliação
          </TabsTrigger>
          <TabsTrigger value="ia" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            IA Otimização
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
                  {MOCK_CONTAS.filter(c => c.status !== 'paga').slice(0, 4).map((conta) => {
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
                            <p className={`font-medium ${textPrimary}`}>{conta.fornecedor.nome}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              Vence: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${textPrimary}`}>{formatCurrency(conta.valor)}</p>
                          <Badge 
                            className="text-xs"
                            style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                          >
                            {status.texto}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Pagamentos por Forma */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5 text-[#6366F1]" />
                  Formas de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { forma: 'PIX', icon: Zap, valor: 45000, cor: '#10B981' },
                    { forma: 'TED', icon: Send, valor: 89500, cor: '#3B82F6' },
                    { forma: 'Boleto', icon: Receipt, valor: 125000, cor: '#F59E0B' },
                    { forma: 'Débito', icon: CreditCard, valor: 8500, cor: '#8B5CF6' },
                  ].map((item) => (
                    <div 
                      key={item.forma}
                      className={`p-3 rounded-xl ${inputBg} flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${item.cor}20` }}
                        >
                          <item.icon className="w-5 h-5" style={{ color: item.cor }} />
                        </div>
                        <span className={textPrimary}>{item.forma}</span>
                      </div>
                      <span className={`font-bold ${textPrimary}`}>{formatCurrency(item.valor)}</span>
                    </div>
                  ))}
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
                    placeholder="Buscar por número, fornecedor ou descrição..."
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
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                    <SelectItem value="paga">Paga</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
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
                  const isSelected = contasSelecionadas.includes(conta.id)
                  
                  return (
                    <div 
                      key={conta.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} ${isSelected ? 'border-[#6366F1]' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        {conta.status !== 'paga' && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelecaoConta(conta.id)}
                            className="w-5 h-5 rounded border-2 border-slate-400"
                          />
                        )}
                        
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
                          </div>
                          <p className={`text-sm ${textSecondary}`}>{conta.fornecedor.nome}</p>
                          <p className={`text-xs ${textSecondary}`}>{conta.descricao}</p>
                        </div>

                        {/* Valores */}
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(conta.valor)}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            Vence: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        {/* Ações */}
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
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Aprovações */}
        <TabsContent value="aprovacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#8B5CF6]" />
                Aprovações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_CONTAS.filter(c => c.status === 'pendente').map((conta) => (
                  <div 
                    key={conta.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>{conta.fornecedor.nome}</p>
                        <p className={`text-sm ${textSecondary}`}>{conta.descricao}</p>
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          Centro de Custo: {conta.centroCusto} • Categoria: {conta.categoria}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(conta.valor)}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-[#10B981] hover:bg-[#059669]">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="secondary">
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Conciliação */}
        <TabsContent value="conciliacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#3B82F6]" />
                Conciliação Bancária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Saldo Bancário</p>
                  <p className={`text-2xl font-bold text-[#10B981]`}>R$ 458.320,00</p>
                </div>
                <div className={`p-4 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Saldo Sistema</p>
                  <p className={`text-2xl font-bold ${textPrimary}`}>R$ 458.320,00</p>
                </div>
                <div className={`p-4 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Diferença</p>
                  <p className={`text-2xl font-bold text-[#10B981]`}>R$ 0,00</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Importar Extrato OFX
                </Button>
                <Button variant="secondary" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Conciliar Automático
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: IA Otimização */}
        <TabsContent value="ia" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                titulo: 'IA Otimização de Pagamentos',
                descricao: 'Sugere melhor data e forma de pagamento para maximizar descontos',
                icon: Target,
                cor: '#6366F1',
                insight: 'Pagar Zimmer Biomet até 10/12 garante 3% de desconto (R$ 3.750)',
              },
              {
                titulo: 'IA Fluxo de Caixa',
                descricao: 'Prevê necessidade de capital e sugere postergações',
                icon: TrendingUp,
                cor: '#10B981',
                insight: 'Fluxo positivo previsto para próximos 15 dias',
              },
              {
                titulo: 'IA Negociação',
                descricao: 'Identifica oportunidades de renegociação com fornecedores',
                icon: DollarSign,
                cor: '#F59E0B',
                insight: '2 fornecedores com histórico de aceitar parcelamento',
              },
              {
                titulo: 'IA Compliance',
                descricao: 'Verifica conformidade fiscal e tributária',
                icon: CheckSquare,
                cor: '#8B5CF6',
                insight: 'Todas as notas fiscais validadas no SEFAZ',
              },
            ].map((ia) => (
              <Card key={ia.titulo} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${ia.cor}20` }}
                    >
                      <ia.icon className="w-6 h-6" style={{ color: ia.cor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${textPrimary}`}>{ia.titulo}</h3>
                      <p className={`text-sm ${textSecondary} mb-2`}>{ia.descricao}</p>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                        <p className={`text-xs ${textSecondary}`}>
                          <BrainCircuit className="w-3 h-3 inline mr-1 text-[#6366F1]" />
                          {ia.insight}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Pagamento em Lote */}
      <Dialog open={isPagamentoLoteOpen} onOpenChange={setIsPagamentoLoteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#6366F1]" />
              Pagamento em Lote
            </DialogTitle>
            <DialogDescription>
              {contasSelecionadas.length} títulos selecionados para pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className={`p-4 rounded-xl ${inputBg}`}>
              <p className={`text-sm ${textSecondary}`}>Total a Pagar</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {formatCurrency(
                  MOCK_CONTAS
                    .filter(c => contasSelecionadas.includes(c.id))
                    .reduce((acc, c) => acc + c.valor, 0)
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select defaultValue="pix">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="ted">TED</SelectItem>
                  <SelectItem value="doc">DOC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Pagamento</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPagamentoLoteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarPagamentoLote} className="gap-2">
              <Send className="w-4 h-4" />
              Confirmar Pagamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Fornecedor</p>
                  <p className={`font-medium ${textPrimary}`}>{contaSelecionada.fornecedor.nome}</p>
                  <p className={`text-xs ${textSecondary}`}>{contaSelecionada.fornecedor.cnpj}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Valor</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(contaSelecionada.valor)}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl ${inputBg}`}>
                <p className={`text-xs ${textSecondary}`}>Descrição</p>
                <p className={textPrimary}>{contaSelecionada.descricao}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Emissão</p>
                  <p className={textPrimary}>{new Date(contaSelecionada.dataEmissao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Vencimento</p>
                  <p className={textPrimary}>{new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Centro de Custo</p>
                  <p className={textPrimary}>{contaSelecionada.centroCusto}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Categoria</p>
                  <p className={textPrimary}>{contaSelecionada.categoria}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            {contaSelecionada?.status !== 'paga' && (
              <Button className="gap-2">
                <CreditCard className="w-4 h-4" />
                Pagar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nova Conta */}
      <Dialog open={isNovaContaOpen} onOpenChange={setIsNovaContaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Nova Conta a Pagar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Zimmer Biomet Brasil</SelectItem>
                  <SelectItem value="2">Smith & Nephew</SelectItem>
                  <SelectItem value="3">Medtronic</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Centro de Custo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estoque">Estoque</SelectItem>
                    <SelectItem value="operacoes">Operações</SelectItem>
                    <SelectItem value="admin">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opme">Produtos OPME</SelectItem>
                    <SelectItem value="instrumental">Instrumental</SelectItem>
                    <SelectItem value="logistica">Logística</SelectItem>
                    <SelectItem value="utilidades">Utilidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovaContaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Conta a pagar cadastrada com sucesso!')
              setIsNovaContaOpen(false)
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContasPagar

