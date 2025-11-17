/**
 * ICARUS v5.0 - Módulo: CRM & Vendas
 *
 * Categoria: Core Business
 * Descrição: Relacionamento com hospitais e planos de saúde (B2B)
 *
 * CONTEXTO DE NEGÓCIO:
 * - Distribuidora de dispositivos médicos (OPME) B2B
 * - Clientes principais: Hospitais, Clínicas, Planos de Saúde
 * - Relacionamento de longo prazo (contratos anuais/plurianuais)
 * - Ciclo de venda complexo (múltiplos stakeholders: médicos, administração, compras)
 * - Ticket médio alto (R$ 50k - R$ 500k+ por mês)
 * - Foco em retenção e upsell de produtos OPME
 *
 * FUNCIONALIDADES:
 * - Gestão completa de clientes B2B
 * - Pipeline de vendas e oportunidades
 * - Gestão de contatos e stakeholders
 * - Histórico de interações (reuniões, calls, propostas)
 * - Performance por cliente (faturamento, crescimento, produtos)
 * - Análise de churn risk com IA
 * - Predição de demanda por cliente
 * - Sugestões de upsell/cross-sell
 * - Gestão de territórios e vendedores
 * - Integração com Cirurgias (demanda real)
 *
 * KPIs:
 * - Total de Clientes Ativos
 * - Pipeline Total (valor de oportunidades)
 * - Taxa de Conversão (%)
 * - Ticket Médio Mensal
 * - Churn Risk (clientes em risco)
 *
 * Abas:
 * - Overview: KPIs + clientes top + pipeline + alertas
 * - Clientes: Lista completa com filtros e busca
 * - Pipeline: Funil de vendas por estágio
 * - Relatórios: Performance, crescimento, produtos
 * - IA: Predições, churn risk, upsell, insights
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'

// ==================== INTERFACES ====================

type TipoCliente = 'hospital' | 'clinica' | 'plano_saude' | 'laboratorio'
type PorteCliente = 'pequeno' | 'medio' | 'grande' | 'extra_grande'
type StatusCliente = 'ativo' | 'inativo' | 'prospecto' | 'churn'
type NivelRelacionamento = 'estrategico' | 'gold' | 'silver' | 'bronze'

type EstagioOportunidade = 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechamento' | 'ganho' | 'perdido'
type ProbabilidadeOportunidade = 10 | 25 | 50 | 75 | 90 | 100 | 0

type TipoContato = 'decisor' | 'influenciador' | 'tecnico' | 'operacional'

interface Cliente {
  id: number
  razao_social: string
  nome_fantasia: string
  cnpj: string
  tipo: TipoCliente
  porte: PorteCliente
  status: StatusCliente
  nivel_relacionamento: NivelRelacionamento

  // Endereço
  cidade: string
  estado: string
  regiao: string

  // Relacionamento
  data_inicio: string
  vendedor_responsavel: string
  territorio: string

  // Performance
  faturamento_mensal_medio: number
  faturamento_ultimos_12m: number
  crescimento_percentual: number
  ticket_medio_cirurgia: number
  cirurgias_mes: number
  produtos_mais_comprados: string[]

  // Risco
  churn_risk: number // 0-100%
  motivo_risco?: string
  dias_sem_compra: number

  // Contatos
  contatos: Contato[]

  // Histórico
  ultima_interacao: string
  ultima_compra: string
  proxima_acao: string

  // Metadados
  created_at: string
  updated_at: string
}

interface Contato {
  id: number
  cliente_id: number
  nome: string
  cargo: string
  tipo: TipoContato
  email: string
  telefone: string
  whatsapp: string
  linkedin?: string
  aniversario?: string
  observacoes?: string
  ultima_interacao: string
}

interface Oportunidade {
  id: number
  cliente_id: number
  cliente_nome: string
  titulo: string
  descricao: string
  valor_estimado: number
  probabilidade: ProbabilidadeOportunidade
  estagio: EstagioOportunidade
  data_criacao: string
  data_fechamento_prevista: string
  data_fechamento_real?: string
  vendedor_responsavel: string

  // Produtos envolvidos
  produtos_interesse: string[]
  quantidade_cirurgias_mes: number

  // Competição
  concorrentes: string[]
  diferenciais: string[]

  // Resultado
  motivo_ganho?: string
  motivo_perda?: string

  // Próximas ações
  proxima_acao: string
  data_proxima_acao: string
}


interface AlertaCRM {
  id: number
  cliente_id: number
  cliente_nome: string
  tipo: 'churn_risk' | 'sem_compra' | 'contrato_vencendo' | 'aniversario' | 'follow_up'
  prioridade: 'alta' | 'media' | 'baixa'
  mensagem: string
  acao_sugerida: string
  data: string
}

interface PrevisaoIA {
  cliente_id: number
  cliente_nome: string

  // Churn Risk
  churn_probability: number // 0-100%
  churn_fatores: string[]
  churn_acao_preventiva: string

  // Demand Prediction
  demanda_prevista_mes: number
  produtos_demanda: { produto: string; quantidade: number }[]
  confianca: number

  // Upsell/Cross-sell
  oportunidades_upsell: { produto: string; probabilidade: number; valor_estimado: number }[]
  produtos_nao_comprados: string[]

  // Next Best Action
  proxima_acao_recomendada: string
  momento_ideal_contato: string
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CRMVendas() {
  // State
  const [activeTab, setActiveTab] = useState('overview')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([])
  const [alertas, setAlertas] = useState<AlertaCRM[]>([])
  const [previsoesIA, setPrevisoesIA] = useState<PrevisaoIA[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroRegiao, setFiltroRegiao] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  // ==================== MOCK DATA ====================

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)

    // Mock Clientes
    const mockClientes: Cliente[] = [
      {
        id: 1,
        razao_social: 'Hospital Sírio-Libanês S/A',
        nome_fantasia: 'Hospital Sírio-Libanês',
        cnpj: '61.367.808/0001-20',
        tipo: 'hospital',
        porte: 'extra_grande',
        status: 'ativo',
        nivel_relacionamento: 'estrategico',
        cidade: 'São Paulo',
        estado: 'SP',
        regiao: 'Sudeste',
        data_inicio: '2020-01-15',
        vendedor_responsavel: 'Carlos Silva',
        territorio: 'São Paulo - Capital',
        faturamento_mensal_medio: 450000,
        faturamento_ultimos_12m: 5400000,
        crescimento_percentual: 15.5,
        ticket_medio_cirurgia: 45000,
        cirurgias_mes: 10,
        produtos_mais_comprados: ['Prótese Ortopédica', 'Stent Cardíaco', 'Implante Neurológico'],
        churn_risk: 5,
        dias_sem_compra: 3,
        contatos: [
          {
            id: 1,
            cliente_id: 1,
            nome: 'Dr. Roberto Mendes',
            cargo: 'Diretor Médico',
            tipo: 'decisor',
            email: 'roberto.mendes@sirio.com.br',
            telefone: '(11) 3155-0200',
            whatsapp: '(11) 99876-5432',
            ultima_interacao: '2025-11-14'
          },
          {
            id: 2,
            cliente_id: 1,
            nome: 'Ana Paula Costa',
            cargo: 'Gerente de Compras',
            tipo: 'decisor',
            email: 'ana.costa@sirio.com.br',
            telefone: '(11) 3155-0250',
            whatsapp: '(11) 98765-4321',
            ultima_interacao: '2025-11-15'
          }
        ],
        ultima_interacao: '2025-11-15',
        ultima_compra: '2025-11-13',
        proxima_acao: 'Apresentar novos produtos de ortopedia',
        created_at: '2020-01-15',
        updated_at: '2025-11-15'
      },
      {
        id: 2,
        razao_social: 'Hospital Albert Einstein S/A',
        nome_fantasia: 'Hospital Albert Einstein',
        cnpj: '60.765.823/0001-30',
        tipo: 'hospital',
        porte: 'extra_grande',
        status: 'ativo',
        nivel_relacionamento: 'estrategico',
        cidade: 'São Paulo',
        estado: 'SP',
        regiao: 'Sudeste',
        data_inicio: '2019-03-20',
        vendedor_responsavel: 'Carlos Silva',
        territorio: 'São Paulo - Capital',
        faturamento_mensal_medio: 520000,
        faturamento_ultimos_12m: 6240000,
        crescimento_percentual: 22.3,
        ticket_medio_cirurgia: 52000,
        cirurgias_mes: 10,
        produtos_mais_comprados: ['Stent Cardíaco', 'Marca-passo', 'Prótese Vascular'],
        churn_risk: 3,
        dias_sem_compra: 2,
        contatos: [
          {
            id: 3,
            cliente_id: 2,
            nome: 'Dr. Paulo Henrique',
            cargo: 'Diretor Cirúrgico',
            tipo: 'decisor',
            email: 'paulo.henrique@einstein.br',
            telefone: '(11) 2151-1233',
            whatsapp: '(11) 99654-3210',
            ultima_interacao: '2025-11-13'
          }
        ],
        ultima_interacao: '2025-11-13',
        ultima_compra: '2025-11-14',
        proxima_acao: 'Follow-up contrato anual',
        created_at: '2019-03-20',
        updated_at: '2025-11-15'
      },
      {
        id: 3,
        razao_social: 'Santa Casa de Misericórdia de SP',
        nome_fantasia: 'Santa Casa SP',
        cnpj: '62.634.040/0001-17',
        tipo: 'hospital',
        porte: 'grande',
        status: 'ativo',
        nivel_relacionamento: 'gold',
        cidade: 'São Paulo',
        estado: 'SP',
        regiao: 'Sudeste',
        data_inicio: '2018-06-10',
        vendedor_responsavel: 'Mariana Santos',
        territorio: 'São Paulo - Capital',
        faturamento_mensal_medio: 180000,
        faturamento_ultimos_12m: 2160000,
        crescimento_percentual: -8.5,
        ticket_medio_cirurgia: 30000,
        cirurgias_mes: 6,
        produtos_mais_comprados: ['Prótese Ortopédica', 'Material Síntese'],
        churn_risk: 65,
        motivo_risco: 'Queda de 8.5% no faturamento + 28 dias sem compra',
        dias_sem_compra: 28,
        contatos: [
          {
            id: 4,
            cliente_id: 3,
            nome: 'José Carlos Oliveira',
            cargo: 'Coordenador de Suprimentos',
            tipo: 'decisor',
            email: 'jose.oliveira@santacasasp.org.br',
            telefone: '(11) 2176-7000',
            whatsapp: '(11) 98543-2109',
            ultima_interacao: '2025-10-20'
          }
        ],
        ultima_interacao: '2025-10-20',
        ultima_compra: '2025-10-18',
        proxima_acao: 'URGENTE: Visita para entender queda nas compras',
        created_at: '2018-06-10',
        updated_at: '2025-11-15'
      },
      {
        id: 4,
        razao_social: 'Clínica Ortopédica Paulista LTDA',
        nome_fantasia: 'Ortopédica Paulista',
        cnpj: '12.345.678/0001-90',
        tipo: 'clinica',
        porte: 'medio',
        status: 'ativo',
        nivel_relacionamento: 'silver',
        cidade: 'São Paulo',
        estado: 'SP',
        regiao: 'Sudeste',
        data_inicio: '2021-08-15',
        vendedor_responsavel: 'Mariana Santos',
        territorio: 'São Paulo - Capital',
        faturamento_mensal_medio: 85000,
        faturamento_ultimos_12m: 1020000,
        crescimento_percentual: 35.2,
        ticket_medio_cirurgia: 21250,
        cirurgias_mes: 4,
        produtos_mais_comprados: ['Prótese Joelho', 'Prótese Quadril'],
        churn_risk: 15,
        dias_sem_compra: 12,
        contatos: [
          {
            id: 5,
            cliente_id: 4,
            nome: 'Dr. Eduardo Ribeiro',
            cargo: 'Diretor Clínico',
            tipo: 'decisor',
            email: 'eduardo@ortopedicapaulista.com.br',
            telefone: '(11) 3456-7890',
            whatsapp: '(11) 97432-1098',
            ultima_interacao: '2025-11-10'
          }
        ],
        ultima_interacao: '2025-11-10',
        ultima_compra: '2025-11-03',
        proxima_acao: 'Proposta de novos produtos de coluna',
        created_at: '2021-08-15',
        updated_at: '2025-11-15'
      },
      {
        id: 5,
        razao_social: 'Cardio Clínica Centro LTDA',
        nome_fantasia: 'Cardio Centro',
        cnpj: '23.456.789/0001-01',
        tipo: 'clinica',
        porte: 'pequeno',
        status: 'prospecto',
        nivel_relacionamento: 'bronze',
        cidade: 'Campinas',
        estado: 'SP',
        regiao: 'Sudeste',
        data_inicio: '2025-10-01',
        vendedor_responsavel: 'João Pedro',
        territorio: 'São Paulo - Interior',
        faturamento_mensal_medio: 0,
        faturamento_ultimos_12m: 0,
        crescimento_percentual: 0,
        ticket_medio_cirurgia: 0,
        cirurgias_mes: 0,
        produtos_mais_comprados: [],
        churn_risk: 0,
        dias_sem_compra: 999,
        contatos: [
          {
            id: 6,
            cliente_id: 5,
            nome: 'Dra. Fernanda Lima',
            cargo: 'Proprietária',
            tipo: 'decisor',
            email: 'fernanda@cardiocentro.com.br',
            telefone: '(19) 3234-5678',
            whatsapp: '(19) 98321-0987',
            ultima_interacao: '2025-11-12'
          }
        ],
        ultima_interacao: '2025-11-12',
        ultima_compra: '',
        proxima_acao: 'Enviar proposta comercial - stents',
        created_at: '2025-10-01',
        updated_at: '2025-11-12'
      }
    ]

    // Mock Oportunidades
    const mockOportunidades: Oportunidade[] = [
      {
        id: 1,
        cliente_id: 5,
        cliente_nome: 'Cardio Centro',
        titulo: 'Fornecimento de Stents Cardíacos',
        descricao: 'Contrato anual para fornecimento de stents coronarianos',
        valor_estimado: 480000,
        probabilidade: 50,
        estagio: 'proposta',
        data_criacao: '2025-10-15',
        data_fechamento_prevista: '2025-12-15',
        vendedor_responsavel: 'João Pedro',
        produtos_interesse: ['Stent Farmacológico', 'Cateter Guia'],
        quantidade_cirurgias_mes: 5,
        concorrentes: ['Medtronic', 'Boston Scientific'],
        diferenciais: ['Preço competitivo', 'Pronta entrega', 'Suporte técnico'],
        proxima_acao: 'Apresentação técnica dia 20/11',
        data_proxima_acao: '2025-11-20'
      },
      {
        id: 2,
        cliente_id: 4,
        cliente_nome: 'Ortopédica Paulista',
        titulo: 'Expansão linha Coluna Vertebral',
        descricao: 'Fornecimento de produtos para cirurgias de coluna',
        valor_estimado: 320000,
        probabilidade: 75,
        estagio: 'negociacao',
        data_criacao: '2025-09-10',
        data_fechamento_prevista: '2025-11-30',
        vendedor_responsavel: 'Mariana Santos',
        produtos_interesse: ['Parafusos Pediculares', 'Cage Intervertebral'],
        quantidade_cirurgias_mes: 3,
        concorrentes: ['Stryker'],
        diferenciais: ['Relacionamento estabelecido', 'Histórico positivo'],
        proxima_acao: 'Negociar condições de pagamento',
        data_proxima_acao: '2025-11-18'
      },
      {
        id: 3,
        cliente_id: 1,
        cliente_nome: 'Hospital Sírio-Libanês',
        titulo: 'Implantes Neurológicos - Novo Contrato',
        descricao: 'Renovação e expansão de contrato de implantes neuro',
        valor_estimado: 1200000,
        probabilidade: 90,
        estagio: 'fechamento',
        data_criacao: '2025-08-01',
        data_fechamento_prevista: '2025-11-25',
        vendedor_responsavel: 'Carlos Silva',
        produtos_interesse: ['Estimulador Cerebral', 'Eletrodos'],
        quantidade_cirurgias_mes: 8,
        concorrentes: [],
        diferenciais: ['Cliente estratégico', 'Histórico 5 anos'],
        proxima_acao: 'Assinatura contrato',
        data_proxima_acao: '2025-11-25'
      }
    ]

    // Mock Alertas
    const mockAlertas: AlertaCRM[] = [
      {
        id: 1,
        cliente_id: 3,
        cliente_nome: 'Santa Casa SP',
        tipo: 'churn_risk',
        prioridade: 'alta',
        mensagem: 'Cliente em ALTO RISCO de churn (65%)',
        acao_sugerida: 'Agendar visita urgente com decisor. Entender motivo da queda de 8.5% no faturamento',
        data: '2025-11-15'
      },
      {
        id: 2,
        cliente_id: 3,
        cliente_nome: 'Santa Casa SP',
        tipo: 'sem_compra',
        prioridade: 'alta',
        mensagem: '28 dias sem compra - Cliente estava comprando regularmente',
        acao_sugerida: 'Ligar para José Carlos (Suprimentos) e verificar status',
        data: '2025-11-15'
      },
      {
        id: 3,
        cliente_id: 1,
        cliente_nome: 'Hospital Sírio-Libanês',
        tipo: 'contrato_vencendo',
        prioridade: 'media',
        mensagem: 'Contrato principal vence em 45 dias',
        acao_sugerida: 'Preparar proposta de renovação com condições especiais',
        data: '2025-11-15'
      },
      {
        id: 4,
        cliente_id: 4,
        cliente_nome: 'Ortopédica Paulista',
        tipo: 'follow_up',
        prioridade: 'media',
        mensagem: 'Follow-up oportunidade "Expansão linha Coluna"',
        acao_sugerida: 'Negociar condições de pagamento dia 18/11',
        data: '2025-11-15'
      }
    ]

    // Mock Previsões IA
    const mockPrevisoesIA: PrevisaoIA[] = [
      {
        cliente_id: 3,
        cliente_nome: 'Santa Casa SP',
        churn_probability: 65,
        churn_fatores: [
          'Queda de 8.5% no faturamento nos últimos 3 meses',
          '28 dias sem realizar compras (padrão anterior: 7-10 dias)',
          'Última interação há 26 dias',
          'Concorrente reportado oferecendo condições agressivas'
        ],
        churn_acao_preventiva: 'URGENTE: Visita presencial com Diretor Comercial. Oferecer condições especiais de pagamento (45/60 dias). Demonstrar novos produtos de baixo custo.',
        demanda_prevista_mes: 150000,
        produtos_demanda: [
          { produto: 'Prótese Ortopédica', quantidade: 4 },
          { produto: 'Material Síntese', quantidade: 8 }
        ],
        confianca: 70,
        oportunidades_upsell: [
          { produto: 'Stent Cardíaco', probabilidade: 35, valor_estimado: 80000 },
          { produto: 'Prótese Vascular', probabilidade: 25, valor_estimado: 60000 }
        ],
        produtos_nao_comprados: ['Stent Cardíaco', 'Prótese Vascular', 'Marca-passo'],
        proxima_acao_recomendada: 'Agendar reunião com José Carlos (Suprimentos) e Diretor Administrativo. Levar análise de economia com nossos produtos vs concorrentes.',
        momento_ideal_contato: 'Terça ou Quinta, 14h-16h (baseado em histórico de interações)'
      },
      {
        cliente_id: 4,
        cliente_nome: 'Ortopédica Paulista',
        churn_probability: 15,
        churn_fatores: [
          '12 dias sem compra (dentro do padrão)',
          'Crescimento saudável de 35.2%'
        ],
        churn_acao_preventiva: 'Cliente saudável. Manter cadência regular de contato.',
        demanda_prevista_mes: 95000,
        produtos_demanda: [
          { produto: 'Prótese Joelho', quantidade: 2 },
          { produto: 'Prótese Quadril', quantidade: 2 }
        ],
        confianca: 85,
        oportunidades_upsell: [
          { produto: 'Parafusos Pediculares', probabilidade: 75, valor_estimado: 120000 },
          { produto: 'Cage Intervertebral', probabilidade: 75, valor_estimado: 200000 }
        ],
        produtos_nao_comprados: ['Produtos de Coluna (em negociação)'],
        proxima_acao_recomendada: 'Fechar oportunidade "Expansão linha Coluna". Cliente demonstrou alto interesse e está em fase de negociação avançada.',
        momento_ideal_contato: 'Segunda ou Quarta, 9h-11h'
      },
      {
        cliente_id: 5,
        cliente_nome: 'Cardio Centro',
        churn_probability: 0,
        churn_fatores: ['Cliente prospecto - ainda não cliente ativo'],
        churn_acao_preventiva: 'N/A',
        demanda_prevista_mes: 40000,
        produtos_demanda: [
          { produto: 'Stent Farmacológico', quantidade: 5 }
        ],
        confianca: 60,
        oportunidades_upsell: [],
        produtos_nao_comprados: ['Todos (cliente prospecto)'],
        proxima_acao_recomendada: 'Apresentação técnica agendada dia 20/11. Preparar demonstração prática dos stents. Levar casos de sucesso de clínicas similares.',
        momento_ideal_contato: 'Conforme agendado: 20/11 às 14h'
      }
    ]

    setClientes(mockClientes)
    setOportunidades(mockOportunidades)
    setAlertas(mockAlertas)
    setPrevisoesIA(mockPrevisoesIA)
    setLoading(false)
  }

  // ==================== CÁLCULOS E MÉTRICAS ====================

  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length
  const pipelineTotal = oportunidades
    .filter(o => o.estagio !== 'perdido' && o.estagio !== 'ganho')
    .reduce((sum, o) => sum + (o.valor_estimado * o.probabilidade / 100), 0)

  const oportunidadesTotal = oportunidades.filter(o => o.estagio !== 'perdido' && o.estagio !== 'ganho').length
  const oportunidadesGanhas = oportunidades.filter(o => o.estagio === 'ganho').length
  const taxaConversao = oportunidadesTotal > 0
    ? ((oportunidadesGanhas / (oportunidadesTotal + oportunidadesGanhas)) * 100)
    : 0

  const ticketMedio = clientes
    .filter(c => c.status === 'ativo')
    .reduce((sum, c) => sum + c.faturamento_mensal_medio, 0) / (clientesAtivos || 1)

  const clientesRisco = clientes.filter(c => c.churn_risk >= 50).length

  const top5Clientes = [...clientes]
    .filter(c => c.status === 'ativo')
    .sort((a, b) => b.faturamento_ultimos_12m - a.faturamento_ultimos_12m)
    .slice(0, 5)

  const oportunidadesPorEstagio = {
    prospeccao: oportunidades.filter(o => o.estagio === 'prospeccao').length,
    qualificacao: oportunidades.filter(o => o.estagio === 'qualificacao').length,
    proposta: oportunidades.filter(o => o.estagio === 'proposta').length,
    negociacao: oportunidades.filter(o => o.estagio === 'negociacao').length,
    fechamento: oportunidades.filter(o => o.estagio === 'fechamento').length,
    ganho: oportunidades.filter(o => o.estagio === 'ganho').length,
    perdido: oportunidades.filter(o => o.estagio === 'perdido').length
  }

  // ==================== FILTROS ====================

  const clientesFiltrados = clientes.filter(cliente => {
    const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus
    const matchRegiao = filtroRegiao === 'todos' || cliente.regiao === filtroRegiao
    const matchBusca = busca === '' ||
      cliente.razao_social.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.nome_fantasia.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cnpj.includes(busca)

    return matchStatus && matchRegiao && matchBusca
  })

  // ==================== HELPERS ====================

  const getBadgeColorStatus = (status: StatusCliente) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-300'
      case 'prospecto': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'churn': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getBadgeColorNivel = (nivel: NivelRelacionamento) => {
    switch (nivel) {
      case 'estrategico': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getBadgeColorEstagio = (estagio: EstagioOportunidade) => {
    switch (estagio) {
      case 'prospeccao': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'qualificacao': return 'bg-cyan-100 text-cyan-800 border-cyan-300'
      case 'proposta': return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'negociacao': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'fechamento': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'ganho': return 'bg-green-100 text-green-800 border-green-300'
      case 'perdido': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getBadgeColorChurnRisk = (risk: number) => {
    if (risk >= 70) return 'bg-red-100 text-red-800 border-red-300'
    if (risk >= 50) return 'bg-orange-100 text-orange-800 border-orange-300'
    if (risk >= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  const getEstagioLabel = (estagio: EstagioOportunidade) => {
    const labels = {
      prospeccao: 'Prospecção',
      qualificacao: 'Qualificação',
      proposta: 'Proposta',
      negociacao: 'Negociação',
      fechamento: 'Fechamento',
      ganho: 'Ganho',
      perdido: 'Perdido'
    }
    return labels[estagio] || estagio
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="CRM & Vendas"
        subtitle="Gestão de clientes e pipeline de vendas"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CRM & Vendas</h1>
          <p className="text-muted-foreground">Relacionamento com hospitais e planos de saúde (B2B)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setClienteDialogOpen(true)}>+ Novo Cliente</Button>
          <Button onClick={() => setOportunidadeDialogOpen(true)}>+ Nova Oportunidade</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Clientes Ativos</CardDescription>
            <CardTitle className="text-3xl">{clientesAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {clientes.filter(c => c.status === 'prospecto').length} prospects em pipeline
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Pipeline Total</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(pipelineTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {oportunidadesTotal} oportunidades ativas
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Conversão</CardDescription>
            <CardTitle className="text-3xl">{taxaConversao.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {oportunidadesGanhas} oportunidades ganhas
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Ticket Médio Mensal</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(ticketMedio)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Média por cliente ativo
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-orange-200">
          <CardHeader className="pb-2">
            <CardDescription>Churn Risk</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{clientesRisco}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-600 font-semibold">
              {clientesRisco > 0 ? 'REQUER ATENÇÃO!' : 'Nenhum cliente em risco'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="ia">IA Insights</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alertas Críticos */}
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🚨 Alertas Críticos</CardTitle>
                <CardDescription>Ações que requerem atenção imediata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertas.slice(0, 4).map(alerta => (
                    <div key={alerta.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{alerta.cliente_nome}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              alerta.prioridade === 'alta' ? 'bg-red-100 text-red-800 border-red-300' :
                              alerta.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-blue-100 text-blue-800 border-blue-300'
                            }`}>
                              {alerta.prioridade.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{alerta.mensagem}</p>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-900">
                          <strong>Ação sugerida:</strong> {alerta.acao_sugerida}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Clientes */}
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🏆 Top 5 Clientes por Faturamento</CardTitle>
                <CardDescription>Últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {top5Clientes.map((cliente, index) => (
                    <div key={cliente.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <div className="font-semibold">{cliente.nome_fantasia}</div>
                          <div className="text-xs text-gray-500">{cliente.vendedor_responsavel}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(cliente.faturamento_ultimos_12m)}</div>
                        <div className={`text-xs ${cliente.crescimento_percentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {cliente.crescimento_percentual >= 0 ? '↗' : '↘'} {Math.abs(cliente.crescimento_percentual).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline por Estágio */}
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Pipeline por Estágio</CardTitle>
              <CardDescription>Distribuição de oportunidades no funil de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(oportunidadesPorEstagio).map(([estagio, count]) => {
                  const valorTotal = oportunidades
                    .filter(o => o.estagio === estagio)
                    .reduce((sum, o) => sum + o.valor_estimado, 0)

                  return (
                    <div key={estagio} className="p-4 border rounded-lg text-center">
                      <div className={`text-xs px-2 py-1 rounded-full border inline-block mb-2 ${getBadgeColorEstagio(estagio as EstagioOportunidade)}`}>
                        {getEstagioLabel(estagio as EstagioOportunidade)}
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatCurrency(valorTotal)}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CLIENTES */}
        <TabsContent value="clientes" className="space-y-4">
          {/* Filtros */}
          <Card className="neomorphic">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar cliente (razão social, CNPJ...)"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="churn">Churn</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Regiões</SelectItem>
                    <SelectItem value="Sudeste">Sudeste</SelectItem>
                    <SelectItem value="Sul">Sul</SelectItem>
                    <SelectItem value="Centro-Oeste">Centro-Oeste</SelectItem>
                    <SelectItem value="Nordeste">Nordeste</SelectItem>
                    <SelectItem value="Norte">Norte</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500 flex items-center">
                  {clientesFiltrados.length} cliente(s) encontrado(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Clientes */}
          <div className="space-y-3">
            {clientesFiltrados.map(cliente => (
              <Card key={cliente.id} className={`neomorphic ${cliente.churn_risk >= 50 ? 'border-orange-300' : ''}`}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Coluna 1: Dados Cliente */}
                    <div className="lg:col-span-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{cliente.nome_fantasia}</h3>
                          <p className="text-sm text-gray-600">{cliente.razao_social}</p>
                          <p className="text-xs text-gray-500 mt-1">CNPJ: {cliente.cnpj}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorStatus(cliente.status)}`}>
                              {cliente.status.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorNivel(cliente.nivel_relacionamento)}`}>
                              {cliente.nivel_relacionamento.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Performance */}
                    <div className="lg:col-span-1">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Faturamento Mensal Médio</p>
                          <p className="font-bold">{formatCurrency(cliente.faturamento_mensal_medio)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Últimos 12 meses</p>
                          <p className="font-semibold">{formatCurrency(cliente.faturamento_ultimos_12m)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Crescimento</p>
                          <p className={`font-semibold ${cliente.crescimento_percentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {cliente.crescimento_percentual >= 0 ? '↗' : '↘'} {Math.abs(cliente.crescimento_percentual).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 3: Relacionamento */}
                    <div className="lg:col-span-1">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Vendedor Responsável</p>
                          <p className="font-semibold">{cliente.vendedor_responsavel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Última Compra</p>
                          <p className="text-sm">{cliente.ultima_compra ? formatDate(cliente.ultima_compra) : 'Nunca'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Dias sem Compra</p>
                          <p className={`text-sm ${cliente.dias_sem_compra > 20 ? 'text-orange-600 font-semibold' : ''}`}>
                            {cliente.dias_sem_compra} dias
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 4: Churn Risk & Ação */}
                    <div className="lg:col-span-1">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Churn Risk</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold px-3 py-1 rounded-full border ${getBadgeColorChurnRisk(cliente.churn_risk)}`}>
                              {cliente.churn_risk}%
                            </span>
                          </div>
                          {cliente.motivo_risco && (
                            <p className="text-xs text-orange-600 mt-1">{cliente.motivo_risco}</p>
                          )}
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Próxima Ação</p>
                          <p className="text-sm font-semibold">{cliente.proxima_acao}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contatos */}
                  {cliente.contatos.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Contatos Principais</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {cliente.contatos.slice(0, 2).map(contato => (
                          <div key={contato.id} className="text-sm flex items-center gap-2">
                            <span className="font-semibold">{contato.nome}</span>
                            <span className="text-gray-500">({contato.cargo})</span>
                            <span className="text-xs text-gray-400">- {contato.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: PIPELINE */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Pipeline de Oportunidades</CardTitle>
              <CardDescription>Oportunidades ativas ordenadas por probabilidade e valor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {oportunidades
                  .filter(o => o.estagio !== 'ganho' && o.estagio !== 'perdido')
                  .sort((a, b) => (b.valor_estimado * b.probabilidade) - (a.valor_estimado * a.probabilidade))
                  .map(oportunidade => (
                    <div key={oportunidade.id} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Coluna 1: Info Básica */}
                        <div className="lg:col-span-1">
                          <h3 className="font-bold">{oportunidade.titulo}</h3>
                          <p className="text-sm text-gray-600 mt-1">{oportunidade.cliente_nome}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColorEstagio(oportunidade.estagio)}`}>
                              {getEstagioLabel(oportunidade.estagio)}
                            </span>
                          </div>
                        </div>

                        {/* Coluna 2: Valores */}
                        <div className="lg:col-span-1">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Valor Estimado</p>
                              <p className="font-bold text-lg">{formatCurrency(oportunidade.valor_estimado)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Probabilidade</p>
                              <p className="font-semibold">{oportunidade.probabilidade}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Valor Ponderado</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(oportunidade.valor_estimado * oportunidade.probabilidade / 100)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Coluna 3: Datas */}
                        <div className="lg:col-span-1">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Criação</p>
                              <p className="text-sm">{formatDate(oportunidade.data_criacao)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Fechamento Previsto</p>
                              <p className="text-sm">{formatDate(oportunidade.data_fechamento_prevista)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Vendedor</p>
                              <p className="text-sm font-semibold">{oportunidade.vendedor_responsavel}</p>
                            </div>
                          </div>
                        </div>

                        {/* Coluna 4: Próxima Ação */}
                        <div className="lg:col-span-1">
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Próxima Ação</p>
                            <p className="text-sm text-blue-900">{oportunidade.proxima_acao}</p>
                            <p className="text-xs text-blue-600 mt-2">
                              📅 {formatDate(oportunidade.data_proxima_acao)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Produtos de Interesse */}
                      {oportunidade.produtos_interesse.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-2">Produtos de Interesse</p>
                          <div className="flex flex-wrap gap-2">
                            {oportunidade.produtos_interesse.map((produto, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded border">
                                {produto}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📈 Relatórios de Performance</CardTitle>
              <CardDescription>Análises e métricas consolidadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumo Geral */}
                <div>
                  <h3 className="font-semibold mb-3">Resumo Geral</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500">Total de Clientes</p>
                      <p className="text-2xl font-bold">{clientes.length}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {clientesAtivos} ativos | {clientes.filter(c => c.status === 'prospecto').length} prospects
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500">Faturamento Total 12m</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(clientes.reduce((sum, c) => sum + c.faturamento_ultimos_12m, 0))}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-500">Cirurgias/Mês Total</p>
                      <p className="text-2xl font-bold">
                        {clientes.reduce((sum, c) => sum + c.cirurgias_mes, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Por Tipo de Cliente */}
                <div>
                  <h3 className="font-semibold mb-3">Por Tipo de Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['hospital', 'clinica', 'plano_saude', 'laboratorio'].map(tipo => {
                      const clientesTipo = clientes.filter(c => c.tipo === tipo)
                      const faturamentoTipo = clientesTipo.reduce((sum, c) => sum + c.faturamento_ultimos_12m, 0)
                      return (
                        <div key={tipo} className="p-4 border rounded-lg">
                          <p className="text-sm text-gray-500 capitalize">{tipo.replace('_', ' ')}</p>
                          <p className="text-xl font-bold">{clientesTipo.length}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatCurrency(faturamentoTipo)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Por Porte */}
                <div>
                  <h3 className="font-semibold mb-3">Por Porte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['pequeno', 'medio', 'grande', 'extra_grande'].map(porte => {
                      const clientesPorte = clientes.filter(c => c.porte === porte)
                      const faturamentoPorte = clientesPorte.reduce((sum, c) => sum + c.faturamento_ultimos_12m, 0)
                      return (
                        <div key={porte} className="p-4 border rounded-lg">
                          <p className="text-sm text-gray-500 capitalize">{porte.replace('_', ' ')}</p>
                          <p className="text-xl font-bold">{clientesPorte.length}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatCurrency(faturamentoPorte)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
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
                <span>Insights Preditivos com IA</span>
              </CardTitle>
              <CardDescription>
                Análises de churn risk, predição de demanda, oportunidades de upsell
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previsoesIA.map(previsao => {
                  const cliente = clientes.find(c => c.id === previsao.cliente_id)
                  if (!cliente) return null

                  return (
                    <Card key={previsao.cliente_id} className={`${previsao.churn_probability >= 50 ? 'border-orange-300' : 'border-gray-200'}`}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{previsao.cliente_nome}</h3>
                              <p className="text-sm text-gray-600">{cliente.razao_social}</p>
                            </div>
                            <div className={`text-center px-4 py-2 rounded-lg border ${getBadgeColorChurnRisk(previsao.churn_probability)}`}>
                              <p className="text-xs">Churn Risk</p>
                              <p className="text-2xl font-bold">{previsao.churn_probability}%</p>
                            </div>
                          </div>

                          {/* Churn Risk Analysis */}
                          {previsao.churn_probability > 0 && (
                            <div className="p-4 bg-orange-50 rounded border border-orange-200">
                              <h4 className="font-semibold text-orange-900 mb-2">⚠️ Análise de Risco de Churn</h4>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-orange-700 font-semibold mb-1">Fatores de Risco:</p>
                                  <ul className="list-disc list-inside text-sm text-orange-900 space-y-1">
                                    {previsao.churn_fatores.map((fator, idx) => (
                                      <li key={idx}>{fator}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="mt-3 p-3 bg-white rounded border border-orange-300">
                                  <p className="text-xs text-orange-700 font-semibold mb-1">🎯 Ação Preventiva Recomendada:</p>
                                  <p className="text-sm text-orange-900">{previsao.churn_acao_preventiva}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Demand Prediction */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-2">📊 Previsão de Demanda</h4>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-blue-700">Demanda Prevista Próximo Mês</p>
                                  <p className="text-xl font-bold text-blue-900">{formatCurrency(previsao.demanda_prevista_mes)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-blue-700 mb-1">Produtos Principais:</p>
                                  {previsao.produtos_demanda.map((prod, idx) => (
                                    <div key={idx} className="text-sm text-blue-900">
                                      • {prod.produto}: {prod.quantidade} unidades
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2">
                                  <p className="text-xs text-blue-700">Confiança: {previsao.confianca}%</p>
                                </div>
                              </div>
                            </div>

                            {/* Upsell Opportunities */}
                            <div className="p-4 bg-green-50 rounded border border-green-200">
                              <h4 className="font-semibold text-green-900 mb-2">💰 Oportunidades de Upsell</h4>
                              {previsao.oportunidades_upsell.length > 0 ? (
                                <div className="space-y-2">
                                  {previsao.oportunidades_upsell.map((opp, idx) => (
                                    <div key={idx} className="p-2 bg-white rounded border border-green-300">
                                      <p className="text-sm font-semibold text-green-900">{opp.produto}</p>
                                      <div className="flex justify-between mt-1">
                                        <span className="text-xs text-green-700">Prob: {opp.probabilidade}%</span>
                                        <span className="text-xs text-green-700 font-semibold">
                                          {formatCurrency(opp.valor_estimado)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-green-700">Cliente prospecto - aguardando primeira compra</p>
                              )}
                            </div>
                          </div>

                          {/* Next Best Action */}
                          <div className="p-4 bg-purple-50 rounded border border-purple-200">
                            <h4 className="font-semibold text-purple-900 mb-2">🎯 Next Best Action</h4>
                            <p className="text-sm text-purple-900 mb-2">{previsao.proxima_acao_recomendada}</p>
                            <p className="text-xs text-purple-700">
                              <strong>Melhor momento para contato:</strong> {previsao.momento_ideal_contato}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
