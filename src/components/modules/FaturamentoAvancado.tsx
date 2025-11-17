/**
 * ICARUS v5.0 - Módulo: Faturamento Avançado
 * Categoria: Core Business
 * Descrição: Sistema avançado de faturamento OPME - Nota fiscal, TISS, XML
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type StatusNota = 'emitida' | 'cancelada' | 'pendente' | 'rejeitada'
type TipoNota = 'nfe' | 'nfse' | 'cupom_fiscal'
type ModeloFaturamento = 'consignacao' | 'venda_direta' | 'remessa' | 'tiss'

interface NotaFiscal {
  id: string
  numero: string
  serie: string
  tipo: TipoNota
  modelo: ModeloFaturamento
  status: StatusNota
  cliente_nome: string
  cliente_cnpj: string
  valor_produtos: number
  valor_impostos: number
  valor_total: number
  data_emissao: string
  data_envio_sefaz?: string
  chave_acesso?: string
  protocolo_autorizacao?: string
  xml_path?: string
}

interface ItemNota {
  id: string
  nota_id: string
  produto_codigo: string
  produto_nome: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  ncm: string
  cfop: string
  icms_aliquota: number
  ipi_aliquota: number
}

export default function FaturamentoAvancado() {
  const [activeTab, setActiveTab] = useState('overview')

  const [notas] = useState<NotaFiscal[]>([
    {
      id: 'nf-001',
      numero: '000128',
      serie: '1',
      tipo: 'nfe',
      modelo: 'consignacao',
      status: 'emitida',
      cliente_nome: 'Hospital São Lucas',
      cliente_cnpj: '12.345.678/0001-90',
      valor_produtos: 125000.00,
      valor_impostos: 28750.00,
      valor_total: 153750.00,
      data_emissao: '2025-11-15',
      data_envio_sefaz: '2025-11-15 10:30',
      chave_acesso: '35251112345678000190550010001280001234567890',
      protocolo_autorizacao: '135251234567890'
    },
    {
      id: 'nf-002',
      numero: '000129',
      serie: '1',
      tipo: 'nfe',
      modelo: 'tiss',
      status: 'emitida',
      cliente_nome: 'Unimed Regional',
      cliente_cnpj: '98.765.432/0001-12',
      valor_produtos: 89500.00,
      valor_impostos: 20585.00,
      valor_total: 110085.00,
      data_emissao: '2025-11-16',
      data_envio_sefaz: '2025-11-16 09:15',
      chave_acesso: '35251198765432000112550010001290001234567891',
      protocolo_autorizacao: '135251234567891'
    },
    {
      id: 'nf-003',
      numero: '000130',
      serie: '1',
      tipo: 'nfe',
      modelo: 'venda_direta',
      status: 'pendente',
      cliente_nome: 'Clínica Ortopédica Premium',
      cliente_cnpj: '45.678.901/0001-34',
      valor_produtos: 67000.00,
      valor_impostos: 15410.00,
      valor_total: 82410.00,
      data_emissao: '2025-11-16'
    }
  ])

  const notasEmitidas = notas.filter(n => n.status === 'emitida').length
  const valorTotal = notas.reduce((sum, n) => sum + n.valor_total, 0)
  const valorImpostos = notas.reduce((sum, n) => sum + n.valor_impostos, 0)
  const notasPendentes = notas.filter(n => n.status === 'pendente').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📄 Faturamento Avançado</h1>
          <p className="text-muted-foreground">Sistema de faturamento OPME - NF-e, XML, TISS</p>
        </div>
        <Button>+ Emitir Nota Fiscal</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Notas Emitidas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{notasEmitidas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Este mês</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor Faturado</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(valorTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Total período</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Impostos</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(valorImpostos)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">{((valorImpostos/valorTotal)*100).toFixed(1)}% do total</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{notasPendentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Aguardando emissão</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notas">Notas Fiscais</TabsTrigger>
          <TabsTrigger value="tiss">TISS</TabsTrigger>
          <TabsTrigger value="xml">Gestão XML</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Faturamento por Modelo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { modelo: 'Consignação', valor: 153750, notas: 1, percentual: 44.3 },
                  { modelo: 'TISS', valor: 110085, notas: 1, percentual: 31.7 },
                  { modelo: 'Venda Direta', valor: 82410, notas: 1, percentual: 24.0 }
                ].map(item => (
                  <div key={item.modelo} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{item.modelo}</div>
                        <div className="text-xs text-gray-600">{item.notas} nota(s) fiscal(is)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{formatCurrency(item.valor)}</div>
                        <div className="text-xs text-gray-500">{item.percentual}% do total</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>⚡ Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">📝 Emitir NF-e</Button>
                <Button variant="outline" className="justify-start">📋 Emitir TISS</Button>
                <Button variant="outline" className="justify-start">📥 Importar XML</Button>
                <Button variant="outline" className="justify-start">📤 Exportar Lote</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Notas Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notas.map(nota => (
                  <Card key={nota.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">NF-e {nota.numero}/{nota.serie}</div>
                        <div className="text-sm text-gray-600">{nota.cliente_nome}</div>
                        <div className="text-xs text-gray-500 font-mono">{nota.cliente_cnpj}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        nota.status === 'emitida' ? 'bg-green-100 text-green-800' :
                        nota.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        nota.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {nota.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Modelo</p>
                        <p className="font-bold capitalize">{nota.modelo.replace('_', ' ')}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Produtos</p>
                        <p className="font-bold">{formatCurrency(nota.valor_produtos)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Impostos</p>
                        <p className="font-bold text-red-600">{formatCurrency(nota.valor_impostos)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-green-600">{formatCurrency(nota.valor_total)}</p>
                      </div>
                    </div>

                    {nota.chave_acesso && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500">Chave de Acesso</div>
                        <div className="font-mono text-xs">{nota.chave_acesso}</div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">📄 Ver XML</Button>
                          <Button size="sm" variant="outline">📩 Enviar Email</Button>
                          <Button size="sm" variant="outline">📥 Download DANFE</Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiss" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📋 Faturamento TISS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Gestão de faturamento TISS (Troca de Informações na Saúde Suplementar) para operadoras de planos de saúde.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-3">
                    <div className="text-sm text-gray-600">Guias TISS Geradas</div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs text-green-600 mt-1">Este mês</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-sm text-gray-600">Valor Total TISS</div>
                    <div className="text-2xl font-bold">{formatCurrency(110085)}</div>
                    <div className="text-xs text-blue-600 mt-1">Aguardando processamento</div>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Unimed Regional</div>
                        <div className="text-xs text-gray-600">8 guias • TISS 3.05.00</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(67500)}</div>
                        <Button size="sm" className="mt-2">Processar Lote</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Bradesco Saúde</div>
                        <div className="text-xs text-gray-600">4 guias • TISS 3.05.00</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(42585)}</div>
                        <Button size="sm" className="mt-2">Processar Lote</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="xml" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📦 Gestão de Arquivos XML</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Importação, validação e armazenamento de arquivos XML de notas fiscais.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-3">
                    <div className="text-sm text-gray-600">XMLs Armazenados</div>
                    <div className="text-2xl font-bold">248</div>
                    <div className="text-xs text-gray-500 mt-1">Total no sistema</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-sm text-gray-600">Processados Hoje</div>
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-xs text-green-600 mt-1">100% sucesso</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-sm text-gray-600">Erros de Validação</div>
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <div className="text-xs text-gray-500 mt-1">Últimos 7 dias</div>
                  </Card>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <div className="text-4xl mb-3">📁</div>
                  <p className="font-semibold mb-2">Importar Arquivos XML</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Arraste arquivos XML ou clique para selecionar
                  </p>
                  <Button>Selecionar Arquivos</Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">XMLs Recentes</h4>
                  {notas.filter(n => n.chave_acesso).map(nota => (
                    <div key={nota.id} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold font-mono text-sm">{nota.numero}-{nota.serie}.xml</div>
                        <div className="text-xs text-gray-600">{nota.data_emissao} • {nota.cliente_nome}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">📥 Download</Button>
                        <Button size="sm" variant="outline">✓ Validar</Button>
                      </div>
                    </div>
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
