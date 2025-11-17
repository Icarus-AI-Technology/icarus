/**
 * ICARUS v5.0 - Módulo: Grupos de Produtos OPME
 * Categoria: Compras & Fornecedores
 * Descrição: Categorização e classificação de produtos OPME por especialidade
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type TipoGrupo = 'especialidade' | 'fabricante' | 'material' | 'procedimento' | 'anvisa'

interface GrupoProduto {
  id: string
  codigo: string
  nome: string
  tipo: TipoGrupo
  descricao: string
  produtos_count: number
  valor_estoque: number
  volume_vendas_mes: number
  margem_media: number
  grupo_pai_id?: string
}

interface ProdutoGrupo {
  id: string
  grupo_id: string
  codigo: string
  nome: string
  fabricante: string
  registro_anvisa: string
  preco_medio: number
  estoque_atual: number
  vendas_mes: number
  ativo: boolean
}

export default function GruposProdutosOPME() {
  const [activeTab, setActiveTab] = useState('overview')

  const [grupos] = useState<GrupoProduto[]>([
    {
      id: 'grp-001',
      codigo: 'ORT-001',
      nome: 'Ortopedia e Traumatologia',
      tipo: 'especialidade',
      descricao: 'Próteses, placas, parafusos e materiais ortopédicos',
      produtos_count: 142,
      valor_estoque: 2850000.00,
      volume_vendas_mes: 485000.00,
      margem_media: 22.5
    },
    {
      id: 'grp-002',
      codigo: 'CAR-001',
      nome: 'Cardiologia',
      tipo: 'especialidade',
      descricao: 'Marca-passos, stents, válvulas cardíacas',
      produtos_count: 68,
      valor_estoque: 3420000.00,
      volume_vendas_mes: 620000.00,
      margem_media: 18.3
    },
    {
      id: 'grp-003',
      codigo: 'NEU-001',
      nome: 'Neurocirurgia',
      tipo: 'especialidade',
      descricao: 'Implantes cranianos, sistemas de fixação vertebral',
      produtos_count: 54,
      valor_estoque: 1950000.00,
      volume_vendas_mes: 320000.00,
      margem_media: 24.8
    },
    {
      id: 'grp-004',
      codigo: 'OFT-001',
      nome: 'Oftalmologia',
      tipo: 'especialidade',
      descricao: 'Lentes intraoculares, materiais de facoemulsificação',
      produtos_count: 38,
      valor_estoque: 890000.00,
      volume_vendas_mes: 185000.00,
      margem_media: 28.5
    }
  ])

  const [produtosAmostra] = useState<ProdutoGrupo[]>([
    {
      id: 'prod-001',
      grupo_id: 'grp-001',
      codigo: 'PRO-ORT-125',
      nome: 'Prótese de Quadril Titanium Cimentada',
      fabricante: 'Zimmer Biomet',
      registro_anvisa: '80125420025',
      preco_medio: 18500.00,
      estoque_atual: 24,
      vendas_mes: 8,
      ativo: true
    },
    {
      id: 'prod-002',
      grupo_id: 'grp-001',
      codigo: 'PRO-ORT-142',
      nome: 'Placa de Fixação Óssea Titanium',
      fabricante: 'Stryker',
      registro_anvisa: '80125420038',
      preco_medio: 3200.00,
      estoque_atual: 68,
      vendas_mes: 22,
      ativo: true
    },
    {
      id: 'prod-003',
      grupo_id: 'grp-002',
      codigo: 'PRO-CAR-089',
      nome: 'Marca-passo Dupla Câmara',
      fabricante: 'Medtronic',
      registro_anvisa: '10343560124',
      preco_medio: 28000.00,
      estoque_atual: 12,
      vendas_mes: 5,
      ativo: true
    }
  ])

  const grupos_ativos = grupos.length
  const produtos_total = grupos.reduce((sum, g) => sum + g.produtos_count, 0)
  const valor_estoque_total = grupos.reduce((sum, g) => sum + g.valor_estoque, 0)
  const vendas_mes_total = grupos.reduce((sum, g) => sum + g.volume_vendas_mes, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🏷️ Grupos de Produtos OPME</h1>
          <p className="text-muted-foreground">Categorização por especialidade médica</p>
        </div>
        <Button>+ Novo Grupo</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Grupos Cadastrados</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{grupos_ativos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Especialidades OPME</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Total de Produtos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{produtos_total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Itens catalogados</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Valor em Estoque</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{formatCurrency(valor_estoque_total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Total inventário</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Vendas Mês</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{formatCurrency(vendas_mes_total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Volume atual</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grupos">Grupos</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="hierarquia">Hierarquia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Grupos por Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grupos
                  .sort((a, b) => b.volume_vendas_mes - a.volume_vendas_mes)
                  .map(grupo => (
                    <div key={grupo.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-lg">{grupo.nome}</div>
                          <div className="text-xs text-gray-600">{grupo.codigo} • {grupo.produtos_count} produtos</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(grupo.volume_vendas_mes)}
                          </div>
                          <div className="text-xs text-gray-500">vendas/mês</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Estoque</p>
                          <p className="font-bold">{formatCurrency(grupo.valor_estoque)}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Margem</p>
                          <p className="font-bold text-blue-600">{grupo.margem_media.toFixed(1)}%</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Produtos</p>
                          <p className="font-bold">{grupo.produtos_count}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🎯 Top 3 Grupos por Margem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {grupos
                    .sort((a, b) => b.margem_media - a.margem_media)
                    .slice(0, 3)
                    .map((grupo, idx) => (
                      <div key={grupo.id} className="p-2 border rounded-lg flex justify-between items-center">
                        <div>
                          <span className="font-bold text-lg text-gray-400 mr-2">#{idx + 1}</span>
                          <span className="font-semibold">{grupo.nome}</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">{grupo.margem_media.toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📦 Top 3 Grupos por Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {grupos
                    .sort((a, b) => b.volume_vendas_mes - a.volume_vendas_mes)
                    .slice(0, 3)
                    .map((grupo, idx) => (
                      <div key={grupo.id} className="p-2 border rounded-lg flex justify-between items-center">
                        <div>
                          <span className="font-bold text-lg text-gray-400 mr-2">#{idx + 1}</span>
                          <span className="font-semibold">{grupo.nome}</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(grupo.volume_vendas_mes)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="grupos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Grupos de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grupos.map(grupo => (
                  <Card key={grupo.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{grupo.nome}</div>
                        <div className="text-sm text-gray-600">{grupo.descricao}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Código: {grupo.codigo} • Tipo: {grupo.tipo.toUpperCase()}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {grupo.tipo.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Produtos</p>
                        <p className="font-bold">{grupo.produtos_count}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Estoque</p>
                        <p className="font-bold">{formatCurrency(grupo.valor_estoque)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Vendas/Mês</p>
                        <p className="font-bold text-green-600">{formatCurrency(grupo.volume_vendas_mes)}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Margem</p>
                        <p className="font-bold text-blue-600">{grupo.margem_media.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">📝 Editar</Button>
                      <Button size="sm" variant="outline">📦 Ver Produtos</Button>
                      <Button size="sm" variant="outline">📊 Relatório</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🔍 Produtos por Grupo</CardTitle>
              <CardDescription>Mostrando produtos do grupo: Ortopedia e Traumatologia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {produtosAmostra
                  .filter(p => p.grupo_id === 'grp-001')
                  .map(produto => (
                    <Card key={produto.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold">{produto.nome}</div>
                          <div className="text-sm text-gray-600">{produto.fabricante}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Código: {produto.codigo} • ANVISA: {produto.registro_anvisa}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          produto.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {produto.ativo ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Preço Médio</p>
                          <p className="font-bold">{formatCurrency(produto.preco_medio)}</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Estoque</p>
                          <p className="font-bold">{produto.estoque_atual}</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Vendas/Mês</p>
                          <p className="font-bold text-green-600">{produto.vendas_mes}</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-xs text-gray-500">Valor Estoque</p>
                          <p className="font-bold text-blue-600">
                            {formatCurrency(produto.preco_medio * produto.estoque_atual)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}

                <Button className="w-full">+ Adicionar Produto ao Grupo</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarquia" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🌳 Hierarquia de Categorização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Estrutura hierárquica de classificação de produtos OPME:
                </p>

                <div className="space-y-3">
                  {/* Nível 1 - Especialidades */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="font-bold text-lg mb-2">📁 Especialidades Médicas</div>

                    {grupos.filter(g => g.tipo === 'especialidade').map(grupo => (
                      <div key={grupo.id} className="ml-4 mb-3">
                        <div className="p-3 border rounded-lg bg-blue-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{grupo.nome}</div>
                              <div className="text-xs text-gray-600">{grupo.produtos_count} produtos</div>
                            </div>
                            <Button size="sm" variant="outline">➕ Subgrupo</Button>
                          </div>
                        </div>

                        {/* Nível 2 - Exemplo de subgrupos */}
                        {grupo.id === 'grp-001' && (
                          <div className="ml-6 mt-2 space-y-2">
                            <div className="p-2 border rounded-lg bg-green-50">
                              <div className="font-semibold text-sm">Próteses de Quadril</div>
                              <div className="text-xs text-gray-600">24 produtos</div>
                            </div>
                            <div className="p-2 border rounded-lg bg-green-50">
                              <div className="font-semibold text-sm">Próteses de Joelho</div>
                              <div className="text-xs text-gray-600">18 produtos</div>
                            </div>
                            <div className="p-2 border rounded-lg bg-green-50">
                              <div className="font-semibold text-sm">Materiais de Fixação</div>
                              <div className="text-xs text-gray-600">45 produtos</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Outras classificações */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="font-bold text-lg mb-2">🏭 Por Fabricante</div>
                    <div className="ml-4 space-y-2">
                      {['Zimmer Biomet', 'Stryker', 'Medtronic', 'Johnson & Johnson'].map((fab, idx) => (
                        <div key={idx} className="p-2 border rounded-lg bg-purple-50">
                          <div className="font-semibold text-sm">{fab}</div>
                          <div className="text-xs text-gray-600">Produtos cadastrados</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-bold text-lg mb-2">🔬 Por Material</div>
                    <div className="ml-4 space-y-2">
                      {['Titanium', 'Polietileno', 'Cerâmica', 'Aço Inoxidável'].map((mat, idx) => (
                        <div key={idx} className="p-2 border rounded-lg bg-green-50">
                          <div className="font-semibold text-sm">{mat}</div>
                          <div className="text-xs text-gray-600">Produtos cadastrados</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
