/**
 * ICARUS v5.0 - Gestão de Contratos com Medição Automática
 * 
 * Gestão completa de contratos com hospitais, convênios e fornecedores,
 * incluindo medição automática e validação cross-branch via pgvector.
 * 
 * FUNCIONALIDADES:
 * - Cadastro de contratos (hospitais, convênios, fornecedores)
 * - Medição automática de consumo
 * - Validação cross-branch via IA (AutoCorrector Agent)
 * - Alertas de vencimento e renovação
 * - Análise de performance por contrato
 * - Histórico de aditivos
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import {
  FileText, FileSignature, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, TrendingDown, Search, Filter, Download,
  Plus, Eye, Edit, Trash2, RefreshCw, BrainCircuit, Activity,
  Building2, Building, Users, DollarSign, Percent, Target, Zap,
  Bell, Shield, ShieldCheck, ShieldAlert, ClipboardList, ClipboardCheck,
  ArrowUpRight, ArrowDownRight, MoreVertical, ExternalLink, Printer,
  FileCheck, FileClock, FileWarning, FileX, Gauge, BarChart3, Scale,
  Handshake, Calculator, Receipt, Wallet, PiggyBank, Banknote
} from 'lucide-react'

// ============ TIPOS ============

interface Contrato {
  id: string
  numero: string
  tipo: 'hospital' | 'convenio' | 'fornecedor' | 'prestador'
  parceiro: {
    nome: string
    cnpj: string
    tipo: string
  }
  objeto: string
  valorTotal: number
  valorMensal?: number
  dataInicio: string
  dataFim: string
  status: 'ativo' | 'vencido' | 'suspenso' | 'encerrado' | 'renovacao'
  tipoCobranca: 'fixo' | 'variavel' | 'misto'
  medicaoAutomatica: boolean
  ultimaMedicao?: string
  consumoMes: number
  metaMensal?: number
  percentualMeta?: number
  alertas: number
  aditivos: number
  responsavel: string
  observacoes?: string
}

interface Medicao {
  id: string
  contratoId: string
  contratoNumero: string
  parceiro: string
  periodo: string
  valorMedido: number
  quantidadeItens: number
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'auditoria'
  dataGeracao: string
  dataAprovacao?: string
  aprovadoPor?: string
  divergencias?: number
  observacoes?: string
}

interface Aditivo {
  id: string
  contratoId: string
  numero: string
  tipo: 'valor' | 'prazo' | 'escopo' | 'reajuste'
  descricao: string
  valorAnterior?: number
  valorNovo?: number
  dataAnterior?: string
  dataNova?: string
  dataAssinatura: string
  status: 'vigente' | 'vencido' | 'cancelado'
}

interface AlertaContrato {
  id: string
  contratoId: string
  contratoNumero: string
  tipo: 'vencimento' | 'renovacao' | 'meta' | 'divergencia' | 'pagamento'
  severidade: 'critico' | 'alto' | 'medio' | 'baixo'
  mensagem: string
  dataAlerta: string
  status: 'ativo' | 'reconhecido' | 'resolvido'
  diasRestantes?: number
}

// ============ DADOS MOCK ============

const MOCK_CONTRATOS: Contrato[] = [
  {
    id: '1',
    numero: 'CTR-2024-001',
    tipo: 'hospital',
    parceiro: {
      nome: 'Hospital São Lucas',
      cnpj: '12.345.678/0001-90',
      tipo: 'Hospital Privado',
    },
    objeto: 'Fornecimento de materiais OPME para cirurgias ortopédicas',
    valorTotal: 2400000,
    valorMensal: 200000,
    dataInicio: '2024-01-01',
    dataFim: '2025-12-31',
    status: 'ativo',
    tipoCobranca: 'variavel',
    medicaoAutomatica: true,
    ultimaMedicao: '2025-11-25',
    consumoMes: 185000,
    metaMensal: 200000,
    percentualMeta: 92.5,
    alertas: 0,
    aditivos: 2,
    responsavel: 'João Silva',
  },
  {
    id: '2',
    numero: 'CTR-2024-002',
    tipo: 'convenio',
    parceiro: {
      nome: 'Unimed São Paulo',
      cnpj: '23.456.789/0001-01',
      tipo: 'Operadora de Saúde',
    },
    objeto: 'Credenciamento para fornecimento de OPME',
    valorTotal: 5000000,
    dataInicio: '2024-03-01',
    dataFim: '2026-02-28',
    status: 'ativo',
    tipoCobranca: 'variavel',
    medicaoAutomatica: true,
    ultimaMedicao: '2025-11-28',
    consumoMes: 420000,
    metaMensal: 400000,
    percentualMeta: 105,
    alertas: 1,
    aditivos: 1,
    responsavel: 'Maria Santos',
  },
  {
    id: '3',
    numero: 'CTR-2023-015',
    tipo: 'fornecedor',
    parceiro: {
      nome: 'Zimmer Biomet Brasil',
      cnpj: '34.567.890/0001-12',
      tipo: 'Fabricante OPME',
    },
    objeto: 'Fornecimento exclusivo de próteses de quadril e joelho',
    valorTotal: 3600000,
    valorMensal: 300000,
    dataInicio: '2023-06-01',
    dataFim: '2025-05-31',
    status: 'renovacao',
    tipoCobranca: 'misto',
    medicaoAutomatica: false,
    consumoMes: 280000,
    metaMensal: 300000,
    percentualMeta: 93.3,
    alertas: 2,
    aditivos: 3,
    responsavel: 'Carlos Oliveira',
    observacoes: 'Em processo de renovação - negociação de novos valores',
  },
  {
    id: '4',
    numero: 'CTR-2024-008',
    tipo: 'hospital',
    parceiro: {
      nome: 'Hospital Albert Einstein',
      cnpj: '45.678.901/0001-23',
      tipo: 'Hospital Privado',
    },
    objeto: 'Consignação de materiais OPME',
    valorTotal: 1800000,
    valorMensal: 150000,
    dataInicio: '2024-07-01',
    dataFim: '2025-06-30',
    status: 'ativo',
    tipoCobranca: 'variavel',
    medicaoAutomatica: true,
    ultimaMedicao: '2025-11-27',
    consumoMes: 165000,
    metaMensal: 150000,
    percentualMeta: 110,
    alertas: 0,
    aditivos: 0,
    responsavel: 'Ana Beatriz',
  },
]

const MOCK_MEDICOES: Medicao[] = [
  { id: '1', contratoId: '1', contratoNumero: 'CTR-2024-001', parceiro: 'Hospital São Lucas', periodo: 'Novembro/2025', valorMedido: 185000, quantidadeItens: 45, status: 'aprovada', dataGeracao: '2025-11-25', dataAprovacao: '2025-11-26', aprovadoPor: 'João Silva' },
  { id: '2', contratoId: '2', contratoNumero: 'CTR-2024-002', parceiro: 'Unimed São Paulo', periodo: 'Novembro/2025', valorMedido: 420000, quantidadeItens: 98, status: 'pendente', dataGeracao: '2025-11-28', divergencias: 3 },
  { id: '3', contratoId: '4', contratoNumero: 'CTR-2024-008', parceiro: 'Hospital Albert Einstein', periodo: 'Novembro/2025', valorMedido: 165000, quantidadeItens: 38, status: 'aprovada', dataGeracao: '2025-11-27', dataAprovacao: '2025-11-27', aprovadoPor: 'Ana Beatriz' },
  { id: '4', contratoId: '1', contratoNumero: 'CTR-2024-001', parceiro: 'Hospital São Lucas', periodo: 'Outubro/2025', valorMedido: 198000, quantidadeItens: 52, status: 'aprovada', dataGeracao: '2025-10-25', dataAprovacao: '2025-10-26', aprovadoPor: 'João Silva' },
]

const MOCK_ALERTAS: AlertaContrato[] = [
  { id: '1', contratoId: '3', contratoNumero: 'CTR-2023-015', tipo: 'vencimento', severidade: 'critico', mensagem: 'Contrato vence em 6 meses - iniciar renovação', dataAlerta: '2025-11-28', status: 'ativo', diasRestantes: 184 },
  { id: '2', contratoId: '2', contratoNumero: 'CTR-2024-002', tipo: 'divergencia', severidade: 'medio', mensagem: '3 divergências na medição de Novembro', dataAlerta: '2025-11-28', status: 'ativo' },
  { id: '3', contratoId: '3', contratoNumero: 'CTR-2023-015', tipo: 'meta', severidade: 'baixo', mensagem: 'Consumo 6.7% abaixo da meta mensal', dataAlerta: '2025-11-25', status: 'reconhecido' },
]

const MOCK_CONSUMO_MENSAL = [
  { mes: 'Jun', valor: 920000 },
  { mes: 'Jul', valor: 985000 },
  { mes: 'Ago', valor: 1020000 },
  { mes: 'Set', valor: 998000 },
  { mes: 'Out', valor: 1050000 },
  { mes: 'Nov', valor: 1035000 },
]

const MOCK_DISTRIBUICAO_TIPO = [
  { tipo: 'Hospital', valor: 550000, cor: '#6366F1' },
  { tipo: 'Convênio', valor: 420000, cor: '#10B981' },
  { tipo: 'Fornecedor', valor: 65000, cor: '#F59E0B' },
]

// ============ COMPONENTE PRINCIPAL ============

export function GestaoContratos() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('contratos')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovoContratoOpen, setIsNovoContratoOpen] = useState(false)
  const [isNovaMedicaoOpen, setIsNovaMedicaoOpen] = useState(false)

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
      ativo: { cor: '#10B981', texto: 'Ativo', icon: CheckCircle },
      vencido: { cor: '#EF4444', texto: 'Vencido', icon: XCircle },
      suspenso: { cor: '#F59E0B', texto: 'Suspenso', icon: AlertTriangle },
      encerrado: { cor: '#6B7280', texto: 'Encerrado', icon: XCircle },
      renovacao: { cor: '#3B82F6', texto: 'Em Renovação', icon: RefreshCw },
      pendente: { cor: '#F59E0B', texto: 'Pendente', icon: Clock },
      aprovada: { cor: '#10B981', texto: 'Aprovada', icon: CheckCircle },
      rejeitada: { cor: '#EF4444', texto: 'Rejeitada', icon: XCircle },
      auditoria: { cor: '#8B5CF6', texto: 'Em Auditoria', icon: Eye },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: FileText }
  }

  const getTipoConfig = (tipo: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      hospital: { cor: '#6366F1', texto: 'Hospital', icon: Building2 },
      convenio: { cor: '#10B981', texto: 'Convênio', icon: Shield },
      fornecedor: { cor: '#F59E0B', texto: 'Fornecedor', icon: Building },
      prestador: { cor: '#8B5CF6', texto: 'Prestador', icon: Users },
    }
    return configs[tipo] || { cor: '#6B7280', texto: tipo, icon: FileText }
  }

  const getSeveridadeConfig = (severidade: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      critico: { cor: '#EF4444', texto: 'Crítico' },
      alto: { cor: '#F59E0B', texto: 'Alto' },
      medio: { cor: '#3B82F6', texto: 'Médio' },
      baixo: { cor: '#10B981', texto: 'Baixo' },
    }
    return configs[severidade] || { cor: '#6B7280', texto: severidade }
  }

  // Filtrar contratos
  const contratosFiltrados = useMemo(() => {
    return MOCK_CONTRATOS.filter(c => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!c.numero.toLowerCase().includes(query) &&
            !c.parceiro.nome.toLowerCase().includes(query) &&
            !c.objeto.toLowerCase().includes(query)) {
          return false
        }
      }
      if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false
      if (filtroStatus !== 'todos' && c.status !== filtroStatus) return false
      return true
    })
  }, [searchQuery, filtroTipo, filtroStatus])

  // Resumo
  const resumo = useMemo(() => {
    const totalValor = MOCK_CONTRATOS.reduce((acc, c) => acc + (c.consumoMes || 0), 0)
    return {
      totalContratos: MOCK_CONTRATOS.length,
      contratosAtivos: MOCK_CONTRATOS.filter(c => c.status === 'ativo').length,
      valorMensal: totalValor,
      alertasAtivos: MOCK_ALERTAS.filter(a => a.status === 'ativo').length,
      medicoesPendentes: MOCK_MEDICOES.filter(m => m.status === 'pendente').length,
      taxaCumprimentoMeta: Math.round(MOCK_CONTRATOS.reduce((acc, c) => acc + (c.percentualMeta || 0), 0) / MOCK_CONTRATOS.length),
    }
  }, [])

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1A1F35]' : 'bg-white'} shadow-lg border ${borderColor}`}>
          <p className={`font-medium ${textPrimary}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={textSecondary} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
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
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDark
                ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
                : 'bg-slate-100'
            }`}
            style={{ backgroundColor: '#6366F120' }}
          >
            <FileSignature className="w-7 h-7 text-[#6366F1]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Gestão de Contratos</h1>
            <p className={textSecondary}>Medição Automática • Validação IA • Alertas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsNovaMedicaoOpen(true)} className="gap-2">
            <Calculator className="w-4 h-4" />
            Nova Medição
          </Button>
          <Button onClick={() => setIsNovoContratoOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Contratos</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.totalContratos}</p>
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
                <p className={`text-xs ${textSecondary}`}>Ativos</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.contratosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Consumo Mês</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(resumo.valorMensal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Alertas</p>
                <p className={`text-2xl font-bold text-[#EF4444]`}>{resumo.alertasAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Medições Pend.</p>
                <p className={`text-2xl font-bold text-[#3B82F6]`}>{resumo.medicoesPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Meta Média</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.taxaCumprimentoMeta}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="contratos" className="gap-2">
            <FileSignature className="w-4 h-4" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="medicoes" className="gap-2">
            <Calculator className="w-4 h-4" />
            Medições
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <Bell className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tab: Contratos */}
        <TabsContent value="contratos" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por número, parceiro ou objeto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="convenio">Convênio</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="renovacao">Em Renovação</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Contratos */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {contratosFiltrados.map((contrato) => {
                  const status = getStatusConfig(contrato.status)
                  const tipo = getTipoConfig(contrato.tipo)
                  const StatusIcon = status.icon
                  const TipoIcon = tipo.icon
                  
                  return (
                    <div 
                      key={contrato.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setContratoSelecionado(contrato)
                        setIsDetalhesOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{contrato.numero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${tipo.cor}20`, color: tipo.cor }}
                            >
                              <TipoIcon className="w-3 h-3 mr-1" />
                              {tipo.texto}
                            </Badge>
                            {contrato.medicaoAutomatica && (
                              <Badge className="bg-purple-500/20 text-purple-500 text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{contrato.parceiro.nome}</p>
                          <p className={`text-sm ${textSecondary}`}>{contrato.objeto}</p>
                          <div className={`text-xs ${textSecondary} mt-2 flex gap-4`}>
                            <span>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')} - {new Date(contrato.dataFim).toLocaleDateString('pt-BR')}
                            </span>
                            <span>
                              <Users className="w-3 h-3 inline mr-1" />
                              {contrato.responsavel}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(contrato.consumoMes)}</p>
                          <p className={`text-xs ${textSecondary}`}>consumo/mês</p>
                          {contrato.percentualMeta && (
                            <div className="mt-2">
                              <div className="flex items-center gap-1 justify-end">
                                <Gauge className={`w-4 h-4 ${contrato.percentualMeta >= 100 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
                                <span className={`font-bold ${contrato.percentualMeta >= 100 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                                  {contrato.percentualMeta}%
                                </span>
                              </div>
                              <p className={`text-xs ${textSecondary}`}>da meta</p>
                            </div>
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

        {/* Tab: Medições */}
        <TabsContent value="medicoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#6366F1]" />
                Medições de Contratos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_MEDICOES.map((medicao) => {
                  const status = getStatusConfig(medicao.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={medicao.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{medicao.contratoNumero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                              {medicao.periodo}
                            </Badge>
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{medicao.parceiro}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            {medicao.quantidadeItens} itens medidos
                          </p>
                          {medicao.divergencias && medicao.divergencias > 0 && (
                            <p className={`text-xs text-[#F59E0B] mt-1`}>
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              {medicao.divergencias} divergências encontradas
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(medicao.valorMedido)}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            Gerado: {new Date(medicao.dataGeracao).toLocaleDateString('pt-BR')}
                          </p>
                          {medicao.status === 'pendente' && (
                            <div className="flex gap-2 mt-2 justify-end">
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Aprovar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
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

        {/* Tab: Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#F59E0B]" />
                Alertas de Contratos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ALERTAS.map((alerta) => {
                  const severidade = getSeveridadeConfig(alerta.severidade)
                  const status = getStatusConfig(alerta.status)
                  
                  return (
                    <div key={alerta.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${severidade.cor}20` }}
                          >
                            <AlertTriangle className="w-5 h-5" style={{ color: severidade.cor }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${severidade.cor}20`, color: severidade.cor }}
                              >
                                {severidade.texto}
                              </Badge>
                              <span className={`text-sm ${textSecondary}`}>{alerta.contratoNumero}</span>
                            </div>
                            <p className={`font-medium ${textPrimary}`}>{alerta.mensagem}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              {new Date(alerta.dataAlerta).toLocaleString('pt-BR')}
                            </p>
                            {alerta.diasRestantes && (
                              <p className={`text-xs ${severidade.cor === '#EF4444' ? 'text-[#EF4444]' : textSecondary}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {alerta.diasRestantes} dias restantes
                              </p>
                            )}
                          </div>
                        </div>
                        {alerta.status === 'ativo' && (
                          <Button size="sm" variant="secondary" className="gap-1">
                            <Eye className="w-4 h-4" />
                            Reconhecer
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consumo Mensal */}
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#6366F1]" />
                  Consumo Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CONSUMO_MENSAL}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E5E7EB'} />
                      <XAxis dataKey="mes" stroke={isDark ? '#94A3B8' : '#6B7280'} />
                      <YAxis stroke={isDark ? '#94A3B8' : '#6B7280'} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="valor" name="Consumo" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por Tipo */}
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#10B981]" />
                  Distribuição por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_DISTRIBUICAO_TIPO}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="valor"
                        nameKey="tipo"
                        label={({ tipo, valor }) => `${tipo}: ${formatCompact(valor)}`}
                      >
                        {MOCK_DISTRIBUICAO_TIPO.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insight IA */}
          <Card className={`${cardBg} border-l-4 border-l-[#8B5CF6]`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <div>
                  <p className={`font-medium ${textPrimary}`}>Análise AutoCorrector Agent</p>
                  <p className={`text-sm ${textSecondary}`}>
                    Validação cross-branch identificou que o contrato CTR-2024-002 (Unimed) apresenta 
                    3 divergências na medição de Novembro: 2 itens com preço divergente da tabela 
                    e 1 item sem autorização prévia. Recomendação: revisar antes da aprovação.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes do Contrato */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-[#6366F1]" />
              {contratoSelecionado?.numero}
            </DialogTitle>
          </DialogHeader>

          {contratoSelecionado && (
            <div className="space-y-4 py-4">
              {/* Info Principal */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>{contratoSelecionado.parceiro.nome}</h4>
                <p className={`text-sm ${textSecondary}`}>{contratoSelecionado.objeto}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>CNPJ</p>
                    <p className={`font-medium ${textPrimary}`}>{contratoSelecionado.parceiro.cnpj}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Tipo</p>
                    <p className={`font-medium ${textPrimary}`}>{contratoSelecionado.parceiro.tipo}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Vigência</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {new Date(contratoSelecionado.dataInicio).toLocaleDateString('pt-BR')} - {new Date(contratoSelecionado.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Responsável</p>
                    <p className={`font-medium ${textPrimary}`}>{contratoSelecionado.responsavel}</p>
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Valor Total</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{formatCompact(contratoSelecionado.valorTotal)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Consumo Mês</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{formatCompact(contratoSelecionado.consumoMes)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>% Meta</p>
                  <p className={`text-xl font-bold ${(contratoSelecionado.percentualMeta || 0) >= 100 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                    {contratoSelecionado.percentualMeta}%
                  </p>
                </div>
              </div>

              {/* Configurações */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Configurações</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className={textSecondary}>Tipo Cobrança:</span>
                    <Badge>{contratoSelecionado.tipoCobranca}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={textSecondary}>Medição Automática:</span>
                    <Badge className={contratoSelecionado.medicaoAutomatica ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                      {contratoSelecionado.medicaoAutomatica ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={textSecondary}>Aditivos:</span>
                    <Badge>{contratoSelecionado.aditivos}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={textSecondary}>Alertas:</span>
                    <Badge className={contratoSelecionado.alertas > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}>
                      {contratoSelecionado.alertas}
                    </Badge>
                  </div>
                </div>
              </div>

              {contratoSelecionado.observacoes && (
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <h4 className={`font-medium ${textPrimary} mb-2`}>Observações</h4>
                  <p className={`text-sm ${textSecondary}`}>{contratoSelecionado.observacoes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button variant="secondary" className="gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
            <Button className="gap-2">
              <Calculator className="w-4 h-4" />
              Nova Medição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Contrato */}
      <Dialog open={isNovoContratoOpen} onOpenChange={setIsNovoContratoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Novo Contrato
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Contrato *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="convenio">Convênio</SelectItem>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="prestador">Prestador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parceiro *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o parceiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hospital São Lucas</SelectItem>
                  <SelectItem value="2">Unimed São Paulo</SelectItem>
                  <SelectItem value="3">Zimmer Biomet Brasil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Objeto do Contrato *</Label>
              <Textarea placeholder="Descreva o objeto do contrato" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Data Fim *</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Total *</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Tipo Cobrança *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixo">Fixo</SelectItem>
                    <SelectItem value="variavel">Variável</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovoContratoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Contrato criado com sucesso!')
              setIsNovoContratoOpen(false)
            }}>
              Criar Contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nova Medição */}
      <Dialog open={isNovaMedicaoOpen} onOpenChange={setIsNovaMedicaoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#6366F1]" />
              Nova Medição
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contrato *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CONTRATOS.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.numero} - {c.parceiro.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período *</Label>
              <Input type="month" />
            </div>

            <div className={`p-4 rounded-xl ${inputBg}`}>
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                <div>
                  <p className={`font-medium ${textPrimary}`}>Medição Automática</p>
                  <p className={`text-sm ${textSecondary}`}>
                    O sistema irá calcular automaticamente o consumo baseado nas cirurgias realizadas 
                    e materiais utilizados no período.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovaMedicaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Medição gerada! Processando dados...')
              setIsNovaMedicaoOpen(false)
            }} className="gap-2">
              <Zap className="w-4 h-4" />
              Gerar Medição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GestaoContratos

