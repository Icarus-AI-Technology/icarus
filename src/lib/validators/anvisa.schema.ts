/**
 * Validações Oficiais ANVISA - Zod Schemas
 * 
 * ICARUS v5.1 - Conformidade RDC 751/2022, RDC 59/2008, RDC 185/2001
 * 
 * Este arquivo contém TODAS as validações regulatórias ANVISA
 * para produtos OPME, dispositivos médicos e rastreabilidade.
 */

import { z } from 'zod'

// ==================== REGRAS OFICIAIS ANVISA (2025) ====================

/**
 * 1. Registro ANVISA (13 dígitos) – RDC 751/2022 e RDC 185/2001
 * Formato: XXXXXXXXXXX-X (13 dígitos numéricos)
 */
export const registroAnvisaSchema = z
  .string()
  .length(13, 'Registro ANVISA deve ter exatamente 13 dígitos')
  .regex(/^\d{13}$/, 'Apenas números, sem pontos ou barras')

/**
 * 2. Classe de Risco OPME – RDC 751/2022
 * I: Baixo risco (ex: luvas, seringas)
 * II: Médio risco (ex: cateteres, agulhas)
 * III: Alto risco (ex: stents, válvulas)
 * IV: Máximo risco (ex: marca-passos, desfibriladores implantáveis)
 */
export const classeRiscoOpmeSchema = z.enum(['I', 'II', 'III', 'IV'], {
  required_error: 'Classe de risco obrigatória',
  invalid_type_error: 'Classe de risco inválida (deve ser I, II, III ou IV)',
})

export type ClasseRiscoOPME = z.infer<typeof classeRiscoOpmeSchema>

/**
 * 3. Número de Lote – Padrões do mercado OPME
 * Aceita letras maiúsculas, números, hífen e underscore
 */
export const loteSchema = z
  .string()
  .min(3, 'Lote muito curto (mínimo 3 caracteres)')
  .max(30, 'Lote muito longo (máximo 30 caracteres)')
  .regex(/^[A-Z0-9\-_]+$/, 'Lote só aceita letras maiúsculas, números, - e _')

/**
 * 4. Data de Validade (formato brasileiro DD/MM/AAAA)
 * Valida formato E se a data não está no passado
 */
export const dataValidadeSchema = z
  .string()
  .refine((val) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!regex.test(val)) return false
    const [dia, mes, ano] = val.split('/').map(Number)
    const date = new Date(ano, mes - 1, dia)
    return date.getDate() === dia && date.getMonth() === mes - 1 && date.getFullYear() === ano
  }, 'Data inválida (use DD/MM/AAAA)')
  .refine((val) => {
    const [dia, mes, ano] = val.split('/').map(Number)
    const date = new Date(ano, mes - 1, dia)
    return date > new Date()
  }, 'Data de validade não pode ser no passado')

/**
 * 4b. Data de Validade (formato ISO YYYY-MM-DD) - para banco de dados
 */
export const dataValidadeISOSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
  .refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Data inválida')
  .refine((val) => {
    const date = new Date(val)
    return date > new Date()
  }, 'Data de validade não pode ser no passado')

/**
 * 5. Preço em centavos (evita problemas com float)
 * Aceita string formatada "1.234,56" e converte para centavos (123456)
 */
export const precoCentsSchema = z
  .string()
  .transform((val) => {
    const cleaned = val.replace(/[^\d,]/g, '').replace(',', '.')
    return Math.round(parseFloat(cleaned) * 100)
  })
  .refine((val) => val > 0, 'Preço deve ser maior que zero')
  .pipe(z.number().int().positive())

/**
 * 5b. Preço em centavos (já como número)
 */
export const precoCentsNumberSchema = z
  .number()
  .int('Preço deve ser um número inteiro (centavos)')
  .positive('Preço deve ser positivo')

/**
 * 6. CNPJ válido (com cálculo de dígito verificador)
 * Aceita com ou sem formatação
 */
export const cnpjSchema = z.string().refine((cnpj) => {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  
  // Rejeita CNPJs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleaned)) return false
  
  // Algoritmo oficial de validação CNPJ
  let tamanho = cleaned.length - 2
  let numeros = cleaned.substring(0, tamanho)
  const digitos = cleaned.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7
  
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== Number(digitos.charAt(0))) return false
  
  tamanho += 1
  numeros = cleaned.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  return resultado === Number(digitos.charAt(1))
}, 'CNPJ inválido')

/**
 * 7. CPF válido (com cálculo de dígito verificador)
 * Aceita com ou sem formatação
 */
export const cpfSchema = z.string().refine((cpf) => {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  
  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false
  
  // Primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number(cleaned[i]) * (10 - i)
  }
  let digito = (soma * 10) % 11
  if (digito === 10 || digito === 11) digito = 0
  if (digito !== Number(cleaned[9])) return false
  
  // Segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number(cleaned[i]) * (11 - i)
  }
  digito = (soma * 10) % 11
  if (digito === 10 || digito === 11) digito = 0
  return digito === Number(cleaned[10])
}, 'CPF inválido')

