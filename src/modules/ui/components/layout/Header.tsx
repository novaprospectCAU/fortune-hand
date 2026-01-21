/**
 * Header Component
 *
 * Displays game header with round info, scores, and phase indicator.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { GamePhase } from '@/types/interfaces';
import { useI18n, LanguageSelector } from '../../i18n';
import type { TranslationKey } from '../../i18n';

export interface HeaderProps {
  round: number;
  targetScore: number;
  currentScore: number;
  phase: GamePhase;
  className?: string;
}

const phaseTranslationKeys: Record<GamePhase, TranslationKey> = {
  IDLE: 'continue',
  SLOT_PHASE: 'slotPhase',
  DRAW_PHASE: 'drawPhase',
  PLAY_PHASE: 'playPhase',
  SCORE_PHASE: 'scorePhase',
  ROULETTE_PHASE: 'roulettePhase',
  REWARD_PHASE: 'rewardPhase',
  SHOP_PHASE: 'shopPhase',
  GAME_OVER: 'gameOver',
};

export function Header({
  round,
  targetScore,
  currentScore,
  phase,
  className,
}: HeaderProps) {
  const { t } = useI18n();
  const progress = Math.min(100, (currentScore / targetScore) * 100);
  const isWinning = currentScore >= targetScore;

  return (
    <header
      className={clsx(
        'w-full bg-game-surface border-b border-game-border',
        'px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4',
        // Safe area for notches
        'pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-[max(0.75rem,env(safe-area-inset-top))]',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        {/* Top Row on Mobile: Round and Phase */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
          {/* Round Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-slate-400 text-xs sm:text-sm">Round</span>
            <motion.span
              key={round}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white font-bold text-lg sm:text-xl"
            >
              {round}
            </motion.span>
          </div>

          {/* Phase Indicator - Always visible on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-game-card">
            <div
              className={clsx(
                'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full',
                phase === 'GAME_OVER'
                  ? 'bg-red-500'
                  : phase === 'IDLE'
                  ? 'bg-slate-400'
                  : 'bg-green-500 animate-pulse'
              )}
            />
            <span className="text-slate-300 text-xs sm:text-sm font-medium">
              {t(phaseTranslationKeys[phase])}
            </span>
          </div>

          {/* Language Selector */}
          <LanguageSelector className="ml-auto sm:ml-0" />
        </div>

        {/* Score Progress */}
        <div className="flex-1 sm:max-w-md">
          {/* Score Display */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-xs sm:text-sm">Score</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <motion.span
                key={currentScore}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={clsx(
                  'font-bold text-base sm:text-lg',
                  isWinning ? 'text-green-400' : 'text-white'
                )}
              >
                {currentScore.toLocaleString()}
              </motion.span>
              <span className="text-slate-500 text-sm">/</span>
              <span className="text-slate-400 text-sm sm:text-base">
                {targetScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 sm:h-2 bg-game-card rounded-full overflow-hidden">
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
      </div>
    </header>
  );
}

export default Header;
