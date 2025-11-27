/**
 * ICARUS v5.0 - LangChain Reactive Agent Edge Function
 * 
 * Agente com Ferramentas Reativas (equivalente ao LangGraph)
 * Especializado em distribuição de dispositivos médicos no Brasil
 * Considera RDC 16/2013, temperatura controlada e rastreabilidade de lote
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Tipos
interface AgentRequest {
  mensagem: string
  usuario_id?: string
  contexto?: Record<string, unknown>
}

interface _ToolCall {
  name: string
  arguments: Record<string, unknown>
}

interface AgentResponse {
  resposta: string
  ferramentas_usadas: string[]
  dados_estruturados?: Record<string, unknown>
}

// Configurações
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Definição das ferramentas disponíveis
const TOOLS_SCHEMA = [
  {
    type: "function",
    function: {
      name: "estoque_disponivel",
      description: "Retorna estoque físico, reservado e disponível por depósito/região. Use para verificar disponibilidade de produtos.",
      parameters: {
        type: "object",
        properties: {
          produto_id: {
            type: "string",
            description: "UUID do produto ou código interno"
          },
          produto_nome: {
            type: "string",
            description: "Nome ou descrição do produto para busca"
          },
          regiao: {
            type: "string",
            enum: ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"],
            description: "Região geográfica para filtrar depósitos"
          },
          deposito_id: {
            type: "string",
            description: "UUID específico do depósito (opcional)"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "previsao_vencimento_lote",
      description: "Retorna os lotes que vencem mais próximo para um produto. Essencial para gestão FEFO (First Expire, First Out) conforme RDC 59/2008.",
      parameters: {
        type: "object",
        properties: {
          produto_id: {
            type: "string",
            description: "UUID do produto"
          },
          produto_nome: {
            type: "string",
            description: "Nome do produto para busca"
          },
          vencimento_minimo: {
            type: "string",
            description: "Data mínima de vencimento (YYYY-MM-DD)"
          },
          limite: {
            type: "integer",
            description: "Quantidade de lotes a retornar (padrão: 3)"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "busca_catalogo_anvisa",
      description: "Busca produtos no catálogo médico com filtros regulatórios ANVISA. Verifica registro válido, classe de risco, etc.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Descrição do produto ou características técnicas"
          },
          registro_anvisa_valido: {
            type: "boolean",
            description: "Filtrar apenas produtos com registro ANVISA válido"
          },
          classe_risco: {
            type: "array",
            items: { type: "string", enum: ["I", "II", "III", "IV"] },
            description: "Classes de risco ANVISA"
          },
          vencimento_apos: {
            type: "string",
            description: "Data mínima de vencimento (YYYY-MM-DD)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "verificar_cirurgia_agendada",
      description: "Consulta detalhes de cirurgias agendadas, incluindo produtos necessários e status de disponibilidade.",
      parameters: {
        type: "object",
        properties: {
          data_cirurgia: {
            type: "string",
            description: "Data da cirurgia (YYYY-MM-DD)"
          },
          hospital: {
            type: "string",
            description: "Nome ou código do hospital"
          },
          tipo_procedimento: {
            type: "string",
            description: "Tipo de procedimento (ex: angioplastia, artroplastia)"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "rastreabilidade_lote",
      description: "Consulta histórico completo de rastreabilidade de um lote conforme RDC 59/2008. Inclui movimentações, temperatura e cadeia de custódia.",
      parameters: {
        type: "object",
        properties: {
          numero_lote: {
            type: "string",
            description: "Número do lote"
          },
          produto_id: {
            type: "string",
            description: "UUID do produto"
          }
        },
        required: ["numero_lote"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "validar_anvisa_infosimples",
      description: "Consulta em tempo real o registro ANVISA via InfoSimples API. Verifica se um produto tem registro válido, classe de risco, data de validade e situação atual. Essencial para conformidade RDC 751/2022.",
      parameters: {
        type: "object",
        properties: {
          numero_registro: {
            type: "string",
            description: "Número do registro ANVISA (apenas números)"
          },
          produto_id: {
            type: "string",
            description: "UUID do produto no sistema (opcional, para atualizar cache)"
          }
        },
        required: ["numero_registro"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "buscar_registros_anvisa",
      description: "Busca registros ANVISA por termo (nome do produto, fabricante, etc). Retorna lista de produtos encontrados na base da ANVISA.",
      parameters: {
        type: "object",
        properties: {
          termo: {
            type: "string",
            description: "Termo de busca (mínimo 3 caracteres)"
          },
          limite: {
            type: "integer",
            description: "Quantidade máxima de resultados (padrão: 10)"
          }
        },
        required: ["termo"]
      }
    }
  }
]

/**
 * Executa ferramenta de estoque disponível
 */
