import { useSupabaseCRUD } from './useSupabaseCRUD'

/**
 * Hook para gestão de Estoque
 */
export function useEstoque() {
  return useSupabaseCRUD({
    tableName: 'estoque',
    queryKey: ['estoque'],
    select: '*, produto:opme_produtos(*)',
    orderBy: { column: 'updated_at', ascending: false }
  })
}

/**
 * Hook para gestão de Movimentações de Estoque
 */
export function useMovimentacoes() {
  return useSupabaseCRUD({
    tableName: 'movimentacoes_estoque',
    queryKey: ['movimentacoes'],
    select: '*, produto:opme_produtos(*), usuario:usuarios(*)',
    orderBy: { column: 'data_movimentacao', ascending: false }
  })
}

/**
 * Hook para gestão de Kits Consignados
 */
export function useKitsConsignados() {
  return useSupabaseCRUD({
    tableName: 'kits_consignados',
    queryKey: ['kits-consignados'],
    select: '*, hospital:hospitais(*), cirurgia:cirurgias(*)',
    orderBy: { column: 'data_envio', ascending: false }
  })
}

/**
 * Hook para gestão de Lotes OPME
 */
export function useLotesOPME() {
  return useSupabaseCRUD({
    tableName: 'estoque_lotes',
    queryKey: ['lotes-opme'],
    select: '*, produto:opme_produtos(*)',
    orderBy: { column: 'data_validade', ascending: true }
  })
}

/**
 * Hook para telemetria IoT
 */
export function useTelemetriaIoT() {
  return useSupabaseCRUD({
    tableName: 'telemetria_iot',
    queryKey: ['telemetria'],
    orderBy: { column: 'timestamp', ascending: false }
  })
}

