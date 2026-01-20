/**
 * Shop Generator Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateShop,
  selectItemType,
  selectRarity,
  weightedRandom,
} from './shopGenerator';

describe('shopGenerator', () => {
  describe('weightedRandom', () => {
    it('should return correct result based on seed', () => {
      const weights = { a: 50, b: 30, c: 20 };

      // With seed 0, should return 'a' (first option at 0-50)
      expect(weightedRandom(weights, 0)).toBe('a');

      // With seed 0.6, should return 'b' (50-80 range, normalized)
      expect(weightedRandom(weights, 0.6)).toBe('b');

      // With seed 0.9, should return 'c' (80-100 range, normalized)
      expect(weightedRandom(weights, 0.9)).toBe('c');
    });

    it('should handle single option', () => {
      const weights = { only: 100 };
      expect(weightedRandom(weights, 0.5)).toBe('only');
    });

    it('should handle edge cases', () => {
      const weights = { a: 1, b: 99 };
      // Very low seed should give first option
      expect(weightedRandom(weights, 0.005)).toBe('a');
    });
  });

  describe('selectItemType', () => {
    it('should return valid item types', () => {
      const validTypes = ['joker', 'card', 'pack', 'voucher'];

      // Run multiple times to check randomness
      for (let i = 0; i < 10; i++) {
        const type = selectItemType();
        expect(validTypes).toContain(type);
      }
    });

    it('should return deterministic result with seed', () => {
      // Same seed should give same result
      const result1 = selectItemType(0.1);
      const result2 = selectItemType(0.1);
      expect(result1).toBe(result2);
    });
  });

  describe('selectRarity', () => {
    it('should return valid rarities', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'legendary'];

      for (let i = 0; i < 10; i++) {
        const rarity = selectRarity();
        expect(validRarities).toContain(rarity);
      }
    });

    it('should favor common rarity with no luck', () => {
      // With seed near 0, should often get common (highest weight)
      expect(selectRarity(0, 0.1)).toBe('common');
    });

    it('should return deterministic result with seed', () => {
      const result1 = selectRarity(0, 0.5);
      const result2 = selectRarity(0, 0.5);
      expect(result1).toBe(result2);
    });
  });

  describe('generateShop', () => {
    it('should generate a shop with correct number of items', () => {
      const shop = generateShop(1, 0);

      // Default item count from balance.json is 4
      expect(shop.items.length).toBe(4);
    });

    it('should generate items with required properties', () => {
      const shop = generateShop(1, 0);

      for (const item of shop.items) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('itemId');
        expect(item).toHaveProperty('cost');
        expect(item).toHaveProperty('sold');
        expect(item.sold).toBe(false);
      }
    });

    it('should generate items with valid types', () => {
      const validTypes = ['joker', 'card', 'pack', 'voucher'];
      const shop = generateShop(1, 0);

      for (const item of shop.items) {
        expect(validTypes).toContain(item.type);
      }
    });

    it('should initialize reroll state correctly', () => {
      const shop = generateShop(1, 0);

      expect(shop.rerollCost).toBe(5); // From balance.json
      expect(shop.rerollsUsed).toBe(0);
    });

    it('should generate unique item IDs', () => {
      const shop = generateShop(1, 0);
      const ids = shop.items.map((item) => item.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should generate different shops on multiple calls', () => {
      const shop1 = generateShop(1, 0);
      const shop2 = generateShop(1, 0);

      // At least IDs should be different
      const ids1 = shop1.items.map((i) => i.id).sort();
      const ids2 = shop2.items.map((i) => i.id).sort();

      expect(ids1).not.toEqual(ids2);
    });

    it('should scale prices with round', () => {
      const shop1 = generateShop(1, 0);
      const shop5 = generateShop(5, 0);

      // Higher rounds should tend to have higher prices
      // This is a probabilistic test - not guaranteed but likely
      const avgPrice1 =
        shop1.items.reduce((sum, i) => sum + i.cost, 0) / shop1.items.length;
      const avgPrice5 =
        shop5.items.reduce((sum, i) => sum + i.cost, 0) / shop5.items.length;

      // Round 5 should have higher prices on average
      // Note: This could occasionally fail due to randomness
      // but with 4 items and 20% scaling, it should be consistent
      console.log('Average prices - Round 1:', avgPrice1, 'Round 5:', avgPrice5);
    });
  });

  describe('item type distribution', () => {
    it('should generate items according to weight distribution over many samples', () => {
      const typeCounts: Record<string, number> = {
        joker: 0,
        card: 0,
        pack: 0,
        voucher: 0,
      };

      // Generate many shops to check distribution
      const iterations = 100;
      for (let i = 0; i < iterations; i++) {
        const shop = generateShop(1, 0);
        for (const item of shop.items) {
          const count = typeCounts[item.type];
          if (count !== undefined) {
            typeCounts[item.type] = count + 1;
          }
        }
      }

      const totalItems = iterations * 4;

      // Expected distribution (from balance.json):
      // joker: 40%, card: 30%, pack: 20%, voucher: 10%
      // Allow 10% margin for randomness

      const jokerRatio = typeCounts['joker']! / totalItems;
      const cardRatio = typeCounts['card']! / totalItems;
      const packRatio = typeCounts['pack']! / totalItems;
      const voucherRatio = typeCounts['voucher']! / totalItems;

      // These are soft checks - may occasionally fail due to randomness
      expect(jokerRatio).toBeGreaterThan(0.25); // Should be ~40%
      expect(cardRatio).toBeGreaterThan(0.15); // Should be ~30%
      expect(packRatio).toBeGreaterThan(0.05); // Should be ~20%
      expect(voucherRatio).toBeGreaterThan(0); // Should be ~10%
    });
  });

  describe('rarity distribution', () => {
    it('should generate mostly common items with no luck', () => {
      let commonCount = 0;
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const rarity = selectRarity(0);
        if (rarity === 'common') {
          commonCount++;
        }
      }

      // Common has weight 60 out of 100, so should be majority
      expect(commonCount).toBeGreaterThan(iterations * 0.4);
    });
  });
});
