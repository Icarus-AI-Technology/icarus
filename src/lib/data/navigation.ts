import {
  LayoutDashboard, Package, Calendar, DollarSign, Users, Building2,
  ShoppingCart, FileText, Settings, BarChart3, Truck, Shield,
  Brain, Zap, Webhook, TrendingUp, UserCog, FileSpreadsheet,
  Activity, Bell, MessageSquare, Video, Fingerprint, Workflow,
  Globe, Lock, ClipboardCheck, Heart, Boxes, Factory, Eye, Mail,
  Plug, ListChecks
} from 'lucide-react'
import { NavigationCategory } from '../types/navigation'

export const navigationConfig = [
  {
    name: 'Principal',
    icon: LayoutDashboard,
    routes: [
      {
        id: 'dashboard',
        path: '/',
        name: 'Dashboard',
        icon: LayoutDashboard,
        category: 'Principal',
        description: 'Visão geral do sistema',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Core Business',
    icon: Package,
    routes: [
      {
        id: 'estoque-ia',
        path: '/estoque-ia',
        name: 'Estoque IA',
        icon: Package,
        category: 'Core Business',
        description: 'Gestão inteligente de estoque',
        isImplemented: true
      },
      {
        id: 'cirurgias',
        path: '/cirurgias',
        name: 'Cirurgias',
        icon: Calendar,
        category: 'Core Business',
        description: 'Gestão de procedimentos cirúrgicos',
        isImplemented: true
      },
      {
        id: 'financeiro',
        path: '/financeiro',
        name: 'Financeiro',
        icon: DollarSign,
        category: 'Core Business',
        description: 'Gestão financeira avançada',
        isImplemented: true
      },
      {
        id: 'crm-vendas',
        path: '/crm-vendas',
        name: 'CRM & Vendas',
        icon: Users,
        category: 'Core Business',
        description: 'Gestão de clientes e vendas',
        isImplemented: true
      },
      {
        id: 'produtos',
        path: '/produtos',
        name: 'Produtos OPME',
        icon: Boxes,
        category: 'Core Business',
        description: 'Cadastro de produtos OPME',
        isImplemented: true
      },
      {
        id: 'contas-receber',
        path: '/contas-receber',
        name: 'Contas a Receber',
        icon: FileSpreadsheet,
        category: 'Core Business',
        description: 'Gestão completa de recebíveis',
        isImplemented: true
      },
      {
        id: 'faturamento',
        path: '/faturamento',
        name: 'Faturamento NFe',
        icon: FileText,
        category: 'Core Business',
        description: 'Emissão de notas fiscais eletrônicas',
        isImplemented: true
      },
      {
        id: 'inventario',
        path: '/inventario',
        name: 'Inventário',
        icon: ClipboardCheck,
        category: 'Core Business',
        description: 'Controle de inventário físico',
        isImplemented: true
      },
      {
        id: 'tabela-precos',
        path: '/tabela-precos',
        name: 'Tabela de Preços',
        icon: DollarSign,
        category: 'Core Business',
        description: 'Gestão de tabelas de preços',
        isImplemented: true
      }
    ]
  },
  {
    name: 'Compras & Fornecedores',
    icon: ShoppingCart,
    routes: [
      {
        id: 'compras',
        path: '/compras',
        name: 'Gestão de Compras',
        icon: ShoppingCart,
        category: 'Compras & Fornecedores',
        description: 'Gestão completa de compras e fornecedores',
        isImplemented: true
      },
      {
        id: 'notas-compra',
        path: '/notas-compra',
        name: 'Notas de Compra',
        icon: FileText,
        category: 'Compras & Fornecedores',
        isImplemented: false
      },
      {
        id: 'compras-internacionais',
        path: '/compras-internacionais',
        name: 'Compras Internacionais',
        icon: Globe,
        category: 'Compras & Fornecedores',
        isImplemented: false
      },
      {
        id: 'viabilidade-importacao',
        path: '/viabilidade-importacao',
        name: 'Viabilidade Importação',
        icon: TrendingUp,
        category: 'Compras & Fornecedores',
        isImplemented: false
      },
      {
        id: 'licitacoes',
        path: '/licitacoes',
        name: 'Licitações',
        icon: FileSpreadsheet,
        category: 'Compras & Fornecedores',
        description: 'Gestão de licitações públicas',
        isImplemented: true
      },
      {
        id: 'grupos-produtos',
        path: '/grupos-produtos',
        name: 'Grupos de Produtos',
        icon: Package,
        category: 'Compras & Fornecedores',
        isImplemented: false
      }
    ]
  },
  {
    name: 'Cadastros & Gestão',
    icon: Settings,
    routes: [
      {
        id: 'cadastros',
        path: '/cadastros',
        name: 'Cadastros',
        icon: FileText,
        category: 'Cadastros & Gestão',
        description: 'Cadastros auxiliares do sistema',
        isImplemented: true
      },
      {
        id: 'contratos',
        path: '/contratos',
        name: 'Contratos',
        icon: FileText,
        category: 'Cadastros & Gestão',
        isImplemented: false
      },
      {
        id: 'contabil',
        path: '/contabil',
        name: 'Contábil',
        icon: FileSpreadsheet,
        category: 'Cadastros & Gestão',
        isImplemented: false
      },
      {
        id: 'rh',
        path: '/rh',
        name: 'RH & Pessoas',
        icon: UserCog,
        category: 'Cadastros & Gestão',
        isImplemented: false
      },
      {
        id: 'usuarios',
        path: '/usuarios',
        name: 'Usuários',
        icon: Users,
        category: 'Cadastros & Gestão',
        isImplemented: false
      },
      {
        id: 'configuracoes',
        path: '/configuracoes',
        name: 'Configurações',
        icon: Settings,
        category: 'Cadastros & Gestão',
        isImplemented: false
      },
      {
        id: 'relatorios-financeiros',
        path: '/relatorios-financeiros',
        name: 'Relatórios Financeiros',
        icon: BarChart3,
        category: 'Cadastros & Gestão',
        isImplemented: false
      },
      {
        id: 'hospitais',
        path: '/hospitais',
        name: 'Hospitais',
        icon: Building2,
        category: 'Cadastros & Gestão',
        isImplemented: false
      }
    ]
  },
  {
    name: 'Operações & Logística',
    icon: Truck,
    routes: [
      {
        id: 'logistica',
        path: '/logistica',
        name: 'Logística',
        icon: Truck,
        category: 'Operações & Logística',
        isImplemented: false
      },
      {
        id: 'transportadoras',
        path: '/transportadoras',
        name: 'Transportadoras',
        icon: Truck,
        category: 'Operações & Logística',
        isImplemented: false
      },
      {
        id: 'consignacao',
        path: '/consignacao',
        name: 'Consignação',
        icon: Package,
        category: 'Operações & Logística',
        isImplemented: false
      },
      {
        id: 'rastreabilidade',
        path: '/rastreabilidade',
        name: 'Rastreabilidade',
        icon: Activity,
        category: 'Operações & Logística',
        isImplemented: false
      },
      {
        id: 'manutencao',
        path: '/manutencao',
        name: 'Manutenção',
        icon: Settings,
        category: 'Operações & Logística',
        isImplemented: false
      },
      {
        id: 'qualidade',
        path: '/qualidade',
        name: 'Qualidade',
        icon: Shield,
        category: 'Operações & Logística',
        isImplemented: false
      },
      {
        id: 'compliance',
        path: '/compliance',
        name: 'Compliance',
        icon: Lock,
        category: 'Operações & Logística',
        isImplemented: false
      }
    ]
  },
  {
    name: 'Analytics & BI',
    icon: BarChart3,
    routes: [
      {
        id: 'analytics-bi',
        path: '/analytics-bi',
        name: 'Analytics BI',
        icon: BarChart3,
        category: 'Analytics & BI',
        isImplemented: false
      },
      {
        id: 'analytics-predicao',
        path: '/analytics-predicao',
        name: 'Predição',
        icon: TrendingUp,
        category: 'Analytics & BI',
        isImplemented: false
      },
      {
        id: 'kpi-dashboard',
        path: '/kpi-dashboard',
        name: 'KPI Dashboard',
        icon: Activity,
        category: 'Analytics & BI',
        isImplemented: false
      },
      {
        id: 'bi-interactive',
        path: '/bi-interactive',
        name: 'BI Interativo',
        icon: BarChart3,
        category: 'Analytics & BI',
        isImplemented: false
      },
      {
        id: 'relatorios-executivos',
        path: '/relatorios-executivos',
        name: 'Relatórios Executivos',
        icon: FileText,
        category: 'Analytics & BI',
        isImplemented: false
      },
      {
        id: 'relatorios-regulatorios',
        path: '/relatorios-regulatorios',
        name: 'Relatórios Regulatórios',
        icon: ClipboardCheck,
        category: 'Analytics & BI',
        isImplemented: false
      },
      {
        id: 'system-health',
        path: '/system-health',
        name: 'System Health',
        icon: Heart,
        category: 'Analytics & BI',
        isImplemented: false
      }
    ]
  },
  {
    name: 'Marketing & Vendas',
    icon: TrendingUp,
    routes: [
      {
        id: 'leads',
        path: '/leads',
        name: 'Leads',
        icon: Users,
        category: 'Marketing & Vendas',
        isImplemented: false
      },
      {
        id: 'campanhas',
        path: '/campanhas',
        name: 'Campanhas',
        icon: Bell,
        category: 'Marketing & Vendas',
        isImplemented: false
      },
      {
        id: 'relacionamento',
        path: '/relacionamento',
        name: 'Relacionamento',
        icon: MessageSquare,
        category: 'Marketing & Vendas',
        isImplemented: false
      }
    ]
  },
  {
    name: 'Automação & IA',
    icon: Brain,
    routes: [
      {
        id: 'ia-central',
        path: '/ia-central',
        name: 'IA Central',
        icon: Brain,
        category: 'Automação & IA',
        isImplemented: false
      },
      {
        id: 'automacao-ia',
        path: '/automacao-ia',
        name: 'Automação',
        icon: Zap,
        category: 'Automação & IA',
        isImplemented: false
      },
      {
        id: 'notificacoes-inteligentes',
        path: '/notificacoes-inteligentes',
        name: 'Notificações',
        icon: Bell,
        category: 'Automação & IA',
        isImplemented: false
      },
      {
        id: 'chatbot-metrics',
        path: '/chatbot-metrics',
        name: 'Chatbot Metrics',
        icon: MessageSquare,
        category: 'Automação & IA',
        isImplemented: false
      },
      {
        id: 'tooltip-analytics',
        path: '/tooltip-analytics',
        name: 'Tooltip Analytics',
        icon: Activity,
        category: 'Automação & IA',
        isImplemented: false
      },
      {
        id: 'voice-analytics',
        path: '/voice-analytics',
        name: 'Voice Analytics',
        icon: Activity,
        category: 'Automação & IA',
        isImplemented: false
      }
    ]
  },
  {
    name: 'Integrações',
    icon: Webhook,
    routes: [
      {
        id: 'integrations-dashboard',
        path: '/integrations-dashboard',
        name: 'Dashboard Integrações',
        icon: Plug,
        category: 'Integrações',
        description: 'Monitoramento de integrações externas',
        isImplemented: true
      },
      {
        id: 'auditor-checklist-integrations',
        path: '/auditor-checklist-integrations',
        name: 'Auditoria Integrações',
        icon: ListChecks,
        category: 'Integrações',
        description: 'Checklist de auditoria de integrações',
        isImplemented: true
      },
      {
        id: 'api-gateway',
        path: '/api-gateway',
        name: 'API Gateway',
        icon: Webhook,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'integracoes',
        path: '/integracoes',
        name: 'Integrações',
        icon: Globe,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'integrations-manager',
        path: '/integrations-manager',
        name: 'Integrations Manager',
        icon: Settings,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'telemetria-iot',
        path: '/telemetria-iot',
        name: 'Telemetria IoT',
        icon: Activity,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'voice-biometrics',
        path: '/voice-biometrics',
        name: 'Voice Biometrics',
        icon: Fingerprint,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'voice-macros',
        path: '/voice-macros',
        name: 'Voice Macros',
        icon: MessageSquare,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'video-calls',
        path: '/video-calls',
        name: 'Video Calls',
        icon: Video,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'workflow-builder',
        path: '/workflow-builder',
        name: 'Workflow Builder',
        icon: Workflow,
        category: 'Integrações',
        isImplemented: false
      },
      {
        id: 'fabricantes',
        path: '/fabricantes',
        name: 'Fabricantes',
        icon: Factory,
        category: 'Integrações',
        isImplemented: false
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
        description: 'Demonstração interativa de todos os componentes',
        isImplemented: true
      },
      {
        id: 'contato',
        path: '/contato',
        name: 'Contato',
        icon: Mail,
        category: 'Dev Tools',
        description: 'Formulário de contato com validação Zod',
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
