/**
 * Header Component
 *
 * Displays game header with round info, scores, and phase indicator.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { GamePhase } from '@/types/interfaces';

export interface HeaderProps {
  round: number;
  targetScore: number;
  currentScore: number;
  phase: GamePhase;
  className?: string;
}

const phaseLabels: Record<GamePhase, string> = {
  IDLE: 'Ready',
  SLOT_PHASE: 'Slot Spin',
  DRAW_PHASE: 'Draw Cards',
  PLAY_PHASE: 'Play Hand',
  SCORE_PHASE: 'Scoring',
  ROULETTE_PHASE: 'Roulette',
  REWARD_PHASE: 'Rewards',
  SHOP_PHASE: 'Shop',
  GAME_OVER: 'Game Over',
};

export function Header({
  round,
  targetScore,
  currentScore,
  phase,
  className,
}: HeaderProps) {
  const progress = Math.min(100, (currentScore / targetScore) * 100);
  const isWinning = currentScore >= targetScore;

  return (
    <header
      className={clsx(
        'w-full bg-game-surface border-b border-game-border',
        'px-4 py-3 md:px-6 md:py-4',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Round and Phase */}
        <div className="flex items-center gap-4">
          {/* Round Badge */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Round</span>
            <motion.span
              key={round}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white font-bold text-xl"
            >
              {round}
            </motion.span>
          </div>

          {/* Phase Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-game-card">
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                phase === 'GAME_OVER'
                  ? 'bg-red-500'
                  : phase === 'IDLE'
                  ? 'bg-slate-400'
                  : 'bg-green-500 animate-pulse'
              )}
            />
            <span className="text-slate-300 text-sm font-medium">
              {phaseLabels[phase]}
            </span>
          </div>
        </div>

        {/* Center: Score Progress */}
        <div className="flex-1 max-w-md">
          {/* Score Display */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-sm">Score</span>
            <div className="flex items-center gap-2">
              <motion.span
                key={currentScore}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={clsx(
                  'font-bold text-lg',
                  isWinning ? 'text-green-400' : 'text-white'
                )}
              >
                {currentScore.toLocaleString()}
              </motion.span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">
                {targetScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-game-card rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
              className={clsx(
                'h-full rounded-full transition-colors duration-300',
                isWinning
                  ? 'bg-green-500'
                  : progress > 75
                  ? 'bg-amber-500'
                  : 'bg-primary'
              )}
            />
          </div>
        </div>

        {/* Right: Mobile Phase (shown on mobile only) */}
        <div className="md:hidden flex items-center gap-2 px-3 py-1 rounded-full bg-game-card w-fit">
          <div
            className={clsx(
              'w-2 h-2 rounded-full',
              phase === 'GAME_OVER'
                ? 'bg-red-500'
                : phase === 'IDLE'
                ? 'bg-slate-400'
                : 'bg-green-500 animate-pulse'
            )}
          />
          <span className="text-slate-300 text-sm font-medium">
            {phaseLabels[phase]}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
