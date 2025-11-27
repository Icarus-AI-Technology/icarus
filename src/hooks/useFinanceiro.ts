import { useSupabaseCRUD } from './useSupabaseCRUD'

/**
 * Hook para gestão de Contas a Receber
 */
export function useContasReceber() {
  return useSupabaseCRUD({
    tableName: 'contas_receber',
    queryKey: ['contas-receber'],
    select: '*, hospital:hospitais(*), cirurgia:cirurgias(*)',
    orderBy: { column: 'data_vencimento', ascending: true }
  })
}

/**
 * Hook para gestão de Contas a Pagar
 */
export function useContasPagar() {
  return useSupabaseCRUD({
    tableName: 'contas_pagar',
    queryKey: ['contas-pagar'],
    select: '*, fornecedor:fornecedores(*)',
    orderBy: { column: 'data_vencimento', ascending: true }
  })
}

/**
 * Hook para gestão de Notas Fiscais
 */
export function useNotasFiscais() {
  return useSupabaseCRUD({
    tableName: 'notas_fiscais',
    queryKey: ['notas-fiscais'],
    select: '*, cirurgia:cirurgias(*)',
    orderBy: { column: 'data_emissao', ascending: false }
  })
}

/**
 * Hook para gestão de Boletos
 */
export function useBoletos() {
  return useSupabaseCRUD({
    tableName: 'boletos',
    queryKey: ['boletos'],
    select: '*, conta_receber:contas_receber(*)',
    orderBy: { column: 'data_vencimento', ascending: true }
  })
}

/**
 * Hook para gestão de Lançamentos Contábeis
 */
export function useLancamentosContabeis() {
  return useSupabaseCRUD({
    tableName: 'lancamentos_contabeis',
    queryKey: ['lancamentos-contabeis'],
    select: '*, conta_contabil:contas_contabeis(*)',
    orderBy: { column: 'data_lancamento', ascending: false }
  })
}

