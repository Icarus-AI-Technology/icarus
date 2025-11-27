/**
 * Hook para gerenciamento de sessões de chat do ICARUS AI Assistant
 * Integra com Edge Function `chat` no Supabase
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ChatMessage } from '@/components/chat/ChatWidget';

interface ChatContext {
  empresaId?: string;
  userId?: string;
  currentPage?: string;
  currentModule?: string;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  intent?: string;
  actions?: Array<{
    type: string;
    label: string;
    link?: string;
  }>;
}

interface UseChatSessionOptions {
  context?: ChatContext;
  persistSession?: boolean;
  maxHistoryMessages?: number;
}

const STORAGE_KEY = 'icarus_chat_session';
const MAX_HISTORY = 50;

export function useChatSession(options: UseChatSessionOptions = {}) {
  const { 
    context = {}, 
    persistSession = true,
    maxHistoryMessages = MAX_HISTORY
  } = options;

  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (persistSession && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // Check if session is not too old (24 hours)
          const updatedAt = new Date(data.updatedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
          if (hoursDiff < 24) {
            return data.sessionId || null;
          }
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (persistSession && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return data.messages?.map((m: ChatMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })).slice(-maxHistoryMessages) || [];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist session to localStorage
  useEffect(() => {
    if (persistSession && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId,
        messages: messages.slice(-maxHistoryMessages),
        updatedAt: new Date().toISOString()
      }));
    }
  }, [sessionId, messages, persistSession, maxHistoryMessages]);

  // Get current context
  const getCurrentContext = useCallback((): ChatContext => {
    return {
      ...context,
      currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined
    };
  }, [context]);

  // Send message to chat API
  const sendMessage = useCallback(async (messageText: string): Promise<string | null> => {
    if (!messageText.trim()) return null;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await callChatAPI(
        messageText, 
        sessionId, 
        getCurrentContext(),
        abortControllerRef.current.signal
      );

      // Update session ID if new
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        intent: response.intent,
        actions: response.actions
      };

      setMessages(prev => [...prev, assistantMessage]);

      return response.response;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return null;
      }

      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);

      // Add error message to chat
      const errorAssistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorAssistantMessage]);

      return null;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [sessionId, getCurrentContext]);

  // Send feedback for a message
  const sendFeedback = useCallback(async (
    messageId: string, 
    feedback: 'positive' | 'negative',
    feedbackText?: string
  ): Promise<boolean> => {
    try {
      // Update local state first
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback } 
          : msg
      ));

      // Save feedback (for now, just log - could be extended to save to DB)
      if (sessionId) {
        console.log('Feedback saved:', { messageId, feedback, feedbackText });
      }

      return true;
    } catch (err) {
      console.error('Error saving feedback:', err);
      return false;
    }
  }, [sessionId]);

  // Reset session
  const resetSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setError(null);
    if (persistSession && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [persistSession]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cancel pending request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Load session history from database
  const loadHistory = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error: queryError } = await supabase
        .from('chatbot_mensagens')
        .select('id, role, content, criado_em, intent, acoes')
        .eq('sessao_id', sessionId)
        .order('criado_em', { ascending: true })
        .limit(maxHistoryMessages);

      if (queryError) throw queryError;

      if (data && data.length > 0) {
        // Type assertion for database result
        type DbMessage = {
          id: string;
          role: string;
          content: string;
          criado_em: string;
          intent: string | null;
          acoes: Array<{ type: string; label: string; link?: string }> | null;
        };

        const loadedMessages: ChatMessage[] = (data as DbMessage[]).map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.criado_em),
          intent: msg.intent || undefined,
          actions: msg.acoes || undefined
        }));

        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  }, [sessionId, maxHistoryMessages]);

  return {
    sessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    sendFeedback,
    resetSession,
    clearError,
    cancelRequest,
    loadHistory
  };
}

// API call helper - tries langchain-agent first, falls back to chat, then mock
async function callChatAPI(
  message: string,
  sessionId: string | null,
  context: ChatContext,
  _signal?: AbortSignal
): Promise<ChatResponse> {
  // Try LangChain Agent first (for advanced tool-based responses)
  try {
    const { data: agentData, error: agentError } = await supabase.functions.invoke('langchain-agent', {
      body: {
        mensagem: message,
        usuario_id: sessionId,
        contexto: context
      }
    });

    if (!agentError && agentData?.success && agentData?.resposta) {
      return {
        response: agentData.resposta,
        sessionId: sessionId || crypto.randomUUID(),
        intent: agentData.ferramentas_usadas?.length > 0 ? 'tool_call' : 'chat',
        actions: agentData.ferramentas_usadas?.map((tool: string) => ({
          type: 'tool',
          label: formatToolName(tool)
        }))
      };
    }
  } catch (err) {
    console.warn('LangChain agent unavailable, trying chat function:', err);
  }

  // Fallback to regular chat Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        message,
        sessionId,
        context
      }
    });

    if (error) {
      console.warn('Edge function error, using fallback:', error);
      return getMockResponse(message, sessionId);
    }

    return data as ChatResponse;
  } catch (err) {
    console.warn('API call failed, using fallback:', err);
    return getMockResponse(message, sessionId);
  }
}

// Format tool name for display
function formatToolName(tool: string): string {
  const toolNames: Record<string, string> = {
    'estoque_disponivel': '📦 Estoque consultado',
    'previsao_vencimento_lote': '⏰ Vencimentos verificados',
    'busca_catalogo_anvisa': '🔍 Catálogo pesquisado',
    'verificar_cirurgia_agendada': '🏥 Cirurgias verificadas',
    'rastreabilidade_lote': '📋 Lote rastreado'
  };
  return toolNames[tool] || tool;
}

// Enhanced mock response for development/fallback
function getMockResponse(message: string, currentSessionId: string | null): ChatResponse {
  const sessionId = currentSessionId || crypto.randomUUID();
  const lowerMessage = message.toLowerCase();

  // Intent detection with more patterns
  let intent = 'geral';
  let response = '';
  const actions: ChatResponse['actions'] = [];

  // Estoque patterns
  if (lowerMessage.match(/estoque|produto|falta|ruptura|inventario|lote|validade/)) {
    intent = 'consulta_estoque';
    
    if (lowerMessage.includes('falta') || lowerMessage.includes('ruptura')) {
      response = `📦 **Produtos em Falta**\n\nPara verificar produtos em falta ou com ruptura de estoque:\n\n1. Acesse o módulo **Estoque IA**\n2. Veja o alerta de "Estoque Crítico"\n3. Filtre por status "Abaixo do Mínimo"\n\nO sistema monitora automaticamente e pode criar pedidos de compra.`;
      actions.push({ type: 'navigate', label: 'Ver Estoque Crítico', link: '/estoque-ia' });
    } else if (lowerMessage.includes('validade')) {
      response = `⏰ **Controle de Validades**\n\nPara verificar produtos com validade próxima:\n\n1. Acesse **Estoque IA** > Controle de Lotes\n2. Filtre por "Vencendo em 30/60/90 dias"\n3. O sistema alerta automaticamente sobre vencimentos\n\nDica: Configure alertas para receber notificações antecipadas.`;
      actions.push({ type: 'navigate', label: 'Controle de Lotes', link: '/estoque-ia' });
    } else {
      response = `📊 **Gestão de Estoque**\n\nO módulo de Estoque IA oferece:\n\n• Controle em tempo real\n• Previsão de demanda com IA\n• Alertas de estoque crítico\n• Gestão de lotes e validades\n• Sugestões automáticas de reposição\n\nO que você precisa especificamente?`;
      actions.push({ type: 'navigate', label: 'Ir para Estoque', link: '/estoque-ia' });
    }
  }
  // Cirurgias patterns
  else if (lowerMessage.match(/cirurgia|agend|procedimento|kit|material|medico|hospital/)) {
    intent = 'ajuda_cirurgia';
    
    if (lowerMessage.includes('justificativa')) {
      response = `📝 **Justificativa Médica**\n\nPara gerar uma justificativa médica:\n\n1. Acesse **Cirurgias** > Nova Cirurgia\n2. Preencha dados do paciente e procedimento\n3. Clique em "Gerar Justificativa com IA"\n4. O sistema analisa requisitos ANVISA/TUSS\n5. Revise e envie ao convênio\n\nA IA gera justificativas completas baseadas no CID-10 e procedimento.`;
      actions.push({ type: 'navigate', label: 'Gerar Justificativa', link: '/cirurgias' });
    } else {
      response = `🏥 **Gestão de Cirurgias**\n\nO módulo de Cirurgias permite:\n\n• Agendar procedimentos\n• Montar kits de materiais OPME\n• Acompanhar status no Kanban\n• Gerar justificativas médicas com IA\n• Rastrear materiais utilizados\n• Integrar com faturamento\n\nPrecisa de ajuda com alguma função específica?`;
      actions.push({ type: 'navigate', label: 'Ir para Cirurgias', link: '/cirurgias' });
    }
  }
  // ANVISA/Compliance patterns
  else if (lowerMessage.match(/anvisa|registro|compliance|rdc|regulatorio|rastreabilidade/)) {
    intent = 'compliance';
    response = `🛡️ **Compliance ANVISA**\n\nO ICARUS monitora conformidade com:\n\n• **RDC 16/2013** - Boas Práticas de Distribuição\n• **RDC 665/2022** - Rastreabilidade de Implantes\n• **RDC 546/2021** - Registro de Dispositivos\n• **LGPD** - Proteção de Dados\n\nPosso verificar:\n• Validade de registros ANVISA\n• Conformidade de lotes\n• Rastreabilidade de implantes\n• Documentação regulatória`;
    actions.push({ type: 'navigate', label: 'Ir para Compliance', link: '/compliance-anvisa' });
  }
  // Financeiro patterns
  else if (lowerMessage.match(/fatura|nota|nf|financeiro|cobranca|inadimplente|receber|pagar|fluxo/)) {
    intent = 'consulta_financeiro';
    
    if (lowerMessage.includes('inadimplente')) {
      response = `💰 **Clientes Inadimplentes**\n\nPara verificar inadimplentes:\n\n1. Acesse **Contas a Receber**\n2. Filtre por status "Vencido"\n3. Use a IA para analisar risco de cada cliente\n4. Configure cobranças automáticas\n\nO sistema calcula score de inadimplência e sugere ações.`;
      actions.push({ type: 'navigate', label: 'Ver Inadimplentes', link: '/contas-receber' });
    } else if (lowerMessage.includes('fluxo')) {
      response = `📈 **Fluxo de Caixa**\n\nPara análise do fluxo de caixa:\n\n1. Acesse **Financeiro** > Dashboard\n2. Veja projeções de entradas/saídas\n3. Analise períodos específicos\n4. Use a IA para previsões\n\nA IA prevê recebimentos considerando histórico de pagamentos.`;
      actions.push({ type: 'navigate', label: 'Ver Fluxo de Caixa', link: '/financeiro' });
    } else {
      response = `💵 **Módulo Financeiro**\n\nO ICARUS oferece gestão financeira completa:\n\n• Faturamento NF-e integrado\n• Contas a Receber/Pagar\n• Fluxo de Caixa preditivo\n• Análise de inadimplência\n• Conciliação bancária\n• Relatórios gerenciais\n\nComo posso ajudar?`;
      actions.push({ type: 'navigate', label: 'Ir para Financeiro', link: '/financeiro' });
    }
  }
  // Vendas/CRM patterns
  else if (lowerMessage.match(/lead|cliente|venda|crm|proposta|oportunidade|funil/)) {
    intent = 'crm';
    response = `📊 **CRM & Vendas**\n\nO módulo de CRM oferece:\n\n• Gestão de leads com scoring IA\n• Pipeline de oportunidades\n• Previsão de fechamento\n• Sugestões de upsell/cross-sell\n• Análise de churn\n• Histórico completo do cliente\n\nA IA identifica leads quentes e sugere próximas ações.`;
    actions.push({ type: 'navigate', label: 'Ir para CRM', link: '/crm' });
  }
  // Logística patterns
  else if (lowerMessage.match(/entrega|rota|frete|logistica|rastreio|transportadora/)) {
    intent = 'logistica';
    response = `🚚 **Logística & Entregas**\n\nO módulo de Logística oferece:\n\n• Otimização de rotas com IA\n• Rastreamento em tempo real\n• Cálculo de frete\n• Gestão de transportadoras\n• Controle de SLA\n• Consolidação de cargas\n\nPrecisa otimizar alguma rota ou rastrear entrega?`;
    actions.push({ type: 'navigate', label: 'Ir para Logística', link: '/logistica' });
  }
  // Analytics patterns
  else if (lowerMessage.match(/relatorio|analise|analytics|bi|dashboard|kpi|metrica|previsao/)) {
    intent = 'analytics';
    response = `📊 **Analytics & BI**\n\nO ICARUS oferece análises avançadas:\n\n• Dashboards executivos\n• Previsão de demanda (ML)\n• Análise de churn\n• Segmentação de clientes\n• KPIs em tempo real\n• Relatórios customizados\n\nQue tipo de análise você precisa?`;
    actions.push({ type: 'navigate', label: 'Ir para BI', link: '/bi-analytics' });
  }
  // Ajuda/Saudação patterns
  else if (lowerMessage.match(/ajuda|ola|oi|bom dia|boa tarde|boa noite|como funciona|tutorial/)) {
    intent = 'saudacao';
    response = `👋 **Olá! Sou o ICARUS AI Assistant**\n\nSou seu copiloto inteligente para gestão OPME. Posso ajudar com:\n\n🏥 **Cirurgias** - Agendamento, kits, justificativas\n📦 **Estoque** - Controle, previsão, reposição\n💰 **Financeiro** - Faturamento, cobrança, fluxo\n🛡️ **Compliance** - ANVISA, rastreabilidade\n📊 **Analytics** - Relatórios, KPIs, previsões\n🚚 **Logística** - Rotas, entregas, rastreio\n\n**Dica:** Use "/" para comandos rápidos!\n\nComo posso ajudar você hoje?`;
  }
  // Comandos rápidos
  else if (lowerMessage.startsWith('/')) {
    intent = 'comando';
    const command = lowerMessage.split(' ')[0];
    
    switch (command) {
      case '/estoque':
        response = '📦 Abrindo módulo de Estoque...';
        actions.push({ type: 'navigate', label: 'Ir para Estoque', link: '/estoque-ia' });
        break;
      case '/cirurgias':
        response = '🏥 Abrindo módulo de Cirurgias...';
        actions.push({ type: 'navigate', label: 'Ir para Cirurgias', link: '/cirurgias' });
        break;
      case '/faturamento':
        response = '💵 Abrindo módulo de Faturamento...';
        actions.push({ type: 'navigate', label: 'Ir para Faturamento', link: '/faturamento-nfe' });
        break;
      case '/alertas':
        response = '🔔 Verificando alertas ativos...\n\nAlertas são exibidos no Dashboard e na barra de notificações.';
        actions.push({ type: 'navigate', label: 'Ver Dashboard', link: '/dashboard' });
        break;
      case '/ajuda':
        response = `📚 **Comandos Disponíveis:**\n\n\`/estoque\` - Ir para Estoque\n\`/cirurgias\` - Ir para Cirurgias\n\`/faturamento\` - Ir para Faturamento\n\`/alertas\` - Ver alertas ativos\n\`/ajuda\` - Esta lista de comandos\n\nVocê também pode perguntar em linguagem natural!`;
        break;
      default:
        response = `❓ Comando "${command}" não reconhecido.\n\nDigite \`/ajuda\` para ver comandos disponíveis.`;
    }
  }
  // Default response
  else {
    response = `Entendi sua pergunta sobre "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}".\n\nO ICARUS é um sistema ERP completo para gestão OPME. Posso ajudar com:\n\n• **Estoque** - Controle e previsão\n• **Cirurgias** - Agendamento e kits\n• **Financeiro** - Faturamento e cobrança\n• **Compliance** - ANVISA e LGPD\n• **Analytics** - Relatórios e KPIs\n\nPoderia ser mais específico sobre o que precisa?`;
  }

  return {
    response,
    sessionId,
    intent,
    actions
  };
}

export default useChatSession;
