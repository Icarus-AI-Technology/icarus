import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react'

const stats = [
  {
    name: 'Vendas Totais',
    value: 'R$ 1.245.890',
    change: '+12.5%',
    icon: DollarSign,
    trend: 'up',
  },
  {
    name: 'Clientes Ativos',
    value: '2.453',
    change: '+8.2%',
    icon: Users,
    trend: 'up',
  },
  {
    name: 'Produtos',
    value: '847',
    change: '+3.1%',
    icon: Package,
    trend: 'up',
  },
  {
    name: 'Taxa de Crescimento',
    value: '18.4%',
    change: '+2.3%',
    icon: TrendingUp,
    trend: 'up',
  },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo ao ICARUS ERP v5.0 - Sistema Enterprise Neumórfico
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="neu-soft hover:neu-hover transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-success">
                {stat.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 neu-soft">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              Desempenho de vendas nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Gráfico de vendas (integração com Recharts)
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 neu-soft">
          <CardHeader>
            <CardTitle>IA Insights</CardTitle>
            <CardDescription>
              Previsões e recomendações do IcarusBrain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium">Previsão de Demanda</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aumento de 15% esperado nos próximos 7 dias
                </p>
              </div>
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm font-medium">Oportunidade Detectada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  3 clientes com alto potencial de cross-sell
                </p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium">Alerta de Estoque</p>
                <p className="text-xs text-muted-foreground mt-1">
                  12 produtos próximos do ponto de reposição
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="neu-soft">
        <CardHeader>
          <CardTitle>Início Rápido</CardTitle>
          <CardDescription>
            Configure seu ambiente e comece a usar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-auto flex-col items-start p-4 neu-soft hover:neu-hover">
              <span className="font-semibold">Configurar Supabase</span>
              <span className="text-xs text-muted-foreground mt-1">
                Adicione suas credenciais no arquivo .env.local
              </span>
            </Button>
            <Button className="h-auto flex-col items-start p-4 neu-soft hover:neu-hover">
              <span className="font-semibold">Explorar Módulos</span>
              <span className="text-xs text-muted-foreground mt-1">
                58 módulos completos para gestão OPME
              </span>
            </Button>
            <Button className="h-auto flex-col items-start p-4 neu-soft hover:neu-hover">
              <span className="font-semibold">Ver Documentação</span>
              <span className="text-xs text-muted-foreground mt-1">
                CLAUDE.md e .clinerules para desenvolvimento
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
