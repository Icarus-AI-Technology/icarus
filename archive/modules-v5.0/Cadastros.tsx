import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  FileText, Users, Building2, MapPin, Stethoscope, Briefcase,
  Plus, Search, Edit, Trash2, Eye, CheckCircle2, XCircle, Database
} from 'lucide-react'
import { toast } from 'sonner'

type CadastroType =
  | 'fornecedores'
  | 'hospitais'
  | 'medicos'
  | 'especialidades'
  | 'cidades'
  | 'cargos'
  | 'setores'
  | 'centros_custo'

interface CadastroItem {
  id: string
  type: CadastroType
  code: string
  name: string
  description?: string
  active: boolean
  created_at: string
  updated_at: string
  // Type-specific fields
  cnpj?: string
  cpf?: string
  crm?: string
  specialty?: string
  state?: string
  city?: string
}

export function Cadastros() {
  // State
  const [loading, setLoading] = useState(true)
  const [cadastros, setCadastros] = useState<CadastroItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CadastroItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    type: 'fornecedores' as CadastroType,
    code: '',
    name: '',
    description: '',
    cnpj: '',
    cpf: '',
    crm: '',
    specialty: '',
    state: '',
    city: '',
    active: true,
  })

  const debouncedSearch = useDebounce(searchTerm, 300)

  // Load data
  useEffect(() => {
    loadCadastros()
  }, [])

  async function loadCadastros() {
    setLoading(true)

    try {
      // Simulate API call - replace with real Supabase query
      const mockData: CadastroItem[]  = [
        // Fornecedores
        {
          id: '1',
          type: 'fornecedores',
          code: 'FORN-001',
          name: 'Medtronic Brasil Ltda',
          description: 'Fornecedor de materiais especiais',
          cnpj: '12.345.678/0001-90',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: '2',
          type: 'fornecedores',
          code: 'FORN-002',
          name: 'Stryker do Brasil',
          description: 'Próteses ortopédicas',
          cnpj: '23.456.789/0001-01',
          active: true,
          created_at: '2024-01-05',
          updated_at: '2024-01-20'
        },
        // Hospitais
        {
          id: '3',
          type: 'hospitais',
          code: 'HOSP-001',
          name: 'Hospital Sírio-Libanês',
          description: 'Hospital de referência',
          cnpj: '34.567.890/0001-12',
          city: 'São Paulo',
          state: 'SP',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-10'
        },
        {
          id: '4',
          type: 'hospitais',
          code: 'HOSP-002',
          name: 'Hospital Albert Einstein',
          description: 'Centro de excelência médica',
          cnpj: '45.678.901/0001-23',
          city: 'São Paulo',
          state: 'SP',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-12'
        },
        // Médicos
        {
          id: '5',
          type: 'medicos',
          code: 'MED-001',
          name: 'Dr. João Silva',
          crm: '123456',
          specialty: 'Ortopedia',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: '6',
          type: 'medicos',
          code: 'MED-002',
          name: 'Dra. Maria Santos',
          crm: '234567',
          specialty: 'Cardiologia',
          active: true,
          created_at: '2024-01-02',
          updated_at: '2024-01-18'
        },
        // Especialidades
        {
          id: '7',
          type: 'especialidades',
          code: 'ESP-001',
          name: 'Ortopedia',
          description: 'Cirurgia ortopédica e traumatologia',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '8',
          type: 'especialidades',
          code: 'ESP-002',
          name: 'Cardiologia',
          description: 'Cirurgias cardíacas',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '9',
          type: 'especialidades',
          code: 'ESP-003',
          name: 'Neurocirurgia',
          description: 'Cirurgias neurológicas',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        // Cargos
        {
          id: '10',
          type: 'cargos',
          code: 'CARGO-001',
          name: 'Gerente Comercial',
          description: 'Responsável por vendas e relacionamento',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '11',
          type: 'cargos',
          code: 'CARGO-002',
          name: 'Representante Técnico',
          description: 'Suporte técnico em cirurgias',
          active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]

      setCadastros(mockData)
    } catch (error) {
      console.error('Erro ao carregar cadastros:', error)
      toast.error('Erro ao carregar cadastros')
    } finally {
      setLoading(false)
    }
  }

  // Filtered cadastros
  const filteredCadastros = useMemo(() => {
    return cadastros.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (item.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) || false)

      const matchesType = filterType === 'all' || item.type === filterType
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && item.active) ||
        (filterStatus === 'inactive' && !item.active)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [cadastros, debouncedSearch, filterType, filterStatus])

  // KPIs
  const totalCadastros = cadastros.length
  const activeCadastros = cadastros.filter(c => c.active).length
  const fornecedoresCount = cadastros.filter(c => c.type === 'fornecedores').length
  const hospitaisCount = cadastros.filter(c => c.type === 'hospitais').length
  const medicosCount = cadastros.filter(c => c.type === 'medicos').length

  // Helper functions
  const getTypeIcon = (type: CadastroType) => {
    const icons = {
      fornecedores: Briefcase,
      hospitais: Building2,
      medicos: Stethoscope,
      especialidades: FileText,
      cidades: MapPin,
      cargos: Users,
      setores: Database,
      centros_custo: FileText
    }
    return icons[type]
  }

  const getTypeLabel = (type: CadastroType) => {
    const labels = {
      fornecedores: 'Fornecedores',
      hospitais: 'Hospitais',
      medicos: 'Médicos',
      especialidades: 'Especialidades',
      cidades: 'Cidades',
      cargos: 'Cargos',
      setores: 'Setores',
      centros_custo: 'Centros de Custo'
    }
    return labels[type]
  }

  const getTypeColor = (type: CadastroType) => {
    const colors = {
      fornecedores: 'bg-blue-500',
      hospitais: 'bg-green-500',
      medicos: 'bg-purple-500',
      especialidades: 'bg-orange-500',
      cidades: 'bg-pink-500',
      cargos: 'bg-indigo-500',
      setores: 'bg-cyan-500',
      centros_custo: 'bg-teal-500'
    }
    return colors[type]
  }

  // Cadastros grouped by type
  const cadastrosByType = useMemo(() => {
    const grouped: Record<CadastroType, CadastroItem[]> = {
      fornecedores: [],
      hospitais: [],
      medicos: [],
      especialidades: [],
      cidades: [],
      cargos: [],
      setores: [],
      centros_custo: []
    }

    cadastros.forEach(item => {
      grouped[item.type].push(item)
    })

    return grouped
  }, [cadastros])

  if (loading) {
    return <ModuleLoadingSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            Cadastros Gerais
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão centralizada de cadastros auxiliares do sistema
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Cadastro
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cadastros</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCadastros}</div>
            <p className="text-xs text-muted-foreground">
              {activeCadastros} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedoresCount}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hospitais</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitaisCount}</div>
            <p className="text-xs text-muted-foreground">
              Clientes ativos
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicosCount}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(cadastrosByType).map(([type, items]) => {
              if (items.length === 0) return null
              const Icon = getTypeIcon(type as CadastroType)
              const color = getTypeColor(type as CadastroType)

              return (
                <Card key={type} className="neu-soft hover:neu-hard transition-all cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{getTypeLabel(type as CadastroType)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {items.length} cadastro{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {items.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">{item.name}</span>
                          {item.active ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{items.length - 3} mais
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Cadastros Tab */}
        <TabsContent value="cadastros" className="space-y-4">
          {/* Filters */}
          <Card className="neu-soft">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cadastro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="fornecedores">Fornecedores</SelectItem>
                    <SelectItem value="hospitais">Hospitais</SelectItem>
                    <SelectItem value="medicos">Médicos</SelectItem>
                    <SelectItem value="especialidades">Especialidades</SelectItem>
                    <SelectItem value="cargos">Cargos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cadastros List */}
          <div className="grid gap-4">
            {filteredCadastros.map((item) => {
              const Icon = getTypeIcon(item.type)

              return (
                <Card key={item.id} className="neu-soft hover:neu-hard transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant="outline">{item.code}</Badge>
                            <Badge>{getTypeLabel(item.type)}</Badge>
                            {item.active ? (
                              <Badge variant="success">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            {item.cnpj && (
                              <div>
                                <p className="text-xs text-muted-foreground">CNPJ</p>
                                <p className="text-sm font-medium">{item.cnpj}</p>
                              </div>
                            )}
                            {item.crm && (
                              <div>
                                <p className="text-xs text-muted-foreground">CRM</p>
                                <p className="text-sm font-medium">{item.crm}</p>
                              </div>
                            )}
                            {item.specialty && (
                              <div>
                                <p className="text-xs text-muted-foreground">Especialidade</p>
                                <p className="text-sm font-medium">{item.specialty}</p>
                              </div>
                            )}
                            {item.city && (
                              <div>
                                <p className="text-xs text-muted-foreground">Localização</p>
                                <p className="text-sm font-medium">{item.city}/{item.state}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground">Atualizado em</p>
                              <p className="text-sm font-medium">{formatDate(item.updated_at)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedItem(item)
                          setIsViewDialogOpen(true)
                        }} title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedItem(item)
                          setFormData({
                            type: item.type,
                            code: item.code,
                            name: item.name,
                            description: item.description || '',
                            cnpj: item.cnpj || '',
                            cpf: item.cpf || '',
                            crm: item.crm || '',
                            specialty: item.specialty || '',
                            state: item.state || '',
                            city: item.city || '',
                            active: item.active,
                          })
                          setIsEditDialogOpen(true)
                        }} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este cadastro?')) {
                            setCadastros(cadastros.filter(c => c.id !== item.id))
                            toast.success('Cadastro excluído com sucesso!')
                          }
                        }} title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cadastro</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo cadastro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cadastro *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as CadastroType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fornecedores">Fornecedor</SelectItem>
                    <SelectItem value="hospitais">Hospital</SelectItem>
                    <SelectItem value="medicos">Médico</SelectItem>
                    <SelectItem value="especialidades">Especialidade</SelectItem>
                    <SelectItem value="cidades">Cidade</SelectItem>
                    <SelectItem value="cargos">Cargo</SelectItem>
                    <SelectItem value="setores">Setor</SelectItem>
                    <SelectItem value="centros_custo">Centro de Custo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  placeholder="Código único"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição detalhada..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {(formData.type === 'fornecedores' || formData.type === 'hospitais') && (
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
            )}

            {formData.type === 'medicos' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM</Label>
                  <Input
                    id="crm"
                    placeholder="CRM/UF"
                    value={formData.crm}
                    onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    placeholder="Especialidade médica"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>
            )}

            {(formData.type === 'cidades' || formData.type === 'hospitais' || formData.type === 'fornecedores') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => {
              setIsCreateDialogOpen(false)
              setFormData({
                type: 'fornecedores',
                code: '',
                name: '',
                description: '',
                cnpj: '',
                cpf: '',
                crm: '',
                specialty: '',
                state: '',
                city: '',
                active: true,
              })
            }}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (!formData.code || !formData.name) {
                toast.error('Preencha os campos obrigatórios')
                return
              }
              const newItem: CadastroItem = {
                id: String(cadastros.length + 1),
                type: formData.type,
                code: formData.code,
                name: formData.name,
                description: formData.description || undefined,
                cnpj: formData.cnpj || undefined,
                cpf: formData.cpf || undefined,
                crm: formData.crm || undefined,
                specialty: formData.specialty || undefined,
                state: formData.state || undefined,
                city: formData.city || undefined,
                active: true,
                created_at: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0],
              }
              setCadastros([...cadastros, newItem])
              toast.success('Cadastro criado com sucesso!')
              setIsCreateDialogOpen(false)
              setFormData({
                type: 'fornecedores',
                code: '',
                name: '',
                description: '',
                cnpj: '',
                cpf: '',
                crm: '',
                specialty: '',
                state: '',
                city: '',
                active: true,
              })
            }}>
              Criar Cadastro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cadastro</DialogTitle>
            <DialogDescription>
              {selectedItem?.code} - {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de Cadastro</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as CadastroType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fornecedores">Fornecedor</SelectItem>
                    <SelectItem value="hospitais">Hospital</SelectItem>
                    <SelectItem value="medicos">Médico</SelectItem>
                    <SelectItem value="especialidades">Especialidade</SelectItem>
                    <SelectItem value="cidades">Cidade</SelectItem>
                    <SelectItem value="cargos">Cargo</SelectItem>
                    <SelectItem value="setores">Setor</SelectItem>
                    <SelectItem value="centros_custo">Centro de Custo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Código</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {(formData.type === 'fornecedores' || formData.type === 'hospitais') && (
              <div className="space-y-2">
                <Label htmlFor="edit-cnpj">CNPJ</Label>
                <Input
                  id="edit-cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
            )}

            {formData.type === 'medicos' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-crm">CRM</Label>
                  <Input
                    id="edit-crm"
                    value={formData.crm}
                    onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialty">Especialidade</Label>
                  <Input
                    id="edit-specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
                title="Status ativo"
              />
              <Label htmlFor="edit-active">Ativo</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => {
              setIsEditDialogOpen(false)
              setSelectedItem(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (!formData.name) {
                toast.error('Nome é obrigatório')
                return
              }
              setCadastros(cadastros.map(item => 
                item.id === selectedItem?.id 
                  ? {
                      ...item,
                      type: formData.type,
                      code: formData.code,
                      name: formData.name,
                      description: formData.description || undefined,
                      cnpj: formData.cnpj || undefined,
                      cpf: formData.cpf || undefined,
                      crm: formData.crm || undefined,
                      specialty: formData.specialty || undefined,
                      state: formData.state || undefined,
                      city: formData.city || undefined,
                      active: formData.active,
                      updated_at: new Date().toISOString().split('T')[0],
                    }
                  : item
              ))
              toast.success('Cadastro atualizado com sucesso!')
              setIsEditDialogOpen(false)
              setSelectedItem(null)
            }}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cadastro</DialogTitle>
            <DialogDescription>
              {selectedItem?.code}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">{selectedItem.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedItem.active ? 'success' : 'secondary'}>
                    {selectedItem.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedItem.name}</p>
                </div>
                {selectedItem.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="font-medium">{selectedItem.description}</p>
                  </div>
                )}
                {selectedItem.cnpj && (
                  <div>
                    <p className="text-sm text-muted-foreground">CNPJ</p>
                    <p className="font-medium">{selectedItem.cnpj}</p>
                  </div>
                )}
                {selectedItem.crm && (
                  <div>
                    <p className="text-sm text-muted-foreground">CRM</p>
                    <p className="font-medium">{selectedItem.crm}</p>
                  </div>
                )}
                {selectedItem.specialty && (
                  <div>
                    <p className="text-sm text-muted-foreground">Especialidade</p>
                    <p className="font-medium">{selectedItem.specialty}</p>
                  </div>
                )}
                {selectedItem.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-medium">{selectedItem.city}/{selectedItem.state}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">{formatDate(selectedItem.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atualizado em</p>
                  <p className="font-medium">{formatDate(selectedItem.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              setSelectedItem(null)
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
