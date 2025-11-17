/**
 * ICARUS v5.0 - Módulo: Gestão de Cadastros
 * Categoria: Cadastros & Gestão
 * Descrição: Cadastros gerais - Clientes, fornecedores, produtos, usuários
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TipoCadastro = 'clientes' | 'fornecedores' | 'produtos' | 'usuarios' | 'outros'
type StatusCadastro = 'ativo' | 'inativo' | 'pendente' | 'bloqueado'

interface EstatisticaCadastro {
  tipo: string
  total: number
  ativos: number
  inativos: number
  pendentes: number
  novos_mes: number
  alteracoes_mes: number
}

interface HistoricoAlteracao {
  id: string
  tipo_cadastro: string
  registro_id: string
  registro_nome: string
  campo_alterado: string
  valor_anterior: string
  valor_novo: string
  usuario: string
  data_hora: string
  ip_origem: string
}

export default function GestaoCadastros() {
  const [activeTab, setActiveTab] = useState('overview')

  const [estatisticas] = useState<EstatisticaCadastro[]>([
    {
      tipo: 'Clientes',
      total: 248,
      ativos: 232,
      inativos: 12,
      pendentes: 4,
      novos_mes: 18,
      alteracoes_mes: 45
    },
    {
      tipo: 'Fornecedores',
      total: 85,
      ativos: 78,
      inativos: 6,
      pendentes: 1,
      novos_mes: 3,
      alteracoes_mes: 12
    },
    {
      tipo: 'Produtos',
      total: 1248,
      ativos: 1156,
      inativos: 85,
      pendentes: 7,
      novos_mes: 42,
      alteracoes_mes: 128
    },
    {
      tipo: 'Usuários',
      total: 45,
      ativos: 42,
      inativos: 2,
      pendentes: 1,
      novos_mes: 2,
      alteracoes_mes: 8
    }
  ])

  const [historico] = useState<HistoricoAlteracao[]>([
    {
      id: 'hist-001',
      tipo_cadastro: 'Cliente',
      registro_id: 'CLI-0125',
      registro_nome: 'Hospital São Lucas',
      campo_alterado: 'Limite de Crédito',
      valor_anterior: 'R$ 150.000,00',
      valor_novo: 'R$ 200.000,00',
      usuario: 'João Silva',
      data_hora: '2025-11-16 14:35',
      ip_origem: '192.168.1.45'
    },
    {
      id: 'hist-002',
      tipo_cadastro: 'Produto',
      registro_id: 'PRO-0842',
      registro_nome: 'Prótese de Joelho Titanium',
      campo_alterado: 'Preço de Venda',
      valor_anterior: 'R$ 16.500,00',
      valor_novo: 'R$ 18.500,00',
      usuario: 'Maria Santos',
      data_hora: '2025-11-16 13:20',
      ip_origem: '192.168.1.32'
    },
    {
      id: 'hist-003',
      tipo_cadastro: 'Fornecedor',
      registro_id: 'FOR-0034',
      registro_nome: 'Medtronic Brasil',
      campo_alterado: 'Prazo de Pagamento',
      valor_anterior: '30 dias',
      valor_novo: '45 dias',
      usuario: 'Carlos Oliveira',
      data_hora: '2025-11-16 11:15',
      ip_origem: '192.168.1.28'
    }
  ])

  const total_cadastros = estatisticas.reduce((sum, e) => sum + e.total, 0)
  const cadastros_ativos = estatisticas.reduce((sum, e) => sum + e.ativos, 0)
  const novos_mes = estatisticas.reduce((sum, e) => sum + e.novos_mes, 0)
  const alteracoes_mes = estatisticas.reduce((sum, e) => sum + e.alteracoes_mes, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📝 Gestão de Cadastros</h1>
          <p className="text-muted-foreground">Cadastros gerais do sistema</p>
        </div>
        <Button>+ Novo Cadastro</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Total de Cadastros</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{total_cadastros.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Registros no sistema</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Cadastros Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{cadastros_ativos.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">{((cadastros_ativos/total_cadastros)*100).toFixed(1)}% do total</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Novos (Mês)</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{novos_mes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Alterações (Mês)</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{alteracoes_mes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Estatísticas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.map(stat => (
                  <div key={stat.tipo} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-lg">{stat.tipo}</div>
                        <div className="text-xs text-gray-600">
                          {stat.ativos} ativos • {stat.inativos} inativos
                          {stat.pendentes > 0 && ` • ${stat.pendentes} pendentes`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stat.total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">total</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">Novos (mês)</p>
                        <p className="font-bold text-green-600">+{stat.novos_mes}</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Alterações (mês)</p>
                        <p className="font-bold text-blue-600">{stat.alteracoes_mes}</p>
                      </div>
                    </div>

                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(stat.ativos / stat.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {estatisticas.map(stat => (
              <Card key={stat.tipo} className="neomorphic p-4">
                <div className="font-bold text-xl mb-3">{stat.tipo}</div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold">{stat.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ativos:</span>
                    <span className="font-bold text-green-600">{stat.ativos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Inativos:</span>
                    <span className="font-bold text-gray-500">{stat.inativos}</span>
                  </div>
                  {stat.pendentes > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pendentes:</span>
                      <span className="font-bold text-yellow-600">{stat.pendentes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    📝 Listar
                  </Button>
                  <Button size="sm" variant="default" className="flex-1">
                    + Novo
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📜 Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historico.map(hist => (
                  <Card key={hist.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold">{hist.tipo_cadastro}: {hist.registro_nome}</div>
                        <div className="text-xs text-gray-600">ID: {hist.registro_id}</div>
                      </div>
                      <div className="text-xs text-gray-500">{hist.data_hora}</div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <div className="font-semibold text-sm mb-2">Campo Alterado: {hist.campo_alterado}</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">Valor Anterior:</p>
                          <p className="font-mono text-red-600">{hist.valor_anterior}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Valor Novo:</p>
                          <p className="font-mono text-green-600">{hist.valor_novo}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Usuário: <strong>{hist.usuario}</strong></span>
                      <span>IP: <span className="font-mono">{hist.ip_origem}</span></span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🔍 Auditoria de Cadastros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Relatórios de auditoria e validação de cadastros.
                </p>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    📊 Relatório de Cadastros Duplicados
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    ⚠️ Cadastros com Dados Incompletos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🔒 Cadastros Bloqueados
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📅 Cadastros por Período
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    👤 Alterações por Usuário
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📄 Exportar Histórico Completo
                  </Button>
                </div>

                <Card className="p-4 bg-blue-50">
                  <h4 className="font-semibold mb-3">📈 Resumo de Qualidade dos Dados</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Cadastros Completos:</span>
                      <span className="font-bold text-green-600">95.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cadastros com Alertas:</span>
                      <span className="font-bold text-yellow-600">3.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cadastros com Erros:</span>
                      <span className="font-bold text-red-600">1.3%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
