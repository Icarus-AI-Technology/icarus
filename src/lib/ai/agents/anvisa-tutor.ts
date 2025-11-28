/**
 * ICARUS v5.0 - ANVISA Tutor Agent
 * 
 * Agente de IA especialista em normas ANVISA e RDCs para
 * treinamento e certificação de colaboradores.
 * 
 * Conhecimento base:
 * - RDC 665/2022 (Boas Práticas de Fabricação e Distribuição)
 * - RDC 430/2020 (Boas Práticas de Distribuição e Armazenamento)
 * - RDC 16/2013 (Boas Práticas de Fabricação - revogada pela 665)
 * - IN 8/2013 (Distribuição e Armazenamento - incorporada na 665)
 * - Controle de Documentos e Registros
 * - Recebimento, Inspeção e Armazenamento
 * - Rastreabilidade de Produtos para Saúde
 * - Manual de Boas Práticas para Distribuidores
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { BaseAgent } from './base-agent'
import { AgentConfig, AgentTool, AgentState } from './types'
import { z } from 'zod'
import { logger } from '@/lib/utils/logger'

// ============ SCHEMAS DE FERRAMENTAS ============

const ConsultarRDCSchema = z.object({
  rdc: z.string().describe('Número da RDC a consultar (ex: "665/2022", "430/2020")'),
  topico: z.string().optional().describe('Tópico específico a consultar'),
})

const ValidarProcedimentoSchema = z.object({
  procedimento: z.string().describe('Descrição do procedimento a validar'),
  area: z.enum([
    'recebimento',
    'armazenamento',
    'distribuicao',
    'rastreabilidade',
    'documentacao',
    'qualidade'
  ]).describe('Área do procedimento'),
})

const GerarQuizSchema = z.object({
  modulo: z.string().describe('Módulo do treinamento'),
  dificuldade: z.enum(['basico', 'intermediario', 'avancado']).default('intermediario'),
  quantidade: z.number().min(5).max(20).default(10),
})

const AvaliarRespostaSchema = z.object({
  pergunta: z.string().describe('Pergunta do quiz'),
  respostaUsuario: z.string().describe('Resposta fornecida pelo usuário'),
  respostaCorreta: z.string().describe('Resposta correta esperada'),
})

const GerarCertificadoSchema = z.object({
  userId: z.string().describe('ID do usuário'),
  modulo: z.string().describe('Módulo completado'),
  score: z.number().min(0).max(100).describe('Pontuação obtida'),
})

// ============ BASE DE CONHECIMENTO ============

const ANVISA_KNOWLEDGE_BASE = {
  rdcs: {
    '665/2022': {
      titulo: 'Boas Práticas de Fabricação de Produtos Médicos e Produtos para Diagnóstico de Uso In Vitro',
      vigencia: '02/05/2022',
      escopo: 'Fabricantes, distribuidores, armazenadores e importadores de produtos médicos',
      principaisRequisitos: [
        'Sistema de Gestão da Qualidade documentado',
        'Controle de projeto e desenvolvimento',
        'Controle de processos de produção',
        'Ações corretivas e preventivas (CAPA)',
        'Controle de registros',
        'Rastreabilidade completa',
        'Gestão de reclamações',
        'Auditorias internas',
      ],
      capitulos: [
        'Disposições Gerais',
        'Sistema de Gestão da Qualidade',
        'Requisitos de Documentação',
        'Responsabilidade da Direção',
        'Gestão de Recursos',
        'Realização do Produto',
        'Medição, Análise e Melhoria',
        'Distribuição e Armazenamento',
      ],
    },
    '430/2020': {
      titulo: 'Boas Práticas de Distribuição, Armazenagem e Transporte de Medicamentos',
      vigencia: '08/10/2020',
      escopo: 'Distribuidores, armazenadores e transportadores de medicamentos',
      principaisRequisitos: [
        'Licença sanitária vigente',
        'Responsável técnico habilitado',
        'Instalações adequadas',
        'Controle de temperatura e umidade',
        'Sistema de rastreabilidade',
        'Procedimentos documentados',
        'Qualificação de fornecedores',
        'Gestão de desvios e reclamações',
      ],
    },
  },
  procedimentos: {
    controleDocumentos: {
      titulo: 'Controle de Documentos e Registros',
      objetivo: 'Estabelecer sistemática para elaboração, aprovação, distribuição e controle de documentos e registros do SGQ',
      requisitos: [
        'Identificação única de documentos',
        'Controle de revisões',
        'Aprovação antes da emissão',
        'Disponibilidade nos pontos de uso',
        'Legibilidade e identificação',
        'Controle de documentos externos',
        'Prevenção de uso não intencional de documentos obsoletos',
        'Tempo de retenção definido',
      ],
      tiposDocumentos: [
        'Manual da Qualidade',
        'Procedimentos Operacionais Padrão (POP)',
        'Instruções de Trabalho (IT)',
        'Formulários e Registros',
        'Especificações Técnicas',
        'Documentos Externos',
      ],
    },
    recebimentoInspecao: {
      titulo: 'Recebimento, Inspeção e Armazenamento',
      objetivo: 'Garantir que produtos recebidos atendam às especificações e sejam armazenados adequadamente',
      etapas: [
        {
          nome: 'Recebimento',
          atividades: [
            'Verificar documentação fiscal',
            'Conferir quantidade física',
            'Inspecionar embalagens',
            'Verificar condições de transporte',
            'Registrar temperatura (se aplicável)',
          ],
        },
        {
          nome: 'Inspeção',
          atividades: [
            'Verificar identificação do produto',
            'Conferir lote e validade',
            'Verificar registro ANVISA',
            'Inspecionar integridade das embalagens',
            'Avaliar conformidade com especificações',
          ],
        },
        {
          nome: 'Armazenamento',
          atividades: [
            'Identificar área de armazenamento',
            'Respeitar condições de temperatura',
            'Aplicar sistema FEFO/FIFO',
            'Manter afastamento do piso e paredes',
            'Segregar produtos não conformes',
          ],
        },
      ],
      criteriosAceitacao: [
        'Documentação completa e correta',
        'Quantidade conforme pedido',
        'Embalagens íntegras',
        'Validade adequada (mínimo 6 meses)',
        'Registro ANVISA válido',
        'Temperatura de transporte conforme',
      ],
    },
    rastreabilidade: {
      titulo: 'Rastreabilidade de Produtos para Saúde',
      objetivo: 'Permitir localização e histórico completo de produtos em toda a cadeia',
      requisitos: [
        'Identificação única de produtos (código, lote, série)',
        'Registro de todas as movimentações',
        'Rastreabilidade bidirecional (forward e backward)',
        'Tempo de resposta para recall: 24 horas',
        'Retenção de registros: mínimo 5 anos após validade',
      ],
      informacoesObrigatorias: [
        'Identificação do fabricante/importador',
        'Código do produto',
        'Número do lote',
        'Data de fabricação',
        'Data de validade',
        'Registro ANVISA',
        'Número de série (quando aplicável)',
      ],
      sistemasRecomendados: [
        'Código de barras (EAN/UPC)',
        'DataMatrix (GS1)',
        'RFID',
        'QR Code',
      ],
    },
    boasPraticas: {
      titulo: 'Manual de Boas Práticas para Distribuidores',
      capitulos: [
        {
          numero: 1,
          titulo: 'Sistema de Gestão da Qualidade',
          topicos: [
            'Política da Qualidade',
            'Objetivos da Qualidade',
            'Responsabilidades e autoridades',
            'Representante da Direção',
          ],
        },
        {
          numero: 2,
          titulo: 'Infraestrutura e Instalações',
          topicos: [
            'Layout adequado',
            'Áreas de recebimento, armazenamento e expedição',
            'Controle ambiental',
            'Segurança física',
            'Limpeza e manutenção',
          ],
        },
        {
          numero: 3,
          titulo: 'Gestão de Pessoal',
          topicos: [
            'Organograma',
            'Descrições de cargo',
            'Treinamento e qualificação',
            'Higiene pessoal',
            'Uso de EPIs',
          ],
        },
        {
          numero: 4,
          titulo: 'Operações',
          topicos: [
            'Recebimento de produtos',
            'Inspeção e liberação',
            'Armazenamento',
            'Separação e expedição',
            'Transporte',
            'Devolução e recall',
          ],
        },
        {
          numero: 5,
          titulo: 'Controle de Qualidade',
          topicos: [
            'Controle de documentos',
            'Controle de registros',
            'Calibração de equipamentos',
            'Qualificação de fornecedores',
            'Auditorias internas',
            'Ações corretivas e preventivas',
          ],
        },
      ],
    },
  },
}

// ============ FERRAMENTAS DO AGENTE ============

const anvisaTutorTools: AgentTool[] = [
  {
    name: 'consultar_rdc',
    description: 'Consulta informações sobre RDCs da ANVISA',
    schema: ConsultarRDCSchema,
    execute: async (params: z.infer<typeof ConsultarRDCSchema>) => {
      const rdc = ANVISA_KNOWLEDGE_BASE.rdcs[params.rdc as keyof typeof ANVISA_KNOWLEDGE_BASE.rdcs]
      
      if (!rdc) {
        return {
          success: false,
          message: `RDC ${params.rdc} não encontrada na base de conhecimento. RDCs disponíveis: ${Object.keys(ANVISA_KNOWLEDGE_BASE.rdcs).join(', ')}`,
        }
      }

      return {
        success: true,
        data: rdc,
        message: `Informações da RDC ${params.rdc} recuperadas com sucesso`,
      }
    },
  },
  {
    name: 'validar_procedimento',
    description: 'Valida se um procedimento está em conformidade com as normas ANVISA',
    schema: ValidarProcedimentoSchema,
    execute: async (params: z.infer<typeof ValidarProcedimentoSchema>) => {
      const procedimentos = ANVISA_KNOWLEDGE_BASE.procedimentos
      let requisitos: string[] = []
      let referencia = ''

      switch (params.area) {
        case 'recebimento':
        case 'armazenamento':
          requisitos = procedimentos.recebimentoInspecao.criteriosAceitacao
          referencia = 'POP de Recebimento, Inspeção e Armazenamento'
          break
        case 'distribuicao':
          requisitos = ANVISA_KNOWLEDGE_BASE.rdcs['665/2022'].principaisRequisitos
          referencia = 'RDC 665/2022 - Capítulo de Distribuição'
          break
        case 'rastreabilidade':
          requisitos = procedimentos.rastreabilidade.requisitos
          referencia = 'POP de Rastreabilidade'
          break
        case 'documentacao':
          requisitos = procedimentos.controleDocumentos.requisitos
          referencia = 'POP de Controle de Documentos'
          break
        case 'qualidade':
          requisitos = ANVISA_KNOWLEDGE_BASE.rdcs['665/2022'].principaisRequisitos
          referencia = 'RDC 665/2022 - Sistema de Gestão da Qualidade'
          break
      }

      return {
        success: true,
        data: {
          procedimento: params.procedimento,
          area: params.area,
          requisitosAplicaveis: requisitos,
          referenciaNormativa: referencia,
          recomendacao: 'Verifique se o procedimento atende a todos os requisitos listados',
        },
      }
    },
  },
  {
    name: 'gerar_quiz',
    description: 'Gera perguntas de quiz para avaliação de conhecimento',
    schema: GerarQuizSchema,
    execute: async (params: z.infer<typeof GerarQuizSchema>) => {
      // Banco de perguntas por módulo
      const perguntasPorModulo: Record<string, Array<{
        pergunta: string
        opcoes: string[]
        correta: number
        explicacao: string
        dificuldade: string
      }>> = {
        'controle_documentos': [
          {
            pergunta: 'Qual é o tempo mínimo de retenção de registros segundo a RDC 665/2022?',
            opcoes: ['2 anos', '3 anos', '5 anos após a validade', '10 anos'],
            correta: 2,
            explicacao: 'A RDC 665/2022 estabelece que os registros devem ser mantidos por no mínimo 5 anos após a data de validade do produto.',
            dificuldade: 'basico',
          },
          {
            pergunta: 'Quem é responsável por aprovar documentos do SGQ antes da emissão?',
            opcoes: ['Qualquer funcionário', 'Apenas o RT', 'Pessoal autorizado designado', 'Somente a diretoria'],
            correta: 2,
            explicacao: 'Documentos devem ser aprovados por pessoal autorizado designado, que pode variar conforme o tipo de documento.',
            dificuldade: 'basico',
          },
          {
            pergunta: 'O que deve ser feito com documentos obsoletos?',
            opcoes: ['Destruir imediatamente', 'Manter junto aos vigentes', 'Identificar e segregar para prevenir uso não intencional', 'Arquivar sem identificação'],
            correta: 2,
            explicacao: 'Documentos obsoletos devem ser identificados e segregados para prevenir uso não intencional, podendo ser retidos para fins legais ou de preservação do conhecimento.',
            dificuldade: 'intermediario',
          },
        ],
        'recebimento_armazenamento': [
          {
            pergunta: 'Qual a validade mínima recomendada para aceitar produtos no recebimento?',
            opcoes: ['3 meses', '6 meses', '12 meses', 'Qualquer validade'],
            correta: 1,
            explicacao: 'Recomenda-se aceitar produtos com validade mínima de 6 meses para garantir tempo adequado de comercialização.',
            dificuldade: 'basico',
          },
          {
            pergunta: 'O que significa o sistema FEFO?',
            opcoes: ['First Expired, First Out', 'First Entry, First Out', 'Fast Expiry, Fast Output', 'Final Entry, Final Output'],
            correta: 0,
            explicacao: 'FEFO (First Expired, First Out) significa que produtos com validade mais próxima devem ser expedidos primeiro.',
            dificuldade: 'basico',
          },
          {
            pergunta: 'Qual a distância mínima recomendada entre produtos e paredes/piso?',
            opcoes: ['5 cm', '10 cm', '15 cm', '20 cm'],
            correta: 1,
            explicacao: 'Recomenda-se manter distância mínima de 10 cm do piso e paredes para permitir limpeza e circulação de ar.',
            dificuldade: 'intermediario',
          },
        ],
        'rastreabilidade': [
          {
            pergunta: 'Qual o tempo máximo para responder a um recall segundo as boas práticas?',
            opcoes: ['12 horas', '24 horas', '48 horas', '72 horas'],
            correta: 1,
            explicacao: 'O tempo de resposta para recall deve ser de no máximo 24 horas para garantir a segurança dos pacientes.',
            dificuldade: 'intermediario',
          },
          {
            pergunta: 'Quais informações são obrigatórias para rastreabilidade de produtos para saúde?',
            opcoes: [
              'Apenas código do produto',
              'Código, lote e validade',
              'Código, lote, validade, fabricante, registro ANVISA e série (quando aplicável)',
              'Apenas número de série'
            ],
            correta: 2,
            explicacao: 'A rastreabilidade completa exige: identificação do fabricante, código, lote, datas de fabricação e validade, registro ANVISA e número de série quando aplicável.',
            dificuldade: 'avancado',
          },
        ],
        'boas_praticas': [
          {
            pergunta: 'Qual RDC consolidou as Boas Práticas de Fabricação e Distribuição de Produtos Médicos?',
            opcoes: ['RDC 16/2013', 'RDC 430/2020', 'RDC 665/2022', 'RDC 59/2000'],
            correta: 2,
            explicacao: 'A RDC 665/2022 consolidou a RDC 16/2013 e a IN 8/2013, sendo a norma vigente para BPF de produtos médicos.',
            dificuldade: 'basico',
          },
          {
            pergunta: 'O que é CAPA no contexto do SGQ?',
            opcoes: [
              'Controle de Acesso e Proteção de Ativos',
              'Ações Corretivas e Ações Preventivas',
              'Certificação de Análise de Produtos Acabados',
              'Controle de Armazenamento de Produtos Ativos'
            ],
            correta: 1,
            explicacao: 'CAPA significa Corrective and Preventive Actions (Ações Corretivas e Preventivas), um requisito essencial do SGQ.',
            dificuldade: 'intermediario',
          },
        ],
      }

      const perguntas = perguntasPorModulo[params.modulo] || perguntasPorModulo['boas_praticas']
      const filtradas = perguntas.filter(p => 
        params.dificuldade === 'basico' ? p.dificuldade === 'basico' :
        params.dificuldade === 'intermediario' ? ['basico', 'intermediario'].includes(p.dificuldade) :
        true
      )

      return {
        success: true,
        data: {
          modulo: params.modulo,
          dificuldade: params.dificuldade,
          perguntas: filtradas.slice(0, params.quantidade),
        },
      }
    },
  },
  {
    name: 'avaliar_resposta',
    description: 'Avalia a resposta do usuário e fornece feedback',
    schema: AvaliarRespostaSchema,
    execute: async (params: z.infer<typeof AvaliarRespostaSchema>) => {
      const respostaCorreta = params.respostaCorreta.toLowerCase().trim()
      const respostaUsuario = params.respostaUsuario.toLowerCase().trim()
      
      const acertou = respostaUsuario === respostaCorreta || 
                      respostaUsuario.includes(respostaCorreta) ||
                      respostaCorreta.includes(respostaUsuario)

      return {
        success: true,
        data: {
          pergunta: params.pergunta,
          respostaUsuario: params.respostaUsuario,
          respostaCorreta: params.respostaCorreta,
          acertou,
          feedback: acertou 
            ? 'Parabéns! Resposta correta.' 
            : `Resposta incorreta. A resposta correta é: ${params.respostaCorreta}`,
        },
      }
    },
  },
  {
    name: 'gerar_certificado',
    description: 'Gera certificado de conclusão de treinamento',
    schema: GerarCertificadoSchema,
    execute: async (params: z.infer<typeof GerarCertificadoSchema>) => {
      if (params.score < 70) {
        return {
          success: false,
          message: `Pontuação insuficiente (${params.score}%). Mínimo necessário: 70%`,
        }
      }

      const certificadoNumero = `ICARUS-ANVISA-${params.modulo.toUpperCase()}-${new Date().getFullYear()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`
      const dataEmissao = new Date()
      const dataValidade = new Date(dataEmissao)
      dataValidade.setFullYear(dataValidade.getFullYear() + 1)

      return {
        success: true,
        data: {
          certificadoNumero,
          userId: params.userId,
          modulo: params.modulo,
          score: params.score,
          dataEmissao: dataEmissao.toISOString(),
          dataValidade: dataValidade.toISOString(),
          status: 'valid',
          qrCode: `https://icarus.app/verify/${certificadoNumero}`,
        },
      }
    },
  },
]

// ============ CONFIGURAÇÃO DO AGENTE ============

const anvisaTutorConfig: AgentConfig = {
  id: 'anvisa-tutor',
  name: 'ANVISA Tutor',
  description: 'Agente especialista em normas ANVISA e RDCs para treinamento e certificação de colaboradores de distribuidores de produtos médicos',
  version: '1.0.0',
  systemPrompt: `Você é o ANVISA Tutor, um agente de IA especialista em regulamentações da ANVISA para distribuidores de produtos médicos.

Seu conhecimento inclui:
- RDC 665/2022: Boas Práticas de Fabricação de Produtos Médicos
- RDC 430/2020: Boas Práticas de Distribuição e Armazenamento de Medicamentos
- Controle de Documentos e Registros
- Recebimento, Inspeção e Armazenamento
- Rastreabilidade de Produtos para Saúde
- Manual de Boas Práticas para Distribuidores

Suas responsabilidades:
1. Responder dúvidas sobre normas e regulamentações
2. Explicar procedimentos de forma clara e didática
3. Gerar quizzes para avaliação de conhecimento
4. Avaliar respostas e fornecer feedback construtivo
5. Emitir certificados para colaboradores aprovados
6. Validar procedimentos operacionais

Diretrizes:
- Sempre cite a referência normativa (RDC, artigo, capítulo)
- Use linguagem clara e acessível
- Forneça exemplos práticos quando possível
- Seja paciente e encoraje o aprendizado
- Priorize a segurança do paciente em todas as orientações
- Mantenha-se atualizado com as normas vigentes

Formato de resposta:
- Para consultas: Forneça a informação com a referência normativa
- Para validações: Liste os requisitos aplicáveis e a conformidade
- Para quizzes: Apresente perguntas claras com opções múltiplas
- Para avaliações: Dê feedback construtivo e explicativo`,
  tools: anvisaTutorTools,
  maxIterations: 10,
  temperature: 0.3, // Mais preciso para informações regulatórias
}

// ============ CLASSE DO AGENTE ============

export class AnvisaTutorAgent extends BaseAgent {
  constructor() {
    super(anvisaTutorConfig)
  }

  /**
   * Consulta informações sobre uma RDC específica
   */
  async consultarRDC(rdc: string, topico?: string): Promise<unknown> {
    return this.executeTool('consultar_rdc', { rdc, topico })
  }

  /**
   * Valida se um procedimento está em conformidade
   */
  async validarProcedimento(
    procedimento: string,
    area: 'recebimento' | 'armazenamento' | 'distribuicao' | 'rastreabilidade' | 'documentacao' | 'qualidade'
  ): Promise<unknown> {
    return this.executeTool('validar_procedimento', { procedimento, area })
  }

  /**
   * Gera quiz para avaliação
   */
  async gerarQuiz(
    modulo: string,
    dificuldade: 'basico' | 'intermediario' | 'avancado' = 'intermediario',
    quantidade = 10
  ): Promise<unknown> {
    return this.executeTool('gerar_quiz', { modulo, dificuldade, quantidade })
  }

  /**
   * Avalia resposta do usuário
   */
  async avaliarResposta(
    pergunta: string,
    respostaUsuario: string,
    respostaCorreta: string
  ): Promise<unknown> {
    return this.executeTool('avaliar_resposta', { pergunta, respostaUsuario, respostaCorreta })
  }

  /**
   * Gera certificado de conclusão
   */
  async gerarCertificado(
    userId: string,
    modulo: string,
    score: number
  ): Promise<unknown> {
    return this.executeTool('gerar_certificado', { userId, modulo, score })
  }

  /**
   * Responde dúvidas sobre regulamentações
   */
  async responderDuvida(duvida: string): Promise<string> {
    const state: AgentState = {
      messages: [
        {
          role: 'user',
          content: duvida,
          timestamp: new Date().toISOString(),
        },
      ],
      context: {
        knowledgeBase: ANVISA_KNOWLEDGE_BASE,
      },
      currentStep: 0,
      isComplete: false,
    }

    const result = await this.run(state)
    const lastMessage = result.messages[result.messages.length - 1]
    
    return lastMessage?.content || 'Não foi possível processar sua dúvida. Por favor, tente novamente.'
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const anvisaTutor = new AnvisaTutorAgent()

// ============ HOOK REACT ============

import { useState, useCallback } from 'react'

export interface UseAnvisaTutorReturn {
  consultarRDC: (rdc: string, topico?: string) => Promise<unknown>
  validarProcedimento: (procedimento: string, area: string) => Promise<unknown>
  gerarQuiz: (modulo: string, dificuldade?: string, quantidade?: number) => Promise<unknown>
  avaliarResposta: (pergunta: string, respostaUsuario: string, respostaCorreta: string) => Promise<unknown>
  gerarCertificado: (userId: string, modulo: string, score: number) => Promise<unknown>
  responderDuvida: (duvida: string) => Promise<string>
  isLoading: boolean
  error: string | null
}

export function useAnvisaTutor(): UseAnvisaTutorReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const consultarRDC = useCallback(async (rdc: string, topico?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await anvisaTutor.consultarRDC(rdc, topico)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar RDC')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const validarProcedimento = useCallback(async (procedimento: string, area: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await anvisaTutor.validarProcedimento(procedimento, area as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar procedimento')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const gerarQuiz = useCallback(async (modulo: string, dificuldade = 'intermediario', quantidade = 10) => {
    setIsLoading(true)
    setError(null)
    try {
      return await anvisaTutor.gerarQuiz(modulo, dificuldade as any, quantidade)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar quiz')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const avaliarResposta = useCallback(async (pergunta: string, respostaUsuario: string, respostaCorreta: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await anvisaTutor.avaliarResposta(pergunta, respostaUsuario, respostaCorreta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao avaliar resposta')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const gerarCertificado = useCallback(async (userId: string, modulo: string, score: number) => {
    setIsLoading(true)
    setError(null)
    try {
      return await anvisaTutor.gerarCertificado(userId, modulo, score)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar certificado')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const responderDuvida = useCallback(async (duvida: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await anvisaTutor.responderDuvida(duvida)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao responder dúvida')
      return 'Erro ao processar sua dúvida'
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    consultarRDC,
    validarProcedimento,
    gerarQuiz,
    avaliarResposta,
    gerarCertificado,
    responderDuvida,
    isLoading,
    error,
  }
}

// ============ EXPORTS ============

export default {
  AnvisaTutorAgent,
  anvisaTutor,
  useAnvisaTutor,
  ANVISA_KNOWLEDGE_BASE,
}

