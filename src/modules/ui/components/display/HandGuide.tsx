/**
 * HandGuide Component
 *
 * Displays poker hand types with examples and expected scores
 */

import React from 'react';
import { useI18n, type TranslationKey } from '../../i18n';
import { HAND_MULTIPLIERS } from '@/data/constants';
import type { HandType } from '@/types/interfaces';

interface HandExample {
  type: HandType;
  translationKey: TranslationKey;
  example: string;
  exampleScore: number;
}

// Hand examples with typical card values
const HAND_EXAMPLES: HandExample[] = [
  { type: 'high_card', translationKey: 'highCard', example: 'A', exampleScore: 11 },
  { type: 'pair', translationKey: 'pair', example: 'K K', exampleScore: 40 },
  { type: 'two_pair', translationKey: 'twoPair', example: 'Q Q 8 8', exampleScore: 152 },
  { type: 'three_of_a_kind', translationKey: 'threeOfAKind', example: 'J J J', exampleScore: 180 },
  { type: 'straight', translationKey: 'straight', example: '5-6-7-8-9', exampleScore: 280 },
  { type: 'flush', translationKey: 'flush', example: '5 suits', exampleScore: 350 },
  { type: 'full_house', translationKey: 'fullHouse', example: '10 10 10 6 6', exampleScore: 546 },
  { type: 'four_of_a_kind', translationKey: 'fourOfAKind', example: '9 9 9 9', exampleScore: 720 },
  { type: 'straight_flush', translationKey: 'straightFlush', example: '2-3-4-5-6', exampleScore: 320 },
  { type: 'royal_flush', translationKey: 'royalFlush', example: '10-J-Q-K-A', exampleScore: 1530 },
];

export interface HandGuideProps {
  className?: string;
  compact?: boolean;
}

export function HandGuide({ className = '', compact = false }: HandGuideProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div className={`bg-gray-900/80 rounded-lg p-3 ${className}`}>
      <h3 className="text-sm font-bold text-white mb-2 text-center border-b border-gray-700 pb-1">
        {t('handGuide')}
      </h3>
      <div className="space-y-1">
        {HAND_EXAMPLES.map((hand) => (
          <div
            key={hand.type}
            className={`flex items-center justify-between text-xs ${compact ? 'py-0.5' : 'py-1'}`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-white font-medium truncate">
                {t(hand.translationKey)}
              </span>
              {!compact && (
                <span className="text-gray-500 text-[10px] truncate hidden sm:inline">
                  {hand.example}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <span className="text-yellow-400 font-mono">
                x{HAND_MULTIPLIERS[hand.type]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HandGuide;
