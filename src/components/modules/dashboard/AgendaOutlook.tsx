/**
 * ICARUS v5.0 - Agenda Outlook Component
 * 
 * Componente de agenda integrado com Microsoft Outlook
 * com design Dark Glass Medical e Agente IA Secretário.
 * 
 * Funcionalidades:
 * - Visualização de eventos do dia/semana
 * - Sincronização com Outlook
 * - Alertas do Agente Secretário
 * - Ações rápidas em eventos
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Stethoscope,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  Sparkles,
  X,
  MoreVertical,
  CalendarDays,
  Building2,
  User,
  FileText,
  Zap
} from 'lucide-react'
import {
  useSecretaryAgent,
  type EventoAgenda,
  type AlertaSecretario,
} from '@/lib/ai/agents/secretary-agent'

// ============ TIPOS ============

interface AgendaOutlookProps {
  compacto?: boolean
  mostrarAlertas?: boolean
  maxEventos?: number
}

// ============ DADOS MOCK ============

const eventosMock: EventoAgenda[] = [
  {
    id: '1',
    titulo: 'Cirurgia - Implante Marca-passo Assurity MRI',
    tipo: 'cirurgia',
    dataInicio: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    dataFim: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    local: 'Hospital São Lucas - Centro Cirúrgico 3',
    prioridade: 'alta',
    status: 'confirmado',
    participantes: [
      { nome: 'Dr. Carlos Silva', email: 'carlos@hospital.com', confirmado: true },
      { nome: 'Equipe Logística', confirmado: true },
    ],
    tags: ['CRM', 'Abbott', 'Marca-passo'],
    sincronizadoOutlook: true,
  },
  {
    id: '2',
    titulo: 'Reunião Comercial - Abbott',
    tipo: 'reuniao',
    dataInicio: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    dataFim: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    local: 'Microsoft Teams',
    prioridade: 'media',
    status: 'confirmado',
    participantes: [
      { nome: 'Representante Abbott', email: 'rep@abbott.com', confirmado: true },
    ],
    tags: ['Comercial', 'Fornecedor'],
    sincronizadoOutlook: true,
  },
  {
    id: '3',
    titulo: 'Troca de Gerador CDI',
    tipo: 'cirurgia',
    dataInicio: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    dataFim: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
    local: 'Hospital Albert Einstein - CC 5',
    prioridade: 'alta',
    status: 'confirmado',
    participantes: [
      { nome: 'Dra. Ana Costa', confirmado: true },
    ],
    tags: ['CRM', 'CDI'],
    sincronizadoOutlook: true,
  },
  {
    id: '4',
    titulo: 'Alinhamento Equipe Logística',
    tipo: 'reuniao',
    dataInicio: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    dataFim: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
    local: 'Sala de Reuniões',
    prioridade: 'baixa',
    status: 'pendente',
    sincronizadoOutlook: true,
  },
  {
    id: '5',
    titulo: 'Verificar autorizações pendentes',
    tipo: 'tarefa',
    dataInicio: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    prioridade: 'media',
    status: 'pendente',
    tags: ['Convênios'],
  },
]

// ============ COMPONENTES AUXILIARES ============

function EventoIcon({ tipo }: { tipo: EventoAgenda['tipo'] }) {
  const iconClass = "w-4 h-4"
  
  switch (tipo) {
    case 'cirurgia':
      return <Stethoscope className={`${iconClass} text-red-400`} />
    case 'reuniao':
      return <Video className={`${iconClass} text-blue-400`} />
    case 'consulta':
      return <User className={`${iconClass} text-green-400`} />
    case 'tarefa':
      return <FileText className={`${iconClass} text-amber-400`} />
    case 'lembrete':
      return <Bell className={`${iconClass} text-purple-400`} />
    default:
      return <Calendar className={`${iconClass} text-slate-400`} />
  }
}

function PrioridadeBadge({ prioridade }: { prioridade: EventoAgenda['prioridade'] }) {
  const configs = {
    baixa: { label: 'Baixa', color: 'bg-slate-500/20 text-slate-400' },
    media: { label: 'Média', color: 'bg-blue-500/20 text-blue-400' },
    alta: { label: 'Alta', color: 'bg-orange-500/20 text-orange-400' },
    urgente: { label: 'Urgente', color: 'bg-red-500/20 text-red-400' },
  }
  
  return (
    <Badge className={`${configs[prioridade].color} text-xs border-none`}>
      {configs[prioridade].label}
    </Badge>
  )
}

function StatusIndicator({ status }: { status: EventoAgenda['status'] }) {
  const configs = {
    pendente: { color: 'bg-amber-500', pulse: false },
    confirmado: { color: 'bg-emerald-500', pulse: false },
    em_andamento: { color: 'bg-blue-500', pulse: true },
    concluido: { color: 'bg-slate-500', pulse: false },
    cancelado: { color: 'bg-red-500', pulse: false },
  }
  
  const config = configs[status]
  
  return (
    <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
  )
}

function AlertaCard({ 
  alerta, 
  onDismiss,
  isDark 
}: { 
  alerta: AlertaSecretario
  onDismiss: () => void
  isDark: boolean 
}) {
  const prioridadeConfig = {
    info: { bg: 'border-l-blue-500', icon: <Sparkles className="w-4 h-4 text-blue-400" /> },
    atencao: { bg: 'border-l-amber-500', icon: <AlertCircle className="w-4 h-4 text-amber-400" /> },
    urgente: { bg: 'border-l-orange-500', icon: <Bell className="w-4 h-4 text-orange-400" /> },
    critico: { bg: 'border-l-red-500', icon: <AlertCircle className="w-4 h-4 text-red-400" /> },
  }
  
  const config = prioridadeConfig[alerta.prioridade]
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const cardBg = isDark ? 'bg-[#1A1F35]' : 'bg-white'
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        p-3 rounded-xl border-l-4 ${config.bg} ${cardBg}
        ${isDark 
          ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]' 
          : 'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {config.icon}
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm ${textPrimary}`}>{alerta.titulo}</p>
            <p className={`text-xs mt-0.5 ${textSecondary}`}>{alerta.mensagem}</p>
            {alerta.acaoSugerida && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="mt-2 h-6 px-2 text-xs text-indigo-400 hover:text-indigo-300"
              >
                <Zap className="w-3 h-3 mr-1" />
                {alerta.acaoSugerida}
              </Button>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  )
}

function EventoCard({
  evento,
  isDark,
  compacto = false,
}: {
  evento: EventoAgenda
  isDark: boolean
  compacto?: boolean
}) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const cardBg = isDark ? 'bg-[#1A1F35]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'
  
  const horaInicio = new Date(evento.dataInicio).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  
  const horaFim = evento.dataFim 
    ? new Date(evento.dataFim).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  // Verificar se o evento está acontecendo agora
  const agora = new Date()
  const inicio = new Date(evento.dataInicio)
  const fim = evento.dataFim ? new Date(evento.dataFim) : null
  const emAndamento = agora >= inicio && (!fim || agora <= fim)
  
  if (compacto) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex items-center gap-3 p-2 rounded-lg
          ${cardBg} border ${borderColor}
          ${emAndamento ? 'border-l-4 border-l-indigo-500' : ''}
          hover:bg-white/5 transition-colors cursor-pointer
        `}
      >
        <div className="flex items-center gap-2 min-w-[60px]">
          <StatusIndicator status={emAndamento ? 'em_andamento' : evento.status} />
          <span className={`text-xs font-mono ${textSecondary}`}>{horaInicio}</span>
        </div>
        <EventoIcon tipo={evento.tipo} />
        <span className={`flex-1 text-sm truncate ${textPrimary}`}>{evento.titulo}</span>
        {evento.sincronizadoOutlook && (
          <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center">
            <Calendar className="w-2.5 h-2.5 text-blue-400" />
          </div>
        )}
      </motion.div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`
        p-4 rounded-xl cursor-pointer transition-all
        ${cardBg} border ${borderColor}
        ${emAndamento ? 'border-l-4 border-l-indigo-500' : ''}
        ${isDark 
          ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
          : 'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:shadow-lg'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <EventoIcon tipo={evento.tipo} />
          <span className={`font-medium ${textPrimary}`}>{evento.titulo}</span>
        </div>
        <div className="flex items-center gap-2">
          <PrioridadeBadge prioridade={evento.prioridade} />
          {evento.sincronizadoOutlook && (
            <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center" title="Sincronizado com Outlook">
              <Calendar className="w-3 h-3 text-blue-400" />
            </div>
          )}
        </div>
      </div>
      
      {/* Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 ${textSecondary}`} />
          <span className={`text-sm ${textSecondary}`}>
            {horaInicio}{horaFim ? ` - ${horaFim}` : ''}
          </span>
          {emAndamento && (
            <Badge className="bg-indigo-500/20 text-indigo-400 text-xs border-none animate-pulse">
              Em andamento
            </Badge>
          )}
        </div>
        
        {evento.local && (
          <div className="flex items-center gap-2">
            <MapPin className={`w-3.5 h-3.5 ${textSecondary}`} />
            <span className={`text-sm ${textSecondary} truncate`}>{evento.local}</span>
          </div>
        )}
        
        {evento.participantes && evento.participantes.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className={`w-3.5 h-3.5 ${textSecondary}`} />
            <span className={`text-sm ${textSecondary}`}>
              {evento.participantes.length} participante{evento.participantes.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      {/* Tags */}
      {evento.tags && evento.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {evento.tags.map((tag, idx) => (
            <Badge 
              key={idx} 
              className="bg-slate-500/20 text-slate-400 text-xs border-none"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ============ COMPONENTE PRINCIPAL ============

export function AgendaOutlook({
  compacto = false,
  mostrarAlertas = true,
  maxEventos = 5,
}: AgendaOutlookProps) {
  const { isDark } = useTheme()
  const { getActiveAlerts, getDailySummary } = useSecretaryAgent()
  
  const [eventos, setEventos] = useState<EventoAgenda[]>(eventosMock)
  const [alertas, setAlertas] = useState<AlertaSecretario[]>([])
  const [dataAtual, setDataAtual] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [showAlertas, setShowAlertas] = useState(true)
  const [resumoDiario, setResumoDiario] = useState<string>('')
  
  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  
  // Carregar alertas do agente
  useEffect(() => {
    async function loadAlerts() {
      try {
        const alerts = await getActiveAlerts(24)
        setAlertas(alerts)
      } catch (error) {
        console.error('Erro ao carregar alertas:', error)
      }
    }
    
    if (mostrarAlertas) {
      loadAlerts()
    }
  }, [mostrarAlertas])
  
  // Carregar resumo diário
  useEffect(() => {
    async function loadSummary() {
      try {
        const summary = await getDailySummary()
        setResumoDiario(summary.resumoTexto)
      } catch (error) {
        console.error('Erro ao carregar resumo:', error)
      }
    }
    
    loadSummary()
  }, [])
  
  // Filtrar eventos do dia
  const eventosDoDia = useMemo(() => {
    return eventos
      .filter(e => {
        const eventoData = new Date(e.dataInicio)
        return eventoData.toDateString() === dataAtual.toDateString()
      })
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
      .slice(0, maxEventos)
  }, [eventos, dataAtual, maxEventos])
  
  // Estatísticas
  const stats = useMemo(() => ({
    total: eventosDoDia.length,
    cirurgias: eventosDoDia.filter(e => e.tipo === 'cirurgia').length,
    reunioes: eventosDoDia.filter(e => e.tipo === 'reuniao').length,
    alertas: alertas.filter(a => !a.lido && !a.descartado).length,
  }), [eventosDoDia, alertas])
  
  // Navegação de data
  const navegarData = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(dataAtual)
    novaData.setDate(novaData.getDate() + (direcao === 'proximo' ? 1 : -1))
    setDataAtual(novaData)
  }
  
  // Sincronizar com Outlook
  const sincronizarOutlook = async () => {
    setIsLoading(true)
    // Simulação - em produção, usar Microsoft Graph API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }
  
  // Descartar alerta
  const descartarAlerta = (alertaId: string) => {
    setAlertas(prev => prev.filter(a => a.id !== alertaId))
  }
  
  const formatarData = (data: Date) => {
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    
    if (data.toDateString() === hoje.toDateString()) return 'Hoje'
    if (data.toDateString() === amanha.toDateString()) return 'Amanhã'
    
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <Card className={`${cardBg} overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg`}
            >
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className={`${textPrimary} flex items-center gap-2`}>
                Agenda
                <Badge className="bg-blue-500/20 text-blue-400 text-xs border-none">
                  Outlook
                </Badge>
              </CardTitle>
              <p className={`text-sm ${textSecondary}`}>
                {stats.total} eventos • {stats.cirurgias} cirurgias • {stats.reunioes} reuniões
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={sincronizarOutlook}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Navegação de Data */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navegarData('anterior')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <p className={`font-semibold ${textPrimary}`}>
              {formatarData(dataAtual)}
            </p>
            <p className={`text-xs ${textSecondary}`}>
              {dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navegarData('proximo')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Alertas do Secretário IA */}
        {mostrarAlertas && alertas.length > 0 && showAlertas && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  Secretário IA
                </span>
                <Badge className="bg-purple-500/20 text-purple-400 text-xs border-none">
                  {stats.alertas} alertas
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAlertas(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <AnimatePresence>
              {alertas.slice(0, 2).map((alerta) => (
                <AlertaCard
                  key={alerta.id}
                  alerta={alerta}
                  onDismiss={() => descartarAlerta(alerta.id)}
                  isDark={isDark}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Lista de Eventos */}
        <div className="space-y-2">
          {eventosDoDia.length > 0 ? (
            eventosDoDia.map((evento) => (
              <EventoCard
                key={evento.id}
                evento={evento}
                isDark={isDark}
                compacto={compacto}
              />
            ))
          ) : (
            <div className={`text-center py-8 ${textSecondary}`}>
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum evento para este dia</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agendar evento
              </Button>
            </div>
          )}
        </div>
        
        {/* Ver mais */}
        {eventosDoDia.length >= maxEventos && (
          <Button
            variant="ghost"
            className="w-full h-8 text-indigo-400 hover:text-indigo-300"
          >
            Ver agenda completa
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default AgendaOutlook

