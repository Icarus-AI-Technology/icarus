/**
 * ICARUS v5.0 - Módulo: API Gateway
 * Categoria: Analytics & Automação
 * Descrição: Gateway de APIs - Gestão de integrações e endpoints
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type StatusAPI = 'ativa' | 'inativa' | 'manutencao'
type TipoAutenticacao = 'api_key' | 'oauth' | 'jwt' | 'basic'

interface Endpoint {
  id: string
  nome: string
  caminho: string
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE'
  autenticacao: TipoAutenticacao
  status: StatusAPI
  requisicoes_mes: number
  taxa_erro: number
  tempo_resposta_medio: number
  ultima_chamada: string
}

export default function APIGateway() {
  const [activeTab, setActiveTab] = useState('overview')

  const [endpoints] = useState<Endpoint[]>([
    {
      id: 'api-001',
      nome: 'Listar Produtos',
      caminho: '/api/v1/produtos',
      metodo: 'GET',
      autenticacao: 'api_key',
      status: 'ativa',
      requisicoes_mes: 12450,
      taxa_erro: 0.5,
      tempo_resposta_medio: 145,
      ultima_chamada: '2025-11-16 14:35'
    },
    {
      id: 'api-002',
      nome: 'Criar Pedido',
      caminho: '/api/v1/pedidos',
      metodo: 'POST',
      autenticacao: 'oauth',
      status: 'ativa',
      requisicoes_mes: 3240,
      taxa_erro: 1.2,
      tempo_resposta_medio: 320,
      ultima_chamada: '2025-11-16 14:32'
    }
  ])

  const endpointsAtivos = endpoints.filter(e => e.status === 'ativa').length
  const requisicoesTotal = endpoints.reduce((sum, e) => sum + e.requisicoes_mes, 0)
  const tempoMedio = (endpoints.reduce((sum, e) => sum + e.tempo_resposta_medio, 0) / endpoints.length).toFixed(0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🔌 API Gateway</h1>
          <p className="text-muted-foreground">Gateway de APIs - Gestão de integrações</p>
        </div>
        <Button>+ Novo Endpoint</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Endpoints Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{endpointsAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">APIs disponíveis</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Requisições (Mês)</CardDescription>
            <CardTitle className="text-3xl">{requisicoesTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Chamadas de API</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Tempo Resposta Médio</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{tempoMedio}ms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Performance de APIs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpoints.map(endpoint => (
                  <div key={endpoint.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{endpoint.nome}</div>
                        <div className="text-xs text-gray-600">{endpoint.metodo} {endpoint.caminho}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{endpoint.requisicoes_mes.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">req/mês</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpoints.map(endpoint => (
                  <Card key={endpoint.id} className="p-4">
                    <div className="font-bold text-lg mb-2">{endpoint.nome}</div>
                    <div className="text-sm text-gray-600 mb-3 font-mono">
                      {endpoint.metodo} {endpoint.caminho}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Requisições</p>
                        <p className="font-bold">{endpoint.requisicoes_mes.toLocaleString()}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Taxa Erro</p>
                        <p className="font-bold text-red-600">{endpoint.taxa_erro}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Resposta</p>
                        <p className="font-bold text-blue-600">{endpoint.tempo_resposta_medio}ms</p>
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
