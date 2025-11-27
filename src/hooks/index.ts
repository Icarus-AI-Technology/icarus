/**
 * ICARUS v5.0 - Hooks Index
 * 
 * Exporta todos os hooks customizados do sistema
 * Organizado por categoria para fácil manutenção
 */

// Core Hooks
export { useTheme } from './useTheme'
export { useSidebar } from './useSidebar'
export { useIcarusBrain } from './useIcarusBrain'

// Supabase CRUD Generic
export { useSupabaseCRUD } from './useSupabaseCRUD'
export type { UseSupabaseCRUDOptions } from './useSupabaseCRUD'

// Cadastros & Gestão
export {
  useMedicos,
  useHospitais,
  usePacientes,
  useConvenios,
  useFornecedores,
  useProdutosOPME,
  useUsuarios,
  useContratos
} from './useCadastros'

// Cirurgias & Procedimentos
export {
  useCirurgias,
  useProcedimentos,
  useLicitacoes,
  useTabelasPrecos
} from './useCirurgias'

// Estoque & Consignação
export {
  useEstoque,
  useMovimentacoes,
  useKitsConsignados,
  useLotesOPME,
  useTelemetriaIoT
} from './useEstoque'

// Financeiro & Faturamento
export {
  useContasReceber,
  useContasPagar,
  useNotasFiscais,
  useBoletos,
  useLancamentosContabeis
} from './useFinanceiro'

// Compliance & IA
export {
  useAuditLogs,
  useNotificacoes,
  useWorkflows,
  useMetricasIA,
  useConversasChatbot
} from './useComplianceIA'

