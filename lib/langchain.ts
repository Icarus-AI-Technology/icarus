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
import { processComplianceTask } from './ai/compliance-agent';
import { supabase, supabaseAdmin } from './supabase';
import { cacheService, CacheKeys, CacheTTL } from './redis';

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
// LANGGRAPH - ICARUS BRAIN ORCHESTRATOR
// ============================================================================

type DelegationAgent = 'finance' | 'operations' | 'compliance';
type DelegationPriority = 'low' | 'medium' | 'high' | 'critical';

interface Delegation {
  agent: DelegationAgent;
  task: string;
  context: Record<string, unknown>;
  priority: DelegationPriority;
}

interface AgentResult {
  agent: DelegationAgent;
  success: boolean;
  data: unknown;
  error?: string;
}

interface OrchestratorState {
  messages: BaseMessage[];
  userInput: string;
  empresaId: string;
  userId: string;
  context: Record<string, unknown>;
  delegations: Delegation[];
  agentResults: AgentResult[];
  finalResponse: string;
}

const ICARUS_BRAIN_PROMPT = `# IcarusBrain - Orquestrador Central ICARUS v6.0

Você é o IcarusBrain, o cérebro central do sistema ICARUS v6.0 para gestão de OPME.

## Sua Função Principal
Você é o ORQUESTRADOR que coordena 3 agentes especializados:

1. **FinanceAgent** - Vigilância financeira, tarifas, Open Finance
2. **OperationsAgent** - Cirurgias, estoque, rastreabilidade OPME
3. **ComplianceAgent** - ANVISA, LGPD, auditoria blockchain

## Regras de Orquestração

### Quando Delegar para FinanceAgent:
- Perguntas sobre transações bancárias, saldos, extratos
- Análise de tarifas e custos bancários
- Sugestões financeiras (empréstimos, quitações)
- Alertas de anomalias financeiras
- Conciliação bancária
- Qualquer menção a: dinheiro, banco, tarifa, pagamento, recebimento, fatura, parcela

### Quando Delegar para OperationsAgent:
- Consultas sobre cirurgias (agendamento, status, materiais)
- Gestão de estoque (níveis, validade, reservas)
- Informações sobre produtos e lotes
- Rastreabilidade de implantes
- Qualquer menção a: cirurgia, estoque, produto, lote, hospital, médico, material

### Quando Delegar para ComplianceAgent:
- Questões sobre ANVISA e regulamentação
- Solicitações LGPD (acesso, exclusão, portabilidade)
- Auditoria e logs de alterações
- Validação de blockchain
- Qualquer menção a: compliance, ANVISA, LGPD, auditoria, consentimento, rastreabilidade legal

### Quando Responder Diretamente:
- Saudações e conversas gerais
- Perguntas sobre o sistema ICARUS
- Dúvidas que não se encaixam nos agentes
- Resumos executivos combinando múltiplos agentes

## Formato de Delegação

Quando precisar delegar, responda EXATAMENTE neste formato JSON:
\`\`\`json
{
  "action": "delegate",
  "agent": "finance|operations|compliance",
  "task": "descrição clara da tarefa",
  "context": { "dados_relevantes": "..." },
  "priority": "low|medium|high|critical"
}
\`\`\`

## Formato de Resposta Direta

Quando responder diretamente ao usuário:
\`\`\`json
{
  "action": "respond",
  "message": "sua resposta ao usuário",
  "suggestions": ["ação sugerida 1", "ação sugerida 2"]
}
\`\`\`

## Formato de Múltiplos Agentes

Quando precisar de múltiplos agentes:
\`\`\`json
{
  "action": "multi_delegate",
  "agents": [
    { "agent": "finance", "task": "..." },
    { "agent": "operations", "task": "..." }
  ],
  "combine_results": true
}
\`\`\`

## Contexto da Empresa
- Empresa: {empresa_nome}
- Setor: Distribuição de OPME (materiais médicos implantáveis)
- Foco: Cirurgias ortopédicas
- Regulação: ANVISA RDC 665/2022, LGPD

## Personalidade
- Profissional mas acessível
- Proativo em sugestões
- Conciso nas respostas
- Sempre em português brasileiro
- Usa emojis com moderação (📊 💰 🏥 ⚠️ ✅)

## Exemplos de Interação

Usuário: "Como estão as cirurgias de hoje?"
→ Delegar para OperationsAgent

Usuário: "Quanto gastamos em tarifas esse mês?"
→ Delegar para FinanceAgent

Usuário: "Preciso de um relatório completo da empresa"
→ Multi-delegate para todos os agentes

Usuário: "Olá, tudo bem?"
→ Responder diretamente
`;

const orchestratorLLM = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  temperature: 0.3,
  maxTokens: 2048,
});

