import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  TrendingUp,
  Settings,
  BrainCircuit,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Vendas', href: '/vendas', icon: TrendingUp },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'IA Insights', href: '/ia-insights', icon: BrainCircuit },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex w-64 flex-col bg-card border-r neu-soft">
      <div className="flex h-16 items-center justify-center border-b px-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
          ICARUS
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground neu-inset'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground neu-soft'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          v5.0.3 • ICARUS ERP
        </div>
      </div>
    </div>
  )
}
