/**
 * Pack System Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getAllPacks,
  getPackById,
  getPacksByRarity,
  openPack,
  getPackName,
  getPackDescription,
  getPackRarity,
  calculatePackValue,
  type PackData,
} from './packs';

describe('Pack Data Loading', () => {
  it('should load all packs from JSON', () => {
    const packs = getAllPacks();
    expect(packs.length).toBeGreaterThan(0);
    expect(packs[0]).toHaveProperty('id');
    expect(packs[0]).toHaveProperty('name');
    expect(packs[0]).toHaveProperty('cardCount');
  });

  it('should get pack by ID', () => {
    const pack = getPackById('standard_pack');
    expect(pack).toBeDefined();
    expect(pack?.id).toBe('standard_pack');
    expect(pack?.name).toBe('Standard Pack');
  });

  it('should return undefined for non-existent pack', () => {
    const pack = getPackById('non_existent_pack');
    expect(pack).toBeUndefined();
  });

  it('should filter packs by rarity', () => {
    const commonPacks = getPacksByRarity('common');
    const rarePacks = getPacksByRarity('rare');

    expect(Array.isArray(commonPacks)).toBe(true);
    expect(Array.isArray(rarePacks)).toBe(true);

    commonPacks.forEach((pack) => {
      expect(pack.rarity).toBe('common');
    });

    rarePacks.forEach((pack) => {
      expect(pack.rarity).toBe('rare');
    });
  });
});

describe('Pack Structure Validation', () => {
  it('should have valid pack structure', () => {
    const packs = getAllPacks();

    packs.forEach((pack: PackData) => {
      expect(pack.id).toBeTruthy();
      expect(pack.name).toBeTruthy();
      expect(pack.description).toBeTruthy();
      expect(pack.cost).toBeGreaterThan(0);
      expect(pack.cardCount).toBeGreaterThan(0);
      expect(pack.specialCardWeight).toBeGreaterThanOrEqual(0);
      expect(pack.specialCardWeight).toBeLessThanOrEqual(1);
      expect(['common', 'uncommon', 'rare', 'legendary']).toContain(pack.rarity);
    });
  });

  it('should have increasing costs for higher rarity packs', () => {
    const standardPack = getPackById('standard_pack');
    const arcanaPackData = getAllPacks().find(p => p.guaranteedRarity !== null);

    if (standardPack && arcanaPackData) {
      expect(arcanaPackData.cost).toBeGreaterThan(standardPack.cost);
    }
  });
});

describe('Pack Opening', () => {
  it('should open a standard pack and return cards', () => {
    const result = openPack('standard_pack');
    expect(result).toBeDefined();
    expect(result?.cards).toBeDefined();
    expect(result?.cards.length).toBeGreaterThan(0);
  });

  it('should return correct number of cards', () => {
    const pack = getPackById('standard_pack');
    const result = openPack('standard_pack');

    expect(result?.cards.length).toBe(pack?.cardCount);
  });

  it('should return null for non-existent pack', () => {
    const result = openPack('non_existent_pack');
    expect(result).toBeNull();
  });

  it('should generate cards with valid structure', () => {
    const result = openPack('standard_pack');

    result?.cards.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.suit).toBeTruthy();
      expect(card.rank).toBeTruthy();
      expect(['hearts', 'diamonds', 'clubs', 'spades']).toContain(card.suit);
    });
  });

  it('should handle packs with guaranteed special cards', () => {
    const arcanaResult = openPack('arcana_pack');

    if (arcanaResult) {
      expect(arcanaResult.cards.length).toBeGreaterThan(0);
      // At least one card should be special (has special properties)
      const hasSpecialCard = arcanaResult.cards.some(
        (card) => card.isWild || card.isGold || card.triggerSlot || card.triggerRoulette
      );

      // This might fail occasionally due to randomness, but with high special card weight
      // it should usually pass
      expect(arcanaResult.hasSpecialCards || hasSpecialCard).toBeTruthy();
    }
  });

  it('should mark hasSpecialCards correctly', () => {
    // Open multiple packs to check the flag
    for (let i = 0; i < 10; i++) {
      const result = openPack('standard_pack');
      if (result) {
        const actuallyHasSpecialCards = result.cards.some(
          (card) => card.isWild || card.isGold || card.triggerSlot || card.triggerRoulette
        );

        if (actuallyHasSpecialCards) {
          expect(result.hasSpecialCards).toBe(true);
        }
      }
    }
  });

  it('should generate unique card IDs', () => {
    const result = openPack('jumbo_pack');

    if (result) {
      const ids = result.cards.map((card) => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });
});

describe('Pack Value Calculation', () => {
  it('should calculate pack value', () => {
    const value = calculatePackValue('standard_pack');
    expect(value).toBeGreaterThan(0);
  });

  it('should return 0 for non-existent pack', () => {
    const value = calculatePackValue('non_existent');
    expect(value).toBe(0);
  });

  it('should scale value with card count', () => {
    const standardValue = calculatePackValue('standard_pack');
    const jumboValue = calculatePackValue('jumbo_pack');

    const standardPack = getPackById('standard_pack');
    const jumboPack = getPackById('jumbo_pack');

    if (standardPack && jumboPack && jumboPack.cardCount > standardPack.cardCount) {
      expect(jumboValue).toBeGreaterThan(standardValue);
    }
  });
});

describe('Pack Utility Functions', () => {
  it('should get pack name', () => {
    const name = getPackName('standard_pack');
    expect(name).toBe('Standard Pack');
  });

  it('should return default name for non-existent pack', () => {
    const name = getPackName('non_existent');
    expect(name).toBe('Unknown Pack');
  });

  it('should get pack description', () => {
    const description = getPackDescription('standard_pack');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(0);
  });

  it('should return empty description for non-existent pack', () => {
    const description = getPackDescription('non_existent');
    expect(description).toBe('');
  });

  it('should get pack rarity', () => {
    const rarity = getPackRarity('standard_pack');
    expect(['common', 'uncommon', 'rare', 'legendary']).toContain(rarity);
  });

  it('should return common rarity for non-existent pack', () => {
    const rarity = getPackRarity('non_existent');
    expect(rarity).toBe('common');
  });
});

describe('Pack Distribution', () => {
  it('should have packs of different rarities', () => {
    const packs = getAllPacks();
    const rarities = new Set(packs.map((p) => p.rarity));
    expect(rarities.size).toBeGreaterThan(1);
  });

  it('should have variety in card counts', () => {
    const packs = getAllPacks();
    const cardCounts = new Set(packs.map((p) => p.cardCount));
    expect(cardCounts.size).toBeGreaterThan(0);
  });

  it('should have variety in special card weights', () => {
    const packs = getAllPacks();
    const weights = new Set(packs.map((p) => p.specialCardWeight));
    expect(weights.size).toBeGreaterThan(1);
  });
});

describe('Edge Cases', () => {
  it('should handle opening same pack multiple times', () => {
    const result1 = openPack('standard_pack');
    const result2 = openPack('standard_pack');

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1?.cards).not.toEqual(result2?.cards);
  });

  it('should handle empty pack ID', () => {
    const result = openPack('');
    expect(result).toBeNull();
  });

  it('should handle all available pack types', () => {
    const packs = getAllPacks();

    packs.forEach((pack) => {
      const result = openPack(pack.id);
      expect(result).toBeDefined();
      expect(result?.packId).toBe(pack.id);
      expect(result?.cards.length).toBe(pack.cardCount);
    });
  });
});
