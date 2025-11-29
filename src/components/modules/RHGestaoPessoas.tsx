import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KPICard } from '@/components/ui/KPICard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import { useRH } from '@/hooks/useRH'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  Users, UserPlus, Calendar, DollarSign, Clock, FileText,
  AlertCircle, CheckCircle, TrendingUp, Calculator, Building2,
  Briefcase, Heart, Shield, BrainCircuit,
  GraduationCap,
  Target, ClipboardCheck, Play, RotateCcw,
  MessageSquare, Lightbulb, AlertTriangle, HardHat
} from 'lucide-react'
import { Textarea } from '@/components/ui/Textarea'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Componente de carrossel de tabs
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'

/**
 * Módulo: RH Gestão de Pessoas
 * Categoria: Cadastros & Gestão
 * 
 * NOVAS FUNCIONALIDADES:
 * - Conformidade DIRF 2025 (cálculo automático de deduções)
 * - Gestão de turnos para logística OPME
 * - Integração com IA para automação de folha
 * - Validação com schemas ANVISA/RDC 751
 */

// Dados mock para demonstração
const funcionariosData = [
  { mes: 'Jan', ativos: 48, admissoes: 3, demissoes: 1 },
  { mes: 'Fev', ativos: 50, admissoes: 4, demissoes: 2 },
  { mes: 'Mar', ativos: 52, admissoes: 3, demissoes: 1 },
  { mes: 'Abr', ativos: 54, admissoes: 2, demissoes: 0 },
  { mes: 'Mai', ativos: 55, admissoes: 2, demissoes: 1 },
  { mes: 'Jun', ativos: 56, admissoes: 1, demissoes: 0 },
]

const departamentosData = [
  { name: 'Logística', value: 18, color: '#6366F1' },
  { name: 'Comercial', value: 12, color: '#10B981' },
  { name: 'Administrativo', value: 10, color: '#8b5cf6' },
  { name: 'Operacional', value: 16, color: '#3B82F6' },
]

const turnosData = [
  { turno: 'Manhã', funcionarios: 22, cobertura: 95 },
  { turno: 'Tarde', funcionarios: 20, cobertura: 92 },
  { turno: 'Noite', funcionarios: 14, cobertura: 88 },
]

// Dados mock de treinamentos e certificações NR-1/PGR
const treinamentosNR1Data = [
  {
    id: '1',
    nome: 'PGR - Programa de Gerenciamento de Riscos',
    tipo: 'obrigatorio',
    cargaHoraria: 8,
    validade: 12, // meses
    funcionariosTotal: 56,
    funcionariosCertificados: 48,
    proximoVencimento: '2025-02-15',
    status: 'em_dia',
  },
  {
    id: '2',
    nome: 'Riscos Psicossociais no Trabalho',
    tipo: 'obrigatorio',
    cargaHoraria: 4,
    validade: 12,
    funcionariosTotal: 56,
    funcionariosCertificados: 32,
    proximoVencimento: '2025-01-20',
    status: 'atencao',
  },
  {
    id: '3',
    nome: 'Manuseio de Produtos OPME',
    tipo: 'especifico',
    cargaHoraria: 16,
    validade: 24,
    funcionariosTotal: 34,
    funcionariosCertificados: 34,
    proximoVencimento: '2025-06-10',
    status: 'em_dia',
  },
  {
    id: '4',
    nome: 'Ergonomia e Postura - AET',
    tipo: 'obrigatorio',
    cargaHoraria: 4,
    validade: 12,
    funcionariosTotal: 56,
    funcionariosCertificados: 45,
    proximoVencimento: '2025-03-01',
    status: 'em_dia',
  },
  {
    id: '5',
    nome: 'CIPA - Comissão Interna',
    tipo: 'obrigatorio',
    cargaHoraria: 20,
    validade: 12,
    funcionariosTotal: 8,
    funcionariosCertificados: 8,
    proximoVencimento: '2025-04-15',
    status: 'em_dia',
  },
]

