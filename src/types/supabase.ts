export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
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
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category_id?: string | null
          price: number
          cost: number
          stock: number
          min_stock: number
          unit: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category_id?: string | null
          price?: number
          cost?: number
          stock?: number
          min_stock?: number
          unit?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      vw_products_with_category: {
        Row: {
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
          category_name: string | null
          category_description: string | null
        }
      }
      vw_low_stock_products: {
        Row: {
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
        }
      }
      vw_products_summary: {
        Row: {
          total_products: number
          active_products: number
          low_stock_products: number
          total_inventory_value: number
          total_inventory_cost: number
          potential_profit: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
