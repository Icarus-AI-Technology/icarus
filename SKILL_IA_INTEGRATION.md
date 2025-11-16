# 🤖 SKILL: Integração com IA (IcarusBrain)

## 🎯 Hook useIcarusBrain

### Implementação

```typescript
// hooks/useIcarusBrain.ts
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
```

---

## 🔌 Uso nos Componentes

### Exemplo: Previsão de Vendas

```tsx
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

function SalesForecast() {
  const { predict, loading, error } = useIcarusBrain()
  const [forecast, setForecast] = useState(null)

  const handlePredict = async () => {
    try {
      const result = await predict({
        type: 'sales_forecast',
        data: {
          historical: salesHistory,
          period: '30_days'
        }
      })
      setForecast(result)
    } catch (err) {
      console.error('Forecast failed:', err)
    }
  }

  return (
    <div>
      <button onClick={handlePredict} disabled={loading}>
        {loading ? 'Processando...' : 'Gerar Previsão'}
      </button>

      {error && <p className="text-red-400">{error.message}</p>}
      {forecast && <ForecastChart data={forecast} />}
    </div>
  )
}
```

### Exemplo: Análise de Cliente

```tsx
function CustomerAnalysis({ customerId }: { customerId: string }) {
  const { analyze, loading } = useIcarusBrain()
  const [insights, setInsights] = useState(null)

  useEffect(() => {
    const loadAnalysis = async () => {
      const result = await analyze({
        type: 'customer_behavior',
        targetId: customerId
      })
      setInsights(result)
    }
    loadAnalysis()
  }, [customerId])

  if (loading) return <Loading />

  return <InsightsDisplay data={insights} />
}
```

---

## 🖥️ Backend Implementation

### API Route `/api/ia/predict`

```typescript
// app/api/ia/predict/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    // Validação
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Processar com OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Você é o IcarusBrain, especialista em previsões para ERP.`
        },
        {
          role: 'user',
          content: `Tipo: ${type}\nDados: ${JSON.stringify(data)}\n\nGere uma previsão precisa.`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    )
  }
}
```

---

## ✅ Error Handling

Sempre inclua feedback visual:

```tsx
{loading && (
  <div className="flex items-center gap-2 text-blue-400">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Processando com IA...</span>
  </div>
)}

{error && (
  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
    <p className="text-red-400 text-sm">
      {error.message || 'Erro ao processar IA'}
    </p>
  </div>
)}
```

---

**Versão**: 1.0.0
**Status**: ✅ Pronto para uso
