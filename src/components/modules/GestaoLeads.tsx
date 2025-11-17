/**
 * ICARUS v5.0 - Módulo: Gestão de Leads
 * Categoria: Analytics & Automação
 * Descrição: Pipeline de leads B2B - Qualificação e conversão
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusLead = 'novo' | 'qualificado' | 'em_negociacao' | 'ganho' | 'perdido'
type OrigemLead = 'website' | 'indicacao' | 'evento' | 'cold_call' | 'marketing'

interface Lead {
  id: string
  hospital_nome: string
  contato: string
  cargo: string
  origem: OrigemLead
  status: StatusLead
  score: number
  valor_estimado: number
  probabilidade: number
  data_entrada: string
  ultima_interacao: string
  proximo_passo: string
}

export default function GestaoLeads() {
  const [activeTab, setActiveTab] = useState('overview')

  const [leads] = useState<Lead[]>([
    {
      id: 'lead-001',
      hospital_nome: 'Hospital Regional Norte',
      contato: 'Dr. Carlos Silva',
      cargo: 'Diretor de Compras',
      origem: 'website',
      status: 'qualificado',
      score: 85,
      valor_estimado: 450000,
      probabilidade: 70,
      data_entrada: '2025-11-10',
      ultima_interacao: '2025-11-15',
      proximo_passo: 'Apresentar proposta comercial'
    },
    {
      id: 'lead-002',
      hospital_nome: 'Clínica Ortopédica Premium',
      contato: 'Dra. Maria Santos',
      cargo: 'Proprietária',
      origem: 'indicacao',
      status: 'em_negociacao',
      score: 92,
      valor_estimado: 280000,
      probabilidade: 85,
      data_entrada: '2025-11-05',
      ultima_interacao: '2025-11-16',
      proximo_passo: 'Negociar condições de pagamento'
    }
  ])

  const leadsTotal = leads.length
  const leadsQualificados = leads.filter(l => l.status === 'qualificado' || l.status === 'em_negociacao').length
  const valorPipeline = leads.reduce((sum, l) => sum + l.valor_estimado, 0)
  const taxaConversao = 68.5

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎯 Gestão de Leads</h1>
          <p className="text-muted-foreground">Pipeline de leads B2B - Qualificação e conversão</p>
        </div>
        <Button>+ Novo Lead</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Leads Totais</CardDescription>
            <CardTitle className="text-3xl">{leadsTotal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Pipeline ativo</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Leads Qualificados</CardDescription>
            <CardTitle className="text-3xl text-green-600">{leadsQualificados}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Prontos para venda</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor Pipeline</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(valorPipeline)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Oportunidades em aberto</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Conversão</CardDescription>
            <CardTitle className="text-3xl">{taxaConversao}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Todos os Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🏆 Leads de Alto Valor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads
                  .sort((a, b) => b.valor_estimado - a.valor_estimado)
                  .map(lead => (
                    <div key={lead.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{lead.hospital_nome}</div>
                          <div className="text-xs text-gray-600">
                            {lead.contato} • {lead.cargo}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">{formatCurrency(lead.valor_estimado)}</div>
                          <div className="text-xs text-gray-500">{lead.probabilidade}% prob.</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads.map(lead => (
                  <Card key={lead.id} className="p-4">
                    <div className="font-bold text-lg mb-2">{lead.hospital_nome}</div>
                    <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="font-bold text-green-600">{lead.score}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Valor</p>
                        <p className="font-bold">{formatCurrency(lead.valor_estimado)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Probabilidade</p>
                        <p className="font-bold text-blue-600">{lead.probabilidade}%</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Próximo passo:</span> {lead.proximo_passo}
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
