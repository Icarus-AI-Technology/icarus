/**
 * ICARUS v5.0 - Módulo: Rastreabilidade OPME
 * Categoria: Compras & Logística
 * Descrição: Rastreamento completo ANVISA de produtos OPME (lote, validade, distribuição)
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useLotes, useRastreabilidade } from '@/hooks/queries/useLogistica'

type StatusRastreio = 'estoque' | 'consignado' | 'vendido' | 'devolvido' | 'vencido' | 'bloqueado'

interface ProdutoRastreavel {
  id: number
  codigo_anvisa: string
  produto_nome: string
  categoria: string
  fabricante: string
  registro_ms: string
  lote: string
  serie?: string
  data_fabricacao: string
  data_validade: string
  quantidade: number
  unidade: string
  valor_unitario: number
  status: StatusRastreio
  localizacao: string
  notas_fiscais: string[]
  restricoes?: string
  temperatura_armazenamento?: string
}

interface EventoRastreamento {
  id: number
  produto_id: number
  tipo_evento: 'entrada' | 'saida' | 'transferencia' | 'bloqueio' | 'liberacao' | 'descarte'
  data_evento: string
  hora_evento: string
  responsavel: string
  origem?: string
  destino?: string
  quantidade: number
  nf_numero?: string
  observacoes?: string
}

interface AlertaRegulatorio {
  id: number
  tipo: 'vencimento_proximo' | 'lote_bloqueado' | 'recall' | 'documentacao_pendente'
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  produto_id: number
  produto_nome: string
  lote: string
  mensagem: string
  data_alerta: string
  status: 'aberto' | 'em_tratamento' | 'resolvido'
}

export default function RastreabilidadeOPME() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  
  // React Query hooks
  const { data: _lotesData } = useLotes()
  const { data: _rastreabilidadeData } = useRastreabilidade(searchTerm)

  const [produtos] = useState<ProdutoRastreavel[]>([
    {
      id: 1,
      codigo_anvisa: '80149900001',
      produto_nome: 'Prótese Articular Joelho - Titanium Pro',
      categoria: 'Próteses Ortopédicas',
      fabricante: 'MedTech Solutions',
      registro_ms: 'MS-10234567890',
      lote: 'LOT-2025-001',
      serie: 'SER-001234',
      data_fabricacao: '2025-01-15',
      data_validade: '2027-12-31',
      quantidade: 12,
      unidade: 'UN',
      valor_unitario: 45000,
      status: 'estoque',
      localizacao: 'Armazém A - Prateleira 23',
      notas_fiscais: ['NF-001234', 'NF-001235'],
      temperatura_armazenamento: '15-25°C'
    },
    {
      id: 2,
      codigo_anvisa: '80149900002',
      produto_nome: 'Stent Coronariano - CardioFlow Elite',
      categoria: 'Implantes Cardiovasculares',
      fabricante: 'CardioTech International',
      registro_ms: 'MS-20345678901',
      lote: 'LOT-2025-045',
      serie: 'SER-045678',
      data_fabricacao: '2025-03-10',
      data_validade: '2026-06-30',
      quantidade: 25,
      unidade: 'UN',
      valor_unitario: 8500,
      status: 'consignado',
      localizacao: 'Hospital Albert Einstein',
      notas_fiscais: ['NF-002345'],
      restricoes: 'Manter em temperatura controlada',
      temperatura_armazenamento: '2-8°C'
    },
    {
      id: 3,
      codigo_anvisa: '80149900003',
      produto_nome: 'Placa Ortopédica Titânio - OrthoFix Pro',
      categoria: 'Placas e Parafusos',
      fabricante: 'OrthoSystems Brasil',
      registro_ms: 'MS-30456789012',
      lote: 'LOT-2024-189',
      data_fabricacao: '2024-11-20',
      data_validade: '2025-11-30',
      quantidade: 5,
      unidade: 'UN',
      valor_unitario: 12000,
      status: 'vencido',
      localizacao: 'Armazém B - Quarentena',
      notas_fiscais: ['NF-003456'],
      temperatura_armazenamento: 'Ambiente'
    }
  ])

  const [eventos] = useState<EventoRastreamento[]>([
    {
      id: 1,
      produto_id: 1,
      tipo_evento: 'entrada',
      data_evento: '2025-01-20',
      hora_evento: '14:30',
      responsavel: 'João Silva',
      origem: 'MedTech Solutions',
      quantidade: 12,
      nf_numero: 'NF-001234',
      observacoes: 'Recebimento de lote completo'
    },
    {
      id: 2,
      produto_id: 2,
      tipo_evento: 'saida',
      data_evento: '2025-11-10',
      hora_evento: '09:15',
      responsavel: 'Maria Santos',
      destino: 'Hospital Albert Einstein',
      quantidade: 25,
      nf_numero: 'NF-002345',
      observacoes: 'Consignação para cirurgias programadas'
    },
    {
      id: 3,
      produto_id: 3,
      tipo_evento: 'bloqueio',
      data_evento: '2025-11-15',
      hora_evento: '16:00',
      responsavel: 'Carlos Oliveira',
      quantidade: 5,
      observacoes: 'Bloqueio por vencimento próximo (30 dias)'
    }
  ])

  const [alertas] = useState<AlertaRegulatorio[]>([
    {
      id: 1,
      tipo: 'vencimento_proximo',
      severidade: 'alta',
      produto_id: 3,
      produto_nome: 'Placa Ortopédica Titânio - OrthoFix Pro',
      lote: 'LOT-2024-189',
      mensagem: 'Produto vencerá em 14 dias - iniciar processo de devolução ao fornecedor',
      data_alerta: '2025-11-16',
      status: 'aberto'
    },
    {
      id: 2,
      tipo: 'documentacao_pendente',
      severidade: 'media',
      produto_id: 1,
      produto_nome: 'Prótese Articular Joelho - Titanium Pro',
      lote: 'LOT-2025-001',
      mensagem: 'Certificado de esterilização não anexado ao lote',
      data_alerta: '2025-11-14',
      status: 'em_tratamento'
    },
    {
      id: 3,
      tipo: 'recall',
      severidade: 'critica',
      produto_id: 2,
      produto_nome: 'Stent Coronariano - CardioFlow Elite',
      lote: 'LOT-2025-045',
      mensagem: 'ANVISA emitiu recall preventivo - comunicar hospitais imediatamente',
      data_alerta: '2025-11-15',
      status: 'aberto'
    }
  ])

  // KPIs
  const totalProdutosRastreados = produtos.reduce((sum, p) => sum + p.quantidade, 0)
  const produtosConsignados = produtos.filter(p => p.status === 'consignado').length
  const alertasAbertos = alertas.filter(a => a.status === 'aberto').length
  const valorTotalEstoque = produtos
    .filter(p => p.status === 'estoque' || p.status === 'consignado')
    .reduce((sum, p) => sum + p.quantidade * p.valor_unitario, 0)

  const getBadgeColor = (status: StatusRastreio) => {
    switch (status) {
      case 'estoque':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'consignado':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'vendido':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'bloqueado':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'devolvido':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSeveridadeColor = (severidade: AlertaRegulatorio['severidade']) => {
    switch (severidade) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-400'
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'baixa':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getEventoIcon = (tipo: EventoRastreamento['tipo_evento']) => {
    switch (tipo) {
      case 'entrada':
        return '📥'
      case 'saida':
        return '📤'
      case 'transferencia':
        return '🔄'
      case 'bloqueio':
        return '🔒'
      case 'liberacao':
        return '🔓'
      case 'descarte':
        return '🗑️'
      default:
        return '📋'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rastreabilidade OPME</h1>
          <p className="text-muted-foreground">Rastreamento completo ANVISA - Lote, Validade, Distribuição</p>
        </div>
        <Button>+ Registrar Produto</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Produtos Rastreados</CardDescription>
            <CardTitle className="text-3xl">{totalProdutosRastreados}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{produtos.length} lotes diferentes</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Em Consignação</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{produtosConsignados}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Rastreamento ativo</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Alertas Abertos</CardDescription>
            <CardTitle className="text-3xl text-red-600">{alertasAbertos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">Requer atenção imediata</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total Rastreado</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(valorTotalEstoque)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Estoque + Consignação</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic border-red-200">
              <CardHeader>
                <CardTitle>⚠️ Alertas Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertas
                    .filter(a => a.severidade === 'critica' || a.severidade === 'alta')
                    .map(alerta => (
                      <div
                        key={alerta.id}
                        className={`p-3 rounded-lg border ${getSeveridadeColor(alerta.severidade)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold">{alerta.produto_nome}</div>
                            <div className="text-sm mt-1">{alerta.mensagem}</div>
                            <div className="text-xs text-gray-600 mt-1">Lote: {alerta.lote}</div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getSeveridadeColor(alerta.severidade)}`}
                          >
                            {alerta.severidade.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Button size="sm" variant="outline">
                            Tratar Alerta
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📊 Status de Rastreamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['estoque', 'consignado', 'vendido', 'vencido'] as StatusRastreio[]).map(status => {
                    const count = produtos.filter(p => p.status === status).length
                    const qtd = produtos.filter(p => p.status === status).reduce((sum, p) => sum + p.quantidade, 0)
                    return (
                      <div key={status} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {count} lotes • {qtd} unidades
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(status)}`}>
                            {status.toUpperCase()}
                          </span>
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
              <CardTitle>🔄 Eventos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eventos.slice(0, 5).map(evento => {
                  const produto = produtos.find(p => p.id === evento.produto_id)
                  return (
                    <div key={evento.id} className="p-3 border rounded-lg flex items-center gap-3">
                      <div className="text-2xl">{getEventoIcon(evento.tipo_evento)}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{produto?.produto_nome}</div>
                        <div className="text-sm text-gray-600">
                          {evento.tipo_evento.toUpperCase().replace('_', ' ')} • {evento.quantidade} {produto?.unidade}
                        </div>
                        {evento.observacoes && <div className="text-xs text-gray-500 italic">{evento.observacoes}</div>}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{formatDate(evento.data_evento)}</div>
                        <div>{evento.hora_evento}</div>
                        <div>{evento.responsavel}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PRODUTOS */}
        <TabsContent value="produtos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Catálogo de Produtos Rastreáveis</CardTitle>
                <Input
                  placeholder="Buscar por lote, código ANVISA ou produto..."
                  className="w-[350px]"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {produtos.map(produto => (
                  <Card key={produto.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <div className="font-bold text-lg">{produto.produto_nome}</div>
                        <div className="text-sm text-gray-600 mt-1">{produto.fabricante}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Código ANVISA: {produto.codigo_anvisa} • Registro MS: {produto.registro_ms}
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(produto.status)}`}>
                            {produto.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rastreamento</p>
                        <p className="text-sm font-semibold">Lote: {produto.lote}</p>
                        {produto.serie && <p className="text-sm">Série: {produto.serie}</p>}
                        <p className="text-xs text-gray-600 mt-1">
                          Fabricação: {formatDate(produto.data_fabricacao)}
                        </p>
                        <p className="text-xs text-gray-600">Validade: {formatDate(produto.data_validade)}</p>
                        <p className="text-xs text-blue-600 mt-1">{produto.localizacao}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Estoque & Valor</p>
                        <p className="text-2xl font-bold">
                          {produto.quantidade} {produto.unidade}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{formatCurrency(produto.valor_unitario)}/un</p>
                        <p className="text-sm font-semibold mt-1">
                          Total: {formatCurrency(produto.quantidade * produto.valor_unitario)}
                        </p>
                        {produto.temperatura_armazenamento && (
                          <p className="text-xs text-orange-600 mt-2">🌡️ {produto.temperatura_armazenamento}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Histórico
                      </Button>
                      <Button size="sm" variant="outline">
                        Rastrear Distribuição
                      </Button>
                      <Button size="sm" variant="outline">
                        Documentos
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RASTREAMENTO */}
        <TabsContent value="rastreamento" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📍 Linha do Tempo - Rastreamento Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {produtos.map(produto => (
                  <Card key={produto.id} className="p-4">
                    <div className="mb-3">
                      <div className="font-bold text-lg">{produto.produto_nome}</div>
                      <div className="text-sm text-gray-600">Lote: {produto.lote}</div>
                    </div>
                    <div className="border-l-2 border-blue-300 pl-4 space-y-3">
                      {eventos
                        .filter(e => e.produto_id === produto.id)
                        .map((evento, _idx) => (
                          <div key={evento.id} className="relative">
                            <div className="absolute -left-6 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-semibold">
                                  {getEventoIcon(evento.tipo_evento)} {evento.tipo_evento.toUpperCase().replace('_', ' ')}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {evento.quantidade} {produto.unidade}
                                  {evento.origem && ` • De: ${evento.origem}`}
                                  {evento.destino && ` • Para: ${evento.destino}`}
                                </div>
                                {evento.observacoes && (
                                  <div className="text-xs text-gray-500 italic mt-1">{evento.observacoes}</div>
                                )}
                                {evento.nf_numero && (
                                  <div className="text-xs text-blue-600 mt-1">NF: {evento.nf_numero}</div>
                                )}
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                <div>{formatDate(evento.data_evento)}</div>
                                <div>{evento.hora_evento}</div>
                                <div>{evento.responsavel}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ALERTAS */}
        <TabsContent value="alertas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🚨 Alertas Regulatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.map(alerta => (
                  <Card key={alerta.id} className={`p-4 border-2 ${getSeveridadeColor(alerta.severidade)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeveridadeColor(alerta.severidade)}`}>
                            {alerta.severidade.toUpperCase()}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-100">
                            {alerta.tipo.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="font-bold text-lg mt-2">{alerta.produto_nome}</div>
                        <div className="text-sm text-gray-600">Lote: {alerta.lote}</div>
                        <div className="text-sm mt-2">{alerta.mensagem}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Alerta gerado em: {formatDate(alerta.data_alerta)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            alerta.status === 'aberto'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : alerta.status === 'em_tratamento'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : 'bg-green-100 text-green-800 border-green-300'
                          }`}
                        >
                          {alerta.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {alerta.status === 'aberto' && (
                        <Button size="sm" variant="default">
                          Iniciar Tratamento
                        </Button>
                      )}
                      {alerta.status === 'em_tratamento' && (
                        <Button size="sm" variant="default">
                          Resolver
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
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
              <CardTitle>📊 Relatórios de Conformidade ANVISA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Taxa de Rastreabilidade</p>
                  <p className="text-3xl font-bold text-green-600">100%</p>
                  <p className="text-xs text-gray-500 mt-1">Todos os produtos rastreados</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Conformidade Regulatória</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {((produtos.length - alertas.filter(a => a.status === 'aberto').length) / produtos.length * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{alertas.filter(a => a.status === 'aberto').length} pendências</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Produtos Próximos ao Vencimento</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {produtos.filter(p => {
                      const diasRestantes = Math.floor(
                        (new Date(p.data_validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      )
                      return diasRestantes < 90 && diasRestantes > 0
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Próximos 90 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
