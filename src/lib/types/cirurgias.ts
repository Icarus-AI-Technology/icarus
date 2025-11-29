/**
 * ICARUS v5.0 - Tipos do Módulo de Cirurgias OPME
 * 
 * Tipos e interfaces para o fluxo operacional completo
 * de uma distribuidora de materiais médicos OPME.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

// ============ ENUMS ============

export type StatusCirurgia = 
  | 'pedido_medico'
  | 'cotacao'
  | 'aguardando_autorizacao'
  | 'autorizada'
  | 'agendada'
  | 'logistica'
  | 'em_cirurgia'
  | 'logistica_reversa'
  | 'pos_cirurgico'
  | 'aguardando_faturamento'
  | 'faturamento_parcial'
  | 'faturada'
  | 'cancelada'

export type TipoFontePagadora = 'convenio_direto' | 'hospital_repasse' | 'particular' | 'sus'

export type TipoCirurgia = 'eletiva' | 'urgencia'

export type RegimeTributarioConvenio = 'simples' | 'lucro_presumido' | 'lucro_real'

// ============ INTERFACES BASE ============

/**
 * Paciente - APENAS para rastreabilidade OPME
 * NÃO é cliente da distribuidora
 */
export interface PacienteRastreabilidade {
  id: string
  nome_completo: string
  data_nascimento: string
  convenio_id: string
  convenio_nome: string
  matricula_convenio: string
  numero_cartao?: string
  hospital_internacao?: string
  created_at: string
  updated_at: string
}

/**
 * Convênio/Operadora de Saúde
 */
export interface Convenio {
  id: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  codigo_ans: string // Código ANS da operadora
  tipo: 'plano_saude' | 'seguradora' | 'cooperativa' | 'autogestao'
  tabela_tuss: boolean
  prazo_pagamento_dias: number
  percentual_glosa_medio: number
  contato_autorizacao: string
  email_autorizacao: string
  telefone_autorizacao: string
  portal_autorizacao_url?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

/**
 * Hospital (Cliente da distribuidora)
 */
export interface Hospital {
  id: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  cnes: string // Cadastro Nacional de Estabelecimentos de Saúde
  tipo: 'privado' | 'publico' | 'filantropo' | 'universitario'
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  contato_compras: string
  email_compras: string
  telefone: string
  aceita_repasse_convenio: boolean
  margem_repasse_percentual?: number
  prazo_repasse_dias?: number
  ativo: boolean
  created_at: string
  updated_at: string
}

/**
 * Médico
 */
export interface Medico {
  id: string
  nome_completo: string
  crm: string
  uf_crm: string
  especialidade: string
  sub_especialidade?: string
  email: string
  telefone: string
  hospitais_atendimento: string[] // IDs dos hospitais
  preferencias_opme?: {
    fabricante_preferido?: string
    tamanhos_frequentes?: string[]
    materiais_frequentes?: string[]
  }
  ativo: boolean
  created_at: string
  updated_at: string
}

/**
 * Procedimento TUSS
 */
export interface ProcedimentoTUSS {
  id: string
  codigo_tuss: string
  descricao: string
  especialidade: string
  materiais_tipicos: string[] // IDs de produtos OPME típicos
  tempo_medio_minutos: number
  complexidade: 'baixa' | 'media' | 'alta'
  requer_autorizacao_previa: boolean
  created_at: string
}

/**
 * Produto OPME
 */
export interface ProdutoOPME {
  id: string
  codigo_interno: string
  nome: string
  descricao: string
  fabricante: string
  codigo_anvisa: string
  classe_risco: 'I' | 'II' | 'III' | 'IV'
  ncm: string
  unidade: string
  preco_custo: number
  preco_tabela: number
  estoque_disponivel: number
  lote_atual?: string
  validade_lote?: string
  ativo: boolean
}

// ============ INTERFACES DO FLUXO CIRÚRGICO ============

/**
 * Pedido Médico (Etapa 1)
 */
export interface PedidoMedico {
  id: string
  numero_pedido: string
  medico_id: string
  medico: Medico
  hospital_id: string
  hospital: Hospital
  paciente?: PacienteRastreabilidade
  procedimento_id: string
  procedimento: ProcedimentoTUSS
  tipo_cirurgia: TipoCirurgia
  urgencia_justificativa?: string
  data_prevista?: string
  arquivo_prescricao_url?: string
  arquivo_prescricao_ocr?: string // Texto extraído por OCR
  produtos_solicitados: Array<{
    produto_id: string
    produto: ProdutoOPME
    quantidade: number
    tamanho?: string
    observacao?: string
  }>
  status: 'pendente' | 'processado' | 'cotado'
  created_at: string
  updated_at: string
}

/**
 * Cotação Pré-Cirúrgica (Etapa 2)
 */
export interface CotacaoPreCirurgica {
  id: string
  numero_cotacao: string
  pedido_medico_id: string
  pedido_medico: PedidoMedico
  fonte_pagadora_tipo: TipoFontePagadora
  convenio_id?: string
  convenio?: Convenio
  hospital_id?: string
  hospital?: Hospital
  itens: Array<{
    produto_id: string
    produto: ProdutoOPME
    quantidade: number
    preco_unitario: number
    preco_total: number
    desconto_percentual: number
    preco_final: number
  }>
  subtotal: number
  desconto_total: number
  valor_total: number
  margem_lucro_percentual: number
  validade_cotacao: string
  status: 'rascunho' | 'enviada' | 'aprovada' | 'rejeitada' | 'expirada'
  observacoes?: string
  created_at: string
  updated_at: string
}

/**
 * Autorização Prévia (Etapa 3)
 */
export interface AutorizacaoPrevia {
  id: string
  cotacao_id: string
  cotacao: CotacaoPreCirurgica
  convenio_id: string
  convenio: Convenio
  numero_guia?: string
  senha_autorizacao?: string
  data_solicitacao: string
  data_resposta?: string
  status: 'solicitada' | 'em_analise' | 'aprovada' | 'aprovada_parcial' | 'negada' | 'expirada'
  itens_aprovados?: Array<{
    produto_id: string
    quantidade_aprovada: number
    valor_aprovado: number
  }>
  itens_negados?: Array<{
    produto_id: string
    motivo_negativa: string
  }>
  documentos_anexos: Array<{
    tipo: 'guia_autorizacao' | 'laudo_medico' | 'exames' | 'termo_consentimento' | 'outros'
    arquivo_url: string
    nome_arquivo: string
  }>
  observacoes_convenio?: string
  created_at: string
  updated_at: string
}

/**
 * Cirurgia (Fluxo Principal)
 */
export interface Cirurgia {
  id: string
  numero_cirurgia: string
  
