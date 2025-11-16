import { supabase, isSupabaseConfigured } from '@/lib/config/supabase-client'

/**
 * Hook to access Supabase client
 *
 * @example
 * ```tsx
 * const { supabase, isConfigured } = useSupabase()
 *
 * // Check if configured
 * if (!isConfigured) {
 *   console.warn('Supabase not configured')
 *   return
 * }
 *
 * // Fetch data
 * const { data, error } = await supabase
 *   .from('products')
 *   .select('*')
 *
 * // Insert data
 * const { error } = await supabase
 *   .from('products')
 *   .insert([{ name: 'Product 1' }])
 * ```
 */
export function useSupabase() {
  return {
    supabase,
    isConfigured: isSupabaseConfigured()
  }
}
