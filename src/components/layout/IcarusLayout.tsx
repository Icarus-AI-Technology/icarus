import { ReactNode, useState } from 'react'
import { IcarusSidebar } from './IcarusSidebar'
import { IcarusTopbar } from './IcarusTopbar'
import { IcarusBreadcrumbs } from './IcarusBreadcrumbs'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { useTheme } from '@/hooks/useTheme'

interface IcarusLayoutProps {
  children: ReactNode
}

export function IcarusLayout({ children }: IcarusLayoutProps) {
  const [sidebarWidth, _setSidebarWidth] = useState(256)
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0B0D16]' : 'bg-[#F1F5F9]'}`}>
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
          className={`px-6 py-4 backdrop-blur-sm ${isDark ? 'bg-[#15192B]/50' : 'bg-white/50'}`}
          style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}
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
