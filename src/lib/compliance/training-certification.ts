/**
 * ICARUS v5.0 - Compliance Training & Certification System
 * 
 * Sistema de treinamento e certificação em código de ética e compliance.
 * Inclui módulos interativos, testes e emissão de certificados.
 * 
 * Baseado em diretrizes de compliance para terceiros do setor de saúde.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'
import { supabase } from '@/lib/config/supabase-client'
import { audit } from '@/lib/blockchain/audit-trail'

// ============ TIPOS ============

export interface TrainingModule {
  id: string
  title: string
  description: string
  category: TrainingCategory
  duration: number // minutos
  content: TrainingContent[]
  quiz: QuizQuestion[]
  passingScore: number // porcentagem
  order: number
  isRequired: boolean
  validityMonths: number
}

export type TrainingCategory =
  | 'codigo_etica'
  | 'anticorrupcao'
  | 'conflito_interesses'
  | 'interacao_profissionais'
  | 'brindes_hospitalidade'
  | 'registros_documentacao'
  | 'denuncia_violacoes'
  | 'lgpd_privacidade'

export interface TrainingContent {
  id: string
  type: 'text' | 'video' | 'image' | 'interactive' | 'case_study'
  title: string
  content: string
  mediaUrl?: string
  duration?: number
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'single' | 'multiple' | 'true_false' | 'scenario'
  options: QuizOption[]
  explanation: string
  points: number
}

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface UserTrainingProgress {
  id: string
  oduleId: string
  startedAt: string
  completedAt?: string
  contentProgress: Record<string, boolean>
  quizAttempts: QuizAttempt[]
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  score?: number
}

export interface QuizAttempt {
  attemptNumber: number
  timestamp: string
  answers: Record<string, string[]>
  score: number
  passed: boolean
}

export interface Certificate {
  id: string
  oduleId: string
  issuedAt: string
  expiresAt: string
  score: number
  certificateNumber: string
  qrCode: string
  status: 'valid' | 'expired' | 'revoked'
}

// ============ MÓDULOS DE TREINAMENTO ============

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'etica_negocios',
    title: 'Ética nos Negócios e Compliance',
    description: 'Fundamentos de ética empresarial e programa de compliance no setor de saúde',
    category: 'codigo_etica',
    duration: 30,
    order: 1,
    isRequired: true,
    validityMonths: 12,
    passingScore: 80,
    content: [
      {
        id: 'intro_etica',
        type: 'text',
        title: 'Introdução à Ética Empresarial',
        content: `
# Ética nos Negócios

A ética empresarial é o conjunto de princípios e valores que orientam a conduta de uma organização e seus colaboradores em todas as suas atividades.

## Por que a Ética é Importante?

1. **Reputação**: Empresas éticas constroem confiança com clientes, parceiros e sociedade
2. **Sustentabilidade**: Práticas éticas garantem a longevidade do negócio
3. **Conformidade Legal**: Evita sanções, multas e processos judiciais
4. **Ambiente de Trabalho**: Promove um ambiente saudável e produtivo

## Princípios Fundamentais

- **Integridade**: Agir com honestidade em todas as situações
- **Transparência**: Comunicar de forma clara e verdadeira
- **Respeito**: Tratar todos com dignidade e consideração
- **Responsabilidade**: Assumir as consequências de nossas ações
- **Justiça**: Tratar todos de forma equitativa

## No Setor de Saúde

O setor de dispositivos médicos possui regulamentações específicas devido ao impacto direto na vida dos pacientes. É fundamental:

- Priorizar sempre a segurança do paciente
- Manter a integridade científica
- Respeitar a autonomia dos profissionais de saúde
- Garantir acesso justo aos produtos
        `,
      },
      {
        id: 'programa_compliance',
        type: 'text',
        title: 'Programa de Compliance',
        content: `
# Programa de Compliance

O Programa de Compliance é um conjunto de políticas, procedimentos e controles internos destinados a garantir que a empresa e seus colaboradores atuem em conformidade com as leis e regulamentos aplicáveis.

## Pilares do Programa

### 1. Comprometimento da Liderança
A alta direção deve demonstrar compromisso com a ética e compliance através de:
- Comunicação clara dos valores
- Alocação de recursos adequados
- Exemplo pessoal de conduta ética

### 2. Políticas e Procedimentos
Documentos que orientam a conduta esperada:
- Código de Ética e Conduta
- Políticas específicas (anticorrupção, conflito de interesses, etc.)
- Procedimentos operacionais

### 3. Treinamento e Comunicação
Capacitação contínua de todos os colaboradores:
- Treinamentos obrigatórios
- Comunicação regular sobre temas de compliance
- Certificações periódicas

### 4. Canais de Denúncia
Mecanismos para reportar violações:
- Linha ética confidencial
- Proteção contra retaliação
- Investigação imparcial

### 5. Monitoramento e Auditoria
Verificação contínua da efetividade:
- Auditorias internas
- Indicadores de desempenho
- Melhoria contínua

## Responsabilidades

**Todos os colaboradores devem:**
- Conhecer e seguir o Código de Ética
- Participar dos treinamentos obrigatórios
- Reportar violações ou suspeitas
- Buscar orientação em caso de dúvidas
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_etica',
        question: 'Qual dos seguintes NÃO é um princípio fundamental de ética empresarial?',
        type: 'single',
        options: [
          { id: 'a', text: 'Integridade', isCorrect: false },
          { id: 'b', text: 'Transparência', isCorrect: false },
          { id: 'c', text: 'Maximização de lucros a qualquer custo', isCorrect: true },
          { id: 'd', text: 'Responsabilidade', isCorrect: false },
        ],
        explanation: 'A maximização de lucros a qualquer custo não é um princípio ético. A ética empresarial prioriza integridade, transparência, respeito e responsabilidade.',
        points: 10,
      },
      {
        id: 'q2_compliance',
        question: 'Quais são os pilares de um Programa de Compliance? (Selecione todas as corretas)',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Comprometimento da Liderança', isCorrect: true },
          { id: 'b', text: 'Políticas e Procedimentos', isCorrect: true },
          { id: 'c', text: 'Ocultação de informações', isCorrect: false },
          { id: 'd', text: 'Canais de Denúncia', isCorrect: true },
        ],
        explanation: 'Os pilares incluem comprometimento da liderança, políticas e procedimentos, treinamento, canais de denúncia e monitoramento. Ocultação de informações é contrário à ética.',
        points: 15,
      },
    ],
  },
  {
    id: 'anticorrupcao',
    title: 'Anticorrupção e Lei Anticorrupção',
    description: 'Entenda as leis anticorrupção e como evitar práticas proibidas',
    category: 'anticorrupcao',
    duration: 45,
    order: 2,
    isRequired: true,
    validityMonths: 12,
    passingScore: 80,
    content: [
      {
        id: 'lei_anticorrupcao',
        type: 'text',
        title: 'Lei Anticorrupção Brasileira',
        content: `
# Lei Anticorrupção (Lei 12.846/2013)

A Lei Anticorrupção brasileira responsabiliza objetivamente empresas por atos lesivos à administração pública.

## Atos Lesivos Proibidos

### Corrupção Ativa
- Prometer, oferecer ou dar vantagem indevida a agente público
- Financiar, custear ou patrocinar práticas ilícitas

### Fraude em Licitações
- Frustrar ou fraudar o caráter competitivo de licitação
- Criar pessoa jurídica para participar de licitação fraudulenta

### Obstrução de Investigações
- Dificultar atividade de investigação ou fiscalização
- Intervir em atuação de órgãos públicos

## Sanções

### Administrativas
- Multa de 0,1% a 20% do faturamento bruto
- Publicação da decisão condenatória

### Judiciais
- Perdimento de bens
- Suspensão de atividades
- Dissolução compulsória
- Proibição de receber incentivos

## Como se Proteger

1. **Due Diligence**: Verificar parceiros e fornecedores
2. **Controles Internos**: Procedimentos de aprovação e registro
3. **Treinamento**: Capacitar colaboradores
4. **Monitoramento**: Auditorias periódicas
5. **Canal de Denúncias**: Mecanismo efetivo
        `,
      },
      {
        id: 'fcpa_ukba',
        type: 'text',
        title: 'Leis Internacionais',
        content: `
# Leis Anticorrupção Internacionais

## FCPA (Foreign Corrupt Practices Act - EUA)

A lei americana proíbe o pagamento de subornos a funcionários públicos estrangeiros para obter ou manter negócios.

**Aplica-se a:**
- Empresas americanas e suas subsidiárias
- Empresas listadas em bolsas americanas
- Qualquer pessoa que pratique ato de corrupção em território americano

**Penalidades:**
- Multas de até US$ 25 milhões para empresas
- Prisão de até 20 anos para indivíduos

## UK Bribery Act (Reino Unido)

Considerada uma das leis anticorrupção mais rigorosas do mundo.

**Características:**
- Proíbe corrupção ativa e passiva
- Aplica-se a empresas com qualquer conexão com o Reino Unido
- Responsabilidade por falha em prevenir corrupção

## Importância para Distribuidores

Empresas que trabalham com fabricantes internacionais devem:
- Conhecer as leis aplicáveis
- Implementar controles adequados
- Manter registros precisos
- Treinar colaboradores
- Reportar irregularidades
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_anticorrupcao',
        question: 'A Lei Anticorrupção brasileira (12.846/2013) responsabiliza empresas de forma:',
        type: 'single',
        options: [
          { id: 'a', text: 'Subjetiva, dependendo de comprovação de culpa', isCorrect: false },
          { id: 'b', text: 'Objetiva, independente de culpa', isCorrect: true },
          { id: 'c', text: 'Apenas quando há dolo comprovado', isCorrect: false },
          { id: 'd', text: 'Somente em casos de reincidência', isCorrect: false },
        ],
        explanation: 'A Lei 12.846/2013 estabelece responsabilidade objetiva das empresas, ou seja, independente de comprovação de culpa ou dolo.',
        points: 10,
      },
      {
        id: 'q2_fcpa',
        question: 'O FCPA (Foreign Corrupt Practices Act) se aplica a:',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Empresas americanas', isCorrect: true },
          { id: 'b', text: 'Empresas listadas em bolsas americanas', isCorrect: true },
          { id: 'c', text: 'Apenas empresas sediadas nos EUA', isCorrect: false },
          { id: 'd', text: 'Atos praticados em território americano', isCorrect: true },
        ],
        explanation: 'O FCPA tem alcance extraterritorial e se aplica a empresas americanas, empresas listadas em bolsas americanas e atos praticados em território americano.',
        points: 15,
      },
    ],
  },
  {
    id: 'interacao_profissionais',
    title: 'Interação com Profissionais de Saúde',
    description: 'Diretrizes para interações éticas com médicos e profissionais de saúde',
    category: 'interacao_profissionais',
    duration: 40,
    order: 3,
    isRequired: true,
    validityMonths: 12,
    passingScore: 80,
    content: [
      {
        id: 'principios_interacao',
        type: 'text',
        title: 'Princípios de Interação',
        content: `
# Interação com Profissionais de Saúde

## Princípios Fundamentais

### 1. Independência Profissional
O profissional de saúde deve manter total independência em suas decisões clínicas. Nenhuma interação comercial pode influenciar prescrições ou indicações de tratamento.

### 2. Transparência
Todas as interações devem ser transparentes e documentadas. Não deve haver acordos ocultos ou benefícios não declarados.

### 3. Proporcionalidade
Qualquer benefício oferecido deve ser proporcional e relacionado ao propósito legítimo da interação.

### 4. Separação de Papéis
Atividades educacionais devem ser separadas de atividades promocionais.

## Atividades Permitidas

### Educação Médica Continuada
- Patrocínio de eventos científicos
- Suporte a participação em congressos
- Treinamento em produtos e técnicas

### Consultoria Científica
- Contratação para palestras e apresentações
- Participação em advisory boards
- Pesquisa clínica

### Demonstração de Produtos
- Apresentação de características técnicas
- Treinamento de uso
- Suporte técnico em procedimentos

## Limites e Restrições

- Não oferecer benefícios em troca de prescrições
- Não financiar viagens de lazer
- Não fornecer brindes de valor significativo
- Não realizar pagamentos em dinheiro
- Documentar todas as interações
        `,
      },
      {
        id: 'eventos_congressos',
        type: 'text',
        title: 'Eventos e Congressos',
        content: `
# Patrocínio de Eventos e Congressos

## Critérios para Patrocínio

### Eventos Elegíveis
- Congressos científicos reconhecidos
- Simpósios e workshops educacionais
- Treinamentos técnicos certificados

### Participantes Elegíveis
- Profissionais com interesse legítimo no tema
- Seleção baseada em critérios objetivos
- Sem vinculação a metas comerciais

## Despesas Cobertas

### Permitidas
- Inscrição no evento
- Transporte (classe econômica)
- Hospedagem (categoria moderada)
- Alimentação durante o evento

### Proibidas
- Viagens de acompanhantes
- Extensão para turismo
- Hospedagem de luxo
- Entretenimento não relacionado

## Documentação Necessária

1. Justificativa do patrocínio
2. Critérios de seleção dos participantes
3. Programa do evento
4. Comprovantes de despesas
5. Relatório pós-evento
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_interacao',
        question: 'Qual das seguintes práticas é PERMITIDA na interação com profissionais de saúde?',
        type: 'single',
        options: [
          { id: 'a', text: 'Oferecer viagem de lazer como agradecimento', isCorrect: false },
          { id: 'b', text: 'Patrocinar participação em congresso científico relevante', isCorrect: true },
          { id: 'c', text: 'Vincular benefícios a metas de prescrição', isCorrect: false },
          { id: 'd', text: 'Financiar viagem de acompanhante', isCorrect: false },
        ],
        explanation: 'O patrocínio de participação em congressos científicos é permitido quando há interesse legítimo e educacional, sem vinculação a metas comerciais.',
        points: 10,
      },
      {
        id: 'q2_eventos',
        question: 'Ao patrocinar a participação de um médico em um congresso, quais despesas podem ser cobertas?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Inscrição no evento', isCorrect: true },
          { id: 'b', text: 'Passagem em classe executiva', isCorrect: false },
          { id: 'c', text: 'Hospedagem em hotel de categoria moderada', isCorrect: true },
          { id: 'd', text: 'Extensão da viagem para turismo', isCorrect: false },
        ],
        explanation: 'Podem ser cobertas: inscrição, transporte em classe econômica, hospedagem moderada e alimentação durante o evento. Luxo e extensões para turismo não são permitidos.',
        points: 15,
      },
    ],
  },
  {
    id: 'brindes_hospitalidade',
    title: 'Brindes e Hospitalidade',
    description: 'Regras sobre oferecimento de brindes, refeições e hospitalidade',
    category: 'brindes_hospitalidade',
    duration: 25,
    order: 4,
    isRequired: true,
    validityMonths: 12,
    passingScore: 80,
    content: [
      {
        id: 'regras_brindes',
        type: 'text',
        title: 'Regras sobre Brindes',
        content: `
# Brindes e Itens Promocionais

## Princípios Gerais

Brindes devem ser:
- De valor modesto
- Relacionados à prática profissional
- Oferecidos de forma transparente
- Não condicionados a contrapartidas

## Itens Permitidos

### Materiais Educacionais
- Livros e publicações científicas
- Materiais de referência médica
- Softwares educacionais

### Itens de Escritório
- Canetas e blocos de notas
- Calendários profissionais
- Porta-documentos

### Itens Relacionados ao Paciente
- Modelos anatômicos para educação
- Materiais informativos para pacientes

## Itens Proibidos

- Dinheiro ou equivalentes
- Vouchers e gift cards
- Eletrônicos pessoais
- Itens de luxo
- Ingressos para entretenimento
- Itens para uso pessoal/familiar

## Limites de Valor

- Valor máximo por item: R$ 100,00
- Valor máximo anual por profissional: R$ 300,00
- Todos os brindes devem ser registrados
        `,
      },
      {
        id: 'refeicoes_hospitalidade',
        type: 'text',
        title: 'Refeições e Hospitalidade',
        content: `
# Refeições e Hospitalidade

## Refeições de Negócios

### Quando são Permitidas
- Durante reuniões de trabalho legítimas
- Em eventos educacionais
- Para discussão de assuntos profissionais

### Critérios
- Valor moderado e razoável
- Local apropriado
- Frequência limitada
- Sempre com propósito de negócios

## Hospitalidade em Eventos

### Permitido
- Coffee break em treinamentos
- Almoço durante workshops
- Jantar em congressos (moderado)

### Proibido
- Refeições em restaurantes de luxo
- Eventos puramente sociais
- Hospitalidade para familiares
- Entretenimento não relacionado

## Documentação

Toda despesa com refeições deve incluir:
1. Data e local
2. Participantes e suas funções
3. Propósito da reunião
4. Valor e comprovante
5. Aprovação prévia quando necessário
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_brindes',
        question: 'Qual dos seguintes itens pode ser oferecido como brinde a um profissional de saúde?',
        type: 'single',
        options: [
          { id: 'a', text: 'Gift card de R$ 200,00', isCorrect: false },
          { id: 'b', text: 'Livro de referência médica de R$ 80,00', isCorrect: true },
          { id: 'c', text: 'Ingresso para show musical', isCorrect: false },
          { id: 'd', text: 'Tablet para uso pessoal', isCorrect: false },
        ],
        explanation: 'Livros e materiais educacionais de valor modesto são permitidos. Gift cards, eletrônicos pessoais e entretenimento são proibidos.',
        points: 10,
      },
      {
        id: 'q2_refeicoes',
        question: 'Uma refeição de negócios com um médico é apropriada quando:',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Há um propósito legítimo de trabalho', isCorrect: true },
          { id: 'b', text: 'O valor é moderado e razoável', isCorrect: true },
          { id: 'c', text: 'É para comemorar o aniversário do médico', isCorrect: false },
          { id: 'd', text: 'Está devidamente documentada', isCorrect: true },
        ],
        explanation: 'Refeições de negócios devem ter propósito legítimo, valor moderado e ser documentadas. Eventos puramente sociais não são permitidos.',
        points: 15,
      },
    ],
  },
  {
    id: 'canal_denuncia',
    title: 'Canal de Denúncias e Não Retaliação',
    description: 'Como reportar violações e proteção contra retaliação',
    category: 'denuncia_violacoes',
    duration: 20,
    order: 5,
    isRequired: true,
    validityMonths: 12,
    passingScore: 80,
    content: [
      {
        id: 'como_reportar',
        type: 'text',
        title: 'Como Reportar Violações',
        content: `
# Canal de Denúncias

## O que Reportar

### Violações que devem ser reportadas:
- Suspeita de corrupção ou suborno
- Conflitos de interesse não declarados
- Fraude ou falsificação de documentos
- Violações de políticas internas
- Assédio ou discriminação
- Riscos à segurança de pacientes
- Violações de privacidade de dados

## Como Reportar

### Canais Disponíveis
1. **Linha Ética**: 0800-XXX-XXXX (24h)
2. **E-mail**: etica@empresa.com.br
3. **Portal Web**: compliance.empresa.com.br
4. **Gestor Direto**: Para questões menos sensíveis
5. **Compliance Officer**: Para orientação

### Informações Importantes
- Descreva os fatos com detalhes
- Inclua datas, locais e pessoas envolvidas
- Anexe evidências se disponíveis
- Identifique-se (recomendado) ou faça denúncia anônima

## Processo de Investigação

1. Recebimento e registro da denúncia
2. Análise preliminar
3. Investigação aprofundada
4. Conclusão e medidas
5. Feedback ao denunciante (quando identificado)
        `,
      },
      {
        id: 'nao_retaliacao',
        type: 'text',
        title: 'Política de Não Retaliação',
        content: `
# Proteção contra Retaliação

## Compromisso da Empresa

A empresa se compromete a:
- Proteger denunciantes de boa-fé
- Investigar todas as denúncias
- Manter confidencialidade
- Punir qualquer forma de retaliação

## O que é Retaliação

### Exemplos de Retaliação Proibida
- Demissão ou ameaça de demissão
- Rebaixamento ou transferência punitiva
- Redução de salário ou benefícios
- Exclusão de projetos ou oportunidades
- Assédio ou intimidação
- Avaliações injustas de desempenho

## Proteção ao Denunciante

### Direitos do Denunciante
- Confidencialidade da identidade
- Proteção contra retaliação
- Acompanhamento do caso
- Recurso em caso de insatisfação

### Responsabilidades
- Agir de boa-fé
- Fornecer informações verdadeiras
- Colaborar com investigações
- Manter confidencialidade

## Em Caso de Retaliação

Se você sofrer retaliação:
1. Documente os fatos
2. Reporte imediatamente ao Compliance
3. A empresa investigará e tomará medidas
4. Retaliadores serão punidos
        `,
      },
    ],
    quiz: [
      {
        id: 'q1_denuncia',
        question: 'Qual das seguintes situações deve ser reportada ao Canal de Denúncias?',
        type: 'multiple',
        options: [
          { id: 'a', text: 'Suspeita de pagamento de propina', isCorrect: true },
          { id: 'b', text: 'Conflito de interesse não declarado', isCorrect: true },
          { id: 'c', text: 'Discordância sobre método de trabalho', isCorrect: false },
          { id: 'd', text: 'Falsificação de documentos', isCorrect: true },
        ],
        explanation: 'Corrupção, conflitos de interesse e falsificação devem ser reportados. Discordâncias sobre métodos de trabalho são questões operacionais normais.',
        points: 15,
      },
      {
        id: 'q2_retaliacao',
        question: 'Qual das seguintes ações NÃO constitui retaliação?',
        type: 'single',
        options: [
          { id: 'a', text: 'Demissão após denúncia de boa-fé', isCorrect: false },
          { id: 'b', text: 'Feedback construtivo sobre desempenho', isCorrect: true },
          { id: 'c', text: 'Exclusão de projetos importantes', isCorrect: false },
          { id: 'd', text: 'Transferência punitiva de setor', isCorrect: false },
        ],
        explanation: 'Feedback construtivo sobre desempenho é parte normal da gestão. Demissão, exclusão e transferências punitivas após denúncias são formas de retaliação proibidas.',
        points: 10,
      },
    ],
  },
]

// ============ CLASSE PRINCIPAL ============

class ComplianceTrainingService {
  /**
   * Obtém todos os módulos de treinamento
   */
  getModules(): TrainingModule[] {
    return TRAINING_MODULES
  }

  /**
   * Obtém módulo por ID
   */
  getModule(moduleId: string): TrainingModule | undefined {
    return TRAINING_MODULES.find(m => m.id === moduleId)
  }

  /**
   * Obtém módulos por categoria
   */
  getModulesByCategory(category: TrainingCategory): TrainingModule[] {
    return TRAINING_MODULES.filter(m => m.category === category)
  }

  /**
   * Inicia treinamento para usuário
   */
  async startTraining(userId: string, moduleId: string): Promise<UserTrainingProgress> {
    const progress: UserTrainingProgress = {
      id: crypto.randomUUID(),
      oduleId: moduleId,
      startedAt: new Date().toISOString(),
      contentProgress: {},
      quizAttempts: [],
      status: 'in_progress',
    }

    await supabase.from('training_progress').insert({
      id: progress.id,
      user_id: userId,
      module_id: moduleId,
      started_at: progress.startedAt,
      status: progress.status,
      content_progress: progress.contentProgress,
      quiz_attempts: progress.quizAttempts,
    })

    await audit(
      'CREATE',
      'treinamento',
      progress.id,
      userId,
      'User',
      'trainee',
      { moduleId, action: 'started_training' }
    )

    return progress
  }

  /**
   * Marca conteúdo como visualizado
   */
  async markContentViewed(
    progressId: string,
    contentId: string,
    userId: string
  ): Promise<void> {
    const { data } = await supabase
      .from('training_progress')
      .select('content_progress')
      .eq('id', progressId)
      .single()

    const contentProgress = data?.content_progress || {}
    contentProgress[contentId] = true

    await supabase
      .from('training_progress')
      .update({ content_progress: contentProgress })
      .eq('id', progressId)
  }

  /**
   * Submete tentativa de quiz
   */
  async submitQuiz(
    progressId: string,
    moduleId: string,
    userId: string,
    answers: Record<string, string[]>
  ): Promise<QuizAttempt> {
    const module = this.getModule(moduleId)
    if (!module) throw new Error('Module not found')

    // Calcular pontuação
    let totalPoints = 0
    let earnedPoints = 0

    for (const question of module.quiz) {
      totalPoints += question.points
      const userAnswers = answers[question.id] || []
      const correctAnswers = question.options
        .filter(o => o.isCorrect)
        .map(o => o.id)

      const isCorrect = 
        userAnswers.length === correctAnswers.length &&
        userAnswers.every(a => correctAnswers.includes(a))

      if (isCorrect) {
        earnedPoints += question.points
      }
    }

    const score = Math.round((earnedPoints / totalPoints) * 100)
    const passed = score >= module.passingScore

    // Obter tentativas anteriores
    const { data } = await supabase
      .from('training_progress')
      .select('quiz_attempts')
      .eq('id', progressId)
      .single()

    const attempts: QuizAttempt[] = data?.quiz_attempts || []
    const attempt: QuizAttempt = {
      attemptNumber: attempts.length + 1,
      timestamp: new Date().toISOString(),
      answers,
      score,
      passed,
    }

    attempts.push(attempt)

    // Atualizar progresso
    const updateData: Record<string, unknown> = {
      quiz_attempts: attempts,
      score,
    }

    if (passed) {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
    } else if (attempts.length >= 3) {
      updateData.status = 'failed'
    }

    await supabase
      .from('training_progress')
      .update(updateData)
      .eq('id', progressId)

    // Audit
    await audit(
      passed ? 'APPROVE' : 'REJECT',
      'treinamento',
      progressId,
      userId,
      'User',
      'trainee',
      { moduleId, score, passed, attempt: attempt.attemptNumber }
    )

    // Se passou, emitir certificado
    if (passed) {
      await this.issueCertificate(userId, moduleId, score)
    }

    return attempt
  }

  /**
   * Emite certificado
   */
  async issueCertificate(
    userId: string,
    moduleId: string,
    score: number
  ): Promise<Certificate> {
    const module = this.getModule(moduleId)
    if (!module) throw new Error('Module not found')

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + module.validityMonths)

    const certificateNumber = `ICARUS-${moduleId.toUpperCase()}-${now.getFullYear()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`

    const certificate: Certificate = {
      id: crypto.randomUUID(),
      oduleId: moduleId,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      score,
      certificateNumber,
      qrCode: `https://icarus.app/verify/${certificateNumber}`,
      status: 'valid',
    }

    await supabase.from('training_certificates').insert({
      id: certificate.id,
      user_id: userId,
      module_id: moduleId,
      issued_at: certificate.issuedAt,
      expires_at: certificate.expiresAt,
      score: certificate.score,
      certificate_number: certificate.certificateNumber,
      qr_code: certificate.qrCode,
      status: certificate.status,
    })

    await audit(
      'SIGN',
      'certificado',
      certificate.id,
      userId,
      'User',
      'trainee',
      { moduleId, certificateNumber, score }
    )

    logger.info('Certificate issued', { certificateNumber, userId, moduleId })

    return certificate
  }

  /**
   * Verifica certificado
   */
  async verifyCertificate(certificateNumber: string): Promise<{
    isValid: boolean
    certificate?: Certificate
    user?: { name: string; email: string }
    module?: TrainingModule
    message: string
  }> {
    const { data } = await supabase
      .from('training_certificates')
      .select('*, user:usuarios(nome, email)')
      .eq('certificate_number', certificateNumber)
      .single()

    if (!data) {
      return { isValid: false, message: 'Certificado não encontrado' }
    }

    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (data.status === 'revoked') {
      return { isValid: false, message: 'Certificado revogado' }
    }

    if (now > expiresAt) {
      return { isValid: false, message: 'Certificado expirado' }
    }

    const module = this.getModule(data.module_id)

    return {
      isValid: true,
      certificate: {
        id: data.id,
        oduleId: data.module_id,
        issuedAt: data.issued_at,
        expiresAt: data.expires_at,
        score: data.score,
        certificateNumber: data.certificate_number,
        qrCode: data.qr_code,
        status: data.status,
      },
      user: data.user,
      module,
      message: 'Certificado válido',
    }
  }

  /**
   * Obtém progresso do usuário
   */
  async getUserProgress(userId: string): Promise<{
    completed: string[]
    inProgress: string[]
    pending: string[]
    certificates: Certificate[]
  }> {
    const { data: progress } = await supabase
      .from('training_progress')
      .select('*')
      .eq('user_id', userId)

    const { data: certificates } = await supabase
      .from('training_certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'valid')

    const completed = progress?.filter(p => p.status === 'completed').map(p => p.module_id) || []
    const inProgress = progress?.filter(p => p.status === 'in_progress').map(p => p.module_id) || []
    const allModuleIds = TRAINING_MODULES.map(m => m.id)
    const pending = allModuleIds.filter(id => !completed.includes(id) && !inProgress.includes(id))

    return {
      completed,
      inProgress,
      pending,
      certificates: certificates || [],
    }
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const complianceTraining = new ComplianceTrainingService()

// ============ HOOK REACT ============

import { useState, useCallback } from 'react'

export function useComplianceTraining() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startTraining = useCallback(async (userId: string, moduleId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await complianceTraining.startTraining(userId, moduleId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start training')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitQuiz = useCallback(async (
    progressId: string,
    moduleId: string,
    userId: string,
    answers: Record<string, string[]>
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      return await complianceTraining.submitQuiz(progressId, moduleId, userId, answers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyCertificate = useCallback(async (certificateNumber: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await complianceTraining.verifyCertificate(certificateNumber)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify certificate')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    modules: complianceTraining.getModules(),
    getModule: complianceTraining.getModule.bind(complianceTraining),
    startTraining,
    submitQuiz,
    verifyCertificate,
    getUserProgress: complianceTraining.getUserProgress.bind(complianceTraining),
    isLoading,
    error,
  }
}

// ============ EXPORTS ============

export default {
  complianceTraining,
  useComplianceTraining,
  TRAINING_MODULES,
}

