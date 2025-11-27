import {
  LayoutDashboard, Package, Calendar, DollarSign, Users,
  ShoppingCart, FileText, Settings, BarChart3, Truck, Shield,
  Brain, Zap, Webhook, TrendingUp, UserCog, FileSpreadsheet,
  Activity, Bell, MessageSquare, Video, Fingerprint, Workflow,
  Globe, Lock, ClipboardCheck, Heart, Boxes, Eye, Mail,
  Plug, ClipboardList, PieChart, Briefcase, Scale,
  Receipt, FileCheck, Container, FileCog, Database,
  UserPlus, Target, Megaphone, HeartHandshake, Mic, Gauge
} from 'lucide-react'
import { NavigationCategory } from '../types/navigation'

/**
 * ICARUS v5.0 - Navegação Completa dos 58 Módulos
 * Organização: 10 categorias conforme documentação oficial
 * Fase 0: Apenas Dashboard implementado, demais módulos serão implementados em fases
 */
export const navigationConfig = [
  {
    name: 'Principal',
    icon: LayoutDashboard,
    routes: [
      {
        id: 'dashboard',
        path: '/dashboard',
        name: 'Dashboard',
        icon: LayoutDashboard,
        category: 'Principal',
        description: 'Visão geral do sistema com KPIs e ações rápidas',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Cadastros & Gestão',
    icon: ClipboardList,
    routes: [
      {
        id: 'gestao-cadastros',
        path: '/gestao-cadastros',
        name: 'Gestão de Cadastros',
        icon: FileText,
        category: 'Cadastros & Gestão',
        description: 'Cadastros auxiliares (médicos, hospitais, pacientes, convênios)',
        isImplemented: true
      },
      {
        id: 'grupos-produtos-opme',
        path: '/grupos-produtos-opme',
        name: 'Grupos Produtos OPME',
        icon: Boxes,
        category: 'Cadastros & Gestão',
        description: 'Grupos e categorias de produtos OPME',
        isImplemented: true
      },
      {
        id: 'usuarios-permissoes',
        path: '/usuarios-permissoes',
        name: 'Usuários e Permissões',
        icon: UserCog,
        category: 'Cadastros & Gestão',
        description: 'Gestão de usuários e controle de acesso (RBAC)',
        isImplemented: true
      },
      {
        id: 'gestao-contratos',
        path: '/gestao-contratos',
        name: 'Gestão de Contratos',
        icon: FileCheck,
        category: 'Cadastros & Gestão',
        description: 'Contratos com hospitais, fornecedores e convênios',
        isImplemented: true
      },
      {
        id: 'gestao-inventario',
        path: '/gestao-inventario',
        name: 'Gestão de Inventário',
        icon: ClipboardCheck,
        category: 'Cadastros & Gestão',
        description: 'Inventário físico periódico de estoque',
        isImplemented: true
      },
      {
        id: 'rh-gestao-pessoas',
        path: '/rh-gestao-pessoas',
        name: 'RH Gestão de Pessoas',
        icon: Users,
        category: 'Cadastros & Gestão',
        description: 'Recursos Humanos e gestão de equipes',
        isImplemented: true
      },
      {
        id: 'relacionamento-cliente',
        path: '/relacionamento-cliente',
        name: 'Relacionamento Cliente',
        icon: HeartHandshake,
        category: 'Cadastros & Gestão',
        description: 'Relacionamento e suporte pós-venda',
        isImplemented: true
      },
      {
        id: 'gestao-leads',
        path: '/gestao-leads',
        name: 'Gestão de Leads',
        icon: UserPlus,
        category: 'Cadastros & Gestão',
        description: 'Qualificação e conversão de leads',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Cirurgias & Procedimentos',
    icon: Calendar,
    routes: [
      {
        id: 'cirurgias-procedimentos',
        path: '/cirurgias-procedimentos',
        name: 'Cirurgias e Procedimentos',
        icon: Calendar,
        category: 'Cirurgias & Procedimentos',
        description: 'Gestão completa de cirurgias e procedimentos',
        isImplemented: true
      },
      {
        id: 'licitacoes-propostas',
        path: '/licitacoes-propostas',
        name: 'Licitações e Propostas',
        icon: Scale,
        category: 'Cirurgias & Procedimentos',
        description: 'Gestão de licitações públicas e propostas comerciais',
        isImplemented: true
      },
      {
        id: 'tabela-precos-viewer',
        path: '/tabela-precos-viewer',
        name: 'Tabela Preços Viewer',
        icon: Eye,
        category: 'Cirurgias & Procedimentos',
        description: 'Visualização de tabelas de preços OPME',
        isImplemented: true
      },
      {
        id: 'tabelas-precos-form',
        path: '/tabelas-precos-form',
        name: 'Tabelas Preços Form',
        icon: FileSpreadsheet,
        category: 'Cirurgias & Procedimentos',
        description: 'Cadastro e edição de tabelas de preços',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Estoque & Consignação',
    icon: Package,
    routes: [
      {
        id: 'estoque-ia',
        path: '/estoque-ia',
        name: 'Estoque IA',
        icon: Brain,
        category: 'Estoque & Consignação',
        description: 'Gestão inteligente de estoque com IA preditiva',
        isImplemented: true
      },
      {
        id: 'consignacao-avancada',
        path: '/consignacao-avancada',
        name: 'Consignação Avançada',
        icon: Container,
        category: 'Estoque & Consignação',
        description: 'Gestão de kits consignados em hospitais',
        isImplemented: true
      },
      {
        id: 'rastreabilidade-opme',
        path: '/rastreabilidade-opme',
        name: 'Rastreabilidade OPME',
        icon: Activity,
        category: 'Estoque & Consignação',
        description: 'Rastreabilidade RDC 59/2008 (lote, validade, nota fiscal)',
        isImplemented: true
      },
      {
        id: 'telemetria-iot',
        path: '/telemetria-iot',
        name: 'Telemetria IoT',
        icon: Gauge,
        category: 'Estoque & Consignação',
        description: 'Monitoramento IoT (temperatura, localização GPS)',
        isImplemented: true
      },
      {
        id: 'manutencao-preventiva',
        path: '/manutencao-preventiva',
        name: 'Manutenção Preventiva',
        icon: Settings,
        category: 'Estoque & Consignação',
        description: 'Manutenção preventiva de equipamentos OPME',
        isImplemented: true
      },
      {
        id: 'logistica-avancada',
        path: '/logistica-avancada',
        name: 'Logística Avançada',
        icon: Truck,
        category: 'Estoque & Consignação',
        description: 'Gestão logística completa com roteirização',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Compras & Fornecedores',
    icon: ShoppingCart,
    routes: [
      {
        id: 'gestao-compras',
        path: '/gestao-compras',
        name: 'Gestão de Compras',
        icon: ShoppingCart,
        category: 'Compras & Fornecedores',
        description: 'Gestão completa de compras e cotações',
        isImplemented: true
      },
      {
        id: 'notas-compra',
        path: '/notas-compra',
        name: 'Notas de Compra',
        icon: Receipt,
        category: 'Compras & Fornecedores',
        description: 'Registro e validação de notas fiscais de compra',
        isImplemented: true
      },
      {
        id: 'compras-internacionais',
        path: '/compras-internacionais',
        name: 'Compras Internacionais',
        icon: Globe,
        category: 'Compras & Fornecedores',
        description: 'Importação de produtos OPME (SISCOMEX)',
        isImplemented: true
      },
      {
        id: 'viabilidade-importacao',
        path: '/viabilidade-importacao',
        name: 'Viabilidade Importação',
        icon: TrendingUp,
        category: 'Compras & Fornecedores',
        description: 'Análise de viabilidade financeira de importações',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Vendas & CRM',
    icon: Briefcase,
    routes: [
      {
        id: 'crm-vendas',
        path: '/crm-vendas',
        name: 'CRM Vendas',
        icon: Users,
        category: 'Vendas & CRM',
        description: 'CRM completo com funil de vendas',
        isImplemented: true
      },
      {
        id: 'campanhas-marketing',
        path: '/campanhas-marketing',
        name: 'Campanhas Marketing',
        icon: Megaphone,
        category: 'Vendas & CRM',
        description: 'Gestão de campanhas de marketing digital',
        isImplemented: true
      },
      {
        id: 'tabelas-precos-import',
        path: '/tabelas-precos-import',
        name: 'Tabelas Preços Import',
        icon: FileSpreadsheet,
        category: 'Vendas & CRM',
        description: 'Importação em massa de tabelas de preços',
        isImplemented: true
      },
      {
        id: 'qualidade-certificacao',
        path: '/qualidade-certificacao',
        name: 'Qualidade Certificação',
        icon: Shield,
        category: 'Vendas & CRM',
        description: 'Gestão de qualidade e certificações (ISO, ANVISA)',
        isImplemented: true
      },
      {
        id: 'video-calls-manager',
        path: '/video-calls-manager',
        name: 'Video Calls Manager',
        icon: Video,
        category: 'Vendas & CRM',
        description: 'Videochamadas integradas para atendimento',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Financeiro & Faturamento',
    icon: DollarSign,
    routes: [
      {
        id: 'financeiro-avancado',
        path: '/financeiro-avancado',
        name: 'Financeiro Avançado',
        icon: DollarSign,
        category: 'Financeiro & Faturamento',
        description: 'Gestão financeira completa (contas a pagar/receber)',
        isImplemented: true
      },
      {
        id: 'contas-receber-ia',
        path: '/contas-receber-ia',
        name: 'Contas a Receber IA',
        icon: TrendingUp,
        category: 'Financeiro & Faturamento',
        description: 'Gestão de recebíveis com IA (score inadimplência)',
        isImplemented: true
      },
      {
        id: 'faturamento-avancado',
        path: '/faturamento-avancado',
        name: 'Faturamento Avançado',
        icon: FileText,
        category: 'Financeiro & Faturamento',
        description: 'Faturamento hospitalar (TISS, AMB, CBHPM)',
        isImplemented: true
      },
      {
        id: 'faturamento-nfe-completo',
        path: '/faturamento-nfe-completo',
        name: 'Faturamento NFe',
        icon: Receipt,
        category: 'Financeiro & Faturamento',
        description: 'Emissão de NF-e integrada com SEFAZ',
        isImplemented: true
      },
      {
        id: 'gestao-contabil',
        path: '/gestao-contabil',
        name: 'Gestão Contábil',
        icon: FileSpreadsheet,
        category: 'Financeiro & Faturamento',
        description: 'Contabilidade e plano de contas',
        isImplemented: true
      },
      {
        id: 'relatorios-financeiros',
        path: '/relatorios-financeiros',
        name: 'Relatórios Financeiros',
        icon: BarChart3,
        category: 'Financeiro & Faturamento',
        description: 'Relatórios financeiros gerenciais (DRE, Fluxo de Caixa)',
        isImplemented: true
      },
      {
        id: 'relatorios-regulatorios',
        path: '/relatorios-regulatorios',
        name: 'Relatórios Regulatórios',
        icon: FileCheck,
        category: 'Financeiro & Faturamento',
        description: 'Relatórios regulatórios (SPED, DCTF, DIRF)',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Compliance & Auditoria',
    icon: Lock,
    routes: [
      {
        id: 'compliance-auditoria',
        path: '/compliance-auditoria',
        name: 'Compliance e Auditoria',
        icon: Shield,
        category: 'Compliance & Auditoria',
        description: 'Auditoria interna e compliance regulatório',
        isImplemented: true
      },
      {
        id: 'compliance-avancado',
        path: '/compliance-avancado',
        name: 'Compliance Avançado',
        icon: Lock,
        category: 'Compliance & Auditoria',
        description: 'Compliance avançado (LGPD, ISO 27001, 21 CFR Part 11)',
        isImplemented: true
      },
      {
        id: 'notificacoes-inteligentes',
        path: '/notificacoes-inteligentes',
        name: 'Notificações Inteligentes',
        icon: Bell,
        category: 'Compliance & Auditoria',
        description: 'Sistema de notificações inteligentes e alertas',
        isImplemented: true
      }
    ]
  },
  {
    name: 'IA & Automação',
    icon: Brain,
    routes: [
      {
        id: 'ia-central',
        path: '/ia-central',
        name: 'IA Central',
        icon: Brain,
        category: 'IA & Automação',
        description: 'Centro de controle de IA (IcarusBrain)',
        isImplemented: true
      },
      {
        id: 'automacao-ia',
        path: '/automacao-ia',
        name: 'Automação IA',
        icon: Zap,
        category: 'IA & Automação',
        description: 'Automações inteligentes baseadas em IA',
        isImplemented: true
      },
      {
        id: 'chatbot-metrics',
        path: '/chatbot-metrics',
        name: 'Chatbot Metrics',
        icon: MessageSquare,
        category: 'IA & Automação',
        description: 'Métricas e análises do chatbot IA',
        isImplemented: true
      },
      {
        id: 'voice-analytics',
        path: '/voice-analytics',
        name: 'Voice Analytics',
        icon: Activity,
        category: 'IA & Automação',
        description: 'Análise de voz e comandos por voz',
        isImplemented: true
      },
      {
        id: 'voice-biometrics',
        path: '/voice-biometrics',
        name: 'Voice Biometrics',
        icon: Fingerprint,
        category: 'IA & Automação',
        description: 'Biometria por voz para autenticação',
        isImplemented: true
      },
      {
        id: 'voice-macros',
        path: '/voice-macros',
        name: 'Voice Macros',
        icon: Mic,
        category: 'IA & Automação',
        description: 'Macros ativadas por comandos de voz',
        isImplemented: true
      },
      {
        id: 'tooltip-analytics',
        path: '/tooltip-analytics',
        name: 'Tooltip Analytics',
        icon: Target,
        category: 'IA & Automação',
        description: 'Analytics de tooltips e ajuda contextual',
        isImplemented: true
      },
      {
        id: 'workflow-builder',
        path: '/workflow-builder',
        name: 'Workflow Builder',
        icon: Workflow,
        category: 'IA & Automação',
        description: 'Construtor visual de workflows automatizados',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Sistema & Integrações',
    icon: Settings,
    routes: [
      {
        id: 'configuracoes-system',
        path: '/configuracoes-system',
        name: 'Configurações System',
        icon: Settings,
        category: 'Sistema & Integrações',
        description: 'Configurações gerais do sistema',
        isImplemented: true
      },
      {
        id: 'configuracoes-avancadas',
        path: '/configuracoes-avancadas',
        name: 'Configurações Avançadas',
        icon: FileCog,
        category: 'Sistema & Integrações',
        description: 'Configurações avançadas e personalizações',
        isImplemented: true
      },
      {
        id: 'system-health',
        path: '/system-health',
        name: 'System Health',
        icon: Heart,
        category: 'Sistema & Integrações',
        description: 'Monitoramento de saúde do sistema',
        isImplemented: true
      },
      {
        id: 'kpi-dashboard',
        path: '/kpi-dashboard',
        name: 'KPI Dashboard',
        icon: PieChart,
        category: 'Sistema & Integrações',
        description: 'Dashboard executivo de KPIs',
        isImplemented: true
      },
      {
        id: 'analytics-bi',
        path: '/analytics-bi',
        name: 'Analytics BI',
        icon: BarChart3,
        category: 'Sistema & Integrações',
        description: 'Business Intelligence e análises avançadas',
        isImplemented: true
      },
      {
        id: 'analytics-predicao',
        path: '/analytics-predicao',
        name: 'Analytics Predição',
        icon: TrendingUp,
        category: 'Sistema & Integrações',
        description: 'Predições e forecasting com IA',
        isImplemented: true
      },
      {
        id: 'bi-dashboard-interactive',
        path: '/bi-dashboard-interactive',
        name: 'BI Dashboard Interactive',
        icon: Activity,
        category: 'Sistema & Integrações',
        description: 'Dashboard BI interativo e customizável',
        isImplemented: true
      },
      {
        id: 'relatorios-executivos',
        path: '/relatorios-executivos',
        name: 'Relatórios Executivos',
        icon: FileText,
        category: 'Sistema & Integrações',
        description: 'Relatórios executivos para diretoria',
        isImplemented: true
      },
      {
        id: 'integracoes-avancadas',
        path: '/integracoes-avancadas',
        name: 'Integrações Avançadas',
        icon: Plug,
        category: 'Sistema & Integrações',
        description: 'Integrações com sistemas externos',
        isImplemented: true
      },
      {
        id: 'integrations-manager',
        path: '/integrations-manager',
        name: 'Integrations Manager',
        icon: Database,
        category: 'Sistema & Integrações',
        description: 'Gerenciamento de integrações ativas',
        isImplemented: true
      },
      {
        id: 'api-gateway',
        path: '/api-gateway',
        name: 'API Gateway',
        icon: Webhook,
        category: 'Sistema & Integrações',
        description: 'Gateway de APIs e webhooks',
        isImplemented: true
      },
      {
        id: 'webhooks-manager',
        path: '/webhooks-manager',
        name: 'Webhooks Manager',
        icon: Zap,
        category: 'Sistema & Integrações',
        description: 'Gerenciamento de webhooks',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Dev Tools',
    icon: Eye,
    routes: [
      {
        id: 'showcase',
        path: '/showcase',
        name: 'Showcase',
        icon: Eye,
        category: 'Dev Tools',
        description: 'Demonstração de componentes do sistema',
        isImplemented: true
      },
      {
        id: 'contato',
        path: '/contato',
        name: 'Contato',
        icon: Mail,
        category: 'Dev Tools',
        description: 'Formulário de contato',
        isImplemented: true
      }
    ]
  }
] as const satisfies readonly NavigationCategory[]

// Helper to get all routes flat
type NavigationRoute = (typeof navigationConfig)[number]['routes'][number]
type ImplementedRoute = Extract<NavigationRoute, { isImplemented: true }>

export type ImplementedRouteId = ImplementedRoute['id']

export const implementedRouteIds: ImplementedRouteId[] = navigationConfig.flatMap(
  category =>
    category.routes
      .filter((route): route is ImplementedRoute => route.isImplemented === true)
      .map(route => route.id)
)

export const getAllRoutes = () => {
  return navigationConfig.flatMap(category => category.routes)
}

// Helper to get route by ID
export const getRouteById = (id: string) => {
  return getAllRoutes().find(route => route.id === id)
}

// Helper to get implemented routes
export const getImplementedRoutes = () => {
  return getAllRoutes().filter(route => route.isImplemented)
}
