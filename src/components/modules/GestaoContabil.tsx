/**
 * ICARUS v5.0 - Módulo: Gestão Contábil
 * Categoria: Financeiro & Compliance
 * Descrição: Gestão contábil completa - Lançamentos, plano de contas, balancetes
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'

type TipoLancamento = 'debito' | 'credito'
type NaturezaConta = 'ativo' | 'passivo' | 'patrimonio_liquido' | 'receita' | 'despesa'

interface PlanoContas {
  codigo: string
  nome: string
  natureza: NaturezaConta
  nivel: number
  tipo: 'sintetica' | 'analitica'
  saldo_devedor: number
  saldo_credor: number
}

interface LancamentoContabil {
  id: number
  data: string
  historico: string
  documento: string
  lancamentos: {
    conta_codigo: string
    conta_nome: string
    tipo: TipoLancamento
    valor: number
  }[]
  total_debito: number
  total_credito: number
  usuario: string
}

interface Balancete {
  conta_codigo: string
  conta_nome: string
  natureza: NaturezaConta
  saldo_anterior: number
  debitos: number
  creditos: number
  saldo_atual: number
}

export default function GestaoContabil() {
  const [activeTab, setActiveTab] = useState('overview')

  const [planoContas] = useState<PlanoContas[]>([
    {
      codigo: '1',
      nome: 'ATIVO',
      natureza: 'ativo',
      nivel: 1,
      tipo: 'sintetica',
      saldo_devedor: 5420000,
      saldo_credor: 0
    },
    {
      codigo: '1.1',
      nome: 'ATIVO CIRCULANTE',
      natureza: 'ativo',
      nivel: 2,
      tipo: 'sintetica',
      saldo_devedor: 3850000,
      saldo_credor: 0
    },
    {
      codigo: '1.1.1',
      nome: 'Disponibilidades',
      natureza: 'ativo',
      nivel: 3,
      tipo: 'sintetica',
      saldo_devedor: 2120000,
      saldo_credor: 0
    },
    {
      codigo: '1.1.1.01',
      nome: 'Caixa',
      natureza: 'ativo',
      nivel: 4,
      tipo: 'analitica',
      saldo_devedor: 15000,
      saldo_credor: 0
    },
    {
      codigo: '1.1.1.02',
      nome: 'Bancos Conta Movimento',
      natureza: 'ativo',
      nivel: 4,
      tipo: 'analitica',
      saldo_devedor: 870000,
      saldo_credor: 0
    },
    {
      codigo: '1.1.2',
      nome: 'Contas a Receber',
      natureza: 'ativo',
      nivel: 3,
      tipo: 'analitica',
      saldo_devedor: 1280000,
      saldo_credor: 0
    },
    {
      codigo: '2',
      nome: 'PASSIVO',
      natureza: 'passivo',
      nivel: 1,
      tipo: 'sintetica',
      saldo_devedor: 0,
      saldo_credor: 2850000
    },
    {
      codigo: '2.1',
      nome: 'PASSIVO CIRCULANTE',
      natureza: 'passivo',
      nivel: 2,
      tipo: 'sintetica',
      saldo_devedor: 0,
      saldo_credor: 1920000
    },
    {
      codigo: '2.1.1',
      nome: 'Fornecedores',
      natureza: 'passivo',
      nivel: 3,
      tipo: 'analitica',
      saldo_devedor: 0,
      saldo_credor: 1450000
    },
    {
      codigo: '3',
      nome: 'PATRIMÔNIO LÍQUIDO',
      natureza: 'patrimonio_liquido',
      nivel: 1,
      tipo: 'sintetica',
      saldo_devedor: 0,
      saldo_credor: 2570000
    }
  ])

  const [lancamentos] = useState<LancamentoContabil[]>([
    {
      id: 1,
      data: '2025-11-15',
      historico: 'Faturamento de vendas - NF-123456',
      documento: 'NF-123456',
      lancamentos: [
        { conta_codigo: '1.1.2', conta_nome: 'Contas a Receber', tipo: 'debito', valor: 285000 },
        { conta_codigo: '3.1.1', conta_nome: 'Receita de Vendas', tipo: 'credito', valor: 285000 }
      ],
      total_debito: 285000,
      total_credito: 285000,
      usuario: 'João Silva'
    },
    {
      id: 2,
      data: '2025-11-10',
      historico: 'Pagamento fornecedor - Compra OPME',
      documento: 'NF-654321',
      lancamentos: [
        { conta_codigo: '2.1.1', conta_nome: 'Fornecedores', tipo: 'debito', valor: 180000 },
        { conta_codigo: '1.1.1.02', conta_nome: 'Bancos Conta Movimento', tipo: 'credito', valor: 180000 }
      ],
      total_debito: 180000,
      total_credito: 180000,
      usuario: 'Maria Santos'
    },
    {
      id: 3,
      data: '2025-11-08',
      historico: 'Folha de pagamento - Novembro/2025',
      documento: 'FP-11/2025',
      lancamentos: [
        { conta_codigo: '3.2.1', conta_nome: 'Despesas com Pessoal', tipo: 'debito', valor: 95000 },
        { conta_codigo: '2.1.2', conta_nome: 'Salários a Pagar', tipo: 'credito', valor: 95000 }
      ],
      total_debito: 95000,
      total_credito: 95000,
      usuario: 'Carlos Oliveira'
    }
  ])

  const [balancete] = useState<Balancete[]>([
    {
      conta_codigo: '1.1.1.02',
      conta_nome: 'Bancos Conta Movimento',
      natureza: 'ativo',
      saldo_anterior: 1050000,
      debitos: 285000,
      creditos: 465000,
      saldo_atual: 870000
    },
    {
      conta_codigo: '1.1.2',
      conta_nome: 'Contas a Receber',
      natureza: 'ativo',
      saldo_anterior: 995000,
      debitos: 285000,
      creditos: 0,
      saldo_atual: 1280000
    },
    {
      conta_codigo: '2.1.1',
      conta_nome: 'Fornecedores',
      natureza: 'passivo',
      saldo_anterior: 1630000,
      debitos: 180000,
      creditos: 0,
      saldo_atual: 1450000
    }
  ])

  // KPIs
  const totalAtivo = planoContas
    .filter(c => c.natureza === 'ativo' && c.tipo === 'sintetica' && c.nivel === 1)
    .reduce((sum, c) => sum + c.saldo_devedor, 0)
  const totalPassivo = planoContas
    .filter(c => c.natureza === 'passivo' && c.tipo === 'sintetica' && c.nivel === 1)
    .reduce((sum, c) => sum + c.saldo_credor, 0)
  const patrimonio Liquido = planoContas
    .filter(c => c.natureza === 'patrimonio_liquido' && c.tipo === 'sintetica' && c.nivel === 1)
    .reduce((sum, c) => sum + c.saldo_credor, 0)
  const lancamentosMes = lancamentos.length

  const getNaturezaColor = (natureza: NaturezaConta) => {
    switch (natureza) {
      case 'ativo':
        return 'text-blue-600'
      case 'passivo':
        return 'text-red-600'
      case 'patrimonio_liquido':
        return 'text-purple-600'
      case 'receita':
        return 'text-green-600'
      case 'despesa':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTipoLancamentoBadge = (tipo: TipoLancamento) => {
    return tipo === 'debito'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão Contábil</h1>
          <p className="text-muted-foreground">Lançamentos, plano de contas, balancetes e relatórios</p>
        </div>
        <Button>+ Novo Lançamento</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Total Ativo</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(totalAtivo)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Circulante + Não Circulante</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Total Passivo</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(totalPassivo)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">Obrigações totais</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Patrimônio Líquido</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{formatCurrency(patrimonioLiquido)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Capital + Reservas</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Lançamentos (Mês)</CardDescription>
            <CardTitle className="text-3xl">{lancamentosMes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plano_contas">Plano de Contas</TabsTrigger>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="balancete">Balancete</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📊 Balanço Patrimonial (Resumo)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-600">ATIVO</span>
                      <span className="text-xl font-bold text-blue-600">{formatCurrency(totalAtivo)}</span>
                    </div>
                  </div>
                  <div className="p-3 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-red-600">PASSIVO</span>
                      <span className="text-xl font-bold text-red-600">{formatCurrency(totalPassivo)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-600">PATRIMÔNIO LÍQUIDO</span>
                      <span className="text-xl font-bold text-purple-600">{formatCurrency(patrimonioLiquido)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Equação Patrimonial:</span>
                      <span className="text-xs font-mono">
                        Ativo ({formatCurrency(totalAtivo)}) = Passivo ({formatCurrency(totalPassivo)}) + PL (
                        {formatCurrency(patrimonioLiquido)})
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📈 Indicadores Contábeis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500">Liquidez Corrente</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(
                        planoContas.find(c => c.codigo === '1.1')!.saldo_devedor /
                        planoContas.find(c => c.codigo === '2.1')!.saldo_credor
                      ).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">AC / PC</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500">Endividamento</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {((totalPassivo / totalAtivo) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Passivo / Ativo</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500">ROE (Est.)</p>
                    <p className="text-2xl font-bold text-green-600">15.2%</p>
                    <p className="text-xs text-gray-500">Lucro / PL</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-gray-500">Margem Líquida</p>
                    <p className="text-2xl font-bold text-purple-600">19.4%</p>
                    <p className="text-xs text-gray-500">LL / Receita</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📝 Últimos Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lancamentos.slice(0, 5).map(lanc => (
                  <div key={lanc.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{lanc.historico}</div>
                        <div className="text-xs text-gray-600 mt-1">Doc: {lanc.documento}</div>
                        <div className="mt-2 space-y-1">
                          {lanc.lancamentos.map((l, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getTipoLancamentoBadge(l.tipo)}`}>
                                {l.tipo === 'debito' ? 'D' : 'C'}
                              </span>
                              <span className="text-gray-600">{l.conta_nome}</span>
                              <span className="font-semibold">{formatCurrency(l.valor)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{formatDate(lanc.data)}</div>
                        <div className="mt-1">{lanc.usuario}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PLANO DE CONTAS */}
        <TabsContent value="plano_contas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Plano de Contas</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="todas">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="passivo">Passivo</SelectItem>
                      <SelectItem value="pl">Patrimônio Líquido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>+ Nova Conta</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {planoContas.map(conta => (
                  <div
                    key={conta.codigo}
                    className={`p-2 border-b hover:bg-gray-50 ${conta.tipo === 'sintetica' ? 'font-semibold' : ''}`}
                    style={{ paddingLeft: `${conta.nivel * 16}px` }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-mono">{conta.codigo}</span>
                        <span className={`${conta.tipo === 'sintetica' ? 'font-bold' : ''} ${getNaturezaColor(conta.natureza)}`}>
                          {conta.nome}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 capitalize">{conta.tipo}</span>
                      </div>
                      <div className="flex gap-4">
                        {conta.saldo_devedor > 0 && (
                          <span className="text-sm text-blue-600">D: {formatCurrency(conta.saldo_devedor)}</span>
                        )}
                        {conta.saldo_credor > 0 && (
                          <span className="text-sm text-green-600">C: {formatCurrency(conta.saldo_credor)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: LANÇAMENTOS */}
        <TabsContent value="lancamentos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lançamentos Contábeis</CardTitle>
                <Input placeholder="Buscar lançamento..." className="w-[250px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lancamentos.map(lanc => (
                  <Card key={lanc.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold">{lanc.historico}</div>
                        <div className="text-sm text-gray-600">Documento: {lanc.documento}</div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{formatDate(lanc.data)}</div>
                        <div>{lanc.usuario}</div>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 border-b">
                          <tr>
                            <th className="text-left py-1">Conta</th>
                            <th className="text-center py-1">Tipo</th>
                            <th className="text-right py-1">Débito</th>
                            <th className="text-right py-1">Crédito</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lanc.lancamentos.map((l, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-2">
                                {l.conta_codigo} - {l.conta_nome}
                              </td>
                              <td className="text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getTipoLancamentoBadge(l.tipo)}`}>
                                  {l.tipo === 'debito' ? 'D' : 'C'}
                                </span>
                              </td>
                              <td className="text-right text-blue-600 font-semibold">
                                {l.tipo === 'debito' ? formatCurrency(l.valor) : '-'}
                              </td>
                              <td className="text-right text-green-600 font-semibold">
                                {l.tipo === 'credito' ? formatCurrency(l.valor) : '-'}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-gray-50">
                            <td className="py-2" colSpan={2}>
                              TOTAL
                            </td>
                            <td className="text-right text-blue-600">{formatCurrency(lanc.total_debito)}</td>
                            <td className="text-right text-green-600">{formatCurrency(lanc.total_credito)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: BALANCETE */}
        <TabsContent value="balancete" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Balancete de Verificação</CardTitle>
              <CardDescription>Período: Novembro/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b-2">
                  <tr>
                    <th className="text-left py-2 px-2">Código</th>
                    <th className="text-left py-2">Conta</th>
                    <th className="text-right py-2">Saldo Anterior</th>
                    <th className="text-right py-2">Débitos</th>
                    <th className="text-right py-2">Créditos</th>
                    <th className="text-right py-2">Saldo Atual</th>
                  </tr>
                </thead>
                <tbody>
                  {balancete.map((bal, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono text-xs">{bal.conta_codigo}</td>
                      <td className={`py-2 ${getNaturezaColor(bal.natureza)}`}>{bal.conta_nome}</td>
                      <td className="py-2 text-right">{formatCurrency(bal.saldo_anterior)}</td>
                      <td className="py-2 text-right text-blue-600 font-semibold">
                        {bal.debitos > 0 ? formatCurrency(bal.debitos) : '-'}
                      </td>
                      <td className="py-2 text-right text-green-600 font-semibold">
                        {bal.creditos > 0 ? formatCurrency(bal.creditos) : '-'}
                      </td>
                      <td className="py-2 text-right font-bold">{formatCurrency(bal.saldo_atual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Relatórios Contábeis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Balanço Patrimonial</div>
                    <div className="text-xs text-gray-500">Ativo, Passivo e PL</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">DRE (Demonstração de Resultados)</div>
                    <div className="text-xs text-gray-500">Receitas, Custos e Lucro</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Fluxo de Caixa</div>
                    <div className="text-xs text-gray-500">Entradas e Saídas</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Balancete Analítico</div>
                    <div className="text-xs text-gray-500">Todas as contas</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Razão Contábil</div>
                    <div className="text-xs text-gray-500">Lançamentos por conta</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Livro Diário</div>
                    <div className="text-xs text-gray-500">Cronológico de lançamentos</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