async function toolEstoqueDisponivel(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('estoque_disponivel_por_regiao', {
    p_produto_id: args.produto_id || null,
    p_regiao: args.regiao || null,
    p_deposito_id: args.deposito_id || null
  })

  if (error) {
    return { erro: error.message, sucesso: false }
  }

  return {
    sucesso: true,
    produto: args.produto_nome || args.produto_id,
    regiao: args.regiao || 'Todas',
    depositos: data || [],
    total_depositos: data?.length || 0
  }
}

/**
 * Executa ferramenta de previsão de vencimento
 */
async function toolPrevisaoVencimento(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('previsao_vencimento_lotes', {
    p_produto_id: args.produto_id || null,
    p_limite: args.limite || 3
  })

  if (error) {
    return { erro: error.message, sucesso: false }
  }

  // Filtrar por vencimento mínimo se especificado
  let lotes = data || []
  if (args.vencimento_minimo) {
    const dataMin = new Date(args.vencimento_minimo as string)
    lotes = lotes.filter((l: { data_vencimento: string }) => 
      new Date(l.data_vencimento) >= dataMin
    )
  }

  return {
    sucesso: true,
    produto: args.produto_nome || args.produto_id,
    lotes: lotes,
    total_lotes: lotes.length,
    alertas: lotes.filter((l: { status_alerta: string }) => l.status_alerta === 'atenção')
  }
}

/**
 * Executa busca no catálogo com filtros ANVISA
 */
async function toolBuscaCatalogo(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // Gerar embedding para busca semântica
  if (!OPENAI_API_KEY) {
    return { erro: 'OpenAI API não configurada', sucesso: false }
  }

  try {
    const embResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-large',
        input: args.query,
        dimensions: 1536
      }),
    })

    if (!embResponse.ok) {
      return { erro: 'Erro ao gerar embedding', sucesso: false }
    }

    const embData = await embResponse.json()
    const embedding = embData.data[0].embedding

    const { data, error } = await supabase.rpc('busca_semantica_catalogo', {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 5,
      filtro_anvisa_valido: args.registro_anvisa_valido ?? null,
      filtro_classe_risco: args.classe_risco ?? null,
      filtro_vencimento_apos: args.vencimento_apos ?? null
    })

    if (error) {
      return { erro: error.message, sucesso: false }
    }

    return {
      sucesso: true,
      query: args.query,
      filtros_aplicados: {
        registro_anvisa_valido: args.registro_anvisa_valido,
        classe_risco: args.classe_risco,
        vencimento_apos: args.vencimento_apos
      },
      resultados: data || [],
      total: data?.length || 0
    }
  } catch (error) {
    return { erro: String(error), sucesso: false }
  }
}

/**
 * Verifica cirurgias agendadas
 */
async function toolVerificarCirurgia(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  let query = supabase.from('cirurgias').select('*')

  if (args.data_cirurgia) {
    query = query.eq('data_cirurgia', args.data_cirurgia)
  }
  if (args.hospital) {
    query = query.ilike('hospital_nome', `%${args.hospital}%`)
  }
  if (args.tipo_procedimento) {
    query = query.ilike('procedimento', `%${args.tipo_procedimento}%`)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    return { erro: error.message, sucesso: false }
  }

  return {
    sucesso: true,
    filtros: args,
    cirurgias: data || [],
    total: data?.length || 0
  }
}

/**
 * Consulta rastreabilidade de lote
 */
async function toolRastreabilidadeLote(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // Simulação - implementar conforme estrutura real do banco
  return {
    sucesso: true,
    numero_lote: args.numero_lote,
    rastreabilidade: {
      fabricante: 'Medtronic',
      data_fabricacao: '2024-06-15',
      data_entrada_brasil: '2024-08-20',
      registro_anvisa: '80000000001',
      movimentacoes: [
        { data: '2024-08-25', tipo: 'Entrada', local: 'CD São Paulo', quantidade: 100 },
        { data: '2024-09-10', tipo: 'Transferência', local: 'CD Recife', quantidade: 30 },
        { data: '2024-10-15', tipo: 'Venda', local: 'Hospital Santa Casa', quantidade: 5 }
      ],
      temperatura: {
        conformidade: true,
        registros: [
          { data: '2024-08-25', temp_min: 2.1, temp_max: 7.8 },
          { data: '2024-09-10', temp_min: 2.3, temp_max: 7.5 }
        ]
      }
    }
  }
}

/**
 * Valida registro ANVISA via InfoSimples API
 */
