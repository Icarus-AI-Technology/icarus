/**
 * ICARUS v5.0 - Kanban de Cirurgias OPME
 * 
 * Componente Kanban para gestão visual do fluxo de cirurgias
 * com drag & drop, cores por status e integração com IA.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Calculator, Clock, CheckCircle, Calendar, Truck,
  Activity, RotateCcw, ClipboardCheck, Receipt, AlertCircle,
  CheckCircle2, User, Building2, Stethoscope, Package,
  MoreVertical, Eye, ChevronRight, Zap, BrainCircuit
} from 'lucide-react'
import { 
  StatusCirurgia, 
  KANBAN_COLUMNS, 
  STATUS_CORES,
  type Cirurgia 
} from '@/lib/types/cirurgias'

// ============ TIPOS ============

interface KanbanCirurgiasProps {
  cirurgias: Cirurgia[]
  onCardClick?: (cirurgia: Cirurgia) => void
  onStatusChange?: (cirurgiaId: string, novoStatus: StatusCirurgia) => void
  compacto?: boolean
}

interface KanbanCardProps {
  cirurgia: Cirurgia
  onClick?: () => void
  compacto?: boolean
}

// ============ ÍCONES POR STATUS ============

const StatusIcons: Record<StatusCirurgia, React.ElementType> = {
  pedido_medico: FileText,
  cotacao: Calculator,
  aguardando_autorizacao: Clock,
  autorizada: CheckCircle,
  agendada: Calendar,
  logistica: Truck,
  em_cirurgia: Activity,
  logistica_reversa: RotateCcw,
  pos_cirurgico: ClipboardCheck,
  aguardando_faturamento: Receipt,
  faturamento_parcial: AlertCircle,
  faturada: CheckCircle2,
  cancelada: AlertCircle,
}

// ============ COMPONENTE CARD ============

function KanbanCard({ cirurgia, onClick, compacto = false }: KanbanCardProps) {
  const { isDark } = useTheme()
  
  const cardBg = isDark ? 'bg-[#1A1F35]' : 'bg-white'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'
  
  // Cor do indicador baseada no status
  const statusColor = STATUS_CORES[cirurgia.status] || '#64748B'
  
  // Determinar cor do card baseado em alertas/urgência
  const getCardBorderColor = () => {
    if (cirurgia.tipo_cirurgia === 'urgencia') return 'border-l-red-500'
    if (cirurgia.faturamento_status === 'glosado') return 'border-l-red-500'
    return 'border-l-transparent'
  }

  if (compacto) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileHover={{ scale: 1.02 }}
        className={`
          p-3 rounded-xl cursor-pointer transition-all
          ${cardBg} border ${borderColor} border-l-4 ${getCardBorderColor()}
          ${isDark 
            ? 'hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
            : 'hover:shadow-lg'
          }
        `}
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${textPrimary}`}>
              {cirurgia.paciente?.nome_completo || 'Paciente'}
            </p>
            <p className={`text-xs truncate ${textSecondary}`}>
              {cirurgia.procedimento?.descricao || 'Procedimento'}
            </p>
          </div>
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: statusColor }}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      className={`
        p-4 rounded-xl cursor-pointer transition-all
        ${cardBg} border ${borderColor} border-l-4 ${getCardBorderColor()}
        ${isDark 
          ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
          : 'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-lg'
        }
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${textPrimary}`}>
              #{cirurgia.numero_cirurgia}
            </span>
            {cirurgia.tipo_cirurgia === 'urgencia' && (
              <Badge className="bg-red-500/20 text-red-500 border-none text-xs">
                URGÊNCIA
              </Badge>
            )}
          </div>
          <p className={`text-sm font-medium ${textPrimary}`}>
            {cirurgia.paciente?.nome_completo || 'Paciente não identificado'}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Procedimento */}
      <p className={`text-sm mb-3 ${textSecondary}`}>
        {cirurgia.procedimento?.descricao || 'Procedimento não definido'}
      </p>

      {/* Info Grid */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <Stethoscope className={`w-3.5 h-3.5 ${textSecondary}`} />
          <span className={`text-xs ${textSecondary}`}>
            {cirurgia.medico?.nome_completo || 'Médico'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className={`w-3.5 h-3.5 ${textSecondary}`} />
          <span className={`text-xs ${textSecondary}`}>
            {cirurgia.hospital?.nome_fantasia || 'Hospital'}
          </span>
        </div>
        {cirurgia.data_agendada && (
          <div className="flex items-center gap-2">
            <Calendar className={`w-3.5 h-3.5 ${textSecondary}`} />
            <span className={`text-xs ${textSecondary}`}>
              {new Date(cirurgia.data_agendada).toLocaleDateString('pt-BR')}
              {cirurgia.hora_agendada && ` às ${cirurgia.hora_agendada}`}
            </span>
          </div>
        )}
      </div>

      {/* Materiais */}
      {cirurgia.materiais_utilizados && cirurgia.materiais_utilizados.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <Package className={`w-3.5 h-3.5 ${textSecondary}`} />
          <span className={`text-xs ${textSecondary}`}>
            {cirurgia.materiais_utilizados.length} materiais
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {cirurgia.convenio && (
            <Badge 
              className="text-xs border-none"
              style={{ 
                backgroundColor: `${statusColor}20`,
                color: statusColor 
              }}
            >
              {cirurgia.convenio.nome_fantasia}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          <Eye className="w-3 h-3 mr-1" />
          Ver
        </Button>
      </div>
    </motion.div>
  )
}

// ============ COMPONENTE COLUNA ============

interface KanbanColumnProps {
  status: StatusCirurgia
  titulo: string
  cor: string
  cirurgias: Cirurgia[]
  onCardClick?: (cirurgia: Cirurgia) => void
  compacto?: boolean
}

function KanbanColumn({ 
  status, 
  titulo, 
  cor, 
  cirurgias, 
  onCardClick,
  compacto = false 
}: KanbanColumnProps) {
  const { isDark } = useTheme()
  const Icon = StatusIcons[status]
  
  const columnBg = isDark ? 'bg-[#0F1220]' : 'bg-slate-100'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  
  return (
    <div className={`
      flex-shrink-0 w-72 rounded-xl ${columnBg} p-3
      ${isDark 
        ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]' 
        : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
      }
    `}>
      {/* Header da Coluna */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${cor}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: cor }} />
          </div>
          <div>
            <h3 className={`font-medium text-sm ${textPrimary}`}>{titulo}</h3>
            <span className="text-xs text-slate-500">{cirurgias.length} itens</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
        <AnimatePresence>
          {cirurgias.map((cirurgia) => (
            <KanbanCard
              key={cirurgia.id}
              cirurgia={cirurgia}
              onClick={() => onCardClick?.(cirurgia)}
              compacto={compacto}
            />
          ))}
        </AnimatePresence>
        
        {cirurgias.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nenhuma cirurgia
          </div>
        )}
      </div>
    </div>
  )
}

// ============ COMPONENTE PRINCIPAL ============

export function KanbanCirurgias({ 
  cirurgias, 
  onCardClick,
  onStatusChange,
  compacto = false 
}: KanbanCirurgiasProps) {
  const { isDark } = useTheme()
  const [filtroStatus, setFiltroStatus] = useState<StatusCirurgia[]>([])
  
  // Agrupar cirurgias por status
  const cirurgiasPorStatus = useMemo(() => {
    const grouped: Record<StatusCirurgia, Cirurgia[]> = {} as Record<StatusCirurgia, Cirurgia[]>
    
    KANBAN_COLUMNS.forEach(col => {
      grouped[col.id] = cirurgias.filter(c => c.status === col.id)
    })
    
    return grouped
  }, [cirurgias])

  // Estatísticas
  const stats = useMemo(() => ({
    total: cirurgias.length,
    emAndamento: cirurgias.filter(c => 
      ['logistica', 'em_cirurgia', 'logistica_reversa'].includes(c.status)
    ).length,
    pendenteFaturamento: cirurgias.filter(c => 
      ['aguardando_faturamento', 'faturamento_parcial'].includes(c.status)
    ).length,
    urgencias: cirurgias.filter(c => c.tipo_cirurgia === 'urgencia').length,
  }), [cirurgias])

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'

  return (
    <div className="space-y-4">
      {/* Header com Estatísticas */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className={`text-sm ${textSecondary}`}>
              <span className={`font-semibold ${textPrimary}`}>{stats.total}</span> Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className={`text-sm ${textSecondary}`}>
              <span className={`font-semibold ${textPrimary}`}>{stats.emAndamento}</span> Em Andamento
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className={`text-sm ${textSecondary}`}>
              <span className={`font-semibold ${textPrimary}`}>{stats.pendenteFaturamento}</span> Pendente Faturamento
            </span>
          </div>
          {stats.urgencias > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className={`text-sm ${textSecondary}`}>
                <span className={`font-semibold text-red-500`}>{stats.urgencias}</span> Urgências
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <BrainCircuit className="w-4 h-4 text-[#6366F1]" />
            Sugestões IA
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              status={column.id}
              titulo={column.titulo}
              cor={column.cor}
              cirurgias={cirurgiasPorStatus[column.id] || []}
              onCardClick={onCardClick}
              compacto={compacto}
            />
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className={`
        flex flex-wrap items-center gap-4 p-4 rounded-xl
        ${isDark ? 'bg-[#0F1220]' : 'bg-slate-100'}
      `}>
        <span className={`text-sm font-medium ${textSecondary}`}>Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className={`text-xs ${textSecondary}`}>Pendente/Urgência</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className={`text-xs ${textSecondary}`}>Em Processamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className={`text-xs ${textSecondary}`}>Concluído</span>
        </div>
      </div>
    </div>
  )
}

export default KanbanCirurgias

