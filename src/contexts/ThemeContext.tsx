/**
 * ICARUS v5.1 - Theme Context
 * 
 * Controla modo claro/escuro em todo o sistema
 * Dark Glass Medical Design System
 * 
 * NOTA: Por padrão, o sistema usa SEMPRE modo dark.
 * O modo claro está desabilitado para garantir consistência visual.
 * 
 * @version 5.1.1
 * @date 2025-11-28
 */

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'icarus-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SEMPRE iniciar com dark mode - Dark Glass Medical Design System
  const [theme, setThemeState] = useState<Theme>('dark');

  // Apply theme to document - SEMPRE dark
  useEffect(() => {
    const root = document.documentElement;
    
    // Forçar modo dark SEMPRE
    root.classList.add('dark');
    root.classList.remove('light');
    
    // Também aplicar no body para garantir
    document.body.classList.add('dark');
    document.body.classList.remove('light');
    
    // Definir atributo data-theme para CSS
    root.setAttribute('data-theme', 'dark');
    
    localStorage.setItem(THEME_KEY, 'dark');
  }, []);

  // Mesmo que setTheme seja chamado, forçar dark
  const setTheme = useCallback((_newTheme: Theme) => {
    // Ignorar tentativas de mudar para light - sempre manter dark
    setThemeState('dark');
  }, []);

  const toggleTheme = useCallback(() => {
    // Desabilitado - sempre dark
    // setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme: 'dark', // Sempre retornar dark
      toggleTheme, 
      setTheme,
      isDark: true // Sempre true
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
