/**
 * Schemas NF-e OPME - Validações para Distribuidora
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME (Cliente RJ)
 * Conformidade: SEFAZ, RDC 59/751/752 ANVISA
 * 
 * Regras especiais:
 * - Soma automática de itens iguais (SKU + Lote + Validade)
 * - Registro ANVISA obrigatório para classe III/IV
 * - Rastreabilidade completa de lotes
 */

import { z } from 'zod'
import { 
  registroAnvisaSchema, 
  loteSchema, 
  cnpjSchema,
} from './anvisa.schema'

// ==================== SCHEMAS NF-e OPME ====================

/**
 * Item de NF-e com validações OPME
 */
export const nfeItemOpmeSchema = z.object({
  codigo_produto: z.string().min(1, 'Código do produto obrigatório'),
  descricao: z.string().min(3, 'Descrição obrigatória'),
  ncm: z.string().optional(),
  gtin: z.string().optional(),
  lote: loteSchema,
  validade: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA'),
  registro_anvisa: registroAnvisaSchema,
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
  valor_unitario: z.number().positive('Valor unitário deve ser positivo'),
})

export type NFeItemOPME = z.infer<typeof nfeItemOpmeSchema>

/**
 * NF-e de Entrada (compra de fornecedor)
 * Com soma automática de itens iguais (SKU + Lote + Validade)
 */
export const nfeEntradaSchema = z.object({
  chave: z.string().length(44, 'Chave NF-e deve ter 44 dígitos'),
  fornecedor_cnpj: cnpjSchema,
  itens: z.array(nfeItemOpmeSchema).transform((itens) => {
    // SOMA AUTOMÁTICA DE ITENS COM MESMO SKU + LOTE + VALIDADE
    const mapa = new Map<string, NFeItemOPME>()
    itens.forEach(item => {
      const chave = `${item.codigo_produto}-${item.lote}-${item.validade}`
      if (mapa.has(chave)) {
        const existing = mapa.get(chave)!
        existing.quantidade += item.quantidade
      } else {
        mapa.set(chave, { ...item })
      }
    })
    return Array.from(mapa.values())
  }),
  info_complementares: z.string().max(5000).optional(),
})

export type NFeEntrada = z.infer<typeof nfeEntradaSchema>

/**
 * NF-e de Saída (venda para hospital/cliente)
 */
export const nfeSaidaSchema = z.object({
  cliente_cnpj: cnpjSchema,
  cliente_razao_social: z.string().min(5).max(200),
  itens: z.array(nfeItemOpmeSchema).transform((itens) => {
    // Mesma lógica de agrupamento
    const mapa = new Map<string, NFeItemOPME>()
    itens.forEach(item => {
      const chave = `${item.codigo_produto}-${item.lote}-${item.validade}`
      if (mapa.has(chave)) {
        const existing = mapa.get(chave)!
        existing.quantidade += item.quantidade
      } else {
        mapa.set(chave, { ...item })
      }
    })
    return Array.from(mapa.values())
  }),
  // Informações complementares (JUSTIFICATIVA MÉDICA do IcarusBrain)
  info_complementares: z.string().max(5000).optional(),
  // Rastreabilidade mínima (distribuidora, não clínica)
  paciente_nome: z.string().max(200).optional(),
  paciente_cpf: z.string().regex(/^\d{11}$/).optional(),
  hospital_nome: z.string().max(200).optional(),
  medico_crm: z.string().optional(),
})

export type NFeSaida = z.infer<typeof nfeSaidaSchema>
