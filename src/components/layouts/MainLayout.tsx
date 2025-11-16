import { ReactNode } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChevronRight, Home } from 'lucide-react'

interface MainLayoutProps {
  children: ReactNode
}

interface BreadcrumbItem {
  name: string
  path: string
}

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/financeiro': 'Financeiro Avançado',
  '/crm': 'CRM',
  '/estoque': 'Estoque',
  '/vendas': 'Vendas',
  '/relatorios': 'Relatórios',
  '/analytics': 'Analytics',
  '/settings': 'Configurações',
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []
    const pathSegments = location.pathname.split('/').filter(Boolean)

    // Always add home
    breadcrumbs.push({ name: 'Home', path: '/' })

    // Add path segments
    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`
      const name = routeNames[currentPath] || segment
      breadcrumbs.push({ name, path: currentPath })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const showBreadcrumbs = breadcrumbs.length > 1

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-3">
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  const isFirst = index === 0

                  return (
                    <div key={crumb.path} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="w-4 h-4 text-gray-600" />}
                      {isLast ? (
                        <span className="text-blue-400 font-medium flex items-center gap-1.5">
                          {isFirst && <Home className="w-3.5 h-3.5" />}
                          {crumb.name}
                        </span>
                      ) : (
                        <Link
                          to={crumb.path}
                          className="text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1.5"
                        >
                          {isFirst && <Home className="w-3.5 h-3.5" />}
                          {crumb.name}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
