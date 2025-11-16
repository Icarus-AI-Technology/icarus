/**
 * ICARUS v5.0 - Módulo: Consignação Avançada
 * Categoria: Compras & Logística
 * Descrição: Gestão de produtos OPME em consignação nos hospitais
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'

type StatusConsignacao = 'ativa' | 'parcial_utilizada' | 'totalmente_utilizada' | 'vencida' | 'retornada'
type TipoMovimento = 'envio' | 'utilizacao' | 'retorno' | 'reposicao'

interface ItemConsignacao {
  id: number
  produto_id: string
  produto_nome: string
  lote: string
  validade: string
  quantidade_enviada: number
  quantidade_utilizada: number
  quantidade_disponivel: number
  valor_unitario: number
  hospital_id: string
  hospital_nome: string
  data_envio: string
  cirurgia_id?: string
  status: StatusConsignacao
  dias_consignacao: number
  urgente?: boolean
}

interface MovimentoConsignacao {
  id: number
  consignacao_id: number
  tipo: TipoMovimento
  quantidade: number
  data: string
  usuario: string
  observacoes?: string
  nf_numero?: string
}

interface FaturamentoConsignacao {
  id: number
  hospital_id: string
  hospital_nome: string
  periodo: string
  itens_utilizados: number
  valor_total: number
  nf_numero?: string
  data_faturamento?: string
  status: 'pendente' | 'faturado' | 'pago'
}

export default function ConsignacaoAvancada() {
  const [activeTab, setActiveTab] = useState('overview')
  const [consignacoes] = useState<ItemConsignacao[]>([
    {
      id: 1,
      produto_id: 'OPME-001',
      produto_nome: 'Prótese Articular Joelho - Titanium Pro',
      lote: 'LOT-2025-001',
      validade: '2027-12-31',
      quantidade_enviada: 5,
      quantidade_utilizada: 3,
      quantidade_disponivel: 2,
      valor_unitario: 45000,
      hospital_id: 'HOSP-001',
      hospital_nome: 'Hospital Sírio-Libanês',
      data_envio: '2025-11-01',
      cirurgia_id: 'CIR-2025-123',
      status: 'parcial_utilizada',
      dias_consignacao: 15,
      urgente: false
    },
    {
      id: 2,
      produto_id: 'OPME-002',
      produto_nome: 'Stent Coronariano - CardioFlow Elite',
      lote: 'LOT-2025-045',
      validade: '2026-06-30',
      quantidade_enviada: 10,
      quantidade_utilizada: 0,
      quantidade_disponivel: 10,
      valor_unitario: 8500,
      hospital_id: 'HOSP-002',
      hospital_nome: 'Hospital Albert Einstein',
      data_envio: '2025-11-10',
      status: 'ativa',
      dias_consignacao: 6,
      urgente: true
    },
    {
      id: 3,
      produto_id: 'OPME-003',
      produto_nome: 'Placa Ortopédica Titânio - OrthoFix Pro',
      lote: 'LOT-2025-089',
      validade: '2028-03-15',
      quantidade_enviada: 8,
      quantidade_utilizada: 8,
      quantidade_disponivel: 0,
      valor_unitario: 12000,
      hospital_id: 'HOSP-001',
      hospital_nome: 'Hospital Sírio-Libanês',
      data_envio: '2025-10-20',
      cirurgia_id: 'CIR-2025-095',
      status: 'totalmente_utilizada',
      dias_consignacao: 27,
      urgente: false
    }
  ])

  const [movimentos] = useState<MovimentoConsignacao[]>([
    {
      id: 1,
      consignacao_id: 1,
      tipo: 'envio',
      quantidade: 5,
      data: '2025-11-01',
      usuario: 'João Silva',
      observacoes: 'Envio inicial para cirurgias programadas'
    },
    {
      id: 2,
      consignacao_id: 1,
      tipo: 'utilizacao',
      quantidade: 3,
      data: '2025-11-10',
      usuario: 'Maria Santos',
      observacoes: 'Utilizado em cirurgia CIR-2025-123',
      nf_numero: 'NF-123456'
    },
    {
      id: 3,
      consignacao_id: 3,
      tipo: 'utilizacao',
      quantidade: 8,
      data: '2025-11-05',
      usuario: 'Carlos Oliveira',
      observacoes: 'Utilizado completamente',
      nf_numero: 'NF-123457'
    }
  ])

  const [faturamentos] = useState<FaturamentoConsignacao[]>([
    {
      id: 1,
      hospital_id: 'HOSP-001',
      hospital_nome: 'Hospital Sírio-Libanês',
      periodo: 'Novembro/2025',
      itens_utilizados: 11,
      valor_total: 231000,
      nf_numero: 'NF-123456',
      data_faturamento: '2025-11-15',
      status: 'faturado'
    },
    {
      id: 2,
      hospital_id: 'HOSP-002',
      hospital_nome: 'Hospital Albert Einstein',
      periodo: 'Novembro/2025',
      itens_utilizados: 0,
      valor_total: 0,
      status: 'pendente'
    }
  ])

  // KPIs
  const totalItensConsignacao = consignacoes.reduce((sum, c) => sum + c.quantidade_disponivel, 0)
  const valorEmConsignacao = consignacoes.reduce(
    (sum, c) => sum + c.quantidade_disponivel * c.valor_unitario,
    0
  )
  const itensUtilizadosMes = consignacoes.reduce((sum, c) => sum + c.quantidade_utilizada, 0)
  const faturamentoPendente = faturamentos
    .filter(f => f.status === 'pendente')
    .reduce((sum, f) => sum + f.valor_total, 0)

  const getBadgeColor = (status: StatusConsignacao) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'parcial_utilizada':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'totalmente_utilizada':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'vencida':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'retornada':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getMovimentoBadge = (tipo: TipoMovimento) => {
    switch (tipo) {
      case 'envio':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'utilizacao':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'retorno':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'reposicao':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Consignação Avançada</h1>
          <p className="text-muted-foreground">Gestão de produtos OPME em consignação</p>
        </div>
        <Button>+ Novo Envio</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Itens em Consignação</CardDescription>
            <CardTitle className="text-3xl">{totalItensConsignacao}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {consignacoes.filter(c => c.status === 'ativa').length} consignações ativas
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor em Consignação</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {formatCurrency(valorEmConsignacao)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Capital imobilizado</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Utilizados (Mês)</CardDescription>
            <CardTitle className="text-3xl text-green-600">{itensUtilizadosMes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Pronto para faturar</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-orange-200">
          <CardHeader className="pb-2">
            <CardDescription>Faturamento Pendente</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {formatCurrency(faturamentoPendente)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-600">Aguardando emissão NF</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consignacoes">Consignações</TabsTrigger>
          <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>⚠️ Alertas de Consignação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consignacoes
                    .filter(c => c.urgente || c.dias_consignacao > 20)
                    .map(item => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg ${item.urgente ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{item.produto_nome}</div>
                            <div className="text-sm text-gray-600">{item.hospital_nome}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.quantidade_disponivel} itens • {formatCurrency(item.valor_unitario)} cada
                            </div>
                          </div>
                          <div className="text-right">
                            {item.urgente && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 border border-red-400">
                                URGENTE
                              </span>
                            )}
                            {item.dias_consignacao > 20 && (
                              <div className="text-xs text-orange-600 mt-1">
                                {item.dias_consignacao} dias
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📊 Por Hospital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(consignacoes.map(c => c.hospital_id))).map(hospitalId => {
                    const itensHospital = consignacoes.filter(c => c.hospital_id === hospitalId)
                    const hospital = itensHospital[0]
                    const qtdTotal = itensHospital.reduce((sum, c) => sum + c.quantidade_disponivel, 0)
                    const valorTotal = itensHospital.reduce(
                      (sum, c) => sum + c.quantidade_disponivel * c.valor_unitario,
                      0
                    )
                    return (
                      <div key={hospitalId} className="p-3 border rounded-lg">
                        <div className="font-bold">{hospital.hospital_nome}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">Itens:</span>{' '}
                            <span className="font-semibold">{qtdTotal}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valor:</span>{' '}
                            <span className="font-semibold">{formatCurrency(valorTotal)}</span>
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
              <CardTitle>🔄 Últimos Movimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movimentos.slice(0, 5).map(mov => (
                  <div key={mov.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getMovimentoBadge(mov.tipo)}`}
                      >
                        {mov.tipo.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="ml-2 text-sm">{mov.observacoes}</span>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>{formatDate(mov.data)}</div>
                      <div>{mov.usuario}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CONSIGNAÇÕES */}
        <TabsContent value="consignacoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Todas as Consignações</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="todos">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="parcial">Parcial Utilizada</SelectItem>
                      <SelectItem value="utilizada">Totalmente Utilizada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Buscar produto..." className="w-[250px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consignacoes.map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="col-span-2">
                        <div className="font-bold">{item.produto_nome}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.hospital_nome}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Lote: {item.lote} • Validade: {formatDate(item.validade)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quantidade</p>
                        <p className="text-sm">
                          Enviada: <span className="font-semibold">{item.quantidade_enviada}</span>
                        </p>
                        <p className="text-sm">
                          Utilizada: <span className="font-semibold">{item.quantidade_utilizada}</span>
                        </p>
                        <p className="text-sm">
                          Disponível: <span className="font-semibold text-blue-600">{item.quantidade_disponivel}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valor Unitário</p>
                        <p className="text-lg font-bold">{formatCurrency(item.valor_unitario)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Total: {formatCurrency(item.valor_unitario * item.quantidade_disponivel)}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getBadgeColor(item.status)}`}>
                          {item.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">{item.dias_consignacao} dias em consignação</p>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Registrar Uso
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Retornar
                          </Button>
                        </div>
                      </div>
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
              <CardTitle>Histórico de Movimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movimentos.map(mov => {
                  const consignacao = consignacoes.find(c => c.id === mov.consignacao_id)
                  return (
                    <div key={mov.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${getMovimentoBadge(mov.tipo)}`}
                            >
                              {mov.tipo.toUpperCase().replace('_', ' ')}
                            </span>
                            <span className="font-semibold">{mov.quantidade} unidades</span>
                          </div>
                          <div className="text-sm mt-1">{consignacao?.produto_nome}</div>
                          <div className="text-xs text-gray-600">{consignacao?.hospital_nome}</div>
                          {mov.observacoes && (
                            <div className="text-xs text-gray-500 mt-1 italic">{mov.observacoes}</div>
                          )}
                          {mov.nf_numero && (
                            <div className="text-xs text-blue-600 mt-1">NF: {mov.nf_numero}</div>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>{formatDate(mov.data)}</div>
                          <div className="mt-1">{mov.usuario}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: FATURAMENTO */}
        <TabsContent value="faturamento" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Faturamento de Consignações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faturamentos.map(fat => (
                  <Card key={fat.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-bold">{fat.hospital_nome}</div>
                        <div className="text-sm text-gray-600">{fat.periodo}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Itens Utilizados</p>
                        <p className="text-2xl font-bold">{fat.itens_utilizados}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valor Total</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(fat.valor_total)}</p>
                      </div>
                      <div>
                        {fat.status === 'pendente' && (
                          <>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                              PENDENTE
                            </span>
                            <Button size="sm" className="w-full mt-2">
                              Emitir NF
                            </Button>
                          </>
                        )}
                        {fat.status === 'faturado' && (
                          <>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                              FATURADO
                            </span>
                            <p className="text-xs text-gray-600 mt-2">NF: {fat.nf_numero}</p>
                            <p className="text-xs text-gray-500">{formatDate(fat.data_faturamento!)}</p>
                          </>
                        )}
                        {fat.status === 'pago' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">
                            PAGO
                          </span>
                        )}
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
              <CardTitle>📊 Análise de Consignação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Taxa de Utilização</p>
                  <p className="text-3xl font-bold text-green-600">
                    {(
                      (consignacoes.reduce((sum, c) => sum + c.quantidade_utilizada, 0) /
                        consignacoes.reduce((sum, c) => sum + c.quantidade_enviada, 0)) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Tempo Médio Consignação</p>
                  <p className="text-3xl font-bold">
                    {(consignacoes.reduce((sum, c) => sum + c.dias_consignacao, 0) / consignacoes.length).toFixed(0)}{' '}
                    dias
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Capital Imobilizado</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(valorEmConsignacao)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
