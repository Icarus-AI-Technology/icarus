/**
 * Validações Oficiais CFM/CRM/TISS - Zod Schemas
 * 
 * ICARUS v5.1 - Conformidade:
 * - RN 506 ANS (TISS - Troca de Informações em Saúde Suplementar)
 * - Portaria MS 1.820/2009 (Carta de Direitos dos Usuários)
 */

import { z } from 'zod'
import { registroAnvisaSchema } from './anvisa.schema'

// ==================== ESTADOS BRASILEIROS ====================

export const EstadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

export type EstadoBrasileiro = typeof EstadosBrasileiros[number]

// ==================== VALIDAÇÕES CFM/CRM ====================

/**
 * 1. CRM - Conselho Regional de Medicina
 * Formato: UF + 4-8 dígitos (ex: SP123456, RJ12345678)
 */
export const crmSchema = z
  .string()
  .transform(val => val.toUpperCase().replace(/\s/g, ''))
  .refine((crm) => {
    const regex = /^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\d{4,8}$/
    return regex.test(crm)
  }, 'CRM inválido (formato: UF + 4-8 dígitos, ex: SP123456)')

/**
 * 2. RQE - Registro de Qualificação de Especialista
 * 4-8 dígitos numéricos
 */
export const rqeSchema = z
  .string()
  .regex(/^\d{4,8}$/, 'RQE deve ter entre 4 e 8 dígitos')
  .optional()
  .or(z.literal(''))

/**
 * 3. CNS - Cartão Nacional de Saúde (Cartão SUS)
 * 15 dígitos com validação de dígito verificador
 */
export const cnsSchema = z
  .string()
  .length(15, 'CNS deve ter 15 dígitos')
  .regex(/^\d{15}$/, 'CNS deve conter apenas números')
  .refine((cns) => {
    // Validação do dígito verificador do CNS
    const pesos = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    let soma = 0
    for (let i = 0; i < 15; i++) {
      soma += parseInt(cns[i]) * pesos[i]
    }
    return soma % 11 === 0
  }, 'CNS inválido (dígito verificador incorreto)')

/**
 * 4. CID-10 - Classificação Internacional de Doenças
 * Formato: Letra + 2-4 dígitos (ex: I21, I21.0, I21.01)
 */
export const cid10Schema = z
  .string()
  .transform(val => val.toUpperCase().replace(/\s/g, ''))
  .refine((cid) => {
    const regex = /^[A-Z]\d{2}(\.\d{1,2})?$/
    return regex.test(cid)
  }, 'CID-10 inválido (formato: Letra + 2-4 dígitos, ex: I21 ou I21.0)')

/**
 * 5. TUSS - Terminologia Unificada da Saúde Suplementar
 * 8 dígitos numéricos (código de procedimento ANS)
 */
export const tussSchema = z
  .string()
  .length(8, 'Código TUSS deve ter 8 dígitos')
  .regex(/^\d{8}$/, 'Código TUSS deve conter apenas números')

/**
 * 6. CBHPM - Classificação Brasileira Hierarquizada de Procedimentos Médicos
 * Formato: X.XX.XX.XX-X (ex: 3.01.01.01-1)
 */
export const cbhpmSchema = z
  .string()
  .regex(/^\d\.\d{2}\.\d{2}\.\d{2}-\d$/, 'Código CBHPM inválido (formato: X.XX.XX.XX-X)')

/**
 * 7. Data de Nascimento (não pode ser no futuro)
 */
export const dataNascimentoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
  .refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date <= new Date()
  }, 'Data de nascimento não pode ser no futuro')

/**
 * 8. Data de Cirurgia/Procedimento (não pode ser no passado para agendamentos)
 */
export const dataCirurgiaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
  .refine((val) => {
    const date = new Date(val)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    return !isNaN(date.getTime()) && date >= hoje
  }, 'Data da cirurgia não pode ser no passado')

/**
 * 9. Hora (formato HH:MM)
 */
export const horaSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora inválida (formato: HH:MM)')

/**
 * 10. Sexo biológico (para fins médicos)
 */
export const sexoSchema = z.enum(['M', 'F', 'I'], {
  required_error: 'Sexo é obrigatório',
  invalid_type_error: 'Sexo inválido (M, F ou I)',
})

/**
 * 11. Tipo Sanguíneo
 */
export const tipoSanguineoSchema = z.enum([
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
], {
  required_error: 'Tipo sanguíneo é obrigatório',
})

/**
 * 12. Alergia
 */
