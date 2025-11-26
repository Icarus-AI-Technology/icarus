import { ReactNode } from 'react'
import { IcarusSidebar } from './IcarusSidebar'
import { IcarusTopbar } from './IcarusTopbar'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { useTheme } from '@/hooks/useTheme'
import { useSidebar } from '@/hooks/useSidebar'

interface IcarusLayoutProps {
  children: ReactNode
}

export function IcarusLayout({ children }: IcarusLayoutProps) {
  const { isDark } = useTheme()
  const { sidebarWidth, isCollapsed } = useSidebar()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0B0D16]' : 'bg-[#F1F5F9]'}`}>
      {/* Sidebar */}
      <IcarusSidebar />

      {/* Topbar */}
      <IcarusTopbar />

      {/* Main Content - Estica/encolhe com a sidebar */}
      <main
        className="pt-16 min-h-screen transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`
        }}
      >
        {/* Page Content - Estica proporcionalmente */}
        <div 
          className={`p-6 transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-none' : ''}`}
        >
          {children}
        </div>
      </main>

      {/* Chat Widget - Assistente Virtual ICARUS */}
      <ChatWidget position="bottom-right" />
    </div>
  )
}
