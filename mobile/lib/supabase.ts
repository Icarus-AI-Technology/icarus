/**
 * ICARUS Mobile - Supabase Client
 * 
 * Cliente Supabase configurado para React Native.
 */

import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

// Adapter para SecureStore (iOS/Android)
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key)
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
      return
    }
    await SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
      return
    }
    await SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tipos para tabelas
export interface Cirurgia {
  id: string
  data_cirurgia: string
  hora_inicio: string
  hora_fim?: string
  paciente_id: string
  medico_id: string
  hospital_id: string
  procedimento: string
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada'
  observacoes?: string
  created_at: string
}

export interface Produto {
  id: string
  codigo: string
  descricao: string
  quantidade_estoque: number
  ponto_pedido: number
  valor_unitario: number
  lote?: string
  validade?: string
  registro_anvisa?: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  cargo: string
  avatar_url?: string
}

