// Supabase Edge Function para Chatbot ICARUS
// Deploy: npx supabase functions deploy chat

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface ChatRequest {
  message: string
  sessionId?: string
  context?: {
    empresaId?: string
    userId?: string
    currentPage?: string
  }
}

interface ChatResponse {
  response: string
  sessionId: string
  intent?: string
  actions?: Array<{
    type: string
    label: string
    link?: string
  }>
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `Voce e o Assistente Virtual do ICARUS, um sistema ERP completo para distribuidoras de dispositivos medicos (OPME - Orteses, Proteses e Materiais Especiais).

CAPACIDADES:
1. Consultar informacoes sobre estoque, produtos e lotes
2. Ajudar com agendamento e gestao de cirurgias
3. Orientar sobre compliance ANVISA (RDC 16/2013, RDC 665/2022)
4. Auxiliar em faturamento e notas fiscais
5. Explicar funcionalidades do sistema
6. Navegar entre modulos

MODULOS DISPONIVEIS:
- Dashboard: Visao geral de KPIs
- Estoque: Controle de produtos e lotes
- Cirurgias: Agendamento e kits
- Faturamento: NF-e e SEFAZ
- CRM: Leads e clientes
- Compliance: ANVISA e LGPD
- Financeiro: Contas e fluxo de caixa

DIRETRIZES:
- Responda em portugues brasileiro
- Seja conciso e objetivo
- Para consultas de dados, sugira o modulo apropriado
- Para acoes que modificam dados, oriente o usuario
- Nao invente informacoes
- Se nao souber, indique onde encontrar

FORMATO DE RESPOSTA:
Responda de forma clara e direta. Quando apropriado, sugira acoes que o usuario pode tomar.`

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { message, sessionId, context } = await req.json() as ChatRequest

    // Generate or use existing session ID
    const currentSessionId = sessionId || crypto.randomUUID()

    // Get chat history from database (if session exists)
    let history: ChatMessage[] = []
    if (sessionId) {
      const { data: messages } = await supabase
        .from('chatbot_mensagens')
        .select('role, content')
        .eq('sessao_id', sessionId)
        .order('criado_em', { ascending: true })
        .limit(10)

      if (messages) {
        history = messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      }
    }

    // Detect intent from message
    const intent = detectIntent(message)

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT
    if (context?.currentPage) {
      systemPrompt += `\n\nCONTEXTO ATUAL: O usuario esta na pagina ${context.currentPage}`
    }

    // Build messages array for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ]

    let assistantResponse = ''

    // Try OpenAI API if key is available
    if (OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          assistantResponse = data.choices?.[0]?.message?.content || ''
        }
      } catch (error) {
        console.error('OpenAI API error:', error)
      }
    }

    // Fallback to rule-based response if OpenAI fails
    if (!assistantResponse) {
      assistantResponse = generateFallbackResponse(message, intent)
    }

    // Generate actions based on intent
    const actions = generateActions(intent)

    // Save messages to database
    try {
      // Ensure session exists
      await supabase
        .from('chatbot_sessoes')
        .upsert({
          id: currentSessionId,
          empresa_id: context?.empresaId,
          usuario_id: context?.userId,
          atualizado_em: new Date().toISOString(),
        })

      // Save user message
      await supabase
        .from('chatbot_mensagens')
        .insert({
          sessao_id: currentSessionId,
          role: 'user',
          content: message,
          intent,
        })

      // Save assistant response
      await supabase
        .from('chatbot_mensagens')
        .insert({
          sessao_id: currentSessionId,
          role: 'assistant',
          content: assistantResponse,
        })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue even if DB save fails
    }

    const response: ChatResponse = {
      response: assistantResponse,
      sessionId: currentSessionId,
      intent,
      actions,
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Erro interno',
      response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
      sessionId: crypto.randomUUID(),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    })
  }
})

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('estoque') || lowerMessage.includes('produto') || lowerMessage.includes('lote')) {
    return 'consulta_estoque'
  }
  if (lowerMessage.includes('cirurgia') || lowerMessage.includes('agendar') || lowerMessage.includes('kit')) {
    return 'ajuda_cirurgia'
  }
  if (lowerMessage.includes('anvisa') || lowerMessage.includes('registro') || lowerMessage.includes('compliance')) {
    return 'compliance'
  }
  if (lowerMessage.includes('nota') || lowerMessage.includes('nf') || lowerMessage.includes('faturamento')) {
    return 'consulta_financeiro'
  }
  if (lowerMessage.includes('lead') || lowerMessage.includes('cliente') || lowerMessage.includes('crm')) {
    return 'crm'
  }
  if (lowerMessage.includes('ajuda') || lowerMessage.includes('ola') || lowerMessage.includes('oi')) {
    return 'saudacao'
  }

  return 'geral'
}