export const alergiaSchema = z.object({
  substancia: z.string().min(2, 'Nome da substância muito curto'),
  tipo: z.enum(['MEDICAMENTO', 'ALIMENTO', 'AMBIENTAL', 'CONTATO', 'OUTRO']),
  gravidade: z.enum(['LEVE', 'MODERADA', 'GRAVE', 'ANAFILAXIA']),
  observacoes: z.string().max(500).optional(),
})

// ==================== SCHEMAS COMPOSTOS ====================

/**
 * Paciente para rastreabilidade OPME
 */
export const pacienteSchema = z.object({
  nome_completo: z.string().min(5, 'Nome muito curto').max(200),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  cns: cnsSchema.optional(),
  data_nascimento: dataNascimentoSchema,
  sexo: sexoSchema,
  tipo_sanguineo: tipoSanguineoSchema.optional(),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  endereco: z.string().max(300).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.enum(EstadosBrasileiros).optional(),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos').optional(),
  convenio: z.string().max(100).optional(),
  numero_carteirinha: z.string().max(50).optional(),
  alergias: z.array(alergiaSchema).optional(),
  observacoes: z.string().max(1000).optional(),
})

/**
 * Médico completo com validações CRM
 */
export const medicoSchema = z.object({
  nome_completo: z.string().min(5, 'Nome muito curto').max(200),
  crm: crmSchema,
  crm_estado: z.enum(EstadosBrasileiros),
  rqe: rqeSchema,
  especialidade: z.string().min(3, 'Especialidade muito curta').max(100),
  subespecialidade: z.string().max(100).optional(),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
  celular: z.string().regex(/^\d{11}$/, 'Celular inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  hospital_principal: z.string().uuid().optional(),
})

/**
 * Cirurgia/Procedimento com validações ANVISA + CRM
 */
export const cirurgiaSchema = z.object({
  paciente_id: z.string().uuid('ID do paciente inválido'),
  medico_id: z.string().uuid('ID do médico inválido').optional(),
  medico_crm: crmSchema,
  hospital_id: z.string().uuid('ID do hospital inválido').optional(),
  
  // Códigos clínicos
  cid10_principal: cid10Schema,
  cid10_secundarios: z.array(cid10Schema).optional(),
  codigo_tuss: tussSchema.optional(),
  codigo_cbhpm: cbhpmSchema.optional(),
  
  // Datas e horários
  data_cirurgia: dataCirurgiaSchema,
  hora_inicio: horaSchema.optional(),
  hora_fim: horaSchema.optional(),
  sala_cirurgica: z.string().max(50).optional(),
  
  // Materiais OPME
  materiais_opme: z.array(z.object({
    registro_anvisa: registroAnvisaSchema,
    descricao: z.string().min(5),
    quantidade: z.number().int().positive('Quantidade deve ser positiva'),
    lote: z.string().optional(),
    validade: z.string().optional(),
  })).optional(),
  
  // Status e valores
  status: z.enum(['agendada', 'confirmada', 'em_andamento', 'concluida', 'cancelada']).default('agendada'),
  valor_total_cents: z.number().int().min(0).optional(),
  
  observacoes: z.string().max(2000).optional(),
})

// ==================== TYPES ====================

export type Paciente = z.infer<typeof pacienteSchema>
export type Medico = z.infer<typeof medicoSchema>
export type Cirurgia = z.infer<typeof cirurgiaSchema>
export type Alergia = z.infer<typeof alergiaSchema>

// ==================== HELPERS ====================

/**
 * Formata CRM para exibição
 */
export function formatCRM(crm: string): string {
  const upper = crm.toUpperCase().replace(/\s/g, '')
  const estado = upper.slice(0, 2)
  const numero = upper.slice(2)
  return `CRM/${estado} ${numero}`
}

/**
 * Extrai UF do CRM
 */
export function extrairUFdoCRM(crm: string): EstadoBrasileiro | null {
  const upper = crm.toUpperCase().replace(/\s/g, '')
  const uf = upper.slice(0, 2) as EstadoBrasileiro
  return EstadosBrasileiros.includes(uf) ? uf : null
}

/**
 * Formata CID-10 para exibição
 */
export function formatCID10(cid: string): string {
  const upper = cid.toUpperCase().replace(/\s/g, '')
  if (upper.length === 3) return upper
  if (upper.length === 4) return `${upper.slice(0, 3)}.${upper.slice(3)}`
  return upper
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mesAtual = hoje.getMonth()
  const mesNascimento = nascimento.getMonth()
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  
  return idade
}
