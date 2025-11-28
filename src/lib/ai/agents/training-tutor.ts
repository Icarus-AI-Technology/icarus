/**
 * ICARUS v5.0 - Training Tutor Agent
 * 
 * Treina módulos via simulações (cenários RDC 59 para estoque)
 * e gera datasets sintéticos para fine-tuning.
 * 
 * Módulos: Estoque IA, Cirurgias, Financeiro
 * LLMs: Claude 3.5 (raciocínio), Haystack para RAG training
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { BaseAgent } from './base-agent'
import { type AgentInput } from './types'
import { supabase } from '@/lib/config/supabase-client'

// ============ TIPOS ============

interface TrainingScenario {
  id: string
  name: string
  module: string
  regulation: string
  description: string
  steps: TrainingStep[]
  expectedOutcome: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface TrainingStep {
  order: number
  action: string
  input: Record<string, unknown>
  expectedResult: string
  validationRules: string[]
}

interface DatasetEntry {
  id: string
  input: string
  output: string
  module: string
  category: string
  metadata: Record<string, unknown>
}

interface EvaluationResult {
  score: number
  correct: boolean
  feedback: string
  details: Record<string, unknown>
}

// ============ CLASSE ============

export class TrainingTutorAgent extends BaseAgent {
  constructor() {
    super('training-tutor')
  }

  // ============ VALIDAÇÃO ============

  protected async validateInput(input: AgentInput): Promise<boolean> {
    if (!input.message || input.message.trim().length === 0) {
      return false
    }

    // Validar contexto de módulo se fornecido
    if (input.moduleContext) {
      const validModules = ['estoque-ia', 'cirurgias-procedimentos', 'financeiro-avancado']
      if (!validModules.includes(input.moduleContext.module)) {
        return false
      }
    }

    return true
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
        case 'generate_scenario':
          result = await this.generateScenario(toolCall.arguments)
          break
        case 'evaluate_response':
          result = await this.evaluateResponse(toolCall.arguments)
          break
        case 'create_dataset':
          result = await this.createDataset(toolCall.arguments)
          break
        case 'search_regulations':
          result = await this.searchRegulations(toolCall.arguments)
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
   * Gera cenário de treinamento baseado em regulamentação
   */
  private async generateScenario(args: Record<string, unknown>): Promise<TrainingScenario> {
    const module = args.module as string || 'estoque-ia'
    const regulation = args.regulation as string || 'RDC-59'
    const difficulty = args.difficulty as 'easy' | 'medium' | 'hard' || 'medium'

    // Cenários pré-definidos por regulamentação
    const scenarios: Record<string, Partial<TrainingScenario>> = {
      'RDC-59': {
        name: 'Rastreabilidade de Lote OPME',
        module: 'estoque-ia',
        regulation: 'RDC 59/2008',
        description: 'Simula o fluxo completo de rastreabilidade de um lote de produto OPME desde a entrada até o uso em cirurgia.',
        steps: [
          {
            order: 1,
            action: 'Registrar entrada de lote',
            input: {
              produto: 'Prótese de Joelho',
              lote: 'LOT-2025-001',
              quantidade: 10,
              validade: '2027-12-31',
              fornecedor: 'Medtronic',
            },
            expectedResult: 'Lote registrado com sucesso',
            validationRules: ['lote_unico', 'validade_futura', 'fornecedor_valido'],
          },
          {
            order: 2,
            action: 'Verificar registro ANVISA',
            input: {
              codigo_anvisa: '80000000001',
            },
            expectedResult: 'Registro ANVISA válido',
            validationRules: ['anvisa_valido', 'classe_risco_correta'],
          },
          {
            order: 3,
            action: 'Reservar para cirurgia',
            input: {
              cirurgia_id: 'CIR-2025-100',
              quantidade: 1,
            },
            expectedResult: 'Produto reservado',
            validationRules: ['estoque_disponivel', 'validade_ok'],
          },
          {
            order: 4,
            action: 'Confirmar uso em cirurgia',
            input: {
              paciente_id: 'PAC-001',
              medico_crm: '12345-SP',
            },
            expectedResult: 'Uso registrado com rastreabilidade completa',
            validationRules: ['paciente_valido', 'medico_valido', 'rastreabilidade_completa'],
          },
        ],
        expectedOutcome: 'Rastreabilidade completa do lote desde entrada até uso, conforme RDC 59/2008',
      },
      'RDC-751': {
        name: 'Validação de Registro de Dispositivo Médico',
        module: 'gestao-cadastros',
        regulation: 'RDC 751/2022',
        description: 'Simula a validação de registro ANVISA para um novo dispositivo médico.',
        steps: [
          {
            order: 1,
            action: 'Cadastrar produto',
            input: {
              nome: 'Stent Coronário',
              fabricante: 'Abbott',
              classe_risco: 'IV',
            },
            expectedResult: 'Produto cadastrado',
            validationRules: ['dados_obrigatorios', 'classe_risco_valida'],
          },
          {
            order: 2,
            action: 'Inserir registro ANVISA',
            input: {
              codigo_anvisa: '80000000002',
              data_validade: '2026-06-30',
            },
            expectedResult: 'Registro ANVISA associado',
            validationRules: ['formato_anvisa_valido', 'registro_nao_vencido'],
          },
          {
            order: 3,
            action: 'Validar com API ANVISA',
            input: {},
            expectedResult: 'Registro confirmado na base ANVISA',
            validationRules: ['api_anvisa_ok', 'dados_conferem'],
          },
        ],
        expectedOutcome: 'Produto com registro ANVISA válido e verificado',
      },
      'IN-188': {
        name: 'Importação de Produto Médico',
        module: 'compras-internacionais',
        regulation: 'IN 188/2022',
        description: 'Simula o processo de importação de produto médico com documentação completa.',
        steps: [
          {
            order: 1,
            action: 'Registrar pedido de importação',
            input: {
              produto: 'Marca-passo Cardíaco',
              origem: 'EUA',
              quantidade: 5,
            },
            expectedResult: 'Pedido registrado',
            validationRules: ['produto_autorizado', 'origem_valida'],
          },
          {
            order: 2,
            action: 'Anexar documentação',
            input: {
              documentos: ['invoice', 'packing_list', 'certificado_origem', 'laudo_tecnico'],
            },
            expectedResult: 'Documentação completa',
            validationRules: ['docs_obrigatorios', 'formato_valido'],
          },
          {
            order: 3,
            action: 'Submeter à ANVISA',
            input: {},
            expectedResult: 'LI emitida',
            validationRules: ['anvisa_aprovado', 'li_valida'],
          },
        ],
        expectedOutcome: 'Produto importado com toda documentação conforme IN 188/2022',
      },
    }

    const baseScenario = scenarios[regulation] || scenarios['RDC-59']

    return {
      id: crypto.randomUUID(),
      name: baseScenario.name || 'Cenário de Treinamento',
      module,
      regulation,
      description: baseScenario.description || 'Cenário de treinamento regulatório',
      steps: baseScenario.steps || [],
      expectedOutcome: baseScenario.expectedOutcome || 'Conclusão bem-sucedida',
      difficulty,
    }
  }

  /**
   * Avalia resposta de outro agente ou usuário
   */
  private async evaluateResponse(args: Record<string, unknown>): Promise<EvaluationResult> {
    const response = args.response as string
    const expectedAnswer = args.expectedAnswer as string
    const criteria = args.criteria as string[] || ['accuracy', 'completeness', 'compliance']

    // Avaliação simplificada
    let score = 0
    const details: Record<string, number> = {}

    // Verificar precisão (palavras-chave em comum)
    if (criteria.includes('accuracy')) {
      const expectedWords = expectedAnswer.toLowerCase().split(/\s+/)
      const responseWords = response.toLowerCase().split(/\s+/)
      const overlap = expectedWords.filter(w => responseWords.includes(w)).length
      details.accuracy = Math.min(1, overlap / expectedWords.length)
      score += details.accuracy
    }

    // Verificar completude (tamanho relativo)
    if (criteria.includes('completeness')) {
      details.completeness = Math.min(1, response.length / expectedAnswer.length)
      score += details.completeness
    }

    // Verificar compliance (menção a regulamentações)
    if (criteria.includes('compliance')) {
      const regulationKeywords = ['RDC', 'ANVISA', 'IN', 'ISO', 'LGPD', 'CFM']
      const hasRegulation = regulationKeywords.some(k => response.toUpperCase().includes(k))
      details.compliance = hasRegulation ? 1 : 0.5
      score += details.compliance
    }

    score = score / criteria.length

    return {
      score,
      correct: score >= 0.7,
      feedback: score >= 0.7 
        ? 'Resposta adequada. Cobre os pontos principais.'
        : 'Resposta precisa de melhorias. Verifique os critérios não atendidos.',
      details,
    }
  }

  /**
   * Cria dataset sintético para fine-tuning
   */
  private async createDataset(args: Record<string, unknown>): Promise<{
    datasetId: string
    entries: number
    module: string
  }> {
    const module = args.module as string || 'estoque-ia'
    const category = args.category as string || 'rastreabilidade'
    const count = Math.min(args.count as number || 10, 50)

    const entries: DatasetEntry[] = []

    // Gerar entradas sintéticas baseadas no módulo
    const templates = this.getDatasetTemplates(module, category)

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length]
      entries.push({
        id: crypto.randomUUID(),
        input: this.generateVariation(template.input),
        output: this.generateVariation(template.output),
        module,
        category,
        metadata: {
          generated_at: new Date().toISOString(),
          variation: i,
        },
      })
    }

    // Salvar no Supabase
    const datasetId = crypto.randomUUID()
    try {
      await supabase.from('training_datasets').insert({
        id: datasetId,
        module,
        category,
        entries,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error saving dataset:', error)
    }

    return {
      datasetId,
      entries: entries.length,
      module,
    }
  }

  /**
   * Busca regulamentações relevantes
   */
  private async searchRegulations(args: Record<string, unknown>): Promise<{
    regulations: Array<{
      code: string
      name: string
      summary: string
      relevance: number
    }>
  }> {
    const query = args.query as string || ''
    const module = args.module as string

    // Base de conhecimento de regulamentações
    const regulations = [
      {
        code: 'RDC 59/2008',
        name: 'Boas Práticas de Distribuição e Armazenagem',
        summary: 'Estabelece requisitos de rastreabilidade para produtos para saúde.',
        keywords: ['rastreabilidade', 'lote', 'estoque', 'armazenagem', 'distribuição'],
        modules: ['estoque-ia', 'logistica-avancada'],
      },
      {
        code: 'RDC 751/2022',
        name: 'Registro de Dispositivos Médicos',
        summary: 'Dispõe sobre a regularização de dispositivos médicos junto à ANVISA.',
        keywords: ['registro', 'anvisa', 'dispositivo', 'cadastro', 'classe de risco'],
        modules: ['gestao-cadastros', 'produtos-opme'],
      },
      {
        code: 'RDC 16/2013',
        name: 'Boas Práticas de Fabricação',
        summary: 'Estabelece requisitos de BPF para fabricantes de dispositivos médicos.',
        keywords: ['fabricação', 'qualidade', 'bpf', 'fabricante'],
        modules: ['qualidade-certificacao'],
      },
      {
        code: 'IN 188/2022',
        name: 'Importação de Produtos Médicos',
        summary: 'Procedimentos para importação de dispositivos médicos.',
        keywords: ['importação', 'internacional', 'li', 'aduana'],
        modules: ['compras-internacionais', 'viabilidade-importacao'],
      },
      {
        code: 'LGPD',
        name: 'Lei Geral de Proteção de Dados',
        summary: 'Proteção de dados pessoais de pacientes e profissionais.',
        keywords: ['dados', 'privacidade', 'paciente', 'consentimento', 'lgpd'],
        modules: ['gestao-cadastros', 'compliance-auditoria'],
      },
      {
        code: 'ISO 13485',
        name: 'Sistemas de Gestão da Qualidade para Dispositivos Médicos',
        summary: 'Requisitos de SGQ específicos para indústria de dispositivos médicos.',
        keywords: ['qualidade', 'iso', 'sgq', 'certificação'],
        modules: ['qualidade-certificacao', 'compliance-auditoria'],
      },
    ]

    // Filtrar e rankear por relevância
    const results = regulations
      .map(reg => {
        let relevance = 0

        // Verificar match com query
        const queryLower = query.toLowerCase()
        if (reg.keywords.some(k => queryLower.includes(k))) {
          relevance += 0.5
        }
        if (reg.name.toLowerCase().includes(queryLower)) {
          relevance += 0.3
        }
        if (reg.code.toLowerCase().includes(queryLower)) {
          relevance += 0.4
        }

        // Verificar match com módulo
        if (module && reg.modules.includes(module)) {
          relevance += 0.3
        }

        return {
          code: reg.code,
          name: reg.name,
          summary: reg.summary,
          relevance: Math.min(1, relevance),
        }
      })
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)

    return { regulations: results }
  }

  // ============ HELPERS ============

  private getDatasetTemplates(module: string, category: string): Array<{
    input: string
    output: string
  }> {
    const templates: Record<string, Record<string, Array<{ input: string; output: string }>>> = {
      'estoque-ia': {
        rastreabilidade: [
          {
            input: 'Como rastrear um lote de produto OPME desde a entrada até o uso?',
            output: 'Para rastrear um lote OPME conforme RDC 59/2008: 1) Registre a entrada com número de lote, validade e fornecedor; 2) Vincule ao registro ANVISA; 3) Registre todas as movimentações; 4) Ao usar em cirurgia, vincule ao paciente e médico responsável.',
          },
          {
            input: 'Qual a validade mínima para aceitar um lote de implante?',
            output: 'Recomenda-se aceitar lotes com validade mínima de 12 meses para implantes, conforme boas práticas. Produtos com menos de 6 meses devem ter aprovação especial.',
          },
          {
            input: 'Como identificar lotes próximos ao vencimento?',
            output: 'Configure alertas automáticos para lotes com vencimento em 90 dias. Priorize uso pelo método FEFO (First Expired, First Out). Gere relatório semanal de produtos críticos.',
          },
        ],
        movimentacao: [
          {
            input: 'Como registrar uma entrada de estoque?',
            output: 'Acesse Estoque IA > Nova Movimentação > Tipo: Entrada. Informe: produto, quantidade, lote, validade, fornecedor e nota fiscal. Confira dados e confirme.',
          },
          {
            input: 'Como fazer transferência entre filiais?',
            output: 'Acesse Estoque IA > Transferência. Selecione origem e destino. Escolha produtos e quantidades. Gere romaneio de transferência. Confirme recebimento na filial destino.',
          },
        ],
      },
      'cirurgias-procedimentos': {
        agendamento: [
          {
            input: 'Como agendar uma cirurgia no sistema?',
            output: 'Acesse Cirurgias > Agendar. Informe: paciente, médico (CRM válido), hospital, data/hora, procedimento. Selecione materiais OPME necessários. Verifique disponibilidade e confirme.',
          },
          {
            input: 'Como verificar materiais disponíveis para cirurgia?',
            output: 'No agendamento, o sistema verifica automaticamente o estoque. Produtos indisponíveis são destacados em vermelho. Use "Solicitar Consignação" para itens faltantes.',
          },
        ],
      },
      'financeiro-avancado': {
        faturamento: [
          {
            input: 'Como gerar NF-e de materiais usados em cirurgia?',
            output: 'Acesse Financeiro > Faturamento. Selecione a cirurgia realizada. Verifique itens utilizados. Confira dados do convênio/paciente. Gere NF-e e transmita para SEFAZ.',
          },
          {
            input: 'Como tratar glosas de convênio?',
            output: 'Acesse Financeiro > Glosas. Filtre por convênio/período. Analise motivo da glosa. Prepare recurso com documentação. Submeta via portal do convênio. Acompanhe status.',
          },
        ],
      },
    }

    return templates[module]?.[category] || templates['estoque-ia']['rastreabilidade']
  }

  private generateVariation(text: string): string {
    // Adiciona pequenas variações ao texto
    const variations = [
      (t: string) => t,
      (t: string) => t.replace(/\?$/, ''),
      (t: string) => `Por favor, ${t.toLowerCase()}`,
      (t: string) => t.replace(/Como/g, 'De que forma'),
    ]

    const variation = variations[Math.floor(Math.random() * variations.length)]
    return variation(text)
  }
}

export default TrainingTutorAgent

