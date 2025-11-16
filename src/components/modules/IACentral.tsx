/**
 * ICARUS v5.0 - Módulo: IA Central
 * Categoria: Analytics & Automação
 * Descrição: Centro de controle de todos os serviços de IA do IcarusBrain
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusServico = 'ativo' | 'pausado' | 'treinando' | 'erro'
type TipoModelo = 'classificacao' | 'regressao' | 'clustering' | 'forecasting' | 'nlp'

interface ServicoIA {
  id: string
  nome: string
  descricao: string
  tipo: TipoModelo
  status: StatusServico
  precisao: number
  uso_mensal: number
  ultima_atualizacao: string
  versao_modelo: string
  dataset_size: number
  tempo_resposta_ms: number
}

interface PredicaoRealizada {
  id: number
  servico: string
  tipo: string
  entrada: string
  resultado: string
  confianca: number
  data: string
  tempo_processamento: number
}

interface TreinamentoModelo {
  id: number
  modelo: string
  status: 'em_andamento' | 'concluido' | 'falhou'
  progresso: number
  dataset: string
  metricas: {
    accuracy: number
    precision: number
    recall: number
    f1_score: number
  }
  inicio: string
  fim?: string
}

export default function IACentral() {
  const [activeTab, setActiveTab] = useState('overview')

  const [servicos] = useState<ServicoIA[]>([
    {
      id: 'ia-001',
      nome: 'Previsão de Demanda',
      descricao: 'Forecast de produtos OPME 7/30/90 dias',
      tipo: 'forecasting',
      status: 'ativo',
      precisao: 87.5,
      uso_mensal: 1248,
      ultima_atualizacao: '2025-11-10',
      versao_modelo: 'v2.3.1',
      dataset_size: 145000,
      tempo_resposta_ms: 245
    },
    {
      id: 'ia-002',
      nome: 'Score Inadimplência',
      descricao: 'Análise de risco de crédito',
      tipo: 'classificacao',
      status: 'ativo',
      precisao: 92.0,
      uso_mensal: 856,
      ultima_atualizacao: '2025-11-12',
      versao_modelo: 'v3.1.0',
      dataset_size: 89000,
      tempo_resposta_ms: 180
    },
    {
      id: 'ia-003',
      nome: 'Recomendação de Produtos',
      descricao: 'Cross-sell e upsell inteligente',
      tipo: 'clustering',
      status: 'ativo',
      precisao: 78.5,
      uso_mensal: 2341,
      ultima_atualizacao: '2025-11-08',
      versao_modelo: 'v1.8.2',
      dataset_size: 210000,
      tempo_resposta_ms: 320
    },
    {
      id: 'ia-004',
      nome: 'Análise de Sentimento',
      descricao: 'NPS e feedback de clientes',
      tipo: 'nlp',
      status: 'treinando',
      precisao: 85.2,
      uso_mensal: 445,
      ultima_atualizacao: '2025-11-15',
      versao_modelo: 'v2.0.0-beta',
      dataset_size: 52000,
      tempo_resposta_ms: 890
    },
    {
      id: 'ia-005',
      nome: 'Churn Prediction',
      descricao: 'Predição de perda de clientes',
      tipo: 'classificacao',
      status: 'ativo',
      precisao: 88.7,
      uso_mensal: 324,
      ultima_atualizacao: '2025-11-11',
      versao_modelo: 'v2.5.3',
      dataset_size: 67000,
      tempo_resposta_ms: 210
    }
  ])

  const [predicoes] = useState<PredicaoRealizada[]>([
    {
      id: 1,
      servico: 'Previsão de Demanda',
      tipo: 'forecast',
      entrada: 'Prótese Joelho Titanium Pro - 30 dias',
      resultado: '58 unidades',
      confianca: 85,
      data: '2025-11-16 14:32',
      tempo_processamento: 245
    },
    {
      id: 2,
      servico: 'Score Inadimplência',
      tipo: 'score',
      entrada: 'Hospital Municipal São José',
      resultado: 'Score: 72 (Alto Risco)',
      confianca: 92,
      data: '2025-11-16 13:15',
      tempo_processamento: 180
    },
    {
      id: 3,
      servico: 'Churn Prediction',
      tipo: 'probabilidade',
      entrada: 'Clínica Ortopédica Dr. Santos',
      resultado: '45% probabilidade churn',
      confianca: 88,
      data: '2025-11-16 11:20',
      tempo_processamento: 210
    }
  ])

  const [treinamentos] = useState<TreinamentoModelo[]>([
    {
      id: 1,
      modelo: 'Análise de Sentimento v2.0',
      status: 'em_andamento',
      progresso: 68,
      dataset: '52.000 avaliações NPS',
      metricas: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1_score: 0
      },
      inicio: '2025-11-15 09:00'
    },
    {
      id: 2,
      modelo: 'Previsão de Demanda v2.4',
      status: 'concluido',
      progresso: 100,
      dataset: '145.000 transações',
      metricas: {
        accuracy: 87.5,
        precision: 89.2,
        recall: 85.8,
        f1_score: 87.5
      },
      inicio: '2025-11-10 08:00',
      fim: '2025-11-10 14:30'
    }
  ])

  // KPIs
  const servicosAtivos = servicos.filter(s => s.status === 'ativo').length
  const precisaoMedia = (servicos.reduce((sum, s) => sum + s.precisao, 0) / servicos.length).toFixed(1)
  const predicoesHoje = 1248
  const tempoMedioResposta = (servicos.reduce((sum, s) => sum + s.tempo_resposta_ms, 0) / servicos.length).toFixed(0)

  const getStatusBadge = (status: StatusServico) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'treinando':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTipoBadge = (tipo: TipoModelo) => {
    const badges = {
      classificacao: 'bg-blue-100 text-blue-800',
      regressao: 'bg-green-100 text-green-800',
      clustering: 'bg-purple-100 text-purple-800',
      forecasting: 'bg-orange-100 text-orange-800',
      nlp: 'bg-indigo-100 text-indigo-800'
    }
    return badges[tipo] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🤖 IA Central</h1>
          <p className="text-muted-foreground">Centro de controle de todos os serviços IcarusBrain</p>
        </div>
        <Button>+ Novo Modelo</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Serviços Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{servicosAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">de {servicos.length} serviços totais</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Precisão Média</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{precisaoMedia}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Todos os modelos</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Predições (Hoje)</CardDescription>
            <CardTitle className="text-3xl">{predicoesHoje}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+18% vs ontem</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Tempo Médio Resposta</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{tempoMedioResposta}ms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Performance excelente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="predicoes">Predições</TabsTrigger>
          <TabsTrigger value="treinamento">Treinamento</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>⚡ Serviços Mais Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servicos
                    .sort((a, b) => b.uso_mensal - a.uso_mensal)
                    .slice(0, 3)
                    .map(servico => (
                      <div key={servico.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{servico.nome}</div>
                            <div className="text-xs text-gray-600">{servico.descricao}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">{servico.uso_mensal}</div>
                            <div className="text-xs text-gray-500">usos/mês</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📊 Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Uptime (30d)</span>
                      <span className="text-xl font-bold text-green-600">99.8%</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Erro</span>
                      <span className="text-xl font-bold text-blue-600">0.3%</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Predições/Segundo</span>
                      <span className="text-xl font-bold text-purple-600">12.5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🔄 Treinamentos em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {treinamentos
                  .filter(t => t.status === 'em_andamento')
                  .map(treino => (
                    <div key={treino.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold">{treino.modelo}</div>
                        <div className="text-sm font-bold">{treino.progresso}%</div>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${treino.progresso}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">Dataset: {treino.dataset}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SERVIÇOS */}
        <TabsContent value="servicos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Serviços de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {servicos.map(servico => (
                  <Card key={servico.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{servico.nome}</div>
                        <div className="text-sm text-gray-600">{servico.descricao}</div>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(servico.status)}`}>
                            {servico.status.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded capitalize ${getTipoBadge(servico.tipo)}`}>
                            {servico.tipo}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{servico.precisao}%</div>
                        <div className="text-xs text-gray-500">Precisão</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Versão</p>
                        <p className="font-semibold">{servico.versao_modelo}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Dataset</p>
                        <p className="font-semibold">{(servico.dataset_size / 1000).toFixed(0)}k</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Uso Mensal</p>
                        <p className="font-semibold">{servico.uso_mensal}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Resposta</p>
                        <p className="font-semibold">{servico.tempo_resposta_ms}ms</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PREDIÇÕES */}
        <TabsContent value="predicoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Últimas Predições Realizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predicoes.map(pred => (
                  <Card key={pred.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{pred.servico}</div>
                        <div className="text-sm text-gray-600 mt-1">Entrada: {pred.entrada}</div>
                        <div className="text-sm font-semibold text-blue-600 mt-1">Resultado: {pred.resultado}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{pred.confianca}%</div>
                        <div className="text-xs text-gray-500">Confiança</div>
                        <div className="text-xs text-gray-400 mt-1">{pred.tempo_processamento}ms</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{pred.data}</div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TREINAMENTO */}
        <TabsContent value="treinamento" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Histórico de Treinamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {treinamentos.map(treino => (
                  <Card key={treino.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{treino.modelo}</div>
                        <div className="text-xs text-gray-600">Dataset: {treino.dataset}</div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          treino.status === 'concluido'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : treino.status === 'em_andamento'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {treino.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {treino.status === 'em_andamento' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span className="font-bold">{treino.progresso}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${treino.progresso}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {treino.status === 'concluido' && (
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Accuracy</p>
                          <p className="font-bold text-green-600">{treino.metricas.accuracy}%</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Precision</p>
                          <p className="font-bold">{treino.metricas.precision}%</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Recall</p>
                          <p className="font-bold">{treino.metricas.recall}%</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">F1-Score</p>
                          <p className="font-bold">{treino.metricas.f1_score}%</p>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Início: {treino.inicio} {treino.fim && `• Fim: ${treino.fim}`}
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
