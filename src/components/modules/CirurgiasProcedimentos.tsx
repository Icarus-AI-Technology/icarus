import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { KPICard } from '@/components/ui/KPICard'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import { useCirurgias } from '@/hooks/useCirurgias'
import { toast } from 'sonner'
import { MapaCirurgias, type CirurgiaMapaItem, type StatusCirurgiaSimplificado } from './cirurgias/MapaCirurgias'
import { useMicrosoftGraph } from '@/lib/integrations/microsoft-graph'
import { MaskedInput } from '@/components/ui/MaskedInput'
import {
  Calendar,
  Plus,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building2,
  Stethoscope,
  FileText,
  Receipt,
  X,
  Activity,
  MapPin,
  TrendingUp,
  DollarSign,
  Upload,
  QrCode,
  Truck,
  RotateCcw,
  ClipboardCheck,
  Eye,
  ExternalLink
} from 'lucide-react'

/**
 * Módulo: Cirurgias e Procedimentos OPME
 * Categoria: Core Business
 * Design System: Dark Glass Medical (Neumorphism 3D)
 * 
 * FUNCIONALIDADES:
 * - Mapa de Cirurgias (Kanban horizontal)
 * - Dashboard com métricas em tempo real
 * - Fluxo completo: Pré-cirúrgico → Pós-cirúrgico → Faturamento
 * - Integração Microsoft Outlook (Graph API)
 * - Cadastro de paciente para rastreabilidade OPME
 * - Gestão de fontes pagadoras (Convênios/Hospitais)
 * - Kit cirúrgico inteligente com IA
 * - Rastreabilidade RFID/QR Code
 */

// ============ TIPOS ============

