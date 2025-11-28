/**
 * Schema de Validação - Produtos OPME
 * 
 * ICARUS v5.1 - Conformidade ANVISA RDC 751/2022
 * 
 * Este schema garante:
 * - Validação em tempo de execução com Zod
 * - Conformidade automática com regulamentações ANVISA
 * - Types TypeScript derivados automaticamente
 * - Defesa em profundidade (frontend + backend)
 */

import { z } from 'zod'

// ============================================
// ENUMS REGULATÓRIOS (const assertions)
// ============================================

/**
 * Classes de Risco ANVISA - RDC 751/2022
 * Classe I: Baixo risco
 * Classe II: Médio risco
 * Classe III: Alto risco
 * Classe IV: Máximo risco (implantes, equipamentos de suporte à vida)
 */
export const OpmeRiskClass = ['I', 'II', 'III', 'IV'] as const
export type OpmeRiskClassType = typeof OpmeRiskClass[number]

/**
 * Status do Produto
 */
export const OpmeStatus = ['ATIVO', 'INATIVO', 'SUSPENSO', 'VENCIDO'] as const
export type OpmeStatusType = typeof OpmeStatus[number]

/**
 * Unidades de Medida
 */
export const UnidadeMedida = ['UN', 'CX', 'KIT', 'PC', 'PAR', 'FR', 'AMP', 'ML', 'G'] as const
export type UnidadeMedidaType = typeof UnidadeMedida[number]

// ============================================
// SCHEMAS ZOD
// ============================================

/**
 * Schema para criação de novo Produto OPME
 * Validação completa conforme RDC 59/2008 e RDC 751/2022
 */
export const insertProdutoOpmeSchema = z.object({
  // Identificação ANVISA
  registro_anvisa: z
    .string()
    .regex(/^\d{13}$/, 'Registro ANVISA deve ter exatamente 13 dígitos numéricos')
    .describe('Número de registro ANVISA do produto'),
  
  // Descrição do Produto
  descricao: z
    .string()
    .min(5, 'Descrição deve ter no mínimo 5 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .describe('Descrição completa do produto OPME'),
  
  // Fabricante
  fabricante: z
    .string()
    .min(2, 'Nome do fabricante deve ter no mínimo 2 caracteres')
    .max(200, 'Nome do fabricante deve ter no máximo 200 caracteres')
    .describe('Nome do fabricante do produto'),
  
  // Modelo
  modelo: z
    .string()
    .min(1, 'Modelo é obrigatório')
    .max(100, 'Modelo deve ter no máximo 100 caracteres')
    .describe('Modelo/referência do produto'),
  
  // Classificação de Risco
  classe_risco: z
    .enum(OpmeRiskClass, {
      required_error: 'Classe de risco é obrigatória',
      invalid_type_error: 'Classe de risco inválida',
    })
    .describe('Classe de risco ANVISA (I, II, III ou IV)'),
  
  // Preço em centavos (evita problemas com float)
  preco_tabela_cents: z
    .number()
    .int('Preço deve ser um número inteiro (centavos)')
    .positive('Preço deve ser positivo')
    .describe('Preço de tabela em centavos (R$ 100,00 = 10000)'),
  
  // Quantidade em Estoque
  quantidade_estoque: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa')
    .default(0)
    .describe('Quantidade atual em estoque'),
  
  // Campos opcionais
  codigo_ean: z
    .string()
    .regex(/^\d{13}$/, 'Código EAN deve ter 13 dígitos')
    .optional()
    .describe('Código de barras EAN-13'),
  
  codigo_interno: z
    .string()
    .max(50, 'Código interno deve ter no máximo 50 caracteres')
    .optional()
    .describe('Código interno do produto'),
  
  unidade_medida: z
    .enum(UnidadeMedida)
    .default('UN')
    .describe('Unidade de medida'),
  
  ncm: z
    .string()
    .regex(/^\d{8}$/, 'NCM deve ter 8 dígitos')
    .optional()
    .describe('Código NCM para nota fiscal'),
  
  lote: z
    .string()
    .max(50, 'Lote deve ter no máximo 50 caracteres')
    .optional()
    .describe('Número do lote'),
  
  validade: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
    .describe('Data de validade do produto'),
  
  observacoes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .describe('Observações adicionais'),
  
  status: z
    .enum(OpmeStatus)
    .default('ATIVO')
    .describe('Status do produto'),
  
  // Rastreabilidade
  fornecedor_id: z
    .string()
    .uuid('ID do fornecedor inválido')
    .optional()
    .describe('ID do fornecedor principal'),
  
  categoria_id: z
    .string()
    .uuid('ID da categoria inválido')
    .optional()
    .describe('ID da categoria do produto'),
})

/**
 * Schema para produto OPME completo (com campos do banco)
 */
export const selectProdutoOpmeSchema = insertProdutoOpmeSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  tenant_id: z.string().uuid().optional(),
})

/**
 * Schema para atualização parcial
 */
export const updateProdutoOpmeSchema = insertProdutoOpmeSchema.partial()

/**
 * Schema para busca/filtros
 */
export const searchProdutoOpmeSchema = z.object({
  query: z.string().optional(),
  classe_risco: z.enum(OpmeRiskClass).optional(),
  status: z.enum(OpmeStatus).optional(),
  fabricante: z.string().optional(),
  estoque_minimo: z.number().optional(),
  estoque_maximo: z.number().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// ============================================
// TYPES TYPESCRIPT (derivados do Zod)
// ============================================

export type ProdutoOpme = z.infer<typeof selectProdutoOpmeSchema>
export type NovoProdutoOpme = z.infer<typeof insertProdutoOpmeSchema>
export type UpdateProdutoOpme = z.infer<typeof updateProdutoOpmeSchema>
export type SearchProdutoOpme = z.infer<typeof searchProdutoOpmeSchema>

// ============================================
// HELPERS DE VALIDAÇÃO
// ============================================

/**
 * Valida um produto OPME para inserção
 * @throws ZodError se inválido
 */
export function validateNovoProdutoOpme(data: unknown): NovoProdutoOpme {
  return insertProdutoOpmeSchema.parse(data)
}

/**
 * Valida parcialmente um produto OPME para atualização
 * @throws ZodError se inválido
 */
export function validateUpdateProdutoOpme(data: unknown): UpdateProdutoOpme {
  return updateProdutoOpmeSchema.parse(data)
}

/**
 * Verifica se um produto é de alto risco (Classe III ou IV)
 */
export function isHighRiskProduct(classeRisco: OpmeRiskClassType): boolean {
  return classeRisco === 'III' || classeRisco === 'IV'
}

/**
 * Converte preço de centavos para reais formatado
 */
export function formatPrecoFromCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Converte preço de reais para centavos
 */
export function parsePrecoToCents(value: string | number): number {
  if (typeof value === 'number') return Math.round(value * 100)
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
  return Math.round(parseFloat(cleaned) * 100)
}

