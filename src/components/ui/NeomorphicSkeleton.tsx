/**
 * ICARUS v5.0 - Neomorphic Skeleton
 * 
 * Componente de loading com efeito neumórfico 3D e animação suave.
 * Segue o Dark Glass Medical Design System.
 * 
 * @version 1.0.0
 */

import { motion } from 'motion/react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

// ============ TIPOS ============

export interface NeomorphicSkeletonProps {
  /** Largura do skeleton */
  width?: string | number
  /** Altura do skeleton */
  height?: string | number
  /** Variante do skeleton */
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'input' | 'kpi'
  /** Classes CSS adicionais */
  className?: string
  /** Número de linhas (para variant='text') */
  lines?: number
  /** Se deve animar */
  animate?: boolean
}

export interface SkeletonCardProps {
  /** Mostrar header */
  showHeader?: boolean
  /** Mostrar avatar no header */
  showAvatar?: boolean
  /** Número de linhas de conteúdo */
  contentLines?: number
  /** Mostrar footer */
  showFooter?: boolean
  /** Classes CSS adicionais */
  className?: string
}

export interface SkeletonTableProps {
  /** Número de colunas */
  columns?: number
  /** Número de linhas */
  rows?: number
  /** Classes CSS adicionais */
  className?: string
}

// ============ COMPONENTE BASE ============

export function NeomorphicSkeleton({
  width,
  height,
  variant = 'card',
  className,
  lines = 3,
  animate = true,
}: NeomorphicSkeletonProps) {
  const { isDark } = useTheme()

  // Dimensões padrão por variante
  const defaultDimensions = {
    card: { width: '100%', height: 200 },
    text: { width: '100%', height: 16 },
    avatar: { width: 48, height: 48 },
    button: { width: 120, height: 40 },
    input: { width: '100%', height: 44 },
    kpi: { width: '100%', height: 120 },
  }

  const dimensions = {
    width: width || defaultDimensions[variant].width,
    height: height || defaultDimensions[variant].height,
  }

  // Cores e sombras do Dark Glass Medical
  const bgColor = isDark ? '#1A1F35' : '#E2E8F0'
  const shadowDark = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'
  const shadowLight = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'

  // Variantes de animação
  const pulseAnimation = animate
    ? {
        opacity: [0.5, 0.8, 0.5],
        boxShadow: [
          `8px 8px 16px ${shadowDark}, -6px -6px 14px ${shadowLight}`,
          `12px 12px 24px ${shadowDark}, -8px -8px 18px ${shadowLight}`,
          `8px 8px 16px ${shadowDark}, -6px -6px 14px ${shadowLight}`,
        ],
      }
    : {}

  // Renderizar múltiplas linhas para variant='text'
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.5 }}
            animate={pulseAnimation}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            className="rounded-lg"
            style={{
              width: i === lines - 1 ? '60%' : dimensions.width,
              height: dimensions.height,
              backgroundColor: bgColor,
            }}
          />
        ))}
      </div>
    )
  }

  // Renderizar skeleton único
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={pulseAnimation}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
      className={cn(
        variant === 'avatar' ? 'rounded-full' : 'rounded-2xl',
        className
      )}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: bgColor,
      }}
    />
  )
}

// ============ SKELETON CARD ============

export function SkeletonCard({
  showHeader = true,
  showAvatar = false,
  contentLines = 3,
  showFooter = false,
  className,
}: SkeletonCardProps) {
  const { isDark } = useTheme()

  const cardBg = isDark ? '#15192B' : '#FFFFFF'
  const shadowDark = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'
  const shadowLight = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('rounded-2xl p-6', className)}
      style={{
        backgroundColor: cardBg,
        boxShadow: `8px 8px 16px ${shadowDark}, -6px -6px 14px ${shadowLight}`,
      }}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-4 mb-4">
          {showAvatar && <NeomorphicSkeleton variant="avatar" />}
          <div className="flex-1 space-y-2">
            <NeomorphicSkeleton variant="text" width="60%" />
            <NeomorphicSkeleton variant="text" width="40%" height={12} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <NeomorphicSkeleton variant="text" lines={contentLines} />
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
          <NeomorphicSkeleton variant="button" width={100} />
          <NeomorphicSkeleton variant="button" width={100} />
        </div>
      )}
    </motion.div>
  )
}

// ============ SKELETON KPI CARD ============

export function SkeletonKPICard({ className }: { className?: string }) {
  const { isDark } = useTheme()

  const cardBg = isDark ? '#15192B' : '#FFFFFF'
  const shadowDark = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'
  const shadowLight = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl p-6', className)}
      style={{
        backgroundColor: cardBg,
        boxShadow: `8px 8px 16px ${shadowDark}, -6px -6px 14px ${shadowLight}`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <NeomorphicSkeleton variant="avatar" width={40} height={40} />
        <NeomorphicSkeleton variant="text" width="50%" height={14} />
      </div>
      <NeomorphicSkeleton variant="text" width="40%" height={32} />
      <div className="mt-3">
        <NeomorphicSkeleton variant="text" width="30%" height={12} />
      </div>
    </motion.div>
  )
}

// ============ SKELETON TABLE ============

export function SkeletonTable({
  columns = 5,
  rows = 5,
  className,
}: SkeletonTableProps) {
  const { isDark } = useTheme()

  const cardBg = isDark ? '#15192B' : '#FFFFFF'
  const shadowDark = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'
  const shadowLight = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('rounded-2xl p-6', className)}
      style={{
        backgroundColor: cardBg,
        boxShadow: `8px 8px 16px ${shadowDark}, -6px -6px 14px ${shadowLight}`,
      }}
    >
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-white/10">
        {Array.from({ length: columns }).map((_, i) => (
          <NeomorphicSkeleton
            key={`header-${i}`}
            variant="text"
            width={`${100 / columns}%`}
            height={14}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <motion.div
            key={`row-${rowIdx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rowIdx * 0.05 }}
            className="flex gap-4"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <NeomorphicSkeleton
                key={`cell-${rowIdx}-${colIdx}`}
                variant="text"
                width={`${100 / columns}%`}
                height={16}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ============ SKELETON DASHBOARD ============

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`kpi-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <SkeletonKPICard />
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard contentLines={0} showHeader>
          <NeomorphicSkeleton variant="card" height={250} className="mt-4" />
        </SkeletonCard>
        <SkeletonCard contentLines={0} showHeader>
          <NeomorphicSkeleton variant="card" height={250} className="mt-4" />
        </SkeletonCard>
      </div>

      {/* Table */}
      <SkeletonTable columns={6} rows={5} />
    </div>
  )
}

// ============ SKELETON MODULE ============

export function SkeletonModule() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <NeomorphicSkeleton variant="avatar" width={56} height={56} />
        <div className="space-y-2">
          <NeomorphicSkeleton variant="text" width={200} height={28} />
          <NeomorphicSkeleton variant="text" width={150} height={14} />
        </div>
      </div>

      {/* Content */}
      <SkeletonCard showHeader contentLines={5} showFooter />
    </div>
  )
}

export default NeomorphicSkeleton

