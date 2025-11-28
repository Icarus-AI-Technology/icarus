/**
 * ICARUS v5.0 - Compras com Integração NFe
 * 
 * Gestão completa de compras com integração SEFAZ e Receita Federal
 * para download automático de NFe e geração de movimentações.
 * 
 * FUNCIONALIDADES:
 * - Integração SEFAZ para busca de NFe
 * - Download automático de PDF/XML
 * - Geração automática de entrada no estoque
 * - Criação de contas a pagar
 * - Envio automático para contador
 * - Reprocessamento por chave
 * - IA para sugestões e negociação
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
  ShoppingCart, FileText, Building2, Calendar, Clock, CheckCircle,
  XCircle, AlertTriangle, TrendingUp, TrendingDown, Search, Filter,
  Download, Upload, Plus, Eye, RefreshCw, BrainCircuit, Zap,
  Send, BarChart3, Target, Layers, Package, Truck, DollarSign,
  Receipt, FileCheck, FileClock, FileWarning, FileX, Globe,
  Database, Mail, Printer, Copy, ExternalLink, Info, AlertCircle,
  ArrowUpRight, ArrowDownRight, Scale, Handshake, Star, StarOff,
  QrCode, Barcode, Box, Boxes, ClipboardList, ClipboardCheck,
  UserCheck, Building, Factory, Store, Warehouse, CreditCard
} from 'lucide-react'

// ============ TIPOS ============

interface NotaFiscalCompra {
  id: string
  chaveAcesso: string
  numero: string
  serie: string
  fornecedor: {
    cnpj: string
    razaoSocial: string
    nomeFantasia?: string
    uf: string
  }
  dataEmissao: string
  dataRecebimento?: string
  valorTotal: number
  valorProdutos: number
  valorFrete: number
  valorDesconto: number
  valorICMS: number
  valorIPI: number
  status: 'pendente' | 'processada' | 'estoque_gerado' | 'pagar_gerado' | 'enviada_contador' | 'erro' | 'cancelada'
  itens: ItemNFe[]
  xmlDisponivel: boolean
  pdfDisponivel: boolean
  observacoes?: string
}

interface ItemNFe {
  id: string
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  valorICMS: number
  valorIPI: number
}

interface PedidoCompra {
  id: string
  numero: string
  fornecedor: string
  cnpjFornecedor: string
  status: 'rascunho' | 'aprovacao' | 'aprovado' | 'enviado' | 'parcial' | 'recebido' | 'cancelado'
  valorTotal: number
  dataCriacao: string
  dataAprovacao?: string
  previsaoEntrega?: string
  itens: ItemPedido[]
  aprovador?: string
}

interface ItemPedido {
  id: string
  produto: string
  codigo: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  quantidadeRecebida?: number
}

interface Fornecedor {
  id: string
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  categoria: string
  avaliacao: number
  totalCompras: number
  ultimaCompra?: string
  prazoMedio: number
  condicaoPagamento: string
  status: 'ativo' | 'inativo' | 'bloqueado'
}

interface SugestaoIA {
  id: string
  tipo: 'complemento' | 'negociacao' | 'fornecedor' | 'demanda'
  titulo: string
  descricao: string
  impacto: 'alto' | 'medio' | 'baixo'
  economia?: number
  confianca: number
}

// ============ DADOS MOCK ============

const MOCK_NOTAS: NotaFiscalCompra[] = [
  {
    id: '1',
    chaveAcesso: '35251112345678000190550010000001231234567890',
    numero: '000123',
    serie: '1',
    fornecedor: {
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'Zimmer Biomet Brasil Ltda',
      nomeFantasia: 'Zimmer Biomet',
      uf: 'SP',
    },
    dataEmissao: '2025-11-25',
    dataRecebimento: '2025-11-27',
    valorTotal: 125000.00,
    valorProdutos: 120000.00,
    valorFrete: 5000.00,
    valorDesconto: 0,
    valorICMS: 21600.00,
    valorIPI: 12000.00,
    status: 'estoque_gerado',
    itens: [
      { id: '1', codigo: 'PROT-001', descricao: 'Prótese Total de Quadril', ncm: '9021.31.10', cfop: '1102', unidade: 'UN', quantidade: 5, valorUnitario: 14000, valorTotal: 70000, valorICMS: 12600, valorIPI: 7000 },
      { id: '2', codigo: 'PROT-002', descricao: 'Prótese Total de Joelho', ncm: '9021.31.20', cfop: '1102', unidade: 'UN', quantidade: 2, valorUnitario: 25000, valorTotal: 50000, valorICMS: 9000, valorIPI: 5000 },
    ],
    xmlDisponivel: true,
    pdfDisponivel: true,
  },
  {
    id: '2',
    chaveAcesso: '35251123456789000101550010000004564567890123',
    numero: '000456',
    serie: '1',
    fornecedor: {
      cnpj: '23.456.789/0001-01',
      razaoSocial: 'Smith & Nephew do Brasil Ltda',
      nomeFantasia: 'Smith & Nephew',
      uf: 'RJ',
    },
    dataEmissao: '2025-11-26',
    valorTotal: 89500.00,
    valorProdutos: 85000.00,
    valorFrete: 4500.00,
    valorDesconto: 0,
    valorICMS: 15300.00,
    valorIPI: 8500.00,
    status: 'pendente',
    itens: [
      { id: '3', codigo: 'ART-001', descricao: 'Kit Artroscopia Joelho', ncm: '9018.90.99', cfop: '2102', unidade: 'KIT', quantidade: 3, valorUnitario: 28333.33, valorTotal: 85000, valorICMS: 15300, valorIPI: 8500 },
    ],
    xmlDisponivel: true,
    pdfDisponivel: false,
  },
  {
    id: '3',
    chaveAcesso: '35251134567890000112550010000007897890123456',
    numero: '000789',
    serie: '1',
    fornecedor: {
      cnpj: '34.567.890/0001-12',
      razaoSocial: 'Medtronic Comercial Ltda',
      nomeFantasia: 'Medtronic',
      uf: 'SP',
    },
    dataEmissao: '2025-11-20',
    dataRecebimento: '2025-11-22',
    valorTotal: 156000.00,
    valorProdutos: 150000.00,
    valorFrete: 6000.00,
    valorDesconto: 0,
    valorICMS: 27000.00,
    valorIPI: 15000.00,
    status: 'enviada_contador',
    itens: [
      { id: '4', codigo: 'COL-001', descricao: 'Sistema Fixação Coluna', ncm: '9021.10.10', cfop: '1102', unidade: 'KIT', quantidade: 2, valorUnitario: 75000, valorTotal: 150000, valorICMS: 27000, valorIPI: 15000 },
    ],
    xmlDisponivel: true,
    pdfDisponivel: true,
  },
]

const MOCK_PEDIDOS: PedidoCompra[] = [
  {
    id: '1',
    numero: 'PC-2025-001',
    fornecedor: 'Zimmer Biomet',
    cnpjFornecedor: '12.345.678/0001-90',
    status: 'enviado',
    valorTotal: 250000.00,
    dataCriacao: '2025-11-20',
    dataAprovacao: '2025-11-21',
    previsaoEntrega: '2025-12-05',
    itens: [
      { id: '1', produto: 'Prótese Total de Quadril', codigo: 'PROT-001', quantidade: 10, valorUnitario: 14000, valorTotal: 140000 },
      { id: '2', produto: 'Prótese Total de Joelho', codigo: 'PROT-002', quantidade: 4, valorUnitario: 25000, valorTotal: 100000, quantidadeRecebida: 2 },
    ],
    aprovador: 'João Silva',
  },
  {
    id: '2',
    numero: 'PC-2025-002',
    fornecedor: 'Smith & Nephew',
    cnpjFornecedor: '23.456.789/0001-01',
    status: 'aprovacao',
    valorTotal: 85000.00,
    dataCriacao: '2025-11-25',
    itens: [
      { id: '3', produto: 'Kit Artroscopia', codigo: 'ART-001', quantidade: 3, valorUnitario: 28333.33, valorTotal: 85000 },
    ],
  },
]

const MOCK_FORNECEDORES: Fornecedor[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Zimmer Biomet Brasil Ltda',
    nomeFantasia: 'Zimmer Biomet',
    categoria: 'Implantes Ortopédicos',
    avaliacao: 4.8,
    totalCompras: 2500000,
    ultimaCompra: '2025-11-25',
    prazoMedio: 30,
    condicaoPagamento: '30/60/90 DDL',
    status: 'ativo',
  },
  {
    id: '2',
    cnpj: '23.456.789/0001-01',
    razaoSocial: 'Smith & Nephew do Brasil Ltda',
    nomeFantasia: 'Smith & Nephew',
    categoria: 'Material Cirúrgico',
    avaliacao: 4.5,
    totalCompras: 1800000,
    ultimaCompra: '2025-11-26',
    prazoMedio: 28,
    condicaoPagamento: '30/45 DDL',
    status: 'ativo',
  },
  {
    id: '3',
    cnpj: '34.567.890/0001-12',
    razaoSocial: 'Medtronic Comercial Ltda',
    nomeFantasia: 'Medtronic',
    categoria: 'Neurocirurgia',
    avaliacao: 4.9,
    totalCompras: 3200000,
    ultimaCompra: '2025-11-20',
    prazoMedio: 45,
    condicaoPagamento: '30/60 DDL',
    status: 'ativo',
  },
]

const MOCK_SUGESTOES_IA: SugestaoIA[] = [
  {
    id: '1',
    tipo: 'complemento',
    titulo: 'Complemento de Pedido Sugerido',
    descricao: 'Baseado no consumo dos últimos 3 meses, sugerimos adicionar 5 unidades de Parafusos Pediculares ao próximo pedido.',
    impacto: 'medio',
    economia: 2500,
    confianca: 89,
  },
  {
    id: '2',
    tipo: 'negociacao',
    titulo: 'Oportunidade de Negociação',
    descricao: 'Volume de compras com Zimmer Biomet permite negociar desconto de 5% no próximo pedido.',
    impacto: 'alto',
    economia: 12500,
    confianca: 92,
  },
  {
    id: '3',
    tipo: 'fornecedor',
    titulo: 'Fornecedor Alternativo',
    descricao: 'Stryker oferece produto equivalente com preço 8% menor e mesmo prazo de entrega.',
    impacto: 'alto',
    economia: 8500,
    confianca: 85,
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function ComprasNFe() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscalCompra | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovoPedidoOpen, setIsNovoPedidoOpen] = useState(false)
  const [isBuscarNFeOpen, setIsBuscarNFeOpen] = useState(false)
  const [isReprocessarOpen, setIsReprocessarOpen] = useState(false)
  const [chaveReprocessar, setChaveReprocessar] = useState('')
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

  const formatCompact = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
    return formatCurrency(value)
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      pendente: { cor: '#F59E0B', texto: 'Pendente', icon: Clock },
      processada: { cor: '#3B82F6', texto: 'Processada', icon: CheckCircle },
      estoque_gerado: { cor: '#10B981', texto: 'Estoque Gerado', icon: Package },
      pagar_gerado: { cor: '#8B5CF6', texto: 'Pagar Gerado', icon: CreditCard },
      enviada_contador: { cor: '#10B981', texto: 'Enviada Contador', icon: Send },
      erro: { cor: '#EF4444', texto: 'Erro', icon: XCircle },
      cancelada: { cor: '#6B7280', texto: 'Cancelada', icon: XCircle },
      rascunho: { cor: '#6B7280', texto: 'Rascunho', icon: FileText },
      aprovacao: { cor: '#F59E0B', texto: 'Em Aprovação', icon: Clock },
      aprovado: { cor: '#10B981', texto: 'Aprovado', icon: CheckCircle },
      enviado: { cor: '#3B82F6', texto: 'Enviado', icon: Send },
      parcial: { cor: '#8B5CF6', texto: 'Parcial', icon: Layers },
      recebido: { cor: '#10B981', texto: 'Recebido', icon: CheckCircle },
      ativo: { cor: '#10B981', texto: 'Ativo', icon: CheckCircle },
      inativo: { cor: '#6B7280', texto: 'Inativo', icon: XCircle },
      bloqueado: { cor: '#EF4444', texto: 'Bloqueado', icon: AlertTriangle },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  // Resumo
  const resumo = useMemo(() => {
    const totalComprasMes = MOCK_NOTAS.reduce((acc, n) => acc + n.valorTotal, 0)
    const notasPendentes = MOCK_NOTAS.filter(n => n.status === 'pendente').length
    const pedidosAbertos = MOCK_PEDIDOS.filter(p => p.status !== 'recebido' && p.status !== 'cancelado').length
    
    return {
      totalComprasMes,
      notasPendentes,
      pedidosAbertos,
      fornecedoresAtivos: MOCK_FORNECEDORES.filter(f => f.status === 'ativo').length,
    }
  }, [])

  // Handlers
  const handleSincronizarNFe = async () => {
    setIsSincronizando(true)
    toast.info('Sincronizando notas fiscais com SEFAZ...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSincronizando(false)
    toast.success('Sincronização concluída! 3 novas NFe encontradas.')
  }

  const handleProcessarNota = (nota: NotaFiscalCompra) => {
    toast.success(`Nota ${nota.numero} processada com sucesso!`)
  }

  const handleGerarEstoque = (nota: NotaFiscalCompra) => {
    toast.success(`Entrada no estoque gerada para nota ${nota.numero}`)
  }

  const handleGerarContasPagar = (nota: NotaFiscalCompra) => {
    toast.success(`Conta a pagar gerada para nota ${nota.numero}`)
  }

  const handleEnviarContador = (nota: NotaFiscalCompra) => {
    toast.success(`Nota ${nota.numero} enviada para o contador`)
  }

  const handleReprocessar = () => {
    if (!chaveReprocessar || chaveReprocessar.length !== 44) {
      toast.error('Chave de acesso inválida. Deve conter 44 dígitos.')
      return
    }
    toast.success('NFe reprocessada com sucesso!')
    setIsReprocessarOpen(false)
    setChaveReprocessar('')
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
            style={{ backgroundColor: '#F59E0B20' }}
          >
            <ShoppingCart className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Compras</h1>
            <p className={textSecondary}>Integração SEFAZ • NFe Automática • IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={handleSincronizarNFe}
            disabled={isSincronizando}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSincronizando ? 'animate-spin' : ''}`} />
            Sincronizar SEFAZ
          </Button>
          <Button variant="secondary" onClick={() => setIsReprocessarOpen(true)} className="gap-2">
            <QrCode className="w-4 h-4" />
            Reprocessar
          </Button>
          <Button onClick={() => setIsNovoPedidoOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Compras (Mês)</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(resumo.totalComprasMes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>NFe Pendentes</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.notasPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Pedidos Abertos</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.pedidosAbertos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Fornecedores</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.fornecedoresAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="nfe" className="gap-2">
            <FileText className="w-4 h-4" />
            Notas Fiscais
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="gap-2">
            <Building2 className="w-4 h-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="sugestoes" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Sugestões IA
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Últimas NFe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                  Últimas Notas Fiscais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_NOTAS.slice(0, 3).map((nota) => {
                    const status = getStatusConfig(nota.status)
                    const StatusIcon = status.icon
                    return (
                      <div 
                        key={nota.id}
                        className={`p-3 rounded-xl ${inputBg} cursor-pointer hover:opacity-80`}
                        onClick={() => {
                          setNotaSelecionada(nota)
                          setIsDetalhesOpen(true)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${textPrimary}`}>NF {nota.numero}</span>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>{nota.fornecedor.nomeFantasia || nota.fornecedor.razaoSocial}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <p className={`font-bold ${textPrimary}`}>{formatCurrency(nota.valorTotal)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Pedidos em Aberto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="w-5 h-5 text-[#3B82F6]" />
                  Pedidos em Aberto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_PEDIDOS.filter(p => p.status !== 'recebido' && p.status !== 'cancelado').map((pedido) => {
                    const status = getStatusConfig(pedido.status)
                    const StatusIcon = status.icon
                    return (
                      <div 
                        key={pedido.id}
                        className={`p-3 rounded-xl ${inputBg}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${textPrimary}`}>{pedido.numero}</span>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>{pedido.fornecedor}</p>
                            {pedido.previsaoEntrega && (
                              <p className={`text-xs ${textSecondary}`}>
                                <Truck className="w-3 h-3 inline mr-1" />
                                Entrega: {new Date(pedido.previsaoEntrega).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <p className={`font-bold ${textPrimary}`}>{formatCurrency(pedido.valorTotal)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sugestões IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Sugestões Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MOCK_SUGESTOES_IA.map((sug) => (
                  <div 
                    key={sug.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary} mb-1`}>{sug.titulo}</h4>
                        <p className={`text-xs ${textSecondary} mb-2`}>{sug.descricao}</p>
                        {sug.economia && (
                          <p className="text-sm text-[#10B981] font-medium">
                            Economia: {formatCurrency(sug.economia)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: NFe */}
        <TabsContent value="nfe" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por número, fornecedor ou chave..."
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
                    <SelectItem value="processada">Processada</SelectItem>
                    <SelectItem value="estoque_gerado">Estoque Gerado</SelectItem>
                    <SelectItem value="enviada_contador">Enviada Contador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de NFe */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {MOCK_NOTAS.map((nota) => {
                  const status = getStatusConfig(nota.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={nota.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>NF {nota.numero} / {nota.serie}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            {nota.xmlDisponivel && (
                              <Badge className="bg-green-500/20 text-green-500 text-xs">XML</Badge>
                            )}
                            {nota.pdfDisponivel && (
                              <Badge className="bg-blue-500/20 text-blue-500 text-xs">PDF</Badge>
                            )}
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{nota.fornecedor.nomeFantasia || nota.fornecedor.razaoSocial}</p>
                          <p className={`text-sm ${textSecondary}`}>{nota.fornecedor.cnpj}</p>
                          <p className={`text-xs ${textSecondary} mt-1`}>
                            Emissão: {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                            {nota.dataRecebimento && ` • Recebido: ${new Date(nota.dataRecebimento).toLocaleDateString('pt-BR')}`}
                          </p>
                          <p className={`text-xs ${textSecondary} font-mono mt-1`}>
                            Chave: {nota.chaveAcesso.substring(0, 22)}...
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(nota.valorTotal)}</p>
                          <p className={`text-xs ${textSecondary}`}>{nota.itens.length} itens</p>
                          <div className="flex gap-2 mt-3 justify-end">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => {
                                setNotaSelecionada(nota)
                                setIsDetalhesOpen(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {nota.xmlDisponivel && (
                              <Button variant="secondary" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {nota.status === 'pendente' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={() => handleGerarEstoque(nota)}
                                >
                                  <Package className="w-4 h-4" />
                                  Estoque
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => handleGerarContasPagar(nota)}
                                >
                                  <CreditCard className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {nota.status === 'estoque_gerado' && (
                              <Button 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleEnviarContador(nota)}
                              >
                                <Send className="w-4 h-4" />
                                Contador
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pedidos */}
        <TabsContent value="pedidos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#3B82F6]" />
                Pedidos de Compra
              </CardTitle>
              <Button onClick={() => setIsNovoPedidoOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Pedido
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_PEDIDOS.map((pedido) => {
                  const status = getStatusConfig(pedido.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={pedido.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{pedido.numero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{pedido.fornecedor}</p>
                          <p className={`text-sm ${textSecondary}`}>{pedido.cnpjFornecedor}</p>
                          <div className={`text-xs ${textSecondary} mt-2 flex gap-4`}>
                            <span>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Criado: {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}
                            </span>
                            {pedido.previsaoEntrega && (
                              <span>
                                <Truck className="w-3 h-3 inline mr-1" />
                                Entrega: {new Date(pedido.previsaoEntrega).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(pedido.valorTotal)}</p>
                          <p className={`text-xs ${textSecondary}`}>{pedido.itens.length} itens</p>
                          <div className="flex gap-2 mt-3 justify-end">
                            <Button variant="secondary" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {pedido.status === 'aprovacao' && (
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Aprovar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Fornecedores */}
        <TabsContent value="fornecedores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#10B981]" />
                Fornecedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_FORNECEDORES.map((fornecedor) => {
                  const status = getStatusConfig(fornecedor.status)
                  return (
                    <div 
                      key={fornecedor.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                            <Factory className="w-6 h-6 text-[#6366F1]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold ${textPrimary}`}>{fornecedor.nomeFantasia || fornecedor.razaoSocial}</span>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>{fornecedor.cnpj}</p>
                            <p className={`text-xs ${textSecondary}`}>{fornecedor.categoria}</p>
                            <div className="flex items-center gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${star <= Math.floor(fornecedor.avaliacao) ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-400'}`}
                                />
                              ))}
                              <span className={`text-sm ${textSecondary} ml-1`}>{fornecedor.avaliacao}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(fornecedor.totalCompras)}</p>
                          <p className={`text-xs ${textSecondary}`}>Total Compras</p>
                          <p className={`text-xs ${textSecondary} mt-1`}>
                            Prazo: {fornecedor.prazoMedio} dias
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            {fornecedor.condicaoPagamento}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sugestões IA */}
        <TabsContent value="sugestoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Sugestões Inteligentes de Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_SUGESTOES_IA.map((sug) => {
                  const impactoConfig: Record<string, { cor: string; texto: string }> = {
                    alto: { cor: '#EF4444', texto: 'Alto' },
                    medio: { cor: '#F59E0B', texto: 'Médio' },
                    baixo: { cor: '#10B981', texto: 'Baixo' },
                  }
                  const impacto = impactoConfig[sug.impacto]
                  const tipoIcon = {
                    complemento: Package,
                    negociacao: Handshake,
                    fornecedor: Building2,
                    demanda: TrendingUp,
                  }[sug.tipo] || Zap
                  const TipoIcon = tipoIcon
                  
                  return (
                    <div 
                      key={sug.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                            <TipoIcon className="w-5 h-5 text-[#8B5CF6]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${textPrimary}`}>{sug.titulo}</h4>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${impacto.cor}20`, color: impacto.cor }}
                              >
                                Impacto {impacto.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary} mb-2`}>{sug.descricao}</p>
                            <div className="flex items-center gap-4">
                              {sug.economia && (
                                <span className="text-sm text-[#10B981] font-medium">
                                  <TrendingDown className="w-4 h-4 inline mr-1" />
                                  Economia: {formatCurrency(sug.economia)}
                                </span>
                              )}
                              <span className={`text-xs ${textSecondary}`}>
                                <Target className="w-3 h-3 inline mr-1" />
                                Confiança: {sug.confianca}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes da NFe */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              NF {notaSelecionada?.numero} / {notaSelecionada?.serie}
            </DialogTitle>
          </DialogHeader>

          {notaSelecionada && (
            <div className="space-y-4 py-4">
              {/* Fornecedor */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-[#6366F1]" />
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{notaSelecionada.fornecedor.nomeFantasia || notaSelecionada.fornecedor.razaoSocial}</p>
                    <p className={`text-xs ${textSecondary}`}>{notaSelecionada.fornecedor.cnpj} • {notaSelecionada.fornecedor.uf}</p>
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Produtos</p>
                  <p className={`font-bold ${textPrimary}`}>{formatCurrency(notaSelecionada.valorProdutos)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Frete</p>
                  <p className={`font-bold ${textPrimary}`}>{formatCurrency(notaSelecionada.valorFrete)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>ICMS</p>
                  <p className={`font-bold ${textPrimary}`}>{formatCurrency(notaSelecionada.valorICMS)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Total</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(notaSelecionada.valorTotal)}</p>
                </div>
              </div>

              {/* Itens */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-3`}>Itens ({notaSelecionada.itens.length})</h4>
                <div className="space-y-2">
                  {notaSelecionada.itens.map((item) => (
                    <div key={item.id} className={`p-3 rounded-xl ${inputBg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{item.descricao}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            NCM: {item.ncm} • CFOP: {item.cfop} • {item.quantidade} {item.unidade}
                          </p>
                        </div>
                        <p className={`font-bold ${textPrimary}`}>{formatCurrency(item.valorTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chave de Acesso */}
              <div className={`p-3 rounded-xl ${inputBg}`}>
                <p className={`text-xs ${textSecondary} mb-1`}>Chave de Acesso</p>
                <div className="flex items-center gap-2">
                  <code className={`text-xs ${textPrimary} font-mono flex-1`}>{notaSelecionada.chaveAcesso}</code>
                  <Button variant="secondary" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            {notaSelecionada?.xmlDisponivel && (
              <Button variant="secondary" className="gap-2">
                <Download className="w-4 h-4" />
                Download XML
              </Button>
            )}
            {notaSelecionada?.status === 'pendente' && (
              <Button onClick={() => {
                handleGerarEstoque(notaSelecionada)
                setIsDetalhesOpen(false)
              }} className="gap-2">
                <Package className="w-4 h-4" />
                Gerar Estoque
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Reprocessar NFe */}
      <Dialog open={isReprocessarOpen} onOpenChange={setIsReprocessarOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#6366F1]" />
              Reprocessar NFe por Chave
            </DialogTitle>
            <DialogDescription>
              Informe a chave de acesso de 44 dígitos para reprocessar a nota fiscal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chave de Acesso</Label>
              <Input 
                placeholder="00000000000000000000000000000000000000000000"
                value={chaveReprocessar}
                onChange={(e) => setChaveReprocessar(e.target.value.replace(/\D/g, '').substring(0, 44))}
                className="font-mono"
              />
              <p className={`text-xs ${textSecondary}`}>
                {chaveReprocessar.length}/44 dígitos
              </p>
            </div>

            <div className={`p-3 rounded-xl ${inputBg}`}>
              <p className={`text-sm ${textSecondary}`}>
                <Info className="w-4 h-4 inline mr-2" />
                A nota será buscada na SEFAZ e reprocessada automaticamente.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsReprocessarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReprocessar} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reprocessar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Pedido */}
      <Dialog open={isNovoPedidoOpen} onOpenChange={setIsNovoPedidoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Novo Pedido de Compra
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
                  {MOCK_FORNECEDORES.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.nomeFantasia || f.razaoSocial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condição de Pagamento</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avista">À Vista</SelectItem>
                  <SelectItem value="30">30 DDL</SelectItem>
                  <SelectItem value="30-60">30/60 DDL</SelectItem>
                  <SelectItem value="30-60-90">30/60/90 DDL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Observações do pedido..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovoPedidoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Pedido criado! Adicione os itens.')
              setIsNovoPedidoOpen(false)
            }}>
              Criar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ComprasNFe

