import { ReactNode, useState, useEffect } from 'react'
import { IcarusSidebar } from './IcarusSidebar'
import { IcarusTopbar } from './IcarusTopbar'
import { IcarusBreadcrumbs } from './IcarusBreadcrumbs'
import { ChatWidget } from '@/components/chat/ChatWidget'

interface IcarusLayoutProps {
  children: ReactNode
}

export function IcarusLayout({ children }: IcarusLayoutProps) {
  const [sidebarWidth, _setSidebarWidth] = useState(256)

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0D16]">
      {/* Sidebar */}
      <IcarusSidebar />

      {/* Topbar */}
      <IcarusTopbar sidebarWidth={sidebarWidth} />

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-300 min-h-screen"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Breadcrumbs */}
        <div 
          className="px-6 py-4 bg-[#15192B]/50 backdrop-blur-sm"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <IcarusBreadcrumbs />
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Chat Widget - Assistente Virtual ICARUS */}
      <ChatWidget position="bottom-right" />
    </div>
  )
}