  // Referências
  pedido_medico_id: string
  pedido_medico: PedidoMedico
  cotacao_id?: string
  cotacao?: CotacaoPreCirurgica
  autorizacao_id?: string
  autorizacao?: AutorizacaoPrevia
  
  // Participantes
  paciente_id: string
  paciente: PacienteRastreabilidade
  medico_id: string
  medico: Medico
  hospital_id: string
  hospital: Hospital
  
  // Fonte Pagadora
  fonte_pagadora_tipo: TipoFontePagadora
  convenio_id?: string
  convenio?: Convenio
  
  // Procedimento
  procedimento_id: string
  procedimento: ProcedimentoTUSS
  tipo_cirurgia: TipoCirurgia
  
  // Agendamento
  data_agendada: string
  hora_agendada: string
  sala_cirurgica?: string
  
  // Realização
  data_realizacao?: string
  hora_inicio_real?: string
  hora_fim_real?: string
  duracao_minutos?: number
  
  // Materiais
  kit_cirurgico_id?: string
  materiais_utilizados: Array<{
    produto_id: string
    produto: ProdutoOPME
    quantidade: number
    lote: string
    serie?: string
    validade: string
    rastreabilidade_paciente: boolean
  }>
  materiais_devolvidos: Array<{
    produto_id: string
    quantidade: number
    motivo: string
  }>
  
  // Status e Fluxo
  status: StatusCirurgia
  etapa_kanban: number // 1-12
  
  // Pós-cirúrgico
  intercorrencias?: string
  conclusao?: 'sucesso' | 'sucesso_intercorrencia' | 'parcial' | 'cancelada'
  
  // Faturamento
  faturamento_status: 'pendente' | 'parcial' | 'total' | 'glosado'
  valor_faturado?: number
  nfe_numero?: string
  nfe_chave?: string
  
  // Auditoria
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

/**
 * Kit Cirúrgico (Contêiner de Materiais)
 */
export interface KitCirurgico {
  id: string
  codigo_kit: string
  cirurgia_id?: string
  tipo: 'padrao' | 'personalizado' | 'urgencia'
  especialidade: string
  procedimento_id?: string
  
  itens: Array<{
    produto_id: string
    produto: ProdutoOPME
    quantidade: number
    lote: string
    validade: string
    posicao_container?: string
  }>
  
  // Logística
  status: 'montagem' | 'conferido' | 'enviado' | 'em_uso' | 'retornado' | 'conferido_retorno'
  data_montagem?: string
  data_envio?: string
  data_retorno?: string
  
  // Responsáveis
  montado_por?: string
  conferido_por?: string
  
  // Rastreamento
  localizacao_atual?: string
  historico_localizacao: Array<{
    localizacao: string
    data_hora: string
    responsavel: string
  }>
  
  created_at: string
  updated_at: string
}

/**
 * Faturamento Pós-Cirúrgico
 */
export interface FaturamentoCirurgia {
  id: string
  cirurgia_id: string
  cirurgia: Cirurgia
  
  tipo: 'total' | 'parcial'
  fonte_pagadora_tipo: TipoFontePagadora
  destinatario_id: string // Convênio ou Hospital
  
