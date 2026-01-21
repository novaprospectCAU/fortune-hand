/**
 * Integration tests for special card triggers in the game store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import type { Card } from '@/types/interfaces';

describe('Special Card Triggers Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    const store = useGameStore.getState();
    store.startGame();
  });

  describe('Slot Trigger Cards', () => {
    it('should trigger mini slot spins when Lucky Seven is played', () => {
      const store = useGameStore.getState();

      // Create a hand with a slot trigger card
      const slotTriggerCard: Card = {
        id: 'slot_seven',
        suit: 'hearts',
        rank: '7',
        triggerSlot: true,
      };

      const normalCard: Card = {
        id: 'normal_1',
        suit: 'diamonds',
        rank: '5',
      };

      // Manually set up game state for testing
      store.startGame();
      store.spinSlot(); // Complete slot phase

      // Set hand and select cards
      useGameStore.setState({
        hand: [slotTriggerCard, normalCard],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(slotTriggerCard.id);
      store.selectCard(normalCard.id);

      const beforePlayState = useGameStore.getState();
      expect(beforePlayState.selectedCards).toHaveLength(2);

      // Play the hand - this should trigger the slot
      store.playHand();

      const afterPlayState = useGameStore.getState();

      // Should have triggered slot results
      expect(afterPlayState.triggeredSlotResults).toBeDefined();
      expect(afterPlayState.triggeredSlotResults.length).toBeGreaterThan(0);

      // Should have a slot result (either original or merged with triggered)
      expect(afterPlayState.slotResult).not.toBeNull();
    });

    it('should trigger multiple mini slots for multiple trigger cards', () => {
      const store = useGameStore.getState();

      const slotCard1: Card = {
        id: 'slot_seven_1',
        suit: 'hearts',
        rank: '7',
        triggerSlot: true,
      };

      const slotCard2: Card = {
        id: 'slot_seven_2',
        suit: 'diamonds',
        rank: '7',
        triggerSlot: true,
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [slotCard1, slotCard2],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(slotCard1.id);
      store.selectCard(slotCard2.id);
      store.playHand();

      const state = useGameStore.getState();

      // Should have 2 triggered slot results
      expect(state.triggeredSlotResults).toHaveLength(2);
    });

    it('should not trigger slots for normal cards', () => {
      const store = useGameStore.getState();

      const normalCard1: Card = {
        id: 'normal_1',
        suit: 'hearts',
        rank: '5',
      };

      const normalCard2: Card = {
        id: 'normal_2',
        suit: 'diamonds',
        rank: 'K',
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [normalCard1, normalCard2],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(normalCard1.id);
      store.selectCard(normalCard2.id);
      store.playHand();

      const state = useGameStore.getState();

      // Should have no triggered slot results
      expect(state.triggeredSlotResults).toHaveLength(0);
    });
  });

  describe('Roulette Trigger Cards', () => {
    it('should grant extra roulette spins when Gambler\'s King is played', () => {
      const store = useGameStore.getState();

      const rouletteTriggerCard: Card = {
        id: 'roulette_king',
        suit: 'diamonds',
        rank: 'K',
        triggerRoulette: true,
      };

      const normalCard: Card = {
        id: 'normal_1',
        suit: 'hearts',
        rank: '5',
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [rouletteTriggerCard, normalCard],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(rouletteTriggerCard.id);
      store.selectCard(normalCard.id);

      const beforePlayState = useGameStore.getState();
      expect(beforePlayState.rouletteSpinsGranted).toBe(0);

      store.playHand();

      const afterPlayState = useGameStore.getState();

      // Should have granted 1 roulette spin
      expect(afterPlayState.rouletteSpinsGranted).toBe(1);
    });

    it('should grant multiple roulette spins for multiple trigger cards', () => {
      const store = useGameStore.getState();

      const rouletteCard1: Card = {
        id: 'roulette_king_1',
        suit: 'diamonds',
        rank: 'K',
        triggerRoulette: true,
      };

      const rouletteCard2: Card = {
        id: 'roulette_king_2',
        suit: 'hearts',
        rank: 'K',
        triggerRoulette: true,
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [rouletteCard1, rouletteCard2],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(rouletteCard1.id);
      store.selectCard(rouletteCard2.id);
      store.playHand();

      const state = useGameStore.getState();

      // Should have granted 2 roulette spins
      expect(state.rouletteSpinsGranted).toBe(2);
    });

    it('should not grant spins for normal cards', () => {
      const store = useGameStore.getState();

      const normalCard1: Card = {
        id: 'normal_1',
        suit: 'hearts',
        rank: '5',
      };

      const normalCard2: Card = {
        id: 'normal_2',
        suit: 'clubs',
        rank: 'Q',
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [normalCard1, normalCard2],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(normalCard1.id);
      store.selectCard(normalCard2.id);
      store.playHand();

      const state = useGameStore.getState();

      // Should have no granted spins
      expect(state.rouletteSpinsGranted).toBe(0);
    });
  });

  describe('Combined Triggers', () => {
    it('should handle card with both triggers', () => {
      const store = useGameStore.getState();

      const dualTriggerCard: Card = {
        id: 'dual_trigger',
        suit: 'spades',
        rank: 'A',
        triggerSlot: true,
        triggerRoulette: true,
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [dualTriggerCard],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(dualTriggerCard.id);
      store.playHand();

      const state = useGameStore.getState();

      // Should trigger both effects
      expect(state.triggeredSlotResults.length).toBeGreaterThan(0);
      expect(state.rouletteSpinsGranted).toBe(1);
    });

    it('should handle mix of slot and roulette trigger cards', () => {
      const store = useGameStore.getState();

      const slotCard: Card = {
        id: 'slot_seven',
        suit: 'hearts',
        rank: '7',
        triggerSlot: true,
      };

      const rouletteCard: Card = {
        id: 'roulette_king',
        suit: 'diamonds',
        rank: 'K',
        triggerRoulette: true,
      };

      const normalCard: Card = {
        id: 'normal_1',
        suit: 'clubs',
        rank: '5',
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [slotCard, rouletteCard, normalCard],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(slotCard.id);
      store.selectCard(rouletteCard.id);
      store.selectCard(normalCard.id);
      store.playHand();

      const state = useGameStore.getState();

      // Should trigger both types
      expect(state.triggeredSlotResults).toHaveLength(1);
      expect(state.rouletteSpinsGranted).toBe(1);
    });
  });

  describe('State Cleanup', () => {
    it('should reset trigger state at turn reset', () => {
      const store = useGameStore.getState();

      const slotCard: Card = {
        id: 'slot_seven',
        suit: 'hearts',
        rank: '7',
        triggerSlot: true,
      };

      store.startGame();
      store.spinSlot();

      useGameStore.setState({
        hand: [slotCard],
        phase: 'PLAY_PHASE',
      });

      store.selectCard(slotCard.id);
      store.playHand();

      // Verify triggers were set
      let state = useGameStore.getState();
      expect(state.triggeredSlotResults.length).toBeGreaterThan(0);

      // Reset turn state
      store._resetTurnState();

      // Verify triggers were cleared
      state = useGameStore.getState();
      expect(state.triggeredSlotResults).toHaveLength(0);
      expect(state.rouletteSpinsGranted).toBe(0);
    });

    it('should reset trigger state when starting new round', () => {
      const store = useGameStore.getState();

      store.startGame();

      // Manually set some trigger state
      useGameStore.setState({
        triggeredSlotResults: [
          {
            symbols: ['card', 'card', 'card'],
            isJackpot: false,
            effects: {
              cardBonus: { extraDraw: 1, handSize: 0, scoreMultiplier: 1 },
              rouletteBonus: { safeZoneBonus: 0, maxMultiplier: 0, freeSpins: 0 },
              instant: { gold: 0, chips: 0 },
              penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
            },
          },
        ],
        rouletteSpinsGranted: 2,
        phase: 'SHOP_PHASE',
      });

      // Start new round
      store.leaveShop();

      const state = useGameStore.getState();
      expect(state.triggeredSlotResults).toHaveLength(0);
      expect(state.rouletteSpinsGranted).toBe(0);
    });
  });
});
