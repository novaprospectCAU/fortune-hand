/**
 * Transactions Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  buyItem,
  reroll,
  markItemAsSold,
  calculateRerollCost,
  canAffordItem,
  canAffordReroll,
} from './transactions';
import type { ShopState, ShopItem } from '@/types/interfaces';

// Helper to create a test shop item
function createTestItem(overrides: Partial<ShopItem> = {}): ShopItem {
  return {
    id: 'test-item-1',
    type: 'joker',
    itemId: 'lucky_seven',
    cost: 40,
    sold: false,
    ...overrides,
  };
}

// Helper to create a test shop state
function createTestShopState(overrides: Partial<ShopState> = {}): ShopState {
  return {
    items: [
      createTestItem({ id: 'item-1', cost: 40 }),
      createTestItem({ id: 'item-2', cost: 60, type: 'card' }),
      createTestItem({ id: 'item-3', cost: 100, type: 'pack' }),
      createTestItem({ id: 'item-4', cost: 50, type: 'voucher', sold: true }),
    ],
    rerollCost: 5,
    rerollsUsed: 0,
    ...overrides,
  };
}

describe('transactions', () => {
  describe('buyItem', () => {
    it('should successfully buy an item when player has enough gold', () => {
      const shopState = createTestShopState();
      const result = buyItem(shopState, 'item-1', 100);

      expect(result.success).toBe(true);
      expect(result.newGold).toBe(60); // 100 - 40
      expect(result.item).toBeDefined();
      expect(result.item?.id).toBe('item-1');
    });

    it('should fail when item is not found', () => {
      const shopState = createTestShopState();
      const result = buyItem(shopState, 'nonexistent', 100);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found');
      expect(result.newGold).toBe(100);
    });

    it('should fail when item is already sold', () => {
      const shopState = createTestShopState();
      const result = buyItem(shopState, 'item-4', 100);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already sold');
      expect(result.newGold).toBe(100);
    });

    it('should fail when player does not have enough gold', () => {
      const shopState = createTestShopState();
      const result = buyItem(shopState, 'item-3', 50); // item costs 100

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not enough gold');
      expect(result.newGold).toBe(50);
    });

    it('should handle exact gold amount', () => {
      const shopState = createTestShopState();
      const result = buyItem(shopState, 'item-1', 40);

      expect(result.success).toBe(true);
      expect(result.newGold).toBe(0);
    });
  });

  describe('markItemAsSold', () => {
    it('should mark an item as sold and return new state', () => {
      const shopState = createTestShopState();
      const newState = markItemAsSold(shopState, 'item-1');

      expect(newState).not.toBe(shopState);
      expect(newState.items.find((i) => i.id === 'item-1')?.sold).toBe(true);
      // Original should be unchanged
      expect(shopState.items.find((i) => i.id === 'item-1')?.sold).toBe(false);
    });

    it('should not modify other items', () => {
      const shopState = createTestShopState();
      const newState = markItemAsSold(shopState, 'item-1');

      expect(newState.items.find((i) => i.id === 'item-2')?.sold).toBe(false);
      expect(newState.items.find((i) => i.id === 'item-3')?.sold).toBe(false);
    });
  });

  describe('calculateRerollCost', () => {
    it('should return base cost when no rerolls used', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 0 });
      expect(calculateRerollCost(shopState)).toBe(5);
    });

    it('should increase cost by 2 per reroll used', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 1 });
      expect(calculateRerollCost(shopState)).toBe(7); // 5 + 1*2

      const shopState2 = createTestShopState({ rerollCost: 5, rerollsUsed: 3 });
      expect(calculateRerollCost(shopState2)).toBe(11); // 5 + 3*2
    });
  });

  describe('reroll', () => {
    it('should successfully reroll when player has enough gold', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 0 });
      const result = reroll(shopState, 100, 1, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.cost).toBe(5);
        expect(result.shop.rerollsUsed).toBe(1);
        expect(result.shop.items.length).toBe(4);
      }
    });

    it('should fail when player does not have enough gold', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 0 });
      const result = reroll(shopState, 3, 1, 0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not enough gold');
      }
    });

    it('should increase reroll count', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 2 });
      const result = reroll(shopState, 100, 1, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.shop.rerollsUsed).toBe(3);
      }
    });

    it('should handle increasing reroll cost', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 2 });
      // Cost should be 5 + 2*2 = 9
      const result = reroll(shopState, 8, 1, 0); // Not enough for cost of 9

      expect(result.success).toBe(false);
    });
  });

  describe('canAffordItem', () => {
    it('should return true when player can afford unsold item', () => {
      const item = createTestItem({ cost: 40, sold: false });
      expect(canAffordItem(item, 100)).toBe(true);
      expect(canAffordItem(item, 40)).toBe(true);
    });

    it('should return false when player cannot afford item', () => {
      const item = createTestItem({ cost: 40, sold: false });
      expect(canAffordItem(item, 30)).toBe(false);
    });

    it('should return false when item is sold', () => {
      const item = createTestItem({ cost: 40, sold: true });
      expect(canAffordItem(item, 100)).toBe(false);
    });
  });

  describe('canAffordReroll', () => {
    it('should return true when player can afford reroll', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 0 });
      expect(canAffordReroll(shopState, 100)).toBe(true);
      expect(canAffordReroll(shopState, 5)).toBe(true);
    });

    it('should return false when player cannot afford reroll', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 0 });
      expect(canAffordReroll(shopState, 4)).toBe(false);
    });

    it('should account for increasing reroll cost', () => {
      const shopState = createTestShopState({ rerollCost: 5, rerollsUsed: 2 });
      // Cost should be 5 + 2*2 = 9
      expect(canAffordReroll(shopState, 9)).toBe(true);
      expect(canAffordReroll(shopState, 8)).toBe(false);
    });
  });
});
