/**
 * GoldDisplay Component
 *
 * Displays gold amount with optional change animation.
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { clsx } from 'clsx';

export interface GoldDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showChange?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    container: 'gap-1',
    icon: 'w-4 h-4 text-sm',
    amount: 'text-sm',
    change: 'text-xs',
  },
  md: {
    container: 'gap-2',
    icon: 'w-6 h-6 text-base',
    amount: 'text-lg',
    change: 'text-sm',
  },
  lg: {
    container: 'gap-3',
    icon: 'w-8 h-8 text-lg',
    amount: 'text-2xl',
    change: 'text-base',
  },
};

export function GoldDisplay({
  amount,
  size = 'md',
  showIcon = true,
  showChange = true,
  animated = true,
  className,
}: GoldDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [change, setChange] = useState<number | null>(null);
  const prevAmount = useRef(amount);

  // Spring animation for smooth number transitions
  const springValue = useSpring(amount, {
    stiffness: 100,
    damping: 20,
  });

  useEffect(() => {
    if (animated) {
      springValue.set(amount);
    }
  }, [amount, animated, springValue]);

  useEffect(() => {
    if (animated) {
      const unsubscribe = springValue.on('change', (value) => {
        setDisplayAmount(Math.round(value));
      });
      return unsubscribe;
    } else {
      setDisplayAmount(amount);
    }
  }, [springValue, animated, amount]);

  // Track changes
  useEffect(() => {
    if (showChange && prevAmount.current !== amount) {
      const diff = amount - prevAmount.current;
      setChange(diff);
      prevAmount.current = amount;

      // Clear change after animation
      const timer = setTimeout(() => setChange(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [amount, showChange]);

  const styles = sizeStyles[size];

  return (
    <div
      className={clsx(
        'relative inline-flex items-center',
        styles.container,
        className
      )}
    >
      {/* Gold Icon */}
      {showIcon && (
        <div
          className={clsx(
            'flex items-center justify-center',
            'bg-amber-500/20 rounded-lg',
            styles.icon
          )}
        >
          <span className="text-amber-400" aria-hidden="true">
            $
          </span>
        </div>
      )}

      {/* Amount */}
      <motion.span
        key={animated ? undefined : amount}
        initial={animated ? undefined : { scale: 1.1 }}
        animate={animated ? undefined : { scale: 1 }}
        className={clsx(
          'font-bold text-amber-400 tabular-nums',
          styles.amount
        )}
        aria-label={`${amount} gold`}
      >
        {displayAmount.toLocaleString()}
      </motion.span>

      {/* Change Indicator */}
      <AnimatePresence>
        {change !== null && (
          <motion.span
            initial={{ opacity: 0, y: 10, x: 0 }}
            animate={{ opacity: 1, y: -20, x: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className={clsx(
              'absolute left-1/2 -translate-x-1/2 top-0',
              'font-bold whitespace-nowrap',
              styles.change,
              change > 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {change > 0 ? '+' : ''}
            {change.toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GoldDisplay;
