// ============================================================================
// ICARUS v6.0 - LangChain + LangGraph Configuration
// AI Orchestration with Claude 3.5 Sonnet + GPT-4o
// ============================================================================

import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// ============================================================================
// LLM CONFIGURATION
// ============================================================================

// Claude 3.5 Sonnet - Primary LLM
export const claudeSonnet = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.3,
  maxTokens: 4096,
});

// GPT-4o - Secondary LLM (for specific tasks)
export const gpt4o = new ChatOpenAI({
  modelName: 'gpt-4o',
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.3,
  maxTokens: 4096,
});

// Embeddings
export const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// SUPABASE VECTOR STORE
// ============================================================================

export function createVectorStore(supabaseClient: ReturnType<typeof createClient>) {
  return new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'ml_vectors',
    queryName: 'search_vectors',
  });
}

// ============================================================================
// LANGGRAPH - FINANCIAL AUDIT WORKFLOW
// ============================================================================

// State interface
interface FinancialAuditState {
  transactions: Transaction[];
  categorized: CategorizedTransaction[];
  anomalies: Anomaly[];
  fees: FeeAnalysis;
  suggestions: Suggestion[];
  report: string;
  messages: BaseMessage[];
}

interface Transaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'credito' | 'debito';
}

interface CategorizedTransaction extends Transaction {
  categoria: string;
  subcategoria: string;
  score: number;
}

interface Anomaly {
  transacao_id: string;
  tipo: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  descricao: string;
  confianca: number;
}

interface FeeAnalysis {
  total: number;
  por_tipo: Record<string, number>;
  economia_potencial: number;
  recomendacoes: string[];
}

interface Suggestion {
  tipo: string;
  titulo: string;
  descricao: string;
  economia_estimada: number;
  prioridade: 'baixa' | 'media' | 'alta';
}

// System prompts
const CATEGORIZE_PROMPT = `Você é um especialista em categorização de transações bancárias para empresas de OPME (Órteses, Próteses e Materiais Especiais).

Analise cada transação e retorne um JSON com a categorização:

Categorias principais:
- RECEITA_OPERACIONAL: Vendas de produtos, serviços médicos
- CUSTO_MERCADORIA: Compra de OPME, materiais
- DESPESA_OPERACIONAL: Salários, aluguel, utilities
- DESPESA_FINANCEIRA: Juros, tarifas bancárias, IOF
- INVESTIMENTO: Equipamentos, tecnologia
- TRIBUTARIO: Impostos, taxas governamentais
- OUTROS: Não classificável

Para cada transação, forneça:
- categoria: uma das categorias acima
- subcategoria: mais específico
- score: 0-100 (confiança na classificação)

Responda APENAS com JSON válido, sem markdown.`;

const ANOMALY_PROMPT = `Você é um detetive financeiro especializado em fraudes corporativas e irregularidades.

Analise as transações buscando:
1. Duplicidades (mesma descrição/valor em curto período)
2. Valores anômalos (fora do padrão histórico)
3. Fornecedores desconhecidos ou suspeitos
4. Horários atípicos (madrugada, fins de semana)
5. Padrões circulares (dinheiro saindo e voltando)
6. Fragmentação (várias pequenas transações em sequência)

Para cada anomalia detectada:
- tipo: tipo da anomalia
- severidade: baixa/media/alta/critica
- descricao: explicação detalhada
- confianca: 0-100

Responda APENAS com JSON válido.`;

const FEE_ANALYSIS_PROMPT = `Você é um especialista em tarifas bancárias do mercado brasileiro.

Analise as tarifas identificadas e compare com valores de mercado:
- TED: R$ 8-15 (mercado médio)
- DOC: R$ 3-8
- PIX: Gratuito para PJ na maioria dos bancos
- Manutenção de conta: R$ 30-100/mês
- Pacote de serviços: R$ 50-200/mês

Para cada tipo de tarifa:
- Identifique se está acima do mercado
- Calcule economia potencial
- Sugira alternativas (outros bancos, negociação)

Responda com JSON incluindo total, por_tipo, economia_potencial, recomendacoes.`;

const SUGGESTION_PROMPT = `Você é um consultor financeiro especializado em empresas de OPME.

Com base na análise completa (transações, anomalias, tarifas), sugira:
1. Empréstimos ou linhas de crédito mais vantajosas
2. Quitações antecipadas com desconto
3. Renegociações de contratos
4. Troca de banco para reduzir tarifas
5. Investimentos para capital ocioso
6. Redução de custos operacionais

Para cada sugestão:
- tipo: categoria da sugestão
- titulo: resumo
- descricao: detalhamento
- economia_estimada: valor em R$
- prioridade: baixa/media/alta

Responda APENAS com JSON válido.`;

// Graph nodes
async function categorizeTransactions(
  state: FinancialAuditState
): Promise<Partial<FinancialAuditState>> {
  const response = await claudeSonnet.invoke([
    new SystemMessage(CATEGORIZE_PROMPT),
    new HumanMessage(JSON.stringify(state.transactions)),
  ]);

  const categorized = JSON.parse(response.content as string);
  return { categorized };
}

async function detectAnomalies(
  state: FinancialAuditState
): Promise<Partial<FinancialAuditState>> {
  const response = await claudeSonnet.invoke([
    new SystemMessage(ANOMALY_PROMPT),
    new HumanMessage(JSON.stringify(state.categorized)),
  ]);

  const anomalies = JSON.parse(response.content as string);
  return { anomalies };
}

