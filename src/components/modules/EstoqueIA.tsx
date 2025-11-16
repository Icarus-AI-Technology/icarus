import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  Package, AlertTriangle, TrendingUp, Brain, RefreshCw,
  ArrowUp, ArrowDown, ChevronRight
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  code: string
  stock_quantity: number
  min_stock: number
  max_stock: number | null
  sale_price: number
  status: 'critical' | 'low' | 'normal' | 'high'
}

interface Prediction {
  productId: string
  productName: string
  predictedQuantity: number
  trend: 'increasing' | 'decreasing'
  confidence: number
  recommendation: string
}

export function EstoqueIA() {
  const { supabase, isConfigured } = useSupabase()
  const { predict } = useIcarusBrain()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loadingPredictions, setLoadingPredictions] = useState(false)

  // Mock data para demonstração
  const stockLevelsData = [
    { category: 'Cardiologia', quantity: 45, status: 'normal' },
    { category: 'Ortopedia', quantity: 12, status: 'low' },
    { category: 'Neurocirurgia', quantity: 8, status: 'critical' },
    { category: 'Oftalmologia', quantity: 67, status: 'high' },
    { category: 'Vascular', quantity: 23, status: 'normal' },
  ]

  const demandTrendData = [
    { month: 'Jan', demanda: 45 },
    { month: 'Fev', demanda: 52 },
    { month: 'Mar', demanda: 48 },
    { month: 'Abr', demanda: 61 },
    { month: 'Mai', demanda: 55 },
    { month: 'Jun', demanda: 67 },
  ]

  useEffect(() => {
    loadProducts()
  }, [isConfigured])

  const loadProducts = async () => {
    setLoading(true)

    if (!isConfigured) {
      // Mock data
      setTimeout(() => {
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Stent Coronário Farmacológico',
            code: 'STN-CARD-001',
            stock_quantity: 5,
            min_stock: 10,
            max_stock: 50,
            sale_price: 12000,
            status: 'critical'
          },
          {
            id: '2',
            name: 'Prótese de Quadril Cerâmica',
            code: 'PRT-ORTO-001',
            stock_quantity: 12,
            min_stock: 15,
            max_stock: 40,
            sale_price: 22000,
            status: 'low'
          },
          {
            id: '3',
            name: 'Marcapasso Definitivo',
            code: 'MCP-CARD-001',
            stock_quantity: 25,
            min_stock: 10,
            max_stock: 30,
            sale_price: 25000,
            status: 'normal'
          },
        ]
        setProducts(mockProducts)
        setLoading(false)
      }, 500)
      return
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('stock_quantity', { ascending: true })
        .limit(20)

      if (error) throw error

      const productsWithStatus = (data || []).map(p => ({
        ...p,
        status: getStockStatus(p.stock_quantity, p.min_stock, p.max_stock)
      }))

      setProducts(productsWithStatus)
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (quantity: number, min: number, max: number | null): Product['status'] => {
    if (quantity === 0) return 'critical'
    if (quantity < min * 0.5) return 'critical'
    if (quantity < min) return 'low'
    if (max && quantity > max * 0.9) return 'high'
    return 'normal'
  }

  const generatePredictions = async () => {
    setLoadingPredictions(true)
    toast.info('Gerando previsões com IcarusBrain...')

    try {
      // Generate predictions for top 3 products
      const predictionsPromises = products.slice(0, 3).map(async (product) => {
        const result = await predict('demand', {
          productId: product.id,
          days: 30
        })

        if (result?.success) {
          return {
            productId: product.id,
            productName: product.name,
            predictedQuantity: result.data.predictedQuantity,
            trend: result.data.trend,
            confidence: result.confidence || 0,
            recommendation: result.data.recommendation
          }
        }
        return null
      })

      const results = await Promise.all(predictionsPromises)
      const validPredictions = results.filter(p => p !== null) as Prediction[]

      setPredictions(validPredictions)
      toast.success(`${validPredictions.length} previsões geradas com sucesso!`)
    } catch (error) {
      console.error('Error generating predictions:', error)
      toast.error('Erro ao gerar previsões')
    } finally {
      setLoadingPredictions(false)
    }
  }

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'critical': return '#EF4444'
      case 'low': return '#F59E0B'
      case 'normal': return '#10B981'
      case 'high': return '#6366F1'
    }
  }

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>
      case 'low': return <Badge variant="warning">Baixo</Badge>
      case 'normal': return <Badge variant="success">Normal</Badge>
      case 'high': return <Badge variant="info">Alto</Badge>
    }
  }

  const criticalCount = products.filter(p => p.status === 'critical').length
  const lowCount = products.filter(p => p.status === 'low').length

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Estoque IA"
        subtitle="Gestão inteligente de estoque com IA"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Estoque IA</h1>
          <p className="text-muted-foreground">
            Gestão inteligente de estoque com previsões de IA
          </p>
        </div>
        <Button
          onClick={generatePredictions}
          disabled={loadingPredictions}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          {loadingPredictions ? 'Gerando...' : 'Gerar Previsões IA'}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Crítico
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Ação imediata necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Baixo
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowCount}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Previsões IA
            </CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Análises geradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Níveis de Estoque por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#6366F1">
                  {stockLevelsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status as any)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="demanda" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Previsões de Demanda (IA)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{pred.productName}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Demanda prevista (30 dias): <strong>{pred.predictedQuantity} unidades</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pred.trend === 'increasing' ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={pred.trend === 'increasing' ? 'success' : 'warning'}>
                        {pred.trend === 'increasing' ? 'Crescente' : 'Decrescente'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    💡 {pred.recommendation}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Confiança: {(pred.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos em Estoque</CardTitle>
            <Button variant="outline" size="sm" onClick={loadProducts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">{product.code}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {product.stock_quantity} / {product.min_stock} un
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Estoque / Mínimo
                    </div>
                  </div>
                  {getStatusBadge(product.status)}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