function generateFallbackResponse(message: string, intent: string): string {
  const responses: Record<string, string> = {
    consulta_estoque: 'Para consultar o estoque, voce pode acessar o modulo de Estoque no menu lateral. La voce encontra informacoes sobre quantidades disponiveis, lotes com data de validade e alertas de nivel critico.\n\nPosso ajudar com algo mais especifico sobre estoque?',

    ajuda_cirurgia: 'Para gerenciar cirurgias, acesse o modulo de Cirurgias. La voce pode:\n\n1. Criar novo agendamento\n2. Montar kit de materiais\n3. Acompanhar status no Kanban\n4. Registrar materiais consumidos\n\nPrecisa de ajuda com alguma dessas funcoes?',

    compliance: 'O ICARUS possui um modulo completo de Compliance para ANVISA. Voce pode:\n\n1. Validar registros ANVISA de produtos\n2. Acompanhar rastreabilidade de lotes\n3. Gerar relatorios de conformidade\n4. Receber alertas de vencimentos\n\nQual verificacao voce precisa fazer?',

    consulta_financeiro: 'O modulo de Faturamento NF-e permite:\n\n1. Emitir notas fiscais eletronicas\n2. Consultar status na SEFAZ\n3. Gerar DANFE e XML\n4. Enviar por email\n5. Gerenciar cancelamentos\n\nQual operacao voce precisa realizar?',

    crm: 'O modulo de CRM ajuda a gerenciar seu relacionamento com clientes:\n\n1. Cadastro de leads e qualificacao\n2. Pipeline de oportunidades\n3. Historico de interacoes\n4. Campanhas de marketing\n\nComo posso ajudar?',

    saudacao: 'Ola! Sou o assistente virtual do ICARUS. Posso ajudar com:\n\n- Consultas de estoque e produtos\n- Agendamento de cirurgias\n- Validacao de registros ANVISA\n- Faturamento e notas fiscais\n- Navegacao no sistema\n\nComo posso ajudar voce hoje?',

    geral: `Entendi sua pergunta. O ICARUS e um sistema ERP completo para gestao OPME.\n\nPosso ajudar com informacoes sobre:\n- Estoque e produtos\n- Cirurgias e kits\n- Compliance ANVISA\n- Faturamento\n- CRM e vendas\n\nPoderia especificar sua necessidade?`,
  }

  return responses[intent] || responses.geral
}

function generateActions(intent: string): Array<{ type: string; label: string; link?: string }> {
  const actionsMap: Record<string, Array<{ type: string; label: string; link: string }>> = {
    consulta_estoque: [
      { type: 'navigate', label: 'Ir para Estoque', link: '/estoque-ia' },
    ],
    ajuda_cirurgia: [
      { type: 'navigate', label: 'Ir para Cirurgias', link: '/cirurgias' },
    ],
    compliance: [
      { type: 'navigate', label: 'Ir para Compliance', link: '/compliance-anvisa' },
    ],
    consulta_financeiro: [
      { type: 'navigate', label: 'Ir para Faturamento', link: '/faturamento-nfe' },
    ],
    crm: [
      { type: 'navigate', label: 'Ir para CRM', link: '/crm' },
    ],
  }

  return actionsMap[intent] || []
}
