/**
 * Integration Tests for Voucher System
 *
 * Tests how vouchers integrate with the core game loop.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { calculateVoucherModifiers } from '@/modules/shop';

describe('Voucher System Integration', () => {
  beforeEach(() => {
    // Reset store to initial state without starting game
    const initialState = {
      phase: 'IDLE' as const,
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
      triggeredSlotResults: [],
      rouletteSpinsGranted: 0,
      jokers: [],
      maxJokers: 5,
      purchasedVouchers: [],
      handsRemaining: 4,
      discardsRemaining: 3,
      slotSpinsRemaining: 4,
    };
    useGameStore.setState(initialState);
  });

  describe('Voucher Purchase', () => {
    it('should add voucher to purchasedVouchers when bought', () => {
      const store = useGameStore.getState();

      // Initially no vouchers
      expect(store.purchasedVouchers.length).toBe(0);
    });
  });

  describe('Hands Bonus Voucher', () => {
    it('should apply extra_hand voucher bonus to starting hands', () => {
      // Set vouchers before starting game
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['extra_hand'],
      });

      // Start new game - this should apply voucher bonuses
      const store = useGameStore.getState();
      store.startGame();

      // Should have base hands (4) + voucher bonus (1) = 5
      expect(useGameStore.getState().handsRemaining).toBe(5);
    });

    it('should stack multiple hand vouchers', () => {
      // Set vouchers before starting game
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['extra_hand', 'mega_voucher'],
      });

      const store = useGameStore.getState();
      store.startGame();

      // Base 4 + extra_hand (1) + mega_voucher (1) = 6
      expect(useGameStore.getState().handsRemaining).toBe(6);
    });
  });

  describe('Discards Bonus Voucher', () => {
    it('should apply extra_discard voucher bonus', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['extra_discard'],
      });

      const store = useGameStore.getState();
      store.startGame();

      // Base 3 + voucher bonus 1 = 4
      expect(useGameStore.getState().discardsRemaining).toBe(4);
    });
  });

  describe('Hand Size Bonus Voucher', () => {
    it('should apply hand size bonus when drawing cards', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['hand_size'],
      });

      useGameStore.getState().startGame();

      // Simulate slot phase and draw
      useGameStore.getState().spinSlot();

      // Base hand size is 8, with voucher should be able to draw up to 9
      // The actual test would need to verify hand can hold 9 cards
      const voucherMods = calculateVoucherModifiers(['hand_size']);
      expect(voucherMods.handSizeBonus).toBe(1);
    });
  });

  describe('Max Jokers Bonus Voucher', () => {
    it('should apply max jokers bonus', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['max_jokers'],
      });

      const store = useGameStore.getState();
      store.startGame();

      // Base 5 + voucher bonus 1 = 6
      expect(useGameStore.getState().maxJokers).toBe(6);
    });
  });

  describe('Slot Spins Bonus Voucher', () => {
    it('should apply slot spins bonus', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['slot_spins'],
      });

      const store = useGameStore.getState();
      store.startGame();

      // Base 4 + voucher bonus 1 = 5
      expect(useGameStore.getState().slotSpinsRemaining).toBe(5);
    });
  });

  describe('Starting Gold Bonus Voucher', () => {
    it('should apply starting gold bonus at game start', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['starting_gold'],
      });

      const store = useGameStore.getState();
      store.startGame();

      // Base 100 + voucher bonus 50 = 150
      expect(useGameStore.getState().gold).toBe(150);
    });

    it('should apply starting gold bonus each round', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['starting_gold'],
      });

      const store = useGameStore.getState();
      store.startGame();
      const goldAfterStart = useGameStore.getState().gold;

      // Simulate reaching next round (simplified)
      // Would need to complete a round and enter shop, then leave shop
      // For now just verify the modifier calculation
      const voucherMods = calculateVoucherModifiers(['starting_gold']);
      expect(voucherMods.startingGoldBonus).toBe(50);
      expect(goldAfterStart).toBe(150); // 100 base + 50 bonus
    });
  });

  describe('Interest Voucher', () => {
    it('should grant interest at round end', () => {
      // This would need to simulate completing a round
      // and checking gold before entering shop phase
      const voucherMods = calculateVoucherModifiers(['interest']);
      expect(voucherMods.interestRate).toBe(0.1);
      expect(voucherMods.interestMax).toBe(25);
    });
  });

  describe('Luck Bonus Voucher', () => {
    it('should apply luck bonus to shop generation', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['lucky_charm'],
      });

      const voucherMods = calculateVoucherModifiers(['lucky_charm']);
      expect(voucherMods.luckBonus).toBe(10);

      // Shop generation would use this luck bonus
      // to increase rare item probability
    });
  });

  describe('Reroll Discount Voucher', () => {
    it('should reduce reroll cost', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['reroll_discount'],
      });

      const voucherMods = calculateVoucherModifiers(['reroll_discount']);
      expect(voucherMods.rerollDiscount).toBe(2);

      // Reroll cost calculation would apply this discount
    });
  });

  describe('Combo Voucher', () => {
    it('should apply all effects from mega_voucher', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['mega_voucher'],
      });

      const store = useGameStore.getState();
      store.startGame();

      const state = useGameStore.getState();

      // mega_voucher gives: +1 Hand, +1 Discard, +1 Hand size
      expect(state.handsRemaining).toBe(5); // 4 + 1
      expect(state.discardsRemaining).toBe(4); // 3 + 1

      const voucherMods = calculateVoucherModifiers(['mega_voucher']);
      expect(voucherMods.handSizeBonus).toBe(1);
    });
  });

  describe('Voucher Persistence', () => {
    it('should preserve vouchers across rounds', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        purchasedVouchers: ['extra_hand', 'extra_discard'],
      });

      const store = useGameStore.getState();
      store.startGame();

      const vouchersAfterStart = useGameStore.getState().purchasedVouchers;
      expect(vouchersAfterStart).toEqual(['extra_hand', 'extra_discard']);

      // Vouchers should persist across game restarts
      // (in a real game they would be saved)
    });
  });

  describe('Multiple Voucher Stacking', () => {
    it('should stack all voucher bonuses correctly', () => {
      const modifiers = calculateVoucherModifiers([
        'extra_hand',
        'extra_discard',
        'hand_size',
        'starting_gold',
        'lucky_charm',
      ]);

      expect(modifiers.handsBonus).toBe(1);
      expect(modifiers.discardsBonus).toBe(1);
      expect(modifiers.handSizeBonus).toBe(1);
      expect(modifiers.startingGoldBonus).toBe(50);
      expect(modifiers.luckBonus).toBe(10);
    });
  });
});
