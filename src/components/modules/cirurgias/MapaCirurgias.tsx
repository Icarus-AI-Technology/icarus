/**
 * ICARUS v5.0 - Mapa de Cirurgias
 * 
 * Gráfico horizontal de status com fluxo completo de cirurgias OPME.
 * Integrado com Pré-cirúrgico, Pós-cirúrgico e Faturamento.
 * 
 * STATUS DE CIRURGIAS:
 * 1. EM NEGOCIAÇÃO - Pedido médico anexado
 * 2. RESPONDIDA - Cotada pelo pré-cirúrgico
 * 3. AUTORIZADA - Autorizada pelo convênio/hospital
 * 4. AGENDADA - Data e sala definidas
 * 5. REALIZADA - Aguardando autorização de faturamento
 * 6. FATURADA - Nota fiscal de venda emitida
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, MessageSquare, CheckCircle, Calendar, Activity, Receipt,
  Search, Filter, Download, RefreshCw, ChevronRight, User, Building2,
  Stethoscope, CreditCard, Clock, AlertCircle, TrendingUp, ArrowRight,
  Eye, MoreVertical, Zap, BrainCircuit, ExternalLink, Phone, Mail
} from 'lucide-react'

// ============ TIPOS ============

export type StatusCirurgiaSimplificado = 
  | 'em_negociacao'
  | 'respondida'
  | 'autorizada'
  | 'agendada'
  | 'realizada'
  | 'faturada'

export interface CirurgiaMapaItem {
  id: string
  numero: string
  paciente: {
    nome: string
    convenio: string
    matricula: string
  }
  medico: {
    nome: string
    crm: string
    especialidade: string
  }
  hospital: {
    nome: string
    cidade: string
  }
  convenio: {
    nome: string
    tipo: 'direto' | 'repasse'
  }
  vendedor?: string
  procedimento: string
  data_agendada?: string
  hora_agendada?: string
  status: StatusCirurgiaSimplificado
  valor_estimado: number
  valor_faturado?: number
  tipo: 'eletiva' | 'urgencia'
  dias_no_status: number
  alertas: string[]
  created_at: string
}

interface MapaCirurgiasProps {
  cirurgias: CirurgiaMapaItem[]
  onCirurgiaClick?: (cirurgia: CirurgiaMapaItem) => void
  onStatusChange?: (cirurgiaId: string, novoStatus: StatusCirurgiaSimplificado) => void
  onExportExcel?: () => void
  onExportPDF?: () => void
}

// ============ CONFIGURAÇÃO DOS STATUS ============

const STATUS_CONFIG: Record<StatusCirurgiaSimplificado, {
  label: string
  cor: string
  corBg: string
  icon: React.ElementType
  descricao: string
  ordem: number
}> = {
  em_negociacao: {
    label: 'Em Negociação',
    cor: '#8b5cf6',
    corBg: '#8b5cf620',
    icon: MessageSquare,
    descricao: 'Pedido médico anexado',
    ordem: 1,
  },
  respondida: {
    label: 'Respondida',
    cor: '#8B5CF6',
    corBg: '#8B5CF620',
    icon: FileText,
    descricao: 'Cotada pelo pré-cirúrgico',
    ordem: 2,
  },
  autorizada: {
    label: 'Autorizada',
    cor: '#10B981',
    corBg: '#10B98120',
    icon: CheckCircle,
    descricao: 'Autorizada pelo convênio/hospital',
    ordem: 3,
  },
  agendada: {
    label: 'Agendada',
    cor: '#3B82F6',
    corBg: '#3B82F620',
    icon: Calendar,
    descricao: 'Data e sala definidas',
    ordem: 4,
  },
  realizada: {
    label: 'Realizada',
    cor: '#EC4899',
    corBg: '#EC489920',
    icon: Activity,
    descricao: 'Aguardando autorização de faturamento',
    ordem: 5,
  },
  faturada: {
    label: 'Faturada',
    cor: '#14B8A6',
    corBg: '#14B8A620',
    icon: Receipt,
    descricao: 'Nota fiscal de venda emitida',
    ordem: 6,
  },
}

// ============ COMPONENTE CARD DE CIRURGIA ============

interface CirurgiaCardProps {
  cirurgia: CirurgiaMapaItem
  onClick?: () => void
}

function CirurgiaCard({ cirurgia, onClick }: CirurgiaCardProps) {
  const { isDark } = useTheme()
  const statusConfig = STATUS_CONFIG[cirurgia.status]
  
  const cardBg = isDark ? 'bg-[#1A1F35]' : 'bg-white'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Cor da borda lateral baseada no tipo
  const borderLeftColor = cirurgia.tipo === 'urgencia' ? 'border-l-red-500' : 'border-l-transparent'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`
        p-3 rounded-xl cursor-pointer transition-all
        ${cardBg} border ${borderColor} border-l-4 ${borderLeftColor}
        ${isDark 
          ? 'shadow-[3px_3px_6px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.02)] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
          : 'shadow-md hover:shadow-lg'
        }
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${textSecondary}`}>#{cirurgia.numero}</span>
          {cirurgia.tipo === 'urgencia' && (
            <Badge className="bg-red-500/20 text-red-500 border-none text-[10px] px-1.5">
              URGÊNCIA
            </Badge>
          )}
        </div>
        {cirurgia.alertas.length > 0 && (
          <div className="relative">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
              {cirurgia.alertas.length}
            </span>
          </div>
        )}
      </div>

      {/* Paciente */}
      <p className={`font-medium text-sm truncate ${textPrimary}`}>
        {cirurgia.paciente.nome}
      </p>

      {/* Procedimento */}
      <p className={`text-xs truncate mt-1 ${textSecondary}`}>
        {cirurgia.procedimento}
      </p>

      {/* Info */}
      <div className="flex items-center gap-3 mt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <Stethoscope className={`w-3 h-3 ${textSecondary}`} />
          <span className={textSecondary}>{cirurgia.medico.nome.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-1">
          <Building2 className={`w-3 h-3 ${textSecondary}`} />
          <span className={textSecondary}>{cirurgia.hospital.nome.split(' ')[0]}</span>
        </div>
      </div>

      {/* Data e Valor */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        {cirurgia.data_agendada ? (
          <span className={`text-[10px] ${textSecondary}`}>
            {new Date(cirurgia.data_agendada).toLocaleDateString('pt-BR')}
          </span>
        ) : (
          <span className={`text-[10px] ${textSecondary}`}>
            {cirurgia.dias_no_status}d no status
          </span>
        )}
        <span className={`text-xs font-semibold ${textPrimary}`}>
          R$ {(cirurgia.valor_faturado || cirurgia.valor_estimado).toLocaleString('pt-BR')}
        </span>
      </div>
    </motion.div>
  )
}

