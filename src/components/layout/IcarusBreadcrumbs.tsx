import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { getRouteById, getAllRoutes } from '@/lib/data/navigation'

export function IcarusBreadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname

  // Get current route
  const currentRoute = getAllRoutes().find(r => r.path === pathname)

  // Build breadcrumb trail
  const breadcrumbs = []

  // Always start with home
  breadcrumbs.push({
    name: 'Home',
    path: '/',
    icon: Home
  })

  // Add current page if not home
  if (currentRoute && pathname !== '/') {
    breadcrumbs.push({
      name: currentRoute.name,
      path: currentRoute.path,
      icon: currentRoute.icon
    })
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const Icon = crumb.icon

        return (
          <div key={crumb.path} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {isLast ? (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Icon className="h-4 w-4" />
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
                {crumb.name}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
