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

  // Cirurgias
  cirurgias: {
    all: ['cirurgias'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.cirurgias.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.cirurgias.all, 'detail', id] as const,
    stats: () => [...queryKeys.cirurgias.all, 'stats'] as const,
  },

  // Estoque
  estoque: {
    all: ['estoque'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.estoque.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.estoque.all, 'detail', id] as const,
    movimentacoes: (produtoId?: string) => [...queryKeys.estoque.all, 'movimentacoes', produtoId] as const,
    stats: () => [...queryKeys.estoque.all, 'stats'] as const,
  },

  // Clientes
  clientes: {
    all: ['clientes'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.clientes.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.clientes.all, 'detail', id] as const,
    hospitais: () => [...queryKeys.clientes.all, 'hospitais'] as const,
    medicos: () => [...queryKeys.clientes.all, 'medicos'] as const,
  },

  // Fornecedores
  fornecedores: {
    all: ['fornecedores'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.fornecedores.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.fornecedores.all, 'detail', id] as const,
  },

  // Contas a Receber
  contasReceber: {
    all: ['contas-receber'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.contasReceber.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.contasReceber.all, 'detail', id] as const,
    stats: () => [...queryKeys.contasReceber.all, 'stats'] as const,
  },

  // Contas a Pagar
  contasPagar: {
    all: ['contas-pagar'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.contasPagar.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.contasPagar.all, 'detail', id] as const,
    stats: () => [...queryKeys.contasPagar.all, 'stats'] as const,
  },
}
