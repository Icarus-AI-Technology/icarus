import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { Shield, Users, Lock, FileText, Plus, Search, Edit, Key } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Módulo: Gestão de Usuários e Permissões (RBAC)
 * Categoria: Cadastros & Gestão
 */

export function GestaoUsuariosPermissoes() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('usuarios')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'usuarios', label: 'Usuários', count: 48, delta: 3, icon: Users },
    { id: 'perfis', label: 'Perfis', count: 8, delta: 1, icon: Shield },
    { id: 'permissoes', label: 'Permissões', count: 125, delta: 5, icon: Lock },
    { id: 'logs', label: 'Logs', count: 2842, delta: 342, icon: FileText },
  ]

  const mockUsers = [
    { id: 1, nome: 'Admin Sistema', email: 'admin@icarus.com', perfil: 'Administrador', status: 'ativo', ultimo_acesso: '2 min atrás' },
    { id: 2, nome: 'João Silva', email: 'joao@icarus.com', perfil: 'Gerente', status: 'ativo', ultimo_acesso: '1 hora atrás' },
    { id: 3, nome: 'Maria Santos', email: 'maria@icarus.com', perfil: 'Vendedor', status: 'ativo', ultimo_acesso: '3 horas atrás' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 ${
            isDark ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]' : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Usuários e Permissões</h1>
            <p className={`mt-1 ${textSecondary}`}>RBAC completo e audit trail</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Usuários Ativos', value: '45', color: 'emerald' },
          { label: 'Perfis', value: '8', color: 'blue' },
          { label: 'Sessões Ativas', value: '24', color: 'indigo' },
          { label: '2FA Habilitado', value: '78%', color: 'violet' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className={`text-sm font-medium ${textMuted}`}>{kpi.label}</div>
              <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CadastroTabsCarousel tabs={carouselTabs} active={activeTab} onChange={setActiveTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="perfis">Perfis</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <Input placeholder="Buscar usuários..." className="pl-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {mockUsers.map((user) => (
                  <div key={user.id} className={`p-4 rounded-lg border ${isDark ? 'border-slate-700/50' : 'border-slate-200'} flex items-center justify-between`}>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${textPrimary}`}>{user.nome}</h4>
                      <p className={`text-sm ${textMuted}`}>{user.email} • {user.perfil}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none">{user.status}</Badge>
                        <span className={`text-xs ${textMuted}`}>Último acesso: {user.ultimo_acesso}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary"><Edit className="w-3 h-3" /></Button>
                      <Button size="sm" variant="secondary"><Key className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfis" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Perfis de Acesso</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Administrador', 'Gerente', 'Vendedor', 'Financeiro', 'Estoque', 'Compliance'].map((perfil) => (
                  <div key={perfil} className={`p-4 rounded-lg border ${isDark ? 'border-slate-700/50' : 'border-slate-200'} flex items-center justify-between`}>
                    <div>
                      <h4 className={`font-semibold ${textPrimary}`}>{perfil}</h4>
                      <p className={`text-sm ${textMuted}`}>Permissões personalizadas</p>
                    </div>
                    <Button size="sm" variant="secondary">Editar</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Matriz de Permissões</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-center py-12 ${textMuted}`}>
                <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Matriz visual de permissões em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { usuario: 'Admin', acao: 'Login', timestamp: '10:30:45' },
                  { usuario: 'João Silva', acao: 'Edição de Produto', timestamp: '10:28:12' },
                  { usuario: 'Maria Santos', acao: 'Nova Venda', timestamp: '10:25:33' },
                ].map((log, i) => (
                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} text-sm`}>
                    <span className={textPrimary}>{log.usuario}</span> • <span className={textSecondary}>{log.acao}</span> • <span className={textMuted}>{log.timestamp}</span>
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
