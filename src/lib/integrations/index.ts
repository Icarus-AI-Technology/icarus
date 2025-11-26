/**
 * ICARUS v5.0 - Integrations Index
 * Export all integration clients and types
 */

// Types
export * from './types';

// API Client Base
export { APIClient, APICache } from './api-client';

// Microsoft 365
export {
  Microsoft365Client,
  microsoft365,
  isMicrosoftConfigured,
  MICROSOFT_SCOPES,
} from './microsoft365';

// Pluggy (Open Banking)
export { PluggyClient, pluggy, isPluggyConfigured } from './pluggy';

// SEFAZ (NF-e)
export { SefazClient, createSefazClient, isSefazConfigured } from './sefaz';

// ANVISA
export { AnvisaClient, anvisa } from './anvisa';

// Brazilian APIs
export {
  ViaCepClient,
  BrasilApiClient,
  CfmClient,
  viaCep,
  brasilApi,
  cfm,
} from './brasil-apis';

// Validators
export {
  getEnvConfig,
  validateMicrosoft365,
  validatePluggy,
  validateSefaz,
  validateAnvisa,
  validateOtherApis,
  calculateCategoryScore,
  runFullAudit,
} from './validators';
