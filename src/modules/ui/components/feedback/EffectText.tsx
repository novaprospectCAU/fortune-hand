/**
 * EffectText Component
 *
 * Animated text for displaying game effects like joker triggers.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface EffectTextProps {
  text: string;
  variant?: 'default' | 'chips' | 'mult' | 'gold' | 'bonus' | 'penalty';
  size?: 'sm' | 'md' | 'lg';
  isVisible: boolean;
  position?: { x: number; y: number };
  floatDirection?: 'up' | 'down' | 'left' | 'right';
  onComplete?: () => void;
  className?: string;
}

const variantStyles = {
  default: 'text-white',
  chips: 'text-blue-400',
  mult: 'text-red-400',
  gold: 'text-amber-400',
  bonus: 'text-green-400',
  penalty: 'text-red-500',
};

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

const floatOffsets = {
  up: { y: -30 },
  down: { y: 30 },
  left: { x: -30 },
  right: { x: 30 },
};

export function EffectText({
  text,
  variant = 'default',
  size = 'md',
  isVisible,
  position,
  floatDirection = 'up',
  onComplete,
  className,
}: EffectTextProps) {
  const floatOffset = floatOffsets[floatDirection];

  const positionStyle = position
    ? {
        position: 'fixed' as const,
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }
    : {};

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            ...floatOffset,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className={clsx(
            'font-bold pointer-events-none',
            'drop-shadow-lg',
            variantStyles[variant],
            sizeStyles[size],
            !position && 'relative',
            className
          )}
          style={positionStyle}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Multi Effect Text - for displaying multiple effects
export interface MultiEffectTextProps {
  effects: Array<{
    id: string;
    text: string;
    variant?: EffectTextProps['variant'];
  }>;
  size?: 'sm' | 'md' | 'lg';
  staggerDelay?: number;
  onAllComplete?: () => void;
  className?: string;
}

export function MultiEffectText({
  effects,
  size = 'md',
  staggerDelay = 0.15,
  onAllComplete,
  className,
}: MultiEffectTextProps) {
  const [completedCount, setCompletedCount] = React.useState(0);

  React.useEffect(() => {
    if (completedCount === effects.length && effects.length > 0) {
      onAllComplete?.();
    }
  }, [completedCount, effects.length, onAllComplete]);

  React.useEffect(() => {
    setCompletedCount(0);
  }, [effects]);

  return (
    <div className={clsx('flex flex-col items-center gap-1', className)}>
      {effects.map((effect, index) => (
        <motion.div
          key={effect.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{
            delay: index * staggerDelay,
            duration: 0.3,
          }}
          onAnimationComplete={() => {
            // Count completion after a delay for viewing
            setTimeout(() => {
              setCompletedCount((prev) => prev + 1);
            }, 500);
          }}
          className={clsx(
            'font-bold',
            sizeStyles[size],
            variantStyles[effect.variant || 'default']
          )}
        >
          {effect.text}
        </motion.div>
      ))}
    </div>
  );
}

export default EffectText;
