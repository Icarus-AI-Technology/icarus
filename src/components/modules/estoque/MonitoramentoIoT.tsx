/**
 * ICARUS v5.0 - Monitoramento IoT para Estoque
 * 
 * Monitoramento em tempo real de estoque via sensores IoT,
 * com alertas preditivos de vencimento de lotes e condições
 * ambientais (temperatura, umidade).
 * 
 * FUNCIONALIDADES:
 * - Sensores de temperatura e umidade
 * - Alertas preditivos de vencimento
 * - Rastreamento GPS de contêineres
 * - Dashboard em tempo real
 * - Integração com ErrorPredictor Agent
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo, useEffect } from 'react'
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
  LineChart, Line
} from 'recharts'
import {
  Thermometer, Droplets, Wifi, WifiOff, Signal, SignalHigh, SignalLow,
  SignalZero, Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  MapPin, Navigation, Package, Box, AlertTriangle, CheckCircle, XCircle,
  Clock, RefreshCw, Settings, Eye, Bell, BrainCircuit, Activity,
  ThermometerSun, ThermometerSnowflake, Gauge, Radio, Satellite,
  CircleDot, Target, Zap, TrendingUp, TrendingDown, Calendar,
  AlertCircle, Info, Shield, ShieldAlert, ShieldCheck
} from 'lucide-react'

// ============ TIPOS ============

interface SensorIoT {
  id: string
  nome: string
  tipo: 'temperatura' | 'umidade' | 'gps' | 'rfid' | 'movimento'
  localizacao: string
  status: 'online' | 'offline' | 'alerta' | 'manutencao'
  bateria: number
  sinalQualidade: number
  ultimaLeitura: string
  valor: number
  unidade: string
  limiteMin?: number
  limiteMax?: number
}

interface LeituraHistorico {
  timestamp: string
  valor: number
}

interface AlertaIoT {
  id: string
  sensorId: string
  sensorNome: string
  tipo: 'temperatura_alta' | 'temperatura_baixa' | 'umidade_alta' | 'bateria_baixa' | 'offline' | 'vencimento_proximo'
  severidade: 'critico' | 'alto' | 'medio' | 'baixo'
  mensagem: string
  dataHora: string
  status: 'ativo' | 'reconhecido' | 'resolvido'
  produtosAfetados?: number
}

interface ContainerRastreado {
  id: string
  codigo: string
  tipo: string
  localizacaoAtual: {
    latitude: number
    longitude: number
    endereco: string
  }
  destino: string
  status: 'em_transito' | 'entregue' | 'aguardando' | 'retorno'
  temperatura: number
  umidade: number
  ultimaAtualizacao: string
  previsaoChegada?: string
}

interface PredicaoVencimento {
  id: string
  produto: string
  lote: string
  dataVencimento: string
  diasRestantes: number
  quantidade: number
  risco: 'alto' | 'medio' | 'baixo'
  recomendacao: string
  confiancaIA: number
}

// ============ DADOS MOCK ============

const MOCK_SENSORES: SensorIoT[] = [
  { id: '1', nome: 'Sensor Câmara Fria 01', tipo: 'temperatura', localizacao: 'Armazém A - Câmara Fria', status: 'online', bateria: 95, sinalQualidade: 98, ultimaLeitura: '2025-11-28T14:30:00', valor: -18.5, unidade: '°C', limiteMin: -25, limiteMax: -15 },
  { id: '2', nome: 'Sensor Câmara Fria 02', tipo: 'temperatura', localizacao: 'Armazém A - Câmara Fria', status: 'online', bateria: 87, sinalQualidade: 95, ultimaLeitura: '2025-11-28T14:30:00', valor: -17.8, unidade: '°C', limiteMin: -25, limiteMax: -15 },
  { id: '3', nome: 'Sensor Umidade Armazém B', tipo: 'umidade', localizacao: 'Armazém B - Estoque Geral', status: 'online', bateria: 72, sinalQualidade: 88, ultimaLeitura: '2025-11-28T14:30:00', valor: 45, unidade: '%', limiteMin: 30, limiteMax: 60 },
  { id: '4', nome: 'Sensor Temperatura Armazém B', tipo: 'temperatura', localizacao: 'Armazém B - Estoque Geral', status: 'alerta', bateria: 45, sinalQualidade: 75, ultimaLeitura: '2025-11-28T14:25:00', valor: 26.5, unidade: '°C', limiteMin: 15, limiteMax: 25 },
  { id: '5', nome: 'GPS Container CONT-001', tipo: 'gps', localizacao: 'Em Trânsito', status: 'online', bateria: 68, sinalQualidade: 92, ultimaLeitura: '2025-11-28T14:28:00', valor: 0, unidade: '' },
  { id: '6', nome: 'Leitor RFID Expedição', tipo: 'rfid', localizacao: 'Doca de Expedição', status: 'online', bateria: 100, sinalQualidade: 99, ultimaLeitura: '2025-11-28T14:30:00', valor: 0, unidade: '' },
]

const MOCK_HISTORICO_TEMP: LeituraHistorico[] = [
  { timestamp: '08:00', valor: -18.2 },
  { timestamp: '09:00', valor: -18.0 },
  { timestamp: '10:00', valor: -17.8 },
  { timestamp: '11:00', valor: -18.5 },
  { timestamp: '12:00', valor: -18.3 },
  { timestamp: '13:00', valor: -18.1 },
  { timestamp: '14:00', valor: -18.5 },
]

const MOCK_ALERTAS: AlertaIoT[] = [
  { id: '1', sensorId: '4', sensorNome: 'Sensor Temperatura Armazém B', tipo: 'temperatura_alta', severidade: 'alto', mensagem: 'Temperatura acima do limite (26.5°C > 25°C)', dataHora: '2025-11-28T14:25:00', status: 'ativo', produtosAfetados: 45 },
  { id: '2', sensorId: '4', sensorNome: 'Sensor Temperatura Armazém B', tipo: 'bateria_baixa', severidade: 'medio', mensagem: 'Bateria do sensor em 45%', dataHora: '2025-11-28T12:00:00', status: 'reconhecido' },
  { id: '3', sensorId: '3', sensorNome: 'Sensor Umidade Armazém B', tipo: 'bateria_baixa', severidade: 'baixo', mensagem: 'Bateria do sensor em 72%', dataHora: '2025-11-28T10:00:00', status: 'resolvido' },
]

const MOCK_CONTAINERS: ContainerRastreado[] = [
  { id: '1', codigo: 'CONT-001', tipo: 'Cirúrgico', localizacaoAtual: { latitude: -23.5505, longitude: -46.6333, endereco: 'Av. Paulista, 1000 - São Paulo/SP' }, destino: 'Hospital São Lucas', status: 'em_transito', temperatura: -18.2, umidade: 42, ultimaAtualizacao: '2025-11-28T14:28:00', previsaoChegada: '2025-11-28T15:30:00' },
  { id: '2', codigo: 'CONT-002', tipo: 'Emergência', localizacaoAtual: { latitude: -23.5612, longitude: -46.6560, endereco: 'Hospital Albert Einstein' }, destino: 'Hospital Albert Einstein', status: 'entregue', temperatura: -17.5, umidade: 45, ultimaAtualizacao: '2025-11-28T13:45:00' },
]

const MOCK_PREDICOES: PredicaoVencimento[] = [
  { id: '1', produto: 'Implante de Quadril XYZ', lote: 'ZB2025001234', dataVencimento: '2026-02-15', diasRestantes: 79, quantidade: 5, risco: 'medio', recomendacao: 'Priorizar uso nas próximas cirurgias de quadril', confiancaIA: 92 },
  { id: '2', produto: 'Cimento Ósseo ABC', lote: 'HE2025005678', dataVencimento: '2026-01-31', diasRestantes: 64, quantidade: 12, risco: 'alto', recomendacao: 'Transferir para unidade com maior demanda ou negociar devolução', confiancaIA: 88 },
  { id: '3', produto: 'Parafuso Cortical 4.5mm', lote: 'SY2024009999', dataVencimento: '2025-12-31', diasRestantes: 33, quantidade: 25, risco: 'alto', recomendacao: 'Uso imediato recomendado. Contatar cirurgiões para agendamento', confiancaIA: 95 },
]

// ============ COMPONENTE PRINCIPAL ============

export function MonitoramentoIoT() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sensorSelecionado, setSensorSelecionado] = useState<SensorIoT | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Helpers
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      online: { cor: '#10B981', texto: 'Online', icon: Wifi },
      offline: { cor: '#EF4444', texto: 'Offline', icon: WifiOff },
      alerta: { cor: '#8b5cf6', texto: 'Alerta', icon: AlertTriangle },
      manutencao: { cor: '#6B7280', texto: 'Manutenção', icon: Settings },
      em_transito: { cor: '#3B82F6', texto: 'Em Trânsito', icon: Navigation },
      entregue: { cor: '#10B981', texto: 'Entregue', icon: CheckCircle },
      aguardando: { cor: '#8b5cf6', texto: 'Aguardando', icon: Clock },
      retorno: { cor: '#8B5CF6', texto: 'Retorno', icon: Navigation },
      ativo: { cor: '#EF4444', texto: 'Ativo', icon: AlertCircle },
      reconhecido: { cor: '#8b5cf6', texto: 'Reconhecido', icon: Eye },
      resolvido: { cor: '#10B981', texto: 'Resolvido', icon: CheckCircle },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  const getSeveridadeConfig = (severidade: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      critico: { cor: '#EF4444', texto: 'Crítico' },
      alto: { cor: '#8b5cf6', texto: 'Alto' },
      medio: { cor: '#3B82F6', texto: 'Médio' },
      baixo: { cor: '#10B981', texto: 'Baixo' },
    }
    return configs[severidade] || { cor: '#6B7280', texto: severidade }
  }

  const getRiscoConfig = (risco: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      alto: { cor: '#EF4444', texto: 'Alto' },
      medio: { cor: '#8b5cf6', texto: 'Médio' },
      baixo: { cor: '#10B981', texto: 'Baixo' },
    }
    return configs[risco] || { cor: '#6B7280', texto: risco }
  }

  const getBateriaIcon = (nivel: number) => {
    if (nivel >= 80) return BatteryFull
    if (nivel >= 50) return BatteryMedium
    if (nivel >= 20) return BatteryLow
    return Battery
  }

  const getSinalIcon = (qualidade: number) => {
    if (qualidade >= 80) return SignalHigh
    if (qualidade >= 50) return Signal
    if (qualidade >= 20) return SignalLow
    return SignalZero
  }

  // Resumo
  const resumo = useMemo(() => {
    return {
      totalSensores: MOCK_SENSORES.length,
      sensoresOnline: MOCK_SENSORES.filter(s => s.status === 'online').length,
      sensoresAlerta: MOCK_SENSORES.filter(s => s.status === 'alerta').length,
      alertasAtivos: MOCK_ALERTAS.filter(a => a.status === 'ativo').length,
      containersTransito: MOCK_CONTAINERS.filter(c => c.status === 'em_transito').length,
      predicoesAltoRisco: MOCK_PREDICOES.filter(p => p.risco === 'alto').length,
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
              {entry.name}: {entry.value}°C
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
            style={{ backgroundColor: '#10B98120' }}
          >
            <Radio className="w-7 h-7 text-[#10B981]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Monitoramento IoT</h1>
            <p className={textSecondary}>Sensores • Rastreamento • Alertas Preditivos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={autoRefresh ? 'default' : 'secondary'} 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="secondary" className="gap-2">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Sensores</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.totalSensores}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Online</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.sensoresOnline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Em Alerta</p>
                <p className={`text-2xl font-bold text-[#8b5cf6]`}>{resumo.sensoresAlerta}</p>
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
                <p className={`text-xs ${textSecondary}`}>Alertas Ativos</p>
                <p className={`text-2xl font-bold text-[#EF4444]`}>{resumo.alertasAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Em Trânsito</p>
                <p className={`text-2xl font-bold text-[#3B82F6]`}>{resumo.containersTransito}</p>
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
                <p className={`text-xs ${textSecondary}`}>Predições Risco</p>
                <p className={`text-2xl font-bold text-[#8B5CF6]`}>{resumo.predicoesAltoRisco}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sensores" className="gap-2">
            <Radio className="w-4 h-4" />
            Sensores
          </TabsTrigger>
          <TabsTrigger value="rastreamento" className="gap-2">
            <MapPin className="w-4 h-4" />
            Rastreamento
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <Bell className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="predicoes" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Predições IA
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Temperatura */}
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-[#3B82F6]" />
                  Temperatura Câmara Fria (Hoje)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_HISTORICO_TEMP}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E5E7EB'} />
                      <XAxis dataKey="timestamp" stroke={isDark ? '#94A3B8' : '#6B7280'} />
                      <YAxis stroke={isDark ? '#94A3B8' : '#6B7280'} domain={[-25, -10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="valor" 
                        name="Temperatura"
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <ThermometerSnowflake className="w-4 h-4 text-[#3B82F6]" />
                    <span className={textSecondary}>Limite: -25°C a -15°C</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">Dentro do padrão</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alertas Recentes */}
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#8b5cf6]" />
                  Alertas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_ALERTAS.slice(0, 3).map((alerta) => {
                    const status = getStatusConfig(alerta.status)
                    const severidade = getSeveridadeConfig(alerta.severidade)
                    const StatusIcon = status.icon
                    return (
                      <div key={alerta.id} className={`p-3 rounded-xl ${inputBg}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${severidade.cor}20` }}
                            >
                              <AlertTriangle className="w-4 h-4" style={{ color: severidade.cor }} />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${textPrimary}`}>{alerta.mensagem}</p>
                              <p className={`text-xs ${textSecondary}`}>{alerta.sensorNome}</p>
                            </div>
                          </div>
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
          </div>

          {/* Status dos Sensores */}
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#10B981]" />
                Status dos Sensores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_SENSORES.map((sensor) => {
                  const status = getStatusConfig(sensor.status)
                  const StatusIcon = status.icon
                  const BateriaIcon = getBateriaIcon(sensor.bateria)
                  const SinalIcon = getSinalIcon(sensor.sinalQualidade)
                  
                  return (
                    <div 
                      key={sensor.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setSensorSelecionado(sensor)
                        setIsDetalhesOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-5 h-5" style={{ color: status.cor }} />
                          <span className={`font-medium ${textPrimary}`}>{sensor.nome}</span>
                        </div>
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                        >
                          {status.texto}
                        </Badge>
                      </div>
                      <p className={`text-sm ${textSecondary} mb-2`}>{sensor.localizacao}</p>
                      {sensor.tipo === 'temperatura' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-4 h-4 text-[#3B82F6]" />
                          <span className={`text-xl font-bold ${textPrimary}`}>{sensor.valor}{sensor.unidade}</span>
                        </div>
                      )}
                      {sensor.tipo === 'umidade' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-4 h-4 text-[#3B82F6]" />
                          <span className={`text-xl font-bold ${textPrimary}`}>{sensor.valor}{sensor.unidade}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <BateriaIcon className={`w-4 h-4 ${sensor.bateria < 30 ? 'text-[#EF4444]' : 'text-[#10B981]'}`} />
                          <span className={textSecondary}>{sensor.bateria}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <SinalIcon className="w-4 h-4 text-[#10B981]" />
                          <span className={textSecondary}>{sensor.sinalQualidade}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sensores */}
        <TabsContent value="sensores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista Completa de Sensores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_SENSORES.map((sensor) => {
                  const status = getStatusConfig(sensor.status)
                  const StatusIcon = status.icon
                  const BateriaIcon = getBateriaIcon(sensor.bateria)
                  
                  return (
                    <div key={sensor.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${status.cor}20` }}
                          >
                            <StatusIcon className="w-6 h-6" style={{ color: status.cor }} />
                          </div>
                          <div>
                            <p className={`font-medium ${textPrimary}`}>{sensor.nome}</p>
                            <p className={`text-sm ${textSecondary}`}>{sensor.localizacao}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              Última leitura: {new Date(sensor.ultimaLeitura).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {(sensor.tipo === 'temperatura' || sensor.tipo === 'umidade') && (
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${textPrimary}`}>{sensor.valor}{sensor.unidade}</p>
                              <p className={`text-xs ${textSecondary}`}>
                                Limite: {sensor.limiteMin} a {sensor.limiteMax}{sensor.unidade}
                              </p>
                            </div>
                          )}
                          <div className="flex flex-col items-center gap-1">
                            <BateriaIcon className={`w-6 h-6 ${sensor.bateria < 30 ? 'text-[#EF4444]' : 'text-[#10B981]'}`} />
                            <span className={`text-xs ${textSecondary}`}>{sensor.bateria}%</span>
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

        {/* Tab: Rastreamento */}
        <TabsContent value="rastreamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#3B82F6]" />
                Containers em Rastreamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_CONTAINERS.map((container) => {
                  const status = getStatusConfig(container.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={container.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{container.codigo}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-500 text-xs">{container.tipo}</Badge>
                          </div>
                          <p className={`text-sm ${textPrimary}`}>
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {container.localizacaoAtual.endereco}
                          </p>
                          <p className={`text-sm ${textSecondary}`}>
                            <Target className="w-4 h-4 inline mr-1" />
                            Destino: {container.destino}
                          </p>
                          {container.previsaoChegada && (
                            <p className={`text-sm ${textSecondary}`}>
                              <Clock className="w-4 h-4 inline mr-1" />
                              Previsão: {new Date(container.previsaoChegada).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <Thermometer className="w-4 h-4 text-[#3B82F6]" />
                            <span className={textPrimary}>{container.temperatura}°C</span>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <Droplets className="w-4 h-4 text-[#3B82F6]" />
                            <span className={textPrimary}>{container.umidade}%</span>
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

        {/* Tab: Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#8b5cf6]" />
                Todos os Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ALERTAS.map((alerta) => {
                  const status = getStatusConfig(alerta.status)
                  const severidade = getSeveridadeConfig(alerta.severidade)
                  const StatusIcon = status.icon
                  
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
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`font-medium ${textPrimary}`}>{alerta.mensagem}</p>
                            <p className={`text-sm ${textSecondary}`}>{alerta.sensorNome}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              {new Date(alerta.dataHora).toLocaleString('pt-BR')}
                            </p>
                            {alerta.produtosAfetados && (
                              <p className={`text-xs text-[#8b5cf6]`}>
                                <Package className="w-3 h-3 inline mr-1" />
                                {alerta.produtosAfetados} produtos afetados
                              </p>
                            )}
                          </div>
                        </div>
                        {alerta.status === 'ativo' && (
                          <Button size="sm" className="gap-1">
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

        {/* Tab: Predições IA */}
        <TabsContent value="predicoes" className="space-y-4">
          <Card className={`${cardBg} border-l-4 border-l-[#8B5CF6]`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <div>
                  <p className={`font-medium ${textPrimary}`}>Análise Preditiva de Vencimento</p>
                  <p className={`text-sm ${textSecondary}`}>
                    O ErrorPredictor Agent analisa padrões de consumo e condições de armazenamento 
                    para prever riscos de vencimento de lotes e sugerir ações preventivas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Predições de Vencimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_PREDICOES.map((pred) => {
                  const risco = getRiscoConfig(pred.risco)
                  
                  return (
                    <div key={pred.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{pred.produto}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${risco.cor}20`, color: risco.cor }}
                            >
                              Risco {risco.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>
                            Lote: {pred.lote} • Quantidade: {pred.quantidade} unidades
                          </p>
                          <p className={`text-sm ${textSecondary}`}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Vencimento: {new Date(pred.dataVencimento).toLocaleDateString('pt-BR')} 
                            ({pred.diasRestantes} dias)
                          </p>
                          <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                            <p className={`text-sm ${textPrimary}`}>
                              <Zap className="w-4 h-4 inline mr-1 text-[#8B5CF6]" />
                              {pred.recomendacao}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2 justify-end">
                            <Target className="w-4 h-4 text-[#8B5CF6]" />
                            <span className={`font-bold text-[#8B5CF6]`}>{pred.confiancaIA}%</span>
                          </div>
                          <p className={`text-xs ${textSecondary}`}>Confiança IA</p>
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

      {/* Modal: Detalhes do Sensor */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#10B981]" />
              {sensorSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>

          {sensorSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Tipo</p>
                    <p className={`font-medium ${textPrimary}`}>{sensorSelecionado.tipo}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Localização</p>
                    <p className={`font-medium ${textPrimary}`}>{sensorSelecionado.localizacao}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Bateria</p>
                    <p className={`font-medium ${sensorSelecionado.bateria < 30 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                      {sensorSelecionado.bateria}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Qualidade Sinal</p>
                    <p className={`font-medium ${textPrimary}`}>{sensorSelecionado.sinalQualidade}%</p>
                  </div>
                </div>
              </div>

              {(sensorSelecionado.tipo === 'temperatura' || sensorSelecionado.tipo === 'umidade') && (
                <div className={`p-4 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Leitura Atual</p>
                  <p className={`text-4xl font-bold ${textPrimary}`}>
                    {sensorSelecionado.valor}{sensorSelecionado.unidade}
                  </p>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    Limite: {sensorSelecionado.limiteMin} a {sensorSelecionado.limiteMax}{sensorSelecionado.unidade}
                  </p>
                </div>
              )}

              <div className={`p-4 rounded-xl ${inputBg}`}>
                <p className={`text-xs ${textSecondary}`}>Última Atualização</p>
                <p className={`font-medium ${textPrimary}`}>
                  {new Date(sensorSelecionado.ultimaLeitura).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Settings className="w-4 h-4" />
              Configurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MonitoramentoIoT

