/**
 * ICARUS v5.0 - Módulo: Logística Transportadoras
 * Categoria: Operações & Logística
 * Descrição: Gestão integrada de transportadoras e fretes
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

interface Transportadora {
  id: string
  nome: string
  cnpj: string
  status: 'ativa' | 'inativa'
  entregas_mes: number
  prazo_medio: number
  custo_medio: number
  taxa_sucesso: number
}

export default function LogisticaTransportadorasIntegrado() {
  const [activeTab, setActiveTab] = useState('overview')

  const [transportadoras] = useState<Transportadora[]>([
    { id: 't1', nome: 'Transportadora Expressa', cnpj: '12.345.678/0001-90', status: 'ativa', entregas_mes: 142, prazo_medio: 2.5, custo_medio: 85.50, taxa_sucesso: 98.2 },
    { id: 't2', nome: 'Logística Rápida', cnpj: '98.765.432/0001-12', status: 'ativa', entregas_mes: 89, prazo_medio: 3.0, custo_medio: 72.30, taxa_sucesso: 96.5 }
  ])

  const transportadoras_ativas = transportadoras.filter(t => t.status === 'ativa').length
  const entregas_total = transportadoras.reduce((sum, t) => sum + t.entregas_mes, 0)
  const custo_medio = transportadoras.reduce((sum, t) => sum + t.custo_medio, 0) / transportadoras.length
  const taxa_sucesso_media = transportadoras.reduce((sum, t) => sum + t.taxa_sucesso, 0) / transportadoras.length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🚚 Logística Transportadoras</h1>
          <p className="text-muted-foreground">Gestão integrada de transportadoras</p>
        </div>
        <Button>+ Nova Transportadora</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Transportadoras Ativas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{transportadoras_ativas}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-green-600">Integradas</p></CardContent>
        </Card>
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Entregas (Mês)</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{entregas_total}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-blue-600">Total</p></CardContent>
        </Card>
        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Custo Médio</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{formatCurrency(custo_medio)}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-purple-600">Por entrega</p></CardContent>
        </Card>
        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Sucesso</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{taxa_sucesso_media.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-yellow-600">Média geral</p></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transportadoras">Transportadoras</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader><CardTitle>📊 Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transportadoras.map(t => (
                  <div key={t.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="font-semibold">{t.nome}</div>
                        <div className="text-xs text-gray-600">{t.entregas_mes} entregas/mês</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{t.taxa_sucesso}%</div>
                        <div className="text-xs">sucesso</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Prazo Médio</p>
                        <p className="font-bold">{t.prazo_medio} dias</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Custo Médio</p>
                        <p className="font-bold">{formatCurrency(t.custo_medio)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transportadoras" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader><CardTitle>Todas as Transportadoras</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transportadoras.map(t => (
                  <Card key={t.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{t.nome}</div>
                        <div className="text-xs text-gray-600">{t.cnpj}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Entregas</p>
                        <p className="font-bold">{t.entregas_mes}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Prazo</p>
                        <p className="font-bold">{t.prazo_medio}d</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Custo</p>
                        <p className="font-bold">{formatCurrency(t.custo_medio)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Sucesso</p>
                        <p className="font-bold text-green-600">{t.taxa_sucesso}%</p>
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
