/**
 * Testes - Validadores CFM/CRM
 * 
 * ICARUS v5.1 - Conformidade RN 506 ANS (TISS)
 */

import { describe, it, expect } from 'vitest'
import {
  crmSchema,
  rqeSchema,
  cnsSchema,
  cid10Schema,
  tussSchema,
  cbhpmSchema,
  dataNascimentoSchema,
  dataCirurgiaSchema,
  horaSchema,
  sexoSchema,
  tipoSanguineoSchema,
  formatCRM,
  extrairUFdoCRM,
  formatCID10,
  calcularIdade,
} from '../cfm.schema'

describe('CRM', () => {
  it('deve aceitar CRM válido', () => {
    expect(() => crmSchema.parse('SP123456')).not.toThrow()
    expect(() => crmSchema.parse('RJ12345678')).not.toThrow()
    expect(() => crmSchema.parse('mg123456')).not.toThrow() // deve aceitar minúsculas
  })

  it('deve rejeitar CRM com UF inválida', () => {
    expect(() => crmSchema.parse('XX123456')).toThrow()
  })

  it('deve rejeitar CRM com menos de 4 dígitos', () => {
    expect(() => crmSchema.parse('SP123')).toThrow()
  })

  it('deve rejeitar CRM com mais de 8 dígitos', () => {
    expect(() => crmSchema.parse('SP123456789')).toThrow()
  })
})

describe('RQE', () => {
  it('deve aceitar RQE válido', () => {
    expect(() => rqeSchema.parse('1234')).not.toThrow()
    expect(() => rqeSchema.parse('12345678')).not.toThrow()
  })

  it('deve aceitar RQE vazio (opcional)', () => {
    expect(() => rqeSchema.parse('')).not.toThrow()
  })

  it('deve rejeitar RQE com menos de 4 dígitos', () => {
    expect(() => rqeSchema.parse('123')).toThrow()
  })

  it('deve rejeitar RQE com letras', () => {
    expect(() => rqeSchema.parse('1234A')).toThrow()
  })
})

describe('CNS (Cartão SUS)', () => {
  it('deve aceitar CNS válido', () => {
    // CNS válido gerado para teste
    expect(() => cnsSchema.parse('898000000000000')).not.toThrow()
  })

  it('deve rejeitar CNS com menos de 15 dígitos', () => {
    expect(() => cnsSchema.parse('89800000000000')).toThrow()
  })

  it('deve rejeitar CNS com letras', () => {
    expect(() => cnsSchema.parse('89800000000000A')).toThrow()
  })
})

describe('CID-10', () => {
  it('deve aceitar CID-10 válido', () => {
    expect(() => cid10Schema.parse('I21')).not.toThrow()
    expect(() => cid10Schema.parse('I21.0')).not.toThrow()
    expect(() => cid10Schema.parse('I21.01')).not.toThrow()
    expect(() => cid10Schema.parse('i21')).not.toThrow() // aceita minúsculas
  })

  it('deve rejeitar CID-10 sem letra inicial', () => {
    expect(() => cid10Schema.parse('21')).toThrow()
  })

  it('deve rejeitar CID-10 com formato inválido', () => {
    expect(() => cid10Schema.parse('I2')).toThrow()
    expect(() => cid10Schema.parse('I21.123')).toThrow()
  })

  it('deve rejeitar CID-10 com letra no meio', () => {
    expect(() => cid10Schema.parse('I2A')).toThrow()
  })
})

describe('TUSS', () => {
  it('deve aceitar código TUSS válido', () => {
    expect(() => tussSchema.parse('10101012')).not.toThrow()
    expect(() => tussSchema.parse('40302016')).not.toThrow()
  })

  it('deve rejeitar TUSS com menos de 8 dígitos', () => {
    expect(() => tussSchema.parse('1010101')).toThrow()
  })

  it('deve rejeitar TUSS com mais de 8 dígitos', () => {
    expect(() => tussSchema.parse('101010123')).toThrow()
  })

  it('deve rejeitar TUSS com letras', () => {
    expect(() => tussSchema.parse('1010101A')).toThrow()
  })
})

