/**
 * ICARUS v5.0 - Kit OPME Inteligente com IA
 * 
 * Montagem inteligente de kits cirúrgicos OPME com IA,
 * baseado em histórico do cirurgião, padrões de procedimento,
 * biomateriais compatíveis e alternativas.
 * 
 * FUNCIONALIDADES:
 * - Sugestão IA baseada em histórico do cirurgião
 * - Padrões de procedimento por especialidade
 * - Biomateriais compatíveis e tamanhos
 * - Alternativas inteligentes
 * - Controle de esterilidade e validade
 * - Documentação e etiquetas
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
  Package, Box, Boxes, CheckCircle, XCircle, Clock, AlertTriangle,
  Search, Filter, Download, Plus, Eye, Printer, RefreshCw, BrainCircuit,
  User, Stethoscope, Calendar, Target, Zap, Star, StarOff,
  ShieldCheck, ShieldAlert, QrCode, Barcode, Tag, Layers,
  ArrowRight, ArrowLeft, ChevronRight, ChevronDown, MoreVertical,
  Sparkles, Lightbulb, TrendingUp, Activity, FileText, ClipboardList,
  Settings, Trash2, Edit, Copy, ExternalLink, Info, AlertCircle,
  ThermometerSun, Ruler, Scale, Puzzle, CircleDot, Hash
} from 'lucide-react'

// ============ TIPOS ============

interface KitOPME {
  id: string
  codigo: string
  nome: string
  procedimento: string
  especialidade: string
  status: 'montado' | 'em_montagem' | 'pendente' | 'expedido' | 'retornado'
  cirurgiao: {
    nome: string
    crm: string
  }
  paciente: string
  hospital: string
  dataCirurgia: string
  itens: ItemKit[]
  sugestoesIA: SugestaoKit[]
  validadeMinima: string
  esterilidade: 'ok' | 'pendente' | 'vencida'
  documentos: string[]
  observacoes?: string
  confiancaIA: number
}

interface ItemKit {
  id: string
  codigo: string
  descricao: string
  fabricante: string
  tamanho?: string
  quantidade: number
  lote: string
  validade: string
  serial?: string
  registroAnvisa: string
  status: 'disponivel' | 'reservado' | 'indisponivel' | 'alternativa'
  alternativas?: AlternativaProduto[]
}

interface AlternativaProduto {
  id: string
  codigo: string
  descricao: string
  fabricante: string
  compatibilidade: number
  disponivel: boolean
  motivoSugestao: string
}

interface SugestaoKit {
  id: string
  tipo: 'adicionar' | 'substituir' | 'remover' | 'tamanho'
  produto: string
  motivo: string
  baseadoEm: string
  confianca: number
  impacto: 'alto' | 'medio' | 'baixo'
}

interface TemplateKit {
  id: string
  nome: string
  procedimento: string
  especialidade: string
  itensBase: number
  usosRecentes: number
  taxaSucesso: number
}

// ============ DADOS MOCK ============

const MOCK_KITS: KitOPME[] = [
  {
    id: '1',
    codigo: 'KIT-2025-001',
    nome: 'Kit Artroplastia Total Quadril - Dr. Carlos',
    procedimento: 'Artroplastia Total de Quadril',
    especialidade: 'Ortopedia',
    status: 'montado',
    cirurgiao: {
      nome: 'Dr. Carlos Eduardo',
      crm: 'SP-123456',
    },
    paciente: 'Maria Silva Santos',
    hospital: 'Hospital São Lucas',
    dataCirurgia: '2025-12-10',
    itens: [
      { id: '1', codigo: 'PROT-QD-001', descricao: 'Prótese Total de Quadril Cimentada', fabricante: 'Zimmer Biomet', tamanho: '52mm', quantidade: 1, lote: 'ZB2025001234', validade: '2027-06-15', serial: 'SN-QD-2025-0001', registroAnvisa: '10349000001', status: 'reservado' },
      { id: '2', codigo: 'HASTE-001', descricao: 'Haste Femoral Cimentada', fabricante: 'Zimmer Biomet', tamanho: 'Nº 10', quantidade: 1, lote: 'ZB2025001235', validade: '2027-06-15', registroAnvisa: '10349000002', status: 'reservado' },
      { id: '3', codigo: 'CABECA-001', descricao: 'Cabeça Femoral 28mm', fabricante: 'Zimmer Biomet', tamanho: '28mm +0', quantidade: 1, lote: 'ZB2025001236', validade: '2027-06-15', registroAnvisa: '10349000003', status: 'reservado' },
      { id: '4', codigo: 'ACETAB-001', descricao: 'Componente Acetabular', fabricante: 'Zimmer Biomet', tamanho: '54mm', quantidade: 1, lote: 'ZB2025001237', validade: '2027-06-15', registroAnvisa: '10349000004', status: 'reservado' },
      { id: '5', codigo: 'CIM-001', descricao: 'Cimento Ósseo com Antibiótico', fabricante: 'Heraeus', quantidade: 2, lote: 'HE2025005678', validade: '2026-12-31', registroAnvisa: '10349000010', status: 'reservado' },
    ],
    sugestoesIA: [
      { id: '1', tipo: 'adicionar', produto: 'Parafuso de Segurança Acetabular', motivo: 'Dr. Carlos utiliza em 85% dos casos', baseadoEm: 'Histórico do cirurgião', confianca: 92, impacto: 'medio' },
      { id: '2', tipo: 'tamanho', produto: 'Cabeça Femoral 32mm', motivo: 'Paciente com IMC elevado pode requerer maior estabilidade', baseadoEm: 'Perfil do paciente', confianca: 78, impacto: 'alto' },
    ],
    validadeMinima: '2026-12-31',
    esterilidade: 'ok',
    documentos: ['etiqueta_kit.pdf', 'checklist_materiais.pdf'],
    confiancaIA: 94,
  },
  {
    id: '2',
    codigo: 'KIT-2025-002',
    nome: 'Kit Artroplastia Total Joelho - Dra. Ana',
    procedimento: 'Artroplastia Total de Joelho',
    especialidade: 'Ortopedia',
    status: 'em_montagem',
    cirurgiao: {
      nome: 'Dra. Ana Beatriz',
      crm: 'SP-654321',
    },
    paciente: 'João Carlos Oliveira',
    hospital: 'Hospital Albert Einstein',
    dataCirurgia: '2025-12-15',
    itens: [
      { id: '6', codigo: 'PROT-JO-001', descricao: 'Prótese Total de Joelho', fabricante: 'Smith & Nephew', tamanho: 'Tam 5', quantidade: 1, lote: 'SN2025005678', validade: '2027-08-20', registroAnvisa: '10349000005', status: 'reservado' },
      { id: '7', codigo: 'COMP-FEM-001', descricao: 'Componente Femoral', fabricante: 'Smith & Nephew', tamanho: 'Tam 5', quantidade: 1, lote: 'SN2025005679', validade: '2027-08-20', registroAnvisa: '10349000006', status: 'reservado' },
      { id: '8', codigo: 'PLAT-TIB-001', descricao: 'Platô Tibial', fabricante: 'Smith & Nephew', tamanho: 'Tam 4', quantidade: 1, lote: 'SN2025005680', validade: '2027-08-20', registroAnvisa: '10349000007', status: 'indisponivel', alternativas: [
        { id: 'alt-1', codigo: 'PLAT-TIB-002', descricao: 'Platô Tibial - Alternativo', fabricante: 'Stryker', compatibilidade: 95, disponivel: true, motivoSugestao: 'Compatível com sistema Smith & Nephew' },
      ]},
    ],
    sugestoesIA: [
      { id: '3', tipo: 'substituir', produto: 'Platô Tibial Stryker', motivo: 'Item original indisponível, alternativa com 95% compatibilidade', baseadoEm: 'Disponibilidade de estoque', confianca: 95, impacto: 'alto' },
    ],
    validadeMinima: '2027-08-20',
    esterilidade: 'pendente',
    documentos: [],
    confiancaIA: 87,
  },
]

const MOCK_TEMPLATES: TemplateKit[] = [
  { id: '1', nome: 'ATQ Cimentada Padrão', procedimento: 'Artroplastia Total de Quadril', especialidade: 'Ortopedia', itensBase: 8, usosRecentes: 45, taxaSucesso: 98 },
  { id: '2', nome: 'ATQ Não Cimentada', procedimento: 'Artroplastia Total de Quadril', especialidade: 'Ortopedia', itensBase: 7, usosRecentes: 32, taxaSucesso: 96 },
  { id: '3', nome: 'ATJ Primária', procedimento: 'Artroplastia Total de Joelho', especialidade: 'Ortopedia', itensBase: 6, usosRecentes: 38, taxaSucesso: 97 },
  { id: '4', nome: 'Artrodese Lombar L4-L5', procedimento: 'Artrodese Lombar', especialidade: 'Neurocirurgia', itensBase: 12, usosRecentes: 15, taxaSucesso: 94 },
  { id: '5', nome: 'Fixação Coluna Cervical', procedimento: 'Artrodese Cervical', especialidade: 'Neurocirurgia', itensBase: 10, usosRecentes: 12, taxaSucesso: 95 },
]

// ============ COMPONENTE PRINCIPAL ============

export function KitOPMEInteligente() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('kits')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [kitSelecionado, setKitSelecionado] = useState<KitOPME | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isNovoKitOpen, setIsNovoKitOpen] = useState(false)
  const [isSugestoesOpen, setIsSugestoesOpen] = useState(false)

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Helpers
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      montado: { cor: '#10B981', texto: 'Montado', icon: CheckCircle },
      em_montagem: { cor: '#3B82F6', texto: 'Em Montagem', icon: Clock },
      pendente: { cor: '#F59E0B', texto: 'Pendente', icon: AlertTriangle },
      expedido: { cor: '#8B5CF6', texto: 'Expedido', icon: Package },
      retornado: { cor: '#6B7280', texto: 'Retornado', icon: ArrowLeft },
      disponivel: { cor: '#10B981', texto: 'Disponível', icon: CheckCircle },
      reservado: { cor: '#3B82F6', texto: 'Reservado', icon: Tag },
      indisponivel: { cor: '#EF4444', texto: 'Indisponível', icon: XCircle },
      alternativa: { cor: '#F59E0B', texto: 'Alternativa', icon: Puzzle },
      ok: { cor: '#10B981', texto: 'OK', icon: ShieldCheck },
      vencida: { cor: '#EF4444', texto: 'Vencida', icon: ShieldAlert },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: Info }
  }

  const getImpactoConfig = (impacto: string) => {
    const configs: Record<string, { cor: string; texto: string }> = {
      alto: { cor: '#EF4444', texto: 'Alto' },
      medio: { cor: '#F59E0B', texto: 'Médio' },
      baixo: { cor: '#10B981', texto: 'Baixo' },
    }
    return configs[impacto] || { cor: '#6B7280', texto: impacto }
  }

  // Filtrar kits
  const kitsFiltrados = useMemo(() => {
    return MOCK_KITS.filter(k => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!k.codigo.toLowerCase().includes(query) &&
            !k.nome.toLowerCase().includes(query) &&
            !k.paciente.toLowerCase().includes(query) &&
            !k.cirurgiao.nome.toLowerCase().includes(query)) {
          return false
        }
      }
      if (filtroStatus !== 'todos' && k.status !== filtroStatus) {
        return false
      }
      return true
    })
  }, [searchQuery, filtroStatus])

  // Resumo
  const resumo = useMemo(() => {
    return {
      total: MOCK_KITS.length,
      montados: MOCK_KITS.filter(k => k.status === 'montado').length,
      emMontagem: MOCK_KITS.filter(k => k.status === 'em_montagem').length,
      pendentes: MOCK_KITS.filter(k => k.status === 'pendente').length,
      mediaConfiancaIA: Math.round(MOCK_KITS.reduce((acc, k) => acc + k.confiancaIA, 0) / MOCK_KITS.length),
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
            style={{ backgroundColor: '#8B5CF620' }}
          >
            <Boxes className="w-7 h-7 text-[#8B5CF6]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Kit OPME Inteligente</h1>
            <p className={textSecondary}>Montagem com IA • Sugestões • Alternativas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Gerar Sugestões
          </Button>
          <Button onClick={() => setIsNovoKitOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Kit
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Total Kits</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.total}</p>
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
                <p className={`text-xs ${textSecondary}`}>Montados</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.montados}</p>
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
                <p className={`text-xs ${textSecondary}`}>Em Montagem</p>
                <p className={`text-2xl font-bold text-[#3B82F6]`}>{resumo.emMontagem}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Pendentes</p>
                <p className={`text-2xl font-bold text-[#F59E0B]`}>{resumo.pendentes}</p>
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
                <p className={`text-xs ${textSecondary}`}>Confiança IA</p>
                <p className={`text-2xl font-bold text-[#8B5CF6]`}>{resumo.mediaConfiancaIA}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="kits" className="gap-2">
            <Boxes className="w-4 h-4" />
            Kits
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Layers className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="sugestoes" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Sugestões IA
          </TabsTrigger>
        </TabsList>

        {/* Tab: Kits */}
        <TabsContent value="kits" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por código, paciente ou cirurgião..."
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
                    <SelectItem value="montado">Montado</SelectItem>
                    <SelectItem value="em_montagem">Em Montagem</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="expedido">Expedido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Kits */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {kitsFiltrados.map((kit) => {
                  const status = getStatusConfig(kit.status)
                  const StatusIcon = status.icon
                  const esterilidade = getStatusConfig(kit.esterilidade)
                  
                  return (
                    <div 
                      key={kit.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setKitSelecionado(kit)
                        setIsDetalhesOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{kit.codigo}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${esterilidade.cor}20`, color: esterilidade.cor }}
                            >
                              Esterilidade: {esterilidade.texto}
                            </Badge>
                            {kit.sugestoesIA.length > 0 && (
                              <Badge className="bg-purple-500/20 text-purple-500 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {kit.sugestoesIA.length} sugestões
                              </Badge>
                            )}
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{kit.nome}</p>
                          <p className={`text-sm ${textSecondary}`}>{kit.procedimento}</p>
                          <div className={`text-xs ${textSecondary} mt-2 flex gap-4`}>
                            <span>
                              <User className="w-3 h-3 inline mr-1" />
                              {kit.paciente}
                            </span>
                            <span>
                              <Stethoscope className="w-3 h-3 inline mr-1" />
                              {kit.cirurgiao.nome}
                            </span>
                            <span>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(kit.dataCirurgia).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2 justify-end mb-2">
                            <BrainCircuit className="w-4 h-4 text-[#8B5CF6]" />
                            <span className={`font-bold text-[#8B5CF6]`}>{kit.confiancaIA}%</span>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>{kit.itens.length} itens</p>
                          <p className={`text-xs ${textSecondary}`}>
                            Validade mín: {new Date(kit.validadeMinima).toLocaleDateString('pt-BR')}
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

        {/* Tab: Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#6366F1]" />
                Templates de Kit por Procedimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_TEMPLATES.map((template) => (
                  <div 
                    key={template.id}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>{template.nome}</h4>
                        <p className={`text-sm ${textSecondary}`}>{template.procedimento}</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-500 text-xs">
                        {template.especialidade}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                        <p className={`text-lg font-bold ${textPrimary}`}>{template.itensBase}</p>
                        <p className={`text-xs ${textSecondary}`}>Itens</p>
                      </div>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                        <p className={`text-lg font-bold ${textPrimary}`}>{template.usosRecentes}</p>
                        <p className={`text-xs ${textSecondary}`}>Usos</p>
                      </div>
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                        <p className={`text-lg font-bold text-[#10B981]`}>{template.taxaSucesso}%</p>
                        <p className={`text-xs ${textSecondary}`}>Sucesso</p>
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full mt-3 gap-2">
                      <Copy className="w-4 h-4" />
                      Usar Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sugestões IA */}
        <TabsContent value="sugestoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                Sugestões Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_KITS.flatMap(kit => 
                  kit.sugestoesIA.map(sug => {
                    const impacto = getImpactoConfig(sug.impacto)
                    const tipoIcon = {
                      adicionar: Plus,
                      substituir: RefreshCw,
                      remover: Trash2,
                      tamanho: Ruler,
                    }[sug.tipo] || Lightbulb
                    const TipoIcon = tipoIcon
                    
                    return (
                      <div 
                        key={`${kit.id}-${sug.id}`}
                        className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                              <TipoIcon className="w-5 h-5 text-[#8B5CF6]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium ${textPrimary}`}>{sug.produto}</span>
                                <Badge 
                                  className="text-xs"
                                  style={{ backgroundColor: `${impacto.cor}20`, color: impacto.cor }}
                                >
                                  Impacto {impacto.texto}
                                </Badge>
                              </div>
                              <p className={`text-sm ${textSecondary}`}>{sug.motivo}</p>
                              <p className={`text-xs ${textSecondary} mt-1`}>
                                <Lightbulb className="w-3 h-3 inline mr-1" />
                                Baseado em: {sug.baseadoEm}
                              </p>
                              <p className={`text-xs ${textSecondary}`}>
                                Kit: {kit.codigo} • Paciente: {kit.paciente}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-2">
                              <Target className="w-4 h-4 text-[#8B5CF6]" />
                              <span className={`font-bold text-[#8B5CF6]`}>{sug.confianca}%</span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Aplicar
                              </Button>
                              <Button variant="secondary" size="sm">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Insights IA */}
          <Card className={`${cardBg} border-l-4 border-l-[#8B5CF6]`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <div>
                  <p className={`font-medium ${textPrimary}`}>Análise de Padrões</p>
                  <p className={`text-sm ${textSecondary}`}>
                    Baseado nos últimos 100 procedimentos, identificamos que o Dr. Carlos Eduardo 
                    utiliza cabeça femoral 32mm em 65% dos casos de ATQ em pacientes com IMC &gt; 30. 
                    Considere ajustar o template padrão.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes do Kit */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#8B5CF6]" />
              {kitSelecionado?.codigo}
            </DialogTitle>
          </DialogHeader>

          {kitSelecionado && (
            <div className="space-y-4 py-4">
              {/* Info Principal */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>{kitSelecionado.nome}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className={textSecondary}>Paciente</p>
                    <p className={textPrimary}>{kitSelecionado.paciente}</p>
                  </div>
                  <div>
                    <p className={textSecondary}>Cirurgião</p>
                    <p className={textPrimary}>{kitSelecionado.cirurgiao.nome}</p>
                  </div>
                  <div>
                    <p className={textSecondary}>Hospital</p>
                    <p className={textPrimary}>{kitSelecionado.hospital}</p>
                  </div>
                  <div>
                    <p className={textSecondary}>Data</p>
                    <p className={textPrimary}>{new Date(kitSelecionado.dataCirurgia).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              {/* Itens do Kit */}
              <div>
                <h4 className={`font-medium ${textPrimary} mb-3`}>Itens do Kit ({kitSelecionado.itens.length})</h4>
                <div className="space-y-2">
                  {kitSelecionado.itens.map((item) => {
                    const itemStatus = getStatusConfig(item.status)
                    const ItemIcon = itemStatus.icon
                    return (
                      <div key={item.id} className={`p-3 rounded-xl ${inputBg}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ItemIcon className="w-5 h-5" style={{ color: itemStatus.cor }} />
                            <div>
                              <p className={`font-medium ${textPrimary}`}>{item.descricao}</p>
                              <p className={`text-xs ${textSecondary}`}>
                                {item.fabricante} • {item.tamanho && `Tam: ${item.tamanho} • `}Lote: {item.lote}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${itemStatus.cor}20`, color: itemStatus.cor }}
                            >
                              {itemStatus.texto}
                            </Badge>
                            <p className={`text-xs ${textSecondary} mt-1`}>
                              Val: {new Date(item.validade).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {item.alternativas && item.alternativas.length > 0 && (
                          <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                            <p className={`text-xs text-[#F59E0B] mb-1`}>
                              <Puzzle className="w-3 h-3 inline mr-1" />
                              Alternativa disponível:
                            </p>
                            {item.alternativas.map(alt => (
                              <div key={alt.id} className="flex items-center justify-between">
                                <span className={`text-xs ${textPrimary}`}>{alt.descricao}</span>
                                <Badge className="bg-green-500/20 text-green-500 text-xs">
                                  {alt.compatibilidade}% compatível
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sugestões IA */}
              {kitSelecionado.sugestoesIA.length > 0 && (
                <div>
                  <h4 className={`font-medium ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    Sugestões IA
                  </h4>
                  <div className="space-y-2">
                    {kitSelecionado.sugestoesIA.map((sug) => {
                      const impacto = getImpactoConfig(sug.impacto)
                      return (
                        <div key={sug.id} className={`p-3 rounded-xl ${inputBg}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${textPrimary}`}>{sug.produto}</p>
                              <p className={`text-xs ${textSecondary}`}>{sug.motivo}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className="text-xs"
                                style={{ backgroundColor: `${impacto.cor}20`, color: impacto.cor }}
                              >
                                {impacto.texto}
                              </Badge>
                              <span className={`text-sm font-bold text-[#8B5CF6]`}>{sug.confianca}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button variant="secondary" className="gap-2">
              <Printer className="w-4 h-4" />
              Etiquetas
            </Button>
            <Button className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Finalizar Montagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Kit */}
      <Dialog open={isNovoKitOpen} onOpenChange={setIsNovoKitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#8B5CF6]" />
              Novo Kit OPME
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Procedimento *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atq">Artroplastia Total de Quadril</SelectItem>
                  <SelectItem value="atj">Artroplastia Total de Joelho</SelectItem>
                  <SelectItem value="artrodese">Artrodese Lombar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cirurgião *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cirurgião" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dr. Carlos Eduardo - SP-123456</SelectItem>
                  <SelectItem value="2">Dra. Ana Beatriz - SP-654321</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Maria Silva Santos</SelectItem>
                  <SelectItem value="2">João Carlos Oliveira</SelectItem>
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
                <Label>Data da Cirurgia *</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Template Base</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ATQ Cimentada Padrão (8 itens)</SelectItem>
                  <SelectItem value="2">ATQ Não Cimentada (7 itens)</SelectItem>
                  <SelectItem value="3">ATJ Primária (6 itens)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`p-4 rounded-xl ${inputBg}`}>
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                <div>
                  <p className={`font-medium ${textPrimary}`}>Sugestões Automáticas</p>
                  <p className={`text-sm ${textSecondary}`}>
                    A IA irá sugerir itens baseados no histórico do cirurgião e padrões do procedimento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovoKitOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Kit criado! A IA está gerando sugestões...')
              setIsNovoKitOpen(false)
            }} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Criar com IA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default KitOPMEInteligente

