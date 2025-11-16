import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSupabase } from '@/hooks/useSupabase'
import { useDebounce } from '@/hooks/useDebounce'
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

type SurgeryStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

interface Surgery {
  id: string
  surgery_number: string
  patient_name: string
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

export function Cirurgias() {
  const { supabase, isConfigured } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [surgeries, setSurgeries] = useState<Surgery[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<SurgeryStatus | 'all'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    patient_name: '',
    doctor_id: '',
    hospital_id: '',
    surgery_type: '',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
    estimated_value: ''
  })

  // Mock data
  const mockDoctors: Doctor[] = [
    { id: '1', name: 'Dr. Carlos Silva', specialty: 'Cardiologia' },
    { id: '2', name: 'Dr. Ana Santos', specialty: 'Ortopedia' },
    { id: '3', name: 'Dr. Pedro Costa', specialty: 'Neurocirurgia' },
    { id: '4', name: 'Dra. Maria Oliveira', specialty: 'Oftalmologia' }
  ]

  const mockHospitals: Hospital[] = [
    { id: '1', name: 'Hospital Santa Casa', city: 'São Paulo' },
    { id: '2', name: 'Hospital Albert Einstein', city: 'São Paulo' },
    { id: '3', name: 'Hospital Sírio-Libanês', city: 'São Paulo' }
  ]

  const mockSurgeries: Surgery[] = [
    {
      id: '1',
      surgery_number: 'CIR-2025-001',
      patient_name: 'João da Silva',
      doctor_id: '1',
      doctor_name: 'Dr. Carlos Silva',
      hospital_id: '1',
      hospital_name: 'Hospital Santa Casa',
      surgery_type: 'Angioplastia Coronária',
      scheduled_date: '2025-01-20',
      scheduled_time: '08:00',
      status: 'confirmed',
      notes: 'Paciente em jejum de 12h',
      estimated_value: 35000,
      created_at: '2025-01-15T10:00:00'
    },
    {
      id: '2',
      surgery_number: 'CIR-2025-002',
      patient_name: 'Maria Santos',
      doctor_id: '2',
      doctor_name: 'Dr. Ana Santos',
      hospital_id: '2',
      hospital_name: 'Hospital Albert Einstein',
      surgery_type: 'Artroplastia de Quadril',
      scheduled_date: '2025-01-21',
      scheduled_time: '10:00',
      status: 'scheduled',
      notes: null,
      estimated_value: 45000,
      created_at: '2025-01-15T11:00:00'
    },
    {
      id: '3',
      surgery_number: 'CIR-2025-003',
      patient_name: 'Pedro Oliveira',
      doctor_id: '3',
      doctor_name: 'Dr. Pedro Costa',
      hospital_id: '3',
      hospital_name: 'Hospital Sírio-Libanês',
      surgery_type: 'Cranioplastia',
      scheduled_date: '2025-01-18',
      scheduled_time: '14:00',
      status: 'in_progress',
      notes: 'Cirurgia de alta complexidade',
      estimated_value: 65000,
      created_at: '2025-01-14T09:00:00'
    },
    {
      id: '4',
      surgery_number: 'CIR-2025-004',
      patient_name: 'Ana Costa',
      doctor_id: '1',
      doctor_name: 'Dr. Carlos Silva',
      hospital_id: '1',
      hospital_name: 'Hospital Santa Casa',
      surgery_type: 'Implante de Stent',
      scheduled_date: '2025-01-15',
      scheduled_time: '09:00',
      status: 'completed',
      notes: null,
      estimated_value: 28000,
      created_at: '2025-01-10T08:00:00'
    },
    {
      id: '5',
      surgery_number: 'CIR-2025-005',
      patient_name: 'Carlos Ferreira',
      doctor_id: '4',
      doctor_name: 'Dra. Maria Oliveira',
      hospital_id: '2',
      hospital_name: 'Hospital Albert Einstein',
      surgery_type: 'Facoemulsificação',
      scheduled_date: '2025-01-17',
      scheduled_time: '11:00',
      status: 'cancelled',
      notes: 'Cancelado pelo paciente',
      estimated_value: 15000,
      created_at: '2025-01-12T15:00:00'
    }
  ]