describe('CBHPM', () => {
  it('deve aceitar código CBHPM válido', () => {
    expect(() => cbhpmSchema.parse('3.01.01.01-1')).not.toThrow()
    expect(() => cbhpmSchema.parse('4.02.03.04-5')).not.toThrow()
  })

  it('deve rejeitar CBHPM sem formatação', () => {
    expect(() => cbhpmSchema.parse('30101011')).toThrow()
  })

  it('deve rejeitar CBHPM com formato incorreto', () => {
    expect(() => cbhpmSchema.parse('3.01.01.01')).toThrow()
    expect(() => cbhpmSchema.parse('3.1.1.1-1')).toThrow()
  })
})

describe('Data de Nascimento', () => {
  it('deve aceitar data no passado', () => {
    expect(() => dataNascimentoSchema.parse('1990-05-15')).not.toThrow()
    expect(() => dataNascimentoSchema.parse('2000-01-01')).not.toThrow()
  })

  it('deve aceitar data de hoje', () => {
    const hoje = new Date().toISOString().split('T')[0]
    expect(() => dataNascimentoSchema.parse(hoje)).not.toThrow()
  })

  it('deve rejeitar data no futuro', () => {
    const futuro = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    expect(() => dataNascimentoSchema.parse(futuro)).toThrow()
  })

  it('deve rejeitar formato inválido', () => {
    expect(() => dataNascimentoSchema.parse('15/05/1990')).toThrow()
  })
})

describe('Data de Cirurgia', () => {
  it('deve aceitar data no futuro', () => {
    const futuro = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    expect(() => dataCirurgiaSchema.parse(futuro)).not.toThrow()
  })

  it('deve aceitar data de hoje', () => {
    const hoje = new Date().toISOString().split('T')[0]
    expect(() => dataCirurgiaSchema.parse(hoje)).not.toThrow()
  })

  it('deve rejeitar data no passado', () => {
    const passado = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    expect(() => dataCirurgiaSchema.parse(passado)).toThrow()
  })
})

describe('Hora', () => {
  it('deve aceitar hora válida', () => {
    expect(() => horaSchema.parse('08:30')).not.toThrow()
    expect(() => horaSchema.parse('14:00')).not.toThrow()
    expect(() => horaSchema.parse('23:59')).not.toThrow()
    expect(() => horaSchema.parse('00:00')).not.toThrow()
  })

  it('deve rejeitar hora inválida', () => {
    expect(() => horaSchema.parse('24:00')).toThrow()
    expect(() => horaSchema.parse('08:60')).toThrow()
    expect(() => horaSchema.parse('8:30')).toThrow()
  })
})

describe('Sexo', () => {
  it('deve aceitar valores válidos', () => {
    expect(() => sexoSchema.parse('M')).not.toThrow()
    expect(() => sexoSchema.parse('F')).not.toThrow()
    expect(() => sexoSchema.parse('I')).not.toThrow()
  })

  it('deve rejeitar valores inválidos', () => {
    expect(() => sexoSchema.parse('X')).toThrow()
    expect(() => sexoSchema.parse('m')).toThrow()
  })
})

describe('Tipo Sanguíneo', () => {
  it('deve aceitar tipos válidos', () => {
    expect(() => tipoSanguineoSchema.parse('A+')).not.toThrow()
    expect(() => tipoSanguineoSchema.parse('O-')).not.toThrow()
    expect(() => tipoSanguineoSchema.parse('AB+')).not.toThrow()
  })

  it('deve rejeitar tipos inválidos', () => {
    expect(() => tipoSanguineoSchema.parse('C+')).toThrow()
    expect(() => tipoSanguineoSchema.parse('A')).toThrow()
  })
})

describe('Helpers CFM', () => {
  it('deve formatar CRM corretamente', () => {
    expect(formatCRM('SP123456')).toBe('CRM/SP 123456')
    expect(formatCRM('rj12345')).toBe('CRM/RJ 12345')
  })

  it('deve extrair UF do CRM', () => {
    expect(extrairUFdoCRM('SP123456')).toBe('SP')
    expect(extrairUFdoCRM('rj12345')).toBe('RJ')
    expect(extrairUFdoCRM('XX12345')).toBeNull()
  })

  it('deve formatar CID-10 corretamente', () => {
    expect(formatCID10('I21')).toBe('I21')
    expect(formatCID10('I210')).toBe('I21.0')
    expect(formatCID10('i21')).toBe('I21')
  })

  it('deve calcular idade corretamente', () => {
    const hoje = new Date()
    const anoPassado = new Date(hoje.getFullYear() - 30, hoje.getMonth(), hoje.getDate())
    expect(calcularIdade(anoPassado.toISOString().split('T')[0])).toBe(30)
  })
})
