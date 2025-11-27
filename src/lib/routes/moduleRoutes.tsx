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

// Compras & Fornecedores
const GestaoCompras = lazy(() => import('@/components/modules/GestaoCompras').then(m => ({ default: m.GestaoCompras })))
const NotasCompra = lazy(() => import('@/components/modules/NotasCompra').then(m => ({ default: m.NotasCompra })))
const ComprasInternacionais = lazy(() => import('@/components/modules/ComprasInternacionais').then(m => ({ default: m.ComprasInternacionais })))
const ViabilidadeImportacao = lazy(() => import('@/components/modules/ViabilidadeImportacao').then(m => ({ default: m.ViabilidadeImportacao })))

// Vendas & CRM
const CRMVendasModule = lazy(() => import('@/components/modules/CRMVendasModule').then(m => ({ default: m.CRMVendasModule })))
const CampanhasMarketing = lazy(() => import('@/components/modules/CampanhasMarketing').then(m => ({ default: m.CampanhasMarketing })))
const TabelasPrecosImport = lazy(() => import('@/components/modules/TabelasPrecosImport').then(m => ({ default: m.TabelasPrecosImport })))
const QualidadeCertificacao = lazy(() => import('@/components/modules/QualidadeCertificacao').then(m => ({ default: m.QualidadeCertificacao })))
const VideoCallsManager = lazy(() => import('@/components/modules/VideoCallsManager').then(m => ({ default: m.VideoCallsManager })))

// Financeiro & Faturamento
const FinanceiroAvancado = lazy(() => import('@/components/modules/FinanceiroAvancado').then(m => ({ default: m.FinanceiroAvancado })))
const ContasReceberIA = lazy(() => import('@/components/modules/ContasReceberIA').then(m => ({ default: m.ContasReceberIA })))
const FaturamentoAvancado = lazy(() => import('@/components/modules/FaturamentoAvancado').then(m => ({ default: m.FaturamentoAvancado })))
const FaturamentoNFeCompleto = lazy(() => import('@/components/modules/FaturamentoNFeCompleto').then(m => ({ default: m.FaturamentoNFeCompleto })))
const GestaoContabil = lazy(() => import('@/components/modules/GestaoContabil').then(m => ({ default: m.GestaoContabil })))
const RelatoriosFinanceiros = lazy(() => import('@/components/modules/RelatoriosFinanceiros').then(m => ({ default: m.RelatoriosFinanceiros })))
const RelatoriosRegulatorios = lazy(() => import('@/components/modules/RelatoriosRegulatorios').then(m => ({ default: m.RelatoriosRegulatorios })))

// Compliance & Auditoria
const ComplianceAuditoriaModule = lazy(() => import('@/components/modules/ComplianceAuditoriaModule').then(m => ({ default: m.ComplianceAuditoriaModule })))
const ComplianceAvancado = lazy(() => import('@/components/modules/ComplianceAvancado').then(m => ({ default: m.ComplianceAvancado })))
const NotificacoesInteligentes = lazy(() => import('@/components/modules/NotificacoesInteligentes').then(m => ({ default: m.NotificacoesInteligentes })))

// IA & Automação
const IACentralModule = lazy(() => import('@/components/modules/IACentralModule').then(m => ({ default: m.IACentralModule })))
const AutomacaoIA = lazy(() => import('@/components/modules/AutomacaoIA').then(m => ({ default: m.AutomacaoIA })))
const ChatbotMetrics = lazy(() => import('@/components/modules/ChatbotMetrics').then(m => ({ default: m.ChatbotMetrics })))
const VoiceAnalytics = lazy(() => import('@/components/modules/VoiceAnalytics').then(m => ({ default: m.VoiceAnalytics })))
const VoiceBiometrics = lazy(() => import('@/components/modules/VoiceBiometrics').then(m => ({ default: m.VoiceBiometrics })))
const VoiceMacros = lazy(() => import('@/components/modules/VoiceMacros').then(m => ({ default: m.VoiceMacros })))
const TooltipAnalytics = lazy(() => import('@/components/modules/TooltipAnalytics').then(m => ({ default: m.TooltipAnalytics })))
const WorkflowBuilder = lazy(() => import('@/components/modules/WorkflowBuilder').then(m => ({ default: m.WorkflowBuilder })))

// Sistema & Integrações
const ConfiguracoesSystemModule = lazy(() => import('@/components/modules/ConfiguracoesSystemModule').then(m => ({ default: m.ConfiguracoesSystemModule })))
const ConfiguracoesAvancadas = lazy(() => import('@/components/modules/ConfiguracoesAvancadas').then(m => ({ default: m.ConfiguracoesAvancadas })))
const SystemHealth = lazy(() => import('@/components/modules/SystemHealth').then(m => ({ default: m.SystemHealth })))
const IntegracoesAvancadas = lazy(() => import('@/components/modules/IntegracoesAvancadas').then(m => ({ default: m.IntegracoesAvancadas })))
const IntegrationsManagerModule = lazy(() => import('@/components/modules/IntegrationsManagerModule').then(m => ({ default: m.IntegrationsManagerModule })))
const APIGateway = lazy(() => import('@/components/modules/APIGateway').then(m => ({ default: m.APIGateway })))
const WebhooksManagerModule = lazy(() => import('@/components/modules/WebhooksManagerModule').then(m => ({ default: m.WebhooksManagerModule })))
const LogisticaAvancadaModule = lazy(() => import('@/components/modules/LogisticaAvancadaModule').then(m => ({ default: m.LogisticaAvancadaModule })))

