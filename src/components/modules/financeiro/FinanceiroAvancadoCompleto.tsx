/**
 * ICARUS v5.0 - Financeiro Avançado Completo
 * 
 * Sistema financeiro enterprise com integração Pluggy/DDA,
 * conciliação ML, e gestão completa de pagamentos.
 * 
 * FUNCIONALIDADES:
 * - Integração Pluggy (Open Banking)
 * - DDA (Débito Direto Autorizado)
 * - Conciliação Bancária com ML
 * - Relatórios Fiscais Automatizados
 * - Gestão de Consentimentos
 * - Alertas de Divergência
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
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, CreditCard, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingDown, TrendingUp, Search, Filter,
  Download, Plus, Eye, FileText, Building2, User, DollarSign,
  ArrowUpRight, ArrowDownRight, RefreshCw, BrainCircuit, Zap,
  Send, CheckSquare, MoreVertical, ChevronRight, Upload,
  Banknote, PiggyBank, Receipt, BarChart3, Target, Layers,
  Settings, Shield, Key, Link2, Webhook, Server, Database,
  FileCheck, FileClock, FileWarning, FileX, Lock, Unlock,
  AlertCircle, Info, HelpCircle, ExternalLink, Copy, Trash2,
  Play, Pause, RotateCcw, Globe, Cpu, Activity, Gauge,
  GitBranch, History, Fingerprint, ShieldCheck, ShieldAlert,
  Ban, ThumbsUp, ThumbsDown, Printer, Mail, Bell, BellRing
} from 'lucide-react'

// ============ TIPOS ============

interface PluggyConfig {
  clientId: string
  clientSecret: string
  ambiente: 'sandbox' | 'production'
  escopos: string[]
  webhookUrl: string
  rateLimit: number
  batchSize: number
  consentimentoAtivo: boolean
  ultimaSincronizacao?: string
}

interface ConsentimentoDDA {
  id: string
  banco: string
  codigoBanco: string
  status: 'autorizado' | 'pendente' | 'revogado' | 'expirado'
  dataAutorizacao?: string
  dataExpiracao?: string
  contaCorrente: string
  agencia: string
  tiposConta: string[]
}

interface DebitoDDA {
  id: string
  cedente: string
  cnpjCedente: string
  valor: number
  dataVencimento: string
  dataEmissao: string
  numeroDocumento: string
  codigoBarras: string
  status: 'pendente' | 'autorizado' | 'negado' | 'pago' | 'vencido'
  motivoNegacao?: string
  consentimentoId: string
}

interface RegraConciliacao {
  id: string
  nome: string
  tipo: 'duplicata' | 'similaridade' | 'valor' | 'data' | 'custom'
  parametros: Record<string, number | string>
  ativa: boolean
  precisaoML: number
  ultimaExecucao?: string
}

interface AlertaDivergencia {
  id: string
  tipo: 'valor_diferente' | 'duplicata_suspeita' | 'data_inconsistente' | 'lancamento_nao_encontrado'
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  descricao: string
  valorSistema?: number
  valorBanco?: number
  dataDeteccao: string
  status: 'pendente' | 'resolvido' | 'ignorado'
  resolucao?: string
  responsavel?: string
}

interface StatusSubmódulo {
  nome: string
  status: 'ok' | 'needs-review' | 'error' | 'warning'
  ultimaVerificacao: string
  detalhes: string
  acoesPendentes: number
}

// ============ DADOS MOCK ============

const MOCK_PLUGGY_CONFIG: PluggyConfig = {
  clientId: 'pk_live_xxx...xxx',
  clientSecret: '••••••••••••••••',
  ambiente: 'sandbox',
  escopos: ['accounts', 'transactions', 'identity', 'investments'],
  webhookUrl: 'https://api.icarus.com/webhooks/pluggy',
  rateLimit: 100,
  batchSize: 50,
  consentimentoAtivo: true,
  ultimaSincronizacao: '2025-11-28T10:30:00',
}

const MOCK_CONSENTIMENTOS: ConsentimentoDDA[] = [
  {
    id: '1',
    banco: 'Banco do Brasil',
    codigoBanco: '001',
    status: 'autorizado',
    dataAutorizacao: '2025-10-15',
    dataExpiracao: '2026-10-15',
    contaCorrente: '12345-6',
    agencia: '1234',
    tiposConta: ['corrente', 'poupanca'],
  },
  {
    id: '2',
    banco: 'Itaú Unibanco',
    codigoBanco: '341',
    status: 'autorizado',
    dataAutorizacao: '2025-09-20',
    dataExpiracao: '2026-09-20',
    contaCorrente: '98765-4',
    agencia: '5678',
    tiposConta: ['corrente'],
  },
  {
    id: '3',
    banco: 'Bradesco',
    codigoBanco: '237',
    status: 'pendente',
    contaCorrente: '11111-1',
    agencia: '9999',
    tiposConta: ['corrente'],
  },
  {
    id: '4',
    banco: 'Santander',
    codigoBanco: '033',
    status: 'revogado',
    dataAutorizacao: '2025-01-10',
    contaCorrente: '22222-2',
    agencia: '8888',
    tiposConta: ['corrente'],
  },
]

const MOCK_DEBITOS: DebitoDDA[] = [
  {
    id: '1',
    cedente: 'Zimmer Biomet Brasil',
    cnpjCedente: '12.345.678/0001-90',
    valor: 125000.00,
    dataVencimento: '2025-12-15',
    dataEmissao: '2025-11-15',
    numeroDocumento: 'NF-2025-001234',
    codigoBarras: '23793.38128 60000.000003 00000.000405 1 84640000012500',
    status: 'pendente',
    consentimentoId: '1',
  },
  {
    id: '2',
    cedente: 'Smith & Nephew',
    cnpjCedente: '23.456.789/0001-01',
    valor: 45000.00,
    dataVencimento: '2025-11-30',
    dataEmissao: '2025-11-10',
    numeroDocumento: 'NF-2025-005678',
    codigoBarras: '34191.79001 01043.510047 91020.150008 8 84640000004500',
    status: 'autorizado',
    consentimentoId: '2',
  },
  {
    id: '3',
    cedente: 'Medtronic',
    cnpjCedente: '34.567.890/0001-12',
    valor: 89500.00,
    dataVencimento: '2025-12-05',
    dataEmissao: '2025-11-20',
    numeroDocumento: 'NF-2025-009012',
    codigoBarras: '23793.38128 60000.000003 00000.000406 1 84640000008950',
    status: 'negado',
    motivoNegacao: 'Valor divergente do pedido de compra',
    consentimentoId: '1',
  },
]

const MOCK_REGRAS_CONCILIACAO: RegraConciliacao[] = [
  {
    id: '1',
    nome: 'Detecção de Duplicatas',
    tipo: 'duplicata',
    parametros: { tolerancia_valor: 0.01, janela_dias: 5 },
    ativa: true,
    precisaoML: 98.5,
    ultimaExecucao: '2025-11-28T09:00:00',
  },
  {
    id: '2',
    nome: 'Similaridade de Descrição',
    tipo: 'similaridade',
    parametros: { threshold: 0.85, algoritmo: 'levenshtein' },
    ativa: true,
    precisaoML: 94.2,
    ultimaExecucao: '2025-11-28T09:00:00',
  },
  {
    id: '3',
    nome: 'Tolerância de Valor',
    tipo: 'valor',
    parametros: { tolerancia_percentual: 0.5, tolerancia_absoluta: 10 },
    ativa: true,
    precisaoML: 99.1,
    ultimaExecucao: '2025-11-28T09:00:00',
  },
  {
    id: '4',
    nome: 'Janela de Data',
    tipo: 'data',
    parametros: { dias_antes: 3, dias_depois: 3 },
    ativa: false,
    precisaoML: 96.8,
  },
]

const MOCK_ALERTAS: AlertaDivergencia[] = [
  {
    id: '1',
    tipo: 'valor_diferente',
    severidade: 'alta',
    descricao: 'Valor do extrato bancário difere do lançamento',
    valorSistema: 45000.00,
    valorBanco: 45050.00,
    dataDeteccao: '2025-11-28T08:30:00',
    status: 'pendente',
  },
  {
    id: '2',
    tipo: 'duplicata_suspeita',
    severidade: 'media',
    descricao: 'Possível lançamento duplicado detectado',
    valorSistema: 12300.00,
    dataDeteccao: '2025-11-28T09:15:00',
    status: 'pendente',
  },
  {
    id: '3',
    tipo: 'lancamento_nao_encontrado',
    severidade: 'critica',
    descricao: 'Débito no extrato sem correspondência no sistema',
    valorBanco: 8500.00,
    dataDeteccao: '2025-11-27T16:45:00',
    status: 'resolvido',
    resolucao: 'Lançamento manual criado - Fatura energia',
    responsavel: 'João Silva',
  },
]

const MOCK_STATUS_SUBMODULOS: StatusSubmódulo[] = [
  {
    nome: 'Conciliação Bancária',
    status: 'ok',
    ultimaVerificacao: '2025-11-28T10:30:00',
    detalhes: 'Todas as contas conciliadas',
    acoesPendentes: 0,
  },
  {
    nome: 'DDA - Débito Direto',
    status: 'needs-review',
    ultimaVerificacao: '2025-11-28T10:30:00',
    detalhes: '3 débitos pendentes de autorização',
    acoesPendentes: 3,
  },
  {
    nome: 'Relatórios Fiscais',
    status: 'ok',
    ultimaVerificacao: '2025-11-28T10:30:00',
    detalhes: 'Todos os relatórios gerados',
    acoesPendentes: 0,
  },
  {
    nome: 'Pluggy Config',
    status: 'warning',
    ultimaVerificacao: '2025-11-28T10:30:00',
    detalhes: 'Ambiente sandbox - migrar para produção',
    acoesPendentes: 1,
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function FinanceiroAvancadoCompleto() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard')
  const [pluggyConfig, setPluggyConfig] = useState<PluggyConfig>(MOCK_PLUGGY_CONFIG)
  const [consentimentos, setConsentimentos] = useState<ConsentimentoDDA[]>(MOCK_CONSENTIMENTOS)
  const [debitos, setDebitos] = useState<DebitoDDA[]>(MOCK_DEBITOS)
  const [alertas, setAlertas] = useState<AlertaDivergencia[]>(MOCK_ALERTAS)
  const [regras, setRegras] = useState<RegraConciliacao[]>(MOCK_REGRAS_CONCILIACAO)
  
  // Dialog states
  const [isPluggyConfigOpen, setIsPluggyConfigOpen] = useState(false)
  const [isNovoConsentimentoOpen, setIsNovoConsentimentoOpen] = useState(false)
  const [isConfirmacaoOpen, setIsConfirmacaoOpen] = useState(false)
  const [acaoConfirmacao, setAcaoConfirmacao] = useState<{tipo: string, dados: any} | null>(null)
  const [debitoSelecionado, setDebitoSelecionado] = useState<DebitoDDA | null>(null)
  const [isDebitoDetalhesOpen, setIsDebitoDetalhesOpen] = useState(false)

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

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      ok: { cor: '#10B981', texto: 'OK', icon: CheckCircle },
      'needs-review': { cor: '#F59E0B', texto: 'Revisar', icon: AlertTriangle },
      error: { cor: '#EF4444', texto: 'Erro', icon: XCircle },
      warning: { cor: '#F59E0B', texto: 'Atenção', icon: AlertCircle },
      autorizado: { cor: '#10B981', texto: 'Autorizado', icon: CheckCircle },
      pendente: { cor: '#F59E0B', texto: 'Pendente', icon: Clock },
      revogado: { cor: '#EF4444', texto: 'Revogado', icon: Ban },
      expirado: { cor: '#6B7280', texto: 'Expirado', icon: FileClock },
      negado: { cor: '#EF4444', texto: 'Negado', icon: ThumbsDown },
      pago: { cor: '#10B981', texto: 'Pago', icon: CheckCircle },
      vencido: { cor: '#EF4444', texto: 'Vencido', icon: AlertTriangle },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  // Handlers
  const handleConfirmacao = (tipo: string, dados: any) => {
    setAcaoConfirmacao({ tipo, dados })
    setIsConfirmacaoOpen(true)
  }

  const executarAcaoConfirmada = () => {
    if (!acaoConfirmacao) return

    switch (acaoConfirmacao.tipo) {
      case 'aprovar_pagamento':
        toast.success(`Pagamento de ${formatCurrency(acaoConfirmacao.dados.valor)} aprovado`)
        setDebitos(prev => prev.map(d => 
          d.id === acaoConfirmacao.dados.id ? { ...d, status: 'autorizado' } : d
        ))
        break
      case 'iniciar_dda':
        toast.success('Sincronização DDA iniciada')
        break
      case 'exportar':
        toast.success('Relatório exportado com sucesso')
        break
      case 'revogar_consentimento':
        toast.success('Consentimento revogado')
        setConsentimentos(prev => prev.map(c => 
          c.id === acaoConfirmacao.dados.id ? { ...c, status: 'revogado' } : c
        ))
        break
    }

    setIsConfirmacaoOpen(false)
    setAcaoConfirmacao(null)
  }

  const handleSalvarPluggyConfig = () => {
    toast.success('Configurações do Pluggy salvas com sucesso')
    setIsPluggyConfigOpen(false)
  }

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
            <Wallet className="w-7 h-7 text-[#10B981]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Financeiro Avançado</h1>
            <p className={textSecondary}>Pluggy/DDA • Conciliação ML • Relatórios</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsPluggyConfigOpen(true)} className="gap-2">
            <Settings className="w-4 h-4" />
            Configurar Pluggy
          </Button>
          <Button 
            onClick={() => handleConfirmacao('iniciar_dda', {})} 
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sincronizar DDA
          </Button>
        </div>
      </div>

      {/* Status dos Submódulos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_STATUS_SUBMODULOS.map((submodulo) => {
          const statusConfig = getStatusBadge(submodulo.status)
          const StatusIcon = statusConfig.icon
          return (
            <Card key={submodulo.nome} className={cardBg}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${statusConfig.cor}20` }}
                  >
                    <StatusIcon className="w-5 h-5" style={{ color: statusConfig.cor }} />
                  </div>
                  <Badge 
                    className="text-xs"
                    style={{ backgroundColor: `${statusConfig.cor}20`, color: statusConfig.cor }}
                  >
                    {statusConfig.texto}
                  </Badge>
                </div>
                <h3 className={`font-semibold ${textPrimary} text-sm`}>{submodulo.nome}</h3>
                <p className={`text-xs ${textSecondary} mt-1`}>{submodulo.detalhes}</p>
                {submodulo.acoesPendentes > 0 && (
                  <p className="text-xs text-[#F59E0B] mt-1">
                    {submodulo.acoesPendentes} ações pendentes
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pluggy" className="gap-2">
            <Link2 className="w-4 h-4" />
            Pluggy Config
          </TabsTrigger>
          <TabsTrigger value="dda" className="gap-2">
            <FileText className="w-4 h-4" />
            DDA
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Conciliação ML
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-2">
            <FileCheck className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Resumo Financeiro */}
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-[#10B981]" />
                  Resumo do Dia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-xl ${inputBg} flex justify-between items-center`}>
                  <span className={textSecondary}>Débitos DDA</span>
                  <span className={`font-bold ${textPrimary}`}>{formatCurrency(259500)}</span>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} flex justify-between items-center`}>
                  <span className={textSecondary}>Conciliados</span>
                  <span className="font-bold text-[#10B981]">{formatCurrency(189500)}</span>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} flex justify-between items-center`}>
                  <span className={textSecondary}>Pendentes</span>
                  <span className="font-bold text-[#F59E0B]">{formatCurrency(70000)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status Pluggy */}
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link2 className="w-5 h-5 text-[#6366F1]" />
                  Status Pluggy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={textSecondary}>Ambiente</span>
                    <Badge className={pluggyConfig.ambiente === 'production' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                      {pluggyConfig.ambiente === 'production' ? 'Produção' : 'Sandbox'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={textSecondary}>Conexão</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-500 text-sm">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={textSecondary}>Última Sync</span>
                    <span className={`text-sm ${textPrimary}`}>
                      {new Date(pluggyConfig.ultimaSincronizacao || '').toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consentimentos Ativos */}
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-[#8B5CF6]" />
                  Consentimentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-xl ${inputBg} flex justify-between items-center`}>
                  <span className={textSecondary}>Autorizados</span>
                  <span className="font-bold text-[#10B981]">
                    {consentimentos.filter(c => c.status === 'autorizado').length}
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} flex justify-between items-center`}>
                  <span className={textSecondary}>Pendentes</span>
                  <span className="font-bold text-[#F59E0B]">
                    {consentimentos.filter(c => c.status === 'pendente').length}
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} flex justify-between items-center`}>
                  <span className={textSecondary}>Revogados</span>
                  <span className="font-bold text-[#EF4444]">
                    {consentimentos.filter(c => c.status === 'revogado').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Pluggy Config */}
        <TabsContent value="pluggy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#6366F1]" />
                Configuração do Pluggy (Open Banking)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Credenciais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={pluggyConfig.clientId} 
                      onChange={(e) => setPluggyConfig({...pluggyConfig, clientId: e.target.value})}
                    />
                    <Button variant="secondary" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="password"
                      value={pluggyConfig.clientSecret} 
                      onChange={(e) => setPluggyConfig({...pluggyConfig, clientSecret: e.target.value})}
                    />
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ambiente */}
              <div className="space-y-2">
                <Label>Ambiente</Label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 p-3 rounded-xl ${inputBg} cursor-pointer ${pluggyConfig.ambiente === 'sandbox' ? 'border-2 border-[#6366F1]' : ''}`}>
                    <input
                      type="radio"
                      name="ambiente"
                      checked={pluggyConfig.ambiente === 'sandbox'}
                      onChange={() => setPluggyConfig({...pluggyConfig, ambiente: 'sandbox'})}
                    />
                    <Server className="w-4 h-4 text-[#F59E0B]" />
                    <span className={textPrimary}>Sandbox</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-xl ${inputBg} cursor-pointer ${pluggyConfig.ambiente === 'production' ? 'border-2 border-[#6366F1]' : ''}`}>
                    <input
                      type="radio"
                      name="ambiente"
                      checked={pluggyConfig.ambiente === 'production'}
                      onChange={() => setPluggyConfig({...pluggyConfig, ambiente: 'production'})}
                    />
                    <Globe className="w-4 h-4 text-[#10B981]" />
                    <span className={textPrimary}>Produção</span>
                  </label>
                </div>
                {pluggyConfig.ambiente === 'sandbox' && (
                  <p className="text-xs text-[#F59E0B] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Ambiente de testes - dados não são reais
                  </p>
                )}
              </div>

              {/* Escopos */}
              <div className="space-y-2">
                <Label>Escopos de Acesso</Label>
                <div className="flex flex-wrap gap-2">
                  {['accounts', 'transactions', 'identity', 'investments', 'credit_cards', 'loans'].map((escopo) => (
                    <label 
                      key={escopo}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                        pluggyConfig.escopos.includes(escopo) 
                          ? 'bg-[#6366F1]/20 text-[#6366F1]' 
                          : `${inputBg} ${textSecondary}`
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={pluggyConfig.escopos.includes(escopo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPluggyConfig({...pluggyConfig, escopos: [...pluggyConfig.escopos, escopo]})
                          } else {
                            setPluggyConfig({...pluggyConfig, escopos: pluggyConfig.escopos.filter(s => s !== escopo)})
                          }
                        }}
                        className="hidden"
                      />
                      {pluggyConfig.escopos.includes(escopo) && <CheckCircle className="w-4 h-4" />}
                      {escopo}
                    </label>
                  ))}
                </div>
              </div>

              {/* Webhook */}
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={pluggyConfig.webhookUrl} 
                    onChange={(e) => setPluggyConfig({...pluggyConfig, webhookUrl: e.target.value})}
                    placeholder="https://api.icarus.com/webhooks/pluggy"
                  />
                  <Button variant="secondary">
                    <Webhook className="w-4 h-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>

              {/* Rate Limit e Batch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Limit (req/min)</Label>
                  <Input 
                    type="number"
                    value={pluggyConfig.rateLimit} 
                    onChange={(e) => setPluggyConfig({...pluggyConfig, rateLimit: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Input 
                    type="number"
                    value={pluggyConfig.batchSize} 
                    onChange={(e) => setPluggyConfig({...pluggyConfig, batchSize: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {/* Consentimento */}
              <div className={`p-4 rounded-xl ${inputBg} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#8B5CF6]" />
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Consentimento do Usuário</p>
                    <p className={`text-sm ${textSecondary}`}>Requer autorização antes de acessar dados</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pluggyConfig.consentimentoAtivo}
                    onChange={(e) => setPluggyConfig({...pluggyConfig, consentimentoAtivo: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <Button variant="secondary">
                  Cancelar
                </Button>
                <Button onClick={handleSalvarPluggyConfig} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: DDA */}
        <TabsContent value="dda" className="space-y-4">
          {/* Consentimentos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#8B5CF6]" />
                Consentimentos DDA
              </CardTitle>
              <Button onClick={() => setIsNovoConsentimentoOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Consentimento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consentimentos.map((consentimento) => {
                  const statusConfig = getStatusBadge(consentimento.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <div 
                      key={consentimento.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${statusConfig.cor}20` }}
                          >
                            <Building2 className="w-6 h-6" style={{ color: statusConfig.cor }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${textPrimary}`}>{consentimento.banco}</span>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${statusConfig.cor}20`, color: statusConfig.cor }}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>
                              Ag: {consentimento.agencia} • CC: {consentimento.contaCorrente}
                            </p>
                            {consentimento.dataExpiracao && (
                              <p className={`text-xs ${textSecondary}`}>
                                Expira: {new Date(consentimento.dataExpiracao).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {consentimento.status === 'autorizado' && (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleConfirmacao('revogar_consentimento', consentimento)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Revogar
                            </Button>
                          )}
                          {consentimento.status === 'pendente' && (
                            <Button size="sm" className="gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Autorizar
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

          {/* Lista de Débitos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
                Débitos DDA
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => handleConfirmacao('exportar', { tipo: 'debitos_dda' })}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debitos.map((debito) => {
                  const statusConfig = getStatusBadge(debito.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <div 
                      key={debito.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold ${textPrimary}`}>{debito.cedente}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${statusConfig.cor}20`, color: statusConfig.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>
                            Doc: {debito.numeroDocumento} • Vence: {new Date(debito.dataVencimento).toLocaleDateString('pt-BR')}
                          </p>
                          {debito.motivoNegacao && (
                            <p className="text-xs text-red-500 mt-1">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              {debito.motivoNegacao}
                            </p>
                          )}
                        </div>
                        <div className="text-right mr-4">
                          <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(debito.valor)}</p>
                        </div>
                        <div className="flex gap-2">
                          {debito.status === 'pendente' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 gap-1"
                                onClick={() => handleConfirmacao('aprovar_pagamento', debito)}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                Autorizar
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                className="text-red-500"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setDebitoSelecionado(debito)
                              setIsDebitoDetalhesOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Conciliação ML */}
        <TabsContent value="conciliacao" className="space-y-4">
          {/* Regras de Conciliação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                Regras de Conciliação (Machine Learning)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {regras.map((regra) => (
                  <div 
                    key={regra.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            regra.ativa ? 'bg-[#10B981]/20' : 'bg-gray-500/20'
                          }`}
                        >
                          <Cpu className={`w-6 h-6 ${regra.ativa ? 'text-[#10B981]' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${textPrimary}`}>{regra.nome}</span>
                            <Badge className={regra.ativa ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                              {regra.ativa ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>
                            Tipo: {regra.tipo} • Precisão ML: {regra.precisaoML}%
                          </p>
                          {regra.ultimaExecucao && (
                            <p className={`text-xs ${textSecondary}`}>
                              Última execução: {new Date(regra.ultimaExecucao).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Gauge className="w-4 h-4 text-[#6366F1]" />
                            <span className={`font-bold ${textPrimary}`}>{regra.precisaoML}%</span>
                          </div>
                          <p className={`text-xs ${textSecondary}`}>Precisão</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={regra.ativa}
                            onChange={() => {
                              setRegras(prev => prev.map(r => 
                                r.id === regra.id ? { ...r, ativa: !r.ativa } : r
                              ))
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <Button className="gap-2">
                  <Play className="w-4 h-4" />
                  Executar Conciliação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado da Conciliação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={cardBg}>
              <CardContent className="pt-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-[#10B981]" />
                </div>
                <p className={`text-3xl font-bold text-[#10B981]`}>156</p>
                <p className={textSecondary}>Conciliados</p>
              </CardContent>
            </Card>
            <Card className={cardBg}>
              <CardContent className="pt-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <p className={`text-3xl font-bold text-[#F59E0B]`}>12</p>
                <p className={textSecondary}>Divergências</p>
              </CardContent>
            </Card>
            <Card className={cardBg}>
              <CardContent className="pt-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-8 h-8 text-[#EF4444]" />
                </div>
                <p className={`text-3xl font-bold text-[#EF4444]`}>3</p>
                <p className={textSecondary}>Não Encontrados</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                Alertas de Divergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.map((alerta) => {
                  const severidadeConfig: Record<string, { cor: string; texto: string }> = {
                    baixa: { cor: '#3B82F6', texto: 'Baixa' },
                    media: { cor: '#F59E0B', texto: 'Média' },
                    alta: { cor: '#EF4444', texto: 'Alta' },
                    critica: { cor: '#DC2626', texto: 'Crítica' },
                  }
                  const sev = severidadeConfig[alerta.severidade]
                  
                  return (
                    <div 
                      key={alerta.id}
                      className={`p-4 rounded-xl ${inputBg} border-l-4`}
                      style={{ borderLeftColor: sev.cor }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${sev.cor}20`, color: sev.cor }}
                            >
                              {sev.texto}
                            </Badge>
                            <Badge className={alerta.status === 'resolvido' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                              {alerta.status === 'resolvido' ? 'Resolvido' : 'Pendente'}
                            </Badge>
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{alerta.descricao}</p>
                          <div className={`text-sm ${textSecondary} mt-2 space-y-1`}>
                            {alerta.valorSistema && (
                              <p>Valor Sistema: {formatCurrency(alerta.valorSistema)}</p>
                            )}
                            {alerta.valorBanco && (
                              <p>Valor Banco: {formatCurrency(alerta.valorBanco)}</p>
                            )}
                            {alerta.valorSistema && alerta.valorBanco && (
                              <p className="text-[#EF4444]">
                                Diferença: {formatCurrency(Math.abs(alerta.valorSistema - alerta.valorBanco))}
                              </p>
                            )}
                          </div>
                          {alerta.resolucao && (
                            <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                              <p className="text-xs text-green-500">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                {alerta.resolucao} - por {alerta.responsavel}
                              </p>
                            </div>
                          )}
                        </div>
                        {alerta.status === 'pendente' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Resolver
                            </Button>
                            <Button variant="secondary" size="sm">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { titulo: 'Relatório de Conciliação', icon: FileCheck, cor: '#10B981', desc: 'Resumo completo da conciliação bancária' },
              { titulo: 'Relatório DDA', icon: FileText, cor: '#6366F1', desc: 'Débitos autorizados e negados' },
              { titulo: 'Relatório de Divergências', icon: FileWarning, cor: '#F59E0B', desc: 'Alertas e resoluções' },
              { titulo: 'Relatório Fiscal', icon: Receipt, cor: '#8B5CF6', desc: 'Apuração de impostos e declarações' },
            ].map((relatorio) => (
              <Card key={relatorio.titulo} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${relatorio.cor}20` }}
                    >
                      <relatorio.icon className="w-6 h-6" style={{ color: relatorio.cor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${textPrimary}`}>{relatorio.titulo}</h3>
                      <p className={`text-sm ${textSecondary} mb-3`}>{relatorio.desc}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleConfirmacao('exportar', { tipo: relatorio.titulo })}
                        >
                          <Download className="w-4 h-4" />
                          Excel
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleConfirmacao('exportar', { tipo: relatorio.titulo })}
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </Button>
                        <Button variant="secondary" size="sm" className="gap-1">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Confirmação */}
      <Dialog open={isConfirmacaoOpen} onOpenChange={setIsConfirmacaoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
              Confirmação Necessária
            </DialogTitle>
            <DialogDescription>
              {acaoConfirmacao?.tipo === 'aprovar_pagamento' && (
                `Deseja aprovar o pagamento de ${formatCurrency(acaoConfirmacao.dados.valor)} para ${acaoConfirmacao.dados.cedente}?`
              )}
              {acaoConfirmacao?.tipo === 'iniciar_dda' && (
                'Deseja iniciar a sincronização DDA com todos os bancos autorizados?'
              )}
              {acaoConfirmacao?.tipo === 'exportar' && (
                `Deseja exportar o ${acaoConfirmacao.dados.tipo}?`
              )}
              {acaoConfirmacao?.tipo === 'revogar_consentimento' && (
                `Deseja revogar o consentimento do ${acaoConfirmacao.dados.banco}? Esta ação não poderá ser desfeita.`
              )}
            </DialogDescription>
          </DialogHeader>

          <div className={`p-4 rounded-xl ${inputBg} my-4`}>
            <p className={`text-sm ${textSecondary}`}>
              <Info className="w-4 h-4 inline mr-2" />
              Esta ação será registrada no log de auditoria.
            </p>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsConfirmacaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={executarAcaoConfirmada} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Detalhes do Débito */}
      <Dialog open={isDebitoDetalhesOpen} onOpenChange={setIsDebitoDetalhesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6366F1]" />
              Detalhes do Débito DDA
            </DialogTitle>
          </DialogHeader>

          {debitoSelecionado && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Cedente</p>
                  <p className={`font-medium ${textPrimary}`}>{debitoSelecionado.cedente}</p>
                  <p className={`text-xs ${textSecondary}`}>{debitoSelecionado.cnpjCedente}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Valor</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(debitoSelecionado.valor)}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl ${inputBg}`}>
                <p className={`text-xs ${textSecondary}`}>Documento</p>
                <p className={textPrimary}>{debitoSelecionado.numeroDocumento}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Emissão</p>
                  <p className={textPrimary}>{new Date(debitoSelecionado.dataEmissao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Vencimento</p>
                  <p className={textPrimary}>{new Date(debitoSelecionado.dataVencimento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl ${inputBg}`}>
                <p className={`text-xs ${textSecondary} mb-1`}>Código de Barras</p>
                <div className="flex items-center gap-2">
                  <code className={`text-xs ${textPrimary} flex-1 font-mono`}>{debitoSelecionado.codigoBarras}</code>
                  <Button variant="secondary" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDebitoDetalhesOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Consentimento */}
      <Dialog open={isNovoConsentimentoOpen} onOpenChange={setIsNovoConsentimentoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6366F1]" />
              Novo Consentimento DDA
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Banco</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="001">Banco do Brasil</SelectItem>
                  <SelectItem value="341">Itaú Unibanco</SelectItem>
                  <SelectItem value="237">Bradesco</SelectItem>
                  <SelectItem value="033">Santander</SelectItem>
                  <SelectItem value="104">Caixa Econômica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agência</Label>
                <Input placeholder="0000" />
              </div>
              <div className="space-y-2">
                <Label>Conta Corrente</Label>
                <Input placeholder="00000-0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipos de Conta</Label>
              <div className="flex gap-2">
                {['corrente', 'poupanca'].map((tipo) => (
                  <label 
                    key={tipo}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${inputBg}`}
                  >
                    <input type="checkbox" defaultChecked={tipo === 'corrente'} />
                    <span className={textPrimary}>{tipo === 'corrente' ? 'Corrente' : 'Poupança'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovoConsentimentoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Solicitação de consentimento enviada ao banco')
              setIsNovoConsentimentoOpen(false)
            }}>
              Solicitar Consentimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FinanceiroAvancadoCompleto

