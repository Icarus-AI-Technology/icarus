/**
 * ICARUS v5.0 - Gestão Fiscal
 * 
 * Gestão fiscal completa com apuração automática de impostos,
 * declarações eletrônicas e conformidade tributária.
 * 
 * FUNCIONALIDADES:
 * - Cálculo automático de impostos (ICMS, ISS, PIS, COFINS, IR)
 * - Declarações eletrônicas (SPED, EFD, DCTF)
 * - Conformidade tributária com alertas
 * - Auditoria fiscal com IA
 * - Integração SEFAZ e Receita Federal
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
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
  Receipt, Calculator, FileText, Building2, Calendar, Clock,
  CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown,
  Search, Filter, Download, Upload, Eye, RefreshCw, BrainCircuit,
  Zap, BarChart3, Target, Layers, Bell, Shield, Scale,
  FileCheck, FileClock, FileWarning, FileX, Send, Printer,
  Globe, Database, Lock, Unlock, Info, AlertCircle, Settings,
  DollarSign, Percent, PiggyBank, Banknote, CreditCard, Wallet,
  BookOpen, ClipboardList, ClipboardCheck, FileSignature, Archive
} from 'lucide-react'

// ============ TIPOS ============

interface ImpostoApurado {
  id: string
  nome: string
  sigla: string
  competencia: string
  baseCalculo: number
  aliquota: number
  valorApurado: number
  valorCredito: number
  valorDevido: number
  status: 'apurado' | 'pendente' | 'pago' | 'parcelado' | 'vencido'
  dataVencimento: string
  dataPagamento?: string
}

interface DeclaracaoFiscal {
  id: string
  tipo: 'SPED' | 'EFD' | 'DCTF' | 'DIRF' | 'ECF' | 'ECD' | 'REINF'
  competencia: string
  status: 'pendente' | 'gerada' | 'transmitida' | 'processada' | 'erro' | 'retificada'
  prazoEntrega: string
  dataTransmissao?: string
  protocolo?: string
  observacoes?: string
}

interface AlertaFiscal {
  id: string
  tipo: 'vencimento' | 'divergencia' | 'obrigacao' | 'oportunidade' | 'risco'
  severidade: 'info' | 'warning' | 'critical'
  titulo: string
  descricao: string
  dataLimite?: string
  valorImpacto?: number
  acaoSugerida: string
}

interface NCMIsencao {
  ncm: string
  descricao: string
  tipoIsencao: string
  percentualReducao: number
  fundamentoLegal: string
  vigencia: string
}

// ============ DADOS MOCK ============

const MOCK_IMPOSTOS: ImpostoApurado[] = [
  {
    id: '1',
    nome: 'Imposto sobre Circulação de Mercadorias e Serviços',
    sigla: 'ICMS',
    competencia: '2025-11',
    baseCalculo: 2500000,
    aliquota: 18,
    valorApurado: 450000,
    valorCredito: 125000,
    valorDevido: 325000,
    status: 'apurado',
    dataVencimento: '2025-12-20',
  },
  {
    id: '2',
    nome: 'Imposto Sobre Serviços',
    sigla: 'ISS',
    competencia: '2025-11',
    baseCalculo: 850000,
    aliquota: 5,
    valorApurado: 42500,
    valorCredito: 0,
    valorDevido: 42500,
    status: 'pendente',
    dataVencimento: '2025-12-10',
  },
  {
    id: '3',
    nome: 'Programa de Integração Social',
    sigla: 'PIS',
    competencia: '2025-11',
    baseCalculo: 3350000,
    aliquota: 1.65,
    valorApurado: 55275,
    valorCredito: 18500,
    valorDevido: 36775,
    status: 'pago',
    dataVencimento: '2025-12-25',
    dataPagamento: '2025-12-20',
  },
  {
    id: '4',
    nome: 'Contribuição para Financiamento da Seguridade Social',
    sigla: 'COFINS',
    competencia: '2025-11',
    baseCalculo: 3350000,
    aliquota: 7.6,
    valorApurado: 254600,
    valorCredito: 85200,
    valorDevido: 169400,
    status: 'apurado',
    dataVencimento: '2025-12-25',
  },
  {
    id: '5',
    nome: 'Imposto de Renda Pessoa Jurídica',
    sigla: 'IRPJ',
    competencia: '2025-11',
    baseCalculo: 450000,
    aliquota: 15,
    valorApurado: 67500,
    valorCredito: 0,
    valorDevido: 67500,
    status: 'apurado',
    dataVencimento: '2025-12-31',
  },
  {
    id: '6',
    nome: 'Contribuição Social sobre o Lucro Líquido',
    sigla: 'CSLL',
    competencia: '2025-11',
    baseCalculo: 450000,
    aliquota: 9,
    valorApurado: 40500,
    valorCredito: 0,
    valorDevido: 40500,
    status: 'apurado',
    dataVencimento: '2025-12-31',
  },
]

const MOCK_DECLARACOES: DeclaracaoFiscal[] = [
  {
    id: '1',
    tipo: 'SPED',
    competencia: '2025-11',
    status: 'transmitida',
    prazoEntrega: '2025-12-20',
    dataTransmissao: '2025-12-15',
    protocolo: 'SPED-2025-11-001234',
  },
  {
    id: '2',
    tipo: 'EFD',
    competencia: '2025-11',
    status: 'gerada',
    prazoEntrega: '2025-12-25',
  },
  {
    id: '3',
    tipo: 'DCTF',
    competencia: '2025-11',
    status: 'pendente',
    prazoEntrega: '2025-12-15',
  },
  {
    id: '4',
    tipo: 'REINF',
    competencia: '2025-11',
    status: 'transmitida',
    prazoEntrega: '2025-12-15',
    dataTransmissao: '2025-12-10',
    protocolo: 'REINF-2025-11-005678',
  },
]

const MOCK_ALERTAS: AlertaFiscal[] = [
  {
    id: '1',
    tipo: 'vencimento',
    severidade: 'warning',
    titulo: 'DCTF - Prazo Próximo',
    descricao: 'A DCTF de novembro/2025 vence em 3 dias',
    dataLimite: '2025-12-15',
    acaoSugerida: 'Gerar e transmitir a declaração',
  },
  {
    id: '2',
    tipo: 'oportunidade',
    severidade: 'info',
    titulo: 'Crédito de ICMS Disponível',
    descricao: 'R$ 45.000 em créditos de ICMS podem ser aproveitados',
    valorImpacto: 45000,
    acaoSugerida: 'Revisar notas de entrada e apropriar créditos',
  },
  {
    id: '3',
    tipo: 'divergencia',
    severidade: 'critical',
    titulo: 'Divergência SEFAZ',
    descricao: 'Valor de ICMS declarado difere do calculado pela SEFAZ',
    valorImpacto: 12500,
    acaoSugerida: 'Verificar notas fiscais e retificar se necessário',
  },
]

const MOCK_NCM_ISENCOES: NCMIsencao[] = [
  { ncm: '9021.31.10', descricao: 'Próteses articulares - Quadril', tipoIsencao: 'Redução Base', percentualReducao: 60, fundamentoLegal: 'Convênio ICMS 01/99', vigencia: '2025-12-31' },
  { ncm: '9021.31.20', descricao: 'Próteses articulares - Joelho', tipoIsencao: 'Redução Base', percentualReducao: 60, fundamentoLegal: 'Convênio ICMS 01/99', vigencia: '2025-12-31' },
  { ncm: '9021.31.90', descricao: 'Outras próteses articulares', tipoIsencao: 'Redução Base', percentualReducao: 60, fundamentoLegal: 'Convênio ICMS 01/99', vigencia: '2025-12-31' },
  { ncm: '9021.10.10', descricao: 'Artigos e aparelhos ortopédicos', tipoIsencao: 'Isenção', percentualReducao: 100, fundamentoLegal: 'Convênio ICMS 126/10', vigencia: '2025-12-31' },
  { ncm: '9018.90.99', descricao: 'Instrumentos cirúrgicos', tipoIsencao: 'Redução Alíquota', percentualReducao: 40, fundamentoLegal: 'Convênio ICMS 01/99', vigencia: '2025-12-31' },
  { ncm: '3006.10.19', descricao: 'Suturas cirúrgicas', tipoIsencao: 'Isenção', percentualReducao: 100, fundamentoLegal: 'Convênio ICMS 126/10', vigencia: '2025-12-31' },
]

// Dados para gráficos
const DADOS_IMPOSTOS_PIE = [
  { name: 'ICMS', value: 325000, color: '#6366F1' },
  { name: 'PIS', value: 36775, color: '#10B981' },
  { name: 'COFINS', value: 169400, color: '#8b5cf6' },
  { name: 'IRPJ', value: 67500, color: '#EF4444' },
  { name: 'CSLL', value: 40500, color: '#8B5CF6' },
  { name: 'ISS', value: 42500, color: '#3B82F6' },
]

const DADOS_HISTORICO = [
  { mes: 'Jul', icms: 280000, pis: 32000, cofins: 150000, irpj: 55000 },
  { mes: 'Ago', icms: 310000, pis: 35000, cofins: 162000, irpj: 62000 },
  { mes: 'Set', icms: 295000, pis: 33500, cofins: 155000, irpj: 58000 },
  { mes: 'Out', icms: 340000, pis: 38000, cofins: 175000, irpj: 70000 },
  { mes: 'Nov', icms: 325000, pis: 36775, cofins: 169400, irpj: 67500 },
]

// ============ COMPONENTE PRINCIPAL ============

export function GestaoFiscal() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard')
  const [competenciaSelecionada, setCompetenciaSelecionada] = useState('2025-11')
  const [impostoSelecionado, setImpostoSelecionado] = useState<ImpostoApurado | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isGerarDeclaracaoOpen, setIsGerarDeclaracaoOpen] = useState(false)

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
      apurado: { cor: '#3B82F6', texto: 'Apurado', icon: Calculator },
      pendente: { cor: '#8b5cf6', texto: 'Pendente', icon: Clock },
      pago: { cor: '#10B981', texto: 'Pago', icon: CheckCircle },
      parcelado: { cor: '#8B5CF6', texto: 'Parcelado', icon: Layers },
      vencido: { cor: '#EF4444', texto: 'Vencido', icon: AlertTriangle },
      gerada: { cor: '#3B82F6', texto: 'Gerada', icon: FileCheck },
      transmitida: { cor: '#10B981', texto: 'Transmitida', icon: Send },
      processada: { cor: '#10B981', texto: 'Processada', icon: CheckCircle },
      erro: { cor: '#EF4444', texto: 'Erro', icon: XCircle },
      retificada: { cor: '#8b5cf6', texto: 'Retificada', icon: RefreshCw },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  const getSeveridadeConfig = (severidade: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      info: { cor: '#3B82F6', texto: 'Info' },
      warning: { cor: '#8b5cf6', texto: 'Atenção' },
      critical: { cor: '#EF4444', texto: 'Crítico' },
    }
    return configs[severidade] || { cor: '#6B7280', texto: severidade }
  }

  // Resumo
  const resumo = useMemo(() => {
    const totalDevido = MOCK_IMPOSTOS.reduce((acc, i) => acc + i.valorDevido, 0)
    const totalCreditos = MOCK_IMPOSTOS.reduce((acc, i) => acc + i.valorCredito, 0)
    const totalPago = MOCK_IMPOSTOS.filter(i => i.status === 'pago').reduce((acc, i) => acc + i.valorDevido, 0)
    const declaracoesPendentes = MOCK_DECLARACOES.filter(d => d.status === 'pendente' || d.status === 'gerada').length
    
    return {
      totalDevido,
      totalCreditos,
      totalPago,
      totalAPagar: totalDevido - totalPago,
      declaracoesPendentes,
      alertasCriticos: MOCK_ALERTAS.filter(a => a.severidade === 'critical').length,
    }
  }, [])

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl ${cardBg} border ${borderColor} shadow-lg`}>
          <p className={`font-medium ${textPrimary} mb-2`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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
            style={{ backgroundColor: '#8B5CF620' }}
          >
            <Receipt className="w-7 h-7 text-[#8B5CF6]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Gestão Fiscal</h1>
            <p className={textSecondary}>Apuração automática e conformidade tributária</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={competenciaSelecionada} onValueChange={setCompetenciaSelecionada}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-11">Nov/2025</SelectItem>
              <SelectItem value="2025-10">Out/2025</SelectItem>
              <SelectItem value="2025-09">Set/2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="gap-2">
            <Calculator className="w-4 h-4" />
            Apurar
          </Button>
          <Button onClick={() => setIsGerarDeclaracaoOpen(true)} className="gap-2">
            <FileText className="w-4 h-4" />
            Gerar Declaração
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Total Devido</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(resumo.totalDevido)}</p>
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
                <p className={`text-xs ${textSecondary}`}>Créditos</p>
                <p className={`text-lg font-bold text-[#10B981]`}>{formatCompact(resumo.totalCreditos)}</p>
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
                <p className={`text-xs ${textSecondary}`}>Pago</p>
                <p className={`text-lg font-bold text-[#10B981]`}>{formatCompact(resumo.totalPago)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>A Pagar</p>
                <p className={`text-lg font-bold text-[#8b5cf6]`}>{formatCompact(resumo.totalAPagar)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Declarações</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.declaracoesPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                resumo.alertasCriticos > 0 ? 'bg-[#EF4444]/20' : 'bg-[#10B981]/20'
              }`}>
                <Bell className={`w-5 h-5 ${resumo.alertasCriticos > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`} />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Alertas</p>
                <p className={`text-2xl font-bold ${resumo.alertasCriticos > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                  {resumo.alertasCriticos > 0 ? resumo.alertasCriticos : 'OK'}
                </p>
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
          <TabsTrigger value="impostos" className="gap-2">
            <Calculator className="w-4 h-4" />
            Impostos
          </TabsTrigger>
          <TabsTrigger value="declaracoes" className="gap-2">
            <FileText className="w-4 h-4" />
            Declarações
          </TabsTrigger>
          <TabsTrigger value="ncm" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            NCMs e Isenções
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <Bell className="w-4 h-4" />
            Alertas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="w-5 h-5 text-[#6366F1]" />
                  Composição Tributária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DADOS_IMPOSTOS_PIE}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {DADOS_IMPOSTOS_PIE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Histórico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-[#10B981]" />
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DADOS_HISTORICO}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E2E8F0'} />
                      <XAxis dataKey="mes" stroke={isDark ? '#94A3B8' : '#64748B'} />
                      <YAxis 
                        stroke={isDark ? '#94A3B8' : '#64748B'}
                        tickFormatter={(value) => formatCompact(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="icms" name="ICMS" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pis" name="PIS" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cofins" name="COFINS" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="irpj" name="IRPJ" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Próximos Vencimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-[#8b5cf6]" />
                Próximos Vencimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {MOCK_IMPOSTOS.filter(i => i.status !== 'pago').slice(0, 4).map((imposto) => {
                  const status = getStatusConfig(imposto.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={imposto.id}
                      className={`p-3 rounded-xl ${inputBg} cursor-pointer hover:opacity-80`}
                      onClick={() => {
                        setImpostoSelecionado(imposto)
                        setIsDetalhesOpen(true)
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="text-lg font-bold">{imposto.sigla}</Badge>
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.texto}
                        </Badge>
                      </div>
                      <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(imposto.valorDevido)}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        Vence: {new Date(imposto.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Impostos */}
        <TabsContent value="impostos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#6366F1]" />
                Apuração de Impostos - {competenciaSelecionada}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_IMPOSTOS.map((imposto) => {
                  const status = getStatusConfig(imposto.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={imposto.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 text-center">
                            <p className={`text-xl font-bold ${textPrimary}`}>{imposto.sigla}</p>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              {status.texto}
                            </Badge>
                          </div>
                          <div>
                            <p className={`font-medium ${textPrimary}`}>{imposto.nome}</p>
                            <p className={`text-sm ${textSecondary}`}>
                              Base: {formatCurrency(imposto.baseCalculo)} • Alíquota: {imposto.aliquota}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className={`text-xs ${textSecondary}`}>Apurado</p>
                              <p className={`font-medium ${textPrimary}`}>{formatCurrency(imposto.valorApurado)}</p>
                            </div>
                            {imposto.valorCredito > 0 && (
                              <div>
                                <p className={`text-xs ${textSecondary}`}>Créditos</p>
                                <p className="font-medium text-[#10B981]">-{formatCurrency(imposto.valorCredito)}</p>
                              </div>
                            )}
                            <div>
                              <p className={`text-xs ${textSecondary}`}>Devido</p>
                              <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(imposto.valorDevido)}</p>
                            </div>
                          </div>
                          <p className={`text-xs ${textSecondary} mt-1`}>
                            Vence: {new Date(imposto.dataVencimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setImpostoSelecionado(imposto)
                              setIsDetalhesOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {imposto.status !== 'pago' && (
                            <Button size="sm" className="gap-1">
                              <CreditCard className="w-4 h-4" />
                              Pagar
                            </Button>
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

        {/* Tab: Declarações */}
        <TabsContent value="declaracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6366F1]" />
                Declarações Fiscais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_DECLARACOES.map((decl) => {
                  const status = getStatusConfig(decl.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={decl.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${status.cor}20` }}
                          >
                            <StatusIcon className="w-6 h-6" style={{ color: status.cor }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-bold ${textPrimary}`}>{decl.tipo}</p>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>
                              Competência: {decl.competencia} • Prazo: {new Date(decl.prazoEntrega).toLocaleDateString('pt-BR')}
                            </p>
                            {decl.protocolo && (
                              <p className={`text-xs ${textSecondary}`}>
                                Protocolo: {decl.protocolo}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {decl.status === 'pendente' && (
                            <Button size="sm" className="gap-1">
                              <FileText className="w-4 h-4" />
                              Gerar
                            </Button>
                          )}
                          {decl.status === 'gerada' && (
                            <Button size="sm" className="gap-1">
                              <Send className="w-4 h-4" />
                              Transmitir
                            </Button>
                          )}
                          {decl.status === 'transmitida' && (
                            <Button variant="secondary" size="sm" className="gap-1">
                              <Download className="w-4 h-4" />
                              Recibo
                            </Button>
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

        {/* Tab: NCMs e Isenções */}
        <TabsContent value="ncm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                NCMs com Benefícios Fiscais (22 mapeados)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_NCM_ISENCOES.map((ncm, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="font-mono">{ncm.ncm}</Badge>
                          <Badge className={
                            ncm.tipoIsencao === 'Isenção' ? 'bg-green-500/20 text-green-500' :
                            ncm.tipoIsencao === 'Redução Base' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-cyan-500/20 text-cyan-400'
                          }>
                            {ncm.tipoIsencao}
                          </Badge>
                        </div>
                        <p className={`font-medium ${textPrimary}`}>{ncm.descricao}</p>
                        <p className={`text-sm ${textSecondary}`}>
                          Fundamento: {ncm.fundamentoLegal} • Vigência: {ncm.vigencia}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold text-[#10B981]`}>{ncm.percentualReducao}%</p>
                        <p className={`text-xs ${textSecondary}`}>Redução</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20`}>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-[#10B981] mt-0.5" />
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Economia Fiscal Estimada</p>
                    <p className={`text-sm ${textSecondary}`}>
                      Com a correta aplicação dos benefícios fiscais mapeados, a economia estimada 
                      é de <span className="text-[#10B981] font-bold">R$ 125.000/mês</span> em ICMS.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#8b5cf6]" />
                Alertas Fiscais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ALERTAS.map((alerta) => {
                  const sevConfig = getSeveridadeConfig(alerta.severidade)
                  return (
                    <div 
                      key={alerta.id}
                      className={`p-4 rounded-xl ${inputBg} border-l-4`}
                      style={{ borderLeftColor: sevConfig.cor }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${sevConfig.cor}20`, color: sevConfig.cor }}
                            >
                              {sevConfig.texto}
                            </Badge>
                            {alerta.dataLimite && (
                              <span className={`text-xs ${textSecondary}`}>
                                Prazo: {new Date(alerta.dataLimite).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                          <h4 className={`font-semibold ${textPrimary}`}>{alerta.titulo}</h4>
                          <p className={`text-sm ${textSecondary} mb-2`}>{alerta.descricao}</p>
                          {alerta.valorImpacto && (
                            <p className={`text-sm ${alerta.valorImpacto >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                              Impacto: {formatCurrency(Math.abs(alerta.valorImpacto))}
                            </p>
                          )}
                          <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                            <p className={`text-xs ${textSecondary}`}>
                              <Zap className="w-3 h-3 inline mr-1 text-[#8b5cf6]" />
                              {alerta.acaoSugerida}
                            </p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm">
                          Resolver
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

      {/* Modal: Detalhes do Imposto */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#6366F1]" />
              {impostoSelecionado?.sigla} - {impostoSelecionado?.competencia}
            </DialogTitle>
          </DialogHeader>

          {impostoSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <p className={`font-medium ${textPrimary} mb-2`}>{impostoSelecionado.nome}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Base de Cálculo</p>
                    <p className={`font-bold ${textPrimary}`}>{formatCurrency(impostoSelecionado.baseCalculo)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Alíquota</p>
                    <p className={`font-bold ${textPrimary}`}>{impostoSelecionado.aliquota}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Apurado</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(impostoSelecionado.valorApurado)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Créditos</p>
                  <p className="text-lg font-bold text-[#10B981]">-{formatCurrency(impostoSelecionado.valorCredito)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Devido</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(impostoSelecionado.valorDevido)}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl ${inputBg}`}>
                <div className="flex justify-between">
                  <span className={textSecondary}>Vencimento</span>
                  <span className={textPrimary}>{new Date(impostoSelecionado.dataVencimento).toLocaleDateString('pt-BR')}</span>
                </div>
                {impostoSelecionado.dataPagamento && (
                  <div className="flex justify-between mt-2">
                    <span className={textSecondary}>Pago em</span>
                    <span className="text-[#10B981]">{new Date(impostoSelecionado.dataPagamento).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            {impostoSelecionado?.status !== 'pago' && (
              <Button className="gap-2">
                <CreditCard className="w-4 h-4" />
                Pagar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Gerar Declaração */}
      <Dialog open={isGerarDeclaracaoOpen} onOpenChange={setIsGerarDeclaracaoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6366F1]" />
              Gerar Declaração Fiscal
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Declaração</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sped">SPED Fiscal</SelectItem>
                  <SelectItem value="efd">EFD Contribuições</SelectItem>
                  <SelectItem value="dctf">DCTF</SelectItem>
                  <SelectItem value="reinf">EFD-Reinf</SelectItem>
                  <SelectItem value="ecf">ECF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Competência</Label>
              <Select defaultValue="2025-11">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-11">Novembro/2025</SelectItem>
                  <SelectItem value="2025-10">Outubro/2025</SelectItem>
                  <SelectItem value="2025-09">Setembro/2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`p-3 rounded-xl ${inputBg}`}>
              <p className={`text-sm ${textSecondary}`}>
                <Info className="w-4 h-4 inline mr-2" />
                A declaração será gerada com base nos lançamentos fiscais do período selecionado.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsGerarDeclaracaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Declaração gerada com sucesso!')
              setIsGerarDeclaracaoOpen(false)
            }} className="gap-2">
              <FileText className="w-4 h-4" />
              Gerar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GestaoFiscal

