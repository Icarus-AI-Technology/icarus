/**
 * ICARUS v5.0 - Dashboard Cirúrgico
 * 
 * Dashboard completo para gestão de cirurgias com métricas,
 * filtros avançados e visualizações interativas.
 * 
 * FUNCIONALIDADES:
 * - KPIs de cirurgias (hoje, semana, mês)
 * - Gráficos de performance
 * - Filtros por período, status, hospital, médico
 * - Alertas e notificações
 * - Integração com Outlook
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts'
import {
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp,
  TrendingDown, Search, Filter, Download, RefreshCw, Activity,
  User, Users, Building2, Stethoscope, Package, DollarSign,
  Target, Zap, Star, Bell, BrainCircuit, BarChart3, PieChartIcon,
  CalendarDays, CalendarClock, ArrowUpRight, ArrowDownRight,
  Eye, ExternalLink, Mail, Phone, MapPin
} from 'lucide-react'

// ============ DADOS MOCK ============

const MOCK_KPI_DATA = {
  cirurgiasHoje: 8,
  cirurgiasSemana: 32,
  cirurgiasMes: 145,
  taxaSucesso: 98.5,
  faturamentoMes: 2850000,
  ticketMedio: 19655,
  tempoMedioAutorizacao: 2.3,
  taxaGlosa: 2.1,
}

const MOCK_CIRURGIAS_POR_STATUS = [
  { status: 'Agendadas', quantidade: 45, cor: '#3B82F6' },
  { status: 'Em Andamento', quantidade: 8, cor: '#8b5cf6' },
  { status: 'Realizadas', quantidade: 132, cor: '#10B981' },
  { status: 'Canceladas', quantidade: 5, cor: '#EF4444' },
  { status: 'Pendentes', quantidade: 12, cor: '#8B5CF6' },
]

const MOCK_CIRURGIAS_POR_MES = [
  { mes: 'Jun', realizadas: 128, faturamento: 2450000 },
  { mes: 'Jul', realizadas: 135, faturamento: 2580000 },
  { mes: 'Ago', realizadas: 142, faturamento: 2720000 },
  { mes: 'Set', realizadas: 138, faturamento: 2650000 },
  { mes: 'Out', realizadas: 148, faturamento: 2890000 },
  { mes: 'Nov', realizadas: 145, faturamento: 2850000 },
]

const MOCK_TOP_PROCEDIMENTOS = [
  { procedimento: 'Artroplastia Total Quadril', quantidade: 45, faturamento: 850000 },
  { procedimento: 'Artroplastia Total Joelho', quantidade: 38, faturamento: 720000 },
  { procedimento: 'Artrodese Lombar', quantidade: 22, faturamento: 580000 },
  { procedimento: 'Fixação Coluna', quantidade: 18, faturamento: 420000 },
  { procedimento: 'Outros', quantidade: 22, faturamento: 280000 },
]

const MOCK_TOP_CIRURGIOES = [
  { nome: 'Dr. Carlos Eduardo', crm: 'SP-123456', cirurgias: 28, faturamento: 680000, avaliacao: 4.9 },
  { nome: 'Dra. Ana Beatriz', crm: 'SP-654321', cirurgias: 25, faturamento: 620000, avaliacao: 4.8 },
  { nome: 'Dr. Roberto Lima', crm: 'SP-789012', cirurgias: 22, faturamento: 540000, avaliacao: 4.7 },
  { nome: 'Dra. Mariana Costa', crm: 'SP-345678', cirurgias: 18, faturamento: 450000, avaliacao: 4.9 },
]

const MOCK_TOP_HOSPITAIS = [
  { nome: 'Hospital São Lucas', cirurgias: 48, faturamento: 920000 },
  { nome: 'Hospital Albert Einstein', cirurgias: 42, faturamento: 850000 },
  { nome: 'Hospital Sírio-Libanês', cirurgias: 35, faturamento: 680000 },
  { nome: 'Hospital Oswaldo Cruz', cirurgias: 20, faturamento: 400000 },
]

const MOCK_ALERTAS = [
  { id: '1', tipo: 'urgente', mensagem: '3 cirurgias sem autorização para amanhã', tempo: '2 min' },
  { id: '2', tipo: 'aviso', mensagem: 'Kit KIT-2025-002 com item indisponível', tempo: '15 min' },
  { id: '3', tipo: 'info', mensagem: 'Nova tabela TUSS da Unimed disponível', tempo: '1 hora' },
  { id: '4', tipo: 'sucesso', mensagem: '5 autorizações aprovadas hoje', tempo: '2 horas' },
]

const MOCK_PROXIMAS_CIRURGIAS = [
  { id: '1', paciente: 'Maria Silva', procedimento: 'ATQ', hospital: 'São Lucas', horario: '08:00', status: 'confirmada' },
  { id: '2', paciente: 'João Oliveira', procedimento: 'ATJ', hospital: 'Einstein', horario: '10:30', status: 'confirmada' },
  { id: '3', paciente: 'Ana Ferreira', procedimento: 'Artrodese', hospital: 'Sírio', horario: '14:00', status: 'pendente' },
  { id: '4', paciente: 'Carlos Santos', procedimento: 'ATQ', hospital: 'São Lucas', horario: '16:30', status: 'confirmada' },
]

// ============ COMPONENTE PRINCIPAL ============

export function DashboardCirurgico() {
  const { isDark } = useTheme()
  
  // States
  const [periodo, setPeriodo] = useState('mes')
  const [filtroHospital, setFiltroHospital] = useState('todos')
  const [filtroCirurgiao, setFiltroCirurgiao] = useState('todos')

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Chart colors
  const chartColors = ['#6366F1', '#10B981', '#8b5cf6', '#EF4444', '#8B5CF6', '#EC4899']

  // Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatCompact = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
    return formatCurrency(value)
  }

  const getAlertConfig = (tipo: string) => {
    const configs: Record<string, { cor: string; icon: any }> = {
      urgente: { cor: '#EF4444', icon: AlertTriangle },
      aviso: { cor: '#8b5cf6', icon: Bell },
      info: { cor: '#3B82F6', icon: Bell },
      sucesso: { cor: '#10B981', icon: CheckCircle },
    }
    return configs[tipo] || { cor: '#6B7280', icon: Bell }
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1A1F35]' : 'bg-white'} shadow-lg border ${borderColor}`}>
          <p className={`font-medium ${textPrimary}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={textSecondary} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.includes('aturamento') 
                ? formatCurrency(entry.value) 
                : entry.value}
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
            <Activity className="w-7 h-7 text-[#6366F1]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Dashboard Cirúrgico</h1>
            <p className={textSecondary}>Visão geral • Métricas • Performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="mes">Mês</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="secondary" className="gap-2">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={cardBg}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs ${textSecondary}`}>Cirurgias Hoje</p>
                  <p className={`text-3xl font-bold ${textPrimary}`}>{MOCK_KPI_DATA.cirurgiasHoje}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">+2 vs ontem</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-[#6366F1]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={cardBg}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs ${textSecondary}`}>Cirurgias Mês</p>
                  <p className={`text-3xl font-bold ${textPrimary}`}>{MOCK_KPI_DATA.cirurgiasMes}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">+5% vs mês anterior</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={cardBg}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs ${textSecondary}`}>Faturamento Mês</p>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{formatCompact(MOCK_KPI_DATA.faturamentoMes)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">+8% vs mês anterior</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#8b5cf6]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={cardBg}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs ${textSecondary}`}>Taxa de Sucesso</p>
                  <p className={`text-3xl font-bold text-[#10B981]`}>{MOCK_KPI_DATA.taxaSucesso}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Target className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">Meta: 95%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Tempo Médio Autorização</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{MOCK_KPI_DATA.tempoMedioAutorizacao} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Ticket Médio</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{formatCompact(MOCK_KPI_DATA.ticketMedio)}</p>
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
                <p className={`text-xs ${textSecondary}`}>Taxa de Glosa</p>
                <p className={`text-xl font-bold text-[#EF4444]`}>{MOCK_KPI_DATA.taxaGlosa}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#EC4899]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Cirurgiões Ativos</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{MOCK_TOP_CIRURGIOES.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cirurgias por Mês */}
        <Card className={cardBg}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#6366F1]" />
              Cirurgias e Faturamento por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CIRURGIAS_POR_MES}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E5E7EB'} />
                  <XAxis dataKey="mes" stroke={isDark ? '#94A3B8' : '#6B7280'} />
                  <YAxis yAxisId="left" stroke={isDark ? '#94A3B8' : '#6B7280'} />
                  <YAxis yAxisId="right" orientation="right" stroke={isDark ? '#94A3B8' : '#6B7280'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="realizadas" name="Cirurgias" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="faturamento" name="Faturamento" stroke="#10B981" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cirurgias por Status */}
        <Card className={cardBg}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#8B5CF6]" />
              Cirurgias por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CIRURGIAS_POR_STATUS}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="quantidade"
                    nameKey="status"
                    label={({ status, quantidade }) => `${status}: ${quantidade}`}
                  >
                    {MOCK_CIRURGIAS_POR_STATUS.map((entry, index) => (
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

      {/* Rankings e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Procedimentos */}
        <Card className={cardBg}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#8b5cf6]" />
              Top Procedimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_TOP_PROCEDIMENTOS.map((proc, idx) => (
                <div key={idx} className={`p-3 rounded-xl ${inputBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        idx === 0 ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' :
                        idx === 1 ? 'bg-[#94A3B8]/20 text-[#94A3B8]' :
                        idx === 2 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                        'bg-gray-500/20 text-gray-500'
                      } font-bold text-sm`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{proc.procedimento}</p>
                        <p className={`text-xs ${textSecondary}`}>{proc.quantidade} cirurgias</p>
                      </div>
                    </div>
                    <p className={`font-bold text-[#10B981]`}>{formatCompact(proc.faturamento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Cirurgiões */}
        <Card className={cardBg}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#6366F1]" />
              Top Cirurgiões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_TOP_CIRURGIOES.map((med, idx) => (
                <div key={idx} className={`p-3 rounded-xl ${inputBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#6366F1]" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{med.nome}</p>
                        <p className={`text-xs ${textSecondary}`}>CRM: {med.crm}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${textPrimary}`}>{med.cirurgias}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#8b5cf6] fill-[#8b5cf6]" />
                        <span className={`text-xs ${textSecondary}`}>{med.avaliacao}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className={cardBg}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#EF4444]" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_ALERTAS.map((alerta) => {
                const config = getAlertConfig(alerta.tipo)
                const AlertIcon = config.icon
                return (
                  <div key={alerta.id} className={`p-3 rounded-xl ${inputBg}`}>
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.cor}20` }}
                      >
                        <AlertIcon className="w-4 h-4" style={{ color: config.cor }} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${textPrimary}`}>{alerta.mensagem}</p>
                        <p className={`text-xs ${textSecondary}`}>{alerta.tempo} atrás</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Cirurgias */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#3B82F6]" />
            Próximas Cirurgias de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_PROXIMAS_CIRURGIAS.map((cir) => (
              <div key={cir.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={cir.status === 'confirmada' ? 'bg-green-500/20 text-green-500' : 'bg-cyan-500/20 text-cyan-400'}>
                    {cir.status === 'confirmada' ? 'Confirmada' : 'Pendente'}
                  </Badge>
                  <span className={`font-bold ${textPrimary}`}>{cir.horario}</span>
                </div>
                <p className={`font-medium ${textPrimary}`}>{cir.paciente}</p>
                <p className={`text-sm ${textSecondary}`}>{cir.procedimento}</p>
                <p className={`text-xs ${textSecondary}`}>
                  <Building2 className="w-3 h-3 inline mr-1" />
                  {cir.hospital}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Hospitais */}
      <Card className={cardBg}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#10B981]" />
            Performance por Hospital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_TOP_HOSPITAIS.map((hosp, idx) => (
              <div key={idx} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{hosp.nome}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                    <p className={`text-xl font-bold ${textPrimary}`}>{hosp.cirurgias}</p>
                    <p className={`text-xs ${textSecondary}`}>Cirurgias</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                    <p className={`text-xl font-bold text-[#10B981]`}>{formatCompact(hosp.faturamento)}</p>
                    <p className={`text-xs ${textSecondary}`}>Faturamento</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCirurgico

