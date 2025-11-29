import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { ClipboardList, Calendar, Check, AlertTriangle, Plus } from 'lucide-react'

/**
 * Módulo: Gestão de Inventário Físico
 * Categoria: Cadastros & Gestão
 */

export function GestaoInventario() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('programados')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'programados', label: 'Programados', count: 3, delta: 1, icon: Calendar },
    { id: 'andamento', label: 'Em Andamento', count: 2, delta: 0, icon: ClipboardList },
    { id: 'concluidos', label: 'Concluídos', count: 12, delta: 2, icon: Check },
    { id: 'divergencias', label: 'Divergências', count: 18, delta: -5, icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/10 ${
            isDark ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]' : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <ClipboardList className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Gestão de Inventário</h1>
            <p className={`mt-1 ${textSecondary}`}>Contagem física e acuracidade de estoque</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Inventário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Acuracidade', value: '94.2%', trend: '+2.1%' },
          { label: 'Inventários/Ano', value: '24', trend: '+4' },
          { label: 'Divergências', value: '18', trend: '-5' },
          { label: 'Valor Ajustado', value: 'R$ 12.4k', trend: '-R$ 2k' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className={`text-sm font-medium ${textMuted}`}>{kpi.label}</div>
              <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>{kpi.value}</div>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">{kpi.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <CadastroTabsCarousel tabs={carouselTabs} active={activeTab} onChange={setActiveTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
          <TabsTrigger value="divergencias">Divergências</TabsTrigger>
        </TabsList>

        <TabsContent value="programados" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Inventários Programados</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'Inventário Geral Q1/2026', data: '15/01/2026', tipo: 'Geral', responsavel: 'João Silva' },
                  { nome: 'Inventário Rotativo Fev/26', data: '01/02/2026', tipo: 'Rotativo', responsavel: 'Maria Santos' },
                ].map((inv, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <h4 className={`font-semibold ${textPrimary}`}>{inv.nome}</h4>
                    <p className={`text-sm ${textMuted} mt-1`}>
                      {inv.tipo} • Data: {inv.data} • Responsável: {inv.responsavel}
                    </p>
                    <Button size="sm" className="mt-3">Iniciar Contagem</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="andamento" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Inventários em Andamento</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'Inventário Dez/2025', progresso: 78, itens: '245/314' },
                ].map((inv, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${textPrimary}`}>{inv.nome}</h4>
                      <Badge className="bg-blue-500/20 text-blue-500 border-none">{inv.progresso}%</Badge>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-500" style={{ width: `${inv.progresso}%` }} />
                    </div>
                    <p className={`text-sm ${textMuted}`}>Itens contados: {inv.itens}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concluidos" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Inventários Concluídos</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { nome: 'Nov/2025', data: '30/11/2025', acuracia: '96.8%', divergencias: 12 },
                  { nome: 'Out/2025', data: '31/10/2025', acuracia: '94.2%', divergencias: 18 },
                ].map((inv, i) => (
                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`font-semibold ${textPrimary}`}>{inv.nome}</span>
                        <span className={`text-sm ${textMuted} ml-3`}>{inv.data}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none">
                          Acurácia: {inv.acuracia}
                        </Badge>
                        <span className={`text-sm ${textMuted}`}>{inv.divergencias} divergências</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergencias" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Divergências Identificadas</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { produto: 'Stent Coronariano', sistema: 12, fisico: 10, diferenca: -2 },
                  { produto: 'Cateter Guia 6F', sistema: 45, fisico: 47, diferenca: +2 },
                ].map((div, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <h4 className={`font-semibold ${textPrimary}`}>{div.produto}</h4>
                    <div className={`text-sm ${textSecondary} mt-2 grid grid-cols-3 gap-4`}>
                      <div>Sistema: {div.sistema}</div>
                      <div>Físico: {div.fisico}</div>
                      <div>
                        <Badge className={`${div.diferenca < 0 ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'} border-none`}>
                          {div.diferenca > 0 ? '+' : ''}{div.diferenca}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3">Ajustar Estoque</Button>
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
