/**
 * ICARUS v5.0 - Fluxo de Caixa com IA
 * 
 * Gestão inteligente de fluxo de caixa com previsão preditiva,
 * cenários automáticos e alertas de liquidez.
 * 
 * FUNCIONALIDADES:
 * - Previsão preditiva de fluxo de caixa
 * - Cenários automáticos (otimista, realista, pessimista)
 * - Alertas de liquidez em tempo real
 * - Otimização de capital de giro
 * - Integração com contas a pagar/receber
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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Legend, ComposedChart
} from 'recharts'
import {
  Wallet, CreditCard, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingDown, TrendingUp, Search, Filter,
  Download, Plus, Eye, FileText, Building2, DollarSign,
  ArrowUpRight, ArrowDownRight, RefreshCw, BrainCircuit, Zap,
  BarChart3, Target, Layers, Bell, BellRing, Activity,
  Gauge, PieChart, LineChart as LineChartIcon, Info, AlertCircle,
  Droplets, Flame, Snowflake, Sun, Cloud, CloudRain,
  TrendingUp as TrendUp, Scale, Banknote, PiggyBank, Coins
} from 'lucide-react'

// ============ TIPOS ============

interface FluxoCaixaDiario {
  data: string
  saldoInicial: number
  entradas: number
  saidas: number
  saldoFinal: number
  previstoEntradas: number
  previstoSaidas: number
  previstoSaldo: number
}

interface CenarioFluxo {
  id: string
  nome: string
  tipo: 'otimista' | 'realista' | 'pessimista' | 'custom'
  probabilidade: number
  saldo30dias: number
  saldo60dias: number
  saldo90dias: number
  premissas: string[]
}

interface AlertaLiquidez {
  id: string
  tipo: 'liquidez_baixa' | 'pico_saida' | 'oportunidade' | 'previsao_negativa'
  severidade: 'info' | 'warning' | 'critical'
  titulo: string
  descricao: string
  dataPrevisao: string
  valorImpacto: number
  acaoSugerida: string
}

interface OtimizacaoCapital {
  id: string
  tipo: 'antecipar_recebimento' | 'postergar_pagamento' | 'renegociar' | 'investir'
  titulo: string
  descricao: string
  impactoLiquidez: number
  economia?: number
  confiancaIA: number
}

// ============ DADOS MOCK ============

const MOCK_FLUXO_DIARIO: FluxoCaixaDiario[] = [
  { data: '2025-11-22', saldoInicial: 450000, entradas: 89500, saidas: 45000, saldoFinal: 494500, previstoEntradas: 85000, previstoSaidas: 42000, previstoSaldo: 493000 },
  { data: '2025-11-23', saldoInicial: 494500, entradas: 0, saidas: 12000, saldoFinal: 482500, previstoEntradas: 0, previstoSaidas: 15000, previstoSaldo: 479500 },
  { data: '2025-11-24', saldoInicial: 482500, entradas: 0, saidas: 8500, saldoFinal: 474000, previstoEntradas: 0, previstoSaidas: 10000, previstoSaldo: 472500 },
  { data: '2025-11-25', saldoInicial: 474000, entradas: 125000, saidas: 78000, saldoFinal: 521000, previstoEntradas: 120000, previstoSaidas: 75000, previstoSaldo: 519000 },
  { data: '2025-11-26', saldoInicial: 521000, entradas: 45000, saidas: 156000, saldoFinal: 410000, previstoEntradas: 42000, previstoSaidas: 150000, previstoSaldo: 413000 },
  { data: '2025-11-27', saldoInicial: 410000, entradas: 67000, saidas: 23000, saldoFinal: 454000, previstoEntradas: 65000, previstoSaidas: 25000, previstoSaldo: 450000 },
  { data: '2025-11-28', saldoInicial: 454000, entradas: 34000, saidas: 89000, saldoFinal: 399000, previstoEntradas: 30000, previstoSaidas: 85000, previstoSaldo: 399000 },
]

const MOCK_PREVISAO_MENSAL = [
  { mes: 'Dez/25', entradas: 850000, saidas: 720000, saldo: 530000, previsao: true },
  { mes: 'Jan/26', entradas: 780000, saidas: 690000, saldo: 620000, previsao: true },
  { mes: 'Fev/26', entradas: 920000, saidas: 750000, saldo: 790000, previsao: true },
  { mes: 'Mar/26', entradas: 880000, saidas: 810000, saldo: 860000, previsao: true },
  { mes: 'Abr/26', entradas: 950000, saidas: 780000, saldo: 1030000, previsao: true },
  { mes: 'Mai/26', entradas: 1020000, saidas: 850000, saldo: 1200000, previsao: true },
]

const MOCK_CENARIOS: CenarioFluxo[] = [
  {
    id: '1',
    nome: 'Cenário Otimista',
    tipo: 'otimista',
    probabilidade: 25,
    saldo30dias: 650000,
    saldo60dias: 850000,
    saldo90dias: 1100000,
    premissas: [
      'Recebimento de 100% dos títulos a vencer',
      'Aumento de 15% nas vendas',
      'Descontos em pagamentos antecipados',
    ],
  },
  {
    id: '2',
    nome: 'Cenário Realista',
    tipo: 'realista',
    probabilidade: 55,
    saldo30dias: 530000,
    saldo60dias: 620000,
    saldo90dias: 790000,
    premissas: [
      'Recebimento de 85% dos títulos a vencer',
      'Vendas estáveis',
      'Pagamentos conforme programado',
    ],
  },
  {
    id: '3',
    nome: 'Cenário Pessimista',
    tipo: 'pessimista',
    probabilidade: 20,
    saldo30dias: 380000,
    saldo60dias: 320000,
    saldo90dias: 280000,
    premissas: [
      'Recebimento de 60% dos títulos a vencer',
      'Queda de 20% nas vendas',
      'Aumento de inadimplência',
    ],
  },
]

const MOCK_ALERTAS: AlertaLiquidez[] = [
  {
    id: '1',
    tipo: 'pico_saida',
    severidade: 'warning',
    titulo: 'Pico de Saídas Previsto',
    descricao: 'Concentração de pagamentos a fornecedores em 05/12',
    dataPrevisao: '2025-12-05',
    valorImpacto: 245000,
    acaoSugerida: 'Considerar renegociação de prazos ou antecipação de recebíveis',
  },
  {
    id: '2',
    tipo: 'oportunidade',
    severidade: 'info',
    titulo: 'Oportunidade de Investimento',
    descricao: 'Saldo projetado acima de R$ 500k por 15 dias',
    dataPrevisao: '2025-12-10',
    valorImpacto: 150000,
    acaoSugerida: 'Aplicar excedente em CDB de liquidez diária (CDI + 0.5%)',
  },
  {
    id: '3',
    tipo: 'liquidez_baixa',
    severidade: 'critical',
    titulo: 'Alerta de Liquidez',
    descricao: 'Saldo pode ficar abaixo do mínimo operacional',
    dataPrevisao: '2025-12-15',
    valorImpacto: -50000,
    acaoSugerida: 'Acionar linha de crédito ou antecipar recebíveis',
  },
]

const MOCK_OTIMIZACOES: OtimizacaoCapital[] = [
  {
    id: '1',
    tipo: 'antecipar_recebimento',
    titulo: 'Antecipar Recebíveis',
    descricao: 'Antecipar R$ 125.000 de Hospital São Lucas com desconto de 2%',
    impactoLiquidez: 122500,
    economia: -2500,
    confiancaIA: 92,
  },
  {
    id: '2',
    tipo: 'postergar_pagamento',
    titulo: 'Renegociar Prazo',
    descricao: 'Solicitar extensão de 15 dias para pagamento Zimmer Biomet',
    impactoLiquidez: 125000,
    confiancaIA: 78,
  },
  {
    id: '3',
    tipo: 'investir',
    titulo: 'Aplicar Excedente',
    descricao: 'Investir R$ 150.000 em CDB 30 dias (rendimento previsto: R$ 1.875)',
    impactoLiquidez: -150000,
    economia: 1875,
    confiancaIA: 95,
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function FluxoCaixaIA() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard')
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30')
  const [cenarioSelecionado, setCenarioSelecionado] = useState<CenarioFluxo | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)

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

  // Resumo
  const resumo = useMemo(() => {
    const ultimoDia = MOCK_FLUXO_DIARIO[MOCK_FLUXO_DIARIO.length - 1]
    const primeiroDia = MOCK_FLUXO_DIARIO[0]
    const totalEntradas = MOCK_FLUXO_DIARIO.reduce((acc, d) => acc + d.entradas, 0)
    const totalSaidas = MOCK_FLUXO_DIARIO.reduce((acc, d) => acc + d.saidas, 0)
    
    return {
      saldoAtual: ultimoDia.saldoFinal,
      variacao: ultimoDia.saldoFinal - primeiroDia.saldoInicial,
      variacaoPercent: ((ultimoDia.saldoFinal - primeiroDia.saldoInicial) / primeiroDia.saldoInicial * 100).toFixed(1),
      totalEntradas,
      totalSaidas,
      previsao30dias: MOCK_CENARIOS.find(c => c.tipo === 'realista')?.saldo30dias || 0,
      alertasCriticos: MOCK_ALERTAS.filter(a => a.severidade === 'critical').length,
    }
  }, [])

  const getCenarioIcon = (tipo: string) => {
    switch (tipo) {
      case 'otimista': return Sun
      case 'realista': return Cloud
      case 'pessimista': return CloudRain
      default: return Activity
    }
  }

  const getCenarioColor = (tipo: string) => {
    switch (tipo) {
      case 'otimista': return '#10B981'
      case 'realista': return '#3B82F6'
      case 'pessimista': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getSeveridadeConfig = (severidade: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      info: { cor: '#3B82F6', texto: 'Info' },
      warning: { cor: '#8b5cf6', texto: 'Atenção' },
      critical: { cor: '#EF4444', texto: 'Crítico' },
    }
    return configs[severidade] || { cor: '#6B7280', texto: severidade }
  }

  // Custom Tooltip para gráficos
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
            style={{ backgroundColor: '#3B82F620' }}
          >
            <Activity className="w-7 h-7 text-[#3B82F6]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Fluxo de Caixa IA</h1>
            <p className={textSecondary}>Previsão preditiva e otimização de capital</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="15">15 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Saldo Atual</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(resumo.saldoAtual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                resumo.variacao >= 0 ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
              }`}>
                {resumo.variacao >= 0 
                  ? <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  : <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                }
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Variação 7d</p>
                <p className={`text-lg font-bold ${resumo.variacao >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {resumo.variacao >= 0 ? '+' : ''}{resumo.variacaoPercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Entradas 7d</p>
                <p className={`text-lg font-bold text-[#10B981]`}>{formatCompact(resumo.totalEntradas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Saídas 7d</p>
                <p className={`text-lg font-bold text-[#EF4444]`}>{formatCompact(resumo.totalSaidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Previsão 30d</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(resumo.previsao30dias)}</p>
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
                <p className={`text-lg font-bold ${resumo.alertasCriticos > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
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
          <TabsTrigger value="previsao" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Previsão IA
          </TabsTrigger>
          <TabsTrigger value="cenarios" className="gap-2">
            <Layers className="w-4 h-4" />
            Cenários
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <Bell className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="otimizacao" className="gap-2">
            <Target className="w-4 h-4" />
            Otimização
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Gráfico Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-[#6366F1]" />
                Fluxo de Caixa - Últimos 7 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={MOCK_FLUXO_DIARIO}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E2E8F0'} />
                    <XAxis 
                      dataKey="data" 
                      stroke={isDark ? '#94A3B8' : '#64748B'}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis 
                      stroke={isDark ? '#94A3B8' : '#64748B'}
                      tickFormatter={(value) => formatCompact(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Line 
                      type="monotone" 
                      dataKey="saldoFinal" 
                      name="Saldo Real" 
                      stroke="#6366F1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366F1', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previstoSaldo" 
                      name="Saldo Previsto" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Diário */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
                  Principais Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { cliente: 'Hospital Albert Einstein', valor: 89500, data: '22/11' },
                    { cliente: 'Hospital São Lucas', valor: 125000, data: '25/11' },
                    { cliente: 'Clínica Ortopédica', valor: 45000, data: '26/11' },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-xl ${inputBg} flex items-center justify-between`}>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{item.cliente}</p>
                        <p className={`text-xs ${textSecondary}`}>{item.data}</p>
                      </div>
                      <p className="font-bold text-[#10B981]">{formatCurrency(item.valor)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowDownRight className="w-5 h-5 text-[#EF4444]" />
                  Principais Saídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { fornecedor: 'Zimmer Biomet', valor: 156000, data: '26/11' },
                    { fornecedor: 'Smith & Nephew', valor: 89000, data: '28/11' },
                    { fornecedor: 'Medtronic', valor: 78000, data: '25/11' },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-xl ${inputBg} flex items-center justify-between`}>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{item.fornecedor}</p>
                        <p className={`text-xs ${textSecondary}`}>{item.data}</p>
                      </div>
                      <p className="font-bold text-[#EF4444]">{formatCurrency(item.valor)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Previsão IA */}
        <TabsContent value="previsao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Previsão de Fluxo de Caixa - Próximos 6 meses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_PREVISAO_MENSAL}>
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E2E8F0'} />
                    <XAxis dataKey="mes" stroke={isDark ? '#94A3B8' : '#64748B'} />
                    <YAxis 
                      stroke={isDark ? '#94A3B8' : '#64748B'}
                      tickFormatter={(value) => formatCompact(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="saldo" 
                      name="Saldo Projetado" 
                      stroke="#6366F1" 
                      fillOpacity={1} 
                      fill="url(#colorSaldo)" 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="entradas" 
                      name="Entradas" 
                      stroke="#10B981" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="saidas" 
                      name="Saídas" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-[#8B5CF6]/10' : 'bg-purple-50'} border border-[#8B5CF6]/20`}>
                <div className="flex items-start gap-3">
                  <BrainCircuit className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Análise Preditiva IA</p>
                    <p className={`text-sm ${textSecondary} mt-1`}>
                      Com base nos padrões históricos e sazonalidade do setor OPME, projeta-se crescimento 
                      de 42% no saldo de caixa nos próximos 6 meses. Recomenda-se manter reserva mínima de 
                      R$ 350.000 para cobrir picos de saída.
                    </p>
                    <p className={`text-xs ${textSecondary} mt-2`}>
                      Confiança da previsão: <span className="text-[#10B981] font-medium">87%</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cenários */}
        <TabsContent value="cenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_CENARIOS.map((cenario) => {
              const CenarioIcon = getCenarioIcon(cenario.tipo)
              const cor = getCenarioColor(cenario.tipo)
              return (
                <motion.div
                  key={cenario.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setCenarioSelecionado(cenario)
                    setIsDetalhesOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <Card className={`${cardBg} border-t-4`} style={{ borderTopColor: cor }}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${cor}20` }}
                        >
                          <CenarioIcon className="w-6 h-6" style={{ color: cor }} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${textPrimary}`}>{cenario.nome}</h3>
                          <p className={`text-sm ${textSecondary}`}>Probabilidade: {cenario.probabilidade}%</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>30 dias</span>
                          <span className={`font-bold ${textPrimary}`}>{formatCompact(cenario.saldo30dias)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>60 dias</span>
                          <span className={`font-bold ${textPrimary}`}>{formatCompact(cenario.saldo60dias)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>90 dias</span>
                          <span className={`font-bold ${textPrimary}`}>{formatCompact(cenario.saldo90dias)}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ width: `${cenario.probabilidade}%`, backgroundColor: cor }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Comparativo de Cenários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#6366F1]" />
                Comparativo de Cenários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { periodo: '30 dias', otimista: 650000, realista: 530000, pessimista: 380000 },
                      { periodo: '60 dias', otimista: 850000, realista: 620000, pessimista: 320000 },
                      { periodo: '90 dias', otimista: 1100000, realista: 790000, pessimista: 280000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E2E8F0'} />
                    <XAxis dataKey="periodo" stroke={isDark ? '#94A3B8' : '#64748B'} />
                    <YAxis 
                      stroke={isDark ? '#94A3B8' : '#64748B'}
                      tickFormatter={(value) => formatCompact(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="otimista" name="Otimista" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="realista" name="Realista" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pessimista" name="Pessimista" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                Alertas de Liquidez
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
                            <span className={`text-xs ${textSecondary}`}>
                              Previsão: {new Date(alerta.dataPrevisao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h4 className={`font-semibold ${textPrimary}`}>{alerta.titulo}</h4>
                          <p className={`text-sm ${textSecondary} mb-2`}>{alerta.descricao}</p>
                          <p className={`text-sm ${alerta.valorImpacto >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            Impacto: {formatCurrency(Math.abs(alerta.valorImpacto))}
                          </p>
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

        {/* Tab: Otimização */}
        <TabsContent value="otimizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Otimização de Capital de Giro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_OTIMIZACOES.map((otim) => {
                  const tipoIcon = {
                    antecipar_recebimento: ArrowUpRight,
                    postergar_pagamento: Clock,
                    renegociar: Handshake,
                    investir: PiggyBank,
                  }[otim.tipo] || Activity
                  const TipoIcon = tipoIcon
                  
                  return (
                    <div 
                      key={otim.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                            <TipoIcon className="w-5 h-5 text-[#8B5CF6]" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${textPrimary}`}>{otim.titulo}</h4>
                            <p className={`text-sm ${textSecondary} mb-2`}>{otim.descricao}</p>
                            <div className="flex items-center gap-4">
                              <span className={`text-sm ${otim.impactoLiquidez >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                Impacto: {otim.impactoLiquidez >= 0 ? '+' : ''}{formatCurrency(otim.impactoLiquidez)}
                              </span>
                              {otim.economia && (
                                <span className={`text-sm ${otim.economia >= 0 ? 'text-[#10B981]' : 'text-[#8b5cf6]'}`}>
                                  {otim.economia >= 0 ? 'Rendimento' : 'Custo'}: {formatCurrency(Math.abs(otim.economia))}
                                </span>
                              )}
                              <span className={`text-xs ${textSecondary}`}>
                                <Target className="w-3 h-3 inline mr-1" />
                                Confiança: {otim.confiancaIA}%
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

          {/* Indicadores de Capital */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { titulo: 'Ciclo Financeiro', valor: '45 dias', meta: '< 60 dias', status: 'ok', icon: RefreshCw },
              { titulo: 'Prazo Médio Recebimento', valor: '32 dias', meta: '< 35 dias', status: 'ok', icon: ArrowUpRight },
              { titulo: 'Prazo Médio Pagamento', valor: '28 dias', meta: '> 25 dias', status: 'ok', icon: ArrowDownRight },
            ].map((ind) => (
              <Card key={ind.titulo} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      ind.status === 'ok' ? 'bg-[#10B981]/20' : 'bg-[#8b5cf6]/20'
                    }`}>
                      <ind.icon className={`w-5 h-5 ${ind.status === 'ok' ? 'text-[#10B981]' : 'text-[#8b5cf6]'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${textPrimary}`}>{ind.titulo}</h4>
                      <p className={`text-xs ${textSecondary}`}>Meta: {ind.meta}</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${ind.status === 'ok' ? 'text-[#10B981]' : 'text-[#8b5cf6]'}`}>
                    {ind.valor}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes do Cenário */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {cenarioSelecionado && (
                <>
                  {React.createElement(getCenarioIcon(cenarioSelecionado.tipo), {
                    className: 'w-5 h-5',
                    style: { color: getCenarioColor(cenarioSelecionado.tipo) }
                  })}
                  {cenarioSelecionado.nome}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {cenarioSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={textSecondary}>Probabilidade</span>
                  <span className={`font-bold ${textPrimary}`}>{cenarioSelecionado.probabilidade}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${cenarioSelecionado.probabilidade}%`, 
                      backgroundColor: getCenarioColor(cenarioSelecionado.tipo) 
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>30 dias</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(cenarioSelecionado.saldo30dias)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>60 dias</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(cenarioSelecionado.saldo60dias)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>90 dias</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(cenarioSelecionado.saldo90dias)}</p>
                </div>
              </div>

              <div>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Premissas</h4>
                <ul className="space-y-2">
                  {cenarioSelecionado.premissas.map((premissa, idx) => (
                    <li key={idx} className={`text-sm ${textSecondary} flex items-start gap-2`}>
                      <CheckCircle className="w-4 h-4 text-[#6366F1] mt-0.5 flex-shrink-0" />
                      {premissa}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Importar Handshake que faltou
import { Handshake } from 'lucide-react'

export default FluxoCaixaIA

