/**
 * ICARUS v5.0 - Fontes Pagadoras
 * 
 * Gestão de fontes pagadoras para procedimentos OPME:
 * - Convênios Diretos (faturamento direto à operadora)
 * - Hospitais com Repasse (hospital como intermediário)
 * 
 * FUNCIONALIDADES:
 * - Cadastro de convênios e hospitais
 * - Tabelas TUSS por operadora
 * - Processos de autorização
 * - Faturamento especializado
 * - Relatórios de performance
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
  Building2, Building, CreditCard, Calendar, Clock, CheckCircle,
  XCircle, AlertTriangle, TrendingUp, TrendingDown, Search, Filter,
  Download, Plus, Eye, FileText, DollarSign, Percent, RefreshCw,
  BarChart3, Target, Layers, Package, Receipt, Send, Printer,
  Phone, Mail, Globe, MapPin, User, Users, Shield, ShieldCheck,
  FileCheck, FileClock, FileWarning, AlertCircle, Info, Edit,
  Trash2, Star, StarOff, ArrowUpRight, ArrowDownRight, Banknote,
  Scale, Handshake, ClipboardList, ClipboardCheck, Activity
} from 'lucide-react'

// ============ TIPOS ============

interface Convenio {
  id: string
  codigo: string
  nome: string
  cnpj: string
  tipo: 'operadora' | 'seguradora' | 'autogestao'
  registroANS: string
  contato: {
    telefone: string
    email: string
    site?: string
  }
  endereco: {
    cidade: string
    uf: string
  }
  condicoes: {
    prazoAutorizacao: number
    prazoPagamento: number
    descontoContratual: number
    glosaMedia: number
  }
  tabelaPrecos: string
  status: 'ativo' | 'inativo' | 'suspenso'
  avaliacao: number
  volumeMensal: number
  faturamentoMensal: number
  dataCadastro: string
}

interface HospitalRepasse {
  id: string
  codigo: string
  nome: string
  cnpj: string
  tipo: 'privado' | 'publico' | 'filantrópico'
  contato: {
    telefone: string
    email: string
    responsavel: string
  }
  endereco: {
    cidade: string
    uf: string
    endereco: string
  }
  condicoes: {
    margemRepasse: number
    prazoRepasse: number
    tipoFaturamento: 'mensal' | 'por_procedimento'
  }
  conveniosAtendidos: string[]
  status: 'ativo' | 'inativo' | 'bloqueado'
  volumeMensal: number
  faturamentoMensal: number
  dataCadastro: string
}

interface TabelaTUSS {
  id: string
  convenioId: string
  convenioNome: string
  codigoTUSS: string
  descricao: string
  valorConvenio: number
  valorNegociado?: number
  vigencia: string
  status: 'vigente' | 'vencida' | 'negociacao'
}

interface AutorizacaoConvenio {
  id: string
  numero: string
  convenio: string
  paciente: string
  procedimento: string
  valorSolicitado: number
  valorAutorizado?: number
  status: 'pendente' | 'autorizado' | 'negado' | 'parcial' | 'vencido'
  dataSolicitacao: string
  dataResposta?: string
  observacoes?: string
}

// ============ DADOS MOCK ============

const MOCK_CONVENIOS: Convenio[] = [
  {
    id: '1',
    codigo: 'CONV-001',
    nome: 'Unimed São Paulo',
    cnpj: '12.345.678/0001-90',
    tipo: 'operadora',
    registroANS: '301337',
    contato: {
      telefone: '(11) 3003-3003',
      email: 'autorizacao@unimed.com.br',
      site: 'www.unimed.com.br',
    },
    endereco: {
      cidade: 'São Paulo',
      uf: 'SP',
    },
    condicoes: {
      prazoAutorizacao: 3,
      prazoPagamento: 30,
      descontoContratual: 5,
      glosaMedia: 2.5,
    },
    tabelaPrecos: 'TUSS 2025',
    status: 'ativo',
    avaliacao: 4.5,
    volumeMensal: 45,
    faturamentoMensal: 850000,
    dataCadastro: '2020-01-15',
  },
  {
    id: '2',
    codigo: 'CONV-002',
    nome: 'Bradesco Saúde',
    cnpj: '23.456.789/0001-01',
    tipo: 'seguradora',
    registroANS: '005711',
    contato: {
      telefone: '(11) 4004-2704',
      email: 'autorizacao@bradescosaude.com.br',
      site: 'www.bradescosaude.com.br',
    },
    endereco: {
      cidade: 'São Paulo',
      uf: 'SP',
    },
    condicoes: {
      prazoAutorizacao: 5,
      prazoPagamento: 45,
      descontoContratual: 8,
      glosaMedia: 3.2,
    },
    tabelaPrecos: 'TUSS 2025',
    status: 'ativo',
    avaliacao: 4.2,
    volumeMensal: 32,
    faturamentoMensal: 620000,
    dataCadastro: '2019-06-20',
  },
  {
    id: '3',
    codigo: 'CONV-003',
    nome: 'SulAmérica Saúde',
    cnpj: '34.567.890/0001-12',
    tipo: 'seguradora',
    registroANS: '006246',
    contato: {
      telefone: '(11) 3003-0123',
      email: 'autorizacao@sulamerica.com.br',
    },
    endereco: {
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
    },
    condicoes: {
      prazoAutorizacao: 2,
      prazoPagamento: 28,
      descontoContratual: 3,
      glosaMedia: 1.8,
    },
    tabelaPrecos: 'TUSS 2025',
    status: 'ativo',
    avaliacao: 4.8,
    volumeMensal: 28,
    faturamentoMensal: 540000,
    dataCadastro: '2021-03-10',
  },
]

const MOCK_HOSPITAIS: HospitalRepasse[] = [
  {
    id: '1',
    codigo: 'HOSP-001',
    nome: 'Hospital São Lucas',
    cnpj: '45.678.901/0001-23',
    tipo: 'privado',
    contato: {
      telefone: '(11) 3456-7890',
      email: 'compras@saolucas.com.br',
      responsavel: 'Dr. Roberto Lima',
    },
    endereco: {
      cidade: 'São Paulo',
      uf: 'SP',
      endereco: 'Av. Paulista, 1000',
    },
    condicoes: {
      margemRepasse: 15,
      prazoRepasse: 60,
      tipoFaturamento: 'mensal',
    },
    conveniosAtendidos: ['Unimed', 'Bradesco', 'SulAmérica', 'Amil'],
    status: 'ativo',
    volumeMensal: 25,
    faturamentoMensal: 450000,
    dataCadastro: '2018-05-15',
  },
  {
    id: '2',
    codigo: 'HOSP-002',
    nome: 'Hospital Albert Einstein',
    cnpj: '56.789.012/0001-34',
    tipo: 'privado',
    contato: {
      telefone: '(11) 2151-1233',
      email: 'opme@einstein.br',
      responsavel: 'Dra. Ana Beatriz',
    },
    endereco: {
      cidade: 'São Paulo',
      uf: 'SP',
      endereco: 'Av. Albert Einstein, 627',
    },
    condicoes: {
      margemRepasse: 12,
      prazoRepasse: 45,
      tipoFaturamento: 'por_procedimento',
    },
    conveniosAtendidos: ['Unimed', 'Bradesco', 'SulAmérica', 'Amil', 'Porto Seguro'],
    status: 'ativo',
    volumeMensal: 35,
    faturamentoMensal: 780000,
    dataCadastro: '2017-02-20',
  },
]

const MOCK_TABELAS_TUSS: TabelaTUSS[] = [
  { id: '1', convenioId: '1', convenioNome: 'Unimed', codigoTUSS: '30715016', descricao: 'Artroplastia total primária do quadril', valorConvenio: 85000, valorNegociado: 82000, vigencia: '2025-12-31', status: 'vigente' },
  { id: '2', convenioId: '1', convenioNome: 'Unimed', codigoTUSS: '30715024', descricao: 'Artroplastia total de revisão do quadril', valorConvenio: 120000, vigencia: '2025-12-31', status: 'vigente' },
  { id: '3', convenioId: '2', convenioNome: 'Bradesco', codigoTUSS: '30715016', descricao: 'Artroplastia total primária do quadril', valorConvenio: 82000, vigencia: '2025-12-31', status: 'vigente' },
  { id: '4', convenioId: '2', convenioNome: 'Bradesco', codigoTUSS: '30716012', descricao: 'Artroplastia total primária do joelho', valorConvenio: 78000, vigencia: '2025-12-31', status: 'vigente' },
]

const MOCK_AUTORIZACOES: AutorizacaoConvenio[] = [
  {
    id: '1',
    numero: 'AUT-2025-001',
    convenio: 'Unimed',
    paciente: 'Maria Silva Santos',
    procedimento: 'Artroplastia Total de Quadril',
    valorSolicitado: 85000,
    valorAutorizado: 82000,
    status: 'autorizado',
    dataSolicitacao: '2025-11-15',
    dataResposta: '2025-11-18',
  },
  {
    id: '2',
    numero: 'AUT-2025-002',
    convenio: 'Bradesco Saúde',
    paciente: 'João Carlos Oliveira',
    procedimento: 'Artroplastia Total de Joelho',
    valorSolicitado: 92000,
    status: 'pendente',
    dataSolicitacao: '2025-11-25',
  },
  {
    id: '3',
    numero: 'AUT-2025-003',
    convenio: 'SulAmérica',
    paciente: 'Ana Paula Ferreira',
    procedimento: 'Artrodese Lombar',
    valorSolicitado: 156000,
    valorAutorizado: 140000,
    status: 'parcial',
    dataSolicitacao: '2025-11-20',
    dataResposta: '2025-11-22',
    observacoes: 'Autorizado parcialmente. Valor do instrumental reduzido.',
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function FontesPagadoras() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('convenios')
  const [searchQuery, setSearchQuery] = useState('')
  const [convenioSelecionado, setConvenioSelecionado] = useState<Convenio | null>(null)
  const [hospitalSelecionado, setHospitalSelecionado] = useState<HospitalRepasse | null>(null)
  const [isDetalhesConvenioOpen, setIsDetalhesConvenioOpen] = useState(false)
  const [isDetalhesHospitalOpen, setIsDetalhesHospitalOpen] = useState(false)
  const [isNovoConvenioOpen, setIsNovoConvenioOpen] = useState(false)
  const [isNovoHospitalOpen, setIsNovoHospitalOpen] = useState(false)

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

  const formatCompact = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
    return formatCurrency(value)
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      ativo: { cor: '#10B981', texto: 'Ativo', icon: CheckCircle },
      inativo: { cor: '#6B7280', texto: 'Inativo', icon: XCircle },
      suspenso: { cor: '#F59E0B', texto: 'Suspenso', icon: AlertTriangle },
      bloqueado: { cor: '#EF4444', texto: 'Bloqueado', icon: XCircle },
      pendente: { cor: '#F59E0B', texto: 'Pendente', icon: Clock },
      autorizado: { cor: '#10B981', texto: 'Autorizado', icon: CheckCircle },
      negado: { cor: '#EF4444', texto: 'Negado', icon: XCircle },
      parcial: { cor: '#3B82F6', texto: 'Parcial', icon: AlertTriangle },
      vencido: { cor: '#6B7280', texto: 'Vencido', icon: Clock },
      vigente: { cor: '#10B981', texto: 'Vigente', icon: CheckCircle },
      negociacao: { cor: '#F59E0B', texto: 'Em Negociação', icon: Handshake },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  // Resumo
  const resumo = useMemo(() => {
    const totalFaturamentoConvenios = MOCK_CONVENIOS.reduce((acc, c) => acc + c.faturamentoMensal, 0)
    const totalFaturamentoHospitais = MOCK_HOSPITAIS.reduce((acc, h) => acc + h.faturamentoMensal, 0)
    
    return {
      totalConvenios: MOCK_CONVENIOS.length,
      conveniosAtivos: MOCK_CONVENIOS.filter(c => c.status === 'ativo').length,
      totalHospitais: MOCK_HOSPITAIS.length,
      hospitaisAtivos: MOCK_HOSPITAIS.filter(h => h.status === 'ativo').length,
      faturamentoTotal: totalFaturamentoConvenios + totalFaturamentoHospitais,
      autorizacoesPendentes: MOCK_AUTORIZACOES.filter(a => a.status === 'pendente').length,
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
            style={{ backgroundColor: '#10B98120' }}
          >
            <Building2 className="w-7 h-7 text-[#10B981]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Fontes Pagadoras</h1>
            <p className={textSecondary}>Convênios Diretos • Hospitais com Repasse</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={() => setIsNovoConvenioOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Convênio
          </Button>
        </div>
      </div>

      {/* Explicação das Fontes Pagadoras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`${cardBg} border-l-4 border-l-[#6366F1]`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-[#6366F1] mt-0.5 flex-shrink-0" />
              <div>
                <p className={`font-medium ${textPrimary}`}>Convênios Diretos</p>
                <p className={`text-sm ${textSecondary}`}>
                  Faturamento direto à operadora de saúde. Requer autorização prévia, 
                  códigos TUSS específicos e documentação médica completa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${cardBg} border-l-4 border-l-[#F59E0B]`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
              <div>
                <p className={`font-medium ${textPrimary}`}>Hospitais com Repasse</p>
                <p className={`text-sm ${textSecondary}`}>
                  Hospital atua como intermediário. Faturamos ao hospital que repassa 
                  o valor do convênio. Margem e prazo de repasse definidos em contrato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Convênios</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.totalConvenios}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Building className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Hospitais</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.totalHospitais}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Faturamento</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(resumo.faturamentoTotal)}</p>
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
                <p className={`text-xs ${textSecondary}`}>Conv. Ativos</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.conveniosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Building className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Hosp. Ativos</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.hospitaisAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                resumo.autorizacoesPendentes > 0 ? 'bg-[#F59E0B]/20' : 'bg-[#10B981]/20'
              }`}>
                <Clock className={`w-5 h-5 ${resumo.autorizacoesPendentes > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`} />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Autorizações</p>
                <p className={`text-2xl font-bold ${resumo.autorizacoesPendentes > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                  {resumo.autorizacoesPendentes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="convenios" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Convênios Diretos
          </TabsTrigger>
          <TabsTrigger value="hospitais" className="gap-2">
            <Building className="w-4 h-4" />
            Hospitais Repasse
          </TabsTrigger>
          <TabsTrigger value="tabelas" className="gap-2">
            <FileText className="w-4 h-4" />
            Tabelas TUSS
          </TabsTrigger>
          <TabsTrigger value="autorizacoes" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Autorizações
          </TabsTrigger>
        </TabsList>

        {/* Tab: Convênios */}
        <TabsContent value="convenios" className="space-y-4">
          {/* Busca */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por nome, CNPJ ou registro ANS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setIsNovoConvenioOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Convênio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Convênios */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {MOCK_CONVENIOS.map((convenio) => {
                  const status = getStatusConfig(convenio.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={convenio.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setConvenioSelecionado(convenio)
                        setIsDetalhesConvenioOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-[#6366F1]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold ${textPrimary}`}>{convenio.nome}</span>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>{convenio.cnpj}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              ANS: {convenio.registroANS} • {convenio.tipo.charAt(0).toUpperCase() + convenio.tipo.slice(1)}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${star <= Math.floor(convenio.avaliacao) ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-400'}`}
                                />
                              ))}
                              <span className={`text-sm ${textSecondary} ml-1`}>{convenio.avaliacao}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(convenio.faturamentoMensal)}</p>
                          <p className={`text-xs ${textSecondary}`}>{convenio.volumeMensal} proc./mês</p>
                          <div className="flex items-center gap-2 mt-2 justify-end">
                            <Badge className="bg-green-500/20 text-green-500 text-xs">
                              {convenio.condicoes.prazoPagamento}d pgto
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-500 text-xs">
                              {convenio.condicoes.descontoContratual}% desc
                            </Badge>
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

        {/* Tab: Hospitais */}
        <TabsContent value="hospitais" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#F59E0B]" />
                Hospitais com Repasse
              </CardTitle>
              <Button onClick={() => setIsNovoHospitalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Hospital
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_HOSPITAIS.map((hospital) => {
                  const status = getStatusConfig(hospital.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={hospital.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setHospitalSelecionado(hospital)
                        setIsDetalhesHospitalOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                            <Building className="w-6 h-6 text-[#F59E0B]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold ${textPrimary}`}>{hospital.nome}</span>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>{hospital.cnpj}</p>
                            <p className={`text-xs ${textSecondary}`}>
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {hospital.endereco.cidade}/{hospital.endereco.uf}
                            </p>
                            <p className={`text-xs ${textSecondary} mt-1`}>
                              Convênios: {hospital.conveniosAtendidos.slice(0, 3).join(', ')}
                              {hospital.conveniosAtendidos.length > 3 && ` +${hospital.conveniosAtendidos.length - 3}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCompact(hospital.faturamentoMensal)}</p>
                          <p className={`text-xs ${textSecondary}`}>{hospital.volumeMensal} proc./mês</p>
                          <div className="flex items-center gap-2 mt-2 justify-end">
                            <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">
                              {hospital.condicoes.margemRepasse}% margem
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-500 text-xs">
                              {hospital.condicoes.prazoRepasse}d repasse
                            </Badge>
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

        {/* Tab: Tabelas TUSS */}
        <TabsContent value="tabelas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3B82F6]" />
                Tabelas de Preços TUSS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_TABELAS_TUSS.map((tabela) => {
                  const status = getStatusConfig(tabela.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={tabela.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="font-mono">{tabela.codigoTUSS}</Badge>
                            <span className={`font-medium ${textPrimary}`}>{tabela.convenioNome}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>{tabela.descricao}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            Vigência: {new Date(tabela.vigencia).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${textPrimary}`}>{formatCurrency(tabela.valorConvenio)}</p>
                          {tabela.valorNegociado && tabela.valorNegociado !== tabela.valorConvenio && (
                            <p className="text-sm text-[#10B981]">
                              Negociado: {formatCurrency(tabela.valorNegociado)}
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

        {/* Tab: Autorizações */}
        <TabsContent value="autorizacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#10B981]" />
                Autorizações de Convênio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_AUTORIZACOES.map((aut) => {
                  const status = getStatusConfig(aut.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={aut.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold ${textPrimary}`}>{aut.numero}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textPrimary}`}>{aut.procedimento}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            Paciente: {aut.paciente} • Convênio: {aut.convenio}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            Solicitado: {new Date(aut.dataSolicitacao).toLocaleDateString('pt-BR')}
                            {aut.dataResposta && ` • Resposta: ${new Date(aut.dataResposta).toLocaleDateString('pt-BR')}`}
                          </p>
                          {aut.observacoes && (
                            <p className={`text-xs text-[#F59E0B] mt-1`}>
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              {aut.observacoes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${textSecondary}`}>Solicitado: {formatCurrency(aut.valorSolicitado)}</p>
                          {aut.valorAutorizado && (
                            <p className={`text-lg font-bold ${aut.valorAutorizado < aut.valorSolicitado ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                              Autorizado: {formatCurrency(aut.valorAutorizado)}
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
      </Tabs>

      {/* Modal: Detalhes Convênio */}
      <Dialog open={isDetalhesConvenioOpen} onOpenChange={setIsDetalhesConvenioOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#6366F1]" />
              {convenioSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>

          {convenioSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>CNPJ</p>
                    <p className={`font-medium ${textPrimary}`}>{convenioSelecionado.cnpj}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Registro ANS</p>
                    <p className={`font-medium ${textPrimary}`}>{convenioSelecionado.registroANS}</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Condições Comerciais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Prazo Autorização</p>
                    <p className={`font-medium ${textPrimary}`}>{convenioSelecionado.condicoes.prazoAutorizacao} dias</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Prazo Pagamento</p>
                    <p className={`font-medium ${textPrimary}`}>{convenioSelecionado.condicoes.prazoPagamento} dias</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Desconto Contratual</p>
                    <p className={`font-medium ${textPrimary}`}>{convenioSelecionado.condicoes.descontoContratual}%</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Glosa Média</p>
                    <p className={`font-medium text-[#EF4444]`}>{convenioSelecionado.condicoes.glosaMedia}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{convenioSelecionado.volumeMensal}</p>
                  <p className={`text-xs ${textSecondary}`}>Procedimentos/Mês</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-2xl font-bold text-[#10B981]`}>{formatCompact(convenioSelecionado.faturamentoMensal)}</p>
                  <p className={`text-xs ${textSecondary}`}>Faturamento/Mês</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesConvenioOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Convênio */}
      <Dialog open={isNovoConvenioOpen} onOpenChange={setIsNovoConvenioOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Novo Convênio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Convênio *</Label>
              <Input placeholder="Nome da operadora" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label>Registro ANS *</Label>
                <Input placeholder="000000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operadora">Operadora</SelectItem>
                  <SelectItem value="seguradora">Seguradora</SelectItem>
                  <SelectItem value="autogestao">Autogestão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prazo Pagamento (dias)</Label>
                <Input type="number" placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label>Desconto (%)</Label>
                <Input type="number" placeholder="5" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovoConvenioOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Convênio cadastrado com sucesso!')
              setIsNovoConvenioOpen(false)
            }}>
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Detalhes Hospital */}
      <Dialog open={isDetalhesHospitalOpen} onOpenChange={setIsDetalhesHospitalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-[#F59E0B]" />
              {hospitalSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>

          {hospitalSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>CNPJ</p>
                    <p className={`font-medium ${textPrimary}`}>{hospitalSelecionado.cnpj}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Tipo</p>
                    <p className={`font-medium ${textPrimary}`}>{hospitalSelecionado.tipo}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className={`text-xs ${textSecondary}`}>Endereço</p>
                  <p className={`font-medium ${textPrimary}`}>
                    {hospitalSelecionado.endereco.endereco}, {hospitalSelecionado.endereco.cidade}/{hospitalSelecionado.endereco.uf}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Condições de Repasse</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Margem Repasse</p>
                    <p className={`font-medium text-[#F59E0B]`}>{hospitalSelecionado.condicoes.margemRepasse}%</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Prazo Repasse</p>
                    <p className={`font-medium ${textPrimary}`}>{hospitalSelecionado.condicoes.prazoRepasse} dias</p>
                  </div>
                </div>
              </div>

              <div>
                <p className={`text-xs ${textSecondary} mb-2`}>Convênios Atendidos</p>
                <div className="flex flex-wrap gap-2">
                  {hospitalSelecionado.conveniosAtendidos.map((conv, idx) => (
                    <Badge key={idx} className="bg-blue-500/20 text-blue-500">{conv}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesHospitalOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Hospital */}
      <Dialog open={isNovoHospitalOpen} onOpenChange={setIsNovoHospitalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#F59E0B]" />
              Novo Hospital
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Hospital *</Label>
              <Input placeholder="Nome do hospital" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privado">Privado</SelectItem>
                    <SelectItem value="publico">Público</SelectItem>
                    <SelectItem value="filantropico">Filantrópico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Margem Repasse (%)</Label>
                <Input type="number" placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label>Prazo Repasse (dias)</Label>
                <Input type="number" placeholder="60" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovoHospitalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Hospital cadastrado com sucesso!')
              setIsNovoHospitalOpen(false)
            }}>
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FontesPagadoras

