/**
 * ICARUS v5.0 - Módulo: Campanhas Marketing
 * Categoria: Analytics & Automação
 * Descrição: Gestão de campanhas de marketing B2B para hospitais
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusCampanha = 'planejada' | 'ativa' | 'pausada' | 'finalizada'
type TipoCampanha = 'email' | 'whatsapp' | 'evento' | 'webinar' | 'conteudo'

interface Campanha {
  id: string
  nome: string
  tipo: TipoCampanha
  status: StatusCampanha
  objetivo: string
  publico_alvo: number
  alcance: number
  leads_gerados: number
  conversoes: number
  investimento: number
  roi: number
  data_inicio: string
  data_fim?: string
}

export default function CampanhasMarketing() {
  const [activeTab, setActiveTab] = useState('overview')

  const [campanhas] = useState<Campanha[]>([
    {
      id: 'camp-001',
      nome: 'Lançamento Prótese Titanium Pro',
      tipo: 'email',
      status: 'ativa',
      objetivo: 'Gerar leads para novo produto',
      publico_alvo: 150,
      alcance: 142,
      leads_gerados: 45,
      conversoes: 8,
      investimento: 12000,
      roi: 285,
      data_inicio: '2025-11-10'
    },
    {
      id: 'camp-002',
      nome: 'Webinar OPME - Boas Práticas',
      tipo: 'webinar',
      status: 'finalizada',
      objetivo: 'Educação e brand awareness',
      publico_alvo: 200,
      alcance: 178,
      leads_gerados: 82,
      conversoes: 12,
      investimento: 8500,
      roi: 420,
      data_inicio: '2025-10-15',
      data_fim: '2025-10-15'
    }
  ])

  const campanhasAtivas = campanhas.filter(c => c.status === 'ativa').length
  const leadsTotal = campanhas.reduce((sum, c) => sum + c.leads_gerados, 0)
  const roiMedio = (campanhas.reduce((sum, c) => sum + c.roi, 0) / campanhas.length).toFixed(0)
  const investimentoTotal = campanhas.reduce((sum, c) => sum + c.investimento, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📣 Campanhas Marketing</h1>
          <p className="text-muted-foreground">Gestão de campanhas B2B para hospitais</p>
        </div>
        <Button>+ Nova Campanha</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Campanhas Ativas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{campanhasAtivas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Em execução</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Leads Gerados</CardDescription>
            <CardTitle className="text-3xl">{leadsTotal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>ROI Médio</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{roiMedio}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Retorno sobre investimento</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Investimento Total</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(investimentoTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Performance de Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campanhas.map(camp => (
                  <div key={camp.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{camp.nome}</div>
                        <div className="text-xs text-gray-600">{camp.objetivo}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{camp.roi}%</div>
                        <div className="text-xs text-gray-500">ROI</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campanhas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campanhas.map(camp => (
                  <Card key={camp.id} className="p-4">
                    <div className="font-bold text-lg mb-2">{camp.nome}</div>
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Leads</p>
                        <p className="font-bold">{camp.leads_gerados}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Conversões</p>
                        <p className="font-bold text-green-600">{camp.conversoes}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">ROI</p>
                        <p className="font-bold text-blue-600">{camp.roi}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Investimento</p>
                        <p className="font-bold">{formatCurrency(camp.investimento)}</p>
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
