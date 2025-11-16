import { useState } from 'react'

interface PredictParams {
  type: 'sales_forecast' | 'demand_forecast' | 'price_optimization'
  data: Record<string, any>
}

interface AnalyzeParams {
  type: 'customer_behavior' | 'product_performance' | 'market_trends'
  targetId: string
}

interface RecommendParams {
  context: 'product_upsell' | 'customer_retention' | 'inventory_optimization'
  userId: string
}

interface ChatParams {
  message: string
  context?: Record<string, any>
}

export function useIcarusBrain() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const predict = async (params: PredictParams) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ia/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) throw new Error('Prediction failed')

      const result = await response.json()
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const analyze = async (params: AnalyzeParams) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ia/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result = await response.json()
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const recommend = async (params: RecommendParams) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ia/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) throw new Error('Recommendation failed')

      const result = await response.json()
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const chat = async (params: ChatParams) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) throw new Error('Chat failed')

      const result = await response.json()
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { predict, analyze, recommend, chat, loading, error }
}
