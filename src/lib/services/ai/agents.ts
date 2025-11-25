/**
 * ICARUS AI Agents Service
 *
 * Servico para interacao com os agentes de IA do ICARUS:
 * - Chatbot: Assistente virtual geral
 * - Compliance: Validacao regulatoria ANVISA
 * - Researcher: Pesquisa avancada com GPT
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  actions?: ChatAction[];
}

export interface ChatAction {
  type: string;
  label: string;
  link?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    empresaId?: string;
    userId?: string;
    currentPage?: string;
  };
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  intent?: string;
  actions?: ChatAction[];
}

export interface ComplianceCheckRequest {
  tipo: 'produto' | 'cirurgia' | 'lote' | 'processo';
  dados: Record<string, unknown>;
  empresaId?: string;
}

export interface ComplianceIssue {
  codigo: string;
  severidade: 'alta' | 'media' | 'baixa';
  descricao: string;
  regulamentacao: string;
  recomendacao: string;
}

export interface ComplianceResponse {
  conforme: boolean;
  score: number;
  problemas: ComplianceIssue[];
  alertas: string[];
  aprovado: boolean;
  timestamp: string;
}

export interface ResearchRequest {
  query: string;
  maxSources?: number;
  language?: string;
  empresaId?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ResearchResponse {
  id: string;
  query: string;
  sources: SearchResult[];
  synthesis: string;
  timestamp: string;
}

/**
 * Chatbot Agent
 * Assistente virtual para duvidas e navegacao
 */
export const chatAgent = {
  /**
   * Enviar mensagem para o chatbot
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: request,
      });

      if (error) {
        console.error('Chat agent error:', error);
        return this.getFallbackResponse(request.message, request.sessionId);
      }

      return data as ChatResponse;
    } catch (err) {
      console.error('Chat agent error:', err);
      return this.getFallbackResponse(request.message, request.sessionId);
    }
  },

  /**
   * Resposta de fallback quando a API falha
   */
  getFallbackResponse(message: string, sessionId?: string): ChatResponse {
    return {
      response: 'Desculpe, estou com dificuldades tecnicas no momento. Por favor, tente novamente em alguns instantes.',
      sessionId: sessionId || crypto.randomUUID(),
      intent: 'erro',
      actions: [],
    };
  },
};

/**
 * Compliance Agent
 * Validacao regulatoria ANVISA
 */
export const complianceAgent = {
  /**
   * Verificar compliance de produto
   */
  async checkProduct(dados: Record<string, unknown>, empresaId?: string): Promise<ComplianceResponse> {
    return this.check({ tipo: 'produto', dados, empresaId });
  },

  /**
   * Verificar compliance de cirurgia
   */
  async checkSurgery(dados: Record<string, unknown>, empresaId?: string): Promise<ComplianceResponse> {
    return this.check({ tipo: 'cirurgia', dados, empresaId });
  },

  /**
   * Verificar compliance de lote
   */
  async checkLot(dados: Record<string, unknown>, empresaId?: string): Promise<ComplianceResponse> {
    return this.check({ tipo: 'lote', dados, empresaId });
  },

  /**
   * Verificar compliance de processo
   */
  async checkProcess(dados: Record<string, unknown>, empresaId?: string): Promise<ComplianceResponse> {
    return this.check({ tipo: 'processo', dados, empresaId });
  },

  /**
   * Verificacao generica de compliance
   */
  async check(request: ComplianceCheckRequest): Promise<ComplianceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('agent-compliance', {
        body: request,
      });

      if (error) {
        console.error('Compliance agent error:', error);
        return this.getErrorResponse();
      }

      return data as ComplianceResponse;
    } catch (err) {
      console.error('Compliance agent error:', err);
      return this.getErrorResponse();
    }
  },

  /**
   * Resposta de erro quando a API falha
   */
  getErrorResponse(): ComplianceResponse {
    return {
      conforme: false,
      score: 0,
      problemas: [{
        codigo: 'ERR-001',
        severidade: 'alta',
        descricao: 'Nao foi possivel realizar a verificacao de compliance',
        regulamentacao: 'N/A',
        recomendacao: 'Tente novamente ou contate o suporte',
      }],
      alertas: ['Verificacao indisponivel'],
      aprovado: false,
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * GPT Researcher Agent
 * Pesquisa avancada com sintese de resultados
 */
export const researcherAgent = {
  /**
   * Realizar pesquisa
   */
  async search(request: ResearchRequest): Promise<ResearchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('gpt-researcher', {
        body: request,
      });

      if (error) {
        console.error('Researcher agent error:', error);
        return this.getErrorResponse(request.query);
      }

      return data as ResearchResponse;
    } catch (err) {
      console.error('Researcher agent error:', err);
      return this.getErrorResponse(request.query);
    }
  },

  /**
   * Pesquisa rapida (menos fontes)
   */
  async quickSearch(query: string, empresaId?: string): Promise<ResearchResponse> {
    return this.search({
      query,
      maxSources: 3,
      language: 'pt-BR',
      empresaId,
    });
  },

  /**
   * Pesquisa completa (mais fontes)
   */
  async deepSearch(query: string, empresaId?: string): Promise<ResearchResponse> {
    return this.search({
      query,
      maxSources: 10,
      language: 'pt-BR',
      empresaId,
    });
  },

  /**
   * Resposta de erro quando a API falha
   */
  getErrorResponse(query: string): ResearchResponse {
    return {
      id: crypto.randomUUID(),
      query,
      sources: [],
      synthesis: 'Nao foi possivel realizar a pesquisa. Por favor, tente novamente.',
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * Hook para usar os agentes de IA
 */
export function useAIAgents() {
  return {
    chat: chatAgent,
    compliance: complianceAgent,
    researcher: researcherAgent,
  };
}

export default {
  chatAgent,
  complianceAgent,
  researcherAgent,
  useAIAgents,
};
