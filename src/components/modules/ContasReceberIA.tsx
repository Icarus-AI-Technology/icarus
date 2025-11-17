/**
 * ICARUS v5.0 - Módulo: Contas a Receber IA
 * Categoria: Financeiro & Compliance
 * Descrição: Gestão de recebíveis com IA para predição de inadimplência
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'

type StatusRecebivel = 'aberto' | 'vencido' | 'pago' | 'parcial' | 'negociacao' | 'prejuizo'
type RiscoInadimplencia = 'baixo' | 'medio' | 'alto' | 'critico'

interface ContaReceber {
  id: number
  cliente_id: string
  cliente_nome: string
  nf_numero: string
  valor_original: number
  valor_pago: number
  valor_aberto: number
  data_emissao: string
  data_vencimento: string
  dias_atraso: number
  status: StatusRecebivel
  forma_pagamento: string
  parcela?: string
  score_inadimplencia: number
  risco: RiscoInadimplencia
  acoes_recomendadas: string[]
}

interface PredicaoIA {
  cliente_id: string
  cliente_nome: string
  score_inadimplencia: number
  risco: RiscoInadimplencia
  probabilidade_pagamento: number
  fatores_risco: string[]
  acoes_preventivas: string[]
  melhor_momento_cobranca: string
}

interface HistoricoPagamento {
  data: string
  valor: number
  tipo: 'pagamento' | 'juros' | 'desconto' | 'estorno'
  forma_pagamento: string
  observacoes?: string
}

export default function ContasReceberIA() {
  const [activeTab, setActiveTab] = useState('overview')

  const [contas] = useState<ContaReceber[]>([
    {
      id: 1,
      cliente_id: 'HOSP-001',
      cliente_nome: 'Hospital Sírio-Libanês',
      nf_numero: 'NF-123456',
      valor_original: 285000,
      valor_pago: 285000,
      valor_aberto: 0,
      data_emissao: '2025-10-15',
      data_vencimento: '2025-11-14',
      dias_atraso: 0,
      status: 'pago',
      forma_pagamento: 'Boleto',
      score_inadimplencia: 12,
      risco: 'baixo',
      acoes_recomendadas: ['Manter relacionamento', 'Oferecer desconto para antecipação']
    },
    {
      id: 2,
      cliente_id: 'HOSP-002',
      cliente_nome: 'Hospital Albert Einstein',
      nf_numero: 'NF-123457',
      valor_original: 450000,
      valor_pago: 0,
      valor_aberto: 450000,
      data_emissao: '2025-11-01',
      data_vencimento: '2025-12-01',
      dias_atraso: 0,
      status: 'aberto',
      forma_pagamento: 'Transferência',
      parcela: '1/3',
      score_inadimplencia: 25,
      risco: 'baixo',
      acoes_recomendadas: ['Enviar lembrete 5 dias antes', 'Confirmar recebimento da NF']
    },
    {
      id: 3,
      cliente_id: 'HOSP-003',
      cliente_nome: 'Santa Casa da Misericórdia',
      nf_numero: 'NF-123458',
      valor_original: 180000,
      valor_pago: 0,
      valor_aberto: 180000,
      data_emissao: '2025-10-01',
      data_vencimento: '2025-10-31',
      dias_atraso: 16,
      status: 'vencido',
      forma_pagamento: 'Boleto',
      score_inadimplencia: 72,
      risco: 'alto',
      acoes_recomendadas: [
        'Contato urgente - telefone + email',
        'Verificar se há problemas com a NF',
        'Oferecer parcelamento'
      ]
    }
  ])

  const [predicoes] = useState<PredicaoIA[]>([
    {
      cliente_id: 'HOSP-003',
      cliente_nome: 'Santa Casa da Misericórdia',
      score_inadimplencia: 72,
      risco: 'alto',
      probabilidade_pagamento: 45,
      fatores_risco: [
        'Histórico de atraso recorrente (3 vezes nos últimos 6 meses)',
        'Ticket médio em declínio (-25% vs trimestre anterior)',
        'Setor público com restrições orçamentárias',
        'Aumento do prazo médio de pagamento (45d → 72d)'
      ],
      acoes_preventivas: [
        'Reduzir limite de crédito temporariamente',
        'Exigir garantias adicionais para novos pedidos',
        'Estabelecer plano de pagamento estruturado',
        'Escalar para nível executivo (CFO)'
      ],
      melhor_momento_cobranca: 'Manhã (9h-11h) - terça ou quinta-feira'
    },
    {
      cliente_id: 'HOSP-004',
      cliente_nome: 'Hospital São Camilo',
      score_inadimplencia: 58,
      risco: 'medio',
      probabilidade_pagamento: 65,
      fatores_risco: [
        'Pagamentos com atraso de 5-10 dias (padrão)',
        'Mudança recente de gestor financeiro',
        'Disputa comercial em andamento (1 NF contestada)'
      ],
      acoes_preventivas: [
        'Reunião com novo gestor financeiro',
        'Resolver pendência da NF contestada',
        'Confirmar processo interno de aprovação de pagamentos'
      ],
      melhor_momento_cobranca: 'Tarde (14h-16h) - segunda-feira'
    }
  ])

  const [historico] = useState<HistoricoPagamento[]>([
    {
      data: '2025-11-14',
      valor: 285000,
      tipo: 'pagamento',
      forma_pagamento: 'Boleto',
      observacoes: 'Pagamento realizado no vencimento'
    },
    {
      data: '2025-11-10',
      valor: 125000,
      tipo: 'pagamento',
      forma_pagamento: 'PIX',
      observacoes: 'Pagamento antecipado - desconto de 2%'
    }
  ])

  // KPIs
  const totalAberto = contas.filter(c => c.status !== 'pago').reduce((sum, c) => sum + c.valor_aberto, 0)
  const totalVencido = contas.filter(c => c.status === 'vencido').reduce((sum, c) => sum + c.valor_aberto, 0)
  const contasAltoRisco = contas.filter(c => c.risco === 'alto' || c.risco === 'critico').length
  const taxaRecuperacao = 94.5 // Mock

  const getStatusBadge = (status: StatusRecebivel) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'aberto':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'parcial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'negociacao':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'prejuizo':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiscoBadge = (risco: RiscoInadimplencia) => {
    switch (risco) {
      case 'baixo':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'alto':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600'
    if (score < 60) return 'text-yellow-600'
    if (score < 80) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber IA</h1>
          <p className="text-muted-foreground">Gestão de recebíveis com predição de inadimplência</p>
        </div>
        <Button>+ Novo Recebível</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Total em Aberto</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalAberto)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{contas.filter(c => c.status !== 'pago').length} títulos</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Títulos Vencidos</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(totalVencido)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">{contas.filter(c => c.status === 'vencido').length} títulos em atraso</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-orange-200">
          <CardHeader className="pb-2">
            <CardDescription>Clientes Alto Risco</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{contasAltoRisco}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-600">Requer ação imediata</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Recuperação</CardDescription>
            <CardTitle className="text-3xl text-green-600">{taxaRecuperacao}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">+3.2% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="titulos">Títulos</TabsTrigger>
          <TabsTrigger value="ia_predicao">IA Predição</TabsTrigger>
          <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic border-red-200">
              <CardHeader>
                <CardTitle>🚨 Títulos Vencidos (Ação Urgente)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contas
                    .filter(c => c.status === 'vencido')
                    .map(conta => (
                      <div key={conta.id} className="p-3 border-2 border-red-300 rounded-lg bg-red-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{conta.cliente_nome}</div>
                            <div className="text-sm text-gray-600">NF: {conta.nf_numero}</div>
                            <div className="text-xs text-red-600 mt-1 font-semibold">
                              ⏰ {conta.dias_atraso} dias de atraso
                            </div>
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiscoBadge(conta.risco)}`}>
                                RISCO {conta.risco.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-red-600">{formatCurrency(conta.valor_aberto)}</div>
                            <div className={`text-sm font-semibold mt-1 ${getScoreColor(conta.score_inadimplencia)}`}>
                              Score: {conta.score_inadimplencia}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="default">
                            Enviar Cobrança
                          </Button>
                          <Button size="sm" variant="outline">
                            Negociar
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📊 Análise por Risco (IA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['baixo', 'medio', 'alto', 'critico'] as RiscoInadimplencia[]).map(risco => {
                    const contasRisco = contas.filter(c => c.risco === risco)
                    const valorTotal = contasRisco.reduce((sum, c) => sum + c.valor_aberto, 0)
                    return (
                      <div key={risco} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiscoBadge(risco)}`}>
                              {risco.toUpperCase()}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">
                              {contasRisco.length} títulos
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(valorTotal)}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>💰 Recebimentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {historico.map((pag, idx) => (
                  <div key={idx} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">
                        {pag.tipo.toUpperCase()}
                      </span>
                      <span className="ml-2 text-sm">{pag.forma_pagamento}</span>
                      {pag.observacoes && <div className="text-xs text-gray-500 mt-1 italic">{pag.observacoes}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{formatCurrency(pag.valor)}</div>
                      <div className="text-xs text-gray-500">{formatDate(pag.data)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TÍTULOS */}
        <TabsContent value="titulos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Todos os Títulos</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="todos">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="aberto">Em Aberto</SelectItem>
                      <SelectItem value="vencido">Vencidos</SelectItem>
                      <SelectItem value="pago">Pagos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Buscar cliente..." className="w-[200px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contas.map(conta => (
                  <Card key={conta.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="col-span-2">
                        <div className="font-bold">{conta.cliente_nome}</div>
                        <div className="text-sm text-gray-600">NF: {conta.nf_numero}</div>
                        {conta.parcela && <div className="text-xs text-gray-500">Parcela: {conta.parcela}</div>}
                        <div className="mt-2 flex gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(conta.status)}`}>
                            {conta.status.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiscoBadge(conta.risco)}`}>
                            {conta.risco.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valores</p>
                        <p className="text-sm">Original: {formatCurrency(conta.valor_original)}</p>
                        <p className="text-sm text-green-600">Pago: {formatCurrency(conta.valor_pago)}</p>
                        <p className="text-lg font-bold text-red-600">Aberto: {formatCurrency(conta.valor_aberto)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Datas</p>
                        <p className="text-xs">Emissão: {formatDate(conta.data_emissao)}</p>
                        <p className="text-xs">Vencimento: {formatDate(conta.data_vencimento)}</p>
                        {conta.dias_atraso > 0 && (
                          <p className="text-xs text-red-600 font-semibold mt-1">
                            ⏰ {conta.dias_atraso} dias atraso
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Score IA</p>
                        <p className={`text-3xl font-bold ${getScoreColor(conta.score_inadimplencia)}`}>
                          {conta.score_inadimplencia}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{conta.forma_pagamento}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: IA PREDIÇÃO */}
        <TabsContent value="ia_predicao" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🤖 Análise Preditiva de Inadimplência (IA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predicoes.map((pred, idx) => (
                  <Card key={idx} className="p-4 border-2">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-lg">{pred.cliente_nome}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiscoBadge(pred.risco)}`}>
                          RISCO {pred.risco.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(pred.score_inadimplencia)}`}>
                          {pred.score_inadimplencia}
                        </div>
                        <div className="text-xs text-gray-500">Score Inadimplência</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Probabilidade de Pagamento</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pred.probabilidade_pagamento > 70 ? 'bg-green-500' : pred.probabilidade_pagamento > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${pred.probabilidade_pagamento}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">{pred.probabilidade_pagamento}%</span>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <p className="text-xs text-gray-500 mb-1">Melhor Momento para Cobrança</p>
                        <p className="text-sm font-semibold text-blue-700">{pred.melhor_momento_cobranca}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">⚠️ Fatores de Risco Identificados:</p>
                      <ul className="space-y-1">
                        {pred.fatores_risco.map((fator, i) => (
                          <li key={i} className="text-sm text-gray-700 pl-3">
                            • {fator}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2 text-green-700">✅ Ações Preventivas Recomendadas:</p>
                      <ul className="space-y-1">
                        {pred.acoes_preventivas.map((acao, i) => (
                          <li key={i} className="text-sm text-gray-700 pl-3">
                            {i + 1}. {acao}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm">Aplicar Ações</Button>
                      <Button size="sm" variant="outline">
                        Ver Histórico Completo
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: COBRANÇA */}
        <TabsContent value="cobranca" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📞 Ações de Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contas
                  .filter(c => c.valor_aberto > 0)
                  .map(conta => (
                    <Card key={conta.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-bold">{conta.cliente_nome}</div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(conta.valor_aberto)} • Venc: {formatDate(conta.data_vencimento)}
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Ações Recomendadas pela IA:</p>
                            <ul className="space-y-0.5">
                              {conta.acoes_recomendadas.map((acao, i) => (
                                <li key={i} className="text-xs text-gray-600 pl-2">
                                  • {acao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm">Email</Button>
                          <Button size="sm" variant="outline">
                            WhatsApp
                          </Button>
                          <Button size="sm" variant="outline">
                            Boleto
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Análise de Recebimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">PMR (Prazo Médio Recebimento)</p>
                  <p className="text-3xl font-bold">38 dias</p>
                  <p className="text-xs text-gray-500 mt-1">-3 dias vs mês anterior</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Taxa de Inadimplência</p>
                  <p className="text-3xl font-bold text-orange-600">5.5%</p>
                  <p className="text-xs text-gray-500 mt-1">Meta: &lt; 3%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Eficiência de Cobrança</p>
                  <p className="text-3xl font-bold text-green-600">92%</p>
                  <p className="text-xs text-green-600 mt-1">+5% vs trimestre anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
