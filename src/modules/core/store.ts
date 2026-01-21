/**
 * Game Store - Central State Management
 *
 * Uses Zustand for state management.
 * All game state and actions are defined here.
 */

import { create } from 'zustand';
import type {
  GameState,
  GameActions,
  GameConfig,
  GamePhase,
  Deck,
  RouletteResult,
  ShopState,
  SlotResult,
} from '@/types/interfaces';
import { DEFAULT_GAME_CONFIG, calculateGoldReward } from '@/data/constants';
import {
  getNextPhase,
  getTargetScoreForRound,
  getRoundBonuses,
  mergeGameConfig,
  isActionValidInPhase,
} from './gameLoop';
import { getGameEventEmitter } from './eventSystem';
import {
  createStandardDeck,
  shuffle,
  draw,
  discard,
  spin,
  evaluateHand,
  calculateScore,
  getDefaultRouletteConfig,
  rouletteSpin,
  applyRouletteBonuses,
  evaluateJokers,
  generateShop,
  buyItem as shopBuyItem,
  rerollShop,
  countSlotTriggers,
  countRouletteTriggers,
  mergeSlotResults,
} from './moduleIntegration';
import { getJokerById } from '@/modules/jokers';
import { getSpecialCardById, addToDeck } from '@/modules/cards';
import {
  getVoucherById,
  calculateVoucherModifiers,
  calculateInterest,
} from '@/modules/shop';

/**
 * Extended store interface combining state and actions
 */
interface GameStore extends GameState, GameActions {
  // Internal state
  config: GameConfig;
  shopState: ShopState | null;

  // Internal actions
  _setPhase: (phase: GamePhase) => void;
  _drawCards: (count: number) => void;
  _resetTurnState: () => void;
}

/**
 * Create initial state
 */
function createInitialState(): Omit<GameState, keyof GameActions> & {
  config: GameConfig;
  shopState: ShopState | null;
} {
  return {
    phase: 'IDLE',
    round: 0,
    turn: 0,
    targetScore: 0,
    currentScore: 0,
    gold: DEFAULT_GAME_CONFIG.startingGold,
    deck: { cards: [], discardPile: [] },
    hand: [],
    selectedCards: [],
    slotResult: null,
    handResult: null,
    scoreCalculation: null,
    rouletteResult: null,
    triggeredSlotResults: [],
    rouletteSpinsGranted: 0,
    jokers: [],
    maxJokers: DEFAULT_GAME_CONFIG.maxJokers,
    purchasedVouchers: [],
    handsRemaining: DEFAULT_GAME_CONFIG.startingHands,
    discardsRemaining: DEFAULT_GAME_CONFIG.startingDiscards,
    slotSpinsRemaining: DEFAULT_GAME_CONFIG.startingSlotSpins,
    config: mergeGameConfig(),
    shopState: null,
  };
}

/**
 * Main game store
 */
