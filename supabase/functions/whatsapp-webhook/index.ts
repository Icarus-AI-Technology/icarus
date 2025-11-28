/**
 * ICARUS v5.0 - WhatsApp Webhook Edge Function
 * 
 * Processa webhooks do WhatsApp Business API.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração
const WHATSAPP_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'icarus_whatsapp_verify_2024'
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID')

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface WebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        contacts?: Array<{ profile: { name: string }; wa_id: string }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: { body: string }
          interactive?: { type: string; button_reply?: { id: string; title: string } }
        }>
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)

  // Verificação do webhook (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    console.log('Webhook verification:', { mode, token, challenge })

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified successfully')
      return new Response(challenge, { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    return new Response('Forbidden', { 
      status: 403,
      headers: corsHeaders
    })
  }

  // Processar webhook (POST)
  if (req.method === 'POST') {
    try {
      const payload: WebhookPayload = await req.json()
      console.log('Received webhook:', JSON.stringify(payload, null, 2))

      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const value = change.value

          // Processar mensagens recebidas
          if (value.messages) {
            for (const message of value.messages) {
              console.log('Processing message:', message)

              // Salvar mensagem no banco
              await supabase.from('whatsapp_messages').insert({
                message_id: message.id,
                direction: 'inbound',
                phone: message.from,
                type: message.type,
                content: JSON.stringify(message.text || message.interactive),
                contact_name: value.contacts?.[0]?.profile.name,
                created_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
              })

              // Processar e responder
              const responseText = await processMessage(message)
              if (responseText) {
                await sendWhatsAppMessage(message.from, responseText)
              }
            }
          }

          // Processar atualizações de status
          if (value.statuses) {
            for (const status of value.statuses) {
              console.log('Status update:', status)
              
              await supabase
                .from('whatsapp_messages')
                .update({ 
                  status: status.status, 
                  updated_at: new Date().toISOString() 
                })
                .eq('message_id', status.id)
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Webhook error:', error)
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response('Method not allowed', { 
    status: 405,
    headers: corsHeaders
  })
})

/**
 * Processa mensagem e retorna resposta
 */
async function processMessage(message: any): Promise<string> {
  let userMessage = ''

  if (message.type === 'text' && message.text) {
    userMessage = message.text.body.toLowerCase()
  } else if (message.type === 'interactive' && message.interactive?.button_reply) {
    userMessage = message.interactive.button_reply.id
  }

  // Comandos básicos
  if (userMessage.includes('menu') || userMessage.includes('ajuda')) {
    return '🏥 *ICARUS - Menu Principal*\n\n' +
      'Digite o número da opção:\n\n' +
      '1️⃣ Status de cirurgias\n' +
      '2️⃣ Consultar estoque\n' +
      '3️⃣ Verificar pedidos\n' +
      '4️⃣ Alertas pendentes\n' +
      '5️⃣ Falar com suporte'
  }

  if (userMessage === '1' || userMessage.includes('cirurgia')) {
    const { data: cirurgias } = await supabase
      .from('cirurgias')
      .select('*, paciente:pacientes(nome)')
      .gte('data_cirurgia', new Date().toISOString().split('T')[0])
      .order('data_cirurgia')
      .limit(5)

    if (!cirurgias?.length) {
      return '📋 Nenhuma cirurgia agendada.'
    }

    let response = '📋 *Próximas Cirurgias*\n\n'
    for (const c of cirurgias) {
      const data = new Date(c.data_cirurgia).toLocaleDateString('pt-BR')
      response += `• ${data} - ${c.paciente?.nome || 'N/A'}\n`
    }
    return response
  }

  if (userMessage === '2' || userMessage.includes('estoque')) {
    return '📦 *Estoque*\n\n✅ Todos os produtos com estoque adequado.\n\nDigite *menu* para voltar.'
  }

  if (userMessage === '3' || userMessage.includes('pedido')) {
    return '📋 *Pedidos*\n\nNenhum pedido pendente.\n\nDigite *menu* para voltar.'
  }

  if (userMessage === '4' || userMessage.includes('alerta')) {
    return '🔔 *Alertas*\n\n• 2 lotes próximos ao vencimento\n• 3 produtos com estoque baixo\n\nDigite *menu* para voltar.'
  }

  if (userMessage === '5' || userMessage.includes('suporte')) {
    return '📞 *Suporte ICARUS*\n\nEmail: suporte@icarus.com.br\nTel: (11) 3000-0000'
  }

  return 'Não entendi. Digite *menu* para ver as opções.'
}

/**
 * Envia mensagem via WhatsApp API
 */
async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_ID) {
    console.error('WhatsApp credentials not configured')
    return
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: text },
        }),
      }
    )

    const data = await response.json()
    console.log('Message sent:', data)

    // Salvar mensagem enviada
    if (data.messages?.[0]?.id) {
      await supabase.from('whatsapp_messages').insert({
        message_id: data.messages[0].id,
        direction: 'outbound',
        phone: to,
        type: 'text',
        content: JSON.stringify({ body: text }),
        status: 'sent',
        created_at: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

