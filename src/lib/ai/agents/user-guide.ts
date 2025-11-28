/**
 * ICARUS v5.0 - User Guide Agent
 * 
 * Orienta usuários com passos guiados e onboarding interativo.
 * Expande o ChatWidget existente com orientação contextual.
 * 
 * LLMs: Claude para prompts personalizados, Flowise para low-code
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { BaseAgent } from './base-agent'
import { type AgentInput, type AgentAction } from './types'

// ============ TIPOS ============

interface Tutorial {
  id: string
  title: string
  module: string
  description: string
  steps: TutorialStep[]
  estimatedTime: number // minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface TutorialStep {
  order: number
  title: string
  description: string
  action: AgentAction
  tips?: string[]
  warnings?: string[]
}

interface HelpTopic {
  id: string
  title: string
  content: string
  relatedTopics: string[]
  module?: string
}

interface FeatureExplanation {
  feature: string
  description: string
  howToUse: string[]
  tips: string[]
  relatedFeatures: string[]
}

// ============ CLASSE ============

export class UserGuideAgent extends BaseAgent {
  constructor() {
    super('user-guide')
  }

  // ============ VALIDAÇÃO ============

  protected async validateInput(input: AgentInput): Promise<boolean> {
    return input.message && input.message.trim().length > 0
  }

  // ============ PROCESSAMENTO DE TOOLS ============

  protected async processTools(toolCalls: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }>): Promise<Array<{
    id: string
    name: string
    result: unknown
  }>> {
    const results = []

    for (const toolCall of toolCalls) {
      let result: unknown

      switch (toolCall.name) {
        case 'get_help':
          result = await this.getHelp(toolCall.arguments)
          break
        case 'show_tutorial':
          result = await this.showTutorial(toolCall.arguments)
          break
        case 'explain_feature':
          result = await this.explainFeature(toolCall.arguments)
          break
        case 'navigate_to':
          result = await this.navigateTo(toolCall.arguments)
          break
        default:
          result = { error: `Unknown tool: ${toolCall.name}` }
      }

      results.push({
        id: toolCall.id,
        name: toolCall.name,
        result,
      })
    }

    return results
  }

  // ============ TOOLS ============

  /**
   * Busca ajuda sobre um tópico
   */
  private async getHelp(args: Record<string, unknown>): Promise<HelpTopic | { error: string }> {
    const topic = args.topic as string || ''
    const module = args.module as string

    // Base de conhecimento de ajuda
    const helpTopics: HelpTopic[] = [
      // Dashboard
      {
        id: 'dashboard-overview',
        title: 'Visão Geral do Dashboard',
        content: 'O Dashboard é a página inicial do ICARUS, mostrando KPIs importantes, ações rápidas e alertas. Você pode personalizar os cards arrastando-os para reordenar.',
        relatedTopics: ['kpis', 'acoes-rapidas', 'alertas'],
        module: 'dashboard',
      },
      {
        id: 'kpis',
        title: 'KPIs e Indicadores',
        content: 'Os KPIs mostram métricas em tempo real: Cirurgias Hoje, Faturamento do Mês, Estoque Crítico e Alertas. Clique em um KPI para ver detalhes.',
        relatedTopics: ['dashboard-overview', 'graficos'],
        module: 'dashboard',
      },
      // Estoque
      {
        id: 'estoque-movimentacao',
        title: 'Movimentação de Estoque',
        content: 'Para movimentar estoque: 1) Acesse Estoque IA; 2) Clique em "Nova Movimentação"; 3) Selecione tipo (Entrada/Saída); 4) Informe produto, quantidade e lote; 5) Confirme.',
        relatedTopics: ['estoque-lotes', 'estoque-alertas'],
        module: 'estoque-ia',
      },
      {
        id: 'estoque-lotes',
        title: 'Gestão de Lotes',
        content: 'Cada lote tem número único, validade e rastreabilidade. O sistema alerta lotes próximos ao vencimento (90 dias) e usa FEFO automaticamente.',
        relatedTopics: ['estoque-movimentacao', 'rastreabilidade'],
        module: 'estoque-ia',
      },
      {
        id: 'estoque-alertas',
        title: 'Alertas de Estoque',
        content: 'Alertas automáticos para: estoque mínimo, lotes vencendo, produtos sem movimento. Configure thresholds em Configurações > Estoque.',
        relatedTopics: ['estoque-lotes', 'configuracoes'],
        module: 'estoque-ia',
      },
      // Cirurgias
      {
        id: 'cirurgia-agendamento',
        title: 'Agendamento de Cirurgia',
        content: 'Para agendar: 1) Acesse Cirurgias; 2) Clique "Agendar"; 3) Selecione paciente, médico e hospital; 4) Escolha data/hora; 5) Adicione materiais; 6) Confirme.',
        relatedTopics: ['cirurgia-materiais', 'cirurgia-faturamento'],
        module: 'cirurgias-procedimentos',
      },
      {
        id: 'cirurgia-materiais',
        title: 'Materiais para Cirurgia',
        content: 'Ao agendar, selecione os materiais OPME necessários. O sistema verifica disponibilidade em tempo real e sugere alternativas se necessário.',
        relatedTopics: ['cirurgia-agendamento', 'estoque-movimentacao'],
        module: 'cirurgias-procedimentos',
      },
      // Cadastros
      {
        id: 'cadastro-medico',
        title: 'Cadastro de Médico',
        content: 'Para cadastrar médico: 1) Acesse Gestão de Cadastros > Médicos; 2) Clique "Novo"; 3) Informe nome, CRM, especialidade; 4) O sistema valida CRM automaticamente.',
        relatedTopics: ['cadastro-hospital', 'validacao-crm'],
        module: 'gestao-cadastros',
      },
      {
        id: 'cadastro-hospital',
        title: 'Cadastro de Hospital',
        content: 'Para cadastrar hospital: 1) Acesse Gestão de Cadastros > Hospitais; 2) Clique "Novo"; 3) Informe razão social, CNPJ, endereço; 4) CNPJ é validado automaticamente.',
        relatedTopics: ['cadastro-medico', 'validacao-cnpj'],
        module: 'gestao-cadastros',
      },
      // Financeiro
      {
        id: 'financeiro-nfe',
        title: 'Emissão de NF-e',
        content: 'Para emitir NF-e: 1) Acesse Financeiro > Faturamento; 2) Selecione cirurgia/venda; 3) Confira itens e valores; 4) Clique "Emitir NF-e"; 5) Aguarde transmissão SEFAZ.',
        relatedTopics: ['financeiro-faturamento', 'cirurgia-faturamento'],
        module: 'financeiro-avancado',
      },
      // Compliance
      {
        id: 'compliance-anvisa',
        title: 'Conformidade ANVISA',
        content: 'O sistema valida registros ANVISA automaticamente. Produtos sem registro válido são bloqueados. Acesse Compliance para ver status geral.',
        relatedTopics: ['rastreabilidade', 'auditoria'],
        module: 'compliance-auditoria',
      },
    ]

    // Buscar tópico relevante
    const topicLower = topic.toLowerCase()
    
    // Busca exata
    let found = helpTopics.find(h => 
      h.id === topic || 
      h.title.toLowerCase() === topicLower
    )

    // Busca por palavras-chave
    if (!found) {
      found = helpTopics.find(h =>
        h.title.toLowerCase().includes(topicLower) ||
        h.content.toLowerCase().includes(topicLower) ||
        (module && h.module === module)
      )
    }

    // Busca fuzzy
    if (!found) {
      const keywords = topicLower.split(/\s+/)
      found = helpTopics.find(h =>
        keywords.some(k => 
          h.title.toLowerCase().includes(k) ||
          h.content.toLowerCase().includes(k)
        )
      )
    }

    if (found) {
      return found
    }

    return {
      error: `Não encontrei ajuda sobre "${topic}". Tente termos como: dashboard, estoque, cirurgia, cadastro, financeiro, compliance.`,
    }
  }

  /**
   * Mostra tutorial passo a passo
   */
  private async showTutorial(args: Record<string, unknown>): Promise<Tutorial | { error: string }> {
    const tutorialId = args.tutorialId as string
    const module = args.module as string

    // Tutoriais disponíveis
    const tutorials: Tutorial[] = [
      {
        id: 'onboarding',
        title: 'Primeiros Passos no ICARUS',
        module: 'dashboard',
        description: 'Aprenda a navegar pelo sistema e conhecer as principais funcionalidades.',
        estimatedTime: 10,
        difficulty: 'beginner',
        steps: [
          {
            order: 1,
            title: 'Conhecendo o Dashboard',
            description: 'O Dashboard é sua página inicial. Aqui você vê KPIs importantes e pode acessar ações rápidas.',
            action: {
              id: 'nav-dashboard',
              type: 'navigate',
              target: '/dashboard',
              description: 'Ir para o Dashboard',
            },
            tips: ['Use os cards de KPI para ver métricas em tempo real', 'Clique nos alertas para ver detalhes'],
          },
          {
            order: 2,
            title: 'Navegando pela Sidebar',
            description: 'A sidebar à esquerda organiza todos os módulos em categorias. Clique para expandir.',
            action: {
              id: 'open-sidebar',
              type: 'navigate',
              target: 'sidebar',
              description: 'Explorar a sidebar',
            },
            tips: ['Passe o mouse sobre os ícones para ver os nomes', 'Use Ctrl+B para colapsar/expandir'],
          },
          {
            order: 3,
            title: 'Alterando o Tema',
            description: 'Você pode alternar entre modo claro e escuro clicando no ícone de sol/lua na topbar.',
            action: {
              id: 'toggle-theme',
              type: 'navigate',
              target: 'theme-toggle',
              description: 'Alternar tema',
            },
            tips: ['O tema escuro é mais confortável para uso prolongado'],
          },
        ],
      },
      {
        id: 'cadastro-produto',
        title: 'Como Cadastrar um Produto OPME',
        module: 'estoque-ia',
        description: 'Aprenda a cadastrar produtos OPME com todas as informações obrigatórias.',
        estimatedTime: 5,
        difficulty: 'beginner',
        steps: [
          {
            order: 1,
            title: 'Acessar Estoque IA',
            description: 'Navegue até o módulo de Estoque IA na sidebar.',
            action: {
              id: 'nav-estoque',
              type: 'navigate',
              target: '/estoque-ia',
              description: 'Ir para Estoque IA',
            },
          },
          {
            order: 2,
            title: 'Iniciar Cadastro',
            description: 'Clique no botão "Cadastrar Produto" para abrir o formulário.',
            action: {
              id: 'open-form',
              type: 'navigate',
              target: 'btn-cadastrar',
              description: 'Abrir formulário de cadastro',
            },
          },
          {
            order: 3,
            title: 'Preencher Dados Básicos',
            description: 'Informe: nome do produto, código interno, fabricante e classe de risco.',
            action: {
              id: 'fill-basic',
              type: 'fill_form',
              data: { fields: ['nome', 'codigo', 'fabricante', 'classe_risco'] },
              description: 'Preencher dados básicos',
            },
            tips: ['Use nomes descritivos', 'O código deve ser único'],
            warnings: ['Classe de risco é obrigatória para produtos ANVISA'],
          },
          {
            order: 4,
            title: 'Informar Registro ANVISA',
            description: 'Digite o código de registro ANVISA. O sistema validará automaticamente.',
            action: {
              id: 'fill-anvisa',
              type: 'fill_form',
              data: { fields: ['codigo_anvisa'] },
              description: 'Informar código ANVISA',
            },
            tips: ['O código ANVISA tem 11 dígitos'],
            warnings: ['Produtos sem registro válido serão bloqueados'],
          },
          {
            order: 5,
            title: 'Salvar Cadastro',
            description: 'Revise os dados e clique em "Salvar" para finalizar.',
            action: {
              id: 'submit-form',
              type: 'submit',
              description: 'Salvar cadastro',
            },
          },
        ],
      },
      {
        id: 'agendar-cirurgia',
        title: 'Como Agendar uma Cirurgia',
        module: 'cirurgias-procedimentos',
        description: 'Aprenda a agendar cirurgias com seleção de materiais.',
        estimatedTime: 8,
        difficulty: 'intermediate',
        steps: [
          {
            order: 1,
            title: 'Acessar Cirurgias',
            description: 'Navegue até o módulo de Cirurgias e Procedimentos.',
            action: {
              id: 'nav-cirurgias',
              type: 'navigate',
              target: '/cirurgias-procedimentos',
              description: 'Ir para Cirurgias',
            },
          },
          {
            order: 2,
            title: 'Novo Agendamento',
            description: 'Clique em "Agendar Cirurgia" para iniciar.',
            action: {
              id: 'new-schedule',
              type: 'navigate',
              target: 'btn-agendar',
              description: 'Iniciar agendamento',
            },
          },
          {
            order: 3,
            title: 'Selecionar Paciente',
            description: 'Busque e selecione o paciente. Se não existir, cadastre primeiro.',
            action: {
              id: 'select-patient',
              type: 'fill_form',
              data: { fields: ['paciente'] },
              description: 'Selecionar paciente',
            },
          },
          {
            order: 4,
            title: 'Selecionar Médico',
            description: 'Escolha o médico responsável. O CRM será validado.',
            action: {
              id: 'select-doctor',
              type: 'fill_form',
              data: { fields: ['medico'] },
              description: 'Selecionar médico',
            },
          },
          {
            order: 5,
            title: 'Definir Data e Local',
            description: 'Escolha data, hora e hospital para a cirurgia.',
            action: {
              id: 'set-datetime',
              type: 'fill_form',
              data: { fields: ['data', 'hora', 'hospital'] },
              description: 'Definir data e local',
            },
            tips: ['Verifique disponibilidade do médico', 'Confirme disponibilidade da sala'],
          },
          {
            order: 6,
            title: 'Adicionar Materiais',
            description: 'Selecione os materiais OPME necessários. O sistema verifica estoque.',
            action: {
              id: 'add-materials',
              type: 'fill_form',
              data: { fields: ['materiais'] },
              description: 'Adicionar materiais',
            },
            warnings: ['Materiais sem estoque serão destacados', 'Verifique validade dos lotes'],
          },
          {
            order: 7,
            title: 'Confirmar Agendamento',
            description: 'Revise todos os dados e confirme o agendamento.',
            action: {
              id: 'confirm-schedule',
              type: 'submit',
              description: 'Confirmar agendamento',
            },
          },
        ],
      },
    ]

    // Buscar tutorial
    let tutorial = tutorials.find(t => t.id === tutorialId)

    if (!tutorial && module) {
      tutorial = tutorials.find(t => t.module === module)
    }

    if (tutorial) {
      return tutorial
    }

    return {
      error: `Tutorial não encontrado. Tutoriais disponíveis: ${tutorials.map(t => t.id).join(', ')}`,
    }
  }

  /**
   * Explica uma funcionalidade do sistema
   */
  private async explainFeature(args: Record<string, unknown>): Promise<FeatureExplanation | { error: string }> {
    const feature = args.feature as string || ''

    // Base de conhecimento de funcionalidades
    const features: Record<string, FeatureExplanation> = {
      'rastreabilidade': {
        feature: 'Rastreabilidade de Produtos OPME',
        description: 'Sistema completo de rastreamento de produtos médicos desde a entrada no estoque até o uso em cirurgia, conforme RDC 59/2008.',
        howToUse: [
          'Cada produto recebe código único ao entrar no sistema',
          'Movimentações são registradas automaticamente',
          'Ao usar em cirurgia, o sistema vincula ao paciente',
          'Histórico completo disponível para auditoria',
        ],
        tips: [
          'Use leitores de código de barras para agilizar',
          'Configure alertas de vencimento',
          'Exporte relatórios para auditorias ANVISA',
        ],
        relatedFeatures: ['estoque', 'lotes', 'anvisa'],
      },
      'fefo': {
        feature: 'FEFO (First Expired, First Out)',
        description: 'Método de gestão de estoque que prioriza a saída de produtos com validade mais próxima.',
        howToUse: [
          'O sistema sugere automaticamente o lote mais antigo',
          'Alertas são gerados para lotes próximos ao vencimento',
          'Relatórios mostram produtos que devem ser priorizados',
        ],
        tips: [
          'Revise relatório FEFO semanalmente',
          'Configure threshold de alerta (padrão: 90 dias)',
          'Use para evitar perdas por vencimento',
        ],
        relatedFeatures: ['rastreabilidade', 'estoque', 'alertas'],
      },
      'validacao-anvisa': {
        feature: 'Validação ANVISA em Tempo Real',
        description: 'Integração com base ANVISA para validar registros de produtos médicos automaticamente.',
        howToUse: [
          'Ao cadastrar produto, informe o código ANVISA',
          'O sistema consulta a base ANVISA',
          'Status é atualizado: Válido, Vencido ou Não Encontrado',
          'Produtos inválidos são bloqueados automaticamente',
        ],
        tips: [
          'Mantenha cadastros atualizados',
          'Configure alertas para vencimento de registros',
          'Use o dashboard de Compliance para visão geral',
        ],
        relatedFeatures: ['compliance', 'cadastros', 'rastreabilidade'],
      },
      'ia-previsao': {
        feature: 'Previsão de Demanda com IA',
        description: 'Algoritmos de machine learning que preveem demanda de produtos baseado em histórico.',
        howToUse: [
          'Acesse Estoque IA > Previsões',
          'Selecione período de análise',
          'Veja previsões para os próximos 30 dias',
          'Use para planejar compras',
        ],
        tips: [
          'Quanto mais histórico, melhor a previsão',
          'Considere sazonalidades (ex: cirurgias eletivas)',
          'Combine com análise de tendências',
        ],
        relatedFeatures: ['estoque', 'compras', 'analytics'],
      },
    }

    const featureLower = feature.toLowerCase()
    const found = Object.entries(features).find(([key, value]) =>
      key.includes(featureLower) ||
      value.feature.toLowerCase().includes(featureLower)
    )

    if (found) {
      return found[1]
    }

    return {
      error: `Funcionalidade não encontrada: "${feature}". Tente: rastreabilidade, fefo, validacao-anvisa, ia-previsao.`,
    }
  }

  /**
   * Navega para uma página/módulo
   */
  private async navigateTo(args: Record<string, unknown>): Promise<AgentAction> {
    const target = args.target as string || '/dashboard'
    const description = args.description as string || `Navegar para ${target}`

    return {
      id: crypto.randomUUID(),
      type: 'navigate',
      target,
      description,
    }
  }
}

export default UserGuideAgent

