import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
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
import { useCadastros } from '@/hooks/useCadastros'
import { toast } from 'sonner'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Building2,
  Shield,
  X,
  Stethoscope,
  Users,
  Edit,
  Trash2
} from 'lucide-react'

/**
 * Módulo: Gestão de Cadastros (#07)
 * Categoria: Cadastros & Gestão
 * Design System: Dark Glass Medical (Neumorphism 3D)
 * 
 * Sub-Módulos:
 * - Médicos
 * - Hospitais
 * - Pacientes
 * - Convênios
 * 
 * Formulários:
 * 1. Cadastrar/Editar Médico
 * 2. Cadastrar/Editar Hospital
 * 3. Cadastrar/Editar Paciente
 * 4. Cadastrar/Editar Convênio
 */

// Types
interface Medico {
  id: string
  nome: string
  crm: string
  uf_crm: string
  especialidade: string
  telefone: string
  email: string
  hospital_principal?: string
  status: 'ativo' | 'inativo'
}

interface Hospital {
  id: string
  razao_social: string
  nome_fantasia: string
  cnpj: string
  endereco: string
  cidade: string
  uf: string
  telefone: string
  email: string
  contato_nome: string
  status: 'ativo' | 'inativo'
}

interface Paciente {
  id: string
  nome: string
  cpf: string
  data_nascimento: string
  telefone: string
  email: string
  endereco: string
  cidade: string
  uf: string
  convenio?: string
  numero_carteirinha?: string
  status: 'ativo' | 'inativo'
}

interface Convenio {
  id: string
  nome: string
  codigo_ans: string
  tipo: 'particular' | 'convenio' | 'sus'
  telefone: string
  email: string
  prazo_pagamento: number
  status: 'ativo' | 'inativo'
}

// Mock data
const mockMedicos: Medico[] = [
  {
    id: '1',
    nome: 'Dr. Carlos Eduardo Santos',
    crm: '123456',
    uf_crm: 'SP',
    especialidade: 'Ortopedia',
    telefone: '(11) 99999-1234',
    email: 'carlos.santos@email.com',
    hospital_principal: 'Hospital São Lucas',
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Dra. Ana Paula Oliveira',
    crm: '654321',
    uf_crm: 'SP',
    especialidade: 'Cardiologia',
    telefone: '(11) 99999-5678',
    email: 'ana.oliveira@email.com',
    hospital_principal: 'Hospital Albert Einstein',
    status: 'ativo',
  },
]

const mockHospitais: Hospital[] = [
  {
    id: '1',
    razao_social: 'Hospital São Lucas S/A',
    nome_fantasia: 'Hospital São Lucas',
    cnpj: '12.345.678/0001-90',
    endereco: 'Av. Paulista, 1000',
    cidade: 'São Paulo',
    uf: 'SP',
    telefone: '(11) 3333-4444',
    email: 'contato@saolucas.com.br',
    contato_nome: 'Maria Silva',
    status: 'ativo',
  },
  {
    id: '2',
    razao_social: 'Hospital Albert Einstein',
    nome_fantasia: 'Einstein',
    cnpj: '98.765.432/0001-10',
    endereco: 'Av. Albert Einstein, 627',
    cidade: 'São Paulo',
    uf: 'SP',
    telefone: '(11) 2151-1233',
    email: 'contato@einstein.br',
    contato_nome: 'João Santos',
    status: 'ativo',
  },
]

const mockPacientes: Paciente[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    data_nascimento: '1980-05-15',
    telefone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    uf: 'SP',
    convenio: 'Unimed',
    numero_carteirinha: '0000123456789',
    status: 'ativo',
  },
]

const mockConvenios: Convenio[] = [
  {
    id: '1',
    nome: 'Unimed',
    codigo_ans: '359017',
    tipo: 'convenio',
    telefone: '0800 722 4848',
    email: 'atendimento@unimed.coop.br',
    prazo_pagamento: 30,
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'SUS',
    codigo_ans: 'SUS',
    tipo: 'sus',
    telefone: '136',
    email: 'sus@saude.gov.br',
    prazo_pagamento: 60,
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Particular',
    codigo_ans: 'PARTICULAR',
    tipo: 'particular',
    telefone: '-',
    email: '-',
    prazo_pagamento: 0,
    status: 'ativo',
  },
]

