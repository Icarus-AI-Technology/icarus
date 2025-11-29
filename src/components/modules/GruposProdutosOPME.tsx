import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { 
  Package, 
  FolderTree,
  Tag,
  Shield,
  Plus,
  Search,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Módulo: Grupos de Produtos OPME
 * Categoria: Cadastros & Gestão
 * Descrição: Gestão hierárquica de grupos, famílias e classificações OPME
 * Design System: Dark Glass Medical
 */

export function GruposProdutosOPME() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('grupos')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'grupos', label: 'Grupos', count: 24, delta: 3, icon: FolderTree },
    { id: 'familias', label: 'Famílias', count: 58, delta: 8, icon: Package },
    { id: 'classificacoes', label: 'Classificações', count: 12, delta: 2, icon: Tag },
    { id: 'anvisa', label: 'ANVISA', count: 142, delta: 12, icon: Shield },
  ]

  // Mock data - Grupos
  const mockGrupos = [
    {
      id: 1,
      nome: 'Cardiologia Intervencionista',
      codigo: 'CARD-INT',
      familias: 12,
      produtos: 245,
      markup: '35%',
      ativo: true
    },
    {
      id: 2,
      nome: 'Cirurgia Vascular',
      codigo: 'CIR-VASC',
      familias: 8,
      produtos: 182,
      markup: '32%',
      ativo: true
    },
    {
      id: 3,
      nome: 'Endovascular',
      codigo: 'ENDO',
      familias: 15,
      produtos: 328,
      markup: '38%',
      ativo: true
    },
  ]

  // Mock data - Famílias
  const mockFamilias = [
    {
      id: 1,
      nome: 'Stents Coronarianos',
      grupo: 'Cardiologia Intervencionista',
      codigo: 'STT-COR',
      produtos: 45,
      classeRisco: 'III'
    },
    {
      id: 2,
      nome: 'Cateteres Guia',
      grupo: 'Cardiologia Intervencionista',
      codigo: 'CAT-GUI',
      produtos: 32,
      classeRisco: 'II'
    },
  ]

  const handleSave = () => {
    toast.success('Grupo salvo com sucesso!')
    setIsDialogOpen(false)
    setSelectedItem(null)
  }

  const handleEdit = (item: any) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handleDelete = (item: any) => {
    toast.success(`${item.nome} removido com sucesso!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-violet-500/10 ${
            isDark
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <Package className="w-7 h-7 text-violet-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Grupos de Produtos OPME</h1>
            <p className={`mt-1 ${textSecondary}`}>Gestão hierárquica de classificações</p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>Total Grupos</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>24</div>
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
              +3 este mês
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>Total Famílias</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>58</div>
            <Badge className="mt-2 bg-blue-500/20 text-blue-500 border-none">
              +8 este mês
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>Produtos Cadastrados</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>755</div>
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
              +42 este mês
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className={`text-sm font-medium ${textMuted}`}>Markup Médio</div>
            <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>35%</div>
            <Badge className="mt-2 bg-slate-500/20 text-slate-400 border-none">
              Estável
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Carrossel */}
      <CadastroTabsCarousel
        tabs={carouselTabs}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grupos">Grupos</TabsTrigger>
          <TabsTrigger value="familias">Famílias</TabsTrigger>
          <TabsTrigger value="classificacoes">Classificações</TabsTrigger>
          <TabsTrigger value="anvisa">ANVISA</TabsTrigger>
        </TabsList>

        {/* Tab Grupos */}
        <TabsContent value="grupos" className="space-y-4">
          {/* Barra de busca */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <Input
                    placeholder="Buscar grupos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="secondary">Filtrar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Grupos */}
          <Card>
            <CardHeader>
              <CardTitle>Grupos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>
                        Código
                      </th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>
                        Nome
                      </th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>
                        Famílias
                      </th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>
                        Produtos
                      </th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>
                        Markup
                      </th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>
                        Status
                      </th>
                      <th className={`text-right py-3 px-4 font-semibold ${textSecondary} text-sm`}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGrupos.map((grupo) => (
                      <tr 
                        key={grupo.id}
                        className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5 transition-colors`}
                      >
                        <td className={`py-3 px-4 ${textPrimary}`}>
                          <code className="text-xs bg-slate-700/30 px-2 py-1 rounded">
                            {grupo.codigo}
                          </code>
                        </td>
                        <td className={`py-3 px-4 ${textPrimary} font-medium`}>
                          {grupo.nome}
                        </td>
                        <td className={`py-3 px-4 ${textSecondary}`}>
                          {grupo.familias}
                        </td>
                        <td className={`py-3 px-4 ${textSecondary}`}>
                          {grupo.produtos}
                        </td>
                        <td className={`py-3 px-4 ${textPrimary}`}>
                          <Badge className="bg-indigo-500/20 text-indigo-500 border-none">
                            {grupo.markup}
                          </Badge>
                        </td>
                        <td className={`py-3 px-4`}>
                          <Badge className={`${
                            grupo.ativo 
                              ? 'bg-emerald-500/20 text-emerald-500' 
                              : 'bg-slate-500/20 text-slate-400'
                          } border-none`}>
                            {grupo.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className={`py-3 px-4 text-right`}>
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleEdit(grupo)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleDelete(grupo)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Famílias */}
        <TabsContent value="familias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Famílias de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Código</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Nome</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Grupo</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Produtos</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Classe Risco</th>
                      <th className={`text-right py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockFamilias.map((familia) => (
                      <tr 
                        key={familia.id}
                        className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5 transition-colors`}
                      >
                        <td className={`py-3 px-4 ${textPrimary}`}>
                          <code className="text-xs bg-slate-700/30 px-2 py-1 rounded">
                            {familia.codigo}
                          </code>
                        </td>
                        <td className={`py-3 px-4 ${textPrimary} font-medium`}>{familia.nome}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{familia.grupo}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{familia.produtos}</td>
                        <td className={`py-3 px-4`}>
                          <Badge className={`${
                            familia.classeRisco === 'III' ? 'bg-red-500/20 text-red-500' :
                            familia.classeRisco === 'II' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-blue-500/20 text-blue-500'
                          } border-none`}>
                            Classe {familia.classeRisco}
                          </Badge>
                        </td>
                        <td className={`py-3 px-4 text-right`}>
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="secondary">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Classificações */}
        <TabsContent value="classificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classificações Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-center py-12 ${textMuted}`}>
                <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Crie classificações personalizadas para seus produtos</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Classificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab ANVISA */}
        <TabsContent value="anvisa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classes de Risco ANVISA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { classe: 'I', descricao: 'Baixo Risco', produtos: 85, cor: 'blue' },
                  { classe: 'II', descricao: 'Médio Risco', produtos: 142, cor: 'amber' },
                  { classe: 'III', descricao: 'Alto Risco', produtos: 245, cor: 'red' },
                  { classe: 'IV', descricao: 'Muito Alto Risco', produtos: 32, cor: 'red' },
                ].map((item) => (
                  <div
                    key={item.classe}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-slate-700/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${textPrimary}`}>
                        Classe {item.classe}
                      </h4>
                      <Badge className={`bg-${item.cor}-500/20 text-${item.cor}-500 border-none`}>
                        {item.produtos} produtos
                      </Badge>
                    </div>
                    <p className={`text-sm ${textSecondary}`}>{item.descricao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Editar Grupo' : 'Novo Grupo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Código
                </label>
                <Input placeholder="EX: CARD-INT" />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Markup Padrão (%)
                </label>
                <Input type="number" placeholder="35" />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Nome do Grupo
              </label>
              <Input placeholder="Ex: Cardiologia Intervencionista" />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Descrição
              </label>
              <textarea 
                className={`w-full p-3 rounded-lg ${
                  isDark ? 'bg-slate-800/70 text-white' : 'bg-slate-100 text-slate-900'
                } border border-slate-600 min-h-[100px]`}
                placeholder="Descrição detalhada do grupo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
