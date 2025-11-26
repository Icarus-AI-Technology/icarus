/**
 * ICARUS v5.1 - Sidebar Context
 * 
 * Gerencia o estado de collapse da sidebar
 * Permite que o layout e topbar respondam ao estado
 * 
 * @version 5.1.0
 * @date 2025-11-26
 */

import { createContext, useState, useCallback, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  sidebarWidth: number;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_WIDTH_EXPANDED = 256;
const SIDEBAR_WIDTH_COLLAPSED = 80;

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      toggleSidebar, 
      setCollapsed,
      sidebarWidth
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

