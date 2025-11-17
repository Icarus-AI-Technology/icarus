/**
 * ICARUS v5.0 - Módulo: Tabelas de Preços
 * Categoria: Core Business
 * Descrição: Gestão de tabelas de preços por cliente, região e tipo de contrato
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusTabela = 'ativa' | 'inativa' | 'em_revisao' | 'vencida'
type TipoTabela = 'padrao' | 'contrato' | 'promocional' | 'regional' | 'especial'
type TipoCliente = 'hospital_publico' | 'hospital_privado' | 'clinica' | 'operadora' | 'distribuidor'

interface TabelaPreco {
  id: string
  codigo: string
  nome: string
  tipo: TipoTabela
  tipo_cliente: TipoCliente
  status: StatusTabela
  vigencia_inicio: string
  vigencia_fim?: string
  produtos_count: number
  markup_medio: number
  desconto_maximo: number
  valor_minimo_pedido: number
  clientes_vinculados: number
}

interface ItemTabela {
  id: string
  tabela_id: string
  produto_codigo: string
  produto_nome: string
  preco_custo: number
  preco_tabela: number
  markup: number
  desconto_maximo: number
  preco_minimo: number
}

export default function TabelasPrecos() {
  const [activeTab, setActiveTab] = useState('overview')

  const [tabelas] = useState<TabelaPreco[]>([
    {
      id: 'tab-001',
      codigo: 'TAB-HOSP-PUB-2025',
      nome: 'Hospitais Públicos - 2025',
      tipo: 'contrato',
      tipo_cliente: 'hospital_publico',
      status: 'ativa',
      vigencia_inicio: '2025-01-01',
      vigencia_fim: '2025-12-31',
      produtos_count: 248,
      markup_medio: 18.5,
      desconto_maximo: 5.0,
      valor_minimo_pedido: 5000,
      clientes_vinculados: 12
    },
    {
      id: 'tab-002',
      codigo: 'TAB-PRIV-PREMIUM',
      nome: 'Hospitais Privados Premium',
      tipo: 'especial',
      tipo_cliente: 'hospital_privado',
      status: 'ativa',
      vigencia_inicio: '2025-01-01',
      produtos_count: 385,
      markup_medio: 28.3,
      desconto_maximo: 15.0,
      valor_minimo_pedido: 10000,
      clientes_vinculados: 8
    },
    {
      id: 'tab-003',
      codigo: 'TAB-PROMO-BF-2025',
      nome: 'Campanha Black Friday 2025',
      tipo: 'promocional',
      tipo_cliente: 'clinica',
      status: 'vencida',
      vigencia_inicio: '2025-11-01',
      vigencia_fim: '2025-11-30',
      produtos_count: 85,
      markup_medio: 12.8,
      desconto_maximo: 25.0,
      valor_minimo_pedido: 2000,
      clientes_vinculados: 45
    }
  ])

  const [itensAmostra] = useState<ItemTabela[]>([
    {
      id: 'item-001',
      tabela_id: 'tab-001',
      produto_codigo: 'PRO-125',
      produto_nome: 'Prótese de Joelho Titanium',
      preco_custo: 15600.00,
      preco_tabela: 18486.00,
      markup: 18.5,
      desconto_maximo: 5.0,
      preco_minimo: 17561.70
    },
    {
      id: 'item-002',
      tabela_id: 'tab-001',
      produto_codigo: 'PRO-142',
      produto_nome: 'Placa de Fixação Cervical',
      preco_custo: 2700.00,
      preco_tabela: 3199.50,
      markup: 18.5,
      desconto_maximo: 5.0,
      preco_minimo: 3039.53
    }
  ])

  const tabelasAtivas = tabelas.filter(t => t.status === 'ativa').length
  const produtosTotal = tabelas.reduce((sum, t) => sum + t.produtos_count, 0)
  const markupMedio = (tabelas.reduce((sum, t) => sum + t.markup_medio, 0) / tabelas.length).toFixed(1)
  const clientesVinculados = tabelas.reduce((sum, t) => sum + t.clientes_vinculados, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">💰 Tabelas de Preços</h1>
          <p className="text-muted-foreground">Gestão de preços por cliente, região e contrato</p>
        </div>
        <Button>+ Nova Tabela</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Tabelas Ativas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{tabelasAtivas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Vigentes</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Produtos Tabelados</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{produtosTotal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Total de itens</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Markup Médio</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{markupMedio}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Margem média</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Clientes Vinculados</CardDescription>
            <CardTitle className="text-3xl">{clientesVinculados}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total de vínculos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tabelas">Tabelas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="simulador">Simulador</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Tabelas por Tipo de Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { tipo: 'Hospital Público', tabelas: 1, markup: 18.5, clientes: 12 },
                  { tipo: 'Hospital Privado', tabelas: 1, markup: 28.3, clientes: 8 },
                  { tipo: 'Clínicas', tabelas: 1, markup: 12.8, clientes: 45 },
                  { tipo: 'Operadoras', tabelas: 0, markup: 0, clientes: 0 }
                ].map(item => (
                  <div key={item.tipo} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{item.tipo}</div>
                        <div className="text-xs text-gray-600">
                          {item.tabelas} tabela(s) • {item.clientes} cliente(s)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{item.markup}%</div>
                        <div className="text-xs text-gray-500">markup médio</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>⏰ Vigências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm">Vigentes</span>
                    <span className="font-bold text-green-600">2</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm">Em Revisão</span>
                    <span className="font-bold text-yellow-600">0</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-sm">Vencidas</span>
                    <span className="font-bold text-red-600">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📈 Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm">Markup Mínimo</span>
                    <span className="font-bold">12.8%</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm">Markup Médio</span>
                    <span className="font-bold text-green-600">{markupMedio}%</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-sm">Markup Máximo</span>
                    <span className="font-bold">28.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tabelas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Tabelas de Preços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tabelas.map(tab => (
                  <Card key={tab.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{tab.nome}</div>
                        <div className="text-sm text-gray-600">{tab.codigo}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tipo: {tab.tipo.replace('_', ' ').toUpperCase()} •
                          Cliente: {tab.tipo_cliente.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tab.status === 'ativa' ? 'bg-green-100 text-green-800' :
                        tab.status === 'em_revisao' ? 'bg-yellow-100 text-yellow-800' :
                        tab.status === 'vencida' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tab.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-sm mb-3">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Produtos</p>
                        <p className="font-bold">{tab.produtos_count}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Markup</p>
                        <p className="font-bold text-green-600">{tab.markup_medio}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Desc. Máx</p>
                        <p className="font-bold text-blue-600">{tab.desconto_maximo}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Pedido Mín.</p>
                        <p className="font-bold">{formatCurrency(tab.valor_minimo_pedido)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Clientes</p>
                        <p className="font-bold text-purple-600">{tab.clientes_vinculados}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">Vigência:</span> {tab.vigencia_inicio}
                      {tab.vigencia_fim && ` até ${tab.vigencia_fim}`}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">📝 Editar</Button>
                      <Button size="sm" variant="outline">👥 Clientes</Button>
                      <Button size="sm" variant="outline">📦 Produtos</Button>
                      <Button size="sm" variant="outline">📄 Exportar</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🏷️ Preços por Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itensAmostra.map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="font-bold mb-2">{item.produto_nome}</div>
                    <div className="text-xs text-gray-500 font-mono mb-3">{item.produto_codigo}</div>

                    <div className="grid grid-cols-5 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Custo</p>
                        <p className="font-bold">{formatCurrency(item.preco_custo)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Tabela</p>
                        <p className="font-bold text-blue-600">{formatCurrency(item.preco_tabela)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Markup</p>
                        <p className="font-bold text-green-600">{item.markup}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Desc. Máx</p>
                        <p className="font-bold text-yellow-600">{item.desconto_maximo}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Preço Mín.</p>
                        <p className="font-bold text-red-600">{formatCurrency(item.preco_minimo)}</p>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <span className="font-semibold">Margem:</span> {formatCurrency(item.preco_tabela - item.preco_custo)}
                      <span className="text-gray-600 ml-2">
                        ({((item.preco_tabela - item.preco_custo) / item.preco_custo * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </Card>
                ))}

                <Button className="w-full">+ Adicionar Produto à Tabela</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulador" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🧮 Simulador de Preços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Simule diferentes cenários de precificação e calcule markup/margem.
                </p>

                <Card className="p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold">Preço de Custo</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded mt-1"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold">Markup Desejado (%)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded mt-1"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Preço de Venda:</span>
                        <span className="font-bold text-lg text-blue-600">R$ 0,00</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Margem de Lucro:</span>
                        <span className="font-bold text-green-600">R$ 0,00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Margem %:</span>
                        <span className="font-bold text-purple-600">0.00%</span>
                      </div>
                    </div>

                    <Button className="w-full">Calcular</Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">💡 Dicas de Precificação</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Markup médio do mercado OPME: 15-30%</li>
                    <li>• Considere custos indiretos na precificação</li>
                    <li>• Margem mínima recomendada: 10%</li>
                    <li>• Analise a concorrência antes de definir preços</li>
                  </ul>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
