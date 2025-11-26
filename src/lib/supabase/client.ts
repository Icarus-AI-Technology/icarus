import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

type SupabaseStatus = {
  client: SupabaseClient<Database> | null
  error: Error | null
  isConfigured: boolean
}

let supabaseInstance: SupabaseClient<Database> | null = null

const buildSupabaseStatus = (): SupabaseStatus => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
    return { client: null, error, isConfigured: false }
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return { client: supabaseInstance, error: null, isConfigured: true }
}

export const getSupabaseClient = (): SupabaseStatus => {
  if (supabaseInstance) {
    return { client: supabaseInstance, error: null, isConfigured: true }
  }

  return buildSupabaseStatus()
}

export const getSupabaseClientOrThrow = (): SupabaseClient<Database> => {
  const { client, error } = getSupabaseClient()

  if (client) return client

  throw error ?? new Error('Supabase client is not configured.')
}

// Lazy proxy prevents immediate Supabase initialization on module import
export const supabase: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get<T extends keyof SupabaseClient<Database>>(_target, prop: T) {
      const client = getSupabaseClientOrThrow()
      const value = client[prop]

      if (typeof value === 'function') {
        return value.bind(client)
      }

      return value
    },
  }
)

// Helper hooks for common operations
export const useSupabase = () => getSupabaseClientOrThrow()

export const isSupabaseConfigured = () => getSupabaseClient().isConfigured