const especialidades = [
  'Ortopedia', 'Cardiologia', 'Neurologia', 'Neurocirurgia', 
  'Cirurgia Geral', 'Urologia', 'Ginecologia', 'Oftalmologia',
  'Otorrinolaringologia', 'Cirurgia Plástica', 'Cirurgia Vascular'
]

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export function GestaoCadastros() {
  const { isDark } = useTheme()
  const { data: medicosData } = useCadastros()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('medicos')
  
  // Modal states
  const [isMedicoOpen, setIsMedicoOpen] = useState(false)
  const [isHospitalOpen, setIsHospitalOpen] = useState(false)
  const [isPacienteOpen, setIsPacienteOpen] = useState(false)
  const [isConvenioOpen, setIsConvenioOpen] = useState(false)
  
  // Selected items for editing
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [selectedConvenio, setSelectedConvenio] = useState<Convenio | null>(null)
  
  // Form states
  const [formMedico, setFormMedico] = useState({
    nome: '', crm: '', uf_crm: '', especialidade: '', telefone: '', email: '', hospital_principal: ''
  })
  
  const [formHospital, setFormHospital] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '', endereco: '', cidade: '', uf: '', telefone: '', email: '', contato_nome: ''
  })
  
  const [formPaciente, setFormPaciente] = useState({
    nome: '', cpf: '', data_nascimento: '', telefone: '', email: '', endereco: '', cidade: '', uf: '', convenio: '', numero_carteirinha: ''
  })
  
  const [formConvenio, setFormConvenio] = useState({
    nome: '', codigo_ans: '', tipo: 'convenio' as 'particular' | 'convenio' | 'sus', telefone: '', email: '', prazo_pagamento: ''
  })

  // Use mock data
  const medicos = mockMedicos
  const hospitais = mockHospitais
  const pacientes = mockPacientes
  const convenios = mockConvenios

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'
  const cardBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-50'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'

  // Handlers
  const handleSaveMedico = useCallback(() => {
    if (!formMedico.nome || !formMedico.crm || !formMedico.especialidade) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    toast.success(selectedMedico ? 'Médico atualizado com sucesso!' : 'Médico cadastrado com sucesso!')
    setIsMedicoOpen(false)
    setSelectedMedico(null)
    setFormMedico({ nome: '', crm: '', uf_crm: '', especialidade: '', telefone: '', email: '', hospital_principal: '' })
  }, [formMedico, selectedMedico])

  const handleSaveHospital = useCallback(() => {
    if (!formHospital.razao_social || !formHospital.cnpj) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    toast.success(selectedHospital ? 'Hospital atualizado com sucesso!' : 'Hospital cadastrado com sucesso!')
    setIsHospitalOpen(false)
    setSelectedHospital(null)
    setFormHospital({ razao_social: '', nome_fantasia: '', cnpj: '', endereco: '', cidade: '', uf: '', telefone: '', email: '', contato_nome: '' })
  }, [formHospital, selectedHospital])

  const handleSavePaciente = useCallback(() => {
    if (!formPaciente.nome || !formPaciente.cpf) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    toast.success(selectedPaciente ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!')
    setIsPacienteOpen(false)
    setSelectedPaciente(null)
    setFormPaciente({ nome: '', cpf: '', data_nascimento: '', telefone: '', email: '', endereco: '', cidade: '', uf: '', convenio: '', numero_carteirinha: '' })
  }, [formPaciente, selectedPaciente])

  const handleSaveConvenio = useCallback(() => {
    if (!formConvenio.nome || !formConvenio.codigo_ans) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    toast.success(selectedConvenio ? 'Convênio atualizado com sucesso!' : 'Convênio cadastrado com sucesso!')
    setIsConvenioOpen(false)
    setSelectedConvenio(null)
    setFormConvenio({ nome: '', codigo_ans: '', tipo: 'convenio', telefone: '', email: '', prazo_pagamento: '' })
  }, [formConvenio, selectedConvenio])

  // Edit handlers
  const openEditMedico = (medico: Medico) => {
    setSelectedMedico(medico)
    setFormMedico({
      nome: medico.nome,
      crm: medico.crm,
      uf_crm: medico.uf_crm,
      especialidade: medico.especialidade,
      telefone: medico.telefone,
      email: medico.email,
      hospital_principal: medico.hospital_principal || ''
    })
    setIsMedicoOpen(true)
  }

  const openEditHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setFormHospital({
      razao_social: hospital.razao_social,
      nome_fantasia: hospital.nome_fantasia,
      cnpj: hospital.cnpj,
      endereco: hospital.endereco,
      cidade: hospital.cidade,
      uf: hospital.uf,
      telefone: hospital.telefone,
      email: hospital.email,
      contato_nome: hospital.contato_nome
    })
    setIsHospitalOpen(true)
  }

  const openEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
    setFormPaciente({
      nome: paciente.nome,
      cpf: paciente.cpf,
      data_nascimento: paciente.data_nascimento,
      telefone: paciente.telefone,
      email: paciente.email,
      endereco: paciente.endereco,
      cidade: paciente.cidade,
      uf: paciente.uf,
      convenio: paciente.convenio || '',
      numero_carteirinha: paciente.numero_carteirinha || ''
    })
    setIsPacienteOpen(true)
  }

  const openEditConvenio = (convenio: Convenio) => {
    setSelectedConvenio(convenio)
    setFormConvenio({
      nome: convenio.nome,
      codigo_ans: convenio.codigo_ans,
      tipo: convenio.tipo,
      telefone: convenio.telefone,
      email: convenio.email,
      prazo_pagamento: String(convenio.prazo_pagamento)
    })
    setIsConvenioOpen(true)
  }

  const getStatusBadge = (status: 'ativo' | 'inativo') => {
    return status === 'ativo' 
      ? <Badge className="bg-[#10B981]/20 text-[#10B981] border-none">Ativo</Badge>
      : <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-none">Inativo</Badge>
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
            style={{ backgroundColor: '#F59E0B15' }}
          >
            <FileText className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Gestão de Cadastros</h1>
            <p className={`mt-1 ${textSecondary}`}>Cadastros auxiliares do sistema</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="medicos" className="rounded-lg px-4 py-2">
            <Stethoscope className="w-4 h-4 mr-2" />
            Médicos
          </TabsTrigger>
          <TabsTrigger value="hospitais" className="rounded-lg px-4 py-2">
            <Building2 className="w-4 h-4 mr-2" />
            Hospitais
          </TabsTrigger>
          <TabsTrigger value="pacientes" className="rounded-lg px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="convenios" className="rounded-lg px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Convênios
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="secondary">
                  <Download className="w-4 h-4" />
                </Button>
                <Button onClick={() => {
                  if (activeTab === 'medicos') { setSelectedMedico(null); setIsMedicoOpen(true) }
                  else if (activeTab === 'hospitais') { setSelectedHospital(null); setIsHospitalOpen(true) }
                  else if (activeTab === 'pacientes') { setSelectedPaciente(null); setIsPacienteOpen(true) }
                  else if (activeTab === 'convenios') { setSelectedConvenio(null); setIsConvenioOpen(true) }
                }}>
                  <Plus className="w-4 h-4 mr-1" />
                  Novo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Médicos Tab */}
        <TabsContent value="medicos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#2DD4BF]" />
                Médicos Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Nome</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>CRM</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Especialidade</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Contato</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Status</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicos.map((medico) => (
                      <tr key={medico.id} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5`}>
                        <td className={`py-3 px-4 ${textPrimary}`}>{medico.nome}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{medico.crm}/{medico.uf_crm}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{medico.especialidade}</td>
                        <td className={`py-3 px-4`}>
                          <div className={`text-sm ${textSecondary}`}>{medico.telefone}</div>
                          <div className={`text-xs ${textMuted}`}>{medico.email}</div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(medico.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditMedico(medico)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4 text-[#EF4444]" />
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

        {/* Hospitais Tab */}
        <TabsContent value="hospitais" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#3B82F6]" />
                Hospitais Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Hospital</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>CNPJ</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Cidade/UF</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Contato</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Status</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitais.map((hospital) => (
                      <tr key={hospital.id} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5`}>
                        <td className={`py-3 px-4`}>
                          <div className={textPrimary}>{hospital.nome_fantasia}</div>
                          <div className={`text-xs ${textMuted}`}>{hospital.razao_social}</div>
                        </td>
                        <td className={`py-3 px-4 ${textSecondary} font-mono text-sm`}>{hospital.cnpj}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{hospital.cidade}/{hospital.uf}</td>
                        <td className={`py-3 px-4`}>
                          <div className={`text-sm ${textSecondary}`}>{hospital.contato_nome}</div>
                          <div className={`text-xs ${textMuted}`}>{hospital.telefone}</div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(hospital.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditHospital(hospital)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4 text-[#EF4444]" />
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

        {/* Pacientes Tab */}
        <TabsContent value="pacientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8B5CF6]" />
                Pacientes Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Nome</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>CPF</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Convênio</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Contato</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Status</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map((paciente) => (
                      <tr key={paciente.id} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5`}>
                        <td className={`py-3 px-4 ${textPrimary}`}>{paciente.nome}</td>
                        <td className={`py-3 px-4 ${textSecondary} font-mono text-sm`}>{paciente.cpf}</td>
                        <td className={`py-3 px-4`}>
                          <div className={textSecondary}>{paciente.convenio || 'Particular'}</div>
                          {paciente.numero_carteirinha && (
                            <div className={`text-xs ${textMuted}`}>{paciente.numero_carteirinha}</div>
                          )}
                        </td>
                        <td className={`py-3 px-4`}>
                          <div className={`text-sm ${textSecondary}`}>{paciente.telefone}</div>
                          <div className={`text-xs ${textMuted}`}>{paciente.email}</div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(paciente.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditPaciente(paciente)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4 text-[#EF4444]" />
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

        {/* Convênios Tab */}
        <TabsContent value="convenios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#10B981]" />
                Convênios Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Nome</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Código ANS</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Tipo</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Prazo Pgto</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Status</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convenios.map((convenio) => (
                      <tr key={convenio.id} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5`}>
                        <td className={`py-3 px-4 ${textPrimary}`}>{convenio.nome}</td>
                        <td className={`py-3 px-4 ${textSecondary} font-mono text-sm`}>{convenio.codigo_ans}</td>
                        <td className="py-3 px-4">
                          <Badge className={`border-none ${
                            convenio.tipo === 'convenio' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' :
                            convenio.tipo === 'sus' ? 'bg-[#10B981]/20 text-[#10B981]' :
                            'bg-[#F59E0B]/20 text-[#F59E0B]'
                          }`}>
                            {convenio.tipo === 'convenio' ? 'Convênio' : convenio.tipo === 'sus' ? 'SUS' : 'Particular'}
                          </Badge>
                        </td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{convenio.prazo_pagamento} dias</td>
                        <td className="py-3 px-4">{getStatusBadge(convenio.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditConvenio(convenio)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4 text-[#EF4444]" />
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
      </Tabs>

      {/* Modal: Cadastrar/Editar Médico */}
      <Dialog open={isMedicoOpen} onOpenChange={setIsMedicoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#2DD4BF]" />
              {selectedMedico ? 'Editar Médico' : 'Cadastrar Médico'}
            </DialogTitle>
            <DialogDescription>Preencha os dados do médico</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome_medico">Nome Completo *</Label>
              <Input
                id="nome_medico"
                placeholder="Dr. Nome Completo"
                value={formMedico.nome}
                onChange={(e) => setFormMedico({ ...formMedico, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm">CRM *</Label>
                <Input
                  id="crm"
                  placeholder="123456"
                  value={formMedico.crm}
                  onChange={(e) => setFormMedico({ ...formMedico, crm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf_crm">UF CRM</Label>
                <Select value={formMedico.uf_crm} onValueChange={(v) => setFormMedico({ ...formMedico, uf_crm: v })}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade *</Label>
                <Select value={formMedico.especialidade} onValueChange={(v) => setFormMedico({ ...formMedico, especialidade: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {especialidades.map((esp) => <SelectItem key={esp} value={esp}>{esp}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone_medico">Telefone</Label>
                <Input
                  id="telefone_medico"
                  placeholder="(11) 99999-9999"
                  value={formMedico.telefone}
                  onChange={(e) => setFormMedico({ ...formMedico, telefone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_medico">E-mail</Label>
                <Input
                  id="email_medico"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formMedico.email}
                  onChange={(e) => setFormMedico({ ...formMedico, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsMedicoOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleSaveMedico}>
              <Stethoscope className="w-4 h-4 mr-1" />Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar/Editar Hospital */}
      <Dialog open={isHospitalOpen} onOpenChange={setIsHospitalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#3B82F6]" />
              {selectedHospital ? 'Editar Hospital' : 'Cadastrar Hospital'}
            </DialogTitle>
            <DialogDescription>Preencha os dados do hospital</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razao_social">Razão Social *</Label>
                <Input
                  id="razao_social"
                  placeholder="Razão Social S/A"
                  value={formHospital.razao_social}
                  onChange={(e) => setFormHospital({ ...formHospital, razao_social: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  placeholder="Nome Fantasia"
                  value={formHospital.nome_fantasia}
                  onChange={(e) => setFormHospital({ ...formHospital, nome_fantasia: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0001-00"
                  value={formHospital.cnpj}
                  onChange={(e) => setFormHospital({ ...formHospital, cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato_nome">Nome do Contato</Label>
                <Input
                  id="contato_nome"
                  placeholder="Nome do responsável"
                  value={formHospital.contato_nome}
                  onChange={(e) => setFormHospital({ ...formHospital, contato_nome: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco_hospital">Endereço</Label>
              <Input
                id="endereco_hospital"
                placeholder="Rua, número, complemento"
                value={formHospital.endereco}
                onChange={(e) => setFormHospital({ ...formHospital, endereco: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade_hospital">Cidade</Label>
                <Input
                  id="cidade_hospital"
                  placeholder="Cidade"
                  value={formHospital.cidade}
                  onChange={(e) => setFormHospital({ ...formHospital, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf_hospital">UF</Label>
                <Select value={formHospital.uf} onValueChange={(v) => setFormHospital({ ...formHospital, uf: v })}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone_hospital">Telefone</Label>
                <Input
                  id="telefone_hospital"
                  placeholder="(11) 3333-4444"
                  value={formHospital.telefone}
                  onChange={(e) => setFormHospital({ ...formHospital, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_hospital">E-mail</Label>
              <Input
                id="email_hospital"
                type="email"
                placeholder="contato@hospital.com.br"
                value={formHospital.email}
                onChange={(e) => setFormHospital({ ...formHospital, email: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsHospitalOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleSaveHospital}>
              <Building2 className="w-4 h-4 mr-1" />Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar/Editar Paciente */}
      <Dialog open={isPacienteOpen} onOpenChange={setIsPacienteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8B5CF6]" />
              {selectedPaciente ? 'Editar Paciente' : 'Cadastrar Paciente'}
            </DialogTitle>
            <DialogDescription>Preencha os dados do paciente</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_paciente">Nome Completo *</Label>
                <Input
                  id="nome_paciente"
                  placeholder="Nome Completo"
                  value={formPaciente.nome}
                  onChange={(e) => setFormPaciente({ ...formPaciente, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf_paciente">CPF *</Label>
                <Input
                  id="cpf_paciente"
                  placeholder="000.000.000-00"
                  value={formPaciente.cpf}
                  onChange={(e) => setFormPaciente({ ...formPaciente, cpf: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formPaciente.data_nascimento}
                  onChange={(e) => setFormPaciente({ ...formPaciente, data_nascimento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone_paciente">Telefone</Label>
                <Input
                  id="telefone_paciente"
                  placeholder="(11) 99999-9999"
                  value={formPaciente.telefone}
                  onChange={(e) => setFormPaciente({ ...formPaciente, telefone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_paciente">E-mail</Label>
                <Input
                  id="email_paciente"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formPaciente.email}
                  onChange={(e) => setFormPaciente({ ...formPaciente, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco_paciente">Endereço</Label>
              <Input
                id="endereco_paciente"
                placeholder="Rua, número, complemento"
                value={formPaciente.endereco}
                onChange={(e) => setFormPaciente({ ...formPaciente, endereco: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade_paciente">Cidade</Label>
                <Input
                  id="cidade_paciente"
                  placeholder="Cidade"
                  value={formPaciente.cidade}
                  onChange={(e) => setFormPaciente({ ...formPaciente, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf_paciente">UF</Label>
                <Select value={formPaciente.uf} onValueChange={(v) => setFormPaciente({ ...formPaciente, uf: v })}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {estados.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="convenio_paciente">Convênio</Label>
                <Select value={formPaciente.convenio} onValueChange={(v) => setFormPaciente({ ...formPaciente, convenio: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {convenios.map((conv) => <SelectItem key={conv.id} value={conv.nome}>{conv.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carteirinha">Número da Carteirinha</Label>
              <Input
                id="carteirinha"
                placeholder="0000000000000"
                value={formPaciente.numero_carteirinha}
                onChange={(e) => setFormPaciente({ ...formPaciente, numero_carteirinha: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPacienteOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleSavePaciente}>
              <Users className="w-4 h-4 mr-1" />Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar/Editar Convênio */}
      <Dialog open={isConvenioOpen} onOpenChange={setIsConvenioOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#10B981]" />
              {selectedConvenio ? 'Editar Convênio' : 'Cadastrar Convênio'}
            </DialogTitle>
            <DialogDescription>Preencha os dados do convênio</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_convenio">Nome *</Label>
                <Input
                  id="nome_convenio"
                  placeholder="Nome do Convênio"
                  value={formConvenio.nome}
                  onChange={(e) => setFormConvenio({ ...formConvenio, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_ans">Código ANS *</Label>
                <Input
                  id="codigo_ans"
                  placeholder="000000"
                  value={formConvenio.codigo_ans}
                  onChange={(e) => setFormConvenio({ ...formConvenio, codigo_ans: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_convenio">Tipo *</Label>
                <Select value={formConvenio.tipo} onValueChange={(v: 'particular' | 'convenio' | 'sus') => setFormConvenio({ ...formConvenio, tipo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="convenio">Convênio</SelectItem>
                    <SelectItem value="sus">SUS</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazo_pgto">Prazo Pagamento (dias)</Label>
                <Input
                  id="prazo_pgto"
                  type="number"
                  placeholder="30"
                  value={formConvenio.prazo_pagamento}
                  onChange={(e) => setFormConvenio({ ...formConvenio, prazo_pagamento: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone_convenio">Telefone</Label>
                <Input
                  id="telefone_convenio"
                  placeholder="0800 000 0000"
                  value={formConvenio.telefone}
                  onChange={(e) => setFormConvenio({ ...formConvenio, telefone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_convenio">E-mail</Label>
                <Input
                  id="email_convenio"
                  type="email"
                  placeholder="contato@convenio.com.br"
                  value={formConvenio.email}
                  onChange={(e) => setFormConvenio({ ...formConvenio, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsConvenioOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleSaveConvenio}>
              <Shield className="w-4 h-4 mr-1" />Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