  // Analytics data
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

  useEffect(() => {
    loadData()
  }, [isConfigured])

  const loadData = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        setSurgeries(mockSurgeries)
        setDoctors(mockDoctors)
        setHospitals(mockHospitals)
        setLoading(false)
      }, 500)
      return
    }

    try {
      // Fetch surgeries with joins
      const { data: surgeriesData, error: surgeriesError } = await supabase
        .from('surgeries')
        .select(`
          *,
          doctor:doctors(id, name, specialty),
          hospital:hospitals(id, name, city)
        `)
        .order('scheduled_date', { ascending: false })

      if (surgeriesError) throw surgeriesError

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('name')

      if (doctorsError) throw doctorsError

      // Fetch hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('*')
        .order('name')

      if (hospitalsError) throw hospitalsError

      setSurgeries(surgeriesData || [])
      setDoctors(doctorsData || [])
      setHospitals(hospitalsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
      // Fallback to mock data
      setSurgeries(mockSurgeries)
      setDoctors(mockDoctors)
      setHospitals(mockHospitals)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.patient_name || !formData.doctor_id || !formData.hospital_id ||
        !formData.surgery_type || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!isConfigured) {
      // Mock create
      const newSurgery: Surgery = {
        id: String(surgeries.length + 1),
        surgery_number: `CIR-2025-${String(surgeries.length + 1).padStart(3, '0')}`,
        patient_name: formData.patient_name,
        doctor_id: formData.doctor_id,
        doctor_name: doctors.find(d => d.id === formData.doctor_id)?.name,
        hospital_id: formData.hospital_id,
        hospital_name: hospitals.find(h => h.id === formData.hospital_id)?.name,
        surgery_type: formData.surgery_type,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        status: 'scheduled',
        notes: formData.notes || null,
        estimated_value: parseFloat(formData.estimated_value) || 0,
        created_at: new Date().toISOString()
      }
      setSurgeries([newSurgery, ...surgeries])
      toast.success('Cirurgia cadastrada com sucesso!')
      resetForm()
      setIsCreateDialogOpen(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('surgeries')
        .insert([{
          patient_name: formData.patient_name,
          doctor_id: formData.doctor_id,
          hospital_id: formData.hospital_id,
          surgery_type: formData.surgery_type,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          notes: formData.notes || null,
          estimated_value: parseFloat(formData.estimated_value) || 0,
          status: 'scheduled'
        }])
        .select()

      if (error) throw error

      toast.success('Cirurgia cadastrada com sucesso!')
      loadData()
      resetForm()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating surgery:', error)
      toast.error('Erro ao cadastrar cirurgia')
    }
  }

  const handleUpdate = async () => {
    if (!selectedSurgery) return

    if (!isConfigured) {
      // Mock update
      const updatedSurgeries = surgeries.map(s =>
        s.id === selectedSurgery.id
          ? {
              ...s,
              patient_name: formData.patient_name,
              doctor_id: formData.doctor_id,
              doctor_name: doctors.find(d => d.id === formData.doctor_id)?.name,
              hospital_id: formData.hospital_id,
              hospital_name: hospitals.find(h => h.id === formData.hospital_id)?.name,
              surgery_type: formData.surgery_type,
              scheduled_date: formData.scheduled_date,
              scheduled_time: formData.scheduled_time,
              notes: formData.notes || null,
              estimated_value: parseFloat(formData.estimated_value) || 0
            }
          : s
      )
      setSurgeries(updatedSurgeries)
      toast.success('Cirurgia atualizada com sucesso!')
      resetForm()
      setIsEditDialogOpen(false)
      setSelectedSurgery(null)
      return
    }

    try {
      const { error } = await supabase
        .from('surgeries')
        .update({
          patient_name: formData.patient_name,
          doctor_id: formData.doctor_id,
          hospital_id: formData.hospital_id,
          surgery_type: formData.surgery_type,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          notes: formData.notes || null,
          estimated_value: parseFloat(formData.estimated_value) || 0
        })
        .eq('id', selectedSurgery.id)

      if (error) throw error

      toast.success('Cirurgia atualizada com sucesso!')
      loadData()
      resetForm()
      setIsEditDialogOpen(false)
      setSelectedSurgery(null)
    } catch (error) {
      console.error('Error updating surgery:', error)
      toast.error('Erro ao atualizar cirurgia')
    }
  }

  const handleDelete = async (surgery: Surgery) => {
    if (!confirm(`Deseja realmente excluir a cirurgia ${surgery.surgery_number}?`)) {
      return
    }

    if (!isConfigured) {
      // Mock delete
      setSurgeries(surgeries.filter(s => s.id !== surgery.id))
      toast.success('Cirurgia excluída com sucesso!')
      return
    }

    try {
      const { error } = await supabase
        .from('surgeries')
        .delete()
        .eq('id', surgery.id)

      if (error) throw error

      toast.success('Cirurgia excluída com sucesso!')
      loadData()
    } catch (error) {
      console.error('Error deleting surgery:', error)
      toast.error('Erro ao excluir cirurgia')
    }
  }

  const handleStatusChange = async (surgery: Surgery, newStatus: SurgeryStatus) => {
    if (!isConfigured) {
      // Mock status change
      const updatedSurgeries = surgeries.map(s =>
        s.id === surgery.id ? { ...s, status: newStatus } : s
      )
      setSurgeries(updatedSurgeries)
      toast.success('Status atualizado com sucesso!')
      return
    }

    try {
      const { error } = await supabase
        .from('surgeries')
        .update({ status: newStatus })
        .eq('id', surgery.id)

      if (error) throw error

      toast.success('Status atualizado com sucesso!')
      loadData()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const openEditDialog = (surgery: Surgery) => {
    setSelectedSurgery(surgery)
    setFormData({
      patient_name: surgery.patient_name,
      doctor_id: surgery.doctor_id,
      hospital_id: surgery.hospital_id,
      surgery_type: surgery.surgery_type,
      scheduled_date: surgery.scheduled_date,
      scheduled_time: surgery.scheduled_time,
      notes: surgery.notes || '',
      estimated_value: String(surgery.estimated_value)
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (surgery: Surgery) => {
    setSelectedSurgery(surgery)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      patient_name: '',
      doctor_id: '',
      hospital_id: '',
      surgery_type: '',
      scheduled_date: '',
      scheduled_time: '',
      notes: '',
      estimated_value: ''
    })
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

  const getStatusIcon = (status: SurgeryStatus) => {
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
        surgery.patient_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        surgery.surgery_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        surgery.surgery_type.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesStatus = statusFilter === 'all' || surgery.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [surgeries, debouncedSearch, statusFilter])

  const stats = {
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Nome do Paciente *</Label>
                  <Input
                    id="patient_name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surgery_type">Tipo de Cirurgia *</Label>
                  <Input
                    id="surgery_type"
                    value={formData.surgery_type}
                    onChange={(e) => setFormData({ ...formData, surgery_type: e.target.value })}
                    placeholder="Ex: Angioplastia"
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
              <Button variant="outline" onClick={() => {
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.scheduled} agendadas
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
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
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
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed} concluídas
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
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
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
                      <div className="font-medium">{surgery.patient_name}</div>
                      <div className="text-sm text-muted-foreground">{surgery.surgery_number}</div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_patient_name">Nome do Paciente *</Label>
                <Input
                  id="edit_patient_name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_surgery_type">Tipo de Cirurgia *</Label>
                <Input
                  id="edit_surgery_type"
                  value={formData.surgery_type}
                  onChange={(e) => setFormData({ ...formData, surgery_type: e.target.value })}
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
            <Button variant="outline" onClick={() => {
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Paciente</Label>
                  <div className="text-lg font-medium">{selectedSurgery.patient_name}</div>
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
                    variant={selectedSurgery.status === 'scheduled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'scheduled')}
                  >
                    Agendada
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'confirmed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'confirmed')}
                  >
                    Confirmada
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'in_progress')}
                  >
                    Em Progresso
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedSurgery, 'completed')}
                  >
                    Concluída
                  </Button>
                  <Button
                    variant={selectedSurgery.status === 'cancelled' ? 'destructive' : 'outline'}
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
