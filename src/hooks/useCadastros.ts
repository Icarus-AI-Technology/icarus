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

/**
 * Hook agregador para gestão de cadastros
 * Retorna todos os hooks de cadastro em um único objeto
 */
export function useCadastros() {
  const medicos = useMedicos()
  const hospitais = useHospitais()
  const pacientes = usePacientes()
  const convenios = useConvenios()
  const fornecedores = useFornecedores()
  const produtosOPME = useProdutosOPME()
  const usuarios = useUsuarios()
  const contratos = useContratos()

  return {
    medicos,
    hospitais,
    pacientes,
    convenios,
    fornecedores,
    produtosOPME,
    usuarios,
    contratos,
    // Estatísticas agregadas
    stats: {
      totalMedicos: medicos.data?.length ?? 0,
      totalHospitais: hospitais.data?.length ?? 0,
      totalPacientes: pacientes.data?.length ?? 0,
      totalConvenios: convenios.data?.length ?? 0,
      totalFornecedores: fornecedores.data?.length ?? 0,
      totalProdutos: produtosOPME.data?.length ?? 0,
      totalUsuarios: usuarios.data?.length ?? 0,
      totalContratos: contratos.data?.length ?? 0,
    },
    // Status de carregamento
    isLoading: medicos.isLoading || hospitais.isLoading || pacientes.isLoading || 
               convenios.isLoading || fornecedores.isLoading || produtosOPME.isLoading ||
               usuarios.isLoading || contratos.isLoading,
    // Erros
    errors: [
      medicos.error,
      hospitais.error,
      pacientes.error,
      convenios.error,
      fornecedores.error,
      produtosOPME.error,
      usuarios.error,
      contratos.error,
    ].filter(Boolean),
  }
}

