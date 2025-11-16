import { supabase } from '@/lib/supabase/client'

/**
 * Hook para acessar o cliente Supabase
 *
 * @example
 * ```tsx
 * const { supabase } = useSupabase()
 *
 * // Fetch data
 * const { data, error } = await supabase
 *   .from('produtos')
 *   .select('*')
 * ```
 */
export function useSupabase() {
  return { supabase }
}
