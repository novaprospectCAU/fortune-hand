/**
 * ProgressBar Component
 *
 * An animated progress bar with customizable appearance.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelFormat?: 'percentage' | 'value' | 'fraction';
  animated?: boolean;
  striped?: boolean;
  className?: string;
  barClassName?: string;
}

const variantStyles = {
  default: 'bg-slate-500',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

const trackStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  labelFormat = 'percentage',
  animated = true,
  striped = false,
  className,
  barClassName,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const formatLabel = () => {
    switch (labelFormat) {
      case 'percentage':
        return `${Math.round(percentage)}%`;
      case 'value':
        return `${value}`;
      case 'fraction':
        return `${value} / ${max}`;
      default:
        return `${Math.round(percentage)}%`;
    }
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Track */}
      <div
        className={clsx(
          'w-full bg-game-card rounded-full overflow-hidden',
          trackStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Bar */}
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={
            animated
              ? {
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                }
              : { duration: 0 }
          }
          className={clsx(
            'h-full rounded-full',
            variantStyles[variant],
            sizeStyles[size],
            striped && 'bg-stripes',
            barClassName
          )}
          style={
            striped
              ? {
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255, 255, 255, 0.1) 10px,
                    rgba(255, 255, 255, 0.1) 20px
                  )`,
                  backgroundSize: '28px 28px',
                  animation: striped ? 'progress-stripe 1s linear infinite' : undefined,
                }
              : undefined
          }
        />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="mt-1 text-right text-sm text-slate-400">
          {formatLabel()}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
