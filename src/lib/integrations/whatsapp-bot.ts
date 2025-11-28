/**
 * ICARUS v5.0 - WhatsApp Bot Integration
 * 
 * Bot WhatsApp para notificações e consultas do sistema ICARUS.
 * Utiliza a API oficial do WhatsApp Business (Meta).
 * 
 * Funcionalidades:
 * - Notificações de cirurgias
 * - Alertas de estoque
 * - Consulta de status de pedidos
 * - Lembretes de vencimento
 * - Confirmações de agendamento
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'
import { supabase } from '@/lib/config/supabase-client'

// ============ TIPOS ============

export interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  apiVersion: string
}

export interface WhatsAppMessage {
  id: string
  type: 'text' | 'template' | 'interactive' | 'image' | 'document'
  to: string
  content: MessageContent
  status?: MessageStatus
  timestamp?: string
}

export type MessageContent = 
  | TextMessage 
  | TemplateMessage 
  | InteractiveMessage 
  | MediaMessage

export interface TextMessage {
  type: 'text'
  body: string
  previewUrl?: boolean
}

export interface TemplateMessage {
  type: 'template'
  name: string
  language: { code: string }
  components?: TemplateComponent[]
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button'
  parameters: TemplateParameter[]
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document'
  text?: string
  currency?: { fallback_value: string; code: string; amount_1000: number }
  date_time?: { fallback_value: string }
}

export interface InteractiveMessage {
  type: 'interactive'
  interactive: {
    type: 'button' | 'list' | 'product' | 'product_list'
    header?: { type: 'text' | 'image'; text?: string }
    body: { text: string }
    footer?: { text: string }
    action: InteractiveAction
  }
}

export interface InteractiveAction {
  buttons?: Array<{
    type: 'reply'
    reply: { id: string; title: string }
  }>
  sections?: Array<{
    title: string
    rows: Array<{ id: string; title: string; description?: string }>
  }>
}

export interface MediaMessage {
  type: 'image' | 'document'
  link?: string
  id?: string
  caption?: string
  filename?: string
}

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface WebhookPayload {
  object: string
  entry: WebhookEntry[]
}

export interface WebhookEntry {
  id: string
  changes: WebhookChange[]
}

export interface WebhookChange {
  value: {
    messaging_product: string
    metadata: { display_phone_number: string; phone_number_id: string }
    contacts?: Array<{ profile: { name: string }; wa_id: string }>
    messages?: WebhookMessage[]
    statuses?: WebhookStatus[]
  }
  field: string
}

export interface WebhookMessage {
  from: string
  id: string
  timestamp: string
  type: 'text' | 'interactive' | 'button'
  text?: { body: string }
  interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } }
  button?: { text: string; payload: string }
}

export interface WebhookStatus {
  id: string
  status: MessageStatus
  timestamp: string
  recipient_id: string
}

export interface NotificationTemplate {
  id: string
  name: string
  category: 'cirurgia' | 'estoque' | 'financeiro' | 'geral'
  template: string
  variables: string[]
}

export interface Contact {
  id: string
  phone: string
  name: string
  role: 'medico' | 'instrumentador' | 'gestor' | 'paciente'
  preferences: {
    notifications: boolean
    channels: ('whatsapp' | 'email' | 'sms')[]
  }
}

// ============ CONFIGURAÇÃO ============

const DEFAULT_CONFIG: Partial<WhatsAppConfig> = {
  apiVersion: 'v18.0',
}

const WHATSAPP_API_URL = 'https://graph.facebook.com'

// Templates de notificação pré-definidos
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'cirurgia_agendada',
    name: 'Cirurgia Agendada',
    category: 'cirurgia',
    template: '🏥 *Cirurgia Agendada*\n\nPaciente: {{paciente}}\nData: {{data}}\nHora: {{hora}}\nHospital: {{hospital}}\nProcedimento: {{procedimento}}\n\nKit OPME: {{kit}}',
    variables: ['paciente', 'data', 'hora', 'hospital', 'procedimento', 'kit'],
  },
  {
    id: 'cirurgia_confirmada',
    name: 'Cirurgia Confirmada',
    category: 'cirurgia',
    template: '✅ *Cirurgia Confirmada*\n\nA cirurgia de {{paciente}} foi confirmada para {{data}} às {{hora}}.\n\nHospital: {{hospital}}\nSala: {{sala}}',
    variables: ['paciente', 'data', 'hora', 'hospital', 'sala'],
  },
  {
    id: 'estoque_baixo',
    name: 'Alerta de Estoque Baixo',
    category: 'estoque',
    template: '⚠️ *Alerta de Estoque*\n\nProduto: {{produto}}\nQuantidade atual: {{quantidade}}\nPonto de pedido: {{ponto_pedido}}\n\nRecomendação: Realizar pedido de reposição.',
    variables: ['produto', 'quantidade', 'ponto_pedido'],
  },
  {
    id: 'lote_vencendo',
    name: 'Lote Próximo ao Vencimento',
    category: 'estoque',
    template: '🔴 *Alerta de Vencimento*\n\nProduto: {{produto}}\nLote: {{lote}}\nVencimento: {{vencimento}}\nQuantidade: {{quantidade}}\n\nAção requerida: Priorizar uso ou solicitar troca.',
    variables: ['produto', 'lote', 'vencimento', 'quantidade'],
  },
  {
    id: 'pagamento_recebido',
    name: 'Pagamento Recebido',
    category: 'financeiro',
    template: '💰 *Pagamento Recebido*\n\nValor: R$ {{valor}}\nOrigem: {{origem}}\nReferência: {{referencia}}\nData: {{data}}',
    variables: ['valor', 'origem', 'referencia', 'data'],
  },
  {
    id: 'fatura_vencendo',
    name: 'Fatura Próxima ao Vencimento',
    category: 'financeiro',
    template: '📅 *Lembrete de Vencimento*\n\nFatura: {{numero}}\nValor: R$ {{valor}}\nVencimento: {{vencimento}}\nCliente: {{cliente}}\n\nStatus: {{status}}',
    variables: ['numero', 'valor', 'vencimento', 'cliente', 'status'],
  },
]

// ============ CLASSE PRINCIPAL ============

class WhatsAppBotService {
  private config: WhatsAppConfig | null = null

  /**
   * Inicializa o serviço com as credenciais
   */
  initialize(config: Partial<WhatsAppConfig>): void {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as WhatsAppConfig

    logger.info('WhatsApp Bot initialized')
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(this.config?.phoneNumberId && this.config?.accessToken)
  }

  /**
   * Envia mensagem de texto simples
   */
  async sendTextMessage(to: string, text: string): Promise<WhatsAppMessage | null> {
    if (!this.isConfigured()) {
      logger.error('WhatsApp Bot not configured')
      return null
    }

    try {
      const response = await fetch(
        `${WHATSAPP_API_URL}/${this.config!.apiVersion}/${this.config!.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'text',
            text: { body: text },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        logger.error('Failed to send WhatsApp message:', error)
        return null
      }

      const data = await response.json()
      
      // Salvar no histórico
      await this.saveMessageHistory({
        id: data.messages[0].id,
        type: 'text',
        to,
        content: { type: 'text', body: text },
        status: 'sent',
        timestamp: new Date().toISOString(),
      })

      return {
        id: data.messages[0].id,
        type: 'text',
        to,
        content: { type: 'text', body: text },
        status: 'sent',
      }
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error)
      return null
    }
  }

  /**
   * Envia mensagem usando template
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: Record<string, string>,
    language = 'pt_BR'
  ): Promise<WhatsAppMessage | null> {
    if (!this.isConfigured()) {
      logger.error('WhatsApp Bot not configured')
      return null
    }

    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateName)
    if (!template) {
      logger.error('Template not found:', templateName)
      return null
    }

    // Substituir variáveis no template
    let messageBody = template.template
    for (const [key, value] of Object.entries(variables)) {
      messageBody = messageBody.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    // Para templates oficiais da Meta, usar a API de templates
    // Para templates locais, enviar como texto formatado
    return this.sendTextMessage(to, messageBody)
  }

  /**
   * Envia mensagem interativa com botões
   */
  async sendInteractiveMessage(
    to: string,
    body: string,
    buttons: Array<{ id: string; title: string }>,
    header?: string,
    footer?: string
  ): Promise<WhatsAppMessage | null> {
    if (!this.isConfigured()) {
      logger.error('WhatsApp Bot not configured')
      return null
    }

    try {
      const interactive: InteractiveMessage['interactive'] = {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.slice(0, 3).map(btn => ({
            type: 'reply' as const,
            reply: { id: btn.id, title: btn.title.substring(0, 20) },
          })),
        },
      }

      if (header) {
        interactive.header = { type: 'text', text: header }
      }

      if (footer) {
        interactive.footer = { text: footer }
      }

      const response = await fetch(
        `${WHATSAPP_API_URL}/${this.config!.apiVersion}/${this.config!.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'interactive',
            interactive,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        logger.error('Failed to send interactive message:', error)
        return null
      }

      const data = await response.json()
      
      return {
        id: data.messages[0].id,
        type: 'interactive',
        to,
        content: { type: 'interactive', interactive },
        status: 'sent',
      }
    } catch (error) {
      logger.error('Error sending interactive message:', error)
      return null
    }
  }

  /**
   * Envia lista interativa
   */
  async sendListMessage(
    to: string,
    body: string,
    buttonText: string,
    sections: Array<{
      title: string
      rows: Array<{ id: string; title: string; description?: string }>
    }>
  ): Promise<WhatsAppMessage | null> {
    if (!this.isConfigured()) {
      logger.error('WhatsApp Bot not configured')
      return null
    }

    try {
      const response = await fetch(
        `${WHATSAPP_API_URL}/${this.config!.apiVersion}/${this.config!.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config!.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'interactive',
            interactive: {
              type: 'list',
              body: { text: body },
              action: {
                button: buttonText,
                sections,
              },
            },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        logger.error('Failed to send list message:', error)
        return null
      }

      const data = await response.json()
      
      return {
        id: data.messages[0].id,
        type: 'interactive',
        to,
        content: { type: 'interactive', interactive: { type: 'list', body: { text: body }, action: { sections } } },
        status: 'sent',
      }
    } catch (error) {
      logger.error('Error sending list message:', error)
      return null
    }
  }

  /**
   * Processa webhook de mensagem recebida
   */
  async processWebhook(payload: WebhookPayload): Promise<void> {
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const value = change.value

        // Processar mensagens recebidas
        if (value.messages) {
          for (const message of value.messages) {
            await this.handleIncomingMessage(message, value.contacts?.[0])
          }
        }

        // Processar atualizações de status
        if (value.statuses) {
          for (const status of value.statuses) {
            await this.handleStatusUpdate(status)
          }
        }
      }
    }
  }

  /**
   * Processa mensagem recebida
   */
  private async handleIncomingMessage(
    message: WebhookMessage,
    contact?: { profile: { name: string }; wa_id: string }
  ): Promise<void> {
    logger.info('Received WhatsApp message:', { from: message.from, type: message.type })

    let responseText = ''
    let userMessage = ''

    // Extrair conteúdo da mensagem
    if (message.type === 'text' && message.text) {
      userMessage = message.text.body.toLowerCase()
    } else if (message.type === 'interactive') {
      if (message.interactive?.button_reply) {
        userMessage = message.interactive.button_reply.id
      } else if (message.interactive?.list_reply) {
        userMessage = message.interactive.list_reply.id
      }
    } else if (message.type === 'button' && message.button) {
      userMessage = message.button.payload
    }

    // Processar comandos
    responseText = await this.processCommand(userMessage, message.from, contact?.profile.name)

    // Enviar resposta
    if (responseText) {
      await this.sendTextMessage(message.from, responseText)
    }

    // Salvar no histórico
    await this.saveIncomingMessage(message, contact)
  }

  /**
   * Processa comandos do usuário
   */
  private async processCommand(
    command: string,
    from: string,
    userName?: string
  ): Promise<string> {
    const greeting = userName ? `Olá ${userName}! ` : 'Olá! '

    // Comandos básicos
    if (command.includes('menu') || command.includes('ajuda') || command.includes('help')) {
      return `${greeting}🏥 *ICARUS - Menu Principal*\n\n` +
        'Digite o número da opção desejada:\n\n' +
        '1️⃣ Status de cirurgias\n' +
        '2️⃣ Consultar estoque\n' +
        '3️⃣ Verificar pedidos\n' +
        '4️⃣ Alertas pendentes\n' +
        '5️⃣ Falar com suporte\n\n' +
        'Ou digite sua dúvida diretamente.'
    }

    if (command === '1' || command.includes('cirurgia')) {
      return await this.getCirurgiasStatus(from)
    }

    if (command === '2' || command.includes('estoque')) {
      return await this.getEstoqueStatus()
    }

    if (command === '3' || command.includes('pedido')) {
      return await this.getPedidosStatus(from)
    }

    if (command === '4' || command.includes('alerta')) {
      return await this.getAlertasPendentes()
    }

    if (command === '5' || command.includes('suporte')) {
      return '📞 *Suporte ICARUS*\n\n' +
        'Para falar com nossa equipe:\n' +
        '• Email: suporte@icarus.com.br\n' +
        '• Tel: (11) 3000-0000\n' +
        '• Horário: Seg-Sex 8h às 18h\n\n' +
        'Ou descreva sua dúvida aqui que encaminharemos.'
    }

    // Resposta padrão
    return `${greeting}Não entendi sua solicitação.\n\nDigite *menu* para ver as opções disponíveis.`
  }

  /**
   * Obtém status de cirurgias
   */
  private async getCirurgiasStatus(phone: string): Promise<string> {
    try {
      const { data: cirurgias } = await supabase
        .from('cirurgias')
        .select('*, hospital:hospitais(nome_fantasia), paciente:pacientes(nome)')
        .gte('data_cirurgia', new Date().toISOString().split('T')[0])
        .order('data_cirurgia', { ascending: true })
        .limit(5)

      if (!cirurgias || cirurgias.length === 0) {
        return '📋 *Cirurgias*\n\nNenhuma cirurgia agendada para os próximos dias.'
      }

      let response = '📋 *Próximas Cirurgias*\n\n'
      
      for (const c of cirurgias) {
        const data = new Date(c.data_cirurgia).toLocaleDateString('pt-BR')
        response += `• ${data} - ${c.paciente?.nome || 'N/A'}\n`
        response += `  Hospital: ${c.hospital?.nome_fantasia || 'N/A'}\n`
        response += `  Status: ${c.status || 'Agendada'}\n\n`
      }

      return response
    } catch {
      return '❌ Erro ao consultar cirurgias. Tente novamente.'
    }
  }

  /**
   * Obtém status de estoque
   */
  private async getEstoqueStatus(): Promise<string> {
    try {
      const { data: alertas } = await supabase
        .from('opme_produtos')
        .select('descricao, quantidade_estoque, ponto_pedido')
        .lt('quantidade_estoque', supabase.rpc('get_ponto_pedido'))
        .limit(5)

      let response = '📦 *Status do Estoque*\n\n'

      if (!alertas || alertas.length === 0) {
        response += '✅ Todos os produtos estão com estoque adequado.'
      } else {
        response += '⚠️ *Produtos com estoque baixo:*\n\n'
        for (const p of alertas) {
          response += `• ${p.descricao}\n`
          response += `  Qtd: ${p.quantidade_estoque} | Mín: ${p.ponto_pedido}\n\n`
        }
      }

      return response
    } catch {
      return '❌ Erro ao consultar estoque. Tente novamente.'
    }
  }

  /**
   * Obtém status de pedidos
   */
  private async getPedidosStatus(phone: string): Promise<string> {
    try {
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('numero, status, data_pedido, valor_total')
        .order('data_pedido', { ascending: false })
        .limit(5)

      if (!pedidos || pedidos.length === 0) {
        return '📋 *Pedidos*\n\nNenhum pedido encontrado.'
      }

      let response = '📋 *Últimos Pedidos*\n\n'
      
      for (const p of pedidos) {
        const data = new Date(p.data_pedido).toLocaleDateString('pt-BR')
        response += `• #${p.numero} - ${data}\n`
        response += `  Status: ${p.status}\n`
        response += `  Valor: R$ ${p.valor_total?.toFixed(2) || '0,00'}\n\n`
      }

      return response
    } catch {
      return '❌ Erro ao consultar pedidos. Tente novamente.'
    }
  }

  /**
   * Obtém alertas pendentes
   */
  private async getAlertasPendentes(): Promise<string> {
    // Simular alertas - em produção, buscar do banco
    return '🔔 *Alertas Pendentes*\n\n' +
      '• 2 lotes próximos ao vencimento\n' +
      '• 3 produtos com estoque baixo\n' +
      '• 1 cirurgia aguardando confirmação\n' +
      '• 5 faturas a vencer esta semana\n\n' +
      'Acesse o sistema para mais detalhes.'
  }

  /**
   * Atualiza status da mensagem
   */
  private async handleStatusUpdate(status: WebhookStatus): Promise<void> {
    logger.debug('Message status update:', status)

    await supabase
      .from('whatsapp_messages')
      .update({ status: status.status, updated_at: new Date().toISOString() })
      .eq('message_id', status.id)
  }

  /**
   * Salva mensagem no histórico
   */
  private async saveMessageHistory(message: WhatsAppMessage): Promise<void> {
    try {
      await supabase.from('whatsapp_messages').insert({
        message_id: message.id,
        direction: 'outbound',
        phone: message.to,
        type: message.type,
        content: JSON.stringify(message.content),
        status: message.status,
        created_at: message.timestamp || new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to save message history:', error)
    }
  }

  /**
   * Salva mensagem recebida
   */
  private async saveIncomingMessage(
    message: WebhookMessage,
    contact?: { profile: { name: string }; wa_id: string }
  ): Promise<void> {
    try {
      await supabase.from('whatsapp_messages').insert({
        message_id: message.id,
        direction: 'inbound',
        phone: message.from,
        type: message.type,
        content: JSON.stringify(message.text || message.interactive || message.button),
        contact_name: contact?.profile.name,
        created_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      })
    } catch (error) {
      logger.error('Failed to save incoming message:', error)
    }
  }

  /**
   * Formata número de telefone para o padrão WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    // Remover caracteres não numéricos
    let formatted = phone.replace(/\D/g, '')

    // Adicionar código do país se não tiver
    if (formatted.length === 11 && formatted.startsWith('9')) {
      formatted = '55' + formatted
    } else if (formatted.length === 10) {
      formatted = '55' + formatted
    }

    return formatted
  }

  /**
   * Verifica token do webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config?.webhookVerifyToken) {
      return challenge
    }
    return null
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const whatsappBot = new WhatsAppBotService()

// ============ HOOK REACT ============

import { useState, useCallback } from 'react'

export interface UseWhatsAppBotReturn {
  sendMessage: (to: string, text: string) => Promise<WhatsAppMessage | null>
  sendTemplate: (to: string, template: string, variables: Record<string, string>) => Promise<WhatsAppMessage | null>
  sendInteractive: (to: string, body: string, buttons: Array<{ id: string; title: string }>) => Promise<WhatsAppMessage | null>
  isConfigured: boolean
  isLoading: boolean
  error: string | null
}

export function useWhatsAppBot(): UseWhatsAppBotReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (to: string, text: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await whatsappBot.sendTextMessage(to, text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendTemplate = useCallback(async (
    to: string,
    template: string,
    variables: Record<string, string>
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      return await whatsappBot.sendTemplateMessage(to, template, variables)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send template')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendInteractive = useCallback(async (
    to: string,
    body: string,
    buttons: Array<{ id: string; title: string }>
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      return await whatsappBot.sendInteractiveMessage(to, body, buttons)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send interactive')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    sendMessage,
    sendTemplate,
    sendInteractive,
    isConfigured: whatsappBot.isConfigured(),
    isLoading,
    error,
  }
}

// ============ SUPABASE EDGE FUNCTION HANDLER ============

export const webhookHandler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)

  // Verificação do webhook (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode && token && challenge) {
      const result = whatsappBot.verifyWebhook(mode, token, challenge)
      if (result) {
        return new Response(result, { status: 200 })
      }
    }
    return new Response('Forbidden', { status: 403 })
  }

  // Processar webhook (POST)
  if (req.method === 'POST') {
    try {
      const payload = await req.json() as WebhookPayload
      await whatsappBot.processWebhook(payload)
      return new Response('OK', { status: 200 })
    } catch (error) {
      logger.error('Webhook processing error:', error)
      return new Response('Error', { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
}

// ============ EXPORTS ============

export default {
  whatsappBot,
  useWhatsAppBot,
  webhookHandler,
  NOTIFICATION_TEMPLATES,
}

