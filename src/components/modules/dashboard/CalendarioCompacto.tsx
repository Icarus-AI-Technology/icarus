/**
 * ICARUS v5.0 - Calendário Compacto Interativo
 * 
 * Componente de calendário mini com visualização mensal,
 * indicadores de eventos e modal para agendamento rápido.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Stethoscope,
  Video,
  FileText,
  Bell,
  X,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { type EventoAgenda } from '@/lib/services/agenda-sync-service'

// ============ TIPOS ============

interface CalendarioCompactoProps {
  eventos?: EventoAgenda[]
  onDateClick?: (date: Date) => void
  onEventClick?: (evento: EventoAgenda) => void
  onNovoEvento?: (evento: Partial<EventoAgenda>) => void
}

interface DiaCalendario {
  data: Date
  diaDoMes: number
  mesAtual: boolean
  hoje: boolean
  eventos: EventoAgenda[]
}

// ============ DADOS MOCK ============

const eventosMock: EventoAgenda[] = [
  {
    id: '1',
    titulo: 'Cirurgia - Implante Marca-passo',
    tipo: 'cirurgia',
    moduloOrigem: 'cirurgias',
    dataInicio: new Date().toISOString(),
    prioridade: 'alta',
    status: 'confirmado',
    local: 'Hospital São Lucas',
  },
  {
    id: '2',
    titulo: 'Reunião Abbott',
    tipo: 'reuniao',
    moduloOrigem: 'crm',
    dataInicio: new Date().toISOString(),
    prioridade: 'media',
    status: 'confirmado',
  },
  {
    id: '3',
    titulo: 'Troca CDI',
    tipo: 'cirurgia',
    moduloOrigem: 'cirurgias',
    dataInicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    prioridade: 'alta',
    status: 'confirmado',
  },
  {
    id: '4',
    titulo: 'Auditoria ANVISA',
    tipo: 'auditoria',
    moduloOrigem: 'qualidade',
    dataInicio: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    prioridade: 'alta',
    status: 'pendente',
  },
  {
    id: '5',
    titulo: 'Treinamento Compliance',
    tipo: 'treinamento',
    moduloOrigem: 'rh',
    dataInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    prioridade: 'media',
    status: 'confirmado',
  },
]

// ============ UTILITÁRIOS ============

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function gerarDiasCalendario(ano: number, mes: number, eventos: EventoAgenda[]): DiaCalendario[] {
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)
  const diasNoMes = ultimoDia.getDate()
  const diaSemanaInicio = primeiroDia.getDay()
  
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dias: DiaCalendario[] = []
  
  // Dias do mês anterior
  const mesAnterior = new Date(ano, mes, 0)
  const diasMesAnterior = mesAnterior.getDate()
  for (let i = diaSemanaInicio - 1; i >= 0; i--) {
    const dia = diasMesAnterior - i
    const data = new Date(ano, mes - 1, dia)
    dias.push({
      data,
      diaDoMes: dia,
      mesAtual: false,
      hoje: false,
      eventos: eventos.filter(e => {
        const eventoData = new Date(e.dataInicio)
        return eventoData.toDateString() === data.toDateString()
      }),
    })
  }
  
  // Dias do mês atual
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const data = new Date(ano, mes, dia)
    dias.push({
      data,
      diaDoMes: dia,
      mesAtual: true,
      hoje: data.toDateString() === hoje.toDateString(),
      eventos: eventos.filter(e => {
        const eventoData = new Date(e.dataInicio)
        return eventoData.toDateString() === data.toDateString()
      }),
    })
  }
  
  // Dias do próximo mês (completar 6 semanas)
  const diasRestantes = 42 - dias.length
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const data = new Date(ano, mes + 1, dia)
    dias.push({
      data,
      diaDoMes: dia,
      mesAtual: false,
      hoje: false,
      eventos: eventos.filter(e => {
        const eventoData = new Date(e.dataInicio)
        return eventoData.toDateString() === data.toDateString()
      }),
    })
  }
  
  return dias
}

function getCorEvento(tipo: EventoAgenda['tipo']): string {
  const cores: Record<string, string> = {
    cirurgia: '#EF4444',
    reuniao: '#3B82F6',
    licitacao: '#8B5CF6',
    treinamento: '#10B981',
    auditoria: '#EC4899',
    manutencao: '#8b5cf6',
    vencimento: '#F97316',
    entrevista: '#14B8A6',
    consulta: '#6366F1',
    tarefa: '#64748B',
    lembrete: '#A855F7',
    outro: '#94A3B8',
  }
  return cores[tipo] || '#64748B'
}

function getIconeEvento(tipo: EventoAgenda['tipo']) {
  const icones: Record<string, React.ElementType> = {
    cirurgia: Stethoscope,
    reuniao: Video,
    licitacao: FileText,
    treinamento: Users,
    auditoria: FileText,
    manutencao: Clock,
    vencimento: Bell,
    entrevista: Users,
    consulta: Users,
    tarefa: FileText,
    lembrete: Bell,
    outro: Calendar,
  }
  return icones[tipo] || Calendar
}

// ============ COMPONENTE PRINCIPAL ============

export function CalendarioCompacto({
  eventos = eventosMock,
  onDateClick,
  onEventClick,
  onNovoEvento,
}: CalendarioCompactoProps) {
  const { isDark } = useTheme()
  
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)
  const [showNovoEvento, setShowNovoEvento] = useState(false)
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    tipo: 'reuniao' as EventoAgenda['tipo'],
    data: '',
    hora: '',
    local: '',
    descricao: '',
  })
  
  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-400'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const dayBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-50'
  const dayHoverBg = isDark ? 'hover:bg-[#252B44]' : 'hover:bg-slate-100'
  const todayBg = 'bg-gradient-to-br from-indigo-500 to-purple-600'
  
  // Gerar dias do calendário
  const diasCalendario = useMemo(() => {
    return gerarDiasCalendario(
      mesAtual.getFullYear(),
      mesAtual.getMonth(),
      eventos
    )
  }, [mesAtual, eventos])
  
  // Eventos do dia selecionado
  const eventosDiaSelecionado = useMemo(() => {
    if (!diaSelecionado) return []
    return eventos.filter(e => {
      const eventoData = new Date(e.dataInicio)
      return eventoData.toDateString() === diaSelecionado.toDateString()
    })
  }, [diaSelecionado, eventos])
  
  // Navegação
  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    setMesAtual(prev => {
      const novaData = new Date(prev)
      novaData.setMonth(novaData.getMonth() + (direcao === 'proximo' ? 1 : -1))
      return novaData
    })
  }
  
  const irParaHoje = () => {
    setMesAtual(new Date())
    setDiaSelecionado(new Date())
  }
  
  // Handlers
  const handleDiaClick = (dia: DiaCalendario) => {
    setDiaSelecionado(dia.data)
    onDateClick?.(dia.data)
  }
  
  const handleNovoEventoClick = () => {
    if (diaSelecionado) {
      setNovoEvento(prev => ({
        ...prev,
        data: diaSelecionado.toISOString().split('T')[0],
      }))
    }
    setShowNovoEvento(true)
  }
  
  const handleSalvarEvento = () => {
    const dataHora = new Date(`${novoEvento.data}T${novoEvento.hora || '09:00'}`)
    
    onNovoEvento?.({
      titulo: novoEvento.titulo,
      tipo: novoEvento.tipo,
      dataInicio: dataHora.toISOString(),
      local: novoEvento.local,
      descricao: novoEvento.descricao,
      moduloOrigem: 'manual',
      prioridade: 'media',
      status: 'pendente',
    })
    
    setShowNovoEvento(false)
    setNovoEvento({
      titulo: '',
      tipo: 'reuniao',
      data: '',
      hora: '',
      local: '',
      descricao: '',
    })
  }

  return (
    <>
      <Card className={`${cardBg} h-full`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg"
              >
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <CardTitle className={`text-base ${textPrimary}`}>Agenda</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={irParaHoje}
                className="h-7 px-2 text-xs"
              >
                Hoje
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleNovoEventoClick}
                className="h-7 w-7 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Navegação do Mês */}
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navegarMes('anterior')}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className={`text-sm font-semibold ${textPrimary}`}>
              {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </span>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navegarMes('proximo')}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-1">
            {DIAS_SEMANA.map(dia => (
              <div
                key={dia}
                className={`text-center text-xs font-medium py-1 ${textMuted}`}
              >
                {dia}
              </div>
            ))}
          </div>
          
          {/* Grade do Calendário */}
          <div className="grid grid-cols-7 gap-1">
            {diasCalendario.map((dia, idx) => {
              const isSelected = diaSelecionado?.toDateString() === dia.data.toDateString()
              const hasEvents = dia.eventos.length > 0
              
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDiaClick(dia)}
                  className={`
                    relative aspect-square rounded-lg flex flex-col items-center justify-center
                    text-xs font-medium transition-all
                    ${dia.hoje ? todayBg + ' text-white shadow-lg' : ''}
                    ${!dia.hoje && dia.mesAtual ? textPrimary : textMuted}
                    ${!dia.hoje && isSelected ? 'ring-2 ring-indigo-500 ' + dayBg : ''}
                    ${!dia.hoje && !isSelected ? dayHoverBg : ''}
                    ${!dia.mesAtual ? 'opacity-40' : ''}
                  `}
                >
                  <span>{dia.diaDoMes}</span>
                  
                  {/* Indicadores de eventos */}
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dia.eventos.slice(0, 3).map((evento, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: getCorEvento(evento.tipo) }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
          
          {/* Eventos do Dia Selecionado */}
          <AnimatePresence mode="wait">
            {diaSelecionado && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2 border-t border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${textSecondary}`}>
                    {diaSelecionado.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <Badge className="bg-indigo-500/20 text-indigo-400 text-xs border-none">
                    {eventosDiaSelecionado.length} eventos
                  </Badge>
                </div>
                
                {eventosDiaSelecionado.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {eventosDiaSelecionado.map(evento => {
                      const Icon = getIconeEvento(evento.tipo)
                      const cor = getCorEvento(evento.tipo)
                      
                      return (
                        <motion.button
                          key={evento.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => onEventClick?.(evento)}
                          className={`
                            w-full flex items-center gap-2 p-2 rounded-lg text-left
                            ${dayBg} ${dayHoverBg} transition-colors
                          `}
                        >
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${cor}20` }}
                          >
                            <Icon className="w-3 h-3" style={{ color: cor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${textPrimary}`}>
                              {evento.titulo}
                            </p>
                            {evento.local && (
                              <p className={`text-xs truncate ${textMuted}`}>
                                {evento.local}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                ) : (
                  <div className={`text-center py-3 ${textMuted}`}>
                    <p className="text-xs">Nenhum evento</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleNovoEventoClick}
                      className="mt-1 h-6 text-xs text-indigo-400"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agendar
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* Modal Novo Evento */}
      <Dialog open={showNovoEvento} onOpenChange={setShowNovoEvento}>
        <DialogContent className={`${cardBg} max-w-md`}>
          <DialogHeader>
            <DialogTitle className={textPrimary}>Novo Agendamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={textSecondary}>Título</Label>
              <Input
                value={novoEvento.titulo}
                onChange={(e) => setNovoEvento(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Reunião com cliente"
              />
            </div>
            
            <div className="space-y-2">
              <Label className={textSecondary}>Tipo</Label>
              <Select
                value={novoEvento.tipo}
                onValueChange={(value) => setNovoEvento(prev => ({ ...prev, tipo: value as EventoAgenda['tipo'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reuniao">📹 Reunião</SelectItem>
                  <SelectItem value="cirurgia">🏥 Cirurgia</SelectItem>
                  <SelectItem value="treinamento">📚 Treinamento</SelectItem>
                  <SelectItem value="auditoria">📋 Auditoria</SelectItem>
                  <SelectItem value="licitacao">📄 Licitação</SelectItem>
                  <SelectItem value="tarefa">✅ Tarefa</SelectItem>
                  <SelectItem value="lembrete">🔔 Lembrete</SelectItem>
                  <SelectItem value="outro">📌 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={textSecondary}>Data</Label>
                <Input
                  type="date"
                  value={novoEvento.data}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, data: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className={textSecondary}>Hora</Label>
                <Input
                  type="time"
                  value={novoEvento.hora}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, hora: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className={textSecondary}>Local</Label>
              <Input
                value={novoEvento.local}
                onChange={(e) => setNovoEvento(prev => ({ ...prev, local: e.target.value }))}
                placeholder="Ex: Hospital São Lucas"
              />
            </div>
            
            <div className="space-y-2">
              <Label className={textSecondary}>Descrição</Label>
              <Textarea
                value={novoEvento.descricao}
                onChange={(e) => setNovoEvento(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Detalhes do agendamento..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowNovoEvento(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarEvento}
              disabled={!novoEvento.titulo || !novoEvento.data}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CalendarioCompacto