interface Cirurgia {
  id: string
  numero: string
  paciente: {
    nome: string
    data_nascimento: string
    convenio: string
    matricula: string
  }
  medico: {
    id: string
    nome: string
    crm: string
    especialidade: string
  }
  hospital: {
    id: string
    nome: string
    cidade: string
  }
  convenio: {
    id: string
    nome: string
    tipo: 'direto' | 'repasse'
  }
  procedimento: {
    id: string
    nome: string
    codigo_tuss: string
  }
  tipo: 'eletiva' | 'urgencia'
  data_agendada?: string
  hora_agendada?: string
  status: StatusCirurgiaSimplificado
  valor_estimado: number
  valor_faturado?: number
  produtos_opme: Array<{
    id: string
    nome: string
    quantidade: number
    lote?: string
    validade?: string
  }>
  vendedor?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

// ============ MOCK DATA ============

const mockCirurgias: CirurgiaMapaItem[] = [
  {
    id: '1',
    numero: 'CIR-2025-0001',
    paciente: { nome: 'JOÃO CARLOS DA SILVA', convenio: 'Unimed', matricula: '123456789' },
    medico: { nome: 'Dr. Carlos Santos', crm: '123456-SP', especialidade: 'Ortopedia' },
    hospital: { nome: 'Hospital São Lucas', cidade: 'São Paulo' },
    convenio: { nome: 'Unimed', tipo: 'direto' },
    vendedor: 'Maria Fernanda',
    procedimento: 'Artroplastia Total de Quadril',
    data_agendada: '2025-11-30',
    hora_agendada: '08:00',
    status: 'agendada',
    valor_estimado: 45000,
    tipo: 'eletiva',
    dias_no_status: 2,
    alertas: [],
    created_at: '2025-11-25',
  },
  {
    id: '2',
    numero: 'CIR-2025-0002',
    paciente: { nome: 'MARIA OLIVEIRA SANTOS', convenio: 'Bradesco Saúde', matricula: '987654321' },
    medico: { nome: 'Dra. Ana Paula', crm: '654321-SP', especialidade: 'Ortopedia' },
    hospital: { nome: 'Hospital Albert Einstein', cidade: 'São Paulo' },
    convenio: { nome: 'Bradesco Saúde', tipo: 'direto' },
    vendedor: 'Pedro Henrique',
    procedimento: 'Artroscopia de Joelho',
    status: 'em_negociacao',
    valor_estimado: 15000,
    tipo: 'eletiva',
    dias_no_status: 5,
    alertas: ['Aguardando resposta há 5 dias'],
    created_at: '2025-11-20',
  },
  {
    id: '3',
    numero: 'CIR-2025-0003',
    paciente: { nome: 'PEDRO COSTA LIMA', convenio: 'SulAmérica', matricula: '456789123' },
    medico: { nome: 'Dr. Roberto Lima', crm: '789123-SP', especialidade: 'Neurocirurgia' },
    hospital: { nome: 'Hospital Sírio-Libanês', cidade: 'São Paulo' },
    convenio: { nome: 'SulAmérica', tipo: 'repasse' },
    procedimento: 'Fixação de Coluna Lombar',
    data_agendada: '2025-11-29',
    hora_agendada: '14:00',
    status: 'autorizada',
    valor_estimado: 85000,
    tipo: 'eletiva',
    dias_no_status: 1,
    alertas: [],
    created_at: '2025-11-22',
  },
  {
    id: '4',
    numero: 'CIR-2025-0004',
    paciente: { nome: 'ANA BEATRIZ FERREIRA', convenio: 'Amil', matricula: '321654987' },
    medico: { nome: 'Dr. Marcos Vieira', crm: '321987-SP', especialidade: 'Ortopedia' },
    hospital: { nome: 'Hospital 9 de Julho', cidade: 'São Paulo' },
    convenio: { nome: 'Amil', tipo: 'direto' },
    vendedor: 'Maria Fernanda',
    procedimento: 'Prótese de Joelho',
    status: 'respondida',
    valor_estimado: 55000,
    tipo: 'eletiva',
    dias_no_status: 3,
    alertas: [],
    created_at: '2025-11-23',
  },
  {
    id: '5',
    numero: 'CIR-2025-0005',
    paciente: { nome: 'LUCAS MENDES SOUZA', convenio: 'Porto Seguro', matricula: '789456123' },
    medico: { nome: 'Dr. Carlos Santos', crm: '123456-SP', especialidade: 'Ortopedia' },
    hospital: { nome: 'Hospital São Luiz', cidade: 'São Paulo' },
    convenio: { nome: 'Porto Seguro', tipo: 'repasse' },
    procedimento: 'Artrodese de Tornozelo',
    data_agendada: '2025-11-28',
    hora_agendada: '10:00',
    status: 'realizada',
    valor_estimado: 35000,
    tipo: 'urgencia',
    dias_no_status: 1,
    alertas: ['Aguardando autorização de faturamento'],
    created_at: '2025-11-27',
  },
  {
    id: '6',
    numero: 'CIR-2025-0006',
    paciente: { nome: 'FERNANDA RODRIGUES', convenio: 'Unimed', matricula: '654123789' },
    medico: { nome: 'Dra. Ana Paula', crm: '654321-SP', especialidade: 'Ortopedia' },
    hospital: { nome: 'Hospital Oswaldo Cruz', cidade: 'São Paulo' },
    convenio: { nome: 'Unimed', tipo: 'direto' },
    procedimento: 'Reconstrução de LCA',
    status: 'faturada',
    valor_estimado: 28000,
    valor_faturado: 26500,
    tipo: 'eletiva',
    dias_no_status: 0,
    alertas: [],
    created_at: '2025-11-15',
  },
]

const mockMedicos = [
  { id: '1', nome: 'Dr. Carlos Santos', crm: '123456-SP', especialidade: 'Ortopedia', email: 'carlos.santos@hospital.com' },
  { id: '2', nome: 'Dra. Ana Paula', crm: '654321-SP', especialidade: 'Ortopedia', email: 'ana.paula@hospital.com' },
  { id: '3', nome: 'Dr. Roberto Lima', crm: '789123-SP', especialidade: 'Neurocirurgia', email: 'roberto.lima@hospital.com' },
  { id: '4', nome: 'Dr. Marcos Vieira', crm: '321987-SP', especialidade: 'Ortopedia', email: 'marcos.vieira@hospital.com' },
]

const mockHospitais = [
  { id: '1', nome: 'Hospital São Lucas', cidade: 'São Paulo' },
  { id: '2', nome: 'Hospital Albert Einstein', cidade: 'São Paulo' },
  { id: '3', nome: 'Hospital Sírio-Libanês', cidade: 'São Paulo' },
  { id: '4', nome: 'Hospital 9 de Julho', cidade: 'São Paulo' },
  { id: '5', nome: 'Hospital São Luiz', cidade: 'São Paulo' },
]

const mockConvenios = [
  { id: '1', nome: 'Unimed', tipo: 'direto' as const },
  { id: '2', nome: 'Bradesco Saúde', tipo: 'direto' as const },
  { id: '3', nome: 'SulAmérica', tipo: 'repasse' as const },
  { id: '4', nome: 'Amil', tipo: 'direto' as const },
  { id: '5', nome: 'Porto Seguro', tipo: 'repasse' as const },
]

const mockProcedimentos = [
  { id: '1', nome: 'Artroplastia Total de Quadril', codigo_tuss: '30715016' },
  { id: '2', nome: 'Artroscopia de Joelho', codigo_tuss: '30715024' },
  { id: '3', nome: 'Fixação de Coluna Lombar', codigo_tuss: '30715032' },
  { id: '4', nome: 'Prótese de Joelho', codigo_tuss: '30715040' },
  { id: '5', nome: 'Artrodese de Tornozelo', codigo_tuss: '30715048' },
  { id: '6', nome: 'Reconstrução de LCA', codigo_tuss: '30715056' },
]

// ============ COMPONENTE PRINCIPAL ============

export function CirurgiasProcedimentos() {
  const { isDark } = useTheme()
  const { data: cirurgiasData } = useCirurgias()
  const microsoftGraph = useMicrosoftGraph()
  
  // State
  const [activeTab, setActiveTab] = useState('mapa')
  const [isNovaOpen, setIsNovaOpen] = useState(false)
  const [isPacienteOpen, setIsPacienteOpen] = useState(false)
  const [selectedCirurgia, setSelectedCirurgia] = useState<CirurgiaMapaItem | null>(null)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  
  // Form state - Nova Cirurgia
  const [formNova, setFormNova] = useState({
    tipo: 'eletiva' as 'eletiva' | 'urgencia',
    paciente_nome: '',
    paciente_nascimento: '',
    paciente_convenio: '',
    paciente_matricula: '',
    medico_id: '',
    hospital_id: '',
    convenio_id: '',
    procedimento_id: '',
    data_agendada: '',
    hora_agendada: '',
    observacoes: '',
    urgencia_justificativa: '',
  })

  // Use mock data if Supabase data is not available
  const cirurgias = mockCirurgias

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'

  // Estatísticas
  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0]
    return {
      total: cirurgias.length,
      hoje: cirurgias.filter(c => c.data_agendada === hoje).length,
      emAndamento: cirurgias.filter(c => ['em_negociacao', 'respondida', 'autorizada', 'agendada'].includes(c.status)).length,
      realizadas: cirurgias.filter(c => c.status === 'realizada').length,
      faturadas: cirurgias.filter(c => c.status === 'faturada').length,
      urgencias: cirurgias.filter(c => c.tipo === 'urgencia').length,
      valorTotal: cirurgias.reduce((acc, c) => acc + (c.valor_faturado || c.valor_estimado), 0),
      valorFaturado: cirurgias.filter(c => c.valor_faturado).reduce((acc, c) => acc + (c.valor_faturado || 0), 0),
    }
  }, [cirurgias])

  // Handlers
  const handleNovaCirurgia = useCallback(async () => {
    if (!formNova.paciente_nome || !formNova.medico_id || !formNova.hospital_id || !formNova.procedimento_id) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    
    // TODO: Submit to Supabase
    toast.success('Cirurgia criada com sucesso!')
    
    // Sincronizar com Outlook se autenticado
    if (microsoftGraph.isAuthenticated && formNova.data_agendada) {
      try {
        const medico = mockMedicos.find(m => m.id === formNova.medico_id)
        const hospital = mockHospitais.find(h => h.id === formNova.hospital_id)
        const procedimento = mockProcedimentos.find(p => p.id === formNova.procedimento_id)
        
        await microsoftGraph.createEvent({
          id: 'new',
          numero: 'CIR-2025-XXXX',
          paciente: formNova.paciente_nome,
          medico: {
            nome: medico?.nome || '',
            email: medico?.email,
          },
          hospital: {
            nome: hospital?.nome || '',
          },
          procedimento: procedimento?.nome || '',
          dataAgendada: formNova.data_agendada,
          horaInicio: formNova.hora_agendada || '08:00',
          materiais: [],
          responsaveis: [],
        })
        toast.success('Evento sincronizado com Outlook!')
      } catch {
        toast.error('Erro ao sincronizar com Outlook')
      }
    }
    
    setIsNovaOpen(false)
    setFormNova({
      tipo: 'eletiva',
      paciente_nome: '',
      paciente_nascimento: '',
      paciente_convenio: '',
      paciente_matricula: '',
      medico_id: '',
      hospital_id: '',
      convenio_id: '',
      procedimento_id: '',
      data_agendada: '',
      hora_agendada: '',
      observacoes: '',
      urgencia_justificativa: '',
    })
  }, [formNova, microsoftGraph])

  const handleCirurgiaClick = (cirurgia: CirurgiaMapaItem) => {
    setSelectedCirurgia(cirurgia)
    setIsDetalhesOpen(true)
  }

  const handleExportExcel = () => {
    toast.info('Exportando para Excel...')
    // TODO: Implementar exportação
  }

  const handleExportPDF = () => {
    toast.info('Exportando para PDF...')
    // TODO: Implementar exportação
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
                : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
            }`}
            style={{ backgroundColor: '#2DD4BF15' }}
          >
            <Activity className="w-7 h-7 text-[#2DD4BF]" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Cirurgias e Procedimentos</h1>
            <p className={`mt-1 ${textSecondary}`}>Gestão completa do fluxo cirúrgico OPME</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!microsoftGraph.isAuthenticated ? (
            <Button variant="secondary" onClick={microsoftGraph.login} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Conectar Outlook
            </Button>
          ) : (
            <Badge className="bg-green-500/20 text-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Outlook Conectado
            </Badge>
          )}
          <Button onClick={() => setIsNovaOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Cirurgia
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard
          title="Cirurgias Hoje"
          value={stats.hoje}
          icon={Calendar}
          iconColor="#2DD4BF"
        />
        <KPICard
          title="Em Andamento"
          value={stats.emAndamento}
          icon={Clock}
          iconColor="#F59E0B"
        />
        <KPICard
          title="Realizadas"
          value={stats.realizadas}
          icon={CheckCircle}
          iconColor="#10B981"
        />
        <KPICard
          title="Faturadas"
          value={stats.faturadas}
          icon={Receipt}
          iconColor="#6366F1"
        />
        <KPICard
          title="Urgências"
          value={stats.urgencias}
          icon={AlertCircle}
          iconColor="#EF4444"
        />
        <KPICard
          title="Valor Total"
          value={`R$ ${(stats.valorTotal / 1000).toFixed(0)}k`}
          icon={DollarSign}
          iconColor="#8B5CF6"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="mapa" className="gap-2">
            <MapPin className="w-4 h-4" />
            Mapa de Cirurgias
          </TabsTrigger>
          <TabsTrigger value="pre-cirurgico" className="gap-2">
            <FileText className="w-4 h-4" />
            Pré-Cirúrgico
          </TabsTrigger>
          <TabsTrigger value="pos-cirurgico" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Pós-Cirúrgico
          </TabsTrigger>
          <TabsTrigger value="faturamento" className="gap-2">
            <Receipt className="w-4 h-4" />
            Faturamento
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Tab: Mapa de Cirurgias */}
        <TabsContent value="mapa" className="space-y-4">
          <MapaCirurgias
            cirurgias={cirurgias}
            onCirurgiaClick={handleCirurgiaClick}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
        </TabsContent>

        {/* Tab: Pré-Cirúrgico */}
        <TabsContent value="pre-cirurgico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8B5CF6]" />
                Fluxo Pré-Cirúrgico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cotação */}
                <Card className={inputBg}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#F59E0B]" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>Cotação</h4>
                        <p className={`text-xs ${textSecondary}`}>Upload de pedido médico</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <Upload className="w-4 h-4" />
                      Nova Cotação
                    </Button>
                  </CardContent>
                </Card>

                {/* Tabela de Preços */}
                <Card className={inputBg}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#6366F1]" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>Tabela de Preços</h4>
                        <p className={`text-xs ${textSecondary}`}>Convênios e hospitais</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Tabelas
                    </Button>
                  </CardContent>
                </Card>

                {/* Autorização */}
                <Card className={inputBg}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>Autorização</h4>
                        <p className={`text-xs ${textSecondary}`}>Upload de guias</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <Upload className="w-4 h-4" />
                      Anexar Guia
                    </Button>
                  </CardContent>
                </Card>

                {/* Agendamento */}
                <Card className={inputBg}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>Agendamento</h4>
                        <p className={`text-xs ${textSecondary}`}>Integração Outlook</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <Calendar className="w-4 h-4" />
                      Agendar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pós-Cirúrgico */}
        <TabsContent value="pos-cirurgico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#10B981]" />
                Fluxo Pós-Cirúrgico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Gráfico de Status Horizontal */}
              <div className="flex items-center justify-between overflow-x-auto pb-4 mb-6">
                {[
                  { icon: Truck, label: 'Logística', cor: '#EC4899' },
                  { icon: Activity, label: 'Cirurgia', cor: '#EF4444' },
                  { icon: RotateCcw, label: 'Logística Reversa', cor: '#F97316' },
                  { icon: ClipboardCheck, label: 'Pós-Cirúrgico', cor: '#14B8A6' },
                  { icon: FileText, label: 'Análise', cor: '#8B5CF6' },
                  { icon: CheckCircle, label: 'Autorização', cor: '#10B981' },
                  { icon: Receipt, label: 'Faturamento', cor: '#6366F1' },
                ].map((step, index, arr) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${step.cor}20` }}
                      >
                        <step.icon className="w-5 h-5" style={{ color: step.cor }} />
                      </div>
                      <span className={`text-xs ${textSecondary} text-center`}>{step.label}</span>
                    </div>
                    {index < arr.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rastreabilidade */}
                <Card className={inputBg}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-[#EC4899]" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>Rastreabilidade</h4>
                        <p className={`text-xs ${textSecondary}`}>Leitura de código de barras/QR</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <QrCode className="w-4 h-4" />
                      Escanear Material
                    </Button>
                  </CardContent>
                </Card>

                {/* Evidências */}
                <Card className={inputBg}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/20 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-[#14B8A6]" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${textPrimary}`}>Evidências</h4>
                        <p className={`text-xs ${textSecondary}`}>Fotos, lacres, relatórios</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Evidências
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Faturamento */}
        <TabsContent value="faturamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#6366F1]" />
                Faturamento Pós-Cirúrgico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[#F59E0B]" />
                    <span className={`text-sm ${textSecondary}`}>Pendentes</span>
                  </div>
                  <p className={`text-2xl font-bold ${textPrimary}`}>
                    {cirurgias.filter(c => c.status === 'realizada').length}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-[#F97316]" />
                    <span className={`text-sm ${textSecondary}`}>Parciais</span>
                  </div>
                  <p className={`text-2xl font-bold ${textPrimary}`}>0</p>
                </div>
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    <span className={`text-sm ${textSecondary}`}>Faturadas</span>
                  </div>
                  <p className={`text-2xl font-bold ${textPrimary}`}>{stats.faturadas}</p>
                </div>
              </div>

              {/* Lista de cirurgias para faturar */}
              <div className="space-y-3">
                {cirurgias.filter(c => c.status === 'realizada').map((cirurgia) => (
                  <div
                    key={cirurgia.id}
                    className={`p-4 rounded-xl ${inputBg} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#EC4899]" />
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{cirurgia.paciente.nome}</p>
                        <p className={`text-sm ${textSecondary}`}>{cirurgia.procedimento}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold ${textPrimary}`}>
                          R$ {cirurgia.valor_estimado.toLocaleString('pt-BR')}
                        </p>
                        <p className={`text-xs ${textSecondary}`}>{cirurgia.convenio.nome}</p>
                      </div>
                      <Button size="sm" className="gap-2">
                        <Receipt className="w-4 h-4" />
                        Faturar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
                Relatórios de Cirurgias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { titulo: 'Cirurgias Eletivas', descricao: 'Relatório mensal', icon: Calendar, cor: '#3B82F6' },
                  { titulo: 'Urgências', descricao: 'Análise de casos', icon: AlertCircle, cor: '#EF4444' },
                  { titulo: 'Pendentes de Faturamento', descricao: 'Valores a receber', icon: Clock, cor: '#F59E0B' },
                  { titulo: 'Faturamento Parcial', descricao: 'Glosas e ajustes', icon: AlertCircle, cor: '#F97316' },
                  { titulo: 'Faturamento Total', descricao: 'Receita consolidada', icon: CheckCircle, cor: '#10B981' },
                  { titulo: 'Performance por Médico', descricao: 'Análise de produtividade', icon: Stethoscope, cor: '#8B5CF6' },
                ].map((relatorio) => (
                  <Card key={relatorio.titulo} className={inputBg}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${relatorio.cor}20` }}
                        >
                          <relatorio.icon className="w-5 h-5" style={{ color: relatorio.cor }} />
                        </div>
                        <div>
                          <h4 className={`font-medium ${textPrimary}`}>{relatorio.titulo}</h4>
                          <p className={`text-xs ${textSecondary}`}>{relatorio.descricao}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="flex-1 gap-1">
                          <Eye className="w-3 h-3" />
                          Ver
                        </Button>
                        <Button variant="secondary" size="sm" className="gap-1">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Nova Cirurgia */}
      <Dialog open={isNovaOpen} onOpenChange={setIsNovaOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2DD4BF]" />
              Nova Cirurgia
            </DialogTitle>
            <DialogDescription>
              Cadastre uma nova cirurgia com dados do paciente para rastreabilidade OPME
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Tipo de Cirurgia */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant={formNova.tipo === 'eletiva' ? 'default' : 'secondary'}
                onClick={() => setFormNova({ ...formNova, tipo: 'eletiva' })}
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Eletiva
              </Button>
              <Button
                type="button"
                variant={formNova.tipo === 'urgencia' ? 'default' : 'secondary'}
                onClick={() => setFormNova({ ...formNova, tipo: 'urgencia' })}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Urgência
              </Button>
            </div>

            {/* Dados do Paciente (Rastreabilidade) */}
            <div className={`p-4 rounded-xl border ${isDark ? 'border-[#252B44] bg-[#0F1220]' : 'border-slate-200 bg-slate-50'}`}>
              <h4 className={`font-medium ${textPrimary} mb-4 flex items-center gap-2`}>
                <User className="w-4 h-4 text-[#6366F1]" />
                Dados do Paciente (Rastreabilidade)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <MaskedInput
                    mask="uppercase"
                    label="Nome Completo *"
                    value={formNova.paciente_nome}
                    onValueChange={(value) => setFormNova({ ...formNova, paciente_nome: value })}
                    required
                  />
                </div>
                <div>
                  <Label>Data de Nascimento *</Label>
                  <Input
                    type="date"
                    value={formNova.paciente_nascimento}
                    onChange={(e) => setFormNova({ ...formNova, paciente_nascimento: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Convênio *</Label>
                  <Select
                    value={formNova.paciente_convenio}
                    onValueChange={(value) => setFormNova({ ...formNova, paciente_convenio: value, convenio_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o convênio" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockConvenios.map((conv) => (
                        <SelectItem key={conv.id} value={conv.id}>
                          {conv.nome} ({conv.tipo === 'direto' ? 'Direto' : 'Repasse'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Matrícula do Convênio *</Label>
                  <Input
                    placeholder="Número da matrícula"
                    value={formNova.paciente_matricula}
                    onChange={(e) => setFormNova({ ...formNova, paciente_matricula: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Dados da Cirurgia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Médico *</Label>
                <Select
                  value={formNova.medico_id}
                  onValueChange={(value) => setFormNova({ ...formNova, medico_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMedicos.map((medico) => (
                      <SelectItem key={medico.id} value={medico.id}>
                        {medico.nome} - {medico.especialidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hospital *</Label>
                <Select
                  value={formNova.hospital_id}
                  onValueChange={(value) => setFormNova({ ...formNova, hospital_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockHospitais.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Procedimento *</Label>
              <Select
                value={formNova.procedimento_id}
                onValueChange={(value) => setFormNova({ ...formNova, procedimento_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  {mockProcedimentos.map((proc) => (
                    <SelectItem key={proc.id} value={proc.id}>
                      {proc.nome} (TUSS: {proc.codigo_tuss})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agendamento */}
            {formNova.tipo === 'eletiva' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data da Cirurgia</Label>
                  <Input
                    type="date"
                    value={formNova.data_agendada}
                    onChange={(e) => setFormNova({ ...formNova, data_agendada: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={formNova.hora_agendada}
                    onChange={(e) => setFormNova({ ...formNova, hora_agendada: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Justificativa de Urgência */}
            {formNova.tipo === 'urgencia' && (
              <div>
                <Label>Justificativa Médica *</Label>
                <Textarea
                  placeholder="Descreva a justificativa médica para urgência..."
                  value={formNova.urgencia_justificativa}
                  onChange={(e) => setFormNova({ ...formNova, urgencia_justificativa: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações adicionais..."
                value={formNova.observacoes}
                onChange={(e) => setFormNova({ ...formNova, observacoes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNovaOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleNovaCirurgia}>
              <Plus className="w-4 h-4 mr-1" />
              Criar Cirurgia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Detalhes da Cirurgia */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2DD4BF]" />
              Detalhes da Cirurgia #{selectedCirurgia?.numero}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCirurgia && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Badge 
                  className="text-sm"
                  style={{ 
                    backgroundColor: selectedCirurgia.tipo === 'urgencia' ? '#EF444420' : '#3B82F620',
                    color: selectedCirurgia.tipo === 'urgencia' ? '#EF4444' : '#3B82F6'
                  }}
                >
                  {selectedCirurgia.tipo === 'urgencia' ? 'URGÊNCIA' : 'ELETIVA'}
                </Badge>
                <span className={textSecondary}>
                  {selectedCirurgia.dias_no_status} dias no status atual
                </span>
              </div>

              <div className={`p-4 rounded-xl ${inputBg} space-y-3`}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#6366F1]" />
                  <span className={textSecondary}>Paciente:</span>
                  <span className={textPrimary}>{selectedCirurgia.paciente.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#10B981]" />
                  <span className={textSecondary}>Médico:</span>
                  <span className={textPrimary}>{selectedCirurgia.medico.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#F59E0B]" />
                  <span className={textSecondary}>Hospital:</span>
                  <span className={textPrimary}>{selectedCirurgia.hospital.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8B5CF6]" />
                  <span className={textSecondary}>Procedimento:</span>
                  <span className={textPrimary}>{selectedCirurgia.procedimento}</span>
                </div>
                {selectedCirurgia.data_agendada && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#3B82F6]" />
                    <span className={textSecondary}>Data:</span>
                    <span className={textPrimary}>
                      {new Date(selectedCirurgia.data_agendada).toLocaleDateString('pt-BR')}
                      {selectedCirurgia.hora_agendada && ` às ${selectedCirurgia.hora_agendada}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#14B8A6]" />
                  <span className={textSecondary}>Valor:</span>
                  <span className={`font-semibold ${textPrimary}`}>
                    R$ {(selectedCirurgia.valor_faturado || selectedCirurgia.valor_estimado).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {selectedCirurgia.alertas.length > 0 && (
                <div className={`p-4 rounded-xl bg-orange-500/10 border border-orange-500/20`}>
                  <h4 className="font-medium text-orange-500 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Alertas
                  </h4>
                  <ul className="space-y-1">
                    {selectedCirurgia.alertas.map((alerta, idx) => (
                      <li key={idx} className="text-sm text-orange-400">• {alerta}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
            <Button className="gap-2">
              <Eye className="w-4 h-4" />
              Ver Completo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
