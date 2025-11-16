import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  path: string
  icon: React.ElementType
  badge?: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Financeiro',
    path: '/financeiro',
    icon: DollarSign,
  },
  {
    name: 'CRM',
    path: '/crm',
    icon: Users,
    disabled: true,
  },
  {
    name: 'Estoque',
    path: '/estoque',
    icon: Package,
    disabled: true,
  },
  {
    name: 'Vendas',
    path: '/vendas',
    icon: ShoppingCart,
    disabled: true,
  },
  {
    name: 'Relatórios',
    path: '/relatorios',
    icon: FileText,
    disabled: true,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: TrendingUp,
    disabled: true,
  },
]

export function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-gray-800 rounded-lg border border-white/10 hover:bg-gray-700 transition-colors"
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-r border-white/10 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          // Mobile
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-white/10">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={() => setMobileOpen(false)}
            >
              <div className="p-2 bg-blue-500/10 rounded-xl neu-soft">
                <span className="text-2xl">🚀</span>
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-100">ICARUS v5.0</h1>
                  <p className="text-xs text-gray-400">ERP Inteligente</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              if (item.disabled) {
                return (
                  <div
                    key={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-not-allowed opacity-50',
                      'bg-gray-800/50 border border-white/5'
                    )}
                    title={`${item.name} - Em breve`}
                  >
                    <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">{item.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-700/50 rounded-full text-gray-500">
                          Em breve
                        </span>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all neu-hover',
                    active
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-300 neu-soft'
                      : 'bg-gray-800/30 border border-white/5 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 hover:border-white/10'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-blue-400' : '')} />
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer - Settings & Collapse */}
          <div className="p-4 border-t border-white/10 space-y-2">
            {/* Settings */}
            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-not-allowed opacity-50',
                'bg-gray-800/30 border border-white/5 text-gray-500'
              )}
              onClick={(e) => e.preventDefault()}
              title="Configurações - Em breve"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Configurações</span>}
            </Link>

            {/* Collapse Button - Desktop only */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-full px-4 py-3 rounded-xl transition-all bg-gray-800/30 border border-white/5 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 hover:border-white/10"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium ml-2">Recolher</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
