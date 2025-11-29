// ============================================================================
// ICARUS v6.0 - Dark Glass Medical Components
// React 18 + TypeScript 5.9 + Radix UI + Framer Motion 12
// ============================================================================

import * as React from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// GLASS CARD
// ============================================================================

const glassCardVariants = cva(
  [
    'relative rounded-2xl border backdrop-blur-xl transition-all duration-300',
    'bg-white/[0.03] border-white/[0.08]',
    'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
  ],
  {
    variants: {
      elevation: {
        flat: '',
        raised: [
          'bg-gradient-to-br from-white/[0.06] to-white/[0.02]',
          'shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]',
        ],
        floating: [
          'bg-gradient-to-br from-white/[0.08] to-white/[0.03]',
          'shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]',
        ],
      },
      interactive: {
        true: 'cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
        false: '',
      },
      glow: {
        none: '',
        primary: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        success: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
        danger: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      },
    },
    defaultVariants: {
      elevation: 'flat',
      interactive: false,
      glow: 'none',
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean;
  animated?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, elevation, interactive, glow, asChild, animated = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    
    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          whileHover={interactive ? { scale: 1.02, y: -4 } : undefined}
          className={cn(glassCardVariants({ elevation, interactive, glow }), className)}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(glassCardVariants({ elevation, interactive, glow }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
GlassCard.displayName = 'GlassCard';

// ============================================================================
// NEUMORPHIC BUTTON
// ============================================================================

const neuButtonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-medium text-white rounded-xl',
    'transition-all duration-150 ease-out',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
    // Base neumorphic shadow
    'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03)]',
    // Hover state
    'hover:translate-y-[-1px] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(255,255,255,0.03)]',
    // Active/pressed state
    'active:translate-y-0 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.03)]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f]',
          'focus-visible:ring-white/30',
        ],
        primary: [
          'bg-gradient-to-br from-blue-500 to-blue-600',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03),0_0_20px_rgba(59,130,246,0.2)]',
          'hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(255,255,255,0.03),0_0_30px_rgba(59,130,246,0.3)]',
          'focus-visible:ring-blue-500',
        ],
        success: [
          'bg-gradient-to-br from-green-500 to-green-600',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03),0_0_20px_rgba(34,197,94,0.2)]',
          'focus-visible:ring-green-500',
        ],
        danger: [
          'bg-gradient-to-br from-red-500 to-red-600',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03),0_0_20px_rgba(239,68,68,0.2)]',
          'focus-visible:ring-red-500',
        ],
        ghost: [
          'bg-transparent shadow-none',
          'hover:bg-white/[0.05] hover:shadow-none',
          'active:bg-white/[0.08] active:shadow-none',
        ],
        outline: [
          'bg-transparent border border-white/20',
          'shadow-none hover:shadow-none active:shadow-none',
          'hover:bg-white/[0.05] hover:border-white/30',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface NeuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neuButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ className, variant, size, asChild, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(neuButtonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shine overlay */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100 pointer-events-none" />
        
        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : leftIcon}
          {children}
          {rightIcon}
        </span>
      </Comp>
    );
  }
);
NeuButton.displayName = 'NeuButton';

// ============================================================================
// NEUMORPHIC INPUT
// ============================================================================

const neuInputVariants = cva(
  [
    'w-full px-4 py-3 text-sm text-white placeholder:text-slate-500',
    'bg-[#0a0a0f] border border-white/[0.08] rounded-xl',
    'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.03)]',
    'outline-none transition-all duration-150',
    'focus:border-blue-500 focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.03),0_0_0_3px_rgba(59,130,246,0.2)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      state: {
        default: '',
        error: 'border-red-500 focus:border-red-500 focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.03),0_0_0_3px_rgba(239,68,68,0.2)]',
        success: 'border-green-500 focus:border-green-500 focus:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.03),0_0_0_3px_rgba(34,197,94,0.2)]',
      },
      inputSize: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      state: 'default',
      inputSize: 'md',
    },
  }
);

export interface NeuInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof neuInputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, state, inputSize, leftIcon, rightIcon, error, ...props }, ref) => {
    const inputState = error ? 'error' : state;

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            neuInputVariants({ state: inputState, inputSize }),
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
NeuInput.displayName = 'NeuInput';

// ============================================================================
// 3D ICON
// ============================================================================

const icon3DVariants = cva(
  [
    'relative inline-flex items-center justify-center rounded-xl',
    'bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f]',
    'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03)]',
    'transition-all duration-300',
    // Inner shine
    'before:absolute before:inset-[2px] before:rounded-[10px]',
    'before:bg-gradient-to-br before:from-white/10 before:to-transparent',
    'before:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        default: '',
        primary: [
          'bg-gradient-to-br from-blue-500 to-blue-600',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03),0_0_20px_rgba(59,130,246,0.3)]',
        ],
        success: [
          'bg-gradient-to-br from-green-500 to-green-600',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03),0_0_20px_rgba(34,197,94,0.3)]',
        ],
        warning: [
          'bg-gradient-to-br from-amber-500 to-amber-600',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03),0_0_20px_rgba(245,158,11,0.3)]',
        ],
        danger: [
          'bg-gradient-to-br from-red-500 to-red-600',
          'shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.03),0_0_20px_rgba(239,68,68,0.3)]',
        ],
      },
      size: {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
      },
      animated: {
        true: 'hover:translate-y-[-2px] hover:scale-105',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animated: true,
    },
  }
);

export interface Icon3DProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof icon3DVariants> {
  icon: React.ReactNode;
}

const Icon3D = React.forwardRef<HTMLDivElement, Icon3DProps>(
  ({ className, variant, size, animated, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(icon3DVariants({ variant, size, animated }), className)}
        {...props}
      >
        <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {icon}
        </span>
      </div>
    );
  }
);
Icon3D.displayName = 'Icon3D';

// ============================================================================
// EXPORTS
// ============================================================================

export {
  GlassCard,
  glassCardVariants,
  NeuButton,
  neuButtonVariants,
  NeuInput,
  neuInputVariants,
  Icon3D,
  icon3DVariants,
};
