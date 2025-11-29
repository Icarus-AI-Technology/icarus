import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { Heart, MessageCircle, Calendar, FileText, Plus } from 'lucide-react'

export function RelacionamentoCliente() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('contatos')
  
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  const carouselTabs = [
    { id: 'contatos', label: 'Contatos', count: 85, delta: 12, icon: MessageCircle },
    { id: 'historico', label: 'Histórico', count: 342, delta: 45, icon: FileText },
    { id: 'tarefas', label: 'Tarefas', count: 24, delta: 8, icon: Calendar },
    { id: 'documentos', label: 'Documentos', count: 156, delta: 18, icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-pink-500/10`}>
            <Heart className="w-7 h-7 text-pink-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Relacionamento com Cliente</h1>
            <p className={`mt-1 ${textSecondary}`}>CRM básico e gestão de relacionamento</p>
          </div>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Novo Contato</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Contatos Ativos', value: '85', trend: '+12' },
          { label: 'NPS Médio', value: '8.2', trend: '+0.5' },
          { label: 'Satisfação', value: '92%', trend: '+3%' },
          { label: 'Churn Rate', value: '2.1%', trend: '-0.8%' },
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
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>
        <TabsContent value="contatos">
          <Card>
            <CardContent className="pt-6">
              <div className={`text-center py-12 ${textMuted}`}>
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Timeline de interações e gestão de contatos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
