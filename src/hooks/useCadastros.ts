import { useSupabaseCRUD } from './useSupabaseCRUD'

/**
 * Hook para gestão de Médicos
 */
export function useMedicos() {
  return useSupabaseCRUD({
    tableName: 'medicos',
    queryKey: ['medicos'],
    select: '*, especialidades(*)',
    orderBy: { column: 'nome', ascending: true }
  })
}

/**
 * Hook para gestão de Hospitais
 */
export function useHospitais() {
  return useSupabaseCRUD({
    tableName: 'hospitais',
    queryKey: ['hospitais'],
    orderBy: { column: 'nome_fantasia', ascending: true }
  })
}

/**
 * Hook para gestão de Pacientes
 */
export function usePacientes() {
  return useSupabaseCRUD({
    tableName: 'pacientes',
    queryKey: ['pacientes'],
    orderBy: { column: 'nome', ascending: true }
  })
}

/**
 * Hook para gestão de Convênios
 */
export function useConvenios() {
  return useSupabaseCRUD({
    tableName: 'convenios',
    queryKey: ['convenios'],
    orderBy: { column: 'nome', ascending: true }
  })
}

/**
 * Hook para gestão de Fornecedores
 */
export function useFornecedores() {
  return useSupabaseCRUD({
    tableName: 'fornecedores',
    queryKey: ['fornecedores'],
    orderBy: { column: 'razao_social', ascending: true }
  })
}

/**
 * Hook para gestão de Produtos OPME
 */
export function useProdutosOPME() {
  return useSupabaseCRUD({
    tableName: 'opme_produtos',
    queryKey: ['produtos-opme'],
    select: '*, fornecedor:fornecedores(*)',
    orderBy: { column: 'descricao', ascending: true }
  })
}

/**
 * Hook para gestão de Usuários
 */
export function useUsuarios() {
  return useSupabaseCRUD({
    tableName: 'usuarios',
    queryKey: ['usuarios'],
    orderBy: { column: 'nome', ascending: true }
  })
}

/**
 * Hook para gestão de Contratos
 */
export function useContratos() {
  return useSupabaseCRUD({
    tableName: 'contratos',
    queryKey: ['contratos'],
    select: '*, hospital:hospitais(*)',
    orderBy: { column: 'data_inicio', ascending: false }
  })
}

