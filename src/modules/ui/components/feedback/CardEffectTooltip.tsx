/**
 * CardEffectTooltip Component
 *
 * Displays card effect description centered on screen when hovering over a card.
 * Only shows if the card has special effects (wild, gold, slot trigger, roulette trigger, or enhancement).
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/types/interfaces';
import { zIndex } from '../../styles/theme';

export interface CardEffectTooltipProps {
  card: Card | null;
}

/**
 * Get effect description for a card
 */
function getCardEffectDescription(card: Card): string | null {
  const effects: string[] = [];

  if (card.isGlass) {
    effects.push('Glass: x2 Mult when scored, 1/4 chance to break');
  }
  if (card.isWild) {
    effects.push('Wild: Can be any rank or suit');
  }
  if (card.isGold) {
    effects.push('Gold: Gives +10 gold instead of chips when scored');
  }
  if (card.triggerSlot) {
    effects.push('Slot: Triggers a mini slot spin when played');
  }
  if (card.triggerRoulette) {
    effects.push('Roulette: Grants an extra roulette spin');
  }

  if (card.enhancement) {
    const enhancementDescriptions: Record<string, string> = {
      mult: `+${card.enhancement.value} Mult when scored`,
      chips: `+${card.enhancement.value} Chips when scored`,
      gold: `+${card.enhancement.value} Gold when scored`,
      retrigger: `Retrigger ${card.enhancement.value} time(s)`,
    };
    effects.push(enhancementDescriptions[card.enhancement.type] || '');
  }

  return effects.length > 0 ? effects.join('\n') : null;
}

export function CardEffectTooltip({ card }: CardEffectTooltipProps) {
  const effectDescription = card ? getCardEffectDescription(card) : null;

  return (
    <AnimatePresence>
      {card && effectDescription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: zIndex.tooltip }}
        >
          <div className="bg-game-card/95 backdrop-blur-sm border border-game-border rounded-lg px-6 py-4 shadow-xl">
            <div className="text-sm text-slate-300 mb-2 text-center font-medium">
              {card.rank} of {card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}
            </div>
            <div className="text-white text-center whitespace-pre-line">
              {effectDescription}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CardEffectTooltip;
