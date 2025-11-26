/**
 * ICARUS v5.1 - useSidebar Hook
 * 
 * Hook para acessar o contexto da sidebar
 */

import { useContext } from 'react';
import { SidebarContext } from '@/contexts/SidebarContext';

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