const delegationSchema = z.object({
  agent: z.enum(['finance', 'operations', 'compliance']),
  task: z.string().min(3),
  context: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

const decisionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('delegate'),
    agent: delegationSchema.shape.agent,
    task: delegationSchema.shape.task,
    context: delegationSchema.shape.context.optional(),
    priority: delegationSchema.shape.priority.optional(),
  }),
  z.object({
    action: z.literal('multi_delegate'),
    agents: z.array(
      z.object({
        agent: delegationSchema.shape.agent,
        task: delegationSchema.shape.task,
        context: delegationSchema.shape.context.optional(),
        priority: delegationSchema.shape.priority.optional(),
      })
    ),
    combine_results: z.boolean().optional(),
  }),
  z.object({
    action: z.literal('respond'),
    message: z.string(),
    suggestions: z.array(z.string()).default([]),
  }),
]);

type OrchestratorDecision = z.infer<typeof decisionSchema>;

const AGENT_TIMEOUT_MS = 15000;

function normalizeMessageContent(content: AIMessage['content']): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((chunk) => {
        if (typeof chunk === 'string') return chunk;
        if (typeof chunk === 'object' && chunk && 'text' in chunk) {
          return typeof chunk.text === 'string' ? chunk.text : '';
        }
        return '';
      })
      .join('\n')
      .trim();
  }

  if (typeof content === 'object' && content && 'text' in content) {
    const maybeText = (content as { text?: string }).text;
    return typeof maybeText === 'string' ? maybeText : '';
  }

  return '';
}

function parseDecisionFromContent(content: AIMessage['content']): OrchestratorDecision | null {
  const rawContent = normalizeMessageContent(content);
  if (!rawContent) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawContent);
    const validation = decisionSchema.safeParse(parsed);
    return validation.success ? validation.data : null;
  } catch {
    return null;
  }
}

function normalizeDelegation(input: {
  agent: DelegationAgent;
  task: string;
  context?: Record<string, unknown>;
  priority?: DelegationPriority;
}): Delegation {
  return {
    agent: input.agent,
    task: input.task.trim(),
    context: input.context ?? {},
    priority: input.priority ?? 'medium',
  };
}

async function getEmpresaDisplayName(empresaId: string): Promise<string> {
  if (!empresaId) {
    return 'Empresa';
  }

  const cacheKey = CacheKeys.empresa(empresaId);
  const cached = await cacheService.get<{ razao_social?: string; nome_fantasia?: string }>(cacheKey);
  if (cached) {
    return cached.nome_fantasia ?? cached.razao_social ?? 'Empresa';
  }

  const client = supabaseAdmin ?? supabase;
  const { data, error } = await client
    .from('empresas')
    .select('razao_social, nome_fantasia')
    .eq('id', empresaId)
    .single();

  if (!error && data) {
    await cacheService.set(cacheKey, data, CacheTTL.empresa);
    return data.nome_fantasia ?? data.razao_social ?? 'Empresa';
  }

  return 'Empresa';
}

function safeParseJson(payload: string): unknown {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

function getSessionIdFromContext(context: Record<string, unknown>): string | undefined {
  const maybeContext = context as { sessionId?: unknown };
  return typeof maybeContext.sessionId === 'string' ? maybeContext.sessionId : undefined;
}

async function invokeAgentEdgeFunction(
  baseUrl: string,
  serviceKey: string,
  delegation: Delegation,
  state: OrchestratorState
): Promise<AgentResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/functions/v1/agent-${delegation.agent}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        task: delegation.task,
        context: delegation.context,
        empresaId: state.empresaId,
        userId: state.userId,
        priority: delegation.priority,
      }),
      signal: controller.signal,
    });

    const rawBody = await response.text();
    const data = safeParseJson(rawBody);

    if (!response.ok) {
      const errorPayload =
        typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      return {
        agent: delegation.agent,
        success: false,
        data: null,
        error: `HTTP ${response.status} - ${errorPayload}`,
      };
    }

    return {
      agent: delegation.agent,
      success: true,
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      agent: delegation.agent,
      success: false,
      data: null,
      error: message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function analyzeInput(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
  const empresaNome = await getEmpresaDisplayName(state.empresaId);
  const systemPrompt = ICARUS_BRAIN_PROMPT.replace('{empresa_nome}', empresaNome);

  const response = await orchestratorLLM.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
    new HumanMessage(state.userInput),
  ]);

  const decision = parseDecisionFromContent(response.content);
  if (!decision) {
    return { finalResponse: normalizeMessageContent(response.content) };
  }

  if (decision.action === 'respond') {
    return {
      finalResponse: decision.message,
      context: { ...state.context, suggestions: decision.suggestions ?? [] },
    };
  }

  if (decision.action === 'delegate') {
    const delegation = normalizeDelegation(decision);
    return {
      delegations: [delegation],
      context: { ...state.context, decision },
    };
  }

  const delegations = decision.agents.map(normalizeDelegation);
  return {
    delegations,
    context: { ...state.context, decision },
  };
}

