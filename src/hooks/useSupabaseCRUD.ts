import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/config/supabase-client'
import { toast } from 'sonner'

/**
 * Hook genérico para operações CRUD no Supabase
 * 
 * @param tableName - Nome da tabela no Supabase
 * @param queryKey - Chave única para cache do React Query
 * 
 * @example
 * const { data, create, update, remove } = useSupabaseCRUD('produtos', ['produtos'])
 */

export interface UseSupabaseCRUDOptions<T = unknown> {
  tableName: string
  queryKey: string[]
  select?: string
  orderBy?: { column: string; ascending?: boolean }
  filters?: Record<string, unknown>
  onSuccess?: (message: string) => void
  onError?: (error: Error) => void
}

export function useSupabaseCRUD<T = unknown>({
  tableName,
  queryKey,
  select = '*',
  orderBy,
  filters,
  onSuccess,
  onError
}: UseSupabaseCRUDOptions<T>) {
  const queryClient = useQueryClient()

  // READ - Listar registros
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(tableName).select(select)

      // Aplicar filtros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Aplicar ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
      }

      const { data, error } = await query

      if (error) throw error
      return data as T[]
    },
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // CREATE - Criar registro
  const createMutation = useMutation({
    mutationFn: async (newData: Partial<T>) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert([newData])
        .select()
        .single()

      if (error) throw error
      return data as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      const message = 'Registro criado com sucesso'
      toast.success(message)
      onSuccess?.(message)
    },
    onError: (error: Error) => {
      const message = `Erro ao criar: ${error.message}`
      toast.error(message)
      onError?.(error)
    },
  })

  // UPDATE - Atualizar registro
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string | number; data: Partial<T> }) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      const message = 'Registro atualizado com sucesso'
      toast.success(message)
      onSuccess?.(message)
    },
    onError: (error: Error) => {
      const message = `Erro ao atualizar: ${error.message}`
      toast.error(message)
      onError?.(error)
    },
  })

  // DELETE - Remover registro
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      const message = 'Registro removido com sucesso'
      toast.success(message)
      onSuccess?.(message)
    },
    onError: (error: Error) => {
      const message = `Erro ao remover: ${error.message}`
      toast.error(message)
      onError?.(error)
    },
  })

  return {
    // Dados
    data: data || [],
    isLoading,
    error,
    refetch,

    // Mutações
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,

    // Estados das mutações
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation objects (para uso avançado)
    createMutation,
    updateMutation,
    deleteMutation,
  }
}

