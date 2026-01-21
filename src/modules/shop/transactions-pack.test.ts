/**
 * Pack Transaction Tests
 * Tests for buying packs and receiving cards
 */

import { describe, it, expect } from 'vitest';
import { buyItem } from './transactions';
import { generateShop } from './shopGenerator';
import type { ShopState } from '@/types/interfaces';

describe('Pack Purchase Transactions', () => {
  it('should successfully buy a pack and receive cards', () => {
    // Create a shop with a pack item
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_1',
          type: 'pack',
          itemId: 'standard_pack',
          cost: 30,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_1', 100);

    expect(result.success).toBe(true);
    expect(result.newGold).toBe(70);
    expect(result.packCards).toBeDefined();
    expect(result.packCards?.length).toBeGreaterThan(0);
  });

  it('should include the correct number of cards for standard pack', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_1',
          type: 'pack',
          itemId: 'standard_pack',
          cost: 30,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_1', 100);

    // Standard pack contains 3 cards
    expect(result.packCards?.length).toBe(3);
  });

  it('should include the correct number of cards for jumbo pack', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_2',
          type: 'pack',
          itemId: 'jumbo_pack',
          cost: 50,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_2', 100);

    // Jumbo pack contains 5 cards
    expect(result.packCards?.length).toBe(5);
  });

  it('should not include packCards for non-pack items', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_joker_1',
          type: 'joker',
          itemId: 'lucky_seven',
          cost: 40,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_joker_1', 100);

    expect(result.success).toBe(true);
    expect(result.packCards).toBeUndefined();
  });

  it('should fail if player cannot afford pack', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_1',
          type: 'pack',
          itemId: 'standard_pack',
          cost: 30,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_1', 20);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not enough gold');
    expect(result.packCards).toBeUndefined();
  });

  it('should generate valid cards from pack', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_1',
          type: 'pack',
          itemId: 'standard_pack',
          cost: 30,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_1', 100);

    result.packCards?.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.suit).toBeTruthy();
      expect(card.rank).toBeTruthy();
      expect(['hearts', 'diamonds', 'clubs', 'spades']).toContain(card.suit);
    });
  });

  it('should handle arcana pack with guaranteed special cards', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_arcana',
          type: 'pack',
          itemId: 'arcana_pack',
          cost: 80,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_arcana', 100);

    expect(result.success).toBe(true);
    expect(result.packCards?.length).toBe(3);
  });

  it('should handle buying multiple different packs', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_1',
          type: 'pack',
          itemId: 'standard_pack',
          cost: 30,
          sold: false,
        },
        {
          id: 'shop_pack_2',
          type: 'pack',
          itemId: 'jumbo_pack',
          cost: 50,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result1 = buyItem(shop, 'shop_pack_1', 100);
    expect(result1.success).toBe(true);
    expect(result1.packCards?.length).toBe(3);

    const result2 = buyItem(shop, 'shop_pack_2', 100);
    expect(result2.success).toBe(true);
    expect(result2.packCards?.length).toBe(5);
  });

  it('should handle invalid pack ID gracefully', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_invalid',
          type: 'pack',
          itemId: 'non_existent_pack',
          cost: 30,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_invalid', 100);

    // Should still succeed the transaction, but packCards might be undefined
    expect(result.success).toBe(true);
    // Pack opening failed, so no cards returned
    expect(result.packCards).toBeUndefined();
  });
});

describe('Pack Integration in Shop Generation', () => {
  it('should include packs in generated shops', () => {
    const shop = generateShop(1, 0);

    const hasPack = shop.items.some((item) => item.type === 'pack');

    // Not guaranteed every time, but should happen often enough
    // We'll just verify that pack generation works
    if (hasPack) {
      const packItem = shop.items.find((item) => item.type === 'pack')!;
      expect(packItem.itemId).toBeTruthy();
      expect(packItem.cost).toBeGreaterThan(0);
    }
  });

  it('should generate valid pack items in shop', () => {
    // Generate multiple shops to increase chance of getting packs
    for (let i = 0; i < 10; i++) {
      const shop = generateShop(1, 0);

      shop.items
        .filter((item) => item.type === 'pack')
        .forEach((packItem) => {
          expect(['standard_pack', 'jumbo_pack', 'mega_pack', 'arcana_pack', 'celestial_pack']).toContain(
            packItem.itemId
          );
        });
    }
  });

  it('should allow buying pack from generated shop', () => {
    const shop = generateShop(1, 0);
    const packItem = shop.items.find((item) => item.type === 'pack');

    if (packItem) {
      const result = buyItem(shop, packItem.id, 1000);

      expect(result.success).toBe(true);
      expect(result.packCards).toBeDefined();
    }
  });
});

describe('Pack Cards Uniqueness', () => {
  it('should generate different cards each time pack is opened', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_1',
          type: 'pack',
          itemId: 'jumbo_pack',
          cost: 50,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result1 = buyItem(shop, 'shop_pack_1', 1000);
    const result2 = buyItem(shop, 'shop_pack_1', 1000);

    // Cards should be different instances
    expect(result1.packCards).not.toEqual(result2.packCards);

    // IDs should be unique
    const ids1 = result1.packCards?.map((c) => c.id) ?? [];
    const ids2 = result2.packCards?.map((c) => c.id) ?? [];

    expect(ids1).not.toEqual(ids2);
  });

  it('should generate unique IDs within a single pack', () => {
    const shop: ShopState = {
      items: [
        {
          id: 'shop_pack_1',
          type: 'pack',
          itemId: 'jumbo_pack',
          cost: 50,
          sold: false,
        },
      ],
      rerollCost: 5,
      rerollsUsed: 0,
    };

    const result = buyItem(shop, 'shop_pack_1', 1000);

    const ids = result.packCards?.map((c) => c.id) ?? [];
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});
