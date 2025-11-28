/**
 * ICARUS Mobile - Dark Glass Medical Colors
 * 
 * Paleta de cores seguindo o design system Dark Glass Medical.
 */

const tintColorLight = '#6366F1'
const tintColorDark = '#6366F1'

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: '#F1F5F9',
    card: '#FFFFFF',
    cardElevated: '#F1F5F9',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    border: '#E2E8F0',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0B0D16',
    card: '#15192B',
    cardElevated: '#1A1F35',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    border: '#1E293B',
    primary: '#6366F1',
    primaryHover: '#818CF8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
}

export type ColorScheme = keyof typeof Colors
export type ThemeColors = typeof Colors.dark

