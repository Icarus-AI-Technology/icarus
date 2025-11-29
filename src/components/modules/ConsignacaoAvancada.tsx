import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { Truck, Building2, RotateCcw, FileCheck, Plus, MapPin } from 'lucide-react'

export function ConsignacaoAvancada() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('hospital')
  
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'hospital', label: 'Em Hospital', count: 245, delta: 12, icon: Building2 },
    { id: 'transito', label: 'Em Trânsito', count: 48, delta: 5, icon: Truck },
    { id: 'devolvidos', label: 'Devolvidos', count: 18, delta: -3, icon: RotateCcw },
    { id: 'faturados', label: 'Faturados', count: 142, delta: 28, icon: FileCheck },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/10`}>
            <Truck className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Consignação Avançada</h1>
            <p className={`mt-1 ${textSecondary}`}>Gestão de consignados com rastreamento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><MapPin className="w-4 h-4 mr-2" />Mapa</Button>
          <Button><Plus className="w-4 h-4 mr-2" />Nova Saída</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Consignado', value: 'R$ 2.4M' },
          { label: 'Hospitais Ativos', value: '24' },
          { label: 'Taxa Retorno', value: '85%' },
          { label: 'Vencimentos Próx.', value: '12' },
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
        <TabsContent value="hospital">
          <Card>
            <CardContent className="pt-6">
              <div className={`text-center py-12 ${textMuted}`}>
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Mapa de localização e controle de validade</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
