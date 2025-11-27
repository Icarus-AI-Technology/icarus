import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
  DialogTrigger,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  useCirurgias, 
  useCirurgiasStats,
  useCreateCirurgia,
  useUpdateCirurgia,
  useDeleteCirurgia,
  type CirurgiaFilters 
} from '@/hooks/queries/useCirurgias'
import { useHospitais, useMedicos } from '@/hooks/queries/useClientes'
import { useCirurgiasRealtime } from '@/hooks/useRealtimeSubscription'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  Calendar, Plus, Search, Filter, Edit, Trash2, Eye,
  Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'
import {
  cirurgiaSchema,
} from './schemas/cirurgia.schema'

type SurgeryStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

interface Surgery {
  id: string
  surgery_number: string
  /** @deprecated Use paciente_iniciais - LGPD compliance */
  patient_name?: string
  /** LGPD Compliant: Patient initials only (e.g., "J.S.") */
  paciente_iniciais: string
  /** Hospital's internal patient reference */
  paciente_ref_hospital?: string | null
  doctor_id: string
  doctor_name?: string
  hospital_id: string
  hospital_name?: string
  surgery_type: string
  scheduled_date: string
  scheduled_time: string
  status: SurgeryStatus
  notes: string | null
  estimated_value: number
  created_at: string
}

interface Doctor {
  id: string
  name: string
  specialty: string
}

interface Hospital {
  id: string
  name: string
  city: string
}

const _mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Carlos Silva', specialty: 'Cardiologia' },
  { id: '2', name: 'Dr. Ana Santos', specialty: 'Ortopedia' },
  { id: '3', name: 'Dr. Pedro Costa', specialty: 'Neurocirurgia' },
  { id: '4', name: 'Dra. Maria Oliveira', specialty: 'Oftalmologia' },
]

const _mockHospitals: Hospital[] = [
  { id: '1', name: 'Hospital Santa Casa', city: 'São Paulo' },
  { id: '2', name: 'Hospital Albert Einstein', city: 'São Paulo' },
  { id: '3', name: 'Hospital Sírio-Libanês', city: 'São Paulo' },
]

// Helper to map Supabase status to local status
function mapStatus(status: string): SurgeryStatus {
  const statusMap: Record<string, SurgeryStatus> = {
    'agendada': 'scheduled',
    'confirmada': 'confirmed',
    'em_andamento': 'in_progress',
    'realizada': 'completed',
    'cancelada': 'cancelled',
  }
  return statusMap[status] || 'scheduled'
}

// Helper to map local status to Supabase status
function mapStatusToSupabase(status: SurgeryStatus): string {
  const statusMap: Record<SurgeryStatus, string> = {
    'scheduled': 'agendada',
    'confirmed': 'confirmada',
    'in_progress': 'em_andamento',
    'completed': 'realizada',
    'cancelled': 'cancelada',
  }
  return statusMap[status]
}

// Mock data - LGPD Compliant (using initials only)
const _mockSurgeries: Surgery[] = [
  {
    id: '1',
    surgery_number: 'CIR-2025-001',
    paciente_iniciais: 'J.S.',
    paciente_ref_hospital: 'HSC-2025-001',
    doctor_id: '1',
    doctor_name: 'Dr. Carlos Silva',
    hospital_id: '1',
    hospital_name: 'Hospital Santa Casa',
    surgery_type: 'Angioplastia Coronária',
    scheduled_date: '2025-01-20',
    scheduled_time: '08:00',
    status: 'confirmed',
    notes: 'Monitorar pressão arterial a cada 15 minutos',
    estimated_value: 25000,
    created_at: '2025-01-15',
  },
  {
    id: '2',
    surgery_number: 'CIR-2025-002',
    paciente_iniciais: 'M.O.',
    paciente_ref_hospital: 'HSC-2025-002',
    doctor_id: '2',
    doctor_name: 'Dr. Ana Santos',
    hospital_id: '2',
    hospital_name: 'Hospital Albert Einstein',
    surgery_type: 'Artroplastia Total de Quadril',
    scheduled_date: '2025-01-22',
    scheduled_time: '10:00',
    status: 'scheduled',
    notes: 'Paciente com alergia a penicilina',
    estimated_value: 48000,
    created_at: '2025-01-16',
  },
  {
    id: '3',
    surgery_number: 'CIR-2025-003',
    paciente_iniciais: 'L.C.',
    paciente_ref_hospital: 'HSL-2025-003',
    doctor_id: '3',
    doctor_name: 'Dr. Pedro Costa',
    hospital_id: '3',
    hospital_name: 'Hospital Sírio-Libanês',
    surgery_type: 'Craniotomia para remoção de tumor',
    scheduled_date: '2025-01-25',
    scheduled_time: '07:30',
    status: 'confirmed',
    notes: 'Equipe de neurocirurgia completa confirmada',
    estimated_value: 125000,
    created_at: '2025-01-17',
  },
]