async function analyzeFees(
  state: FinancialAuditState
): Promise<Partial<FinancialAuditState>> {
  // Filter fee transactions
  const feeTransactions = state.categorized.filter(
    (t) => t.categoria === 'DESPESA_FINANCEIRA' && t.subcategoria?.includes('tarifa')
  );

  const response = await claudeSonnet.invoke([
    new SystemMessage(FEE_ANALYSIS_PROMPT),
    new HumanMessage(JSON.stringify(feeTransactions)),
  ]);

  const fees = JSON.parse(response.content as string);
  return { fees };
}

async function generateSuggestions(
  state: FinancialAuditState
): Promise<Partial<FinancialAuditState>> {
  const context = {
    categorized: state.categorized,
    anomalies: state.anomalies,
    fees: state.fees,
  };

  const response = await claudeSonnet.invoke([
    new SystemMessage(SUGGESTION_PROMPT),
    new HumanMessage(JSON.stringify(context)),
  ]);

  const suggestions = JSON.parse(response.content as string);
  return { suggestions };
}

async function generateReport(
  state: FinancialAuditState
): Promise<Partial<FinancialAuditState>> {
  const reportPrompt = `Gere um relatório executivo de auditoria financeira em português:

Dados:
- Total de transações: ${state.transactions.length}
- Anomalias detectadas: ${state.anomalies.length}
- Total em tarifas: R$ ${state.fees.total.toFixed(2)}
- Economia potencial: R$ ${state.fees.economia_potencial.toFixed(2)}
- Sugestões: ${state.suggestions.length}

Inclua:
1. Resumo executivo
2. Principais descobertas
3. Alertas críticos
4. Recomendações prioritárias

Formato: Texto corrido, profissional, direto ao ponto.`;

  const response = await claudeSonnet.invoke([
    new HumanMessage(reportPrompt),
  ]);

  return { report: response.content as string };
}

// Create the graph
export function createFinancialAuditGraph() {
  const graph = new StateGraph<FinancialAuditState>({
    channels: {
      transactions: { value: (x, y) => y ?? x, default: () => [] },
      categorized: { value: (x, y) => [...(x || []), ...(y || [])], default: () => [] },
      anomalies: { value: (x, y) => [...(x || []), ...(y || [])], default: () => [] },
      fees: { value: (x, y) => y ?? x, default: () => ({ total: 0, por_tipo: {}, economia_potencial: 0, recomendacoes: [] }) },
      suggestions: { value: (x, y) => [...(x || []), ...(y || [])], default: () => [] },
      report: { value: (x, y) => y ?? x, default: () => '' },
      messages: { value: (x, y) => [...(x || []), ...(y || [])], default: () => [] },
    },
  });

  // Add nodes
  graph.addNode('categorize', categorizeTransactions);
  graph.addNode('detect_anomalies', detectAnomalies);
  graph.addNode('analyze_fees', analyzeFees);
  graph.addNode('generate_suggestions', generateSuggestions);
  graph.addNode('generate_report', generateReport);

  // Add edges
  graph.addEdge(START, 'categorize');
  graph.addEdge('categorize', 'detect_anomalies');
  graph.addEdge('detect_anomalies', 'analyze_fees');
  graph.addEdge('analyze_fees', 'generate_suggestions');
  graph.addEdge('generate_suggestions', 'generate_report');
  graph.addEdge('generate_report', END);

  return graph.compile();
}

// ============================================================================
// LANGGRAPH - CHATBOT WORKFLOW
// ============================================================================

interface ChatbotState {
  messages: BaseMessage[];
  context: string;
  empresa_id: string;
  user_id: string;
}

const CHATBOT_SYSTEM_PROMPT = `Você é o IcarusBrain, assistente inteligente do sistema ICARUS v6.0 para gestão de OPME.

Você pode ajudar com:
- Consultas sobre cirurgias, estoque e produtos
- Análises financeiras e relatórios
- Rastreabilidade de materiais implantáveis
- Compliance ANVISA e LGPD
- Sugestões de otimização

Contexto atual:
{context}

Seja conciso, profissional e proativo. Use emojis com moderação.
Sempre que possível, sugira ações e próximos passos.`;

async function processMessage(state: ChatbotState): Promise<Partial<ChatbotState>> {
  const systemPrompt = CHATBOT_SYSTEM_PROMPT.replace('{context}', state.context || 'Nenhum contexto adicional');

  const response = await claudeSonnet.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

  return {
    messages: [...state.messages, response],
  };
}

export function createChatbotGraph() {
  const graph = new StateGraph<ChatbotState>({
    channels: {
      messages: { value: (x, y) => y ?? x, default: () => [] },
      context: { value: (x, y) => y ?? x, default: () => '' },
      empresa_id: { value: (x, y) => y ?? x, default: () => '' },
      user_id: { value: (x, y) => y ?? x, default: () => '' },
    },
  });

  graph.addNode('process', processMessage);
  graph.addEdge(START, 'process');
  graph.addEdge('process', END);

  return graph.compile();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function createEmbedding(text: string): Promise<number[]> {
  const result = await embeddings.embedQuery(text);
  return result;
}

export async function searchSimilar(
  vectorStore: SupabaseVectorStore,
  query: string,
  k: number = 5
) {
  const results = await vectorStore.similaritySearch(query, k);
  return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  FinancialAuditState,
  Transaction,
  CategorizedTransaction,
  Anomaly,
  FeeAnalysis,
  Suggestion,
  ChatbotState,
};
