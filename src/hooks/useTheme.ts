/**
 * ICARUS v5.1 - useTheme Hook
 * 
 * Hook to access theme context
 * Dark Glass Medical Design System
 */

import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

