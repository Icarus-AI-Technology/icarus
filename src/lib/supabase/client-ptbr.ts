/**
 * Cliente Supabase - ICARUS v5.0
 * Versão PT-BR com tipos em português
 *
 * USO:
 * import { supabase } from '@/lib/supabase/client-ptbr'
 *
 * TABELAS EM PT-BR:
 * - empresas (tenants)
 * - usuarios (users)
 * - produtos (products)
 * - clientes (clients)
 * - cirurgias (surgeries)
 * - contas_receber (accounts receivable)
 * - contas_pagar (accounts payable)
 * - movimentacoes_estoque (stock movements)
 * - icarus_previsoes (AI predictions)
 * - icarus_registros (audit logs)
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types-ptbr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não encontradas. Verifique seu arquivo .env.local'
  )
}

/**
 * Cliente Supabase configurado com tipos PT-BR
 *
 * @example
 * // Buscar produtos
 * const { data: produtos } = await supabase
 *   .from('produtos')
 *   .select('*')
 *   .eq('ativo', true)
 *
 * @example
 * // Inserir cirurgia
 * const { data: cirurgia } = await supabase
 *   .from('cirurgias')
 *   .insert({
 *     numero: 'CIR-001',
 *     paciente_nome: 'João Silva',
 *     hospital_id: '...',
 *     medico_id: '...',
 *     tipo_cirurgia: 'Ortopedia',
 *     data_cirurgia: '2025-01-20'
 *   })
 *   .select()
 *   .single()
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

/**
 * Hook auxiliar para usar o Supabase em componentes React
 *
 * @example
 * const db = useSupabase()
 * const { data } = await db.from('produtos').select('*')
 */
export const useSupabase = () => supabase

/**
 * Cliente Supabase com tipos em PT-BR
 * Mesma instância que 'supabase', apenas com nome mais descritivo
 */
export const supabasePtBr = supabase

export default supabase
