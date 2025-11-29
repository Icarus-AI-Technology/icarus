/**
 * ICARUS v5.0 - Gestão de Documentos da Qualidade
 * 
 * Módulo completo para gestão de documentos empresariais e regulatórios:
 * - Upload de documentos gerais da empresa
 * - Documentos exigidos pela ANVISA
 * - Cartas de Comercialização com controle de validade
 * - Alertas preditivos de vencimento
 * - Controle de versões e aprovações
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import {
  FileText, Upload, AlertTriangle, CheckCircle, Clock, Calendar,
  Search, Filter, Download, Eye, Trash2, Edit, Bell, Shield,
  Building2, FileCheck, FileClock, FileWarning, BrainCircuit,
  RefreshCw, Send, Archive, FolderOpen, Plus, X
} from 'lucide-react'

// ============ TIPOS ============

interface Documento {
  id: string
  codigo: string
  titulo: string
  tipo: TipoDocumento
  categoria: CategoriaDocumento
  versao: string
  dataEmissao: string
  dataValidade?: string
  dataProximaRevisao?: string
  status: StatusDocumento
  responsavel: string
  aprovador?: string
  dataAprovacao?: string
  arquivoUrl?: string
  arquivoNome?: string
  tamanhoBytes?: number
  observacoes?: string
  tags?: string[]
  diasParaVencer?: number
  alertaEnviado?: boolean
}

type TipoDocumento = 
  | 'manual_qualidade'
  | 'pop'
  | 'instrucao_trabalho'
  | 'formulario'
  | 'registro'
  | 'certificado'
  | 'licenca'
  | 'carta_comercializacao'
  | 'contrato'
  | 'laudo'
  | 'relatorio'
  | 'politica'
  | 'outro'

type CategoriaDocumento =
  | 'sgq'
  | 'anvisa'
  | 'comercial'
  | 'rh'
  | 'financeiro'
  | 'operacional'
  | 'juridico'
  | 'fornecedor'

type StatusDocumento =
  | 'vigente'
  | 'em_revisao'
  | 'aguardando_aprovacao'
  | 'vencido'
  | 'proximo_vencimento'
  | 'obsoleto'
  | 'rascunho'

interface CartaComercializacao {
  id: string
  fabricante: string
  cnpjFabricante: string
  numeroDocumento: string
  dataEmissao: string
  dataValidade: string
  produtosAutorizados: string[]
  observacoes?: string
  arquivoUrl?: string
  status: 'vigente' | 'vencida' | 'proximo_vencimento'
  diasParaVencer: number
  alertaEnviado: boolean
}

interface AlertaVencimento {
  id: string
  documentoId: string
  documentoTitulo: string
  tipoDocumento: TipoDocumento
  dataVencimento: string
  diasRestantes: number
  prioridade: 'critica' | 'alta' | 'media' | 'baixa'
  notificadoEm?: string
  responsavel: string
}

// ============ DADOS MOCKADOS ============

const documentosMock: Documento[] = [
  {
    id: '1',
    codigo: 'MQ-001',
    titulo: 'Manual da Qualidade',
    tipo: 'manual_qualidade',
    categoria: 'sgq',
    versao: '5.0',
    dataEmissao: '2025-01-15',
    dataProximaRevisao: '2026-01-15',
    status: 'vigente',
    responsavel: 'Ana Silva',
    aprovador: 'Carlos Diretor',
    dataAprovacao: '2025-01-14',
    tags: ['SGQ', 'RDC 665', 'ISO 13485'],
  },
  {
    id: '2',
    codigo: 'POP-REC-001',
    titulo: 'Recebimento, Inspeção e Armazenamento',
    tipo: 'pop',
    categoria: 'sgq',
    versao: '3.2',
    dataEmissao: '2025-02-01',
    dataProximaRevisao: '2026-02-01',
    status: 'vigente',
    responsavel: 'João Qualidade',
    aprovador: 'Ana Silva',
    dataAprovacao: '2025-01-30',
    tags: ['Recebimento', 'Armazenamento', 'RDC 665'],
  },
  {
    id: '3',
    codigo: 'LIC-AFE-001',
    titulo: 'Autorização de Funcionamento - AFE',
    tipo: 'licenca',
    categoria: 'anvisa',
    versao: '1.0',
    dataEmissao: '2024-06-15',
    dataValidade: '2025-06-15',
    status: 'proximo_vencimento',
    responsavel: 'Maria RT',
    diasParaVencer: 45,
    alertaEnviado: true,
    tags: ['ANVISA', 'AFE', 'Licença'],
  },
  {
    id: '4',
    codigo: 'LIC-AE-001',
    titulo: 'Autorização Especial - AE',
    tipo: 'licenca',
    categoria: 'anvisa',
    versao: '1.0',
    dataEmissao: '2024-08-20',
    dataValidade: '2025-08-20',
    status: 'vigente',
    responsavel: 'Maria RT',
    diasParaVencer: 120,
    tags: ['ANVISA', 'AE', 'Licença'],
  },
  {
    id: '5',
    codigo: 'CERT-ISO-001',
    titulo: 'Certificado ISO 9001:2015',
    tipo: 'certificado',
    categoria: 'sgq',
    versao: '1.0',
    dataEmissao: '2023-03-10',
    dataValidade: '2026-03-10',
    status: 'vigente',
    responsavel: 'Ana Silva',
    diasParaVencer: 365,
    tags: ['ISO 9001', 'Certificação', 'SGQ'],
  },
  {
    id: '6',
    codigo: 'LIC-VIG-001',
    titulo: 'Licença de Vigilância Sanitária Estadual',
    tipo: 'licenca',
    categoria: 'anvisa',
    versao: '1.0',
    dataEmissao: '2024-12-01',
    dataValidade: '2025-12-01',
    status: 'vigente',
    responsavel: 'Maria RT',
    diasParaVencer: 220,
    tags: ['Vigilância Sanitária', 'Licença Estadual'],
  },
  {
    id: '7',
    codigo: 'POP-RAST-001',
    titulo: 'Rastreabilidade de Produtos',
    tipo: 'pop',
    categoria: 'sgq',
    versao: '2.1',
    dataEmissao: '2025-03-01',
    dataProximaRevisao: '2026-03-01',
    status: 'vigente',
    responsavel: 'João Qualidade',
    tags: ['Rastreabilidade', 'RDC 665', 'ANVISA'],
  },
]

const cartasComercializacaoMock: CartaComercializacao[] = [
  {
    id: '1',
    fabricante: 'Abbott Laboratories',
    cnpjFabricante: '56.998.982/0001-07',
    numeroDocumento: 'CC-ABB-2024-001',
    dataEmissao: '2024-01-15',
    dataValidade: '2025-01-15',
    produtosAutorizados: [
      'Marca-passo Assurity MRI',
      'CDI Neutrino NxT',
      'CRT-D Quadra Assura',
      'Monitor Cardíaco Confirm Rx',
    ],
    status: 'proximo_vencimento',
    diasParaVencer: 30,
    alertaEnviado: true,
    observacoes: 'Renovação em andamento',
  },
  {
    id: '2',
    fabricante: 'Medtronic Inc.',
    cnpjFabricante: '02.427.163/0001-80',
    numeroDocumento: 'CC-MDT-2024-002',
    dataEmissao: '2024-06-01',
    dataValidade: '2025-06-01',
    produtosAutorizados: [
      'Stent Coronário Resolute Onyx',
      'Cateter de Ablação Arctic Front',
      'Sistema de Mapeamento EnSite',
    ],
    status: 'vigente',
    diasParaVencer: 180,
    alertaEnviado: false,
  },
  {
    id: '3',
    fabricante: 'Boston Scientific',
    cnpjFabricante: '01.518.180/0001-19',
    numeroDocumento: 'CC-BSC-2023-001',
    dataEmissao: '2023-08-15',
    dataValidade: '2024-08-15',
    produtosAutorizados: [
      'Stent Eluvia',
      'Balão de Angioplastia Ranger',
    ],
    status: 'vencida',
    diasParaVencer: -120,
    alertaEnviado: true,
    observacoes: 'URGENTE: Solicitar renovação',
  },
]

const alertasMock: AlertaVencimento[] = [
  {
    id: '1',
    documentoId: '3',
    documentoTitulo: 'Autorização de Funcionamento - AFE',
    tipoDocumento: 'licenca',
    dataVencimento: '2025-06-15',
    diasRestantes: 45,
    prioridade: 'alta',
    notificadoEm: '2025-04-01',
    responsavel: 'Maria RT',
  },
  {
    id: '2',
    documentoId: 'cc-1',
    documentoTitulo: 'Carta de Comercialização - Abbott',
    tipoDocumento: 'carta_comercializacao',
    dataVencimento: '2025-01-15',
    diasRestantes: 30,
    prioridade: 'critica',
    notificadoEm: '2024-12-15',
    responsavel: 'Comercial',
  },
  {
    id: '3',
    documentoId: 'cc-3',
    documentoTitulo: 'Carta de Comercialização - Boston Scientific',
    tipoDocumento: 'carta_comercializacao',
    dataVencimento: '2024-08-15',
    diasRestantes: -120,
    prioridade: 'critica',
    responsavel: 'Comercial',
  },
]

// ============ COMPONENTES AUXILIARES ============

const TipoDocumentoLabel: Record<TipoDocumento, string> = {
  manual_qualidade: 'Manual da Qualidade',
  pop: 'POP',
  instrucao_trabalho: 'Instrução de Trabalho',
  formulario: 'Formulário',
  registro: 'Registro',
  certificado: 'Certificado',
  licenca: 'Licença',
  carta_comercializacao: 'Carta de Comercialização',
  contrato: 'Contrato',
  laudo: 'Laudo',
  relatorio: 'Relatório',
  politica: 'Política',
  outro: 'Outro',
}

const CategoriaLabel: Record<CategoriaDocumento, string> = {
  sgq: 'SGQ',
  anvisa: 'ANVISA',
  comercial: 'Comercial',
  rh: 'RH',
  financeiro: 'Financeiro',
  operacional: 'Operacional',
  juridico: 'Jurídico',
  fornecedor: 'Fornecedor',
}

function StatusBadge({ status, diasParaVencer }: { status: StatusDocumento; diasParaVencer?: number }) {
  const configs: Record<StatusDocumento, { label: string; color: string; icon: React.ReactNode }> = {
    vigente: { label: 'Vigente', color: 'bg-emerald-500/20 text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
    em_revisao: { label: 'Em Revisão', color: 'bg-blue-500/20 text-blue-400', icon: <RefreshCw className="w-3 h-3" /> },
    aguardando_aprovacao: { label: 'Aguardando Aprovação', color: 'bg-violet-500/20 text-violet-300', icon: <Clock className="w-3 h-3" /> },
    vencido: { label: 'Vencido', color: 'bg-red-500/20 text-red-400', icon: <AlertTriangle className="w-3 h-3" /> },
    proximo_vencimento: { label: `Vence em ${diasParaVencer} dias`, color: 'bg-red-500/20 text-pink-400', icon: <FileClock className="w-3 h-3" /> },
    obsoleto: { label: 'Obsoleto', color: 'bg-slate-500/20 text-slate-400', icon: <Archive className="w-3 h-3" /> },
    rascunho: { label: 'Rascunho', color: 'bg-slate-500/20 text-slate-400', icon: <Edit className="w-3 h-3" /> },
  }

  const config = configs[status]

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

function PrioridadeBadge({ prioridade }: { prioridade: AlertaVencimento['prioridade'] }) {
  const configs = {
    critica: { label: 'Crítica', color: 'bg-red-500/20 text-red-400' },
    alta: { label: 'Alta', color: 'bg-red-500/20 text-pink-400' },
    media: { label: 'Média', color: 'bg-violet-500/20 text-violet-300' },
    baixa: { label: 'Baixa', color: 'bg-blue-500/20 text-blue-400' },
  }

  return <Badge className={configs[prioridade].color}>{configs[prioridade].label}</Badge>
}

// ============ COMPONENTE PRINCIPAL ============

export function GestaoDocumentosQualidade() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('documentos')
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [documentos, setDocumentos] = useState(documentosMock)
  const [cartas, setCartas] = useState(cartasComercializacaoMock)
  const [alertas] = useState(alertasMock)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCartaDialog, setShowCartaDialog] = useState(false)

  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'

  // Estatísticas
  const totalDocumentos = documentos.length
  const documentosVigentes = documentos.filter(d => d.status === 'vigente').length
  const documentosVencendo = documentos.filter(d => d.status === 'proximo_vencimento').length
  const documentosVencidos = documentos.filter(d => d.status === 'vencido').length
  const cartasVigentes = cartas.filter(c => c.status === 'vigente').length
  const cartasVencendo = cartas.filter(c => c.status === 'proximo_vencimento').length
  const cartasVencidas = cartas.filter(c => c.status === 'vencida').length
  const alertasCriticos = alertas.filter(a => a.prioridade === 'critica').length

  // Filtros
  const documentosFiltrados = documentos.filter(doc => {
    const matchSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = filtroCategoria === 'todos' || doc.categoria === filtroCategoria
    const matchStatus = filtroStatus === 'todos' || doc.status === filtroStatus
    return matchSearch && matchCategoria && matchStatus
  })

  const cartasFiltradas = cartas.filter(carta => {
    const matchSearch = carta.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       carta.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Gestão de Documentos da Qualidade
          </h1>
          <p className={`${textSecondary} mt-1`}>
            Controle de documentos, licenças e cartas de comercialização
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documento
              </Button>
            </DialogTrigger>
            <DialogContent className={`${cardBg} max-w-2xl`}>
              <DialogHeader>
                <DialogTitle className={textPrimary}>Upload de Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Código</label>
                    <Input placeholder="Ex: POP-001" className="mt-1" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Versão</label>
                    <Input placeholder="Ex: 1.0" className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${textSecondary}`}>Título</label>
                  <Input placeholder="Título do documento" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Tipo</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TipoDocumentoLabel).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Categoria</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CategoriaLabel).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Data de Validade</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Responsável</label>
                    <Input placeholder="Nome do responsável" className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${textSecondary}`}>Arquivo</label>
                  <div className={`mt-1 border-2 border-dashed rounded-xl p-8 text-center ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                    <Upload className={`w-10 h-10 mx-auto ${textSecondary}`} />
                    <p className={`mt-2 ${textSecondary}`}>
                      Arraste o arquivo ou clique para selecionar
                    </p>
                    <p className={`text-sm ${textSecondary} opacity-70`}>
                      PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCartaDialog} onOpenChange={setShowCartaDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileCheck className="w-4 h-4 mr-2" />
                Nova Carta
              </Button>
            </DialogTrigger>
            <DialogContent className={`${cardBg} max-w-2xl`}>
              <DialogHeader>
                <DialogTitle className={textPrimary}>Nova Carta de Comercialização</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className={`text-sm font-medium ${textSecondary}`}>Fabricante</label>
                  <Input placeholder="Nome do fabricante" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>CNPJ do Fabricante</label>
                    <Input placeholder="00.000.000/0000-00" className="mt-1" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Nº do Documento</label>
                    <Input placeholder="CC-XXX-2025-001" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Data de Emissão</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${textSecondary}`}>Data de Validade</label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-medium ${textSecondary}`}>Produtos Autorizados</label>
                  <textarea
                    className={`mt-1 w-full rounded-xl px-4 py-3 ${inputBg} ${textPrimary} min-h-[100px]`}
                    placeholder="Liste os produtos autorizados (um por linha)"
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium ${textSecondary}`}>Arquivo da Carta</label>
                  <div className={`mt-1 border-2 border-dashed rounded-xl p-6 text-center ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                    <Upload className={`w-8 h-8 mx-auto ${textSecondary}`} />
                    <p className={`mt-2 text-sm ${textSecondary}`}>
                      Arraste o PDF ou clique para selecionar
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCartaDialog(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Carta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Total Docs</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{totalDocumentos}</p>
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Vigentes</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{documentosVigentes}</p>
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <FileClock className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Vencendo</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{documentosVencendo}</p>
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <FileWarning className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Vencidos</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{documentosVencidos}</p>
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Cartas Vig.</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{cartasVigentes}</p>
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Cartas Venc.</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{cartasVencendo}</p>
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <X className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Cartas Exp.</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{cartasVencidas}</p>
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} p-3`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className={`text-xs ${textSecondary}`}>Alertas</p>
              <p className={`text-lg font-bold ${textPrimary}`}>{alertasCriticos}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {alertasCriticos > 0 && (
        <Card className={`${cardBg} border-l-4 border-l-red-500`}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${textPrimary}`}>Alertas Críticos de Vencimento</h3>
                <div className="mt-2 space-y-2">
                  {alertas.filter(a => a.prioridade === 'critica').map(alerta => (
                    <div key={alerta.id} className={`flex items-center justify-between p-2 rounded-lg ${inputBg}`}>
                      <div className="flex items-center gap-2">
                        <PrioridadeBadge prioridade={alerta.prioridade} />
                        <span className={textPrimary}>{alerta.documentoTitulo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${alerta.diasRestantes < 0 ? 'text-red-400' : 'text-pink-400'}`}>
                          {alerta.diasRestantes < 0 
                            ? `Vencido há ${Math.abs(alerta.diasRestantes)} dias`
                            : `Vence em ${alerta.diasRestantes} dias`
                          }
                        </span>
                        <Button size="sm" variant="outline" className="h-7">
                          <Send className="w-3 h-3 mr-1" />
                          Notificar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`${inputBg} p-1`}>
          <TabsTrigger value="documentos" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="cartas" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Cartas de Comercialização
          </TabsTrigger>
          <TabsTrigger value="anvisa" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Documentos ANVISA
          </TabsTrigger>
          <TabsTrigger value="alertas" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alertas
            {alertasCriticos > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {alertasCriticos}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ia" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            IA Preditiva
          </TabsTrigger>
        </TabsList>

        {/* Tab: Documentos */}
        <TabsContent value="documentos" className="space-y-4">
          {/* Filtros */}
          <Card className={cardBg}>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                    <Input
                      placeholder="Buscar por título ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas Categorias</SelectItem>
                    {Object.entries(CategoriaLabel).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="vigente">Vigente</SelectItem>
                    <SelectItem value="proximo_vencimento">Próximo Vencimento</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="em_revisao">Em Revisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Documentos */}
          <Card className={cardBg}>
            <CardContent className="py-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Código</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Título</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Tipo</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Categoria</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Versão</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Validade</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Status</th>
                      <th className={`text-left py-3 px-4 ${textSecondary} font-medium`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosFiltrados.map((doc) => (
                      <tr key={doc.id} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'} hover:${inputBg}`}>
                        <td className={`py-3 px-4 ${textPrimary} font-mono text-sm`}>{doc.codigo}</td>
                        <td className={`py-3 px-4 ${textPrimary}`}>{doc.titulo}</td>
                        <td className={`py-3 px-4 ${textSecondary} text-sm`}>{TipoDocumentoLabel[doc.tipo]}</td>
                        <td className={`py-3 px-4`}>
                          <Badge className="bg-indigo-500/20 text-indigo-400">{CategoriaLabel[doc.categoria]}</Badge>
                        </td>
                        <td className={`py-3 px-4 ${textSecondary}`}>v{doc.versao}</td>
                        <td className={`py-3 px-4 ${textSecondary} text-sm`}>
                          {doc.dataValidade || doc.dataProximaRevisao || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={doc.status} diasParaVencer={doc.diasParaVencer} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cartas de Comercialização */}
        <TabsContent value="cartas" className="space-y-4">
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={`${textPrimary} flex items-center gap-2`}>
                <FileCheck className="w-5 h-5 text-purple-400" />
                Cartas de Comercialização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {cartasFiltradas.map((carta) => (
                  <div
                    key={carta.id}
                    className={`p-4 rounded-xl ${inputBg} ${
                      carta.status === 'vencida' ? 'border-l-4 border-l-red-500' :
                      carta.status === 'proximo_vencimento' ? 'border-l-4 border-l-red-500' :
                      'border-l-4 border-l-emerald-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold ${textPrimary}`}>{carta.fabricante}</h3>
                          <Badge className={
                            carta.status === 'vigente' ? 'bg-emerald-500/20 text-emerald-400' :
                            carta.status === 'proximo_vencimento' ? 'bg-red-500/20 text-pink-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {carta.status === 'vigente' ? 'Vigente' :
                             carta.status === 'proximo_vencimento' ? `Vence em ${carta.diasParaVencer} dias` :
                             `Vencida há ${Math.abs(carta.diasParaVencer)} dias`}
                          </Badge>
                        </div>
                        <p className={`text-sm ${textSecondary} mt-1`}>
                          CNPJ: {carta.cnpjFabricante} | Doc: {carta.numeroDocumento}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className={textSecondary}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Emissão: {new Date(carta.dataEmissao).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={carta.diasParaVencer < 0 ? 'text-red-400' : textSecondary}>
                            <Clock className="w-4 h-4 inline mr-1" />
                            Validade: {new Date(carta.dataValidade).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className={`text-xs font-medium ${textSecondary} mb-1`}>Produtos Autorizados:</p>
                          <div className="flex flex-wrap gap-1">
                            {carta.produtosAutorizados.map((produto, idx) => (
                              <Badge key={idx} className="bg-slate-500/20 text-slate-400 text-xs">
                                {produto}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {carta.observacoes && (
                          <p className={`text-sm mt-2 ${carta.status === 'vencida' ? 'text-red-400' : 'text-violet-300'}`}>
                            ⚠️ {carta.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        {carta.status !== 'vigente' && (
                          <Button size="sm" className="bg-violet-500 text-white hover:bg-violet-600">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Renovar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentos ANVISA */}
        <TabsContent value="anvisa" className="space-y-4">
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={`${textPrimary} flex items-center gap-2`}>
                <Shield className="w-5 h-5 text-red-400" />
                Documentos Exigidos pela ANVISA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Checklist ANVISA */}
                {[
                  { nome: 'Autorização de Funcionamento (AFE)', status: 'vigente', validade: '2025-06-15', dias: 45 },
                  { nome: 'Autorização Especial (AE)', status: 'vigente', validade: '2025-08-20', dias: 120 },
                  { nome: 'Licença Sanitária Estadual', status: 'vigente', validade: '2025-12-01', dias: 220 },
                  { nome: 'Licença Sanitária Municipal', status: 'vigente', validade: '2025-09-15', dias: 150 },
                  { nome: 'CNES - Cadastro Nacional', status: 'vigente', validade: null, dias: null },
                  { nome: 'Certificado de Regularidade Técnica (CRT)', status: 'vigente', validade: '2025-07-01', dias: 60 },
                  { nome: 'Manual de Boas Práticas', status: 'vigente', validade: null, dias: null },
                  { nome: 'POPs Obrigatórios', status: 'vigente', validade: null, dias: null },
                ].map((doc, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-xl ${inputBg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        doc.status === 'vigente' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {doc.status === 'vigente' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{doc.nome}</p>
                        {doc.validade && (
                          <p className={`text-sm ${doc.dias && doc.dias < 90 ? 'text-pink-400' : textSecondary}`}>
                            Validade: {new Date(doc.validade).toLocaleDateString('pt-BR')}
                            {doc.dias && ` (${doc.dias} dias)`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={`${textPrimary} flex items-center gap-2`}>
                <Bell className="w-5 h-5 text-violet-300" />
                Central de Alertas de Vencimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.sort((a, b) => a.diasRestantes - b.diasRestantes).map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-xl ${inputBg} border-l-4 ${
                      alerta.prioridade === 'critica' ? 'border-l-red-500' :
                      alerta.prioridade === 'alta' ? 'border-l-red-500' :
                      alerta.prioridade === 'media' ? 'border-l-violet-500' :
                      'border-l-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PrioridadeBadge prioridade={alerta.prioridade} />
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{alerta.documentoTitulo}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            Responsável: {alerta.responsavel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          alerta.diasRestantes < 0 ? 'text-red-400' :
                          alerta.diasRestantes < 30 ? 'text-pink-400' :
                          textPrimary
                        }`}>
                          {alerta.diasRestantes < 0 
                            ? `Vencido há ${Math.abs(alerta.diasRestantes)} dias`
                            : `Vence em ${alerta.diasRestantes} dias`
                          }
                        </p>
                        <p className={`text-sm ${textSecondary}`}>
                          {new Date(alerta.dataVencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4 mr-1" />
                          Notificar
                        </Button>
                        <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Renovar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: IA Preditiva */}
        <TabsContent value="ia" className="space-y-4">
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={`${textPrimary} flex items-center gap-2`}>
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                Análise Preditiva de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Previsão de Vencimentos */}
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <h4 className={`font-medium ${textPrimary} mb-3`}>📅 Previsão de Vencimentos - Próximos 90 dias</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-red-500/10">
                      <p className="text-2xl font-bold text-red-400">2</p>
                      <p className={`text-sm ${textSecondary}`}>Próximos 30 dias</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-500/10">
                      <p className="text-2xl font-bold text-pink-400">3</p>
                      <p className={`text-sm ${textSecondary}`}>31-60 dias</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-violet-500/10">
                      <p className="text-2xl font-bold text-violet-300">2</p>
                      <p className={`text-sm ${textSecondary}`}>61-90 dias</p>
                    </div>
                  </div>
                </div>

                {/* Recomendações da IA */}
                <div className={`p-4 rounded-xl border-l-4 border-l-purple-500 ${inputBg}`}>
                  <div className="flex items-start gap-3">
                    <BrainCircuit className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className={`font-medium ${textPrimary}`}>Recomendação da IA</h4>
                      <p className={`text-sm ${textSecondary} mt-1`}>
                        Com base no histórico de renovações, recomendo iniciar o processo de renovação da 
                        <strong className="text-purple-400"> AFE </strong> 
                        com pelo menos 60 dias de antecedência. O tempo médio de processamento na ANVISA 
                        é de 45 dias.
                      </p>
                      <Badge className="mt-2 bg-purple-500/20 text-purple-400">Confiança: 94%</Badge>
                    </div>
                  </div>
                </div>

                {/* Alertas Automáticos */}
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <h4 className={`font-medium ${textPrimary} mb-3`}>🔔 Configuração de Alertas Automáticos</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Alertar 90 dias antes do vencimento', enabled: true },
                      { label: 'Alertar 60 dias antes do vencimento', enabled: true },
                      { label: 'Alertar 30 dias antes do vencimento', enabled: true },
                      { label: 'Alertar 15 dias antes do vencimento', enabled: true },
                      { label: 'Alertar no dia do vencimento', enabled: true },
                      { label: 'Enviar e-mail para responsável', enabled: true },
                      { label: 'Enviar notificação WhatsApp', enabled: false },
                    ].map((config, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className={textSecondary}>{config.label}</span>
                        <div className={`w-10 h-5 rounded-full ${config.enabled ? 'bg-emerald-500' : 'bg-slate-600'} relative cursor-pointer`}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${config.enabled ? 'right-0.5' : 'left-0.5'}`} />
                        </div>
                      </div>
                    ))}
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

export default GestaoDocumentosQualidade

