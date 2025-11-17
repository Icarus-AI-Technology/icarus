import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface ModuleLoadingSkeletonProps {
  title: string
  subtitle: string
  kpiCount?: number
}

/**
 * Reusable loading skeleton for module pages
 * Displays title, subtitle and KPI card skeletons
 */
export function ModuleLoadingSkeleton({
  title,
  subtitle,
  kpiCount = 4
}: ModuleLoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(kpiCount)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