  itens: Array<{
    produto_id: string
    produto: ProdutoOPME
    quantidade: number
    preco_unitario: number
    preco_total: number
    codigo_tuss?: string
  }>
  
  subtotal: number
  desconto: number
  valor_total: number
  
  // NFe
  nfe_numero?: string
  nfe_serie?: string
  nfe_chave?: string
  nfe_xml_url?: string
  nfe_pdf_url?: string
  nfe_status: 'pendente' | 'emitida' | 'cancelada' | 'rejeitada'
  
  // Pagamento
  vencimento: string
  data_pagamento?: string
  valor_pago?: number
  glosa_valor?: number
  glosa_motivo?: string
  
  status: 'rascunho' | 'emitido' | 'enviado' | 'pago' | 'glosado' | 'cancelado'
  
  created_at: string
  updated_at: string
}

// ============ INTERFACES PARA IA ============

/**
 * Sugestão de Kit IA
 */
export interface SugestaoKitIA {
  procedimento_id: string
  medico_id: string
  produtos_sugeridos: Array<{
    produto_id: string
    quantidade_sugerida: number
    confianca: number // 0-1
    baseado_em: 'historico_medico' | 'historico_procedimento' | 'padrao_mercado'
  }>
  observacoes_ia: string
}

/**
 * Previsão de Demanda IA
 */
export interface PrevisaoDemandaIA {
  produto_id: string
  periodo: string
  quantidade_prevista: number
  confianca: number
  fatores: Array<{
    fator: string
    impacto: 'positivo' | 'negativo' | 'neutro'
    peso: number
  }>
}

/**
 * Alerta Preditivo
 */
export interface AlertaPreditivo {
  id: string
  tipo: 'estoque_baixo' | 'vencimento_proximo' | 'padrao_anomalo' | 'glosa_risco'
  severidade: 'info' | 'warning' | 'critical'
  titulo: string
  mensagem: string
  dados: Record<string, unknown>
  acao_sugerida: string
  created_at: string
  lido: boolean
  resolvido: boolean
}

// ============ INTERFACES PARA KANBAN ============

/**
 * Coluna do Kanban
 */
export interface KanbanColumn {
  id: StatusCirurgia
  titulo: string
  cor: string
  icone: string
  ordem: number
}

/**
 * Card do Kanban
 */
export interface KanbanCard {
  id: string
  cirurgia: Cirurgia
  cor_status: 'vermelho' | 'laranja' | 'verde' | 'azul'
  alertas: string[]
  acoes_disponiveis: string[]
}

// ============ CONSTANTES ============

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'pedido_medico', titulo: 'Pedido Médico', cor: '#3B82F6', icone: 'FileText', ordem: 1 },
  { id: 'cotacao', titulo: 'Cotação', cor: '#8B5CF6', icone: 'Calculator', ordem: 2 },
  { id: 'aguardando_autorizacao', titulo: 'Aguardando Autorização', cor: '#8b5cf6', icone: 'Clock', ordem: 3 },
  { id: 'autorizada', titulo: 'Autorizada', cor: '#10B981', icone: 'CheckCircle', ordem: 4 },
  { id: 'agendada', titulo: 'Agendada', cor: '#6366F1', icone: 'Calendar', ordem: 5 },
  { id: 'logistica', titulo: 'Logística', cor: '#EC4899', icone: 'Truck', ordem: 6 },
  { id: 'em_cirurgia', titulo: 'Em Cirurgia', cor: '#EF4444', icone: 'Activity', ordem: 7 },
  { id: 'logistica_reversa', titulo: 'Logística Reversa', cor: '#F97316', icone: 'RotateCcw', ordem: 8 },
  { id: 'pos_cirurgico', titulo: 'Pós-Cirúrgico', cor: '#14B8A6', icone: 'ClipboardCheck', ordem: 9 },
  { id: 'aguardando_faturamento', titulo: 'Aguardando Faturamento', cor: '#8b5cf6', icone: 'Receipt', ordem: 10 },
  { id: 'faturamento_parcial', titulo: 'Faturamento Parcial', cor: '#F97316', icone: 'AlertCircle', ordem: 11 },
  { id: 'faturada', titulo: 'Faturada', cor: '#10B981', icone: 'CheckCircle2', ordem: 12 },
]

export const STATUS_CORES: Record<StatusCirurgia, string> = {
  pedido_medico: '#3B82F6',
  cotacao: '#8B5CF6',
  aguardando_autorizacao: '#8b5cf6',
  autorizada: '#10B981',
  agendada: '#6366F1',
  logistica: '#EC4899',
  em_cirurgia: '#EF4444',
  logistica_reversa: '#F97316',
  pos_cirurgico: '#14B8A6',
  aguardando_faturamento: '#8b5cf6',
  faturamento_parcial: '#F97316',
  faturada: '#10B981',
  cancelada: '#64748B',
}

export default {
  KANBAN_COLUMNS,
  STATUS_CORES,
}

