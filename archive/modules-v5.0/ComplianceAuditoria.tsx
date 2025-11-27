/**
 * ICARUS v5.0 - Módulo: Compliance & Auditoria
 * Categoria: Financeiro & Compliance
 * Descrição: Conformidade regulatória ANVISA, auditorias e controles internos
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { formatDate } from '@/lib/utils/formatters'
import { useComplianceStats, useAuditorias, useNaoConformidades, useAnvisaStatus, useLGPDStatus } from '@/hooks/queries/useCompliance'

type StatusAuditoria = 'planejada' | 'em_andamento' | 'concluida' | 'nao_conformidade'
type TipoAuditoria = 'interna' | 'externa' | 'anvisa' | 'iso' | 'financeira'
type SeveridadeNC = 'baixa' | 'media' | 'alta' | 'critica'
type StatusCompliance = 'conforme' | 'nao_conforme' | 'em_adequacao' | 'vencido'

interface Auditoria {
  id: number
  tipo: TipoAuditoria
  titulo: string
  auditor: string
  data_inicio: string
  data_fim: string
  status: StatusAuditoria
  escopo: string
  nao_conformidades: number
  observacoes: number
  relatorio_url?: string
}

interface NaoConformidade {
  id: number
  auditoria_id: number
  codigo: string
  descricao: string
  severidade: SeveridadeNC
  requisito_violado: string
  area_responsavel: string
  data_identificacao: string
  prazo_correcao: string
  acao_corretiva: string
  status: 'aberta' | 'em_correcao' | 'concluida' | 'vencida'
  responsavel: string
}

interface RequisitoCompliance {
  id: number
  categoria: 'anvisa' | 'iso' | 'lgpd' | 'fiscal' | 'trabalhista'
  codigo: string
  requisito: string
  status: StatusCompliance
  ultima_verificacao: string
  proxima_verificacao: string
  responsavel: string
  evidencias: number
}

interface DocumentoCompliance {
  id: number
  tipo: 'politica' | 'procedimento' | 'instrucao' | 'registro'
  titulo: string
  codigo: string
  versao: string
  data_aprovacao: string
  data_validade: string
  status: 'vigente' | 'em_revisao' | 'obsoleto' | 'vencido'
  responsavel: string
}

export default function ComplianceAuditoria() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // React Query hooks
  const { data: _complianceStats } = useComplianceStats()
  const { data: _auditoriasData } = useAuditorias()
  const { data: _naoConformidadesData } = useNaoConformidades()
  const { data: _anvisaStatus } = useAnvisaStatus()
  const { data: _lgpdStatus } = useLGPDStatus()

  const [auditorias] = useState<Auditoria[]>([
    {
      id: 1,
      tipo: 'anvisa',
      titulo: 'Auditoria ANVISA - Rastreabilidade OPME',
      auditor: 'ANVISA - Regional SP',
      data_inicio: '2025-11-20',
      data_fim: '2025-11-22',
      status: 'planejada',
      escopo: 'Verificação de rastreabilidade de dispositivos médicos conforme RDC 16/2013',
      nao_conformidades: 0,
      observacoes: 0
    },
    {
      id: 2,
      tipo: 'interna',
      titulo: 'Auditoria Interna - Gestão de Estoque',
      auditor: 'Carlos Oliveira',
      data_inicio: '2025-11-10',
      data_fim: '2025-11-12',
      status: 'concluida',
      escopo: 'Verificação de controles de estoque, validades e lotes',
      nao_conformidades: 2,
      observacoes: 5,
      relatorio_url: '/relatorios/AUD-2025-001.pdf'
    },
    {
      id: 3,
      tipo: 'iso',
      titulo: 'Auditoria ISO 13485 - Dispositivos Médicos',
      auditor: 'Bureau Veritas',
      data_inicio: '2025-10-15',
      data_fim: '2025-10-18',
      status: 'nao_conformidade',
      escopo: 'Auditoria de manutenção da certificação ISO 13485',
      nao_conformidades: 3,
      observacoes: 8,
      relatorio_url: '/relatorios/AUD-2025-002.pdf'
    }
  ])

  const [naoConformidades] = useState<NaoConformidade[]>([
    {
      id: 1,
      auditoria_id: 2,
      codigo: 'NC-2025-001',
      descricao: 'Falta de registro de temperatura em 2 dias do período auditado',
      severidade: 'media',
      requisito_violado: 'RDC 16/2013 - Art. 15',
      area_responsavel: 'Logística',
      data_identificacao: '2025-11-11',
      prazo_correcao: '2025-11-25',
      acao_corretiva: 'Implementar sistema automático de monitoramento de temperatura com alertas',
      status: 'em_correcao',
      responsavel: 'João Silva'
    },
    {
      id: 2,
      auditoria_id: 3,
      codigo: 'NC-2025-002',
      descricao: 'Procedimento de calibração de equipamentos não atualizado',
      severidade: 'alta',
      requisito_violado: 'ISO 13485:2016 - Cláusula 7.6',
      area_responsavel: 'Qualidade',
      data_identificacao: '2025-10-16',
      prazo_correcao: '2025-11-16',
      acao_corretiva: 'Revisão e atualização do POP-QUA-001 com novos parâmetros de calibração',
      status: 'vencida',
      responsavel: 'Maria Santos'
    },
    {
      id: 3,
      auditoria_id: 3,
      codigo: 'NC-2025-003',
      descricao: 'Treinamento de operadores de estoque não documentado',
      severidade: 'critica',
      requisito_violado: 'ISO 13485:2016 - Cláusula 6.2',
      area_responsavel: 'RH',
      data_identificacao: '2025-10-17',
      prazo_correcao: '2025-11-10',
      acao_corretiva: 'Elaborar plano de treinamento e registros de competência',
      status: 'vencida',
      responsavel: 'Pedro Costa'
    }
  ])

  const [requisitos] = useState<RequisitoCompliance[]>([
    {
      id: 1,
      categoria: 'anvisa',
      codigo: 'RDC-16/2013',
      requisito: 'Rastreabilidade de dispositivos médicos',
      status: 'conforme',
      ultima_verificacao: '2025-10-30',
      proxima_verificacao: '2025-12-30',
      responsavel: 'Qualidade',
      evidencias: 12
    },
    {
      id: 2,
      categoria: 'iso',
      codigo: 'ISO-13485',
      requisito: 'Sistema de Gestão da Qualidade para Dispositivos Médicos',
      status: 'nao_conforme',
      ultima_verificacao: '2025-10-18',
      proxima_verificacao: '2025-11-18',
      responsavel: 'Qualidade',
      evidencias: 8
    },
    {
      id: 3,
      categoria: 'lgpd',
      codigo: 'LGPD',
      requisito: 'Proteção de Dados Pessoais',
      status: 'conforme',
      ultima_verificacao: '2025-11-01',
      proxima_verificacao: '2026-02-01',
      responsavel: 'TI',
      evidencias: 15
    }
  ])

  const [documentos] = useState<DocumentoCompliance[]>([
    {
      id: 1,
      tipo: 'politica',
      titulo: 'Política de Gestão da Qualidade',
      codigo: 'POL-QUA-001',
      versao: '3.0',
      data_aprovacao: '2025-01-15',
      data_validade: '2026-01-15',
      status: 'vigente',
      responsavel: 'Diretor de Qualidade'
    },
    {
      id: 2,
      tipo: 'procedimento',
      titulo: 'Procedimento de Rastreabilidade OPME',
      codigo: 'POP-LOG-005',
      versao: '2.1',
      data_aprovacao: '2025-06-01',
      data_validade: '2025-12-01',
      status: 'em_revisao',
      responsavel: 'Gerente de Logística'
    },
    {
      id: 3,
      tipo: 'instrucao',
      titulo: 'Instrução de Trabalho - Calibração de Termômetros',
      codigo: 'IT-QUA-012',
      versao: '1.5',
      data_aprovacao: '2024-03-10',
      data_validade: '2025-03-10',
      status: 'vencido',
      responsavel: 'Coordenador de Qualidade'
    }
  ])

  // KPIs
  const auditoriasEmAndamento = auditorias.filter(a => a.status === 'em_andamento' || a.status === 'planejada').length
  const ncAbertasCriticas = naoConformidades.filter(n => n.status !== 'concluida' && (n.severidade === 'alta' || n.severidade === 'critica')).length
  const requisitosConformes = requisitos.filter(r => r.status === 'conforme').length
  const taxaConformidade = ((requisitosConformes / requisitos.length) * 100).toFixed(0)

  const getStatusAuditoriaBadge = (status: StatusAuditoria) => {
    switch (status) {
      case 'planejada':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'nao_conformidade':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-theme-muted text-theme-primary border-gray-300'
    }
  }

  const getSeveridadeBadge = (severidade: SeveridadeNC) => {
    switch (severidade) {
      case 'baixa':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-theme-muted text-theme-primary border-gray-300'
    }
  }

  const getStatusComplianceBadge = (status: StatusCompliance) => {
    switch (status) {
      case 'conforme':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'nao_conforme':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'em_adequacao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'vencido':
        return 'bg-theme-muted text-theme-primary border-gray-300'
      default:
        return 'bg-theme-muted text-theme-primary border-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance & Auditoria</h1>
          <p className="text-muted-foreground">Conformidade regulatória ANVISA, auditorias e controles internos</p>
        </div>
        <Button>+ Nova Auditoria</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Auditorias Ativas</CardDescription>
            <CardTitle className="text-3xl">{auditoriasEmAndamento}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Planejadas + Em andamento</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>NC Críticas Abertas</CardDescription>
            <CardTitle className="text-3xl text-red-600">{ncAbertasCriticas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">Requer ação imediata</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Conformidade</CardDescription>
            <CardTitle className="text-3xl text-green-600">{taxaConformidade}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">
              {requisitosConformes}/{requisitos.length} requisitos
            </p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Documentos Vigentes</CardDescription>
            <CardTitle className="text-3xl">{documentos.filter(d => d.status === 'vigente').length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{documentos.filter(d => d.status === 'vencido').length} vencidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="auditorias">Auditorias</TabsTrigger>
          <TabsTrigger value="nao_conformidades">Não Conformidades</TabsTrigger>
          <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic border-red-200">
              <CardHeader>
                <CardTitle>🚨 NC Críticas (Ação Urgente)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {naoConformidades
                    .filter(nc => (nc.severidade === 'critica' || nc.severidade === 'alta') && nc.status !== 'concluida')
                    .map(nc => (
                      <div key={nc.id} className={`p-3 border-2 rounded-lg ${nc.status === 'vencida' ? 'border-red-400 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-theme-secondary">{nc.codigo}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeveridadeBadge(nc.severidade)}`}>
                                {nc.severidade.toUpperCase()}
                              </span>
                              {nc.status === 'vencida' && (
                                <span className="text-xs px-2 py-0.5 rounded-full border bg-red-200 text-red-800 border-red-400">
                                  VENCIDA
                                </span>
                              )}
                            </div>
                            <div className="font-bold mt-2">{nc.descricao}</div>
                            <div className="text-xs text-theme-secondary mt-1">
                              Requisito: {nc.requisito_violado} • {nc.area_responsavel}
                            </div>
                            <div className="text-xs text-theme-muted mt-1">
                              Prazo: {formatDate(nc.prazo_correcao)} • Resp: {nc.responsavel}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-blue-700">Ação Corretiva:</p>
                          <p className="text-xs text-theme-secondary mt-1">{nc.acao_corretiva}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📋 Próximas Auditorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditorias
                    .filter(a => a.status === 'planejada' || a.status === 'em_andamento')
                    .map(aud => (
                      <div key={aud.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold">{aud.titulo}</div>
                            <div className="text-sm text-theme-secondary mt-1">Auditor: {aud.auditor}</div>
                            <div className="text-xs text-theme-muted mt-1">
                              {formatDate(aud.data_inicio)} a {formatDate(aud.data_fim)}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusAuditoriaBadge(aud.status)}`}>
                            {aud.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Requisitos de Compliance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['anvisa', 'iso', 'lgpd'] as const).map(cat => {
                  const reqs = requisitos.filter(r => r.categoria === cat)
                  const conformes = reqs.filter(r => r.status === 'conforme').length
                  return (
                    <div key={cat} className="p-4 border rounded-lg">
                      <p className="text-sm font-semibold uppercase">{cat}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-3 progress-bar-bg rounded-full overflow-hidden">
                          <div
                            className={`h-full w-(--progress) ${conformes === reqs.length ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ '--progress': `${(conformes / reqs.length) * 100}%` } as React.CSSProperties}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">
                          {conformes}/{reqs.length}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: AUDITORIAS */}
        <TabsContent value="auditorias" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Todas as Auditorias</CardTitle>
                <Select defaultValue="todas">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="ativas">Ativas</SelectItem>
                    <SelectItem value="concluidas">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditorias.map(aud => (
                  <Card key={aud.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 uppercase">
                            {aud.tipo}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusAuditoriaBadge(aud.status)}`}>
                            {aud.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-bold text-lg mt-2">{aud.titulo}</div>
                        <div className="text-sm text-theme-secondary">Auditor: {aud.auditor}</div>
                      </div>
                    </div>
                    <div className="text-sm text-theme-secondary mb-3">{aud.escopo}</div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="p-2 border rounded-lg">
                        <p className="text-xs text-theme-muted">Período</p>
                        <p className="text-sm font-semibold">
                          {formatDate(aud.data_inicio)} a {formatDate(aud.data_fim)}
                        </p>
                      </div>
                      <div className="p-2 border rounded-lg">
                        <p className="text-xs text-theme-muted">Não Conformidades</p>
                        <p className="text-2xl font-bold text-red-600">{aud.nao_conformidades}</p>
                      </div>
                      <div className="p-2 border rounded-lg">
                        <p className="text-xs text-theme-muted">Observações</p>
                        <p className="text-2xl font-bold text-blue-600">{aud.observacoes}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {aud.relatorio_url && (
                        <Button size="sm" variant="outline">
                          Ver Relatório
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Detalhes
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: NÃO CONFORMIDADES */}
        <TabsContent value="nao_conformidades" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Não Conformidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {naoConformidades.map(nc => (
                  <Card key={nc.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold">{nc.codigo}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeveridadeBadge(nc.severidade)}`}>
                          {nc.severidade.toUpperCase()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            nc.status === 'concluida'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : nc.status === 'vencida'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          {nc.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="font-semibold text-lg mb-2">{nc.descricao}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-theme-muted">Requisito:</span> {nc.requisito_violado}
                      </div>
                      <div>
                        <span className="text-theme-muted">Área:</span> {nc.area_responsavel}
                      </div>
                      <div>
                        <span className="text-theme-muted">Identificação:</span> {formatDate(nc.data_identificacao)}
                      </div>
                      <div>
                        <span className="text-theme-muted">Prazo:</span> {formatDate(nc.prazo_correcao)}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Ação Corretiva:</p>
                      <p className="text-sm text-theme-secondary">{nc.acao_corretiva}</p>
                    </div>
                    <div className="text-xs text-theme-secondary">
                      Responsável: <span className="font-semibold">{nc.responsavel}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: REQUISITOS */}
        <TabsContent value="requisitos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Requisitos de Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requisitos.map(req => (
                  <Card key={req.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 uppercase">
                            {req.categoria}
                          </span>
                          <span className="text-sm font-mono font-bold">{req.codigo}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusComplianceBadge(req.status)}`}>
                            {req.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-semibold text-lg">{req.requisito}</div>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-theme-muted">Última Verificação:</span>
                            <div className="font-semibold">{formatDate(req.ultima_verificacao)}</div>
                          </div>
                          <div>
                            <span className="text-theme-muted">Próxima Verificação:</span>
                            <div className="font-semibold">{formatDate(req.proxima_verificacao)}</div>
                          </div>
                          <div>
                            <span className="text-theme-muted">Evidências:</span>
                            <div className="font-semibold">{req.evidencias} documentos</div>
                          </div>
                        </div>
                        <div className="text-xs text-theme-secondary mt-2">
                          Responsável: <span className="font-semibold">{req.responsavel}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: DOCUMENTOS */}
        <TabsContent value="documentos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Documentos de Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentos.map(doc => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-indigo-100 text-indigo-800 uppercase">
                            {doc.tipo}
                          </span>
                          <span className="text-sm font-mono font-bold">{doc.codigo}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-theme-muted">v{doc.versao}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              doc.status === 'vigente'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : doc.status === 'vencido'
                                  ? 'bg-red-100 text-red-800 border-red-300'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}
                          >
                            {doc.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-semibold text-lg">{doc.titulo}</div>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-theme-muted">Aprovação:</span>
                            <div className="font-semibold">{formatDate(doc.data_aprovacao)}</div>
                          </div>
                          <div>
                            <span className="text-theme-muted">Validade:</span>
                            <div className="font-semibold">{formatDate(doc.data_validade)}</div>
                          </div>
                          <div>
                            <span className="text-theme-muted">Responsável:</span>
                            <div className="font-semibold">{doc.responsavel}</div>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Baixar
                      </Button>
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
