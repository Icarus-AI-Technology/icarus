/**
 * IcarusBrain Edge Function - Processamento de IA com Background Tasks
 * 
 * Esta função processa análises de IA em background, permitindo:
 * - Resposta imediata ao cliente
 * - Processamento assíncrono de análises pesadas
 * - Notificação via webhook quando completo
 * 
 * Tipos de análise suportados:
 * - demanda: Previsão de demanda de produtos
 * - inadimplencia: Score de risco de inadimplência
 * - churn: Previsão de churn de clientes
 * - recomendacao: Recomendação de produtos
 * - estoque: Otimização de estoque
 * - precificacao: Precificação dinâmica
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuração CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Tipos de análise
type AnalysisType = 
  | 'demanda'
  | 'inadimplencia' 
  | 'churn'
  | 'recomendacao'
  | 'estoque'
  | 'precificacao'
  | 'sentiment'
  | 'anomalia';

interface AnalysisRequest {
  analysisType: AnalysisType;
  data: Record<string, unknown>;
  userId?: string;
  webhookUrl?: string;
}

interface AnalysisResult {
  jobId: string;
  analysisType: AnalysisType;
  status: 'processing' | 'completed' | 'error';
  result?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// Prompts de análise por tipo
const analysisPrompts: Record<AnalysisType, string> = {
  demanda: `Você é um especialista em análise de demanda para produtos médicos OPME.
Analise os dados fornecidos e forneça:
1. Previsão de demanda para os próximos 30 dias
2. Tendências identificadas
3. Fatores que podem afetar a demanda
4. Recomendações de estoque
Responda em JSON estruturado.`,

  inadimplencia: `Você é um especialista em análise de risco de crédito para o setor médico.
Analise os dados do cliente e forneça:
1. Score de risco (0-100, onde 100 é maior risco)
2. Fatores de risco identificados
3. Histórico de pagamentos
4. Recomendação de limite de crédito
Responda em JSON estruturado.`,

  churn: `Você é um especialista em retenção de clientes B2B do setor médico.
Analise os dados do cliente e forneça:
1. Probabilidade de churn (0-100%)
2. Sinais de alerta identificados
3. Fatores de engajamento
4. Ações recomendadas para retenção
Responda em JSON estruturado.`,

  recomendacao: `Você é um especialista em recomendação de produtos médicos OPME.
Analise o histórico do cliente e forneça:
1. Produtos recomendados com justificativa
2. Cross-sell opportunities
3. Up-sell opportunities
4. Produtos complementares
Responda em JSON estruturado.`,

  estoque: `Você é um especialista em gestão de estoque para distribuidoras de OPME.
Analise os dados de estoque e forneça:
1. Produtos com baixo estoque crítico
2. Ponto de reposição recomendado
3. Produtos com excesso de estoque
4. Otimização de giro
Responda em JSON estruturado.`,

  precificacao: `Você é um especialista em precificação dinâmica para o setor médico.
Analise os dados de mercado e forneça:
1. Preço sugerido com margem
2. Análise da concorrência
3. Elasticidade de preço estimada
4. Estratégia de precificação
Responda em JSON estruturado.`,

  sentiment: `Você é um especialista em análise de sentimento de clientes do setor médico.
Analise os feedbacks e forneça:
1. Score de sentimento (-1 a 1)
2. Temas principais identificados
3. Pontos de melhoria
4. Pontos fortes
Responda em JSON estruturado.`,

  anomalia: `Você é um especialista em detecção de anomalias em operações médicas.
Analise os dados e identifique:
1. Anomalias detectadas com severidade
2. Possíveis causas
3. Impacto estimado
4. Ações corretivas recomendadas
Responda em JSON estruturado.`,
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar método
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request
    const { analysisType, data, userId, webhookUrl } = await req.json() as AnalysisRequest;

    // Validar tipo de análise
    if (!analysisType || !analysisPrompts[analysisType]) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid analysis type',
          validTypes: Object.keys(analysisPrompts),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar dados
    if (!data || Object.keys(data).length === 0) {
      return new Response(
        JSON.stringify({ error: 'Data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar job ID
    const jobId = crypto.randomUUID();
    const startedAt = new Date().toISOString();

    // Responder imediatamente com jobId
    const immediateResponse = new Response(
      JSON.stringify({
        jobId,
        analysisType,
        status: 'processing',
        message: 'Análise iniciada em background. Consulte o resultado pelo jobId.',
        startedAt,
      } satisfies Partial<AnalysisResult>),
      { 
        status: 202, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

    // Processar em background
    (async () => {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      let result: Record<string, unknown>;
      let error: string | undefined;

      try {
        // Chamar OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: analysisPrompts[analysisType],
              },
              {
                role: 'user',
                content: `Analise os seguintes dados:\n\n${JSON.stringify(data, null, 2)}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
        }

        const openaiData = await openaiResponse.json();
        const content = openaiData.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No response from OpenAI');
        }

        result = JSON.parse(content);

      } catch (e) {
        error = e instanceof Error ? e.message : 'Unknown error';
        result = { error };
        console.error('Analysis error:', error);
      }

      const completedAt = new Date().toISOString();

      // Salvar resultado no banco
      const { error: dbError } = await supabase
        .from('icarus_brain_results')
        .upsert({
          job_id: jobId,
          analysis_type: analysisType,
          input_data: data,
          result: result,
          error: error,
          user_id: userId,
          status: error ? 'error' : 'completed',
          started_at: startedAt,
          completed_at: completedAt,
        });

      if (dbError) {
        console.error('Database error:', dbError);
      }

      // Notificar via webhook se fornecido
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId,
              analysisType,
              status: error ? 'error' : 'completed',
              result: error ? undefined : result,
              error,
              completedAt,
            }),
          });
        } catch (webhookError) {
          console.error('Webhook notification failed:', webhookError);
        }
      }

      console.log(`Analysis ${jobId} completed:`, { analysisType, status: error ? 'error' : 'completed' });
    })();

    return immediateResponse;

  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Request error:', error);

    return new Response(
      JSON.stringify({ error }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

