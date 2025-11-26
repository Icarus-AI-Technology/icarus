/**
 * ICARUS v5.0 - Integration Types
 * Types and interfaces for external integrations
 */

// ============================================================================
// INTEGRATION STATUS
// ============================================================================

export type IntegrationStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'expiring'
  | 'connecting'
  | 'outdated';

export type IntegrationSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface IntegrationHealth {
  name: string;
  status: IntegrationStatus;
  lastSync?: Date;
  errorMessage?: string;
  expiresAt?: Date;
  daysUntilExpiry?: number;
}

// ============================================================================
// MICROSOFT 365
// ============================================================================

export interface MicrosoftConfig {
  clientId: string;
  tenantId?: string;
  redirectUri: string;
  scopes: string[];
}

export interface MicrosoftToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
  accountId: string;
}

export interface MicrosoftUser {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
}

export interface MicrosoftEmail {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyType?: 'HTML' | 'Text';
  attachments?: MicrosoftAttachment[];
  importance?: 'low' | 'normal' | 'high';
}

export interface MicrosoftAttachment {
  name: string;
  contentType: string;
  base64Content: string;
  size: number;
}

export interface MicrosoftCalendarEvent {
  subject: string;
  body?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  isOnlineMeeting?: boolean;
  reminderMinutes?: number;
}

export interface MicrosoftTeamsMeeting {
  subject: string;
  startDateTime: Date;
  endDateTime: Date;
  participants: string[];
  joinUrl?: string;
  meetingId?: string;
}

// ============================================================================
// PLUGGY (OPEN BANKING)
// ============================================================================

export interface PluggyConfig {
  clientId: string;
  clientSecret: string;
  webhookUrl?: string;
  webhookSecret?: string;
  sandbox?: boolean;
}

export interface PluggyConnectToken {
  accessToken: string;
  expiresAt: Date;
}

export interface PluggyConnection {
  id: string;
  itemId: string;
  status: 'connecting' | 'connected' | 'error' | 'outdated' | 'login_required';
  institution: PluggyInstitution;
  lastSync?: Date;
  errorMessage?: string;
  accounts: PluggyAccount[];
}

export interface PluggyInstitution {
  id: number;
  name: string;
  imageUrl?: string;
  primaryColor?: string;
  type: 'BANK' | 'INVESTMENT' | 'EXCHANGE';
}

export interface PluggyAccount {
  id: string;
  itemId: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT';
  name: string;
  number?: string;
  balance: number;
  currencyCode: string;
  bankData?: {
    bankName: string;
    branch: string;
    account: string;
  };
}

export interface PluggyTransaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  descriptionRaw?: string;
  amount: number;
  amountInAccountCurrency?: number;
  type: 'CREDIT' | 'DEBIT';
  category?: string;
  categoryId?: string;
  paymentData?: {
    payer?: string;
    payee?: string;
    paymentMethod?: string;
    referenceNumber?: string;
  };
}

export interface PluggyWebhookEvent {
  event:
    | 'item/created'
    | 'item/updated'
    | 'item/error'
    | 'item/deleted'
    | 'item/login_required'
    | 'transactions/created';
  itemId: string;
  triggeredAt: Date;
  data?: Record<string, unknown>;
}

// ============================================================================
// SEFAZ (NF-e)
// ============================================================================

export interface SefazConfig {
  ambiente: 'producao' | 'homologacao';
  uf: string;
  certificado: SefazCertificado;
  empresa: SefazEmpresa;
  serie: number;
}

export interface SefazCertificado {
  pfx: string; // Base64
  senha: string;
  validoAte?: Date;
  emissor?: string;
  titular?: string;
}

export interface SefazEmpresa {
  cnpj: string;
  ie: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco?: SefazEndereco;
  crt: '1' | '2' | '3'; // Regime tributário
}

export interface SefazEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: string;
  municipio: string;
  uf: string;
  cep: string;
  codigoPais?: string;
  pais?: string;
  telefone?: string;
}

export interface NFe {
  chave?: string;
  numero?: number;
  serie: number;
  dataEmissao: Date;
  naturezaOperacao: string;
  emitente: SefazEmpresa;
  destinatario: NFeDestinatario;
  produtos: NFeProduto[];
  totais: NFeTotais;
  transporte?: NFeTransporte;
  pagamento: NFePagamento;
  informacoesAdicionais?: string;
}

export interface NFeDestinatario {
  cnpjCpf: string;
  ie?: string;
  nome: string;
  endereco?: SefazEndereco;
  email?: string;
  telefone?: string;
  indicadorIE: '1' | '2' | '9'; // Contribuinte, Isento, Não contribuinte
}

export interface NFeProduto {
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  cest?: string;
  gtin?: string;
  impostos: NFeImpostos;
}

