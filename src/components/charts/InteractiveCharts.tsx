import React, { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  ZoomIn, 
  Download, 
  Filter,
  ChevronLeft 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * Tema de cores para gráficos - Dark Glass Medical
 */
const CHART_COLORS = {
  primary: '#6366F1',    // Violet
  secondary: '#8B5CF6',  // Purple
  success: '#10B981',    // Emerald
  warning: '#F59E0B',    // Amber (para alertas apenas)
  danger: '#EF4444',     // Red
  info: '#06B6D4',       // Cyan
  gradient1: '#6366F1',
  gradient2: '#8B5CF6',
  gradient3: '#14B8A6',  // Teal
}

const COLORS_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.info,
  CHART_COLORS.gradient3,
]

interface DrillDownLevel {
  name: string
  data: any[]
}

interface InteractiveChartProps {
  title: string
  subtitle?: string
  type: 'line' | 'bar' | 'area' | 'pie'
  data: any[]
  dataKey: string
  xAxisKey?: string
  enableDrillDown?: boolean
  drillDownLevels?: DrillDownLevel[]
  showTrend?: boolean
  onExport?: () => void
  className?: string
}

/**
 * Tooltip personalizado com Dark Glass Medical
 */
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  const { isDark } = useTheme()

  if (!active || !payload || payload.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl',
        isDark
          ? 'bg-slate-900/90 border-slate-700/50'
          : 'bg-white/90 border-slate-200/50'
      )}
    >
      <p className={cn(
        'font-semibold mb-2',
        isDark ? 'text-slate-200' : 'text-slate-900'
      )}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            {entry.name}:
          </span>
          <span className={cn(
            'text-sm font-bold',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('pt-BR')
              : entry.value}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

/**
 * Componente de Gráfico Interativo com Drill-Down
 */
export function InteractiveChart({
  title,
  subtitle,
  type,
  data,
  dataKey,
  xAxisKey = 'name',
  enableDrillDown = false,
  drillDownLevels = [],
  showTrend = false,
  onExport,
  className,
}: InteractiveChartProps) {
  const { isDark } = useTheme()
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentData, setCurrentData] = useState(data)
  const [drillStack, setDrillStack] = useState<string[]>([])

  // Calcular tendência
  const calculateTrend = () => {
    if (currentData.length < 2) return { value: 0, direction: 'neutral' as const }
    
    const last = currentData[currentData.length - 1][dataKey]
    const previous = currentData[currentData.length - 2][dataKey]
    const diff = ((last - previous) / previous) * 100

    return {
      value: Math.abs(diff),
      direction: diff > 0 ? 'up' as const : diff < 0 ? 'down' as const : 'neutral' as const
    }
  }

  const trend = showTrend ? calculateTrend() : null

  // Drill-down handler
  const handleDrillDown = (entry: any) => {
    if (!enableDrillDown || currentLevel >= drillDownLevels.length) return

    const nextLevel = drillDownLevels[currentLevel]
    setCurrentData(nextLevel.data)
    setDrillStack([...drillStack, entry[xAxisKey]])
    setCurrentLevel(currentLevel + 1)
  }

  // Drill-up handler
  const handleDrillUp = () => {
    if (currentLevel === 0) return

    const newStack = [...drillStack]
    newStack.pop()
    setDrillStack(newStack)
    setCurrentLevel(currentLevel - 1)

    if (currentLevel === 1) {
      setCurrentData(data)
    } else {
      setCurrentData(drillDownLevels[currentLevel - 2].data)
    }
  }

  // Configurações dos eixos
  const axisStyle = {
    stroke: isDark ? '#64748B' : '#94A3B8',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
  }

  const gridStyle = {
    stroke: isDark ? '#1E293B' : '#E2E8F0',
    strokeDasharray: '5 5',
  }

  // Renderizar gráfico baseado no tipo
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={currentData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={CHART_COLORS.primary}
              strokeWidth={3}
              dot={{ fill: CHART_COLORS.primary, r: 5 }}
              activeDot={{ r: 8, onClick: (_, entry) => handleDrillDown(entry.payload) }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={currentData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey={dataKey}
              fill={CHART_COLORS.primary}
              radius={[8, 8, 0, 0]}
              onClick={(entry) => handleDrillDown(entry)}
              cursor={enableDrillDown ? 'pointer' : 'default'}
            />
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart data={currentData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fill="url(#colorGradient)"
              onClick={(entry) => handleDrillDown(entry)}
              cursor={enableDrillDown ? 'pointer' : 'default'}
            />
          </AreaChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry[xAxisKey]}: ${entry[dataKey]}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={dataKey}
              onClick={(entry) => handleDrillDown(entry)}
              cursor={enableDrillDown ? 'pointer' : 'default'}
            >
              {currentData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-2xl border backdrop-blur-xl shadow-2xl',
        isDark
          ? 'bg-slate-900/70 border-slate-700/50'
          : 'bg-white/70 border-slate-200/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {enableDrillDown && currentLevel > 0 && (
              <Button
                onClick={handleDrillUp}
                variant="ghost"
                className="p-2 h-auto"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h3 className={cn(
                'text-lg font-bold',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                {title}
                {drillStack.length > 0 && ` > ${drillStack.join(' > ')}`}
              </h3>
              {subtitle && (
                <p className={cn(
                  'text-sm mt-1',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trend indicator */}
        {trend && trend.direction !== 'neutral' && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            trend.direction === 'up'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-red-500/10 text-red-500'
          )}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-bold">
              {trend.value.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {enableDrillDown && (
            <Button variant="ghost" className="p-2 h-auto">
              <ZoomIn className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" className="p-2 h-auto">
            <Filter className="w-4 h-4" />
          </Button>
          {onExport && (
            <Button onClick={onExport} variant="ghost" className="p-2 h-auto">
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevel}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Drill-down indicator */}
      {enableDrillDown && (
        <div className={cn(
          'mt-4 text-xs text-center',
          isDark ? 'text-slate-500' : 'text-slate-400'
        )}>
          {currentLevel < drillDownLevels.length
            ? '💡 Clique em um ponto para drill-down'
            : '📊 Nível máximo de detalhamento'}
        </div>
      )}
    </motion.div>
  )
}

/**
 * Exemplo de uso com dados mockados
 */
export const InteractiveChartExample = () => {
  const salesData = [
    { name: 'Jan', vendas: 12000, faturamento: 45000 },
    { name: 'Fev', vendas: 15000, faturamento: 52000 },
    { name: 'Mar', vendas: 18000, faturamento: 61000 },
    { name: 'Abr', vendas: 22000, faturamento: 75000 },
    { name: 'Mai', vendas: 25000, faturamento: 85000 },
    { name: 'Jun', vendas: 30000, faturamento: 98000 },
  ]

  const drillDownLevels = [
    {
      name: 'Por Produto',
      data: [
        { name: 'OPME Cardíaco', vendas: 10000 },
        { name: 'OPME Ortopédico', vendas: 8000 },
        { name: 'OPME Vascular', vendas: 7000 },
      ]
    },
    {
      name: 'Por Cliente',
      data: [
        { name: 'Hospital A', vendas: 5000 },
        { name: 'Hospital B', vendas: 3000 },
        { name: 'Hospital C', vendas: 2000 },
      ]
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InteractiveChart
        title="Vendas Mensais"
        subtitle="Com tendência e drill-down"
        type="area"
        data={salesData}
        dataKey="vendas"
        xAxisKey="name"
        showTrend
        enableDrillDown
        drillDownLevels={drillDownLevels}
        onExport={() => console.log('Exportar vendas')}
      />

      <InteractiveChart
        title="Faturamento"
        subtitle="Comparativo mensal"
        type="bar"
        data={salesData}
        dataKey="faturamento"
        xAxisKey="name"
        showTrend
        onExport={() => console.log('Exportar faturamento')}
      />
    </div>
  )
}

