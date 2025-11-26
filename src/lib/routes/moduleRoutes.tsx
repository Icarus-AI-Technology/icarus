import { lazy } from 'react'
import { implementedRouteIds, type ImplementedRouteId } from '../data/navigation'

// Lazy load modules for better performance
const Dashboard = lazy(() => import('@/components/modules/Dashboard').then(m => ({ default: m.Dashboard })))
const EstoqueIA = lazy(() => import('@/components/modules/EstoqueIA').then(m => ({ default: m.EstoqueIA })))
const Cirurgias = lazy(() => import('@/components/modules/Cirurgias').then(m => ({ default: m.Cirurgias })))
const Financeiro = lazy(() => import('@/components/modules/Financeiro').then(m => ({ default: m.Financeiro })))
const CRMVendas = lazy(() => import('@/components/modules/CRMVendas').then(m => ({ default: m.CRMVendas })))
const ProdutosOPME = lazy(() => import('@/components/modules/ProdutosOPME').then(m => ({ default: m.ProdutosOPME })))
const Compras = lazy(() => import('@/components/modules/Compras').then(m => ({ default: m.Compras })))
const ContasReceber = lazy(() => import('@/components/modules/ContasReceber').then(m => ({ default: m.ContasReceber })))
const FaturamentoNFe = lazy(() => import('@/components/modules/FaturamentoNFe').then(m => ({ default: m.FaturamentoNFe })))
const Inventario = lazy(() => import('@/components/modules/Inventario').then(m => ({ default: m.Inventario })))
const TabelaPrecos = lazy(() => import('@/components/modules/TabelaPrecos').then(m => ({ default: m.TabelaPrecos })))
const Licitacoes = lazy(() => import('@/components/modules/Licitacoes').then(m => ({ default: m.Licitacoes })))
const Cadastros = lazy(() => import('@/components/modules/Cadastros').then(m => ({ default: m.Cadastros })))
const ShowcasePage = lazy(() => import('@/pages/ShowcasePage').then(m => ({ default: m.ShowcasePage })))
const ContactPage = lazy(() => import('@/pages/Contact'))
const IntegrationsDashboard = lazy(() => import('@/components/modules/IntegrationsDashboard').then(m => ({ default: m.IntegrationsDashboard })))
const AuditorChecklistIntegrations = lazy(() => import('@/components/modules/AuditorChecklistIntegrations').then(m => ({ default: m.AuditorChecklistIntegrations })))

export type ModuleComponentMap = {
  [Key in ImplementedRouteId]: React.LazyExoticComponent<() => JSX.Element>
}

/**
 * Module Route Mapping
 * Maps route IDs to their corresponding React components
 * Only implemented modules are listed here
 */
export const moduleComponents = {
  // Principal
  'dashboard': Dashboard,

  // Core Business
  'estoque-ia': EstoqueIA,
  'cirurgias': Cirurgias,
  'financeiro': Financeiro,
  'crm-vendas': CRMVendas,
  'produtos': ProdutosOPME,
  'contas-receber': ContasReceber,
  'faturamento': FaturamentoNFe,
  'inventario': Inventario,
  'tabela-precos': TabelaPrecos,

  // Compras & Fornecedores
  'compras': Compras,
  'licitacoes': Licitacoes,

  // Cadastros & Gestão
  'cadastros': Cadastros,

  // Integrações
  'integrations-dashboard': IntegrationsDashboard,
  'auditor-checklist-integrations': AuditorChecklistIntegrations,

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
