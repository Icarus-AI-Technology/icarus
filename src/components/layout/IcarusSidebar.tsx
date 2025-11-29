import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, Search, Menu, BrainCircuit } from 'lucide-react'
import { navigationConfig } from '@/lib/data/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { useSidebar } from '@/hooks/useSidebar'

// Paleta de cores para ícones (sem repetição por categoria)
const categoryColors: Record<string, string> = {
  'Dashboard Principal': '#6366F1',   // Indigo
  'Cadastros & Gestão': '#F97316',    // Orange
  'Cirurgias & Procedimentos': '#2DD4BF', // Teal
  'Estoque & Consignação': '#8B5CF6', // Purple
  'Compras & Fornecedores': '#EC4899', // Pink
  'Vendas & CRM': '#10B981',          // Emerald
  'Financeiro & Faturamento': '#3B82F6', // Blue
  'Compliance & Auditoria': '#EF4444', // Red
  'IA & Automação': '#8b5cf6',        // Amber
  'Sistema & Integrações': '#14B8A6', // Cyan
  'Dev Tools': '#A855F7',             // Violet
}

// Cores variadas para ícones de rotas (cíclico)
const routeIconColors = [
  '#6366F1', // Indigo
  '#2DD4BF', // Teal
  '#8B5CF6', // Purple
  '#8b5cf6', // Amber
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#EF4444', // Red
  '#14B8A6', // Cyan
  '#A855F7', // Violet
  '#84CC16', // Lime
  '#F97316', // Orange
]

export function IcarusSidebar() {
  const location = useLocation()
  const { isDark } = useTheme()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Principal', 'Cadastros & Gestão'])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    )
  }

  const filteredNavigation = navigationConfig.map(category => ({
    ...category,
    routes: category.routes.filter(route =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.routes.length > 0)

  // Theme colors
  const bgSidebar = isDark ? '#15192B' : '#FFFFFF'
  const _bgInput = isDark ? '#1A1F35' : '#F1F5F9'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const _textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-400'
  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const neuShadow = isDark 
    ? 'inset 3px 3px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.02)'
    : 'inset 2px 2px 4px rgba(0,0,0,0.05), inset -2px -2px 4px rgba(255,255,255,0.8)'
  const sidebarShadow = isDark ? '4px 0 20px rgba(0,0,0,0.3)' : '4px 0 20px rgba(0,0,0,0.08)'

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300 z-40",
        isCollapsed ? "w-20" : "w-64"
      )}
      style={{ 
        backgroundColor: bgSidebar,
        boxShadow: sidebarShadow 
      }}
    >
      {/* Header */}
      <div 
        className="h-16 flex items-center justify-between px-4"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #2DD4BF)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}
            >
              <BrainCircuit className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className={`font-bold text-sm ${textPrimary}`}>ICARUS <span className={textMuted}>v5.0</span></div>
              <div className={`text-xs ${textMuted}`}>Gestão elevada pela IA</div>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ml-auto",
            isDark 
              ? "bg-[#1A1F35] text-[#94A3B8] hover:text-white"
              : "bg-slate-100 text-slate-500 hover:text-slate-900"
          )}
          style={{ boxShadow: neuShadow }}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textMuted}`} />
            <input
              placeholder="Buscar módulos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30",
                isDark 
                  ? "bg-[#1A1F35] text-white placeholder-[#64748B]"
                  : "bg-slate-100 text-slate-900 placeholder-slate-400"
              )}
              style={{ boxShadow: neuShadow }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 max-h-[calc(100vh-180px)]">
        {filteredNavigation.map((category, categoryIndex) => {
          const isExpanded = expandedCategories.includes(category.name)
          const CategoryIcon = category.icon
          const categoryColor = categoryColors[category.name] || routeIconColors[categoryIndex % routeIconColors.length]
          const hasOnlyOneRoute = category.routes.length === 1
          const singleRoute = hasOnlyOneRoute ? category.routes[0] : null

          return (
            <div key={category.name}>
              {/* Category Header - Se tiver apenas 1 rota, navega diretamente */}
              {hasOnlyOneRoute && singleRoute ? (
                <Link
                  to={singleRoute.path}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    location.pathname === singleRoute.path
                      ? (isDark ? "bg-[#1A1F35] text-white" : "bg-slate-100 text-slate-900")
                      : (isDark ? "text-[#94A3B8] hover:text-white hover:bg-[#1A1F35]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"),
                    isCollapsed && "justify-center"
                  )}
                  style={location.pathname === singleRoute.path ? { 
                    boxShadow: isDark 
                      ? '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)'
                      : '3px 3px 6px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.9)',
                    borderLeft: `3px solid ${categoryColor}`
                  } : {}}
                >
                  <CategoryIcon 
                    className="h-5 w-5 flex-shrink-0" 
                    strokeWidth={2}
                    style={{ color: categoryColor }}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left">{category.name}</span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => toggleCategory(category.name)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isDark 
                      ? "text-[#94A3B8] hover:text-white hover:bg-[#1A1F35]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    isCollapsed && "justify-center"
                  )}
                >
                  <CategoryIcon 
                    className="h-5 w-5 flex-shrink-0" 
                    strokeWidth={2}
                    style={{ color: categoryColor }}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{category.name}</span>
                      {isExpanded ? (
                        <ChevronDown className={`h-4 w-4 ${textMuted}`} />
                      ) : (
                        <ChevronRight className={`h-4 w-4 ${textMuted}`} />
                      )}
                    </>
                  )}
                </button>
              )}

              {/* Routes - Só mostra se tiver mais de 1 rota */}
              {!hasOnlyOneRoute && isExpanded && !isCollapsed && (
                <div className="ml-2 mt-1 space-y-0.5">
                  {category.routes.map((route, routeIndex) => {
                    const RouteIcon = route.icon
                    const isActive = location.pathname === route.path
                    const isImplemented = route.isImplemented ?? false
                    // Cada rota tem uma cor única baseada no índice global
                    const routeColor = routeIconColors[(categoryIndex * 10 + routeIndex) % routeIconColors.length]

                    return (
                      <Link
                        key={route.id}
                        to={route.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                          isActive 
                            ? (isDark ? "bg-[#1A1F35] text-white" : "bg-slate-100 text-slate-900")
                            : (isDark ? "text-[#94A3B8] hover:text-white hover:bg-[#1A1F35]/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"),
                          !isImplemented && "opacity-50"
                        )}
                        style={isActive ? { 
                          boxShadow: isDark 
                            ? '4px 4px 8px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.02)'
                            : '3px 3px 6px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.9)',
                          borderLeft: `3px solid ${routeColor}`
                        } : {}}
                      >
                        <RouteIcon 
                          className="h-4 w-4 flex-shrink-0"
                          strokeWidth={2}
                          style={{ color: isActive ? routeColor : (isDark ? '#64748B' : '#94A3B8') }}
                        />
                        <span className="flex-1">{route.name}</span>
                        {!isImplemented && (
                          <span 
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#8b5cf6' }}
                          >
                            Em breve
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div 
          className="p-4"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <div className={`text-xs ${textMuted} text-center`}>
            © 2025 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#2DD4BF] font-medium">IcarusAI Technology</span>
          </div>
        </div>
      )}
    </aside>
  )
}
