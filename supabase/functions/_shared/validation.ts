/**
 * ICARUS v5.0 - Shared Input Validation
 *
 * Uses Zod for schema validation
 * Includes guardrails for prompt injection protection
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// =====================================================
// COMMON SCHEMAS
// =====================================================

export const UUIDSchema = z.string().uuid();

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// =====================================================
// CHAT SCHEMAS
// =====================================================

export const ChatContextSchema = z.object({
  empresaId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  currentPage: z.string().max(200).optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
  context: ChatContextSchema.optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// =====================================================
// RESEARCH SCHEMAS
// =====================================================

export const ResearchRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  maxSources: z.number().int().min(1).max(10).default(5),
  language: z.string().max(10).default('pt-BR'),
  empresaId: z.string().uuid().optional(),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

// =====================================================
// COMPLIANCE SCHEMAS
// =====================================================

export const ComplianceCheckRequestSchema = z.object({
  tipo: z.enum(['produto', 'cirurgia', 'lote', 'processo']),
  dados: z.record(z.unknown()),
  empresaId: z.string().uuid().optional(),
});

export type ComplianceCheckRequest = z.infer<typeof ComplianceCheckRequestSchema>;

// =====================================================
// LEAD EMAIL SCHEMAS
// =====================================================

export const LeadEmailSchema = z.object({
  nome_completo: z.string().min(2).max(200),
  email: z.string().email().max(254),
  telefone: z.string().min(8).max(20),
  empresa: z.string().min(1).max(200),
  cargo: z.string().max(100).optional(),
  tamanho_empresa: z.string().max(50).optional(),
  segmento: z.string().max(100).optional(),
  principal_desafio: z.string().max(500).optional(),
  interesse_em: z.array(z.string().max(100)).max(10).optional(),
  como_conheceu: z.string().max(100).optional(),
  mensagem: z.string().max(2000).optional(),
});

export type LeadEmail = z.infer<typeof LeadEmailSchema>;

// =====================================================
// SECURITY: PROMPT INJECTION PROTECTION
// =====================================================

const PROMPT_INJECTION_PATTERNS = [
  /ignore.*previous.*instructions/i,
  /ignore.*all.*previous/i,
  /you.*are.*now/i,
  /forget.*everything/i,
  /forget.*your.*instructions/i,
  /reveal.*system.*prompt/i,
  /show.*me.*your.*prompt/i,
  /what.*is.*your.*system.*prompt/i,
  /print.*your.*instructions/i,
  /disregard.*previous/i,
  /override.*instructions/i,
  /new.*instructions/i,
  /act.*as.*if/i,
  /pretend.*you.*are/i,
  /roleplay.*as/i,
  /jailbreak/i,
  /dan.*mode/i,
  /developer.*mode/i,
];

const PROHIBITED_TOPICS = [
  'senha',
  'password',
  'token',
  'secret',
  'api_key',
  'apikey',
  'chave.*api',
  'service.*role',
  'supabase.*key',
];

/**
 * Validate input for potential prompt injection attacks
 */
export function validatePromptSecurity(input: string): {
  valid: boolean;
  reason?: string;
} {
  const lowerInput = input.toLowerCase();

  // Check for injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        valid: false,
        reason: 'Input contains potentially harmful pattern',
      };
    }
  }

  // Check for prohibited topics
  for (const topic of PROHIBITED_TOPICS) {
    const topicRegex = new RegExp(topic, 'i');
    if (topicRegex.test(lowerInput)) {
      return {
        valid: false,
        reason: 'Input contains restricted topic',
      };
    }
  }

  return { valid: true };
}

// =====================================================
// SECURITY: PII FILTERING
// =====================================================

const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // CPF
  { pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}/g, replacement: '[CPF REDACTED]' },
  // CNPJ
  { pattern: /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, replacement: '[CNPJ REDACTED]' },
  // Credit card
  { pattern: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, replacement: '[CARD REDACTED]' },
  // Phone numbers (BR)
  { pattern: /\(\d{2}\)\s?\d{4,5}-?\d{4}/g, replacement: '[PHONE REDACTED]' },
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL REDACTED]' },
];

/**
 * Remove PII from output text
 */
export function sanitizePII(output: string): string {
  let sanitized = output;
  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

// =====================================================
// SECURITY: HTML SANITIZATION (for emails)
// =====================================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T extends z.ZodType>(
  req: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; errors: z.ZodError }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, errors: result.error };
  } catch {
    return {
      success: false,
      errors: new z.ZodError([
        {
          code: 'custom',
          path: [],
          message: 'Invalid JSON body',
        },
      ]),
    };
  }
}
