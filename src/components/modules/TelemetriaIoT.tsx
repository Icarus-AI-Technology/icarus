import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { Radio, Thermometer, Bell, Map, Plus } from 'lucide-react'

export function TelemetriaIoT() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('dispositivos')
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'dispositivos', label: 'Dispositivos', count: 24, delta: 3, icon: Radio },
    { id: 'leituras', label: 'Leituras', count: 8420, delta: 842, icon: Thermometer },
    { id: 'alertas', label: 'Alertas', count: 8, delta: 2, icon: Bell },
    { id: 'mapas', label: 'Mapas', count: 6, delta: 0, icon: Map },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-cyan-500/10`}>
            <Radio className="w-7 h-7 text-cyan-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Telemetria IoT</h1>
            <p className={`mt-1 ${textSecondary}`}>Sensores e monitoramento em tempo real</p>
          </div>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Novo Sensor</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Sensores Ativos', value: '24' },
          { label: 'Temp. Média', value: '22.5°C' },
          { label: 'Umidade Média', value: '45%' },
          { label: 'Alertas Críticos', value: '2' },
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
        <TabsContent value="dispositivos">
          <Card>
            <CardContent className="pt-6">
              <div className={`text-center py-12 ${textMuted}`}>
                <Thermometer className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Dashboard tempo real de temperatura/umidade</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
