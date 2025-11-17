import { supabase } from '@/lib/supabase'
import type { Product, ProductFormData, ProductFilters, ProductKPIs } from '../types/product.types'

export class ProductService {
  /**
   * CREATE - Insert new product
   */
  static async create(data: ProductFormData): Promise<Product> {
    const { data: product, error } = await supabase
      .from('produtos')
      .insert({
        codigo: data.code,
        nome: data.name,
        descricao: data.description || null,
        categoria_id: data.category_id || null,
        preco_venda: data.price,
        preco_custo: data.cost,
        quantidade_estoque: data.stock,
        estoque_minimo: data.min_stock,
        unidade: data.unit,
        status: data.active ? 'active' : 'inactive',
      })
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .single()

    if (error) {
      console.error('Error creating product:', error)
      throw new Error(error.message)
    }

    return product as Product
  }

  /**
   * READ - List products with filters
   */
  static async list(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('produtos')
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .order('criado_em', { ascending: false })

    // Apply search filter
    if (filters?.search) {
      query = query.or(
        `nome.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`
      )
    }

    // Apply category filter
    if (filters?.category_id) {
      query = query.eq('categoria_id', filters.category_id)
    }

    // Apply active filter
    if (filters?.active !== undefined) {
      query = query.eq('status', filters.active ? 'active' : 'inactive')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error listing products:', error)
      throw new Error(error.message)
    }

    return (data || []) as Product[]
  }

  /**
   * READ - Get single product by ID
   */
  static async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting product:', error)
      throw new Error(error.message)
    }

    return data as Product
  }

  /**
   * READ - Get product by code
   */
  static async getByCode(code: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .eq('codigo', code)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      console.error('Error getting product by code:', error)
      throw new Error(error.message)
    }

    return data as Product
  }

  /**
   * UPDATE - Update product
   */
  static async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const updateData: any = {}

    if (data.code !== undefined) updateData.codigo = data.code
    if (data.name !== undefined) updateData.nome = data.name
    if (data.description !== undefined) updateData.descricao = data.description || null
    if (data.category_id !== undefined) updateData.categoria_id = data.category_id || null
    if (data.price !== undefined) updateData.preco_venda = data.price
    if (data.cost !== undefined) updateData.preco_custo = data.cost
    if (data.stock !== undefined) updateData.quantidade_estoque = data.stock
    if (data.min_stock !== undefined) updateData.estoque_minimo = data.min_stock
    if (data.unit !== undefined) updateData.unidade = data.unit
    if (data.active !== undefined) updateData.status = data.active ? 'active' : 'inactive'

    const { data: product, error } = await supabase
      .from('produtos')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        categoria:categorias_produtos(*)
      `)
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw new Error(error.message)
    }

    return product as Product
  }

  /**
   * DELETE - Delete product
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      throw new Error(error.message)
    }
  }

  /**
   * SOFT DELETE - Deactivate product
   */
  static async deactivate(id: string): Promise<Product> {
    return this.update(id, { active: false })
  }

  /**
   * ACTIVATE - Activate product
   */
  static async activate(id: string): Promise<Product> {
    return this.update(id, { active: true })
  }

  /**
   * ANALYTICS - Get KPIs
   */
  static async getKPIs(): Promise<ProductKPIs> {
    // Get summary from view
    const { data: summary, error: summaryError } = await supabase
      .from('vw_products_summary')
      .select('*')
      .single()

    if (summaryError) {
      console.error('Error getting KPIs:', summaryError)
      throw new Error(summaryError.message)
    }

    return {
      total: summary.total_products || 0,
      active: summary.active_products || 0,
      lowStock: summary.low_stock_products || 0,
      totalValue: summary.total_inventory_value || 0,
    }
  }

  /**
   * ANALYTICS - Get low stock products
   */
  static async getLowStock(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('vw_low_stock_products')
      .select('*')

    if (error) {
      console.error('Error getting low stock products:', error)
      throw new Error(error.message)
    }

    return (data || []) as Product[]
  }

  /**
   * REALTIME - Subscribe to changes
   */
  static subscribe(callback: (payload: any) => void) {
    const channel = supabase
      .channel('produtos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos',
        },
        callback
      )
      .subscribe()

    return channel
  }

  /**
   * REALTIME - Unsubscribe
   */
  static unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel)
  }
}