/**
 * 8. Código de Barras EAN-13 (GTIN) – comum em OPME importados
 * Valida dígito verificador
 */
export const ean13Schema = z
  .string()
  .length(13, 'EAN-13 deve ter 13 dígitos')
  .regex(/^\d{13}$/, 'Apenas números')
  .refine((ean) => {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += Number(ean[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const check = (10 - (sum % 10)) % 10
    return check === Number(ean[12])
  }, 'Dígito verificador EAN-13 inválido')

/**
 * 9. NCM - Nomenclatura Comum do Mercosul (8 dígitos)
 */
export const ncmSchema = z
  .string()
  .length(8, 'NCM deve ter 8 dígitos')
  .regex(/^\d{8}$/, 'NCM deve conter apenas números')

/**
 * 10. CEP brasileiro (8 dígitos)
 */
export const cepSchema = z
  .string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 8, 'CEP deve ter 8 dígitos')

/**
 * 11. Telefone brasileiro (10 ou 11 dígitos)
 */
export const telefoneSchema = z
  .string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 10 || val.length === 11, 'Telefone deve ter 10 ou 11 dígitos')

/**
 * 12. Celular brasileiro (11 dígitos, começando com 9)
 */
export const celularSchema = z
  .string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 11 && val[2] === '9', 'Celular deve ter 11 dígitos e começar com 9')

/**
 * 13. Email válido
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email muito longo')

/**
 * 14. Inscrição Estadual
 */
export const inscricaoEstadualSchema = z
  .string()
  .min(8, 'Inscrição Estadual muito curta')
  .max(14, 'Inscrição Estadual muito longa')
  .regex(/^[0-9./-]+$/, 'Inscrição Estadual inválida')

/**
 * 15. Chave de Acesso NF-e (44 dígitos)
 */
export const chaveNFeSchema = z
  .string()
  .length(44, 'Chave de acesso deve ter 44 dígitos')
  .regex(/^\d{44}$/, 'Chave de acesso deve conter apenas números')

/**
 * 16. CFOP - Código Fiscal de Operações e Prestações
 */
export const cfopSchema = z
  .string()
  .length(4, 'CFOP deve ter 4 dígitos')
  .regex(/^[1-7]\d{3}$/, 'CFOP inválido')

// ==================== SCHEMAS COMPOSTOS ====================

/**
 * Produto OPME completo com validações ANVISA
 */
export const produtoOpmeAnvisaSchema = z.object({
  registro_anvisa: registroAnvisaSchema,
  descricao: z.string().min(10, 'Descrição muito curta').max(500, 'Descrição muito longa'),
  fabricante_cnpj: cnpjSchema,
  classe_risco: classeRiscoOpmeSchema,
  lote: loteSchema.optional(),
  validade: dataValidadeISOSchema.optional(),
  preco_tabela_cents: precoCentsNumberSchema,
  gtin_ean13: ean13Schema.optional(),
  ncm: ncmSchema.optional(),
})

/**
 * NF-e / Faturamento com validações fiscais
 */
export const nfeAnvisaSchema = z.object({
  emitente_cnpj: cnpjSchema,
  destinatario_cnpj_cpf: z.union([cnpjSchema, cpfSchema]),
  numero_nfe: z.string().regex(/^\d{1,9}$/, 'Número da NF-e inválido'),
  serie: z.string().regex(/^\d{1,3}$/, 'Série inválida'),
  chave_acesso: chaveNFeSchema.optional(),
  cfop: cfopSchema.optional(),
  data_emissao: z.string().datetime(),
  valor_total_cents: precoCentsNumberSchema,
})

// ==================== HELPERS ====================

/**
 * Formata CNPJ para exibição
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

/**
 * Formata CEP para exibição
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

/**
 * Formata telefone para exibição
 */
export function formatTelefone(telefone: string): string {
  const cleaned = telefone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }
  return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
}

/**
 * Formata preço de centavos para reais
 */
export function formatPreco(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Converte data brasileira para ISO
 */
export function dataBRtoISO(dataBR: string): string {
  const [dia, mes, ano] = dataBR.split('/')
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
}

/**
 * Converte data ISO para brasileira
 */
export function dataISOtoBR(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

/**
 * Verifica se produto é de alto risco (Classe III ou IV)
 */
export function isAltoRisco(classeRisco: ClasseRiscoOPME): boolean {
  return classeRisco === 'III' || classeRisco === 'IV'
}

/**
 * Calcula dias até vencimento
 */
export function diasParaVencimento(dataValidade: string): number {
  const validade = new Date(dataValidade)
  const hoje = new Date()
  const diff = validade.getTime() - hoje.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Verifica se produto está próximo do vencimento (30 dias)
 */
export function isProximoVencimento(dataValidade: string, diasAlerta = 30): boolean {
  return diasParaVencimento(dataValidade) <= diasAlerta
}

