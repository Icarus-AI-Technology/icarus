'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Package, TrendingUp, AlertTriangle, DollarSign, Edit, Trash2 } from 'lucide-react'
import { Card, KPICard, Button, Input, Loading } from '@/components/ui'
import { useProducts } from './hooks/useProducts'
import { productSchema } from './schemas/product.schema'
import type { ProductFormData } from './types/product.types'

export default function ProdutosPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all')

  // Supabase integration
  const {
    products,
    kpis,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters
  } = useProducts()

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      active: true,
      stock: 0,
      min_stock: 0,
      cost: 0,
      price: 0,
      unit: 'UN',
    },
  })

  // Handle form submit
  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingId) {
        await updateProduct(editingId, data)
      } else {
        await createProduct(data)
      }

      reset()
      setEditingId(null)
      setActiveTab('list')
    } catch (err) {
      console.error('Error saving product:', err)
      alert(err instanceof Error ? err.message : 'Erro ao salvar produto')
    }
  }

  // Handle edit
  const handleEdit = (product: any) => {
    setEditingId(product.id)
    setValue('code', product.code)
    setValue('name', product.name)
    setValue('description', product.description || '')
    setValue('price', product.price)
    setValue('cost', product.cost)
    setValue('stock', product.stock)
    setValue('min_stock', product.min_stock)
    setValue('unit', product.unit)
    setValue('active', product.active)
    setActiveTab('form')
  }

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir o produto "${name}"?`)) {
      try {
        await deleteProduct(id)
      } catch (err) {
        console.error('Error deleting product:', err)
        alert('Erro ao excluir produto')
      }
    }
  }

  // Handle cancel
  const handleCancel = () => {
    reset()
    setEditingId(null)
    setActiveTab('list')
  }

  // Apply filters
  const handleApplyFilters = () => {
    setFilters({
      search: searchTerm || undefined,
      active: statusFilter !== 'all' ? statusFilter === 'true' : undefined,
    })
  }

  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-[#0f1419]">
        <Loading text="Carregando produtos..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/20">
            <h2 className="text-red-400 font-bold text-lg">Erro ao carregar dados</h2>
            <p className="text-red-300 mt-2">{error.message}</p>
            <p className="text-gray-400 text-sm mt-4">
              Verifique se o Supabase está configurado corretamente em .env.local
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Produtos</h1>
            <p className="text-gray-400 mt-1">Gerencie seu cadastro de produtos</p>
          </div>
          <Button
            onClick={() => {
              reset()
              setEditingId(null)
              setActiveTab('form')
            }}
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </Button>
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Total de Produtos"
              value={kpis.total}
              icon={<Package className="w-6 h-6" />}
              color="blue"
            />
            <KPICard
              label="Produtos Ativos"
              value={kpis.active}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <KPICard
              label="Estoque Baixo"
              value={kpis.lowStock}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="yellow"
            />
            <KPICard
              label="Valor Total"
              value={new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(kpis.totalValue)}
              icon={<DollarSign className="w-6 h-6" />}
              color="purple"
            />
          </div>
        )}

        {/* Content */}
        <Card>
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
              Lista ({products.length})
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
              {editingId ? 'Editar' : 'Novo'}
            </button>
          </div>

          {/* Tab Content - List */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                  className="
                    flex-1
                    bg-gray-900/50 backdrop-blur-sm
                    px-4 py-3 rounded-xl
                    border border-white/10
                    text-gray-100 placeholder-gray-500
                    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
                    focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                    transition-all duration-200
                  "
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="
                    bg-gray-900/50 backdrop-blur-sm
                    px-4 py-3 rounded-xl
                    border border-white/10
                    text-gray-100
                    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
                    focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                    transition-all duration-200
                    cursor-pointer
                  "
                >
                  <option value="all">Todos os status</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
                <Button onClick={handleApplyFilters} variant="secondary">
                  Filtrar
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                        Preço
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                        Estoque
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          Nenhum produto encontrado
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {product.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(product.price)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={
                              product.stock <= product.min_stock
                                ? 'text-yellow-400 font-medium'
                                : 'text-gray-300'
                            }>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`
                              inline-flex items-center gap-1
                              px-3 py-1 rounded-lg text-xs font-medium
                              ${product.active
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                              }
                            `}>
                              {product.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content - Form */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Grid 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Código"
                  {...register('code')}
                  error={errors.code?.message}
                  required
                  placeholder="PRD001"
                />

                <Input
                  label="Nome"
                  {...register('name')}
                  error={errors.name?.message}
                  required
                  placeholder="Nome do produto"
                />
              </div>

              {/* Descrição full width */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Descrição do produto..."
                  className={`
                    bg-gray-900/50 backdrop-blur-sm
                    w-full px-4 py-3 rounded-xl
                    border ${errors.description ? 'border-red-500/50' : 'border-white/10'}
                    text-gray-100 placeholder-gray-500
                    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
                    focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                    resize-none
                    transition-all duration-200
                  `}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Grid 4 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Preço"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  error={errors.price?.message}
                  required
                  placeholder="0.00"
                />

                <Input
                  label="Custo"
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                  error={errors.cost?.message}
                  required
                  placeholder="0.00"
                />

                <Input
                  label="Estoque"
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                  error={errors.stock?.message}
                  required
                  placeholder="0"
                />

                <Input
                  label="Est. Mínimo"
                  type="number"
                  {...register('min_stock', { valueAsNumber: true })}
                  error={errors.min_stock?.message}
                  required
                  placeholder="0"
                />
              </div>

              {/* Grid 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Unidade"
                  {...register('unit')}
                  error={errors.unit?.message}
                  required
                  placeholder="UN"
                  maxLength={10}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    {...register('active')}
                    className="
                      bg-gray-900/50 backdrop-blur-sm
                      w-full px-4 py-3 rounded-xl
                      border border-white/10
                      text-gray-100
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
                      focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                      transition-all duration-200
                      cursor-pointer
                    "
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {editingId ? 'Atualizar' : 'Salvar'} Produto
                </Button>
              </div>
            </form>
          )}
        </Card>

      </div>
    </div>
  )
}
