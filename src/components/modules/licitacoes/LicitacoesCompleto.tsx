/**
 * ICARUS v5.0 - Licitações Completo
 * 
 * Gestão completa de processos licitatórios com integração
 * ANVISA, Receita Federal e Portal Nacional de Contratações.
 * 
 * FUNCIONALIDADES:
 * - Controle de processos licitatórios públicos
 * - Monitoramento automático de editais
 * - Criação automática de propostas
 * - Gestão de habilitação e documentos
 * - Integração com APIs governamentais
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  FileText, Building2, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, Search, Filter, Download, Plus,
  Eye, DollarSign, Upload, Send, Target, Layers, FileCheck,
  FileClock, FileWarning, FileX, Shield, Globe, Bell, BellRing,
  Gavel, Award, Scale, Briefcase, ClipboardList, ClipboardCheck,
  Package, Truck, MapPin, Users, User, Phone, Mail, ExternalLink,
  RefreshCw, Printer, Copy, MoreVertical, ChevronRight, Info,
  AlertCircle, BrainCircuit, Zap, Star, StarOff, Bookmark,
  BookmarkCheck, History, Timer, Percent, Calculator, Receipt,
  FileImage, FilePlus, FileEdit, FileSignature, Crown, Medal
} from 'lucide-react'

// ============ TIPOS ============

interface ProcessoLicitatorio {
  id: string
  numero: string
  orgao: string
  uasg: string
  modalidade: 'pregao_eletronico' | 'concorrencia' | 'tomada_precos' | 'convite' | 'dispensa' | 'inexigibilidade'
  objeto: string
  valorEstimado: number
  dataAbertura: string
  dataEncerramento?: string
  status: 'aberto' | 'em_andamento' | 'encerrado' | 'suspenso' | 'cancelado' | 'adjudicado' | 'homologado'
  participando: boolean
  favorito: boolean
  itens: ItemLicitacao[]
  documentosExigidos: string[]
  observacoes?: string
}

interface ItemLicitacao {
  id: string
  numero: number
  descricao: string
  quantidade: number
  unidade: string
  valorUnitarioEstimado: number
  especificacaoTecnica?: string
  registroAnvisa?: string
}

interface Proposta {
  id: string
  processoId: string
  numeroProcesso: string
  orgao: string
  status: 'rascunho' | 'enviada' | 'aceita' | 'recusada' | 'vencedora'
  valorTotal: number
  dataEnvio?: string
  itens: ItemProposta[]
  documentos: DocumentoProposta[]
  observacoes?: string
}

interface ItemProposta {
  itemId: string
  descricao: string
  quantidade: number
  valorUnitario: number
  marca: string
  modelo: string
  registroAnvisa: string
  descricaoDetalhada: string
}

interface DocumentoProposta {
  id: string
  tipo: string
  nome: string
  status: 'pendente' | 'anexado' | 'validado' | 'expirado'
  dataValidade?: string
  arquivo?: string
}

interface Edital {
  id: string
  numero: string
  orgao: string
  modalidade: string
  objeto: string
  valorEstimado: number
  dataPublicacao: string
  dataAbertura: string
  linkEdital: string
  viabilidade: 'alta' | 'media' | 'baixa'
  scoreIA: number
  motivos: string[]
  monitorado: boolean
}

interface DocumentoHabilitacao {
  id: string
  tipo: string
  nome: string
  orgaoEmissor: string
  dataEmissao: string
  dataValidade: string
  status: 'valido' | 'vencido' | 'a_vencer' | 'pendente'
  arquivo?: string
  diasParaVencer?: number
}

// ============ DADOS MOCK ============

const MOCK_PROCESSOS: ProcessoLicitatorio[] = [
  {
    id: '1',
    numero: 'PE 001/2025',
    orgao: 'Hospital das Clínicas - FMUSP',
    uasg: '153031',
    modalidade: 'pregao_eletronico',
    objeto: 'Aquisição de próteses ortopédicas para cirurgias de quadril e joelho',
    valorEstimado: 2500000.00,
    dataAbertura: '2025-12-05',
    status: 'aberto',
    participando: true,
    favorito: true,
    itens: [
      { id: '1', numero: 1, descricao: 'Prótese Total de Quadril Cimentada', quantidade: 50, unidade: 'UN', valorUnitarioEstimado: 15000, registroAnvisa: '10349000001' },
      { id: '2', numero: 2, descricao: 'Prótese Total de Joelho', quantidade: 30, unidade: 'UN', valorUnitarioEstimado: 25000, registroAnvisa: '10349000002' },
    ],
    documentosExigidos: ['Certidão FGTS', 'Certidão Federal', 'Certidão Estadual', 'Registro ANVISA', 'Atestado Capacidade Técnica'],
  },
  {
    id: '2',
    numero: 'PE 015/2025',
    orgao: 'INCA - Instituto Nacional do Câncer',
    uasg: '250052',
    modalidade: 'pregao_eletronico',
    objeto: 'Material cirúrgico para neurocirurgia oncológica',
    valorEstimado: 850000.00,
    dataAbertura: '2025-12-10',
    status: 'aberto',
    participando: false,
    favorito: false,
    itens: [
      { id: '3', numero: 1, descricao: 'Clip Aneurisma Titânio', quantidade: 100, unidade: 'UN', valorUnitarioEstimado: 2500 },
      { id: '4', numero: 2, descricao: 'Tela Craniana Titânio', quantidade: 50, unidade: 'UN', valorUnitarioEstimado: 8000 },
    ],
    documentosExigidos: ['Certidão FGTS', 'Certidão Federal', 'Registro ANVISA'],
  },
  {
    id: '3',
    numero: 'PE 008/2025',
    orgao: 'Hospital Universitário - USP',
    uasg: '153032',
    modalidade: 'pregao_eletronico',
    objeto: 'Instrumental cirúrgico para artroscopia',
    valorEstimado: 320000.00,
    dataAbertura: '2025-11-20',
    dataEncerramento: '2025-11-25',
    status: 'adjudicado',
    participando: true,
    favorito: true,
    itens: [
      { id: '5', numero: 1, descricao: 'Kit Artroscopia Joelho', quantidade: 10, unidade: 'KIT', valorUnitarioEstimado: 32000 },
    ],
    documentosExigidos: ['Certidão FGTS', 'Certidão Federal'],
  },
]

const MOCK_EDITAIS: Edital[] = [
  {
    id: '1',
    numero: 'PE 025/2025',
    orgao: 'Hospital Sírio-Libanês',
    modalidade: 'Pregão Eletrônico',
    objeto: 'Aquisição de implantes ortopédicos para coluna vertebral',
    valorEstimado: 1200000.00,
    dataPublicacao: '2025-11-25',
    dataAbertura: '2025-12-15',
    linkEdital: 'https://comprasnet.gov.br/edital/pe025-2025',
    viabilidade: 'alta',
    scoreIA: 92,
    motivos: ['Produtos em estoque', 'Histórico de vitória no órgão', 'Margem competitiva'],
    monitorado: true,
  },
  {
    id: '2',
    numero: 'PE 030/2025',
    orgao: 'Hospital Albert Einstein',
    modalidade: 'Pregão Eletrônico',
    objeto: 'Material para cirurgia cardíaca',
    valorEstimado: 3500000.00,
    dataPublicacao: '2025-11-26',
    dataAbertura: '2025-12-20',
    linkEdital: 'https://comprasnet.gov.br/edital/pe030-2025',
    viabilidade: 'media',
    scoreIA: 68,
    motivos: ['Produtos parcialmente disponíveis', 'Concorrência forte'],
    monitorado: false,
  },
  {
    id: '3',
    numero: 'PE 012/2025',
    orgao: 'Secretaria de Saúde - SP',
    modalidade: 'Pregão Eletrônico',
    objeto: 'Equipamentos de fisioterapia',
    valorEstimado: 450000.00,
    dataPublicacao: '2025-11-20',
    dataAbertura: '2025-12-08',
    linkEdital: 'https://comprasnet.gov.br/edital/pe012-2025',
    viabilidade: 'baixa',
    scoreIA: 35,
    motivos: ['Fora do segmento principal', 'Margens apertadas'],
    monitorado: false,
  },
]

const MOCK_PROPOSTAS: Proposta[] = [
  {
    id: '1',
    processoId: '1',
    numeroProcesso: 'PE 001/2025',
    orgao: 'Hospital das Clínicas - FMUSP',
    status: 'rascunho',
    valorTotal: 2350000.00,
    itens: [
      { itemId: '1', descricao: 'Prótese Total de Quadril Cimentada', quantidade: 50, valorUnitario: 14200, marca: 'Zimmer Biomet', modelo: 'Continuum', registroAnvisa: '10349000001', descricaoDetalhada: 'Prótese total de quadril cimentada em liga de titânio...' },
      { itemId: '2', descricao: 'Prótese Total de Joelho', quantidade: 30, valorUnitario: 23500, marca: 'Smith & Nephew', modelo: 'Journey II', registroAnvisa: '10349000002', descricaoDetalhada: 'Prótese total de joelho com sistema de estabilização...' },
    ],
    documentos: [
      { id: '1', tipo: 'proposta_comercial', nome: 'Proposta Comercial.pdf', status: 'anexado' },
      { id: '2', tipo: 'registro_anvisa', nome: 'Registros ANVISA.pdf', status: 'validado' },
      { id: '3', tipo: 'atestado_tecnico', nome: 'Atestado Capacidade Técnica.pdf', status: 'pendente' },
    ],
  },
]

const MOCK_DOCUMENTOS_HABILITACAO: DocumentoHabilitacao[] = [
  {
    id: '1',
    tipo: 'certidao_fgts',
    nome: 'Certidão de Regularidade FGTS',
    orgaoEmissor: 'Caixa Econômica Federal',
    dataEmissao: '2025-11-01',
    dataValidade: '2025-12-01',
    status: 'a_vencer',
    diasParaVencer: 3,
  },
  {
    id: '2',
    tipo: 'certidao_federal',
    nome: 'Certidão Negativa de Débitos Federais',
    orgaoEmissor: 'Receita Federal',
    dataEmissao: '2025-10-15',
    dataValidade: '2026-04-15',
    status: 'valido',
    diasParaVencer: 138,
  },
  {
    id: '3',
    tipo: 'certidao_estadual',
    nome: 'Certidão Negativa de Débitos Estaduais',
    orgaoEmissor: 'SEFAZ-SP',
    dataEmissao: '2025-09-20',
    dataValidade: '2025-11-20',
    status: 'vencido',
  },
  {
    id: '4',
    tipo: 'registro_anvisa',
    nome: 'Autorização de Funcionamento ANVISA',
    orgaoEmissor: 'ANVISA',
    dataEmissao: '2024-06-01',
    dataValidade: '2026-06-01',
    status: 'valido',
    diasParaVencer: 185,
  },
  {
    id: '5',
    tipo: 'atestado_tecnico',
    nome: 'Atestado de Capacidade Técnica',
    orgaoEmissor: 'Hospital das Clínicas',
    dataEmissao: '2025-08-10',
    dataValidade: '2026-08-10',
    status: 'valido',
    diasParaVencer: 255,
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function LicitacoesCompleto() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('processos')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [processoSelecionado, setProcessoSelecionado] = useState<ProcessoLicitatorio | null>(null)
  const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovaPropostaOpen, setIsNovaPropostaOpen] = useState(false)
  const [isGerarPDFOpen, setIsGerarPDFOpen] = useState(false)

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      aberto: { cor: '#10B981', texto: 'Aberto', icon: CheckCircle },
      em_andamento: { cor: '#3B82F6', texto: 'Em Andamento', icon: Clock },
      encerrado: { cor: '#6B7280', texto: 'Encerrado', icon: XCircle },
      suspenso: { cor: '#F59E0B', texto: 'Suspenso', icon: AlertTriangle },
      cancelado: { cor: '#EF4444', texto: 'Cancelado', icon: XCircle },
      adjudicado: { cor: '#8B5CF6', texto: 'Adjudicado', icon: Award },
      homologado: { cor: '#10B981', texto: 'Homologado', icon: CheckCircle },
      rascunho: { cor: '#6B7280', texto: 'Rascunho', icon: FileEdit },
      enviada: { cor: '#3B82F6', texto: 'Enviada', icon: Send },
      aceita: { cor: '#10B981', texto: 'Aceita', icon: CheckCircle },
      recusada: { cor: '#EF4444', texto: 'Recusada', icon: XCircle },
      vencedora: { cor: '#F59E0B', texto: 'Vencedora', icon: Crown },
      valido: { cor: '#10B981', texto: 'Válido', icon: CheckCircle },
      vencido: { cor: '#EF4444', texto: 'Vencido', icon: AlertTriangle },
      a_vencer: { cor: '#F59E0B', texto: 'A Vencer', icon: Clock },
      pendente: { cor: '#6B7280', texto: 'Pendente', icon: FileClock },
      anexado: { cor: '#3B82F6', texto: 'Anexado', icon: FileCheck },
      validado: { cor: '#10B981', texto: 'Validado', icon: CheckCircle },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  const getViabilidadeConfig = (viabilidade: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      alta: { cor: '#10B981', texto: 'Alta' },
      media: { cor: '#F59E0B', texto: 'Média' },
      baixa: { cor: '#EF4444', texto: 'Baixa' },
    }
    return configs[viabilidade] || { cor: '#6B7280', texto: viabilidade }
  }

  // Filtrar processos
  const processosFiltrados = useMemo(() => {
    return MOCK_PROCESSOS.filter(p => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!p.numero.toLowerCase().includes(query) && 
            !p.orgao.toLowerCase().includes(query) &&
            !p.objeto.toLowerCase().includes(query)) {
          return false
        }
      }
      if (filtroStatus !== 'todos' && p.status !== filtroStatus) {
        return false
      }
      return true
    })
  }, [searchQuery, filtroStatus])

  // Stats
  const stats = useMemo(() => ({
    abertos: MOCK_PROCESSOS.filter(p => p.status === 'aberto').length,
    participando: MOCK_PROCESSOS.filter(p => p.participando).length,
    vencidos: MOCK_PROCESSOS.filter(p => p.status === 'adjudicado' || p.status === 'homologado').length,
    valorTotal: MOCK_PROCESSOS.filter(p => p.participando).reduce((acc, p) => acc + p.valorEstimado, 0),
    documentosVencidos: MOCK_DOCUMENTOS_HABILITACAO.filter(d => d.status === 'vencido').length,
    documentosAVencer: MOCK_DOCUMENTOS_HABILITACAO.filter(d => d.status === 'a_vencer').length,
  }), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isDark
                ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
                : 'bg-slate-100'
            }`}
            style={{ backgroundColor: '#8B5CF620' }}
          >
            <Gavel className="w-7 h-7 text-[#8B5CF6]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Licitações</h1>
            <p className={textSecondary}>Gestão de processos licitatórios públicos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sincronizar Comprasnet
          </Button>
          <Button onClick={() => setIsNovaPropostaOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Proposta
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Abertos</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.abertos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Participando</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.participando}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Vencidos</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.vencidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Em Disputa</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(stats.valorTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <FileWarning className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Docs Vencidos</p>
                <p className={`text-2xl font-bold text-[#EF4444]`}>{stats.documentosVencidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>IA Ativa</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>ON</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="processos" className="gap-2">
            <Gavel className="w-4 h-4" />
            Processos
          </TabsTrigger>
          <TabsTrigger value="editais" className="gap-2">
            <FileText className="w-4 h-4" />
            Editais
          </TabsTrigger>
          <TabsTrigger value="propostas" className="gap-2">
            <FileSignature className="w-4 h-4" />
            Propostas
          </TabsTrigger>
          <TabsTrigger value="habilitacao" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Habilitação
          </TabsTrigger>
        </TabsList>

        {/* Tab: Processos */}
        <TabsContent value="processos" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por número, órgão ou objeto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="adjudicado">Adjudicado</SelectItem>
                    <SelectItem value="homologado">Homologado</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Processos */}
          <div className="space-y-3">
            {processosFiltrados.map((processo) => {
              const statusConfig = getStatusConfig(processo.status)
              const StatusIcon = statusConfig.icon
              return (
                <Card key={processo.id} className={cardBg}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-bold ${textPrimary}`}>{processo.numero}</span>
                          <Badge 
                            className="text-xs"
                            style={{ backgroundColor: `${statusConfig.cor}20`, color: statusConfig.cor }}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.texto}
                          </Badge>
                          {processo.participando && (
                            <Badge className="bg-[#6366F1]/20 text-[#6366F1] text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              Participando
                            </Badge>
                          )}
                          {processo.favorito && (
                            <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                          )}
                        </div>
                        <p className={`font-medium ${textPrimary} mb-1`}>{processo.orgao}</p>
                        <p className={`text-sm ${textSecondary} mb-2`}>{processo.objeto}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={textSecondary}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Abertura: {new Date(processo.dataAbertura).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={textSecondary}>
                            <Package className="w-4 h-4 inline mr-1" />
                            {processo.itens.length} itens
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(processo.valorEstimado)}</p>
                        <p className={`text-xs ${textSecondary}`}>Valor Estimado</p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setProcessoSelecionado(processo)
                              setIsDetalhesOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {processo.status === 'aberto' && !processo.participando && (
                            <Button size="sm" className="gap-1">
                              <Target className="w-4 h-4" />
                              Participar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Tab: Editais */}
        <TabsContent value="editais" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Monitoramento Inteligente de Editais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_EDITAIS.map((edital) => {
                  const viabilidade = getViabilidadeConfig(edital.viabilidade)
                  return (
                    <div 
                      key={edital.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{edital.numero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${viabilidade.cor}20`, color: viabilidade.cor }}
                            >
                              Viabilidade {viabilidade.texto}
                            </Badge>
                            {edital.monitorado && (
                              <Badge className="bg-[#6366F1]/20 text-[#6366F1] text-xs">
                                <Bell className="w-3 h-3 mr-1" />
                                Monitorado
                              </Badge>
                            )}
                          </div>
                          <p className={`font-medium ${textPrimary} mb-1`}>{edital.orgao}</p>
                          <p className={`text-sm ${textSecondary} mb-2`}>{edital.objeto}</p>
                          
                          {/* Score IA */}
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'} mb-2`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs ${textSecondary}`}>Score IA</span>
                              <span className={`font-bold ${
                                edital.scoreIA >= 80 ? 'text-[#10B981]' :
                                edital.scoreIA >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                              }`}>{edital.scoreIA}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${edital.scoreIA}%`,
                                  backgroundColor: edital.scoreIA >= 80 ? '#10B981' :
                                    edital.scoreIA >= 50 ? '#F59E0B' : '#EF4444'
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {edital.motivos.map((motivo, idx) => (
                                <span key={idx} className={`text-xs px-2 py-0.5 rounded ${inputBg} ${textSecondary}`}>
                                  {motivo}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className={textSecondary}>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Abertura: {new Date(edital.dataAbertura).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(edital.valorEstimado)}</p>
                          <div className="flex gap-2 mt-3">
                            <Button variant="secondary" size="sm" className="gap-1">
                              <ExternalLink className="w-4 h-4" />
                              Ver Edital
                            </Button>
                            {!edital.monitorado ? (
                              <Button size="sm" className="gap-1">
                                <Bell className="w-4 h-4" />
                                Monitorar
                              </Button>
                            ) : (
                              <Button variant="secondary" size="sm" className="gap-1">
                                <BellRing className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Propostas */}
        <TabsContent value="propostas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#6366F1]" />
                Propostas
              </CardTitle>
              <Button onClick={() => setIsGerarPDFOpen(true)} className="gap-2">
                <FilePlus className="w-4 h-4" />
                Gerar Proposta PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_PROPOSTAS.map((proposta) => {
                  const statusConfig = getStatusConfig(proposta.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <div 
                      key={proposta.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{proposta.numeroProcesso}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${statusConfig.cor}20`, color: statusConfig.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.texto}
                            </Badge>
                          </div>
                          <p className={`font-medium ${textPrimary} mb-1`}>{proposta.orgao}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            {proposta.itens.length} itens • {proposta.documentos.filter(d => d.status === 'anexado' || d.status === 'validado').length}/{proposta.documentos.length} documentos anexados
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(proposta.valorTotal)}</p>
                          <div className="flex gap-2 mt-3">
                            <Button variant="secondary" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <FileEdit className="w-4 h-4" />
                            </Button>
                            {proposta.status === 'rascunho' && (
                              <Button size="sm" className="gap-1">
                                <Send className="w-4 h-4" />
                                Enviar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gerador de Proposta Automática */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Gerador Automático de Propostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { titulo: 'Descrição de Produtos', icon: Package, desc: 'Descrição detalhada com specs ANVISA', cor: '#6366F1' },
                  { titulo: 'Info ANVISA Automática', icon: Shield, desc: 'Busca registro e validade', cor: '#10B981' },
                  { titulo: 'Upload de Logo', icon: FileImage, desc: 'Personalização da proposta', cor: '#F59E0B' },
                  { titulo: 'PDF Profissional', icon: FileText, desc: 'Geração automática formatada', cor: '#8B5CF6' },
                ].map((item) => (
                  <div 
                    key={item.titulo}
                    className={`p-4 rounded-xl ${inputBg} cursor-pointer hover:opacity-80`}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${item.cor}20` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.cor }} />
                    </div>
                    <h4 className={`font-medium ${textPrimary}`}>{item.titulo}</h4>
                    <p className={`text-xs ${textSecondary}`}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Habilitação */}
        <TabsContent value="habilitacao" className="space-y-4">
          {/* Alertas de Documentos */}
          {(stats.documentosVencidos > 0 || stats.documentosAVencer > 0) && (
            <Card className={`border-l-4 ${stats.documentosVencidos > 0 ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${stats.documentosVencidos > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div>
                    <p className={`font-medium ${textPrimary}`}>
                      {stats.documentosVencidos > 0 
                        ? `${stats.documentosVencidos} documento(s) vencido(s)` 
                        : `${stats.documentosAVencer} documento(s) próximo(s) do vencimento`
                      }
                    </p>
                    <p className={`text-sm ${textSecondary}`}>
                      Renove os documentos para manter a habilitação em licitações
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checklist de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#10B981]" />
                Checklist de Habilitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_DOCUMENTOS_HABILITACAO.map((doc) => {
                  const statusConfig = getStatusConfig(doc.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <div 
                      key={doc.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} ${
                        doc.status === 'vencido' ? 'border-l-4 border-l-red-500' :
                        doc.status === 'a_vencer' ? 'border-l-4 border-l-yellow-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${statusConfig.cor}20` }}
                          >
                            <StatusIcon className="w-5 h-5" style={{ color: statusConfig.cor }} />
                          </div>
                          <div>
                            <p className={`font-medium ${textPrimary}`}>{doc.nome}</p>
                            <p className={`text-sm ${textSecondary}`}>
                              {doc.orgaoEmissor} • Validade: {new Date(doc.dataValidade).toLocaleDateString('pt-BR')}
                            </p>
                            {doc.diasParaVencer !== undefined && doc.status !== 'vencido' && (
                              <p className={`text-xs ${doc.diasParaVencer <= 30 ? 'text-yellow-500' : textSecondary}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {doc.diasParaVencer} dias para vencer
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                          {(doc.status === 'vencido' || doc.status === 'a_vencer') && (
                            <Button size="sm" className="gap-1">
                              <RefreshCw className="w-4 h-4" />
                              Renovar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Validação Automática */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
                Validação Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { titulo: 'Consulta FGTS', icon: Building2, desc: 'Verificar regularidade CEF', cor: '#6366F1' },
                  { titulo: 'Consulta Receita Federal', icon: Globe, desc: 'Certidões federais', cor: '#10B981' },
                  { titulo: 'Consulta ANVISA', icon: Shield, desc: 'AFE e registros', cor: '#8B5CF6' },
                ].map((item) => (
                  <div 
                    key={item.titulo}
                    className={`p-4 rounded-xl ${inputBg} cursor-pointer hover:opacity-80`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.cor}20` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: item.cor }} />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>{item.titulo}</h4>
                        <p className={`text-xs ${textSecondary}`}>{item.desc}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full gap-1">
                      <RefreshCw className="w-4 h-4" />
                      Consultar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes do Processo */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#8B5CF6]" />
              {processoSelecionado?.numero}
            </DialogTitle>
          </DialogHeader>

          {processoSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>{processoSelecionado.orgao}</h4>
                <p className={textSecondary}>{processoSelecionado.objeto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Valor Estimado</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(processoSelecionado.valorEstimado)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Data de Abertura</p>
                  <p className={`font-medium ${textPrimary}`}>{new Date(processoSelecionado.dataAbertura).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Itens */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-3`}>Itens ({processoSelecionado.itens.length})</h4>
                <div className="space-y-2">
                  {processoSelecionado.itens.map((item) => (
                    <div key={item.id} className={`p-3 rounded-xl ${inputBg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${textPrimary}`}>
                            Item {item.numero}: {item.descricao}
                          </p>
                          <p className={`text-sm ${textSecondary}`}>
                            Qtd: {item.quantidade} {item.unidade} • Valor Unit.: {formatCurrency(item.valorUnitarioEstimado)}
                          </p>
                          {item.registroAnvisa && (
                            <p className={`text-xs ${textSecondary}`}>
                              <Shield className="w-3 h-3 inline mr-1" />
                              ANVISA: {item.registroAnvisa}
                            </p>
                          )}
                        </div>
                        <p className={`font-bold ${textPrimary}`}>
                          {formatCurrency(item.quantidade * item.valorUnitarioEstimado)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documentos Exigidos */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-3`}>Documentos Exigidos</h4>
                <div className="flex flex-wrap gap-2">
                  {processoSelecionado.documentosExigidos.map((doc, idx) => (
                    <Badge key={idx} className={`${inputBg} ${textSecondary}`}>
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            {processoSelecionado?.status === 'aberto' && (
              <Button className="gap-2">
                <Target className="w-4 h-4" />
                Criar Proposta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Gerar PDF */}
      <Dialog open={isGerarPDFOpen} onOpenChange={setIsGerarPDFOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6366F1]" />
              Gerar Proposta PDF
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes da proposta para geração automática
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Processo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o processo" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PROCESSOS.filter(p => p.participando).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.numero} - {p.orgao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Logo da Empresa</Label>
              <div className={`p-4 rounded-xl ${inputBg} border-2 border-dashed ${borderColor} text-center cursor-pointer hover:opacity-80`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${textSecondary}`} />
                <p className={textSecondary}>Arraste ou clique para upload</p>
                <p className={`text-xs ${textSecondary}`}>PNG, JPG até 2MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Incluir na Proposta</Label>
              <div className="space-y-2">
                {[
                  'Descrição detalhada dos produtos',
                  'Informações ANVISA',
                  'Especificações técnicas',
                  'Condições comerciais',
                  'Prazo de entrega',
                ].map((item) => (
                  <label key={item} className={`flex items-center gap-2 p-2 rounded-lg ${inputBg} cursor-pointer`}>
                    <input type="checkbox" defaultChecked />
                    <span className={textPrimary}>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsGerarPDFOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Proposta PDF gerada com sucesso!')
              setIsGerarPDFOpen(false)
            }} className="gap-2">
              <FileText className="w-4 h-4" />
              Gerar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nova Proposta */}
      <Dialog open={isNovaPropostaOpen} onOpenChange={setIsNovaPropostaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Nova Proposta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Processo Licitatório</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o processo" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PROCESSOS.filter(p => p.status === 'aberto').map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.numero} - {p.orgao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`p-4 rounded-xl ${inputBg}`}>
              <p className={`text-sm ${textSecondary}`}>
                <Info className="w-4 h-4 inline mr-2" />
                Ao criar a proposta, os itens do processo serão importados automaticamente para preenchimento dos valores.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovaPropostaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Proposta criada! Preencha os valores dos itens.')
              setIsNovaPropostaOpen(false)
            }}>
              Criar Proposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LicitacoesCompleto

