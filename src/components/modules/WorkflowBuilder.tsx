/**
 * ICARUS v5.0 - Módulo: Workflow Builder
 * Categoria: Analytics & Automação
 * Descrição: Construtor visual de workflows automatizados
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

type StatusWorkflow = 'ativo' | 'pausado' | 'rascunho'

interface Workflow {
  id: string
  nome: string
  descricao: string
  status: StatusWorkflow
  gatilho: string
  etapas: number
  execucoes_mes: number
  taxa_sucesso: number
  tempo_medio_execucao: number
}

export default function WorkflowBuilder() {
  const [activeTab, setActiveTab] = useState('overview')

  const [workflows] = useState<Workflow[]>([
    {
      id: 'wf-001',
      nome: 'Onboarding Cliente',
      descricao: 'Processo automatizado de cadastro de novo cliente',
      status: 'ativo',
      gatilho: 'Cliente criado',
      etapas: 8,
      execucoes_mes: 42,
      taxa_sucesso: 95.2,
      tempo_medio_execucao: 1250
    },
    {
      id: 'wf-002',
      nome: 'Aprovação de Pedido',
      descricao: 'Fluxo de aprovação baseado em valor e cliente',
      status: 'ativo',
      gatilho: 'Pedido criado',
      etapas: 5,
      execucoes_mes: 324,
      taxa_sucesso: 98.8,
      tempo_medio_execucao: 850
    }
  ])

  const workflowsAtivos = workflows.filter(w => w.status === 'ativo').length
  const execucoesTotal = workflows.reduce((sum, w) => sum + w.execucoes_mes, 0)
  const sucessoMedio = (workflows.reduce((sum, w) => sum + w.taxa_sucesso, 0) / workflows.length).toFixed(1)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🔄 Workflow Builder</h1>
          <p className="text-muted-foreground">Construtor visual de workflows automatizados</p>
        </div>
        <Button>+ Novo Workflow</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Workflows Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{workflowsAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Em execução</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Execuções (Mês)</CardDescription>
            <CardTitle className="text-3xl">{execucoesTotal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Processos executados</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Sucesso</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{sucessoMedio}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Média geral</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Workflows Mais Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflows
                  .sort((a, b) => b.execucoes_mes - a.execucoes_mes)
                  .map(wf => (
                    <div key={wf.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{wf.nome}</div>
                          <div className="text-xs text-gray-600">{wf.descricao}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{wf.execucoes_mes}</div>
                          <div className="text-xs text-gray-500">exec/mês</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflows.map(wf => (
                  <Card key={wf.id} className="p-4">
                    <div className="font-bold text-lg mb-2">{wf.nome}</div>
                    <div className="text-sm text-gray-600 mb-3">{wf.descricao}</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Etapas</p>
                        <p className="font-bold">{wf.etapas}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Execuções</p>
                        <p className="font-bold">{wf.execucoes_mes}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Sucesso</p>
                        <p className="font-bold text-green-600">{wf.taxa_sucesso}%</p>
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
