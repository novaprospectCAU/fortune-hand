/**
 * SlotGuide Component
 *
 * Displays slot symbols with their effects and probabilities
 * Shows active joker modifiers affecting slot outcomes
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, type TranslationKey } from '../../i18n';
import { useGameStore } from '@/modules/core/store';
import type { Joker, SlotSymbol } from '@/types/interfaces';

interface SymbolInfo {
  id: SlotSymbol;
  emoji: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  baseWeight: number;
  singleEffect: string;
  tripleEffect: string;
  isNegative?: boolean;
}

// Symbol definitions with effects (doubled from original)
const SYMBOLS: SymbolInfo[] = [
  {
    id: 'card',
    emoji: '🃏',
    nameKey: 'slotSymbol_card',
    descriptionKey: 'slotSymbol_card_desc',
    baseWeight: 25,
    singleEffect: '+1 Draw',
    tripleEffect: '+2 Draw',
  },
  {
    id: 'target',
    emoji: '🎯',
    nameKey: 'slotSymbol_target',
    descriptionKey: 'slotSymbol_target_desc',
    baseWeight: 20,
    singleEffect: '+10% Safe',
    tripleEffect: '+40% Safe, +2x Max',
  },
  {
    id: 'gold',
    emoji: '💰',
    nameKey: 'slotSymbol_gold',
    descriptionKey: 'slotSymbol_gold_desc',
    baseWeight: 20,
    singleEffect: '+10 Gold',
    tripleEffect: '+50 Gold',
  },
  {
    id: 'chip',
    emoji: '🎰',
    nameKey: 'slotSymbol_chip',
    descriptionKey: 'slotSymbol_chip_desc',
    baseWeight: 15,
    singleEffect: '+20 Chips',
    tripleEffect: '+100 Chips',
  },
  {
    id: 'star',
    emoji: '⭐',
    nameKey: 'slotSymbol_star',
    descriptionKey: 'slotSymbol_star_desc',
    baseWeight: 5,
    singleEffect: '+20 Gold, +40 Chips',
    tripleEffect: 'JACKPOT!',
  },
  {
    id: 'wild',
    emoji: '🌟',
    nameKey: 'slotSymbol_wild',
    descriptionKey: 'slotSymbol_wild_desc',
    baseWeight: 5,
    singleEffect: '-',
    tripleEffect: 'Any Triple',
  },
  {
    id: 'skull',
    emoji: '💀',
    nameKey: 'slotSymbol_skull',
    descriptionKey: 'slotSymbol_skull_desc',
    baseWeight: 10,
    singleEffect: '-1 Card',
    tripleEffect: '-2 Cards, Skip Roulette',
    isNegative: true,
  },
];

// Jokers that affect slot symbols
interface SlotJokerInfo {
  jokerId: string;
  nameKey: TranslationKey;
  targetSymbol: SlotSymbol | 'all';
  effect: string;
}

const SLOT_JOKERS: SlotJokerInfo[] = [
  { jokerId: 'jackpot_hunter', nameKey: 'joker_jackpot_hunter', targetSymbol: 'star', effect: '3x' },
  { jokerId: 'skull_crusher', nameKey: 'joker_skull_crusher', targetSymbol: 'skull', effect: '0x' },
  { jokerId: 'gold_digger', nameKey: 'joker_gold_digger', targetSymbol: 'gold', effect: '2x' },
  { jokerId: 'card_collector', nameKey: 'joker_card_collector', targetSymbol: 'card', effect: '2x' },
  { jokerId: 'chip_magnet', nameKey: 'joker_chip_magnet', targetSymbol: 'chip', effect: '2x' },
  { jokerId: 'wild_master', nameKey: 'joker_wild_master', targetSymbol: 'wild', effect: '3x' },
  { jokerId: 'target_seeker', nameKey: 'joker_target_seeker', targetSymbol: 'target', effect: '2x' },
  { jokerId: 'slot_lord', nameKey: 'joker_slot_lord', targetSymbol: 'all', effect: 'Boost' },
];

// Modified weights from jokers
const JOKER_WEIGHT_MODS: Record<string, Partial<Record<SlotSymbol, number>>> = {
  jackpot_hunter: { star: 15 },
  skull_crusher: { skull: 0 },
  gold_digger: { gold: 40 },
  card_collector: { card: 50 },
  chip_magnet: { chip: 30 },
  wild_master: { wild: 15 },
  target_seeker: { target: 40 },
  slot_lord: { star: 8, gold: 30, card: 38, chip: 23, wild: 8 },
};

// Calculate probability from weights
function calculateProbabilities(
  symbols: SymbolInfo[],
  modifiedWeights: Record<SlotSymbol, number>
): Record<SlotSymbol, number> {
  const totalWeight = symbols.reduce((sum, s) => sum + modifiedWeights[s.id], 0);
  const probabilities: Record<SlotSymbol, number> = {} as Record<SlotSymbol, number>;

  for (const symbol of symbols) {
    probabilities[symbol.id] = Math.round((modifiedWeights[symbol.id] / totalWeight) * 100);
  }

  return probabilities;
}

// Symbol detail overlay
function SymbolDetailOverlay({
  symbol,
  probability,
  activeJokers,
  onClose,
}: {
  symbol: SymbolInfo;
  probability: number;
  activeJokers: SlotJokerInfo[];
  onClose: () => void;
}) {
  const { t } = useI18n();

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
        className="bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{symbol.emoji}</span>
            <h3 className="text-xl font-bold text-white">
              {t(symbol.nameKey)}
            </h3>
          </div>
          <span className={`text-lg font-bold ${symbol.isNegative ? 'text-red-400' : 'text-green-400'}`}>
            {probability}%
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-4 text-sm">
          {t(symbol.descriptionKey)}
        </p>

        {/* Effects */}
        <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{t('singleSymbol')}:</span>
            <span className={symbol.isNegative ? 'text-red-400' : 'text-green-400'}>
              {symbol.singleEffect}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('tripleSymbol')}:</span>
            <span className={symbol.isNegative ? 'text-red-400' : 'text-yellow-400 font-bold'}>
              {symbol.tripleEffect}
            </span>
          </div>
        </div>

        {/* Active Joker Buffs */}
        {activeJokers.length > 0 && (
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4">
            <p className="text-purple-300 text-xs mb-2">{t('activeJokerBuffs')}:</p>
            {activeJokers.map((joker) => (
              <div key={joker.jokerId} className="flex items-center gap-2 text-sm">
                <span className="text-purple-400">{t(joker.nameKey)}</span>
                <span className="text-purple-200">({joker.effect})</span>
              </div>
            ))}
          </div>
        )}

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

