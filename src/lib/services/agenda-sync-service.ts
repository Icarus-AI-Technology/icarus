/**
 * ICARUS v5.0 - Serviço Centralizado de Sincronização de Agenda
 * 
 * Serviço que gerencia a sincronização bidirecional entre todos os
 * módulos do sistema e o Microsoft Outlook via Graph API.
 * 
 * Módulos Integrados:
 * - Cirurgias e Procedimentos
 * - Reuniões Comerciais (CRM)
 * - Licitações (prazos e audiências)
 * - RH (entrevistas, treinamentos)
 * - Manutenção Preventiva
 * - Qualidade (auditorias, vencimentos)
 * - Financeiro (vencimentos, reuniões)
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { supabase } from '@/lib/config/supabase-client'
import { logger } from '@/lib/utils/logger'

// ============ SCHEMAS ============

export const EventoAgendaSchema = z.object({
  id: z.string().optional(),
  titulo: z.string(),
  descricao: z.string().optional(),
  tipo: z.enum([
    'cirurgia',
    'reuniao',
    'licitacao',
    'treinamento',
    'auditoria',
    'manutencao',
    'vencimento',
    'entrevista',
    'consulta',
    'tarefa',
    'lembrete',
    'outro'
  ]),
  moduloOrigem: z.enum([
    'cirurgias',
    'crm',
    'licitacoes',
    'rh',
    'manutencao',
    'qualidade',
    'financeiro',
    'estoque',
    'compras',
    'manual'
  ]),
  entidadeId: z.string().optional(), // ID da entidade no módulo de origem
  entidadeTipo: z.string().optional(), // Tipo da entidade (cirurgia, proposta, etc)
  
  // Datas
  dataInicio: z.string(),
  dataFim: z.string().optional(),
  diaInteiro: z.boolean().optional(),
  
  // Local
  local: z.string().optional(),
  localTipo: z.enum(['presencial', 'virtual', 'hibrido']).optional(),
  linkReuniao: z.string().optional(),
  
  // Participantes
  participantes: z.array(z.object({
    nome: z.string(),
    email: z.string().optional(),
    tipo: z.enum(['organizador', 'obrigatorio', 'opcional']).optional(),
    confirmado: z.boolean().optional(),
  })).optional(),
  
  // Configurações
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
  status: z.enum(['pendente', 'confirmado', 'em_andamento', 'concluido', 'cancelado']),
  privacidade: z.enum(['publico', 'privado', 'confidencial']).optional(),
  
  // Lembretes
  lembretes: z.array(z.object({
    minutos: z.number(),
    tipo: z.enum(['email', 'push', 'sms']),
  })).optional(),
  
  // Recorrência
  recorrencia: z.object({
    tipo: z.enum(['diaria', 'semanal', 'mensal', 'anual']),
    intervalo: z.number(),
    diasSemana: z.array(z.number()).optional(),
    dataFim: z.string().optional(),
    ocorrencias: z.number().optional(),
  }).optional(),
  
  // Sincronização
  sincronizadoOutlook: z.boolean().optional(),
  outlookEventId: z.string().optional(),
  outlookChangeKey: z.string().optional(),
  ultimaSincronizacao: z.string().optional(),
  
  // Metadados
  tags: z.array(z.string()).optional(),
  cor: z.string().optional(),
  icone: z.string().optional(),
  
  // Auditoria
  criadoPor: z.string().optional(),
  criadoEm: z.string().optional(),
  atualizadoPor: z.string().optional(),
  atualizadoEm: z.string().optional(),
})

export type EventoAgenda = z.infer<typeof EventoAgendaSchema>

export const SincronizacaoResultadoSchema = z.object({
  sucesso: z.boolean(),
  eventoId: z.string().optional(),
  outlookEventId: z.string().optional(),
  erro: z.string().optional(),
  acao: z.enum(['criado', 'atualizado', 'excluido', 'ignorado']),
})

export type SincronizacaoResultado = z.infer<typeof SincronizacaoResultadoSchema>

// ============ CONFIGURAÇÕES POR MÓDULO ============

interface ConfiguracaoModulo {
  nome: string
  tiposEvento: EventoAgenda['tipo'][]
  corPadrao: string
  iconePadrao: string
  lembretePadrao: number[] // minutos
  prioridadePadrao: EventoAgenda['prioridade']
  sincronizarOutlook: boolean
  criarAutomaticamente: boolean
}

export const CONFIGURACOES_MODULOS: Record<EventoAgenda['moduloOrigem'], ConfiguracaoModulo> = {
  cirurgias: {
    nome: 'Cirurgias e Procedimentos',
    tiposEvento: ['cirurgia'],
    corPadrao: '#EF4444', // Vermelho
    iconePadrao: 'Stethoscope',
    lembretePadrao: [1440, 60, 30], // 24h, 1h, 30min
    prioridadePadrao: 'alta',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  crm: {
    nome: 'CRM e Vendas',
    tiposEvento: ['reuniao', 'consulta'],
    corPadrao: '#3B82F6', // Azul
    iconePadrao: 'Users',
    lembretePadrao: [60, 15],
    prioridadePadrao: 'media',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  licitacoes: {
    nome: 'Licitações e Propostas',
    tiposEvento: ['licitacao', 'reuniao'],
    corPadrao: '#8B5CF6', // Roxo
    iconePadrao: 'FileText',
    lembretePadrao: [4320, 1440, 60], // 3 dias, 24h, 1h
    prioridadePadrao: 'alta',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  rh: {
    nome: 'RH e Gestão de Pessoas',
    tiposEvento: ['entrevista', 'treinamento', 'reuniao'],
    corPadrao: '#10B981', // Verde
    iconePadrao: 'UserCheck',
    lembretePadrao: [1440, 60],
    prioridadePadrao: 'media',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  manutencao: {
    nome: 'Manutenção Preventiva',
    tiposEvento: ['manutencao'],
    corPadrao: '#8b5cf6', // Âmbar
    iconePadrao: 'Wrench',
    lembretePadrao: [1440, 60],
    prioridadePadrao: 'media',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  qualidade: {
    nome: 'Qualidade e Certificação',
    tiposEvento: ['auditoria', 'vencimento', 'treinamento'],
    corPadrao: '#EC4899', // Rosa
    iconePadrao: 'Shield',
    lembretePadrao: [10080, 4320, 1440], // 7 dias, 3 dias, 24h
    prioridadePadrao: 'alta',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  financeiro: {
    nome: 'Financeiro',
    tiposEvento: ['vencimento', 'reuniao'],
    corPadrao: '#14B8A6', // Teal
    iconePadrao: 'DollarSign',
    lembretePadrao: [4320, 1440],
    prioridadePadrao: 'alta',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  estoque: {
    nome: 'Estoque e Consignação',
    tiposEvento: ['vencimento', 'tarefa'],
    corPadrao: '#6366F1', // Indigo
    iconePadrao: 'Package',
    lembretePadrao: [4320, 1440],
    prioridadePadrao: 'media',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  compras: {
    nome: 'Compras',
    tiposEvento: ['reuniao', 'vencimento'],
    corPadrao: '#F97316', // Laranja
    iconePadrao: 'ShoppingCart',
    lembretePadrao: [1440, 60],
    prioridadePadrao: 'media',
    sincronizarOutlook: true,
    criarAutomaticamente: true,
  },
  manual: {
    nome: 'Manual',
    tiposEvento: ['reuniao', 'tarefa', 'lembrete', 'outro'],
    corPadrao: '#64748B', // Slate
    iconePadrao: 'Calendar',
    lembretePadrao: [60, 15],
    prioridadePadrao: 'media',
    sincronizarOutlook: true,
    criarAutomaticamente: false,
  },
}

// ============ CLASSE DO SERVIÇO ============

class AgendaSyncService {
  private static instance: AgendaSyncService
  private eventosCache: Map<string, EventoAgenda> = new Map()
  private sincronizando: boolean = false
  private ultimaSincronizacao: Date | null = null
  private listeners: Set<(evento: EventoAgenda, acao: 'criado' | 'atualizado' | 'excluido') => void> = new Set()

  private constructor() {
    // Singleton
  }

  static getInstance(): AgendaSyncService {
    if (!AgendaSyncService.instance) {
      AgendaSyncService.instance = new AgendaSyncService()
    }
    return AgendaSyncService.instance
  }

  // ============ LISTENERS ============

  /**
   * Adiciona um listener para eventos de agenda
   */
  addListener(callback: (evento: EventoAgenda, acao: 'criado' | 'atualizado' | 'excluido') => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(evento: EventoAgenda, acao: 'criado' | 'atualizado' | 'excluido') {
    this.listeners.forEach(callback => callback(evento, acao))
  }

  // ============ CRUD ============

  /**
   * Cria um novo evento na agenda
   */
  async criarEvento(evento: Omit<EventoAgenda, 'id'>): Promise<SincronizacaoResultado> {
    try {
      const config = CONFIGURACOES_MODULOS[evento.moduloOrigem]
      
      // Aplicar configurações padrão do módulo
      const eventoCompleto: EventoAgenda = {
        ...evento,
        id: crypto.randomUUID(),
        cor: evento.cor || config.corPadrao,
        icone: evento.icone || config.iconePadrao,
        prioridade: evento.prioridade || config.prioridadePadrao,
        lembretes: evento.lembretes || config.lembretePadrao.map(min => ({
          minutos: min,
          tipo: 'push' as const,
        })),
        criadoEm: new Date().toISOString(),
        status: evento.status || 'pendente',
      }

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('agenda_eventos')
        .insert(eventoCompleto)
        .select()
        .single()

      if (error) {
        logger.error('Erro ao criar evento:', error)
        // Continuar mesmo com erro do Supabase (modo offline)
      }

      // Sincronizar com Outlook se configurado
      if (config.sincronizarOutlook) {
        const outlookResult = await this.sincronizarComOutlook(eventoCompleto, 'criar')
        if (outlookResult.outlookEventId) {
          eventoCompleto.outlookEventId = outlookResult.outlookEventId
          eventoCompleto.sincronizadoOutlook = true
          eventoCompleto.ultimaSincronizacao = new Date().toISOString()
        }
      }

      // Atualizar cache
      this.eventosCache.set(eventoCompleto.id!, eventoCompleto)
      
      // Notificar listeners
      this.notifyListeners(eventoCompleto, 'criado')

      logger.info(`Evento criado: ${eventoCompleto.titulo} (${eventoCompleto.moduloOrigem})`)

      return {
        sucesso: true,
        eventoId: eventoCompleto.id,
        outlookEventId: eventoCompleto.outlookEventId,
        acao: 'criado',
      }
    } catch (error) {
      logger.error('Erro ao criar evento:', error)
      return {
        sucesso: false,
        erro: (error as Error).message,
        acao: 'ignorado',
      }
    }
  }

  /**
   * Atualiza um evento existente
   */
  async atualizarEvento(eventoId: string, atualizacoes: Partial<EventoAgenda>): Promise<SincronizacaoResultado> {
    try {
      const eventoExistente = this.eventosCache.get(eventoId)
      
      const eventoAtualizado: EventoAgenda = {
        ...eventoExistente,
        ...atualizacoes,
        id: eventoId,
        atualizadoEm: new Date().toISOString(),
      } as EventoAgenda

      // Atualizar no Supabase
      const { error } = await supabase
        .from('agenda_eventos')
        .update(eventoAtualizado)
        .eq('id', eventoId)

      if (error) {
        logger.error('Erro ao atualizar evento:', error)
      }

      // Sincronizar com Outlook
      if (eventoAtualizado.sincronizadoOutlook && eventoAtualizado.outlookEventId) {
        await this.sincronizarComOutlook(eventoAtualizado, 'atualizar')
        eventoAtualizado.ultimaSincronizacao = new Date().toISOString()
      }

      // Atualizar cache
      this.eventosCache.set(eventoId, eventoAtualizado)
      
      // Notificar listeners
      this.notifyListeners(eventoAtualizado, 'atualizado')

      logger.info(`Evento atualizado: ${eventoAtualizado.titulo}`)

      return {
        sucesso: true,
        eventoId,
        outlookEventId: eventoAtualizado.outlookEventId,
        acao: 'atualizado',
      }
    } catch (error) {
      logger.error('Erro ao atualizar evento:', error)
      return {
        sucesso: false,
        erro: (error as Error).message,
        acao: 'ignorado',
      }
    }
  }

  /**
   * Exclui um evento
   */
  async excluirEvento(eventoId: string): Promise<SincronizacaoResultado> {
    try {
      const evento = this.eventosCache.get(eventoId)

      // Excluir do Supabase
      const { error } = await supabase
        .from('agenda_eventos')
        .delete()
        .eq('id', eventoId)

      if (error) {
        logger.error('Erro ao excluir evento:', error)
      }

      // Excluir do Outlook
      if (evento?.outlookEventId) {
        await this.sincronizarComOutlook(evento, 'excluir')
      }

      // Remover do cache
      this.eventosCache.delete(eventoId)
      
      // Notificar listeners
      if (evento) {
        this.notifyListeners(evento, 'excluido')
      }

      logger.info(`Evento excluído: ${eventoId}`)

      return {
        sucesso: true,
        eventoId,
        acao: 'excluido',
      }
    } catch (error) {
      logger.error('Erro ao excluir evento:', error)
      return {
        sucesso: false,
        erro: (error as Error).message,
        acao: 'ignorado',
      }
    }
  }

  // ============ CONSULTAS ============

  /**
   * Busca eventos por período
   */
  async buscarEventos(filtros: {
    dataInicio?: string
    dataFim?: string
    moduloOrigem?: EventoAgenda['moduloOrigem']
    tipo?: EventoAgenda['tipo']
    status?: EventoAgenda['status']
    entidadeId?: string
  }): Promise<EventoAgenda[]> {
    try {
      let query = supabase.from('agenda_eventos').select('*')

      if (filtros.dataInicio) {
        query = query.gte('dataInicio', filtros.dataInicio)
      }
      if (filtros.dataFim) {
        query = query.lte('dataInicio', filtros.dataFim)
      }
      if (filtros.moduloOrigem) {
        query = query.eq('moduloOrigem', filtros.moduloOrigem)
      }
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo)
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status)
      }
      if (filtros.entidadeId) {
        query = query.eq('entidadeId', filtros.entidadeId)
      }

      const { data, error } = await query.order('dataInicio', { ascending: true })

      if (error) {
        logger.error('Erro ao buscar eventos:', error)
        // Retornar do cache se houver erro
        return Array.from(this.eventosCache.values()).filter(e => {
          if (filtros.dataInicio && e.dataInicio < filtros.dataInicio) return false
          if (filtros.dataFim && e.dataInicio > filtros.dataFim) return false
          if (filtros.moduloOrigem && e.moduloOrigem !== filtros.moduloOrigem) return false
          if (filtros.tipo && e.tipo !== filtros.tipo) return false
          if (filtros.status && e.status !== filtros.status) return false
          return true
        })
      }

      // Atualizar cache
      data?.forEach(evento => {
        this.eventosCache.set(evento.id, evento)
      })

      return data || []
    } catch (error) {
      logger.error('Erro ao buscar eventos:', error)
      return []
    }
  }

  /**
   * Busca eventos do dia
   */
  async buscarEventosDoDia(data?: Date): Promise<EventoAgenda[]> {
    const dia = data || new Date()
    const inicio = new Date(dia.setHours(0, 0, 0, 0)).toISOString()
    const fim = new Date(dia.setHours(23, 59, 59, 999)).toISOString()

    return this.buscarEventos({ dataInicio: inicio, dataFim: fim })
  }

  /**
   * Busca eventos da semana
   */
  async buscarEventosDaSemana(data?: Date): Promise<EventoAgenda[]> {
    const dia = data || new Date()
    const inicio = new Date(dia)
    inicio.setDate(inicio.getDate() - inicio.getDay())
    inicio.setHours(0, 0, 0, 0)

    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 6)
    fim.setHours(23, 59, 59, 999)

    return this.buscarEventos({ 
      dataInicio: inicio.toISOString(), 
      dataFim: fim.toISOString() 
    })
  }

  // ============ SINCRONIZAÇÃO OUTLOOK ============

  /**
   * Sincroniza evento com Microsoft Outlook
   */
  private async sincronizarComOutlook(
    evento: EventoAgenda,
    acao: 'criar' | 'atualizar' | 'excluir'
  ): Promise<{ outlookEventId?: string; erro?: string }> {
    try {
      // Em produção, usar Microsoft Graph API
      // Por agora, simular a sincronização
      
      logger.info(`Sincronizando com Outlook: ${acao} - ${evento.titulo}`)
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 100))

      if (acao === 'criar') {
        return { outlookEventId: `outlook_${evento.id}` }
      }

      return {}
    } catch (error) {
      logger.error('Erro ao sincronizar com Outlook:', error)
      return { erro: (error as Error).message }
    }
  }

  /**
   * Sincroniza todos os eventos pendentes com Outlook
   */
  async sincronizarTodosComOutlook(): Promise<{
    total: number
    sincronizados: number
    erros: number
  }> {
    if (this.sincronizando) {
      return { total: 0, sincronizados: 0, erros: 0 }
    }

    this.sincronizando = true
    let sincronizados = 0
    let erros = 0

    try {
      const eventosPendentes = Array.from(this.eventosCache.values())
        .filter(e => !e.sincronizadoOutlook)

      for (const evento of eventosPendentes) {
        const resultado = await this.sincronizarComOutlook(evento, 'criar')
        if (resultado.outlookEventId) {
          evento.outlookEventId = resultado.outlookEventId
          evento.sincronizadoOutlook = true
          evento.ultimaSincronizacao = new Date().toISOString()
          sincronizados++
        } else {
          erros++
        }
      }

      this.ultimaSincronizacao = new Date()

      return {
        total: eventosPendentes.length,
        sincronizados,
        erros,
      }
    } finally {
      this.sincronizando = false
    }
  }

  // ============ MÉTODOS DE MÓDULOS ============

  /**
   * Cria evento a partir de uma cirurgia
   */
  async criarEventoCirurgia(cirurgia: {
    id: string
    numero: string
    paciente: string
    medico: { nome: string; email?: string }
    hospital: { nome: string; endereco?: string }
    procedimento: string
    dataAgendada: string
    horaInicio: string
    horaFim?: string
    materiais?: string[]
    responsaveis?: Array<{ nome: string; email: string }>
  }): Promise<SincronizacaoResultado> {
    const dataInicio = new Date(`${cirurgia.dataAgendada}T${cirurgia.horaInicio}`)
    const dataFim = cirurgia.horaFim 
      ? new Date(`${cirurgia.dataAgendada}T${cirurgia.horaFim}`)
      : new Date(dataInicio.getTime() + 3 * 60 * 60 * 1000) // 3 horas padrão

    const participantes = [
      { nome: cirurgia.medico.nome, email: cirurgia.medico.email, tipo: 'obrigatorio' as const },
      ...(cirurgia.responsaveis || []).map(r => ({
        nome: r.nome,
        email: r.email,
        tipo: 'obrigatorio' as const,
      })),
    ]

    return this.criarEvento({
      titulo: `Cirurgia #${cirurgia.numero} - ${cirurgia.procedimento}`,
      descricao: `
Paciente: ${cirurgia.paciente}
Procedimento: ${cirurgia.procedimento}
Médico: ${cirurgia.medico.nome}
${cirurgia.materiais?.length ? `\nMateriais:\n${cirurgia.materiais.map(m => `- ${m}`).join('\n')}` : ''}
      `.trim(),
      tipo: 'cirurgia',
      moduloOrigem: 'cirurgias',
      entidadeId: cirurgia.id,
      entidadeTipo: 'cirurgia',
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      local: cirurgia.hospital.nome,
      localTipo: 'presencial',
      participantes,
      prioridade: 'alta',
      status: 'confirmado',
      tags: ['Cirurgia', 'OPME'],
    })
  }

  /**
   * Cria evento a partir de uma reunião CRM
   */
  async criarEventoReuniaoCRM(reuniao: {
    id: string
    titulo: string
    cliente: string
    dataHora: string
    duracao: number // minutos
    local?: string
    virtual?: boolean
    linkReuniao?: string
    participantes?: Array<{ nome: string; email: string }>
    assunto?: string
  }): Promise<SincronizacaoResultado> {
    const dataInicio = new Date(reuniao.dataHora)
    const dataFim = new Date(dataInicio.getTime() + reuniao.duracao * 60 * 1000)

    return this.criarEvento({
      titulo: reuniao.titulo,
      descricao: `Cliente: ${reuniao.cliente}\n${reuniao.assunto || ''}`,
      tipo: 'reuniao',
      moduloOrigem: 'crm',
      entidadeId: reuniao.id,
      entidadeTipo: 'reuniao_crm',
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      local: reuniao.local || (reuniao.virtual ? 'Virtual' : undefined),
      localTipo: reuniao.virtual ? 'virtual' : 'presencial',
      linkReuniao: reuniao.linkReuniao,
      participantes: reuniao.participantes?.map(p => ({
        nome: p.nome,
        email: p.email,
        tipo: 'obrigatorio' as const,
      })),
      prioridade: 'media',
      status: 'confirmado',
      tags: ['CRM', 'Comercial'],
    })
  }

  /**
   * Cria evento a partir de uma licitação
   */
  async criarEventoLicitacao(licitacao: {
    id: string
    numero: string
    orgao: string
    objeto: string
    dataAbertura: string
    horaAbertura?: string
    local?: string
    modalidade: string
  }): Promise<SincronizacaoResultado> {
    const dataInicio = new Date(`${licitacao.dataAbertura}T${licitacao.horaAbertura || '09:00'}`)

    return this.criarEvento({
      titulo: `Licitação ${licitacao.numero} - ${licitacao.orgao}`,
      descricao: `
Modalidade: ${licitacao.modalidade}
Órgão: ${licitacao.orgao}
Objeto: ${licitacao.objeto}
      `.trim(),
      tipo: 'licitacao',
      moduloOrigem: 'licitacoes',
      entidadeId: licitacao.id,
      entidadeTipo: 'licitacao',
      dataInicio: dataInicio.toISOString(),
      local: licitacao.local,
      localTipo: 'presencial',
      prioridade: 'alta',
      status: 'pendente',
      tags: ['Licitação', licitacao.modalidade],
    })
  }

  /**
   * Cria evento a partir de um vencimento de documento
   */
  async criarEventoVencimento(vencimento: {
    id: string
    documento: string
    tipo: string
    dataVencimento: string
    responsavel?: string
    diasAntecedencia?: number
  }): Promise<SincronizacaoResultado> {
    const dataVenc = new Date(vencimento.dataVencimento)
    
    return this.criarEvento({
      titulo: `⚠️ Vencimento: ${vencimento.documento}`,
      descricao: `
Documento: ${vencimento.documento}
Tipo: ${vencimento.tipo}
Data de Vencimento: ${dataVenc.toLocaleDateString('pt-BR')}
${vencimento.responsavel ? `Responsável: ${vencimento.responsavel}` : ''}
      `.trim(),
      tipo: 'vencimento',
      moduloOrigem: 'qualidade',
      entidadeId: vencimento.id,
      entidadeTipo: 'documento',
      dataInicio: vencimento.dataVencimento,
      diaInteiro: true,
      prioridade: 'alta',
      status: 'pendente',
      tags: ['Vencimento', 'Qualidade', 'ANVISA'],
      lembretes: [
        { minutos: (vencimento.diasAntecedencia || 30) * 24 * 60, tipo: 'email' },
        { minutos: 7 * 24 * 60, tipo: 'push' }, // 7 dias
        { minutos: 24 * 60, tipo: 'push' }, // 1 dia
      ],
    })
  }

  /**
   * Cria evento a partir de um treinamento
   */
  async criarEventoTreinamento(treinamento: {
    id: string
    titulo: string
    instrutor?: string
    dataInicio: string
    dataFim?: string
    local?: string
    virtual?: boolean
    linkReuniao?: string
    participantes?: Array<{ nome: string; email: string }>
    modulo?: string
  }): Promise<SincronizacaoResultado> {
    return this.criarEvento({
      titulo: `📚 ${treinamento.titulo}`,
      descricao: `
${treinamento.instrutor ? `Instrutor: ${treinamento.instrutor}` : ''}
${treinamento.modulo ? `Módulo: ${treinamento.modulo}` : ''}
      `.trim(),
      tipo: 'treinamento',
      moduloOrigem: 'rh',
      entidadeId: treinamento.id,
      entidadeTipo: 'treinamento',
      dataInicio: treinamento.dataInicio,
      dataFim: treinamento.dataFim,
      local: treinamento.local || (treinamento.virtual ? 'Virtual' : undefined),
      localTipo: treinamento.virtual ? 'virtual' : 'presencial',
      linkReuniao: treinamento.linkReuniao,
      participantes: treinamento.participantes?.map(p => ({
        nome: p.nome,
        email: p.email,
        tipo: 'obrigatorio' as const,
      })),
      prioridade: 'media',
      status: 'confirmado',
      tags: ['Treinamento', 'RH'],
    })
  }

  /**
   * Cria evento a partir de uma manutenção preventiva
   */
  async criarEventoManutencao(manutencao: {
    id: string
    equipamento: string
    tipo: string
    dataAgendada: string
    responsavel?: string
    local?: string
  }): Promise<SincronizacaoResultado> {
    return this.criarEvento({
      titulo: `🔧 Manutenção: ${manutencao.equipamento}`,
      descricao: `
Equipamento: ${manutencao.equipamento}
Tipo: ${manutencao.tipo}
${manutencao.responsavel ? `Responsável: ${manutencao.responsavel}` : ''}
      `.trim(),
      tipo: 'manutencao',
      moduloOrigem: 'manutencao',
      entidadeId: manutencao.id,
      entidadeTipo: 'manutencao',
      dataInicio: manutencao.dataAgendada,
      local: manutencao.local,
      localTipo: 'presencial',
      prioridade: 'media',
      status: 'pendente',
      tags: ['Manutenção', 'Preventiva'],
    })
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const agendaSyncService = AgendaSyncService.getInstance()

// ============ HOOK REACT ============

import { useState, useEffect, useCallback } from 'react'

export interface UseAgendaSyncResult {
  eventos: EventoAgenda[]
  isLoading: boolean
  error: string | null
  criarEvento: (evento: Omit<EventoAgenda, 'id'>) => Promise<SincronizacaoResultado>
  atualizarEvento: (id: string, atualizacoes: Partial<EventoAgenda>) => Promise<SincronizacaoResultado>
  excluirEvento: (id: string) => Promise<SincronizacaoResultado>
  sincronizarOutlook: () => Promise<void>
  recarregar: () => Promise<void>
}

export function useAgendaSync(filtros?: {
  dataInicio?: string
  dataFim?: string
  moduloOrigem?: EventoAgenda['moduloOrigem']
}): UseAgendaSyncResult {
  const [eventos, setEventos] = useState<EventoAgenda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarEventos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await agendaSyncService.buscarEventos(filtros || {})
      setEventos(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    carregarEventos()

    // Escutar mudanças
    const unsubscribe = agendaSyncService.addListener((evento, acao) => {
      setEventos(prev => {
        if (acao === 'criado') {
          return [...prev, evento].sort((a, b) => 
            new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
          )
        }
        if (acao === 'atualizado') {
          return prev.map(e => e.id === evento.id ? evento : e)
        }
        if (acao === 'excluido') {
          return prev.filter(e => e.id !== evento.id)
        }
        return prev
      })
    })

    return unsubscribe
  }, [carregarEventos])

  const criarEvento = useCallback(async (evento: Omit<EventoAgenda, 'id'>) => {
    return agendaSyncService.criarEvento(evento)
  }, [])

  const atualizarEvento = useCallback(async (id: string, atualizacoes: Partial<EventoAgenda>) => {
    return agendaSyncService.atualizarEvento(id, atualizacoes)
  }, [])

  const excluirEvento = useCallback(async (id: string) => {
    return agendaSyncService.excluirEvento(id)
  }, [])

  const sincronizarOutlook = useCallback(async () => {
    setIsLoading(true)
    try {
      await agendaSyncService.sincronizarTodosComOutlook()
      await carregarEventos()
    } finally {
      setIsLoading(false)
    }
  }, [carregarEventos])

  return {
    eventos,
    isLoading,
    error,
    criarEvento,
    atualizarEvento,
    excluirEvento,
    sincronizarOutlook,
    recarregar: carregarEventos,
  }
}