async function executeDelegations(
  state: OrchestratorState
): Promise<Partial<OrchestratorState>> {
  if (!state.delegations?.length) {
    return {};
  }

  const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const results = await Promise.all(
    state.delegations.map(async (delegation) => {
      if (delegation.agent === 'compliance') {
        return invokeComplianceAgent(delegation, state);
      }

      if (!baseUrl || !serviceKey) {
        return {
          agent: delegation.agent,
          success: false,
          data: null,
          error: 'Missing Supabase configuration for agent invocation',
        } as AgentResult;
      }

      return invokeAgentEdgeFunction(baseUrl, serviceKey, delegation, state);
    })
  );

  return { agentResults: results };
}

async function invokeComplianceAgent(
  delegation: Delegation,
  state: OrchestratorState
): Promise<AgentResult> {
  try {
    const response = await processComplianceTask(
      delegation.task,
      delegation.context ?? {},
      state.empresaId,
      state.userId
    );

    return {
      agent: 'compliance',
      success: true,
      data: response,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      agent: 'compliance',
      success: false,
      data: null,
      error: message,
    };
  }
}

async function synthesizeResults(
  state: OrchestratorState
): Promise<Partial<OrchestratorState>> {
  if (!state.agentResults?.length) {
    return {};
  }

  const synthesisPrompt = `Sintetize os resultados dos agentes em uma resposta coesa para o usuário.

Resultados:
${JSON.stringify(state.agentResults, null, 2)}

Pergunta original: ${state.userInput}

Regras:
- Combine as informações de forma natural
- Destaque insights importantes
- Sugira próximos passos se relevante
- Seja conciso mas completo
- Use formatação clara (bullets, negrito)`;

  const response = await orchestratorLLM.invoke([new SystemMessage(synthesisPrompt)]);
  return { finalResponse: normalizeMessageContent(response.content) };
}

async function saveInteraction(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
  if (!state.finalResponse) {
    return {};
  }

  const client = supabaseAdmin ?? supabase;
  const sessionId = getSessionIdFromContext(state.context) ?? null;

  await client.from('chatbot_mensagens').insert([
    {
      empresa_id: state.empresaId,
      sessao_id: sessionId,
      role: 'user',
      content: state.userInput,
    },
    {
      empresa_id: state.empresaId,
      sessao_id: sessionId,
      role: 'assistant',
      content: state.finalResponse,
      tool_calls: state.delegations?.length ? JSON.stringify(state.delegations) : null,
      tool_results: state.agentResults?.length ? JSON.stringify(state.agentResults) : null,
    },
  ]);

  return {};
}

export function createOrchestratorGraph() {
  const graph = new StateGraph<OrchestratorState>({
    channels: {
      messages: { value: (x, y) => [...(x || []), ...(y || [])], default: () => [] },
      userInput: { value: (x, y) => y ?? x, default: () => '' },
      empresaId: { value: (x, y) => y ?? x, default: () => '' },
      userId: { value: (x, y) => y ?? x, default: () => '' },
      context: { value: (x, y) => ({ ...(x || {}), ...(y || {}) }), default: () => ({}) },
      delegations: { value: (x, y) => y ?? x, default: () => [] },
      agentResults: { value: (x, y) => y ?? x, default: () => [] },
      finalResponse: { value: (x, y) => y ?? x, default: () => '' },
    },
  });

  graph.addNode('analyze', analyzeInput);
  graph.addNode('delegate', executeDelegations);
  graph.addNode('synthesize', synthesizeResults);
  graph.addNode('save', saveInteraction);

  graph.addEdge(START, 'analyze');
  graph.addConditionalEdges('analyze', (state) =>
    state.delegations?.length ? 'delegate' : 'save'
  );
  graph.addEdge('delegate', 'synthesize');
  graph.addEdge('synthesize', 'save');
  graph.addEdge('save', END);

  return graph.compile();
}

export async function processUserMessage(
  message: string,
  empresaId: string,
  userId: string,
  sessionId: string,
  previousMessages: BaseMessage[] = []
): Promise<string> {
  const graph = createOrchestratorGraph();

  const result = await graph.invoke({
    userInput: message,
    empresaId,
    userId,
    context: { sessionId },
    messages: previousMessages,
  });

  return result.finalResponse;
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
  OrchestratorState,
  Delegation,
  AgentResult,
};
