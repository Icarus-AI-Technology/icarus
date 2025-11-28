/**
 * ICARUS v5.0 - Secretary AI Agent
 * 
 * Agente IA Secretário para gerenciamento inteligente de agenda,
 * alertas proativos e assistência executiva.
 * 
 * Funcionalidades:
 * - Análise de agenda e priorização
 * - Alertas inteligentes de eventos
 * - Sugestões de otimização de tempo
 * - Lembretes contextuais
 * - Preparação de reuniões
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { BaseAgent, type AgentTool } from './base-agent'
import { type AgentConfig } from './types'

// ============ SCHEMAS ============

const EventoAgendaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  tipo: z.enum(['cirurgia', 'reuniao', 'consulta', 'tarefa', 'lembrete', 'outro']),
  dataInicio: z.string(),
  dataFim: z.string().optional(),
  local: z.string().optional(),
  participantes: z.array(z.object({
    nome: z.string(),
    email: z.string().optional(),
    confirmado: z.boolean().optional(),
  })).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
  status: z.enum(['pendente', 'confirmado', 'em_andamento', 'concluido', 'cancelado']),
  descricao: z.string().optional(),
  lembretes: z.array(z.number()).optional(), // minutos antes
  tags: z.array(z.string()).optional(),
  sincronizadoOutlook: z.boolean().optional(),
  outlookEventId: z.string().optional(),
})

const AlertaSecretarioSchema = z.object({
  id: z.string(),
  tipo: z.enum([
    'evento_proximo',
    'conflito_agenda',
    'preparacao_reuniao',
    'follow_up',
    'prazo_vencendo',
    'cirurgia_hoje',
    'material_pendente',
    'autorizacao_pendente',
    'aniversario',
    'meta_atingida',
  ]),
  prioridade: z.enum(['info', 'atencao', 'urgente', 'critico']),
  titulo: z.string(),
  mensagem: z.string(),
  acaoSugerida: z.string().optional(),
  eventoRelacionadoId: z.string().optional(),
  dataHora: z.string(),
  lido: z.boolean(),
  descartado: z.boolean(),
})

const SugestaoOtimizacaoSchema = z.object({
  tipo: z.enum(['reagendar', 'agrupar', 'delegar', 'cancelar', 'preparar']),
  titulo: z.string(),
  descricao: z.string(),
  impacto: z.enum(['baixo', 'medio', 'alto']),
  eventosAfetados: z.array(z.string()),
  economia_tempo_minutos: z.number().optional(),
})

export type EventoAgenda = z.infer<typeof EventoAgendaSchema>
export type AlertaSecretario = z.infer<typeof AlertaSecretarioSchema>
export type SugestaoOtimizacao = z.infer<typeof SugestaoOtimizacaoSchema>

// ============ FERRAMENTAS ============

const analisarAgendaSchema = z.object({
  dataInicio: z.string().describe('Data de início da análise (ISO 8601)'),
  dataFim: z.string().describe('Data de fim da análise (ISO 8601)'),
  incluirSugestoes: z.boolean().optional().describe('Incluir sugestões de otimização'),
})

const gerarAlertasSchema = z.object({
  horizonte_horas: z.number().describe('Horizonte de tempo em horas para gerar alertas'),
  tipos: z.array(z.string()).optional().describe('Tipos específicos de alertas'),
})

const prepararReuniaoSchema = z.object({
  eventoId: z.string().describe('ID do evento/reunião'),
  incluirContexto: z.boolean().optional().describe('Incluir contexto de interações anteriores'),
  incluirDocumentos: z.boolean().optional().describe('Listar documentos relevantes'),
})

const verificarConflitosSchema = z.object({
  dataInicio: z.string().describe('Data/hora de início do novo evento'),
  dataFim: z.string().describe('Data/hora de fim do novo evento'),
  tolerancia_minutos: z.number().optional().describe('Tolerância em minutos entre eventos'),
})

const sugerirHorarioSchema = z.object({
  duracao_minutos: z.number().describe('Duração do evento em minutos'),
  participantes: z.array(z.string()).optional().describe('Emails dos participantes'),
  preferencias: z.object({
    periodo: z.enum(['manha', 'tarde', 'qualquer']).optional(),
    diasSemana: z.array(z.number()).optional(),
    evitarHorarios: z.array(z.string()).optional(),
  }).optional(),
})

const resumoDiarioSchema = z.object({
  data: z.string().describe('Data para o resumo (ISO 8601)'),
  incluirMetricas: z.boolean().optional().describe('Incluir métricas do dia'),
})

// ============ IMPLEMENTAÇÃO DAS FERRAMENTAS ============

async function analisarAgenda(
  params: z.infer<typeof analisarAgendaSchema>
): Promise<{
  totalEventos: number
  eventosPorTipo: Record<string, number>
  horasOcupadas: number
  horasLivres: number
  eventos: EventoAgenda[]
  sugestoes?: SugestaoOtimizacao[]
}> {
  // Simulação - em produção, buscar do Supabase/Outlook
  const eventos: EventoAgenda[] = [
    {
      id: '1',
      titulo: 'Cirurgia - Implante Marca-passo',
      tipo: 'cirurgia',
      dataInicio: new Date().toISOString(),
      dataFim: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
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
      dataInicio: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      dataFim: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      local: 'Sala de Reuniões Virtual',
      prioridade: 'media',
      status: 'confirmado',
      participantes: [
        { nome: 'Representante Abbott', email: 'rep@abbott.com', confirmado: true },
      ],
      tags: ['Comercial', 'Fornecedor'],
      sincronizadoOutlook: true,
    },
  ]

  const eventosPorTipo: Record<string, number> = {}
  eventos.forEach(e => {
    eventosPorTipo[e.tipo] = (eventosPorTipo[e.tipo] || 0) + 1
  })

  const sugestoes: SugestaoOtimizacao[] = params.incluirSugestoes ? [
    {
      tipo: 'preparar',
      titulo: 'Preparar materiais para cirurgia',
      descricao: 'Verificar kit OPME e documentação antes da cirurgia de amanhã',
      impacto: 'alto',
      eventosAfetados: ['1'],
    },
    {
      tipo: 'agrupar',
      titulo: 'Agrupar reuniões do período da tarde',
      descricao: 'Otimize seu tempo agrupando as 2 reuniões consecutivas',
      impacto: 'medio',
      eventosAfetados: ['2'],
      economia_tempo_minutos: 30,
    },
  ] : undefined

  return {
    totalEventos: eventos.length,
    eventosPorTipo,
    horasOcupadas: 4,
    horasLivres: 4,
    eventos,
    sugestoes,
  }
}

async function gerarAlertas(
  params: z.infer<typeof gerarAlertasSchema>
): Promise<AlertaSecretario[]> {
  const agora = new Date()
  
  return [
    {
      id: '1',
      tipo: 'cirurgia_hoje',
      prioridade: 'urgente',
      titulo: '🏥 Cirurgia em 2 horas',
      mensagem: 'Cirurgia de Implante de Marca-passo no Hospital São Lucas às 14:00. Kit OPME já separado.',
      acaoSugerida: 'Verificar checklist pré-cirúrgico',
      eventoRelacionadoId: '1',
      dataHora: agora.toISOString(),
      lido: false,
      descartado: false,
    },
    {
      id: '2',
      tipo: 'preparacao_reuniao',
      prioridade: 'atencao',
      titulo: '📋 Preparar reunião Abbott',
      mensagem: 'Reunião comercial com Abbott em 5 horas. Revise o relatório de sell-out mensal.',
      acaoSugerida: 'Abrir relatório de vendas',
      eventoRelacionadoId: '2',
      dataHora: agora.toISOString(),
      lido: false,
      descartado: false,
    },
    {
      id: '3',
      tipo: 'autorizacao_pendente',
      prioridade: 'atencao',
      titulo: '⏳ 3 autorizações pendentes',
      mensagem: 'Há 3 cirurgias aguardando autorização de convênio. Prazo médio: 48h.',
      acaoSugerida: 'Verificar status no portal',
      dataHora: agora.toISOString(),
      lido: false,
      descartado: false,
    },
    {
      id: '4',
      tipo: 'prazo_vencendo',
      prioridade: 'info',
      titulo: '📅 AFE vence em 45 dias',
      mensagem: 'A Autorização de Funcionamento ANVISA vence em 15/01/2026. Inicie o processo de renovação.',
      acaoSugerida: 'Ir para módulo Qualidade',
      dataHora: agora.toISOString(),
      lido: false,
      descartado: false,
    },
  ]
}

async function prepararReuniao(
  params: z.infer<typeof prepararReuniaoSchema>
): Promise<{
  evento: EventoAgenda
  contexto: string
  documentosRelevantes: string[]
  pontosDiscussao: string[]
  historicoInteracoes: string[]
}> {
  return {
    evento: {
      id: params.eventoId,
      titulo: 'Reunião Comercial - Abbott',
      tipo: 'reuniao',
      dataInicio: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      dataFim: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      local: 'Sala de Reuniões Virtual',
      prioridade: 'media',
      status: 'confirmado',
      sincronizadoOutlook: true,
    },
    contexto: 'Reunião mensal de acompanhamento comercial com a Abbott. Foco em sell-out e previsão de demanda para Q1 2026.',
    documentosRelevantes: [
      'Relatório Sell-Out Novembro 2025.xlsx',
      'Previsão de Demanda Q1 2026.pdf',
      'Contrato de Distribuição Abbott.pdf',
    ],
    pontosDiscussao: [
      'Análise de vendas do mês',
      'Novos produtos CRM 2026',
      'Treinamento técnico equipe',
      'Metas Q1 2026',
    ],
    historicoInteracoes: [
      '15/10/2025 - Reunião de alinhamento estratégico',
      '20/11/2025 - Treinamento produto Assurity MRI',
    ],
  }
}

async function verificarConflitos(
  params: z.infer<typeof verificarConflitosSchema>
): Promise<{
  temConflito: boolean
  conflitos: Array<{
    evento: EventoAgenda
    tipoConflito: 'sobreposicao' | 'proximidade' | 'mesmo_local'
  }>
  sugestaoAlternativa?: string
}> {
  return {
    temConflito: false,
    conflitos: [],
    sugestaoAlternativa: 'Horário disponível',
  }
}

async function sugerirHorario(
  params: z.infer<typeof sugerirHorarioSchema>
): Promise<{
  sugestoes: Array<{
    dataInicio: string
    dataFim: string
    score: number
    motivo: string
  }>
}> {
  const agora = new Date()
  
  return {
    sugestoes: [
      {
        dataInicio: new Date(agora.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        dataFim: new Date(agora.getTime() + 24 * 60 * 60 * 1000 + params.duracao_minutos * 60 * 1000).toISOString(),
        score: 0.95,
        motivo: 'Horário livre, sem conflitos, período preferido',
      },
      {
        dataInicio: new Date(agora.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        dataFim: new Date(agora.getTime() + 48 * 60 * 60 * 1000 + params.duracao_minutos * 60 * 1000).toISOString(),
        score: 0.85,
        motivo: 'Horário alternativo disponível',
      },
    ],
  }
}

async function gerarResumoDiario(
  params: z.infer<typeof resumoDiarioSchema>
): Promise<{
  data: string
  totalEventos: number
  cirurgias: number
  reunioes: number
  tarefasPendentes: number
  alertas: number
  resumoTexto: string
  proximosEventos: EventoAgenda[]
  metricas?: {
    cirurgiasRealizadas: number
    faturamentoEstimado: number
    taxaOcupacao: number
  }
}> {
  return {
    data: params.data,
    totalEventos: 5,
    cirurgias: 2,
    reunioes: 2,
    tarefasPendentes: 3,
    alertas: 4,
    resumoTexto: `
📅 **Resumo do Dia - ${new Date(params.data).toLocaleDateString('pt-BR')}**

Bom dia! Aqui está seu resumo para hoje:

🏥 **2 Cirurgias** agendadas
- 14:00 - Implante Marca-passo (Hospital São Lucas)
- 16:00 - Troca de Gerador CDI (Hospital Albert Einstein)

📋 **2 Reuniões**
- 10:00 - Reunião comercial Abbott (Virtual)
- 17:00 - Alinhamento equipe logística

⚠️ **4 Alertas** requerem atenção
- 3 autorizações pendentes de convênio
- AFE vence em 45 dias

💡 **Sugestão**: Aproveite o intervalo das 11:30 para revisar os kits cirúrgicos.
    `.trim(),
    proximosEventos: [],
    metricas: params.incluirMetricas ? {
      cirurgiasRealizadas: 2,
      faturamentoEstimado: 45000,
      taxaOcupacao: 0.75,
    } : undefined,
  }
}

// ============ CONFIGURAÇÃO DO AGENTE ============

const SECRETARY_TOOLS: AgentTool[] = [
  {
    name: 'analisar_agenda',
    description: 'Analisa a agenda em um período e retorna estatísticas e sugestões de otimização',
    schema: analisarAgendaSchema,
    execute: analisarAgenda,
  },
  {
    name: 'gerar_alertas',
    description: 'Gera alertas inteligentes sobre eventos próximos, conflitos e pendências',
    schema: gerarAlertasSchema,
    execute: gerarAlertas,
  },
  {
    name: 'preparar_reuniao',
    description: 'Prepara contexto, documentos e pontos de discussão para uma reunião',
    schema: prepararReuniaoSchema,
    execute: prepararReuniao,
  },
  {
    name: 'verificar_conflitos',
    description: 'Verifica se há conflitos de agenda para um novo evento',
    schema: verificarConflitosSchema,
    execute: verificarConflitos,
  },
  {
    name: 'sugerir_horario',
    description: 'Sugere os melhores horários disponíveis para um novo evento',
    schema: sugerirHorarioSchema,
    execute: sugerirHorario,
  },
  {
    name: 'resumo_diario',
    description: 'Gera um resumo completo do dia com eventos, alertas e métricas',
    schema: resumoDiarioSchema,
    execute: gerarResumoDiario,
  },
]

const SECRETARY_CONFIG: AgentConfig = {
  name: 'SecretaryAgent',
  type: 'secretary',
  description: 'Agente IA Secretário para gerenciamento inteligente de agenda e alertas proativos',
  version: '1.0.0',
  tools: SECRETARY_TOOLS,
  systemPrompt: `Você é o Secretário IA do ICARUS, um assistente executivo inteligente especializado em gestão de agenda para distribuidoras de materiais médicos OPME.

Suas responsabilidades:
1. **Gestão de Agenda**: Analisar, organizar e otimizar a agenda do usuário
2. **Alertas Proativos**: Notificar sobre eventos importantes, prazos e pendências
3. **Preparação de Reuniões**: Reunir contexto e documentos relevantes
4. **Otimização de Tempo**: Sugerir reagendamentos e agrupamentos inteligentes
5. **Integração Outlook**: Manter sincronização com calendário Microsoft

Contexto de Negócio:
- Cirurgias são eventos prioritários que requerem logística prévia
- Autorizações de convênio têm prazos críticos
- Documentos ANVISA têm validade e precisam de renovação antecipada
- Reuniões com fabricantes (Abbott, Medtronic) são estratégicas

Comunicação:
- Seja conciso e objetivo
- Use emojis para categorizar (🏥 cirurgia, 📋 reunião, ⚠️ alerta)
- Priorize informações acionáveis
- Sempre sugira próximos passos

Ao responder:
1. Identifique a necessidade do usuário
2. Use as ferramentas disponíveis
3. Forneça informações estruturadas
4. Sugira ações proativas`,
  maxTokens: 2000,
  temperature: 0.3, // Mais determinístico para agenda
  enableMemory: true,
  enableStreaming: true,
}

// ============ CLASSE DO AGENTE ============

export class SecretaryAgent extends BaseAgent {
  constructor() {
    super(SECRETARY_CONFIG)
  }

  /**
   * Obtém o resumo do dia
   */
  async getDailySummary(data?: string): Promise<ReturnType<typeof gerarResumoDiario>> {
    return gerarResumoDiario({
      data: data || new Date().toISOString(),
      incluirMetricas: true,
    })
  }

  /**
   * Obtém alertas ativos
   */
  async getActiveAlerts(horizonte_horas: number = 24): Promise<AlertaSecretario[]> {
    return gerarAlertas({ horizonte_horas })
  }

  /**
   * Analisa a agenda da semana
   */
  async getWeekAnalysis(): Promise<ReturnType<typeof analisarAgenda>> {
    const hoje = new Date()
    const fimSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return analisarAgenda({
      dataInicio: hoje.toISOString(),
      dataFim: fimSemana.toISOString(),
      incluirSugestoes: true,
    })
  }

  /**
   * Prepara briefing para reunião
   */
  async prepareForMeeting(eventoId: string): Promise<ReturnType<typeof prepararReuniao>> {
    return prepararReuniao({
      eventoId,
      incluirContexto: true,
      incluirDocumentos: true,
    })
  }
}

// ============ HOOK REACT ============

export function useSecretaryAgent() {
  const agent = new SecretaryAgent()

  return {
    agent,
    getDailySummary: agent.getDailySummary.bind(agent),
    getActiveAlerts: agent.getActiveAlerts.bind(agent),
    getWeekAnalysis: agent.getWeekAnalysis.bind(agent),
    prepareForMeeting: agent.prepareForMeeting.bind(agent),
    chat: agent.execute.bind(agent),
  }
}

export default SecretaryAgent

