import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { MapPin, Radio, AlertTriangle, Archive, Plus, QrCode } from 'lucide-react'

export function RastreabilidadeOPME() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('lotes')
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'lotes', label: 'Lotes', count: 1842, delta: 124, icon: Archive },
    { id: 'eventos', label: 'Eventos', count: 5234, delta: 842, icon: Radio },
    { id: 'alertas', label: 'Alertas', count: 12, delta: -3, icon: AlertTriangle },
    { id: 'recalls', label: 'Recalls', count: 2, delta: 0, icon: MapPin },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/10`}>
            <MapPin className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Rastreabilidade OPME</h1>
            <p className={`mt-1 ${textSecondary}`}>Track & Trace ANVISA RDC 665/2022</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><QrCode className="w-4 h-4 mr-2" />Escanear</Button>
          <Button><Plus className="w-4 h-4 mr-2" />Novo Lote</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Lotes Ativos', value: '1.842' },
          { label: 'Eventos/Dia', value: '342' },
          { label: 'Conformidade', value: '99.8%' },
          { label: 'Integração SNCM', value: 'Ativo' },
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
        <TabsContent value="lotes">
          <Card>
            <CardContent className="pt-6">
              <div className={`text-center py-12 ${textMuted}`}>
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Timeline de movimentação com QR Code/RFID</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
