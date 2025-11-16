/**
 * ICARUS v5.0 - Módulo: Estoque IA
 *
 * Categoria: Core Business
 * Descrição: Gestão inteligente de estoque OPME com IA
 *
 * CONTEXTO DE NEGÓCIO:
 * - Distribuidora de dispositivos médicos (OPME) B2B
 * - Produtos de alto valor unitário (R$ 5k - R$ 100k+)
 * - Rastreabilidade obrigatória ANVISA (lote, validade, paciente)
 * - Consignação em hospitais
 * - Giro variável (produtos de alta rotação vs baixa rotação)
 * - Validades críticas (produtos médicos perecíveis)
 * - Ruptura = cirurgia cancelada = perda de receita
 *
 * FUNCIONALIDADES:
 * - Gestão de estoque em tempo real
 * - Predição de demanda com IA (baseada em cirurgias agendadas)
 * - Alertas inteligentes (crítico, vencendo, ruptura iminente)
 * - Rastreabilidade completa de lotes
 * - Controle de validades (ANVISA)
 * - Sugestões de reabastecimento automático
 * - Análise de giro de estoque
 * - Gestão de consignação
 * - Integração com cirurgias (consumo previsto vs real)
 *
 * KPIs:
 * - Valor Total do Estoque
 * - Produtos em Estoque Crítico
 * - Produtos Vencendo (próximos 60 dias)
 * - Taxa de Giro (dias)
 *
 * Abas:
 * - Overview: KPIs + alertas + produtos críticos
 * - Produtos: Lista completa com filtros avançados
 * - Movimentações: Histórico de entradas/saídas
 * - Validades: Controle de vencimentos
 * - IA: Predições, reabastecimento, insights
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
  Package, AlertTriangle, TrendingUp, Brain, RefreshCw,
  ArrowUp, ArrowDown, ChevronRight
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { toast } from 'sonner'

// ==================== INTERFACES ====================

type UrgenciaEstoque = 'critico' | 'baixo' | 'adequado' | 'alto'
type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste' | 'consignacao' | 'devolucao'
type StatusValidade = 'valido' | 'vencendo' | 'vencido'

interface ProdutoEstoque {
  id: number
  codigo: string
  nome: string
  categoria: string
  fabricante: string

  // Estoque
  quantidade_total: number
  quantidade_disponivel: number
  quantidade_consignada: number
  quantidade_reservada: number
  estoque_minimo: number
  estoque_maximo: number
  ponto_pedido: number
  urgencia: UrgenciaEstoque

  // Financeiro
  valor_unitario: number
  valor_total_estoque: number
  custo_medio: number

  // Rastreabilidade
  lotes: LoteEstoque[]

  // Análise
  giro_medio_dias: number
  demanda_mensal: number
  consumo_previsto_30d: number // Baseado em cirurgias agendadas

  // Metadados
  ultima_entrada: string
  ultima_saida: string
  created_at: string
  updated_at: string
}

interface LoteEstoque {
  id: number
  produto_id: number
  lote: string
  quantidade: number
  validade: string
  status_validade: StatusValidade
  dias_para_vencer: number
  valor_unitario: number
  fornecedor: string
  nota_fiscal: string
  data_entrada: string
  localizacao?: string // Físico ou Hospital (consignação)
}

interface MovimentacaoEstoque {
  id: number
  tipo: TipoMovimentacao
  produto_id: number
  produto_nome: string
  lote: string
  quantidade: number
  valor_unitario: number
  valor_total: number

  // Origem/Destino
  origem?: string
  destino?: string

  // Vinculação
  cirurgia_id?: number
  nota_fiscal?: string
  fornecedor?: string
  hospital?: string

  // Rastreabilidade
  responsavel: string
  motivo?: string
  observacoes?: string

  data: string
  created_at: string
}

interface AlertaEstoque {
  id: number
  tipo: 'critico' | 'vencimento' | 'ruptura' | 'excesso' | 'giro_baixo'
  prioridade: 'alta' | 'media' | 'baixa'
  produto_id: number
  produto_nome: string
  mensagem: string
  detalhes: string
  acao_sugerida: string
  data: string
  resolvido: boolean
}

interface PrevisaoDemanda {
  produto_id: number
  produto_nome: string
  demanda_prevista_7d: number
  demanda_prevista_30d: number
  demanda_prevista_90d: number
  confianca: number // 0-100%
  baseado_em: string[]
  ultima_atualizacao: string
}

interface SugestaoReabastecimento {
  id: number
  produto_id: number
  produto_nome: string
  quantidade_atual: number
  quantidade_sugerida: number
  quantidade_pedir: number
  urgencia: 'urgente' | 'alta' | 'media' | 'baixa'
  motivo: string
  economia_potencial?: number
  prazo_sugerido: string
  fornecedor_sugerido?: string
}

interface KPIsEstoque {
  valor_total: number
  produtos_criticos: number
  produtos_vencendo: number
  taxa_giro_media: number
  acuracia_estoque: number
  valor_consignado: number
}

// ==================== COMPONENTE PRINCIPAL ====================

export function EstoqueIA() {
  const { supabase } = useSupabase()
  const { predict, analyze, recommend, chat, isLoading: aiLoading } = useIcarusBrain()

  // Estados
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([])
  const [kpis, setKPIs] = useState<KPIsEstoque>({
    valor_total: 0,
    produtos_criticos: 0,
    produtos_vencendo: 0,
    taxa_giro_media: 0,
    acuracia_estoque: 0,
    valor_consignado: 0,
  })
  const [loading, setLoading] = useState(true)

  // IA
  const [previsoes, setPrevisoes] = useState<PrevisaoDemanda[]>([])
  const [sugestoes, setSugestoes] = useState<SugestaoReabastecimento[]>([])
  const [insights, setInsights] = useState<string>('')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('todas')
  const [urgenciaFilter, setUrgenciaFilter] = useState<'todas' | UrgenciaEstoque>('todas')
  const [validadeFilter, setValidadeFilter] = useState<'todos' | StatusValidade>('todos')

  // Modal
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoEstoque | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [abaModal, setAbaModal] = useState('detalhes')

  // ==================== EFEITOS ====================

  useEffect(() => {
    loadEstoque()
  }, [])

  useEffect(() => {
    if (produtos.length > 0) {
      gerarPrevisoes()
      gerarSugestoes()
    }
  }, [produtos])

  // ==================== FUNÇÕES DE DADOS ====================

  const loadEstoque = async () => {
    setLoading(true)
    try {
      // Mock data completo
      const mockProdutos: ProdutoEstoque[] = [
        {
          id: 1,
          codigo: 'OPME-001',
          nome: 'Prótese de Joelho Premium - Tamanho M',
          categoria: 'Próteses Ortopédicas',
          fabricante: 'Smith & Nephew',
          quantidade_total: 5,
          quantidade_disponivel: 2,
          quantidade_consignada: 2,
          quantidade_reservada: 1,
          estoque_minimo: 3,
          estoque_maximo: 10,
          ponto_pedido: 5,
          urgencia: 'critico',
          valor_unitario: 35000,
          valor_total_estoque: 175000,
          custo_medio: 33500,
          lotes: [
            {
              id: 1,
              produto_id: 1,
              lote: 'LOT2025-045',
              quantidade: 3,
              validade: '2027-12-31',
              status_validade: 'valido',
              dias_para_vencer: 745,
              valor_unitario: 35000,
              fornecedor: 'Smith & Nephew Brasil',
              nota_fiscal: 'NFE-12345',
              data_entrada: '2025-10-15',
              localizacao: 'Depósito A - Prateleira 12',
            },
            {
              id: 2,
              produto_id: 1,
              lote: 'LOT2025-087',
              quantidade: 2,
              validade: '2026-06-30',
              status_validade: 'valido',
              dias_para_vencer: 590,
              valor_unitario: 35000,
              fornecedor: 'Smith & Nephew Brasil',
              nota_fiscal: 'NFE-12389',
              data_entrada: '2025-11-01',
              localizacao: 'Hospital São Lucas (Consignação)',
            },
          ],
          giro_medio_dias: 45,
          demanda_mensal: 2.5,
          consumo_previsto_30d: 3,
          ultima_entrada: '2025-11-01',
          ultima_saida: '2025-11-15',
          created_at: '2025-01-01',
          updated_at: '2025-11-15',
        },
        {
          id: 2,
          codigo: 'OPME-002',
          nome: 'Sistema de Fixação Vertebral Completo',
          categoria: 'Implantes de Coluna',
          fabricante: 'Medtronic',
          quantidade_total: 4,
          quantidade_disponivel: 1,
          quantidade_consignada: 1,
          quantidade_reservada: 2,
          estoque_minimo: 2,
          estoque_maximo: 8,
          ponto_pedido: 3,
          urgencia: 'critico',
          valor_unitario: 48000,
          valor_total_estoque: 192000,
          custo_medio: 46500,
          lotes: [
            {
              id: 3,
              produto_id: 2,
              lote: 'LOT2025-089',
              quantidade: 2,
              validade: '2027-09-15',
              status_validade: 'valido',
              dias_para_vencer: 668,
              valor_unitario: 48000,
              fornecedor: 'Medtronic Brasil',
              nota_fiscal: 'NFE-13456',
              data_entrada: '2025-10-20',
              localizacao: 'Depósito A - Prateleira 08',
            },
            {
              id: 4,
              produto_id: 2,
              lote: 'LOT2024-234',
              quantidade: 2,
              validade: '2026-03-20',
              status_validade: 'vencendo',
              dias_para_vencer: 124,
              valor_unitario: 48000,
              fornecedor: 'Medtronic Brasil',
              nota_fiscal: 'NFE-11234',
              data_entrada: '2024-12-10',
              localizacao: 'Clínica Excellence (Consignação)',
            },
          ],
          giro_medio_dias: 38,
          demanda_mensal: 3.2,
          consumo_previsto_30d: 4,
          ultima_entrada: '2025-10-20',
          ultima_saida: '2025-11-17',
          created_at: '2024-12-01',
          updated_at: '2025-11-17',
        },
        {
          id: 3,
          codigo: 'OPME-003',
          nome: 'Parafusos de Fixação Titânio 4.5mm (kit 12un)',
          categoria: 'Materiais de Síntese',
          fabricante: 'Synthes',
          quantidade_total: 45,
          quantidade_disponivel: 30,
          quantidade_consignada: 10,
          quantidade_reservada: 5,
          estoque_minimo: 15,
          estoque_maximo: 60,
          ponto_pedido: 20,
          urgencia: 'adequado',
          valor_unitario: 5000,
          valor_total_estoque: 225000,
          custo_medio: 4800,
          lotes: [
            {
              id: 5,
              produto_id: 3,
              lote: 'LOT2025-145',
              quantidade: 25,
              validade: '2028-06-30',
              status_validade: 'valido',
              dias_para_vencer: 955,
              valor_unitario: 5000,
              fornecedor: 'Synthes Brasil',
              nota_fiscal: 'NFE-14567',
              data_entrada: '2025-11-05',
              localizacao: 'Depósito B - Prateleira 03',
            },
            {
              id: 6,
              produto_id: 3,
              lote: 'LOT2025-098',
              quantidade: 20,
              validade: '2028-03-15',
              status_validade: 'valido',
              dias_para_vencer: 849,
              valor_unitario: 5000,
              fornecedor: 'Synthes Brasil',
              nota_fiscal: 'NFE-13890',
              data_entrada: '2025-10-10',
              localizacao: 'Depósito B - Prateleira 03',
            },
          ],
          giro_medio_dias: 22,
          demanda_mensal: 18,
          consumo_previsto_30d: 20,
          ultima_entrada: '2025-11-05',
          ultima_saida: '2025-11-16',
          created_at: '2025-01-01',
          updated_at: '2025-11-16',
        },
        {
          id: 4,
          codigo: 'OPME-004',
          nome: 'Cage Intersomático PEEK - 10mm',
          categoria: 'Implantes de Coluna',
          fabricante: 'Stryker',
          quantidade_total: 12,
          quantidade_disponivel: 8,
          quantidade_consignada: 3,
          quantidade_reservada: 1,
          estoque_minimo: 5,
          estoque_maximo: 20,
          ponto_pedido: 8,
          urgencia: 'adequado',
          valor_unitario: 7000,
          valor_total_estoque: 84000,
          custo_medio: 6800,
          lotes: [
            {
              id: 7,
              produto_id: 4,
              lote: 'LOT2025-102',
              quantidade: 12,
              validade: '2028-03-20',
              status_validade: 'valido',
              dias_para_vencer: 854,
              valor_unitario: 7000,
              fornecedor: 'Stryker Brasil',
              nota_fiscal: 'NFE-15678',
              data_entrada: '2025-11-08',
              localizacao: 'Depósito A - Prateleira 09',
            },
          ],
          giro_medio_dias: 35,
          demanda_mensal: 4.5,
          consumo_previsto_30d: 5,
          ultima_entrada: '2025-11-08',
          ultima_saida: '2025-11-14',
          created_at: '2025-01-01',
          updated_at: '2025-11-14',
        },
        {
          id: 5,
          codigo: 'OPME-005',
          nome: 'Placa Bloqueada Fêmur Distal 10 furos',
          categoria: 'Implantes de Trauma',
          fabricante: 'DePuy Synthes',
          quantidade_total: 6,
          quantidade_disponivel: 4,
          quantidade_consignada: 1,
          quantidade_reservada: 1,
          estoque_minimo: 3,
          estoque_maximo: 12,
          ponto_pedido: 5,
          urgencia: 'adequado',
          valor_unitario: 12000,
          valor_total_estoque: 72000,
          custo_medio: 11500,
          lotes: [
            {
              id: 8,
              produto_id: 5,
              lote: 'LOT2025-123',
              quantidade: 4,
              validade: '2027-08-15',
              status_validade: 'valido',
              dias_para_vencer: 637,
              valor_unitario: 12000,
              fornecedor: 'DePuy Synthes Brasil',
              nota_fiscal: 'NFE-16789',
              data_entrada: '2025-10-25',
              localizacao: 'Depósito A - Prateleira 15',
            },
            {
              id: 9,
              produto_id: 5,
              lote: 'LOT2024-456',
              quantidade: 2,
              validade: '2026-02-28',
              status_validade: 'vencendo',
              dias_para_vencer: 104,
              valor_unitario: 12000,
              fornecedor: 'DePuy Synthes Brasil',
              nota_fiscal: 'NFE-12098',
              data_entrada: '2024-11-20',
              localizacao: 'Depósito A - Prateleira 15',
            },
          ],
          giro_medio_dias: 52,
          demanda_mensal: 2,
          consumo_previsto_30d: 2,
          ultima_entrada: '2025-10-25',
          ultima_saida: '2025-11-17',
          created_at: '2024-11-01',
          updated_at: '2025-11-17',
        },
      ]

      const mockMovimentacoes: MovimentacaoEstoque[] = [
        {
          id: 1,
          tipo: 'saida',
          produto_id: 1,
          produto_nome: 'Prótese de Joelho Premium - Tamanho M',
          lote: 'LOT2025-045',
          quantidade: 1,
          valor_unitario: 35000,
          valor_total: 35000,
          destino: 'Hospital São Lucas',
          cirurgia_id: 1,
          responsavel: 'João Silva (Logística)',
          motivo: 'Cirurgia agendada - Artroplastia',
          data: '2025-11-15T14:30:00',
          created_at: '2025-11-15T14:30:00',
        },
        {
          id: 2,
          tipo: 'entrada',
          produto_id: 3,
          produto_nome: 'Parafusos de Fixação Titânio 4.5mm (kit)',
          lote: 'LOT2025-145',
          quantidade: 25,
          valor_unitario: 5000,
          valor_total: 125000,
          origem: 'Synthes Brasil',
          nota_fiscal: 'NFE-14567',
          fornecedor: 'Synthes Brasil',
          responsavel: 'Maria Costa (Compras)',
          motivo: 'Reabastecimento programado',
          data: '2025-11-05T10:00:00',
          created_at: '2025-11-05T10:00:00',
        },
        {
          id: 3,
          tipo: 'consignacao',
          produto_id: 2,
          produto_nome: 'Sistema de Fixação Vertebral Completo',
          lote: 'LOT2024-234',
          quantidade: 2,
          valor_unitario: 48000,
          valor_total: 96000,
          destino: 'Clínica Ortopédica Excellence',
          responsavel: 'Pedro Almeida (Logística)',
          motivo: 'Consignação para cirurgias eletivas',
          observacoes: 'Prazo: 30 dias. Retorno automático se não utilizado.',
          data: '2025-10-28T09:00:00',
          created_at: '2025-10-28T09:00:00',
        },
        {
          id: 4,
          tipo: 'saida',
          produto_id: 5,
          produto_nome: 'Placa Bloqueada Fêmur Distal 10 furos',
          lote: 'LOT2025-123',
          quantidade: 1,
          valor_unitario: 12000,
          valor_total: 12000,
          destino: 'Clínica Ortopédica Excellence',
          cirurgia_id: 2,
          responsavel: 'Ana Paula (Logística)',
          motivo: 'Cirurgia urgência - Osteossíntese',
          data: '2025-11-17T12:30:00',
          created_at: '2025-11-17T12:30:00',
        },
      ]

      const mockAlertas: AlertaEstoque[] = [
        {
          id: 1,
          tipo: 'critico',
          prioridade: 'alta',
          produto_id: 1,
          produto_nome: 'Prótese de Joelho Premium - Tamanho M',
          mensagem: 'Estoque crítico: apenas 2 unidades disponíveis',
          detalhes: 'Estoque atual (5) abaixo do mínimo (3). 1 unidade reservada para cirurgia em 22/11. 2 unidades em consignação.',
          acao_sugerida: 'Solicitar reabastecimento urgente de 5 unidades. Previsão de consumo: 3 unidades nos próximos 30 dias.',
          data: '2025-11-16T08:00:00',
          resolvido: false,
        },
        {
          id: 2,
          tipo: 'vencimento',
          prioridade: 'alta',
          produto_id: 2,
          produto_nome: 'Sistema de Fixação Vertebral Completo',
          mensagem: 'Lote próximo do vencimento: 124 dias',
          detalhes: 'Lote LOT2024-234 (2 unidades) vence em 20/03/2026. Produto em consignação na Clínica Excellence.',
          acao_sugerida: 'Priorizar uso deste lote nas próximas cirurgias. Considerar promoção ou devolução ao fornecedor se não utilizado em 60 dias.',
          data: '2025-11-16T08:00:00',
          resolvido: false,
        },
        {
          id: 3,
          tipo: 'critico',
          prioridade: 'alta',
          produto_id: 2,
          produto_nome: 'Sistema de Fixação Vertebral Completo',
          mensagem: 'Estoque crítico com demanda prevista alta',
          detalhes: 'Estoque atual (4) = ponto de pedido (3). Demanda prevista: 4 unidades nos próximos 30 dias. 2 unidades já reservadas.',
          acao_sugerida: 'Reabastecer 6 unidades imediatamente para cobrir demanda + margem de segurança.',
          data: '2025-11-16T08:00:00',
          resolvido: false,
        },
        {
          id: 4,
          tipo: 'vencimento',
          prioridade: 'media',
          produto_id: 5,
          produto_nome: 'Placa Bloqueada Fêmur Distal 10 furos',
          mensagem: 'Lote próximo do vencimento: 104 dias',
          detalhes: 'Lote LOT2024-456 (2 unidades) vence em 28/02/2026.',
          acao_sugerida: 'Utilizar este lote prioritariamente. Giro médio: 52 dias, portanto deve ser consumido naturalmente.',
          data: '2025-11-16T08:00:00',
          resolvido: false,
        },
      ]

      setProdutos(mockProdutos)
      setMovimentacoes(mockMovimentacoes)
      setAlertas(mockAlertas)
      calculateKPIs(mockProdutos)
    } catch (error) {
      console.error('Erro ao carregar estoque:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateKPIs = (data: ProdutoEstoque[]) => {
    const valorTotal = data.reduce((acc, p) => acc + p.valor_total_estoque, 0)
    const produtosCriticos = data.filter(p => p.urgencia === 'critico').length
    const produtosVencendo = data.filter(p =>
      p.lotes.some(l => l.status_validade === 'vencendo')
    ).length
    const taxaGiro = data.reduce((acc, p) => acc + p.giro_medio_dias, 0) / data.length
    const valorConsignado = data.reduce((acc, p) =>
      acc + (p.quantidade_consignada * p.valor_unitario), 0
    )

    setKPIs({
      valor_total: valorTotal,
      produtos_criticos: produtosCriticos,
      produtos_vencendo: produtosVencendo,
      taxa_giro_media: Math.round(taxaGiro),
      acuracia_estoque: 98.5,
      valor_consignado: valorConsignado,
    })
  }

  const gerarPrevisoes = async () => {
    // Simular predições de IA
    const mockPrevisoes: PrevisaoDemanda[] = produtos.map(p => ({
      produto_id: p.id,
      produto_nome: p.nome,
      demanda_prevista_7d: Math.ceil(p.demanda_mensal * 0.25),
      demanda_prevista_30d: p.consumo_previsto_30d,
      demanda_prevista_90d: Math.ceil(p.demanda_mensal * 3.2),
      confianca: 75 + Math.random() * 20,
      baseado_em: ['Histórico 6 meses', 'Cirurgias agendadas', 'Tendência sazonal'],
      ultima_atualizacao: new Date().toISOString(),
    }))
    setPrevisoes(mockPrevisoes)
  }

  const gerarSugestoes = async () => {
    // Gerar sugestões baseadas em regras + IA
    const mockSugestoes: SugestaoReabastecimento[] = []

    produtos.forEach(p => {
      if (p.quantidade_disponivel <= p.ponto_pedido) {
        const quantidadePedir = p.estoque_maximo - p.quantidade_total
        mockSugestoes.push({
          id: p.id,
          produto_id: p.id,
          produto_nome: p.nome,
          quantidade_atual: p.quantidade_total,
          quantidade_sugerida: p.estoque_maximo,
          quantidade_pedir: quantidadePedir,
          urgencia: p.urgencia === 'critico' ? 'urgente' : 'alta',
          motivo: `Estoque em ${p.quantidade_disponivel} unidades (ponto de pedido: ${p.ponto_pedido}). Consumo previsto 30d: ${p.consumo_previsto_30d} unidades.`,
          prazo_sugerido: p.urgencia === 'critico' ? 'Imediato' : '7 dias',
          fornecedor_sugerido: p.fabricante,
        })
      }
    })

    setSugestoes(mockSugestoes)
  }

  const handleGerarInsights = async () => {
    try {
      const prompt = `Analise o estoque OPME da distribuidora e forneça insights estratégicos:

RESUMO ESTOQUE:
- Valor Total: ${formatCurrency(kpis.valor_total)}
- Produtos Críticos: ${kpis.produtos_criticos}
- Produtos Vencendo: ${kpis.produtos_vencendo}
- Giro Médio: ${kpis.taxa_giro_media} dias
- Valor Consignado: ${formatCurrency(kpis.valor_consignado)}

ALERTAS ATIVOS: ${alertas.filter(a => !a.resolvido).length}

TOP 3 PRODUTOS CRÍTICOS:
${produtos.filter(p => p.urgencia === 'critico').slice(0, 3).map(p =>
  `- ${p.nome}: ${p.quantidade_disponivel}/${p.estoque_minimo} (${formatCurrency(p.valor_total_estoque)})`
).join('\n')}

Forneça:
1. Análise da saúde geral do estoque
2. Riscos identificados (financeiro, operacional)
3. Oportunidades de otimização
4. Recomendações prioritárias (3-5 ações)`

      const response = await chat(prompt)
      setInsights(response)
    } catch (error) {
      console.error('Erro ao gerar insights:', error)
    }
  }

  // ==================== HELPERS ====================

  const getUrgenciaColor = (urgencia: UrgenciaEstoque) => {
    const colors = {
      critico: 'bg-red-100 text-red-700 border-red-300',
      baixo: 'bg-orange-100 text-orange-700 border-orange-300',
      adequado: 'bg-green-100 text-green-700 border-green-300',
      alto: 'bg-blue-100 text-blue-700 border-blue-300',
    }
    return colors[urgencia]
  }

  const getUrgenciaLabel = (urgencia: UrgenciaEstoque) => {
    const labels = {
      critico: '🔴 CRÍTICO',
      baixo: '🟠 BAIXO',
      adequado: '🟢 ADEQUADO',
      alto: '🔵 ALTO',
    }
    return labels[urgencia]
  }

  const getValidadeColor = (status: StatusValidade) => {
    const colors = {
      valido: 'text-green-600',
      vencendo: 'text-orange-600',
      vencido: 'text-red-600',
    }
    return colors[status]
  }

  const getTipoMovimentacaoIcon = (tipo: TipoMovimentacao) => {
    const icons = {
      entrada: '📥',
      saida: '📤',
      ajuste: '⚙️',
      consignacao: '🏥',
      devolucao: '🔄',
    }
    return icons[tipo]
  }

  const handleAbrirDetalhes = (produto: ProdutoEstoque) => {
    setProdutoSelecionado(produto)
    setAbaModal('detalhes')
    setModalAberto(true)
  }

  // ==================== FILTROS ====================

  const produtosFiltrados = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = categoriaFilter === 'todas' || p.categoria === categoriaFilter
    const matchesUrgencia = urgenciaFilter === 'todas' || p.urgencia === urgenciaFilter
    const matchesValidade = validadeFilter === 'todos' ||
      p.lotes.some(l => l.status_validade === validadeFilter)

    return matchesSearch && matchesCategoria && matchesUrgencia && matchesValidade
  })

  const categorias = [...new Set(produtos.map(p => p.categoria))]

  // ==================== RENDERIZAÇÃO ====================

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Estoque IA"
        subtitle="Gestão inteligente de estoque com IA"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque IA</h1>
          <p className="text-muted-foreground mt-1">
            Gestão inteligente de estoque OPME com predições de IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📥 Entrada</Button>
          <Button variant="outline">📤 Saída</Button>
          <Button>+ Novo Produto</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total Estoque</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(kpis.valor_total)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Custo médio</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Produtos Críticos</CardDescription>
            <CardTitle className="text-3xl text-red-600">{kpis.produtos_criticos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Vencendo (60d)</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{kpis.produtos_vencendo}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Lotes próximos</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Giro Médio</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{kpis.taxa_giro_media}d</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Dias em estoque</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Acurácia</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{kpis.acuracia_estoque}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Inventário</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Consignado</CardDescription>
            <CardTitle className="text-2xl text-indigo-600">
              {formatCurrency(kpis.valor_consignado)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Em hospitais</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {alertas.filter(a => !a.resolvido && a.prioridade === 'alta').length > 0 && (
        <Card className="neu-soft border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚨 Alertas Críticos ({alertas.filter(a => !a.resolvido && a.prioridade === 'alta').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.filter(a => !a.resolvido && a.prioridade === 'alta').slice(0, 3).map(alerta => (
                <div
                  key={alerta.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-red-700">{alerta.mensagem}</h4>
                      <p className="text-xs text-red-600 mt-1">{alerta.detalhes}</p>
                      <p className="text-xs text-red-800 mt-2">
                        <strong>Ação:</strong> {alerta.acao_sugerida}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Resolver</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="neu-soft">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar produto ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Categorias</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={urgenciaFilter} onValueChange={(v: any) => setUrgenciaFilter(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Urgências</SelectItem>
                <SelectItem value="critico">🔴 Crítico</SelectItem>
                <SelectItem value="baixo">🟠 Baixo</SelectItem>
                <SelectItem value="adequado">🟢 Adequado</SelectItem>
                <SelectItem value="alto">🔵 Alto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={validadeFilter} onValueChange={(v: any) => setValidadeFilter(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Validades</SelectItem>
                <SelectItem value="valido">Válidos</SelectItem>
                <SelectItem value="vencendo">Vencendo</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="produtos">Produtos ({produtosFiltrados.length})</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="validades">Validades</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
        </TabsList>

        {/* TAB: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Produtos Críticos</CardTitle>
                <CardDescription>Estoque abaixo do mínimo ou ponto de pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {produtos.filter(p => p.urgencia === 'critico').map(produto => (
                    <div
                      key={produto.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleAbrirDetalhes(produto)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{produto.nome}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Código: {produto.codigo} • {produto.categoria}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span>
                              Disponível: <strong className="text-red-600">{produto.quantidade_disponivel}</strong>
                            </span>
                            <span>
                              Mínimo: <strong>{produto.estoque_minimo}</strong>
                            </span>
                            <span>
                              Previsto 30d: <strong>{produto.consumo_previsto_30d}</strong>
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${getUrgenciaColor(produto.urgencia)}`}>
                          {getUrgenciaLabel(produto.urgencia)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Lotes Vencendo</CardTitle>
                <CardDescription>Próximos 60 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {produtos.flatMap(p =>
                    p.lotes
                      .filter(l => l.status_validade === 'vencendo')
                      .map(lote => ({ ...lote, produto: p }))
                  ).slice(0, 5).map(lote => (
                    <div key={lote.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-semibold text-sm">{lote.produto.nome}</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Lote:</span> {lote.lote}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qtd:</span> {lote.quantidade}
                        </div>
                        <div className={getValidadeColor(lote.status_validade)}>
                          <span className="text-muted-foreground text-gray-600">Validade:</span> {formatDate(lote.validade)}
                        </div>
                        <div className="text-orange-600">
                          <strong>{lote.dias_para_vencer} dias</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Produtos */}
        <TabsContent value="produtos" className="space-y-4">
          {produtosFiltrados.map(produto => (
            <Card
              key={produto.id}
              className="neu-soft cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleAbrirDetalhes(produto)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{produto.nome}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getUrgenciaColor(produto.urgencia)}`}>
                        {getUrgenciaLabel(produto.urgencia)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {produto.codigo} • {produto.categoria} • {produto.fabricante}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(produto.valor_total_estoque)}</p>
                    <p className="text-xs text-muted-foreground">Valor em estoque</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Disponível</p>
                    <p className="font-bold text-lg">{produto.quantidade_disponivel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Consignado</p>
                    <p className="font-bold text-lg">{produto.quantidade_consignada}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reservado</p>
                    <p className="font-bold text-lg">{produto.quantidade_reservada}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Giro Médio</p>
                    <p className="font-bold text-lg">{produto.giro_medio_dias}d</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Previsto 30d</p>
                    <p className="font-bold text-lg">{produto.consumo_previsto_30d}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Lotes em estoque ({produto.lotes.length})</p>
                  <div className="flex gap-2">
                    {produto.lotes.map(lote => (
                      <span
                        key={lote.id}
                        className={`px-2 py-1 text-xs rounded ${
                          lote.status_validade === 'vencendo' ? 'bg-orange-100 text-orange-700' :
                          lote.status_validade === 'vencido' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}
                      >
                        {lote.lote} ({lote.quantidade}un)
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB: Movimentações */}
        <TabsContent value="movimentacoes" className="space-y-4">
          {movimentacoes.map(mov => (
            <Card key={mov.id} className="neu-soft">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{getTipoMovimentacaoIcon(mov.tipo)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{mov.produto_nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mov.tipo.toUpperCase()} • Lote: {mov.lote} • Qtd: {mov.quantidade}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(mov.valor_total)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(mov.data)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      {mov.origem && <p><strong>Origem:</strong> {mov.origem}</p>}
                      {mov.destino && <p><strong>Destino:</strong> {mov.destino}</p>}
                      {mov.responsavel && <p><strong>Responsável:</strong> {mov.responsavel}</p>}
                      {mov.motivo && <p><strong>Motivo:</strong> {mov.motivo}</p>}
                    </div>
                    {mov.observacoes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{mov.observacoes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB: Validades */}
        <TabsContent value="validades" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {produtos.flatMap(p =>
              p.lotes.map(lote => ({ ...lote, produto: p }))
            ).sort((a, b) => a.dias_para_vencer - b.dias_para_vencer).map(lote => (
              <Card key={lote.id} className={`border-l-4 ${
                lote.status_validade === 'vencido' ? 'border-l-red-500' :
                lote.status_validade === 'vencendo' ? 'border-l-orange-500' :
                'border-l-green-500'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{lote.produto.nome}</CardTitle>
                  <CardDescription>Lote: {lote.lote}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantidade:</span>
                      <strong>{lote.quantidade} un</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validade:</span>
                      <strong className={getValidadeColor(lote.status_validade)}>
                        {formatDate(lote.validade)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dias:</span>
                      <strong className={getValidadeColor(lote.status_validade)}>
                        {lote.dias_para_vencer} dias
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Localização:</span>
                      <span className="text-xs">{lote.localizacao}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <strong>{formatCurrency(lote.quantidade * lote.valor_unitario)}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: IA */}
        <TabsContent value="ia" className="space-y-4">
          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Sugestões de Reabastecimento</CardTitle>
              <CardDescription>Baseado em IA e regras de negócio</CardDescription>
            </CardHeader>
            <CardContent>
              {sugestoes.length > 0 ? (
                <div className="space-y-3">
                  {sugestoes.map(sug => (
                    <div key={sug.id} className={`p-4 rounded-lg border-l-4 ${
                      sug.urgencia === 'urgente' ? 'border-l-red-500 bg-red-50' :
                      sug.urgencia === 'alta' ? 'border-l-orange-500 bg-orange-50' :
                      'border-l-yellow-500 bg-yellow-50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{sug.produto_nome}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{sug.motivo}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                          sug.urgencia === 'urgente' ? 'bg-red-100 text-red-700' :
                          sug.urgencia === 'alta' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sug.urgencia}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Atual</p>
                          <p className="font-bold">{sug.quantidade_atual} un</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Sugerido</p>
                          <p className="font-bold text-green-600">{sug.quantidade_sugerida} un</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Pedir</p>
                          <p className="font-bold text-blue-600">{sug.quantidade_pedir} un</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Prazo:</span> <strong>{sug.prazo_sugerido}</strong>
                          {sug.fornecedor_sugerido && (
                            <> • <span className="text-muted-foreground">Fornecedor:</span> {sug.fornecedor_sugerido}</>
                          )}
                        </div>
                        <Button size="sm">Gerar Pedido</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma sugestão de reabastecimento no momento
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Insights Estratégicos de IA</CardTitle>
              <CardDescription>Análise inteligente do estoque</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGerarInsights} disabled={aiLoading} className="w-full">
                {aiLoading ? 'Gerando...' : '🤖 Gerar Insights'}
              </Button>

              {insights && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-900">Análise de IA:</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{insights}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Previsões de Demanda</CardTitle>
              <CardDescription>Próximos 7, 30 e 90 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previsoes.slice(0, 5).map(prev => (
                  <div key={prev.produto_id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">{prev.produto_nome}</h4>
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">7 dias</p>
                        <p className="font-bold">{prev.demanda_prevista_7d} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">30 dias</p>
                        <p className="font-bold">{prev.demanda_prevista_30d} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">90 dias</p>
                        <p className="font-bold">{prev.demanda_prevista_90d} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confiança</p>
                        <p className="font-bold text-green-600">{prev.confianca.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-3xl">
          {produtoSelecionado && (
            <>
              <DialogHeader>
                <DialogTitle>{produtoSelecionado.nome}</DialogTitle>
                <DialogDescription>
                  {produtoSelecionado.codigo} • {produtoSelecionado.categoria}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-xl">{produtoSelecionado.quantidade_total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Disponível</p>
                    <p className="font-bold text-xl text-green-600">{produtoSelecionado.quantidade_disponivel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor</p>
                    <p className="font-bold text-lg">{formatCurrency(produtoSelecionado.valor_total_estoque)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Lotes</h4>
                  <div className="space-y-2">
                    {produtoSelecionado.lotes.map(lote => (
                      <div key={lote.id} className="p-2 bg-accent/30 rounded text-sm">
                        <div className="flex justify-between">
                          <span><strong>Lote:</strong> {lote.lote}</span>
                          <span><strong>Qtd:</strong> {lote.quantidade}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className={getValidadeColor(lote.status_validade)}>
                            <strong>Validade:</strong> {formatDate(lote.validade)} ({lote.dias_para_vencer}d)
                          </span>
                          <span>{lote.localizacao}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setModalAberto(false)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
