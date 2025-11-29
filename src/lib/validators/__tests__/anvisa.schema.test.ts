/**
 * Testes - Validadores ANVISA
 * 
 * ICARUS v5.1 - Conformidade RDC 751/2022, RDC 59/2008
 */

import { describe, it, expect } from 'vitest'
import {
  registroAnvisaSchema,
  classeRiscoOpmeSchema,
  loteSchema,
  dataValidadeISOSchema,
  precoCentsNumberSchema,
  cnpjSchema,
  cpfSchema,
  ean13Schema,
  ncmSchema,
  chaveNFeSchema,
  cfopSchema,
  formatCNPJ,
  formatCPF,
  formatPreco,
} from '../anvisa.schema'

describe('Registro ANVISA', () => {
  it('deve aceitar registro válido com 13 dígitos', () => {
    expect(() => registroAnvisaSchema.parse('1234567890123')).not.toThrow()
    expect(() => registroAnvisaSchema.parse('8012345678901')).not.toThrow()
  })

  it('deve rejeitar registro com menos de 13 dígitos', () => {
    expect(() => registroAnvisaSchema.parse('123456789012')).toThrow()
  })

  it('deve rejeitar registro com mais de 13 dígitos', () => {
    expect(() => registroAnvisaSchema.parse('12345678901234')).toThrow()
  })

  it('deve rejeitar registro com letras', () => {
    expect(() => registroAnvisaSchema.parse('123456789012A')).toThrow()
  })
})

describe('Classe de Risco OPME', () => {
  it('deve aceitar classes válidas I, II, III, IV', () => {
    expect(() => classeRiscoOpmeSchema.parse('I')).not.toThrow()
    expect(() => classeRiscoOpmeSchema.parse('II')).not.toThrow()
    expect(() => classeRiscoOpmeSchema.parse('III')).not.toThrow()
    expect(() => classeRiscoOpmeSchema.parse('IV')).not.toThrow()
  })

  it('deve rejeitar classe inválida', () => {
    expect(() => classeRiscoOpmeSchema.parse('V')).toThrow()
  })

  it('deve rejeitar classe em minúsculas', () => {
    expect(() => classeRiscoOpmeSchema.parse('i')).toThrow()
  })

  it('deve rejeitar número ao invés de romano', () => {
    expect(() => classeRiscoOpmeSchema.parse('1')).toThrow()
  })
})

describe('Lote', () => {
  it('deve aceitar lote válido', () => {
    expect(() => loteSchema.parse('ABC123')).not.toThrow()
    expect(() => loteSchema.parse('LOT-2024-001')).not.toThrow()
    expect(() => loteSchema.parse('A1B2C3')).not.toThrow()
  })

  it('deve rejeitar lote muito curto', () => {
    expect(() => loteSchema.parse('AB')).toThrow()
  })

  it('deve rejeitar lote muito longo', () => {
    expect(() => loteSchema.parse('A'.repeat(31))).toThrow()
  })

  it('deve rejeitar lote com caracteres especiais', () => {
    expect(() => loteSchema.parse('LOT@2024')).toThrow()
  })
})

describe('CNPJ', () => {
  it('deve aceitar CNPJ válido', () => {
    expect(() => cnpjSchema.parse('11222333000181')).not.toThrow()
    expect(() => cnpjSchema.parse('11.222.333/0001-81')).not.toThrow()
  })

  it('deve rejeitar CNPJ com dígito verificador inválido', () => {
    expect(() => cnpjSchema.parse('11222333000182')).toThrow()
  })

  it('deve rejeitar CNPJ com todos os dígitos iguais', () => {
    expect(() => cnpjSchema.parse('11111111111111')).toThrow()
  })

  it('deve rejeitar CNPJ com tamanho incorreto', () => {
    expect(() => cnpjSchema.parse('1122233300018')).toThrow()
  })
})

