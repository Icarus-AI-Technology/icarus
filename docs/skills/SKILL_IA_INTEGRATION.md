# 🧠 SKILL: IA Integration (IcarusBrain)

Guia completo para integrar serviços de IA no ICARUS.

---

## 🎯 Hook Principal

```tsx
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

const { predict, analyze, recommend, chat } = useIcarusBrain()
```

---

## 📦 Serviços Disponíveis

### 1. Previsão de Demanda

**Objetivo**: Prever vendas/demanda de produtos para 30-90 dias

```tsx
async function handlePrevisaoDemanda() {
  const forecast = await predict('demanda', {
    produto_id: '123',     // ID do produto
    dias: 30,              // 30, 60 ou 90
    sazonalidade: true     // Considerar sazonalidade (opcional)
  })

  console.log(forecast)
  /*
  {
    valores: [120, 135, 142, ...],  // Array com 30 valores
    confidence: 0.92,                // 92% de confiança
    tendencia: 'crescente',          // 'crescente' | 'estavel' | 'decrescente'
    pico_previsto: {
      dia: 15,                       // Dia do mês com maior demanda
      valor: 180
    }
  }
  */
}
```

**Exemplo Completo**:

```tsx
import { useState } from 'react'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export function PrevisaoDemanda() {
  const [produtoId, setProdutoId] = useState('')
  const [dias, setDias] = useState('30')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const { predict } = useIcarusBrain()
  const { toast } = useToast()

  async function handlePredict() {
    if (!produtoId) {
      toast({ title: 'Erro', description: 'Selecione um produto', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const result = await predict('demanda', {
        produto_id: produtoId,
        dias: parseInt(dias)
      })

      setForecast(result)
      toast({ title: 'Previsão gerada!', description: `Confiança: ${(result.confidence * 100).toFixed(1)}%` })
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="neu-soft">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">🔮 Previsão de Demanda</h3>

        <div className="space-y-4">
          <div className="form-row">
            <label>Produto</label>
            <Select value={produtoId} onValueChange={setProdutoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {/* Listar produtos */}
              </SelectContent>
            </Select>
          </div>

          <div className="form-row">
            <label>Período</label>
            <Select value={dias} onValueChange={setDias}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handlePredict} disabled={loading} className="w-full">
            {loading ? 'Analisando...' : 'Gerar Previsão'}
          </Button>

          {forecast && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-sm font-semibold mb-2">Resultado:</p>
              <p className="text-xs">Confiança: {(forecast.confidence * 100).toFixed(1)}%</p>
              <p className="text-xs">Tendência: {forecast.tendencia}</p>
              <p className="text-xs">Pico previsto: Dia {forecast.pico_previsto?.dia} ({forecast.pico_previsto?.valor} unidades)</p>
              {/* Aqui: Renderizar gráfico com forecast.valores */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### 2. Score de Inadimplência

**Objetivo**: Calcular risco de inadimplência de cliente (0-100)

```tsx
async function handleScoreInadimplencia() {
  const score = await analyze('inadimplencia', {
    cliente_id: '456'
  })

  console.log(score)
  /*
  {
    score: 78,                 // 0-100 (maior = menor risco)
    risco: 'medio',            // 'baixo' | 'medio' | 'alto'
    fatores: [
      { fator: 'historico_pagamento', peso: 40, valor: 85 },
      { fator: 'situacao_financeira', peso: 30, valor: 70 },
      { fator: 'valor_divida', peso: 20, valor: 75 },
      { fator: 'tempo_relacionamento', peso: 10, valor: 90 }
    ],
    recomendacao: 'Conceder crédito com limite R$ 50.000'
  }
  */
}
```

**Exemplo Completo**:

```tsx
export function ScoreInadimplencia({ clienteId }: { clienteId: string }) {
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const { analyze } = useIcarusBrain()

  async function handleAnalyze() {
    setLoading(true)

    try {
      const result = await analyze('inadimplencia', { cliente_id: clienteId })
      setScore(result)
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clienteId) handleAnalyze()
  }, [clienteId])

  if (loading) return <div>Analisando...</div>

  if (!score) return null

  const scoreColor =
    score.risco === 'baixo' ? 'text-green-600' :
    score.risco === 'medio' ? 'text-yellow-600' :
    'text-red-600'

  return (
    <Card className="neu-soft">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">📊 Score de Inadimplência</h3>

        <div className="text-center mb-6">
          <p className={`text-5xl font-bold ${scoreColor}`}>{score.score}</p>
          <p className="text-sm text-gray-600">Risco: {score.risco}</p>
        </div>

        <div className="space-y-2 mb-4">
          {score.fatores.map((fator) => (
            <div key={fator.fator}>
              <div className="flex justify-between text-xs mb-1">
                <span>{fator.fator.replace('_', ' ')}</span>
                <span>{fator.valor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${fator.valor}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 p-3 bg-gray-100 dark:bg-gray-800 rounded">
          💡 {score.recomendacao}
        </p>
      </CardContent>
    </Card>
  )
}
```

---

### 3. Recomendação de Produtos

**Objetivo**: Sugerir produtos para cliente baseado em ML

```tsx
async function handleRecomendacao() {
  const produtos = await recommend('produtos', {
    cliente_id: '789',
    limite: 5,              // Top 5 produtos
    categoria: 'protese'    // Filtrar por categoria (opcional)
  })

  console.log(produtos)
  /*
  [
    {
      produto_id: '101',
      nome: 'Prótese Joelho Premium',
      score: 0.95,
      motivo: 'Perfil similar a compras anteriores'
    },
    {
      produto_id: '102',
      nome: 'Prótese Quadril Titanium',
      score: 0.88,
      motivo: 'Clientes similares compraram'
    },
    // ... mais 3
  ]
  */
}
```

---

### 4. Chat Assistente

**Objetivo**: Responder perguntas sobre dados do sistema

```tsx
async function handleChat() {
  const response = await chat('Qual o produto mais vendido este mês?', {
    contexto: 'vendas',     // Contexto para melhor resposta
    usuario_id: '123'       // Para personalização
  })

  console.log(response)
  /*
  {
    resposta: 'O produto mais vendido este mês foi "Prótese Joelho Premium" com 42 unidades vendidas...',
    acoes: [
      { tipo: 'link', label: 'Ver Produto', url: '/produtos/101' },
      { tipo: 'action', label: 'Gerar Relatório', action: 'gerar_relatorio_vendas' }
    ],
    confidence: 0.95
  }
  */
}
```

**Exemplo Completo**:

```tsx
export function ChatAssistente() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { chat } = useIcarusBrain()

  async function handleSend() {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chat(input, {
        contexto: 'geral',
        historico: messages  // Passar histórico para contexto
      })

      const aiMessage = { role: 'assistant', content: response.resposta, acoes: response.acoes }
      setMessages([...messages, userMessage, aiMessage])
    } catch (err) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="neu-soft">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">💬 Chat Assistente</h3>

        <div className="h-96 overflow-y-auto mb-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <p className="text-sm">{msg.content}</p>
                {msg.acoes && (
                  <div className="mt-2 space-x-2">
                    {msg.acoes.map((acao, j) => (
                      <Button key={j} size="sm" variant="outline">
                        {acao.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Faça uma pergunta..."
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading}>
            {loading ? 'Pensando...' : 'Enviar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## ⚙️ Configuração Avançada

### Custom Model

```tsx
const { predict } = useIcarusBrain({
  model: 'claude-3-haiku-20240307',  // Modelo menor/mais rápido
  temperature: 0.5,                  // Menos criativo (mais determinístico)
  max_tokens: 1000                   // Limitar resposta
})
```

### Timeout

```tsx
async function handleWithTimeout() {
  try {
    const result = await Promise.race([
      predict('demanda', { produto_id: '123', dias: 30 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
    ])

    return result
  } catch (err) {
    if (err.message === 'Timeout') {
      toast({ title: 'Timeout', description: 'A IA demorou muito para responder', variant: 'destructive' })
    }
  }
}
```

### Cache de Respostas

```tsx
const cache = new Map()

async function cachedPredict(key, data) {
  if (cache.has(key)) {
    console.log('Cache hit!')
    return cache.get(key)
  }

  const result = await predict('demanda', data)
  cache.set(key, result)

  // Limpar cache após 1h
  setTimeout(() => cache.delete(key), 3600000)

  return result
}
```

### Retry com Backoff

```tsx
async function retryPredict(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await predict('demanda', data)
    } catch (err) {
      if (i === maxRetries - 1) throw err

      const delay = Math.pow(2, i) * 1000  // 1s, 2s, 4s
      console.log(`Retry ${i + 1}/${maxRetries} em ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

---

## 📊 Monitoramento

### Log de Chamadas

```tsx
async function handlePredictWithLog() {
  const start = Date.now()

  try {
    const result = await predict('demanda', { produto_id: '123', dias: 30 })

    console.log({
      service: 'predict.demanda',
      duration: Date.now() - start,
      success: true,
      confidence: result.confidence
    })

    return result
  } catch (err) {
    console.error({
      service: 'predict.demanda',
      duration: Date.now() - start,
      success: false,
      error: err.message
    })

    throw err
  }
}
```

---

## ✅ Checklist de Integração

- [ ] Importou `useIcarusBrain` corretamente?
- [ ] Tratou loading state?
- [ ] Tratou erros (try/catch)?
- [ ] Mostrou feedback ao usuário (toast)?
- [ ] Usou await corretamente?
- [ ] Validou inputs antes de chamar IA?
- [ ] Implementou timeout (opcional)?
- [ ] Logou métricas (opcional)?
- [ ] Cache de respostas (opcional)?
- [ ] Testou em ambiente real?

---

**✅ Integrações IA poderosas e confiáveis!**
