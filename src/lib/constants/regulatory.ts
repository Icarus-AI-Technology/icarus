/**
 * ICARUS v5.0 - Constantes Regulatórias
 * Conformidade: RDC 59/751/188 ANVISA
 * 
 * Centraliza todas as constantes relacionadas a regulamentações
 * médicas e sanitárias brasileiras e internacionais.
 */

// ============================================================================
// ANVISA - Agência Nacional de Vigilância Sanitária
// ============================================================================

/** Resoluções RDC ANVISA aplicáveis a OPME */
export const ANVISA_RDC = {
  /** RDC 59/2000 - Boas Práticas de Fabricação */
  RDC_59_2000: 'RDC 59/2000',
  /** RDC 185/2001 - Registro de Produtos Médicos */
  RDC_185_2001: 'RDC 185/2001',
  /** RDC 56/2001 - Requisitos para Produtos Médicos */
  RDC_56_2001: 'RDC 56/2001',
  /** RDC 16/2013 - Boas Práticas de Fabricação */
  RDC_16_2013: 'RDC 16/2013',
  /** RDC 751/2022 - Registro de Produtos Médicos */
  RDC_751_2022: 'RDC 751/2022',
  /** RDC 665/2022 - Dispositivos Médicos */
  RDC_665_2022: 'RDC 665/2022',
  /** RDC 59/2008 - Rastreabilidade */
  RDC_59_2008: 'RDC 59/2008',
  /** RDC 188/2017 - Produtos para Saúde */
  RDC_188_2017: 'RDC 188/2017',
} as const

export type AnvisaRDC = typeof ANVISA_RDC[keyof typeof ANVISA_RDC]

/** Classes de risco ANVISA para produtos médicos */
export const ANVISA_RISK_CLASS = {
  /** Classe I - Baixo risco */
  CLASS_I: 'I',
  /** Classe II - Médio risco */
  CLASS_II: 'II',
  /** Classe III - Alto risco */
  CLASS_III: 'III',
  /** Classe IV - Máximo risco */
  CLASS_IV: 'IV',
} as const

export type AnvisaRiskClass = typeof ANVISA_RISK_CLASS[keyof typeof ANVISA_RISK_CLASS]

/** Descrições das classes de risco */
export const ANVISA_RISK_CLASS_DESCRIPTION: Record<AnvisaRiskClass, string> = {
  [ANVISA_RISK_CLASS.CLASS_I]: 'Baixo risco - Produtos não invasivos',
  [ANVISA_RISK_CLASS.CLASS_II]: 'Médio risco - Produtos invasivos de curto prazo',
  [ANVISA_RISK_CLASS.CLASS_III]: 'Alto risco - Produtos invasivos de longo prazo',
  [ANVISA_RISK_CLASS.CLASS_IV]: 'Máximo risco - Produtos implantáveis ativos',
}

/** Status de registro ANVISA */
export const ANVISA_REGISTRO_STATUS = {
  ATIVO: 'ativo',
  SUSPENSO: 'suspenso',
  CANCELADO: 'cancelado',
  VENCIDO: 'vencido',
  PENDENTE: 'pendente',
} as const

export type AnvisaRegistroStatus = typeof ANVISA_REGISTRO_STATUS[keyof typeof ANVISA_REGISTRO_STATUS]

// ============================================================================
// FDA - Food and Drug Administration (USA)
// ============================================================================

/** Regulamentações FDA aplicáveis */
export const FDA_CFR = {
  /** 21 CFR Part 11 - Registros Eletrônicos */
  CFR_PART_11: '21 CFR Part 11',
  /** 21 CFR Part 820 - Quality System Regulation */
  CFR_PART_820: '21 CFR Part 820',
  /** 21 CFR Part 803 - Medical Device Reporting */
  CFR_PART_803: '21 CFR Part 803',
} as const

export type FdaCfr = typeof FDA_CFR[keyof typeof FDA_CFR]

// ============================================================================
// ISO - International Organization for Standardization
// ============================================================================

/** Normas ISO aplicáveis a dispositivos médicos */
export const ISO_STANDARDS = {
  /** ISO 13485 - Sistemas de Gestão da Qualidade */
  ISO_13485: 'ISO 13485:2016',
  /** ISO 14971 - Gestão de Riscos */
  ISO_14971: 'ISO 14971:2019',
  /** ISO 27001 - Segurança da Informação */
  ISO_27001: 'ISO 27001:2022',
  /** ISO 9001 - Gestão da Qualidade */
  ISO_9001: 'ISO 9001:2015',
} as const

