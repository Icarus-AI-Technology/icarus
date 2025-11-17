/**
 * ICARUS v5.0 - Módulo: Analytics Predição
 * Categoria: Analytics & Automação
 * Descrição: Análises preditivas com IA - Forecasting, tendências e cenários
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
type ConfiancaIA = 'baixa' | 'media' | 'alta' | 'muito_alta'

interface PredicaoDemanda {
  produto_id: string
  produto_nome: string
  demanda_atual: number
  previsao_7d: number
  previsao_30d: number
  previsao_90d: number
  confianca: ConfiancaIA
  fatores_influencia: string[]
  recomendacao: string
}

interface PrevisaoReceita {
  mes: string
  receita_atual: number
  previsao_otimista: number
  previsao_realista: number
  previsao_pessimista: number
  confianca: number
  principais_drivers: string[]
}

interface AnaliseChurn {
  cliente_id: string
  cliente_nome: string
  probabilidade_churn: number
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  valor_em_risco: number
  fatores_risco: string[]
  acoes_retencao: string[]
  tempo_estimado_churn: string
}

interface CenarioSimulacao {
  id: number
  nome: string
  tipo: 'otimista' | 'realista' | 'pessimista'
  variaveis: {
    crescimento_vendas: number
    ticket_medio: number
    taxa_conversao: number
    churn_rate: number
  }
  impacto_receita: number
  impacto_margem: number
  probabilidade: number
}

export default function AnalyticsPredicao() {
  const [activeTab, setActiveTab] = useState('overview')
  const [horizonte, setHorizonte] = useState('30d')

  const [predicoesDemanda] = useState<PredicaoDemanda[]>([
    {
      produto_id: 'OPME-001',
      produto_nome: 'Prótese Articular Joelho - Titanium Pro',
      demanda_atual: 12,
      previsao_7d: 14,
      previsao_30d: 58,
      previsao_90d: 185,
      confianca: 'alta',
      fatores_influencia: [
        'Sazonalidade: Novembro tem 15% mais cirurgias ortopédicas',
        '3 novos hospitais em pipeline com alta probabilidade',
        'Histórico: Crescimento médio de 18% nos últimos 6 meses'
      ],
      recomendacao: 'Aumentar estoque em 25% para atender demanda projetada'
    },
    {
      produto_id: 'OPME-002',
      produto_nome: 'Stent Coronariano - CardioFlow Elite',
      demanda_atual: 25,
      previsao_7d: 26,
      previsao_30d: 110,
      previsao_90d: 320,
      confianca: 'muito_alta',
      fatores_influencia: [
        'Contrato firmado com Hospital Albert Einstein (+40 procedimentos/mês)',
        'Tendência estável com crescimento linear de 2-3% ao mês',
        'Sem sazonalidade detectada'
      ],
      recomendacao: 'Estoque atual adequado, manter política de reposição'
    }
  ])

  const [previsoesReceita] = useState<PrevisaoReceita[]>([
    {
      mes: 'Dezembro/2025',
      receita_atual: 1850000,
      previsao_otimista: 2280000,
      previsao_realista: 2050000,
      previsao_pessimista: 1920000,
      confianca: 85,
      principais_drivers: ['Sazonalidade fim de ano positiva', 'Pipeline robusto', '2 contratos em fechamento']
    },
    {
      mes: 'Janeiro/2026',
      receita_atual: 1850000,
      previsao_otimista: 1680000,
      previsao_realista: 1580000,
      previsao_pessimista: 1450000,
      confianca: 72,
      principais_drivers: ['Sazonalidade janeiro negativa (-15%)', 'Férias hospitalares', 'Redução cirurgias eletivas']
    },
    {
      mes: 'Fevereiro/2026',
      receita_atual: 1850000,
      previsao_otimista: 1950000,
      previsao_realista: 1820000,
      previsao_pessimista: 1680000,
      confianca: 78,
      principais_drivers: ['Retomada pós-férias', 'Orçamentos renovados', 'Demanda reprimida de janeiro']
    }
  ])

  const [analiseChurn] = useState<AnaliseChurn[]>([
    {
      cliente_id: 'HOSP-005',
      cliente_nome: 'Hospital Municipal São José',
      probabilidade_churn: 78,
      risco: 'critico',
      valor_em_risco: 180000,
      fatores_risco: [
        'Sem compras há 45 dias (padrão: compra a cada 15 dias)',
        'Ticket médio reduziu 60% nos últimos 2 meses',
        'NPS baixo: 4/10 na última pesquisa',
        'Concorrente realizou visita comercial (fonte: contato interno)'
      ],
      acoes_retencao: [
        'Ação imediata: Visita presencial do diretor comercial',
        'Oferecer condições especiais (desconto 8% + prazo estendido)',
        'Propor contrato anual com garantia de preço',
        'Escalar para diretoria: possível problema de relacionamento'
      ],
      tempo_estimado_churn: '15-30 dias'
    },
    {
      cliente_id: 'HOSP-007',
      cliente_nome: 'Clínica Ortopédica Dr. Santos',
      probabilidade_churn: 45,
      risco: 'medio',
      valor_em_risco: 85000,
      fatores_risco: [
        'Atraso recorrente nos pagamentos (média 12 dias)',
        'Contato menos frequente com equipe comercial',
        'Volume de compras estável mas sem crescimento'
      ],
      acoes_retencao: [
        'Reunião para entender dificuldades financeiras',
        'Propor parcelamento ou novas condições de pagamento',
        'Apresentar novos produtos com maior margem'
      ],
      tempo_estimado_churn: '60-90 dias'
    }
  ])

  const [cenarios] = useState<CenarioSimulacao[]>([
    {
      id: 1,
      nome: 'Cenário Base (Atual)',
      tipo: 'realista',
      variaveis: {
        crescimento_vendas: 18,
        ticket_medio: 285000,
        taxa_conversao: 68,
        churn_rate: 5.5
      },
      impacto_receita: 22200000,
      impacto_margem: 21.6,
      probabilidade: 60
    },
    {
      id: 2,
      nome: 'Expansão Agressiva',
      tipo: 'otimista',
      variaveis: {
        crescimento_vendas: 35,
        ticket_medio: 320000,
        taxa_conversao: 75,
        churn_rate: 3.0
      },
      impacto_receita: 29800000,
      impacto_margem: 23.5,
      probabilidade: 25
    },
    {
      id: 3,
      nome: 'Recessão Setorial',
      tipo: 'pessimista',
      variaveis: {
        crescimento_vendas: -8,
        ticket_medio: 250000,
        taxa_conversao: 55,
        churn_rate: 12.0
      },
      impacto_receita: 16500000,
      impacto_margem: 18.2,
      probabilidade: 15
    }
  ])

  // KPIs
  const precisaoMediaPredicoes = 87.5
  const produtosAltoRiscoRuptura = predicoesDemanda.filter(p => p.previsao_30d > p.demanda_atual * 3).length
  const clientesRiscoChurn = analiseChurn.filter(a => a.risco === 'alto' || a.risco === 'critico').length
  const valorEmRisco = analiseChurn.reduce((sum, a) => sum + a.valor_em_risco, 0)

  const getConfiancaColor = (confianca: ConfiancaIA | number) => {
    if (typeof confianca === 'number') {
      if (confianca >= 80) return 'text-green-600'
      if (confianca >= 60) return 'text-blue-600'
      if (confianca >= 40) return 'text-yellow-600'
      return 'text-red-600'
    }
    switch (confianca) {
      case 'muito_alta':
        return 'text-green-600'
      case 'alta':
        return 'text-blue-600'
      case 'media':
        return 'text-yellow-600'
      case 'baixa':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRiscoBadge = (risco: AnaliseChurn['risco']) => {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Predição</h1>
          <p className="text-muted-foreground">Análises preditivas com IA - Forecasting, tendências e cenários</p>
        </div>
        <Select value={horizonte} onValueChange={setHorizonte}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
            <SelectItem value="12m">12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Precisão das Predições</CardDescription>
            <CardTitle className="text-3xl text-green-600">{precisaoMediaPredicoes}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-orange-200">
          <CardHeader className="pb-2">
            <CardDescription>Produtos Alto Risco Ruptura</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{produtosAltoRiscoRuptura}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-600">Demanda prevista &gt; 3x atual</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Clientes Risco Churn</CardDescription>
            <CardTitle className="text-3xl text-red-600">{clientesRiscoChurn}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">Ação urgente necessária</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Valor em Risco (Churn)</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(valorEmRisco)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Receita anual ameaçada</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demanda">Demanda</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
          <TabsTrigger value="cenarios">Cenários</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🎯 Previsões Principais ({horizonte})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <div className="font-semibold text-blue-800">Receita Próximo Mês</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(2050000)}</div>
                    <div className="text-xs text-gray-600 mt-1">Confiança: 85% • Cenário realista</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-green-50">
                    <div className="font-semibold text-green-800">Crescimento Esperado</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">+10.8%</div>
                    <div className="text-xs text-gray-600 mt-1">vs mês atual</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-orange-50">
                    <div className="font-semibold text-orange-800">Produtos com Demanda Crítica</div>
                    <div className="text-2xl font-bold text-orange-600 mt-1">{produtosAltoRiscoRuptura}</div>
                    <div className="text-xs text-gray-600 mt-1">Requerem ação imediata de compra</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic border-red-200">
              <CardHeader>
                <CardTitle>🚨 Alertas Preditivos Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analiseChurn
                    .filter(a => a.risco === 'critico')
                    .map((cliente, idx) => (
                      <div key={idx} className="p-3 border-2 border-red-300 rounded-lg bg-red-50">
                        <div className="font-bold text-red-800">{cliente.cliente_nome}</div>
                        <div className="text-sm text-gray-700 mt-1">
                          Probabilidade Churn: <span className="font-bold">{cliente.probabilidade_churn}%</span>
                        </div>
                        <div className="text-sm text-red-600 font-semibold mt-1">
                          Risco: {formatCurrency(cliente.valor_em_risco)}/ano
                        </div>
                        <div className="text-xs text-gray-600 mt-2">⏱️ {cliente.tempo_estimado_churn}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Precisão do Modelo de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Precisão Geral</p>
                  <p className="text-3xl font-bold text-green-600">{precisaoMediaPredicoes}%</p>
                  <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Predições Realizadas</p>
                  <p className="text-3xl font-bold">1,248</p>
                  <p className="text-xs text-gray-500 mt-1">Último mês</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Taxa Acerto Críticos</p>
                  <p className="text-3xl font-bold text-blue-600">92%</p>
                  <p className="text-xs text-gray-500 mt-1">Alertas de alto risco</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: DEMANDA */}
        <TabsContent value="demanda" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Previsão de Demanda por Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predicoesDemanda.map((pred, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{pred.produto_nome}</div>
                        <div className="text-xs text-gray-600">{pred.produto_id}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 uppercase`}>
                        Confiança: {pred.confianca.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500">Demanda Atual</p>
                        <p className="text-2xl font-bold">{pred.demanda_atual}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <p className="text-xs text-gray-500">Previsão 7d</p>
                        <p className="text-2xl font-bold text-blue-600">{pred.previsao_7d}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-green-50">
                        <p className="text-xs text-gray-500">Previsão 30d</p>
                        <p className="text-2xl font-bold text-green-600">{pred.previsao_30d}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-purple-50">
                        <p className="text-xs text-gray-500">Previsão 90d</p>
                        <p className="text-2xl font-bold text-purple-600">{pred.previsao_90d}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Fatores de Influência:</p>
                      <ul className="space-y-1">
                        {pred.fatores_influencia.map((fator, i) => (
                          <li key={i} className="text-xs text-gray-600 pl-3">
                            • {fator}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs font-semibold text-green-700">✅ Recomendação da IA:</p>
                      <p className="text-sm text-gray-700 mt-1">{pred.recomendacao}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RECEITA */}
        <TabsContent value="receita" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Previsão de Receita (Próximos 3 Meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previsoesReceita.map((prev, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{prev.mes}</div>
                        <div className={`text-sm font-semibold mt-1 ${getConfiancaColor(prev.confianca)}`}>
                          Confiança: {prev.confianca}%
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500">Atual</p>
                        <p className="text-lg font-bold">{formatCurrency(prev.receita_atual)}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-green-50">
                        <p className="text-xs text-gray-500">Otimista</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(prev.previsao_otimista)}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <p className="text-xs text-gray-500">Realista</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(prev.previsao_realista)}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-orange-50">
                        <p className="text-xs text-gray-500">Pessimista</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(prev.previsao_pessimista)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Principais Drivers:</p>
                      <ul className="space-y-0.5">
                        {prev.principais_drivers.map((driver, i) => (
                          <li key={i} className="text-xs text-gray-600 pl-3">
                            • {driver}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CHURN */}
        <TabsContent value="churn" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Análise Preditiva de Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analiseChurn.map((analise, idx) => (
                  <Card key={idx} className="p-4 border-2">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{analise.cliente_nome}</div>
                        <div className="text-xs text-gray-600">{analise.cliente_id}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiscoBadge(analise.risco)}`}>
                          RISCO {analise.risco.toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">⏱️ {analise.tempo_estimado_churn}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-3 border rounded-lg bg-red-50">
                        <p className="text-xs text-gray-500">Probabilidade de Churn</p>
                        <p className="text-3xl font-bold text-red-600">{analise.probabilidade_churn}%</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-orange-50">
                        <p className="text-xs text-gray-500">Valor em Risco (Anual)</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(analise.valor_em_risco)}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-red-700 mb-2">⚠️ Fatores de Risco:</p>
                      <ul className="space-y-1">
                        {analise.fatores_risco.map((fator, i) => (
                          <li key={i} className="text-xs text-gray-700 pl-3">
                            • {fator}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 mb-2">✅ Ações de Retenção Recomendadas:</p>
                      <ul className="space-y-1">
                        {analise.acoes_retencao.map((acao, i) => (
                          <li key={i} className="text-xs text-gray-700 pl-3">
                            {i + 1}. {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CENÁRIOS */}
        <TabsContent value="cenarios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Simulação de Cenários (12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cenarios.map(cenario => (
                  <Card key={cenario.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{cenario.nome}</div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded capitalize ${
                            cenario.tipo === 'otimista'
                              ? 'bg-green-100 text-green-800'
                              : cenario.tipo === 'pessimista'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {cenario.tipo}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Probabilidade</p>
                        <p className="text-2xl font-bold">{cenario.probabilidade}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Crescimento Vendas</p>
                        <p className="font-bold">{cenario.variaveis.crescimento_vendas > 0 ? '+' : ''}{cenario.variaveis.crescimento_vendas}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Ticket Médio</p>
                        <p className="font-bold">{formatCurrency(cenario.variaveis.ticket_medio)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Taxa Conversão</p>
                        <p className="font-bold">{cenario.variaveis.taxa_conversao}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Churn Rate</p>
                        <p className="font-bold">{cenario.variaveis.churn_rate}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg bg-green-50">
                        <p className="text-xs text-gray-500">Receita Projetada (12m)</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(cenario.impacto_receita)}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <p className="text-xs text-gray-500">Margem EBITDA</p>
                        <p className="text-xl font-bold text-blue-600">{cenario.impacto_margem}%</p>
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
