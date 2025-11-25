import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ChatMessage } from '@/components/chat/ChatWidget';

interface ChatContext {
  empresaId?: string;
  userId?: string;
  currentPage?: string;
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
}

const STORAGE_KEY = 'icarus_chat_session';

export function useChatSession(options: UseChatSessionOptions = {}) {
  const { context = {}, persistSession = true } = options;

  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (persistSession && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return data.sessionId || null;
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
          })) || [];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist session to localStorage
  useEffect(() => {
    if (persistSession && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId,
        messages,
        updatedAt: new Date().toISOString()
      }));
    }
  }, [sessionId, messages, persistSession]);

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
      // Call Edge Function or mock response
      const response = await callChatAPI(messageText, sessionId, getCurrentContext());

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
    }
  }, [sessionId, getCurrentContext]);

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

  return {
    sessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    resetSession,
    clearError
  };
}

// API call helper
async function callChatAPI(
  message: string,
  sessionId: string | null,
  context: ChatContext
): Promise<ChatResponse> {
  try {
    // Try to call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        message,
        sessionId,
        context
      }
    });

    if (error) {
      console.warn('Edge function error, using mock response:', error);
      return getMockResponse(message, sessionId);
    }

    return data as ChatResponse;
  } catch (err) {
    console.warn('API call failed, using mock response:', err);
    return getMockResponse(message, sessionId);
  }
}

// Mock response for development/fallback
function getMockResponse(message: string, currentSessionId: string | null): ChatResponse {
  const sessionId = currentSessionId || crypto.randomUUID();
  const lowerMessage = message.toLowerCase();

  // Intent detection
  let intent = 'geral';
  let response = '';
  const actions: ChatResponse['actions'] = [];

  if (lowerMessage.includes('estoque') || lowerMessage.includes('produto')) {
    intent = 'consulta_estoque';
    response = 'Para consultar o estoque, voce pode acessar o modulo de Estoque no menu lateral. La voce encontra informacoes sobre quantidades disponiveis, lotes e alertas de nivel critico.\n\nDeseja que eu te ajude com algo mais especifico sobre estoque?';
    actions.push({ type: 'navigate', label: 'Ir para Estoque', link: '/estoque-ia' });
  } else if (lowerMessage.includes('cirurgia') || lowerMessage.includes('agendar')) {
    intent = 'ajuda_cirurgia';
    response = 'Para agendar uma cirurgia, acesse o modulo de Cirurgias. La voce pode:\n\n1. Criar novo agendamento\n2. Montar kit de materiais\n3. Acompanhar status no Kanban\n\nPosso ajudar com mais detalhes?';
    actions.push({ type: 'navigate', label: 'Ir para Cirurgias', link: '/cirurgias' });
  } else if (lowerMessage.includes('anvisa') || lowerMessage.includes('registro')) {
    intent = 'compliance';
    response = 'Para validar um registro ANVISA, voce pode:\n\n1. Usar o modulo de Compliance\n2. Consultar diretamente no cadastro de produtos\n\nO sistema valida automaticamente os registros e alerta sobre vencimentos proximos.';
    actions.push({ type: 'navigate', label: 'Ir para Compliance', link: '/compliance-anvisa' });
  } else if (lowerMessage.includes('faturamento') || lowerMessage.includes('nota') || lowerMessage.includes('nf')) {
    intent = 'consulta_financeiro';
    response = 'O modulo de Faturamento NF-e permite:\n\n1. Emitir notas fiscais eletronicas\n2. Consultar status na SEFAZ\n3. Gerar DANFE e XML\n4. Enviar por email\n\nQual operacao voce precisa realizar?';
    actions.push({ type: 'navigate', label: 'Ir para Faturamento', link: '/faturamento-nfe' });
  } else if (lowerMessage.includes('cadastrar') || lowerMessage.includes('cadastro')) {
    intent = 'cadastro';
    response = 'O ICARUS possui diversos cadastros disponiveis:\n\n- Produtos OPME\n- Medicos\n- Hospitais\n- Fornecedores\n- Clientes\n\nQual cadastro voce gostaria de acessar?';
    actions.push({ type: 'navigate', label: 'Ir para Cadastros', link: '/cadastros' });
  } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('ola') || lowerMessage.includes('oi')) {
    intent = 'saudacao';
    response = 'Ola! Sou o assistente virtual do ICARUS. Posso ajudar com:\n\n- Consultas de estoque e produtos\n- Agendamento de cirurgias\n- Validacao de registros ANVISA\n- Faturamento e notas fiscais\n- Navegacao no sistema\n\nComo posso ajudar voce hoje?';
  } else {
    response = `Entendi sua pergunta sobre "${message}". \n\nO ICARUS e um sistema ERP completo para gestao OPME. Posso ajudar com informacoes sobre estoque, cirurgias, compliance ANVISA, faturamento e muito mais.\n\nPoderia ser mais especifico sobre o que precisa?`;
  }

  return {
    response,
    sessionId,
    intent,
    actions
  };
}

export default useChatSession;
