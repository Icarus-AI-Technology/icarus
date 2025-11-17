/**
 * ICARUS v5.0 - Módulo: Financeiro Avançado
 * Categoria: Financeiro & Compliance
 * Descrição: Gestão financeira completa - Fluxo de caixa, DRE, projeções
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { formatCurrency, formatDate } from '@/lib/utils'

type TipoMovimento = 'receita' | 'despesa'
type StatusMovimento = 'realizado' | 'projetado' | 'recorrente'
type CategoriaFinanceira = 'vendas' | 'compras' | 'operacional' | 'investimento' | 'financeiro'

interface MovimentoFinanceiro {
  id: number
  tipo: TipoMovimento
  categoria: CategoriaFinanceira
  descricao: string
  valor: number
  data: string
  status: StatusMovimento
  conta_bancaria: string
  centro_custo?: string
  tags?: string[]
}

interface ContaBancaria {
  id: number
  banco: string
  agencia: string
  conta: string
  tipo: 'corrente' | 'poupanca' | 'investimento'
  saldo_atual: number
  saldo_projetado: number
  limite_credito?: number
}

interface DRE {
  periodo: string
  receita_bruta: number
  deducoes: number
  receita_liquida: number
  cme: number // Custo Mercadoria Vendida
  lucro_bruto: number
  despesas_operacionais: number
  ebitda: number
  depreciacoes: number
  ebit: number
  resultado_financeiro: number
  lucro_liquido: number
  margem_liquida: number
}

interface FluxoCaixa {
  data: string
  entradas: number
  saidas: number
  saldo_dia: number
  saldo_acumulado: number
}

export default function FinanceiroAvancado() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('mes_atual')

  const [movimentos] = useState<MovimentoFinanceiro[]>([
    {
      id: 1,
      tipo: 'receita',
      categoria: 'vendas',
      descricao: 'Faturamento Hospital Sírio-Libanês - NF-123456',
      valor: 285000,
      data: '2025-11-15',
      status: 'realizado',
      conta_bancaria: 'Itaú - CC 12345-6',
      centro_custo: 'Vendas OPME',
      tags: ['hospital', 'opme']
    },
    {
      id: 2,
      tipo: 'despesa',
      categoria: 'compras',
      descricao: 'Compra MedTech Solutions - Próteses',
      valor: 180000,
      data: '2025-11-10',
      status: 'realizado',
      conta_bancaria: 'Bradesco - CC 98765-4',
      centro_custo: 'Compras OPME',
      tags: ['fornecedor', 'opme']
    },
    {
      id: 3,
      tipo: 'despesa',
      categoria: 'operacional',
      descricao: 'Folha de Pagamento - Novembro/2025',
      valor: 95000,
      data: '2025-11-30',
      status: 'projetado',
      conta_bancaria: 'Itaú - CC 12345-6',
      centro_custo: 'RH',
      tags: ['folha', 'recorrente']
    }
  ])

  const [contas] = useState<ContaBancaria[]>([
    {
      id: 1,
      banco: 'Itaú',
      agencia: '1234',
      conta: '12345-6',
      tipo: 'corrente',
      saldo_atual: 542000,
      saldo_projetado: 598000,
      limite_credito: 500000
    },
    {
      id: 2,
      banco: 'Bradesco',
      agencia: '9876',
      conta: '98765-4',
      tipo: 'corrente',
      saldo_atual: 328000,
      saldo_projetado: 305000
    },
    {
      id: 3,
      banco: 'Santander',
      agencia: '5555',
      conta: '55555-5',
      tipo: 'investimento',
      saldo_atual: 1250000,
      saldo_projetado: 1280000
    }
  ])

  const [dre] = useState<DRE>({
    periodo: 'Novembro/2025',
    receita_bruta: 1850000,
    deducoes: 185000,
    receita_liquida: 1665000,
    cme: 1020000,
    lucro_bruto: 645000,
    despesas_operacionais: 285000,
    ebitda: 360000,
    depreciacoes: 25000,
    ebit: 335000,
    resultado_financeiro: -12000,
    lucro_liquido: 323000,
    margem_liquida: 19.4
  })

  const [fluxoCaixa] = useState<FluxoCaixa[]>([
    { data: '2025-11-13', entradas: 125000, saidas: 80000, saldo_dia: 45000, saldo_acumulado: 542000 },
    { data: '2025-11-14', entradas: 98000, saidas: 120000, saldo_dia: -22000, saldo_acumulado: 520000 },
    { data: '2025-11-15', entradas: 285000, saidas: 45000, saldo_dia: 240000, saldo_acumulado: 760000 }
  ])

  // KPIs
  const saldoTotalContas = contas.reduce((sum, c) => sum + c.saldo_atual, 0)
  const saldoProjetado = contas.reduce((sum, c) => sum + c.saldo_projetado, 0)
  const receitasMes = movimentos
    .filter(m => m.tipo === 'receita' && m.status === 'realizado')
    .reduce((sum, m) => sum + m.valor, 0)
  const despesasMes = movimentos
    .filter(m => m.tipo === 'despesa' && m.status === 'realizado')
    .reduce((sum, m) => sum + m.valor, 0)

  const getTipoBadge = (tipo: TipoMovimento) => {
    return tipo === 'receita'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300'
  }

  const getStatusBadge = (status: StatusMovimento) => {
    switch (status) {
      case 'realizado':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'projetado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'recorrente':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financeiro Avançado</h1>
          <p className="text-muted-foreground">Gestão financeira completa - Fluxo de caixa, DRE, projeções</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes_atual">Mês Atual</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button>+ Novo Movimento</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Saldo Total</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(saldoTotalContas)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Todas as contas</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Receitas (Mês)</CardDescription>
            <CardTitle className="text-3xl text-green-600">{formatCurrency(receitasMes)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+18% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Despesas (Mês)</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(despesasMes)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">-8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Saldo Projetado (30d)</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(saldoProjetado)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">
              {saldoProjetado > saldoTotalContas ? '+' : ''}
              {formatCurrency(saldoProjetado - saldoTotalContas)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fluxo_caixa">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="contas">Contas Bancárias</TabsTrigger>
          <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>💰 Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receitas Realizadas</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(receitasMes)}</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Despesas Realizadas</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(despesasMes)}</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Resultado do Mês</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(receitasMes - despesasMes)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🏦 Contas Bancárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contas.map(conta => (
                    <div key={conta.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{conta.banco}</div>
                          <div className="text-xs text-gray-600">
                            Ag: {conta.agencia} • Conta: {conta.conta}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 capitalize">{conta.tipo}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(conta.saldo_atual)}</div>
                          {conta.limite_credito && (
                            <div className="text-xs text-gray-500">Limite: {formatCurrency(conta.limite_credito)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Indicadores-Chave (DRE)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Receita Líquida</p>
                  <p className="text-2xl font-bold">{formatCurrency(dre.receita_liquida)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">EBITDA</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(dre.ebitda)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Margem: {((dre.ebitda / dre.receita_liquida) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(dre.lucro_liquido)}</p>
                  <p className="text-xs text-gray-500 mt-1">Margem: {dre.margem_liquida}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Lucro Bruto</p>
                  <p className="text-2xl font-bold">{formatCurrency(dre.lucro_bruto)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Margem: {((dre.lucro_bruto / dre.receita_liquida) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: FLUXO DE CAIXA */}
        <TabsContent value="fluxo_caixa" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📈 Fluxo de Caixa Diário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fluxoCaixa.map((fluxo, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="text-sm font-semibold">{formatDate(fluxo.data)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Entradas</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(fluxo.entradas)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Saídas</p>
                        <p className="text-sm font-semibold text-red-600">{formatCurrency(fluxo.saidas)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Saldo do Dia</p>
                        <p
                          className={`text-sm font-semibold ${fluxo.saldo_dia >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(fluxo.saldo_dia)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Saldo Acumulado</p>
                        <p className="text-lg font-bold">{formatCurrency(fluxo.saldo_acumulado)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: DRE */}
        <TabsContent value="dre" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Demonstrativo de Resultados (DRE)</CardTitle>
              <CardDescription>Período: {dre.periodo}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 border-b font-semibold">
                  Receita Bruta: {formatCurrency(dre.receita_bruta)}
                </div>
                <div className="p-3 border-b text-sm pl-6">
                  (-) Deduções: {formatCurrency(dre.deducoes)}
                </div>
                <div className="p-3 border-b font-semibold bg-blue-50">
                  (=) Receita Líquida: {formatCurrency(dre.receita_liquida)}
                </div>
                <div className="p-3 border-b text-sm pl-6">
                  (-) CMV: {formatCurrency(dre.cme)}
                </div>
                <div className="p-3 border-b font-semibold bg-green-50">
                  (=) Lucro Bruto: {formatCurrency(dre.lucro_bruto)} •{' '}
                  <span className="text-sm text-green-600">
                    Margem: {((dre.lucro_bruto / dre.receita_liquida) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 border-b text-sm pl-6">
                  (-) Despesas Operacionais: {formatCurrency(dre.despesas_operacionais)}
                </div>
                <div className="p-3 border-b font-semibold bg-blue-50">
                  (=) EBITDA: {formatCurrency(dre.ebitda)} •{' '}
                  <span className="text-sm text-blue-600">
                    Margem: {((dre.ebitda / dre.receita_liquida) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 border-b text-sm pl-6">
                  (-) Depreciações: {formatCurrency(dre.depreciacoes)}
                </div>
                <div className="p-3 border-b font-semibold">
                  (=) EBIT: {formatCurrency(dre.ebit)}
                </div>
                <div className="p-3 border-b text-sm pl-6">
                  (+/-) Resultado Financeiro: {formatCurrency(dre.resultado_financeiro)}
                </div>
                <div className="p-3 font-bold text-lg bg-green-100 border-2 border-green-300 rounded">
                  (=) LUCRO LÍQUIDO: {formatCurrency(dre.lucro_liquido)} •{' '}
                  <span className="text-green-700">Margem: {dre.margem_liquida}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CONTAS BANCÁRIAS */}
        <TabsContent value="contas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contas Bancárias</CardTitle>
                <Button>+ Nova Conta</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contas.map(conta => (
                  <Card key={conta.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-bold text-lg">{conta.banco}</div>
                        <div className="text-sm text-gray-600">
                          Agência: {conta.agencia} • Conta: {conta.conta}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">{conta.tipo}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Saldo Atual</p>
                        <p className="text-2xl font-bold">{formatCurrency(conta.saldo_atual)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Saldo Projetado (30d)</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(conta.saldo_projetado)}</p>
                      </div>
                      <div>
                        {conta.limite_credito && (
                          <>
                            <p className="text-xs text-gray-500">Limite de Crédito</p>
                            <p className="text-lg font-semibold text-purple-600">
                              {formatCurrency(conta.limite_credito)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Disponível: {formatCurrency(conta.saldo_atual + conta.limite_credito)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Extrato
                      </Button>
                      <Button size="sm" variant="outline">
                        Conciliação
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: MOVIMENTOS */}
        <TabsContent value="movimentos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Movimentos Financeiros</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="todos">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="receitas">Receitas</SelectItem>
                      <SelectItem value="despesas">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Buscar movimento..." className="w-[250px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movimentos.map(mov => (
                  <Card key={mov.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getTipoBadge(mov.tipo)}`}>
                            {mov.tipo.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(mov.status)}`}>
                            {mov.status.toUpperCase()}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-100 capitalize">
                            {mov.categoria}
                          </span>
                        </div>
                        <div className="font-semibold text-lg mt-2">{mov.descricao}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {mov.conta_bancaria} • {mov.centro_custo}
                        </div>
                        {mov.tags && (
                          <div className="flex gap-1 mt-2">
                            {mov.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${mov.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {mov.tipo === 'receita' ? '+' : '-'}
                          {formatCurrency(mov.valor)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{formatDate(mov.data)}</div>
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
