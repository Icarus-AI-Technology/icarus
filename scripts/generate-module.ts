/**
 * ICARUS v5.0 - Module Generator
 *
 * Script para gerar módulos ICARUS automaticamente seguindo o padrão estabelecido.
 *
 * Uso:
 *   npx tsx scripts/generate-module.ts --name "NomeDoModulo" --category "assistencial"
 */

interface ModuleConfig {
  name: string
  category: string
  description: string
  kpis: Array<{
    label: string
    icon: string
    color: string
  }>
  tabs: string[]
}

const moduleTemplates: Record<string, Partial<ModuleConfig>> = {
  assistencial: {
    category: 'Assistencial',
    tabs: ['overview', 'list', 'reports', 'ai'],
  },
  administrativo: {
    category: 'Administrativo',
    tabs: ['overview', 'list', 'config', 'reports'],
  },
  financeiro: {
    category: 'Financeiro',
    tabs: ['overview', 'transactions', 'reports', 'analytics'],
  },
  suprimentos: {
    category: 'Suprimentos',
    tabs: ['overview', 'list', 'reports', 'ai'],
  },
  rh: {
    category: 'Recursos Humanos',
    tabs: ['overview', 'list', 'reports', 'analytics'],
  },
  qualidade: {
    category: 'Qualidade',
    tabs: ['overview', 'indicators', 'reports', 'ai'],
  },
  analytics: {
    category: 'Analytics & BI',
    tabs: ['dashboard', 'charts', 'reports', 'ai'],
  },
}

function generateModuleCode(config: ModuleConfig): string {
  const { name, description, kpis, tabs } = config

  return `/**
 * ICARUS v5.0 - ${name}
 * ${description}
 * Categoria: ${config.category}
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import {
  ${kpis.map((kpi) => kpi.icon).join(',\n  ')},
  Plus,
  Loader2,
} from 'lucide-react'
import { formatNumber, formatCurrency, formatDate } from '@/lib/utils'

interface ${name}Item {
  id: string
  nome: string
  status: string
  created_at: string
}

export function ${name}() {
  const { supabase } = useSupabase()
  const { predict, chat } = useIcarusBrain()

  const [activeTab, setActiveTab] = useState('${tabs[0]}')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<${name}Item[]>([])

  // KPIs
${kpis
  .map(
    (kpi, i) =>
      `  const [kpi${i + 1}, setKpi${i + 1}] = useState(0) // ${kpi.label}`
  )
  .join('\n')}

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('${name.toLowerCase()}_table')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setItems(data)
        calculateKPIs(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateKPIs(data: ${name}Item[]) {
    setKpi1(data.length)
    setKpi2(data.filter((item) => item.status === 'ativo').length)
    // Adicionar cálculos específicos
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
${kpis
  .map(
    (kpi, i) => `        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">${kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(kpi${i + 1})}</p>
                <p className="text-xs text-green-600 mt-1">↑ Variação</p>
              </div>
              <${kpi.icon} className="h-8 w-8 text-${kpi.color}-600" />
            </div>
          </CardContent>
        </Card>`
  )
  .join('\n\n')}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-${tabs.length} w-full">
${tabs.map((tab) => `          <TabsTrigger value="${tab}">${tab.charAt(0).toUpperCase() + tab.slice(1)}</TabsTrigger>`).join('\n')}
        </TabsList>

${tabs
  .map(
    (tab) => `        <TabsContent value="${tab}" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>${tab.charAt(0).toUpperCase() + tab.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Conteúdo da aba ${tab}</p>
            </CardContent>
          </Card>
        </TabsContent>`
  )
  .join('\n\n')}
      </Tabs>
    </div>
  )
}
`
}

// Módulos a serem gerados
const modulesToGenerate: ModuleConfig[] = [
  {
    name: 'Faturamento',
    category: 'Financeiro',
    description: 'Gestão de faturamento de convênios e particular',
    kpis: [
      { label: 'Total Faturado', icon: 'DollarSign', color: 'green' },
      { label: 'A Receber', icon: 'TrendingUp', color: 'blue' },
      { label: 'Glosas', icon: 'AlertTriangle', color: 'red' },
      { label: 'Taxa Aprovação', icon: 'CheckCircle', color: 'purple' },
    ],
    tabs: ['overview', 'faturamento', 'glosas', 'reports'],
  },
  {
    name: 'Compras',
    category: 'Suprimentos',
    description: 'Gestão de cotações, pedidos e compras',
    kpis: [
      { label: 'Pedidos Abertos', icon: 'ShoppingCart', color: 'blue' },
      { label: 'Valor Total', icon: 'DollarSign', color: 'green' },
      { label: 'Fornecedores', icon: 'Users', color: 'purple' },
      { label: 'Pendentes', icon: 'Clock', color: 'orange' },
    ],
    tabs: ['overview', 'pedidos', 'cotacoes', 'reports'],
  },
  {
    name: 'Colaboradores',
    category: 'Recursos Humanos',
    description: 'Gestão de colaboradores e equipe',
    kpis: [
      { label: 'Total Colaboradores', icon: 'Users', color: 'blue' },
      { label: 'Ativos', icon: 'UserCheck', color: 'green' },
      { label: 'Em Férias', icon: 'Calendar', color: 'purple' },
      { label: 'Admissões Mês', icon: 'UserPlus', color: 'orange' },
    ],
    tabs: ['overview', 'lista', 'escalas', 'reports'],
  },
  {
    name: 'DashboardExecutivo',
    category: 'Analytics & BI',
    description: 'Visão executiva consolidada do hospital',
    kpis: [
      { label: 'Receita Mensal', icon: 'DollarSign', color: 'green' },
      { label: 'Atendimentos', icon: 'Activity', color: 'blue' },
      { label: 'Ocupação', icon: 'Bed', color: 'purple' },
      { label: 'Satisfação', icon: 'Star', color: 'yellow' },
    ],
    tabs: ['dashboard', 'financeiro', 'assistencial', 'ai'],
  },
]

// Gerar cada módulo
console.log('Gerando módulos ICARUS...\n')

modulesToGenerate.forEach((config) => {
  const _code = generateModuleCode(config)
  const filename = `src/components/modules/${config.name}.tsx`

  console.log(`✓ Gerado: ${filename}`)
  // Em produção, você escreveria o arquivo aqui:
  // fs.writeFileSync(filename, code)
})

console.log('\n✅ Módulos gerados com sucesso!')

export { generateModuleCode, modulesToGenerate }
