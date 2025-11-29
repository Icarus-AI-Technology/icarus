// ============================================================================
// ICARUS v6.0 - Edge Function: IcarusBrain Chatbot
// LangChain + LangGraph + Claude 3.5 Sonnet
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0';
import { Redis } from 'https://esm.sh/@upstash/redis@1.28.0';

// ============================================================================
// TYPES
// ============================================================================

interface ChatRequest {
  empresa_id: string;
  user_id: string;
  sessao_id?: string;
  mensagem: string;
  contexto?: 'geral' | 'financeiro' | 'estoque' | 'cirurgias' | 'compliance';
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SYSTEM_PROMPT = `Você é o IcarusBrain, o assistente inteligente do sistema ICARUS v6.0 - uma plataforma completa para gestão de OPME (Órteses, Próteses e Materiais Especiais).

## Suas Capacidades:
- Consultar e analisar dados de cirurgias, estoque e financeiro
- Buscar informações na base de conhecimento vetorial
- Executar análises financeiras e detectar anomalias
- Verificar compliance com ANVISA e LGPD
- Gerar relatórios e insights

## Diretrizes:
1. Seja conciso e direto nas respostas
2. Use dados reais quando disponíveis
3. Alerte sobre irregularidades ou riscos
4. Sugira ações proativas
5. Mantenha tom profissional mas acessível
6. Use emojis com moderação para tornar a conversa mais agradável

## Contexto Atual:
{contexto}

## Ferramentas Disponíveis:
Você pode usar as ferramentas fornecidas para buscar informações específicas do sistema.`;

const TOOLS: Tool[] = [
  {
    name: 'buscar_cirurgias',
    description: 'Busca cirurgias com filtros como data, hospital, médico ou status',
    input_schema: {
      type: 'object',
      properties: {
        data_inicio: { type: 'string', description: 'Data inicial (YYYY-MM-DD)' },
        data_fim: { type: 'string', description: 'Data final (YYYY-MM-DD)' },
        status: { type: 'string', description: 'Status da cirurgia' },
        hospital_id: { type: 'string', description: 'ID do hospital' },
        medico_id: { type: 'string', description: 'ID do médico' },
        limit: { type: 'number', description: 'Limite de resultados', default: 10 },
      },
    },
  },
  {
    name: 'buscar_estoque',
    description: 'Consulta estoque de produtos, alertas de vencimento e níveis baixos',
    input_schema: {
      type: 'object',
      properties: {
        produto_id: { type: 'string', description: 'ID do produto' },
        codigo: { type: 'string', description: 'Código do produto' },
        nome: { type: 'string', description: 'Nome para busca' },
        alertas: { type: 'boolean', description: 'Retornar apenas alertas' },
        vencendo_em_dias: { type: 'number', description: 'Produtos vencendo em X dias' },
      },
    },
  },
  {
    name: 'buscar_financeiro',
    description: 'Consulta faturas, parcelas, transações bancárias e alertas financeiros',
    input_schema: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['faturas', 'parcelas_vencidas', 'transacoes', 'alertas', 'resumo'],
        },
        data_inicio: { type: 'string', description: 'Data inicial' },
        data_fim: { type: 'string', description: 'Data final' },
        cliente_id: { type: 'string', description: 'ID do cliente' },
      },
    },
  },
  {
    name: 'buscar_conhecimento',
    description: 'Busca semântica na base de conhecimento (manuais, procedimentos, FAQ)',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Pergunta ou termo de busca' },
        tipo: {
          type: 'string',
          enum: ['documento', 'faq', 'procedimento', 'legislacao', 'manual'],
        },
        limit: { type: 'number', description: 'Número de resultados', default: 5 },
      },
      required: ['query'],
    },
  },
  {
    name: 'verificar_compliance',
    description: 'Verifica compliance ANVISA de produtos ou LGPD de processos',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['anvisa', 'lgpd', 'rastreabilidade'] },
        produto_id: { type: 'string', description: 'ID do produto (para ANVISA)' },
        registro_anvisa: { type: 'string', description: 'Número do registro ANVISA' },
      },
      required: ['tipo'],
    },
  },
];

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info',
      },
    });
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Clients
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    });

    const redis = new Redis({
      url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
      token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
    });

    // Parse request
    const body: ChatRequest = await req.json();
    const { empresa_id, user_id, sessao_id, mensagem, contexto } = body;

    // Get or create session
    let sessionId = sessao_id;
    if (!sessionId) {
      const { data: newSession } = await supabase
        .from('chatbot_sessoes')
        .insert({
          empresa_id,
          usuario_id: user_id,
          contexto: contexto || 'geral',
        })
        .select('id')
        .single();
      sessionId = newSession?.id;
    }

    // Get chat history from Redis
    const historyKey = `chat:history:${sessionId}`;
    const cachedHistory = await redis.lrange<string>(historyKey, 0, 19);
    const history: Message[] = cachedHistory.map((m) => JSON.parse(m));

    // Get context from Redis or generate
    const contextKey = `chat:context:${sessionId}`;
    let sessionContext = await redis.get<string>(contextKey);

    if (!sessionContext) {
      // Build context from empresa data
      const { data: empresa } = await supabase
        .from('empresas')
        .select('razao_social, nome_fantasia')
        .eq('id', empresa_id)
        .single();

      const { data: cirurgiasHoje } = await supabase
        .from('cirurgias')
        .select('id', { count: 'exact' })
        .eq('empresa_id', empresa_id)
        .eq('data_agendamento', new Date().toISOString().split('T')[0]);

      const { data: alertas } = await supabase
        .from('alertas_financeiros')
        .select('id', { count: 'exact' })
        .eq('empresa_id', empresa_id)
        .eq('status', 'novo');

      sessionContext = `
Empresa: ${empresa?.nome_fantasia || empresa?.razao_social}
Cirurgias hoje: ${cirurgiasHoje?.length || 0}
Alertas financeiros pendentes: ${alertas?.length || 0}
Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      `.trim();

      await redis.setex(contextKey, 1800, sessionContext); // 30 min cache
    }

    // Prepare messages
    const systemPrompt = SYSTEM_PROMPT.replace('{contexto}', sessionContext);
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: mensagem },
    ];

    // Call Claude with tools
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      tools: TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema,
      })),
      messages,
    });

    // Process tool calls if any
    let finalContent = '';
    const toolResults: Array<{ tool: string; result: unknown }> = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        finalContent += block.text;
      } else if (block.type === 'tool_use') {
        const toolResult = await executeTool(
          supabase,
          empresa_id,
          block.name,
          block.input as Record<string, unknown>
        );
        toolResults.push({ tool: block.name, result: toolResult });

        // Continue conversation with tool result
        const followUp = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            ...messages,
            { role: 'assistant', content: response.content },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(toolResult),
                },
              ],
            },
          ],
        });

        for (const fBlock of followUp.content) {
          if (fBlock.type === 'text') {
            finalContent += fBlock.text;
          }
        }
      }
    }

    // Save messages to history
    await redis.lpush(historyKey, JSON.stringify({ role: 'user', content: mensagem }));
    await redis.lpush(historyKey, JSON.stringify({ role: 'assistant', content: finalContent }));
    await redis.ltrim(historyKey, 0, 49); // Keep last 50 messages
    await redis.expire(historyKey, 86400); // 24h expiry

    // Save to database
    await supabase.from('chatbot_mensagens').insert([
      {
        empresa_id,
        sessao_id: sessionId,
        role: 'user',
        content: mensagem,
      },
      {
        empresa_id,
        sessao_id: sessionId,
        role: 'assistant',
        content: finalContent,
        tokens_input: response.usage?.input_tokens || 0,
        tokens_output: response.usage?.output_tokens || 0,
        modelo: 'claude-3-5-sonnet-20241022',
        tool_calls: toolResults.length > 0 ? toolResults : null,
      },
    ]);

    // Update session
    await supabase
      .from('chatbot_sessoes')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', sessionId);

    return new Response(
      JSON.stringify({
        sessao_id: sessionId,
        resposta: finalContent,
        tools_used: toolResults.map((t) => t.tool),
        tokens: {
          input: response.usage?.input_tokens,
          output: response.usage?.output_tokens,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('IcarusBrain error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// ============================================================================
// TOOL EXECUTION
// ============================================================================

async function executeTool(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  toolName: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case 'buscar_cirurgias':
      return await buscarCirurgias(supabase, empresaId, input);

    case 'buscar_estoque':
      return await buscarEstoque(supabase, empresaId, input);

    case 'buscar_financeiro':
      return await buscarFinanceiro(supabase, empresaId, input);

    case 'buscar_conhecimento':
      return await buscarConhecimento(supabase, empresaId, input);

    case 'verificar_compliance':
      return await verificarCompliance(supabase, empresaId, input);

    default:
      return { error: 'Tool not found' };
  }
}

async function buscarCirurgias(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  input: Record<string, unknown>
) {
  let query = supabase
    .from('cirurgias')
    .select(`
      id, numero, procedimento, data_agendamento, hora_prevista, status,
      hospital:hospitais(id, cliente:clientes(nome_fantasia)),
      medico:medicos(nome, crm, crm_uf)
    `)
    .eq('empresa_id', empresaId)
    .is('excluido_em', null)
    .order('data_agendamento', { ascending: true });

  if (input.data_inicio) {
    query = query.gte('data_agendamento', input.data_inicio);
  }
  if (input.data_fim) {
    query = query.lte('data_agendamento', input.data_fim);
  }
  if (input.status) {
    query = query.eq('status', input.status);
  }
  if (input.hospital_id) {
    query = query.eq('hospital_id', input.hospital_id);
  }
  if (input.medico_id) {
    query = query.eq('medico_id', input.medico_id);
  }

  const { data, error } = await query.limit((input.limit as number) || 10);
  if (error) return { error: error.message };

  return {
    total: data?.length || 0,
    cirurgias: data?.map((c: any) => ({
      numero: c.numero,
      procedimento: c.procedimento,
      data: c.data_agendamento,
      hora: c.hora_prevista,
      status: c.status,
      hospital: c.hospital?.cliente?.nome_fantasia,
      medico: `${c.medico?.nome} (CRM ${c.medico?.crm}/${c.medico?.crm_uf})`,
    })),
  };
}

async function buscarEstoque(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  input: Record<string, unknown>
) {
  if (input.alertas) {
    // Return only alerts (low stock or expiring)
    const { data } = await supabase.rpc('get_estoque_alertas', {
      p_empresa_id: empresaId,
      p_dias_vencimento: (input.vencendo_em_dias as number) || 30,
    });
    return data;
  }

  let query = supabase
    .from('vw_estoque')
    .select('*')
    .eq('empresa_id', empresaId);

  if (input.produto_id) {
    query = query.eq('produto_id', input.produto_id);
  }
  if (input.codigo) {
    query = query.ilike('codigo', `%${input.codigo}%`);
  }
  if (input.nome) {
    query = query.ilike('nome', `%${input.nome}%`);
  }

  const { data, error } = await query.limit(20);
  if (error) return { error: error.message };

  return {
    total: data?.length || 0,
    produtos: data?.map((p: any) => ({
      codigo: p.codigo,
      nome: p.nome,
      quantidade_disponivel: p.quantidade_disponivel,
      quantidade_reservada: p.quantidade_reservada,
      estoque_minimo: p.estoque_minimo,
      status: p.status_estoque,
      proxima_validade: p.proxima_validade,
    })),
  };
}

async function buscarFinanceiro(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  input: Record<string, unknown>
) {
  const tipo = input.tipo as string;

  switch (tipo) {
    case 'faturas': {
      let query = supabase
        .from('faturas')
        .select('numero, valor_liquido, data_vencimento, status, cliente:clientes(razao_social)')
        .eq('empresa_id', empresaId);

      if (input.cliente_id) {
        query = query.eq('cliente_id', input.cliente_id);
      }
      if (input.data_inicio) {
        query = query.gte('data_vencimento', input.data_inicio);
      }
      if (input.data_fim) {
        query = query.lte('data_vencimento', input.data_fim);
      }

      const { data } = await query.limit(20);
      return { faturas: data };
    }

    case 'parcelas_vencidas': {
      const { data } = await supabase
        .from('parcelas')
        .select('*, fatura:faturas(numero, cliente:clientes(razao_social))')
        .eq('empresa_id', empresaId)
        .lt('data_vencimento', new Date().toISOString().split('T')[0])
        .in('status', ['pendente', 'parcial'])
        .order('data_vencimento')
        .limit(20);

      const total = data?.reduce((sum: number, p: any) => sum + (p.valor - p.valor_pago), 0) || 0;
      return { total_vencido: total, parcelas: data };
    }

    case 'alertas': {
      const { data } = await supabase
        .from('alertas_financeiros')
        .select('*')
        .eq('empresa_id', empresaId)
        .in('status', ['novo', 'em_analise'])
        .order('criado_em', { ascending: false })
        .limit(10);

      return { alertas: data };
    }

    case 'resumo': {
      const hoje = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

      const { data: receber } = await supabase
        .from('parcelas')
        .select('valor, valor_pago')
        .eq('empresa_id', empresaId)
        .in('status', ['pendente', 'parcial'])
        .gte('data_vencimento', hoje);

      const { data: vencidas } = await supabase
        .from('parcelas')
        .select('valor, valor_pago')
        .eq('empresa_id', empresaId)
        .in('status', ['pendente', 'parcial'])
        .lt('data_vencimento', hoje);

      const { data: recebidasMes } = await supabase
        .from('pagamentos')
        .select('valor')
        .eq('empresa_id', empresaId)
        .gte('data_pagamento', inicioMes);

      return {
        a_receber: receber?.reduce((s: number, p: any) => s + (p.valor - p.valor_pago), 0) || 0,
        vencidas: vencidas?.reduce((s: number, p: any) => s + (p.valor - p.valor_pago), 0) || 0,
        recebido_mes: recebidasMes?.reduce((s: number, p: any) => s + p.valor, 0) || 0,
      };
    }

    default:
      return { error: 'Tipo não reconhecido' };
  }
}

async function buscarConhecimento(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  input: Record<string, unknown>
) {
  // Generate embedding for query
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: input.query,
    }),
  });

  const embeddingData = await embeddingResponse.json();
  const embedding = embeddingData.data[0].embedding;

  // Search vectors
  const { data } = await supabase.rpc('search_vectors', {
    query_embedding: embedding,
    p_empresa_id: empresaId,
    p_source_type: input.tipo || null,
    match_threshold: 0.7,
    match_count: (input.limit as number) || 5,
  });

  return {
    resultados: data?.map((r: any) => ({
      conteudo: r.content,
      tipo: r.source_type,
      relevancia: Math.round(r.similarity * 100),
      metadata: r.metadata,
    })),
  };
}

