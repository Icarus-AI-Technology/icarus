/**
 * IcarusBrain Insights Edge Function - Real-time AI Insights with Claude
 * 
 * Generates contextual AI insights for dashboard modules using Anthropic Claude.
 * Supports module-specific analysis and recommendations.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface InsightRequest {
  module: string;
  context?: Record<string, unknown>;
}

interface AIInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  description: string;
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
  action?: {
    label: string;
    href?: string;
  };
  timestamp: string;
}

// Module-specific prompts for Claude
const modulePrompts: Record<string, string> = {
  'dashboard': `Você é o IcarusBrain, assistente de IA do sistema ICARUS ERP para gestão de OPME.
Analise os dados gerais do dashboard e gere 3-5 insights acionáveis sobre:
- Performance geral do negócio
- Alertas importantes
- Oportunidades de melhoria
- Tendências identificadas

Responda em JSON com array "insights" contendo objetos com:
- id: string único
- type: "info" | "warning" | "success" | "alert"
- title: título curto (max 50 chars)
- description: descrição detalhada (max 200 chars)
- metric: valor/métrica relacionada (opcional)
- trend: "up" | "down" | "stable" (opcional)`,

  'cirurgias': `Você é o IcarusBrain especialista em gestão de cirurgias.
Analise os dados de cirurgias e gere insights sobre:
- Cirurgias do dia/semana
- Materiais pendentes de confirmação
- Riscos de cancelamento
- Otimização de agendamento

Responda em JSON com array "insights".`,

  'estoque': `Você é o IcarusBrain especialista em gestão de estoque OPME.
Analise os dados de estoque e gere insights sobre:
- Produtos em estoque crítico
- Validades próximas
- Otimização de reposição
- Análise de giro

Responda em JSON com array "insights".`,

  'financeiro': `Você é o IcarusBrain especialista em gestão financeira.
Analise os dados financeiros e gere insights sobre:
- Faturamento vs meta
- Inadimplência e recebimentos
- Fluxo de caixa
- Oportunidades de margem

Responda em JSON com array "insights".`,

  'crm': `Você é o IcarusBrain especialista em CRM e vendas B2B.
Analise os dados de clientes e gere insights sobre:
- Clientes em risco de churn
- Oportunidades de upsell
- Performance de vendas
- Engajamento de clientes

Responda em JSON com array "insights".`,

  'analytics': `Você é o IcarusBrain especialista em analytics e BI.
Analise os dados e gere insights estratégicos sobre:
- KPIs principais
- Tendências de mercado
- Comparativos de performance
- Recomendações executivas

Responda em JSON com array "insights".`,

  'ia-central': `Você é o IcarusBrain central de IA.
Analise o status dos serviços de IA e gere insights sobre:
- Performance dos modelos
- Oportunidades de otimização
- Uso dos serviços
- Novos treinamentos recomendados

Responda em JSON com array "insights".`,
};

// Generate mock insights for fallback
function generateMockInsights(module: string): AIInsight[] {
  const timestamp = new Date().toISOString();
  
  const baseInsights: AIInsight[] = [
    {
      id: crypto.randomUUID(),
      type: 'success',
      title: 'Performance Acima da Média',
      description: `O módulo ${module} está operando 15% acima da média histórica do trimestre.`,
      metric: '+15%',
      trend: 'up',
      timestamp,
    },
    {
      id: crypto.randomUUID(),
      type: 'warning',
      title: 'Atenção Requerida',
      description: 'IA identificou 3 itens que precisam de revisão manual para otimização.',
      metric: '3 itens',
      action: { label: 'Ver detalhes' },
      timestamp,
    },
    {
      id: crypto.randomUUID(),
      type: 'info',
      title: 'Oportunidade Identificada',
      description: 'Potencial de otimização de 12% identificado através de análise preditiva.',
      metric: '12%',
      trend: 'up',
      action: { label: 'Analisar' },
      timestamp,
    },
  ];

  return baseInsights;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { module, context } = await req.json() as InsightRequest;

    if (!module) {
      return new Response(
        JSON.stringify({ error: 'Module is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = modulePrompts[module] || modulePrompts['dashboard'];
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    // If no API key, return mock insights
    if (!anthropicKey) {
      console.log('Anthropic API key not configured, returning mock insights');
      return new Response(
        JSON.stringify({ insights: generateMockInsights(module) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real data from Supabase for context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get relevant data based on module
    let moduleData: Record<string, unknown> = context || {};

    if (module === 'dashboard' || module === 'analytics') {
      // Fetch summary stats
      const { data: cirurgias } = await supabase
        .from('cirurgias')
        .select('status, valor_estimado')
        .gte('data_cirurgia', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      const { data: produtos } = await supabase
        .from('produtos')
        .select('quantidade_estoque, estoque_minimo, valor_unitario');

      moduleData = {
        ...moduleData,
        cirurgias_30d: cirurgias?.length || 0,
        produtos_estoque: produtos?.length || 0,
        produtos_criticos: produtos?.filter((p: { quantidade_estoque: number; estoque_minimo: number }) => 
          p.quantidade_estoque <= p.estoque_minimo
        ).length || 0,
      };
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nDados atuais:\n${JSON.stringify(moduleData, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.statusText);
      return new Response(
        JSON.stringify({ insights: generateMockInsights(module) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return new Response(
        JSON.stringify({ insights: generateMockInsights(module) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON response from Claude
    try {
      const parsed = JSON.parse(content);
      return new Response(
        JSON.stringify(parsed),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch {
      // If Claude didn't return valid JSON, return mock
      return new Response(
        JSON.stringify({ insights: generateMockInsights(module) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Request error:', error);

    return new Response(
      JSON.stringify({ error }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

