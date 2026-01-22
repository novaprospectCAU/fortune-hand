/**
 * Fortune's Hand - Main Application
 *
 * Integrates all game modules into a cohesive game experience.
 */

import { useCallback, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Core module - state management
import { useGameStore } from '@/modules/core';

// UI module - layout and common components
import { GameLayout, ScoreDisplay, DeckViewer, CardEffectTooltip, Modal, Button, RoundClearCelebration, RoundRewardSelection, useI18n, TranslationKey, HandGuide, SlotGuide } from '@/modules/ui';

// Game modules - components
import { SlotMachine } from '@/modules/slots';
import { Hand, getSpecialCardDetails } from '@/modules/cards';
import { RouletteWheel, getDefaultConfig, applyBonuses } from '@/modules/roulette';
import { Shop, PackOpenOverlay, CardSelectionOverlay, getConsumableById } from '@/modules/shop';
import { getJokerById } from '@/modules/jokers';

// Types
import type { Joker } from '@/types/interfaces';
import type { ShopItemProps } from '@/modules/shop/components/ShopItem';

/**
 * Main game component
 */
function App() {
  // I18n
  const { t } = useI18n();

  // Get state and actions from the store
  const {
    phase,
    round,
    turn,
    targetScore,
    currentScore,
    gold,
    deck,
    hand,
    selectedCards,
    slotResult,
    handResult,
    scoreCalculation,
    rouletteResult,
    jokers,
    maxJokers,
    handsRemaining,
    discardsRemaining,
    shopState,
    config,
    // Actions
    startGame,
    nextPhase,
    selectCard,
    deselectCard,
    playHand,
    discardSelected,
    spinRoulette,
    skipRoulette,
    retryRoulette,
    confirmRoulette,
    buyItem,
    removeJoker,
    rerollShop,
    leaveShop,
    openedPackCards,
    clearOpenedPackCards,
    consumableOverlay,
    closeConsumableOverlay,
    applyConsumable,
    roundRewardState,
    openRoundReward,
  } = useGameStore();

  // Deck viewer state
  const [isDeckViewerOpen, setIsDeckViewerOpen] = useState(false);

  // Hovered card state (for effect tooltip)
  const [hoveredCard, setHoveredCard] = useState<import('@/types/interfaces').Card | null>(null);

  // Roulette retry tracking (resets when phase changes)
  const [rouletteRetryUsed, setRouletteRetryUsed] = useState(false);

  // Joker removal confirmation
  const [jokerToRemove, setJokerToRemove] = useState<Joker | null>(null);

  // Round clear celebration state
  const [showRoundClear, setShowRoundClear] = useState(false);
  const [clearedRoundInfo, setClearedRoundInfo] = useState<{ round: number; score: number; target: number } | null>(null);
  const [previousPhase, setPreviousPhase] = useState<string | null>(null);

  // Detect round clear (REWARD_PHASE -> SHOP_PHASE with success)
  useEffect(() => {
    if (previousPhase === 'REWARD_PHASE' && phase === 'SHOP_PHASE') {
      // Round was cleared successfully (went to shop instead of game over)
      setClearedRoundInfo({ round, score: currentScore, target: targetScore });
      setShowRoundClear(true);
    }
    setPreviousPhase(phase);
  }, [phase, previousPhase, round, currentScore, targetScore]);

  // Reset retry state when leaving roulette phase
  useEffect(() => {
    if (phase !== 'ROULETTE_PHASE') {
      setRouletteRetryUsed(false);
    }
  }, [phase]);

  // Keyboard shortcut for deck viewer (D key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        setIsDeckViewerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Card click handler - toggle selection
  const handleCardClick = useCallback(
    (cardId: string) => {
      if (selectedCards.some((c) => c.id === cardId)) {
        deselectCard(cardId);
      } else {
        selectCard(cardId);
      }
    },
    [selectedCards, selectCard, deselectCard]
  );

  // Joker click handler - show removal confirmation
  const handleJokerClick = useCallback((joker: Joker) => {
    setJokerToRemove(joker);
  }, []);

  // Slot spin complete handler - save result to store and advance phase
  const handleSlotSpinComplete = useCallback((result: import('@/types/interfaces').SlotResult) => {
    useGameStore.getState().setSlotResult(result);
  }, []);

  // Roulette spin complete handler - save result to store
  const handleRouletteSpinComplete = useCallback((result: import('@/types/interfaces').RouletteResult) => {
    useGameStore.getState().setRouletteResult(result);
  }, []);

  // Get roulette config with bonuses applied
  const getRouletteConfig = useCallback(() => {
    let config = getDefaultConfig();
    if (slotResult?.effects.rouletteBonus) {
      config = applyBonuses(config, slotResult.effects.rouletteBonus);
    }
    return config;
  }, [slotResult]);

  // Get item details for shop display
  const getItemDetails = useCallback(
    (itemId: string, itemType: string): ShopItemProps['itemDetails'] | undefined => {
      switch (itemType) {
        case 'joker': {
          const joker = getJokerById(itemId);
          if (joker) {
            // Try to get translated name/description, fallback to original
            const nameKey = `joker_${joker.id}` as TranslationKey;
            const descKey = `joker_${joker.id}_desc` as TranslationKey;
            return {
              name: t(nameKey) !== nameKey ? t(nameKey) : joker.name,
              description: t(descKey) !== descKey ? t(descKey) : joker.description,
              rarity: joker.rarity,
            };
          }
          break;
        }
        case 'card': {
          const cardDetails = getSpecialCardDetails(itemId);
          if (cardDetails) {
            return cardDetails;
          }
          break;
        }
        case 'pack': {
          const packNames: Record<string, TranslationKey> = {
            standard_pack: 'pack_standard' as TranslationKey,
            jumbo_pack: 'pack_jumbo' as TranslationKey,
            mega_pack: 'pack_mega' as TranslationKey,
          };
          const packDescKeys: Record<string, TranslationKey> = {
            standard_pack: 'pack_standard_desc' as TranslationKey,
            jumbo_pack: 'pack_jumbo_desc' as TranslationKey,
            mega_pack: 'pack_mega_desc' as TranslationKey,
          };
          const packRarity: Record<string, 'common' | 'uncommon' | 'rare'> = {
            standard_pack: 'common',
            jumbo_pack: 'uncommon',
            mega_pack: 'rare',
          };
          const nameKey = packNames[itemId];
          const descKey = packDescKeys[itemId];
          if (nameKey && descKey) {
            const fallbackName = itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return {
              name: t(nameKey) !== nameKey ? t(nameKey) : fallbackName,
              description: t(descKey) !== descKey ? t(descKey) : `Contains random cards`,
              rarity: packRarity[itemId] || 'common',
            };
          }
          break;
        }
        case 'voucher': {
          const voucherNames: Record<string, TranslationKey> = {
            extra_hand: 'voucher_extra_hand' as TranslationKey,
            extra_discard: 'voucher_extra_discard' as TranslationKey,
            shop_discount: 'voucher_shop_discount' as TranslationKey,
            luck_boost: 'voucher_luck_boost' as TranslationKey,
          };
          const voucherDescKeys: Record<string, TranslationKey> = {
            extra_hand: 'voucher_extra_hand_desc' as TranslationKey,
            extra_discard: 'voucher_extra_discard_desc' as TranslationKey,
            shop_discount: 'voucher_shop_discount_desc' as TranslationKey,
            luck_boost: 'voucher_luck_boost_desc' as TranslationKey,
          };
          const voucherRarity: Record<string, 'uncommon' | 'rare'> = {
            extra_hand: 'uncommon',
            extra_discard: 'uncommon',
            shop_discount: 'rare',
            luck_boost: 'rare',
          };
          const nameKey = voucherNames[itemId];
          const descKey = voucherDescKeys[itemId];
          if (nameKey && descKey) {
            const fallbackName = itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return {
              name: t(nameKey) !== nameKey ? t(nameKey) : fallbackName,
              description: t(descKey) !== descKey ? t(descKey) : '',
              rarity: voucherRarity[itemId] || 'uncommon',
            };
          }
          break;
        }
        case 'consumable': {
          const consumable = getConsumableById(itemId);
          if (consumable) {
            // Try to get translated name/description, fallback to original
            const nameKey = `consumable_${consumable.id}` as TranslationKey;
            const descKey = `consumable_${consumable.id}_desc` as TranslationKey;
            return {
              name: t(nameKey) !== nameKey ? t(nameKey) : consumable.name,
              description: t(descKey) !== descKey ? t(descKey) : consumable.description,
              rarity: consumable.rarity,
            };
          }
          break;
        }
      }
      return undefined;
    },
    [t]
  );

  // Render main content based on phase
  const renderMainContent = () => {
    switch (phase) {
      case 'IDLE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <motion.h1
              className="text-5xl md:text-7xl font-display font-bold text-accent mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t('gameTitle')}
            </motion.h1>
            <motion.p
              className="text-xl text-gray-400 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('gameSubtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-500 text-sm mb-4 text-center max-w-md">
                {t('gameDescription')}
                <br />
                {t('gameChallenge')}
              </p>
            </motion.div>
          </div>
        );

      case 'SLOT_PHASE':
        return (
          <div className="flex h-full gap-4">
            {/* Slot Guide - Left Side */}
            <div className="hidden md:block w-48 shrink-0">
              <SlotGuide className="sticky top-4" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  {t('roundTurn', { round, turn })}
                </h2>
                {!slotResult && (
                  <p className="text-gray-400">{t('spinToBegin')}</p>
                )}
              </motion.div>
              <SlotMachine
                onSpinComplete={handleSlotSpinComplete}
                disabled={!!slotResult}
              />
              {/* Show slot effects after spinning */}
              {slotResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-game-surface rounded-lg p-4 max-w-md"
                >
                  <h3 className="text-lg font-bold text-white text-center mb-2">
                    {slotResult.isJackpot ? `🎉 ${t('jackpot')} 🎉` : t('slotResult')}
                  </h3>
                  <div className="text-center text-sm">
                    {formatSlotEffects(slotResult.effects, t)}
                  </div>
                  <p className="text-gray-400 text-center text-sm mt-3">
                    {t('clickContinueToDraw')}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'DRAW_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-2 sm:py-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-2">{t('drawingCards')}</h2>
              <p className="text-gray-400">{t('preparingHand')}</p>
            </motion.div>
          </div>
        );

      case 'PLAY_PHASE':
        return (
          <div className="flex h-full gap-4">
            {/* Hand Guide - Left Side */}
            <div className="hidden md:block w-48 shrink-0">
              <HandGuide className="sticky top-4" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Slot Result Summary */}
              {slotResult && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-game-surface rounded-lg p-4 mb-4"
                >
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-2xl">
                      {slotResult.symbols.map((s, i) => {
                        const emoji = getSymbolEmoji(s);
                        return <span key={i}>{emoji}</span>;
                      })}
                    </span>
                    {slotResult.isJackpot && (
                      <span className="text-yellow-400 font-bold">{t('jackpot')}</span>
                    )}
                  </div>
                  {/* Slot Effects Description */}
                  <div className="text-center mt-2 text-sm">
                    {formatSlotEffects(slotResult.effects, t)}
                  </div>
                </motion.div>
              )}

              {/* Hand */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="text-center mb-2 text-gray-400">
                  {t('selectUpTo5')}
                </div>
                <Hand
                  cards={hand}
                  selectedIds={selectedCards.map((c) => c.id)}
                  onCardClick={handleCardClick}
                  onCardHover={setHoveredCard}
                  maxSelect={5}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        );

      case 'SCORE_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-2 sm:py-4">
            {handResult && scoreCalculation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  {formatHandType(handResult.handType, t)}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-blue-400 text-xl">
                    {scoreCalculation.chipTotal} {t('chips')}
                  </span>
                  <span className="text-gray-500">x</span>
                  <span className="text-red-400 text-xl">
                    {scoreCalculation.multTotal} {t('mult')}
                  </span>
                </div>
                <div className="text-4xl font-bold text-accent">
                  = {scoreCalculation.finalScore.toLocaleString()}
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'ROULETTE_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-4">
            {/* Result display above the wheel */}
            {rouletteResult && !rouletteResult.wasSkipped ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-4"
              >
                <div className={`text-4xl font-bold mb-2 ${
                  rouletteResult.segment.multiplier === 0
                    ? 'text-red-500'
                    : rouletteResult.segment.multiplier >= 5
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }`}>
                  x{rouletteResult.segment.multiplier}
                </div>
                <div className="text-2xl font-bold text-white">
                  {rouletteResult.finalScore.toLocaleString()} pts
                </div>
                {rouletteRetryUsed && (
                  <p className="text-orange-400 text-sm mt-1">{t('penaltyApplied')}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-4"
              >
                <h2 className="text-xl font-bold text-white mb-1">
                  {rouletteRetryUsed ? t('retrySpin') : t('riskTheRoulette')}
                </h2>
                <p className="text-gray-400 text-sm">
                  {t('baseScore')}: {rouletteRetryUsed
                    ? Math.floor((scoreCalculation?.finalScore ?? 0) * 0.75).toLocaleString()
                    : (scoreCalculation?.finalScore.toLocaleString() ?? 0)
                  }
                  {rouletteRetryUsed && <span className="text-orange-400"> (-25%)</span>}
                </p>
              </motion.div>
            )}

            <RouletteWheel
              key={rouletteRetryUsed ? 'retry' : 'initial'}
              config={getRouletteConfig()}
              baseScore={rouletteRetryUsed
                ? Math.floor((scoreCalculation?.finalScore ?? 0) * 0.75)
                : (scoreCalculation?.finalScore ?? 0)
              }
              onSpinComplete={handleRouletteSpinComplete}
              disabled={!!rouletteResult}
            />

            {/* Action buttons after spinning */}
            {rouletteResult && !rouletteResult.wasSkipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 mt-4"
              >
                {!rouletteRetryUsed && (
                  <button
                    onClick={() => {
                      setRouletteRetryUsed(true);
                      retryRoulette();
                    }}
                    className="px-5 py-3 min-h-[48px] bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white rounded-lg font-medium transition-colors touch-manipulation select-none"
                  >
                    {t('retryWithPenalty')}
                  </button>
                )}
                <button
                  onClick={confirmRoulette}
                  className="px-8 py-3 min-h-[48px] bg-green-600 hover:bg-green-500 active:bg-green-700 text-white rounded-lg font-bold transition-colors touch-manipulation select-none"
                >
                  {t('accept')}
                </button>
              </motion.div>
            )}
          </div>
        );

      case 'REWARD_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-2 sm:py-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-4">{t('turnComplete')}</h2>
              {rouletteResult && (
                <div className="mb-4">
                  {rouletteResult.wasSkipped ? (
                    <p className="text-gray-400">{t('keptScore')}</p>
                  ) : (
                    <p className="text-gray-400">
                      {t('roulette')}: x{rouletteResult.segment.multiplier}
                    </p>
                  )}
                </div>
              )}
              <div className="text-4xl font-bold text-accent mb-6">
                +{(rouletteResult?.finalScore ?? scoreCalculation?.finalScore ?? 0).toLocaleString()}
              </div>
              <ScoreDisplay
                currentScore={currentScore}
                targetScore={targetScore}
                size="lg"
              />
            </motion.div>
          </div>
        );

      case 'SHOP_PHASE':
        return (
          <div className="h-full">
            {shopState && (
              <Shop
                shopState={shopState}
                playerGold={gold}
                onBuy={buyItem}
                onReroll={rerollShop}
                onLeave={leaveShop}
                getItemDetails={getItemDetails}
              />
            )}
            {/* Pack open overlay */}
            <PackOpenOverlay
              cards={openedPackCards}
              onClose={clearOpenedPackCards}
            />
          </div>
        );

      case 'GAME_OVER':
        return (
          <div className="flex flex-col items-center justify-center h-full py-2 sm:py-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-red-500 mb-4">{t('gameOver')}</h2>
              <p className="text-gray-400 mb-2">{t('youReachedRound', { round })}</p>
              <p className="text-gray-400 mb-6">
                {t('finalScore')}: {currentScore.toLocaleString()} / {targetScore.toLocaleString()}
              </p>
              <div className="text-2xl text-accent font-bold">
                {t('betterLuckNextTime')}
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  // Event handlers for GameLayout
  const handlePlay = useCallback(() => {
    if (selectedCards.length > 0) {
      playHand();
    }
  }, [selectedCards, playHand]);

  const handleDiscard = useCallback(() => {
    if (selectedCards.length > 0 && discardsRemaining > 0) {
      discardSelected();
    }
  }, [selectedCards, discardsRemaining, discardSelected]);

  const handleSpinRoulette = useCallback(() => {
    spinRoulette();
  }, [spinRoulette]);

  const handleSkipRoulette = useCallback(() => {
    skipRoulette();
  }, [skipRoulette]);

  const handleContinue = useCallback(() => {
    if (phase === 'IDLE' || phase === 'GAME_OVER') {
      startGame();
    } else if (phase === 'SLOT_PHASE') {
      nextPhase();
    } else if (phase === 'SHOP_PHASE') {
      leaveShop();
    }
  }, [phase, startGame, nextPhase, leaveShop]);

  return (
    <>
    <GameLayout
      gameState={{
        phase,
        round,
        turn,
        targetScore,
        currentScore,
        gold,
        deck,
        hand,
        selectedCards,
        slotResult,
        handResult,
        scoreCalculation,
        rouletteResult,
        jokers,
        maxJokers,
        handsRemaining,
        discardsRemaining,
      }}
      maxHands={config.startingHands}
      onPlay={handlePlay}
      onDiscard={handleDiscard}
      onSpinRoulette={handleSpinRoulette}
      onSkipRoulette={handleSkipRoulette}
      onContinue={handleContinue}
      onJokerClick={handleJokerClick}
      deckCount={deck.cards.length}
      onViewDeck={() => setIsDeckViewerOpen(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full"
        >
          {renderMainContent()}
        </motion.div>
      </AnimatePresence>
    </GameLayout>

    {/* Deck Viewer Modal */}
    <DeckViewer
      deck={deck}
      isOpen={isDeckViewerOpen}
      onClose={() => setIsDeckViewerOpen(false)}
    />

    {/* Card Effect Tooltip (centered) */}
    <CardEffectTooltip card={hoveredCard} />

    {/* Joker Removal Confirmation Modal */}
    <Modal
      isOpen={!!jokerToRemove}
      onClose={() => setJokerToRemove(null)}
      title={t('removeJoker')}
    >
      {jokerToRemove && (
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">{jokerToRemove.name}</h3>
            <p className="text-gray-400 text-sm">{jokerToRemove.description}</p>
          </div>
          <p className="text-yellow-400 text-sm mb-4">
            {t('jokerWillBeRemoved')}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setJokerToRemove(null)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeJoker(jokerToRemove.id);
                setJokerToRemove(null);
              }}
            >
              {t('remove')}
            </Button>
          </div>
        </div>
      )}
    </Modal>

    {/* Round clear celebration */}
    <RoundClearCelebration
      isVisible={showRoundClear}
      round={clearedRoundInfo?.round ?? round}
      score={clearedRoundInfo?.score ?? currentScore}
      targetScore={clearedRoundInfo?.target ?? targetScore}
      onComplete={() => {
        setShowRoundClear(false);
        // Open round reward selection after celebration
        openRoundReward();
      }}
    />

    {/* Round reward selection */}
    {roundRewardState?.isOpen && (
      <RoundRewardSelection
        onComplete={() => {
          setClearedRoundInfo(null);
        }}
      />
    )}

    {/* Consumable card selection overlay */}
    {consumableOverlay?.isOpen && consumableOverlay.consumable && (
      <CardSelectionOverlay
        consumable={consumableOverlay.consumable}
        deckCards={deck.cards}
        onConfirm={applyConsumable}
        onCancel={closeConsumableOverlay}
      />
    )}
  </>
  );
}

/**
 * Get emoji for slot symbol
 */
function getSymbolEmoji(symbol: string): string {
  const symbolMap: Record<string, string> = {
    card: '\u{1F0CF}',    // Joker card
    target: '\u{1F3AF}',  // Target
    gold: '\u{1F4B0}',    // Money bag
    chip: '\u{1F3B0}',    // Slot machine
    star: '\u2B50',       // Star
    skull: '\u{1F480}',   // Skull
    wild: '\u{1F31F}',    // Glowing star
  };
  return symbolMap[symbol] || '\u2753'; // Question mark as fallback
}

/**
 * Format slot effects for display
 */
function formatSlotEffects(
  effects: import('@/types/interfaces').SlotEffects,
  t: (key: import('@/modules/ui').TranslationKey, params?: Record<string, string | number>) => string
): React.ReactNode {
  const parts: string[] = [];

  // Card bonuses
  if (effects.cardBonus.extraDraw > 0) {
    parts.push(t('extraDraw', { n: effects.cardBonus.extraDraw }));
  }
  if (effects.cardBonus.handSize > 0) {
    parts.push(t('handSize', { n: effects.cardBonus.handSize }));
  }
  if (effects.cardBonus.scoreMultiplier > 1) {
    parts.push(t('scoreMultiplier', { n: effects.cardBonus.scoreMultiplier }));
  }

  // Roulette bonuses
  if (effects.rouletteBonus.safeZoneBonus > 0) {
    parts.push(t('safeZone', { n: effects.rouletteBonus.safeZoneBonus }));
  }
  if (effects.rouletteBonus.maxMultiplier > 0) {
    parts.push(t('maxMult', { n: effects.rouletteBonus.maxMultiplier }));
  }
  if (effects.rouletteBonus.freeSpins > 0) {
    parts.push(t('freeSpin', { n: effects.rouletteBonus.freeSpins }));
  }

  // Instant rewards
  if (effects.instant.gold > 0) {
    parts.push(t('instantGold', { n: effects.instant.gold }));
  }
  if (effects.instant.chips > 0) {
    parts.push(t('instantChips', { n: effects.instant.chips }));
  }

  // Penalties
  const penalties: string[] = [];
  if (effects.penalty.discardCards > 0) {
    penalties.push(t('cardsDiscarded', { n: effects.penalty.discardCards }));
  }
  if (effects.penalty.skipRoulette) {
    penalties.push(t('rouletteSkipped'));
  }
  if (effects.penalty.loseGold > 0) {
    penalties.push(t('loseGold', { n: effects.penalty.loseGold }));
  }

  if (parts.length === 0 && penalties.length === 0) {
    return <span className="text-gray-500">{t('noEffects')}</span>;
  }

  return (
    <>
      {parts.length > 0 && (
        <span className="text-green-400">{parts.join(' · ')}</span>
      )}
      {penalties.length > 0 && (
        <span className="text-red-400 ml-2">{penalties.join(' · ')}</span>
      )}
    </>
  );
}

/**
 * Format hand type for display
 */
function formatHandType(
  handType: string,
  t: (key: import('@/modules/ui').TranslationKey) => string
): string {
  const typeToKey: Record<string, import('@/modules/ui').TranslationKey> = {
    high_card: 'highCard',
    pair: 'pair',
    two_pair: 'twoPair',
    three_of_a_kind: 'threeOfAKind',
    straight: 'straight',
    flush: 'flush',
    full_house: 'fullHouse',
    four_of_a_kind: 'fourOfAKind',
    straight_flush: 'straightFlush',
    royal_flush: 'royalFlush',
  };
  const key = typeToKey[handType];
  return key ? t(key) : handType;
}

export default App;