async function verificarCompliance(
  supabase: ReturnType<typeof createClient>,
  empresaId: string,
  input: Record<string, unknown>
) {
  const tipo = input.tipo as string;

  switch (tipo) {
    case 'anvisa': {
      if (input.registro_anvisa) {
        // Fetch from InfoSimples
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/integration-hub`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              empresa_id: empresaId,
              tipo: 'anvisa',
              identificador: input.registro_anvisa,
            }),
          }
        );
        const data = await response.json();
        return data;
      }

      if (input.produto_id) {
        const { data: produto } = await supabase
          .from('produtos')
          .select('registro_anvisa, dados_anvisa, classe_risco')
          .eq('id', input.produto_id)
          .single();

        return {
          produto_id: input.produto_id,
          registro: produto?.registro_anvisa,
          classe_risco: produto?.classe_risco,
          dados: produto?.dados_anvisa,
          status: produto?.dados_anvisa?.situacao || 'não verificado',
        };
      }

      return { error: 'Informe produto_id ou registro_anvisa' };
    }

    case 'lgpd': {
      const { data: consentimentos } = await supabase
        .from('consentimentos')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('revogado', false)
        .order('criado_em', { ascending: false })
        .limit(10);

      const { data: solicitacoes } = await supabase
        .from('lgpd_solicitacoes')
        .select('*')
        .eq('empresa_id', empresaId)
        .in('status', ['pendente', 'em_analise'])
        .limit(10);

      return {
        consentimentos_ativos: consentimentos?.length || 0,
        solicitacoes_pendentes: solicitacoes?.length || 0,
        solicitacoes: solicitacoes,
      };
    }

    case 'rastreabilidade': {
      const { data } = await supabase
        .from('rastreabilidade_opme')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('criado_em', { ascending: false })
        .limit(20);

      return {
        total_registros: data?.length || 0,
        ultimos_implantes: data?.map((r: any) => ({
          produto: r.nome_produto,
          lote: r.numero_lote,
          data: r.data_implante,
          hospital: r.hospital_nome,
          hash: r.hash_registro,
        })),
      };
    }

    default:
      return { error: 'Tipo de compliance não reconhecido' };
  }
}
