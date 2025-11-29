// ============================================================================
// ICARUS v6.0 - ALL EDGE FUNCTIONS (Supabase/Deno)
// ============================================================================

// ==================== supabase/functions/icarus-brain/index.ts ====================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.20.0';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { message, empresaId, sessionId, context } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    // Get or create session
    let session;
    if (sessionId) {
      const { data } = await supabase.from('chatbot_sessoes').select('*').eq('id', sessionId).single();
      session = data;
    }
    if (!session) {
      const { data } = await supabase.from('chatbot_sessoes').insert({ empresa_id: empresaId, contexto: context || 'geral' }).select().single();
      session = data;
    }

    // Get recent messages
    const { data: recentMessages } = await supabase.from('chatbot_mensagens').select('role, content').eq('sessao_id', session.id).order('criado_em', { ascending: false }).limit(10);
    const history = (recentMessages || []).reverse();

    // Search for relevant context using vectors
    const { data: vectors } = await supabase.rpc('search_vectors', { query_embedding: await getEmbedding(message), p_empresa_id: empresaId, match_count: 5 });
    const vectorContext = vectors?.map((v: any) => v.content).join('\n') || '';

    const systemPrompt = `Você é IcarusBrain, assistente IA do ICARUS v6.0 para gestão de OPME.
Empresa atual: ${empresaId}
Contexto: ${context || 'geral'}
${vectorContext ? `\nInformações relevantes:\n${vectorContext}` : ''}
Seja conciso, profissional e proativo. Responda em português.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [...history.map((m: any) => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    // Save messages
    await supabase.from('chatbot_mensagens').insert([
      { empresa_id: empresaId, sessao_id: session.id, role: 'user', content: message, tokens_input: response.usage.input_tokens },
      { empresa_id: empresaId, sessao_id: session.id, role: 'assistant', content: assistantMessage, tokens_output: response.usage.output_tokens, modelo: 'claude-3-5-sonnet' },
    ]);

    return new Response(JSON.stringify({ response: assistantMessage, sessionId: session.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  const data = await response.json();
  return data.data[0].embedding;
}

// ==================== supabase/functions/financial-vigilance/index.ts ====================
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { empresaId, contaBancariaId, startDate, endDate } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    // Fetch transactions
    const { data: transactions } = await supabase.from('transacoes_bancarias')
      .select('*').eq('empresa_id', empresaId).eq('conta_bancaria_id', contaBancariaId)
      .gte('data_transacao', startDate).lte('data_transacao', endDate);

    // Step 1: Categorize
    const categorizeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', max_tokens: 4096,
      system: 'Categorize transações bancárias OPME. Retorne JSON: [{id, categoria, subcategoria, score}]',
      messages: [{ role: 'user', content: JSON.stringify(transactions) }],
    });
    const categorized = JSON.parse(categorizeResponse.content[0].text);

    // Step 2: Detect anomalies
    const anomalyResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', max_tokens: 4096,
      system: 'Detecte anomalias: duplicidades, valores anômalos, padrões suspeitos. Retorne JSON: [{transacao_id, tipo, severidade, descricao, confianca}]',
      messages: [{ role: 'user', content: JSON.stringify(categorized) }],
    });
    const anomalies = JSON.parse(anomalyResponse.content[0].text);

    // Step 3: Analyze fees
    const fees = transactions.filter((t: any) => t.is_tarifa);
    const feeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', max_tokens: 2048,
      system: 'Analise tarifas bancárias. Compare com mercado. Retorne JSON: {total, por_tipo, economia_potencial, recomendacoes}',
      messages: [{ role: 'user', content: JSON.stringify(fees) }],
    });
    const feeAnalysis = JSON.parse(feeResponse.content[0].text);

    // Step 4: Generate suggestions
    const suggestionResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', max_tokens: 2048,
      system: 'Sugira melhorias financeiras: empréstimos, quitações, troca banco. JSON: [{tipo, titulo, descricao, economia_estimada, prioridade}]',
      messages: [{ role: 'user', content: JSON.stringify({ categorized, anomalies, feeAnalysis }) }],
    });
    const suggestions = JSON.parse(suggestionResponse.content[0].text);

    // Save alerts
    for (const anomaly of anomalies.filter((a: any) => a.severidade !== 'baixa')) {
      await supabase.from('alertas_financeiros').insert({
        empresa_id: empresaId, transacao_id: anomaly.transacao_id, tipo: anomaly.tipo,
        severidade: anomaly.severidade, titulo: anomaly.tipo, descricao: anomaly.descricao,
        confianca_ia: anomaly.confianca,
      });
    }

    // Save suggestions
    for (const suggestion of suggestions) {
      await supabase.from('sugestoes_financeiras').insert({
        empresa_id: empresaId, tipo: suggestion.tipo, titulo: suggestion.titulo,
        descricao: suggestion.descricao, economia_estimada: suggestion.economia_estimada,
        prioridade: suggestion.prioridade, confianca_ia: 85,
      });
    }

    return new Response(JSON.stringify({ categorized, anomalies, feeAnalysis, suggestions, totalTransactions: transactions.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// ==================== supabase/functions/integration-hub/index.ts ====================
const INFOSIMPLES_TOKEN = Deno.env.get('INFOSIMPLES_TOKEN')!;
const INFOSIMPLES_BASE = 'https://api.infosimples.com/api/v2';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, params, empresaId } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Check cache
    const cacheKey = `${action}:${JSON.stringify(params)}`;
    const { data: cached } = await supabase.from('infosimples_cache').select('dados').eq('tipo_consulta', action).eq('identificador', params.identificador || params.cnpj || params.cpf).gt('expira_em', new Date().toISOString()).single();
    if (cached) return new Response(JSON.stringify(cached.dados), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let endpoint = '', body: any = { token: INFOSIMPLES_TOKEN };

    switch (action) {
      case 'cnpj': endpoint = '/consultas/receita-federal/cnpj'; body.cnpj = params.cnpj; break;
      case 'cpf': endpoint = '/consultas/receita-federal/cpf'; body.cpf = params.cpf; body.data_nascimento = params.data_nascimento; break;
      case 'crm': endpoint = '/consultas/cfm/crm'; body.crm = params.crm; body.uf = params.uf; break;
      case 'anvisa_produto': endpoint = '/consultas/anvisa/produto'; body.registro = params.registro; break;
      case 'anvisa_empresa': endpoint = '/consultas/anvisa/empresa'; body.cnpj = params.cnpj; break;
      case 'cep': endpoint = '/consultas/correios/cep'; body.cep = params.cep; break;
      case 'nfe_emitir': endpoint = '/nfe/emitir'; body = { ...body, ...params }; break;
      case 'nfe_consultar': endpoint = '/nfe/consultar'; body.chave = params.chave; break;
      default: throw new Error(`Action ${action} not supported`);
    }

    const startTime = Date.now();
    const response = await fetch(`${INFOSIMPLES_BASE}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    const elapsed = Date.now() - startTime;

    // Log request
    await supabase.from('infosimples_log').insert({ empresa_id: empresaId, endpoint, metodo: 'POST', parametros: params, status_code: response.status, resposta: data, tempo_ms: elapsed, creditos_consumidos: data.creditos || 0 });

    // Cache if success
    if (data.code === 200) {
      const ttlDays = action.includes('anvisa') ? 30 : action === 'cnpj' || action === 'cpf' ? 7 : 1;
      await supabase.from('infosimples_cache').upsert({ tipo_consulta: action, identificador: params.identificador || params.cnpj || params.cpf || params.registro, dados: data.data, expira_em: new Date(Date.now() + ttlDays * 86400000).toISOString() });
    }

    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// ==================== supabase/functions/pluggy-webhook/index.ts ====================
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const signature = req.headers.get('x-pluggy-signature');
    const body = await req.text();
    // TODO: Verify signature with PLUGGY_WEBHOOK_SECRET
    
    const event = JSON.parse(body);
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    switch (event.event) {
      case 'item/updated':
        const itemId = event.data.id;
        const { data: conta } = await supabase.from('contas_bancarias').select('*').eq('pluggy_item_id', itemId).single();
        if (conta) {
          // Fetch transactions from Pluggy
          const pluggyResponse = await fetch(`https://api.pluggy.ai/transactions?accountId=${conta.pluggy_conta_id}`, {
            headers: { 'X-API-KEY': Deno.env.get('PLUGGY_CLIENT_ID')!, 'Authorization': `Bearer ${Deno.env.get('PLUGGY_ACCESS_TOKEN')}` },
          });
          const { results: transactions } = await pluggyResponse.json();
          
          // Upsert transactions
          for (const t of transactions) {
            await supabase.from('transacoes_bancarias').upsert({
              empresa_id: conta.empresa_id, conta_bancaria_id: conta.id, pluggy_transacao_id: t.id,
              data_transacao: t.date, descricao: t.description, descricao_original: t.descriptionRaw,
              valor: Math.abs(t.amount), tipo: t.amount > 0 ? 'credito' : 'debito',
              categoria: t.category, pluggy_dados_extras: t,
            }, { onConflict: 'pluggy_transacao_id' });
          }
          
          // Update account balance
          await supabase.from('contas_bancarias').update({ saldo_atual: event.data.balance, saldo_disponivel: event.data.availableBalance, pluggy_ultima_sincronizacao: new Date().toISOString(), pluggy_situacao: 'connected' }).eq('id', conta.id);
        }
        break;
        
      case 'item/error':
        await supabase.from('contas_bancarias').update({ pluggy_situacao: 'error', pluggy_erro: event.data.error?.message }).eq('pluggy_item_id', event.data.id);
        break;
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// ==================== supabase/functions/rastreabilidade/index.ts ====================
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, empresaId, ...params } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    if (action === 'registrar') {
      const { cirurgiaId, materialId, loteId, pacienteIniciais, medicoId, hospitalId } = params;
      
      // Get all required data
      const [{ data: cirurgia }, { data: material }, { data: lote }, { data: medico }, { data: hospital }, { data: produto }] = await Promise.all([
        supabase.from('cirurgias').select('*').eq('id', cirurgiaId).single(),
        supabase.from('cirurgia_materiais').select('*').eq('id', materialId).single(),
        supabase.from('lotes').select('*').eq('id', loteId).single(),
        supabase.from('medicos').select('*').eq('id', medicoId).single(),
        supabase.from('hospitais').select('*').eq('id', hospitalId).single(),
        supabase.from('produtos').select('*').eq('id', material?.produto_id).single(),
      ]);

      // Insert rastreabilidade (immutable)
      const { data: rastreabilidade, error } = await supabase.from('rastreabilidade_opme').insert({
        empresa_id: empresaId, cirurgia_id: cirurgiaId, cirurgia_material_id: materialId, produto_id: produto.id, lote_id: loteId,
        numero_lote: lote.numero_lote, numero_serie: lote.numero_serie, registro_anvisa: produto.registro_anvisa,
        nome_produto: produto.nome, fabricante: produto.fabricante_nome || 'N/A',
        data_implante: cirurgia.data_realizacao || new Date().toISOString().split('T')[0], local_implante: hospital.nome,
        paciente_iniciais: pacienteIniciais, medico_nome: medico.nome, medico_crm: medico.crm, medico_crm_uf: medico.crm_uf,
        hospital_nome: hospital.nome, hospital_cnes: hospital.cnes,
      }).select().single();

      if (error) throw error;

      // Mine blockchain audit log
      await supabase.rpc('mine_audit_block', {
        p_empresa_id: empresaId, p_usuario_id: null, p_tabela: 'rastreabilidade_opme',
        p_registro_id: rastreabilidade.id, p_acao: 'INSERT', p_dados_depois: rastreabilidade,
      });

      return new Response(JSON.stringify(rastreabilidade), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'consultar') {
      const { lote, registro, dataInicio, dataFim } = params;
      let query = supabase.from('rastreabilidade_opme').select('*').eq('empresa_id', empresaId);
      if (lote) query = query.eq('numero_lote', lote);
      if (registro) query = query.eq('registro_anvisa', registro);
      if (dataInicio) query = query.gte('data_implante', dataInicio);
      if (dataFim) query = query.lte('data_implante', dataFim);
      const { data } = await query.order('data_implante', { ascending: false });
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error(`Action ${action} not supported`);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// ==================== supabase/functions/audit-blockchain/index.ts ====================
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, empresaId } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    if (action === 'validate') {
      const { data: result } = await supabase.rpc('validate_blockchain', { p_empresa_id: empresaId });
      return new Response(JSON.stringify(result[0]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'history') {
      const { tabela, registroId, limit = 50 } = await req.json();
      let query = supabase.from('audit_log_blockchain').select('*').eq('empresa_id', empresaId);
      if (tabela) query = query.eq('tabela', tabela);
      if (registroId) query = query.eq('registro_id', registroId);
      const { data } = await query.order('block_index', { ascending: false }).limit(limit);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error(`Action ${action} not supported`);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// ==================== supabase/functions/lgpd/index.ts ====================
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, empresaId, ...params } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    switch (action) {
      case 'registrar_consentimento':
        const { data: consentimento } = await supabase.from('consentimentos').insert({
          empresa_id: empresaId, tipo_titular: params.tipoTitular, titular_id: params.titularId,
          titular_documento: params.documento, titular_nome: params.nome,
          finalidade: params.finalidade, dados_coletados: params.dadosColetados,
          aceito: params.aceito, documento_url: params.documentoUrl,
          validade_dias: params.validadeDias, expira_em: params.validadeDias ? new Date(Date.now() + params.validadeDias * 86400000).toISOString().split('T')[0] : null,
        }).select().single();
        return new Response(JSON.stringify(consentimento), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'revogar_consentimento':
        await supabase.from('consentimentos').update({ revogado: true, data_revogacao: new Date().toISOString(), motivo_revogacao: params.motivo }).eq('id', params.consentimentoId);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'criar_solicitacao':
        const prazo = new Date(); prazo.setDate(prazo.getDate() + 15); // 15 dias LGPD
        const { data: solicitacao } = await supabase.from('lgpd_solicitacoes').insert({
          empresa_id: empresaId, tipo: params.tipo, solicitante_nome: params.nome,
          solicitante_documento: params.documento, solicitante_email: params.email,
          descricao: params.descricao, prazo_resposta: prazo.toISOString().split('T')[0],
        }).select().single();
        return new Response(JSON.stringify(solicitacao), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'exportar_dados':
        // Collect all data for the titular
        const documento = params.documento;
        const [clientes, medicos, consentimentos] = await Promise.all([
          supabase.from('clientes').select('*').eq('empresa_id', empresaId).eq('cpf_cnpj', documento),
          supabase.from('medicos').select('*').eq('empresa_id', empresaId).eq('crm', documento),
          supabase.from('consentimentos').select('*').eq('empresa_id', empresaId).eq('titular_documento', documento),
        ]);
        const exportData = { clientes: clientes.data, medicos: medicos.data, consentimentos: consentimentos.data, exportado_em: new Date().toISOString() };
        return new Response(JSON.stringify(exportData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'anonimizar':
        await supabase.rpc('anonimizar_dados', { p_tabela: params.tabela, p_registro_id: params.registroId, p_campos: params.campos });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error(`Action ${action} not supported`);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