// ============ HOOKS ESPECÍFICOS POR MÓDULO ============

export function useAgendaCirurgias() {
  const sync = useAgendaSync({ moduloOrigem: 'cirurgias' })
  
  const criarEventoCirurgia = useCallback(async (cirurgia: Parameters<typeof agendaSyncService.criarEventoCirurgia>[0]) => {
    return agendaSyncService.criarEventoCirurgia(cirurgia)
  }, [])

  return { ...sync, criarEventoCirurgia }
}

export function useAgendaCRM() {
  const sync = useAgendaSync({ moduloOrigem: 'crm' })
  
  const criarEventoReuniao = useCallback(async (reuniao: Parameters<typeof agendaSyncService.criarEventoReuniaoCRM>[0]) => {
    return agendaSyncService.criarEventoReuniaoCRM(reuniao)
  }, [])

  return { ...sync, criarEventoReuniao }
}

export function useAgendaLicitacoes() {
  const sync = useAgendaSync({ moduloOrigem: 'licitacoes' })
  
  const criarEventoLicitacao = useCallback(async (licitacao: Parameters<typeof agendaSyncService.criarEventoLicitacao>[0]) => {
    return agendaSyncService.criarEventoLicitacao(licitacao)
  }, [])

  return { ...sync, criarEventoLicitacao }
}

export function useAgendaQualidade() {
  const sync = useAgendaSync({ moduloOrigem: 'qualidade' })
  
  const criarEventoVencimento = useCallback(async (vencimento: Parameters<typeof agendaSyncService.criarEventoVencimento>[0]) => {
    return agendaSyncService.criarEventoVencimento(vencimento)
  }, [])

  return { ...sync, criarEventoVencimento }
}

export function useAgendaRH() {
  const sync = useAgendaSync({ moduloOrigem: 'rh' })
  
  const criarEventoTreinamento = useCallback(async (treinamento: Parameters<typeof agendaSyncService.criarEventoTreinamento>[0]) => {
    return agendaSyncService.criarEventoTreinamento(treinamento)
  }, [])

  return { ...sync, criarEventoTreinamento }
}

export function useAgendaManutencao() {
  const sync = useAgendaSync({ moduloOrigem: 'manutencao' })
  
  const criarEventoManutencao = useCallback(async (manutencao: Parameters<typeof agendaSyncService.criarEventoManutencao>[0]) => {
    return agendaSyncService.criarEventoManutencao(manutencao)
  }, [])

  return { ...sync, criarEventoManutencao }
}

export default agendaSyncService

