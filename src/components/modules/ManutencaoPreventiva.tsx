import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { Wrench, Calendar, CheckCircle, Clock, Plus, AlertTriangle } from 'lucide-react'

export function ManutencaoPreventiva() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('programada')
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'programada', label: 'Programada', count: 12, delta: 2, icon: Calendar },
    { id: 'executada', label: 'Executada', count: 45, delta: 8, icon: CheckCircle },
    { id: 'atrasada', label: 'Atrasada', count: 3, delta: -1, icon: AlertTriangle },
    { id: 'equipamentos', label: 'Equipamentos', count: 28, delta: 2, icon: Wrench },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/10`}>
            <Wrench className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Manutenção Preventiva</h1>
            <p className={`mt-1 ${textSecondary}`}>Plano de manutenção e checklists</p>
          </div>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nova Manutenção</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Programadas', value: '12' },
          { label: 'Taxa Execução', value: '94%' },
          { label: 'Atrasadas', value: '3' },
          { label: 'Próx. 7 dias', value: '5' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className={`text-sm ${textMuted}`}>{kpi.label}</div>
              <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CadastroTabsCarousel tabs={carouselTabs} active={activeTab} onChange={setActiveTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {carouselTabs.map(t => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="programada">
          <Card>
            <CardContent className="pt-6">
              <div className={`text-center py-12 ${textMuted}`}>
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Calendário de manutenções e checklists integrados com IoT</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
