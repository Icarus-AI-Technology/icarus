import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { getAllRoutes } from '@/lib/data/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export function IcarusBreadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname
  const { isDark } = useTheme()

  // Get current route
  const currentRoute = getAllRoutes().find(r => r.path === pathname)

  // Build breadcrumb trail
  const breadcrumbs = []

  // Always start with home
  breadcrumbs.push({
    name: 'Home',
    path: '/dashboard',
    icon: Home
  })

  // Add current page if not home
  if (currentRoute && pathname !== '/dashboard') {
    breadcrumbs.push({
      name: currentRoute.name,
      path: currentRoute.path,
      icon: currentRoute.icon
    })
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const Icon = crumb.icon

        return (
          <div key={crumb.path} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRight className={`h-4 w-4 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} />
            )}
            {isLast ? (
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Icon className="h-4 w-4 text-[#6366F1]" strokeWidth={2} />
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={`flex items-center gap-1.5 transition-colors ${
                  isDark 
                    ? 'text-[#94A3B8] hover:text-white' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {crumb.name}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
