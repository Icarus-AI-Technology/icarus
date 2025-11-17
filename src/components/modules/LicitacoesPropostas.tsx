/**
 * ICARUS v5.0 - Módulo: Licitações & Propostas
 * Categoria: Compras & Fornecedores
 * Descrição: Gestão de licitações públicas e propostas comerciais
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusLicitacao = 'aberta' | 'em_elaboracao' | 'enviada' | 'em_analise' | 'vencida' | 'perdida' | 'cancelada'
type ModalidadeLicitacao = 'pregao' | 'concorrencia' | 'tomada_precos' | 'convite' | 'rdc'
type TipoOrgao = 'federal' | 'estadual' | 'municipal' | 'autarquia'

interface Licitacao {
  id: string
  numero_edital: string
  orgao: string
  tipo_orgao: TipoOrgao
  modalidade: ModalidadeLicitacao
  objeto: string
  status: StatusLicitacao
  valor_estimado: number
  data_publicacao: string
  data_abertura: string
  data_limite_proposta: string
  nossa_proposta?: number
  probabilidade_vitoria: number
  responsavel: string
}

interface ItemProposta {
  id: string
  licitacao_id: string
  item_edital: number
  descricao: string
  quantidade: number
  unidade: string
  preco_referencia: number
  nossa_cotacao: number
  desconto_aplicado: number
  preco_proposto: number
  marca_fabricante: string
}

export default function LicitacoesPropostas() {
  const [activeTab, setActiveTab] = useState('overview')

  const [licitacoes] = useState<Licitacao[]>([
    {
      id: 'lic-001',
      numero_edital: 'PE 042/2025',
      orgao: 'Hospital das Clínicas - SP',
      tipo_orgao: 'estadual',
      modalidade: 'pregao',
      objeto: 'Aquisição de OPME - Ortopedia e Traumatologia',
      status: 'em_elaboracao',
      valor_estimado: 2850000.00,
      data_publicacao: '2025-11-01',
      data_abertura: '2025-11-20',
      data_limite_proposta: '2025-11-18',
      nossa_proposta: 2456000.00,
      probabilidade_vitoria: 75,
      responsavel: 'João Silva'
    },
    {
      id: 'lic-002',
      numero_edital: 'CC 018/2025',
      orgao: 'Ministério da Saúde',
      tipo_orgao: 'federal',
      modalidade: 'concorrencia',
      objeto: 'Fornecimento de Marca-passos e Dispositivos Cardíacos',
      status: 'enviada',
      valor_estimado: 5200000.00,
      data_publicacao: '2025-10-15',
      data_abertura: '2025-11-25',
      data_limite_proposta: '2025-11-22',
      nossa_proposta: 4850000.00,
      probabilidade_vitoria: 60,
      responsavel: 'Maria Santos'
    },
    {
      id: 'lic-003',
      numero_edital: 'TP 031/2025',
      orgao: 'Prefeitura Municipal de Campinas',
      tipo_orgao: 'municipal',
      modalidade: 'tomada_precos',
      objeto: 'Material OPME - Cirurgia Geral',
      status: 'perdida',
      valor_estimado: 980000.00,
      data_publicacao: '2025-10-05',
      data_abertura: '2025-10-30',
      data_limite_proposta: '2025-10-28',
      nossa_proposta: 1050000.00,
      probabilidade_vitoria: 35,
      responsavel: 'Carlos Oliveira'
    }
  ])

  const [itensProposta] = useState<ItemProposta[]>([
    {
      id: 'item-001',
      licitacao_id: 'lic-001',
      item_edital: 1,
      descricao: 'Prótese de Quadril Cimentada',
      quantidade: 50,
      unidade: 'UN',
      preco_referencia: 18500.00,
      nossa_cotacao: 16200.00,
      desconto_aplicado: 12.4,
      preco_proposto: 16200.00,
      marca_fabricante: 'Zimmer Biomet'
    },
    {
      id: 'item-002',
      licitacao_id: 'lic-001',
      item_edital: 2,
      descricao: 'Placa de Fixação Óssea - Titanium',
      quantidade: 120,
      unidade: 'UN',
      preco_referencia: 3800.00,
      nossa_cotacao: 3350.00,
      desconto_aplicado: 11.8,
      preco_proposto: 3350.00,
      marca_fabricante: 'Stryker'
    }
  ])

  const licitacoes_ativas = licitacoes.filter(l =>
    ['aberta', 'em_elaboracao', 'enviada', 'em_analise'].includes(l.status)
  ).length
  const valor_total = licitacoes
    .filter(l => l.nossa_proposta)
    .reduce((sum, l) => sum + (l.nossa_proposta || 0), 0)
  const prob_vitoria_media = licitacoes
    .filter(l => ['em_elaboracao', 'enviada', 'em_analise'].includes(l.status))
    .reduce((sum, l) => sum + l.probabilidade_vitoria, 0) /
    licitacoes.filter(l => ['em_elaboracao', 'enviada', 'em_analise'].includes(l.status)).length || 0
  const licitacoes_vencidas = licitacoes.filter(l => l.status === 'vencida').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📋 Licitações & Propostas</h1>
          <p className="text-muted-foreground">Gestão de licitações públicas e propostas comerciais</p>
        </div>
        <Button>+ Nova Licitação</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Licitações Ativas</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{licitacoes_ativas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Em andamento</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor em Propostas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{formatCurrency(valor_total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Total proposto</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Prob. Vitória Média</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{prob_vitoria_media.toFixed(0)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Licitações ativas</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Vencidas</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{licitacoes_vencidas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Este ano</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="licitacoes">Licitações</TabsTrigger>
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🏛️ Por Tipo de Órgão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { tipo: 'Federal', count: 1, valor: 4850000 },
                    { tipo: 'Estadual', count: 1, valor: 2456000 },
                    { tipo: 'Municipal', count: 1, valor: 1050000 }
                  ].map(item => (
                    <div key={item.tipo} className="p-2 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{item.tipo}</div>
                        <div className="text-xs text-gray-600">{item.count} licitação(ões)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(item.valor)}</div>
                        <div className="text-xs text-gray-500">proposto</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📊 Por Modalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { modalidade: 'Pregão', count: 1, percentual: 33.3 },
                    { modalidade: 'Concorrência', count: 1, percentual: 33.3 },
                    { modalidade: 'Tomada de Preços', count: 1, percentual: 33.3 }
                  ].map(item => (
                    <div key={item.modalidade} className="p-2 border rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{item.modalidade}</span>
                        <span className="text-sm">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentual}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>⏰ Próximos Prazos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {licitacoes
                  .filter(l => ['aberta', 'em_elaboracao', 'enviada'].includes(l.status))
                  .sort((a, b) => new Date(a.data_limite_proposta).getTime() - new Date(b.data_limite_proposta).getTime())
                  .map(lic => (
                    <div key={lic.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{lic.numero_edital} - {lic.orgao}</div>
                          <div className="text-xs text-gray-600">{lic.objeto}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-600">
                            Prazo: {lic.data_limite_proposta}
                          </div>
                          <div className="text-xs text-gray-500">
                            Abertura: {lic.data_abertura}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licitacoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Licitações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {licitacoes.map(lic => (
                  <Card key={lic.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{lic.numero_edital}</div>
                        <div className="text-sm text-gray-600">{lic.orgao}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {lic.modalidade.toUpperCase()} • {lic.tipo_orgao.toUpperCase()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        lic.status === 'vencida' ? 'bg-green-100 text-green-800' :
                        lic.status === 'enviada' ? 'bg-blue-100 text-blue-800' :
                        lic.status === 'em_elaboracao' ? 'bg-yellow-100 text-yellow-800' :
                        lic.status === 'em_analise' ? 'bg-purple-100 text-purple-800' :
                        lic.status === 'perdida' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lic.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mb-3 text-sm">{lic.objeto}</div>

                    <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Valor Estimado</p>
                        <p className="font-bold">{formatCurrency(lic.valor_estimado)}</p>
                      </div>
                      {lic.nossa_proposta && (
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Nossa Proposta</p>
                          <p className="font-bold text-green-600">{formatCurrency(lic.nossa_proposta)}</p>
                        </div>
                      )}
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Prob. Vitória</p>
                        <p className="font-bold text-purple-600">{lic.probabilidade_vitoria}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Responsável</p>
                        <p className="font-bold text-sm">{lic.responsavel}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="font-semibold">Publicação:</span> {lic.data_publicacao}
                        </div>
                        <div>
                          <span className="font-semibold">Limite Proposta:</span> {lic.data_limite_proposta}
                        </div>
                        <div>
                          <span className="font-semibold">Abertura:</span> {lic.data_abertura}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">📄 Ver Edital</Button>
                      <Button size="sm" variant="outline">📝 Elaborar Proposta</Button>
                      <Button size="sm" variant="outline">📊 Análise</Button>
                      {lic.status === 'em_elaboracao' && (
                        <Button size="sm" variant="default">📤 Enviar Proposta</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="propostas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📋 Itens da Proposta</CardTitle>
              <CardDescription>Licitação: PE 042/2025 - Hospital das Clínicas SP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itensProposta.map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold">Item {item.item_edital}: {item.descricao}</div>
                        <div className="text-xs text-gray-600">
                          {item.quantidade} {item.unidade} • {item.marca_fabricante}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Preço Ref.</p>
                        <p className="font-bold">{formatCurrency(item.preco_referencia)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Nossa Cotação</p>
                        <p className="font-bold">{formatCurrency(item.nossa_cotacao)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Desconto</p>
                        <p className="font-bold text-green-600">{item.desconto_aplicado.toFixed(1)}%</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Preço Proposto</p>
                        <p className="font-bold text-blue-600">{formatCurrency(item.preco_proposto)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Total Item</p>
                        <p className="font-bold text-purple-600">
                          {formatCurrency(item.preco_proposto * item.quantidade)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}

                <Card className="p-4 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total da Proposta:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        itensProposta.reduce((sum, item) => sum + (item.preco_proposto * item.quantidade), 0)
                      )}
                    </span>
                  </div>
                </Card>

                <Button className="w-full">+ Adicionar Item à Proposta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📅 Calendário de Licitações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">Prazos e datas importantes das licitações:</p>

                <div className="space-y-3">
                  {licitacoes
                    .filter(l => ['aberta', 'em_elaboracao', 'enviada', 'em_analise'].includes(l.status))
                    .map(lic => (
                      <Card key={lic.id} className="p-4">
                        <div className="font-bold mb-2">{lic.numero_edital} - {lic.orgao}</div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-24 text-sm text-gray-600">Publicação:</div>
                            <div className="font-semibold">{lic.data_publicacao}</div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              Concluído
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-24 text-sm text-gray-600">Limite Proposta:</div>
                            <div className="font-semibold text-red-600">{lic.data_limite_proposta}</div>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              ⚠️ Prazo crítico
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-24 text-sm text-gray-600">Abertura:</div>
                            <div className="font-semibold">{lic.data_abertura}</div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              Agendado
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Responsável: {lic.responsavel}</span>
                            <Button size="sm" variant="outline">🔔 Criar Lembrete</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
