/**
 * Pricing Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePrice,
  calculatePriceWithRoundScaling,
  getBasePrice,
  BASE_PRICES,
  RARITY_MULTIPLIERS,
} from './pricing';

describe('pricing', () => {
  describe('calculatePrice', () => {
    it('should calculate price for common rarity without multiplier', () => {
      const basePrice = 40;
      const result = calculatePrice(basePrice, 'common');
      expect(result).toBe(40); // 40 * 1 = 40
    });

    it('should calculate price for uncommon rarity with 1.3x multiplier', () => {
      const basePrice = 40;
      const result = calculatePrice(basePrice, 'uncommon');
      expect(result).toBe(52); // 40 * 1.3 = 52
    });

    it('should calculate price for rare rarity with 1.8x multiplier', () => {
      const basePrice = 40;
      const result = calculatePrice(basePrice, 'rare');
      expect(result).toBe(72); // 40 * 1.8 = 72
    });

    it('should calculate price for legendary rarity with 3x multiplier', () => {
      const basePrice = 40;
      const result = calculatePrice(basePrice, 'legendary');
      expect(result).toBe(120); // 40 * 3 = 120
    });

    it('should round prices to nearest integer', () => {
      const basePrice = 33;
      const result = calculatePrice(basePrice, 'uncommon');
      expect(result).toBe(43); // 33 * 1.3 = 42.9 -> 43
    });
  });

  describe('calculatePriceWithRoundScaling', () => {
    it('should not scale price at round 1', () => {
      const result = calculatePriceWithRoundScaling(40, 'common', 1);
      expect(result).toBe(40);
    });

    it('should increase price by 5% per round after round 1', () => {
      const result = calculatePriceWithRoundScaling(100, 'common', 2);
      expect(result).toBe(105); // 100 * 1.05 = 105
    });

    it('should increase price by 20% at round 5', () => {
      const result = calculatePriceWithRoundScaling(100, 'common', 5);
      expect(result).toBe(120); // 100 * 1.20 = 120
    });

    it('should cap round scaling at 50%', () => {
      const result = calculatePriceWithRoundScaling(100, 'common', 20);
      expect(result).toBe(150); // 100 * 1.50 = 150 (max cap)
    });

    it('should apply both rarity and round scaling', () => {
      const result = calculatePriceWithRoundScaling(40, 'rare', 3);
      // 40 * 1.8 (rare) = 72, 72 * 1.10 (round 3) = 79.2 -> 79
      expect(result).toBe(79);
    });
  });

  describe('getBasePrice', () => {
    it('should return correct base price for joker', () => {
      expect(getBasePrice('joker')).toBe(BASE_PRICES.joker);
    });

    it('should return correct base price for card', () => {
      expect(getBasePrice('card')).toBe(BASE_PRICES.card);
    });

    it('should return correct base price for pack', () => {
      expect(getBasePrice('pack')).toBe(BASE_PRICES.pack);
    });

    it('should return correct base price for voucher', () => {
      expect(getBasePrice('voucher')).toBe(BASE_PRICES.voucher);
    });

    it('should return default price for unknown item type', () => {
      expect(getBasePrice('unknown')).toBe(30);
    });
  });

  describe('RARITY_MULTIPLIERS', () => {
    it('should have correct multiplier values', () => {
      expect(RARITY_MULTIPLIERS.common).toBe(1);
      expect(RARITY_MULTIPLIERS.uncommon).toBe(1.3);
      expect(RARITY_MULTIPLIERS.rare).toBe(1.8);
      expect(RARITY_MULTIPLIERS.legendary).toBe(3);
    });
  });
});
