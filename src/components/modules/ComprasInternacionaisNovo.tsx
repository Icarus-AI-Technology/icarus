/**
 * ICARUS v5.0 - Módulo: Compras Internacionais
 * Categoria: Compras & Fornecedores
 * Descrição: Gestão de importação de OPME - Cotação, shipping, desembaraço
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusImportacao = 'cotacao' | 'aprovada' | 'em_transito' | 'desembaraco' | 'liberada' | 'cancelada'
type IncotermsType = 'FOB' | 'CIF' | 'EXW' | 'DDP' | 'DAP'
type ModalTransporte = 'aereo' | 'maritimo' | 'terrestre'

interface Importacao {
  id: string
  numero_processo: string
  fornecedor: string
  pais_origem: string
  status: StatusImportacao
  incoterms: IncotermsType
  modal_transporte: ModalTransporte
  valor_fob_usd: number
  valor_frete_usd: number
  valor_seguro_usd: number
  valor_cif_usd: number
  taxa_cambio: number
  valor_total_brl: number
  impostos_estimados_brl: number
  data_embarque?: string
  data_previsao_chegada?: string
  invoice_number?: string
}

interface ItemImportacao {
  id: string
  importacao_id: string
  produto_nome: string
  ncm: string
  quantidade: number
  valor_unitario_usd: number
  valor_total_usd: number
  aliquota_ii: number
  aliquota_ipi: number
  aliquota_pis: number
  aliquota_cofins: number
}

export default function ComprasInternacionaisNovo() {
  const [activeTab, setActiveTab] = useState('overview')

  const [importacoes] = useState<Importacao[]>([
    {
      id: 'imp-001',
      numero_processo: 'IMP-2025-001',
      fornecedor: 'Johnson & Johnson Medical',
      pais_origem: 'Estados Unidos',
      status: 'em_transito',
      incoterms: 'CIF',
      modal_transporte: 'aereo',
      valor_fob_usd: 125000.00,
      valor_frete_usd: 8500.00,
      valor_seguro_usd: 1250.00,
      valor_cif_usd: 134750.00,
      taxa_cambio: 5.15,
      valor_total_brl: 693962.50,
      impostos_estimados_brl: 152071.75,
      data_embarque: '2025-11-10',
      data_previsao_chegada: '2025-11-18',
      invoice_number: 'INV-US-2025-8842'
    },
    {
      id: 'imp-002',
      numero_processo: 'IMP-2025-002',
      fornecedor: 'Medtronic International',
      pais_origem: 'Irlanda',
      status: 'desembaraco',
      incoterms: 'FOB',
      modal_transporte: 'maritimo',
      valor_fob_usd: 89500.00,
      valor_frete_usd: 0,
      valor_seguro_usd: 0,
      valor_cif_usd: 89500.00,
      taxa_cambio: 5.18,
      valor_total_brl: 463610.00,
      impostos_estimados_brl: 101594.20,
      data_embarque: '2025-10-25',
      data_previsao_chegada: '2025-11-20',
      invoice_number: 'INV-IE-2025-3321'
    },
    {
      id: 'imp-003',
      numero_processo: 'IMP-2025-003',
      fornecedor: 'Stryker Medical',
      pais_origem: 'Alemanha',
      status: 'cotacao',
      incoterms: 'DDP',
      modal_transporte: 'aereo',
      valor_fob_usd: 67800.00,
      valor_frete_usd: 5200.00,
      valor_seguro_usd: 680.00,
      valor_cif_usd: 73680.00,
      taxa_cambio: 5.20,
      valor_total_brl: 383136.00,
      impostos_estimados_brl: 84089.92
    }
  ])

  const processos_ativos = importacoes.filter(i =>
    ['em_transito', 'desembaraco', 'aprovada'].includes(i.status)
  ).length
  const valor_total_usd = importacoes.reduce((sum, i) => sum + i.valor_cif_usd, 0)
  const valor_total_brl = importacoes.reduce((sum, i) => sum + i.valor_total_brl, 0)
  const impostos_total = importacoes.reduce((sum, i) => sum + i.impostos_estimados_brl, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">✈️ Compras Internacionais</h1>
          <p className="text-muted-foreground">Gestão de importação OPME - Cotação, shipping, desembaraço</p>
        </div>
        <Button>+ Nova Importação</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Processos Ativos</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{processos_ativos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Em andamento</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total (USD)</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              ${valor_total_usd.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">CIF total</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total (BRL)</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{formatCurrency(valor_total_brl)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Com impostos</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Impostos Estimados</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(impostos_total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">{((impostos_total/valor_total_brl)*100).toFixed(1)}% do total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processos">Processos</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🌍 Países de Origem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { pais: 'Estados Unidos', processos: 1, valor_usd: 134750 },
                    { pais: 'Irlanda', processos: 1, valor_usd: 89500 },
                    { pais: 'Alemanha', processos: 1, valor_usd: 73680 }
                  ].map(item => (
                    <div key={item.pais} className="p-2 border rounded-lg flex justify-between">
                      <span className="font-semibold">{item.pais}</span>
                      <span className="text-green-600">
                        ${item.valor_usd.toLocaleString('en-US')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📦 Modal de Transporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { modal: 'Aéreo', processos: 2, percentual: 66.7 },
                    { modal: 'Marítimo', processos: 1, percentual: 33.3 }
                  ].map(item => (
                    <div key={item.modal} className="p-2 border rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{item.modal}</span>
                        <span className="text-sm">{item.processos} processo(s)</span>
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
              <CardTitle>📊 Status dos Processos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { status: 'Cotação', count: 1, cor: 'text-gray-600' },
                  { status: 'Em Trânsito', count: 1, cor: 'text-blue-600' },
                  { status: 'Desembaraço', count: 1, cor: 'text-yellow-600' }
                ].map(item => (
                  <div key={item.status} className="p-3 border rounded-lg text-center">
                    <div className={`text-3xl font-bold ${item.cor}`}>{item.count}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Processos de Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importacoes.map(imp => (
                  <Card key={imp.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{imp.numero_processo}</div>
                        <div className="text-sm text-gray-600">{imp.fornecedor}</div>
                        <div className="text-xs text-gray-500">
                          {imp.pais_origem} • {imp.incoterms} • {imp.modal_transporte.toUpperCase()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        imp.status === 'liberada' ? 'bg-green-100 text-green-800' :
                        imp.status === 'em_transito' ? 'bg-blue-100 text-blue-800' :
                        imp.status === 'desembaraco' ? 'bg-yellow-100 text-yellow-800' :
                        imp.status === 'aprovada' ? 'bg-purple-100 text-purple-800' :
                        imp.status === 'cotacao' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {imp.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-sm mb-3">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">FOB (USD)</p>
                        <p className="font-bold">${imp.valor_fob_usd.toLocaleString('en-US')}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">CIF (USD)</p>
                        <p className="font-bold text-green-600">${imp.valor_cif_usd.toLocaleString('en-US')}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Taxa Câmbio</p>
                        <p className="font-bold">R$ {imp.taxa_cambio.toFixed(2)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Total (BRL)</p>
                        <p className="font-bold text-purple-600">{formatCurrency(imp.valor_total_brl)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Impostos</p>
                        <p className="font-bold text-red-600">{formatCurrency(imp.impostos_estimados_brl)}</p>
                      </div>
                    </div>

                    {imp.data_embarque && (
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">Embarque:</span> {imp.data_embarque}
                        {imp.data_previsao_chegada && (
                          <> • <span className="font-semibold">Previsão:</span> {imp.data_previsao_chegada}</>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">📋 Ver Detalhes</Button>
                      <Button size="sm" variant="outline">📄 Documentos</Button>
                      <Button size="sm" variant="outline">📍 Tracking</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📍 Rastreamento de Cargas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importacoes.filter(i => i.status === 'em_transito' || i.status === 'desembaraco').map(imp => (
                  <Card key={imp.id} className="p-4">
                    <div className="font-bold mb-2">{imp.numero_processo}</div>
                    <div className="text-sm text-gray-600 mb-3">{imp.fornecedor}</div>

                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />

                      <div className="space-y-4">
                        {[
                          { etapa: 'Embarque', data: imp.data_embarque, status: 'concluido' },
                          { etapa: 'Em Trânsito', data: '2025-11-12', status: imp.status === 'em_transito' ? 'atual' : 'concluido' },
                          { etapa: 'Chegada no Brasil', data: imp.data_previsao_chegada, status: imp.status === 'desembaraco' ? 'atual' : 'pendente' },
                          { etapa: 'Desembaraço Aduaneiro', data: '-', status: 'pendente' },
                          { etapa: 'Liberação', data: '-', status: 'pendente' }
                        ].map((step, idx) => (
                          <div key={idx} className="relative flex items-start ml-8">
                            <div className={`absolute -left-[29px] w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              step.status === 'concluido' ? 'bg-green-500 border-green-500 text-white' :
                              step.status === 'atual' ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                              'bg-gray-200 border-gray-300'
                            }`}>
                              {step.status === 'concluido' ? '✓' : idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{step.etapa}</div>
                              <div className="text-xs text-gray-500">{step.data}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📁 Documentos de Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Gestão de documentos necessários para desembaraço aduaneiro.
                </p>

                <div className="space-y-3">
                  {[
                    { doc: 'Invoice Comercial', obrigatorio: true, status: 'enviado' },
                    { doc: 'Packing List', obrigatorio: true, status: 'enviado' },
                    { doc: 'Certificado de Origem', obrigatorio: false, status: 'pendente' },
                    { doc: 'Bill of Lading (B/L)', obrigatorio: true, status: 'enviado' },
                    { doc: 'Licença de Importação', obrigatorio: true, status: 'aprovado' },
                    { doc: 'Certificado ANVISA', obrigatorio: true, status: 'aprovado' }
                  ].map((doc, idx) => (
                    <div key={idx} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{doc.doc}</div>
                        <div className="text-xs text-gray-600">
                          {doc.obrigatorio ? '⚠️ Obrigatório' : '📋 Opcional'}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          doc.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                          doc.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status.toUpperCase()}
                        </span>
                        <Button size="sm" variant="outline">📥 Download</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full">📤 Upload Documentos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