// Analytics
const KPIDashboardModule = lazy(() => import('@/components/modules/KPIDashboardModule').then(m => ({ default: m.KPIDashboardModule })))
const AnalyticsBIModule = lazy(() => import('@/components/modules/AnalyticsBIModule').then(m => ({ default: m.AnalyticsBIModule })))
const AnalyticsPredicaoModule = lazy(() => import('@/components/modules/AnalyticsPredicaoModule').then(m => ({ default: m.AnalyticsPredicaoModule })))
const BIDashboardInteractive = lazy(() => import('@/components/modules/BIDashboardInteractive').then(m => ({ default: m.BIDashboardInteractive })))
const RelatoriosExecutivos = lazy(() => import('@/components/modules/RelatoriosExecutivos').then(m => ({ default: m.RelatoriosExecutivos })))

// Dev Tools (mantidos para desenvolvimento)
const ShowcasePage = lazy(() => import('@/pages/ShowcasePage').then(m => ({ default: m.ShowcasePage })))
const ContactPage = lazy(() => import('@/pages/Contact'))

export type ModuleComponentMap = {
  [Key in ImplementedRouteId]: React.LazyExoticComponent<() => JSX.Element>
}

/**
 * Module Route Mapping
 * Maps route IDs to their corresponding React components
 * 
 * ✅ TODOS OS 58 MÓDULOS IMPLEMENTADOS (100%)
 * 
 * Fases Concluídas:
 * - Fase 0: Preparação e Infraestrutura
 * - Fase 1: Dashboard e Navegação (1 módulo)
 * - Fase 2: Cadastros & Gestão (8 módulos)
 * - Fase 3: Cirurgias & Estoque (9 módulos)
 * - Fase 4: Compras/Vendas/Financeiro (16 módulos)
 * - Fase 5: Compliance/IA/Sistema (19 módulos)
 * - Fase 6: Analytics (5 módulos)
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

  // Compras & Fornecedores
  'gestao-compras': GestaoCompras,
  'notas-compra': NotasCompra,
  'compras-internacionais': ComprasInternacionais,
  'viabilidade-importacao': ViabilidadeImportacao,

  // Vendas & CRM
  'crm-vendas': CRMVendasModule,
  'campanhas-marketing': CampanhasMarketing,
  'tabelas-precos-import': TabelasPrecosImport,
  'qualidade-certificacao': QualidadeCertificacao,
  'video-calls-manager': VideoCallsManager,

  // Financeiro & Faturamento
  'financeiro-avancado': FinanceiroAvancado,
  'contas-receber-ia': ContasReceberIA,
  'faturamento-avancado': FaturamentoAvancado,
  'faturamento-nfe-completo': FaturamentoNFeCompleto,
  'gestao-contabil': GestaoContabil,
  'relatorios-financeiros': RelatoriosFinanceiros,
  'relatorios-regulatorios': RelatoriosRegulatorios,

  // Compliance & Auditoria
  'compliance-auditoria': ComplianceAuditoriaModule,
  'compliance-avancado': ComplianceAvancado,
  'notificacoes-inteligentes': NotificacoesInteligentes,

  // IA & Automação
  'ia-central': IACentralModule,
  'automacao-ia': AutomacaoIA,
  'chatbot-metrics': ChatbotMetrics,
  'voice-analytics': VoiceAnalytics,
  'voice-biometrics': VoiceBiometrics,
  'voice-macros': VoiceMacros,
  'tooltip-analytics': TooltipAnalytics,
  'workflow-builder': WorkflowBuilder,

  // Sistema & Integrações
  'configuracoes-system': ConfiguracoesSystemModule,
  'configuracoes-avancadas': ConfiguracoesAvancadas,
  'system-health': SystemHealth,
  'integracoes-avancadas': IntegracoesAvancadas,
  'integrations-manager': IntegrationsManagerModule,
  'api-gateway': APIGateway,
  'webhooks-manager': WebhooksManagerModule,
  'logistica-avancada': LogisticaAvancadaModule,

  // Analytics
  'kpi-dashboard': KPIDashboardModule,
  'analytics-bi': AnalyticsBIModule,
  'analytics-predicao': AnalyticsPredicaoModule,
  'bi-dashboard-interactive': BIDashboardInteractive,
  'relatorios-executivos': RelatoriosExecutivos,

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
