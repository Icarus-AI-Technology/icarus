/**
 * ICARUS v5.0 - Módulo: Relatórios Financeiros
 * Categoria: Cadastros & Gestão
 * Descrição: Relatórios contábeis - DRE, Balanço, Fluxo de Caixa
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

export default function RelatoriosFinanceiros() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Relatórios contábeis e gerenciais</p>
        </div>
        <Button>📥 Exportar Relatório</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Receita Total</CardDescription>
            <CardTitle className="text-3xl text-green-600">{formatCurrency(2850000)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Este mês</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Despesas Total</CardDescription>
            <CardTitle className="text-3xl text-red-600">{formatCurrency(1920000)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">Este mês</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Lucro Líquido</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{formatCurrency(930000)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">32.6% margem</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>EBITDA</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{formatCurrency(1100000)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">38.6% margem</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="balanco">Balanço</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📈 Relatórios Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">📄 DRE - Demonstração de Resultado</Button>
              <Button variant="outline" className="w-full justify-start">💰 Balanço Patrimonial</Button>
              <Button variant="outline" className="w-full justify-start">💵 Fluxo de Caixa</Button>
              <Button variant="outline" className="w-full justify-start">📊 Demonstração de Lucros Acumulados</Button>
              <Button variant="outline" className="w-full justify-start">📉 Análise Vertical e Horizontal</Button>
              <Button variant="outline" className="w-full justify-start">🎯 Indicadores Financeiros</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dre" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>DRE - Demonstração do Resultado do Exercício</CardTitle>
              <CardDescription>Período: Novembro/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between p-2 font-bold border-b-2">
                  <span>Receita Bruta</span>
                  <span className="text-green-600">{formatCurrency(2850000)}</span>
                </div>
                <div className="flex justify-between p-2 pl-4">
                  <span>(-) Impostos sobre Vendas</span>
                  <span className="text-red-600">({formatCurrency(570000)})</span>
                </div>
                <div className="flex justify-between p-2 font-bold border-b">
                  <span>= Receita Líquida</span>
                  <span className="text-green-600">{formatCurrency(2280000)}</span>
                </div>
                <div className="flex justify-between p-2 pl-4">
                  <span>(-) Custo das Vendas</span>
                  <span className="text-red-600">({formatCurrency(1140000)})</span>
                </div>
                <div className="flex justify-between p-2 font-bold border-b">
                  <span>= Lucro Bruto</span>
                  <span className="text-green-600">{formatCurrency(1140000)}</span>
                </div>
                <div className="flex justify-between p-2 pl-4">
                  <span>(-) Despesas Operacionais</span>
                  <span className="text-red-600">({formatCurrency(380000)})</span>
                </div>
                <div className="flex justify-between p-2 pl-4">
                  <span>(-) Despesas Administrativas</span>
                  <span className="text-red-600">({formatCurrency(210000)})</span>
                </div>
                <div className="flex justify-between p-2 font-bold text-lg border-t-2 bg-blue-50">
                  <span>= Lucro Líquido</span>
                  <span className="text-blue-600">{formatCurrency(930000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balanco" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Balanço Patrimonial</CardTitle>
              <CardDescription>Posição em 30/11/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-3 text-green-600">ATIVO</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-semibold">Circulante</span>
                      <span>{formatCurrency(3200000)}</span>
                    </div>
                    <div className="flex justify-between p-2 pl-4 text-sm">
                      <span>Caixa e Bancos</span>
                      <span>{formatCurrency(850000)}</span>
                    </div>
                    <div className="flex justify-between p-2 pl-4 text-sm">
                      <span>Contas a Receber</span>
                      <span>{formatCurrency(1500000)}</span>
                    </div>
                    <div className="flex justify-between p-2 pl-4 text-sm">
                      <span>Estoques</span>
                      <span>{formatCurrency(850000)}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b font-semibold">
                      <span>Não Circulante</span>
                      <span>{formatCurrency(1800000)}</span>
                    </div>
                    <div className="flex justify-between p-2 font-bold text-lg bg-green-50">
                      <span>TOTAL ATIVO</span>
                      <span>{formatCurrency(5000000)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3 text-red-600">PASSIVO</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 border-b">
                      <span className="font-semibold">Circulante</span>
                      <span>{formatCurrency(2100000)}</span>
                    </div>
                    <div className="flex justify-between p-2 pl-4 text-sm">
                      <span>Fornecedores</span>
                      <span>{formatCurrency(1200000)}</span>
                    </div>
                    <div className="flex justify-between p-2 pl-4 text-sm">
                      <span>Contas a Pagar</span>
                      <span>{formatCurrency(900000)}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b font-semibold">
                      <span>Não Circulante</span>
                      <span>{formatCurrency(600000)}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b font-semibold text-blue-600">
                      <span>Patrimônio Líquido</span>
                      <span>{formatCurrency(2300000)}</span>
                    </div>
                    <div className="flex justify-between p-2 font-bold text-lg bg-red-50">
                      <span>TOTAL PASSIVO</span>
                      <span>{formatCurrency(5000000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Novembro/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between p-2 font-bold border-b-2">
                  <span>Saldo Inicial</span>
                  <span>{formatCurrency(650000)}</span>
                </div>
                <div className="flex justify-between p-2 bg-green-50">
                  <span className="font-semibold text-green-600">(+) Entradas</span>
                  <span className="font-bold text-green-600">{formatCurrency(2850000)}</span>
                </div>
                <div className="flex justify-between p-2 pl-4 text-sm">
                  <span>Vendas à Vista</span>
                  <span>{formatCurrency(1200000)}</span>
                </div>
                <div className="flex justify-between p-2 pl-4 text-sm">
                  <span>Recebimentos</span>
                  <span>{formatCurrency(1650000)}</span>
                </div>
                <div className="flex justify-between p-2 bg-red-50">
                  <span className="font-semibold text-red-600">(-) Saídas</span>
                  <span className="font-bold text-red-600">({formatCurrency(2650000)})</span>
                </div>
                <div className="flex justify-between p-2 pl-4 text-sm">
                  <span>Fornecedores</span>
                  <span>({formatCurrency(1800000)})</span>
                </div>
                <div className="flex justify-between p-2 pl-4 text-sm">
                  <span>Despesas Operacionais</span>
                  <span>({formatCurrency(650000)})</span>
                </div>
                <div className="flex justify-between p-2 pl-4 text-sm">
                  <span>Impostos</span>
                  <span>({formatCurrency(200000)})</span>
                </div>
                <div className="flex justify-between p-2 font-bold text-lg border-t-2 bg-blue-50">
                  <span>= Saldo Final</span>
                  <span className="text-blue-600">{formatCurrency(850000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
