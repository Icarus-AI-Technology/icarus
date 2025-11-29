// ============================================================================
// ICARUS v6.0 - Data Display Components
// KPI Cards, Badges, Status Indicators
// ============================================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Info
} from 'lucide-react';

// ============================================================================
// KPI CARD
// ============================================================================

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  accentColor?: 'blue' | 'green' | 'amber' | 'red' | 'cyan';
  loading?: boolean;
  animated?: boolean;
  className?: string;
}

const accentGradients = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  cyan: 'from-cyan-500 to-cyan-600',
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'blue',
  loading = false,
  animated = true,
  className,
}: KPICardProps) {
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? 'text-green-500 bg-green-500/10'
      : trend.value < 0
      ? 'text-red-500 bg-red-500/10'
      : 'text-slate-400 bg-slate-400/10'
    : '';

  const content = (
    <div
      className={cn(
        'relative p-6 rounded-2xl overflow-hidden',
        'bg-white/[0.03] backdrop-blur-xl',
        'border border-white/[0.08]',
        'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {/* Accent line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          'bg-gradient-to-r',
          accentGradients[accentColor]
        )}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg',
              'bg-gradient-to-br',
              accentGradients[accentColor],
              'shadow-[0_0_20px_rgba(59,130,246,0.2)]'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-10 w-32 rounded-lg skeleton" />
      ) : (
        <div className="text-3xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {value}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      )}

      {/* Trend */}
      {trend && TrendIcon && (
        <div
          className={cn(
            'inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-md text-xs font-medium',
            trendColor
          )}
        >
          <TrendIcon className="w-3 h-3" />
          <span>
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          {trend.label && <span className="text-slate-500 ml-1">{trend.label}</span>}
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// ============================================================================
// BADGE
// ============================================================================

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/[0.05] border-white/[0.1] text-slate-300',
        primary: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        success: 'bg-green-500/10 border-green-500/30 text-green-400',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        danger: 'bg-red-500/10 border-red-500/30 text-red-400',
        info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  icon,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'info' && 'bg-cyan-400',
            variant === 'primary' && 'bg-blue-400',
            (!variant || variant === 'default') && 'bg-slate-400'
          )}
        />
      )}
      {icon}
      {children}
    </span>
  );
}

// ============================================================================
// STATUS INDICATOR
// ============================================================================

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    label: 'Sucesso',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'Atenção',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    label: 'Erro',
  },
  info: {
    icon: Info,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    label: 'Info',
  },
  pending: {
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    label: 'Pendente',
  },
};

export type StatusType = keyof typeof statusConfig;

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  showIcon = true,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border',
        config.bgColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], config.color)} />}
      <span className={cn('font-medium', config.color)}>
        {label || config.label}
      </span>
    </div>
  );
}

// ============================================================================
// ALERT CARD (for Financial Alerts)
// ============================================================================

export interface AlertCardProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description?: string;
  value?: string | number;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const alertStyles = {
  info: {
    border: 'border-l-cyan-500',
    icon: Info,
    iconColor: 'text-cyan-400',
    titleColor: 'text-cyan-400',
  },
  warning: {
    border: 'border-l-amber-500',
    icon: AlertCircle,
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-400',
  },
  error: {
    border: 'border-l-red-500',
    icon: XCircle,
    iconColor: 'text-red-400',
    titleColor: 'text-red-400',
  },
  success: {
    border: 'border-l-green-500',
    icon: CheckCircle2,
    iconColor: 'text-green-400',
    titleColor: 'text-green-400',
  },
};

export function AlertCard({
  type,
  title,
  description,
  value,
  timestamp,
  action,
  className,
}: AlertCardProps) {
  const style = alertStyles[type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-4 rounded-xl border-l-4',
        'bg-white/[0.03] border border-white/[0.08]',
        style.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5', style.iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn('font-medium', style.titleColor)}>{title}</h4>
            {value && (
              <span className="text-sm font-semibold text-white">{value}</span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            {timestamp && (
              <span className="text-xs text-slate-500">{timestamp}</span>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'amber' | 'red' | 'cyan';
  animated?: boolean;
  className?: string;
}

const progressColors = {
  blue: 'from-blue-500 to-blue-400',
  green: 'from-green-500 to-green-400',
  amber: 'from-amber-500 to-amber-400',
  red: 'from-red-500 to-red-400',
  cyan: 'from-cyan-500 to-cyan-400',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  color = 'blue',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-white">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          'bg-white/[0.05]',
          heights[size]
        )}
      >
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            progressColors[color]
          )}
        />
      </div>
    </div>
  );
}
