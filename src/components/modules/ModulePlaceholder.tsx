import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertCircle, Rocket, BrainCircuit, Database, BarChart3 } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  category: string
}

// Feature items with different colors
const features = [
  { 
    icon: Rocket, 
    title: 'Interface Completa', 
    desc: 'Formulários, tabelas e visualizações específicas do módulo',
    color: '#6366F1' // Indigo
  },
  { 
    icon: Database, 
    title: 'Integração com Banco de Dados', 
    desc: 'CRUD completo integrado com Supabase',
    color: '#10B981' // Green
  },
  { 
    icon: BrainCircuit, 
    title: 'Inteligência Artificial', 
    desc: 'Features de IA específicas para otimizar operações',
    color: '#8B5CF6' // Purple
  },
  { 
    icon: BarChart3, 
    title: 'Relatórios e Analytics', 
    desc: 'Dashboards e gráficos para análise de dados',
    color: '#F59E0B' // Amber
  },
]

export function ModulePlaceholder({ title, description, icon: Icon, category }: ModulePlaceholderProps) {
  const { isDark } = useTheme()

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-400'
  // Card background - using CSS classes instead
  // const _bgCard = isDark ? '#15192B' : '#FFFFFF'
  const bgInput = isDark ? '#1A1F35' : '#F1F5F9'
  
  const neuShadowOuter = isDark 
    ? '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)'
    : '3px 3px 6px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.9)'
  
  const neuShadowInset = isDark
    ? 'inset 3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.02)'
    : 'inset 2px 2px 4px rgba(0,0,0,0.05), inset -2px -2px 4px rgba(255,255,255,0.8)'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-500 shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
          >
            <Icon className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>{title}</h1>
            <p className={textSecondary}>{description}</p>
          </div>
        </div>
        <div className={`text-sm ${textMuted} mt-3`}>
          Categoria: <span className={`font-medium ${textSecondary}`}>{category}</span>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-(--bg-input) shadow-(--shadow-inset)"
              style={{ '--bg-input': bgInput, '--shadow-inset': neuShadowInset } as React.CSSProperties}
            >
              <Rocket className="h-5 w-5 text-[#6366F1]" strokeWidth={2} />
            </div>
            Módulo em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert Box */}
          <div 
            className="flex items-start gap-3 p-4 rounded-xl border-l-4 border-l-blue-500 bg-(--bg-input) shadow-(--shadow-outer)"
            style={{ '--bg-input': bgInput, '--shadow-outer': neuShadowOuter } as React.CSSProperties}
          >
            <AlertCircle className="h-5 w-5 text-[#3B82F6] shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm">
              <p className={`font-medium ${textPrimary} mb-1`}>
                Este módulo está planejado para implementação futura
              </p>
              <p className={textSecondary}>
                A estrutura de navegação está pronta e o módulo pode ser acessado.
                A implementação completa incluirá:
              </p>
            </div>
          </div>

          {/* Features Grid with Colored Icons */}
          <div className="grid gap-4">
            {features.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-(--bg-input) shadow-(--shadow-inset)"
                  style={{ '--bg-input': bgInput, '--shadow-inset': neuShadowInset } as React.CSSProperties}
                >
                  <item.icon className="w-5 h-5 text-(--icon-color)" style={{ '--icon-color': item.color } as React.CSSProperties} strokeWidth={2.5} />
                </div>
                <div>
                  <div className={`font-medium ${textPrimary}`}>{item.title}</div>
                  <div className={`text-sm ${textSecondary}`}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div 
            className={`pt-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}
          >
            <p className={`text-sm ${textMuted}`}>
              Para mais informações sobre o roadmap do ICARUS v5.1, consulte a documentação
              ou entre em contato com a equipe de desenvolvimento.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Módulo ID', value: title.toLowerCase().replace(/\s+/g, '-'), color: textSecondary },
              { label: 'Status', value: 'Em Desenvolvimento', color: 'text-[#F59E0B]' },
              { label: 'Categoria', value: category, color: textSecondary },
              { label: 'Versão', value: 'v5.1.0', color: textSecondary },
            ].map((info, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg bg-(--bg-input) shadow-(--shadow-inset)"
                style={{ '--bg-input': bgInput, '--shadow-inset': neuShadowInset } as React.CSSProperties}
              >
                <span className={textMuted}>{info.label}:</span>
                <span className={`ml-2 ${info.label === 'Módulo ID' ? 'font-mono' : ''} ${info.color}`}>
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
