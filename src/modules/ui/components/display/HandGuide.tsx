/**
 * HandGuide Component
 *
 * Displays poker hand types with examples and expected scores
 * Clicking a hand shows detailed description and example cards
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, type TranslationKey } from '../../i18n';
import { HAND_MULTIPLIERS } from '@/data/constants';
import { useGameStore } from '@/modules/core/store';
import type { HandType, Suit, Rank } from '@/types/interfaces';

interface ExampleCard {
  rank: Rank;
  suit: Suit;
}

interface HandInfo {
  type: HandType;
  translationKey: TranslationKey;
  descriptionKey: TranslationKey;
  exampleCards: ExampleCard[];
}

// All hand types with descriptions and example cards
const ALL_HANDS: HandInfo[] = [
  {
    type: 'high_card',
    translationKey: 'highCard',
    descriptionKey: 'highCardDesc',
    exampleCards: [
      { rank: 'A', suit: 'spades' },
      { rank: 'J', suit: 'hearts' },
      { rank: '8', suit: 'diamonds' },
      { rank: '5', suit: 'clubs' },
      { rank: '2', suit: 'hearts' },
    ],
  },
  {
    type: 'pair',
    translationKey: 'pair',
    descriptionKey: 'pairDesc',
    exampleCards: [
      { rank: 'K', suit: 'spades' },
      { rank: 'K', suit: 'hearts' },
      { rank: '9', suit: 'diamonds' },
      { rank: '5', suit: 'clubs' },
      { rank: '2', suit: 'hearts' },
    ],
  },
  {
    type: 'two_pair',
    translationKey: 'twoPair',
    descriptionKey: 'twoPairDesc',
    exampleCards: [
      { rank: 'Q', suit: 'spades' },
      { rank: 'Q', suit: 'hearts' },
      { rank: '8', suit: 'diamonds' },
      { rank: '8', suit: 'clubs' },
      { rank: '3', suit: 'hearts' },
    ],
  },
  {
    type: 'three_of_a_kind',
    translationKey: 'threeOfAKind',
    descriptionKey: 'threeOfAKindDesc',
    exampleCards: [
      { rank: 'J', suit: 'spades' },
      { rank: 'J', suit: 'hearts' },
      { rank: 'J', suit: 'diamonds' },
      { rank: '7', suit: 'clubs' },
      { rank: '2', suit: 'hearts' },
    ],
  },
  {
    type: 'straight',
    translationKey: 'straight',
    descriptionKey: 'straightDesc',
    exampleCards: [
      { rank: '5', suit: 'spades' },
      { rank: '6', suit: 'hearts' },
      { rank: '7', suit: 'diamonds' },
      { rank: '8', suit: 'clubs' },
      { rank: '9', suit: 'hearts' },
    ],
  },
  {
    type: 'flush',
    translationKey: 'flush',
    descriptionKey: 'flushDesc',
    exampleCards: [
      { rank: 'A', suit: 'hearts' },
      { rank: 'J', suit: 'hearts' },
      { rank: '8', suit: 'hearts' },
      { rank: '5', suit: 'hearts' },
      { rank: '2', suit: 'hearts' },
    ],
  },
  {
    type: 'full_house',
    translationKey: 'fullHouse',
    descriptionKey: 'fullHouseDesc',
    exampleCards: [
      { rank: '10', suit: 'spades' },
      { rank: '10', suit: 'hearts' },
      { rank: '10', suit: 'diamonds' },
      { rank: '6', suit: 'clubs' },
      { rank: '6', suit: 'hearts' },
    ],
  },
  {
    type: 'straight_flush',
    translationKey: 'straightFlush',
    descriptionKey: 'straightFlushDesc',
    exampleCards: [
      { rank: '5', suit: 'clubs' },
      { rank: '6', suit: 'clubs' },
      { rank: '7', suit: 'clubs' },
      { rank: '8', suit: 'clubs' },
      { rank: '9', suit: 'clubs' },
    ],
  },
  {
    type: 'four_of_a_kind',
    translationKey: 'fourOfAKind',
    descriptionKey: 'fourOfAKindDesc',
    exampleCards: [
      { rank: '9', suit: 'spades' },
      { rank: '9', suit: 'hearts' },
      { rank: '9', suit: 'diamonds' },
      { rank: '9', suit: 'clubs' },
      { rank: '3', suit: 'hearts' },
    ],
  },
  {
    type: 'quintuple',
    translationKey: 'quintuple',
    descriptionKey: 'quintupleDesc',
    exampleCards: [
      { rank: '7', suit: 'spades' },
      { rank: '7', suit: 'hearts' },
      { rank: '7', suit: 'diamonds' },
      { rank: '7', suit: 'clubs' },
      { rank: '7', suit: 'spades' },
    ],
  },
  {
    type: 'royal_flush',
    translationKey: 'royalFlush',
    descriptionKey: 'royalFlushDesc',
    exampleCards: [
      { rank: '10', suit: 'spades' },
      { rank: 'J', suit: 'spades' },
      { rank: 'Q', suit: 'spades' },
      { rank: 'K', suit: 'spades' },
      { rank: 'A', suit: 'spades' },
    ],
  },
  {
    type: 'royal_quintuple',
    translationKey: 'royalQuintuple',
    descriptionKey: 'royalQuintupleDesc',
    exampleCards: [
      { rank: 'K', suit: 'hearts' },
      { rank: 'K', suit: 'hearts' },
      { rank: 'K', suit: 'hearts' },
      { rank: 'K', suit: 'hearts' },
      { rank: 'K', suit: 'hearts' },
    ],
  },
  {
    type: 'pentagon',
    translationKey: 'pentagon',
    descriptionKey: 'pentagonDesc',
    exampleCards: [
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'spades' },
    ],
  },
];

// Sort by multiplier ascending
const SORTED_HANDS = [...ALL_HANDS].sort(
  (a, b) => HAND_MULTIPLIERS[a.type] - HAND_MULTIPLIERS[b.type]
);

// Mini card component for examples
function MiniCard({ card }: { card: ExampleCard }) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitSymbol = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }[card.suit];

  return (
    <div
      className={`
        w-10 h-14 bg-white rounded-md shadow-md flex flex-col items-center justify-center
        border border-gray-300
        ${isRed ? 'text-red-500' : 'text-gray-900'}
      `}
    >
      <span className="text-sm font-bold leading-none">{card.rank}</span>
      <span className="text-lg leading-none">{suitSymbol}</span>
    </div>
  );
}

// Detail overlay component
function HandDetailOverlay({
  hand,
  bonus,
  onClose,
}: {
  hand: HandInfo;
  bonus: number;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const baseMultiplier = HAND_MULTIPLIERS[hand.type];
  const totalMultiplier = baseMultiplier + bonus;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            {t(hand.translationKey)}
          </h3>
          <div className="text-right">
            <span className={`text-2xl font-bold ${bonus > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
              x{totalMultiplier}
            </span>
            {bonus > 0 && (
              <div className="text-xs text-green-400">
                (x{baseMultiplier} +{bonus})
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          {t(hand.descriptionKey)}
        </p>

        {/* Example Cards */}
        <div className="mb-6">
          <p className="text-gray-400 text-xs mb-3 text-center">
            {t('exampleHand')}
          </p>
          <div className="flex justify-center gap-2">
            {hand.exampleCards.map((card, idx) => (
              <MiniCard key={idx} card={card} />
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          {t('close')}
        </button>
      </motion.div>
    </motion.div>
  );
}

export interface HandGuideProps {
  className?: string;
  compact?: boolean;
}

export function HandGuide({ className = '', compact = false }: HandGuideProps): React.ReactElement {
  const { t } = useI18n();
  const [selectedHand, setSelectedHand] = useState<HandInfo | null>(null);
  const handMultiplierBonuses = useGameStore((state) => state.handMultiplierBonuses);

  // Calculate total multipliers with bonuses
  const getMultiplier = (handType: HandType) => {
    const base = HAND_MULTIPLIERS[handType];
    const bonus = handMultiplierBonuses[handType] ?? 0;
    return { base, bonus, total: base + bonus };
  };

  return (
    <>
      <div className={`bg-gray-900/80 rounded-lg p-3 ${className}`}>
        <h3 className="text-sm font-bold text-white mb-2 text-center border-b border-gray-700 pb-1">
          {t('handGuide')}
        </h3>
        <div className="space-y-0.5">
          {SORTED_HANDS.map((hand) => {
            const { bonus, total } = getMultiplier(hand.type);
            const hasBonus = bonus > 0;

            return (
              <button
                key={hand.type}
                onClick={() => setSelectedHand(hand)}
                className={`
                  w-full flex items-center justify-between text-xs
                  ${compact ? 'py-0.5' : 'py-1'} px-1 rounded
                  hover:bg-gray-700/50 transition-colors cursor-pointer
                  text-left
                  ${hasBonus ? 'bg-green-900/20' : ''}
                `}
              >
                <span className="text-white font-medium truncate flex-1">
                  {t(hand.translationKey)}
                </span>
                <span className={`font-mono ml-2 shrink-0 ${hasBonus ? 'text-green-400' : 'text-yellow-400'}`}>
                  x{total}{hasBonus && <span className="text-xs"> (+{bonus})</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedHand && (
          <HandDetailOverlay
            hand={selectedHand}
            bonus={getMultiplier(selectedHand.type).bonus}
            onClose={() => setSelectedHand(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default HandGuide;
