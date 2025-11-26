/**
 * Hook para integração com IcarusBrain Edge Functions
 * Suporta todos os tipos de análise de IA do ICARUS
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// Tipos de análise suportados pelo IcarusBrain
export type AnalysisType = 
  | 'demanda'       // Previsão de demanda de produtos
  | 'inadimplencia' // Score de risco de inadimplência
  | 'churn'         // Previsão de churn de clientes
  | 'recomendacao'  // Recomendação de produtos
  | 'estoque'       // Otimização de estoque
  | 'precificacao'  // Precificação dinâmica
  | 'sentiment'     // Análise de sentimento
  | 'anomalia';     // Detecção de anomalias

export interface AnalysisRequest {
  analysisType: AnalysisType;
  data: Record<string, unknown>;
  webhookUrl?: string;
}

export interface AnalysisResult {
  jobId: string;
  analysisType: AnalysisType;
  status: 'processing' | 'completed' | 'error';
  result?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ComplianceCheckRequest {
  tipo: 'produto' | 'cirurgia' | 'lote' | 'processo';
  dados: Record<string, unknown>;
}

export interface ComplianceResult {
  conforme: boolean;
  score: number;
  problemas: Array<{
    codigo: string;
    severidade: 'alta' | 'media' | 'baixa';
    descricao: string;
    regulamentacao: string;
    recomendacao: string;
  }>;
  alertas: string[];
  aprovado: boolean;
  timestamp: string;
}

export interface ResearchRequest {
  query: string;
  maxSources?: number;
  language?: string;
}

export interface ResearchResult {
  id: string;
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  synthesis: string;
  timestamp: string;
}

export function useIcarusBrain() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Executa uma análise de IA em background
   * Retorna imediatamente com jobId para acompanhamento
   */
  const analyze = useCallback(async (request: AnalysisRequest): Promise<AnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('icarus-brain', {
        body: request
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao executar análise');
      }

      return data as AnalysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('IcarusBrain analyze error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Consulta o resultado de uma análise pelo jobId
   */
  const getAnalysisResult = useCallback(async (jobId: string): Promise<AnalysisResult | null> => {
    try {
      const { data, error: queryError } = await supabase
        .from('icarus_brain_results')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (queryError) {
        throw new Error(queryError.message);
      }

      if (!data) {
        return null;
      }

      // Type assertion for database result
      const result = data as {
        job_id: string;
        analysis_type: string;
        status: string;
        result: Record<string, unknown>;
        error: string | null;
        started_at: string;
        completed_at: string | null;
      };

      return {
        jobId: result.job_id,
        analysisType: result.analysis_type as AnalysisType,
        status: result.status as 'processing' | 'completed' | 'error',
        result: result.result,
        error: result.error || undefined,
        startedAt: result.started_at,
        completedAt: result.completed_at || undefined
      };
    } catch (err) {
      console.error('Error fetching analysis result:', err);
      return null;
    }
  }, []);

  /**
   * Executa verificação de compliance ANVISA
   */
  const checkCompliance = useCallback(async (request: ComplianceCheckRequest): Promise<ComplianceResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('agent-compliance', {
        body: request
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao verificar compliance');
      }

      return data as ComplianceResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Compliance check error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Executa pesquisa web com GPT Researcher
   */
  const research = useCallback(async (request: ResearchRequest): Promise<ResearchResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gpt-researcher', {
        body: {
          query: request.query,
          maxSources: request.maxSources || 5,
          language: request.language || 'pt-BR'
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao realizar pesquisa');
      }

      return data as ResearchResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Research error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Atalhos para tipos específicos de análise
   */
  const predictDemand = useCallback((productId: string, period: number = 30) => 
    analyze({ 
      analysisType: 'demanda', 
      data: { produto_id: productId, periodo: period } 
    }), [analyze]);

  const scoreInadimplencia = useCallback((clienteId: string) => 
    analyze({ 
      analysisType: 'inadimplencia', 
      data: { cliente_id: clienteId } 
    }), [analyze]);

  const predictChurn = useCallback((clienteId: string) => 
    analyze({ 
      analysisType: 'churn', 
      data: { cliente_id: clienteId } 
    }), [analyze]);

  const recommendProducts = useCallback((clienteId: string, context?: Record<string, unknown>) => 
    analyze({ 
      analysisType: 'recomendacao', 
      data: { cliente_id: clienteId, ...context } 
    }), [analyze]);

  const optimizeStock = useCallback((products: string[]) => 
    analyze({ 
      analysisType: 'estoque', 
      data: { produtos: products } 
    }), [analyze]);

  const analyzePricing = useCallback((productId: string, marketData?: Record<string, unknown>) => 
    analyze({ 
      analysisType: 'precificacao', 
      data: { produto_id: productId, ...marketData } 
    }), [analyze]);

  const analyzeSentiment = useCallback((feedbacks: string[]) => 
    analyze({ 
      analysisType: 'sentiment', 
      data: { feedbacks } 
    }), [analyze]);

  const detectAnomalies = useCallback((data: Record<string, unknown>) => 
    analyze({ 
      analysisType: 'anomalia', 
      data 
    }), [analyze]);

  return {
    // Estado
    isLoading,
    error,
    
    // Métodos genéricos
    analyze,
    getAnalysisResult,
    checkCompliance,
    research,
    
    // Atalhos específicos
    predictDemand,
    scoreInadimplencia,
    predictChurn,
    recommendProducts,
    optimizeStock,
    analyzePricing,
    analyzeSentiment,
    detectAnomalies
  };
}

export default useIcarusBrain;
