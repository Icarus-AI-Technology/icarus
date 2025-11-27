import { useSupabaseCRUD } from './useSupabaseCRUD'

/**
 * Hook para gestão de Cirurgias
 */
export function useCirurgias() {
  return useSupabaseCRUD({
    tableName: 'cirurgias',
    queryKey: ['cirurgias'],
    select: `
      *,
      medico:medicos(*),
      hospital:hospitais(*),
      paciente:pacientes(*),
      procedimento:procedimentos(*)
    `,
    orderBy: { column: 'data_cirurgia', ascending: false }
  })
}

/**
 * Hook para gestão de Procedimentos
 */
export function useProcedimentos() {
  return useSupabaseCRUD({
    tableName: 'procedimentos',
    queryKey: ['procedimentos'],
    orderBy: { column: 'descricao', ascending: true }
  })
}

/**
 * Hook para gestão de Licitações
 */
export function useLicitacoes() {
  return useSupabaseCRUD({
    tableName: 'licitacoes',
    queryKey: ['licitacoes'],
    select: '*, hospital:hospitais(*)',
    orderBy: { column: 'data_abertura', ascending: false }
  })
}

/**
 * Hook para gestão de Tabelas de Preços
 */
export function useTabelasPrecos() {
  return useSupabaseCRUD({
    tableName: 'tabelas_precos',
    queryKey: ['tabelas-precos'],
    select: '*, hospital:hospitais(*)',
    orderBy: { column: 'vigencia_inicio', ascending: false }
  })
}

