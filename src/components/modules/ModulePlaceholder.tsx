import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertCircle, Rocket } from 'lucide-react'
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
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Categoria: <span className="font-medium">{category}</span>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Módulo em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Este módulo está planejado para implementação futura
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                A estrutura de navegação está pronta e o módulo pode ser acessado.
                A implementação completa incluirá:
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <div>
                <div className="font-medium">Interface Completa</div>
                <div className="text-sm text-muted-foreground">
                  Formulários, tabelas e visualizações específicas do módulo
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <div>
                <div className="font-medium">Integração com Banco de Dados</div>
                <div className="text-sm text-muted-foreground">
                  CRUD completo integrado com Supabase
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <div>
                <div className="font-medium">Inteligência Artificial</div>
                <div className="text-sm text-muted-foreground">
                  Features de IA específicas para otimizar operações
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <div>
                <div className="font-medium">Relatórios e Analytics</div>
                <div className="text-sm text-muted-foreground">
                  Dashboards e gráficos para análise de dados
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Para mais informações sobre o roadmap do ICARUS v5.0, consulte a documentação
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">Módulo ID:</span>
              <span className="ml-2 font-mono">{title.toLowerCase().replace(/\s+/g, '-')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2 text-yellow-600 dark:text-yellow-400">Em Desenvolvimento</span>
            </div>
            <div>
              <span className="text-muted-foreground">Categoria:</span>
              <span className="ml-2">{category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Versão:</span>
              <span className="ml-2">v5.0.3</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
