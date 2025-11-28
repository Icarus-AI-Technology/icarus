/**
 * ICARUS v5.0 - Contêineres Inteligentes
 * 
 * Gestão de malas cirúrgicas com IA para controle de validade,
 * otimização de rotatividade e rastreamento GPS.
 * 
 * FUNCIONALIDADES:
 * - Contêineres mapeados com validade inferior ao Estoque Imóvel
 * - Alertas preditivos de vencimento
 * - Rastreamento GPS em tempo real
 * - Otimização de compras
 * - Movimentação automatizada
 * - Inventário com código de barras
 * - Sistema de etiquetas com QR Code
 * - IA para auditoria, validade, otimização e previsão
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
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box, Package, MapPin, QrCode, Barcode, Truck, AlertTriangle,
  Calendar, Clock, CheckCircle, XCircle, RefreshCw, Search,
  Filter, Download, Plus, Eye, Settings, Zap, BrainCircuit,
  TrendingUp, ArrowRightLeft, Printer, Camera, Wifi, WifiOff,
  Navigation, Target, Layers, Grid3X3, Tag, FileText, BarChart3,
  AlertCircle, ThermometerSun, Battery, Signal, MoreVertical,
  ChevronRight, Play, Pause, RotateCcw, Upload, ScanLine
} from 'lucide-react'

// ============ TIPOS ============

interface Conteiner {
  id: string
  codigo: string
  nome: string
  tipo: 'mala_cirurgica' | 'caixa_instrumental' | 'kit_emergencia' | 'container_geral'
  especialidade: string
  status: 'disponivel' | 'em_uso' | 'em_transito' | 'manutencao' | 'bloqueado'
  localizacao: {
    tipo: 'estoque' | 'hospital' | 'transito'
    nome: string
    endereco?: string
    coordenadas?: { lat: number; lng: number }
  }
  itens: Array<{
    id: string
    codigo: string
    nome: string
    quantidade: number
    lote: string
    validade: string
    diasParaVencer: number
    status: 'ok' | 'alerta' | 'critico' | 'vencido'
  }>
  ultimaMovimentacao: string
  proximaManutencao?: string
  temperatura?: number
  bateria?: number
  sinalGPS?: number
  alertas: string[]
}

interface MovimentacaoEstoque {
  id: string
  tipo: 'entrada' | 'saida' | 'transferencia' | 'ajuste'
  conteinerId?: string
  origem?: string
  destino?: string
  itens: Array<{
    codigo: string
    nome: string
    quantidade: number
    lote: string
  }>
  responsavel: string
  dataHora: string
  observacoes?: string
}

interface AlertaPreditivo {
  id: string
  tipo: 'vencimento' | 'estoque_baixo' | 'manutencao' | 'temperatura' | 'bateria'
  severidade: 'info' | 'warning' | 'critical'
  titulo: string
  descricao: string
  conteinerId?: string
  produtoId?: string
  dataPrevisao?: string
  acaoSugerida: string
  created_at: string
}

// ============ DADOS MOCK ============

const MOCK_CONTEINERES: Conteiner[] = [
  {
    id: '1',
    codigo: 'CTN-001',
    nome: 'Mala Ortopedia - Quadril',
    tipo: 'mala_cirurgica',
    especialidade: 'Ortopedia',
    status: 'disponivel',
    localizacao: {
      tipo: 'estoque',
      nome: 'Estoque Central',
      endereco: 'Rua Principal, 100 - São Paulo',
      coordenadas: { lat: -23.5505, lng: -46.6333 },
    },
    itens: [
      { id: '1', codigo: 'PROT-001', nome: 'Prótese Quadril Zimmer', quantidade: 2, lote: 'LT2025001', validade: '2026-06-15', diasParaVencer: 200, status: 'ok' },
      { id: '2', codigo: 'PAR-001', nome: 'Parafusos Ortopédicos 6.5mm', quantidade: 12, lote: 'LT2025002', validade: '2025-03-20', diasParaVencer: 112, status: 'alerta' },
      { id: '3', codigo: 'INST-001', nome: 'Instrumental Básico', quantidade: 1, lote: 'LT2024050', validade: '2025-01-15', diasParaVencer: 48, status: 'critico' },
    ],
    ultimaMovimentacao: '2025-11-25T14:30:00',
    proximaManutencao: '2025-12-15',
    temperatura: 22,
    bateria: 85,
    sinalGPS: 95,
    alertas: ['Item próximo ao vencimento: Instrumental Básico'],
  },
  {
    id: '2',
    codigo: 'CTN-002',
    nome: 'Mala Ortopedia - Joelho',
    tipo: 'mala_cirurgica',
    especialidade: 'Ortopedia',
    status: 'em_uso',
    localizacao: {
      tipo: 'hospital',
      nome: 'Hospital São Lucas',
      endereco: 'Av. Paulista, 500 - São Paulo',
      coordenadas: { lat: -23.5629, lng: -46.6544 },
    },
    itens: [
      { id: '4', codigo: 'PROT-002', nome: 'Prótese Joelho Smith', quantidade: 1, lote: 'LT2025010', validade: '2026-08-20', diasParaVencer: 265, status: 'ok' },
      { id: '5', codigo: 'ANC-001', nome: 'Âncoras de Sutura', quantidade: 8, lote: 'LT2025011', validade: '2025-05-10', diasParaVencer: 163, status: 'ok' },
    ],
    ultimaMovimentacao: '2025-11-28T08:00:00',
    temperatura: 21,
    bateria: 72,
    sinalGPS: 88,
    alertas: [],
  },
  {
    id: '3',
    codigo: 'CTN-003',
    nome: 'Kit Emergência Coluna',
    tipo: 'kit_emergencia',
    especialidade: 'Neurocirurgia',
    status: 'em_transito',
    localizacao: {
      tipo: 'transito',
      nome: 'Em trânsito para Hospital Einstein',
      coordenadas: { lat: -23.5980, lng: -46.7172 },
    },
    itens: [
      { id: '6', codigo: 'PAR-PED-001', nome: 'Parafusos Pediculares', quantidade: 16, lote: 'LT2025020', validade: '2026-02-28', diasParaVencer: 92, status: 'alerta' },
      { id: '7', codigo: 'HASTE-001', nome: 'Hastes de Titânio', quantidade: 4, lote: 'LT2025021', validade: '2026-10-15', diasParaVencer: 321, status: 'ok' },
    ],
    ultimaMovimentacao: '2025-11-28T10:30:00',
    temperatura: 23,
    bateria: 65,
    sinalGPS: 100,
    alertas: ['Bateria abaixo de 70%'],
  },
]

const MOCK_ALERTAS: AlertaPreditivo[] = [
  {
    id: '1',
    tipo: 'vencimento',
    severidade: 'critical',
    titulo: 'Vencimento Crítico',
    descricao: 'Instrumental Básico vence em 48 dias',
    conteinerId: '1',
    produtoId: '3',
    dataPrevisao: '2025-01-15',
    acaoSugerida: 'Priorizar uso ou transferir para cirurgia agendada',
    created_at: '2025-11-28T09:00:00',
  },
  {
    id: '2',
    tipo: 'vencimento',
    severidade: 'warning',
    titulo: 'Alerta de Validade',
    descricao: 'Parafusos Pediculares vencem em 92 dias',
    conteinerId: '3',
    produtoId: '6',
    dataPrevisao: '2026-02-28',
    acaoSugerida: 'Agendar uso nas próximas cirurgias de coluna',
    created_at: '2025-11-28T09:00:00',
  },
  {
    id: '3',
    tipo: 'bateria',
    severidade: 'warning',
    titulo: 'Bateria Baixa',
    descricao: 'CTN-003 com bateria em 65%',
    conteinerId: '3',
    acaoSugerida: 'Recarregar após retorno ao estoque',
    created_at: '2025-11-28T10:30:00',
  },
  {
    id: '4',
    tipo: 'estoque_baixo',
    severidade: 'info',
    titulo: 'Previsão de Reposição',
    descricao: 'Âncoras de Sutura: consumo previsto de 15 unidades nos próximos 30 dias',
    acaoSugerida: 'Gerar pedido de compra para 20 unidades',
    created_at: '2025-11-28T08:00:00',
  },
]

// ============ COMPONENTE CARD DO CONTÊINER ============

interface ConteinerCardProps {
  conteiner: Conteiner
  onClick: () => void
}

function ConteinerCard({ conteiner, onClick }: ConteinerCardProps) {
  const { isDark } = useTheme()
  
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  const statusConfig = {
    disponivel: { cor: '#10B981', texto: 'Disponível', icon: CheckCircle },
    em_uso: { cor: '#3B82F6', texto: 'Em Uso', icon: Play },
    em_transito: { cor: '#F59E0B', texto: 'Em Trânsito', icon: Truck },
    manutencao: { cor: '#8B5CF6', texto: 'Manutenção', icon: Settings },
    bloqueado: { cor: '#EF4444', texto: 'Bloqueado', icon: XCircle },
  }

  const status = statusConfig[conteiner.status]
  const StatusIcon = status.icon

  // Calcular itens críticos
  const itensCriticos = conteiner.itens.filter(i => i.status === 'critico' || i.status === 'vencido').length
  const itensAlerta = conteiner.itens.filter(i => i.status === 'alerta').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        p-4 rounded-xl cursor-pointer ${cardBg} border ${borderColor}
        ${isDark 
          ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
          : 'shadow-md hover:shadow-lg'
        }
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${status.cor}20` }}
          >
            <Box className="w-6 h-6" style={{ color: status.cor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${textPrimary}`}>{conteiner.codigo}</span>
              {conteiner.alertas.length > 0 && (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <p className={`text-sm ${textSecondary}`}>{conteiner.nome}</p>
          </div>
        </div>
        <Badge 
          className="text-xs"
          style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.texto}
        </Badge>
      </div>

      {/* Localização */}
      <div className={`flex items-center gap-2 mb-3 text-sm ${textSecondary}`}>
        <MapPin className="w-4 h-4" />
        <span>{conteiner.localizacao.nome}</span>
      </div>

      {/* Itens */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-[#6366F1]" />
          <span className={`text-sm ${textPrimary}`}>{conteiner.itens.length} itens</span>
        </div>
        {itensCriticos > 0 && (
          <Badge className="bg-red-500/20 text-red-500 text-xs">
            {itensCriticos} crítico{itensCriticos > 1 ? 's' : ''}
          </Badge>
        )}
        {itensAlerta > 0 && (
          <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">
            {itensAlerta} alerta{itensAlerta > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Sensores */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
        {conteiner.temperatura !== undefined && (
          <div className="flex items-center gap-1">
            <ThermometerSun className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className={`text-xs ${textSecondary}`}>{conteiner.temperatura}°C</span>
          </div>
        )}
        {conteiner.bateria !== undefined && (
          <div className="flex items-center gap-1">
            <Battery className={`w-3.5 h-3.5 ${conteiner.bateria < 30 ? 'text-red-500' : conteiner.bateria < 70 ? 'text-yellow-500' : 'text-green-500'}`} />
            <span className={`text-xs ${textSecondary}`}>{conteiner.bateria}%</span>
          </div>
        )}
        {conteiner.sinalGPS !== undefined && (
          <div className="flex items-center gap-1">
            <Signal className={`w-3.5 h-3.5 ${conteiner.sinalGPS > 80 ? 'text-green-500' : conteiner.sinalGPS > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
            <span className={`text-xs ${textSecondary}`}>GPS</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============ COMPONENTE PRINCIPAL ============

export function ConteineresInteligentes() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('conteineres')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [conteinerSelecionado, setConteinerSelecionado] = useState<Conteiner | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovoOpen, setIsNovoOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Filtrar contêineres
  const conteineresFiltrados = useMemo(() => {
    return MOCK_CONTEINERES.filter(c => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!c.codigo.toLowerCase().includes(query) && 
            !c.nome.toLowerCase().includes(query) &&
            !c.localizacao.nome.toLowerCase().includes(query)) {
          return false
        }
      }
      if (filtroStatus !== 'todos' && c.status !== filtroStatus) {
        return false
      }
      return true
    })
  }, [searchQuery, filtroStatus])

  // Estatísticas
  const stats = useMemo(() => ({
    total: MOCK_CONTEINERES.length,
    disponiveis: MOCK_CONTEINERES.filter(c => c.status === 'disponivel').length,
    emUso: MOCK_CONTEINERES.filter(c => c.status === 'em_uso').length,
    emTransito: MOCK_CONTEINERES.filter(c => c.status === 'em_transito').length,
    alertas: MOCK_ALERTAS.filter(a => a.severidade === 'warning' || a.severidade === 'critical').length,
    itensCriticos: MOCK_CONTEINERES.flatMap(c => c.itens).filter(i => i.status === 'critico').length,
  }), [])

  // Handlers
  const handleConteinerClick = (conteiner: Conteiner) => {
    setConteinerSelecionado(conteiner)
    setIsDetalhesOpen(true)
  }

  const handleScan = () => {
    setIsScannerOpen(true)
    toast.info('Abrindo scanner de código de barras...')
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
            style={{ backgroundColor: '#EC489920' }}
          >
            <Box className="w-7 h-7 text-[#EC4899]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Contêineres Inteligentes</h1>
            <p className={textSecondary}>Gestão de malas cirúrgicas com IA e GPS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleScan} className="gap-2">
            <ScanLine className="w-4 h-4" />
            Scanner
          </Button>
          <Button onClick={() => setIsNovoOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Contêiner
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <Box className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Total</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.total}</p>
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
                <p className={`text-xs ${textSecondary}`}>Disponíveis</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.disponiveis}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Em Uso</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.emUso}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Em Trânsito</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.emTransito}</p>
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
                <p className={`text-xs ${textSecondary}`}>Alertas</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.alertas}</p>
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
                <p className={`text-xs ${textSecondary}`}>IA Ativa</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>ON</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="conteineres" className="gap-2">
            <Box className="w-4 h-4" />
            Contêineres
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas Preditivos
          </TabsTrigger>
          <TabsTrigger value="movimentacao" className="gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Movimentação
          </TabsTrigger>
          <TabsTrigger value="inventario" className="gap-2">
            <Layers className="w-4 h-4" />
            Inventário
          </TabsTrigger>
          <TabsTrigger value="etiquetas" className="gap-2">
            <Tag className="w-4 h-4" />
            Etiquetas
          </TabsTrigger>
          <TabsTrigger value="ia" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            IA & Automação
          </TabsTrigger>
        </TabsList>

        {/* Tab: Contêineres */}
        <TabsContent value="conteineres" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por código, nome ou localização..."
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
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em_uso">Em Uso</SelectItem>
                    <SelectItem value="em_transito">Em Trânsito</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Contêineres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conteineresFiltrados.map((conteiner) => (
              <ConteinerCard
                key={conteiner.id}
                conteiner={conteiner}
                onClick={() => handleConteinerClick(conteiner)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Tab: Alertas Preditivos */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                Alertas Preditivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ALERTAS.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor} border-l-4 ${
                      alerta.severidade === 'critical' ? 'border-l-red-500' :
                      alerta.severidade === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          alerta.severidade === 'critical' ? 'bg-red-500/20' :
                          alerta.severidade === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                        }`}>
                          {alerta.tipo === 'vencimento' && <Calendar className={`w-5 h-5 ${
                            alerta.severidade === 'critical' ? 'text-red-500' :
                            alerta.severidade === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />}
                          {alerta.tipo === 'bateria' && <Battery className="w-5 h-5 text-yellow-500" />}
                          {alerta.tipo === 'estoque_baixo' && <Package className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${textPrimary}`}>{alerta.titulo}</h4>
                          <p className={`text-sm ${textSecondary}`}>{alerta.descricao}</p>
                          <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                            <p className={`text-xs ${textSecondary}`}>
                              <Zap className="w-3 h-3 inline mr-1 text-[#F59E0B]" />
                              Ação sugerida: {alerta.acaoSugerida}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Movimentação */}
        <TabsContent value="movimentacao" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { titulo: 'Entrada e Saída Automatizada', icon: ArrowRightLeft, cor: '#6366F1', desc: 'Registro automático via código de barras' },
              { titulo: 'Transferências entre Locais', icon: Truck, cor: '#10B981', desc: 'Movimentação rastreada em tempo real' },
              { titulo: 'Ajustes de Inventário', icon: RefreshCw, cor: '#F59E0B', desc: 'Correções com auditoria completa' },
              { titulo: 'Rastreabilidade Completa', icon: Navigation, cor: '#8B5CF6', desc: 'Histórico de todas as movimentações' },
            ].map((item) => (
              <Card key={item.titulo} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${item.cor}20` }}
                    >
                      <item.icon className="w-6 h-6" style={{ color: item.cor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${textPrimary}`}>{item.titulo}</h3>
                      <p className={`text-sm ${textSecondary} mb-3`}>{item.desc}</p>
                      <Button variant="secondary" size="sm" className="w-full">
                        Acessar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Inventário */}
        <TabsContent value="inventario" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { titulo: 'Contagem Cíclica Automatizada', icon: RefreshCw, cor: '#6366F1', desc: 'Contagens programadas por categoria' },
              { titulo: 'Inventário por Código de Barras', icon: Barcode, cor: '#10B981', desc: 'Leitura rápida e precisa' },
              { titulo: 'Reconciliação Automática', icon: CheckCircle, cor: '#F59E0B', desc: 'Ajuste automático de divergências' },
              { titulo: 'Relatórios de Divergências', icon: FileText, cor: '#EF4444', desc: 'Análise detalhada de diferenças' },
            ].map((item) => (
              <Card key={item.titulo} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${item.cor}20` }}
                    >
                      <item.icon className="w-6 h-6" style={{ color: item.cor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${textPrimary}`}>{item.titulo}</h3>
                      <p className={`text-sm ${textSecondary} mb-3`}>{item.desc}</p>
                      <Button variant="secondary" size="sm" className="w-full">
                        Acessar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#3B82F6]" />
                Localização e Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { titulo: 'Mapeamento de Posições', icon: Grid3X3 },
                  { titulo: 'Otimização de Layout', icon: Layers },
                  { titulo: 'Picking Inteligente', icon: Target },
                  { titulo: 'Endereçamento Automático', icon: MapPin },
                ].map((item) => (
                  <div 
                    key={item.titulo}
                    className={`p-3 rounded-xl ${inputBg} flex items-center gap-3 cursor-pointer hover:opacity-80`}
                  >
                    <item.icon className="w-5 h-5 text-[#3B82F6]" />
                    <span className={`text-sm ${textPrimary}`}>{item.titulo}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Etiquetas */}
        <TabsContent value="etiquetas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sistema de Etiquetas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#6366F1]" />
                  Sistema de Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { titulo: '3 Templates Profissionais', icon: FileText, cor: '#6366F1' },
                  { titulo: 'Geração em Lote', icon: Layers, cor: '#10B981' },
                  { titulo: 'QR Code Integrado', icon: QrCode, cor: '#F59E0B' },
                  { titulo: 'Impressão Automatizada', icon: Printer, cor: '#8B5CF6' },
                ].map((item) => (
                  <div 
                    key={item.titulo}
                    className={`p-3 rounded-xl ${inputBg} flex items-center justify-between cursor-pointer hover:opacity-80`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.cor}20` }}
                      >
                        <item.icon className="w-4 h-4" style={{ color: item.cor }} />
                      </div>
                      <span className={textPrimary}>{item.titulo}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Leitor de Código de Barras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-[#10B981]" />
                  Leitor Código de Barras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { titulo: 'Câmera Integrada', icon: Camera, cor: '#6366F1' },
                  { titulo: 'Leitor Dedicado', icon: ScanLine, cor: '#10B981' },
                  { titulo: 'Validação em Tempo Real', icon: CheckCircle, cor: '#F59E0B' },
                  { titulo: 'Sincronização Offline', icon: WifiOff, cor: '#8B5CF6' },
                ].map((item) => (
                  <div 
                    key={item.titulo}
                    className={`p-3 rounded-xl ${inputBg} flex items-center justify-between cursor-pointer hover:opacity-80`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.cor}20` }}
                      >
                        <item.icon className="w-4 h-4" style={{ color: item.cor }} />
                      </div>
                      <span className={textPrimary}>{item.titulo}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: IA & Automação */}
        <TabsContent value="ia" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                titulo: 'IA Auditoria',
                descricao: 'Detecção automática de anomalias',
                icon: BrainCircuit,
                cor: '#8B5CF6',
                metricas: [
                  { label: 'Anomalias Detectadas', value: '3' },
                  { label: 'Precisão', value: '98%' },
                ],
              },
              {
                titulo: 'IA Validade',
                descricao: 'Gestão inteligente de produtos próximos ao vencimento',
                icon: Calendar,
                cor: '#EF4444',
                metricas: [
                  { label: 'Itens Monitorados', value: '156' },
                  { label: 'Alertas Ativos', value: '12' },
                ],
              },
              {
                titulo: 'IA Otimização',
                descricao: 'Otimização de layout e picking',
                icon: Target,
                cor: '#10B981',
                metricas: [
                  { label: 'Economia Tempo', value: '35%' },
                  { label: 'Eficiência', value: '94%' },
                ],
              },
              {
                titulo: 'IA Previsão',
                descricao: 'Previsão de demanda com 95% de precisão',
                icon: TrendingUp,
                cor: '#3B82F6',
                metricas: [
                  { label: 'Previsões', value: '89' },
                  { label: 'Acurácia', value: '95%' },
                ],
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
                      <p className={`text-sm ${textSecondary} mb-3`}>{ia.descricao}</p>
                      <div className="flex gap-4">
                        {ia.metricas.map((m) => (
                          <div key={m.label}>
                            <p className={`text-lg font-bold ${textPrimary}`}>{m.value}</p>
                            <p className={`text-xs ${textSecondary}`}>{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes do Contêiner */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="w-5 h-5 text-[#EC4899]" />
              {conteinerSelecionado?.codigo} - {conteinerSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>

          {conteinerSelecionado && (
            <div className="space-y-4 py-4">
              {/* Status e Localização */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary} mb-1`}>Status</p>
                  <Badge className={
                    conteinerSelecionado.status === 'disponivel' ? 'bg-green-500/20 text-green-500' :
                    conteinerSelecionado.status === 'em_uso' ? 'bg-blue-500/20 text-blue-500' :
                    conteinerSelecionado.status === 'em_transito' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-slate-500/20 text-slate-500'
                  }>
                    {conteinerSelecionado.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary} mb-1`}>Localização</p>
                  <p className={`font-medium ${textPrimary}`}>{conteinerSelecionado.localizacao.nome}</p>
                </div>
              </div>

              {/* Sensores */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl ${inputBg} text-center`}>
                  <ThermometerSun className="w-6 h-6 mx-auto mb-2 text-[#F59E0B]" />
                  <p className={`text-2xl font-bold ${textPrimary}`}>{conteinerSelecionado.temperatura}°C</p>
                  <p className={`text-xs ${textSecondary}`}>Temperatura</p>
                </div>
                <div className={`p-4 rounded-xl ${inputBg} text-center`}>
                  <Battery className={`w-6 h-6 mx-auto mb-2 ${
                    (conteinerSelecionado.bateria || 0) < 30 ? 'text-red-500' : 
                    (conteinerSelecionado.bateria || 0) < 70 ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <p className={`text-2xl font-bold ${textPrimary}`}>{conteinerSelecionado.bateria}%</p>
                  <p className={`text-xs ${textSecondary}`}>Bateria</p>
                </div>
                <div className={`p-4 rounded-xl ${inputBg} text-center`}>
                  <Signal className={`w-6 h-6 mx-auto mb-2 ${
                    (conteinerSelecionado.sinalGPS || 0) > 80 ? 'text-green-500' : 
                    (conteinerSelecionado.sinalGPS || 0) > 50 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  <p className={`text-2xl font-bold ${textPrimary}`}>{conteinerSelecionado.sinalGPS}%</p>
                  <p className={`text-xs ${textSecondary}`}>Sinal GPS</p>
                </div>
              </div>

              {/* Itens */}
              <div>
                <h4 className={`font-semibold ${textPrimary} mb-3`}>Itens ({conteinerSelecionado.itens.length})</h4>
                <div className="space-y-2">
                  {conteinerSelecionado.itens.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-3 rounded-xl ${inputBg} flex items-center justify-between`}
                    >
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{item.nome}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          Lote: {item.lote} • Qtd: {item.quantidade}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          item.status === 'ok' ? 'bg-green-500/20 text-green-500' :
                          item.status === 'alerta' ? 'bg-yellow-500/20 text-yellow-500' :
                          item.status === 'critico' ? 'bg-red-500/20 text-red-500' :
                          'bg-slate-500/20 text-slate-500'
                        }>
                          {item.diasParaVencer}d
                        </Badge>
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          Vence: {new Date(item.validade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas */}
              {conteinerSelecionado.alertas.length > 0 && (
                <div className={`p-4 rounded-xl bg-orange-500/10 border border-orange-500/20`}>
                  <h4 className="font-medium text-orange-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Alertas
                  </h4>
                  <ul className="space-y-1">
                    {conteinerSelecionado.alertas.map((alerta, idx) => (
                      <li key={idx} className="text-sm text-orange-400">• {alerta}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Navigation className="w-4 h-4" />
              Rastrear GPS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ConteineresInteligentes

