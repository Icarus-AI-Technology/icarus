/**
 * ICARUS v5.0 - Módulo: Gestão de Contratos
 * Categoria: Cadastros & Gestão
 * Descrição: Contratos com hospitais - Consignação, fornecimento, prestação de serviços
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusContrato = 'ativo' | 'vencido' | 'em_negociacao' | 'suspenso' | 'rescindido'
type TipoContrato = 'consignacao' | 'fornecimento' | 'prestacao_servicos' | 'comodato' | 'parceria'

interface Contrato {
  id: string
  numero: string
  cliente_nome: string
  tipo: TipoContrato
  status: StatusContrato
  objeto: string
  valor_mensal: number
  data_inicio: string
  data_termino: string
  dias_para_vencimento: number
  reajuste_proximo: string
  indice_reajuste: string
  responsavel: string
}

export default function GestaoContratosNovo() {
  const [activeTab, setActiveTab] = useState('overview')

  const [contratos] = useState<Contrato[]>([
    {
      id: 'ctr-001',
      numero: 'CTR-2024-0125',
      cliente_nome: 'Hospital São Lucas',
      tipo: 'consignacao',
      status: 'ativo',
      objeto: 'Fornecimento OPME Ortopedia em regime de consignação',
      valor_mensal: 285000.00,
      data_inicio: '2024-01-15',
      data_termino: '2025-01-14',
      dias_para_vencimento: 59,
      reajuste_proximo: '2025-01-15',
      indice_reajuste: 'IPCA',
      responsavel: 'João Silva'
    },
    {
      id: 'ctr-002',
      numero: 'CTR-2025-0042',
      cliente_nome: 'Clínica Ortopédica Premium',
      tipo: 'fornecimento',
      status: 'ativo',
      objeto: 'Fornecimento de materiais OPME - Venda direta',
      valor_mensal: 125000.00,
      data_inicio: '2025-06-01',
      data_termino: '2026-05-31',
      dias_para_vencimento: 196,
      reajuste_proximo: '2026-06-01',
      indice_reajuste: 'IGP-M',
      responsavel: 'Maria Santos'
    },
    {
      id: 'ctr-003',
      numero: 'CTR-2023-0089',
      cliente_nome: 'Hospital Municipal de Campinas',
      tipo: 'consignacao',
      status: 'vencido',
      objeto: 'Fornecimento OPME diversos em consignação',
      valor_mensal: 180000.00,
      data_inicio: '2023-08-01',
      data_termino: '2024-07-31',
      dias_para_vencimento: -108,
      reajuste_proximo: '-',
      indice_reajuste: 'INPC',
      responsavel: 'Carlos Oliveira'
    }
  ])

  const contratos_ativos = contratos.filter(c => c.status === 'ativo').length
  const contratos_vencer_60dias = contratos.filter(c => c.dias_para_vencimento > 0 && c.dias_para_vencimento <= 60).length
  const valor_mensal_total = contratos.filter(c => c.status === 'ativo').reduce((sum, c) => sum + c.valor_mensal, 0)
  const contratos_vencidos = contratos.filter(c => c.status === 'vencido').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📄 Gestão de Contratos</h1>
          <p className="text-muted-foreground">Contratos com hospitais e clínicas</p>
        </div>
        <Button>+ Novo Contrato</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Contratos Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{contratos_ativos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Vigentes</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Vencimento em 60 dias</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{contratos_vencer_60dias}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">⚠️ Atenção</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor Mensal Total</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(valor_mensal_total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Contratos ativos</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Vencidos</CardDescription>
            <CardTitle className="text-3xl text-red-600">{contratos_vencidos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">Renovação pendente</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="vencimentos">Vencimentos</TabsTrigger>
          <TabsTrigger value="reajustes">Reajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Contratos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { tipo: 'Consignação', count: 2, valor: 465000, percentual: 78.8 },
                  { tipo: 'Fornecimento', count: 1, valor: 125000, percentual: 21.2 }
                ].map(item => (
                  <div key={item.tipo} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold">{item.tipo}</div>
                        <div className="text-xs text-gray-600">{item.count} contrato(s)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{formatCurrency(item.valor)}</div>
                        <div className="text-xs text-gray-500">{item.percentual.toFixed(1)}% do total</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>⏰ Contratos Próximos do Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contratos
                  .filter(c => c.dias_para_vencimento > 0 && c.dias_para_vencimento <= 90)
                  .sort((a, b) => a.dias_para_vencimento - b.dias_para_vencimento)
                  .map(contrato => (
                    <div key={contrato.id} className="p-3 border rounded-lg bg-yellow-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{contrato.cliente_nome}</div>
                          <div className="text-xs text-gray-600">{contrato.numero}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            contrato.dias_para_vencimento <= 30 ? 'text-red-600' :
                            contrato.dias_para_vencimento <= 60 ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {contrato.dias_para_vencimento} dias
                          </div>
                          <div className="text-xs text-gray-500">{contrato.data_termino}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contratos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contratos.map(contrato => (
                  <Card key={contrato.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{contrato.numero}</div>
                        <div className="text-sm text-gray-600">{contrato.cliente_nome}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {contrato.tipo.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        contrato.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        contrato.status === 'vencido' ? 'bg-red-100 text-red-800' :
                        contrato.status === 'em_negociacao' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contrato.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-sm mb-3">{contrato.objeto}</div>

                    <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Valor Mensal</p>
                        <p className="font-bold text-green-600">{formatCurrency(contrato.valor_mensal)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Início</p>
                        <p className="font-bold">{contrato.data_inicio}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Término</p>
                        <p className="font-bold">{contrato.data_termino}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Responsável</p>
                        <p className="font-bold text-sm">{contrato.responsavel}</p>
                      </div>
                    </div>

                    {contrato.dias_para_vencimento > 0 && contrato.dias_para_vencimento <= 60 && (
                      <div className="p-2 bg-yellow-100 rounded text-sm mb-3">
                        ⚠️ <strong>Atenção:</strong> Vence em {contrato.dias_para_vencimento} dias
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">📄 Ver Contrato</Button>
                      <Button size="sm" variant="outline">📝 Editar</Button>
                      <Button size="sm" variant="outline">📊 Aditivos</Button>
                      {contrato.status === 'vencido' && (
                        <Button size="sm" variant="default">🔄 Renovar</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vencimentos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📅 Calendário de Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">⚠️ Vencidos</h4>
                  {contratos.filter(c => c.status === 'vencido').map(contrato => (
                    <div key={contrato.id} className="p-3 border-2 border-red-200 rounded-lg bg-red-50 mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{contrato.cliente_nome}</div>
                          <div className="text-xs text-gray-600">{contrato.numero}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-bold">Vencido há {Math.abs(contrato.dias_para_vencimento)} dias</div>
                          <div className="text-xs text-gray-600">{contrato.data_termino}</div>
                        </div>
                      </div>
                      <Button size="sm" className="mt-2 w-full" variant="destructive">
                        Renovar Urgente
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2">📅 Próximos 60 dias</h4>
                  {contratos
                    .filter(c => c.dias_para_vencimento > 0 && c.dias_para_vencimento <= 60)
                    .map(contrato => (
                      <div key={contrato.id} className="p-3 border-2 border-yellow-200 rounded-lg bg-yellow-50 mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{contrato.cliente_nome}</div>
                            <div className="text-xs text-gray-600">{contrato.numero}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-600 font-bold">{contrato.dias_para_vencimento} dias</div>
                            <div className="text-xs text-gray-600">{contrato.data_termino}</div>
                          </div>
                        </div>
                        <Button size="sm" className="mt-2 w-full" variant="outline">
                          Iniciar Renovação
                        </Button>
                      </div>
                    ))}
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">📅 Próximos 90 dias</h4>
                  {contratos
                    .filter(c => c.dias_para_vencimento > 60 && c.dias_para_vencimento <= 90)
                    .map(contrato => (
                      <div key={contrato.id} className="p-3 border rounded-lg mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{contrato.cliente_nome}</div>
                            <div className="text-xs text-gray-600">{contrato.numero}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-600 font-bold">{contrato.dias_para_vencimento} dias</div>
                            <div className="text-xs text-gray-600">{contrato.data_termino}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reajustes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📈 Reajustes Contratuais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contratos
                  .filter(c => c.status === 'ativo')
                  .map(contrato => (
                    <Card key={contrato.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold">{contrato.cliente_nome}</div>
                          <div className="text-sm text-gray-600">{contrato.numero}</div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {contrato.indice_reajuste}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Valor Atual</p>
                          <p className="font-bold">{formatCurrency(contrato.valor_mensal)}</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Próximo Reajuste</p>
                          <p className="font-bold">{contrato.reajuste_proximo}</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Índice</p>
                          <p className="font-bold text-blue-600">{contrato.indice_reajuste}</p>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="mt-3 w-full">
                        📊 Simular Reajuste
                      </Button>
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