async function toolValidarAnvisaInfosimples(
  _supabase: ReturnType<typeof createClient>,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const INFOSIMPLES_API_KEY = Deno.env.get('INFOSIMPLES_API_KEY')
  
  if (!INFOSIMPLES_API_KEY) {
    return { erro: 'INFOSIMPLES_API_KEY não configurada', sucesso: false }
  }

  const numeroLimpo = String(args.numero_registro || '').replace(/\D/g, '')

  if (!numeroLimpo || numeroLimpo.length < 8) {
    return { erro: 'Número de registro inválido', sucesso: false }
  }

  try {
    const response = await fetch('https://api.infosimples.com/api/v2/consultas/anvisa/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: INFOSIMPLES_API_KEY,
        numero_registro: numeroLimpo
      })
    })

    if (!response.ok) {
      return { erro: `API error: ${response.status}`, sucesso: false }
    }

    const data = await response.json()

    if (data.code !== 200 || !data.data || data.data.length === 0) {
      return { 
        sucesso: false, 
        erro: data.code_message || 'Registro não encontrado na ANVISA',
        numero_consultado: numeroLimpo
      }
    }

    const registro = data.data[0]
    
    // Verifica se está vencido
    let situacao = registro.situacao
    if (registro.valido_ate && situacao === 'ATIVO') {
      const dataValidade = new Date(registro.valido_ate)
      if (dataValidade < new Date()) {
        situacao = 'VENCIDO'
      }
    }

    return {
      sucesso: true,
      valido: situacao === 'ATIVO',
      registro: {
        numero_registro: registro.numero_registro,
        nome_comercial: registro.nome_comercial,
        titular: registro.titular,
        situacao: situacao,
        valido_ate: registro.valido_ate,
        classe_risco: registro.classe_risco,
        motivo_cancelamento: registro.motivo_cancelamento
      },
      conformidade_rdc_751_2022: situacao === 'ATIVO'
    }
  } catch (error) {
    return { erro: String(error), sucesso: false }
  }
}

/**
 * Busca registros ANVISA por termo
 */
async function toolBuscarRegistrosAnvisa(
  _supabase: ReturnType<typeof createClient>,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const INFOSIMPLES_API_KEY = Deno.env.get('INFOSIMPLES_API_KEY')
  
  if (!INFOSIMPLES_API_KEY) {
    return { erro: 'INFOSIMPLES_API_KEY não configurada', sucesso: false }
  }

  const termo = String(args.termo || '')
  if (termo.length < 3) {
    return { erro: 'Termo deve ter pelo menos 3 caracteres', sucesso: false }
  }

  try {
    const response = await fetch('https://api.infosimples.com/api/v2/consultas/anvisa/busca', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: INFOSIMPLES_API_KEY,
        termo,
        limite: args.limite || 10
      })
    })

    if (!response.ok) {
      return { erro: `API error: ${response.status}`, sucesso: false }
    }

    const data = await response.json()

    if (data.code !== 200) {
      return { sucesso: false, erro: data.code_message, registros: [] }
    }

    return {
      sucesso: true,
      termo_buscado: termo,
      total: data.data?.length || 0,
      registros: (data.data || []).map((r: Record<string, unknown>) => ({
        numero_registro: r.numero_registro,
        nome_comercial: r.nome_comercial,
        titular: r.titular,
        situacao: r.situacao,
        classe_risco: r.classe_risco
      }))
    }
  } catch (error) {
    return { erro: String(error), sucesso: false, registros: [] }
  }
}

/**
 * Executa uma ferramenta pelo nome
 */
async function executeTool(
  supabase: ReturnType<typeof createClient>,
  toolName: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const startTime = Date.now()
  let result: Record<string, unknown>

  switch (toolName) {
    case 'estoque_disponivel':
      result = await toolEstoqueDisponivel(supabase, args)
      break
    case 'previsao_vencimento_lote':
      result = await toolPrevisaoVencimento(supabase, args)
      break
    case 'busca_catalogo_anvisa':
      result = await toolBuscaCatalogo(supabase, args)
      break
    case 'verificar_cirurgia_agendada':
      result = await toolVerificarCirurgia(supabase, args)
      break
    case 'rastreabilidade_lote':
      result = await toolRastreabilidadeLote(supabase, args)
      break
    case 'validar_anvisa_infosimples':
      result = await toolValidarAnvisaInfosimples(supabase, args)
      break
    case 'buscar_registros_anvisa':
      result = await toolBuscarRegistrosAnvisa(supabase, args)
      break
    default:
      result = { erro: `Ferramenta desconhecida: ${toolName}`, sucesso: false }
  }

  // Logar execução
  await supabase.from('ai_agent_tools_log').insert({
    tool_name: toolName,
    tool_input: args,
    tool_output: result,
    execution_time_ms: Date.now() - startTime,
    success: result.sucesso !== false
  })

  return result
}

/**
 * Processa a conversa com o agente
 */
