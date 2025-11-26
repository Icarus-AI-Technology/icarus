import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertCircle, Rocket, BrainCircuit, Database, BarChart3 } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  category: string
}

export function ModulePlaceholder({ title, description, icon: Icon, category }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Icon className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-[#94A3B8]">{description}</p>
          </div>
        </div>
        <div className="text-sm text-[#64748B] mt-3">
          Categoria: <span className="font-medium text-[#94A3B8]">{category}</span>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: '#1A1F35',
                boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.02)'
              }}
            >
              <Rocket className="h-5 w-5 text-[#6366F1]" strokeWidth={2} />
            </div>
            Módulo em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: '#1A1F35',
              boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)',
              borderLeft: '4px solid #3B82F6'
            }}
          >
            <AlertCircle className="h-5 w-5 text-[#3B82F6] flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm">
              <p className="font-medium text-white mb-1">
                Este módulo está planejado para implementação futura
              </p>
              <p className="text-[#94A3B8]">
                A estrutura de navegação está pronta e o módulo pode ser acessado.
                A implementação completa incluirá:
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { icon: Rocket, title: 'Interface Completa', desc: 'Formulários, tabelas e visualizações específicas do módulo' },
              { icon: Database, title: 'Integração com Banco de Dados', desc: 'CRUD completo integrado com Supabase' },
              { icon: BrainCircuit, title: 'Inteligência Artificial', desc: 'Features de IA específicas para otimizar operações' },
              { icon: BarChart3, title: 'Relatórios e Analytics', desc: 'Dashboards e gráficos para análise de dados' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: '#1A1F35',
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.02)'
                  }}
                >
                  <item.icon className="w-4 h-4 text-[#6366F1]" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="text-sm text-[#94A3B8]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-sm text-[#64748B]">
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
            <div 
              className="p-3 rounded-lg"
              style={{
                background: '#1A1F35',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.02)'
              }}
            >
              <span className="text-[#64748B]">Módulo ID:</span>
              <span className="ml-2 font-mono text-[#94A3B8]">{title.toLowerCase().replace(/\s+/g, '-')}</span>
            </div>
            <div 
              className="p-3 rounded-lg"
              style={{
                background: '#1A1F35',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.02)'
              }}
            >
              <span className="text-[#64748B]">Status:</span>
              <span className="ml-2 text-[#F59E0B]">Em Desenvolvimento</span>
            </div>
            <div 
              className="p-3 rounded-lg"
              style={{
                background: '#1A1F35',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.02)'
              }}
            >
              <span className="text-[#64748B]">Categoria:</span>
              <span className="ml-2 text-[#94A3B8]">{category}</span>
            </div>
            <div 
              className="p-3 rounded-lg"
              style={{
                background: '#1A1F35',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.02)'
              }}
            >
              <span className="text-[#64748B]">Versão:</span>
              <span className="ml-2 text-[#94A3B8]">v5.1.0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
