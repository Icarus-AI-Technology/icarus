/**
 * ICARUS v5.0 - Módulo: Manutenção Preventiva
 * Categoria: Operações & Logística
 * Descrição: Gestão de manutenção preventiva de equipamentos e materiais
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PlanoManutencao {
  id: string
  equipamento: string
  tipo: 'preventiva' | 'preditiva' | 'corretiva'
  status: 'agendada' | 'em_andamento' | 'concluida' | 'atrasada'
  proxima_manutencao: string
  responsavel: string
  criticidade: 'baixa' | 'media' | 'alta' | 'critica'
}

export default function ManutencaoPreventivaNovo() {
  const [activeTab, setActiveTab] = useState('overview')

  const [planos] = useState<PlanoManutencao[]>([
    { id: 'm1', equipamento: 'Autoclave 001', tipo: 'preventiva', status: 'agendada', proxima_manutencao: '2025-11-20', responsavel: 'João Silva', criticidade: 'alta' },
    { id: 'm2', equipamento: 'Geladeira OPME 002', tipo: 'preventiva', status: 'atrasada', proxima_manutencao: '2025-11-10', responsavel: 'Maria Santos', criticidade: 'critica' },
    { id: 'm3', equipamento: 'Sistema de Climatização', tipo: 'preditiva', status: 'concluida', proxima_manutencao: '2025-12-01', responsavel: 'Carlos Oliveira', criticidade: 'media' }
  ])

  const manutencoes_agendadas = planos.filter(p => p.status === 'agendada').length
  const manutencoes_atrasadas = planos.filter(p => p.status === 'atrasada').length
  const manutencoes_mes = planos.length
  const equipamentos_criticos = planos.filter(p => p.criticidade === 'critica' || p.criticidade === 'alta').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🔧 Manutenção Preventiva</h1>
          <p className="text-muted-foreground">Gestão de manutenção de equipamentos</p>
        </div>
        <Button>+ Agendar Manutenção</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Agendadas</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{manutencoes_agendadas}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-blue-600">Este mês</p></CardContent>
        </Card>
        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Atrasadas</CardDescription>
            <CardTitle className="text-3xl text-red-600">{manutencoes_atrasadas}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-red-600">⚠️ Atenção</p></CardContent>
        </Card>
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Total Mês</CardDescription>
            <CardTitle className="text-3xl text-green-600">{manutencoes_mes}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-green-600">Planejadas</p></CardContent>
        </Card>
        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Críticos</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{equipamentos_criticos}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-yellow-600">Alta prioridade</p></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="planos">Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader><CardTitle>📋 Próximas Manutenções</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {planos.filter(p => p.status === 'agendada' || p.status === 'atrasada').map(plano => (
                  <div key={plano.id} className={`p-3 border rounded-lg ${plano.status === 'atrasada' ? 'bg-red-50 border-red-200' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{plano.equipamento}</div>
                        <div className="text-xs text-gray-600">
                          {plano.tipo.toUpperCase()} • {plano.responsavel}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${plano.status === 'atrasada' ? 'text-red-600' : 'text-blue-600'}`}>
                          {plano.proxima_manutencao}
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          plano.criticidade === 'critica' ? 'bg-red-100 text-red-800' :
                          plano.criticidade === 'alta' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {plano.criticidade.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader><CardTitle>Todos os Planos</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {planos.map(plano => (
                  <Card key={plano.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{plano.equipamento}</div>
                        <div className="text-xs text-gray-600">{plano.tipo.toUpperCase()}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        plano.status === 'concluida' ? 'bg-green-100 text-green-800' :
                        plano.status === 'atrasada' ? 'bg-red-100 text-red-800' :
                        plano.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plano.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Próxima</p>
                        <p className="font-bold">{plano.proxima_manutencao}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Responsável</p>
                        <p className="font-bold text-sm">{plano.responsavel}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Criticidade</p>
                        <p className="font-bold">{plano.criticidade.toUpperCase()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
