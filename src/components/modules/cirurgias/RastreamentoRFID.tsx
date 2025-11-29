/**
 * ICARUS v5.0 - Rastreamento RFID/IoT para Cirurgias
 * 
 * Rastreamento em tempo real de materiais OPME via RFID e IoT,
 * desde a expedição até o uso em cirurgia e retorno.
 * 
 * FUNCIONALIDADES:
 * - Leitura de tags RFID em tempo real
 * - Rastreamento de materiais por cirurgia
 * - Histórico de movimentação
 * - Associação material-paciente
 * - Relatórios ANVISA
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
  Radio, Wifi, WifiOff, QrCode, Barcode, Scan, ScanLine, Package,
  Box, CheckCircle, XCircle, AlertTriangle, Clock, MapPin, Navigation,
  User, Stethoscope, Building2, Calendar, Activity, RefreshCw,
  Search, Filter, Download, Eye, Plus, ArrowRight, ArrowLeft,
  History, FileText, Shield, ShieldCheck, ShieldAlert, Target,
  Zap, TrendingUp, Link, Unlink, CircleDot, Hash, Tag
} from 'lucide-react'

// ============ TIPOS ============

interface MaterialRastreado {
  id: string
  codigo: string
  descricao: string
  fabricante: string
  lote: string
  serial?: string
  tagRFID: string
  registroAnvisa: string
  status: 'em_estoque' | 'expedido' | 'em_uso' | 'implantado' | 'retornado' | 'descartado'
  localizacaoAtual: string
  ultimaLeitura: string
  cirurgiaId?: string
  pacienteId?: string
  pacienteNome?: string
  historico: MovimentacaoMaterial[]
}

interface MovimentacaoMaterial {
  id: string
  tipo: 'entrada' | 'saida' | 'transferencia' | 'uso' | 'retorno' | 'descarte'
  origem: string
  destino: string
  dataHora: string
  responsavel: string
  observacao?: string
}

interface LeitorRFID {
  id: string
  nome: string
  localizacao: string
  status: 'online' | 'offline' | 'alerta'
  ultimaLeitura: string
  leiturasPorMinuto: number
  bateria?: number
}

interface LeituraRFID {
  id: string
  tagRFID: string
  materialCodigo: string
  materialDescricao: string
  leitorId: string
  leitorNome: string
  dataHora: string
  sinalForca: number
  validado: boolean
}

interface AssociacaoPaciente {
  id: string
  materialId: string
  materialCodigo: string
  materialDescricao: string
  pacienteId: string
  pacienteNome: string
  cirurgiaId: string
  cirurgiaProcedimento: string
  dataAssociacao: string
  responsavel: string
  status: 'associado' | 'implantado' | 'removido'
}

// ============ DADOS MOCK ============

const MOCK_MATERIAIS: MaterialRastreado[] = [
  {
    id: '1',
    codigo: 'PROT-QD-001',
    descricao: 'Prótese Total de Quadril Cimentada',
    fabricante: 'Zimmer Biomet',
    lote: 'ZB2025001234',
    serial: 'SN-QD-2025-0001',
    tagRFID: 'RFID-A1B2C3D4E5F6',
    registroAnvisa: '10349000001',
    status: 'implantado',
    localizacaoAtual: 'Hospital São Lucas - Centro Cirúrgico',
    ultimaLeitura: '2025-11-28T10:30:00',
    cirurgiaId: 'CIR-001',
    pacienteId: 'PAC-001',
    pacienteNome: 'Maria Silva Santos',
    historico: [
      { id: '1', tipo: 'entrada', origem: 'Fornecedor', destino: 'Estoque Central', dataHora: '2025-11-01T08:00:00', responsavel: 'João Silva' },
      { id: '2', tipo: 'saida', origem: 'Estoque Central', destino: 'Hospital São Lucas', dataHora: '2025-11-28T06:00:00', responsavel: 'Carlos Oliveira' },
      { id: '3', tipo: 'uso', origem: 'Centro Cirúrgico', destino: 'Paciente', dataHora: '2025-11-28T10:30:00', responsavel: 'Dr. Carlos Eduardo' },
    ],
  },
  {
    id: '2',
    codigo: 'HASTE-001',
    descricao: 'Haste Femoral Cimentada',
    fabricante: 'Zimmer Biomet',
    lote: 'ZB2025001235',
    tagRFID: 'RFID-G7H8I9J0K1L2',
    registroAnvisa: '10349000002',
    status: 'implantado',
    localizacaoAtual: 'Hospital São Lucas - Centro Cirúrgico',
    ultimaLeitura: '2025-11-28T10:35:00',
    cirurgiaId: 'CIR-001',
    pacienteId: 'PAC-001',
    pacienteNome: 'Maria Silva Santos',
    historico: [],
  },
  {
    id: '3',
    codigo: 'PARAF-001',
    descricao: 'Parafuso Cortical 4.5mm',
    fabricante: 'Synthes',
    lote: 'SY2025003456',
    tagRFID: 'RFID-M3N4O5P6Q7R8',
    registroAnvisa: '10349000010',
    status: 'expedido',
    localizacaoAtual: 'Em Trânsito - Hospital Albert Einstein',
    ultimaLeitura: '2025-11-28T14:00:00',
    historico: [],
  },
  {
    id: '4',
    codigo: 'PLACA-001',
    descricao: 'Placa de Reconstrução 3.5mm',
    fabricante: 'Synthes',
    lote: 'SY2025003457',
    tagRFID: 'RFID-S9T0U1V2W3X4',
    registroAnvisa: '10349000011',
    status: 'em_estoque',
    localizacaoAtual: 'Estoque Central - Prateleira A3',
    ultimaLeitura: '2025-11-28T08:00:00',
    historico: [],
  },
]

const MOCK_LEITORES: LeitorRFID[] = [
  { id: '1', nome: 'Leitor Expedição 01', localizacao: 'Doca de Expedição', status: 'online', ultimaLeitura: '2025-11-28T14:30:00', leiturasPorMinuto: 45 },
  { id: '2', nome: 'Leitor Centro Cirúrgico HSL', localizacao: 'Hospital São Lucas - CC', status: 'online', ultimaLeitura: '2025-11-28T14:28:00', leiturasPorMinuto: 12 },
  { id: '3', nome: 'Leitor Recebimento', localizacao: 'Doca de Recebimento', status: 'online', ultimaLeitura: '2025-11-28T14:25:00', leiturasPorMinuto: 8 },
  { id: '4', nome: 'Leitor Estoque A', localizacao: 'Armazém A', status: 'alerta', ultimaLeitura: '2025-11-28T13:00:00', leiturasPorMinuto: 0, bateria: 15 },
]

const MOCK_LEITURAS: LeituraRFID[] = [
  { id: '1', tagRFID: 'RFID-A1B2C3D4E5F6', materialCodigo: 'PROT-QD-001', materialDescricao: 'Prótese Total de Quadril', leitorId: '2', leitorNome: 'Leitor Centro Cirúrgico HSL', dataHora: '2025-11-28T10:30:00', sinalForca: 95, validado: true },
  { id: '2', tagRFID: 'RFID-G7H8I9J0K1L2', materialCodigo: 'HASTE-001', materialDescricao: 'Haste Femoral Cimentada', leitorId: '2', leitorNome: 'Leitor Centro Cirúrgico HSL', dataHora: '2025-11-28T10:35:00', sinalForca: 92, validado: true },
  { id: '3', tagRFID: 'RFID-M3N4O5P6Q7R8', materialCodigo: 'PARAF-001', materialDescricao: 'Parafuso Cortical 4.5mm', leitorId: '1', leitorNome: 'Leitor Expedição 01', dataHora: '2025-11-28T14:00:00', sinalForca: 88, validado: true },
  { id: '4', tagRFID: 'RFID-UNKNOWN-001', materialCodigo: '', materialDescricao: 'Tag não identificada', leitorId: '3', leitorNome: 'Leitor Recebimento', dataHora: '2025-11-28T14:25:00', sinalForca: 45, validado: false },
]

const MOCK_ASSOCIACOES: AssociacaoPaciente[] = [
  { id: '1', materialId: '1', materialCodigo: 'PROT-QD-001', materialDescricao: 'Prótese Total de Quadril', pacienteId: 'PAC-001', pacienteNome: 'Maria Silva Santos', cirurgiaId: 'CIR-001', cirurgiaProcedimento: 'Artroplastia Total de Quadril', dataAssociacao: '2025-11-28T10:30:00', responsavel: 'Dr. Carlos Eduardo', status: 'implantado' },
  { id: '2', materialId: '2', materialCodigo: 'HASTE-001', materialDescricao: 'Haste Femoral Cimentada', pacienteId: 'PAC-001', pacienteNome: 'Maria Silva Santos', cirurgiaId: 'CIR-001', cirurgiaProcedimento: 'Artroplastia Total de Quadril', dataAssociacao: '2025-11-28T10:35:00', responsavel: 'Dr. Carlos Eduardo', status: 'implantado' },
]

// ============ COMPONENTE PRINCIPAL ============

export function RastreamentoRFID() {
  const { isDark } = useTheme()
  
  // States
  const [activeTab, setActiveTab] = useState('tempo-real')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [materialSelecionado, setMaterialSelecionado] = useState<MaterialRastreado | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [isAssociarOpen, setIsAssociarOpen] = useState(false)
  const [scanMode, setScanMode] = useState(false)

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const borderColor = isDark ? 'border-[#252B44]' : 'border-slate-200'

  // Helpers
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { cor: string; texto: string; icon: any }> = {
      em_estoque: { cor: '#3B82F6', texto: 'Em Estoque', icon: Package },
      expedido: { cor: '#8b5cf6', texto: 'Expedido', icon: Navigation },
      em_uso: { cor: '#8B5CF6', texto: 'Em Uso', icon: Activity },
      implantado: { cor: '#10B981', texto: 'Implantado', icon: CheckCircle },
      retornado: { cor: '#6B7280', texto: 'Retornado', icon: ArrowLeft },
      descartado: { cor: '#EF4444', texto: 'Descartado', icon: XCircle },
      online: { cor: '#10B981', texto: 'Online', icon: Wifi },
      offline: { cor: '#EF4444', texto: 'Offline', icon: WifiOff },
      alerta: { cor: '#8b5cf6', texto: 'Alerta', icon: AlertTriangle },
      associado: { cor: '#3B82F6', texto: 'Associado', icon: Link },
      removido: { cor: '#6B7280', texto: 'Removido', icon: Unlink },
    }
    return configs[status] || { cor: '#6B7280', texto: status, icon: CircleDot }
  }

  // Filtrar materiais
  const materiaisFiltrados = useMemo(() => {
    return MOCK_MATERIAIS.filter(m => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!m.codigo.toLowerCase().includes(query) &&
            !m.descricao.toLowerCase().includes(query) &&
            !m.tagRFID.toLowerCase().includes(query) &&
            !m.lote.toLowerCase().includes(query)) {
          return false
        }
      }
      if (filtroStatus !== 'todos' && m.status !== filtroStatus) return false
      return true
    })
  }, [searchQuery, filtroStatus])

  // Resumo
  const resumo = useMemo(() => {
    return {
      totalMateriais: MOCK_MATERIAIS.length,
      emEstoque: MOCK_MATERIAIS.filter(m => m.status === 'em_estoque').length,
      expedidos: MOCK_MATERIAIS.filter(m => m.status === 'expedido').length,
      implantados: MOCK_MATERIAIS.filter(m => m.status === 'implantado').length,
      leitoresOnline: MOCK_LEITORES.filter(l => l.status === 'online').length,
      totalLeitores: MOCK_LEITORES.length,
      leiturasPendentes: MOCK_LEITURAS.filter(l => !l.validado).length,
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
            <Radio className="w-7 h-7 text-[#3B82F6]" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Rastreamento RFID/IoT</h1>
            <p className={textSecondary}>Tempo Real • Associação • Relatórios ANVISA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={scanMode ? 'default' : 'secondary'} 
            onClick={() => {
              setScanMode(!scanMode)
              if (!scanMode) toast.info('Modo de escaneamento ativado')
            }}
            className="gap-2"
          >
            <ScanLine className={`w-4 h-4 ${scanMode ? 'animate-pulse' : ''}`} />
            {scanMode ? 'Escaneando...' : 'Escanear'}
          </Button>
          <Button onClick={() => setIsAssociarOpen(true)} className="gap-2">
            <Link className="w-4 h-4" />
            Associar Material
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Total</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.totalMateriais}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Box className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Estoque</p>
                <p className={`text-2xl font-bold text-[#3B82F6]`}>{resumo.emEstoque}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Expedidos</p>
                <p className={`text-2xl font-bold text-[#8b5cf6]`}>{resumo.expedidos}</p>
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
                <p className={`text-xs ${textSecondary}`}>Implantados</p>
                <p className={`text-2xl font-bold text-[#10B981]`}>{resumo.implantados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Leitores</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{resumo.leitoresOnline}/{resumo.totalLeitores}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Pendentes</p>
                <p className={`text-2xl font-bold text-[#EF4444]`}>{resumo.leiturasPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardBg}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className={`text-xs ${textSecondary}`}>Associações</p>
                <p className={`text-2xl font-bold text-[#8B5CF6]`}>{MOCK_ASSOCIACOES.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="tempo-real" className="gap-2">
            <Activity className="w-4 h-4" />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="materiais" className="gap-2">
            <Package className="w-4 h-4" />
            Materiais
          </TabsTrigger>
          <TabsTrigger value="leitores" className="gap-2">
            <Radio className="w-4 h-4" />
            Leitores
          </TabsTrigger>
          <TabsTrigger value="associacoes" className="gap-2">
            <Link className="w-4 h-4" />
            Associações
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Tab: Tempo Real */}
        <TabsContent value="tempo-real" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#10B981]" />
                Leituras em Tempo Real
                <Badge className="bg-green-500/20 text-green-500 animate-pulse">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_LEITURAS.map((leitura) => (
                  <motion.div 
                    key={leitura.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl ${inputBg} border ${borderColor} ${!leitura.validado ? 'border-l-4 border-l-[#EF4444]' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${leitura.validado ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'}`}>
                          <Radio className={`w-5 h-5 ${leitura.validado ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${textPrimary}`}>{leitura.materialCodigo || 'Não identificado'}</span>
                            <Badge className={leitura.validado ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                              {leitura.validado ? 'Validado' : 'Pendente'}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>{leitura.materialDescricao}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            <Tag className="w-3 h-3 inline mr-1" />
                            {leitura.tagRFID}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${textPrimary}`}>{leitura.leitorNome}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {new Date(leitura.dataHora).toLocaleTimeString('pt-BR')}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Wifi className={`w-4 h-4 ${leitura.sinalForca > 80 ? 'text-[#10B981]' : leitura.sinalForca > 50 ? 'text-[#8b5cf6]' : 'text-[#EF4444]'}`} />
                          <span className={`text-xs ${textSecondary}`}>{leitura.sinalForca}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Materiais */}
        <TabsContent value="materiais" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <Input
                    placeholder="Buscar por código, tag RFID ou lote..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="em_estoque">Em Estoque</SelectItem>
                    <SelectItem value="expedido">Expedido</SelectItem>
                    <SelectItem value="implantado">Implantado</SelectItem>
                    <SelectItem value="retornado">Retornado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Materiais */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {materiaisFiltrados.map((material) => {
                  const status = getStatusConfig(material.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div 
                      key={material.id}
                      className={`p-4 rounded-xl ${inputBg} border ${borderColor} cursor-pointer hover:opacity-90`}
                      onClick={() => {
                        setMaterialSelecionado(material)
                        setIsDetalhesOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{material.codigo}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                          </div>
                          <p className={`font-medium ${textPrimary}`}>{material.descricao}</p>
                          <p className={`text-sm ${textSecondary}`}>{material.fabricante} • Lote: {material.lote}</p>
                          <div className={`text-xs ${textSecondary} mt-2 flex gap-4`}>
                            <span>
                              <Tag className="w-3 h-3 inline mr-1" />
                              {material.tagRFID}
                            </span>
                            <span>
                              <Shield className="w-3 h-3 inline mr-1" />
                              ANVISA: {material.registroAnvisa}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-sm ${textPrimary}`}>
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {material.localizacaoAtual}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>
                            Última leitura: {new Date(material.ultimaLeitura).toLocaleString('pt-BR')}
                          </p>
                          {material.pacienteNome && (
                            <p className={`text-xs text-[#10B981] mt-1`}>
                              <User className="w-3 h-3 inline mr-1" />
                              {material.pacienteNome}
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

        {/* Tab: Leitores */}
        <TabsContent value="leitores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#6366F1]" />
                Leitores RFID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_LEITORES.map((leitor) => {
                  const status = getStatusConfig(leitor.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={leitor.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-5 h-5" style={{ color: status.cor }} />
                          <span className={`font-medium ${textPrimary}`}>{leitor.nome}</span>
                        </div>
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                        >
                          {status.texto}
                        </Badge>
                      </div>
                      <p className={`text-sm ${textSecondary} mb-2`}>
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {leitor.localizacao}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                          <p className={textSecondary}>Leituras/min</p>
                          <p className={`font-bold ${textPrimary}`}>{leitor.leiturasPorMinuto}</p>
                        </div>
                        {leitor.bateria !== undefined && (
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0F1220]' : 'bg-slate-50'}`}>
                            <p className={textSecondary}>Bateria</p>
                            <p className={`font-bold ${leitor.bateria < 20 ? 'text-[#EF4444]' : textPrimary}`}>{leitor.bateria}%</p>
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

        {/* Tab: Associações */}
        <TabsContent value="associacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-[#8B5CF6]" />
                Associações Material-Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ASSOCIACOES.map((assoc) => {
                  const status = getStatusConfig(assoc.status)
                  const StatusIcon = status.icon
                  
                  return (
                    <div key={assoc.id} className={`p-4 rounded-xl ${inputBg} border ${borderColor}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${textPrimary}`}>{assoc.materialCodigo}</span>
                            <ArrowRight className="w-4 h-4 text-[#8B5CF6]" />
                            <span className={`font-bold ${textPrimary}`}>{assoc.pacienteNome}</span>
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: `${status.cor}20`, color: status.cor }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.texto}
                            </Badge>
                          </div>
                          <p className={`text-sm ${textSecondary}`}>{assoc.materialDescricao}</p>
                          <p className={`text-sm ${textSecondary}`}>
                            <Stethoscope className="w-4 h-4 inline mr-1" />
                            {assoc.cirurgiaProcedimento}
                          </p>
                          <p className={`text-xs ${textSecondary} mt-1`}>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(assoc.dataAssociacao).toLocaleString('pt-BR')}
                            <span className="mx-2">•</span>
                            <User className="w-3 h-3 inline mr-1" />
                            {assoc.responsavel}
                          </p>
                        </div>
                        <Button variant="secondary" size="sm" className="gap-1">
                          <FileText className="w-4 h-4" />
                          Laudo
                        </Button>
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
                <History className="w-5 h-5 text-[#6366F1]" />
                Histórico de Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={textSecondary}>Selecione um material para ver o histórico completo de movimentações.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Detalhes do Material */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#3B82F6]" />
              {materialSelecionado?.codigo}
            </DialogTitle>
          </DialogHeader>

          {materialSelecionado && (
            <div className="space-y-4 py-4">
              {/* Info Principal */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2`}>{materialSelecionado.descricao}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={textSecondary}>Fabricante</p>
                    <p className={textPrimary}>{materialSelecionado.fabricante}</p>
                  </div>
                  <div>
                    <p className={textSecondary}>Lote</p>
                    <p className={textPrimary}>{materialSelecionado.lote}</p>
                  </div>
                  <div>
                    <p className={textSecondary}>Tag RFID</p>
                    <p className={textPrimary}>{materialSelecionado.tagRFID}</p>
                  </div>
                  <div>
                    <p className={textSecondary}>Registro ANVISA</p>
                    <p className={textPrimary}>{materialSelecionado.registroAnvisa}</p>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className={`p-4 rounded-xl ${inputBg}`}>
                <h4 className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                  <MapPin className="w-4 h-4 text-[#3B82F6]" />
                  Localização Atual
                </h4>
                <p className={textPrimary}>{materialSelecionado.localizacaoAtual}</p>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Última leitura: {new Date(materialSelecionado.ultimaLeitura).toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Paciente (se associado) */}
              {materialSelecionado.pacienteNome && (
                <div className={`p-4 rounded-xl ${inputBg} border-l-4 border-l-[#10B981]`}>
                  <h4 className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                    <User className="w-4 h-4 text-[#10B981]" />
                    Paciente Associado
                  </h4>
                  <p className={textPrimary}>{materialSelecionado.pacienteNome}</p>
                </div>
              )}

              {/* Histórico */}
              {materialSelecionado.historico.length > 0 && (
                <div>
                  <h4 className={`font-medium ${textPrimary} mb-3 flex items-center gap-2`}>
                    <History className="w-4 h-4 text-[#6366F1]" />
                    Histórico de Movimentações
                  </h4>
                  <div className="space-y-2">
                    {materialSelecionado.historico.map((mov, idx) => (
                      <div key={mov.id} className={`p-3 rounded-xl ${inputBg} relative`}>
                        {idx < materialSelecionado.historico.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-600" />
                        )}
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-[#6366F1] z-10" />
                          <div className="flex-1">
                            <p className={`text-sm ${textPrimary}`}>
                              {mov.origem} → {mov.destino}
                            </p>
                            <p className={`text-xs ${textSecondary}`}>
                              {new Date(mov.dataHora).toLocaleString('pt-BR')} • {mov.responsavel}
                            </p>
                          </div>
                          <Badge className="text-xs">{mov.tipo}</Badge>
                        </div>
                      </div>
                    ))}
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
              <FileText className="w-4 h-4" />
              Relatório ANVISA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Associar Material */}
      <Dialog open={isAssociarOpen} onOpenChange={setIsAssociarOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-[#8B5CF6]" />
              Associar Material a Paciente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tag RFID ou Código do Material *</Label>
              <div className="flex gap-2">
                <Input placeholder="Escaneie ou digite a tag RFID" />
                <Button variant="secondary">
                  <Scan className="w-4 h-4" />
                </Button>
              </div>
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

            <div className="space-y-2">
              <Label>Cirurgia *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cirurgia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">CIR-001 - ATQ - Maria Silva</SelectItem>
                  <SelectItem value="2">CIR-002 - ATJ - João Carlos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`p-4 rounded-xl ${inputBg}`}>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#10B981] mt-0.5" />
                <div>
                  <p className={`font-medium ${textPrimary}`}>Rastreabilidade ANVISA</p>
                  <p className={`text-sm ${textSecondary}`}>
                    A associação será registrada para fins de rastreabilidade conforme RDC 59/2008.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsAssociarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Material associado ao paciente com sucesso!')
              setIsAssociarOpen(false)
            }} className="gap-2">
              <Link className="w-4 h-4" />
              Associar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RastreamentoRFID

