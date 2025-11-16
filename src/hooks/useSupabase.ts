import { supabase } from '@/lib/supabase'

/**
 * Hook to access Supabase client
 *
 * @example
 * ```tsx
 * const { supabase } = useSupabase()
 *
 * // Fetch data
 * const { data, error } = await supabase
 *   .from('produtos')
 *   .select('*')
 *
 * // Insert data
 * const { error } = await supabase
 *   .from('produtos')
 *   .insert([{ nome: 'Produto 1' }])
 * ```
 */
export function useSupabase() {
  return { supabase }
}