export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  // ============================================================
  // Internal Actions
  // ============================================================

  _setPhase: (phase: GamePhase) => {
    const currentPhase = get().phase;
    set({ phase });
    getGameEventEmitter().emit({
      type: 'PHASE_CHANGE',
      from: currentPhase,
      to: phase,
    });
  },

  _drawCards: (count: number) => {
    const state = get();
    let deck = state.deck;
    const voucherMods = calculateVoucherModifiers(state.purchasedVouchers);
    const handSize = state.config.handSize + voucherMods.handSizeBonus + (state.slotResult?.effects.cardBonus.handSize ?? 0);

    // Check if we need to reshuffle discard pile
    if (deck.cards.length < count && deck.discardPile.length > 0) {
      const reshuffled = shuffle([...deck.cards, ...deck.discardPile]);
      deck = { cards: reshuffled, discardPile: [] };
    }

    const drawCount = Math.min(count, deck.cards.length, handSize - state.hand.length);
    const { drawn, deck: newDeck } = draw(deck, drawCount);

    set({
      deck: newDeck,
      hand: [...state.hand, ...drawn],
    });

    getGameEventEmitter().emit({
      type: 'CARDS_DRAWN',
      cards: drawn,
    });
  },

  _resetTurnState: () => {
    set({
      slotResult: null,
      handResult: null,
      scoreCalculation: null,
      rouletteResult: null,
      triggeredSlotResults: [],
      rouletteSpinsGranted: 0,
      selectedCards: [],
    });
  },

  // ============================================================
  // Game Flow Actions
  // ============================================================

  startGame: (partialConfig?: Partial<GameConfig>) => {
    const config = mergeGameConfig(partialConfig);

    // Preserve vouchers before resetting state
    const preservedVouchers = get().purchasedVouchers;

    // Create and shuffle deck
    const cards = shuffle(createStandardDeck());
    const deck: Deck = { cards, discardPile: [] };

    // Set up round 1
    const targetScore = getTargetScoreForRound(1);
    const bonuses = getRoundBonuses(1);

    // Apply voucher modifiers (vouchers persist from previous games)
    const voucherMods = calculateVoucherModifiers(preservedVouchers);

    set({
      ...createInitialState(),
      config,
      phase: 'SLOT_PHASE',
      round: 1,
      turn: 1,
      targetScore,
      gold: config.startingGold + voucherMods.startingGoldBonus,
      deck,
      maxJokers: config.maxJokers + voucherMods.maxJokersBonus,
      purchasedVouchers: preservedVouchers, // Preserve vouchers
      handsRemaining: config.startingHands + bonuses.handsBonus + voucherMods.handsBonus,
      discardsRemaining: config.startingDiscards + bonuses.discardsBonus + voucherMods.discardsBonus,
      slotSpinsRemaining: config.startingSlotSpins + voucherMods.slotSpinsBonus,
    });

    getGameEventEmitter().emit({
      type: 'GAME_START',
      config,
    });

    getGameEventEmitter().emit({
      type: 'PHASE_CHANGE',
      from: 'IDLE',
      to: 'SLOT_PHASE',
    });
  },

  nextPhase: () => {
    const state = get();
    const nextPhase = getNextPhase(state);

    // Handle automatic phase logic
    switch (nextPhase) {
      case 'DRAW_PHASE': {
        // Auto-draw on entering draw phase
        get()._setPhase('DRAW_PHASE');
        const slotBonus = state.slotResult?.effects.cardBonus.extraDraw ?? 0;
        const penalty = state.slotResult?.effects.penalty.discardCards ?? 0;
        const drawCount = state.config.handSize + slotBonus;

        // Apply penalty first
        if (penalty > 0 && state.hand.length > 0) {
          const toDiscard = state.hand.slice(0, Math.min(penalty, state.hand.length));
          const newDeck = discard(state.deck, toDiscard);
          set({
            deck: newDeck,
            hand: state.hand.filter(c => !toDiscard.includes(c)),
          });
        }

        get()._drawCards(drawCount);
        // Automatically move to play phase
        set({ phase: 'PLAY_PHASE' });
        getGameEventEmitter().emit({
          type: 'PHASE_CHANGE',
          from: 'DRAW_PHASE',
          to: 'PLAY_PHASE',
        });
        break;
      }

      case 'SCORE_PHASE': {
        get()._setPhase('SCORE_PHASE');
        // Auto-calculate score
        const { selectedCards, jokers, slotResult } = get();
        const handResult = evaluateHand(selectedCards);

        // Get joker bonuses
        const jokerBonuses = evaluateJokers(jokers, {
          phase: 'SCORE_PHASE',
          playedCards: selectedCards,
          handResult,
          slotResult: slotResult ?? undefined,
        });

        // Apply slot score multiplier
        const slotMultiplier = slotResult?.effects.cardBonus.scoreMultiplier ?? 1;
        if (slotMultiplier !== 1) {
          jokerBonuses.push({
            source: 'Slot Bonus',
            type: 'xmult',
            value: slotMultiplier,
          });
        }

        const scoreCalc = calculateScore(handResult, jokerBonuses);

        set({
          handResult,
          scoreCalculation: scoreCalc,
        });

        getGameEventEmitter().emit({
          type: 'SCORE_CALCULATED',
          calculation: scoreCalc,
        });

        // Automatically move to roulette phase
        get()._setPhase('ROULETTE_PHASE');
        break;
      }

      case 'REWARD_PHASE': {
        get()._setPhase('REWARD_PHASE');
        const { currentScore, scoreCalculation, rouletteResult, slotResult, hand, deck } = get();

        // Calculate final score for this turn
        let turnScore = 0;
        if (rouletteResult && !rouletteResult.wasSkipped) {
          turnScore = rouletteResult.finalScore;
        } else if (scoreCalculation) {
          turnScore = scoreCalculation.finalScore;
        }

        // Add instant chips from slot
        turnScore += slotResult?.effects.instant.chips ?? 0;

        // Update score and resources
        const newScore = currentScore + turnScore;
        const goldFromSlot = slotResult?.effects.instant.gold ?? 0;
        const goldPenalty = slotResult?.effects.penalty.loseGold ?? 0;
        const goldFromScore = calculateGoldReward(turnScore);  // Gold reward based on score
        const newGold = Math.max(0, get().gold + goldFromSlot + goldFromScore - goldPenalty);

        // Discard played cards
        const playedCards = get().selectedCards;
        const newHand = hand.filter(c => !playedCards.some(p => p.id === c.id));
        const newDeck = discard(deck, playedCards);

        set({
          currentScore: newScore,
          gold: newGold,
          hand: newHand,
          deck: newDeck,
          selectedCards: [],
          handsRemaining: get().handsRemaining - 1,
        });

        // Check for round end
        const state = get();
        if (state.handsRemaining <= 0 || state.currentScore >= state.targetScore) {
          const success = state.currentScore >= state.targetScore;
          getGameEventEmitter().emit({
            type: 'ROUND_END',
            score: state.currentScore,
            target: state.targetScore,
            success,
          });

          if (success) {
            // Apply interest from vouchers before shop phase
            const voucherMods = calculateVoucherModifiers(state.purchasedVouchers);
            const interest = calculateInterest(state.gold, voucherMods);
            if (interest > 0) {
              set({ gold: state.gold + interest });
            }

            // Generate shop with luck bonus from vouchers
            const shopState = generateShop(state.round, voucherMods.luckBonus);
            set({ shopState });
            get()._setPhase('SHOP_PHASE');
          } else {
            get()._setPhase('GAME_OVER');
            getGameEventEmitter().emit({
              type: 'GAME_OVER',
              finalRound: state.round,
              finalScore: state.currentScore,
            });
          }
        } else {
          // Continue to next turn
          get()._resetTurnState();
          set({ turn: state.turn + 1 });
          get()._setPhase('SLOT_PHASE');
        }
        break;
      }

      case 'SHOP_PHASE': {
        get()._setPhase('SHOP_PHASE');
        if (!get().shopState) {
          const state = get();
          const voucherMods = calculateVoucherModifiers(state.purchasedVouchers);
          const shopState = generateShop(state.round, voucherMods.luckBonus);
          set({ shopState });
        }
        break;
      }

      case 'GAME_OVER': {
        get()._setPhase('GAME_OVER');
        const state = get();
        getGameEventEmitter().emit({
          type: 'GAME_OVER',
          finalRound: state.round,
          finalScore: state.currentScore,
        });
        break;
      }

      default:
        get()._setPhase(nextPhase);
    }
  },

  // ============================================================
  // Slot Phase Actions
  // ============================================================

  spinSlot: () => {
    const state = get();
    if (!isActionValidInPhase('spinSlot', state.phase)) {
      console.warn('spinSlot is not valid in phase:', state.phase);
      return;
    }

    // Check if spins remaining
    if (state.slotSpinsRemaining <= 0) {
      console.warn('No slot spins remaining');
      return;
    }

    // Evaluate jokers for slot modifiers (future use)
    evaluateJokers(state.jokers, {
      phase: 'SLOT_PHASE',
    });

    const result = spin();
    get().setSlotResult(result);
  },

  // Set slot result from external source (e.g., SlotMachine component)
  setSlotResult: (result: SlotResult) => {
    const state = get();
    if (state.phase !== 'SLOT_PHASE') {
      console.warn('setSlotResult is only valid in SLOT_PHASE');
      return;
    }

    // Apply instant gold
    const instantGold = result.effects.instant.gold;
    const goldPenalty = result.effects.penalty.loseGold;

    set({
      slotResult: result,
      gold: Math.max(0, state.gold + instantGold - goldPenalty),
      slotSpinsRemaining: Math.max(0, state.slotSpinsRemaining - 1),
    });

    getGameEventEmitter().emit({
      type: 'SLOT_SPIN',
      result,
    });

    // Don't auto-advance - let the user click Continue to proceed
  },

  skipSlot: () => {
    const state = get();
    if (!isActionValidInPhase('spinSlot', state.phase)) {
      console.warn('skipSlot is not valid in phase:', state.phase);
      return;
    }

    // Create a neutral slot result (no bonuses, no penalties)
    const neutralResult: SlotResult = {
      symbols: ['card', 'target', 'gold'],
      isJackpot: false,
      effects: {
        cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 1 },
        rouletteBonus: { safeZoneBonus: 0, maxMultiplier: 0, freeSpins: 0 },
        instant: { gold: 0, chips: 0 },
        penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
      },
    };

    set({ slotResult: neutralResult });

    // Automatically advance to draw phase
    get().nextPhase();
  },

  // ============================================================
  // Card Phase Actions
  // ============================================================

  selectCard: (cardId: string) => {
    const state = get();
    if (!isActionValidInPhase('selectCard', state.phase)) {
      console.warn('selectCard is not valid in phase:', state.phase);
      return;
    }

    const card = state.hand.find(c => c.id === cardId);
    if (!card) {
      console.warn('Card not found in hand:', cardId);
      return;
    }

    if (state.selectedCards.some(c => c.id === cardId)) {
      console.warn('Card already selected:', cardId);
      return;
    }

    if (state.selectedCards.length >= DEFAULT_GAME_CONFIG.maxSelectCards) {
      console.warn('Maximum cards selected');
      return;
    }

    set({
      selectedCards: [...state.selectedCards, card],
    });
  },

  deselectCard: (cardId: string) => {
    const state = get();
    if (!isActionValidInPhase('deselectCard', state.phase)) {
      console.warn('deselectCard is not valid in phase:', state.phase);
      return;
    }

    set({
      selectedCards: state.selectedCards.filter(c => c.id !== cardId),
    });
  },

  playHand: () => {
    const state = get();
    if (!isActionValidInPhase('playHand', state.phase)) {
      console.warn('playHand is not valid in phase:', state.phase);
      return;
    }

    if (state.selectedCards.length === 0) {
      console.warn('No cards selected');
      return;
    }

    // Detect special card triggers
    const triggeredSlotResults: typeof state.triggeredSlotResults = [];
    let rouletteSpinsGranted = 0;

    // Process slot triggers - spin mini slots for each trigger
    const slotTriggerCount = countSlotTriggers(state.selectedCards);
    if (slotTriggerCount > 0) {
      for (let i = 0; i < slotTriggerCount; i++) {
        const miniSlotResult = spin();
        triggeredSlotResults.push(miniSlotResult);

        // Emit event for mini slot spin
        getGameEventEmitter().emit({
          type: 'SLOT_SPIN',
          result: miniSlotResult,
        });
      }

      // Merge triggered slot results with main slot result
      if (state.slotResult && triggeredSlotResults.length > 0) {
        const allResults = [state.slotResult, ...triggeredSlotResults];
        const mergedResult = mergeSlotResults(allResults);
        if (mergedResult) {
          set({ slotResult: mergedResult });
        }
      } else if (triggeredSlotResults.length > 0) {
        // No main slot result yet, use merged triggered results
        const mergedResult = mergeSlotResults(triggeredSlotResults);
        if (mergedResult) {
          set({ slotResult: mergedResult });
        }
      }
    }

    // Process roulette triggers - grant extra spins
    rouletteSpinsGranted = countRouletteTriggers(state.selectedCards);

    const handResult = evaluateHand(state.selectedCards);

    set({
      handResult,
      triggeredSlotResults,
      rouletteSpinsGranted,
    });

    getGameEventEmitter().emit({
      type: 'CARDS_PLAYED',
      cards: state.selectedCards,
      handResult,
    });

    // Move to score phase
    get().nextPhase();
  },

  discardSelected: () => {
    const state = get();
    if (!isActionValidInPhase('discardSelected', state.phase)) {
      console.warn('discardSelected is not valid in phase:', state.phase);
      return;
    }

    if (state.selectedCards.length === 0) {
      console.warn('No cards selected');
      return;
    }

    if (state.discardsRemaining <= 0) {
      console.warn('No discards remaining');
      return;
    }

    const discardedCards = state.selectedCards;
    const newHand = state.hand.filter(c => !discardedCards.some(d => d.id === c.id));
    const newDeck = discard(state.deck, discardedCards);

    set({
      hand: newHand,
      deck: newDeck,
      selectedCards: [],
      discardsRemaining: state.discardsRemaining - 1,
    });

    getGameEventEmitter().emit({
      type: 'CARDS_DISCARDED',
      cards: discardedCards,
    });

    // Draw new cards to replace discarded ones
    get()._drawCards(discardedCards.length);
  },

  // ============================================================
  // Roulette Phase Actions
  // ============================================================

  spinRoulette: () => {
    const state = get();
    if (!isActionValidInPhase('spinRoulette', state.phase)) {
      console.warn('spinRoulette is not valid in phase:', state.phase);
      return;
    }

    // Check if roulette is skipped by slot penalty
    if (state.slotResult?.effects.penalty.skipRoulette) {
      console.warn('Roulette skipped due to slot penalty');
      get().skipRoulette();
      return;
    }

    // Roulette wheel handles its own spin - this is just for programmatic triggering
    const baseScore = state.scoreCalculation?.finalScore ?? 0;
    let config = getDefaultRouletteConfig();

    if (state.slotResult) {
      config = applyRouletteBonuses(config, state.slotResult.effects.rouletteBonus);
    }

    const result = rouletteSpin({
      baseScore,
      config,
    });

    set({ rouletteResult: result });

    getGameEventEmitter().emit({
      type: 'ROULETTE_SPIN',
      result,
    });
  },

  // Set roulette result from RouletteWheel component
  setRouletteResult: (result: RouletteResult) => {
    const state = get();
    if (state.phase !== 'ROULETTE_PHASE') {
      console.warn('setRouletteResult is only valid in ROULETTE_PHASE');
      return;
    }

    set({ rouletteResult: result });

    getGameEventEmitter().emit({
      type: 'ROULETTE_SPIN',
      result,
    });
  },

  // Retry roulette - clears result so wheel can spin again
  // The penalty is applied in App.tsx by passing reduced baseScore to the wheel
  retryRoulette: () => {
    const state = get();
    if (!isActionValidInPhase('spinRoulette', state.phase)) {
      console.warn('retryRoulette is not valid in phase:', state.phase);
      return;
    }

    if (!state.rouletteResult) {
      console.warn('No roulette result to retry from');
      return;
    }

    // Clear the result so the wheel can be spun again
    set({ rouletteResult: null });
  },

  // Confirm roulette result and proceed to reward phase
  confirmRoulette: () => {
    const state = get();
    if (!isActionValidInPhase('spinRoulette', state.phase)) {
      console.warn('confirmRoulette is not valid in phase:', state.phase);
      return;
    }

    // Move to reward phase
    get().nextPhase();
  },

  skipRoulette: () => {
    const state = get();
    if (!isActionValidInPhase('skipRoulette', state.phase)) {
      console.warn('skipRoulette is not valid in phase:', state.phase);
      return;
    }

    const baseScore = state.scoreCalculation?.finalScore ?? 0;
    const result: RouletteResult = {
      segment: {
        id: 'skip',
        multiplier: 1,
        probability: 100,
        color: '#888888',
      },
      finalScore: baseScore,
      wasSkipped: true,
    };

    set({ rouletteResult: result });

    // Move to reward phase
    get().nextPhase();
  },

  // ============================================================
  // Shop Phase Actions
  // ============================================================

  buyItem: (itemId: string) => {
    const state = get();
    if (!isActionValidInPhase('buyItem', state.phase)) {
      console.warn('buyItem is not valid in phase:', state.phase);
      return;
    }

    if (!state.shopState) {
      console.warn('No shop state');
      return;
    }

    const transaction = shopBuyItem(state.shopState, itemId, state.gold);

    if (!transaction.success) {
      console.warn('Transaction failed:', transaction.error);
      return;
    }

    // Mark item as sold
    const newShopState: ShopState = {
      ...state.shopState,
      items: state.shopState.items.map(item =>
        item.id === itemId ? { ...item, sold: true } : item
      ),
    };

    // Handle purchased item based on type
    const purchasedItem = transaction.item;
    let newJokers = state.jokers;
    let newDeck = state.deck;
    let newPurchasedVouchers = state.purchasedVouchers;

    if (purchasedItem) {
      switch (purchasedItem.type) {
        case 'joker': {
          // Add joker to player's collection
          const joker = getJokerById(purchasedItem.itemId);
          if (joker && state.jokers.length < state.maxJokers) {
            newJokers = [...state.jokers, joker];
            console.log('Joker added:', joker.name);
          } else if (!joker) {
            console.warn('Joker not found:', purchasedItem.itemId);
          } else if (state.jokers.length >= state.maxJokers) {
            console.warn('Max jokers reached');
          }
          break;
        }
        case 'card': {
          // Add special card to deck
          const specialCard = getSpecialCardById(purchasedItem.itemId);
          if (specialCard) {
            newDeck = addToDeck(state.deck, [specialCard]);
            console.log('Special card added:', specialCard.id);
          } else {
            console.warn('Special card not found:', purchasedItem.itemId);
          }
          break;
        }
        case 'pack': {
          // Use pack cards from transaction if available
          if (transaction.packCards && transaction.packCards.length > 0) {
            newDeck = addToDeck(state.deck, transaction.packCards);
          }
          break;
        }
        case 'voucher': {
          // Add voucher to purchased list
          const voucher = getVoucherById(purchasedItem.itemId);
          if (voucher && !newPurchasedVouchers.includes(purchasedItem.itemId)) {
            newPurchasedVouchers = [...newPurchasedVouchers, purchasedItem.itemId];
          } else if (newPurchasedVouchers.includes(purchasedItem.itemId)) {
            console.warn('Voucher already purchased');
          }
          break;
        }
      }
    }

    set({
      gold: transaction.newGold,
      shopState: newShopState,
      jokers: newJokers,
      deck: newDeck,
      purchasedVouchers: newPurchasedVouchers,
    });

    if (transaction.item) {
      getGameEventEmitter().emit({
        type: 'ITEM_BOUGHT',
        item: transaction.item,
      });
    }
  },

  rerollShop: () => {
    const state = get();
    if (!isActionValidInPhase('rerollShop', state.phase)) {
      console.warn('rerollShop is not valid in phase:', state.phase);
      return;
    }

    if (!state.shopState) {
      console.warn('No shop state');
      return;
    }

    // Apply reroll discount from vouchers
    const voucherMods = calculateVoucherModifiers(state.purchasedVouchers);
    const result = rerollShop(
      state.shopState,
      state.gold,
      state.round,
      voucherMods.luckBonus,
      voucherMods.rerollDiscount
    );

    if (!result.success) {
      console.warn('Reroll failed: not enough gold');
      return;
    }

    set({
      gold: result.newGold,
      shopState: result.shop,
    });
  },

  leaveShop: () => {
    const state = get();
    if (!isActionValidInPhase('leaveShop', state.phase)) {
      console.warn('leaveShop is not valid in phase:', state.phase);
      return;
    }

    // Start next round
    const nextRound = state.round + 1;
    const targetScore = getTargetScoreForRound(nextRound);
    const bonuses = getRoundBonuses(nextRound);

    // Apply voucher modifiers for next round
    const voucherMods = calculateVoucherModifiers(state.purchasedVouchers);

    // Reshuffle discard pile back into deck
    const allCards = shuffle([...state.deck.cards, ...state.deck.discardPile]);

    set({
      round: nextRound,
      turn: 1,
      targetScore,
      currentScore: 0,
      gold: state.gold + voucherMods.startingGoldBonus,
      deck: { cards: allCards, discardPile: [] },
      hand: [],
      selectedCards: [],
      maxJokers: state.config.maxJokers + voucherMods.maxJokersBonus,
      handsRemaining: state.config.startingHands + bonuses.handsBonus + voucherMods.handsBonus,
      discardsRemaining: state.config.startingDiscards + bonuses.discardsBonus + voucherMods.discardsBonus,
      slotSpinsRemaining: state.config.startingSlotSpins + voucherMods.slotSpinsBonus,
      shopState: null,
      slotResult: null,
      handResult: null,
      scoreCalculation: null,
      rouletteResult: null,
      triggeredSlotResults: [],
      rouletteSpinsGranted: 0,
    });

    get()._setPhase('SLOT_PHASE');
  },

  // ============================================================
  // Joker Management Actions
  // ============================================================

  removeJoker: (jokerId: string) => {
    const state = get();
    const jokerToRemove = state.jokers.find(j => j.id === jokerId);

    if (!jokerToRemove) {
      console.warn('Joker not found:', jokerId);
      return;
    }

    set({
      jokers: state.jokers.filter(j => j.id !== jokerId),
    });

    console.log('Joker removed:', jokerToRemove.name);
  },
}));

export type { GameStore };
