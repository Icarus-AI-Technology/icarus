import { lazy } from 'react'
import { implementedRouteIds, type ImplementedRouteId } from '../data/navigation'

// Lazy load modules for better performance
const Dashboard = lazy(() => import('@/components/modules/Dashboard').then(m => ({ default: m.Dashboard })))

// Cadastros & Gestão
const GestaoCadastros = lazy(() => import('@/components/modules/GestaoCadastros').then(m => ({ default: m.GestaoCadastros })))
const GruposProdutosOPME = lazy(() => import('@/components/modules/GruposProdutosOPME').then(m => ({ default: m.GruposProdutosOPME })))
const GestaoUsuariosPermissoes = lazy(() => import('@/components/modules/GestaoUsuariosPermissoes').then(m => ({ default: m.GestaoUsuariosPermissoes })))
const GestaoContratos = lazy(() => import('@/components/modules/GestaoContratos').then(m => ({ default: m.GestaoContratos })))
const GestaoInventario = lazy(() => import('@/components/modules/GestaoInventario').then(m => ({ default: m.GestaoInventario })))
const RHGestaoPessoas = lazy(() => import('@/components/modules/RHGestaoPessoas').then(m => ({ default: m.RHGestaoPessoas })))
const RelacionamentoCliente = lazy(() => import('@/components/modules/RelacionamentoCliente').then(m => ({ default: m.RelacionamentoCliente })))
const GestaoLeads = lazy(() => import('@/components/modules/GestaoLeads').then(m => ({ default: m.GestaoLeads })))

// Cirurgias & Procedimentos
const CirurgiasProcedimentos = lazy(() => import('@/components/modules/CirurgiasProcedimentos').then(m => ({ default: m.CirurgiasProcedimentos })))
const LicitacoesPropostas = lazy(() => import('@/components/modules/LicitacoesPropostas').then(m => ({ default: m.LicitacoesPropostas })))
const TabelaPrecosViewer = lazy(() => import('@/components/modules/TabelaPrecosViewer').then(m => ({ default: m.TabelaPrecosViewer })))
const TabelasPrecosForm = lazy(() => import('@/components/modules/TabelasPrecosForm').then(m => ({ default: m.TabelasPrecosForm })))

// Estoque & Consignação
const EstoqueIAModule = lazy(() => import('@/components/modules/EstoqueIAModule').then(m => ({ default: m.EstoqueIAModule })))
const ConsignacaoAvancada = lazy(() => import('@/components/modules/ConsignacaoAvancada').then(m => ({ default: m.ConsignacaoAvancada })))
const RastreabilidadeOPME = lazy(() => import('@/components/modules/RastreabilidadeOPME').then(m => ({ default: m.RastreabilidadeOPME })))
const TelemetriaIoT = lazy(() => import('@/components/modules/TelemetriaIoT').then(m => ({ default: m.TelemetriaIoT })))
const ManutencaoPreventiva = lazy(() => import('@/components/modules/ManutencaoPreventiva').then(m => ({ default: m.ManutencaoPreventiva })))

// Financeiro & Faturamento
const FaturamentoNFeCompleto = lazy(() => import('@/components/modules/FaturamentoNFeCompleto').then(m => ({ default: m.FaturamentoNFeCompleto })))

// Dev Tools (mantidos para desenvolvimento)
const ShowcasePage = lazy(() => import('@/pages/ShowcasePage').then(m => ({ default: m.ShowcasePage })))
const ContactPage = lazy(() => import('@/pages/Contact'))

export type ModuleComponentMap = {
  [Key in ImplementedRouteId]: React.LazyExoticComponent<() => JSX.Element>
}

/**
 * Module Route Mapping
 * Maps route IDs to their corresponding React components
 * Only implemented modules are listed here
 * 
 * FASE 0: Limpeza concluída - Apenas Dashboard mantido
 * Módulos serão implementados em fases seguindo ICARUS-58-MODULOS
 */
export const moduleComponents = {
  // Principal
  'dashboard': Dashboard,

  // Cadastros & Gestão
  'gestao-cadastros': GestaoCadastros,
  'grupos-produtos-opme': GruposProdutosOPME,
  'usuarios-permissoes': GestaoUsuariosPermissoes,
  'gestao-contratos': GestaoContratos,
  'gestao-inventario': GestaoInventario,
  'rh-gestao-pessoas': RHGestaoPessoas,
  'relacionamento-cliente': RelacionamentoCliente,
  'gestao-leads': GestaoLeads,

  // Cirurgias & Procedimentos
  'cirurgias-procedimentos': CirurgiasProcedimentos,
  'licitacoes-propostas': LicitacoesPropostas,
  'tabela-precos-viewer': TabelaPrecosViewer,
  'tabelas-precos-form': TabelasPrecosForm,

  // Estoque & Consignação
  'estoque-ia': EstoqueIAModule,
  'consignacao-avancada': ConsignacaoAvancada,
  'rastreabilidade-opme': RastreabilidadeOPME,
  'telemetria-iot': TelemetriaIoT,
  'manutencao-preventiva': ManutencaoPreventiva,

  // Financeiro & Faturamento
  'faturamento-nfe-completo': FaturamentoNFeCompleto,

  // Dev Tools
  'showcase': ShowcasePage,
  'contato': ContactPage,
} satisfies ModuleComponentMap

/**
 * Check if a module has an implementation
 */
export const isModuleImplemented = (moduleId: ImplementedRouteId): boolean => {
  return moduleId in moduleComponents
}

/**
 * Get component for a module
 */
export const getModuleComponent = (moduleId: ImplementedRouteId) => {
  return moduleComponents[moduleId] || null
}

/**
 * Get all implemented module IDs
 */
export const getImplementedModuleIds = (): ImplementedRouteId[] => {
  return implementedRouteIds
}
