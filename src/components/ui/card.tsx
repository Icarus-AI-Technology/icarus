import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-gradient-to-br from-gray-900/90 to-gray-800/90
        backdrop-blur-sm
        border border-white/10
        rounded-2xl p-6
        shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

interface KPICardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export function KPICard({ label, value, icon, trend, color = 'blue' }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }

  return (
    <Card className="hover:border-blue-500/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-100 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-4 text-sm">
          <span className={trend.isPositive ? 'text-green-400' : 'text-red-400'}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">vs mês anterior</span>
        </div>
      )}
    </Card>
  )
}
