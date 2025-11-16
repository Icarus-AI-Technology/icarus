import { useMutation, useQuery } from '@tanstack/react-query'
import { icarusBrain, type AIServiceType, type AIRequest, type AIResponse } from '@/lib/ai/icarus-brain'

/**
 * Hook for using IcarusBrain AI services
 *
 * @example
 * ```tsx
 * const { predict, analyze, recommend } = useIcarusBrain()
 *
 * // Demand prediction
 * const forecast = await predict('demanda', { produto_id: '123', periodo: 30 })
 *
 * // Delinquency analysis
 * const score = await analyze('inadimplencia', { cliente_id: '456' })
 *
 * // Product recommendations
 * const produtos = await recommend('produtos', { cliente_id: '789', tipo: 'cross-sell' })
 * ```
 */
export function useIcarusBrain() {
  /**
   * Predict using AI
   */
  const predict = async (
    type: Extract<AIServiceType, 'demanda' | 'churn' | 'precificacao'>,
    data: Record<string, unknown>
  ) => {
    const response = await icarusBrain.query({ type, data })
    if (!response.success) {
      throw new Error(response.error)
    }
    return response.data
  }

  /**
   * Analyze using AI
   */
  const analyze = async (
    type: Extract<AIServiceType, 'inadimplencia' | 'sentimento' | 'anomalias' | 'lead-scoring'>,
    data: Record<string, unknown>
  ) => {
    const response = await icarusBrain.query({ type, data })
    if (!response.success) {
      throw new Error(response.error)
    }
    return response.data
  }

  /**
   * Get recommendations using AI
   */
  const recommend = async (
    type: Extract<AIServiceType, 'produtos' | 'estoque' | 'roteamento'>,
    data: Record<string, unknown>
  ) => {
    const response = await icarusBrain.query({ type, data })
    if (!response.success) {
      throw new Error(response.error)
    }
    return response.data
  }

  /**
   * Chat with AI assistant
   */
  const chat = async (message: string) => {
    const response = await icarusBrain.query({
      type: 'assistente',
      data: { message },
    })
    if (!response.success) {
      throw new Error(response.error)
    }
    return response.data
  }

  /**
   * Generic AI query mutation
   */
  const queryMutation = useMutation({
    mutationFn: async (request: AIRequest) => {
      const response = await icarusBrain.query(request)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response
    },
  })

  return {
    predict,
    analyze,
    recommend,
    chat,
    query: queryMutation.mutateAsync,
    isLoading: queryMutation.isPending,
    error: queryMutation.error,
  }
}

/**
 * Hook for querying AI with React Query caching
 */
export function useAIQuery<T = unknown>(
  queryKey: string[],
  request: AIRequest
) {
  return useQuery<AIResponse<T>>({
    queryKey,
    queryFn: async () => {
      const response = await icarusBrain.query(request)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
