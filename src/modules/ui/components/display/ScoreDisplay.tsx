/**
 * ScoreDisplay Component
 *
 * Displays current score with target and progress bar.
 */

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { clsx } from 'clsx';

export interface ScoreDisplayProps {
  currentScore: number;
  targetScore: number;
  showProgress?: boolean;
  showTarget?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    score: 'text-xl',
    target: 'text-sm',
    progress: 'h-1',
  },
  md: {
    score: 'text-3xl',
    target: 'text-base',
    progress: 'h-2',
  },
  lg: {
    score: 'text-5xl',
    target: 'text-lg',
    progress: 'h-3',
  },
};

export function ScoreDisplay({
  currentScore,
  targetScore,
  showProgress = true,
  showTarget = true,
  size = 'md',
  animated = true,
  className,
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(currentScore);
  const progress = Math.min(100, (currentScore / targetScore) * 100);
  const isComplete = currentScore >= targetScore;

  // Animated number spring
  const springValue = useSpring(currentScore, {
    stiffness: 100,
    damping: 20,
  });

  useEffect(() => {
    springValue.set(currentScore);
  }, [currentScore, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (value) => {
      setDisplayScore(Math.round(value));
    });
    return unsubscribe;
  }, [springValue]);

  const styles = sizeStyles[size];

  return (
    <div className={clsx('text-center', className)}>
      {/* Score Number */}
      <motion.div
        key={animated ? undefined : currentScore}
        initial={animated ? undefined : { scale: 1.2 }}
        animate={animated ? undefined : { scale: 1 }}
        className={clsx(
          'font-bold tabular-nums',
          styles.score,
          isComplete ? 'text-green-400' : 'text-white'
        )}
      >
        {animated ? displayScore.toLocaleString() : currentScore.toLocaleString()}
      </motion.div>

      {/* Target Score */}
      {showTarget && (
        <div className={clsx('text-slate-400 mt-1', styles.target)}>
          / {targetScore.toLocaleString()}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div
          className={clsx(
            'w-full bg-game-card rounded-full overflow-hidden mt-3',
            styles.progress
          )}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
            }}
            className={clsx(
              'h-full rounded-full',
              isComplete
                ? 'bg-green-500'
                : progress > 75
                ? 'bg-amber-500'
                : 'bg-primary'
            )}
          />
        </div>
      )}
    </div>
  );
}

export default ScoreDisplay;
