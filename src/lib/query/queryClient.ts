/**
 * React Query Client Configuration
 *
 * Centralized configuration for @tanstack/react-query
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Create and configure the React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes (data is considered fresh for 5 minutes)
      staleTime: 5 * 60 * 1000,

      // Cache time: 10 minutes (unused data stays in cache for 10 minutes)
      gcTime: 10 * 60 * 1000,

      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (helps keep data fresh)
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,

      // Don't refetch on reconnect if data is still fresh
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
})

/**
 * Query keys factory for consistent cache key management
 */
export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    kpis: () => [...queryKeys.dashboard.all, 'kpis'] as const,
    recentOrders: () => [...queryKeys.dashboard.all, 'recent-orders'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.products.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.customers.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.orders.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  // Inventory
  inventory: {
    all: ['inventory'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.inventory.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.inventory.all, 'detail', id] as const,
    movements: (productId?: string) => [...queryKeys.inventory.all, 'movements', productId] as const,
  },

  // Financial
  financial: {
    all: ['financial'] as const,
    invoices: (filters?: Record<string, unknown>) => [...queryKeys.financial.all, 'invoices', filters] as const,
    kpis: () => [...queryKeys.financial.all, 'kpis'] as const,
  },
}