describe('CPF', () => {
  it('deve aceitar CPF válido', () => {
    expect(() => cpfSchema.parse('52998224725')).not.toThrow()
    expect(() => cpfSchema.parse('529.982.247-25')).not.toThrow()
  })

  it('deve rejeitar CPF com dígito verificador inválido', () => {
    expect(() => cpfSchema.parse('52998224726')).toThrow()
  })

  it('deve rejeitar CPF com todos os dígitos iguais', () => {
    expect(() => cpfSchema.parse('11111111111')).toThrow()
  })

  it('deve rejeitar CPF com tamanho incorreto', () => {
    expect(() => cpfSchema.parse('5299822472')).toThrow()
  })
})

describe('EAN-13', () => {
  it('deve aceitar EAN-13 válido', () => {
    expect(() => ean13Schema.parse('7891234567895')).not.toThrow()
  })

  it('deve rejeitar EAN-13 com dígito verificador inválido', () => {
    expect(() => ean13Schema.parse('7891234567890')).toThrow()
  })

  it('deve rejeitar EAN-13 com tamanho incorreto', () => {
    expect(() => ean13Schema.parse('789123456789')).toThrow()
  })

  it('deve rejeitar EAN-13 com letras', () => {
    expect(() => ean13Schema.parse('789123456789A')).toThrow()
  })
})

describe('NCM', () => {
  it('deve aceitar NCM válido com 8 dígitos', () => {
    expect(() => ncmSchema.parse('90189099')).not.toThrow()
    expect(() => ncmSchema.parse('84821000')).not.toThrow()
  })

  it('deve rejeitar NCM com menos de 8 dígitos', () => {
    expect(() => ncmSchema.parse('9018909')).toThrow()
  })

  it('deve rejeitar NCM com letras', () => {
    expect(() => ncmSchema.parse('9018909A')).toThrow()
  })
})

describe('Chave NF-e', () => {
  it('deve aceitar chave válida com 44 dígitos', () => {
    const chaveValida = '35210814200166000187550010000000011000000019'
    expect(() => chaveNFeSchema.parse(chaveValida)).not.toThrow()
  })

  it('deve rejeitar chave com menos de 44 dígitos', () => {
    expect(() => chaveNFeSchema.parse('3521081420016600018755001000000001100000001')).toThrow()
  })

  it('deve rejeitar chave com letras', () => {
    expect(() => chaveNFeSchema.parse('3521081420016600018755001000000001100000001A')).toThrow()
  })
})

describe('CFOP', () => {
  it('deve aceitar CFOP válido', () => {
    expect(() => cfopSchema.parse('5102')).not.toThrow()
    expect(() => cfopSchema.parse('6102')).not.toThrow()
    expect(() => cfopSchema.parse('1102')).not.toThrow()
  })

  it('deve rejeitar CFOP começando com 0', () => {
    expect(() => cfopSchema.parse('0102')).toThrow()
  })

  it('deve rejeitar CFOP começando com 8 ou 9', () => {
    expect(() => cfopSchema.parse('8102')).toThrow()
    expect(() => cfopSchema.parse('9102')).toThrow()
  })
})

describe('Preço em Centavos', () => {
  it('deve aceitar preço positivo', () => {
    expect(() => precoCentsNumberSchema.parse(10000)).not.toThrow()
    expect(() => precoCentsNumberSchema.parse(1)).not.toThrow()
  })

  it('deve rejeitar preço zero', () => {
    expect(() => precoCentsNumberSchema.parse(0)).toThrow()
  })

  it('deve rejeitar preço negativo', () => {
    expect(() => precoCentsNumberSchema.parse(-100)).toThrow()
  })

  it('deve rejeitar preço decimal', () => {
    expect(() => precoCentsNumberSchema.parse(100.5)).toThrow()
  })
})

describe('Helpers de Formatação', () => {
  it('deve formatar CNPJ corretamente', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('deve formatar CPF corretamente', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25')
  })

  it('deve formatar preço de centavos para reais', () => {
    expect(formatPreco(10000)).toBe('R$ 100,00')
    expect(formatPreco(12345)).toBe('R$ 123,45')
  })
})

