// ============================================================================
// ICARUS v6.0 - Edge Function: Financial Vigilance Agent
// Supabase Edge Functions (Deno)
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0';

// ============================================================================
// TYPES
// ============================================================================

interface Transaction {
  id: string;
  conta_bancaria_id: string;
  data_transacao: string;
  descricao: string;
  descricao_original: string;
  valor: number;
  tipo: 'credito' | 'debito';
  categoria?: string;
  is_tarifa: boolean;
  pluggy_metadata?: Record<string, unknown>;
}

interface AuditResult {
  transacao_id: string;
  status: 'aprovado' | 'alerta' | 'irregularidade' | 'investigar';
  score: number;
  flags: string[];
  notas: string;
  tarifa_analise?: {
    tipo: string;
    valor_mercado: number;
    acima_mercado: boolean;
    justificada: boolean;
  };
}

interface AnalysisRequest {
  empresa_id: string;
  conta_bancaria_id?: string;
  data_inicio?: string;
  data_fim?: string;
  analise_tipo: 'completa' | 'tarifas' | 'anomalias' | 'categorias';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TARIFAS_MERCADO = {
  ted: { min: 8, max: 15, media: 10 },
  doc: { min: 3, max: 8, media: 5 },
  pix: { min: 0, max: 2, media: 0 },
  manutencao: { min: 30, max: 100, media: 50 },
  pacote: { min: 50, max: 200, media: 100 },
  saque: { min: 2, max: 10, media: 5 },
  cartao: { min: 15, max: 50, media: 25 },
};

const ANOMALY_PATTERNS = [
  { pattern: /duplica|repet/i, type: 'duplicidade', severity: 'alta' },
  { pattern: /estorno.*estorno/i, type: 'estorno_duplo', severity: 'critica' },
  { pattern: /ajuste|correção/i, type: 'ajuste_manual', severity: 'media' },
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

    // Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Anthropic client
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    });

    // Parse request
    const body: AnalysisRequest = await req.json();
    const { empresa_id, conta_bancaria_id, data_inicio, data_fim, analise_tipo } = body;

    // Fetch transactions
    let query = supabase
      .from('transacoes_bancarias')
      .select('*')
      .eq('empresa_id', empresa_id)
      .order('data_transacao', { ascending: false });

    if (conta_bancaria_id) {
      query = query.eq('conta_bancaria_id', conta_bancaria_id);
    }
    if (data_inicio) {
      query = query.gte('data_transacao', data_inicio);
    }
    if (data_fim) {
      query = query.lte('data_transacao', data_fim);
    }

    const { data: transactions, error: fetchError } = await query.limit(500);
    if (fetchError) throw fetchError;

    // Process based on analysis type
    let results: AuditResult[] = [];
    let summary: Record<string, unknown> = {};

    switch (analise_tipo) {
      case 'tarifas':
        results = await analyzeFees(transactions as Transaction[], anthropic);
        summary = calculateFeeSummary(results, transactions as Transaction[]);
        break;

      case 'anomalias':
        results = await detectAnomalies(transactions as Transaction[], anthropic);
        summary = calculateAnomalySummary(results);
        break;

      case 'categorias':
        results = await categorizeTransactions(transactions as Transaction[], anthropic);
        summary = calculateCategorySummary(results, transactions as Transaction[]);
        break;

      case 'completa':
      default:
        // Run all analyses
        const [feeResults, anomalyResults, categoryResults] = await Promise.all([
          analyzeFees(transactions as Transaction[], anthropic),
          detectAnomalies(transactions as Transaction[], anthropic),
          categorizeTransactions(transactions as Transaction[], anthropic),
        ]);

        // Merge results
        results = mergeResults(feeResults, anomalyResults, categoryResults);
        summary = {
          tarifas: calculateFeeSummary(feeResults, transactions as Transaction[]),
          anomalias: calculateAnomalySummary(anomalyResults),
          categorias: calculateCategorySummary(categoryResults, transactions as Transaction[]),
          total_transacoes: transactions?.length || 0,
          periodo: { inicio: data_inicio, fim: data_fim },
        };
        break;
    }

    // Save results to database
    for (const result of results) {
      await supabase
        .from('transacoes_bancarias')
        .update({
          auditoria_status: result.status,
          auditoria_score: result.score,
          auditoria_flags: result.flags,
          auditoria_notas: result.notas,
          auditoria_processado_em: new Date().toISOString(),
        })
        .eq('id', result.transacao_id);
    }

    // Generate alerts for critical items
    const criticalResults = results.filter(
      (r) => r.status === 'irregularidade' || r.status === 'investigar'
    );

    for (const critical of criticalResults) {
      await supabase.from('alertas_financeiros').insert({
        empresa_id,
        transacao_id: critical.transacao_id,
        conta_bancaria_id,
        tipo: critical.flags[0] || 'padrao_irregular',
        severidade: critical.status === 'irregularidade' ? 'critica' : 'alta',
        titulo: `Alerta: ${critical.flags[0] || 'Transação suspeita'}`,
        descricao: critical.notas,
        valor_envolvido: transactions?.find((t: Transaction) => t.id === critical.transacao_id)?.valor,
        confianca_ia: critical.score,
        evidencias: { flags: critical.flags, analysis: critical.tarifa_analise },
        acao_recomendada: 'Revisar transação manualmente',
      });
    }

    // Create audit block
    await supabase.rpc('mine_audit_block', {
      p_empresa_id: empresa_id,
      p_usuario_id: null,
      p_tabela: 'transacoes_bancarias',
      p_registro_id: '00000000-0000-0000-0000-000000000000',
      p_acao: 'SELECT',
      p_dados_antes: null,
      p_dados_depois: { analise_tipo, total_analisado: transactions?.length },
      p_difficulty: 2,
    });

    return new Response(
      JSON.stringify({
        success: true,
        analise_tipo,
        total_analisado: transactions?.length || 0,
        resultados: results.length,
        alertas_criados: criticalResults.length,
        summary,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Financial Vigilance Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

async function analyzeFees(
  transactions: Transaction[],
  anthropic: Anthropic
): Promise<AuditResult[]> {
  const feeTransactions = transactions.filter(
    (t) => t.is_tarifa || /tarifa|taxa|mensalidade|anuidade/i.test(t.descricao)
  );

  if (feeTransactions.length === 0) return [];

  const prompt = `Analise estas tarifas bancárias e identifique cobranças indevidas ou acima do mercado.

Tarifas de referência do mercado brasileiro:
- TED: R$ 8-15
- DOC: R$ 3-8
- PIX: Gratuito ou até R$ 2
- Manutenção de conta: R$ 30-100/mês
- Pacote de serviços: R$ 50-200/mês

Transações para analisar:
${JSON.stringify(feeTransactions.slice(0, 50), null, 2)}

Para cada transação, retorne JSON:
{
  "transacao_id": "id",
  "tipo_tarifa": "ted|doc|pix|manutencao|pacote|outros",
  "valor_cobrado": number,
  "valor_mercado": number,
  "acima_mercado": boolean,
  "justificada": boolean,
  "motivo": "explicação"
}

Responda APENAS com array JSON válido.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') return [];

  try {
    const analysis = JSON.parse(content.text);
    return analysis.map((item: any) => ({
      transacao_id: item.transacao_id,
      status: item.acima_mercado && !item.justificada ? 'alerta' : 'aprovado',
      score: item.justificada ? 90 : item.acima_mercado ? 40 : 80,
      flags: item.acima_mercado ? ['tarifa_acima_mercado'] : [],
      notas: item.motivo,
      tarifa_analise: {
        tipo: item.tipo_tarifa,
        valor_mercado: item.valor_mercado,
        acima_mercado: item.acima_mercado,
        justificada: item.justificada,
      },
    }));
  } catch {
    return [];
  }
}

async function detectAnomalies(
  transactions: Transaction[],
  anthropic: Anthropic
): Promise<AuditResult[]> {
  const prompt = `Analise estas transações bancárias buscando anomalias e irregularidades.

Procure por:
1. Duplicidades (mesma descrição/valor em período curto)
2. Valores muito diferentes do padrão
3. Horários suspeitos
4. Padrões circulares (saída e entrada similares)
5. Fragmentação (muitas pequenas transações sequenciais)
6. Fornecedores desconhecidos

Transações:
${JSON.stringify(transactions.slice(0, 100), null, 2)}

Para cada anomalia, retorne JSON:
{
  "transacao_id": "id",
  "tipo_anomalia": "duplicidade|valor_anomalo|horario_suspeito|padrao_circular|fragmentacao|fornecedor_desconhecido",
  "severidade": "baixa|media|alta|critica",
  "descricao": "explicação detalhada",
  "confianca": 0-100,
  "transacoes_relacionadas": ["ids"]
}

Responda APENAS com array JSON válido. Array vazio se não houver anomalias.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') return [];

  try {
    const anomalies = JSON.parse(content.text);
    return anomalies.map((item: any) => ({
      transacao_id: item.transacao_id,
      status:
        item.severidade === 'critica'
          ? 'irregularidade'
          : item.severidade === 'alta'
          ? 'investigar'
          : 'alerta',
      score: item.confianca,
      flags: [item.tipo_anomalia, ...(item.transacoes_relacionadas || []).map(() => 'relacionada')],
      notas: item.descricao,
    }));
  } catch {
    return [];
  }
}

async function categorizeTransactions(
  transactions: Transaction[],
  anthropic: Anthropic
): Promise<AuditResult[]> {
  const uncategorized = transactions.filter((t) => !t.categoria);
  if (uncategorized.length === 0) return [];

  const prompt = `Categorize estas transações bancárias de uma empresa de OPME (Órteses, Próteses e Materiais Especiais).

Categorias disponíveis:
- RECEITA_OPERACIONAL: Vendas, recebimentos de clientes
- CUSTO_MERCADORIA: Compras de OPME, materiais médicos
- DESPESA_OPERACIONAL: Salários, aluguel, serviços
- DESPESA_FINANCEIRA: Juros, tarifas, IOF
- INVESTIMENTO: Equipamentos, tecnologia
- TRIBUTARIO: Impostos, taxas
- OUTROS: Não classificável

Transações:
${JSON.stringify(uncategorized.slice(0, 100), null, 2)}

Para cada transação, retorne:
{
  "transacao_id": "id",
  "categoria": "CATEGORIA",
  "subcategoria": "mais específico",
  "confianca": 0-100
}

Responda APENAS com array JSON válido.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') return [];

  try {
    const categories = JSON.parse(content.text);
    return categories.map((item: any) => ({
      transacao_id: item.transacao_id,
      status: 'aprovado',
      score: item.confianca,
      flags: [`categoria:${item.categoria}`, `sub:${item.subcategoria}`],
      notas: `Categoria: ${item.categoria} / ${item.subcategoria}`,
    }));
  } catch {
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mergeResults(...resultArrays: AuditResult[][]): AuditResult[] {
  const merged = new Map<string, AuditResult>();

  for (const results of resultArrays) {
    for (const result of results) {
      const existing = merged.get(result.transacao_id);
      if (existing) {
        // Merge flags and keep worst status
        existing.flags = [...new Set([...existing.flags, ...result.flags])];
        existing.notas += ` | ${result.notas}`;
        if (
          result.status === 'irregularidade' ||
          (result.status === 'investigar' && existing.status !== 'irregularidade')
        ) {
          existing.status = result.status;
        }
        existing.score = Math.min(existing.score, result.score);
      } else {
        merged.set(result.transacao_id, { ...result });
      }
    }
  }

  return Array.from(merged.values());
}

function calculateFeeSummary(results: AuditResult[], transactions: Transaction[]) {
  const feeTransactions = transactions.filter((t) => t.is_tarifa);
  const totalFees = feeTransactions.reduce((sum, t) => sum + Math.abs(t.valor), 0);
  const aboveMarket = results.filter((r) => r.tarifa_analise?.acima_mercado);
  const potentialSavings = aboveMarket.reduce((sum, r) => {
    const t = transactions.find((t) => t.id === r.transacao_id);
    const marketValue = r.tarifa_analise?.valor_mercado || 0;
    return sum + (t ? Math.abs(t.valor) - marketValue : 0);
  }, 0);

  return {
    total_tarifas: totalFees,
    quantidade: feeTransactions.length,
    acima_mercado: aboveMarket.length,
    economia_potencial: potentialSavings,
  };
}

function calculateAnomalySummary(results: AuditResult[]) {
  const byStatus = results.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total_anomalias: results.length,
    por_status: byStatus,
    criticas: results.filter((r) => r.status === 'irregularidade').length,
    investigar: results.filter((r) => r.status === 'investigar').length,
  };
}

function calculateCategorySummary(results: AuditResult[], transactions: Transaction[]) {
  const categorized = new Map<string, { count: number; total: number }>();

  for (const result of results) {
    const categoryFlag = result.flags.find((f) => f.startsWith('categoria:'));
    if (categoryFlag) {
      const category = categoryFlag.replace('categoria:', '');
      const transaction = transactions.find((t) => t.id === result.transacao_id);
      const existing = categorized.get(category) || { count: 0, total: 0 };
      existing.count++;
      existing.total += transaction ? Math.abs(transaction.valor) : 0;
      categorized.set(category, existing);
    }
  }

  return Object.fromEntries(categorized);
}
