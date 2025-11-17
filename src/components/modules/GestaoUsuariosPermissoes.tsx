/**
 * ICARUS v5.0 - Módulo: Gestão de Usuários & Permissões
 * Categoria: Cadastros & Gestão
 * Descrição: Controle de usuários, perfis de acesso e permissões do sistema
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

type StatusUsuario = 'ativo' | 'inativo' | 'bloqueado' | 'pendente'
type PerfilAcesso = 'admin' | 'gerente' | 'vendedor' | 'estoquista' | 'financeiro' | 'auditor'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: PerfilAcesso
  status: StatusUsuario
  ultimo_acesso: string
  data_criacao: string
  modulos_acesso: string[]
}

interface Permissao {
  modulo: string
  visualizar: boolean
  criar: boolean
  editar: boolean
  excluir: boolean
  exportar: boolean
}

export default function GestaoUsuariosPermissoes() {
  const [activeTab, setActiveTab] = useState('overview')

  const [usuarios] = useState<Usuario[]>([
    {
      id: 'usr-001',
      nome: 'Admin Sistema',
      email: 'admin@empresa.com',
      perfil: 'admin',
      status: 'ativo',
      ultimo_acesso: '2025-11-16 15:30',
      data_criacao: '2024-01-01',
      modulos_acesso: ['todos']
    },
    {
      id: 'usr-002',
      nome: 'João Silva',
      email: 'joao.silva@empresa.com',
      perfil: 'gerente',
      status: 'ativo',
      ultimo_acesso: '2025-11-16 14:20',
      data_criacao: '2024-03-15',
      modulos_acesso: ['vendas', 'estoque', 'clientes', 'relatorios']
    },
    {
      id: 'usr-003',
      nome: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      perfil: 'vendedor',
      status: 'ativo',
      ultimo_acesso: '2025-11-16 13:45',
      data_criacao: '2024-06-20',
      modulos_acesso: ['vendas', 'clientes']
    }
  ])

  const usuarios_ativos = usuarios.filter(u => u.status === 'ativo').length
  const usuarios_total = usuarios.length
  const perfis_diferentes = new Set(usuarios.map(u => u.perfil)).size
  const ultimos_7dias = usuarios.filter(u => {
    const diff = Date.now() - new Date(u.ultimo_acesso).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">👤 Gestão de Usuários</h1>
          <p className="text-muted-foreground">Controle de acesso e permissões</p>
        </div>
        <Button>+ Novo Usuário</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Usuários Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{usuarios_ativos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">Online</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{usuarios_total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Cadastrados</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription>Perfis de Acesso</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{perfis_diferentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600">Configurados</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-yellow-200">
          <CardHeader className="pb-2">
            <CardDescription>Acessos (7 dias)</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{ultimos_7dias}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-600">Usuários ativos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="perfis">Perfis</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Usuários por Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { perfil: 'Admin', count: 1, cor: 'text-red-600' },
                  { perfil: 'Gerente', count: 1, cor: 'text-blue-600' },
                  { perfil: 'Vendedor', count: 1, cor: 'text-green-600' }
                ].map(item => (
                  <div key={item.perfil} className="p-3 border rounded-lg flex justify-between">
                    <span className="font-semibold">{item.perfil}</span>
                    <span className={`font-bold ${item.cor}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usuarios.map(user => (
                  <Card key={user.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{user.nome}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        user.status === 'bloqueado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Perfil</p>
                        <p className="font-bold">{user.perfil.toUpperCase()}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Último Acesso</p>
                        <p className="font-bold text-sm">{user.ultimo_acesso}</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs text-gray-500">Módulos</p>
                        <p className="font-bold">{user.modulos_acesso.length}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">✏️ Editar</Button>
                      <Button size="sm" variant="outline">🔑 Permissões</Button>
                      <Button size="sm" variant="outline">🔒 Bloquear</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfis" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📋 Perfis de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Admin', 'Gerente', 'Vendedor', 'Estoquista', 'Financeiro'].map(perfil => (
                  <Card key={perfil} className="p-4">
                    <div className="font-bold mb-2">{perfil}</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Permissões configuradas para este perfil
                    </div>
                    <Button size="sm" variant="outline">⚙️ Configurar Permissões</Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📜 Logs de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usuarios.map(user => (
                  <div key={user.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{user.nome}</div>
                        <div className="text-xs text-gray-600">{user.email}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Último acesso</div>
                        <div className="font-bold">{user.ultimo_acesso}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
