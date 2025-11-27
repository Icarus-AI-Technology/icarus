/**
 * Supabase Realtime Subscription Hook
 * 
 * Enables real-time updates for any table using Supabase Realtime
 * Automatically invalidates React Query cache when data changes
 */

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/config/supabase-client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeSubscriptionOptions {
  /**
   * The table name to subscribe to
   */
  table: string
  /**
   * The schema (defaults to 'public')
   */
  schema?: string
  /**
   * Which events to listen for
   */
  event?: PostgresChangeEvent
  /**
   * Query keys to invalidate when data changes
   */
  queryKeys: readonly unknown[][]
  /**
   * Optional filter string (e.g., 'empresa_id=eq.123')
   */
  filter?: string
  /**
   * Callback for INSERT events
   */
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  /**
   * Callback for UPDATE events
   */
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  /**
   * Callback for DELETE events
   */
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  /**
   * Enable/disable the subscription
   */
  enabled?: boolean
}

/**
 * Hook for subscribing to real-time updates from Supabase
 * 
 * @example
 * ```tsx
 * // Subscribe to cirurgias table changes
 * useRealtimeSubscription({
 *   table: 'cirurgias',
 *   queryKeys: [queryKeys.cirurgias.all, queryKeys.dashboard.all],
 *   onInsert: (payload) => toast.info('Nova cirurgia agendada!'),
 * })
 * ```
 */
export function useRealtimeSubscription({
  table,
  schema = 'public',
  event = '*',
  queryKeys,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const queryClient = useQueryClient()

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      console.log(`[Realtime] ${payload.eventType} on ${table}:`, payload)

      // Invalidate all specified query keys
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Call specific event callbacks
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload)
          break
        case 'UPDATE':
          onUpdate?.(payload)
          break
        case 'DELETE':
          onDelete?.(payload)
          break
      }
    },
    [queryClient, queryKeys, table, onInsert, onUpdate, onDelete]
  )

  useEffect(() => {
    if (!enabled) return

    let channel: RealtimeChannel

    const setupSubscription = () => {
      const channelName = `realtime:${schema}:${table}`
      
      channel = supabase.channel(channelName)

      // Configure the subscription based on event type
      const subscriptionConfig = {
        event,
        schema,
        table,
        ...(filter && { filter }),
      }

      channel
        .on(
          'postgres_changes',
          subscriptionConfig,
          handleChange
        )
        .subscribe((status) => {
          console.log(`[Realtime] Subscription to ${table}: ${status}`)
        })
    }

    setupSubscription()

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, schema, event, filter, enabled, handleChange])
}

/**
 * Hook to subscribe to multiple tables at once
 */
export function useRealtimeMultiSubscription(
  subscriptions: Omit<UseRealtimeSubscriptionOptions, 'enabled'>[],
  enabled = true
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const channels: RealtimeChannel[] = []

    subscriptions.forEach(({ table, schema = 'public', event = '*', queryKeys, filter, onInsert, onUpdate, onDelete }) => {
      const channelName = `realtime:${schema}:${table}`
      
      const channel = supabase.channel(channelName)
        .on(
          'postgres_changes',
          { event, schema, table, ...(filter && { filter }) },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            console.log(`[Realtime] ${payload.eventType} on ${table}:`, payload)

            queryKeys.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: key })
            })

            switch (payload.eventType) {
              case 'INSERT':
                onInsert?.(payload)
                break
              case 'UPDATE':
                onUpdate?.(payload)
                break
              case 'DELETE':
                onDelete?.(payload)
                break
            }
          }
        )
        .subscribe()

      channels.push(channel)
    })

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel)
      })
    }
  }, [subscriptions, enabled, queryClient])
}

/**
 * Pre-configured subscription for Dashboard real-time updates
 */
export function useDashboardRealtime() {
  const queryClient = useQueryClient()

  useRealtimeMultiSubscription([
    {
      table: 'cirurgias',
      queryKeys: [['dashboard'], ['cirurgias']],
      onInsert: () => {
        console.log('[Dashboard] Nova cirurgia detectada')
      },
    },
    {
      table: 'produtos',
      queryKeys: [['dashboard'], ['estoque']],
      onUpdate: () => {
        console.log('[Dashboard] Estoque atualizado')
      },
    },
    {
      table: 'contas_receber',
      queryKeys: [['dashboard'], ['contas-receber']],
    },
  ])

  return { queryClient }
}

/**
 * Pre-configured subscription for Cirurgias real-time updates
 */
export function useCirurgiasRealtime() {
  useRealtimeSubscription({
    table: 'cirurgias',
    queryKeys: [['cirurgias'], ['dashboard', 'kpis']],
  })
}

/**
 * Pre-configured subscription for Estoque real-time updates
 */
export function useEstoqueRealtime() {
  useRealtimeMultiSubscription([
    {
      table: 'produtos',
      queryKeys: [['estoque']],
    },
    {
      table: 'movimentacoes_estoque',
      queryKeys: [['estoque'], ['estoque', 'movimentacoes']],
    },
  ])
}

/**
 * Pre-configured subscription for Financeiro real-time updates
 */
export function useFinanceiroRealtime() {
  useRealtimeMultiSubscription([
    {
      table: 'contas_receber',
      queryKeys: [['contas-receber'], ['dashboard']],
    },
    {
      table: 'contas_pagar',
      queryKeys: [['contas-pagar']],
    },
  ])
}

