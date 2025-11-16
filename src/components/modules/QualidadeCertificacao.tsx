/**
 * ICARUS v5.0 - Módulo: Qualidade & Certificação
 * Categoria: Financeiro & Compliance
 * Descrição: Gestão de qualidade, certificações ANVISA/ISO e controle de fornecedores
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

type StatusCertificacao = 'vigente' | 'renovacao' | 'vencida' | 'em_processo'
type TipoCertificacao = 'anvisa' | 'iso_13485' | 'iso_9001' | 'bpm' | 'inmetro'
type ClassificacaoFornecedor = 'A' | 'B' | 'C' | 'D'

interface Certificacao {
  id: number
  tipo: TipoCertificacao
  numero_certificado: string
  orgao_emissor: string
  data_emissao: string
  data_validade: string
  status: StatusCertificacao
  escopo: string
  observacoes?: string
}

interface FornecedorQualificado {
  id: number
  nome: string
  cnpj: string
  classificacao: ClassificacaoFornecedor
  score_qualidade: number
  certificacoes: string[]
  ultima_auditoria: string
  proxima_auditoria: string
  nao_conformidades_12m: number
  taxa_entrega_prazo: number
  status: 'aprovado' | 'em_avaliacao' | 'bloqueado'
}

interface IndicadorQualidade {
  id: number
  indicador: string
  meta: number
  resultado_atual: number
  unidade: string
  periodo: string
  tendencia: 'subindo' | 'estavel' | 'descendo'
}

interface EventoQualidade {
  id: number
  tipo: 'nc' | 'recall' | 'auditoria' | 'treinamento' | 'melhoria'
  titulo: string
  descricao: string
  data: string
  responsavel: string
  status: 'aberto' | 'em_andamento' | 'concluido'
}

export default function QualidadeCertificacao() {
  const [activeTab, setActiveTab] = useState('overview')

  const [certificacoes] = useState<Certificacao[]>([
    {
      id: 1,
      tipo: 'anvisa',
      numero_certificado: 'AFE-001234567',
      orgao_emissor: 'ANVISA',
      data_emissao: '2024-03-15',
      data_validade: '2026-03-15',
      status: 'vigente',
      escopo: 'Autorização de Funcionamento de Empresa - Distribuição de Dispositivos Médicos'
    },
    {
      id: 2,
      tipo: 'iso_13485',
      numero_certificado: 'ISO13485-BR-2025-001',
      orgao_emissor: 'Bureau Veritas',
      data_emissao: '2023-06-01',
      data_validade: '2026-06-01',
      status: 'vigente',
      escopo: 'Sistema de Gestão da Qualidade para Dispositivos Médicos - ISO 13485:2016'
    },
    {
      id: 3,
      tipo: 'bpm',
      numero_certificado: 'BPM-SP-2024-789',
      orgao_emissor: 'ANVISA',
      data_emissao: '2024-01-10',
      data_validade: '2026-01-10',
      status: 'vigente',
      escopo: 'Certificado de Boas Práticas de Armazenamento e Distribuição'
    }
  ])

  const [fornecedores] = useState<FornecedorQualificado[]>([
    {
      id: 1,
      nome: 'MedTech Solutions',
      cnpj: '12.345.678/0001-90',
      classificacao: 'A',
      score_qualidade: 95,
      certificacoes: ['ISO 13485', 'CE Mark', 'FDA'],
      ultima_auditoria: '2025-09-15',
      proxima_auditoria: '2026-09-15',
      nao_conformidades_12m: 0,
      taxa_entrega_prazo: 98.5,
      status: 'aprovado'
    },
    {
      id: 2,
      nome: 'CardioTech International',
      cnpj: '98.765.432/0001-10',
      classificacao: 'A',
      score_qualidade: 92,
      certificacoes: ['ISO 13485', 'ISO 9001', 'CE Mark'],
      ultima_auditoria: '2025-08-20',
      proxima_auditoria: '2026-08-20',
      nao_conformidades_12m: 1,
      taxa_entrega_prazo: 96.0,
      status: 'aprovado'
    },
    {
      id: 3,
      nome: 'OrthoSystems Brasil',
      cnpj: '45.678.901/0001-23',
      classificacao: 'B',
      score_qualidade: 78,
      certificacoes: ['ISO 9001'],
      ultima_auditoria: '2025-05-10',
      proxima_auditoria: '2026-05-10',
      nao_conformidades_12m: 3,
      taxa_entrega_prazo: 88.5,
      status: 'em_avaliacao'
    }
  ])

  const [indicadores] = useState<IndicadorQualidade[]>([
    {
      id: 1,
      indicador: 'Taxa de Conformidade ANVISA',
      meta: 100,
      resultado_atual: 98.5,
      unidade: '%',
      periodo: 'Novembro/2025',
      tendencia: 'subindo'
    },
    {
      id: 2,
      indicador: 'Produtos com Rastreabilidade Completa',
      meta: 100,
      resultado_atual: 100,
      unidade: '%',
      periodo: 'Novembro/2025',
      tendencia: 'estavel'
    },
    {
      id: 3,
      indicador: 'Prazo Médio Resolução NC',
      meta: 15,
      resultado_atual: 12,
      unidade: 'dias',
      periodo: 'Novembro/2025',
      tendencia: 'descendo'
    }
  ])

  const [eventos] = useState<EventoQualidade[]>([
    {
      id: 1,
      tipo: 'auditoria',
      titulo: 'Auditoria de Manutenção ISO 13485',
      descricao: 'Auditoria anual para manutenção da certificação ISO 13485:2016',
      data: '2025-11-25',
      responsavel: 'Qualidade',
      status: 'aberto'
    },
    {
      id: 2,
      tipo: 'treinamento',
      titulo: 'Treinamento BPM - Equipe Logística',
      descricao: 'Capacitação em Boas Práticas de Armazenamento e Distribuição',
      data: '2025-11-12',
      responsavel: 'RH',
      status: 'concluido'
    },
    {
      id: 3,
      tipo: 'nc',
      titulo: 'NC-2025-004 - Registro de Temperatura',
      descricao: 'Falha no registro de temperatura em câmara fria por 24h',
      data: '2025-11-08',
      responsavel: 'Logística',
      status: 'em_andamento'
    }
  ])

  // KPIs
  const certificacoesVigentes = certificacoes.filter(c => c.status === 'vigente').length
  const fornecedoresAprovados = fornecedores.filter(f => f.status === 'aprovado').length
  const scoreQualidadeMedio = (fornecedores.reduce((sum, f) => sum + f.score_qualidade, 0) / fornecedores.length).toFixed(0)
  const taxaConformidade = indicadores.find(i => i.indicador.includes('Conformidade'))?.resultado_atual || 0

  const getStatusCertificacaoBadge = (status: StatusCertificacao) => {
    switch (status) {
      case 'vigente':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'renovacao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'vencida':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'em_processo':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getClassificacaoBadge = (classificacao: ClassificacaoFornecedor) => {
    switch (classificacao) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'D':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTendenciaIcon = (tendencia: IndicadorQualidade['tendencia']) => {
    switch (tendencia) {
      case 'subindo':
        return '📈'
      case 'descendo':
        return '📉'
      case 'estavel':
        return '➡️'
      default:
        return '—'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Qualidade & Certificação</h1>
          <p className="text-muted-foreground">Gestão de qualidade, certificações ANVISA/ISO e controle de fornecedores</p>
        </div>
        <Button>+ Novo Evento</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Certificações Vigentes</CardDescription>
            <CardTitle className="text-3xl text-green-600">{certificacoesVigentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">{certificacoes.length} certificações totais</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Fornecedores Aprovados</CardDescription>
            <CardTitle className="text-3xl">{fornecedoresAprovados}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{fornecedores.length} fornecedores cadastrados</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Score Qualidade Médio</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{scoreQualidadeMedio}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Base 100 pontos</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Taxa Conformidade</CardDescription>
            <CardTitle className="text-3xl text-green-600">{taxaConformidade}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">ANVISA compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certificacoes">Certificações</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📜 Status das Certificações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {certificacoes.map(cert => (
                    <div key={cert.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 uppercase">
                              {cert.tipo.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusCertificacaoBadge(cert.status)}`}>
                              {cert.status.toUpperCase().replace('_', ' ')}
                            </span>
                          </div>
                          <div className="font-semibold mt-2">{cert.escopo}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Certificado: {cert.numero_certificado} • {cert.orgao_emissor}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Validade: {formatDate(cert.data_validade)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🏭 Top Fornecedores (Qualidade)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fornecedores
                    .sort((a, b) => b.score_qualidade - a.score_qualidade)
                    .slice(0, 3)
                    .map(forn => (
                      <div key={forn.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold">{forn.nome}</div>
                            <div className="text-xs text-gray-600 mt-1">CNPJ: {forn.cnpj}</div>
                            <div className="flex gap-1 mt-2">
                              {forn.certificacoes.map((cert, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{forn.score_qualidade}</div>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getClassificacaoBadge(forn.classificacao)}`}>
                              Classe {forn.classificacao}
                            </span>
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
              <CardTitle>📊 Principais Indicadores de Qualidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {indicadores.map(ind => (
                  <div key={ind.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold">{ind.indicador}</p>
                      <span className="text-lg">{getTendenciaIcon(ind.tendencia)}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">
                        {ind.resultado_atual}
                        {ind.unidade}
                      </p>
                      <p className="text-sm text-gray-500">
                        Meta: {ind.meta}
                        {ind.unidade}
                      </p>
                    </div>
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${ind.resultado_atual >= ind.meta ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min((ind.resultado_atual / ind.meta) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{ind.periodo}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CERTIFICAÇÕES */}
        <TabsContent value="certificacoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Todas as Certificações</CardTitle>
                <Button>+ Nova Certificação</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certificacoes.map(cert => (
                  <Card key={cert.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 uppercase">
                            {cert.tipo.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusCertificacaoBadge(cert.status)}`}>
                            {cert.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-bold text-lg mt-2">{cert.escopo}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Número do Certificado</p>
                        <p className="text-sm font-semibold">{cert.numero_certificado}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Órgão Emissor</p>
                        <p className="text-sm font-semibold">{cert.orgao_emissor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Data de Emissão</p>
                        <p className="text-sm font-semibold">{formatDate(cert.data_emissao)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Data de Validade</p>
                        <p className="text-sm font-semibold">{formatDate(cert.data_validade)}</p>
                      </div>
                    </div>
                    {cert.observacoes && (
                      <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">{cert.observacoes}</div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Certificado
                      </Button>
                      <Button size="sm" variant="outline">
                        Renovar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: FORNECEDORES */}
        <TabsContent value="fornecedores" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fornecedores Qualificados</CardTitle>
                <Input placeholder="Buscar fornecedor..." className="w-[250px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fornecedores.map(forn => (
                  <Card key={forn.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{forn.nome}</div>
                        <div className="text-sm text-gray-600">CNPJ: {forn.cnpj}</div>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getClassificacaoBadge(forn.classificacao)}`}>
                            Classe {forn.classificacao}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              forn.status === 'aprovado'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : forn.status === 'bloqueado'
                                  ? 'bg-red-100 text-red-800 border-red-300'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}
                          >
                            {forn.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Score de Qualidade</p>
                        <p className="text-4xl font-bold text-green-600">{forn.score_qualidade}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Certificações</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {forn.certificacoes.map((cert, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">NC (12 meses)</p>
                        <p className="text-2xl font-bold text-red-600">{forn.nao_conformidades_12m}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Taxa Entrega no Prazo</p>
                        <p className="text-2xl font-bold text-green-600">{forn.taxa_entrega_prazo}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Próxima Auditoria</p>
                        <p className="text-sm font-semibold">{formatDate(forn.proxima_auditoria)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Histórico
                      </Button>
                      <Button size="sm" variant="outline">
                        Auditar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: INDICADORES */}
        <TabsContent value="indicadores" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Indicadores de Qualidade (KPIs)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicadores.map(ind => (
                  <Card key={ind.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{ind.indicador}</div>
                        <div className="text-xs text-gray-600">{ind.periodo}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">
                            {ind.resultado_atual}
                            {ind.unidade}
                          </span>
                          <span className="text-2xl">{getTendenciaIcon(ind.tendencia)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Meta: {ind.meta}
                          {ind.unidade}
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{((ind.resultado_atual / ind.meta) * 100).toFixed(0)}% da meta</span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${ind.resultado_atual >= ind.meta ? 'bg-green-500' : ind.resultado_atual >= ind.meta * 0.8 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((ind.resultado_atual / ind.meta) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: EVENTOS */}
        <TabsContent value="eventos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Eventos de Qualidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventos.map(evt => (
                  <Card key={evt.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              evt.tipo === 'nc'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : evt.tipo === 'recall'
                                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                                  : evt.tipo === 'auditoria'
                                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                                    : evt.tipo === 'treinamento'
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : 'bg-green-100 text-green-800 border-green-300'
                            }`}
                          >
                            {evt.tipo.toUpperCase()}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              evt.status === 'concluido'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : evt.status === 'em_andamento'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            {evt.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-bold">{evt.titulo}</div>
                        <div className="text-sm text-gray-700 mt-1">{evt.descricao}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {formatDate(evt.data)} • Responsável: {evt.responsavel}
                        </div>
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
