/**
 * Tests for Vouchers Module
 */

import { describe, it, expect } from 'vitest';
import {
  getVoucherById,
  getAllVouchers,
  getVouchersByRarity,
  calculateVoucherModifiers,
  calculateInterest,
  isVoucherPurchased,
} from './vouchers';

describe('Vouchers Module', () => {
  describe('getVoucherById', () => {
    it('should return voucher when ID exists', () => {
      const voucher = getVoucherById('extra_hand');
      expect(voucher).toBeDefined();
      expect(voucher?.id).toBe('extra_hand');
      expect(voucher?.name).toBe('Extra Hand');
    });

    it('should return undefined when ID does not exist', () => {
      const voucher = getVoucherById('nonexistent_voucher');
      expect(voucher).toBeUndefined();
    });
  });

  describe('getAllVouchers', () => {
    it('should return all vouchers', () => {
      const vouchers = getAllVouchers();
      expect(vouchers.length).toBeGreaterThan(0);
      expect(vouchers.every((v) => v.id && v.name && v.effect)).toBe(true);
    });
  });

  describe('getVouchersByRarity', () => {
    it('should filter common vouchers', () => {
      const commonVouchers = getVouchersByRarity('common');
      expect(commonVouchers.every((v) => v.rarity === 'common')).toBe(true);
    });

    it('should filter rare vouchers', () => {
      const rareVouchers = getVouchersByRarity('rare');
      expect(rareVouchers.every((v) => v.rarity === 'rare')).toBe(true);
      expect(rareVouchers.length).toBeGreaterThan(0);
    });

    it('should filter legendary vouchers', () => {
      const legendaryVouchers = getVouchersByRarity('legendary');
      expect(legendaryVouchers.every((v) => v.rarity === 'legendary')).toBe(true);
    });
  });

  describe('calculateVoucherModifiers', () => {
    it('should return zero modifiers for empty array', () => {
      const modifiers = calculateVoucherModifiers([]);
      expect(modifiers.handsBonus).toBe(0);
      expect(modifiers.discardsBonus).toBe(0);
      expect(modifiers.handSizeBonus).toBe(0);
      expect(modifiers.luckBonus).toBe(0);
    });

    it('should calculate hands bonus correctly', () => {
      const modifiers = calculateVoucherModifiers(['extra_hand']);
      expect(modifiers.handsBonus).toBe(1);
    });

    it('should calculate discards bonus correctly', () => {
      const modifiers = calculateVoucherModifiers(['extra_discard']);
      expect(modifiers.discardsBonus).toBe(1);
    });

    it('should calculate hand size bonus correctly', () => {
      const modifiers = calculateVoucherModifiers(['hand_size']);
      expect(modifiers.handSizeBonus).toBe(1);
    });

    it('should calculate reroll discount correctly', () => {
      const modifiers = calculateVoucherModifiers(['reroll_discount']);
      expect(modifiers.rerollDiscount).toBe(2);
    });

    it('should calculate luck bonus correctly', () => {
      const modifiers = calculateVoucherModifiers(['lucky_charm']);
      expect(modifiers.luckBonus).toBe(10);
    });

    it('should calculate interest correctly', () => {
      const modifiers = calculateVoucherModifiers(['interest']);
      expect(modifiers.interestRate).toBe(0.1);
      expect(modifiers.interestMax).toBe(25);
    });

    it('should calculate max jokers bonus correctly', () => {
      const modifiers = calculateVoucherModifiers(['max_jokers']);
      expect(modifiers.maxJokersBonus).toBe(1);
    });

    it('should calculate slot spins bonus correctly', () => {
      const modifiers = calculateVoucherModifiers(['slot_spins']);
      expect(modifiers.slotSpinsBonus).toBe(1);
    });

    it('should calculate starting gold bonus correctly', () => {
      const modifiers = calculateVoucherModifiers(['starting_gold']);
      expect(modifiers.startingGoldBonus).toBe(50);
    });

    it('should stack multiple vouchers correctly', () => {
      const modifiers = calculateVoucherModifiers(['extra_hand', 'extra_discard', 'hand_size']);
      expect(modifiers.handsBonus).toBe(1);
      expect(modifiers.discardsBonus).toBe(1);
      expect(modifiers.handSizeBonus).toBe(1);
    });

    it('should handle combo vouchers correctly', () => {
      const modifiers = calculateVoucherModifiers(['mega_voucher']);
      // mega_voucher gives +1 Hand, +1 Discard, +1 Hand size
      expect(modifiers.handsBonus).toBe(1);
      expect(modifiers.discardsBonus).toBe(1);
      expect(modifiers.handSizeBonus).toBe(1);
    });

    it('should ignore invalid voucher IDs', () => {
      const modifiers = calculateVoucherModifiers(['nonexistent', 'extra_hand']);
      expect(modifiers.handsBonus).toBe(1);
    });

    it('should handle duplicate voucher IDs (stacking)', () => {
      const modifiers = calculateVoucherModifiers(['extra_hand', 'extra_hand']);
      // In the current implementation, duplicates would stack
      expect(modifiers.handsBonus).toBe(2);
    });
  });

  describe('calculateInterest', () => {
    it('should return 0 when no interest voucher', () => {
      const modifiers = calculateVoucherModifiers([]);
      const interest = calculateInterest(100, modifiers);
      expect(interest).toBe(0);
    });

    it('should calculate interest correctly', () => {
      const modifiers = calculateVoucherModifiers(['interest']);
      const interest = calculateInterest(100, modifiers);
      expect(interest).toBe(10); // 10% of 100
    });

    it('should cap interest at max value', () => {
      const modifiers = calculateVoucherModifiers(['interest']);
      const interest = calculateInterest(500, modifiers);
      expect(interest).toBe(25); // Capped at 25
    });

    it('should floor interest value', () => {
      const modifiers = calculateVoucherModifiers(['interest']);
      const interest = calculateInterest(24, modifiers);
      expect(interest).toBe(2); // 10% of 24 = 2.4, floored to 2
    });

    it('should return 0 for zero gold', () => {
      const modifiers = calculateVoucherModifiers(['interest']);
      const interest = calculateInterest(0, modifiers);
      expect(interest).toBe(0);
    });
  });

  describe('isVoucherPurchased', () => {
    it('should return true for purchased voucher', () => {
      const purchased = ['extra_hand', 'extra_discard'];
      expect(isVoucherPurchased('extra_hand', purchased)).toBe(true);
    });

    it('should return false for non-purchased voucher', () => {
      const purchased = ['extra_hand', 'extra_discard'];
      expect(isVoucherPurchased('hand_size', purchased)).toBe(false);
    });

    it('should return false for empty purchased list', () => {
      expect(isVoucherPurchased('extra_hand', [])).toBe(false);
    });
  });

  describe('Voucher Data Integrity', () => {
    it('should have unique voucher IDs', () => {
      const vouchers = getAllVouchers();
      const ids = vouchers.map((v) => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid costs', () => {
      const vouchers = getAllVouchers();
      expect(vouchers.every((v) => v.cost > 0)).toBe(true);
    });

    it('should have valid rarities', () => {
      const vouchers = getAllVouchers();
      const validRarities = ['common', 'uncommon', 'rare', 'legendary'];
      expect(vouchers.every((v) => validRarities.includes(v.rarity))).toBe(true);
    });

    it('should have non-empty descriptions', () => {
      const vouchers = getAllVouchers();
      expect(vouchers.every((v) => v.description.length > 0)).toBe(true);
    });
  });
});
