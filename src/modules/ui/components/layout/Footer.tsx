/**
 * Footer Component
 *
 * Displays action buttons based on current game phase.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import type { GamePhase } from '@/types/interfaces';
import { Button } from '../common/Button';
import { slideUp } from '../../animations/variants';

export interface FooterProps {
  phase: GamePhase;
  selectedCardsCount: number;
  maxSelectCards: number;
  handsRemaining: number;
  discardsRemaining: number;
  className?: string;
  onPlay?: () => void;
  onDiscard?: () => void;
  onSpinRoulette?: () => void;
  onSkipRoulette?: () => void;
  onContinue?: () => void;
}

export function Footer({
  phase,
  selectedCardsCount,
  maxSelectCards,
  handsRemaining,
  discardsRemaining,
  className,
  onPlay,
  onDiscard,
  onSpinRoulette,
  onSkipRoulette,
  onContinue,
}: FooterProps) {
  const renderActions = () => {
    switch (phase) {
      case 'IDLE':
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
          >
            Start Game
          </Button>
        );

      case 'SLOT_PHASE':
        return null; // SlotMachine has its own SPIN button

      case 'DRAW_PHASE':
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
          >
            Draw Cards
          </Button>
        );

      case 'PLAY_PHASE':
        return (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Card Selection Info */}
            <div className="text-slate-400 text-sm">
              Selected: {selectedCardsCount}/{maxSelectCards}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="lg"
                onClick={onDiscard}
                disabled={selectedCardsCount === 0 || discardsRemaining === 0}
              >
                Discard ({discardsRemaining})
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={onPlay}
                disabled={selectedCardsCount === 0 || handsRemaining === 0}
              >
                Play Hand ({handsRemaining})
              </Button>
            </div>
          </div>
        );

      case 'SCORE_PHASE':
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
          >
            Continue
          </Button>
        );

      case 'ROULETTE_PHASE':
        return (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={onSkipRoulette}
            >
              Keep Score
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onSpinRoulette}
            >
              Spin Roulette
            </Button>
          </div>
        );

      case 'REWARD_PHASE':
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
          >
            Continue
          </Button>
        );

      case 'SHOP_PHASE':
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
          >
            Leave Shop
          </Button>
        );

      case 'GAME_OVER':
        return (
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
          >
            Play Again
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <footer
      className={clsx(
        'w-full bg-game-surface border-t border-game-border',
        'px-3 py-3 sm:px-4 sm:py-4 md:px-6',
        // Safe area for mobile home indicators
        'pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-[calc(1rem+env(safe-area-inset-bottom))]',
        className
      )}
    >
      <div className="flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            variants={slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center w-full max-w-2xl"
          >
            {renderActions()}
          </motion.div>
        </AnimatePresence>
      </div>
    </footer>
  );
}

export default Footer;
