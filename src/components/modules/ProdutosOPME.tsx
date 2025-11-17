import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabase } from '@/hooks/useSupabase'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  Package, Plus, Search, Filter, Edit, Trash2, Eye,
  AlertTriangle, TrendingUp, Grid, List,
  Tag, DollarSign, Archive
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

interface Product {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  categoria_id: string
  nome_categoria?: string
  fabricante_id: string
  nome_fabricante?: string
  preco_custo: number
  preco_venda: number
  quantidade_estoque: number
  estoque_minimo: number
  estoque_maximo: number | null
  unidade: string
  ativo: boolean
  codigo_anvisa: string | null
}

interface Category {
  id: string
  nome: string
  descricao: string | null
}

interface Manufacturer {
  id: string
  nome: string
  pais: string
}

export function ProdutosOPME() {
  const { supabase, isConfigured } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    categoria_id: '',
    fabricante_id: '',
    preco_custo: '',
    preco_venda: '',
    quantidade_estoque: '',
    estoque_minimo: '',
    estoque_maximo: '',
    unidade: 'un',
    codigo_anvisa: ''
  })

  // Mock data
  const mockCategories: Category[] = [
    { id: '1', nome: 'Cardiologia', descricao: 'Produtos para procedimentos cardiovasculares' },
    { id: '2', nome: 'Ortopedia', descricao: 'Implantes e próteses ortopédicas' },
    { id: '3', nome: 'Neurocirurgia', descricao: 'Materiais para neurocirurgia' },
    { id: '4', nome: 'Oftalmologia', descricao: 'Produtos oftalmológicos' },
    { id: '5', nome: 'Vascular', descricao: 'Materiais vasculares' }
  ]

  const mockManufacturers: Manufacturer[] = [
    { id: '1', nome: 'Medtronic', pais: 'USA' },
    { id: '2', nome: 'Boston Scientific', pais: 'USA' },
    { id: '3', nome: 'Stryker', pais: 'USA' },
    { id: '4', nome: 'Johnson & Johnson', pais: 'USA' },
    { id: '5', nome: 'Zimmer Biomet', pais: 'USA' }
  ]

  const mockProducts: Product[] = [
    {
      id: '1',
      codigo: 'STN-CARD-001',
      nome: 'Stent Coronário Farmacológico',
      descricao: 'Stent coronário com liberação de medicamento para prevenção de reestenose',
      categoria_id: '1',
      nome_categoria: 'Cardiologia',
      fabricante_id: '1',
      nome_fabricante: 'Medtronic',
      preco_custo: 8000,
      preco_venda: 12000,
      quantidade_estoque: 5,
      estoque_minimo: 10,
      estoque_maximo: 50,
      unidade: 'un',
      ativo: true,
      codigo_anvisa: '80123456789'
    },
    {
      id: '2',
      codigo: 'PRT-ORTO-001',
      nome: 'Prótese de Quadril Cerâmica',
      descricao: 'Prótese total de quadril com componentes cerâmicos de alta durabilidade',
      categoria_id: '2',
      nome_categoria: 'Ortopedia',
      fabricante_id: '3',
      nome_fabricante: 'Stryker',
      preco_custo: 15000,
      preco_venda: 22000,
      quantidade_estoque: 12,
      estoque_minimo: 15,
      estoque_maximo: 40,
      unidade: 'un',
      ativo: true,
      codigo_anvisa: '80234567890'
    },
    {
      id: '3',
      codigo: 'MCP-CARD-001',
      nome: 'Marcapasso Definitivo',
      descricao: 'Marcapasso cardíaco definitivo de câmara dupla com telemetria',
      categoria_id: '1',
      nome_categoria: 'Cardiologia',
      fabricante_id: '1',
      nome_fabricante: 'Medtronic',
      preco_custo: 18000,
      preco_venda: 25000,
      quantidade_estoque: 25,
      estoque_minimo: 10,
      estoque_maximo: 30,
      unidade: 'un',
      ativo: true,
      codigo_anvisa: '80345678901'
    },
    {
      id: '4',
      codigo: 'LIO-OFTA-001',
      nome: 'Lente Intraocular Dobrável',
      descricao: 'Lente intraocular dobrável para cirurgia de catarata',
      categoria_id: '4',
      nome_categoria: 'Oftalmologia',
      fabricante_id: '4',
      nome_fabricante: 'Johnson & Johnson',
      preco_custo: 800,
      preco_venda: 1500,
      quantidade_estoque: 45,
      estoque_minimo: 30,
      estoque_maximo: 100,
      unidade: 'un',
      ativo: true,
      codigo_anvisa: '80456789012'
    },
    {
      id: '5',
      codigo: 'PLT-NEURO-001',
      nome: 'Placa Craniana Titânio',
      descricao: 'Placa de titânio para cranioplastia',
      categoria_id: '3',
      nome_categoria: 'Neurocirurgia',
      fabricante_id: '2',
      nome_fabricante: 'Boston Scientific',
      preco_custo: 3500,
      preco_venda: 5500,
      quantidade_estoque: 8,
      estoque_minimo: 12,
      estoque_maximo: 35,
      unidade: 'un',
      ativo: true,
      codigo_anvisa: '80567890123'
    }
  ]

  // Analytics data
  const categoryDistribution = [
    { name: 'Cardiologia', value: 35, color: '#6366F1' },
    { name: 'Ortopedia', value: 28, color: '#10B981' },
    { name: 'Neurocirurgia', value: 18, color: '#F59E0B' },
    { name: 'Oftalmologia', value: 12, color: '#EF4444' },
    { name: 'Vascular', value: 7, color: '#8B5CF6' },
  ]

  const stockTrend = [
    { month: 'Jul', estoque: 185 },
    { month: 'Ago', estoque: 220 },
    { month: 'Set', estoque: 198 },
    { month: 'Out', estoque: 245 },
    { month: 'Nov', estoque: 268 },
    { month: 'Dez', estoque: 312 },
  ]

  const topProducts = [
    { name: 'Stent Coronário', sales: 45 },
    { name: 'Prótese Quadril', sales: 38 },
    { name: 'Marcapasso', sales: 32 },
    { name: 'Lente Intraocular', sales: 28 },
    { name: 'Placa Titânio', sales: 22 },
  ]

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured])

  const loadData = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        setProducts(mockProducts)
        setCategories(mockCategories)
        setManufacturers(mockManufacturers)
        setLoading(false)
      }, 500)
      return
    }

    try {
      // Fetch products with joins
      const { data: productsData, error: productsError } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categorias_produtos(id, nome),
          fabricante:fabricantes(id, nome)
        `)
        .order('nome')

      if (productsError) throw productsError

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categorias_produtos')
        .select('*')
        .order('nome')

      if (categoriesError) throw categoriesError

      // Fetch manufacturers
      const { data: manufacturersData, error: manufacturersError } = await supabase
        .from('fabricantes')
        .select('*')
        .order('nome')

      if (manufacturersError) throw manufacturersError

      setProducts(productsData || [])
      setCategories(categoriesData || [])
      setManufacturers(manufacturersData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
      // Fallback to mock data
      setProducts(mockProducts)
      setCategories(mockCategories)
      setManufacturers(mockManufacturers)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.code || !formData.name || !formData.category_id ||
        !formData.manufacturer_id || !formData.sale_price) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!isConfigured) {
      // Mock create
      const newProduct: Product = {
        id: String(products.length + 1),
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id,
        category_name: categories.find(c => c.id === formData.category_id)?.name,
        manufacturer_id: formData.manufacturer_id,
        manufacturer_name: manufacturers.find(m => m.id === formData.manufacturer_id)?.name,
        cost_price: parseFloat(formData.cost_price) || 0,
        sale_price: parseFloat(formData.sale_price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
        unit: formData.unit,
        active: true,
        anvisa_register: formData.anvisa_register || null
      }
      setProducts([...products, newProduct])
      toast.success('Produto cadastrado com sucesso!')
      resetForm()
      setIsCreateDialogOpen(false)
      return
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .insert([{
          code: formData.code,
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id,
          manufacturer_id: formData.manufacturer_id,
          cost_price: parseFloat(formData.cost_price) || 0,
          sale_price: parseFloat(formData.sale_price),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          min_stock: parseInt(formData.min_stock) || 0,
          max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
          unit: formData.unit,
          anvisa_register: formData.anvisa_register || null,
          active: true
        }])

      if (error) throw error

      toast.success('Produto cadastrado com sucesso!')
      loadData()
     
      resetForm()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Erro ao cadastrar produto')
    }
  }

  const handleUpdate = async () => {
    if (!selectedProduct) return

    if (!isConfigured) {
      // Mock update
      const updatedProducts = products.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              code: formData.code,
              name: formData.name,
              description: formData.description || null,
              category_id: formData.category_id,
              category_name: categories.find(c => c.id === formData.category_id)?.name,
              manufacturer_id: formData.manufacturer_id,
              manufacturer_name: manufacturers.find(m => m.id === formData.manufacturer_id)?.name,
              cost_price: parseFloat(formData.cost_price) || 0,
              sale_price: parseFloat(formData.sale_price),
              stock_quantity: parseInt(formData.stock_quantity) || 0,
              min_stock: parseInt(formData.min_stock) || 0,
              max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
              unit: formData.unit,
              anvisa_register: formData.anvisa_register || null
            }
          : p
      )
      setProducts(updatedProducts)
      toast.success('Produto atualizado com sucesso!')
      resetForm()
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      return
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .update({
          code: formData.code,
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id,
          manufacturer_id: formData.manufacturer_id,
          cost_price: parseFloat(formData.cost_price) || 0,
          sale_price: parseFloat(formData.sale_price),
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          min_stock: parseInt(formData.min_stock) || 0,
          max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
          unit: formData.unit,
          anvisa_register: formData.anvisa_register || null
        })
        .eq('id', selectedProduct.id)

      if (error) throw error

      toast.success('Produto atualizado com sucesso!')
      loadData()
     
      resetForm()
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Erro ao atualizar produto')
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Deseja realmente excluir o produto ${product.name}?`)) {
      return
    }

    if (!isConfigured) {
      // Mock delete
      setProducts(products.filter(p => p.id !== product.id))
      toast.success('Produto excluído com sucesso!')
      return
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      toast.success('Produto excluído com sucesso!')
      loadData()
     
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Erro ao excluir produto')
    }
  }

  const handleToggleActive = async (product: Product) => {
    if (!isConfigured) {
      // Mock toggle
      const updatedProducts = products.map(p =>
        p.id === product.id ? { ...p, active: !p.active } : p
      )
      setProducts(updatedProducts)
      toast.success(`Produto ${product.active ? 'desativado' : 'ativado'} com sucesso!`)
      return
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .update({ active: !product.active })
        .eq('id', product.id)

      if (error) throw error

      toast.success(`Produto ${product.active ? 'desativado' : 'ativado'} com sucesso!`)
      loadData()
     
    } catch (error) {
      console.error('Error toggling product status:', error)
      toast.error('Erro ao alterar status do produto')
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      manufacturer_id: product.manufacturer_id,
      cost_price: String(product.cost_price),
      sale_price: String(product.sale_price),
      stock_quantity: String(product.stock_quantity),
      min_stock: String(product.min_stock),
      max_stock: product.max_stock ? String(product.max_stock) : '',
      unit: product.unit,
      anvisa_register: product.anvisa_register || ''
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category_id: '',
      manufacturer_id: '',
      cost_price: '',
      sale_price: '',
      stock_quantity: '',
      min_stock: '',
      max_stock: '',
      unit: 'un',
      anvisa_register: ''
    })
  }

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return 'critical'
    if (product.stock_quantity < product.min_stock * 0.5) return 'critical'
    if (product.stock_quantity < product.min_stock) return 'low'
    if (product.max_stock && product.stock_quantity > product.max_stock * 0.9) return 'high'
    return 'normal'
  }

  const getStockBadge = (product: Product) => {
    const status = getStockStatus(product)
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>
      case 'low':
        return <Badge variant="warning">Baixo</Badge>
      case 'normal':
        return <Badge variant="success">Normal</Badge>
      case 'high':
        return <Badge variant="info">Alto</Badge>
    }
  }

  const calculateMargin = (cost: number, sale: number) => {
    if (cost === 0) return 0
    return ((sale - cost) / sale * 100).toFixed(1)
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'critical' && getStockStatus(product) === 'critical') ||
        (stockFilter === 'low' && getStockStatus(product) === 'low') ||
        (stockFilter === 'normal' && getStockStatus(product) === 'normal')

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [products, debouncedSearch, categoryFilter, stockFilter])

  const stats = {
    total: products.length,
    active: products.filter(p => p.active).length,
    critical: products.filter(p => getStockStatus(p) === 'critical').length,
    low: products.filter(p => getStockStatus(p) === 'low').length,
    totalValue: products.reduce((sum, p) => sum + (p.stock_quantity * p.sale_price), 0)
  }

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Produtos OPME"
        subtitle="Catálogo completo de produtos e materiais"
        kpiCount={5}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produtos OPME</h1>
          <p className="text-muted-foreground">
            Catálogo completo de produtos e materiais
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados do produto OPME
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: STN-CARD-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anvisa_register">Registro ANVISA</Label>
                  <Input
                    id="anvisa_register"
                    value={formData.anvisa_register}
                    onChange={(e) => setFormData({ ...formData, anvisa_register: e.target.value })}
                    placeholder="Ex: 80123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo do produto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do produto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer_id">Fabricante *</Label>
                  <Select
                    value={formData.manufacturer_id}
                    onValueChange={(value) => setFormData({ ...formData, manufacturer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fabricante" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id}>
                          {manufacturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Preço de Custo</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Preço de Venda *</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="cx">Caixa</SelectItem>
                      <SelectItem value="kit">Kit</SelectItem>
                      <SelectItem value="par">Par</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Estoque Atual</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock">Estoque Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_stock">Estoque Máximo</Label>
                  <Input
                    id="max_stock"
                    type="number"
                    value={formData.max_stock}
                    onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Cadastrar Produto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active} ativos
            </p>
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
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Reposição urgente
            </p>
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
            <div className="text-2xl font-bold text-yellow-600">{stats.low}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atenção necessária
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catálogo de Produtos</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Estoques</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {viewMode === 'list' ? (
                <div className="space-y-2">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.code}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Categoria</div>
                            <div className="text-sm font-medium">{product.category_name}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Estoque</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {product.stock_quantity} / {product.min_stock}
                              </span>
                              {getStockBadge(product)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Preço</div>
                            <div className="text-sm font-bold">{formatCurrency(product.sale_price)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Margem</div>
                            <div className="text-sm font-medium text-green-600">
                              {calculateMargin(product.cost_price, product.sale_price)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(product)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{product.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{product.code}</p>
                          </div>
                          {getStockBadge(product)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Categoria:</span>
                          <span className="font-medium">{product.category_name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Estoque:</span>
                          <span className="font-medium">{product.stock_quantity} {product.unit}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Preço:</span>
                          <span className="font-bold">{formatCurrency(product.sale_price)}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openViewDialog(product)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução do Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stockTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="estoque" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize os dados do produto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_code">Código *</Label>
                <Input
                  id="edit_code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_anvisa">Registro ANVISA</Label>
                <Input
                  id="edit_anvisa"
                  value={formData.anvisa_register}
                  onChange={(e) => setFormData({ ...formData, anvisa_register: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_name">Nome do Produto *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Descrição</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_category">Categoria *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_manufacturer">Fabricante *</Label>
                <Select
                  value={formData.manufacturer_id}
                  onValueChange={(value) => setFormData({ ...formData, manufacturer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_cost_price">Preço de Custo</Label>
                <Input
                  id="edit_cost_price"
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_sale_price">Preço de Venda *</Label>
                <Input
                  id="edit_sale_price"
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_unit">Unidade</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade</SelectItem>
                    <SelectItem value="cx">Caixa</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                    <SelectItem value="par">Par</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_stock_quantity">Estoque Atual</Label>
                <Input
                  id="edit_stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_min_stock">Estoque Mínimo</Label>
                <Input
                  id="edit_min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_stock">Estoque Máximo</Label>
                <Input
                  id="edit_max_stock"
                  type="number"
                  value={formData.max_stock}
                  onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              resetForm()
              setSelectedProduct(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
            <DialogDescription>
              {selectedProduct?.code}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <div className="text-lg font-medium">{selectedProduct.name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status Estoque</Label>
                  <div className="mt-1">{getStockBadge(selectedProduct)}</div>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">{selectedProduct.description}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Categoria</Label>
                  <div className="font-medium">{selectedProduct.category_name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fabricante</Label>
                  <div className="font-medium">{selectedProduct.manufacturer_name}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estoque Atual</Label>
                  <div className="font-bold text-lg">{selectedProduct.stock_quantity} {selectedProduct.unit}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estoque Mínimo</Label>
                  <div className="font-medium">{selectedProduct.min_stock} {selectedProduct.unit}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estoque Máximo</Label>
                  <div className="font-medium">{selectedProduct.max_stock || '-'} {selectedProduct.unit}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Preço de Custo</Label>
                  <div className="font-medium">{formatCurrency(selectedProduct.cost_price)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preço de Venda</Label>
                  <div className="font-bold text-lg">{formatCurrency(selectedProduct.sale_price)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Margem</Label>
                  <div className="font-medium text-green-600">
                    {calculateMargin(selectedProduct.cost_price, selectedProduct.sale_price)}%
                  </div>
                </div>
              </div>

              {selectedProduct.anvisa_register && (
                <div>
                  <Label className="text-muted-foreground">Registro ANVISA</Label>
                  <div className="font-medium">{selectedProduct.anvisa_register}</div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge variant={selectedProduct.active ? 'success' : 'destructive'}>
                  {selectedProduct.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              setSelectedProduct(null)
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
