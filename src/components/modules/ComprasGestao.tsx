/**
 * ICARUS v5.0 - Módulo: Gestão de Compras
 *
 * Categoria: Compras & Fornecedores
 * Descrição: Gestão de cotações e pedidos de compra
 *
 * CONTEXTO DE NEGÓCIO:
 * - Distribuidora de dispositivos médicos (OPME) B2B
 * - Compras de produtos de alto valor (R$ 5k - R$ 100k+)
 * - Necessidade de múltiplas cotações para comparação
 * - Gestão de fornecedores (nacionais e internacionais)
 * - Aprovação de compras por alçadas (valor do pedido)
 * - Controle de prazos de entrega críticos
 * - Rastreabilidade: Pedido → NF Compra → Estoque → Venda
 *
 * FUNCIONALIDADES:
 * - Gestão completa de cotações (solicitação, recebimento, comparação)
 * - Criação e aprovação de pedidos de compra
 * - Workflow de aprovações por alçada
 * - Comparativo de fornecedores (preço, prazo, qualidade)
 * - Histórico de compras por produto/fornecedor
 * - Alertas de prazos e aprovações pendentes
 * - Previsão de necessidade de compra (baseada em estoque + demanda)
 * - Análise de performance de fornecedores
 * - Integração com estoque (atualização automática)
 *
 * KPIs:
 * - Total de Compras (mês)
 * - Economia com Cotações (vs primeira cotação)
 * - Pedidos Pendentes de Aprovação
 * - Fornecedores Ativos
 * - Prazo Médio de Entrega
 *
 * Abas:
 * - Overview: KPIs + cotações abertas + pedidos pendentes
 * - Cotações: Gestão de solicitações de cotação
 * - Pedidos: Pedidos de compra (aprovados/aguardando)
 * - Aprovações: Workflow de aprovações
 * - Relatórios: Performance de fornecedores
 * - IA: Predições de necessidade, melhores fornecedores
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatCurrency, formatDate } from '@/lib/utils'

// ==================== INTERFACES ====================

type StatusCotacao = 'aberta' | 'em_analise' | 'respondida' | 'parcial' | 'fechada' | 'cancelada'
type StatusPedido = 'rascunho' | 'aguardando_aprovacao' | 'aprovado' | 'rejeitado' | 'enviado' | 'recebido_parcial' | 'recebido_total' | 'cancelado'
type TipoFornecedor = 'nacional' | 'internacional'
type PrioridadeCompra = 'baixa' | 'normal' | 'alta' | 'urgente'
type StatusAprovacao = 'pendente' | 'aprovado' | 'rejeitado'

interface Fornecedor {
  id: number
  razao_social: string
  nome_fantasia: string
  cnpj?: string
  tipo: TipoFornecedor
  pais: string
  cidade: string
  estado: string
  contato_principal: string
  email: string
  telefone: string

  // Performance
  nota_qualidade: number // 0-10
  prazo_medio_entrega_dias: number
  taxa_conformidade: number // % de produtos conformes
  total_comprado_12m: number

  // Status
  ativo: boolean
  data_cadastro: string
  ultima_compra: string
}

interface SolicitacaoCotacao {
  id: number
  numero: string
  data_abertura: string
  data_fechamento?: string
  prazo_resposta: string
  status: StatusCotacao
  prioridade: PrioridadeCompra

  // Solicitante
  solicitante: string
  departamento: string
  justificativa: string

  // Itens
  itens: ItemCotacao[]

  // Cotações recebidas
  cotacoes_recebidas: CotacaoFornecedor[]

  // Resultado
  fornecedor_selecionado_id?: number
  economia_obtida?: number
  observacoes?: string
}

interface ItemCotacao {
  id: number
  produto_id: number
  codigo_produto: string
  descricao: string
  especificacao_tecnica: string
  quantidade_solicitada: number
  unidade: string
  prazo_entrega_desejado: string
  observacoes?: string
}

interface CotacaoFornecedor {
  id: number
  solicitacao_cotacao_id: number
  fornecedor_id: number
  fornecedor_nome: string
  data_envio: string
  data_resposta?: string
  validade_proposta: string

  // Itens cotados
  itens: ItemCotacaoFornecedor[]

  // Totais
  valor_total: number
  prazo_entrega_dias: number
  forma_pagamento: string
  condicao_pagamento: string

  // Observações
  observacoes?: string

  // Status
  selecionada: boolean
}

interface ItemCotacaoFornecedor {
  id: number
  item_cotacao_id: number
  valor_unitario: number
  valor_total: number
  prazo_entrega: string
  marca?: string
  modelo?: string
  disponibilidade: 'imediata' | 'sob_encomenda' | 'importacao'
  observacoes?: string
}

interface PedidoCompra {
  id: number
  numero: string
  tipo: 'nacional' | 'internacional'
  data_emissao: string
  data_aprovacao?: string
  data_envio?: string
  previsao_entrega: string
  status: StatusPedido
  prioridade: PrioridadeCompra

  // Fornecedor
  fornecedor_id: number
  fornecedor_nome: string
  fornecedor_cnpj?: string

  // Origem
  solicitacao_cotacao_id?: number
  cotacao_fornecedor_id?: number

  // Itens
  itens: ItemPedidoCompra[]

  // Valores
  valor_produtos: number
  valor_frete: number
  valor_seguro: number
  valor_impostos: number
  valor_total: number

  // Pagamento
  forma_pagamento: string
  condicao_pagamento: string

  // Aprovação
  aprovacoes: AprovacaoPedido[]
  aprovacao_final: boolean

  // Recebimento
  notas_fiscais_vinculadas: string[]
  percentual_recebido: number

  // Observações
  observacoes?: string

  // Responsável
  comprador: string
  created_at: string
  updated_at: string
}

interface ItemPedidoCompra {
  id: number
  numero_item: number
  produto_id: number
  codigo_produto: string
  descricao: string
  quantidade_pedida: number
  quantidade_recebida: number
  unidade: string
  valor_unitario: number
  valor_total: number
  prazo_entrega: string

  // Rastreabilidade
  lote_esperado?: string
  validade_minima?: string

  observacoes?: string
}

interface AprovacaoPedido {
  id: number
  pedido_compra_id: number
  nivel_aprovacao: number
  aprovador: string
  cargo_aprovador: string
  alcada_minima: number
  alcada_maxima: number
  status: StatusAprovacao
  data_aprovacao?: string
  justificativa?: string
  observacoes?: string
}

interface AlertaCompras {
  id: number
  tipo: 'cotacao_vencendo' | 'aprovacao_pendente' | 'pedido_atrasado' | 'fornecedor_inativo' | 'preco_acima_media'
  prioridade: 'alta' | 'media' | 'baixa'
  mensagem: string
  acao_sugerida: string
  referencia_id?: number
  data: string
}

interface PrevisaoCompraIA {
  produto_id: number
  produto_codigo: string
  produto_nome: string

  // Análise de Estoque
  estoque_atual: number
  estoque_minimo: number
  ponto_pedido: number
  dias_para_ruptura: number

  // Demanda Prevista
  demanda_prevista_30d: number
  demanda_prevista_60d: number
  demanda_prevista_90d: number
  confianca: number

  // Sugestão de Compra
  quantidade_sugerida: number
  prazo_compra_sugerido: string
  urgencia: 'urgente' | 'alta' | 'normal' | 'baixa'

  // Fornecedor Recomendado
  fornecedor_recomendado_id: number
  fornecedor_recomendado_nome: string
  motivo_recomendacao: string
  preco_estimado: number
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function ComprasGestao() {
  // State
  const [activeTab, setActiveTab] = useState('overview')
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [cotacoes, setCotacoes] = useState<SolicitacaoCotacao[]>([])
  const [pedidos, setPedidos] = useState<PedidoCompra[]>([])
  const [alertas, setAlertas] = useState<AlertaCompras[]>([])
  const [previsoesIA, setPrevisoesIA] = useState<PrevisaoCompraIA[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  // ==================== MOCK DATA ====================

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)

    // Mock Fornecedores
    const mockFornecedores: Fornecedor[] = [
      {
        id: 1,
        razao_social: 'Medtronic Brasil Comercial Ltda',
        nome_fantasia: 'Medtronic',
        cnpj: '42.332.352/0001-04',
        tipo: 'nacional',
        pais: 'Brasil',
        cidade: 'São Paulo',
        estado: 'SP',
        contato_principal: 'Ricardo Sales',
        email: 'ricardo.sales@medtronic.com',
        telefone: '(11) 3456-7890',
        nota_qualidade: 9.5,
        prazo_medio_entrega_dias: 7,
        taxa_conformidade: 98.5,
        total_comprado_12m: 2500000,
        ativo: true,
        data_cadastro: '2020-01-15',
        ultima_compra: '2025-11-10'
      },
      {
        id: 2,
        razao_social: 'Stryker do Brasil Ltda',
        nome_fantasia: 'Stryker',
        cnpj: '61.569.873/0001-65',
        tipo: 'nacional',
        pais: 'Brasil',
        cidade: 'São Paulo',
        estado: 'SP',
        contato_principal: 'Ana Paula Costa',
        email: 'ana.costa@stryker.com',
        telefone: '(11) 3789-4560',
        nota_qualidade: 9.2,
        prazo_medio_entrega_dias: 10,
        taxa_conformidade: 96.8,
        total_comprado_12m: 1800000,
        ativo: true,
        data_cadastro: '2019-06-20',
        ultima_compra: '2025-11-12'
      },
      {
        id: 3,
        razao_social: 'Johnson & Johnson Medical Devices',
        nome_fantasia: 'J&J Medical',
        tipo: 'internacional',
        pais: 'Estados Unidos',
        cidade: 'Miami',
        estado: 'FL',
        contato_principal: 'Michael Johnson',
        email: 'michael.j@jnj.com',
        telefone: '+1 (305) 555-1234',
        nota_qualidade: 9.8,
        prazo_medio_entrega_dias: 45,
        taxa_conformidade: 99.2,
        total_comprado_12m: 3200000,
        ativo: true,
        data_cadastro: '2018-03-10',
        ultima_compra: '2025-10-25'
      }
    ]

    // Mock Cotações
    const mockCotacoes: SolicitacaoCotacao[] = [
      {
        id: 1,
        numero: 'COT-2025-001',
        data_abertura: '2025-11-10',
        prazo_resposta: '2025-11-20',
        status: 'respondida',
        prioridade: 'alta',
        solicitante: 'Carlos Silva',
        departamento: 'Compras',
        justificativa: 'Reposição de estoque - produtos de alta rotação',
        itens: [
          {
            id: 1,
            produto_id: 101,
            codigo_produto: 'PROT-KNEE-001',
            descricao: 'Prótese Total de Joelho',
            especificacao_tecnica: 'Tamanho médio, material titânio',
            quantidade_solicitada: 10,
            unidade: 'UN',
            prazo_entrega_desejado: '2025-12-01',
            observacoes: 'Preferência por marcas aprovadas ANVISA'
          },
          {
            id: 2,
            produto_id: 102,
            codigo_produto: 'STENT-CARD-001',
            descricao: 'Stent Coronariano Farmacológico',
            especificacao_tecnica: '3.0mm x 18mm',
            quantidade_solicitada: 20,
            unidade: 'UN',
            prazo_entrega_desejado: '2025-12-01'
          }
        ],
        cotacoes_recebidas: [
          {
            id: 1,
            solicitacao_cotacao_id: 1,
            fornecedor_id: 1,
            fornecedor_nome: 'Medtronic',
            data_envio: '2025-11-10',
            data_resposta: '2025-11-12',
            validade_proposta: '2025-12-10',
            itens: [
              {
                id: 1,
                item_cotacao_id: 1,
                valor_unitario: 42000,
                valor_total: 420000,
                prazo_entrega: '2025-11-25',
                marca: 'Medtronic',
                modelo: 'Vanguard',
                disponibilidade: 'imediata'
              },
              {
                id: 2,
                item_cotacao_id: 2,
                valor_unitario: 11500,
                valor_total: 230000,
                prazo_entrega: '2025-11-25',
                marca: 'Medtronic',
                disponibilidade: 'imediata'
              }
            ],
            valor_total: 650000,
            prazo_entrega_dias: 15,
            forma_pagamento: 'Boleto',
            condicao_pagamento: '30/60 dias',
            selecionada: true
          },
          {
            id: 2,
            solicitacao_cotacao_id: 1,
            fornecedor_id: 2,
            fornecedor_nome: 'Stryker',
            data_envio: '2025-11-10',
            data_resposta: '2025-11-13',
            validade_proposta: '2025-12-10',
            itens: [
              {
                id: 3,
                item_cotacao_id: 1,
                valor_unitario: 45000,
                valor_total: 450000,
                prazo_entrega: '2025-12-05',
                marca: 'Stryker',
                modelo: 'Triathlon',
                disponibilidade: 'sob_encomenda'
              },
              {
                id: 4,
                item_cotacao_id: 2,
                valor_unitario: 12000,
                valor_total: 240000,
                prazo_entrega: '2025-12-05',
                marca: 'Boston Scientific',
                disponibilidade: 'sob_encomenda'
              }
            ],
            valor_total: 690000,
            prazo_entrega_dias: 25,
            forma_pagamento: 'Boleto',
            condicao_pagamento: '45 dias',
            selecionada: false
          }
        ],
        fornecedor_selecionado_id: 1,
        economia_obtida: 40000,
        observacoes: 'Selecionado Medtronic por melhor custo-benefício e prazo'
      },
      {
        id: 2,
        numero: 'COT-2025-002',
        data_abertura: '2025-11-14',
        prazo_resposta: '2025-11-24',
        status: 'aberta',
        prioridade: 'urgente',
        solicitante: 'Mariana Santos',
        departamento: 'Compras',
        justificativa: 'Urgente - Estoque crítico de próteses de quadril',
        itens: [
          {
            id: 3,
            produto_id: 104,
            codigo_produto: 'PROT-HIP-001',
            descricao: 'Prótese Total de Quadril',
            especificacao_tecnica: 'Cimentada, tamanho médio',
            quantidade_solicitada: 15,
            unidade: 'UN',
            prazo_entrega_desejado: '2025-11-30',
            observacoes: 'URGENTE - Estoque em nível crítico'
          }
        ],
        cotacoes_recebidas: []
      }
    ]

    // Mock Pedidos
    const mockPedidos: PedidoCompra[] = [
      {
        id: 1,
        numero: 'PC-2025-0001',
        tipo: 'nacional',
        data_emissao: '2025-11-13',
        data_aprovacao: '2025-11-14',
        data_envio: '2025-11-14',
        previsao_entrega: '2025-11-25',
        status: 'enviado',
        prioridade: 'alta',
        fornecedor_id: 1,
        fornecedor_nome: 'Medtronic Brasil Comercial Ltda',
        fornecedor_cnpj: '42.332.352/0001-04',
        solicitacao_cotacao_id: 1,
        cotacao_fornecedor_id: 1,
        itens: [
          {
            id: 1,
            numero_item: 1,
            produto_id: 101,
            codigo_produto: 'PROT-KNEE-001',
            descricao: 'Prótese Total de Joelho',
            quantidade_pedida: 10,
            quantidade_recebida: 0,
            unidade: 'UN',
            valor_unitario: 42000,
            valor_total: 420000,
            prazo_entrega: '2025-11-25'
          },
          {
            id: 2,
            numero_item: 2,
            produto_id: 102,
            codigo_produto: 'STENT-CARD-001',
            descricao: 'Stent Coronariano Farmacológico',
            quantidade_pedida: 20,
            quantidade_recebida: 0,
            unidade: 'UN',
            valor_unitario: 11500,
            valor_total: 230000,
            prazo_entrega: '2025-11-25'
          }
        ],
        valor_produtos: 650000,
        valor_frete: 2500,
        valor_seguro: 1500,
        valor_impostos: 0,
        valor_total: 654000,
        forma_pagamento: 'Boleto',
        condicao_pagamento: '30/60 dias',
        aprovacoes: [
          {
            id: 1,
            pedido_compra_id: 1,
            nivel_aprovacao: 1,
            aprovador: 'João Pedro - Gerente de Compras',
            cargo_aprovador: 'Gerente',
            alcada_minima: 0,
            alcada_maxima: 1000000,
            status: 'aprovado',
            data_aprovacao: '2025-11-14',
            observacoes: 'Aprovado - Dentro do orçamento mensal'
          }
        ],
        aprovacao_final: true,
        notas_fiscais_vinculadas: [],
        percentual_recebido: 0,
        comprador: 'Carlos Silva',
        created_at: '2025-11-13',
        updated_at: '2025-11-14'
      },
      {
        id: 2,
        numero: 'PC-2025-0002',
        tipo: 'nacional',
        data_emissao: '2025-11-15',
        previsao_entrega: '2025-12-05',
        status: 'aguardando_aprovacao',
        prioridade: 'normal',
        fornecedor_id: 2,
        fornecedor_nome: 'Stryker do Brasil Ltda',
        fornecedor_cnpj: '61.569.873/0001-65',
        itens: [
          {
            id: 3,
            numero_item: 1,
            produto_id: 105,
            codigo_produto: 'IMPLANTE-SPINE-001',
            descricao: 'Sistema de Fixação de Coluna',
            quantidade_pedida: 5,
            quantidade_recebida: 0,
            unidade: 'KIT',
            valor_unitario: 85000,
            valor_total: 425000,
            prazo_entrega: '2025-12-05'
          }
        ],
        valor_produtos: 425000,
        valor_frete: 1800,
        valor_seguro: 1200,
        valor_impostos: 0,
        valor_total: 428000,
        forma_pagamento: 'Boleto',
        condicao_pagamento: '45 dias',
        aprovacoes: [
          {
            id: 2,
            pedido_compra_id: 2,
            nivel_aprovacao: 1,
            aprovador: 'João Pedro - Gerente de Compras',
            cargo_aprovador: 'Gerente',
            alcada_minima: 0,
            alcada_maxima: 500000,
            status: 'pendente',
            observacoes: 'Aguardando análise'
          }
        ],
        aprovacao_final: false,
        notas_fiscais_vinculadas: [],
        percentual_recebido: 0,
        comprador: 'Mariana Santos',
        created_at: '2025-11-15',
        updated_at: '2025-11-15'
      }
    ]

    // Mock Alertas
    const mockAlertas: AlertaCompras[] = [
      {
        id: 1,
        tipo: 'cotacao_vencendo',
        prioridade: 'alta',
        mensagem: 'Cotação COT-2025-002 vence em 3 dias',
        acao_sugerida: 'Cobrar fornecedores ou estender prazo',
        referencia_id: 2,
        data: '2025-11-16'
      },
      {
        id: 2,
        tipo: 'aprovacao_pendente',
        prioridade: 'media',
        mensagem: 'Pedido PC-2025-0002 aguardando aprovação (R$ 428.000)',
        acao_sugerida: 'Solicitar aprovação do Gerente de Compras',
        referencia_id: 2,
        data: '2025-11-16'
      },
      {
        id: 3,
        tipo: 'pedido_atrasado',
        prioridade: 'baixa',
        mensagem: 'Pedido PC-2025-0001 previsto para hoje, ainda não recebido',
        acao_sugerida: 'Entrar em contato com Medtronic para confirmar envio',
        referencia_id: 1,
        data: '2025-11-16'
      }
    ]

    // Mock Previsões IA
    const mockPrevisoesIA: PrevisaoCompraIA[] = [
      {
        produto_id: 104,
        produto_codigo: 'PROT-HIP-001',
        produto_nome: 'Prótese Total de Quadril',
        estoque_atual: 5,
        estoque_minimo: 10,
        ponto_pedido: 15,
        dias_para_ruptura: 7,
        demanda_prevista_30d: 8,
        demanda_prevista_60d: 15,
        demanda_prevista_90d: 22,
        confianca: 85,
        quantidade_sugerida: 20,
        prazo_compra_sugerido: 'Imediato',
        urgencia: 'urgente',
        fornecedor_recomendado_id: 1,
        fornecedor_recomendado_nome: 'Medtronic',
        motivo_recomendacao: 'Melhor histórico de prazo (7 dias) e qualidade (9.5/10)',
        preco_estimado: 760000
      },
      {
        produto_id: 106,
        produto_codigo: 'MARCA-PASSO-001',
        produto_nome: 'Marca-passo Dupla Câmara',
        estoque_atual: 12,
        estoque_minimo: 8,
        ponto_pedido: 12,
        dias_para_ruptura: 45,
        demanda_prevista_30d: 4,
        demanda_prevista_60d: 8,
        demanda_prevista_90d: 12,
        confianca: 78,
        quantidade_sugerida: 10,
        prazo_compra_sugerido: '30 dias',
        urgencia: 'normal',
        fornecedor_recomendado_id: 1,
        fornecedor_recomendado_nome: 'Medtronic',
        motivo_recomendacao: 'Especialista em dispositivos cardíacos',
        preco_estimado: 180000
      }
    ]

    setFornecedores(mockFornecedores)
    setCotacoes(mockCotacoes)
    setPedidos(mockPedidos)
    setAlertas(mockAlertas)
    setPrevisoesIA(mockPrevisoesIA)
    setLoading(false)
  }

  // ==================== CÁLCULOS E MÉTRICAS ====================

  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()

  const pedidosMesAtual = pedidos.filter(p => {
    const dataEmissao = new Date(p.data_emissao)
    return dataEmissao.getMonth() === mesAtual && dataEmissao.getFullYear() === anoAtual
  })

  const totalComprasMes = pedidosMesAtual
    .filter(p => p.status !== 'cancelado' && p.status !== 'rejeitado')
    .reduce((sum, p) => sum + p.valor_total, 0)

  const economiaTotal = cotacoes
    .filter(c => c.economia_obtida && c.economia_obtida > 0)
    .reduce((sum, c) => sum + (c.economia_obtida || 0), 0)

  const pedidosPendentesAprovacao = pedidos.filter(p => p.status === 'aguardando_aprovacao').length

  const fornecedoresAtivos = fornecedores.filter(f => f.ativo).length

  const prazoMedioEntrega = fornecedores
    .filter(f => f.ativo)
    .reduce((sum, f) => sum + f.prazo_medio_entrega_dias, 0) / (fornecedoresAtivos || 1)

  const cotacoesAbertas = cotacoes.filter(c => c.status === 'aberta' || c.status === 'parcial').length

  // ==================== FILTROS ====================

  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchStatus = filtroStatus === 'todos' || pedido.status === filtroStatus
    const matchPrioridade = filtroPrioridade === 'todos' || pedido.prioridade === filtroPrioridade
    const matchBusca = busca === '' ||
      pedido.numero.toLowerCase().includes(busca.toLowerCase()) ||
      pedido.fornecedor_nome.toLowerCase().includes(busca.toLowerCase())

    return matchStatus && matchPrioridade && matchBusca
  })

  // ==================== HELPERS ====================

  const getBadgeColorStatus = (status: StatusPedido) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800 border-green-300'
      case 'enviado': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'aguardando_aprovacao': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejeitado': return 'bg-red-100 text-red-800 border-red-300'
      case 'recebido_total': return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getBadgeColorPrioridade = (prioridade: PrioridadeCompra) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-300'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'baixa': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: StatusPedido) => {
    const labels: Record<StatusPedido, string> = {
      rascunho: 'Rascunho',
      aguardando_aprovacao: 'Aguardando Aprovação',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
      enviado: 'Enviado',
      recebido_parcial: 'Recebido Parcial',
      recebido_total: 'Recebido',
      cancelado: 'Cancelado'
    }
    return labels[status] || status
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando Gestão de Compras...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Compras</h1>
          <p className="text-muted-foreground">Cotações e pedidos de compra</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCotacaoDialogOpen(true)}>+ Nova Cotação</Button>
          <Button onClick={() => setPedidoDialogOpen(true)}>+ Novo Pedido</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Total Compras (Mês)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalComprasMes)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {pedidosMesAtual.length} pedidos realizados
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Economia com Cotações</CardDescription>
            <CardTitle className="text-3xl text-green-600">{formatCurrency(economiaTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600 font-semibold">
              Economizado em {cotacoes.filter(c => c.economia_obtida).length} cotações
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Pedidos Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pedidosPendentesAprovacao}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600 font-semibold">
              {pedidosPendentesAprovacao > 0 ? 'Aguardando aprovação' : 'Nenhum pendente'}
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Fornecedores Ativos</CardDescription>
            <CardTitle className="text-3xl">{fornecedoresAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {fornecedores.filter(f => f.tipo === 'internacional').length} internacionais
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Prazo Médio Entrega</CardDescription>
            <CardTitle className="text-3xl">{Math.round(prazoMedioEntrega)} dias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Média dos fornecedores ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cotacoes">Cotações ({cotacoesAbertas})</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="aprovacoes">Aprovações ({pedidosPendentesAprovacao})</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="ia">IA Insights</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alertas */}
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🚨 Alertas de Compras</CardTitle>
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

            {/* Cotações Abertas */}
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📋 Cotações Abertas</CardTitle>
                <CardDescription>Aguardando respostas de fornecedores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cotacoes
                    .filter(c => c.status === 'aberta' || c.status === 'parcial')
                    .map(cotacao => (
                      <div key={cotacao.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold">{cotacao.numero}</div>
                            <div className="text-sm text-gray-600">{cotacao.solicitante}</div>
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorPrioridade(cotacao.prioridade)}`}>
                            {cotacao.prioridade.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-sm mt-2">
                          <p className="text-gray-600">{cotacao.itens.length} item(ns) solicitado(s)</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Prazo: {formatDate(cotacao.prazo_resposta)}
                          </p>
                        </div>
                      </div>
                    ))}
                  {cotacoes.filter(c => c.status === 'aberta' || c.status === 'parcial').length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Nenhuma cotação aberta
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo de Fornecedores */}
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Performance de Fornecedores</CardTitle>
              <CardDescription>Top 3 fornecedores por volume de compras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fornecedores
                  .filter(f => f.ativo)
                  .sort((a, b) => b.total_comprado_12m - a.total_comprado_12m)
                  .slice(0, 3)
                  .map((fornecedor, index) => (
                    <div key={fornecedor.id} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                            <div>
                              <div className="font-bold">{fornecedor.nome_fantasia}</div>
                              <div className="text-xs text-gray-500">{fornecedor.cidade}/{fornecedor.estado}</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Comprado (12m)</p>
                          <p className="font-bold text-lg">{formatCurrency(fornecedor.total_comprado_12m)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Qualidade / Conformidade</p>
                          <p className="font-semibold">{fornecedor.nota_qualidade}/10 | {fornecedor.taxa_conformidade}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Prazo Médio</p>
                          <p className="font-semibold">{fornecedor.prazo_medio_entrega_dias} dias</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: COTAÇÕES */}
        <TabsContent value="cotacoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Solicitações de Cotação</CardTitle>
              <CardDescription>Gestão completa de cotações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cotacoes.map(cotacao => (
                  <Card key={cotacao.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{cotacao.numero}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              cotacao.status === 'respondida' ? 'bg-green-100 text-green-800 border-green-300' :
                              cotacao.status === 'aberta' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                              {cotacao.status.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorPrioridade(cotacao.prioridade)}`}>
                              {cotacao.prioridade.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{cotacao.justificativa}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Abertura</p>
                          <p className="text-sm">{formatDate(cotacao.data_abertura)}</p>
                          <p className="text-xs text-gray-500 mt-1">Prazo</p>
                          <p className="text-sm">{formatDate(cotacao.prazo_resposta)}</p>
                        </div>
                      </div>

                      {/* Itens */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Itens Solicitados ({cotacao.itens.length})</p>
                        <div className="space-y-1">
                          {cotacao.itens.map(item => (
                            <div key={item.id} className="text-sm flex justify-between bg-muted p-2 rounded">
                              <span>{item.quantidade_solicitada}x {item.descricao}</span>
                              <span className="text-gray-500">Entrega: {formatDate(item.prazo_entrega_desejado)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cotações Recebidas */}
                      {cotacao.cotacoes_recebidas.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            Cotações Recebidas ({cotacao.cotacoes_recebidas.length})
                          </p>
                          <div className="space-y-2">
                            {cotacao.cotacoes_recebidas.map(cot => (
                              <div key={cot.id} className={`p-3 rounded border ${
                                cot.selecionada ? 'bg-green-50 border-green-300' : 'bg-card border-border'
                              }`}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold">{cot.fornecedor_nome}</div>
                                    <div className="text-xs text-gray-500">
                                      Resposta: {cot.data_resposta ? formatDate(cot.data_resposta) : 'Aguardando'}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">{formatCurrency(cot.valor_total)}</div>
                                    <div className="text-xs text-gray-500">{cot.prazo_entrega_dias} dias</div>
                                    {cot.selecionada && (
                                      <div className="text-xs text-green-600 font-semibold mt-1">✓ SELECIONADA</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Economia */}
                      {cotacao.economia_obtida && cotacao.economia_obtida > 0 && (
                        <div className="p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-900">
                            <strong>💰 Economia obtida:</strong> {formatCurrency(cotacao.economia_obtida)}
                          </p>
                          {cotacao.observacoes && (
                            <p className="text-xs text-green-700 mt-1">{cotacao.observacoes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PEDIDOS */}
        <TabsContent value="pedidos" className="space-y-4">
          {/* Filtros */}
          <Card className="neomorphic">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar pedido (número, fornecedor...)"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="recebido_total">Recebido</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Prioridades</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500 flex items-center">
                  {pedidosFiltrados.length} pedido(s) encontrado(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pedidos */}
          <div className="space-y-3">
            {pedidosFiltrados.map(pedido => (
              <Card key={pedido.id} className="neomorphic">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Coluna 1: Info Básica */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">{pedido.numero}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorStatus(pedido.status)}`}>
                          {getStatusLabel(pedido.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{pedido.fornecedor_nome}</p>
                      <p className="text-xs text-gray-500 mt-1">CNPJ: {pedido.fornecedor_cnpj}</p>
                      <div className={`text-xs px-2 py-0.5 rounded-full border inline-block mt-2 ${getBadgeColorPrioridade(pedido.prioridade)}`}>
                        {pedido.prioridade.toUpperCase()}
                      </div>
                    </div>

                    {/* Coluna 2: Datas */}
                    <div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Emissão</p>
                          <p className="text-sm">{formatDate(pedido.data_emissao)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Previsão Entrega</p>
                          <p className="text-sm">{formatDate(pedido.previsao_entrega)}</p>
                        </div>
                        {pedido.data_aprovacao && (
                          <div>
                            <p className="text-xs text-gray-500">Aprovação</p>
                            <p className="text-sm">{formatDate(pedido.data_aprovacao)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coluna 3: Valores */}
                    <div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Produtos</p>
                          <p className="font-semibold">{formatCurrency(pedido.valor_produtos)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Frete + Seguro</p>
                          <p className="text-sm">{formatCurrency(pedido.valor_frete + pedido.valor_seguro)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Valor Total</p>
                          <p className="text-lg font-bold">{formatCurrency(pedido.valor_total)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 4: Ações */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="w-full">📄 Ver Detalhes</Button>
                      {pedido.status === 'aguardando_aprovacao' && (
                        <>
                          <Button size="sm" variant="default" className="w-full">✓ Aprovar</Button>
                          <Button size="sm" variant="destructive" className="w-full">✗ Rejeitar</Button>
                        </>
                      )}
                      {pedido.status === 'aprovado' && (
                        <Button size="sm" variant="default" className="w-full">📤 Enviar ao Fornecedor</Button>
                      )}
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Itens ({pedido.itens.length})</p>
                    <div className="space-y-1">
                      {pedido.itens.map(item => (
                        <div key={item.id} className="text-sm flex justify-between">
                          <span>{item.quantidade_pedida}x {item.descricao}</span>
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

        {/* TAB: APROVAÇÕES */}
        <TabsContent value="aprovacoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Pedidos Aguardando Aprovação</CardTitle>
              <CardDescription>Workflow de aprovações por alçada</CardDescription>
            </CardHeader>
            <CardContent>
              {pedidos.filter(p => p.status === 'aguardando_aprovacao').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pedido aguardando aprovação
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidos
                    .filter(p => p.status === 'aguardando_aprovacao')
                    .map(pedido => (
                      <Card key={pedido.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-lg">{pedido.numero}</div>
                              <div className="text-sm text-gray-600">{pedido.fornecedor_nome}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-xl">{formatCurrency(pedido.valor_total)}</div>
                              <div className="text-xs text-gray-500">Emissão: {formatDate(pedido.data_emissao)}</div>
                            </div>
                          </div>

                          {/* Workflow de Aprovações */}
                          <div className="border-t pt-3">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Workflow de Aprovação</p>
                            <div className="space-y-2">
                              {pedido.aprovacoes.map(aprovacao => (
                                <div key={aprovacao.id} className={`p-3 rounded border ${
                                  aprovacao.status === 'aprovado' ? 'bg-green-50 border-green-300' :
                                  aprovacao.status === 'pendente' ? 'bg-yellow-50 border-yellow-300' :
                                  'bg-red-50 border-red-300'
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-semibold text-sm">Nível {aprovacao.nivel_aprovacao}</div>
                                      <div className="text-xs text-gray-600">{aprovacao.aprovador}</div>
                                      <div className="text-xs text-gray-500">
                                        Alçada: {formatCurrency(aprovacao.alcada_minima)} - {formatCurrency(aprovacao.alcada_maxima)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-xs px-2 py-1 rounded-full border ${
                                        aprovacao.status === 'aprovado' ? 'bg-green-100 text-green-800 border-green-300' :
                                        aprovacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                        'bg-red-100 text-red-800 border-red-300'
                                      }`}>
                                        {aprovacao.status.toUpperCase()}
                                      </div>
                                      {aprovacao.data_aprovacao && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {formatDate(aprovacao.data_aprovacao)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {aprovacao.observacoes && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      {aprovacao.observacoes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1">✓ Aprovar Pedido</Button>
                            <Button size="sm" variant="destructive" className="flex-1">✗ Rejeitar Pedido</Button>
                          </div>
                        </div>
                      </Card>
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
              <CardTitle>📊 Performance de Fornecedores</CardTitle>
              <CardDescription>Análise consolidada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fornecedores
                  .filter(f => f.ativo)
                  .sort((a, b) => b.total_comprado_12m - a.total_comprado_12m)
                  .map((fornecedor, index) => (
                    <Card key={fornecedor.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                            <div>
                              <div className="font-bold">{fornecedor.nome_fantasia}</div>
                              <div className="text-xs text-gray-500">{fornecedor.razao_social}</div>
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full border inline-block mt-2 ${
                            fornecedor.tipo === 'internacional' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            'bg-blue-100 text-blue-800 border-blue-300'
                          }`}>
                            {fornecedor.tipo.toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Comprado (12m)</p>
                          <p className="font-bold text-lg">{formatCurrency(fornecedor.total_comprado_12m)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nota de Qualidade</p>
                          <p className="font-bold text-lg">{fornecedor.nota_qualidade}/10</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-green-500 rounded-full h-2" style={{ width: `${fornecedor.nota_qualidade * 10}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Taxa Conformidade</p>
                          <p className="font-bold text-lg">{fornecedor.taxa_conformidade}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-blue-500 rounded-full h-2" style={{ width: `${fornecedor.taxa_conformidade}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Prazo Médio</p>
                          <p className="font-bold text-lg">{fornecedor.prazo_medio_entrega_dias} dias</p>
                          <p className="text-xs text-gray-500 mt-1">Última compra: {formatDate(fornecedor.ultima_compra)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: IA INSIGHTS */}
        <TabsContent value="ia" className="space-y-4">
          <Card className="neomorphic border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🤖</span>
                <span>Previsões de Necessidade de Compra</span>
              </CardTitle>
              <CardDescription>
                Análise preditiva baseada em estoque e demanda prevista
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previsoesIA.map(previsao => (
                  <Card key={previsao.produto_id} className={`p-4 ${
                    previsao.urgencia === 'urgente' ? 'border-red-300' : ''
                  }`}>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{previsao.produto_nome}</h3>
                          <p className="text-sm text-gray-600">Código: {previsao.produto_codigo}</p>
                        </div>
                        <div className={`text-center px-4 py-2 rounded-lg border ${
                          previsao.urgencia === 'urgente' ? 'bg-red-100 border-red-300' :
                          previsao.urgencia === 'alta' ? 'bg-orange-100 border-orange-300' :
                          'bg-blue-100 border-blue-300'
                        }`}>
                          <p className="text-xs text-gray-600">Urgência</p>
                          <p className="text-lg font-bold uppercase">{previsao.urgencia}</p>
                        </div>
                      </div>

                      {/* Análise de Estoque */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-muted rounded border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Estoque Atual vs Mínimo</p>
                          <p className="text-xl font-bold">
                            {previsao.estoque_atual} / {previsao.estoque_minimo}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`rounded-full h-2 ${
                                previsao.estoque_atual < previsao.estoque_minimo ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((previsao.estoque_atual / previsao.estoque_minimo) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded border border-orange-200">
                          <p className="text-xs text-orange-700 mb-1">Dias para Ruptura</p>
                          <p className="text-xl font-bold text-orange-900">{previsao.dias_para_ruptura} dias</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Demanda Prevista 30d</p>
                          <p className="text-xl font-bold text-blue-900">{previsao.demanda_prevista_30d} unidades</p>
                          <p className="text-xs text-blue-600 mt-1">Confiança: {previsao.confianca}%</p>
                        </div>
                      </div>

                      {/* Sugestão de Compra */}
                      <div className="p-4 bg-green-50 rounded border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">💡 Sugestão de Compra</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-green-700">Quantidade Sugerida</p>
                            <p className="text-lg font-bold text-green-900">{previsao.quantidade_sugerida} unidades</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-700">Prazo Sugerido</p>
                            <p className="text-lg font-bold text-green-900">{previsao.prazo_compra_sugerido}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-700">Valor Estimado</p>
                            <p className="text-lg font-bold text-green-900">{formatCurrency(previsao.preco_estimado)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Fornecedor Recomendado */}
                      <div className="p-3 bg-purple-50 rounded border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">🏆 Fornecedor Recomendado</h4>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-purple-900">{previsao.fornecedor_recomendado_nome}</p>
                            <p className="text-sm text-purple-700">{previsao.motivo_recomendacao}</p>
                          </div>
                          <Button size="sm">Criar Cotação</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
