/**
 * ICARUS v5.0 - Cadastro de Paciente (Rastreabilidade OPME)
 * 
 * Cadastro de pacientes exclusivo para rastreabilidade OPME,
 * controle de lotes/serial por paciente e relatórios ANVISA.
 * 
 * IMPORTANTE: Paciente NÃO é cliente, NÃO tem relação comercial direta.
 * Propósito exclusivo: Rastreabilidade de materiais implantados.
 * 
 * FUNCIONALIDADES:
 * - Cadastro para rastreabilidade OPME
 * - Controle de lote/serial por paciente
 * - Relatórios vigilância sanitária
 * - Auditoria de material implantado
 * - Histórico de procedimentos
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
  User, UserPlus, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, Search, Filter, Download, Plus, Eye,
  FileText, Building2, Shield, Package, QrCode, Barcode,
  Activity, Heart, Stethoscope, ClipboardList, History,
  FileCheck, FileWarning, AlertCircle, Info, Edit, Trash2,
  MapPin, Phone, Mail, CreditCard, Hash, Fingerprint,
  ShieldCheck, ShieldAlert, FileSignature, Printer, Upload
} from 'lucide-react'

// ============ TIPOS ============

interface Paciente {
  id: string
  nome: string
  dataNascimento: string
  idade: number
  sexo: 'M' | 'F'
  cpf?: string
  convenio: {
    id: string
    nome: string
    numeroCarteirinha: string
    plano?: string
  }
  contato?: {
    telefone?: string
    email?: string
  }
  status: 'ativo' | 'inativo'
  dataCadastro: string
  ultimoProcedimento?: string
  totalProcedimentos: number
  materiaisImplantados: number
}

interface MaterialImplantado {
  id: string
  pacienteId: string
  pacienteNome: string
  produto: {
    codigo: string
    descricao: string
    fabricante: string
    registroAnvisa: string
  }
  lote: string
  serial?: string
  dataImplante: string
  cirurgia: {
    id: string
    tipo: string
    hospital: string
    medicoResponsavel: string
    crm: string
  }
  statusRastreabilidade: 'completo' | 'parcial' | 'pendente'
  documentos: string[]
}

interface HistoricoProcedimento {
  id: string
  pacienteId: string
  data: string
  tipo: string
  hospital: string
  medico: string
  convenio: string
  status: 'realizado' | 'cancelado' | 'adiado'
  materiaisUtilizados: number
  valorTotal: number
}

// ============ DADOS MOCK ============

const MOCK_PACIENTES: Paciente[] = [
  {
    id: '1',
    nome: 'Maria Silva Santos',
    dataNascimento: '1965-03-15',
    idade: 60,
    sexo: 'F',
    cpf: '123.456.789-00',
    convenio: {
      id: '1',
      nome: 'Unimed',
      numeroCarteirinha: '0012345678901234',
      plano: 'Especial II',
    },
    contato: {
      telefone: '(11) 98765-4321',
      email: 'maria.silva@email.com',
    },
    status: 'ativo',
    dataCadastro: '2024-01-15',
    ultimoProcedimento: '2025-11-20',
    totalProcedimentos: 3,
    materiaisImplantados: 2,
  },
  {
    id: '2',
    nome: 'João Carlos Oliveira',
    dataNascimento: '1958-07-22',
    idade: 67,
    sexo: 'M',
    cpf: '987.654.321-00',
    convenio: {
      id: '2',
      nome: 'Bradesco Saúde',
      numeroCarteirinha: '0098765432109876',
      plano: 'Empresarial',
    },
    contato: {
      telefone: '(11) 91234-5678',
    },
    status: 'ativo',
    dataCadastro: '2023-08-10',
    ultimoProcedimento: '2025-11-25',
    totalProcedimentos: 5,
    materiaisImplantados: 4,
  },
  {
    id: '3',
    nome: 'Ana Paula Ferreira',
    dataNascimento: '1972-11-08',
    idade: 53,
    sexo: 'F',
    convenio: {
      id: '3',
      nome: 'SulAmérica',
      numeroCarteirinha: '0054321098765432',
      plano: 'Executivo',
    },
    status: 'ativo',
    dataCadastro: '2024-06-20',
    ultimoProcedimento: '2025-10-15',
    totalProcedimentos: 1,
    materiaisImplantados: 1,
  },
]

const MOCK_MATERIAIS_IMPLANTADOS: MaterialImplantado[] = [
  {
    id: '1',
    pacienteId: '1',
    pacienteNome: 'Maria Silva Santos',
    produto: {
      codigo: 'PROT-QD-001',
      descricao: 'Prótese Total de Quadril Cimentada',
      fabricante: 'Zimmer Biomet',
      registroAnvisa: '10349000001',
    },
    lote: 'ZB2025001234',
    serial: 'SN-QD-2025-0001',
    dataImplante: '2025-11-20',
    cirurgia: {
      id: 'CIR-001',
      tipo: 'Artroplastia Total de Quadril',
      hospital: 'Hospital São Lucas',
      medicoResponsavel: 'Dr. Carlos Eduardo',
      crm: 'SP-123456',
    },
    statusRastreabilidade: 'completo',
    documentos: ['termo_consentimento.pdf', 'laudo_cirurgico.pdf', 'etiqueta_produto.jpg'],
  },
  {
    id: '2',
    pacienteId: '2',
    pacienteNome: 'João Carlos Oliveira',
    produto: {
      codigo: 'PROT-JO-001',
      descricao: 'Prótese Total de Joelho',
      fabricante: 'Smith & Nephew',
      registroAnvisa: '10349000002',
    },
    lote: 'SN2025005678',
    serial: 'SN-JO-2025-0002',
    dataImplante: '2025-11-25',
    cirurgia: {
      id: 'CIR-002',
      tipo: 'Artroplastia Total de Joelho',
      hospital: 'Hospital Albert Einstein',
      medicoResponsavel: 'Dra. Ana Beatriz',
      crm: 'SP-654321',
    },
    statusRastreabilidade: 'completo',
    documentos: ['termo_consentimento.pdf', 'laudo_cirurgico.pdf'],
  },
  {
    id: '3',
    pacienteId: '2',
    pacienteNome: 'João Carlos Oliveira',
    produto: {
      codigo: 'FIX-COL-001',
      descricao: 'Sistema de Fixação de Coluna',
      fabricante: 'Medtronic',
      registroAnvisa: '10349000003',
    },
    lote: 'MD2024009999',
    dataImplante: '2024-05-10',
    cirurgia: {
      id: 'CIR-003',
      tipo: 'Artrodese Lombar',
      hospital: 'Hospital Sírio-Libanês',
      medicoResponsavel: 'Dr. Roberto Lima',
      crm: 'SP-789012',
    },
    statusRastreabilidade: 'parcial',
    documentos: ['laudo_cirurgico.pdf'],
  },
]

const MOCK_HISTORICO: HistoricoProcedimento[] = [
  {
    id: '1',
    pacienteId: '1',
    data: '2025-11-20',
    tipo: 'Artroplastia Total de Quadril',
    hospital: 'Hospital São Lucas',
    medico: 'Dr. Carlos Eduardo',
    convenio: 'Unimed',
    status: 'realizado',
    materiaisUtilizados: 1,
    valorTotal: 85000,
  },
  {
    id: '2',
    pacienteId: '2',
    data: '2025-11-25',
    tipo: 'Artroplastia Total de Joelho',
    hospital: 'Hospital Albert Einstein',
    medico: 'Dra. Ana Beatriz',
    convenio: 'Bradesco Saúde',
    status: 'realizado',
    materiaisUtilizados: 1,
    valorTotal: 92000,
  },
]

// ============ COMPONENTE PRINCIPAL ============

export function CadastroPaciente() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('pacientes')
  const [searchQuery, setSearchQuery] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null)
  const [materialSelecionado, setMaterialSelecionado] = useState<MaterialImplantado | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovoPacienteOpen, setIsNovoPacienteOpen] = useState(false)
  const [isRastreabilidadeOpen, setIsRastreabilidadeOpen] = useState(false)

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
      ativo: { cor: '#10B981', texto: 'Ativo', icon: CheckCircle },
      inativo: { cor: '#6B7280', texto: 'Inativo', icon: XCircle },
      completo: { cor: '#10B981', texto: 'Completo', icon: ShieldCheck },
      parcial: { cor: '#F59E0B', texto: 'Parcial', icon: AlertTriangle },
      pendente: { cor: '#EF4444', texto: 'Pendente', icon: ShieldAlert },
      realizado: { cor: '#10B981', texto: 'Realizado', icon: CheckCircle },
      cancelado: { cor: '#EF4444', texto: 'Cancelado', icon: XCircle },
      adiado: { cor: '#F59E0B', texto: 'Adiado', icon: Clock },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  // Filtrar pacientes
  const pacientesFiltrados = useMemo(() => {
    return MOCK_PACIENTES.filter(p => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return p.nome.toLowerCase().includes(query) ||
          p.cpf?.includes(query) ||
          p.convenio.nome.toLowerCase().includes(query) ||
          p.convenio.numeroCarteirinha.includes(query)
      }
      return true
    })
  }, [searchQuery])

  // Resumo
  const resumo = useMemo(() => {
    return {
      totalPacientes: MOCK_PACIENTES.length,
      pacientesAtivos: MOCK_PACIENTES.filter(p => p.status === 'ativo').length,
      materiaisImplantados: MOCK_MATERIAIS_IMPLANTADOS.length,
      rastreabilidadeCompleta: MOCK_MATERIAIS_IMPLANTADOS.filter(m => m.statusRastreabilidade === 'completo').length,
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
            style={{ backgroundColor: '#6366F120' }}
          >
            <User className="w-7 h-7 text-[#6366F1]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Cadastro de Pacientes</h1>
            <p className={textSecondary}>Rastreabilidade OPME • Vigilância Sanitária</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Relatório ANVISA
          </Button>
          <Button onClick={() => setIsNovoPacienteOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Aviso Importante */}
      <Card className={`${cardBg} border-l-4 border-l-[#F59E0B]`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <div>
              <p className={`font-medium ${textPrimary}`}>Cadastro para Rastreabilidade OPME</p>
              <p className={`text-sm ${textSecondary}`}>
                Este cadastro é exclusivo para rastreabilidade de materiais OPME implantados. 
                O paciente <strong>NÃO é cliente</strong> e <strong>NÃO possui relação comercial direta</strong>. 
                Propósito: controle de lote/serial, relatórios ANVISA e auditoria de materiais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Total Pacientes</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.totalPacientes}</p>
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
                <p className={`text-xs ${textSecondary}`}>Ativos</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.pacientesAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Materiais Implantados</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.materiaisImplantados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Rastreabilidade OK</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.rastreabilidadeCompleta}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="pacientes" className="gap-2">
            <User className="w-4 h-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="rastreabilidade" className="gap-2">
            <QrCode className="w-4 h-4" />
            Rastreabilidade
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-2">
            <FileText className="w-4 h-4" />
            Relatórios ANVISA
          </TabsTrigger>
        </TabsList>

        {/* Tab: Pacientes */}
        <TabsContent value="pacientes" className="space-y-4">
          {/* Busca */}
          <Card>
            <CardContent className="pt-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                <Input
                  placeholder="Buscar por nome, CPF, convênio ou carteirinha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pacientes */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {pacientesFiltrados.map((paciente) => {
                  const status = getStatusConfig(paciente.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={paciente.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setPacienteSelecionado(paciente)
                        setIsDetalhesOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-[#6366F1]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold ${textPrimary}`}>{paciente.nome}</span>
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.texto}
                              </Badge>
                            </div>
                            <p className={`text-sm ${textSecondary}`}>
                              {paciente.idade} anos • {paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className={`text-xs ${textSecondary}`}>
                                <CreditCard className="w-3 h-3 inline mr-1" />
                                {paciente.convenio.nome}
                              </span>
                              <span className={`text-xs ${textSecondary}`}>
                                <Hash className="w-3 h-3 inline mr-1" />
                                {paciente.convenio.numeroCarteirinha}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${textPrimary}`}>
                            <Package className="w-4 h-4 inline mr-1 text-[#F59E0B]" />
                            {paciente.materiaisImplantados} materiais
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            {paciente.totalProcedimentos} procedimentos
                          </p>
                          {paciente.ultimoProcedimento && (
                            <p className={`text-xs ${textSecondary} mt-1`}>
                              Último: {new Date(paciente.ultimoProcedimento).toLocaleDateString('pt-BR')}
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

        {/* Tab: Rastreabilidade */}
        <TabsContent value="rastreabilidade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#F59E0B]" />
                Materiais Implantados - Rastreabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_MATERIAIS_IMPLANTADOS.map((material) => {
                  const status = getStatusConfig(material.statusRastreabilidade)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={material.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            <span className={`text-xs ${textSecondary}`}>
                              Implantado em {new Date(material.dataImplante).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className={`font-bold ${textPrimary}`}>{material.produto.descricao}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            {material.produto.fabricante} • ANVISA: {material.produto.registroAnvisa}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-xs ${textSecondary}`}>
                              <Barcode className="w-3 h-3 inline mr-1" />
                              Lote: {material.lote}
                            </span>
                            {material.serial && (
                              <span className={`text-xs ${textSecondary}`}>
                                <QrCode className="w-3 h-3 inline mr-1" />
                                Serial: {material.serial}
                              </span>
                            )}
                          </div>
                          <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                            <p className={`text-xs ${textSecondary}`}>
                              <User className="w-3 h-3 inline mr-1" />
                              Paciente: {material.pacienteNome}
                            </p>
                            <p className={`text-xs ${textSecondary}`}>
                              <Stethoscope className="w-3 h-3 inline mr-1" />
                              {material.cirurgia.tipo} • {material.cirurgia.hospital}
                            </p>
                            <p className={`text-xs ${textSecondary}`}>
                              <User className="w-3 h-3 inline mr-1" />
                              {material.cirurgia.medicoResponsavel} (CRM: {material.cirurgia.crm})
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setMaterialSelecionado(material)
                              setIsRastreabilidadeOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Printer className="w-4 h-4" />
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

        {/* Tab: Histórico */}
        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#3B82F6]" />
                Histórico de Procedimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_HISTORICO.map((proc) => {
                  const status = getStatusConfig(proc.status)
                  const StatusIcon = status.icon
                  return (
                    <div 
                      key={proc.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold ${textPrimary}`}>{proc.tipo}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>
                            {proc.hospital} • {proc.medico}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(proc.data).toLocaleDateString('pt-BR')}
                            <span className="mx-2">•</span>
                            <CreditCard className="w-3 h-3 inline mr-1" />
                            {proc.convenio}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${textPrimary}`}>{formatCurrency(proc.valorTotal)}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            {proc.materiaisUtilizados} materiais
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Relatórios ANVISA */}
        <TabsContent value="relatorios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { titulo: 'Relatório de Implantes', descricao: 'Lista de todos os materiais implantados com rastreabilidade', icon: Package, cor: '#6366F1' },
              { titulo: 'Rastreabilidade Completa', descricao: 'Detalhamento de lote/serial por paciente', icon: QrCode, cor: '#10B981' },
              { titulo: 'Eventos Adversos', descricao: 'Registro de eventos adversos relacionados a materiais', icon: AlertTriangle, cor: '#EF4444' },
              { titulo: 'Recall de Produtos', descricao: 'Pacientes afetados por recall de fabricante', icon: ShieldAlert, cor: '#F59E0B' },
              { titulo: 'Auditoria Sanitária', descricao: 'Relatório para vigilância sanitária', icon: FileCheck, cor: '#3B82F6' },
              { titulo: 'Certificado de Rastreabilidade', descricao: 'Documento oficial de rastreabilidade OPME', icon: FileSignature, cor: '#8B5CF6' },
            ].map((rel, idx) => (
              <Card key={idx} className={cardBg}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${rel.cor}20` }}
                    >
                      <rel.icon className="w-6 h-6" style={{ color: rel.cor }} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${textPrimary}`}>{rel.titulo}</h4>
                      <p className={`text-sm ${textSecondary} mb-3`}>{rel.descricao}</p>
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Gerar PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes do Paciente */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#6366F1]" />
              {pacienteSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>

          {pacienteSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Data de Nascimento</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {new Date(pacienteSelecionado.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Idade</p>
                    <p className={`font-medium ${textPrimary}`}>{pacienteSelecionado.idade} anos</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textSecondary}`}>Sexo</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {pacienteSelecionado.sexo === 'M' ? 'Masculino' : 'Feminino'}
                    </p>
                  </div>
                  {pacienteSelecionado.cpf && (
                    <div>
                      <p className={`text-xs ${textSecondary}`}>CPF</p>
                      <p className={`font-medium ${textPrimary}`}>{pacienteSelecionado.cpf}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Convênio</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={textSecondary}>Operadora</span>
                    <span className={textPrimary}>{pacienteSelecionado.convenio.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>Carteirinha</span>
                    <span className={`font-mono ${textPrimary}`}>{pacienteSelecionado.convenio.numeroCarteirinha}</span>
                  </div>
                  {pacienteSelecionado.convenio.plano && (
                    <div className="flex justify-between">
                      <span className={textSecondary}>Plano</span>
                      <span className={textPrimary}>{pacienteSelecionado.convenio.plano}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{pacienteSelecionado.totalProcedimentos}</p>
                  <p className={`text-xs ${textSecondary}`}>Procedimentos</p>
                </div>
                <div className={`p-3 rounded-xl ${inputBg} text-center`}>
                  <p className={`text-2xl font-bold text-[#F59E0B]`}>{pacienteSelecionado.materiaisImplantados}</p>
                  <p className={`text-xs ${textSecondary}`}>Materiais Implantados</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              Ver Rastreabilidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Paciente */}
      <Dialog open={isNovoPacienteOpen} onOpenChange={setIsNovoPacienteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#6366F1]" />
              Novo Paciente
            </DialogTitle>
            <DialogDescription>
              Cadastro para rastreabilidade OPME
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input placeholder="Nome completo do paciente" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Sexo *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Convênio/Operadora *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o convênio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unimed">Unimed</SelectItem>
                  <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                  <SelectItem value="sulamerica">SulAmérica</SelectItem>
                  <SelectItem value="amil">Amil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número da Carteirinha *</Label>
              <Input placeholder="0000000000000000" />
            </div>

            <div className={`p-3 rounded-xl ${inputBg}`}>
              <p className={`text-xs ${textSecondary}`}>
                <Info className="w-4 h-4 inline mr-1" />
                CPF e dados de contato são opcionais e utilizados apenas para rastreabilidade.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovoPacienteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Paciente cadastrado com sucesso!')
              setIsNovoPacienteOpen(false)
            }}>
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Rastreabilidade */}
      <Dialog open={isRastreabilidadeOpen} onOpenChange={setIsRastreabilidadeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#F59E0B]" />
              Rastreabilidade do Material
            </DialogTitle>
          </DialogHeader>

          {materialSelecionado && (
            <div className="space-y-4 py-4">
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Produto</h4>
                <p className={`text-sm ${textPrimary}`}>{materialSelecionado.produto.descricao}</p>
                <p className={`text-xs ${textSecondary}`}>
                  {materialSelecionado.produto.fabricante} • Cód: {materialSelecionado.produto.codigo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl ${inputBg}`}>
                  <p className={`text-xs ${textSecondary}`}>Lote</p>
                  <p className={`font-mono font-bold ${textPrimary}`}>{materialSelecionado.lote}</p>
                </div>
                {materialSelecionado.serial && (
                  <div className={`p-3 rounded-xl ${inputBg}`}>
                    <p className={`text-xs ${textSecondary}`}>Serial</p>
                    <p className={`font-mono font-bold ${textPrimary}`}>{materialSelecionado.serial}</p>
                  </div>
                )}
              </div>

              <div className={`p-3 rounded-xl ${inputBg}`}>
                <p className={`text-xs ${textSecondary}`}>Registro ANVISA</p>
                <p className={`font-mono font-bold text-[#10B981]`}>{materialSelecionado.produto.registroAnvisa}</p>
              </div>

              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Cirurgia</h4>
                <div className="space-y-1">
                  <p className={`text-sm ${textPrimary}`}>{materialSelecionado.cirurgia.tipo}</p>
                  <p className={`text-xs ${textSecondary}`}>
                    {materialSelecionado.cirurgia.hospital}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>
                    {materialSelecionado.cirurgia.medicoResponsavel} • CRM: {materialSelecionado.cirurgia.crm}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>
                    Data: {new Date(materialSelecionado.dataImplante).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div>
                <h4 className={`font-medium ${textPrimary} mb-2`}>Documentos ({materialSelecionado.documentos.length})</h4>
                <div className="space-y-2">
                  {materialSelecionado.documentos.map((doc, idx) => (
                    <div key={idx} className={`p-2 rounded-lg ${inputBg} flex items-center justify-between`}>
                      <span className={`text-sm ${textPrimary}`}>{doc}</span>
                      <Button variant="secondary" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsRastreabilidadeOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir Certificado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CadastroPaciente