// ============ COMPONENTE COLUNA DO MAPA ============

interface MapaColumnProps {
  status: StatusCirurgiaSimplificado
  cirurgias: CirurgiaMapaItem[]
  onCirurgiaClick?: (cirurgia: CirurgiaMapaItem) => void
}

function MapaColumn({ status, cirurgias, onCirurgiaClick }: MapaColumnProps) {
  const { isDark } = useTheme()
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  
  const columnBg = isDark ? 'bg-[#0F1220]' : 'bg-slate-100'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'

  // Calcular valor total da coluna
  const valorTotal = cirurgias.reduce((acc, c) => acc + (c.valor_faturado || c.valor_estimado), 0)

  return (
    <div className={`
      flex-shrink-0 w-64 rounded-xl ${columnBg} overflow-hidden
      ${isDark 
        ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]' 
        : 'shadow-inner'
      }
    `}>
      {/* Header */}
      <div 
        className="p-3 border-b"
        style={{ 
          borderColor: isDark ? '#252B44' : '#e2e8f0',
          background: `linear-gradient(135deg, ${config.corBg} 0%, transparent 100%)`
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: config.corBg }}
            >
              <Icon className="w-4 h-4" style={{ color: config.cor }} />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${textPrimary}`}>{config.label}</h3>
              <p className="text-[10px] text-slate-500">{config.descricao}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            className="text-xs border-none"
            style={{ backgroundColor: config.corBg, color: config.cor }}
          >
            {cirurgias.length} cirurgias
          </Badge>
          <span className="text-xs font-semibold" style={{ color: config.cor }}>
            R$ {valorTotal.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="p-2 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        <AnimatePresence>
          {cirurgias.map((cirurgia) => (
            <CirurgiaCard
              key={cirurgia.id}
              cirurgia={cirurgia}
              onClick={() => onCirurgiaClick?.(cirurgia)}
            />
          ))}
        </AnimatePresence>
        
        {cirurgias.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            Nenhuma cirurgia
          </div>
        )}
      </div>
    </div>
  )
}

// ============ COMPONENTE PRINCIPAL ============

export function MapaCirurgias({ 
  cirurgias, 
  onCirurgiaClick,
  onStatusChange,
  onExportExcel,
  onExportPDF
}: MapaCirurgiasProps) {
  const { isDark } = useTheme()
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroMedico, setFiltroMedico] = useState<string>('todos')
  const [filtroConvenio, setFiltroConvenio] = useState<string>('todos')
  const [filtroHospital, setFiltroHospital] = useState<string>('todos')
  const [filtroVendedor, setFiltroVendedor] = useState<string>('todos')
  const [showFilters, setShowFilters] = useState(false)

  // Listas únicas para filtros
  const medicos = useMemo(() => 
    [...new Set(cirurgias.map(c => c.medico.nome))].sort(),
    [cirurgias]
  )
  const convenios = useMemo(() => 
    [...new Set(cirurgias.map(c => c.convenio.nome))].sort(),
    [cirurgias]
  )
  const hospitais = useMemo(() => 
    [...new Set(cirurgias.map(c => c.hospital.nome))].sort(),
    [cirurgias]
  )
  const vendedores = useMemo(() => 
    [...new Set(cirurgias.filter(c => c.vendedor).map(c => c.vendedor!))].sort(),
    [cirurgias]
  )

  // Aplicar filtros
  const cirurgiasFiltradas = useMemo(() => {
    return cirurgias.filter(c => {
      // Busca textual
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const match = 
          c.paciente.nome.toLowerCase().includes(query) ||
          c.medico.nome.toLowerCase().includes(query) ||
          c.hospital.nome.toLowerCase().includes(query) ||
          c.numero.toLowerCase().includes(query) ||
          c.procedimento.toLowerCase().includes(query)
        if (!match) return false
      }
      
      // Filtros específicos
      if (filtroMedico !== 'todos' && c.medico.nome !== filtroMedico) return false
      if (filtroConvenio !== 'todos' && c.convenio.nome !== filtroConvenio) return false
      if (filtroHospital !== 'todos' && c.hospital.nome !== filtroHospital) return false
      if (filtroVendedor !== 'todos' && c.vendedor !== filtroVendedor) return false
      
      return true
    })
  }, [cirurgias, searchQuery, filtroMedico, filtroConvenio, filtroHospital, filtroVendedor])

  // Agrupar por status
  const cirurgiasPorStatus = useMemo(() => {
    const grouped: Record<StatusCirurgiaSimplificado, CirurgiaMapaItem[]> = {
      em_negociacao: [],
      respondida: [],
      autorizada: [],
      agendada: [],
      realizada: [],
      faturada: [],
    }
    
    cirurgiasFiltradas.forEach(c => {
      if (grouped[c.status]) {
        grouped[c.status].push(c)
      }
    })
    
    return grouped
  }, [cirurgiasFiltradas])

  // Estatísticas
  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0]
    const semanaInicio = new Date()
    semanaInicio.setDate(semanaInicio.getDate() - 7)
    const mesInicio = new Date()
    mesInicio.setDate(1)

    return {
      total: cirurgiasFiltradas.length,
      emAndamento: cirurgiasFiltradas.filter(c => 
        ['em_negociacao', 'respondida', 'autorizada', 'agendada'].includes(c.status)
      ).length,
      finalizadas: cirurgiasFiltradas.filter(c => 
        ['realizada', 'faturada'].includes(c.status)
      ).length,
      hoje: cirurgiasFiltradas.filter(c => c.data_agendada === hoje).length,
      semana: cirurgiasFiltradas.filter(c => 
        c.data_agendada && new Date(c.data_agendada) >= semanaInicio
      ).length,
      mes: cirurgiasFiltradas.filter(c => 
        c.data_agendada && new Date(c.data_agendada) >= mesInicio
      ).length,
      valorTotal: cirurgiasFiltradas.reduce((acc, c) => acc + (c.valor_faturado || c.valor_estimado), 0),
      urgencias: cirurgiasFiltradas.filter(c => c.tipo === 'urgencia').length,
    }
  }, [cirurgiasFiltradas])

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'

  // Limpar filtros
  const limparFiltros = () => {
    setSearchQuery('')
    setFiltroMedico('todos')
    setFiltroConvenio('todos')
    setFiltroHospital('todos')
    setFiltroVendedor('todos')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Título e Stats */}
            <div>
              <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                <Activity className="w-6 h-6 text-[#6366F1]" />
                Mapa de Cirurgias
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${textPrimary}`}>{stats.total}</span>
                  <span className={textSecondary}>Total</span>
                </div>
                <div className="h-6 w-px bg-slate-500/30" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className={`text-sm ${textSecondary}`}>{stats.emAndamento} em andamento</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className={`text-sm ${textSecondary}`}>{stats.finalizadas} finalizadas</span>
                </div>
                {stats.urgencias > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className={`text-sm text-red-500`}>{stats.urgencias} urgências</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onExportExcel} className="gap-2">
                <Download className="w-4 h-4" />
                Excel
              </Button>
              <Button variant="secondary" size="sm" onClick={onExportPDF} className="gap-2">
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button variant="secondary" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                <Input
                  placeholder="Buscar por paciente, médico, hospital, número..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="secondary" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {(filtroMedico !== 'todos' || filtroConvenio !== 'todos' || filtroHospital !== 'todos' || filtroVendedor !== 'todos') && (
                  <Badge className="bg-[#6366F1] text-white ml-1">
                    {[filtroMedico, filtroConvenio, filtroHospital, filtroVendedor].filter(f => f !== 'todos').length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filtros Expandidos */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`p-4 rounded-xl ${inputBg} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4`}>
                    <div>
                      <Label className="text-xs">Médico</Label>
                      <Select value={filtroMedico} onValueChange={setFiltroMedico}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {medicos.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Convênio</Label>
                      <Select value={filtroConvenio} onValueChange={setFiltroConvenio}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {convenios.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Hospital</Label>
                      <Select value={filtroHospital} onValueChange={setFiltroHospital}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {hospitais.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Vendedor</Label>
                      <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {vendedores.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" onClick={limparFiltros} className="w-full">
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-xl ${inputBg}`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3B82F6]" />
                <span className={`text-xs ${textSecondary}`}>Hoje</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary} mt-1`}>{stats.hoje}</p>
            </div>
            <div className={`p-3 rounded-xl ${inputBg}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8B5CF6]" />
                <span className={`text-xs ${textSecondary}`}>Esta Semana</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary} mt-1`}>{stats.semana}</p>
            </div>
            <div className={`p-3 rounded-xl ${inputBg}`}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <span className={`text-xs ${textSecondary}`}>Este Mês</span>
              </div>
              <p className={`text-xl font-bold ${textPrimary} mt-1`}>{stats.mes}</p>
            </div>
            <div className={`p-3 rounded-xl ${inputBg}`}>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#8b5cf6]" />
                <span className={`text-xs ${textSecondary}`}>Valor Total</span>
              </div>
              <p className={`text-lg font-bold ${textPrimary} mt-1`}>
                R$ {(stats.valorTotal / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Horizontal de Status (Fluxo) */}
      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {Object.entries(STATUS_CONFIG)
              .sort(([, a], [, b]) => a.ordem - b.ordem)
              .map(([status, config], index, arr) => {
                const count = cirurgiasPorStatus[status as StatusCirurgiaSimplificado]?.length || 0
                const Icon = config.icon
                
                return (
                  <React.Fragment key={status}>
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                        style={{ backgroundColor: config.corBg }}
                      >
                        <Icon className="w-6 h-6" style={{ color: config.cor }} />
                      </div>
                      <span className={`text-xs font-medium ${textPrimary}`}>{config.label}</span>
                      <Badge 
                        className="mt-1 text-xs border-none"
                        style={{ backgroundColor: config.corBg, color: config.cor }}
                      >
                        {count}
                      </Badge>
                    </div>
                    {index < arr.length - 1 && (
                      <ArrowRight className={`w-5 h-5 flex-shrink-0 mx-2 ${textSecondary}`} />
                    )}
                  </React.Fragment>
                )
              })
            }
          </div>
        </CardContent>
      </Card>

      {/* Kanban Horizontal */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {Object.entries(STATUS_CONFIG)
            .sort(([, a], [, b]) => a.ordem - b.ordem)
            .map(([status]) => (
              <MapaColumn
                key={status}
                status={status as StatusCirurgiaSimplificado}
                cirurgias={cirurgiasPorStatus[status as StatusCirurgiaSimplificado] || []}
                onCirurgiaClick={onCirurgiaClick}
              />
            ))
          }
        </div>
      </div>

      {/* Legenda */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-6">
            <span className={`text-sm font-medium ${textSecondary}`}>Legenda:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border-l-4 border-l-red-500 bg-slate-600/20" />
              <span className={`text-xs ${textSecondary}`}>Urgência</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className={`text-xs ${textSecondary}`}>Com Alertas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className={`text-xs ${textSecondary}`}>Em Negociação/Processamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className={`text-xs ${textSecondary}`}>Concluído</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MapaCirurgias

