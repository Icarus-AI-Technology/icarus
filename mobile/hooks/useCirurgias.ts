/**
 * ICARUS Mobile - Cirurgias Hook
 * 
 * Hook para gerenciamento de cirurgias.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Cirurgia } from '../lib/supabase'

// Buscar cirurgias do dia
export function useCirurgiasHoje() {
  const hoje = new Date().toISOString().split('T')[0]

  return useQuery({
    queryKey: ['cirurgias', 'hoje'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cirurgias')
        .select(`
          *,
          paciente:pacientes(id, nome),
          medico:medicos(id, nome, crm),
          hospital:hospitais(id, nome_fantasia)
        `)
        .eq('data_cirurgia', hoje)
        .order('hora_inicio', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Buscar próxima cirurgia
export function useProximaCirurgia() {
  const agora = new Date().toISOString()

  return useQuery({
    queryKey: ['cirurgias', 'proxima'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cirurgias')
        .select(`
          *,
          paciente:pacientes(id, nome),
          medico:medicos(id, nome, crm),
          hospital:hospitais(id, nome_fantasia),
          kit:kits_cirurgicos(*)
        `)
        .gte('data_cirurgia', agora.split('T')[0])
        .in('status', ['agendada', 'confirmada'])
        .order('data_cirurgia', { ascending: true })
        .order('hora_inicio', { ascending: true })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    staleTime: 1000 * 60, // 1 minuto
  })
}

// Buscar detalhes da cirurgia
export function useCirurgia(id: string) {
  return useQuery({
    queryKey: ['cirurgia', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cirurgias')
        .select(`
          *,
          paciente:pacientes(*),
          medico:medicos(*),
          hospital:hospitais(*),
          kit:kits_cirurgicos(
            *,
            itens:kit_itens(
              *,
              produto:opme_produtos(*)
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Atualizar status da cirurgia
export function useAtualizarStatusCirurgia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Cirurgia['status'] }) => {
      const { data, error } = await supabase
        .from('cirurgias')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cirurgias'] })
      queryClient.invalidateQueries({ queryKey: ['cirurgia', data.id] })
    },
  })
}

// Registrar uso de material
export function useRegistrarUsoMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cirurgiaId,
      produtoId,
      quantidade,
      lote,
    }: {
      cirurgiaId: string
      produtoId: string
      quantidade: number
      lote?: string
    }) => {
      // Registrar uso
      const { data: uso, error: usoError } = await supabase
        .from('uso_materiais')
        .insert({
          cirurgia_id: cirurgiaId,
          produto_id: produtoId,
          quantidade,
          lote,
          data_uso: new Date().toISOString(),
        })
        .select()
        .single()

      if (usoError) throw usoError

      // Atualizar estoque
      const { error: estoqueError } = await supabase.rpc('decrementar_estoque', {
        p_produto_id: produtoId,
        p_quantidade: quantidade,
      })

      if (estoqueError) throw estoqueError

      return uso
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cirurgia', variables.cirurgiaId] })
      queryClient.invalidateQueries({ queryKey: ['estoque'] })
    },
  })
}

// Confirmar cirurgia
export function useConfirmarCirurgia() {
  const atualizarStatus = useAtualizarStatusCirurgia()

  return useMutation({
    mutationFn: async (id: string) => {
      return atualizarStatus.mutateAsync({ id, status: 'confirmada' })
    },
  })
}

// Iniciar cirurgia
export function useIniciarCirurgia() {
  const atualizarStatus = useAtualizarStatusCirurgia()

  return useMutation({
    mutationFn: async (id: string) => {
      return atualizarStatus.mutateAsync({ id, status: 'em_andamento' })
    },
  })
}

// Concluir cirurgia
export function useConcluirCirurgia() {
  const atualizarStatus = useAtualizarStatusCirurgia()

  return useMutation({
    mutationFn: async (id: string) => {
      return atualizarStatus.mutateAsync({ id, status: 'concluida' })
    },
  })
}

export default {
  useCirurgiasHoje,
  useProximaCirurgia,
  useCirurgia,
  useAtualizarStatusCirurgia,
  useRegistrarUsoMaterial,
  useConfirmarCirurgia,
  useIniciarCirurgia,
  useConcluirCirurgia,
}