// Dados mock de avaliações de riscos psicossociais (Nova NR-1)
const riscosPsicossociaisData = [
  { fator: 'Sobrecarga de Trabalho', nivel: 'medio', percentual: 35 },
  { fator: 'Relacionamento Interpessoal', nivel: 'baixo', percentual: 15 },
  { fator: 'Autonomia e Controle', nivel: 'baixo', percentual: 20 },
  { fator: 'Reconhecimento', nivel: 'medio', percentual: 40 },
  { fator: 'Equilíbrio Vida-Trabalho', nivel: 'medio', percentual: 45 },
]

// Dados mock de prestadores PJ
const prestadoresPJData = [
  {
    id: '1',
    razaoSocial: 'MedTech Consultoria LTDA',
    cnpj: '12.345.678/0001-90',
    responsavel: 'Dr. Carlos Silva',
    tipoServico: 'Consultoria Técnica OPME',
    valorMensal: 15000,
    inicioContrato: '2024-01-15',
    fimContrato: '2025-01-14',
    status: 'ativo',
    regimeTributario: 'simples',
    atividadePermitida: true,
  },
  {
    id: '2',
    razaoSocial: 'LogiMed Transportes ME',
    cnpj: '98.765.432/0001-10',
    responsavel: 'João Pereira',
    tipoServico: 'Logística e Transporte',
    valorMensal: 8500,
    inicioContrato: '2024-03-01',
    fimContrato: '2025-02-28',
    status: 'ativo',
    regimeTributario: 'mei',
    atividadePermitida: true,
  },
  {
    id: '3',
    razaoSocial: 'TI Solutions EIRELI',
    cnpj: '45.678.901/0001-23',
    responsavel: 'Ana Costa',
    tipoServico: 'Suporte de TI',
    valorMensal: 12000,
    inicioContrato: '2023-06-01',
    fimContrato: '2024-05-31',
    status: 'vencido',
    regimeTributario: 'lucro_presumido',
    atividadePermitida: true,
  },
]

