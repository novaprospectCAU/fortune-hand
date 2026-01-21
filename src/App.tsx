/**
 * Fortune's Hand - Main Application
 *
 * Integrates all game modules into a cohesive game experience.
 */

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Core module - state management
import { useGameStore } from '@/modules/core';

// UI module - layout and common components
import { GameLayout, ScoreDisplay } from '@/modules/ui';

// Game modules - components
import { SlotMachine } from '@/modules/slots';
import { Hand } from '@/modules/cards';
import { RouletteWheel, getDefaultConfig, applyBonuses } from '@/modules/roulette';
import { Shop } from '@/modules/shop';
import { getJokerById } from '@/modules/jokers';

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
    slotSpinsRemaining,
    shopState,
    // Actions
    startGame,
    spinSlot,
    skipSlot,
    selectCard,
    deselectCard,
    playHand,
    discardSelected,
    spinRoulette,
    skipRoulette,
    buyItem,
    rerollShop,
    leaveShop,
  } = useGameStore();

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

  // Joker click handler (for future tooltip/detail view)
  const handleJokerClick = useCallback((_joker: Joker) => {
    // TODO: Show joker detail modal
  }, []);

  // Slot spin complete handler
  const handleSlotSpinComplete = useCallback(() => {
    // SlotMachine handles its own spin, but we need to call store action
    // The store's spinSlot action will be called via the footer button
  }, []);

  // Roulette spin complete handler
  const handleRouletteSpinComplete = useCallback(() => {
    // RouletteWheel handles animation, store action manages state
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
      if (itemType === 'joker') {
        const joker = getJokerById(itemId);
        if (joker) {
          return {
            name: joker.name,
            description: joker.description,
            rarity: joker.rarity,
          };
        }
      }
      // TODO: Add support for other item types (card, pack, voucher)
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
          <div className="flex flex-col items-center justify-center h-full py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Round {round} - Turn {turn}
              </h2>
              <p className="text-gray-400">Spin the slot to begin your turn!</p>
            </motion.div>
            <SlotMachine
              onSpinComplete={handleSlotSpinComplete}
              disabled={false}
            />
          </div>
        );

      case 'DRAW_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-8">
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
                maxSelect={5}
                disabled={false}
              />
            </div>
          </div>
        );

      case 'SCORE_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-8">
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
          <div className="flex flex-col items-center justify-center h-full py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Risk the Roulette?
              </h2>
              <p className="text-gray-400">
                Current Score: {scoreCalculation?.finalScore.toLocaleString() ?? 0}
              </p>
              <p className="text-yellow-400 text-sm mt-2">
                Spin to multiply your score or lose it all!
              </p>
            </motion.div>
            <RouletteWheel
              config={getRouletteConfig()}
              baseScore={scoreCalculation?.finalScore ?? 0}
              onSpinComplete={handleRouletteSpinComplete}
              disabled={false}
            />
          </div>
        );

      case 'REWARD_PHASE':
        return (
          <div className="flex flex-col items-center justify-center h-full py-8">
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
          </div>
        );

      case 'GAME_OVER':
        return (
          <div className="flex flex-col items-center justify-center h-full py-8">
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

  const handleSpinSlot = useCallback(() => {
    spinSlot();
  }, [spinSlot]);

  const handleSkipSlot = useCallback(() => {
    skipSlot();
  }, [skipSlot]);

  const handleSpinRoulette = useCallback(() => {
    spinRoulette();
  }, [spinRoulette]);

  const handleSkipRoulette = useCallback(() => {
    skipRoulette();
  }, [skipRoulette]);

  const handleContinue = useCallback(() => {
    if (phase === 'IDLE' || phase === 'GAME_OVER') {
      startGame();
    } else if (phase === 'SHOP_PHASE') {
      leaveShop();
    }
  }, [phase, startGame, leaveShop]);

  return (
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
        slotSpinsRemaining,
      }}
      onPlay={handlePlay}
      onDiscard={handleDiscard}
      onSpinSlot={handleSpinSlot}
      onSkipSlot={handleSkipSlot}
      onSpinRoulette={handleSpinRoulette}
      onSkipRoulette={handleSkipRoulette}
      onContinue={handleContinue}
      onJokerClick={handleJokerClick}
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
