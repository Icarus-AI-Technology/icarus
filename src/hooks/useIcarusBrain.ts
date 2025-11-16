import { useState } from 'react'
import { icarusBrain, type AIResponse } from '@/lib/services/ai/icarus-brain'

/**
 * Hook para integração com IcarusBrain (IA do ICARUS)
 *
 * FASE 1: Usa implementação mock para deploy estável
 * FASE 2: Migrar para @/lib/ai/icarus-brain (Claude API real)
 *
 * Serviços disponíveis:
 * - predict: Previsões (demanda, preços)
 * - analyze: Análises (risco, qualidade)
 * - recommend: Recomendações (produtos)
 * - optimize: Otimizações (rotas)
 */
export function useIcarusBrain() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predict = async (type: 'demand' | 'pricing', params: any): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      let response: AIResponse

      switch (type) {
        case 'demand':
          response = await icarusBrain.predictDemand(params)
          break
        case 'pricing':
          response = await icarusBrain.predictPricing(params.productId, params.marketData)
          break
        default:
          throw new Error(`Unknown prediction type: ${type}`)
      }

      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setLoading(false)
      return null
    }
  }

  const analyze = async (type: 'default-risk' | 'quality', params: any): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      let response: AIResponse

      switch (type) {
        case 'default-risk':
          response = await icarusBrain.analyzeDefaultRisk(params)
          break
        case 'quality':
          response = await icarusBrain.analyzeQuality(params.productId, params.metrics)
          break
        default:
          throw new Error(`Unknown analysis type: ${type}`)
      }

      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setLoading(false)
      return null
    }
  }

  const recommend = async (type: 'products', params: any): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrain.recommendProducts(params)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setLoading(false)
      return null
    }
  }

  const optimize = async (type: 'routes', params: any): Promise<AIResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await icarusBrain.optimizeRoutes(params.warehouses, params.deliveries)
      setLoading(false)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setLoading(false)
      return null
    }
  }

  return {
    predict,
    analyze,
    recommend,
    optimize,
    loading,
    error
  }
}
