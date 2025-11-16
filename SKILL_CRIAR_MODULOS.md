# 📦 SKILL: Criar Módulos ICARUS

## 🎯 Objetivo

Este guia ensina como criar um módulo completo no ICARUS seguindo todos os padrões estabelecidos.

---

## 📋 Checklist de Criação

- [ ] Definir estrutura de dados (types)
- [ ] Criar schema Zod de validação
- [ ] Implementar CRUD Supabase
- [ ] Criar componentes UI (OraclusX DS)
- [ ] Implementar KPIs
- [ ] Criar sistema de Tabs (Lista/Form/Kanban)
- [ ] Integrar IA (se aplicável)
- [ ] Adicionar testes
- [ ] Documentar

---

## 🏗️ Estrutura de um Módulo

```
src/modules/[nome-modulo]/
├── components/
│   ├── [Nome]Card.tsx          # Card de listagem
│   ├── [Nome]Form.tsx          # Formulário
│   ├── [Nome]KPIs.tsx          # KPIs
│   ├── [Nome]List.tsx          # Lista/Tabela
│   └── [Nome]Kanban.tsx        # Kanban (opcional)
│
├── hooks/
│   └── use[Nome].ts            # Hook customizado
│
├── services/
│   └── [nome].service.ts       # CRUD Supabase
│
├── types/
│   └── [nome].types.ts         # Types TypeScript
│
├── schemas/
│   └── [nome].schema.ts        # Schemas Zod
│
└── page.tsx                     # Página principal
```

---

## 📘 Template Base

### 1. Types (`types/product.types.ts`)

```typescript
export interface Product {
  id: string
  code: string
  name: string
  description: string | null
  category_id: string
  price: number
  cost: number
  stock: number
  min_stock: number
  unit: string
  active: boolean
  created_at: string
  updated_at: string

  // Relations
  category?: {
    id: string
    name: string
  }
}

export interface ProductFormData {
  code: string
  name: string
  description?: string
  category_id: string
  price: number
  cost: number
  stock: number
  min_stock: number
  unit: string
  active: boolean
}

export interface ProductFilters {
  search?: string
  category_id?: string
  active?: boolean
}

export interface ProductKPIs {
  total: number
  active: number
  lowStock: number
  totalValue: number
}
```

---

### 2. Schema Zod (`schemas/product.schema.ts`)

```typescript
import { z } from 'zod'

export const productSchema = z.object({
  code: z.string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres'),

  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),

  category_id: z.string()
    .uuid('Categoria inválida'),

  price: z.number()
    .min(0, 'Preço deve ser maior ou igual a zero')
    .positive('Preço deve ser positivo'),

  cost: z.number()
    .min(0, 'Custo deve ser maior ou igual a zero'),

  stock: z.number()
    .int('Estoque deve ser um número inteiro')
    .min(0, 'Estoque deve ser maior ou igual a zero'),

  min_stock: z.number()
    .int('Estoque mínimo deve ser um número inteiro')
    .min(0, 'Estoque mínimo deve ser maior ou igual a zero'),

  unit: z.string()
    .min(1, 'Unidade é obrigatória')
    .max(10, 'Unidade deve ter no máximo 10 caracteres'),

  active: z.boolean()
    .default(true)
})

export type ProductFormData = z.infer<typeof productSchema>
```

---

### 3. Service Supabase (`services/product.service.ts`)

```typescript
import { supabase } from '@/lib/supabase'
import type { Product, ProductFormData, ProductFilters } from '../types/product.types'

export class ProductService {
  // CREATE
  static async create(data: ProductFormData): Promise<Product> {
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select('*, category(*)')
      .single()

    if (error) throw error
    return product
  }

  // READ (List with filters)
  static async list(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*, category(*)')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // READ (Single)
  static async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // UPDATE
  static async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const { data: product, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select('*, category(*)')
      .single()

    if (error) throw error
    return product
  }

  // DELETE
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // KPIs
  static async getKPIs(): Promise<ProductKPIs> {
    const { data: products, error } = await supabase
      .from('products')
      .select('active, stock, min_stock, price')

    if (error) throw error

    const total = products.length
    const active = products.filter(p => p.active).length
    const lowStock = products.filter(p => p.stock <= p.min_stock).length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

    return { total, active, lowStock, totalValue }
  }
}
```

---

### 4. Hook Customizado (`hooks/useProducts.ts`)

```typescript
import { useState, useEffect } from 'react'
import { ProductService } from '../services/product.service'
import type { Product, ProductFilters, ProductKPIs } from '../types/product.types'

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [kpis, setKPIs] = useState<ProductKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const [productsData, kpisData] = await Promise.all([
        ProductService.list(filters),
        ProductService.getKPIs()
      ])

      setProducts(productsData)
      setKPIs(kpisData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [filters])

  const createProduct = async (data: ProductFormData) => {
    const product = await ProductService.create(data)
    setProducts(prev => [product, ...prev])
    await loadProducts() // Reload KPIs
    return product
  }

  const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    const product = await ProductService.update(id, data)
    setProducts(prev => prev.map(p => p.id === id ? product : p))
    await loadProducts() // Reload KPIs
    return product
  }

  const deleteProduct = async (id: string) => {
    await ProductService.delete(id)
    setProducts(prev => prev.filter(p => p.id !== id))
    await loadProducts() // Reload KPIs
  }

  return {
    products,
    kpis,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    reload: loadProducts
  }
}
```

---

### 5. KPIs Component (`components/ProductKPIs.tsx`)

