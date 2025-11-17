/**
 * ICARUS v5.0 - Módulo: Integrações Avançadas
 * Categoria: Analytics & Automação
 * Descrição: Integrações com sistemas externos - ERP, CRM, e-commerce
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

type StatusIntegracao = 'ativa' | 'erro' | 'pausada'
type TipoIntegracao = 'erp' | 'crm' | 'ecommerce' | 'fiscal' | 'pagamento'

interface Integracao {
  id: string
  nome: string
  tipo: TipoIntegracao
  sistema: string
  status: StatusIntegracao
  sincronizacoes_dia: number
  ultima_sincronizacao: string
  taxa_sucesso: number
  registros_sincronizados: number
}

export default function IntegracoesAvancadas() {
  const [activeTab, setActiveTab] = useState('overview')

  const [integracoes] = useState<Integracao[]>([
    {
      id: 'int-001',
      nome: 'Integração Protheus',
      tipo: 'erp',
      sistema: 'TOTVS Protheus',
      status: 'ativa',
      sincronizacoes_dia: 24,
      ultima_sincronizacao: '2025-11-16 14:00',
      taxa_sucesso: 98.5,
      registros_sincronizados: 1248
    },
    {
      id: 'int-002',
      nome: 'Integração Salesforce',
      tipo: 'crm',
      sistema: 'Salesforce',
      status: 'ativa',
      sincronizacoes_dia: 48,
      ultima_sincronizacao: '2025-11-16 14:30',
      taxa_sucesso: 99.2,
      registros_sincronizados: 856
    }
  ])

  const integracoesAtivas = integracoes.filter(i => i.status === 'ativa').length
  const sincTotal = integracoes.reduce((sum, i) => sum + i.sincronizacoes_dia, 0)
  const sucessoMedio = (integracoes.reduce((sum, i) => sum + i.taxa_sucesso, 0) / integracoes.length).toFixed(1)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🔗 Integrações Avançadas</h1>
          <p className="text-muted-foreground">Integrações com sistemas externos</p>
        </div>
        <Button>+ Nova Integração</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Integrações Ativas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{integracoesAtivas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Sistemas conectados</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Sincronizações (Dia)</CardDescription>
            <CardTitle className="text-3xl">{sincTotal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Automáticas</p>
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
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Status das Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integracoes.map(integ => (
                  <div key={integ.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{integ.nome}</div>
                        <div className="text-xs text-gray-600">{integ.sistema}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{integ.taxa_sucesso}%</div>
                        <div className="text-xs text-gray-500">sucesso</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integracoes.map(integ => (
                  <Card key={integ.id} className="p-4">
                    <div className="font-bold text-lg mb-2">{integ.nome}</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Sinc/Dia</p>
                        <p className="font-bold">{integ.sincronizacoes_dia}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Taxa Sucesso</p>
                        <p className="font-bold text-green-600">{integ.taxa_sucesso}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Registros</p>
                        <p className="font-bold">{integ.registros_sincronizados.toLocaleString()}</p>
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
