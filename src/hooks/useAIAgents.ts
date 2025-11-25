/**
 * Hook para usar os agentes de IA do ICARUS
 *
 * Fornece acesso aos agentes:
 * - chat: Assistente virtual
 * - compliance: Validacao regulatoria
 * - researcher: Pesquisa avancada
 */

import { useState, useCallback } from 'react';
import {
  chatAgent,
  complianceAgent,
  researcherAgent,
  type ChatRequest,
  type ChatResponse,
  type ComplianceCheckRequest,
  type ComplianceResponse,
  type ResearchRequest,
  type ResearchResponse,
} from '@/lib/services/ai/agents';

export function useAIAgents() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat Agent
  const sendChatMessage = useCallback(async (request: ChatRequest): Promise<ChatResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatAgent.sendMessage(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Compliance Agent
  const checkCompliance = useCallback(async (request: ComplianceCheckRequest): Promise<ComplianceResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await complianceAgent.check(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na verificacao de compliance';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkProductCompliance = useCallback(async (dados: Record<string, unknown>, empresaId?: string): Promise<ComplianceResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await complianceAgent.checkProduct(dados, empresaId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na verificacao de produto';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkSurgeryCompliance = useCallback(async (dados: Record<string, unknown>, empresaId?: string): Promise<ComplianceResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await complianceAgent.checkSurgery(dados, empresaId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na verificacao de cirurgia';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkLotCompliance = useCallback(async (dados: Record<string, unknown>, empresaId?: string): Promise<ComplianceResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await complianceAgent.checkLot(dados, empresaId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na verificacao de lote';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Researcher Agent
  const search = useCallback(async (request: ResearchRequest): Promise<ResearchResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await researcherAgent.search(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na pesquisa';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const quickSearch = useCallback(async (query: string, empresaId?: string): Promise<ResearchResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await researcherAgent.quickSearch(query, empresaId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na pesquisa rapida';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deepSearch = useCallback(async (query: string, empresaId?: string): Promise<ResearchResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await researcherAgent.deepSearch(query, empresaId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na pesquisa completa';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    clearError,

    // Chat Agent
    chat: {
      sendMessage: sendChatMessage,
    },

    // Compliance Agent
    compliance: {
      check: checkCompliance,
      checkProduct: checkProductCompliance,
      checkSurgery: checkSurgeryCompliance,
      checkLot: checkLotCompliance,
    },

    // Researcher Agent
    researcher: {
      search,
      quickSearch,
      deepSearch,
    },
  };
}

export default useAIAgents;
