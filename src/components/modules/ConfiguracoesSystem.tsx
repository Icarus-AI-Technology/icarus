/**
 * ICARUS v5.0 - Módulo: Configurações do Sistema
 * Categoria: Cadastros & Gestão
 * Descrição: Parametrização do sistema - Impostos, margens, regras de negócio
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export default function ConfiguracoesSystem() {
  const [activeTab, setActiveTab] = useState('impostos')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 Configurações do Sistema</h1>
        <p className="text-muted-foreground">Parametrização e regras de negócio</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="impostos">Impostos</TabsTrigger>
          <TabsTrigger value="margens">Margens</TabsTrigger>
          <TabsTrigger value="regras">Regras</TabsTrigger>
          <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
        </TabsList>

        <TabsContent value="impostos" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>💰 Configuração de Impostos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { imposto: 'ICMS', aliquota: '18.0' },
                { imposto: 'PIS', aliquota: '2.1' },
                { imposto: 'COFINS', aliquota: '9.65' },
                { imposto: 'IPI', aliquota: '10.0' }
              ].map(item => (
                <div key={item.imposto} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{item.imposto}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 p-1 border rounded text-center"
                        defaultValue={item.aliquota}
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button className="w-full">Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margens" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Margens de Lucro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { categoria: 'Ortopedia', margem_min: '15', margem_max: '30' },
                { categoria: 'Cardiologia', margem_min: '12', margem_max: '25' },
                { categoria: 'Neurocirurgia', margem_min: '18', margem_max: '35' }
              ].map(item => (
                <div key={item.categoria} className="p-3 border rounded-lg">
                  <div className="font-semibold mb-2">{item.categoria}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Margem Mínima</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-full p-1 border rounded"
                          defaultValue={item.margem_min}
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Margem Máxima</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-full p-1 border rounded"
                          defaultValue={item.margem_max}
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button className="w-full">Salvar Margens</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regras" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>⚡ Regras de Negócio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { regra: 'Aprovar pedido acima de R$ 50.000', ativo: true },
                { regra: 'Bloquear cliente inadimplente', ativo: true },
                { regra: 'Notificar estoque baixo (< 10 und)', ativo: true },
                { regra: 'Reajuste automático de preços', ativo: false }
              ].map((item, idx) => (
                <div key={idx} className="p-3 border rounded-lg flex justify-between items-center">
                  <span className="font-semibold">{item.regra}</span>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={item.ativo} />
                    <span className="text-sm">{item.ativo ? 'Ativo' : 'Inativo'}</span>
                  </label>
                </div>
              ))}
              <Button className="w-full">Salvar Regras</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parametros" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🎛️ Parâmetros Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <label className="font-semibold block mb-2">Dias para Vencimento de Nota</label>
                <input type="number" className="w-full p-2 border rounded" defaultValue="30" />
              </div>
              <div className="p-3 border rounded-lg">
                <label className="font-semibold block mb-2">Limite de Crédito Padrão</label>
                <input type="number" className="w-full p-2 border rounded" defaultValue="100000" />
              </div>
              <div className="p-3 border rounded-lg">
                <label className="font-semibold block mb-2">Dias de Garantia Padrão</label>
                <input type="number" className="w-full p-2 border rounded" defaultValue="365" />
              </div>
              <Button className="w-full">Salvar Parâmetros</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
