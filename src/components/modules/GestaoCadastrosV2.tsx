/**
 * GestaoCadastrosV2 - Módulo de Cadastros com Auto-preenchimento Obrigatório
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * 
 * REGRAS OBRIGATÓRIAS:
 * - PJ (Hospital, Fornecedor, Cliente): CNPJ obrigatório com auto-preenchimento via Receita Federal
 * - Médico: CRM + UF obrigatório com auto-preenchimento via CFM
 * - Produto OPME: Registro ANVISA obrigatório com auto-preenchimento
 * 
 * Nenhum cadastro PJ pode ser salvo sem validação via API oficial.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Stethoscope, Building2, Users, Truck, Package, Shield,
  Plus, Search, Filter, Download, Edit, Trash2, X,
  Loader2, CheckCircle, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/Form'
import { useTheme } from '@/hooks/useTheme'
import { useCNPJInfosimples, useCFMInfosimples } from '@/hooks/useCNPJInfosimples'
import { cnpjSchema, cpfSchema } from '@/lib/validators/anvisa.schema'
import { crmSchema, EstadosBrasileiros } from '@/lib/validators/cfm.schema'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ==================== SCHEMAS ====================

// Schema para Médico - CRM obrigatório com validação CFM
const medicoSchema = z.object({
  crm: z.string().min(4, 'CRM obrigatório'),
  crm_uf: z.enum(EstadosBrasileiros, { required_error: 'UF obrigatória' }),
  nome: z.string().min(5, 'Nome obrigatório'),
  especialidade: z.string().min(3, 'Especialidade obrigatória'),
  situacao_cfm: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  validado_cfm: z.boolean().default(false),
})

// Schema para Hospital/Fornecedor/Cliente - CNPJ obrigatório com validação Receita
const pjSchema = z.object({
  cnpj: cnpjSchema,
  razao_social: z.string().min(5, 'Razão social obrigatória'),
  nome_fantasia: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().length(2).optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  contato_nome: z.string().optional(),
  situacao_receita: z.string().optional(),
  validado_receita: z.boolean().default(false),
})

// Schema para Paciente - Mínimo para rastreabilidade ANVISA
const pacienteSchema = z.object({
  nome: z.string().min(5, 'Nome obrigatório'),
  cpf: cpfSchema.optional().or(z.literal('')),
  convenio: z.string().optional(),
  hospital: z.string().optional(),
})

type MedicoForm = z.infer<typeof medicoSchema>
type PJForm = z.infer<typeof pjSchema>
type PacienteForm = z.infer<typeof pacienteSchema>

// ==================== MOCK DATA ====================

const mockMedicos = [
  { id: '1', nome: 'Dr. Ricardo Mendes', crm: '52123456', crm_uf: 'RJ', especialidade: 'Cardiologia Intervencionista', validado_cfm: true },
  { id: '2', nome: 'Dra. Fernanda Costa', crm: '52654321', crm_uf: 'RJ', especialidade: 'Cirurgia Vascular', validado_cfm: true },
]

const mockHospitais = [
  { id: '1', razao_social: 'Hospital Copa Star', cnpj: '33.000.118/0001-79', cidade: 'Rio de Janeiro', uf: 'RJ', validado_receita: true },
  { id: '2', razao_social: 'Hospital Samaritano', cnpj: '33.014.556/0001-96', cidade: 'Rio de Janeiro', uf: 'RJ', validado_receita: true },
]

const mockFornecedores = [
  { id: '1', razao_social: 'Abbott Laboratories', cnpj: '56.998.982/0001-07', cidade: 'São Paulo', uf: 'SP', validado_receita: true },
  { id: '2', razao_social: 'Medtronic Brasil', cnpj: '10.244.877/0001-05', cidade: 'São Paulo', uf: 'SP', validado_receita: true },
]

// ==================== COMPONENT ====================

export default function GestaoCadastrosV2() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('medicos')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modais
  const [isMedicoOpen, setIsMedicoOpen] = useState(false)
  const [isHospitalOpen, setIsHospitalOpen] = useState(false)
  const [isFornecedorOpen, setIsFornecedorOpen] = useState(false)
  const [isPacienteOpen, setIsPacienteOpen] = useState(false)

  // Hooks de API
  const { search: searchCNPJ, isLoading: cnpjLoading } = useCNPJInfosimples()
  const { search: searchCFM, isLoading: cfmLoading } = useCFMInfosimples()

  // Forms
  const medicoForm = useForm<MedicoForm>({
    resolver: zodResolver(medicoSchema),
    defaultValues: { crm: '', crm_uf: undefined, nome: '', especialidade: '', validado_cfm: false },
  })

  const hospitalForm = useForm<PJForm>({
    resolver: zodResolver(pjSchema),
    defaultValues: { cnpj: '', razao_social: '', validado_receita: false },
  })

  const fornecedorForm = useForm<PJForm>({
    resolver: zodResolver(pjSchema),
    defaultValues: { cnpj: '', razao_social: '', validado_receita: false },
  })

  const pacienteForm = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: { nome: '', cpf: '', convenio: '', hospital: '' },
  })

  // Cores do tema
  const cardBg = isDark
    ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/95'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'

  // ==================== HANDLERS ====================

  const handleCRMBlur = async () => {
    const crm = medicoForm.getValues('crm')
    const uf = medicoForm.getValues('crm_uf')
    
    if (crm && uf && crm.length >= 4) {
      const result = await searchCFM(crm, uf)
      if (result) {
        medicoForm.setValue('nome', result.nome)
        medicoForm.setValue('especialidade', result.especialidade)
        medicoForm.setValue('situacao_cfm', result.situacao)
        medicoForm.setValue('validado_cfm', true)
        toast.success('Médico validado no CFM!', { description: result.nome })
      } else {
        medicoForm.setValue('validado_cfm', false)
        toast.error('Médico não encontrado no CFM')
      }
    }
  }

  const handleCNPJBlur = async (form: typeof hospitalForm | typeof fornecedorForm) => {
    const cnpj = form.getValues('cnpj')
    
    if (cnpj && cnpj.replace(/\D/g, '').length === 14) {
      const result = await searchCNPJ(cnpj)
      if (result) {
        form.setValue('razao_social', result.razao_social)
        form.setValue('nome_fantasia', result.nome_fantasia || '')
        form.setValue('endereco', `${result.logradouro}, ${result.numero} - ${result.bairro}`)
        form.setValue('cidade', result.municipio)
        form.setValue('uf', result.uf)
        form.setValue('telefone', result.telefone || '')
        form.setValue('email', result.email || '')
        form.setValue('situacao_receita', result.situacao)
        form.setValue('validado_receita', result.situacao === 'ATIVA')
        
        if (result.situacao !== 'ATIVA') {
          toast.warning('CNPJ com situação irregular', { description: result.situacao })
        } else {
          toast.success('CNPJ validado!', { description: result.razao_social })
        }
      } else {
        form.setValue('validado_receita', false)
        toast.error('CNPJ não encontrado na Receita Federal')
      }
    }
  }

  const onSubmitMedico = async (data: MedicoForm) => {
    if (!data.validado_cfm) {
      toast.error('Médico deve ser validado no CFM antes de salvar')
      return
    }
    console.log('Médico salvo:', data)
    toast.success('Médico cadastrado com sucesso!')
    setIsMedicoOpen(false)
    medicoForm.reset()
  }

  const onSubmitPJ = async (data: PJForm, tipo: 'hospital' | 'fornecedor') => {
    if (!data.validado_receita) {
      toast.error('CNPJ deve ser validado na Receita Federal antes de salvar')
      return
    }
    console.log(`${tipo} salvo:`, data)
    toast.success(`${tipo === 'hospital' ? 'Hospital' : 'Fornecedor'} cadastrado com sucesso!`)
    if (tipo === 'hospital') {
      setIsHospitalOpen(false)
      hospitalForm.reset()
    } else {
      setIsFornecedorOpen(false)
      fornecedorForm.reset()
    }
  }

  const onSubmitPaciente = async (data: PacienteForm) => {
    console.log('Paciente salvo:', data)
    toast.success('Paciente cadastrado com sucesso!')
    setIsPacienteOpen(false)
    pacienteForm.reset()
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-xl', isDark ? 'bg-violet-500/10' : 'bg-violet-100')}>
            <Sparkles className="w-8 h-8 text-violet-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Gestão de Cadastros
            </h1>
            <p className="text-slate-400">Auto-preenchimento obrigatório via APIs oficiais</p>
          </div>
        </div>
      </motion.div>

      {/* Alerta Importante */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-violet-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-violet-300">Regras de Cadastro ICARUS</p>
            <ul className="text-xs text-slate-400 mt-1 space-y-1">
              <li>• <strong>Médico:</strong> CRM + UF obrigatório - validação automática via CFM</li>
              <li>• <strong>Hospital/Fornecedor/Cliente:</strong> CNPJ obrigatório - validação automática via Receita Federal</li>
              <li>• <strong>Paciente:</strong> Cadastro mínimo para rastreabilidade ANVISA</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/70 p-1 rounded-xl">
          <TabsTrigger value="medicos" className="rounded-lg px-4 py-2 data-[state=active]:bg-violet-600">
            <Stethoscope className="w-4 h-4 mr-2" />
            Médicos
          </TabsTrigger>
          <TabsTrigger value="hospitais" className="rounded-lg px-4 py-2 data-[state=active]:bg-violet-600">
            <Building2 className="w-4 h-4 mr-2" />
            Hospitais
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="rounded-lg px-4 py-2 data-[state=active]:bg-violet-600">
            <Truck className="w-4 h-4 mr-2" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="pacientes" className="rounded-lg px-4 py-2 data-[state=active]:bg-violet-600">
            <Users className="w-4 h-4 mr-2" />
            Pacientes
          </TabsTrigger>
        </TabsList>

        {/* Barra de Ações */}
        <div className={cn('rounded-xl p-4 backdrop-blur-xl border border-slate-700/50', cardBg)}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/70 border-slate-600"
              />
            </div>
            <Button
              onClick={() => {
                if (activeTab === 'medicos') setIsMedicoOpen(true)
                else if (activeTab === 'hospitais') setIsHospitalOpen(true)
                else if (activeTab === 'fornecedores') setIsFornecedorOpen(true)
                else if (activeTab === 'pacientes') setIsPacienteOpen(true)
              }}
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600"
            >
              <Plus className="w-4 h-4" />
              Novo Cadastro
            </Button>
          </div>
        </div>

        {/* Tab Médicos */}
        <TabsContent value="medicos">
          <Card className={cn('backdrop-blur-xl border-slate-700/50', cardBg)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-cyan-400" />
                Médicos Cadastrados
                <Badge className="ml-2 bg-cyan-500/20 text-cyan-400">{mockMedicos.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Nome</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">CRM</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Especialidade</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">CFM</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMedicos.map((medico) => (
                      <tr key={medico.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-white">{medico.nome}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{medico.crm}/{medico.crm_uf}</td>
                        <td className="py-3 px-4 text-slate-300">{medico.especialidade}</td>
                        <td className="py-3 px-4">
                          {medico.validado_cfm ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Validado
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400">Pendente</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-400" /></Button>
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

        {/* Tab Hospitais */}
        <TabsContent value="hospitais">
          <Card className={cn('backdrop-blur-xl border-slate-700/50', cardBg)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Hospitais Cadastrados
                <Badge className="ml-2 bg-blue-500/20 text-blue-400">{mockHospitais.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Razão Social</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">CNPJ</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Cidade/UF</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Receita</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockHospitais.map((hospital) => (
                      <tr key={hospital.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-white">{hospital.razao_social}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{hospital.cnpj}</td>
                        <td className="py-3 px-4 text-slate-300">{hospital.cidade}/{hospital.uf}</td>
                        <td className="py-3 px-4">
                          {hospital.validado_receita ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Validado
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400">Pendente</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-400" /></Button>
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

        {/* Tab Fornecedores */}
        <TabsContent value="fornecedores">
          <Card className={cn('backdrop-blur-xl border-slate-700/50', cardBg)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Fornecedores Cadastrados
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">{mockFornecedores.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Razão Social</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">CNPJ</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Cidade/UF</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Receita</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockFornecedores.map((fornecedor) => (
                      <tr key={fornecedor.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-white">{fornecedor.razao_social}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{fornecedor.cnpj}</td>
                        <td className="py-3 px-4 text-slate-300">{fornecedor.cidade}/{fornecedor.uf}</td>
                        <td className="py-3 px-4">
                          {fornecedor.validado_receita ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Validado
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400">Pendente</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-400" /></Button>
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

        {/* Tab Pacientes */}
        <TabsContent value="pacientes">
          <Card className={cn('backdrop-blur-xl border-slate-700/50', cardBg)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                Pacientes Cadastrados
                <Badge className="ml-2 bg-violet-500/20 text-violet-400">0</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">Nenhum paciente cadastrado</p>
                <p className="text-xs text-slate-500 mt-2">
                  Cadastro mínimo para rastreabilidade ANVISA (Nome, CPF/CNPJ, Convênio, Hospital)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Cadastrar Médico */}
      <Dialog open={isMedicoOpen} onOpenChange={setIsMedicoOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Stethoscope className="w-5 h-5 text-cyan-400" />
              Cadastrar Médico
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              CRM + UF são obrigatórios. Os dados serão preenchidos automaticamente via API do CFM.
            </DialogDescription>
          </DialogHeader>

          <Form {...medicoForm}>
            <form onSubmit={medicoForm.handleSubmit(onSubmitMedico)} className="space-y-6">
              {/* CRM + UF */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={medicoForm.control}
                  name="crm_uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">UF *</FormLabel>
                      <Select onValueChange={(val) => { field.onChange(val); handleCRMBlur() }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800/70 border-slate-600 text-white">
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {EstadosBrasileiros.map((uf) => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicoForm.control}
                  name="crm"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-slate-300">Número CRM *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="123456"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                            onBlur={handleCRMBlur}
                            className="bg-slate-800/70 border-slate-600 text-white"
                          />
                          {cfmLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-cyan-500" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-slate-500">
                        Preencha CRM + UF para buscar automaticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status CFM */}
              {medicoForm.watch('situacao_cfm') && (
                <div className={cn(
                  'p-3 rounded-lg flex items-center gap-2',
                  medicoForm.watch('validado_cfm') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {medicoForm.watch('validado_cfm') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium">{medicoForm.watch('situacao_cfm')}</span>
                </div>
              )}

              {/* Campos auto-preenchidos */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={medicoForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicoForm.control}
                  name="especialidade"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-slate-300">Especialidade</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicoForm.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(21) 99999-9999" className="bg-slate-800/70 border-slate-600 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">E-mail</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="medico@email.com" className="bg-slate-800/70 border-slate-600 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsMedicoOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!medicoForm.watch('validado_cfm')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-50"
                >
                  Salvar Médico
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar Hospital */}
      <Dialog open={isHospitalOpen} onOpenChange={setIsHospitalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5 text-blue-400" />
              Cadastrar Hospital
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              CNPJ obrigatório. Os dados serão preenchidos automaticamente via API da Receita Federal.
            </DialogDescription>
          </DialogHeader>

          <Form {...hospitalForm}>
            <form onSubmit={hospitalForm.handleSubmit((data) => onSubmitPJ(data, 'hospital'))} className="space-y-6">
              {/* CNPJ */}
              <FormField
                control={hospitalForm.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">CNPJ *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="00.000.000/0001-00"
                          {...field}
                          onBlur={() => handleCNPJBlur(hospitalForm)}
                          className="bg-slate-800/70 border-slate-600 text-white"
                        />
                        {cnpjLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Digite o CNPJ e pressione Tab para buscar automaticamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Receita */}
              {hospitalForm.watch('situacao_receita') && (
                <div className={cn(
                  'p-3 rounded-lg flex items-center gap-2',
                  hospitalForm.watch('validado_receita') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {hospitalForm.watch('validado_receita') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium">Situação: {hospitalForm.watch('situacao_receita')}</span>
                </div>
              )}

              {/* Campos auto-preenchidos */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={hospitalForm.control}
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-slate-300">Razão Social</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={hospitalForm.control}
                  name="nome_fantasia"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-slate-300">Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={hospitalForm.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-slate-300">Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={hospitalForm.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={hospitalForm.control}
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">UF</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={hospitalForm.control}
                  name="contato_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Nome do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do responsável" className="bg-slate-800/70 border-slate-600 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={hospitalForm.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsHospitalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!hospitalForm.watch('validado_receita')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-50"
                >
                  Salvar Hospital
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar Fornecedor (similar ao Hospital) */}
      <Dialog open={isFornecedorOpen} onOpenChange={setIsFornecedorOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Truck className="w-5 h-5 text-emerald-400" />
              Cadastrar Fornecedor
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              CNPJ obrigatório. Os dados serão preenchidos automaticamente via API da Receita Federal.
            </DialogDescription>
          </DialogHeader>

          <Form {...fornecedorForm}>
            <form onSubmit={fornecedorForm.handleSubmit((data) => onSubmitPJ(data, 'fornecedor'))} className="space-y-6">
              <FormField
                control={fornecedorForm.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">CNPJ *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="00.000.000/0001-00"
                          {...field}
                          onBlur={() => handleCNPJBlur(fornecedorForm)}
                          className="bg-slate-800/70 border-slate-600 text-white"
                        />
                        {cnpjLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fornecedorForm.watch('situacao_receita') && (
                <div className={cn(
                  'p-3 rounded-lg flex items-center gap-2',
                  fornecedorForm.watch('validado_receita') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {fornecedorForm.watch('validado_receita') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium">Situação: {fornecedorForm.watch('situacao_receita')}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField control={fornecedorForm.control} name="razao_social" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-slate-300">Razão Social</FormLabel>
                    <FormControl><Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={fornecedorForm.control} name="cidade" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Cidade</FormLabel>
                    <FormControl><Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={fornecedorForm.control} name="uf" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">UF</FormLabel>
                    <FormControl><Input {...field} disabled className="bg-slate-800/50 border-slate-700 text-slate-300" /></FormControl>
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsFornecedorOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={!fornecedorForm.watch('validado_receita')} className="bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-50">
                  Salvar Fornecedor
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastrar Paciente */}
      <Dialog open={isPacienteOpen} onOpenChange={setIsPacienteOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-violet-400" />
              Cadastrar Paciente
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Cadastro mínimo para rastreabilidade ANVISA (RDC 59/751)
            </DialogDescription>
          </DialogHeader>

          <Form {...pacienteForm}>
            <form onSubmit={pacienteForm.handleSubmit(onSubmitPaciente)} className="space-y-4">
              <FormField control={pacienteForm.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Nome Completo *</FormLabel>
                  <FormControl><Input {...field} className="bg-slate-800/70 border-slate-600 text-white" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={pacienteForm.control} name="cpf" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">CPF</FormLabel>
                  <FormControl><Input {...field} placeholder="000.000.000-00" className="bg-slate-800/70 border-slate-600 text-white" /></FormControl>
                </FormItem>
              )} />
              <FormField control={pacienteForm.control} name="convenio" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Convênio</FormLabel>
                  <FormControl><Input {...field} placeholder="Unimed, Amil, SUS..." className="bg-slate-800/70 border-slate-600 text-white" /></FormControl>
                </FormItem>
              )} />
              <FormField control={pacienteForm.control} name="hospital" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Hospital</FormLabel>
                  <FormControl><Input {...field} placeholder="Hospital onde será atendido" className="bg-slate-800/70 border-slate-600 text-white" /></FormControl>
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsPacienteOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600">Salvar Paciente</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

