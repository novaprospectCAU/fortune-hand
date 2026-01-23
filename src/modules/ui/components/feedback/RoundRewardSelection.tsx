/**
 * RoundRewardSelection Component
 *
 * Displays reward options after clearing a round
 * Includes treasure chest opening animation
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../../i18n';
import { useGameStore } from '@/modules/core/store';
import type { TreasureChestRewardType } from '@/types/interfaces';

// Reward type display info
const REWARD_TYPE_INFO: Record<TreasureChestRewardType, { emoji: string; nameKey: string }> = {
  hand_upgrades: { emoji: '🃏', nameKey: 'chestReward_handUpgrades' },
  high_rarity_item: { emoji: '💰', nameKey: 'chestReward_highRarity' },
  remove_cards: { emoji: '🗑️', nameKey: 'chestReward_removeCards' },
  roulette_safe: { emoji: '🎯', nameKey: 'chestReward_rouletteSafe' },
  roulette_risky: { emoji: '🎰', nameKey: 'chestReward_rouletteRisky' },
  slot_buffs: { emoji: '⭐', nameKey: 'chestReward_slotBuffs' },
  jackpot: { emoji: '🌟', nameKey: 'chestReward_jackpot' },
  reroll: { emoji: '🔄', nameKey: 'chestReward_reroll' },
};

// Treasure Chest Component
function TreasureChest() {
  const { t } = useI18n();
  const roundRewardState = useGameStore((state) => state.roundRewardState);
  const openTreasureChest = useGameStore((state) => state.openTreasureChest);
  const applyChestReward = useGameStore((state) => state.applyChestReward);
  const proceedToReroll = useGameStore((state) => state.proceedToReroll);
  const completeRoundReward = useGameStore((state) => state.completeRoundReward);
  const removeCardsFromDeck = useGameStore((state) => state.removeCardsFromDeck);
  const deck = useGameStore((state) => state.deck);

  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const chestPhase = roundRewardState?.chestPhase ?? 'closed';
  const rewards = roundRewardState?.chestRewards ?? [];
  const currentReward = rewards[rewards.length - 1];
  const pendingReroll = roundRewardState?.pendingReroll ?? false;
  const pendingCardRemoval = roundRewardState?.pendingCardRemoval ?? false;

  // All cards available for removal (deck + discardPile)
  const allDeckCards = useMemo(() => {
    return [...deck.cards, ...deck.discardPile];
  }, [deck]);


  const handleOpenChest = () => {
    if (chestPhase === 'closed' && !isAnimating) {
      setIsAnimating(true);
      openTreasureChest();

      // 애니메이션 후 revealed 상태로
      setTimeout(() => {
        useGameStore.setState((state) => ({
          roundRewardState: state.roundRewardState ? {
            ...state.roundRewardState,
            chestPhase: 'revealed',
          } : null,
        }));
        setIsAnimating(false);
      }, 1500);
    }
  };

  const handleApplyReward = () => {
    applyChestReward();
  };

  const handleProceedToReroll = () => {
    proceedToReroll();
  };

  const handleComplete = () => {
    completeRoundReward();
  };

  const isJackpot = currentReward?.type === 'jackpot';

  return (
    <div className="flex flex-col items-center">
      {/* Chest Animation */}
      <motion.div
        className="relative mb-6"
        animate={isAnimating ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {chestPhase === 'closed' && (
          <motion.button
            onClick={handleOpenChest}
            className="text-8xl cursor-pointer hover:scale-110 transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isAnimating}
          >
            📦
          </motion.button>
        )}

        {(chestPhase === 'opening' || isAnimating) && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-8xl"
          >
            📦✨
          </motion.div>
        )}

        {chestPhase === 'revealed' && currentReward && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`text-center ${isJackpot ? 'animate-pulse' : ''}`}
          >
            <div className={`text-8xl mb-2 ${isJackpot ? 'animate-bounce' : ''}`}>
              {REWARD_TYPE_INFO[currentReward.type]?.emoji ?? '❓'}
            </div>
            <div className={`text-xl font-bold ${isJackpot ? 'text-yellow-400' : 'text-white'}`}>
              {t(REWARD_TYPE_INFO[currentReward.type]?.nameKey as any)}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Jackpot Effect */}
      {isJackpot && chestPhase === 'revealed' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              transition={{ duration: 2, delay: i * 0.1 }}
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Reward History */}
      {rewards.length > 1 && (
        <div className="mb-4 text-sm text-gray-400">
          <p>{t('previousRewards')}:</p>
          <div className="flex gap-2 flex-wrap justify-center mt-1">
            {rewards.slice(0, -1).map((r, i) => (
              <span key={i} className="bg-gray-700 px-2 py-1 rounded">
                {REWARD_TYPE_INFO[r.type]?.emoji}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      {currentReward?.details && chestPhase === 'revealed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 p-3 bg-gray-700/50 rounded-lg max-w-sm"
        >
          <p className="text-gray-300 text-sm whitespace-pre-line">
            {currentReward.details}
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      {chestPhase === 'closed' && (
        <p className="text-gray-400 mb-4">{t('clickToOpenChest')}</p>
      )}

      {chestPhase === 'revealed' && currentReward && !currentReward.applied && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleApplyReward}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
        >
          {t('applyReward')}
        </motion.button>
      )}

      {/* Card removal UI */}
      {chestPhase === 'revealed' && currentReward?.applied && pendingCardRemoval && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 w-full max-w-lg"
        >
          <p className="text-yellow-400 font-bold">{t('selectCardsToRemove')}</p>
          <p className="text-gray-400 text-sm">{selectedCardIds.length}/3 {t('selected')}</p>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 max-h-48 overflow-y-auto w-full p-2 bg-gray-700/50 rounded-lg">
            {allDeckCards.map((card) => {
              const isCardSelected = selectedCardIds.includes(card.id);
              const suitColor = card.suit === 'hearts' || card.suit === 'diamonds' ? '#ef4444' : '#1f2937';
              const suitSymbol = card.suit === 'hearts' ? '\u2665' : card.suit === 'diamonds' ? '\u2666' : card.suit === 'clubs' ? '\u2663' : '\u2660';
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    if (isCardSelected) {
                      setSelectedCardIds(prev => prev.filter(id => id !== card.id));
                    } else if (selectedCardIds.length < 3) {
                      setSelectedCardIds(prev => [...prev, card.id]);
                    }
                  }}
                  className={`
                    p-1 rounded text-xs font-bold text-center transition-all
                    ${isCardSelected
                      ? 'bg-red-500/30 border-2 border-red-400 scale-95'
                      : 'bg-white border border-gray-300 hover:border-yellow-400'
                    }
                    ${!isCardSelected && selectedCardIds.length >= 3 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  disabled={!isCardSelected && selectedCardIds.length >= 3}
                >
                  <div style={{ color: suitColor }}>{card.rank}</div>
                  <div style={{ color: suitColor }}>{suitSymbol}</div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (selectedCardIds.length > 0) {
                  removeCardsFromDeck(selectedCardIds);
                  setSelectedCardIds([]);
                }
              }}
              disabled={selectedCardIds.length === 0}
              className={`px-6 py-2 font-bold rounded-lg transition-colors ${
                selectedCardIds.length > 0
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('removeSelected')}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Skip card removal
                removeCardsFromDeck([]);
              }}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
            >
              {t('skip')}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Normal reward - show continue button */}
      {chestPhase === 'revealed' && currentReward?.applied && !pendingReroll && !pendingCardRemoval && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleComplete}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
          {t('continue')}
        </motion.button>
      )}

      {/* Reroll reward - show "Open Again" button */}
      {chestPhase === 'revealed' && currentReward?.applied && pendingReroll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <p className="text-yellow-400 font-bold">🔄 {t('rerollGranted')}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProceedToReroll}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors"
          >
            {t('openAgain')}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export interface RoundRewardSelectionProps {
  onComplete?: () => void;
}

export function RoundRewardSelection({ onComplete }: RoundRewardSelectionProps): React.ReactElement | null {
  const { t } = useI18n();
  const roundRewardState = useGameStore((state) => state.roundRewardState);
  const selectRoundReward = useGameStore((state) => state.selectRoundReward);
  const completeRoundReward = useGameStore((state) => state.completeRoundReward);
  const round = useGameStore((state) => state.round);
  const [previewReward, setPreviewReward] = useState<'quota' | 'chest' | 'gold' | null>(null);

  if (!roundRewardState?.isOpen) return null;

  const handlePreviewReward = (reward: 'quota' | 'chest' | 'gold') => {
    setPreviewReward(prev => prev === reward ? null : reward);
  };

  const handleConfirmReward = () => {
    if (previewReward) {
      selectRoundReward(previewReward);
      setPreviewReward(null);
    }
  };

  const handleComplete = () => {
    completeRoundReward();
    onComplete?.();
  };

  const selectedReward = roundRewardState.selectedReward;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-yellow-400 mb-2"
          >
            🎉 {t('roundCleared', { round })} 🎉
          </motion.h2>
          <p className="text-gray-300">{t('chooseYourReward')}</p>
        </div>

        {/* Reward Selection */}
        {!selectedReward && (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
              {/* Quota Option */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePreviewReward('quota')}
                className={`rounded-xl p-6 text-center transition-all border-2 ${
                  previewReward === 'quota'
                    ? 'bg-blue-800/60 border-blue-300 scale-105'
                    : 'bg-blue-900/50 hover:bg-blue-800/50 border-blue-500'
                }`}
              >
                <div className="text-5xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">{t('rewardQuota')}</h3>
                <p className="text-gray-300 text-sm">{t('rewardQuotaDesc')}</p>
              </motion.button>

              {/* Chest Option */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePreviewReward('chest')}
                className={`rounded-xl p-6 text-center transition-all border-2 ${
                  previewReward === 'chest'
                    ? 'bg-yellow-800/60 border-yellow-300 scale-105'
                    : 'bg-yellow-900/50 hover:bg-yellow-800/50 border-yellow-500'
                }`}
              >
                <div className="text-5xl mb-3">📦</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{t('rewardChest')}</h3>
                <p className="text-gray-300 text-sm">{t('rewardChestDesc')}</p>
              </motion.button>

              {/* Gold Option */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePreviewReward('gold')}
                className={`rounded-xl p-6 text-center transition-all border-2 ${
                  previewReward === 'gold'
                    ? 'bg-green-800/60 border-green-300 scale-105'
                    : 'bg-green-900/50 hover:bg-green-800/50 border-green-500'
                }`}
              >
                <div className="text-5xl mb-3">💰</div>
                <h3 className="text-xl font-bold text-green-400 mb-2">{t('rewardGold')}</h3>
                <p className="text-gray-300 text-sm">{t('rewardGoldDesc')}</p>
              </motion.button>
            </div>

            {/* Confirm Button */}
            {previewReward && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmReward}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors text-lg"
              >
                {t('confirmReward')}
              </motion.button>
            )}
          </div>
        )}

        {/* Selected Reward Display */}
        {selectedReward === 'quota' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-blue-400 mb-2">{t('rewardQuotaApplied')}</h3>
            <p className="text-gray-300 mb-6">{t('rewardQuotaAppliedDesc')}</p>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              {t('continue')}
            </button>
          </motion.div>
        )}

        {selectedReward === 'gold' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">+$100!</h3>
            <p className="text-gray-300 mb-6">{t('rewardGoldApplied')}</p>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              {t('continue')}
            </button>
          </motion.div>
        )}

        {selectedReward === 'chest' && (
          <TreasureChest />
        )}
      </motion.div>
    </motion.div>
  );
}

export default RoundRewardSelection;
