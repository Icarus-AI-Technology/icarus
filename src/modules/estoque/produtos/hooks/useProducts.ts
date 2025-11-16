import { useState, useEffect, useCallback } from 'react'
import { ProductService } from '../services/product.service'
import type { Product, ProductFilters, ProductKPIs, ProductFormData } from '../types/product.types'

export function useProducts(initialFilters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [kpis, setKPIs] = useState<ProductKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<ProductFilters | undefined>(initialFilters)

  // Load products and KPIs
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [productsData, kpisData] = await Promise.all([
        ProductService.list(filters),
        ProductService.getKPIs(),
      ])

      setProducts(productsData)
      setKPIs(kpisData)
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime subscription
  useEffect(() => {
    const channel = ProductService.subscribe((payload) => {
      console.log('Product change:', payload)

      if (payload.eventType === 'INSERT') {
        setProducts((prev) => [payload.new as Product, ...prev])
        loadData() // Reload KPIs
      } else if (payload.eventType === 'UPDATE') {
        setProducts((prev) =>
          prev.map((p) => (p.id === payload.new.id ? (payload.new as Product) : p))
        )
        loadData() // Reload KPIs
      } else if (payload.eventType === 'DELETE') {
        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id))
        loadData() // Reload KPIs
      }
    })

    return () => {
      ProductService.unsubscribe(channel)
    }
  }, [loadData])

  // Create product
  const createProduct = useCallback(
    async (data: ProductFormData): Promise<Product> => {
      try {
        const product = await ProductService.create(data)
        // Realtime will update the list automatically
        return product
      } catch (err) {
        console.error('Error creating product:', err)
        throw err
      }
    },
    []
  )

  // Update product
  const updateProduct = useCallback(
    async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
      try {
        const product = await ProductService.update(id, data)
        // Realtime will update the list automatically
        return product
      } catch (err) {
        console.error('Error updating product:', err)
        throw err
      }
    },
    []
  )

  // Delete product
  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      await ProductService.delete(id)
      // Realtime will update the list automatically
    } catch (err) {
      console.error('Error deleting product:', err)
      throw err
    }
  }, [])

  // Deactivate product
  const deactivateProduct = useCallback(
    async (id: string): Promise<Product> => {
      try {
        const product = await ProductService.deactivate(id)
        return product
      } catch (err) {
        console.error('Error deactivating product:', err)
        throw err
      }
    },
    []
  )

  // Activate product
  const activateProduct = useCallback(
    async (id: string): Promise<Product> => {
      try {
        const product = await ProductService.activate(id)
        return product
      } catch (err) {
        console.error('Error activating product:', err)
        throw err
      }
    },
    []
  )

  // Get product by ID
  const getProduct = useCallback(async (id: string): Promise<Product> => {
    try {
      return await ProductService.getById(id)
    } catch (err) {
      console.error('Error getting product:', err)
      throw err
    }
  }, [])

  // Check if code exists
  const checkCodeExists = useCallback(async (code: string): Promise<boolean> => {
    try {
      const product = await ProductService.getByCode(code)
      return product !== null
    } catch (err) {
      console.error('Error checking code:', err)
      return false
    }
  }, [])

  return {
    // Data
    products,
    kpis,
    loading,
    error,
    filters,

    // Actions
    createProduct,
    updateProduct,
    deleteProduct,
    deactivateProduct,
    activateProduct,
    getProduct,
    checkCodeExists,
    setFilters,
    reload: loadData,
  }
}
