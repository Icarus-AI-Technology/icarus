import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTheme } from '@/hooks/useTheme'

interface ModuleLoadingSkeletonProps {
  title?: string
  subtitle?: string
  kpiCount?: number
}

/**
 * Reusable loading skeleton for module pages
 * Dark Glass Medical Design System - ICARUS v5.1
 */
export function ModuleLoadingSkeleton({
  title = 'Carregando...',
  subtitle = 'Por favor aguarde',
  kpiCount = 4
}: ModuleLoadingSkeletonProps) {
  const { isDark } = useTheme()

  const skeletonBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-200'
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>{title}</h1>
        <p className={textSecondary}>{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(kpiCount)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className={`h-4 w-24 ${skeletonBg}`} />
            </CardHeader>
            <CardContent>
              <Skeleton className={`h-8 w-20 mb-2 ${skeletonBg}`} />
              <Skeleton className={`h-3 w-16 ${skeletonBg}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
