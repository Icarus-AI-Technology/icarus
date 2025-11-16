export interface Product {
  id: string
  code: string
  name: string
  description: string | null
  category_id: string | null
  price: number
  cost: number
  stock: number
  min_stock: number
  unit: string
  active: boolean
  created_at: string
  updated_at: string

  // Relations (optional)
  category?: {
    id: string
    name: string
  }
}

export interface ProductFormData {
  code: string
  name: string
  description?: string
  category_id?: string
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
