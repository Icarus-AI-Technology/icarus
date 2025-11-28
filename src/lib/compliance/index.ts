/**
 * ICARUS v5.0 - Compliance Module
 * 
 * Módulo central de conformidade regulatória para OPME.
 * Integra ANVISA, ISO 42001 AIMS, LGPD e outras normas.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

// ANVISA Compliance
export {
  AnvisaRegistrationSchema,
  TraceabilityRecordSchema,
  AdverseEventSchema,
  RecallSchema,
  validateAnvisaRegistration,
  validateNCMIsencao,
  isProductValid,
  daysUntilExpiration,
  getProductRiskClass,
  requiresImmediateNotification,
  checkAnvisaCompliance,
  generateTraceabilityReport,
  generateTechnovigilanceReport,
  type AnvisaRegistration,
  type TraceabilityRecord,
  type AdverseEvent,
  type Recall,
  type AnvisaComplianceResult
} from './anvisa'

// ISO 42001 AIMS Compliance
export {
  AISystemSchema,
  AIImpactAssessmentSchema,
  AIControlSchema,
  AIAuditSchema,
  AIMetricsSchema,
  calculateRiskScore,
  assessISO42001Compliance,
  createImpactAssessmentTemplate,
  evaluateAIMetrics,
  type AISystem,
  type AIImpactAssessment,
  type AIControl,
  type AIAudit,
  type AIMetrics,
  type RiskMatrix,
  type ISO42001ComplianceResult
} from './iso-42001'

// LGPD Compliance
export {
  DataSubjectSchema,
  ConsentSchema,
  DataSubjectRequestSchema,
  DataProcessingActivitySchema,
  DataBreachSchema,
  isConsentValid,
  daysUntilConsentExpiration,
  getLegalBasis,
  getDataSubjectRight,
  containsSensitiveData,
  calculateRequestDeadline,
  isRequestOverdue,
  getTimeRemaining,
  assessLGPDCompliance,
  generateDataMappingReport,
  type DataSubject,
  type Consent,
  type DataSubjectRequest,
  type DataProcessingActivity,
  type DataBreach,
  type LGPDComplianceResult
} from './lgpd'

// Constants
export {
  ANVISA_PRODUCT_CLASSES,
  ANVISA_REGULATIONS,
  ANVISA_DOCUMENT_TYPES,
  ISO_42001_CLAUSES,
  ISO_42001_CONTROLS,
  LGPD_LEGAL_BASES,
  LGPD_DATA_SUBJECT_RIGHTS,
  LGPD_SENSITIVE_DATA_CATEGORIES,
  CFM_SPECIALTIES,
  NCM_ISENCOES_OPME,
  AUDIT_TYPES,
  COMPLIANCE_STATUS,
  RISK_LEVELS
} from './constants'

// Validators
export {
  isValidCPF,
  isValidCNPJ,
  isValidCRM,
  isValidCNES,
  isValidAnvisaRegistration as isValidAnvisaReg,
  isValidEmail,
  isValidPhone,
  isValidCEP,
  isValidBrazilianDate,
  isValidNCM,
  isValidGTIN,
  isValidDocument,
  CPFSchema,
  CNPJSchema,
  CRMSchema,
  CNESSchema,
  AnvisaRegistrationSchema as AnvisaRegSchema,
  EmailSchema,
  PhoneSchema,
  CEPSchema,
  NCMSchema,
  GTINSchema,
  DocumentSchema,
  formatCPF,
  formatCNPJ,
  formatCRM,
  formatPhone,
  formatCEP,
  formatNCM
} from './validators'

// Hooks
export {
  useAnvisaCompliance,
  useISO42001Compliance,
  useLGPDCompliance,
  useValidation,
  useConsentManagement,
  useDataSubjectRequests,
  useComplianceDashboard,
  type UseAnvisaComplianceResult,
  type UseISO42001ComplianceResult,
  type UseLGPDComplianceResult,
  type UseValidationResult,
  type UseConsentManagementResult,
  type UseDataSubjectRequestsResult,
  type UseComplianceDashboardResult,
  type ComplianceDashboardData,
  type ValidationType
} from './hooks'

// Training & Certification
export {
  complianceTraining,
  useComplianceTraining,
  TRAINING_MODULES,
  type TrainingModule,
  type TrainingCategory,
  type TrainingContent,
  type QuizQuestion,
  type QuizOption,
  type UserTrainingProgress,
  type QuizAttempt,
  type Certificate
} from './training-certification'

// ANVISA/RDC Training Modules
export {
  ANVISA_TRAINING_MODULES,
  getAnvisaTrainingModules,
  getAnvisaModuleById,
  getRequiredAnvisaModules,
  getTotalTrainingHours
} from './training-rdc-modules'
