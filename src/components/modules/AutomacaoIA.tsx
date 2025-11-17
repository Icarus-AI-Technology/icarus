/**
 * ICARUS v5.0 - Módulo: Automação IA
 * Categoria: Analytics & Automação
 * Descrição: Automações inteligentes com IA - Workflows automatizados
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

type StatusAutomacao = 'ativa' | 'pausada' | 'erro'
type TipoGatilho = 'evento' | 'agendado' | 'condicional'

interface Automacao {
  id: string
  nome: string
  descricao: string
  gatilho: TipoGatilho
  acoes: string[]
  status: StatusAutomacao
  execucoes_mes: number
  taxa_sucesso: number
  economia_horas: number
  ultima_execucao: string
}

interface ExecucaoAutomacao {
  id: number
  automacao: string
  data: string
  status: 'sucesso' | 'falha' | 'parcial'
  tempo_execucao: number
  itens_processados: number
  erros?: string
}

export default function AutomacaoIA() {
  const [activeTab, setActiveTab] = useState('overview')

  const [automacoes] = useState<Automacao[]>([
    {
      id: 'auto-001',
      nome: 'Alerta Estoque Crítico',
      descricao: 'Envia alertas quando estoque atinge nível mínimo',
      gatilho: 'evento',
      acoes: ['Verificar estoque', 'Criar alerta', 'Notificar compras', 'Gerar pedido sugestão'],
      status: 'ativa',
      execucoes_mes: 145,
      taxa_sucesso: 98.5,
      economia_horas: 24,
      ultima_execucao: '2025-11-16 14:32'
    },
    {
      id: 'auto-002',
      nome: 'Follow-up Inadimplência',
      descricao: 'Envia cobranças automáticas baseadas em score IA',
      gatilho: 'agendado',
      acoes: ['Calcular score', 'Gerar mensagem personalizada', 'Enviar email/WhatsApp', 'Registrar histórico'],
      status: 'ativa',
      execucoes_mes: 856,
      taxa_sucesso: 92.0,
      economia_horas: 68,
      ultima_execucao: '2025-11-16 08:00'
    },
    {
      id: 'auto-003',
      nome: 'Recomendação Cross-sell',
      descricao: 'Sugere produtos complementares após venda',
      gatilho: 'evento',
      acoes: ['Analisar pedido', 'IA recomendação', 'Gerar proposta', 'Enviar para vendedor'],
      status: 'ativa',
      execucoes_mes: 324,
      taxa_sucesso: 78.5,
      economia_horas: 42,
      ultima_execucao: '2025-11-16 13:45'
    }
  ])

  const [execucoes] = useState<ExecucaoAutomacao[]>([
    {
      id: 1,
      automacao: 'Alerta Estoque Crítico',
      data: '2025-11-16 14:32',
      status: 'sucesso',
      tempo_execucao: 245,
      itens_processados: 12
    },
    {
      id: 2,
      automacao: 'Follow-up Inadimplência',
      data: '2025-11-16 08:00',
      status: 'sucesso',
      tempo_execucao: 1850,
      itens_processados: 45
    }
  ])

  const automacoesAtivas = automacoes.filter(a => a.status === 'ativa').length
  const economiaTotal = automacoes.reduce((sum, a) => sum + a.economia_horas, 0)
  const execucoesTotais = automacoes.reduce((sum, a) => sum + a.execucoes_mes, 0)
  const sucessoMedio = (automacoes.reduce((sum, a) => sum + a.taxa_sucesso, 0) / automacoes.length).toFixed(1)

  const getStatusBadge = (status: StatusAutomacao) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">⚡ Automação IA</h1>
          <p className="text-muted-foreground">Automações inteligentes com IA - Workflows automatizados</p>
        </div>
        <Button>+ Nova Automação</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Automações Ativas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{automacoesAtivas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Em execução</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Economia de Tempo (Mês)</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{economiaTotal}h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">≈ {(economiaTotal / 8).toFixed(0)} dias úteis</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Execuções (Mês)</CardDescription>
            <CardTitle className="text-3xl">{execucoesTotais}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tarefas automatizadas</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Sucesso</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{sucessoMedio}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Média geral</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automacoes">Automações</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🚀 Automações Mais Impactantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automacoes
                  .sort((a, b) => b.economia_horas - a.economia_horas)
                  .map(auto => (
                    <div key={auto.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{auto.nome}</div>
                          <div className="text-xs text-gray-600">{auto.descricao}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">{auto.economia_horas}h</div>
                          <div className="text-xs text-gray-500">economia/mês</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automacoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Automações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automacoes.map(auto => (
                  <Card key={auto.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{auto.nome}</div>
                        <div className="text-sm text-gray-600">{auto.descricao}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(auto.status)}`}>
                        {auto.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Ações:</p>
                      <div className="flex gap-1 flex-wrap">
                        {auto.acoes.map((acao, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">
                            {idx + 1}. {acao}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Execuções/Mês</p>
                        <p className="font-bold">{auto.execucoes_mes}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Taxa Sucesso</p>
                        <p className="font-bold text-green-600">{auto.taxa_sucesso}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Economia</p>
                        <p className="font-bold text-blue-600">{auto.economia_horas}h</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {execucoes.map(exec => (
                  <Card key={exec.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{exec.automacao}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {exec.itens_processados} itens • {exec.tempo_execucao}ms
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          exec.status === 'sucesso'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {exec.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{exec.data}</div>
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
