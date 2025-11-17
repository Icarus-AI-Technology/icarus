/**
 * ICARUS v5.0 - Módulo: Notas de Compra
 * Categoria: Compras & Fornecedores
 * Descrição: Recebimento de mercadorias e gestão de NF de entrada
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

type StatusNF = 'pendente' | 'recebido_parcial' | 'recebido_total' | 'divergencia' | 'cancelada'

interface NotaFiscalCompra {
  id: number
  numero: string
  serie: number
  chave_acesso: string
  fornecedor: string
  data_emissao: string
  data_recebimento?: string
  valor_total: number
  status: StatusNF
  pedido_compra_numero?: string
  itens: ItemNF[]
  divergencias?: string[]
}

interface ItemNF {
  id: number
  produto: string
  quantidade_nf: number
  quantidade_recebida: number
  valor_unitario: number
  lote?: string
  validade?: string
  status: 'ok' | 'divergente' | 'pendente'
}

export default function NotasCompra() {
  const [activeTab, setActiveTab] = useState('overview')
  const [notas] = useState<NotaFiscalCompra[]>([
    {
      id: 1,
      numero: '123456',
      serie: 1,
      chave_acesso: '35251142332352000104550010001234561234567890',
      fornecedor: 'Medtronic Brasil',
      data_emissao: '2025-11-14',
      data_recebimento: '2025-11-16',
      valor_total: 654000,
      status: 'recebido_total',
      pedido_compra_numero: 'PC-2025-0001',
      itens: [
        {
          id: 1,
          produto: 'Prótese Total de Joelho',
          quantidade_nf: 10,
          quantidade_recebida: 10,
          valor_unitario: 42000,
          lote: 'LOT-20251114',
          validade: '2027-11-14',
          status: 'ok'
        },
        {
          id: 2,
          produto: 'Stent Coronariano',
          quantidade_nf: 20,
          quantidade_recebida: 20,
          valor_unitario: 11500,
          lote: 'LOT-20251113',
          validade: '2028-11-13',
          status: 'ok'
        }
      ]
    },
    {
      id: 2,
      numero: '789012',
      serie: 1,
      chave_acesso: '35251161569873000165550010007890121234567890',
      fornecedor: 'Stryker do Brasil',
      data_emissao: '2025-11-15',
      valor_total: 428000,
      status: 'pendente',
      pedido_compra_numero: 'PC-2025-0002',
      itens: [
        {
          id: 3,
          produto: 'Sistema Fixação Coluna',
          quantidade_nf: 5,
          quantidade_recebida: 0,
          valor_unitario: 85000,
          status: 'pendente'
        }
      ]
    },
    {
      id: 3,
      numero: '345678',
      serie: 1,
      chave_acesso: '35251142332352000104550010003456781234567890',
      fornecedor: 'Medtronic Brasil',
      data_emissao: '2025-11-12',
      data_recebimento: '2025-11-14',
      valor_total: 180000,
      status: 'divergencia',
      pedido_compra_numero: 'PC-2025-0003',
      itens: [
        {
          id: 4,
          produto: 'Marca-passo Dupla Câmara',
          quantidade_nf: 10,
          quantidade_recebida: 8,
          valor_unitario: 18000,
          lote: 'LOT-20251110',
          validade: '2027-11-10',
          status: 'divergente'
        }
      ],
      divergencias: ['Quantidade recebida menor que NF (8/10)', 'Embalagem danificada - 2 unidades']
    }
  ])

  const notasPendentes = notas.filter(n => n.status === 'pendente').length
  const valorTotalMes = notas.reduce((sum, n) => sum + n.valor_total, 0)
  const divergencias = notas.filter(n => n.status === 'divergencia').length

  const getBadgeColor = (status: StatusNF) => {
    switch (status) {
      case 'recebido_total': return 'bg-green-100 text-green-800 border-green-300'
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'divergencia': return 'bg-red-100 text-red-800 border-red-300'
      case 'recebido_parcial': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notas de Compra</h1>
          <p className="text-muted-foreground">Recebimento de mercadorias</p>
        </div>
        <Button>+ Registrar Recebimento</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total (Mês)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(valorTotalMes)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{notas.length} notas recebidas</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Pendentes Recebimento</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{notasPendentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600 font-semibold">
              {notasPendentes > 0 ? 'Aguardando conferência' : 'Tudo recebido'}
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Com Divergências</CardDescription>
            <CardTitle className="text-3xl text-red-600">{divergencias}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600 font-semibold">
              {divergencias > 0 ? 'Requer análise!' : 'Sem divergências'}
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Conformidade</CardDescription>
            <CardTitle className="text-3xl">
              {((notas.length - divergencias) / notas.length * 100).toFixed(0)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Notas sem problemas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes ({notasPendentes})</TabsTrigger>
          <TabsTrigger value="recebidas">Recebidas</TabsTrigger>
          <TabsTrigger value="divergencias">Divergências ({divergencias})</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📦 Últimas Notas Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notas.slice(0, 5).map(nota => (
                  <div key={nota.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">NF {nota.numero}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(nota.status)}`}>
                            {nota.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{nota.fornecedor}</p>
                        <p className="text-xs text-gray-500">Pedido: {nota.pedido_compra_numero}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(nota.valor_total)}</p>
                        <p className="text-xs text-gray-500">Emissão: {formatDate(nota.data_emissao)}</p>
                        {nota.data_recebimento && (
                          <p className="text-xs text-green-600">Recebido: {formatDate(nota.data_recebimento)}</p>
                        )}
                      </div>
                    </div>
                    {nota.divergencias && nota.divergencias.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-semibold text-red-900 mb-1">⚠️ Divergências:</p>
                        {nota.divergencias.map((div, idx) => (
                          <p key={idx} className="text-xs text-red-700">• {div}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PENDENTES */}
        <TabsContent value="pendentes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Notas Aguardando Recebimento</CardTitle>
            </CardHeader>
            <CardContent>
              {notas.filter(n => n.status === 'pendente').length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma nota pendente</div>
              ) : (
                <div className="space-y-4">
                  {notas.filter(n => n.status === 'pendente').map(nota => (
                    <Card key={nota.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-lg">NF {nota.numero}</div>
                            <div className="text-sm text-gray-600">{nota.fornecedor}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Chave: {nota.chave_acesso.match(/.{1,4}/g)?.join(' ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl">{formatCurrency(nota.valor_total)}</div>
                            <div className="text-xs text-gray-500">Emissão: {formatDate(nota.data_emissao)}</div>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <p className="text-xs font-semibold mb-2">Itens ({nota.itens.length})</p>
                          {nota.itens.map(item => (
                            <div key={item.id} className="text-sm flex justify-between py-1">
                              <span>{item.quantidade_nf}x {item.produto}</span>
                              <span className="font-semibold">{formatCurrency(item.valor_unitario * item.quantidade_nf)}</span>
                            </div>
                          ))}
                        </div>

                        <Button className="w-full">✓ Confirmar Recebimento</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RECEBIDAS */}
        <TabsContent value="recebidas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Notas Recebidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notas.filter(n => n.status === 'recebido_total' || n.status === 'recebido_parcial').map(nota => (
                  <Card key={nota.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="font-bold">NF {nota.numero}</div>
                        <div className="text-sm text-gray-600">{nota.fornecedor}</div>
                        <div className="text-xs text-gray-500 mt-1">Pedido: {nota.pedido_compra_numero}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Recebimento</p>
                        <p className="text-sm">{nota.data_recebimento ? formatDate(nota.data_recebimento) : '-'}</p>
                        <p className="text-xs text-gray-500 mt-1">Itens: {nota.itens.length}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(nota.valor_total)}</p>
                        <Button size="sm" variant="outline" className="mt-2">Ver Detalhes</Button>
                      </div>
                    </div>

                    {/* Itens com rastreabilidade */}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-semibold mb-2">Rastreabilidade ANVISA</p>
                      <div className="space-y-1">
                        {nota.itens.map(item => (
                          <div key={item.id} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="flex justify-between">
                              <span className="font-semibold">{item.produto}</span>
                              <span className={`px-2 py-0.5 rounded-full ${
                                item.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status.toUpperCase()}
                              </span>
                            </div>
                            {item.lote && (
                              <div className="text-gray-600 mt-1">
                                Lote: {item.lote} | Validade: {item.validade ? formatDate(item.validade) : '-'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: DIVERGÊNCIAS */}
        <TabsContent value="divergencias" className="space-y-4">
          <Card className="neomorphic border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">⚠️ Notas com Divergências</CardTitle>
              <CardDescription>Requerem análise e tratamento</CardDescription>
            </CardHeader>
            <CardContent>
              {notas.filter(n => n.status === 'divergencia').length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma divergência registrada</div>
              ) : (
                <div className="space-y-4">
                  {notas.filter(n => n.status === 'divergencia').map(nota => (
                    <Card key={nota.id} className="p-4 bg-red-50 border-red-300">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-lg text-red-900">NF {nota.numero}</div>
                            <div className="text-sm text-red-700">{nota.fornecedor}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl text-red-900">{formatCurrency(nota.valor_total)}</div>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded border border-red-300">
                          <p className="text-xs font-semibold text-red-900 mb-2">Divergências Identificadas:</p>
                          {nota.divergencias?.map((div, idx) => (
                            <p key={idx} className="text-sm text-red-800 mb-1">• {div}</p>
                          ))}
                        </div>

                        <div className="border-t pt-3">
                          <p className="text-xs font-semibold mb-2">Itens</p>
                          {nota.itens.map(item => (
                            <div key={item.id} className={`text-sm p-2 rounded mb-1 ${
                              item.status === 'divergente' ? 'bg-red-100 border border-red-300' : 'bg-white'
                            }`}>
                              <div className="flex justify-between">
                                <span>{item.produto}</span>
                                <span className="font-semibold">
                                  {item.quantidade_recebida}/{item.quantidade_nf} recebidos
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" className="flex-1">Solicitar Devolução</Button>
                          <Button size="sm" variant="outline" className="flex-1">Aceitar Divergência</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