export interface SlotGuideProps {
  className?: string;
  compact?: boolean;
}

export function SlotGuide({ className = '', compact = false }: SlotGuideProps): React.ReactElement {
  const { t } = useI18n();
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolInfo | null>(null);
  const jokers = useGameStore((state) => state.jokers);

  // Find active slot-affecting jokers
  const activeSlotJokers = useMemo(() => {
    const activeJokerIds = jokers.map((j: Joker) => j.id);
    return SLOT_JOKERS.filter((sj) => activeJokerIds.includes(sj.jokerId));
  }, [jokers]);

  // Calculate modified weights based on active jokers
  const modifiedWeights = useMemo(() => {
    const weights: Record<SlotSymbol, number> = {} as Record<SlotSymbol, number>;

    // Start with base weights
    for (const symbol of SYMBOLS) {
      weights[symbol.id] = symbol.baseWeight;
    }

    // Apply joker modifications
    for (const joker of activeSlotJokers) {
      const mods = JOKER_WEIGHT_MODS[joker.jokerId];
      if (mods) {
        for (const [symbolId, weight] of Object.entries(mods)) {
          weights[symbolId as SlotSymbol] = weight;
        }
      }
    }

    return weights;
  }, [activeSlotJokers]);

  // Calculate probabilities
  const probabilities = useMemo(
    () => calculateProbabilities(SYMBOLS, modifiedWeights),
    [modifiedWeights]
  );

  // Get jokers affecting a specific symbol
  const getJokersForSymbol = (symbolId: SlotSymbol): SlotJokerInfo[] => {
    return activeSlotJokers.filter(
      (j) => j.targetSymbol === symbolId || j.targetSymbol === 'all'
    );
  };

  return (
    <>
      <div className={`bg-gray-900/80 rounded-lg p-3 ${className}`}>
        <h3 className="text-sm font-bold text-white mb-2 text-center border-b border-gray-700 pb-1">
          {t('slotGuide')}
        </h3>

        {/* Active joker buffs indicator */}
        {activeSlotJokers.length > 0 && (
          <div className="bg-purple-900/30 border border-purple-500/30 rounded px-2 py-1 mb-2">
            <p className="text-purple-300 text-xs text-center">
              {activeSlotJokers.length} {t('jokerBuffsActive')}
            </p>
          </div>
        )}

        <div className="space-y-0.5">
          {SYMBOLS.map((symbol) => {
            const hasJokerBuff = getJokersForSymbol(symbol.id).length > 0;
            const prob = probabilities[symbol.id];

            return (
              <button
                key={symbol.id}
                onClick={() => setSelectedSymbol(symbol)}
                className={`
                  w-full flex items-center text-xs
                  ${compact ? 'py-0.5' : 'py-1'} px-1 rounded
                  hover:bg-gray-700/50 transition-colors cursor-pointer
                  ${hasJokerBuff ? 'bg-purple-900/20' : ''}
                `}
              >
                <span className="w-6 text-center">{symbol.emoji}</span>
                <span className="text-white font-medium truncate flex-1 text-left ml-1">
                  {t(symbol.nameKey)}
                </span>
                <span className={`font-mono ml-1 shrink-0 w-10 text-right ${
                  symbol.isNegative ? 'text-red-400' : 'text-gray-400'
                } ${hasJokerBuff ? 'text-purple-300' : ''}`}>
                  {prob}%
                </span>
                <span className={`ml-2 text-xs shrink-0 ${
                  symbol.isNegative ? 'text-red-400' : 'text-green-400'
                }`}>
                  {symbol.singleEffect}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedSymbol && (
          <SymbolDetailOverlay
            symbol={selectedSymbol}
            probability={probabilities[selectedSymbol.id]}
            activeJokers={getJokersForSymbol(selectedSymbol.id)}
            onClose={() => setSelectedSymbol(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default SlotGuide;
