/**
 * ICARUS v5.0 - Módulo: Logística Avançada
 * Categoria: Operações & Logística
 * Descrição: Gestão de entregas e rastreamento
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatCurrency, formatDate } from '@/lib/utils'

type StatusEntrega = 'agendada' | 'coletada' | 'em_transito' | 'entregue' | 'falha' | 'devolvida'
type TipoEntrega = 'expressa' | 'normal' | 'agendada' | 'urgente'

interface Entrega {
  id: number
  numero_rastreio: string
  pedido_numero?: string
  nf_numero?: string
  cliente: string
  endereco: string
  cidade: string
  estado: string
  tipo: TipoEntrega
  status: StatusEntrega
  data_agendamento: string
  data_entrega_prevista: string
  data_entrega_real?: string
  transportadora: string
  valor_frete: number
  observacoes?: string
  eventos: EventoRastreio[]
}

interface EventoRastreio {
  data: string
  hora: string
  descricao: string
  local: string
}

export default function LogisticaAvancada() {
  const [activeTab, setActiveTab] = useState('overview')
  const [entregas] = useState<Entrega[]>([
    {
      id: 1,
      numero_rastreio: 'BR123456789SP',
      pedido_numero: 'PC-2025-0001',
      nf_numero: '123456',
      cliente: 'Hospital Sírio-Libanês',
      endereco: 'Rua Dona Adma Jafet, 91',
      cidade: 'São Paulo',
      estado: 'SP',
      tipo: 'expressa',
      status: 'entregue',
      data_agendamento: '2025-11-14',
      data_entrega_prevista: '2025-11-16',
      data_entrega_real: '2025-11-16',
      transportadora: 'Transportadora Rápida',
      valor_frete: 2500,
      eventos: [
        { data: '2025-11-14', hora: '09:00', descricao: 'Pedido coletado', local: 'São Paulo - SP' },
        { data: '2025-11-14', hora: '15:30', descricao: 'Em trânsito', local: 'São Paulo - SP' },
        { data: '2025-11-16', hora: '10:45', descricao: 'Entregue', local: 'São Paulo - SP' }
      ]
    },
    {
      id: 2,
      numero_rastreio: 'BR987654321SP',
      pedido_numero: 'PC-2025-0002',
      cliente: 'Hospital Albert Einstein',
      endereco: 'Av. Albert Einstein, 627',
      cidade: 'São Paulo',
      estado: 'SP',
      tipo: 'normal',
      status: 'em_transito',
      data_agendamento: '2025-11-15',
      data_entrega_prevista: '2025-11-18',
      transportadora: 'Transportadora Rápida',
      valor_frete: 1800,
      eventos: [
        { data: '2025-11-15', hora: '14:00', descricao: 'Pedido coletado', local: 'São Paulo - SP' },
        { data: '2025-11-16', hora: '08:00', descricao: 'Em trânsito', local: 'São Paulo - SP' }
      ]
    },
    {
      id: 3,
      numero_rastreio: 'BR555666777SP',
      pedido_numero: 'PC-2025-0004',
      cliente: 'Santa Casa SP',
      endereco: 'Rua Dr. Cesário Mota Jr, 112',
      cidade: 'São Paulo',
      estado: 'SP',
      tipo: 'urgente',
      status: 'agendada',
      data_agendamento: '2025-11-17',
      data_entrega_prevista: '2025-11-17',
      transportadora: 'Expresso Urgente',
      valor_frete: 5000,
      observacoes: 'Cirurgia urgente - Entregar até 17h',
      eventos: []
    }
  ])

  const entregasHoje = entregas.filter(e => e.data_entrega_prevista === '2025-11-16').length
  const emTransito = entregas.filter(e => e.status === 'em_transito').length
  const taxaEntregaPrazo = entregas.filter(e => e.status === 'entregue').length / entregas.length * 100

  const getBadgeColor = (status: StatusEntrega) => {
    switch (status) {
      case 'entregue': return 'bg-green-100 text-green-800 border-green-300'
      case 'em_transito': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'agendada': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'falha': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Logística Avançada</h1>
          <p className="text-muted-foreground">Gestão de entregas e rastreamento</p>
        </div>
        <Button>+ Agendar Entrega</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Entregas Hoje</CardDescription>
            <CardTitle className="text-3xl">{entregasHoje}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{entregas.length} total em andamento</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Em Trânsito</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{emTransito}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Em rota de entrega</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Entrega no Prazo</CardDescription>
            <CardTitle className="text-3xl text-green-600">{taxaEntregaPrazo.toFixed(0)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Meta: 95%</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Custo Total Frete</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(entregas.reduce((sum, e) => sum + e.valor_frete, 0))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entregas">Todas Entregas</TabsTrigger>
          <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📦 Entregas Prioritárias Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entregas.filter(e =>
                    e.data_entrega_prevista === '2025-11-16' || e.tipo === 'urgente'
                  ).map(entrega => (
                    <div key={entrega.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">{entrega.cliente}</div>
                          <div className="text-sm text-gray-600">{entrega.cidade}/{entrega.estado}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Rastreio: {entrega.numero_rastreio}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(entrega.status)}`}>
                          {entrega.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      {entrega.observacoes && (
                        <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-900">
                          ⚠️ {entrega.observacoes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🚚 Status Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['agendada', 'coletada', 'em_transito', 'entregue'] as StatusEntrega[]).map(status => {
                    const count = entregas.filter(e => e.status === status).length
                    return (
                      <div key={status} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{count}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(status)}`}>
                            {((count / entregas.length) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: ENTREGAS */}
        <TabsContent value="entregas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entregas.map(entrega => (
                  <Card key={entrega.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-bold">{entrega.cliente}</div>
                        <div className="text-sm text-gray-600">{entrega.endereco}</div>
                        <div className="text-xs text-gray-500">{entrega.cidade}/{entrega.estado}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rastreio</p>
                        <p className="font-mono text-sm">{entrega.numero_rastreio}</p>
                        <p className="text-xs text-gray-500 mt-1">NF: {entrega.nf_numero || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Previsão Entrega</p>
                        <p className="text-sm">{formatDate(entrega.data_entrega_prevista)}</p>
                        <p className="text-xs text-gray-500 mt-1">Frete: {formatCurrency(entrega.valor_frete)}</p>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(entrega.status)}`}>
                          {entrega.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <Button size="sm" className="w-full mt-2">Rastrear</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RASTREAMENTO */}
        <TabsContent value="rastreamento" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🔍 Rastreamento Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input placeholder="Digite o código de rastreio..." />
              </div>
              <div className="space-y-4">
                {entregas.filter(e => e.eventos.length > 0).map(entrega => (
                  <Card key={entrega.id} className="p-4">
                    <div className="mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg">{entrega.numero_rastreio}</div>
                          <div className="text-sm text-gray-600">{entrega.cliente}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(entrega.status)}`}>
                          {entrega.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-4 space-y-3">
                      {entrega.eventos.map((evento, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-6 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                          <div className="text-xs text-gray-500">{formatDate(evento.data)} - {evento.hora}</div>
                          <div className="text-sm font-semibold">{evento.descricao}</div>
                          <div className="text-xs text-gray-600">{evento.local}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Performance de Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Total Entregas</p>
                  <p className="text-3xl font-bold">{entregas.length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Entregas no Prazo</p>
                  <p className="text-3xl font-bold text-green-600">
                    {entregas.filter(e => e.status === 'entregue').length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Taxa Sucesso</p>
                  <p className="text-3xl font-bold">{taxaEntregaPrazo.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
