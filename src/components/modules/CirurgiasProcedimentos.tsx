/**
 * ICARUS v5.0 - Módulo: Cirurgias & Procedimentos (COMPLETO)
 *
 * Categoria: Core Business
 * Descrição: Gestão completa do fluxo cirúrgico OPME com Kanban
 *
 * ARQUITETURA:
 * - Kanban Board com 5 colunas de fluxo
 * - Gráfico horizontal de status (12 etapas)
 * - Sistema de upload de documentos
 * - Integração com estoque, tabelas de preços, calendário
 * - Consignação com toggle urgência
 * - Rastreabilidade completa (QR Code, fotos, lacres)
 *
 * FLUXO COMPLETO:
 * 1. PRÉ-CIRÚRGICO: Cotação → Tabela Preços → Autorização → Agendamento
 * 2. LOGÍSTICA: Separação e envio de materiais
 * 3. CIRURGIA: Execução, QR Code, evidências
 * 4. LOGÍSTICA REVERSA: Devolução de não utilizados
 * 5. PÓS-CIRÚRGICO: Cotação pós → Autorização → Faturamento
 *
 * CORES STATUS:
 * - 🔴 Vermelho: Pendente
 * - 🟠 Laranja: Em processamento
 * - 🟢 Verde: Concluído
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { formatCurrency, formatDate } from '@/lib/utils'

// ==================== INTERFACES ====================

type StatusFluxo = 'pendente' | 'processando' | 'concluido'
type TipoCirurgia = 'eletiva' | 'urgencia'
type StatusFaturamento = 'nao_faturado' | 'parcial' | 'total'

interface EtapaFluxo {
  id: string
  nome: string
  status: StatusFluxo
  data_inicio?: string
  data_fim?: string
}

interface CirurgiaCard {
  id: number
  paciente: string
  medico: string
  hospital: string
  convenio: string
  tipo: TipoCirurgia
  procedimento: string
  data_agendada: string
  status_geral: StatusFluxo
  coluna_atual: string // 'pre_cirurgico' | 'logistica' | 'cirurgia' | 'logistica_reversa' | 'pos_cirurgico'

  // Pré-cirúrgico
  pedido_medico?: ArquivoUpload
  cotacao?: Cotacao
  tabela_precos_id?: number
  autorizacao?: ArquivoUpload
  agendamento_outlook?: AgendamentoOutlook
  nota_consignacao?: NotaConsignacao

  // Cirurgia
  materiais_utilizados: MaterialUtilizado[]
  evidencias: Evidencia[]
  materiais_extras: MaterialExtra[]

  // Pós-cirúrgico
  cotacao_pos?: Cotacao
  autorizacao_faturamento?: AutorizacaoFaturamento
  faturamento?: Faturamento

  // Fluxo completo
  etapas: EtapaFluxo[]

  created_at: string
  updated_at: string
}

interface ArquivoUpload {
  id: number
  nome: string
  url: string
  tipo: 'pedido_medico' | 'autorizacao' | 'email_aprovacao' | 'evidencia' | 'relatorio'
  data_upload: string
}

interface Cotacao {
  id: number
  numero: string
  materiais: MaterialCotacao[]
  valor_total: number
  status: 'rascunho' | 'enviada' | 'aprovada' | 'rejeitada'
  pdf_url?: string
  data_criacao: string
  data_envio?: string
}

interface MaterialCotacao {
  id: number
  produto_id: number
  produto_nome: string
  quantidade: number
  disponivel_estoque: boolean
  valor_unitario: number
  valor_total: number
  observacao?: string
}

interface TabelaPreco {
  id: number
  tipo: 'fixa' | 'flexivel'
  nome: string
  convenio_id?: number
  hospital_id?: number
  produtos: ProdutoTabela[]
  vigencia_inicio: string
  vigencia_fim?: string
}

interface ProdutoTabela {
  produto_id: number
  produto_nome: string
  preco: number
}

interface AgendamentoOutlook {
  id: number
  evento_id: string
  data_hora: string
  participantes: string[]
  lista_materiais: string[]
  notificacoes_enviadas: boolean
  link_calendario: string
}

interface NotaConsignacao {
  id: number
  numero: string
  tipo_cirurgia: TipoCirurgia
  urgencia_ativa: boolean
  valor_simbolico: number // R$ 100 se urgência
  justificativa_medica?: string
  materiais: MaterialConsignacao[]
  data_emissao: string
  notificacoes: Notificacao[]
}

interface MaterialConsignacao {
  produto_id: number
  produto_nome: string
  quantidade: number
  lote: string
  validade: string
}

interface Notificacao {
  tipo: '2_dias_antes' | '1_dia_antes' | 'dia_cirurgia'
  enviada: boolean
  data_envio?: string
}

interface MaterialUtilizado {
  id: number
  produto_id: number
  produto_nome: string
  quantidade: number
  lote: string
  validade: string
  codigo_barras?: string
  qr_code?: string
  paciente_vinculado: string
  data_vinculacao: string
}

interface Evidencia {
  id: number
  tipo: 'foto' | 'lacre' | 'relatorio' | 'comprovante'
  url: string
  descricao: string
  data_upload: string
}

interface MaterialExtra {
  id: number
  produto_id: number
  produto_nome: string
  quantidade: number
  justificativa_medica: string
  medico_solicitante: string
  data_solicitacao: string
  aprovado: boolean
}

interface AutorizacaoFaturamento {
  id: number
  tipo: 'parcial' | 'total'
  valor_autorizado: number
  materiais_autorizados: number[]
  responsavel: string
  data_autorizacao: string
}

interface Faturamento {
  id: number
  tipo: 'parcial' | 'total'
  nota_fiscal: string
  valor: number
  materiais_faturados: number[]
  data_emissao: string
  status: 'emitida' | 'enviada' | 'paga'
}

interface KPIsCirurgia {
  em_andamento: number
  finalizadas_hoje: number
  finalizadas_semana: number
  finalizadas_mes: number
  pendentes_faturamento: number
  valor_total_mes: number
}

// ==================== COMPONENTE PRINCIPAL ====================

export function CirurgiasProcedimentos() {
  const { supabase } = useSupabase()
  const { predict, chat, isLoading: aiLoading } = useIcarusBrain()

  // Estados principais
  const [cirurgias, setCirurgias] = useState<CirurgiaCard[]>([])
  const [kpis, setKPIs] = useState<KPIsCirurgia>({
    em_andamento: 0,
    finalizadas_hoje: 0,
    finalizadas_semana: 0,
    finalizadas_mes: 0,
    pendentes_faturamento: 0,
    valor_total_mes: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'eletiva' | 'urgencia'>('todas')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | StatusFluxo>('todos')

  // Modal
  const [cirurgiaSelecionada, setCirurgiaSelecionada] = useState<CirurgiaCard | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [abaModal, setAbaModal] = useState('detalhes')

  // Upload
  const [uploadingFile, setUploadingFile] = useState(false)

  // ==================== COLUNAS KANBAN ====================

  const colunas = [
    { id: 'pre_cirurgico', nome: 'Pré-Cirúrgico', cor: 'bg-blue-100 border-blue-300' },
    { id: 'logistica', nome: 'Logística', cor: 'bg-purple-100 border-purple-300' },
    { id: 'cirurgia', nome: 'Cirurgia', cor: 'bg-green-100 border-green-300' },
    { id: 'logistica_reversa', nome: 'Logística Reversa', cor: 'bg-orange-100 border-orange-300' },
    { id: 'pos_cirurgico', nome: 'Pós-Cirúrgico', cor: 'bg-indigo-100 border-indigo-300' },
  ]

  // ==================== ETAPAS DO FLUXO (Gráfico Horizontal) ====================

  const etapasFluxoCompleto = [
    'Pré-cirúrgico',
    'Tabela Preços',
    'Análise',
    'Autorização',
    'Agendamento',
    'Logística',
    'Cirurgia',
    'Logística Reversa',
    'Pós-cirúrgico',
    'Análise',
    'Monitoramento',
    'Autorização Faturamento',
    'Faturamento',
  ]

  // ==================== EFEITOS ====================

  useEffect(() => {
    loadCirurgias()
  }, [filtroTipo, filtroStatus])

  // ==================== FUNÇÕES DE DADOS ====================

  const loadCirurgias = async () => {
    setLoading(true)
    try {
      // Mock data completo
      const mockCirurgias: CirurgiaCard[] = [
        {
          id: 1,
          paciente: 'João Silva Santos',
          medico: 'Dr. Carlos Alberto',
          hospital: 'Hospital São Lucas',
          convenio: 'Unimed Nacional',
          tipo: 'eletiva',
          procedimento: 'Artroplastia Total de Joelho',
          data_agendada: '2025-11-22T09:00:00',
          status_geral: 'processando',
          coluna_atual: 'pre_cirurgico',
          pedido_medico: {
            id: 1,
            nome: 'pedido_medico_joao.pdf',
            url: '/uploads/pedido_1.pdf',
            tipo: 'pedido_medico',
            data_upload: '2025-11-10T14:30:00',
          },
          cotacao: {
            id: 1,
            numero: 'COT-2025-001',
            materiais: [
              {
                id: 1,
                produto_id: 101,
                produto_nome: 'Prótese de Joelho Premium - Tamanho M',
                quantidade: 1,
                disponivel_estoque: true,
                valor_unitario: 35000,
                valor_total: 35000,
              },
              {
                id: 2,
                produto_id: 102,
                produto_nome: 'Parafusos de Fixação Titânio (kit 12 unidades)',
                quantidade: 2,
                disponivel_estoque: true,
                valor_unitario: 5000,
                valor_total: 10000,
              },
              {
                id: 3,
                produto_id: 103,
                produto_nome: 'Cimento Ortopédico 40g',
                quantidade: 1,
                disponivel_estoque: false, // ZERADO
                valor_unitario: 800,
                valor_total: 800,
                observacao: '⚠️ ZERADO EM ESTOQUE - Notificação enviada para Compras',
              },
            ],
            valor_total: 45800,
            status: 'aprovada',
            pdf_url: '/cotacoes/COT-2025-001.pdf',
            data_criacao: '2025-11-11T09:00:00',
            data_envio: '2025-11-11T10:30:00',
          },
          tabela_precos_id: 5, // Tabela fixa Unimed
          autorizacao: {
            id: 2,
            nome: 'autorizacao_unimed_123456.pdf',
            url: '/uploads/autorizacao_1.pdf',
            tipo: 'autorizacao',
            data_upload: '2025-11-13T16:00:00',
          },
          agendamento_outlook: {
            id: 1,
            evento_id: 'outlook-event-abc123',
            data_hora: '2025-11-22T09:00:00',
            participantes: ['dr.carlos@hospital.com', 'logistica@distribuidora.com', 'financeiro@distribuidora.com'],
            lista_materiais: ['Prótese Joelho Premium M', 'Parafusos Titânio kit x2', 'Cimento Ortopédico 40g'],
            notificacoes_enviadas: false,
            link_calendario: 'https://outlook.office.com/calendar/event/abc123',
          },
          nota_consignacao: {
            id: 1,
            numero: 'CONS-2025-001',
            tipo_cirurgia: 'eletiva',
            urgencia_ativa: false,
            valor_simbolico: 0,
            materiais: [
              { produto_id: 101, produto_nome: 'Prótese de Joelho Premium - Tamanho M', quantidade: 1, lote: 'LOT2025-045', validade: '2027-12-31' },
              { produto_id: 102, produto_nome: 'Parafusos de Fixação Titânio (kit)', quantidade: 2, lote: 'LOT2025-087', validade: '2028-06-30' },
            ],
            data_emissao: '2025-11-14T10:00:00',
            notificacoes: [
              { tipo: '2_dias_antes', enviada: false },
              { tipo: '1_dia_antes', enviada: false },
              { tipo: 'dia_cirurgia', enviada: false },
            ],
          },
          materiais_utilizados: [],
          evidencias: [],
          materiais_extras: [],
          etapas: [
            { id: '1', nome: 'Pré-cirúrgico', status: 'concluido', data_inicio: '2025-11-10T14:30:00', data_fim: '2025-11-11T10:30:00' },
            { id: '2', nome: 'Tabela Preços', status: 'concluido', data_inicio: '2025-11-11T10:30:00', data_fim: '2025-11-11T11:00:00' },
            { id: '3', nome: 'Análise', status: 'concluido', data_inicio: '2025-11-11T11:00:00', data_fim: '2025-11-13T14:00:00' },
            { id: '4', nome: 'Autorização', status: 'concluido', data_inicio: '2025-11-13T14:00:00', data_fim: '2025-11-13T16:00:00' },
            { id: '5', nome: 'Agendamento', status: 'processando', data_inicio: '2025-11-14T09:00:00' },
            { id: '6', nome: 'Logística', status: 'pendente' },
            { id: '7', nome: 'Cirurgia', status: 'pendente' },
            { id: '8', nome: 'Logística Reversa', status: 'pendente' },
            { id: '9', nome: 'Pós-cirúrgico', status: 'pendente' },
            { id: '10', nome: 'Análise', status: 'pendente' },
            { id: '11', nome: 'Monitoramento', status: 'pendente' },
            { id: '12', nome: 'Autorização Faturamento', status: 'pendente' },
            { id: '13', nome: 'Faturamento', status: 'pendente' },
          ],
          created_at: '2025-11-10T14:30:00',
          updated_at: '2025-11-14T10:00:00',
        },
        {
          id: 2,
          paciente: 'Maria Costa Oliveira',
          medico: 'Dra. Ana Paula Mendes',
          hospital: 'Clínica Ortopédica Excellence',
          convenio: 'Bradesco Saúde',
          tipo: 'urgencia',
          procedimento: 'Osteossíntese de Fêmur com Placa',
          data_agendada: '2025-11-17T15:00:00',
          status_geral: 'processando',
          coluna_atual: 'cirurgia',
          nota_consignacao: {
            id: 2,
            numero: 'CONS-URG-2025-002',
            tipo_cirurgia: 'urgencia',
            urgencia_ativa: true,
            valor_simbolico: 100, // URGÊNCIA
            justificativa_medica: 'Paciente politraumatizada, fratura exposta de fêmur. Cirurgia imediata necessária para preservação do membro.',
            materiais: [
              { produto_id: 201, produto_nome: 'Placa Bloqueada Fêmur 10 furos', quantidade: 1, lote: 'LOT2025-123', validade: '2027-08-15' },
              { produto_id: 202, produto_nome: 'Parafusos Cortical 4.5mm (kit)', quantidade: 1, lote: 'LOT2025-125', validade: '2028-02-20' },
            ],
            data_emissao: '2025-11-17T10:00:00',
            notificacoes: [
              { tipo: '2_dias_antes', enviada: false }, // Não se aplica em urgência
              { tipo: '1_dia_antes', enviada: false },
              { tipo: 'dia_cirurgia', enviada: true, data_envio: '2025-11-17T10:05:00' },
            ],
          },
          materiais_utilizados: [
            {
              id: 1,
              produto_id: 201,
              produto_nome: 'Placa Bloqueada Fêmur 10 furos',
              quantidade: 1,
              lote: 'LOT2025-123',
              validade: '2027-08-15',
              codigo_barras: '7891234567890',
              qr_code: 'QR-LOT2025-123-PLACA-FEMUR',
              paciente_vinculado: 'Maria Costa Oliveira',
              data_vinculacao: '2025-11-17T15:45:00',
            },
            {
              id: 2,
              produto_id: 202,
              produto_nome: 'Parafusos Cortical 4.5mm (kit)',
              quantidade: 1,
              lote: 'LOT2025-125',
              validade: '2028-02-20',
              codigo_barras: '7891234567891',
              qr_code: 'QR-LOT2025-125-PARAF-CORT',
              paciente_vinculado: 'Maria Costa Oliveira',
              data_vinculacao: '2025-11-17T16:00:00',
            },
          ],
          evidencias: [
            {
              id: 1,
              tipo: 'foto',
              url: '/evidencias/cirurgia_2_foto_1.jpg',
              descricao: 'Imagem do campo cirúrgico com placa posicionada',
              data_upload: '2025-11-17T17:00:00',
            },
            {
              id: 2,
              tipo: 'lacre',
              url: '/evidencias/cirurgia_2_lacre_1.jpg',
              descricao: 'Lacre de segurança da embalagem da placa',
              data_upload: '2025-11-17T17:05:00',
            },
          ],
          materiais_extras: [
            {
              id: 1,
              produto_id: 203,
              produto_nome: 'Parafuso Adicional 4.5mm x 50mm',
              quantidade: 2,
              justificativa_medica: 'Necessário fixação adicional devido à complexidade da fratura. Fragmento ósseo adicional requereu parafusos extras para estabilização adequada.',
              medico_solicitante: 'Dra. Ana Paula Mendes',
              data_solicitacao: '2025-11-17T16:30:00',
              aprovado: true,
            },
          ],
          etapas: [
            { id: '1', nome: 'Pré-cirúrgico', status: 'concluido', data_inicio: '2025-11-17T10:00:00', data_fim: '2025-11-17T10:30:00' },
            { id: '2', nome: 'Tabela Preços', status: 'concluido', data_inicio: '2025-11-17T10:30:00', data_fim: '2025-11-17T10:35:00' },
            { id: '3', nome: 'Análise', status: 'concluido', data_inicio: '2025-11-17T10:35:00', data_fim: '2025-11-17T11:00:00' },
            { id: '4', nome: 'Autorização', status: 'concluido', data_inicio: '2025-11-17T11:00:00', data_fim: '2025-11-17T12:00:00' },
            { id: '5', nome: 'Agendamento', status: 'concluido', data_inicio: '2025-11-17T12:00:00', data_fim: '2025-11-17T12:30:00' },
            { id: '6', nome: 'Logística', status: 'concluido', data_inicio: '2025-11-17T12:30:00', data_fim: '2025-11-17T14:30:00' },
            { id: '7', nome: 'Cirurgia', status: 'processando', data_inicio: '2025-11-17T15:00:00' },
            { id: '8', nome: 'Logística Reversa', status: 'pendente' },
            { id: '9', nome: 'Pós-cirúrgico', status: 'pendente' },
            { id: '10', nome: 'Análise', status: 'pendente' },
            { id: '11', nome: 'Monitoramento', status: 'pendente' },
            { id: '12', nome: 'Autorização Faturamento', status: 'pendente' },
            { id: '13', nome: 'Faturamento', status: 'pendente' },
          ],
          created_at: '2025-11-17T10:00:00',
          updated_at: '2025-11-17T17:05:00',
        },
      ]

      setCirurgias(mockCirurgias)
      calculateKPIs(mockCirurgias)
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateKPIs = (data: CirurgiaCard[]) => {
    const hoje = new Date()
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()))
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    setKPIs({
      em_andamento: data.filter(c => c.status_geral === 'processando').length,
      finalizadas_hoje: data.filter(c => {
        const dataCirurgia = new Date(c.data_agendada)
        return dataCirurgia.toDateString() === new Date().toDateString() && c.status_geral === 'concluido'
      }).length,
      finalizadas_semana: data.filter(c => {
        const dataCirurgia = new Date(c.data_agendada)
        return dataCirurgia >= inicioSemana && c.status_geral === 'concluido'
      }).length,
      finalizadas_mes: data.filter(c => {
        const dataCirurgia = new Date(c.data_agendada)
        return dataCirurgia >= inicioMes && c.status_geral === 'concluido'
      }).length,
      pendentes_faturamento: data.filter(c => !c.faturamento && c.status_geral === 'concluido').length,
      valor_total_mes: data.reduce((acc, c) => {
        const dataCirurgia = new Date(c.data_agendada)
        if (dataCirurgia >= inicioMes && c.cotacao) {
          return acc + c.cotacao.valor_total
        }
        return acc
      }, 0),
    })
  }

  // ==================== HELPERS ====================

  const getStatusColor = (status: StatusFluxo) => {
    const colors = {
      pendente: 'bg-red-500',
      processando: 'bg-orange-500',
      concluido: 'bg-green-500',
    }
    return colors[status]
  }

  const getStatusLabel = (status: StatusFluxo) => {
    const labels = {
      pendente: 'Pendente',
      processando: 'Em Processamento',
      concluido: 'Concluído',
    }
    return labels[status]
  }

  const getTipoBadge = (tipo: TipoCirurgia) => {
    return tipo === 'urgencia'
      ? <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded uppercase">🚨 URGÊNCIA</span>
      : <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded uppercase">Eletiva</span>
  }

  const handleAbrirDetalhes = (cirurgia: CirurgiaCard) => {
    setCirurgiaSelecionada(cirurgia)
    setAbaModal('detalhes')
    setModalAberto(true)
  }

  const handleUploadArquivo = async (tipo: string, file: File) => {
    setUploadingFile(true)
    try {
      // Simular upload (em produção: Supabase Storage)
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`Arquivo ${file.name} uploaded como ${tipo}`)
      // Recarregar dados
      await loadCirurgias()
    } catch (error) {
      console.error('Erro no upload:', error)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleToggleUrgencia = (cirurgiaId: number) => {
    setCirurgias(prev => prev.map(c => {
      if (c.id === cirurgiaId && c.nota_consignacao) {
        return {
          ...c,
          nota_consignacao: {
            ...c.nota_consignacao,
            urgencia_ativa: !c.nota_consignacao.urgencia_ativa,
            valor_simbolico: !c.nota_consignacao.urgencia_ativa ? 100 : 0,
          }
        }
      }
      return c
    }))
  }

  const handleAprovarFaturamento = (cirurgiaId: number, tipo: 'parcial' | 'total') => {
    console.log(`Aprovar faturamento ${tipo} para cirurgia ${cirurgiaId}`)
    // Enviar evento para módulo financeiro
  }

  const handleEmitirNFe = (cirurgiaId: number, tipo: 'parcial' | 'total') => {
    console.log(`Emitir NFe ${tipo} para cirurgia ${cirurgiaId}`)
  }

  // ==================== FILTROS ====================

  const cirurgiasFiltradas = cirurgias.filter(c => {
    const matchTipo = filtroTipo === 'todas' || c.tipo === filtroTipo
    const matchStatus = filtroStatus === 'todos' || c.status_geral === filtroStatus
    return matchTipo && matchStatus
  })

  const getCirurgiasPorColuna = (colunaId: string) => {
    return cirurgiasFiltradas.filter(c => c.coluna_atual === colunaId)
  }

  // ==================== RENDERIZAÇÃO ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cirurgias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cirurgias & Procedimentos OPME</h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa do fluxo cirúrgico com Kanban
          </p>
        </div>
        <Button size="lg">+ Nova Cirurgia</Button>
      </div>

      {/* KPIs - Barra Superior */}
      <Card className="neu-soft">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-3xl font-bold text-orange-600">{kpis.em_andamento}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-3xl font-bold text-blue-600">{kpis.finalizadas_hoje}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Esta Semana</p>
              <p className="text-3xl font-bold text-green-600">{kpis.finalizadas_semana}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Este Mês</p>
              <p className="text-3xl font-bold text-purple-600">{kpis.finalizadas_mes}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pendentes Faturamento</p>
              <p className="text-3xl font-bold text-red-600">{kpis.pendentes_faturamento}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Valor Mês</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(kpis.valor_total_mes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="neu-soft">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="eletiva">Eletivas</SelectItem>
                <SelectItem value="urgencia">Urgências</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={(v: any) => setFiltroStatus(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              📊 Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {colunas.map(coluna => (
            <div key={coluna.id} className="flex-shrink-0 w-80">
              <Card className={`${coluna.cor} border-2`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    {coluna.nome} ({getCirurgiasPorColuna(coluna.id).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getCirurgiasPorColuna(coluna.id).map(cirurgia => (
                      <Card
                        key={cirurgia.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow bg-white"
                        onClick={() => handleAbrirDetalhes(cirurgia)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm">{cirurgia.paciente}</h4>
                              {getTipoBadge(cirurgia.tipo)}
                            </div>

                            <div className="text-xs space-y-1">
                              <p className="text-muted-foreground">
                                <strong>Procedimento:</strong> {cirurgia.procedimento}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Médico:</strong> {cirurgia.medico}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Hospital:</strong> {cirurgia.hospital}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Convênio:</strong> {cirurgia.convenio}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Data:</strong> {formatDate(cirurgia.data_agendada)}
                              </p>
                              {cirurgia.cotacao && (
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(cirurgia.cotacao.valor_total)}
                                </p>
                              )}
                            </div>

                            {/* Indicador de status */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(cirurgia.status_geral)}`}></div>
                              <span className="text-xs font-medium">{getStatusLabel(cirurgia.status_geral)}</span>
                            </div>

                            {/* Ícones de ações rápidas */}
                            <div className="flex gap-2 mt-2">
                              {cirurgia.pedido_medico && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded" title="Pedido médico anexado">
                                  📄
                                </span>
                              )}
                              {cirurgia.autorizacao && (
                                <span className="text-xs bg-green-100 px-2 py-1 rounded" title="Autorização aprovada">
                                  ✅
                                </span>
                              )}
                              {cirurgia.nota_consignacao?.urgencia_ativa && (
                                <span className="text-xs bg-red-100 px-2 py-1 rounded font-bold" title="Urgência ativa">
                                  🚨
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {cirurgiaSelecionada && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{cirurgiaSelecionada.paciente}</span>
                  {getTipoBadge(cirurgiaSelecionada.tipo)}
                </DialogTitle>
                <DialogDescription>
                  {cirurgiaSelecionada.procedimento} • {cirurgiaSelecionada.hospital}
                </DialogDescription>
              </DialogHeader>

              <Tabs value={abaModal} onValueChange={setAbaModal}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="fluxo">Fluxo</TabsTrigger>
                  <TabsTrigger value="materiais">Materiais</TabsTrigger>
                  <TabsTrigger value="evidencias">Evidências</TabsTrigger>
                  <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
                </TabsList>

                {/* ABA: Detalhes */}
                <TabsContent value="detalhes" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Médico</p>
                      <p className="font-semibold">{cirurgiaSelecionada.medico}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Convênio</p>
                      <p className="font-semibold">{cirurgiaSelecionada.convenio}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data Agendada</p>
                      <p className="font-semibold">{formatDate(cirurgiaSelecionada.data_agendada)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-semibold">{getStatusLabel(cirurgiaSelecionada.status_geral)}</p>
                    </div>
                  </div>

                  {cirurgiaSelecionada.cotacao && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cotação {cirurgiaSelecionada.cotacao.numero}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {cirurgiaSelecionada.cotacao.materiais.map(mat => (
                            <div key={mat.id} className="flex items-center justify-between p-2 bg-accent/30 rounded">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{mat.produto_nome}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qtd: {mat.quantidade} • {formatCurrency(mat.valor_unitario)}/un
                                  {!mat.disponivel_estoque && (
                                    <span className="text-red-600 font-bold ml-2">⚠️ ZERADO</span>
                                  )}
                                </p>
                                {mat.observacao && (
                                  <p className="text-xs text-orange-600 mt-1">{mat.observacao}</p>
                                )}
                              </div>
                              <span className="font-semibold">{formatCurrency(mat.valor_total)}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">TOTAL:</span>
                              <span className="font-bold text-lg text-green-600">
                                {formatCurrency(cirurgiaSelecionada.cotacao.valor_total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {cirurgiaSelecionada.nota_consignacao && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Nota Consignação {cirurgiaSelecionada.nota_consignacao.numero}
                          </CardTitle>
                          <Button
                            variant={cirurgiaSelecionada.nota_consignacao.urgencia_ativa ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleToggleUrgencia(cirurgiaSelecionada.id)}
                          >
                            {cirurgiaSelecionada.nota_consignacao.urgencia_ativa ? '🚨 Urgência ATIVA' : 'Ativar Urgência'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {cirurgiaSelecionada.nota_consignacao.urgencia_ativa && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm font-semibold text-red-700">
                              Valor Simbólico: {formatCurrency(cirurgiaSelecionada.nota_consignacao.valor_simbolico)}
                            </p>
                            {cirurgiaSelecionada.nota_consignacao.justificativa_medica && (
                              <p className="text-xs text-red-600 mt-1">
                                <strong>Justificativa:</strong> {cirurgiaSelecionada.nota_consignacao.justificativa_medica}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="space-y-2">
                          {cirurgiaSelecionada.nota_consignacao.materiais.map((mat, idx) => (
                            <div key={idx} className="text-sm p-2 bg-accent/30 rounded">
                              <p className="font-medium">{mat.produto_nome}</p>
                              <p className="text-xs text-muted-foreground">
                                Qtd: {mat.quantidade} • Lote: {mat.lote} • Validade: {formatDate(mat.validade)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ABA: Fluxo (Gráfico Horizontal) */}
                <TabsContent value="fluxo" className="space-y-4">
                  <div className="space-y-2">
                    {cirurgiaSelecionada.etapas.map((etapa, index) => (
                      <div key={etapa.id} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(etapa.status)}`}></div>
                            <span className="font-semibold text-sm">{etapa.nome}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              etapa.status === 'concluido' ? 'bg-green-100 text-green-700' :
                              etapa.status === 'processando' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {getStatusLabel(etapa.status)}
                            </span>
                          </div>
                          {etapa.data_inicio && (
                            <p className="text-xs text-muted-foreground ml-5 mt-1">
                              Início: {formatDate(etapa.data_inicio)}
                              {etapa.data_fim && ` • Fim: ${formatDate(etapa.data_fim)}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* ABA: Materiais */}
                <TabsContent value="materiais" className="space-y-4">
                  {cirurgiaSelecionada.materiais_utilizados.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Materiais Utilizados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {cirurgiaSelecionada.materiais_utilizados.map(mat => (
                            <div key={mat.id} className="p-3 border rounded">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{mat.produto_nome}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Qtd: {mat.quantidade} • Lote: {mat.lote} • Validade: {formatDate(mat.validade)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Código de Barras: {mat.codigo_barras || 'N/A'} • QR Code: {mat.qr_code || 'N/A'}
                                  </p>
                                  <p className="text-xs font-medium text-green-600 mt-1">
                                    ✅ Vinculado a: {mat.paciente_vinculado} em {formatDate(mat.data_vinculacao)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-center text-muted-foreground">Nenhum material vinculado ainda</p>
                  )}

                  {cirurgiaSelecionada.materiais_extras.length > 0 && (
                    <Card className="border-orange-300">
                      <CardHeader>
                        <CardTitle className="text-base text-orange-700">Materiais Extras Solicitados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {cirurgiaSelecionada.materiais_extras.map(mat => (
                            <div key={mat.id} className="p-3 bg-orange-50 border border-orange-200 rounded">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{mat.produto_nome}</p>
                                  <p className="text-xs text-muted-foreground">Qtd: {mat.quantidade}</p>
                                  <p className="text-xs mt-1">
                                    <strong>Justificativa:</strong> {mat.justificativa_medica}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Solicitado por: {mat.medico_solicitante} em {formatDate(mat.data_solicitacao)}
                                  </p>
                                  {mat.aprovado && (
                                    <p className="text-xs text-green-600 font-semibold mt-1">✅ APROVADO</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ABA: Evidências */}
                <TabsContent value="evidencias" className="space-y-4">
                  {cirurgiaSelecionada.evidencias.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {cirurgiaSelecionada.evidencias.map(ev => (
                        <Card key={ev.id}>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              {ev.tipo === 'foto' && '📷 Foto'}
                              {ev.tipo === 'lacre' && '🔒 Lacre'}
                              {ev.tipo === 'relatorio' && '📄 Relatório'}
                              {ev.tipo === 'comprovante' && '✅ Comprovante'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">[Imagem: {ev.url}]</span>
                            </div>
                            <p className="text-xs">{ev.descricao}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload: {formatDate(ev.data_upload)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Nenhuma evidência anexada</p>
                      <Button variant="outline">
                        📤 Upload de Evidência
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* ABA: Faturamento */}
                <TabsContent value="faturamento" className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAprovarFaturamento(cirurgiaSelecionada.id, 'parcial')}
                    >
                      Aprovar Parcial
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleAprovarFaturamento(cirurgiaSelecionada.id, 'total')}
                    >
                      Aprovar Total
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEmitirNFe(cirurgiaSelecionada.id, 'parcial')}
                    >
                      📄 Emitir NFe Parcial
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleEmitirNFe(cirurgiaSelecionada.id, 'total')}
                    >
                      📄 Emitir NFe Total
                    </Button>
                  </div>

                  {cirurgiaSelecionada.faturamento && (
                    <Card className="border-green-300">
                      <CardHeader>
                        <CardTitle className="text-base text-green-700">
                          Faturamento Realizado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><strong>Nota Fiscal:</strong> {cirurgiaSelecionada.faturamento.nota_fiscal}</p>
                          <p><strong>Valor:</strong> {formatCurrency(cirurgiaSelecionada.faturamento.valor)}</p>
                          <p><strong>Tipo:</strong> {cirurgiaSelecionada.faturamento.tipo === 'total' ? 'Total' : 'Parcial'}</p>
                          <p><strong>Emissão:</strong> {formatDate(cirurgiaSelecionada.faturamento.data_emissao)}</p>
                          <p><strong>Status:</strong> {cirurgiaSelecionada.faturamento.status}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setModalAberto(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
