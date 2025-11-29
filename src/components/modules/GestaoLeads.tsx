import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { Target, UserPlus, TrendingUp, Award, Plus } from 'lucide-react'

export function GestaoLeads() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('novos')
  
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'novos', label: 'Novos', count: 24, delta: 8, icon: UserPlus },
    { id: 'qualificacao', label: 'Qualificação', count: 18, delta: 5, icon: Award },
    { id: 'negociacao', label: 'Negociação', count: 12, delta: 3, icon: TrendingUp },
    { id: 'convertidos', label: 'Convertidos', count: 45, delta: 12, icon: Target },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-cyan-500/10`}>
            <Target className="w-7 h-7 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Gestão de Leads</h1>
            <p className={`mt-1 ${textSecondary}`}>Funil de vendas e lead scoring ML</p>
          </div>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Novo Lead</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Leads Ativos', value: '54', trend: '+16' },
          { label: 'Taxa Conversão', value: '24.5%', trend: '+5%' },
          { label: 'Ciclo Médio', value: '18 dias', trend: '-3 dias' },
          { label: 'Pipeline', value: 'R$ 245k', trend: '+R$ 42k' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className={`text-sm ${textMuted}`}>{kpi.label}</div>
              <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>{kpi.value}</div>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">{kpi.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <CadastroTabsCarousel tabs={carouselTabs} active={activeTab} onChange={setActiveTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="novos">Novos</TabsTrigger>
          <TabsTrigger value="qualificacao">Qualificação</TabsTrigger>
          <TabsTrigger value="negociacao">Negociação</TabsTrigger>
          <TabsTrigger value="convertidos">Convertidos</TabsTrigger>
        </TabsList>
        <TabsContent value="novos">
          <Card>
            <CardContent className="pt-6">
              <div className={`text-center py-12 ${textMuted}`}>
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Kanban de leads com lead scoring ML e automações</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