async function processAgent(
  supabase: ReturnType<typeof createClient>,
  mensagem: string,
  contexto?: Record<string, unknown>
): Promise<AgentResponse> {
  const ferramentasUsadas: string[] = []
  const dadosEstruturados: Record<string, unknown> = {}

  // Usar Claude 3.5 Sonnet (preferencial para raciocínio regulatório) ou GPT-4o
  const useAnthropic = ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.length > 0
  
  const systemPrompt = `Você é um assistente experto em distribuição de dispositivos médicos OPME no Brasil.

REGULAMENTAÇÕES QUE VOCÊ CONHECE:
- RDC 16/2013: Boas Práticas de Fabricação de Produtos Médicos
- RDC 59/2008: Rastreabilidade de produtos para saúde
- RDC 751/2022: Registro de dispositivos médicos
- IN 13/2009: Certificação de Boas Práticas
- RDC 185/2001: Registro de produtos

SUAS CAPACIDADES:
1. Consultar estoque disponível por região e depósito
2. Verificar lotes próximos do vencimento (FEFO)
3. Buscar produtos no catálogo com filtros regulatórios ANVISA
4. Consultar cirurgias agendadas e produtos necessários
5. Rastrear histórico completo de lotes

REGRAS:
- Sempre considere temperatura controlada para produtos que exigem cadeia fria
- Priorize lotes com vencimento mais próximo (FEFO)
- Verifique registro ANVISA válido antes de sugerir produtos
- Considere tempo de transporte para entregas regionais
- Responda SEMPRE em português brasileiro

Contexto adicional: ${JSON.stringify(contexto || {})}`

  let resposta = ''

  if (useAnthropic) {
    // Usar Anthropic Claude 3.5 Sonnet
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        tools: TOOLS_SCHEMA.map(t => ({
          name: t.function.name,
          description: t.function.description,
          input_schema: t.function.parameters
        })),
        messages: [{ role: 'user', content: mensagem }]
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${error}`)
    }

    const data = await response.json()
    
    // Processar tool calls se houver
    for (const block of data.content) {
      if (block.type === 'tool_use') {
        ferramentasUsadas.push(block.name)
        const toolResult = await executeTool(supabase, block.name, block.input)
        dadosEstruturados[block.name] = toolResult
      } else if (block.type === 'text') {
        resposta += block.text
      }
    }

    // Se usou ferramentas, fazer segunda chamada com resultados
    if (ferramentasUsadas.length > 0) {
      const toolResults = ferramentasUsadas.map(name => ({
        type: 'tool_result',
        tool_use_id: data.content.find((b: { type: string; name: string }) => b.type === 'tool_use' && b.name === name)?.id,
        content: JSON.stringify(dadosEstruturados[name])
      }))

      const response2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: 'user', content: mensagem },
            { role: 'assistant', content: data.content },
            { role: 'user', content: toolResults }
          ]
        }),
      })

      if (response2.ok) {
        const data2 = await response2.json()
        resposta = data2.content.find((b: { type: string }) => b.type === 'text')?.text || resposta
      }
    }

  } else if (OPENAI_API_KEY) {
    // Usar OpenAI GPT-4o
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: mensagem }
        ],
        tools: TOOLS_SCHEMA,
        tool_choice: 'auto',
        temperature: 0
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    const message = data.choices[0].message

    // Processar tool calls
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments)
        
        ferramentasUsadas.push(toolName)
        const toolResult = await executeTool(supabase, toolName, toolArgs)
        dadosEstruturados[toolName] = toolResult
      }

      // Segunda chamada com resultados das ferramentas
      const toolMessages = message.tool_calls.map((tc: { id: string; function: { name: string } }) => ({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(dadosEstruturados[tc.function.name])
      }))

      const response2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: mensagem },
            message,
            ...toolMessages
          ],
          temperature: 0
        }),
      })

      if (response2.ok) {
        const data2 = await response2.json()
        resposta = data2.choices[0].message.content
      }
    } else {
      resposta = message.content
    }
  } else {
    throw new Error('Nenhuma API de LLM configurada (OPENAI_API_KEY ou ANTHROPIC_API_KEY)')
  }

  return {
    resposta,
    ferramentas_usadas: ferramentasUsadas,
    dados_estruturados: dadosEstruturados
  }
}

// Handler principal
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const body: AgentRequest = await req.json()
    
    const { mensagem, usuario_id, contexto } = body

    if (!mensagem) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resultado = await processAgent(supabase, mensagem, contexto)

    // Salvar na sessão do chat se tiver usuario_id
    if (usuario_id) {
      await supabase.from('chat_sessions').upsert({
        id: usuario_id,
        last_message: mensagem,
        last_response: resultado.resposta,
        tools_used: resultado.ferramentas_usadas,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...resultado
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no agente:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor',
        resposta: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