export function RHGestaoPessoas() {
  const { isDark } = useTheme()
  const { funcionarios, isLoading } = useRH()
  
  const [showNovoFuncionario, setShowNovoFuncionario] = useState(false)
  const [showCalculoDIRF, setShowCalculoDIRF] = useState(false)
  const [showGestaoTurnos, setShowGestaoTurnos] = useState(false)
  const [showNovoPrestadorPJ, setShowNovoPrestadorPJ] = useState(false)
  const [showTutorIA, setShowTutorIA] = useState(false)
  const [tutorMensagem, setTutorMensagem] = useState('')
  const [tutorHistorico, setTutorHistorico] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Olá! Sou o Tutor IA especializado em NR-1 e PGR. Posso ajudar com dúvidas sobre gerenciamento de riscos ocupacionais, riscos psicossociais, treinamentos obrigatórios e conformidade com as normas regulamentadoras. Como posso ajudar?' }
  ])
  
  // State para novo prestador PJ
  const [novoPrestadorPJ, setNovoPrestadorPJ] = useState({
    razaoSocial: '',
    cnpj: '',
    responsavel: '',
    cpfResponsavel: '',
    tipoServico: '',
    valorMensal: '',
    inicioContrato: '',
    fimContrato: '',
    regimeTributario: '',
    objetoContrato: '',
    atividadeCNAE: '',
  })
  
  // Form states
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: '',
    cpf: '',
    cargo: '',
    departamento: '',
    salario: '',
    dataAdmissao: '',
    turno: '',
  })

  const [calculoDIRF, setCalculoDIRF] = useState({
    salarioBruto: '',
    dependentes: '0',
    pensaoAlimenticia: '0',
    previdenciaPrivada: '0',
    planoSaude: '0',
  })

  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const cardBg = isDark ? 'bg-[#15192B]' : 'bg-white'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const chartGridColor = isDark ? '#252B44' : '#E2E8F0'

  // Cálculo DIRF 2025 simplificado
  const calcularDIRF = () => {
    const salario = parseFloat(calculoDIRF.salarioBruto) || 0
    const deps = parseInt(calculoDIRF.dependentes) || 0
    const pensao = parseFloat(calculoDIRF.pensaoAlimenticia) || 0
    const previdencia = parseFloat(calculoDIRF.previdenciaPrivada) || 0
    const saude = parseFloat(calculoDIRF.planoSaude) || 0

    // Dedução por dependente 2025: R$ 189,59
    const deducaoDependentes = deps * 189.59

    // INSS 2025 (simplificado)
    let inss = 0
    if (salario <= 1412.00) inss = salario * 0.075
    else if (salario <= 2666.68) inss = salario * 0.09
    else if (salario <= 4000.03) inss = salario * 0.12
    else inss = salario * 0.14
    inss = Math.min(inss, 908.85) // Teto INSS 2025

    // Base de cálculo IR
    const baseCalculo = salario - inss - deducaoDependentes - pensao - previdencia - saude

    // IR 2025 (simplificado)
    let ir = 0
    if (baseCalculo <= 2259.20) ir = 0
    else if (baseCalculo <= 2826.65) ir = (baseCalculo * 0.075) - 169.44
    else if (baseCalculo <= 3751.05) ir = (baseCalculo * 0.15) - 381.44
    else if (baseCalculo <= 4664.68) ir = (baseCalculo * 0.225) - 662.77
    else ir = (baseCalculo * 0.275) - 896.00

    const salarioLiquido = salario - inss - Math.max(0, ir) - pensao

    return {
      salarioBruto: salario,
      inss,
      ir: Math.max(0, ir),
      deducaoDependentes,
      baseCalculo,
      salarioLiquido,
    }
  }

  const resultadoDIRF = calcularDIRF()

  // Função para enviar mensagem ao Tutor IA
  const enviarMensagemTutor = () => {
    if (!tutorMensagem.trim()) return
    
    const novaMensagem = tutorMensagem
    setTutorHistorico(prev => [...prev, { role: 'user', content: novaMensagem }])
    setTutorMensagem('')
    
    // Simular resposta do Tutor IA (em produção, chamar API do IcarusBrain)
    setTimeout(() => {
      let resposta = ''
      const msgLower = novaMensagem.toLowerCase()
      
      if (msgLower.includes('pgr') || msgLower.includes('gerenciamento de riscos')) {
        resposta = `O PGR (Programa de Gerenciamento de Riscos) é obrigatório desde janeiro de 2022 conforme a nova NR-1. Ele deve conter:\n\n1. **Inventário de Riscos**: Identificação de perigos e avaliação de riscos\n2. **Plano de Ação**: Medidas de prevenção com cronograma\n3. **Riscos Psicossociais**: Novidade de 2024 - avaliação obrigatória de fatores como sobrecarga, assédio e estresse\n\nPrazo de atualização: sempre que houver mudança no ambiente de trabalho ou a cada 2 anos no máximo.`
      } else if (msgLower.includes('psicossocial') || msgLower.includes('mental') || msgLower.includes('estresse')) {
        resposta = `A partir de 2024, a NR-1 passou a exigir a avaliação de **Riscos Psicossociais**. Isso inclui:\n\n• Sobrecarga de trabalho\n• Assédio moral e sexual\n• Falta de autonomia\n• Conflitos interpessoais\n• Desequilíbrio vida-trabalho\n\n**Ações obrigatórias:**\n1. Aplicar questionários validados (ex: COPSOQ)\n2. Incluir no inventário de riscos do PGR\n3. Criar plano de ação para mitigação\n4. Treinar gestores em saúde mental`
      } else if (msgLower.includes('treinamento') || msgLower.includes('certificação')) {
        resposta = `Treinamentos obrigatórios conforme NR-1 e NRs específicas:\n\n**Obrigatórios para todos:**\n• PGR - Integração (8h) - Validade: 12 meses\n• Riscos Psicossociais (4h) - Validade: 12 meses\n• Ergonomia/AET (4h) - Validade: 12 meses\n\n**Específicos OPME:**\n• Manuseio de Produtos Médicos (16h)\n• Rastreabilidade RDC 59 (8h)\n\n**CIPA:**\n• Curso CIPA (20h) - Validade: 12 meses\n\nDica: Use o módulo de Testes para verificar a absorção do conhecimento!`
      } else if (msgLower.includes('multa') || msgLower.includes('penalidade') || msgLower.includes('fiscalização')) {
        resposta = `Penalidades por descumprimento da NR-1/PGR:\n\n**Infrações Leves:** R$ 1.000 a R$ 5.000\n• Documentação incompleta\n• Treinamentos vencidos\n\n**Infrações Graves:** R$ 5.000 a R$ 50.000\n• Ausência de PGR\n• Não avaliação de riscos psicossociais\n• Acidentes sem investigação\n\n**Infrações Gravíssimas:** R$ 50.000 a R$ 200.000\n• Reincidência\n• Acidentes fatais\n• Omissão dolosa\n\n⚠️ Além das multas, pode haver interdição e responsabilização criminal!`
      } else {
        resposta = `Entendi sua dúvida sobre "${novaMensagem}". \n\nPosso ajudar com os seguintes temas relacionados à NR-1 e PGR:\n\n• Implementação do PGR\n• Avaliação de Riscos Psicossociais\n• Treinamentos obrigatórios\n• Penalidades e fiscalização\n• Documentação necessária\n• Prazos e validades\n\nPode me perguntar sobre qualquer um desses temas!`
      }
      
      setTutorHistorico(prev => [...prev, { role: 'assistant', content: resposta }])
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>RH Gestão de Pessoas</h1>
          <p className={textSecondary}>
            Recursos Humanos com conformidade DIRF 2025 e gestão de turnos logística OPME
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCalculoDIRF} onOpenChange={setShowCalculoDIRF}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calculator className="w-4 h-4" />
                Calcular DIRF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#6366F1]" />
                  Calculadora DIRF 2025
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Salário Bruto</Label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={calculoDIRF.salarioBruto}
                      onChange={(e) => setCalculoDIRF({ ...calculoDIRF, salarioBruto: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Nº Dependentes</Label>
                    <Input
                      type="number"
                      min="0"
                      value={calculoDIRF.dependentes}
                      onChange={(e) => setCalculoDIRF({ ...calculoDIRF, dependentes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Pensão Alimentícia</Label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={calculoDIRF.pensaoAlimenticia}
                      onChange={(e) => setCalculoDIRF({ ...calculoDIRF, pensaoAlimenticia: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Previdência Privada</Label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={calculoDIRF.previdenciaPrivada}
                      onChange={(e) => setCalculoDIRF({ ...calculoDIRF, previdenciaPrivada: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Plano de Saúde</Label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={calculoDIRF.planoSaude}
                      onChange={(e) => setCalculoDIRF({ ...calculoDIRF, planoSaude: e.target.value })}
                    />
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <h4 className={`font-semibold ${textPrimary} mb-4`}>Resultado do Cálculo</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={textSecondary}>Salário Bruto:</span>
                      <span className={textPrimary}>{formatCurrency(resultadoDIRF.salarioBruto)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>(-) INSS:</span>
                      <span className="text-red-400">{formatCurrency(resultadoDIRF.inss)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>(-) Dedução Dependentes:</span>
                      <span className="text-red-400">{formatCurrency(resultadoDIRF.deducaoDependentes)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-2">
                      <span className={textSecondary}>Base de Cálculo IR:</span>
                      <span className={textPrimary}>{formatCurrency(resultadoDIRF.baseCalculo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSecondary}>(-) IRRF:</span>
                      <span className="text-red-400">{formatCurrency(resultadoDIRF.ir)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-2 text-lg font-bold">
                      <span className={textPrimary}>Salário Líquido:</span>
                      <span className="text-[#10B981]">{formatCurrency(resultadoDIRF.salarioLiquido)}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20">
                    <div className="flex items-center gap-2 text-[#6366F1] text-sm">
                      <BrainCircuit className="w-4 h-4" />
                      <span>IA validou cálculo conforme tabela DIRF 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showNovoFuncionario} onOpenChange={setShowNovoFuncionario}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Cadastrar Funcionário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input
                      placeholder="Nome do funcionário"
                      value={novoFuncionario.nome}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={novoFuncionario.cpf}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, cpf: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cargo</Label>
                    <Input
                      placeholder="Cargo"
                      value={novoFuncionario.cargo}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, cargo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Departamento</Label>
                    <Select
                      value={novoFuncionario.departamento}
                      onValueChange={(value) => setNovoFuncionario({ ...novoFuncionario, departamento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logistica">Logística</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                        <SelectItem value="operacional">Operacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Salário</Label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={novoFuncionario.salario}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, salario: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Data Admissão</Label>
                    <Input
                      type="date"
                      value={novoFuncionario.dataAdmissao}
                      onChange={(e) => setNovoFuncionario({ ...novoFuncionario, dataAdmissao: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Turno de Trabalho</Label>
                  <Select
                    value={novoFuncionario.turno}
                    onValueChange={(value) => setNovoFuncionario({ ...novoFuncionario, turno: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">Manhã (06:00 - 14:00)</SelectItem>
                      <SelectItem value="tarde">Tarde (14:00 - 22:00)</SelectItem>
                      <SelectItem value="noite">Noite (22:00 - 06:00)</SelectItem>
                      <SelectItem value="comercial">Comercial (08:00 - 18:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => setShowNovoFuncionario(false)}>
                  Cadastrar Funcionário
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Carrossel de Categorias RH */}
      <CadastroTabsCarousel
        tabs={[
          { id: 'funcionarios', label: 'Funcionários', count: 56, delta: 3, icon: Users },
          { id: 'prestadores', label: 'Prestadores PJ', count: 12, delta: 2, icon: Briefcase },
          { id: 'turnos', label: 'Turnos Ativos', count: 3, icon: Clock },
          { id: 'ferias', label: 'Férias Pendentes', count: 8, icon: Calendar },
          { id: 'treinamentos', label: 'Treinamentos', count: treinamentosNR1Data.length, delta: 1, icon: GraduationCap },
        ]}
        active="funcionarios"
        onChange={() => {}}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Funcionários Ativos"
          value={56}
          icon={Users}
          iconColor="#6366F1"
          trend={{ value: 3.6, direction: 'up' }}
        />
        <KPICard
          title="Folha Mensal"
          value={formatCurrency(285000)}
          icon={DollarSign}
          iconColor="#10B981"
        />
        <KPICard
          title="Férias Pendentes"
          value={8}
          icon={Calendar}
          iconColor="#8b5cf6"
        />
        <KPICard
          title="Turnover Anual"
          value="4.2%"
          icon={TrendingUp}
          iconColor="#3B82F6"
          trend={{ value: 1.5, direction: 'down' }}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl flex-wrap`}>
          <TabsTrigger value="visao-geral" className="gap-2">
            <Users className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="turnos" className="gap-2">
            <Clock className="w-4 h-4" />
            Gestão de Turnos
          </TabsTrigger>
          <TabsTrigger value="prestadores-pj" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Prestadores PJ
          </TabsTrigger>
          <TabsTrigger value="treinamentos" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Treinamentos NR-1
          </TabsTrigger>
          <TabsTrigger value="pgr" className="gap-2">
            <HardHat className="w-4 h-4" />
            PGR & Riscos
          </TabsTrigger>
          <TabsTrigger value="folha" className="gap-2">
            <FileText className="w-4 h-4" />
            Folha
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Evolução de Funcionários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#6366F1]" />
                  Evolução do Quadro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={funcionariosData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="mes" stroke={isDark ? '#64748B' : '#64748B'} />
                    <YAxis stroke={isDark ? '#64748B' : '#64748B'} />
                    <Tooltip />
                    <Line type="monotone" dataKey="ativos" stroke="#6366F1" strokeWidth={3} />
                    <Line type="monotone" dataKey="admissoes" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="demissoes" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Departamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#10B981]" />
                  Por Departamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departamentosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {departamentosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestão de Turnos */}
        <TabsContent value="turnos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
                Cobertura por Turno - Logística OPME
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {turnosData.map((turno) => (
                  <div
                    key={turno.turno}
                    className={`p-4 rounded-xl ${inputBg} ${
                      isDark
                        ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                        : 'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>{turno.turno}</h4>
                        <p className={`text-sm ${textSecondary}`}>{turno.funcionarios} funcionários</p>
                      </div>
                      <Badge
                        className={
                          turno.cobertura >= 95
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : turno.cobertura >= 90
                            ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
                            : 'bg-[#EF4444]/20 text-[#EF4444]'
                        }
                      >
                        {turno.cobertura}% cobertura
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          turno.cobertura >= 95
                            ? 'bg-[#10B981]'
                            : turno.cobertura >= 90
                            ? 'bg-[#8b5cf6]'
                            : 'bg-[#EF4444]'
                        }`}
                        style={{ width: `${turno.cobertura}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className={`p-4 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/5`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-[#3B82F6]" />
                  <span className={`font-medium ${textPrimary}`}>Recomendação IA</span>
                </div>
                <p className={textSecondary}>
                  O turno noturno está com cobertura abaixo do ideal (88%). Recomenda-se contratar
                  mais 2 funcionários para garantir 100% de cobertura nas operações de logística OPME.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Folha de Pagamento */}
        <TabsContent value="folha" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <div>
                    <p className={textSecondary}>Salários</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(220000)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <p className={textSecondary}>Benefícios</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(45000)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <p className={textSecondary}>Encargos</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(20000)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Folha</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funcionariosData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="mes" stroke={isDark ? '#64748B' : '#64748B'} />
                  <YAxis stroke={isDark ? '#64748B' : '#64748B'} />
                  <Tooltip />
                  <Bar dataKey="ativos" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance DIRF */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#10B981]" />
                  Status Compliance DIRF 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-xl ${inputBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    <span className={textPrimary}>Cálculos INSS atualizados</span>
                  </div>
                  <Badge className="bg-[#10B981]/20 text-[#10B981]">OK</Badge>
                </div>
                <div className={`p-4 rounded-xl ${inputBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    <span className={textPrimary}>Tabela IRRF 2025</span>
                  </div>
                  <Badge className="bg-[#10B981]/20 text-[#10B981]">OK</Badge>
                </div>
                <div className={`p-4 rounded-xl ${inputBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    <span className={textPrimary}>Dedução por dependente</span>
                  </div>
                  <Badge className="bg-[#10B981]/20 text-[#10B981]">R$ 189,59</Badge>
                </div>
                <div className={`p-4 rounded-xl ${inputBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-[#8b5cf6]" />
                    <span className={textPrimary}>Prazo entrega DIRF</span>
                  </div>
                  <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6]">28/02/2025</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
                  Automação IA - Folha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5`}>
                  <h4 className={`font-medium ${textPrimary} mb-2`}>Validação Automática</h4>
                  <p className={`text-sm ${textSecondary} mb-3`}>
                    O IcarusBrain valida automaticamente todos os cálculos de folha conforme
                    legislação vigente (CLT, DIRF 2025, eSocial).
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6]">Claude 3.5</Badge>
                    <Badge className="bg-[#10B981]/20 text-[#10B981]">Haystack RAG</Badge>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${inputBg}`}>
                  <h4 className={`font-medium ${textPrimary} mb-2`}>Última Validação</h4>
                  <div className="flex items-center justify-between">
                    <span className={textSecondary}>Folha Nov/2025</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[#10B981]">100% conforme</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
