import { ReactNode, useState } from 'react'
import { IcarusSidebar } from './IcarusSidebar'
import { IcarusTopbar } from './IcarusTopbar'
import { IcarusBreadcrumbs } from './IcarusBreadcrumbs'

interface IcarusLayoutProps {
  children: ReactNode
}

export function IcarusLayout({ children }: IcarusLayoutProps) {
  // Variável não utilizada - prefixar com _
  const [_sidebarWidth, _setSidebarWidth] = useState(256)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <IcarusSidebar />

      {/* Topbar */}
      <IcarusTopbar sidebarWidth={sidebarWidth} />

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Breadcrumbs */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <IcarusBreadcrumbs />
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
