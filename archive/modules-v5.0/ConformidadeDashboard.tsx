/**
 * ICARUS v5.0 - Dashboard de Conformidade Regulatória
 * 
 * KPIs de conformidade ANVISA + CFM em tempo real
 * Design: Dark Glass Medical com efeitos neumórficos 3D
 * 
 * Conformidade: RDC 751/2022, CFM, 21 CFR Part 11
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, XCircle, Clock,
  TrendingUp, Users, Package,
  RefreshCw, ExternalLink, CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/hooks/useTheme'
import { useSupabaseClient } from '@/hooks/useSupabase'
import { cn } from '@/lib/utils'

// ============================================
// TIPOS
// ============================================

interface ConformidadeStats {
  anvisa_total: number
  anvisa_validos: number
  anvisa_invalidos: number
  anvisa_vencendo_30d: number
  anvisa_percentual: number
  cfm_total: number
  cfm_validos: number
  cfm_invalidos: number
  cfm_percentual: number
  conformidade_geral: number
}

interface AlertaItem {
  id: string
  tipo: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  titulo: string
  descricao: string
  created_at: string
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ConformidadeDashboard() {
  const { isDark } = useTheme()
  const supabase = useSupabaseClient()
  
  const [stats, setStats] = useState<ConformidadeStats | null>(null)
  const [alertas, setAlertas] = useState<AlertaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Styles neumórficos
  const neuStyles = {
    cardBg: isDark ? '#1A1F35' : '#FFFFFF',
    shadowElevated: isDark 
      ? '8px 8px 20px rgba(0,0,0,0.5), -6px -6px 16px rgba(255,255,255,0.02)'
      : '6px 6px 16px rgba(0,0,0,0.1), -4px -4px 12px rgba(255,255,255,0.9)',
  }

  // Carrega dados
  const loadData = useCallback(async () => {
    if (!supabase) return

    try {
      // Dashboard de conformidade
      const { data: statsData } = await supabase.rpc('dashboard_conformidade')
      if (statsData && statsData.length > 0) {
        setStats(statsData[0])
      }

      // Alertas não resolvidos
      const { data: alertasData } = await supabase
        .from('anvisa_alertas')
        .select('id, tipo, severidade, titulo, descricao, created_at')
        .eq('resolvido', false)
        .order('severidade', { ascending: false })
        .limit(5)

      if (alertasData) {
        setAlertas(alertasData as AlertaItem[])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de conformidade:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  // Calcula cor do progresso
  const getProgressColor = (value: number) => {
    if (value >= 90) return '#10B981' // Verde
    if (value >= 70) return '#F59E0B' // Âmbar
    return '#EF4444' // Vermelho
  }

  // Componente KPI Card
  const KPICard = ({ 
    title, 
    value, 
    subtitle,
    icon: Icon, 
    iconColor,
    trend
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
    iconColor: string
    trend?: { value: number; direction: 'up' | 'down' }
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="h-full"
        style={{
          backgroundColor: neuStyles.cardBg,
          boxShadow: neuStyles.shadowElevated,
          border: 'none'
        }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                isDark ? 'text-slate-400' : 'text-theme-muted'
              )}>
                {title}
              </p>
              <p className={cn(
                'text-3xl font-bold mt-1',
                isDark ? 'text-white' : 'text-theme-primary'
              )}>
                {value}
              </p>
              {subtitle && (
                <p className={cn(
                  'text-xs mt-1',
                  isDark ? 'text-slate-500' : 'text-gray-400'
                )}>
                  {subtitle}
                </p>
              )}
              {trend && (
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-xs font-medium',
                  trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'
                )}>
                  <TrendingUp className={cn(
                    'w-3 h-3',
                    trend.direction === 'down' && 'rotate-180'
                  )} />
                  {trend.value}%
                </div>
              )}
            </div>
            <div 
              className="p-3 rounded-xl"
              style={{
                backgroundColor: `${iconColor}20`,
                boxShadow: isDark 
                  ? 'inset 2px 2px 4px rgba(0,0,0,0.3)'
                  : 'inset 2px 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <Icon className="w-6 h-6" style={{ color: iconColor }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Componente Progress Ring
  const ProgressRing = ({ value, size = 120, strokeWidth = 10, color }: {
    value: number
    size?: number
    strokeWidth?: number
    color: string
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            className={isDark ? 'stroke-slate-700' : 'stroke-gray-200'}
            fill="none"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'text-2xl font-bold',
            isDark ? 'text-white' : 'text-theme-primary'
          )}>
            {value}%
          </span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-700/50 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-700/30 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(
            'text-2xl font-bold',
            isDark ? 'text-white' : 'text-theme-primary'
          )}>
            Dashboard de Conformidade
          </h2>
          <p className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-theme-muted'
          )}>
            Monitoramento ANVISA + CFM em tempo real
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="secondary"
          className="gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          Atualizar
        </Button>
      </div>

      {/* Conformidade Geral */}
      <Card
        style={{
          backgroundColor: neuStyles.cardBg,
          boxShadow: neuStyles.shadowElevated,
          border: 'none'
        }}
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ProgressRing 
              value={stats?.conformidade_geral || 0}
              size={140}
              strokeWidth={12}
              color={getProgressColor(stats?.conformidade_geral || 0)}
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className={cn(
                'text-xl font-bold',
                isDark ? 'text-white' : 'text-theme-primary'
              )}>
                Conformidade Regulatória Geral
              </h3>
              <p className={cn(
                'mt-1',
                isDark ? 'text-slate-400' : 'text-theme-muted'
              )}>
                Taxa de conformidade combinada ANVISA + CFM
              </p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <Badge className="bg-emerald-500/20 text-emerald-400 gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  RDC 751/2022
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  21 CFR Part 11
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 gap-1">
                  <Users className="w-3 h-3" />
                  CFM/CRM
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Produtos ANVISA Válidos"
          value={`${stats?.anvisa_percentual || 0}%`}
          subtitle={`${stats?.anvisa_validos || 0} de ${stats?.anvisa_total || 0} verificados`}
          icon={ShieldCheck}
          iconColor="#10B981"
        />
        <KPICard
          title="Registros Vencendo"
          value={stats?.anvisa_vencendo_30d || 0}
          subtitle="Próximos 30 dias"
          icon={Clock}
          iconColor="#F59E0B"
        />
        <KPICard
          title="Médicos CFM Válidos"
          value={`${stats?.cfm_percentual || 0}%`}
          subtitle={`${stats?.cfm_validos || 0} de ${stats?.cfm_total || 0} verificados`}
          icon={Users}
          iconColor="#6366F1"
        />
        <KPICard
          title="Produtos Não Conformes"
          value={(stats?.anvisa_invalidos || 0) + (stats?.cfm_invalidos || 0)}
          subtitle="ANVISA + CFM"
          icon={XCircle}
          iconColor="#EF4444"
        />
      </div>

      {/* Detalhes ANVISA e CFM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ANVISA Card */}
        <Card
          style={{
            backgroundColor: neuStyles.cardBg,
            boxShadow: neuStyles.shadowElevated,
            border: 'none'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Conformidade ANVISA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>Total Verificados</span>
              <span className={cn('font-semibold', isDark ? 'text-white' : 'text-theme-primary')}>
                {stats?.anvisa_total || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>Registros Válidos</span>
              <span className="text-emerald-500 font-semibold">{stats?.anvisa_validos || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>Registros Inválidos</span>
              <span className="text-red-500 font-semibold">{stats?.anvisa_invalidos || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>Vencendo (30 dias)</span>
              <span className="text-amber-500 font-semibold">{stats?.anvisa_vencendo_30d || 0}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>Taxa de Conformidade</span>
                <span className={isDark ? 'text-white' : 'text-theme-primary'}>{stats?.anvisa_percentual || 0}%</span>
              </div>
              <div className={cn(
                'h-2 rounded-full overflow-hidden',
                isDark ? 'bg-slate-700' : 'progress-bar-bg'
              )}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.anvisa_percentual || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getProgressColor(stats?.anvisa_percentual || 0) }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CFM Card */}
        <Card
          style={{
            backgroundColor: neuStyles.cardBg,
            boxShadow: neuStyles.shadowElevated,
            border: 'none'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Conformidade CFM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>Total Verificados</span>
              <span className={cn('font-semibold', isDark ? 'text-white' : 'text-theme-primary')}>
                {stats?.cfm_total || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>CRMs Ativos</span>
              <span className="text-emerald-500 font-semibold">{stats?.cfm_validos || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>CRMs Inativos/Suspensos</span>
              <span className="text-red-500 font-semibold">{stats?.cfm_invalidos || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-theme-muted'}>Pendentes Verificação</span>
              <span className="text-amber-500 font-semibold">-</span>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>Taxa de Conformidade</span>
                <span className={isDark ? 'text-white' : 'text-theme-primary'}>{stats?.cfm_percentual || 0}%</span>
              </div>
              <div className={cn(
                'h-2 rounded-full overflow-hidden',
                isDark ? 'bg-slate-700' : 'progress-bar-bg'
              )}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.cfm_percentual || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getProgressColor(stats?.cfm_percentual || 0) }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card
          style={{
            backgroundColor: neuStyles.cardBg,
            boxShadow: neuStyles.shadowElevated,
            border: 'none'
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'p-4 rounded-xl flex items-start gap-3',
                    isDark ? 'bg-slate-800/50' : 'bg-theme-elevated'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    alerta.severidade === 'critica' && 'bg-red-500/20',
                    alerta.severidade === 'alta' && 'bg-orange-500/20',
                    alerta.severidade === 'media' && 'bg-amber-500/20',
                    alerta.severidade === 'baixa' && 'bg-blue-500/20'
                  )}>
                    <AlertTriangle className={cn(
                      'w-4 h-4',
                      alerta.severidade === 'critica' && 'text-red-500',
                      alerta.severidade === 'alta' && 'text-orange-500',
                      alerta.severidade === 'media' && 'text-amber-500',
                      alerta.severidade === 'baixa' && 'text-blue-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium truncate',
                      isDark ? 'text-white' : 'text-theme-primary'
                    )}>
                      {alerta.titulo}
                    </p>
                    <p className={cn(
                      'text-sm truncate',
                      isDark ? 'text-slate-400' : 'text-theme-muted'
                    )}>
                      {alerta.descricao}
                    </p>
                  </div>
                  <Badge className={cn(
                    'shrink-0',
                    alerta.severidade === 'critica' && 'bg-red-500/20 text-red-400',
                    alerta.severidade === 'alta' && 'bg-orange-500/20 text-orange-400',
                    alerta.severidade === 'media' && 'bg-amber-500/20 text-amber-400',
                    alerta.severidade === 'baixa' && 'bg-blue-500/20 text-blue-400'
                  )}>
                    {alerta.severidade}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links úteis */}
      <div className="flex flex-wrap gap-4 justify-center">
        <a
          href="https://consultas.anvisa.gov.br/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
            'transition-colors hover:bg-emerald-500/20',
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          Portal ANVISA
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://portal.cfm.org.br/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
            'transition-colors hover:bg-indigo-500/20',
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          )}
        >
          <Users className="w-4 h-4" />
          Portal CFM
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

export default ConformidadeDashboard

