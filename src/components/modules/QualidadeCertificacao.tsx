/**
 * ICARUS v5.0 - Módulo: Qualidade & Certificação
 * Categoria: Financeiro & Compliance
 * Descrição: Gestão de qualidade, certificações ANVISA/ISO e controle de fornecedores
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { 
  useCertificacoes, 
  useDocumentosRegulatorios, 
  useComplianceStats 
} from '@/hooks/queries/useCompliance'
import { 
  Award, FileCheck, AlertTriangle, CheckCircle2, 
  Clock, Calendar, Download, Eye, RefreshCw 
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function QualidadeCertificacao() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('certificacoes')
  
  // React Query hooks
  const { data: certificacoes, isLoading: loadingCerts } = useCertificacoes()
  const { data: documentos, isLoading: loadingDocs } = useDocumentosRegulatorios()
  const { data: stats } = useComplianceStats()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vigente': return 'bg-emerald-500/20 text-emerald-400'
      case 'vencida': return 'bg-red-500/20 text-red-400'
      case 'renovacao_pendente': return 'bg-amber-500/20 text-amber-400'
      case 'suspensa': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vigente': return <CheckCircle2 className="w-4 h-4" />
      case 'vencida': return <AlertTriangle className="w-4 h-4" />
      case 'renovacao_pendente': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const cardBg = isDark ? '#15192B' : '#FFFFFF'
  const cardShadow = isDark 
    ? '8px 8px 16px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.02)'
    : '6px 6px 12px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Qualidade & Certificação</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Gestão de certificações, documentos regulatórios e qualidade
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ background: cardBg, boxShadow: cardShadow }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Certificações Vigentes</p>
                <p className="text-2xl font-bold">{stats?.certificacoesVigentes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: cardBg, boxShadow: cardShadow }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Vencendo em 90 dias</p>
                <p className="text-2xl font-bold">{stats?.certificacoesVencendo || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: cardBg, boxShadow: cardShadow }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <FileCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Documentos Ativos</p>
                <p className="text-2xl font-bold">{documentos?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: cardBg, boxShadow: cardShadow }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Próxima Auditoria</p>
                <p className="text-lg font-bold">{stats?.proximaAuditoria ? formatDate(stats.proximaAuditoria) : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="certificacoes">
            <Award className="w-4 h-4 mr-2" />
            Certificações
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileCheck className="w-4 h-4 mr-2" />
            Documentos Regulatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificacoes" className="mt-6">
          <Card style={{ background: cardBg, boxShadow: cardShadow }}>
            <CardHeader>
              <CardTitle>Certificações</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCerts ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {certificacoes?.map((cert) => (
                    <div 
                      key={cert.id}
                      className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(cert.status)}`}>
                            {getStatusIcon(cert.status)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{cert.nome}</h4>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {cert.entidade_certificadora} • Nº {cert.numero}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Validade</p>
                            <p className="font-medium">{formatDate(cert.data_validade)}</p>
                          </div>
                          <Badge className={getStatusColor(cert.status)}>
                            {cert.status.replace('_', ' ')}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
          <Card style={{ background: cardBg, boxShadow: cardShadow }}>
            <CardHeader>
              <CardTitle>Documentos Regulatórios</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {documentos?.map((doc) => (
                    <div 
                      key={doc.id}
                      className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <FileCheck className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{doc.codigo} - {doc.titulo}</h4>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              Versão {doc.versao} • {doc.responsavel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Revisão</p>
                            <p className="font-medium">{doc.data_revisao ? formatDate(doc.data_revisao) : 'N/A'}</p>
                          </div>
                          <Badge className={doc.status === 'vigente' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}>
                            {doc.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