export interface NFeImpostos {
  icms?: {
    origem: string;
    cst: string;
    baseCalculo?: number;
    aliquota?: number;
    valor?: number;
  };
  pis?: {
    cst: string;
    baseCalculo?: number;
    aliquota?: number;
    valor?: number;
  };
  cofins?: {
    cst: string;
    baseCalculo?: number;
    aliquota?: number;
    valor?: number;
  };
  ipi?: {
    cst: string;
    baseCalculo?: number;
    aliquota?: number;
    valor?: number;
  };
}

export interface NFeTotais {
  baseCalculoICMS: number;
  valorICMS: number;
  valorProdutos: number;
  valorFrete?: number;
  valorSeguro?: number;
  valorDesconto?: number;
  valorIPI?: number;
  valorPIS?: number;
  valorCOFINS?: number;
  valorNF: number;
}

export interface NFeTransporte {
  modalidadeFrete: '0' | '1' | '2' | '3' | '4' | '9';
  transportadora?: {
    cnpjCpf?: string;
    nome?: string;
    ie?: string;
    endereco?: string;
    municipio?: string;
    uf?: string;
  };
  volumes?: {
    quantidade?: number;
    especie?: string;
    marca?: string;
    numeracao?: string;
    pesoLiquido?: number;
    pesoBruto?: number;
  }[];
}

export interface NFePagamento {
  indicadorPagamento: '0' | '1' | '2'; // À vista, A prazo, Outros
  formas: {
    meio: string; // 01=Dinheiro, 02=Cheque, 03=Cartão Crédito, etc.
    valor: number;
    dataPagamento?: Date;
  }[];
}

export interface NFeResponse {
  success: boolean;
  chave?: string;
  protocolo?: string;
  dataAutorizacao?: Date;
  codigoStatus?: string;
  motivo?: string;
  xml?: string;
  danfeUrl?: string;
}

export interface SefazContingencia {
  ativa: boolean;
  tipo?: 'SVC-AN' | 'SVC-RS' | 'DPEC' | 'FS-DA';
  motivo?: string;
  dataInicio?: Date;
}

// ============================================================================
// ANVISA
// ============================================================================

export interface AnvisaRegistro {
  numero: string;
  valido: boolean;
  produto?: string;
  empresa?: string;
  vencimento?: Date;
  classeRisco?: 'I' | 'II' | 'III' | 'IV';
  situacao: 'ATIVO' | 'INATIVO' | 'CANCELADO' | 'VENCIDO' | 'NAO_ENCONTRADO';
  categoriaReguladora?: string;
  finalidade?: string;
  apresentacao?: string;
}

export interface AnvisaConsultaParams {
  registro: string;
  useCache?: boolean;
  cacheExpiry?: number; // seconds
}

// ============================================================================
// VIA CEP
// ============================================================================

export interface ViaCepEndereco {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

// ============================================================================
// BRASIL API
// ============================================================================

export interface BrasilApiCnpj {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  dataAbertura?: string;
  situacaoCadastral?: string;
  dataSituacaoCadastral?: string;
  naturezaJuridica?: string;
  porte?: string;
  capitalSocial?: number;
  atividadePrincipal?: {
    codigo: string;
    descricao: string;
  };
  atividadesSecundarias?: {
    codigo: string;
    descricao: string;
  }[];
  endereco?: {
    tipoLogradouro?: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
  telefone?: string;
  email?: string;
  qsa?: {
    nome: string;
    qualificacao: string;
  }[];
}

export interface BrasilApiCpf {
  cpf: string;
  nome: string;
  dataNascimento?: string;
  situacao?: string;
}

// ============================================================================
// CFM (Conselho Federal de Medicina)
// ============================================================================

export interface CfmMedico {
  crm: string;
  uf: string;
  nome: string;
  situacao: 'REGULAR' | 'IRREGULAR' | 'CANCELADO' | 'NAO_ENCONTRADO';
  especialidades?: string[];
  dataInscricao?: Date;
  enderecoProfissional?: string;
}

// ============================================================================
// AUDITOR CHECKLIST
// ============================================================================

export interface AuditorChecklistItem {
  id: string;
  category: string;
  item: string;
  description: string;
  verification: string;
  severity: IntegrationSeverity;
  status: 'pass' | 'fail' | 'warning' | 'pending' | 'not_applicable';
  details?: string;
  lastChecked?: Date;
}

export interface AuditorChecklistCategory {
  name: string;
  weight: number;
  criticality: IntegrationSeverity;
  items: AuditorChecklistItem[];
  score: number;
}

export interface AuditorChecklistResult {
  categories: AuditorChecklistCategory[];
  totalScore: number;
  timestamp: Date;
  recommendations: string[];
  alerts: AuditorAlert[];
}

export interface AuditorAlert {
  type: 'critical' | 'warning' | 'info';
  integration: string;
  message: string;
  action: string;
  timestamp: Date;
}

// ============================================================================
// API CLIENT CONFIG
// ============================================================================

export interface APIClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public statusText: string,
    public body?: string
  ) {
    super(`API Error ${statusCode}: ${statusText}`);
    this.name = 'APIError';
  }
}
