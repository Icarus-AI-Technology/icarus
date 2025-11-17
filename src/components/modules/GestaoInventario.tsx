/**
 * ICARUS v5.0 - Módulo: Gestão de Inventário
 * Categoria: Core Business
 * Descrição: Inventário cíclico e contagem física de estoque OPME
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusInventario = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
type TipoInventario = 'ciclico' | 'geral' | 'spot' | 'auditoria'
type StatusDivergencia = 'pendente' | 'analisada' | 'ajustada'

interface Inventario {
  id: string
  codigo: string
  tipo: TipoInventario
  status: StatusInventario
  descricao: string
  data_inicio: string
  data_conclusao?: string
  responsavel: string
  itens_total: number
  itens_contados: number
  divergencias: number
  valor_divergencia: number
  acuracidade: number
}

interface ItemInventario {
  id: string
  inventario_id: string
  produto_codigo: string
  produto_nome: string
  estoque_sistema: number
  estoque_fisico: number
  divergencia: number
  valor_unitario: number
  valor_divergencia: number
  status: StatusDivergencia
  observacao?: string
}

export default function GestaoInventario() {
  const [activeTab, setActiveTab] = useState('overview')

  const [inventarios] = useState<Inventario[]>([
    {
      id: 'inv-001',
      codigo: 'INV-2025-001',
      tipo: 'ciclico',
      status: 'concluido',
      descricao: 'Inventário Cíclico - Próteses Ortopédicas',
      data_inicio: '2025-11-10',
      data_conclusao: '2025-11-12',
      responsavel: 'João Silva',
      itens_total: 45,
      itens_contados: 45,
      divergencias: 3,
      valor_divergencia: 8500.00,
      acuracidade: 93.3
    },
    {
      id: 'inv-002',
      codigo: 'INV-2025-002',
      tipo: 'geral',
      status: 'em_andamento',
      descricao: 'Inventário Geral - Todos os Produtos',
      data_inicio: '2025-11-15',
      responsavel: 'Maria Santos',
      itens_total: 248,
      itens_contados: 156,
      divergencias: 8,
      valor_divergencia: 12300.00,
      acuracidade: 96.8
    },
    {
      id: 'inv-003',
      codigo: 'INV-2025-003',
      tipo: 'auditoria',
      status: 'planejado',
      descricao: 'Auditoria Externa - Certificação ISO',
      data_inicio: '2025-11-20',
      responsavel: 'Carlos Oliveira',
      itens_total: 180,
      itens_contados: 0,
      divergencias: 0,
      valor_divergencia: 0,
      acuracidade: 0
    }
  ])

  const [itensAmostra] = useState<ItemInventario[]>([
    {
      id: 'item-001',
      inventario_id: 'inv-001',
      produto_codigo: 'PRO-125',
      produto_nome: 'Prótese de Joelho Titanium',
      estoque_sistema: 15,
      estoque_fisico: 14,
      divergencia: -1,
      valor_unitario: 18500.00,
      valor_divergencia: -18500.00,
      status: 'ajustada',
      observacao: 'Produto danificado durante transporte'
    },
    {
      id: 'item-002',
      inventario_id: 'inv-001',
      produto_codigo: 'PRO-142',
      produto_nome: 'Placa de Fixação Cervical',
      estoque_sistema: 22,
      estoque_fisico: 25,
      divergencia: 3,
      valor_unitario: 3200.00,
      valor_divergencia: 9600.00,
      status: 'analisada',
      observacao: 'Recebimento não lançado no sistema'
    }
  ])

  const inventariosAtivos = inventarios.filter(i => i.status === 'em_andamento').length
  const acuracidadeMedia = inventarios
    .filter(i => i.acuracidade > 0)
    .reduce((sum, i) => sum + i.acuracidade, 0) /
    inventarios.filter(i => i.acuracidade > 0).length || 0
  const divergenciasTotal = inventarios.reduce((sum, i) => sum + i.divergencias, 0)
  const valorDivergenciaTotal = inventarios.reduce((sum, i) => sum + i.valor_divergencia, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📦 Gestão de Inventário</h1>
          <p className="text-muted-foreground">Inventário cíclico e contagem física de estoque</p>
        </div>
        <Button>+ Novo Inventário</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Inventários Ativos</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{inventariosAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Em andamento</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Acuracidade Média</CardDescription>
            <CardTitle className="text-3xl text-green-600">{acuracidadeMedia.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Meta: 95%</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Divergências</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{divergenciasTotal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Itens com divergência</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor Divergências</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(valorDivergenciaTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">A ajustar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventarios">Inventários</TabsTrigger>
          <TabsTrigger value="divergencias">Divergências</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Status dos Inventários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Planejados', valor: 1, cor: 'text-gray-600' },
                  { label: 'Em Andamento', valor: 1, cor: 'text-blue-600' },
                  { label: 'Concluídos', valor: 1, cor: 'text-green-600' },
                  { label: 'Cancelados', valor: 0, cor: 'text-red-600' }
                ].map(item => (
                  <div key={item.label} className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">{item.label}</div>
                    <div className={`text-2xl font-bold ${item.cor}`}>{item.valor}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Inventários Recentes</h4>
                {inventarios.slice(0, 2).map(inv => (
                  <div key={inv.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{inv.descricao}</div>
                        <div className="text-xs text-gray-600">
                          {inv.codigo} • {inv.responsavel}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        inv.status === 'concluido' ? 'bg-green-100 text-green-800' :
                        inv.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                        inv.status === 'planejado' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{inv.itens_contados}/{inv.itens_total} itens</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(inv.itens_contados / inv.itens_total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventarios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Inventários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventarios.map(inv => (
                  <Card key={inv.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{inv.codigo}</div>
                        <div className="text-sm text-gray-600">{inv.descricao}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Responsável: {inv.responsavel} • Tipo: {inv.tipo.toUpperCase()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        inv.status === 'concluido' ? 'bg-green-100 text-green-800' :
                        inv.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                        inv.status === 'planejado' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Itens</p>
                        <p className="font-bold">{inv.itens_contados}/{inv.itens_total}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Divergências</p>
                        <p className="font-bold text-yellow-600">{inv.divergencias}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Acuracidade</p>
                        <p className="font-bold text-green-600">{inv.acuracidade}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Valor Div.</p>
                        <p className="font-bold text-red-600">{formatCurrency(inv.valor_divergencia)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">📝 Ver Detalhes</Button>
                      <Button size="sm" variant="outline">📊 Relatório</Button>
                      {inv.status === 'em_andamento' && (
                        <Button size="sm" variant="default">▶️ Continuar</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergencias" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>⚠️ Divergências Encontradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itensAmostra.map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold">{item.produto_nome}</div>
                        <div className="text-xs text-gray-500 font-mono">{item.produto_codigo}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === 'ajustada' ? 'bg-green-100 text-green-800' :
                        item.status === 'analisada' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-sm mb-3">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Sistema</p>
                        <p className="font-bold">{item.estoque_sistema}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Físico</p>
                        <p className="font-bold">{item.estoque_fisico}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Divergência</p>
                        <p className={`font-bold ${item.divergencia < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.divergencia > 0 ? '+' : ''}{item.divergencia}
                        </p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Vlr. Unit.</p>
                        <p className="font-bold">{formatCurrency(item.valor_unitario)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Vlr. Div.</p>
                        <p className={`font-bold ${item.valor_divergencia < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(item.valor_divergencia))}
                        </p>
                      </div>
                    </div>

                    {item.observacao && (
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <span className="font-semibold">Obs:</span> {item.observacao}
                      </div>
                    )}

                    {item.status === 'pendente' && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline">✓ Analisar</Button>
                        <Button size="sm" variant="default">🔄 Ajustar Estoque</Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Relatórios e Análises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  📈 Evolução da Acuracidade
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📊 Divergências por Categoria
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💰 Impacto Financeiro das Divergências
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  👤 Performance por Responsável
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📅 Histórico de Inventários
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📄 Exportar para Excel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📑 Gerar PDF Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📋 Próximos Inventários Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="font-semibold">20/11/2025 - Auditoria Externa ISO</div>
                  <div className="text-xs text-gray-600">180 itens • Carlos Oliveira</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-semibold">25/11/2025 - Inventário Cíclico Materiais</div>
                  <div className="text-xs text-gray-600">92 itens • João Silva</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
