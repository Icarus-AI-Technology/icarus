import { useState } from 'react'
import icarusBrainEnhanced, { type AIResponse, type PredictParams } from '@/lib/ai/icarus-brain-enhanced'

/**
 * Hook para integração com IcarusBrain Enhanced (IA do ICARUS)
 *
 * Serviços disponíveis (12 total):
 * 1.  predictDemand - Previsão de demanda
 * 2.  analyzeDefaultRisk - Score de inadimplência
 * 3.  recommendProducts - Recomendação de produtos
 * 4.  optimizeInventory - Otimização de estoque
 * 5.  analyzeSentiment - Análise de sentimento
 * 6.  detectAnomalies - Detecção de anomalias
 * 7.  predictPricing - Precificação dinâmica
 * 8.  predictChurn - Predição de churn
 * 9.  scoreLeads - Lead scoring
 * 10. manageCreditLimit - Gestão de crédito
 * 11. optimizeRoutes - Roteamento inteligente
 * 12. chat - Assistente virtual
 */
export function useIcarusBrainEnhanced() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 1. Previsão de Demanda
   */
  const predictDemand = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.predictDemand(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 2. Análise de Risco de Inadimplência
   */
  const analyzeDefaultRisk = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.analyzeDefaultRisk(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 3. Recomendação de Produtos
   */
  const recommendProducts = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.recommendProducts(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 4. Otimização de Estoque
   */
  const optimizeInventory = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.optimizeInventory(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 5. Análise de Sentimento
   */
  const analyzeSentiment = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.analyzeSentiment(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 6. Detecção de Anomalias
   */
  const detectAnomalies = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.detectAnomalies(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 7. Precificação Dinâmica
   */
  const predictPricing = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.predictPricing(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 8. Predição de Churn
   */
  const predictChurn = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.predictChurn(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 9. Lead Scoring
   */
  const scoreLeads = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.scoreLeads(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 10. Gestão de Limite de Crédito
   */
  const manageCreditLimit = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.manageCreditLimit(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 11. Otimização de Rotas
   */
  const optimizeRoutes = async (params: PredictParams): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.optimizeRoutes(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  /**
   * 12. Chat / Assistente Virtual
   */
  const chat = async (mensagem: string, params: PredictParams = {}): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrainEnhanced.chat(mensagem, params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      return null
    }
  }

  return {
    // Services
    predictDemand,
    analyzeDefaultRisk,
    recommendProducts,
    optimizeInventory,
    analyzeSentiment,
    detectAnomalies,
    predictPricing,
    predictChurn,
    scoreLeads,
    manageCreditLimit,
    optimizeRoutes,
    chat,

    // State
    loading,
    error,
  }
}
