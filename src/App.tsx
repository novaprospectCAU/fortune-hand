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
import { GameLayout, ScoreDisplay, DeckViewer, CardEffectTooltip, Modal, Button } from '@/modules/ui';

// Game modules - components
import { SlotMachine } from '@/modules/slots';
import { Hand } from '@/modules/cards';
import { RouletteWheel, getDefaultConfig, applyBonuses } from '@/modules/roulette';
import { Shop, PackOpenOverlay } from '@/modules/shop';
import { getJokerById } from '@/modules/jokers';
import { getSpecialCardById } from '@/modules/cards';

// Types
import type { Joker } from '@/types/interfaces';
import type { ShopItemProps } from '@/modules/shop/components/ShopItem';

/**
 * Main game component
 */
function App() {
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
  } = useGameStore();

  // Deck viewer state
  const [isDeckViewerOpen, setIsDeckViewerOpen] = useState(false);

  // Hovered card state (for effect tooltip)
  const [hoveredCard, setHoveredCard] = useState<import('@/types/interfaces').Card | null>(null);

  // Roulette retry tracking (resets when phase changes)
  const [rouletteRetryUsed, setRouletteRetryUsed] = useState(false);

  // Joker removal confirmation
  const [jokerToRemove, setJokerToRemove] = useState<Joker | null>(null);

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
            return {
              name: joker.name,
              description: joker.description,
              rarity: joker.rarity,
            };
          }
          break;
        }
        case 'card': {
          const card = getSpecialCardById(itemId);
          if (card) {
            // Get rarity from the card data
            const cardData = {
              wild_joker: { name: 'Wild Joker', description: 'Can be any rank or suit', rarity: 'rare' as const },
              gold_ace: { name: 'Golden Ace', description: 'Gives +10 gold instead of chips', rarity: 'uncommon' as const },
              slot_seven: { name: 'Lucky Seven', description: 'Triggers a mini slot spin when played', rarity: 'rare' as const },
              roulette_king: { name: "Gambler's King", description: 'Grants an extra roulette spin', rarity: 'rare' as const },
            }[itemId];
            if (cardData) {
              return cardData;
            }
          }
          break;
        }
        case 'pack': {
          const packInfo = {
            standard_pack: { name: 'Standard Pack', description: 'Contains 3 random cards', rarity: 'common' as const },
            jumbo_pack: { name: 'Jumbo Pack', description: 'Contains 4 random cards', rarity: 'uncommon' as const },
            mega_pack: { name: 'Mega Pack', description: 'Contains 5 random cards', rarity: 'rare' as const },
          }[itemId];
          if (packInfo) {
            return packInfo;
          }
          break;
        }
        case 'voucher': {
          const voucherInfo = {
            extra_hand: { name: 'Extra Hand', description: '+1 hand per round permanently', rarity: 'uncommon' as const },
            extra_discard: { name: 'Extra Discard', description: '+1 discard per round permanently', rarity: 'uncommon' as const },
            shop_discount: { name: 'Shop Discount', description: '10% off all shop items', rarity: 'rare' as const },
            luck_boost: { name: 'Luck Boost', description: 'Better rarity chances in shop', rarity: 'rare' as const },
          }[itemId];
          if (voucherInfo) {
            return voucherInfo;
          }
          break;
        }
      }
      return undefined;
    },
    []
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
              Fortune's Hand
            </motion.h1>
            <motion.p
              className="text-xl text-gray-400 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Card x Slot x Roulette Deckbuilder
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-500 text-sm mb-4 text-center max-w-md">
                Spin the slot, play your cards, and risk it all on the roulette.
                <br />
                Can you beat all 8 rounds?
              </p>
            </motion.div>
          </div>
        );

      case 'SLOT_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-2 sm:py-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Round {round} - Turn {turn}
              </h2>
              {!slotResult && (
                <p className="text-gray-400">Spin the slot to begin your turn!</p>
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
                  {slotResult.isJackpot ? '🎉 JACKPOT! 🎉' : 'Slot Result'}
                </h3>
                <div className="text-center text-sm">
                  {formatSlotEffects(slotResult.effects)}
                </div>
                <p className="text-gray-400 text-center text-sm mt-3">
                  Click Continue to draw cards
                </p>
              </motion.div>
            )}
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
              <h2 className="text-2xl font-bold text-white mb-2">Drawing Cards...</h2>
              <p className="text-gray-400">Preparing your hand</p>
            </motion.div>
          </div>
        );

      case 'PLAY_PHASE':
        return (
          <div className="flex flex-col h-full">
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
                    <span className="text-yellow-400 font-bold">JACKPOT!</span>
                  )}
                </div>
                {/* Slot Effects Description */}
                <div className="text-center mt-2 text-sm">
                  {formatSlotEffects(slotResult.effects)}
                </div>
              </motion.div>
            )}

            {/* Hand */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="text-center mb-2 text-gray-400">
                Select up to 5 cards to play
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
                  {formatHandType(handResult.handType)}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-blue-400 text-xl">
                    {scoreCalculation.chipTotal} Chips
                  </span>
                  <span className="text-gray-500">x</span>
                  <span className="text-red-400 text-xl">
                    {scoreCalculation.multTotal} Mult
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
                  <p className="text-orange-400 text-sm mt-1">(-25% penalty applied)</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-4"
              >
                <h2 className="text-xl font-bold text-white mb-1">
                  {rouletteRetryUsed ? 'Retry Spin!' : 'Risk the Roulette?'}
                </h2>
                <p className="text-gray-400 text-sm">
                  Base Score: {rouletteRetryUsed
                    ? Math.floor((scoreCalculation?.finalScore ?? 0) * 0.75).toLocaleString()
                    : (scoreCalculation?.finalScore.toLocaleString() ?? 0)
                  }
                  {rouletteRetryUsed && <span className="text-orange-400"> (-25%)</span>}
                </p>
              </motion.div>
            )}

            <RouletteWheel
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
                className="flex gap-3 mt-4"
              >
                {!rouletteRetryUsed && (
                  <button
                    onClick={() => {
                      setRouletteRetryUsed(true);
                      retryRoulette();
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Retry (-25%)
                  </button>
                )}
                <button
                  onClick={confirmRoulette}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                >
                  Accept
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
              <h2 className="text-2xl font-bold text-white mb-4">Turn Complete!</h2>
              {rouletteResult && (
                <div className="mb-4">
                  {rouletteResult.wasSkipped ? (
                    <p className="text-gray-400">You kept your score</p>
                  ) : (
                    <p className="text-gray-400">
                      Roulette: x{rouletteResult.segment.multiplier}
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
              <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over</h2>
              <p className="text-gray-400 mb-2">You reached Round {round}</p>
              <p className="text-gray-400 mb-6">
                Final Score: {currentScore.toLocaleString()} / {targetScore.toLocaleString()}
              </p>
              <div className="text-2xl text-accent font-bold">
                Better luck next time!
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
      title="Remove Joker?"
    >
      {jokerToRemove && (
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">{jokerToRemove.name}</h3>
            <p className="text-gray-400 text-sm">{jokerToRemove.description}</p>
          </div>
          <p className="text-yellow-400 text-sm mb-4">
            This joker will be permanently removed.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setJokerToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeJoker(jokerToRemove.id);
                setJokerToRemove(null);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </Modal>
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
function formatSlotEffects(effects: import('@/types/interfaces').SlotEffects): React.ReactNode {
  const parts: string[] = [];

  // Card bonuses
  if (effects.cardBonus.extraDraw > 0) {
    parts.push(`+${effects.cardBonus.extraDraw} extra draw`);
  }
  if (effects.cardBonus.handSize > 0) {
    parts.push(`+${effects.cardBonus.handSize} hand size`);
  }
  if (effects.cardBonus.scoreMultiplier > 1) {
    parts.push(`x${effects.cardBonus.scoreMultiplier} score`);
  }

  // Roulette bonuses
  if (effects.rouletteBonus.safeZoneBonus > 0) {
    parts.push(`+${effects.rouletteBonus.safeZoneBonus}% safe zone`);
  }
  if (effects.rouletteBonus.maxMultiplier > 0) {
    parts.push(`+${effects.rouletteBonus.maxMultiplier}x max mult`);
  }
  if (effects.rouletteBonus.freeSpins > 0) {
    parts.push(`${effects.rouletteBonus.freeSpins} free spin`);
  }

  // Instant rewards
  if (effects.instant.gold > 0) {
    parts.push(`+${effects.instant.gold} gold`);
  }
  if (effects.instant.chips > 0) {
    parts.push(`+${effects.instant.chips} chips`);
  }

  // Penalties
  const penalties: string[] = [];
  if (effects.penalty.discardCards > 0) {
    penalties.push(`-${effects.penalty.discardCards} cards discarded`);
  }
  if (effects.penalty.skipRoulette) {
    penalties.push('roulette skipped');
  }
  if (effects.penalty.loseGold > 0) {
    penalties.push(`-${effects.penalty.loseGold} gold`);
  }

  if (parts.length === 0 && penalties.length === 0) {
    return <span className="text-gray-500">No effects</span>;
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
function formatHandType(handType: string): string {
  const typeMap: Record<string, string> = {
    high_card: 'High Card',
    pair: 'Pair',
    two_pair: 'Two Pair',
    three_of_a_kind: 'Three of a Kind',
    straight: 'Straight',
    flush: 'Flush',
    full_house: 'Full House',
    four_of_a_kind: 'Four of a Kind',
    straight_flush: 'Straight Flush',
    royal_flush: 'Royal Flush',
  };
  return typeMap[handType] || handType;
}

export default App;