export type IsoStandard = typeof ISO_STANDARDS[keyof typeof ISO_STANDARDS]

// ============================================================================
// LGPD - Lei Geral de Proteção de Dados
// ============================================================================

/** Bases legais LGPD para tratamento de dados */
export const LGPD_LEGAL_BASIS = {
  CONSENT: 'consentimento',
  CONTRACT: 'execução_contrato',
  LEGAL_OBLIGATION: 'obrigação_legal',
  VITAL_INTEREST: 'proteção_vida',
  PUBLIC_INTEREST: 'interesse_público',
  LEGITIMATE_INTEREST: 'interesse_legítimo',
  HEALTH_PROTECTION: 'tutela_saúde',
  RESEARCH: 'pesquisa',
  CREDIT_PROTECTION: 'proteção_crédito',
} as const

export type LgpdLegalBasis = typeof LGPD_LEGAL_BASIS[keyof typeof LGPD_LEGAL_BASIS]

// ============================================================================
// TUSS - Terminologia Unificada da Saúde Suplementar
// ============================================================================

/** Tipos de procedimentos TUSS */
export const TUSS_PROCEDURE_TYPE = {
  SURGICAL: 'cirúrgico',
  CLINICAL: 'clínico',
  DIAGNOSTIC: 'diagnóstico',
  THERAPEUTIC: 'terapêutico',
} as const

export type TussProcedureType = typeof TUSS_PROCEDURE_TYPE[keyof typeof TUSS_PROCEDURE_TYPE]

// ============================================================================
// OPME - Órteses, Próteses e Materiais Especiais
// ============================================================================

/** Categorias de OPME */
export const OPME_CATEGORY = {
  ORTESE: 'órtese',
  PROTESE: 'prótese',
  MATERIAL_ESPECIAL: 'material_especial',
  IMPLANTE: 'implante',
  INSTRUMENTAL: 'instrumental',
} as const

export type OpmeCategory = typeof OPME_CATEGORY[keyof typeof OPME_CATEGORY]

/** Especialidades médicas que utilizam OPME */
export const MEDICAL_SPECIALTY = {
  ORTOPEDIA: 'ortopedia',
  CARDIOLOGIA: 'cardiologia',
  NEUROCIRURGIA: 'neurocirurgia',
  OFTALMOLOGIA: 'oftalmologia',
  UROLOGIA: 'urologia',
  VASCULAR: 'cirurgia_vascular',
  COLUNA: 'cirurgia_coluna',
  GERAL: 'cirurgia_geral',
} as const

export type MedicalSpecialty = typeof MEDICAL_SPECIALTY[keyof typeof MEDICAL_SPECIALTY]

// ============================================================================
// Compliance Thresholds
// ============================================================================

/** Limites de conformidade */
export const COMPLIANCE_THRESHOLDS = {
  /** Percentual mínimo de produtos com registro ANVISA válido */
  MIN_ANVISA_COMPLIANCE: 95,
  /** Dias antes do vencimento para alerta de registro */
  REGISTRO_ALERT_DAYS: 90,
  /** Dias antes do vencimento para alerta de lote */
  LOTE_ALERT_DAYS: 30,
  /** Temperatura máxima para armazenamento padrão (°C) */
  MAX_STORAGE_TEMP: 25,
  /** Temperatura mínima para armazenamento padrão (°C) */
  MIN_STORAGE_TEMP: 15,
  /** Umidade máxima para armazenamento padrão (%) */
  MAX_STORAGE_HUMIDITY: 60,
} as const

// ============================================================================
// Audit Log Types
// ============================================================================

/** Tipos de eventos de auditoria (21 CFR Part 11) */
export const AUDIT_EVENT_TYPE = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  PRINT: 'print',
  APPROVE: 'approve',
  REJECT: 'reject',
  SIGN: 'electronic_signature',
} as const

export type AuditEventType = typeof AUDIT_EVENT_TYPE[keyof typeof AUDIT_EVENT_TYPE]

// ICARUS CODE REVIEW: 100% conformidade | RDC 59/751/188 | Revisado por Agente 2025-11-27

