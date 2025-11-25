/**
 * ICARUS v5.0 - Módulo: Viabilidade de Importação
 * Categoria: Compras & Fornecedores
 * Descrição: Análise de viabilidade econômica para importação OPME
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatCurrency } from '@/lib/utils'

type StatusAnalise = 'rascunho' | 'em_analise' | 'aprovada' | 'rejeitada'
type Conclusao = 'viavel' | 'nao_viavel' | 'marginal' | 'pendente'

interface AnaliseViabilidade {
  id: string
  codigo: string
  produto_nome: string
  fornecedor: string
  pais_origem: string
  status: StatusAnalise
  conclusao: Conclusao

  // Custos Importação
  preco_fob_usd: number
  frete_usd: number
  seguro_usd: number
  cif_usd: number

  // Impostos
  aliquota_ii: number
  aliquota_ipi: number
  aliquota_pis: number
  aliquota_cofins: number
  aliquota_icms: number

  // Custos Operacionais
  despesas_desembaraco: number
  despesas_armazenagem: number
  despesas_transporte_interno: number

  // Análise
  taxa_cambio: number
  custo_total_importado: number
  preco_mercado_nacional: number
  economia_estimada: number
  margem_seguranca: number

  data_analise: string
  responsavel: string
}

export default function ViabilidadeImportacao() {
  const [activeTab, setActiveTab] = useState('overview')

  const [analises] = useState<AnaliseViabilidade[]>([
    {
      id: 'vbi-001',
      codigo: 'VBI-2025-001',
      produto_nome: 'Prótese de Quadril Titanium Premium',
      fornecedor: 'Zimmer Biomet USA',
      pais_origem: 'Estados Unidos',
      status: 'aprovada',
      conclusao: 'viavel',

      preco_fob_usd: 2800.00,
      frete_usd: 180.00,
      seguro_usd: 30.00,
      cif_usd: 3010.00,

      aliquota_ii: 16.0,
      aliquota_ipi: 10.0,
      aliquota_pis: 2.1,
      aliquota_cofins: 9.65,
      aliquota_icms: 18.0,

      despesas_desembaraco: 850.00,
      despesas_armazenagem: 250.00,
      despesas_transporte_interno: 180.00,

      taxa_cambio: 5.15,
      custo_total_importado: 21456.00,
      preco_mercado_nacional: 28500.00,
      economia_estimada: 7044.00,
      margem_seguranca: 24.7,

      data_analise: '2025-11-10',
      responsavel: 'Carlos Silva'
    },
    {
      id: 'vbi-002',
      codigo: 'VBI-2025-002',
      produto_nome: 'Marca-passo Cardíaco Dupla Câmara',
      fornecedor: 'Medtronic Ireland',
      pais_origem: 'Irlanda',
      status: 'em_analise',
      conclusao: 'marginal',

      preco_fob_usd: 4500.00,
      frete_usd: 250.00,
      seguro_usd: 45.00,
      cif_usd: 4795.00,

      aliquota_ii: 14.0,
      aliquota_ipi: 8.0,
      aliquota_pis: 2.1,
      aliquota_cofins: 9.65,
      aliquota_icms: 18.0,

      despesas_desembaraco: 950.00,
      despesas_armazenagem: 320.00,
      despesas_transporte_interno: 200.00,

      taxa_cambio: 5.18,
      custo_total_importado: 33250.00,
      preco_mercado_nacional: 35800.00,
      economia_estimada: 2550.00,
      margem_seguranca: 7.1,

      data_analise: '2025-11-14',
      responsavel: 'Ana Oliveira'
    },
    {
      id: 'vbi-003',
      codigo: 'VBI-2025-003',
      produto_nome: 'Kit Instrumentação Cirúrgica Ortopedia',
      fornecedor: 'Stryker Germany',
      pais_origem: 'Alemanha',
      status: 'rejeitada',
      conclusao: 'nao_viavel',

      preco_fob_usd: 1850.00,
      frete_usd: 120.00,
      seguro_usd: 20.00,
      cif_usd: 1990.00,

      aliquota_ii: 16.0,
      aliquota_ipi: 10.0,
      aliquota_pis: 2.1,
      aliquota_cofins: 9.65,
      aliquota_icms: 18.0,

      despesas_desembaraco: 750.00,
      despesas_armazenagem: 180.00,
      despesas_transporte_interno: 150.00,

      taxa_cambio: 5.20,
      custo_total_importado: 14520.00,
      preco_mercado_nacional: 13800.00,
      economia_estimada: -720.00,
      margem_seguranca: -5.2,

      data_analise: '2025-11-12',
      responsavel: 'Carlos Silva'
    }
  ])

  const analises_aprovadas = analises.filter(a => a.conclusao === 'viavel').length
  const economia_total = analises
    .filter(a => a.conclusao === 'viavel')
    .reduce((sum, a) => sum + a.economia_estimada, 0)
  const margem_media = analises
    .filter(a => a.conclusao === 'viavel')
    .reduce((sum, a) => sum + a.margem_seguranca, 0) /
    analises.filter(a => a.conclusao === 'viavel').length || 0
  const analises_pendentes = analises.filter(a => a.status === 'em_analise').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Viabilidade de Importação</h1>
          <p className="text-muted-foreground">Análise econômica para importação OPME</p>
        </div>
        <Button>+ Nova Análise</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Viáveis</CardDescription>
            <CardTitle className="text-3xl text-green-600">{analises_aprovadas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Aprovadas para importação</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Economia Total</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(economia_total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">vs. mercado nacional</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Margem Segurança Média</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{margem_media.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Produtos viáveis</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Em Análise</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{analises_pendentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Aguardando conclusão</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="calculadora">Calculadora</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📈 Conclusões das Análises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Viável', count: 1, cor: 'bg-green-100 text-green-800' },
                  { label: 'Marginal', count: 1, cor: 'bg-yellow-100 text-yellow-800' },
                  { label: 'Não Viável', count: 1, cor: 'bg-red-100 text-red-800' },
                  { label: 'Pendente', count: 0, cor: 'bg-gray-100 text-gray-800' }
                ].map(item => (
                  <div key={item.label} className="p-4 border rounded-lg text-center">
                    <div className="text-3xl font-bold mb-1">{item.count}</div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.cor}`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>💰 Economia por Produto Viável</CardTitle>
              </CardHeader>
              <CardContent>
                {analises.filter(a => a.conclusao === 'viavel').map(analise => (
                  <div key={analise.id} className="p-3 border rounded-lg mb-2">
                    <div className="font-semibold">{analise.produto_nome}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Economia</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(analise.economia_estimada)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Margem</span>
                      <span className="text-sm font-bold text-blue-600">
                        {analise.margem_seguranca.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🌍 Análises por País</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { pais: 'Estados Unidos', analises: 1, viaveis: 1 },
                    { pais: 'Irlanda', analises: 1, viaveis: 0 },
                    { pais: 'Alemanha', analises: 1, viaveis: 0 }
                  ].map(item => (
                    <div key={item.pais} className="p-2 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{item.pais}</span>
                        <span className="text-sm">
                          {item.viaveis}/{item.analises} viáveis
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analises" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Análises de Viabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analises.map(analise => (
                  <Card key={analise.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{analise.produto_nome}</div>
                        <div className="text-sm text-gray-600">
                          {analise.codigo} • {analise.fornecedor} ({analise.pais_origem})
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Responsável: {analise.responsavel} • {analise.data_analise}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          analise.status === 'aprovada' ? 'bg-green-100 text-green-800' :
                          analise.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800' :
                          analise.status === 'rejeitada' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {analise.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          analise.conclusao === 'viavel' ? 'bg-green-100 text-green-800' :
                          analise.conclusao === 'marginal' ? 'bg-yellow-100 text-yellow-800' :
                          analise.conclusao === 'nao_viavel' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {analise.conclusao.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-sm mb-3">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">CIF (USD)</p>
                        <p className="font-bold">${analise.cif_usd.toLocaleString('en-US')}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Custo Total</p>
                        <p className="font-bold">{formatCurrency(analise.custo_total_importado)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Mercado BR</p>
                        <p className="font-bold">{formatCurrency(analise.preco_mercado_nacional)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Economia</p>
                        <p className={`font-bold ${analise.economia_estimada > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(analise.economia_estimada))}
                        </p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Margem</p>
                        <p className={`font-bold ${analise.margem_seguranca > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analise.margem_seguranca.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">📊 Ver Detalhes</Button>
                      <Button size="sm" variant="outline">📄 Exportar Relatório</Button>
                      {analise.conclusao === 'viavel' && (
                        <Button size="sm" variant="default">✓ Iniciar Importação</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculadora" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🧮 Calculadora de Viabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Simule a viabilidade de importação informando os dados abaixo:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-row">
                    <label className="text-sm font-semibold">Preço FOB (USD)</label>
                    <input type="number" className="neu-input" placeholder="0.00" />
                  </div>
                  <div className="form-row">
                    <label className="text-sm font-semibold">Frete (USD)</label>
                    <input type="number" className="neu-input" placeholder="0.00" />
                  </div>
                  <div className="form-row">
                    <label className="text-sm font-semibold">Seguro (USD)</label>
                    <input type="number" className="neu-input" placeholder="0.00" />
                  </div>
                  <div className="form-row">
                    <label className="text-sm font-semibold">Taxa de Câmbio (R$)</label>
                    <input type="number" className="neu-input" placeholder="5.00" />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-3">Alíquotas de Impostos (%)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">II</label>
                      <input type="number" className="neu-input" placeholder="16.0" />
                    </div>
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">IPI</label>
                      <input type="number" className="neu-input" placeholder="10.0" />
                    </div>
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">PIS</label>
                      <input type="number" className="neu-input" placeholder="2.1" />
                    </div>
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">COFINS</label>
                      <input type="number" className="neu-input" placeholder="9.65" />
                    </div>
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">ICMS</label>
                      <input type="number" className="neu-input" placeholder="18.0" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-3">Despesas Operacionais (R$)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">Desembaraço</label>
                      <input type="number" className="neu-input" placeholder="0.00" />
                    </div>
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">Armazenagem</label>
                      <input type="number" className="neu-input" placeholder="0.00" />
                    </div>
                    <div className="form-row">
                      <label className="text-xs text-muted-foreground">Transporte</label>
                      <input type="number" className="neu-input" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label className="text-sm font-semibold">Preço Mercado Nacional (R$)</label>
                  <input type="number" className="neu-input" placeholder="0.00" />
                </div>

                <Button className="w-full" size="lg">Calcular Viabilidade</Button>

                <Card className="p-4 bg-info/10 neu-soft">
                  <h4 className="font-semibold mb-3">Resultado da Análise</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo Total Importado:</span>
                      <span className="font-bold">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preço Mercado Nacional:</span>
                      <span className="font-bold">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between text-lg border-t border-border pt-2">
                      <span className="font-semibold">Economia:</span>
                      <span className="font-bold text-success">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Margem de Segurança:</span>
                      <span className="font-bold text-info">0.0%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparativo" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Comparativo: Importação vs. Nacional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Comparação detalhada de custos entre produtos importados e nacionais.
                </p>

                {analises.map(analise => (
                  <Card key={analise.id} className="p-4">
                    <div className="font-bold mb-3">{analise.produto_nome}</div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border-2 border-blue-200 rounded-lg">
                        <h5 className="font-semibold text-blue-600 mb-2">💼 Importado</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>CIF (USD):</span>
                            <span>${analise.cif_usd.toLocaleString('en-US')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Impostos:</span>
                            <span>~{((analise.aliquota_ii + analise.aliquota_ipi + analise.aliquota_pis + analise.aliquota_cofins)).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Despesas:</span>
                            <span>{formatCurrency(analise.despesas_desembaraco + analise.despesas_armazenagem + analise.despesas_transporte_interno)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(analise.custo_total_importado)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-2 border-gray-200 rounded-lg">
                        <h5 className="font-semibold text-gray-600 mb-2">🇧🇷 Nacional</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Preço de Venda:</span>
                            <span>{formatCurrency(analise.preco_mercado_nacional)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-[4.5rem]">
                            <span>Total:</span>
                            <span>{formatCurrency(analise.preco_mercado_nacional)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg ${
                      analise.economia_estimada > 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {analise.economia_estimada > 0 ? '💰 Economia:' : '⚠️ Prejuízo:'}
                        </span>
                        <span className={`text-2xl font-bold ${
                          analise.economia_estimada > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(analise.economia_estimada))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold">Margem de Segurança:</span>
                        <span className={`text-xl font-bold ${
                          analise.margem_seguranca > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {analise.margem_seguranca.toFixed(2)}%
                        </span>
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
