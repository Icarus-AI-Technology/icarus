/**
 * ICARUS v5.0 - Módulo: Configurações Avançadas
 * Categoria: Cadastros & Gestão
 * Descrição: Configurações avançadas do sistema - Integrações, APIs, Notificações
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ConfiguracoesAvancadasNovo() {
  const [activeTab, setActiveTab] = useState('geral')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">⚙️ Configurações Avançadas</h1>
        <p className="text-muted-foreground">Configurações gerais do sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-semibold">Nome da Empresa</label>
                <input className="w-full p-2 border rounded" defaultValue="ICARUS OPME Ltda" />
              </div>
              <div className="space-y-2">
                <label className="font-semibold">CNPJ</label>
                <input className="w-full p-2 border rounded" defaultValue="12.345.678/0001-90" />
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Endereço</label>
                <input className="w-full p-2 border rounded" defaultValue="Av. Paulista, 1000 - São Paulo/SP" />
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🔗 Integrações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Supabase', 'Claude AI', 'SEFAZ', 'ANVISA'].map(integ => (
                <div key={integ} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{integ}</div>
                    <div className="text-xs text-gray-600">Configurar conexão</div>
                  </div>
                  <Button size="sm" variant="outline">⚙️ Configurar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🔔 Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Email', 'SMS', 'Push', 'WhatsApp'].map(tipo => (
                <div key={tipo} className="p-3 border rounded-lg flex justify-between items-center">
                  <span className="font-semibold">{tipo}</span>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Ativo</span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🔒 Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="font-semibold mb-2">Autenticação em Dois Fatores</div>
                <Button size="sm" variant="outline">Ativar 2FA</Button>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-semibold mb-2">Política de Senhas</div>
                <Button size="sm" variant="outline">Configurar</Button>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-semibold mb-2">Logs de Auditoria</div>
                <Button size="sm" variant="outline">Visualizar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