```tsx
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react'
import type { ProductKPIs } from '../types/product.types'

interface ProductKPIsProps {
  data: ProductKPIs
}

export function ProductKPIs({ data }: ProductKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total */}
      <div className="
        bg-gradient-to-br from-gray-900/90 to-gray-800/90
        backdrop-blur-sm
        p-6 rounded-2xl
        border border-white/10
        shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        hover:border-blue-500/30
        transition-all duration-200
      ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total de Produtos</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">{data.total}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Package className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Ativos */}
      <div className="
        bg-gradient-to-br from-gray-900/90 to-gray-800/90
        backdrop-blur-sm
        p-6 rounded-2xl
        border border-white/10
        shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        hover:border-green-500/30
        transition-all duration-200
      ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Produtos Ativos</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">{data.active}</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* Estoque Baixo */}
      <div className="
        bg-gradient-to-br from-gray-900/90 to-gray-800/90
        backdrop-blur-sm
        p-6 rounded-2xl
        border border-white/10
        shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        hover:border-yellow-500/30
        transition-all duration-200
      ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Estoque Baixo</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">{data.lowStock}</p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Valor Total */}
      <div className="
        bg-gradient-to-br from-gray-900/90 to-gray-800/90
        backdrop-blur-sm
        p-6 rounded-2xl
        border border-white/10
        shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        hover:border-purple-500/30
        transition-all duration-200
      ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Valor Total</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(data.totalValue)}
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <DollarSign className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 6. Form Component (`components/ProductForm.tsx`)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '../schemas/product.schema'
import type { ProductFormData } from '../types/product.types'

interface ProductFormProps {
  initialData?: ProductFormData
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Código *
          </label>
          <input
            {...register('code')}
            type="text"
            className="
              bg-gray-900/50 backdrop-blur-sm
              w-full px-4 py-3 rounded-xl
              border border-white/10
              text-gray-100 placeholder-gray-500
              shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
              focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              transition-all duration-200
            "
          />
          {errors.code && (
            <p className="text-red-400 text-sm mt-1">{errors.code.message}</p>
          )}
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome *
          </label>
          <input
            {...register('name')}
            type="text"
            className="
              bg-gray-900/50 backdrop-blur-sm
              w-full px-4 py-3 rounded-xl
              border border-white/10
              text-gray-100 placeholder-gray-500
              shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
              focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              transition-all duration-200
            "
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Descrição (full width) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="
            bg-gray-900/50 backdrop-blur-sm
            w-full px-4 py-3 rounded-xl
            border border-white/10
            text-gray-100 placeholder-gray-500
            shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
            focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
            resize-none
            transition-all duration-200
          "
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="
            bg-gradient-to-br from-gray-800 to-gray-900
            px-6 py-3 rounded-xl
            border border-white/10
            text-gray-100 font-medium
            shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.03)]
            hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            bg-gradient-to-br from-blue-500 to-blue-600
            px-6 py-3 rounded-xl
            border border-blue-400/20
            text-white font-medium
            shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(59,130,246,0.1)]
            hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
```

---

### 7. Page Principal (`page.tsx`)

```tsx
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProducts } from './hooks/useProducts'
import { ProductKPIs } from './components/ProductKPIs'
import { ProductList } from './components/ProductList'
import { ProductForm } from './components/ProductForm'
import { ProductKanban } from './components/ProductKanban'

type Tab = 'list' | 'form' | 'kanban'

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const { products, kpis, loading, createProduct, updateProduct } = useProducts()

  const handleSubmit = async (data: ProductFormData) => {
    await createProduct(data)
    setActiveTab('list')
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="min-h-screen bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Produtos</h1>
            <p className="text-gray-400 mt-1">Gerencie seu cadastro de produtos</p>
          </div>
          <button
            onClick={() => setActiveTab('form')}
            className="
              bg-gradient-to-br from-blue-500 to-blue-600
              px-6 py-3 rounded-xl
              border border-blue-400/20
              text-white font-medium
              shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(59,130,246,0.1)]
              hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
              active:scale-95
              transition-all duration-200
              flex items-center gap-2
            "
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>

        {/* KPIs */}
        {kpis && <ProductKPIs data={kpis} />}

        {/* Content */}
        <div className="
          bg-gradient-to-br from-gray-900/90 to-gray-800/90
          backdrop-blur-sm
          border border-white/10
          rounded-2xl p-6
          shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        ">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 mb-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`
                px-4 py-2 font-medium transition-colors
                ${activeTab === 'list'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              Lista
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`
                px-4 py-2 font-medium transition-colors
                ${activeTab === 'form'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              Formulário
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`
                px-4 py-2 font-medium transition-colors
                ${activeTab === 'kanban'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              Kanban
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'list' && <ProductList products={products} />}
          {activeTab === 'form' && (
            <ProductForm
              onSubmit={handleSubmit}
              onCancel={() => setActiveTab('list')}
            />
          )}
          {activeTab === 'kanban' && <ProductKanban products={products} />}
        </div>

      </div>
    </div>
  )
}
```

---

## 🚀 Próximos Passos

1. **Copiar template** acima
2. **Substituir** "Product" pelo nome do seu módulo
3. **Adaptar** fields conforme necessidade
4. **Implementar** componentes List e Kanban
5. **Adicionar** integração IA (se necessário)
6. **Testar** tudo

---

**Versão**: 1.0.0
**Data**: 2025-11-15
**Status**: ✅ Template pronto

📦 **Use este template como base para criar qualquer módulo ICARUS!**
