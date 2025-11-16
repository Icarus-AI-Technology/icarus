/**
 * ICARUS v5.0 - Prontuário Eletrônico (PEP)
 * Módulo central para registro de informações clínicas do paciente
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import {
  FileText,
  Activity,
  Users,
  AlertCircle,
  Plus,
  Search,
  Loader2,
} from 'lucide-react'
import { formatNumber, formatDateTime } from '@/lib/utils'

interface Prontuario {
  id: string
  paciente_id: string
  paciente_nome: string
  data_atendimento: string
  tipo_atendimento: 'ambulatorial' | 'internacao' | 'emergencia'
  medico_nome: string
  status: 'aberto' | 'fechado' | 'pendente'
  created_at: string
}

export function ProntuarioEletronico() {
  const { supabase } = useSupabase()
  const { chat, analyze } = useIcarusBrain()

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState('')

  // KPIs
  const [totalProntuarios, setTotalProntuarios] = useState(0)
  const [prontuariosAbertos, setProntuariosAbertos] = useState(0)
  const [atendimentosHoje, setAtendimentosHoje] = useState(0)
  const [prontuariosPendentes, setProntuariosPendentes] = useState(0)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')

  useEffect(() => {
    fetchProntuarios()
  }, [])

  async function fetchProntuarios() {
    setLoading(true)

    try {
      // Mock data
      const mockData: Prontuario[] = [
        {
          id: '1',
          paciente_id: 'P001',
          paciente_nome: 'João Silva Santos',
          data_atendimento: '2025-11-16T08:30:00',
          tipo_atendimento: 'ambulatorial',
          medico_nome: 'Dr. Carlos Mendes',
          status: 'aberto',
          created_at: '2025-11-16T08:30:00',
        },
        {
          id: '2',
          paciente_id: 'P002',
          paciente_nome: 'Maria Oliveira Costa',
          data_atendimento: '2025-11-16T09:15:00',
          tipo_atendimento: 'internacao',
          medico_nome: 'Dra. Ana Paula Lima',
          status: 'aberto',
          created_at: '2025-11-16T09:15:00',
        },
        {
          id: '3',
          paciente_id: 'P003',
          paciente_nome: 'Pedro Almeida Rocha',
          data_atendimento: '2025-11-16T10:00:00',
          tipo_atendimento: 'emergencia',
          medico_nome: 'Dr. Roberto Ferreira',
          status: 'fechado',
          created_at: '2025-11-16T10:00:00',
        },
        {
          id: '4',
          paciente_id: 'P004',
          paciente_nome: 'Ana Carolina Souza',
          data_atendimento: '2025-11-15T14:30:00',
          tipo_atendimento: 'ambulatorial',
          medico_nome: 'Dr. José Ricardo',
          status: 'pendente',
          created_at: '2025-11-15T14:30:00',
        },
        {
          id: '5',
          paciente_id: 'P005',
          paciente_nome: 'Carlos Eduardo Martins',
          data_atendimento: '2025-11-15T16:00:00',
          tipo_atendimento: 'internacao',
          medico_nome: 'Dra. Mariana Santos',
          status: 'fechado',
          created_at: '2025-11-15T16:00:00',
        },
      ]

      setProntuarios(mockData)
      calculateKPIs(mockData)
    } catch (error) {
      console.error('Erro ao buscar prontuários:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateKPIs(data: Prontuario[]) {
    const hoje = new Date().toISOString().split('T')[0]

    setTotalProntuarios(data.length)
    setProntuariosAbertos(data.filter((p) => p.status === 'aberto').length)
    setAtendimentosHoje(
      data.filter((p) => p.data_atendimento.startsWith(hoje)).length
    )
    setProntuariosPendentes(data.filter((p) => p.status === 'pendente').length)
  }

  async function handleNovoProntuario() {
    console.log('Abrir modal de novo prontuário')
  }

  async function handleAIAnalysis() {
    setAiLoading(true)

    try {
      const response = await chat(
        'Analise os prontuários abertos e identifique pacientes que requerem atenção prioritária ou follow-up.',
        { contexto: 'prontuario_eletronico' }
      )

      setAiInsights(
        response.resposta ||
          'Recomenda-se revisar prontuários pendentes e agendar follow-ups.'
      )
    } catch (error) {
      console.error('Erro ao analisar com IA:', error)
      setAiInsights(
        'Erro ao processar análise. Verifique a configuração da API.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  const prontuariosFiltrados = prontuarios.filter((prontuario) => {
    const matchesSearch =
      prontuario.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prontuario.paciente_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'todos' || prontuario.status === statusFilter

    const matchesTipo =
      tipoFilter === 'todos' || prontuario.tipo_atendimento === tipoFilter

    return matchesSearch && matchesStatus && matchesTipo
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-gray-600">Carregando prontuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Prontuários</p>
                <p className="text-2xl font-bold mt-1">
                  {formatNumber(totalProntuarios)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Últimos 7 dias</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Prontuários Abertos</p>
                <p className="text-2xl font-bold mt-1">
                  {formatNumber(prontuariosAbertos)}
                </p>
                <p className="text-xs text-blue-600 mt-1">Em atendimento</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Atendimentos Hoje</p>
                <p className="text-2xl font-bold mt-1">
                  {formatNumber(atendimentosHoje)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Até o momento</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold mt-1">
                  {formatNumber(prontuariosPendentes)}
                </p>
                <p className="text-xs text-red-600 mt-1">Requer assinatura</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="list">Prontuários</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="ai">IA - Análises</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral - Prontuário Eletrônico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="neu-soft">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Atendimentos por Tipo</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Ambulatorial</span>
                          <span className="font-semibold">
                            {
                              prontuarios.filter(
                                (p) => p.tipo_atendimento === 'ambulatorial'
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Internação</span>
                          <span className="font-semibold">
                            {
                              prontuarios.filter(
                                (p) => p.tipo_atendimento === 'internacao'
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Emergência</span>
                          <span className="font-semibold">
                            {
                              prontuarios.filter(
                                (p) => p.tipo_atendimento === 'emergencia'
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="neu-soft">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Abertos</span>
                          <span className="font-semibold text-green-600">
                            {prontuariosAbertos}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Fechados</span>
                          <span className="font-semibold">
                            {
                              prontuarios.filter((p) => p.status === 'fechado')
                                .length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pendentes</span>
                          <span className="font-semibold text-red-600">
                            {prontuariosPendentes}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Todos os Prontuários</h3>
            <Button onClick={handleNovoProntuario}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Prontuário
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ambulatorial">Ambulatorial</SelectItem>
                    <SelectItem value="internacao">Internação</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('todos')
                    setTipoFilter('todos')
                  }}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Paciente</th>
                      <th className="text-left py-3">Tipo</th>
                      <th className="text-left py-3">Médico</th>
                      <th className="text-left py-3">Data/Hora</th>
                      <th className="text-center py-3">Status</th>
                      <th className="text-center py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prontuariosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhum prontuário encontrado
                        </td>
                      </tr>
                    ) : (
                      prontuariosFiltrados.map((prontuario) => (
                        <tr key={prontuario.id} className="border-b hover:bg-muted/50">
                          <td className="py-3">
                            <div>
                              <p className="font-semibold">{prontuario.paciente_nome}</p>
                              <p className="text-xs text-gray-500">
                                ID: {prontuario.paciente_id}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 capitalize">
                            {prontuario.tipo_atendimento}
                          </td>
                          <td className="py-3">{prontuario.medico_nome}</td>
                          <td className="py-3">
                            {formatDateTime(prontuario.data_atendimento)}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                prontuario.status === 'aberto'
                                  ? 'bg-green-100 text-green-800'
                                  : prontuario.status === 'pendente'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {prontuario.status}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <Button size="sm" variant="outline">
                              Abrir
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pendentes */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prontuários Pendentes de Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prontuarios
                  .filter((p) => p.status === 'pendente')
                  .map((prontuario) => (
                    <Card key={prontuario.id} className="neu-soft">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">
                              {prontuario.paciente_nome}
                            </p>
                            <p className="text-sm text-gray-600">
                              {prontuario.medico_nome} •{' '}
                              {formatDateTime(prontuario.data_atendimento)}
                            </p>
                          </div>
                          <Button size="sm">Assinar</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {prontuarios.filter((p) => p.status === 'pendente').length ===
                  0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum prontuário pendente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Inteligente de Prontuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Use IA para identificar padrões, riscos e oportunidades de melhoria
                  no atendimento.
                </p>

                <Button
                  onClick={handleAIAnalysis}
                  disabled={aiLoading}
                  className="w-full"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando prontuários...
                    </>
                  ) : (
                    <>🤖 Análise Geral com IA</>
                  )}
                </Button>

                {aiInsights && (
                  <Card className="neu-pressed">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Insights da IA</h4>
                      <p className="text-sm text-gray-700">{aiInsights}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
