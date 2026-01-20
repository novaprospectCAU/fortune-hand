/**
 * PhaseIndicator Component
 *
 * Shows current game phase with transition animation.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import type { GamePhase } from '@/types/interfaces';
import { phaseTransition } from '../../animations/variants';

export interface PhaseIndicatorProps {
  phase: GamePhase;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
  animated?: boolean;
  className?: string;
}

interface PhaseConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

const phaseConfigs: Record<GamePhase, PhaseConfig> = {
  IDLE: {
    label: 'Ready',
    icon: 'O',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
  },
  SLOT_PHASE: {
    label: 'Slot Spin',
    icon: 'S',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  DRAW_PHASE: {
    label: 'Draw Cards',
    icon: 'D',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  PLAY_PHASE: {
    label: 'Play Hand',
    icon: 'P',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  SCORE_PHASE: {
    label: 'Scoring',
    icon: '#',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  ROULETTE_PHASE: {
    label: 'Roulette',
    icon: 'R',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  REWARD_PHASE: {
    label: 'Rewards',
    icon: '*',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  SHOP_PHASE: {
    label: 'Shop',
    icon: '$',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  GAME_OVER: {
    label: 'Game Over',
    icon: 'X',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-2 py-1 gap-1.5',
    icon: 'w-4 h-4 text-xs',
    label: 'text-xs',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    container: 'px-3 py-1.5 gap-2',
    icon: 'w-6 h-6 text-sm',
    label: 'text-sm',
    dot: 'w-2 h-2',
  },
  lg: {
    container: 'px-4 py-2 gap-2.5',
    icon: 'w-8 h-8 text-base',
    label: 'text-base',
    dot: 'w-2.5 h-2.5',
  },
};

export function PhaseIndicator({
  phase,
  size = 'md',
  showIcon = true,
  showDot = true,
  animated = true,
  className,
}: PhaseIndicatorProps) {
  const config = phaseConfigs[phase];
  const styles = sizeStyles[size];
  const isActive = phase !== 'IDLE' && phase !== 'GAME_OVER';

  const content = (
    <div
      className={clsx(
        'inline-flex items-center rounded-full',
        'bg-game-card border border-game-border',
        styles.container,
        className
      )}
    >
      {/* Status Dot */}
      {showDot && (
        <div
          className={clsx(
            'rounded-full',
            styles.dot,
            phase === 'GAME_OVER'
              ? 'bg-red-500'
              : isActive
              ? 'bg-green-500 animate-pulse'
              : 'bg-slate-500'
          )}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {showIcon && (
        <div
          className={clsx(
            'flex items-center justify-center rounded-full font-bold',
            styles.icon,
            config.bgColor,
            config.color
          )}
          aria-hidden="true"
        >
          {config.icon}
        </div>
      )}

      {/* Label */}
      <span
        className={clsx(
          'font-medium',
          styles.label,
          config.color
        )}
      >
        {config.label}
      </span>
    </div>
  );

  if (animated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          variants={phaseTransition}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return content;
}

export default PhaseIndicator;