export function Cirurgias() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<SurgeryStatus | 'all'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null)

  // React Query hooks for data fetching
  const filters: CirurgiaFilters = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: debouncedSearch || undefined,
  }
  
  const { data: cirurgiasData, isLoading: cirurgiasLoading } = useCirurgias(filters)
  const { data: _stats } = useCirurgiasStats()
  const { data: hospitaisData } = useHospitais()
  const { data: medicosData } = useMedicos()
  
  // Mutations
  const createMutation = useCreateCirurgia()
  const updateMutation = useUpdateCirurgia()
  const deleteMutation = useDeleteCirurgia()
  
  // Enable real-time updates
  useCirurgiasRealtime()

  // Map data to local format for compatibility
  const surgeries: Surgery[] = (cirurgiasData || []).map(c => ({
    id: c.id,
    surgery_number: c.numero,
    paciente_iniciais: c.paciente_nome,
    paciente_ref_hospital: null,
    doctor_id: c.medico_id,
    doctor_name: c.medico?.nome,
    hospital_id: c.hospital_id,
    hospital_name: c.hospital?.nome,
    surgery_type: c.tipo_cirurgia,
    scheduled_date: c.data_cirurgia,
    scheduled_time: '08:00',
    status: mapStatus(c.status),
    notes: c.observacoes ?? null,
    estimated_value: c.valor_total,
    created_at: c.criado_em,
  }))

  const doctors: Doctor[] = (medicosData || []).map(m => ({
    id: m.id,
    name: m.nome,
    specialty: '',
  }))

  const hospitals: Hospital[] = (hospitaisData || []).map(h => ({
    id: h.id,
    name: h.nome,
    city: h.endereco?.cidade || '',
  }))

  const loading = cirurgiasLoading

  // Form state with Zod validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    paciente_iniciais: '',
    paciente_ref_hospital: '',
    doctor_id: '',
    hospital_id: '',
    surgery_type: '',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
    estimated_value: ''
  })

  // Validate form data with Zod schema
  const validateForm = (): boolean => {
    const result = cirurgiaSchema.safeParse({
      paciente_iniciais: formData.paciente_iniciais,
      paciente_ref_hospital: formData.paciente_ref_hospital || null,
      doctor_id: formData.doctor_id,
      hospital_id: formData.hospital_id,
      surgery_type: formData.surgery_type,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
      notes: formData.notes || null,
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        errors[field] = issue.message
      })
      setFormErrors(errors)
      return false
    }

    setFormErrors({})
    return true
  }

  const statusDistribution = [
    { status: 'Agendadas', count: 2, color: '#6366F1' },
    { status: 'Confirmadas', count: 3, color: '#10B981' },
    { status: 'Em Progresso', count: 1, color: '#F59E0B' },
    { status: 'Concluídas', count: 8, color: '#8B5CF6' },
  ]

  const monthlyTrend = [
    { month: 'Jul', cirurgias: 18 },
    { month: 'Ago', cirurgias: 22 },
    { month: 'Set', cirurgias: 20 },
    { month: 'Out', cirurgias: 25 },
    { month: 'Nov', cirurgias: 28 },
    { month: 'Dez', cirurgias: 24 },
  ]

  const handleCreate = async () => {
    // Validate form with Zod schema
    if (!validateForm()) {
      toast.error('Preencha todos os campos corretamente')
      return
    }

    const numero = `CIR-2025-${String(Date.now()).slice(-3)}`
    
    createMutation.mutate({
      numero,
      paciente_nome: formData.paciente_iniciais.toUpperCase(),
      medico_id: formData.doctor_id,
      hospital_id: formData.hospital_id,
      tipo_cirurgia: formData.surgery_type,
      data_cirurgia: formData.scheduled_date,
      valor_total: parseFloat(formData.estimated_value) || 0,
      observacoes: formData.notes || null,
      status: 'agendada',
    }, {
      onSuccess: () => {
        resetForm()
        setIsCreateDialogOpen(false)
      }
    })
  }

  const handleUpdate = async () => {
    if (!selectedSurgery) return

    // Validate form with Zod schema
    if (!validateForm()) {
      toast.error('Preencha todos os campos corretamente')
      return
    }

    updateMutation.mutate({
      id: selectedSurgery.id,
      paciente_nome: formData.paciente_iniciais.toUpperCase(),
      medico_id: formData.doctor_id,
      hospital_id: formData.hospital_id,
      tipo_cirurgia: formData.surgery_type,
      data_cirurgia: formData.scheduled_date,
      valor_total: parseFloat(formData.estimated_value) || 0,
      observacoes: formData.notes || null,
    }, {
      onSuccess: () => {
        resetForm()
        setIsEditDialogOpen(false)
        setSelectedSurgery(null)
      }
    })
  }

  const handleDelete = async (surgery: Surgery) => {
    if (!confirm(`Deseja realmente excluir a cirurgia ${surgery.surgery_number}?`)) {
      return
    }

    deleteMutation.mutate(surgery.id)
  }

  const handleStatusChange = async (surgery: Surgery, newStatus: SurgeryStatus) => {
    updateMutation.mutate({
      id: surgery.id,
      status: mapStatusToSupabase(newStatus) as 'agendada' | 'confirmada' | 'realizada' | 'cancelada',
    })
  }

  const openEditDialog = (surgery: Surgery) => {
    setSelectedSurgery(surgery)
    setFormData({
      paciente_iniciais: surgery.paciente_iniciais,
      paciente_ref_hospital: surgery.paciente_ref_hospital || '',
      doctor_id: surgery.doctor_id,
      hospital_id: surgery.hospital_id,
      surgery_type: surgery.surgery_type,
      scheduled_date: surgery.scheduled_date,
      scheduled_time: surgery.scheduled_time,
      notes: surgery.notes || '',
      estimated_value: String(surgery.estimated_value)
    })
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (surgery: Surgery) => {
    setSelectedSurgery(surgery)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      paciente_iniciais: '',
      paciente_ref_hospital: '',
      doctor_id: '',
      hospital_id: '',
      surgery_type: '',
      scheduled_date: '',
      scheduled_time: '',
      notes: '',
      estimated_value: ''
    })
    setFormErrors({})
  }

  const getStatusBadge = (status: SurgeryStatus) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="info">Agendada</Badge>
      case 'confirmed':
        return <Badge variant="success">Confirmada</Badge>
      case 'in_progress':
        return <Badge variant="warning">Em Progresso</Badge>
      case 'completed':
        return <Badge className="bg-purple-500">Concluída</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>
    }
  }

  const _getStatusIcon = (status: SurgeryStatus) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
    }
  }

  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(surgery => {
      const matchesSearch =
        surgery.paciente_iniciais.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        surgery.surgery_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        surgery.surgery_type.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (surgery.paciente_ref_hospital?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false)

      const matchesStatus = statusFilter === 'all' || surgery.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [surgeries, debouncedSearch, statusFilter])

  const localStats = {
    total: surgeries.length,
    scheduled: surgeries.filter(s => s.status === 'scheduled').length,
    confirmed: surgeries.filter(s => s.status === 'confirmed').length,
    inProgress: surgeries.filter(s => s.status === 'in_progress').length,
    completed: surgeries.filter(s => s.status === 'completed').length,
    totalValue: surgeries.reduce((sum, s) => sum + s.estimated_value, 0)
  }

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Cirurgias"
        subtitle="Gestão completa de procedimentos cirúrgicos"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cirurgias</h1>
          <p className="text-muted-foreground">
            Gestão completa de procedimentos cirúrgicos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Cirurgia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Cirurgia</DialogTitle>
              <DialogDescription>
                Preencha os dados do procedimento cirúrgico
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* LGPD Notice */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 text-sm">
                <strong>LGPD:</strong> Apenas iniciais do paciente. Exemplo: "J.S." para João Silva
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paciente_iniciais">Iniciais do Paciente * (LGPD)</Label>
                  <Input
                    id="paciente_iniciais"
                    value={formData.paciente_iniciais}
                    onChange={(e) => setFormData({ ...formData, paciente_iniciais: e.target.value.toUpperCase() })}
                    placeholder="Ex: J.S."
                    maxLength={10}
                    className={formErrors.paciente_iniciais ? 'border-red-500' : ''}
                  />
                  {formErrors.paciente_iniciais && (
                    <p className="text-sm text-red-500">{formErrors.paciente_iniciais}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paciente_ref_hospital">Ref. Hospital (opcional)</Label>
                  <Input
                    id="paciente_ref_hospital"
                    value={formData.paciente_ref_hospital}
                    onChange={(e) => setFormData({ ...formData, paciente_ref_hospital: e.target.value })}
                    placeholder="ID interno do hospital"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surgery_type">Tipo de Cirurgia *</Label>
                  <Input
                    id="surgery_type"
                    value={formData.surgery_type}
                    onChange={(e) => setFormData({ ...formData, surgery_type: e.target.value })}
                    placeholder="Ex: Angioplastia"
                    className={formErrors.surgery_type ? 'border-red-500' : ''}
                  />
                  {formErrors.surgery_type && (
                    <p className="text-sm text-red-500">{formErrors.surgery_type}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_value_create">Valor Estimado (R$)</Label>
                  <Input
                    id="estimated_value_create"
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor_id">Médico *</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital_id">Hospital *</Label>
                  <Select
                    value={formData.hospital_id}
                    onValueChange={(value) => setFormData({ ...formData, hospital_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name} - {hospital.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Data *</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Horário *</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_value">Valor Estimado</Label>
                  <Input
                    id="estimated_value"
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o procedimento"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Cadastrar Cirurgia
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Cirurgias
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {localStats.scheduled} agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{localStats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Prontas para realizar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Progresso
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{localStats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sendo realizadas agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(localStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {localStats.completed} concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366F1">
                  {statusDistribution.map((entry, index) => (
                    <rect key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendência Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cirurgias" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cirurgias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, número ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SurgeryStatus | 'all')}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredSurgeries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma cirurgia encontrada
              </div>
            ) : (
              filteredSurgeries.map((surgery) => (
                <div
                  key={surgery.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="font-medium">Paciente: {surgery.paciente_iniciais}</div>
                      <div className="text-sm text-muted-foreground">{surgery.surgery_number}</div>
                      {surgery.paciente_ref_hospital && (
                        <div className="text-xs text-muted-foreground">Ref: {surgery.paciente_ref_hospital}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm">{surgery.surgery_type}</div>
                      <div className="text-xs text-muted-foreground">{surgery.doctor_name}</div>
                    </div>
                    <div>
                      <div className="text-sm">{formatDate(surgery.scheduled_date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {surgery.scheduled_time} - {surgery.hospital_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(surgery.status)}
                      <span className="text-sm font-medium">{formatCurrency(surgery.estimated_value)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewDialog(surgery)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(surgery)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(surgery)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cirurgia</DialogTitle>
            <DialogDescription>
              Atualize os dados do procedimento cirúrgico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* LGPD Notice */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 text-sm">
              <strong>LGPD:</strong> Apenas iniciais do paciente. Exemplo: "J.S." para João Silva
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_paciente_iniciais">Iniciais do Paciente * (LGPD)</Label>
                <Input
                  id="edit_paciente_iniciais"
                  value={formData.paciente_iniciais}
                  onChange={(e) => setFormData({ ...formData, paciente_iniciais: e.target.value.toUpperCase() })}
                  maxLength={10}
                  className={formErrors.paciente_iniciais ? 'border-red-500' : ''}
                />
                {formErrors.paciente_iniciais && (
                  <p className="text-sm text-red-500">{formErrors.paciente_iniciais}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_paciente_ref_hospital">Ref. Hospital (opcional)</Label>
                <Input
                  id="edit_paciente_ref_hospital"
                  value={formData.paciente_ref_hospital}
                  onChange={(e) => setFormData({ ...formData, paciente_ref_hospital: e.target.value })}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_surgery_type">Tipo de Cirurgia *</Label>
                <Input
                  id="edit_surgery_type"
                  value={formData.surgery_type}
                  onChange={(e) => setFormData({ ...formData, surgery_type: e.target.value })}
                  className={formErrors.surgery_type ? 'border-red-500' : ''}
                />
                {formErrors.surgery_type && (
                  <p className="text-sm text-red-500">{formErrors.surgery_type}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_estimated_value_top">Valor Estimado (R$)</Label>
                <Input
                  id="edit_estimated_value_top"
                  type="number"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_doctor_id">Médico *</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_hospital_id">Hospital *</Label>
                <Select
                  value={formData.hospital_id}
                  onValueChange={(value) => setFormData({ ...formData, hospital_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_scheduled_date">Data *</Label>
                <Input
                  id="edit_scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_scheduled_time">Horário *</Label>
                <Input
                  id="edit_scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_estimated_value">Valor Estimado</Label>
                <Input
                  id="edit_estimated_value"
                  type="number"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Observações</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => {
              setIsEditDialogOpen(false)
              resetForm()
              setSelectedSurgery(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Cirurgia</DialogTitle>
            <DialogDescription>
              {selectedSurgery?.surgery_number}
            </DialogDescription>
          </DialogHeader>
          {selectedSurgery && (
            <div className="space-y-4 py-4">
              {/* LGPD Notice */}
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900 text-xs">
                LGPD: Apenas iniciais do paciente armazenadas
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Paciente (Iniciais)</Label>
                  <div className="text-lg font-medium">{selectedSurgery.paciente_iniciais}</div>
                  {selectedSurgery.paciente_ref_hospital && (
                    <div className="text-sm text-muted-foreground">
                      Ref: {selectedSurgery.paciente_ref_hospital}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSurgery.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo de Cirurgia</Label>
                  <div className="font-medium">{selectedSurgery.surgery_type}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Estimado</Label>
                  <div className="font-medium">{formatCurrency(selectedSurgery.estimated_value)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Médico</Label>
                  <div className="font-medium">{selectedSurgery.doctor_name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hospital</Label>
                  <div className="font-medium">{selectedSurgery.hospital_name}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <div className="font-medium">{formatDate(selectedSurgery.scheduled_date)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Horário</Label>
                  <div className="font-medium">{selectedSurgery.scheduled_time}</div>
                </div>
              </div>

              {selectedSurgery.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">{selectedSurgery.notes}</div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Label className="text-muted-foreground mb-3 block">Alterar Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedSurgery.status === 'scheduled' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'scheduled')}
                  >
                    Agendada
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'confirmed' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'confirmed')}
                  >
                    Confirmada
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'in_progress' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'in_progress')}
                  >
                    Em Progresso
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'completed' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'completed')}
                  >
                    Concluída
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'cancelled' ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'cancelled')}
                  >
                    Cancelada
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              setSelectedSurgery(null)
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
