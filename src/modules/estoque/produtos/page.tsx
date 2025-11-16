'use client'

import { useState } from 'react'
import { Plus, Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { Card, KPICard, Button } from '@/components/ui'

export default function ProdutosPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list')

  // Mock data (replace with real data from Supabase)
  const kpis = {
    total: 1250,
    active: 1180,
    lowStock: 45,
    totalValue: 458900.50
  }

  const mockProducts = [
    {
      id: '1',
      code: 'PRD001',
      name: 'Notebook Dell Inspiron',
      price: 3500,
      stock: 15,
      min_stock: 5,
      active: true
    },
    {
      id: '2',
      code: 'PRD002',
      name: 'Mouse Logitech MX',
      price: 250,
      stock: 3,
      min_stock: 10,
      active: true
    },
    {
      id: '3',
      code: 'PRD003',
      name: 'Teclado Mecânico',
      price: 450,
      stock: 25,
      min_stock: 10,
      active: true
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Produtos</h1>
            <p className="text-gray-400 mt-1">Gerencie seu cadastro de produtos</p>
          </div>
          <Button onClick={() => setActiveTab('form')}>
            <Plus className="w-5 h-5" />
            Novo Produto
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total de Produtos"
            value={kpis.total}
            icon={<Package className="w-6 h-6" />}
            color="blue"
            trend={{ value: 5.2, isPositive: true }}
          />
          <KPICard
            label="Produtos Ativos"
            value={kpis.active}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
            trend={{ value: 2.1, isPositive: true }}
          />
          <KPICard
            label="Estoque Baixo"
            value={kpis.lowStock}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="yellow"
            trend={{ value: 8.5, isPositive: false }}
          />
          <KPICard
            label="Valor Total"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(kpis.totalValue)}
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
            trend={{ value: 12.3, isPositive: true }}
          />
        </div>

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
          </div>

          {/* Tab Content */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <input
                  type="search"
                  placeholder="Buscar produtos..."
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
                  <option value="">Todos os status</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
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
                    {mockProducts.map((product) => (
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
                              ? 'text-yellow-400'
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
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Mostrando 1-{mockProducts.length} de {kpis.total}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" disabled>
                    Anterior
                  </Button>
                  <Button variant="secondary">
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div>
              <form className="space-y-6">
                {/* Grid 2 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código *
                    </label>
                    <input
                      type="text"
                      placeholder="PRD001"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do produto"
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
                  </div>
                </div>

                {/* Descrição full width */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descrição do produto..."
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
                </div>

                {/* Grid preço/custo/estoque */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preço *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Custo *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estoque *
                    </label>
                    <input
                      type="number"
                      placeholder="0"
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
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab('list')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Produto
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}
