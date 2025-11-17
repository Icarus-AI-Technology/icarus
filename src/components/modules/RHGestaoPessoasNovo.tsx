/**
 * ICARUS v5.0 - Módulo: RH & Gestão de Pessoas
 * Categoria: Cadastros & Gestão
 * Descrição: Recursos humanos - Colaboradores, folha de pagamento, férias, ponto
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusColaborador = 'ativo' | 'ferias' | 'afastado' | 'desligado'
type Departamento = 'vendas' | 'logistica' | 'administrativo' | 'comercial' | 'ti'

interface Colaborador {
  id: string
  nome: string
  cargo: string
  departamento: Departamento
  status: StatusColaborador
  data_admissao: string
  salario: number
  email: string
  telefone: string
}

export default function RHGestaoPessoasNovo() {
  const [activeTab, setActiveTab] = useState('overview')

  const [colaboradores] = useState<Colaborador[]>([
    {
      id: 'col-001',
      nome: 'João Silva',
      cargo: 'Gerente Comercial',
      departamento: 'comercial',
      status: 'ativo',
      data_admissao: '2020-03-15',
      salario: 12000.00,
      email: 'joao.silva@empresa.com',
      telefone: '(11) 98765-4321'
    },
    {
      id: 'col-002',
      nome: 'Maria Santos',
      cargo: 'Analista de Vendas',
      departamento: 'vendas',
      status: 'ativo',
      data_admissao: '2021-06-20',
      salario: 6500.00,
      email: 'maria.santos@empresa.com',
      telefone: '(11) 98765-4322'
    },
    {
      id: 'col-003',
      nome: 'Carlos Oliveira',
      cargo: 'Coordenador de Logística',
      departamento: 'logistica',
      status: 'ferias',
      data_admissao: '2019-11-10',
      salario: 8500.00,
      email: 'carlos.oliveira@empresa.com',
      telefone: '(11) 98765-4323'
    }
  ])

  const colaboradores_ativos = colaboradores.filter(c => c.status === 'ativo').length
  const folha_pagamento_total = colaboradores.reduce((sum, c) => sum + c.salario, 0)
  const colaboradores_ferias = colaboradores.filter(c => c.status === 'ferias').length
  const headcount_total = colaboradores.length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">👥 RH & Gestão de Pessoas</h1>
          <p className="text-muted-foreground">Gestão de colaboradores e recursos humanos</p>
        </div>
        <Button>+ Novo Colaborador</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Colaboradores Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{colaboradores_ativos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Em atividade</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Headcount Total</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{headcount_total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Total cadastrado</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Folha Pagamento</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{formatCurrency(folha_pagamento_total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Mensal</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Em Férias</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{colaboradores_ferias}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Ausentes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { dept: 'Comercial', count: 1, salario_medio: 12000 },
                  { dept: 'Vendas', count: 1, salario_medio: 6500 },
                  { dept: 'Logística', count: 1, salario_medio: 8500 }
                ].map(item => (
                  <div key={item.dept} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{item.dept}</div>
                        <div className="text-xs text-gray-600">{item.count} colaborador(es)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(item.salario_medio)}</div>
                        <div className="text-xs text-gray-500">salário médio</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colaboradores" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Colaboradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {colaboradores.map(colab => (
                  <Card key={colab.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{colab.nome}</div>
                        <div className="text-sm text-gray-600">{colab.cargo}</div>
                        <div className="text-xs text-gray-500">{colab.departamento.toUpperCase()}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        colab.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        colab.status === 'ferias' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {colab.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Admissão</p>
                        <p className="font-bold">{colab.data_admissao}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Salário</p>
                        <p className="font-bold text-green-600">{formatCurrency(colab.salario)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Contato</p>
                        <p className="font-bold text-sm">{colab.telefone}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departamentos" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['Comercial', 'Vendas', 'Logística', 'Administrativo'].map(dept => (
              <Card key={dept} className="neomorphic p-4">
                <div className="font-bold text-lg mb-2">{dept}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Colaboradores:</span>
                    <span className="font-bold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salário Total:</span>
                    <span className="font-bold text-green-600">{formatCurrency(8500)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Relatórios de RH</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">📄 Folha de Pagamento</Button>
                <Button variant="outline" className="w-full justify-start">📅 Controle de Férias</Button>
                <Button variant="outline" className="w-full justify-start">⏰ Relatório de Ponto</Button>
                <Button variant="outline" className="w-full justify-start">📈 Turnover</Button>
                <Button variant="outline" className="w-full justify-start">💰 Custos por Departamento</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
