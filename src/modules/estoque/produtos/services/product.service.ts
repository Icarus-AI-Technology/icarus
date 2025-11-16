import { supabase } from '@/lib/supabase'
import type { Product, ProductFormData, ProductFilters, ProductKPIs } from '../types/product.types'

export class ProductService {
  /**
   * CREATE - Insert new product
   */
  static async create(data: ProductFormData): Promise<Product> {
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        code: data.code,
        name: data.name,
        description: data.description || null,
        category_id: data.category_id || null,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        min_stock: data.min_stock,
        unit: data.unit,
        active: data.active,
      })
      .select(`
        *,
        category:categories(*)
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
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    // Apply category filter
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    // Apply active filter
    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active)
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
      .from('products')
      .select(`
        *,
        category:categories(*)
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
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('code', code)
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

    if (data.code !== undefined) updateData.code = data.code
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.category_id !== undefined) updateData.category_id = data.category_id || null
    if (data.price !== undefined) updateData.price = data.price
    if (data.cost !== undefined) updateData.cost = data.cost
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.min_stock !== undefined) updateData.min_stock = data.min_stock
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.active !== undefined) updateData.active = data.active

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
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
      .from('products')
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
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
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
