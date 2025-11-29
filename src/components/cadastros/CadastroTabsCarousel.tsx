/**
 * CadastroTabsCarousel - Carrossel de abas de cadastro
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Design: Dark Glass Medical com contador grande + badge +N
 * 
 * Uso:
 * <CadastroTabsCarousel 
 *   tabs={customTabs} 
 *   active={activeTab} 
 *   onChange={setActiveTab} 
 * />
 */

'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { 
  Stethoscope, 
  Building2, 
  CreditCard, 
  Truck, 
  Package, 
  FileSpreadsheet,
  LucideIcon
} from 'lucide-react'

export interface CarouselTab {
  id: string
  label: string
  count: number
  delta?: number
  icon: LucideIcon
  color?: string // Cor customizada para o ícone ativo
}

// Tabs padrão para módulo de cadastros
export const DEFAULT_CADASTROS_TABS: CarouselTab[] = [
  { id: 'medicos', label: 'Médicos Cirurgiões', count: 847, delta: 15, icon: Stethoscope },
  { id: 'hospitais', label: 'Hospitais & Clínicas', count: 312, delta: 8, icon: Building2 },
  { id: 'convenios', label: 'Convênios', count: 89, delta: 3, icon: CreditCard },
  { id: 'fornecedores', label: 'Fornecedores', count: 156, delta: 12, icon: Truck },
  { id: 'produtos', label: 'Produtos OPME', count: 2847, delta: 47, icon: Package },
  { id: 'tabelas', label: 'Tabelas de Preços', count: 42, delta: 2, icon: FileSpreadsheet },
]

interface CadastroTabsCarouselProps {
  tabs?: CarouselTab[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export default function CadastroTabsCarousel({ 
  tabs = DEFAULT_CADASTROS_TABS, 
  active, 
  onChange,
  className 
}: CadastroTabsCarouselProps) {
  const { isDark } = useTheme()

  const containerBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-slate-700/50'
    : 'bg-white/80 backdrop-blur-xl border-slate-200/50'

  return (
    <div className={cn(
      'w-full rounded-2xl border overflow-hidden',
      containerBg,
      className
    )}>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        <div className="flex gap-3 p-4 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = active === tab.id

            return (
              <motion.button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative rounded-xl px-6 py-6 text-center transition-all duration-300 min-w-[160px]',
                  'shadow-lg',
                  isActive
                    ? 'bg-linear-to-br from-violet-600 to-purple-700 text-white shadow-violet-600/30 shadow-2xl'
                    : isDark
                      ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 hover:shadow-xl'
                      : 'bg-slate-100/70 text-slate-700 hover:bg-slate-200/80 hover:shadow-xl'
                )}
              >
                {/* Ícone */}
                <div className={cn(
                  'mx-auto mb-2 p-2 rounded-lg w-fit',
                  isActive 
                    ? 'bg-white/20' 
                    : isDark ? 'bg-slate-700/50' : 'bg-slate-200/50'
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    isActive ? 'text-white' : isDark ? 'text-violet-400' : 'text-violet-600'
                  )} />
                </div>

                {/* Contador grande */}
                <div className={cn(
                  'text-3xl font-bold',
                  isActive ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'
                )}>
                  {tab.count.toLocaleString('pt-BR')}
                </div>

                {/* Label */}
                <div className={cn(
                  'text-xs mt-1 font-medium',
                  isActive ? 'text-white/90' : isDark ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {tab.label}
                </div>

                {/* Badge delta */}
                {tab.delta && tab.delta > 0 && (
                  <Badge className={cn(
                    'absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold',
                    'bg-emerald-500 text-white border-0',
                    'shadow-lg shadow-emerald-500/30'
                  )}>
                    +{tab.delta}
                  </Badge>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

