/**
 * ICARUS v5.0 - Módulo: Faturamento NFe Completo
 *
 * Categoria: Core Business
 * Descrição: Emissão de Notas Fiscais Eletrônicas (NF-e)
 *
 * CONTEXTO DE NEGÓCIO:
 * - Distribuidora de dispositivos médicos (OPME) B2B
 * - Faturamento após realização de cirurgias
 * - NF-e obrigatória para todas as vendas
 * - Produtos OPME com tributação específica
 * - Integração com SEFAZ (Secretaria da Fazenda)
 * - Gestão de impostos complexos (ICMS, IPI, PIS, COFINS, ISS)
 * - Contingência obrigatória (emissão offline)
 * - Rastreabilidade: NF-e → Cirurgia → Produtos → Lotes
 *
 * FUNCIONALIDADES:
 * - Emissão de NF-e (modelo 55)
 * - Cálculo automático de impostos por produto
 * - Integração SEFAZ (autorização, consulta, cancelamento)
 * - Contingência FS-DA (offline)
 * - Carta de Correção Eletrônica (CC-e)
 * - Cancelamento de NF-e
 * - Inutilização de numeração
 * - Download XML e DANFE (PDF)
 * - Rastreio de status (pendente → autorizada → cancelada)
 * - Vinculação com cirurgias e clientes
 * - Gestão de séries e numeração
 * - Relatórios fiscais
 *
 * KPIs:
 * - Valor Total Faturado (mês)
 * - Notas Pendentes de Emissão
 * - Notas Canceladas (%)
 * - Total de Impostos (mês)
 * - Tempo Médio de Autorização
 *
 * Abas:
 * - Overview: KPIs + notas recentes + pendências
 * - Pendentes: Notas aguardando emissão
 * - Emitidas: Notas autorizadas pela SEFAZ
 * - Canceladas: Histórico de cancelamentos
 * - Relatórios: Análises fiscais e tributárias
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { formatCurrency, formatDate } from '@/lib/utils'

// ==================== INTERFACES ====================

type StatusNFe = 'rascunho' | 'pendente' | 'processando' | 'autorizada' | 'rejeitada' | 'cancelada' | 'denegada' | 'contingencia'
type TipoEmissao = 'normal' | 'contingencia' | 'svc' | 'fsda'
type TipoNFe = 'saida' | 'entrada' | 'devolucao'
type FinalidadeNFe = 'normal' | 'complementar' | 'ajuste' | 'devolucao'

interface NotaFiscal {
  id: number
  numero: number
  serie: number
  tipo: TipoNFe
  finalidade: FinalidadeNFe
  status: StatusNFe
  tipo_emissao: TipoEmissao

  // Dados Emissão
  data_emissao: string
  data_saida?: string
  hora_saida?: string

  // Cliente (Destinatário)
  cliente_id: number
  cliente_razao_social: string
  cliente_cnpj: string
  cliente_ie?: string
  cliente_endereco: string
  cliente_cidade: string
  cliente_estado: string
  cliente_cep: string

  // Vinculação
  cirurgia_id?: number
  cirurgia_numero?: string
  pedido_id?: number

  // Itens
  itens: ItemNFe[]

  // Totalizadores
  valor_produtos: number
  valor_frete: number
  valor_seguro: number
  valor_desconto: number
  valor_outras_despesas: number

  // Impostos
  impostos: ImpostosNFe

  valor_total: number

  // SEFAZ
  chave_acesso?: string
  protocolo_autorizacao?: string
  data_autorizacao?: string
  xml?: string
  xml_cancelamento?: string
  motivo_rejeicao?: string
  codigo_rejeicao?: number

  // Cancelamento
  data_cancelamento?: string
  justificativa_cancelamento?: string
  protocolo_cancelamento?: string

  // Carta de Correção
  cartas_correcao: CartaCorrecao[]

  // Contingência
  data_contingencia?: string
  motivo_contingencia?: string

  // Pagamento
  forma_pagamento: FormaPagamento
  condicao_pagamento: string
  vencimentos: Vencimento[]

  // Transporte
  transportadora?: Transportadora
  volumes: Volume[]

  // Observações
  informacoes_complementares?: string
  informacoes_fisco?: string

  // Metadados
  usuario_emissao: string
  created_at: string
  updated_at: string
}

interface ItemNFe {
  id: number
  numero_item: number
  produto_id: number
  codigo_produto: string
  descricao: string
  ncm: string // Nomenclatura Comum do Mercosul
  cest?: string // Código Especificador da Substituição Tributária
  cfop: string // Código Fiscal de Operações

  // Lote (Rastreabilidade OPME)
  lote?: string
  validade?: string

  // Quantidade e Valores
  unidade: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  valor_desconto: number

  // Impostos do Item
  impostos_item: ImpostosItem

  // Informações Adicionais
  informacoes_adicionais?: string
}

interface ImpostosItem {
  // ICMS
  icms_origem: string
  icms_cst: string
  icms_base_calculo: number
  icms_aliquota: number
  icms_valor: number

  // IPI
  ipi_cst: string
  ipi_base_calculo: number
  ipi_aliquota: number
  ipi_valor: number

  // PIS
  pis_cst: string
  pis_base_calculo: number
  pis_aliquota: number
  pis_valor: number

  // COFINS
  cofins_cst: string
  cofins_base_calculo: number
  cofins_aliquota: number
  cofins_valor: number
}

interface ImpostosNFe {
  // Totais de Impostos
  icms_base_calculo: number
  icms_valor: number
  icms_base_calculo_st: number
  icms_valor_st: number
  icms_valor_desonerado: number

  ipi_valor: number

  pis_valor: number
  cofins_valor: number

  // Valor aproximado dos tributos
  valor_aproximado_tributos: number
}

interface FormaPagamento {
  forma: 'dinheiro' | 'cheque' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'pix' | 'transferencia' | 'outros'
  valor: number
}

interface Vencimento {
  numero_parcela: number
  data_vencimento: string
  valor: number
}

interface Transportadora {
  razao_social: string
  cnpj: string
  ie?: string
  endereco: string
  cidade: string
  estado: string
  modalidade_frete: 'remetente' | 'destinatario' | 'terceiros' | 'proprio' | 'sem_frete'
}

interface Volume {
  quantidade: number
  especie: string
  marca?: string
  numeracao?: string
  peso_liquido: number
  peso_bruto: number
}

interface CartaCorrecao {
  id: number
  nfe_id: number
  sequencia: number
  correcao: string
  data_evento: string
  protocolo?: string
  xml?: string
}

interface AlertaFiscal {
  id: number
  tipo: 'pendente_emissao' | 'rejeitada' | 'contingencia' | 'numeracao' | 'prazo_vencido' | 'sefaz_offline'
  prioridade: 'alta' | 'media' | 'baixa'
  mensagem: string
  acao_sugerida: string
  nfe_id?: number
  data: string
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function FaturamentoNFeCompleto() {
  const { supabase } = useSupabase()
  const { askIcarus, isLoading: iaLoading } = useIcarusBrain()

  // State
  const [activeTab, setActiveTab] = useState('overview')
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [alertas, setAlertas] = useState<AlertaFiscal[]>([])
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [notaDialogOpen, setNotaDialogOpen] = useState(false)
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscal | null>(null)

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroMes, setFiltroMes] = useState<string>('atual')
  const [busca, setBusca] = useState('')

  // ==================== MOCK DATA ====================

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)

    // Mock Notas Fiscais
    const mockNotas: NotaFiscal[] = [
      {
        id: 1,
        numero: 12345,
        serie: 1,
        tipo: 'saida',
        finalidade: 'normal',
        status: 'autorizada',
        tipo_emissao: 'normal',
        data_emissao: '2025-11-15T10:30:00',
        data_saida: '2025-11-15',
        hora_saida: '14:00:00',
        cliente_id: 1,
        cliente_razao_social: 'Hospital Sírio-Libanês S/A',
        cliente_cnpj: '61.367.808/0001-20',
        cliente_ie: '123.456.789.000',
        cliente_endereco: 'Rua Dona Adma Jafet, 91',
        cliente_cidade: 'São Paulo',
        cliente_estado: 'SP',
        cliente_cep: '01308-050',
        cirurgia_id: 1,
        cirurgia_numero: 'CIR-2025-001',
        itens: [
          {
            id: 1,
            numero_item: 1,
            produto_id: 101,
            codigo_produto: 'PROT-KNEE-001',
            descricao: 'Prótese Total de Joelho',
            ncm: '90212100',
            cest: '0100100',
            cfop: '5102',
            lote: 'LOT-20250115',
            validade: '2027-11-15',
            unidade: 'UN',
            quantidade: 1,
            valor_unitario: 45000,
            valor_total: 45000,
            valor_desconto: 0,
            impostos_item: {
              icms_origem: '0',
              icms_cst: '00',
              icms_base_calculo: 45000,
              icms_aliquota: 18,
              icms_valor: 8100,
              ipi_cst: '50',
              ipi_base_calculo: 45000,
              ipi_aliquota: 5,
              ipi_valor: 2250,
              pis_cst: '01',
              pis_base_calculo: 45000,
              pis_aliquota: 1.65,
              pis_valor: 742.50,
              cofins_cst: '01',
              cofins_base_calculo: 45000,
              cofins_aliquota: 7.6,
              cofins_valor: 3420
            }
          }
        ],
        valor_produtos: 45000,
        valor_frete: 0,
        valor_seguro: 0,
        valor_desconto: 0,
        valor_outras_despesas: 0,
        impostos: {
          icms_base_calculo: 45000,
          icms_valor: 8100,
          icms_base_calculo_st: 0,
          icms_valor_st: 0,
          icms_valor_desonerado: 0,
          ipi_valor: 2250,
          pis_valor: 742.50,
          cofins_valor: 3420,
          valor_aproximado_tributos: 14512.50
        },
        valor_total: 45000,
        chave_acesso: '35251161367808000120550010000123451123456789',
        protocolo_autorizacao: '135250000123456',
        data_autorizacao: '2025-11-15T10:32:15',
        xml: '<xml>... conteúdo do XML da NF-e ...</xml>',
        cartas_correcao: [],
        forma_pagamento: {
          forma: 'boleto',
          valor: 45000
        },
        condicao_pagamento: '30/60 dias',
        vencimentos: [
          { numero_parcela: 1, data_vencimento: '2025-12-15', valor: 22500 },
          { numero_parcela: 2, data_vencimento: '2026-01-15', valor: 22500 }
        ],
        transportadora: {
          razao_social: 'Transportadora Rápida LTDA',
          cnpj: '12.345.678/0001-90',
          endereco: 'Av. Transportes, 500',
          cidade: 'São Paulo',
          estado: 'SP',
          modalidade_frete: 'remetente'
        },
        volumes: [
          {
            quantidade: 1,
            especie: 'Caixa',
            marca: 'OPME',
            peso_liquido: 2.5,
            peso_bruto: 3.0
          }
        ],
        informacoes_complementares: 'Produtos médicos OPME - Rastreabilidade: Lote LOT-20250115, Validade 15/11/2027',
        usuario_emissao: 'Carlos Silva',
        created_at: '2025-11-15T10:30:00',
        updated_at: '2025-11-15T10:32:15'
      },
      {
        id: 2,
        numero: 12346,
        serie: 1,
        tipo: 'saida',
        finalidade: 'normal',
        status: 'autorizada',
        tipo_emissao: 'normal',
        data_emissao: '2025-11-14T15:45:00',
        data_saida: '2025-11-14',
        hora_saida: '16:30:00',
        cliente_id: 2,
        cliente_razao_social: 'Hospital Albert Einstein S/A',
        cliente_cnpj: '60.765.823/0001-30',
        cliente_ie: '234.567.890.111',
        cliente_endereco: 'Av. Albert Einstein, 627',
        cliente_cidade: 'São Paulo',
        cliente_estado: 'SP',
        cliente_cep: '05652-900',
        cirurgia_id: 2,
        cirurgia_numero: 'CIR-2025-002',
        itens: [
          {
            id: 2,
            numero_item: 1,
            produto_id: 102,
            codigo_produto: 'STENT-CARD-001',
            descricao: 'Stent Coronariano Farmacológico',
            ncm: '90183900',
            cest: '0100200',
            cfop: '5102',
            lote: 'LOT-20250110',
            validade: '2028-01-10',
            unidade: 'UN',
            quantidade: 2,
            valor_unitario: 12000,
            valor_total: 24000,
            valor_desconto: 0,
            impostos_item: {
              icms_origem: '0',
              icms_cst: '00',
              icms_base_calculo: 24000,
              icms_aliquota: 18,
              icms_valor: 4320,
              ipi_cst: '50',
              ipi_base_calculo: 24000,
              ipi_aliquota: 5,
              ipi_valor: 1200,
              pis_cst: '01',
              pis_base_calculo: 24000,
              pis_aliquota: 1.65,
              pis_valor: 396,
              cofins_cst: '01',
              cofins_base_calculo: 24000,
              cofins_aliquota: 7.6,
              cofins_valor: 1824
            }
          },
          {
            id: 3,
            numero_item: 2,
            produto_id: 103,
            codigo_produto: 'CATETER-001',
            descricao: 'Cateter Guia para Angioplastia',
            ncm: '90183900',
            cfop: '5102',
            lote: 'LOT-20250112',
            validade: '2027-12-12',
            unidade: 'UN',
            quantidade: 3,
            valor_unitario: 800,
            valor_total: 2400,
            valor_desconto: 0,
            impostos_item: {
              icms_origem: '0',
              icms_cst: '00',
              icms_base_calculo: 2400,
              icms_aliquota: 18,
              icms_valor: 432,
              ipi_cst: '50',
              ipi_base_calculo: 2400,
              ipi_aliquota: 5,
              ipi_valor: 120,
              pis_cst: '01',
              pis_base_calculo: 2400,
              pis_aliquota: 1.65,
              pis_valor: 39.60,
              cofins_cst: '01',
              cofins_base_calculo: 2400,
              cofins_aliquota: 7.6,
              cofins_valor: 182.40
            }
          }
        ],
        valor_produtos: 26400,
        valor_frete: 150,
        valor_seguro: 0,
        valor_desconto: 0,
        valor_outras_despesas: 0,
        impostos: {
          icms_base_calculo: 26400,
          icms_valor: 4752,
          icms_base_calculo_st: 0,
          icms_valor_st: 0,
          icms_valor_desonerado: 0,
          ipi_valor: 1320,
          pis_valor: 435.60,
          cofins_valor: 2006.40,
          valor_aproximado_tributos: 8514
        },
        valor_total: 26550,
        chave_acesso: '35251161367808000120550010000123461234567890',
        protocolo_autorizacao: '135250000123457',
        data_autorizacao: '2025-11-14T15:47:22',
        xml: '<xml>... conteúdo do XML da NF-e ...</xml>',
        cartas_correcao: [],
        forma_pagamento: {
          forma: 'boleto',
          valor: 26550
        },
        condicao_pagamento: '45 dias',
        vencimentos: [
          { numero_parcela: 1, data_vencimento: '2025-12-30', valor: 26550 }
        ],
        transportadora: {
          razao_social: 'Transportadora Rápida LTDA',
          cnpj: '12.345.678/0001-90',
          endereco: 'Av. Transportes, 500',
          cidade: 'São Paulo',
          estado: 'SP',
          modalidade_frete: 'remetente'
        },
        volumes: [
          {
            quantidade: 1,
            especie: 'Caixa',
            marca: 'OPME',
            peso_liquido: 0.5,
            peso_bruto: 0.8
          }
        ],
        informacoes_complementares: 'Produtos médicos OPME - Rastreabilidade garantida',
        usuario_emissao: 'Mariana Santos',
        created_at: '2025-11-14T15:45:00',
        updated_at: '2025-11-14T15:47:22'
      },
      {
        id: 3,
        numero: 12347,
        serie: 1,
        tipo: 'saida',
        finalidade: 'normal',
        status: 'pendente',
        tipo_emissao: 'normal',
        data_emissao: '2025-11-16T09:00:00',
        cliente_id: 3,
        cliente_razao_social: 'Santa Casa de Misericórdia de SP',
        cliente_cnpj: '62.634.040/0001-17',
        cliente_endereco: 'Rua Dr. Cesário Mota Jr, 112',
        cliente_cidade: 'São Paulo',
        cliente_estado: 'SP',
        cliente_cep: '01221-020',
        cirurgia_id: 3,
        cirurgia_numero: 'CIR-2025-003',
        itens: [
          {
            id: 4,
            numero_item: 1,
            produto_id: 104,
            codigo_produto: 'PROT-HIP-001',
            descricao: 'Prótese Total de Quadril',
            ncm: '90212100',
            cfop: '5102',
            lote: 'LOT-20250116',
            validade: '2028-01-16',
            unidade: 'UN',
            quantidade: 1,
            valor_unitario: 38000,
            valor_total: 38000,
            valor_desconto: 0,
            impostos_item: {
              icms_origem: '0',
              icms_cst: '00',
              icms_base_calculo: 38000,
              icms_aliquota: 18,
              icms_valor: 6840,
              ipi_cst: '50',
              ipi_base_calculo: 38000,
              ipi_aliquota: 5,
              ipi_valor: 1900,
              pis_cst: '01',
              pis_base_calculo: 38000,
              pis_aliquota: 1.65,
              pis_valor: 627,
              cofins_cst: '01',
              cofins_base_calculo: 38000,
              cofins_aliquota: 7.6,
              cofins_valor: 2888
            }
          }
        ],
        valor_produtos: 38000,
        valor_frete: 0,
        valor_seguro: 0,
        valor_desconto: 0,
        valor_outras_despesas: 0,
        impostos: {
          icms_base_calculo: 38000,
          icms_valor: 6840,
          icms_base_calculo_st: 0,
          icms_valor_st: 0,
          icms_valor_desonerado: 0,
          ipi_valor: 1900,
          pis_valor: 627,
          cofins_valor: 2888,
          valor_aproximado_tributos: 12255
        },
        valor_total: 38000,
        cartas_correcao: [],
        forma_pagamento: {
          forma: 'boleto',
          valor: 38000
        },
        condicao_pagamento: '30 dias',
        vencimentos: [
          { numero_parcela: 1, data_vencimento: '2025-12-16', valor: 38000 }
        ],
        volumes: [
          {
            quantidade: 1,
            especie: 'Caixa',
            peso_liquido: 3.0,
            peso_bruto: 3.5
          }
        ],
        informacoes_complementares: 'Aguardando emissão - Cirurgia realizada dia 15/11',
        usuario_emissao: 'João Pedro',
        created_at: '2025-11-16T09:00:00',
        updated_at: '2025-11-16T09:00:00'
      },
      {
        id: 4,
        numero: 12340,
        serie: 1,
        tipo: 'saida',
        finalidade: 'normal',
        status: 'cancelada',
        tipo_emissao: 'normal',
        data_emissao: '2025-11-10T11:00:00',
        data_saida: '2025-11-10',
        cliente_id: 4,
        cliente_razao_social: 'Clínica Ortopédica Paulista LTDA',
        cliente_cnpj: '12.345.678/0001-90',
        cliente_endereco: 'Av. Paulista, 1000',
        cliente_cidade: 'São Paulo',
        cliente_estado: 'SP',
        cliente_cep: '01310-100',
        itens: [
          {
            id: 5,
            numero_item: 1,
            produto_id: 101,
            codigo_produto: 'PROT-KNEE-001',
            descricao: 'Prótese Total de Joelho',
            ncm: '90212100',
            cfop: '5102',
            unidade: 'UN',
            quantidade: 1,
            valor_unitario: 42000,
            valor_total: 42000,
            valor_desconto: 0,
            impostos_item: {
              icms_origem: '0',
              icms_cst: '00',
              icms_base_calculo: 42000,
              icms_aliquota: 18,
              icms_valor: 7560,
              ipi_cst: '50',
              ipi_base_calculo: 42000,
              ipi_aliquota: 5,
              ipi_valor: 2100,
              pis_cst: '01',
              pis_base_calculo: 42000,
              pis_aliquota: 1.65,
              pis_valor: 693,
              cofins_cst: '01',
              cofins_base_calculo: 42000,
              cofins_aliquota: 7.6,
              cofins_valor: 3192
            }
          }
        ],
        valor_produtos: 42000,
        valor_frete: 0,
        valor_seguro: 0,
        valor_desconto: 0,
        valor_outras_despesas: 0,
        impostos: {
          icms_base_calculo: 42000,
          icms_valor: 7560,
          icms_base_calculo_st: 0,
          icms_valor_st: 0,
          icms_valor_desonerado: 0,
          ipi_valor: 2100,
          pis_valor: 693,
          cofins_valor: 3192,
          valor_aproximado_tributos: 13545
        },
        valor_total: 42000,
        chave_acesso: '35251161367808000120550010000123401234567890',
        protocolo_autorizacao: '135250000123450',
        data_autorizacao: '2025-11-10T11:05:00',
        data_cancelamento: '2025-11-11T14:30:00',
        justificativa_cancelamento: 'Cirurgia cancelada pelo hospital - paciente adiou procedimento',
        protocolo_cancelamento: '135250000123460',
        xml_cancelamento: '<xml>... XML de cancelamento ...</xml>',
        cartas_correcao: [],
        forma_pagamento: {
          forma: 'boleto',
          valor: 42000
        },
        condicao_pagamento: '30 dias',
        vencimentos: [
          { numero_parcela: 1, data_vencimento: '2025-12-10', valor: 42000 }
        ],
        volumes: [],
        usuario_emissao: 'Carlos Silva',
        created_at: '2025-11-10T11:00:00',
        updated_at: '2025-11-11T14:30:00'
      },
      {
        id: 5,
        numero: 12348,
        serie: 1,
        tipo: 'saida',
        finalidade: 'normal',
        status: 'rejeitada',
        tipo_emissao: 'normal',
        data_emissao: '2025-11-16T08:00:00',
        cliente_id: 5,
        cliente_razao_social: 'Cardio Clínica Centro LTDA',
        cliente_cnpj: '23.456.789/0001-01',
        cliente_endereco: 'Rua Cardio, 200',
        cliente_cidade: 'Campinas',
        cliente_estado: 'SP',
        cliente_cep: '13010-100',
        itens: [
          {
            id: 6,
            numero_item: 1,
            produto_id: 102,
            codigo_produto: 'STENT-CARD-001',
            descricao: 'Stent Coronariano Farmacológico',
            ncm: '90183900',
            cfop: '5102',
            unidade: 'UN',
            quantidade: 1,
            valor_unitario: 12000,
            valor_total: 12000,
            valor_desconto: 0,
            impostos_item: {
              icms_origem: '0',
              icms_cst: '00',
              icms_base_calculo: 12000,
              icms_aliquota: 18,
              icms_valor: 2160,
              ipi_cst: '50',
              ipi_base_calculo: 12000,
              ipi_aliquota: 5,
              ipi_valor: 600,
              pis_cst: '01',
              pis_base_calculo: 12000,
              pis_aliquota: 1.65,
              pis_valor: 198,
              cofins_cst: '01',
              cofins_base_calculo: 12000,
              cofins_aliquota: 7.6,
              cofins_valor: 912
            }
          }
        ],
        valor_produtos: 12000,
        valor_frete: 0,
        valor_seguro: 0,
        valor_desconto: 0,
        valor_outras_despesas: 0,
        impostos: {
          icms_base_calculo: 12000,
          icms_valor: 2160,
          icms_base_calculo_st: 0,
          icms_valor_st: 0,
          icms_valor_desonerado: 0,
          ipi_valor: 600,
          pis_valor: 198,
          cofins_valor: 912,
          valor_aproximado_tributos: 3870
        },
        valor_total: 12000,
        motivo_rejeicao: 'Duplicidade de NF-e [nRec:123456789]',
        codigo_rejeicao: 539,
        cartas_correcao: [],
        forma_pagamento: {
          forma: 'boleto',
          valor: 12000
        },
        condicao_pagamento: 'À vista',
        vencimentos: [
          { numero_parcela: 1, data_vencimento: '2025-11-16', valor: 12000 }
        ],
        volumes: [],
        usuario_emissao: 'João Pedro',
        created_at: '2025-11-16T08:00:00',
        updated_at: '2025-11-16T08:02:30'
      }
    ]

    // Mock Alertas
    const mockAlertas: AlertaFiscal[] = [
      {
        id: 1,
        tipo: 'pendente_emissao',
        prioridade: 'alta',
        mensagem: 'NF-e 12347 aguardando emissão há mais de 24 horas',
        acao_sugerida: 'Emitir NF-e para cirurgia CIR-2025-003 (Santa Casa SP)',
        nfe_id: 3,
        data: '2025-11-16'
      },
      {
        id: 2,
        tipo: 'rejeitada',
        prioridade: 'alta',
        mensagem: 'NF-e 12348 rejeitada pela SEFAZ',
        acao_sugerida: 'Corrigir duplicidade e reenviar NF-e (código rejeição: 539)',
        nfe_id: 5,
        data: '2025-11-16'
      },
      {
        id: 3,
        tipo: 'numeracao',
        prioridade: 'media',
        mensagem: 'Série 1 com apenas 50 números disponíveis',
        acao_sugerida: 'Solicitar nova faixa de numeração junto à SEFAZ',
        data: '2025-11-16'
      }
    ]

    setNotas(mockNotas)
    setAlertas(mockAlertas)
    setLoading(false)
  }

  // ==================== CÁLCULOS E MÉTRICAS ====================

  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()

  const notasMesAtual = notas.filter(n => {
    const dataEmissao = new Date(n.data_emissao)
    return dataEmissao.getMonth() === mesAtual && dataEmissao.getFullYear() === anoAtual
  })

  const valorTotalFaturado = notasMesAtual
    .filter(n => n.status === 'autorizada')
    .reduce((sum, n) => sum + n.valor_total, 0)

  const notasPendentes = notas.filter(n => n.status === 'pendente' || n.status === 'rascunho').length

  const notasCanceladas = notasMesAtual.filter(n => n.status === 'cancelada').length
  const notasEmitidas = notasMesAtual.filter(n => n.status === 'autorizada').length
  const taxaCancelamento = notasEmitidas + notasCanceladas > 0
    ? (notasCanceladas / (notasEmitidas + notasCanceladas)) * 100
    : 0

  const totalImpostos = notasMesAtual
    .filter(n => n.status === 'autorizada')
    .reduce((sum, n) => sum + n.impostos.valor_aproximado_tributos, 0)

  const notasAutorizadas = notasMesAtual.filter(n => n.status === 'autorizada' && n.data_autorizacao && n.data_emissao)
  const tempoMedioAutorizacao = notasAutorizadas.length > 0
    ? notasAutorizadas.reduce((sum, n) => {
        const emissao = new Date(n.data_emissao).getTime()
        const autorizacao = new Date(n.data_autorizacao!).getTime()
        return sum + (autorizacao - emissao) / 1000 / 60 // minutos
      }, 0) / notasAutorizadas.length
    : 0

  // ==================== FILTROS ====================

  const notasFiltradas = notas.filter(nota => {
    const matchStatus = filtroStatus === 'todos' || nota.status === filtroStatus

    const matchMes = filtroMes === 'todos' ||
      (filtroMes === 'atual' && new Date(nota.data_emissao).getMonth() === mesAtual)

    const matchBusca = busca === '' ||
      nota.numero.toString().includes(busca) ||
      nota.cliente_razao_social.toLowerCase().includes(busca.toLowerCase()) ||
      nota.cliente_cnpj.includes(busca) ||
      (nota.chave_acesso && nota.chave_acesso.includes(busca))

    return matchStatus && matchMes && matchBusca
  })

  // ==================== HELPERS ====================

  const getBadgeColorStatus = (status: StatusNFe) => {
    switch (status) {
      case 'autorizada': return 'bg-green-100 text-green-800 border-green-300'
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'processando': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'rejeitada': return 'bg-red-100 text-red-800 border-red-300'
      case 'cancelada': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'denegada': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'contingencia': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'rascunho': return 'bg-gray-100 text-gray-600 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: StatusNFe) => {
    const labels = {
      rascunho: 'Rascunho',
      pendente: 'Pendente',
      processando: 'Processando',
      autorizada: 'Autorizada',
      rejeitada: 'Rejeitada',
      cancelada: 'Cancelada',
      denegada: 'Denegada',
      contingencia: 'Contingência'
    }
    return labels[status] || status
  }

  const formatChaveAcesso = (chave: string) => {
    // Formata: 1111 1111 1111 1111 1111 1111 1111 1111 1111 1111 1111
    return chave.match(/.{1,4}/g)?.join(' ') || chave
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando Faturamento...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Faturamento NF-e</h1>
          <p className="text-muted-foreground">Emissão de Notas Fiscais Eletrônicas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setNotaDialogOpen(true)}>+ Nova NF-e</Button>
          <Button variant="outline">📥 Importar XML</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Valor Faturado (Mês)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(valorTotalFaturado)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {notasEmitidas} notas autorizadas
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Notas Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{notasPendentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600 font-semibold">
              {notasPendentes > 0 ? 'Aguardando emissão' : 'Todas emitidas'}
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Cancelamento</CardDescription>
            <CardTitle className="text-3xl">{taxaCancelamento.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {notasCanceladas} de {notasEmitidas + notasCanceladas} notas
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Total Impostos (Mês)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalImpostos)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {((totalImpostos / valorTotalFaturado) * 100).toFixed(1)}% do faturamento
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Tempo Médio Autorização</CardDescription>
            <CardTitle className="text-3xl">{tempoMedioAutorizacao.toFixed(0)}m</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              SEFAZ operacional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes ({notasPendentes})</TabsTrigger>
          <TabsTrigger value="emitidas">Emitidas</TabsTrigger>
          <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alertas */}
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🚨 Alertas Fiscais</CardTitle>
                <CardDescription>Ações que requerem atenção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertas.map(alerta => (
                    <div key={alerta.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              alerta.prioridade === 'alta' ? 'bg-red-100 text-red-800 border-red-300' :
                              alerta.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-blue-100 text-blue-800 border-blue-300'
                            }`}>
                              {alerta.prioridade.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700">{alerta.mensagem}</p>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-900">
                          <strong>Ação:</strong> {alerta.acao_sugerida}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notas Recentes */}
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📄 Últimas Notas Emitidas</CardTitle>
                <CardDescription>Notas autorizadas recentemente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notas
                    .filter(n => n.status === 'autorizada')
                    .slice(0, 3)
                    .map(nota => (
                      <div key={nota.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold">NF-e {nota.numero}</div>
                            <div className="text-sm text-gray-600">{nota.cliente_razao_social}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(nota.valor_total)}</div>
                            <div className="text-xs text-gray-500">{formatDate(nota.data_emissao)}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Chave: {formatChaveAcesso(nota.chave_acesso!)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Impostos */}
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>💰 Resumo de Impostos (Mês Atual)</CardTitle>
              <CardDescription>Breakdown dos tributos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">ICMS</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(notasMesAtual
                      .filter(n => n.status === 'autorizada')
                      .reduce((sum, n) => sum + n.impostos.icms_valor, 0))}
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">IPI</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(notasMesAtual
                      .filter(n => n.status === 'autorizada')
                      .reduce((sum, n) => sum + n.impostos.ipi_valor, 0))}
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">PIS</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(notasMesAtual
                      .filter(n => n.status === 'autorizada')
                      .reduce((sum, n) => sum + n.impostos.pis_valor, 0))}
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">COFINS</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(notasMesAtual
                      .filter(n => n.status === 'autorizada')
                      .reduce((sum, n) => sum + n.impostos.cofins_valor, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PENDENTES */}
        <TabsContent value="pendentes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Notas Fiscais Pendentes de Emissão</CardTitle>
              <CardDescription>Notas aguardando processamento e envio à SEFAZ</CardDescription>
            </CardHeader>
            <CardContent>
              {notasFiltradas.filter(n => n.status === 'pendente' || n.status === 'rascunho' || n.status === 'rejeitada').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma nota pendente de emissão
                </div>
              ) : (
                <div className="space-y-3">
                  {notasFiltradas
                    .filter(n => n.status === 'pendente' || n.status === 'rascunho' || n.status === 'rejeitada')
                    .map(nota => (
                      <div key={nota.id} className="p-4 border rounded-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold">NF-e {nota.numero}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorStatus(nota.status)}`}>
                                {getStatusLabel(nota.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{nota.cliente_razao_social}</p>
                            <p className="text-xs text-gray-500">CNPJ: {nota.cliente_cnpj}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Emissão</p>
                            <p className="text-sm">{formatDate(nota.data_emissao)}</p>
                            {nota.cirurgia_numero && (
                              <>
                                <p className="text-xs text-gray-500 mt-2">Cirurgia</p>
                                <p className="text-sm font-semibold">{nota.cirurgia_numero}</p>
                              </>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Valor Total</p>
                            <p className="text-lg font-bold">{formatCurrency(nota.valor_total)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {nota.itens.length} item(ns)
                            </p>
                          </div>

                          <div className="flex flex-col gap-2">
                            {nota.status === 'rejeitada' && (
                              <div className="p-2 bg-red-50 rounded border border-red-200 mb-2">
                                <p className="text-xs text-red-900">
                                  <strong>Rejeitada:</strong> {nota.motivo_rejeicao}
                                </p>
                              </div>
                            )}
                            <Button size="sm" className="w-full">Emitir NF-e</Button>
                            <Button size="sm" variant="outline" className="w-full">Editar</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: EMITIDAS */}
        <TabsContent value="emitidas" className="space-y-4">
          {/* Filtros */}
          <Card className="neomorphic">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Buscar (número, cliente, chave...)"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atual">Mês Atual</SelectItem>
                    <SelectItem value="todos">Todos os Períodos</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500 flex items-center">
                  {notasFiltradas.filter(n => n.status === 'autorizada').length} nota(s) encontrada(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Notas Emitidas */}
          <div className="space-y-3">
            {notasFiltradas
              .filter(n => n.status === 'autorizada')
              .map(nota => (
                <Card key={nota.id} className="neomorphic">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                      {/* Coluna 1: Info Básica */}
                      <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">NF-e {nota.numero}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorStatus(nota.status)}`}>
                            {getStatusLabel(nota.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{nota.cliente_razao_social}</p>
                        <p className="text-xs text-gray-500 mt-1">CNPJ: {nota.cliente_cnpj}</p>
                      </div>

                      {/* Coluna 2: Datas */}
                      <div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Emissão</p>
                            <p className="text-sm">{formatDate(nota.data_emissao)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Autorização</p>
                            <p className="text-sm">{nota.data_autorizacao ? formatDate(nota.data_autorizacao) : '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Coluna 3: Valores */}
                      <div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Valor Produtos</p>
                            <p className="font-semibold">{formatCurrency(nota.valor_produtos)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Impostos</p>
                            <p className="text-sm text-red-600">{formatCurrency(nota.impostos.valor_aproximado_tributos)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Valor Total</p>
                            <p className="text-lg font-bold">{formatCurrency(nota.valor_total)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Coluna 4: SEFAZ */}
                      <div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Protocolo</p>
                            <p className="text-sm font-mono">{nota.protocolo_autorizacao}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Chave de Acesso</p>
                            <p className="text-xs font-mono break-all">{nota.chave_acesso}</p>
                          </div>
                        </div>
                      </div>

                      {/* Coluna 5: Ações */}
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="w-full">📄 Download XML</Button>
                        <Button size="sm" variant="outline" className="w-full">📋 Download DANFE</Button>
                        <Button size="sm" variant="outline" className="w-full">✉️ Enviar Email</Button>
                        <Button size="sm" variant="destructive" className="w-full">❌ Cancelar</Button>
                      </div>
                    </div>

                    {/* Itens */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Produtos ({nota.itens.length})</p>
                      <div className="space-y-1">
                        {nota.itens.map(item => (
                          <div key={item.id} className="text-sm flex justify-between">
                            <span>
                              {item.quantidade}x {item.descricao}
                              {item.lote && <span className="text-xs text-gray-500 ml-2">(Lote: {item.lote})</span>}
                            </span>
                            <span className="font-semibold">{formatCurrency(item.valor_total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* TAB: CANCELADAS */}
        <TabsContent value="canceladas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Notas Fiscais Canceladas</CardTitle>
              <CardDescription>Histórico de cancelamentos</CardDescription>
            </CardHeader>
            <CardContent>
              {notasFiltradas.filter(n => n.status === 'cancelada').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma nota cancelada
                </div>
              ) : (
                <div className="space-y-3">
                  {notasFiltradas
                    .filter(n => n.status === 'cancelada')
                    .map(nota => (
                      <div key={nota.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold">NF-e {nota.numero}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorStatus(nota.status)}`}>
                                CANCELADA
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{nota.cliente_razao_social}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Emissão: {formatDate(nota.data_emissao)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Cancelamento</p>
                            <p className="text-sm">{nota.data_cancelamento ? formatDate(nota.data_cancelamento) : '-'}</p>
                            <p className="text-xs text-gray-500 mt-2">Protocolo</p>
                            <p className="text-sm font-mono">{nota.protocolo_cancelamento}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Justificativa</p>
                            <p className="text-sm">{nota.justificativa_cancelamento}</p>
                            <p className="text-sm font-bold mt-2">{formatCurrency(nota.valor_total)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Relatórios Fiscais</CardTitle>
              <CardDescription>Análises e consolidações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumo Mensal */}
                <div>
                  <h3 className="font-semibold mb-3">Resumo Mensal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500">Notas Emitidas</p>
                      <p className="text-2xl font-bold">{notasEmitidas}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500">Valor Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(valorTotalFaturado)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500">Total Impostos</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalImpostos)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500">Ticket Médio</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(notasEmitidas > 0 ? valorTotalFaturado / notasEmitidas : 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Breakdown por Status */}
                <div>
                  <h3 className="font-semibold mb-3">Por Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {(['autorizada', 'pendente', 'cancelada', 'rejeitada'] as StatusNFe[]).map(status => {
                      const count = notasMesAtual.filter(n => n.status === status).length
                      const valor = notasMesAtual
                        .filter(n => n.status === status)
                        .reduce((sum, n) => sum + n.valor_total, 0)
                      return (
                        <div key={status} className="p-4 border rounded-lg">
                          <div className={`text-xs px-2 py-0.5 rounded-full border inline-block mb-2 ${getBadgeColorStatus(status)}`}>
                            {getStatusLabel(status)}
                          </div>
                          <p className="text-xl font-bold">{count}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatCurrency(valor)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
