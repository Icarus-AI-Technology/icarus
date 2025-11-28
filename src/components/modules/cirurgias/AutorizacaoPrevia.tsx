/**
 * ICARUS v5.0 - Autorização Prévia e Workflow
 * 
 * Gestão completa do processo de autorização prévia para
 * procedimentos cirúrgicos OPME.
 * 
 * FUNCIONALIDADES:
 * - Upload de pedido médico com OCR
 * - Validação automática de CRM
 * - Processamento de produtos OPME
 * - Workflow de autorização por convênio
 * - Reserva automática de estoque
 * - Integração com agendamento
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
  FileText, Upload, CheckCircle, XCircle, Clock, AlertTriangle,
  Search, Filter, Download, Plus, Eye, Send, RefreshCw, BrainCircuit,
  User, Building2, Calendar, Package, ClipboardList, ClipboardCheck,
  FileCheck, FileClock, FileWarning, FileX, Shield, ShieldCheck,
  Stethoscope, Activity, Zap, Target, ArrowRight, ArrowLeft,
  ChevronRight, ChevronDown, MoreVertical, Edit, Trash2, Copy,
  Phone, Mail, Printer, ExternalLink, Info, AlertCircle, History,
  Play, Pause, SkipForward, Check, X, MessageSquare, Paperclip
} from 'lucide-react'

// ============ TIPOS ============

interface SolicitacaoAutorizacao {
  id: string
  numero: string
  dataSolicitacao: string
  paciente: {
    nome: string
    convenio: string
    carteirinha: string
  }
  medico: {
    nome: string
    crm: string
    especialidade: string
    validado: boolean
  }
  procedimento: {
    codigo: string
    descricao: string
    tipo: string
  }
  hospital: string
  dataPrevisao: string
  valorSolicitado: number
  valorAutorizado?: number
  status: 'rascunho' | 'aguardando_docs' | 'em_analise' | 'autorizado' | 'negado' | 'parcial' | 'vencido' | 'cancelado'
  etapaAtual: number
  totalEtapas: number
  urgencia: 'eletiva' | 'urgencia' | 'emergencia'
  documentos: Documento[]
  historico: HistoricoEtapa[]
  observacoes?: string
}

interface Documento {
  id: string
  tipo: 'pedido_medico' | 'laudo' | 'exames' | 'guia_tiss' | 'termo_consentimento' | 'outros'
  nome: string
  status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado'
  dataUpload?: string
  observacao?: string
}

interface HistoricoEtapa {
  id: string
  etapa: string
  status: 'concluido' | 'atual' | 'pendente' | 'erro'
  dataInicio?: string
  dataFim?: string
  responsavel?: string
  observacao?: string
}

interface EtapaWorkflow {
  id: number
  nome: string
  descricao: string
  icone: any
  cor: string
}

// ============ DADOS MOCK ============

const ETAPAS_WORKFLOW: EtapaWorkflow[] = [
  { id: 1, nome: 'Pedido Médico', descricao: 'Upload e validação do pedido', icone: FileText, cor: '#6366F1' },
  { id: 2, nome: 'Validação CRM', descricao: 'Verificação do médico no CFM', icone: ShieldCheck, cor: '#10B981' },
  { id: 3, nome: 'Documentação', descricao: 'Anexo de documentos obrigatórios', icone: Paperclip, cor: '#F59E0B' },
  { id: 4, nome: 'Análise Convênio', descricao: 'Envio e análise pela operadora', icone: Building2, cor: '#3B82F6' },
  { id: 5, nome: 'Autorização', descricao: 'Resposta final do convênio', icone: CheckCircle, cor: '#10B981' },
  { id: 6, nome: 'Reserva Estoque', descricao: 'Reserva automática de materiais', icone: Package, cor: '#8B5CF6' },
  { id: 7, nome: 'Agendamento', descricao: 'Confirmação da data cirúrgica', icone: Calendar, cor: '#EC4899' },
]

const MOCK_SOLICITACOES: SolicitacaoAutorizacao[] = [
  {
    id: '1',
    numero: 'AUT-2025-001',
    dataSolicitacao: '2025-11-20',
    paciente: {
      nome: 'Maria Silva Santos',
      convenio: 'Unimed',
      carteirinha: '0012345678901234',
    },
    medico: {
      nome: 'Dr. Carlos Eduardo',
      crm: 'SP-123456',
      especialidade: 'Ortopedia',
      validado: true,
    },
    procedimento: {
      codigo: '30715016',
      descricao: 'Artroplastia Total Primária do Quadril',
      tipo: 'Cirurgia',
    },
    hospital: 'Hospital São Lucas',
    dataPrevisao: '2025-12-10',
    valorSolicitado: 85000,
    valorAutorizado: 82000,
    status: 'autorizado',
    etapaAtual: 7,
    totalEtapas: 7,
    urgencia: 'eletiva',
    documentos: [
      { id: '1', tipo: 'pedido_medico', nome: 'Pedido_Medico_001.pdf', status: 'aprovado', dataUpload: '2025-11-20' },
      { id: '2', tipo: 'laudo', nome: 'Laudo_Medico.pdf', status: 'aprovado', dataUpload: '2025-11-20' },
      { id: '3', tipo: 'exames', nome: 'Exames_Imagem.pdf', status: 'aprovado', dataUpload: '2025-11-21' },
      { id: '4', tipo: 'guia_tiss', nome: 'Guia_TISS.pdf', status: 'aprovado', dataUpload: '2025-11-22' },
    ],
    historico: [
      { id: '1', etapa: 'Pedido Médico', status: 'concluido', dataInicio: '2025-11-20', dataFim: '2025-11-20', responsavel: 'Sistema OCR' },
      { id: '2', etapa: 'Validação CRM', status: 'concluido', dataInicio: '2025-11-20', dataFim: '2025-11-20', responsavel: 'CFM API' },
      { id: '3', etapa: 'Documentação', status: 'concluido', dataInicio: '2025-11-20', dataFim: '2025-11-22', responsavel: 'Ana Paula' },
      { id: '4', etapa: 'Análise Convênio', status: 'concluido', dataInicio: '2025-11-22', dataFim: '2025-11-25', responsavel: 'Unimed' },
      { id: '5', etapa: 'Autorização', status: 'concluido', dataInicio: '2025-11-25', dataFim: '2025-11-25', responsavel: 'Unimed', observacao: 'Autorizado com ajuste de valor' },
      { id: '6', etapa: 'Reserva Estoque', status: 'concluido', dataInicio: '2025-11-25', dataFim: '2025-11-25', responsavel: 'Sistema' },
      { id: '7', etapa: 'Agendamento', status: 'concluido', dataInicio: '2025-11-25', dataFim: '2025-11-26', responsavel: 'João Silva' },
    ],
  },
  {
    id: '2',
    numero: 'AUT-2025-002',
    dataSolicitacao: '2025-11-25',
    paciente: {
      nome: 'João Carlos Oliveira',
      convenio: 'Bradesco Saúde',
      carteirinha: '0098765432109876',
    },
    medico: {
      nome: 'Dra. Ana Beatriz',
      crm: 'SP-654321',
      especialidade: 'Ortopedia',
      validado: true,
    },
    procedimento: {
      codigo: '30716012',
      descricao: 'Artroplastia Total Primária do Joelho',
      tipo: 'Cirurgia',
    },
    hospital: 'Hospital Albert Einstein',
    dataPrevisao: '2025-12-15',
    valorSolicitado: 92000,
    status: 'em_analise',
    etapaAtual: 4,
    totalEtapas: 7,
    urgencia: 'eletiva',
    documentos: [
      { id: '5', tipo: 'pedido_medico', nome: 'Pedido_Medico_002.pdf', status: 'aprovado', dataUpload: '2025-11-25' },
      { id: '6', tipo: 'laudo', nome: 'Laudo_Medico.pdf', status: 'aprovado', dataUpload: '2025-11-25' },
      { id: '7', tipo: 'exames', nome: 'Exames_Imagem.pdf', status: 'enviado', dataUpload: '2025-11-26' },
      { id: '8', tipo: 'guia_tiss', nome: 'Guia_TISS.pdf', status: 'pendente' },
    ],
    historico: [
      { id: '8', etapa: 'Pedido Médico', status: 'concluido', dataInicio: '2025-11-25', dataFim: '2025-11-25' },
      { id: '9', etapa: 'Validação CRM', status: 'concluido', dataInicio: '2025-11-25', dataFim: '2025-11-25' },
      { id: '10', etapa: 'Documentação', status: 'concluido', dataInicio: '2025-11-25', dataFim: '2025-11-26' },
      { id: '11', etapa: 'Análise Convênio', status: 'atual', dataInicio: '2025-11-26' },
    ],
  },
  {
    id: '3',
    numero: 'AUT-2025-003',
    dataSolicitacao: '2025-11-27',
    paciente: {
      nome: 'Ana Paula Ferreira',
      convenio: 'SulAmérica',
      carteirinha: '0054321098765432',
    },
    medico: {
      nome: 'Dr. Roberto Lima',
      crm: 'SP-789012',
      especialidade: 'Neurocirurgia',
      validado: false,
    },
    procedimento: {
      codigo: '30717019',
      descricao: 'Artrodese Lombar',
      tipo: 'Cirurgia',
    },
    hospital: 'Hospital Sírio-Libanês',
    dataPrevisao: '2025-12-20',
    valorSolicitado: 156000,
    status: 'aguardando_docs',
    etapaAtual: 2,
    totalEtapas: 7,
    urgencia: 'urgencia',
    documentos: [
      { id: '9', tipo: 'pedido_medico', nome: 'Pedido_Medico_003.pdf', status: 'aprovado', dataUpload: '2025-11-27' },
      { id: '10', tipo: 'laudo', nome: '', status: 'pendente' },
      { id: '11', tipo: 'exames', nome: '', status: 'pendente' },
    ],
    historico: [
      { id: '12', etapa: 'Pedido Médico', status: 'concluido', dataInicio: '2025-11-27', dataFim: '2025-11-27' },
      { id: '13', etapa: 'Validação CRM', status: 'erro', dataInicio: '2025-11-27', observacao: 'CRM não encontrado. Verificar dados.' },
    ],
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function AutorizacaoPrevia() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('solicitacoes')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoAutorizacao | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovaSolicitacaoOpen, setIsNovaSolicitacaoOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

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
      rascunho: { cor: '#6B7280', texto: 'Rascunho', icon: FileText },
      aguardando_docs: { cor: '#F59E0B', texto: 'Aguardando Docs', icon: FileClock },
      em_analise: { cor: '#3B82F6', texto: 'Em Análise', icon: Clock },
      autorizado: { cor: '#10B981', texto: 'Autorizado', icon: CheckCircle },
      negado: { cor: '#EF4444', texto: 'Negado', icon: XCircle },
      parcial: { cor: '#8B5CF6', texto: 'Parcial', icon: AlertTriangle },
      vencido: { cor: '#6B7280', texto: 'Vencido', icon: Clock },
      cancelado: { cor: '#6B7280', texto: 'Cancelado', icon: XCircle },
      concluido: { cor: '#10B981', texto: 'Concluído', icon: CheckCircle },
      atual: { cor: '#3B82F6', texto: 'Em Andamento', icon: Play },
      pendente: { cor: '#6B7280', texto: 'Pendente', icon: Clock },
      erro: { cor: '#EF4444', texto: 'Erro', icon: AlertTriangle },
      aprovado: { cor: '#10B981', texto: 'Aprovado', icon: CheckCircle },
      enviado: { cor: '#3B82F6', texto: 'Enviado', icon: Send },
      rejeitado: { cor: '#EF4444', texto: 'Rejeitado', icon: XCircle },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  const getUrgenciaConfig = (urgencia: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      eletiva: { cor: '#10B981', texto: 'Eletiva' },
      urgencia: { cor: '#F59E0B', texto: 'Urgência' },
      emergencia: { cor: '#EF4444', texto: 'Emergência' },
    }
    return configs[urgencia] || { cor: '#6B7280', texto: urgencia }
  }

  // Filtrar solicitações
  const solicitacoesFiltradas = useMemo(() => {
    return MOCK_SOLICITACOES.filter(s => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!s.numero.toLowerCase().includes(query) &&
            !s.paciente.nome.toLowerCase().includes(query) &&
            !s.medico.nome.toLowerCase().includes(query)) {
          return false
        }
      }
      if (filtroStatus !== 'todos' && s.status !== filtroStatus) {
        return false
      }
      return true
    })
  }, [searchQuery, filtroStatus])

  // Resumo
  const resumo = useMemo(() => {
    return {
      total: MOCK_SOLICITACOES.length,
      emAnalise: MOCK_SOLICITACOES.filter(s => s.status === 'em_analise').length,
      aguardandoDocs: MOCK_SOLICITACOES.filter(s => s.status === 'aguardando_docs').length,
      autorizadas: MOCK_SOLICITACOES.filter(s => s.status === 'autorizado').length,
      taxaAprovacao: 85,
    }
  }, [])

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
            style={{ backgroundColor: '#3B82F620' }}
          >
            <ClipboardCheck className="w-7 h-7 text-[#3B82F6]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Autorização Prévia</h1>
            <p className={textSecondary}>Workflow de autorização • OCR • Validação CRM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsUploadOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Pedido
          </Button>
          <Button onClick={() => setIsNovaSolicitacaoOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Total</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Em Análise</p>
                <p className={`text-2xl font-bold text-[#3B82F6]`}>{resumo.emAnalise}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <FileClock className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Aguardando</p>
                <p className={`text-2xl font-bold text-[#F59E0B]`}>{resumo.aguardandoDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Autorizadas</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.autorizadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Taxa Aprovação</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.taxaAprovacao}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="solicitacoes" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <Activity className="w-4 h-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-2">
            <Paperclip className="w-4 h-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Solicitações */}
        <TabsContent value="solicitacoes" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por número, paciente ou médico..."
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
                    <SelectItem value="aguardando_docs">Aguardando Docs</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="autorizado">Autorizado</SelectItem>
                    <SelectItem value="negado">Negado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Solicitações */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {solicitacoesFiltradas.map((sol) => {
                  const status = getStatusConfig(sol.status)
                  const StatusIcon = status.icon
                  const urgencia = getUrgenciaConfig(sol.urgencia)
                  const progresso = (sol.etapaAtual / sol.totalEtapas) * 100
                  
                  return (
                    <div 
                      key={sol.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setSolicitacaoSelecionada(sol)
                        setIsDetalhesOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{sol.numero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${urgencia.cor}20`, color: urgencia.cor }}
                            >
                              {urgencia.texto}
                            </Badge>
                            {!sol.medico.validado && (
                              <Badge className="bg-red-500/20 text-red-500 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                CRM Pendente
                              </Badge>
                            )}
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{sol.paciente.nome}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            {sol.procedimento.descricao}
                          </p>
                          <div className={`text-xs ${textSecondary} mt-1 flex gap-4`}>
                            <span>
                              <Stethoscope className="w-3 h-3 inline mr-1" />
                              {sol.medico.nome}
                            </span>
                            <span>
                              <Building2 className="w-3 h-3 inline mr-1" />
                              {sol.hospital}
                            </span>
                            <span>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(sol.dataPrevisao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          {/* Barra de Progresso */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs ${textSecondary}`}>Progresso</span>
                              <span className={`text-xs ${textPrimary}`}>{sol.etapaAtual}/{sol.totalEtapas}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${progresso}%`, backgroundColor: status.cor }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(sol.valorSolicitado)}</p>
                          {sol.valorAutorizado && sol.valorAutorizado !== sol.valorSolicitado && (
                            <p className={`text-sm ${sol.valorAutorizado < sol.valorSolicitado ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                              Autorizado: {formatCurrency(sol.valorAutorizado)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Workflow */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#6366F1]" />
                Etapas do Workflow de Autorização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Linha conectora */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-700" />
                
                <div className="space-y-6">
                  {ETAPAS_WORKFLOW.map((etapa, idx) => {
                    const EtapaIcon = etapa.icone
                    return (
                      <div key={etapa.id} className="flex items-start gap-4 relative">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center z-10"
                          style={{ backgroundColor: `${etapa.cor}20` }}
                        >
                          <EtapaIcon className="w-6 h-6" style={{ color: etapa.cor }} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${textPrimary}`}>{etapa.nome}</h4>
                          <p className={`text-sm ${textSecondary}`}>{etapa.descricao}</p>
                        </div>
                        <Badge className="text-xs bg-gray-500/20 text-gray-400">
                          Etapa {etapa.id}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-[#F59E0B]" />
                Documentos Obrigatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { tipo: 'Pedido Médico', descricao: 'Prescrição do médico solicitante', obrigatorio: true },
                  { tipo: 'Laudo Médico', descricao: 'Justificativa clínica detalhada', obrigatorio: true },
                  { tipo: 'Exames de Imagem', descricao: 'RX, RM, TC conforme procedimento', obrigatorio: true },
                  { tipo: 'Guia TISS', descricao: 'Guia de solicitação padrão ANS', obrigatorio: true },
                  { tipo: 'Termo de Consentimento', descricao: 'Assinado pelo paciente', obrigatorio: false },
                  { tipo: 'Outros Documentos', descricao: 'Documentação complementar', obrigatorio: false },
                ].map((doc, idx) => (
                  <div key={idx} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#6366F1]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${textPrimary}`}>{doc.tipo}</h4>
                          {doc.obrigatorio && (
                            <Badge className="bg-red-500/20 text-red-500 text-xs">Obrigatório</Badge>
                          )}
                        </div>
                        <p className={`text-sm ${textSecondary}`}>{doc.descricao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes da Solicitação */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#3B82F6]" />
              {solicitacaoSelecionada?.numero}
            </DialogTitle>
          </DialogHeader>

          {solicitacaoSelecionada && (
            <div className="space-y-4 py-4">
              {/* Status e Progresso */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    className="text-sm"
                    style={{ 
                      backgroundColor: `${getStatusConfig(solicitacaoSelecionada.status).cor}20`, 
                      color: getStatusConfig(solicitacaoSelecionada.status).cor 
                    }}
                  >
                    {getStatusConfig(solicitacaoSelecionada.status).texto}
                  </Badge>
                  <span className={`text-sm ${textSecondary}`}>
                    Etapa {solicitacaoSelecionada.etapaAtual} de {solicitacaoSelecionada.totalEtapas}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(solicitacaoSelecionada.etapaAtual / solicitacaoSelecionada.totalEtapas) * 100}%`, 
                      backgroundColor: getStatusConfig(solicitacaoSelecionada.status).cor 
                    }}
                  />
                </div>
              </div>

              {/* Paciente e Médico */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <h4 className={`font-medium ${textPrimary} mb-2`}>Paciente</h4>
                  <p className={`text-sm ${textPrimary}`}>{solicitacaoSelecionada.paciente.nome}</p>
                  <p className={`text-xs ${textSecondary}`}>
                    {solicitacaoSelecionada.paciente.convenio} • {solicitacaoSelecionada.paciente.carteirinha}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <h4 className={`font-medium ${textPrimary} mb-2`}>Médico</h4>
                  <p className={`text-sm ${textPrimary}`}>{solicitacaoSelecionada.medico.nome}</p>
                  <p className={`text-xs ${textSecondary}`}>
                    CRM: {solicitacaoSelecionada.medico.crm}
                    {solicitacaoSelecionada.medico.validado 
                      ? <CheckCircle className="w-4 h-4 inline ml-2 text-[#10B981]" />
                      : <AlertTriangle className="w-4 h-4 inline ml-2 text-[#EF4444]" />
                    }
                  </p>
                </div>
              </div>

              {/* Procedimento */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Procedimento</h4>
                <p className={`text-sm ${textPrimary}`}>{solicitacaoSelecionada.procedimento.descricao}</p>
                <p className={`text-xs ${textSecondary}`}>
                  TUSS: {solicitacaoSelecionada.procedimento.codigo} • {solicitacaoSelecionada.hospital}
                </p>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Valor Solicitado</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(solicitacaoSelecionada.valorSolicitado)}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-xs ${textSecondary}`}>Valor Autorizado</p>
                  <p className={`text-xl font-bold ${solicitacaoSelecionada.valorAutorizado ? 'text-[#10B981]' : textSecondary}`}>
                    {solicitacaoSelecionada.valorAutorizado 
                      ? formatCurrency(solicitacaoSelecionada.valorAutorizado)
                      : 'Aguardando'
                    }
                  </p>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Documentos</h4>
                <div className="space-y-2">
                  {solicitacaoSelecionada.documentos.map((doc) => {
                    const docStatus = getStatusConfig(doc.status)
                    const DocIcon = docStatus.icon
                    return (
                      <div key={doc.id} className={`p-2 rounded-lg ${inputBg} flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <DocIcon className="w-4 h-4" style={{ color: docStatus.cor }} />
                          <span className={`text-sm ${textPrimary}`}>{doc.nome || doc.tipo}</span>
                        </div>
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: `${docStatus.cor}20`, color: docStatus.cor }}
                        >
                          {docStatus.texto}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Histórico */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Histórico</h4>
                <div className="space-y-2">
                  {solicitacaoSelecionada.historico.map((hist) => {
                    const histStatus = getStatusConfig(hist.status)
                    const HistIcon = histStatus.icon
                    return (
                      <div key={hist.id} className={`p-2 rounded-lg ${inputBg}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HistIcon className="w-4 h-4" style={{ color: histStatus.cor }} />
                            <span className={`text-sm ${textPrimary}`}>{hist.etapa}</span>
                          </div>
                          <span className={`text-xs ${textSecondary}`}>
                            {hist.dataInicio && new Date(hist.dataInicio).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {hist.observacao && (
                          <p className={`text-xs ${textSecondary} mt-1 ml-6`}>{hist.observacao}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nova Solicitação */}
      <Dialog open={isNovaSolicitacaoOpen} onOpenChange={setIsNovaSolicitacaoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Nova Solicitação de Autorização
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Maria Silva Santos - Unimed</SelectItem>
                  <SelectItem value="2">João Carlos Oliveira - Bradesco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Médico Solicitante *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dr. Carlos Eduardo - SP-123456</SelectItem>
                  <SelectItem value="2">Dra. Ana Beatriz - SP-654321</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Procedimento *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30715016">30715016 - Artroplastia Total Quadril</SelectItem>
                  <SelectItem value="30716012">30716012 - Artroplastia Total Joelho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hospital *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hospital São Lucas</SelectItem>
                    <SelectItem value="2">Hospital Albert Einstein</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urgência *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eletiva">Eletiva</SelectItem>
                    <SelectItem value="urgencia">Urgência</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Prevista *</Label>
              <Input type="date" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovaSolicitacaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Solicitação criada! Faça upload do pedido médico.')
              setIsNovaSolicitacaoOpen(false)
            }}>
              Criar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Upload */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#6366F1]" />
              Upload de Pedido Médico
            </DialogTitle>
            <DialogDescription>
              Faça upload do pedido médico para processamento OCR
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDark ? 'border-gray-600 hover:border-[#6366F1]' : 'border-gray-300 hover:border-[#6366F1]'
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
              <p className={`font-medium ${textPrimary}`}>Arraste o arquivo aqui</p>
              <p className={`text-sm ${textSecondary}`}>ou clique para selecionar</p>
              <p className={`text-xs ${textSecondary} mt-2`}>PDF, JPG ou PNG (máx. 10MB)</p>
            </div>

            <div className={`p-4 rounded-xl ${inputBg}`}>
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                <div>
                  <p className={`font-medium ${textPrimary}`}>Processamento OCR</p>
                  <p className={`text-sm ${textSecondary}`}>
                    O sistema irá extrair automaticamente: nome do paciente, CRM do médico, 
                    procedimento solicitado e materiais OPME.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsUploadOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Upload realizado! Processando OCR...')
              setIsUploadOpen(false)
            }} className="gap-2">
              <Upload className="w-4 h-4" />
              Fazer Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AutorizacaoPrevia

