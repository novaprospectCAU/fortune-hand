/**
 * Store Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { resetGameEventEmitter, getGameEventEmitter } from './eventSystem';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      phase: 'IDLE',
      round: 0,
      turn: 0,
      targetScore: 0,
      currentScore: 0,
      gold: 100,
      deck: { cards: [], discardPile: [] },
      hand: [],
      selectedCards: [],
      slotResult: null,
      handResult: null,
      scoreCalculation: null,
      rouletteResult: null,
      jokers: [],
      maxJokers: 5,
      handsRemaining: 4,
      discardsRemaining: 3,
      shopState: null,
    });
    resetGameEventEmitter();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useGameStore.getState();
      expect(state.phase).toBe('IDLE');
      expect(state.round).toBe(0);
      expect(state.turn).toBe(0);
      expect(state.gold).toBe(100);
      expect(state.jokers).toEqual([]);
      expect(state.hand).toEqual([]);
    });
  });

  describe('startGame', () => {
    it('should initialize game state', () => {
      const { startGame } = useGameStore.getState();
      startGame();

      const state = useGameStore.getState();
      expect(state.phase).toBe('SLOT_PHASE');
      expect(state.round).toBe(1);
      expect(state.turn).toBe(1);
      expect(state.targetScore).toBe(300);
      expect(state.currentScore).toBe(0);
      expect(state.deck.cards.length).toBe(52);
    });

    it('should accept custom config', () => {
      const { startGame } = useGameStore.getState();
      startGame({ startingGold: 200, maxJokers: 10 });

      const state = useGameStore.getState();
      expect(state.gold).toBe(200);
      expect(state.maxJokers).toBe(10);
    });

    it('should emit GAME_START event', () => {
      const handler = vi.fn();
      getGameEventEmitter().on('GAME_START', handler);

      const { startGame } = useGameStore.getState();
      startGame();

      expect(handler).toHaveBeenCalled();
    });

    it('should emit PHASE_CHANGE event', () => {
      const handler = vi.fn();
      getGameEventEmitter().on('PHASE_CHANGE', handler);

      const { startGame } = useGameStore.getState();
      startGame();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PHASE_CHANGE',
          from: 'IDLE',
          to: 'SLOT_PHASE',
        })
      );
    });
  });

  describe('spinSlot', () => {
    beforeEach(() => {
      const { startGame } = useGameStore.getState();
      startGame();
    });

    it('should spin slot and advance to play phase', () => {
      const { spinSlot } = useGameStore.getState();
      spinSlot();

      const state = useGameStore.getState();
      expect(state.slotResult).not.toBeNull();
      expect(state.phase).toBe('PLAY_PHASE');
      expect(state.hand.length).toBeGreaterThan(0);
    });

    it('should emit SLOT_SPIN event', () => {
      const handler = vi.fn();
      getGameEventEmitter().on('SLOT_SPIN', handler);

      const { spinSlot } = useGameStore.getState();
      spinSlot();

      expect(handler).toHaveBeenCalled();
    });

    it('should not spin in wrong phase', () => {
      // Manually set phase to PLAY_PHASE
      useGameStore.setState({ phase: 'PLAY_PHASE' });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { spinSlot } = useGameStore.getState();
      spinSlot();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Card Selection', () => {
    beforeEach(() => {
      const { startGame, spinSlot } = useGameStore.getState();
      startGame();
      spinSlot();
    });

    it('should select a card from hand', () => {
      const state = useGameStore.getState();
      const cardToSelect = state.hand[0];

      if (cardToSelect) {
        state.selectCard(cardToSelect.id);
        const newState = useGameStore.getState();
        expect(newState.selectedCards).toContainEqual(cardToSelect);
      }
    });

    it('should deselect a card', () => {
      const state = useGameStore.getState();
      const cardToSelect = state.hand[0];

      if (cardToSelect) {
        state.selectCard(cardToSelect.id);
        state.deselectCard(cardToSelect.id);
        const newState = useGameStore.getState();
        expect(newState.selectedCards).not.toContainEqual(cardToSelect);
      }
    });

    it('should not select more than max cards', () => {
      const state = useGameStore.getState();

      // Select max cards (5)
      for (let i = 0; i < 6 && i < state.hand.length; i++) {
        state.selectCard(state.hand[i]!.id);
      }

      const newState = useGameStore.getState();
      expect(newState.selectedCards.length).toBeLessThanOrEqual(5);
    });

    it('should not select card not in hand', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { selectCard } = useGameStore.getState();
      selectCard('non_existent_card');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('playHand', () => {
    beforeEach(() => {
      const { startGame, spinSlot } = useGameStore.getState();
      startGame();
      spinSlot();
    });

    it('should play selected cards', () => {
      const state = useGameStore.getState();
      const cardsToSelect = state.hand.slice(0, 2);

      for (const card of cardsToSelect) {
        state.selectCard(card.id);
      }

      state.playHand();

      const newState = useGameStore.getState();
      expect(newState.handResult).not.toBeNull();
      expect(newState.phase).toBe('ROULETTE_PHASE');
    });

    it('should not play with no cards selected', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { playHand } = useGameStore.getState();
      playHand();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should emit CARDS_PLAYED event', () => {
      const handler = vi.fn();
      getGameEventEmitter().on('CARDS_PLAYED', handler);

      const state = useGameStore.getState();
      const cardToSelect = state.hand[0];
      if (cardToSelect) {
        state.selectCard(cardToSelect.id);
        state.playHand();
      }

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('discardSelected', () => {
    beforeEach(() => {
      const { startGame, spinSlot } = useGameStore.getState();
      startGame();
      spinSlot();
    });

    it('should discard selected cards and draw new ones', () => {
      const state = useGameStore.getState();
      const initialHandSize = state.hand.length;
      const cardToDiscard = state.hand[0];

      if (cardToDiscard) {
        state.selectCard(cardToDiscard.id);
        state.discardSelected();

        const newState = useGameStore.getState();
        expect(newState.hand.length).toBe(initialHandSize);
        expect(newState.hand).not.toContainEqual(cardToDiscard);
        expect(newState.discardsRemaining).toBe(state.discardsRemaining - 1);
      }
    });

    it('should emit CARDS_DISCARDED event', () => {
      const handler = vi.fn();
      getGameEventEmitter().on('CARDS_DISCARDED', handler);

      const state = useGameStore.getState();
      const cardToDiscard = state.hand[0];
      if (cardToDiscard) {
        state.selectCard(cardToDiscard.id);
        state.discardSelected();
      }

      expect(handler).toHaveBeenCalled();
    });

    it('should not discard when no discards remaining', () => {
      useGameStore.setState({ discardsRemaining: 0 });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const state = useGameStore.getState();
      const cardToDiscard = state.hand[0];
      if (cardToDiscard) {
        state.selectCard(cardToDiscard.id);
        state.discardSelected();
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Roulette Actions', () => {
    beforeEach(() => {
      const { startGame, spinSlot, selectCard, playHand } = useGameStore.getState();
      startGame();
      spinSlot();

      const state = useGameStore.getState();
      if (state.hand[0]) {
        selectCard(state.hand[0].id);
        playHand();
      }
    });

    it('should spin roulette and advance through reward phase', () => {
      const state = useGameStore.getState();
      expect(state.phase).toBe('ROULETTE_PHASE');

      // Track the score before and after
      const scoreBefore = state.currentScore;

      state.spinRoulette();

      // After spinRoulette, the game processes REWARD_PHASE and moves to next turn
      const newState = useGameStore.getState();
      // The score should have increased (roulette multiplied the score)
      expect(newState.currentScore).toBeGreaterThanOrEqual(scoreBefore);
      // Should be in next turn's slot phase or later phases
      expect(['SLOT_PHASE', 'SHOP_PHASE', 'GAME_OVER']).toContain(newState.phase);
    });

    it('should skip roulette and advance through reward phase', () => {
      const initialState = useGameStore.getState();
      const scoreBefore = initialState.currentScore;

      const { skipRoulette } = useGameStore.getState();
      skipRoulette();

      // After skipRoulette, the game processes REWARD_PHASE and moves to next turn
      const state = useGameStore.getState();
      // The score should have increased by the hand score (multiplier 1x when skipped)
      expect(state.currentScore).toBeGreaterThanOrEqual(scoreBefore);
      expect(['SLOT_PHASE', 'SHOP_PHASE', 'GAME_OVER']).toContain(state.phase);
    });

    it('should emit ROULETTE_SPIN event on spin', () => {
      const handler = vi.fn();
      getGameEventEmitter().on('ROULETTE_SPIN', handler);

      const { spinRoulette } = useGameStore.getState();
      spinRoulette();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Shop Actions', () => {
    beforeEach(() => {
      // Set up shop phase
      useGameStore.setState({
        phase: 'SHOP_PHASE',
        round: 1,
        gold: 100,
        shopState: {
          items: [
            { id: 'item1', type: 'joker', itemId: 'joker_1', cost: 50, sold: false },
            { id: 'item2', type: 'card', itemId: 'card_1', cost: 30, sold: false },
          ],
          rerollCost: 5,
          rerollsUsed: 0,
        },
      });
    });

    it('should buy an item', () => {
      const { buyItem } = useGameStore.getState();
      buyItem('item1');

      const state = useGameStore.getState();
      expect(state.gold).toBe(50);
      expect(state.shopState?.items.find(i => i.id === 'item1')?.sold).toBe(true);
    });

    it('should emit ITEM_BOUGHT event', () => {
      const handler = vi.fn();
      getGameEventEmitter().on('ITEM_BOUGHT', handler);

      const { buyItem } = useGameStore.getState();
      buyItem('item1');

      expect(handler).toHaveBeenCalled();
    });

    it('should not buy item if not enough gold', () => {
      useGameStore.setState({ gold: 20 });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { buyItem } = useGameStore.getState();
      buyItem('item1');

      const state = useGameStore.getState();
      expect(state.gold).toBe(20);
      expect(state.shopState?.items.find(i => i.id === 'item1')?.sold).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reroll shop', () => {
      const { rerollShop } = useGameStore.getState();
      const initialGold = useGameStore.getState().gold;
      rerollShop();

      const state = useGameStore.getState();
      expect(state.gold).toBe(initialGold - 5);
      expect(state.shopState?.rerollsUsed).toBe(1);
    });

    it('should leave shop and start next round', () => {
      const { leaveShop } = useGameStore.getState();
      leaveShop();

      const state = useGameStore.getState();
      expect(state.phase).toBe('SLOT_PHASE');
      expect(state.round).toBe(2);
      expect(state.turn).toBe(1);
      expect(state.currentScore).toBe(0);
    });
  });

  describe('Full Game Flow', () => {
    it('should complete a full turn cycle', () => {
      const store = useGameStore.getState();

      // Start game
      store.startGame();
      expect(useGameStore.getState().phase).toBe('SLOT_PHASE');

      // Spin slot (auto-advances to PLAY_PHASE)
      store.spinSlot();
      expect(useGameStore.getState().phase).toBe('PLAY_PHASE');

      // Select and play cards
      const state = useGameStore.getState();
      if (state.hand[0]) {
        state.selectCard(state.hand[0].id);
        state.playHand();
      }
      expect(useGameStore.getState().phase).toBe('ROULETTE_PHASE');

      // Skip roulette
      useGameStore.getState().skipRoulette();

      // Check reward phase processed and back to slot phase
      const finalState = useGameStore.getState();
      expect(['SLOT_PHASE', 'SHOP_PHASE', 'GAME_OVER']).toContain(finalState.phase);
    });

    it('should handle round completion', () => {
      const store = useGameStore.getState();
      store.startGame();

      // Set score high enough to complete round
      useGameStore.setState({
        currentScore: 500,
        targetScore: 300,
        handsRemaining: 0,
        phase: 'REWARD_PHASE',
        scoreCalculation: {
          handResult: {
            handType: 'high_card',
            rank: 10,
            scoringCards: [],
            baseChips: 5,
            baseMult: 1,
          },
          chipTotal: 5,
          multTotal: 1,
          appliedBonuses: [],
          finalScore: 5,
        },
        rouletteResult: {
          segment: { id: 'one', multiplier: 1, probability: 100, color: '#888' },
          finalScore: 5,
          wasSkipped: true,
        },
        selectedCards: [],
      });

      store.nextPhase();

      const state = useGameStore.getState();
      expect(state.phase).toBe('SHOP_PHASE');
    });

    it('should handle game over', () => {
      const store = useGameStore.getState();
      store.startGame();

      // Set score low and no hands remaining
      useGameStore.setState({
        currentScore: 100,
        targetScore: 300,
        handsRemaining: 0,
        phase: 'REWARD_PHASE',
        scoreCalculation: {
          handResult: {
            handType: 'high_card',
            rank: 10,
            scoringCards: [],
            baseChips: 5,
            baseMult: 1,
          },
          chipTotal: 5,
          multTotal: 1,
          appliedBonuses: [],
          finalScore: 5,
        },
        rouletteResult: {
          segment: { id: 'one', multiplier: 1, probability: 100, color: '#888' },
          finalScore: 5,
          wasSkipped: true,
        },
        selectedCards: [],
      });

      const handler = vi.fn();
      getGameEventEmitter().on('GAME_OVER', handler);

      store.nextPhase();

      const state = useGameStore.getState();
      expect(state.phase).toBe('GAME_OVER');
      expect(handler).toHaveBeenCalled();
    });
  });
});
