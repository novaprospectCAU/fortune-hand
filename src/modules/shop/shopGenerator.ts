/**
 * Shop Module - Shop Generation
 *
 * Generates shop items based on round, luck, and probability weights.
 * Uses data from balance.json for all probability calculations.
 */

import type { ShopState, ShopItem } from '@/types/interfaces';
import type { Rarity } from '@/data/constants';
import { calculatePriceWithRoundScaling } from './pricing';
import { getPacksByRarity, getAllPacks } from './packs';
import { getVouchersByRarity } from './vouchers';
import balanceData from '@/data/balance.json';
import jokersData from '@/data/jokers.json';
import cardsData from '@/data/cards.json';

/**
 * Shop configuration from balance.json
 */
const SHOP_CONFIG = balanceData.shop;
const RARITY_WEIGHTS = balanceData.rarityWeights;

/**
 * Item type definition for shop generation
 */
type ItemType = 'joker' | 'card' | 'pack' | 'voucher';

/**
 * Generate a unique ID for a shop item
 */
function generateItemId(): string {
  return `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Select a random element based on weighted probabilities
 *
 * @param weights - Object mapping options to their weights
 * @param seed - Optional seed for deterministic selection (for testing)
 * @returns The selected key
 */
export function weightedRandom<T extends string>(
  weights: Record<T, number>,
  seed?: number
): T {
  const entries = Object.entries(weights) as [T, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let random = seed !== undefined ? seed : Math.random();
  random = random * totalWeight;

  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return key;
    }
  }

  // Fallback to first option
  const firstEntry = entries[0];
  return firstEntry ? firstEntry[0] : (Object.keys(weights)[0] as T);
}

/**
 * Select item type based on configured probabilities
 *
 * @param seed - Optional seed for deterministic selection
 * @returns The selected item type
 */
export function selectItemType(seed?: number): ItemType {
  return weightedRandom(SHOP_CONFIG.itemTypeWeights as Record<ItemType, number>, seed);
}

/**
 * Select rarity based on configured weights
 * Luck bonus increases chance of better rarities
 *
 * @param luck - Player's luck bonus (0-100)
 * @param seed - Optional seed for deterministic selection
 * @returns The selected rarity
 */
export function selectRarity(luck: number = 0, seed?: number): Rarity {
  // Apply luck bonus to rarer items
  const adjustedWeights: Record<Rarity, number> = {
    common: Math.max(RARITY_WEIGHTS.common - luck * 0.5, 20),
    uncommon: RARITY_WEIGHTS.uncommon + luck * 0.2,
    rare: RARITY_WEIGHTS.rare + luck * 0.2,
    legendary: RARITY_WEIGHTS.legendary + luck * 0.1,
  };

  return weightedRandom(adjustedWeights, seed);
}

/**
 * Get available jokers filtered by rarity
 */
function getJokersByRarity(rarity: Rarity): typeof jokersData.jokers {
  return jokersData.jokers.filter((j) => j.rarity === rarity);
}

/**
 * Get available special cards filtered by rarity
 */
function getCardsByRarity(rarity: Rarity): typeof cardsData.specialCards {
  return cardsData.specialCards.filter((c) => c.rarity === rarity);
}

/**
 * Generate a joker shop item
 *
 * @param rarity - The rarity of the joker
 * @param round - Current game round
 * @returns A shop item for a joker, or null if none available
 */
function generateJokerItem(rarity: Rarity, round: number): ShopItem | null {
  const availableJokers = getJokersByRarity(rarity);

  if (availableJokers.length === 0) {
    // Fallback to any joker if none of this rarity
    if (jokersData.jokers.length === 0) return null;
    const joker = jokersData.jokers[Math.floor(Math.random() * jokersData.jokers.length)]!;
    return {
      id: generateItemId(),
      type: 'joker',
      itemId: joker.id,
      cost: calculatePriceWithRoundScaling(joker.cost, joker.rarity as Rarity, round),
      sold: false,
    };
  }

  const joker = availableJokers[Math.floor(Math.random() * availableJokers.length)]!;
  return {
    id: generateItemId(),
    type: 'joker',
    itemId: joker.id,
    cost: calculatePriceWithRoundScaling(joker.cost, rarity, round),
    sold: false,
  };
}

/**
 * Generate a card shop item
 *
 * @param rarity - The rarity of the card
 * @param round - Current game round
 * @returns A shop item for a special card, or null if none available
 */
function generateCardItem(rarity: Rarity, round: number): ShopItem | null {
  const availableCards = getCardsByRarity(rarity);

  if (availableCards.length === 0) {
    // Fallback to any special card if none of this rarity
    if (cardsData.specialCards.length === 0) return null;
    const card =
      cardsData.specialCards[Math.floor(Math.random() * cardsData.specialCards.length)]!;
    return {
      id: generateItemId(),
      type: 'card',
      itemId: card.id,
      cost: calculatePriceWithRoundScaling(
        card.shopCost,
        card.rarity as Rarity,
        round
      ),
      sold: false,
    };
  }

  const card = availableCards[Math.floor(Math.random() * availableCards.length)]!;
  return {
    id: generateItemId(),
    type: 'card',
    itemId: card.id,
    cost: calculatePriceWithRoundScaling(card.shopCost, rarity, round),
    sold: false,
  };
}

/**
 * Generate a pack shop item
 * Packs contain random cards
 *
 * @param rarity - The rarity tier of the pack
 * @param round - Current game round
 * @returns A shop item for a pack, or null if none available
 */
function generatePackItem(rarity: Rarity, round: number): ShopItem | null {
  const availablePacks = getPacksByRarity(rarity);

  if (availablePacks.length === 0) {
    // Fallback to any pack if none of this rarity
    const allPacks = getAllPacks();
    if (allPacks.length === 0) return null;
    const pack = allPacks[Math.floor(Math.random() * allPacks.length)]!;
    return {
      id: generateItemId(),
      type: 'pack',
      itemId: pack.id,
      cost: calculatePriceWithRoundScaling(pack.cost, pack.rarity, round),
      sold: false,
    };
  }

  const pack = availablePacks[Math.floor(Math.random() * availablePacks.length)]!;
  return {
    id: generateItemId(),
    type: 'pack',
    itemId: pack.id,
    cost: calculatePriceWithRoundScaling(pack.cost, rarity, round),
    sold: false,
  };
}

/**
 * Generate a voucher shop item
 * Vouchers provide permanent bonuses
 *
 * @param rarity - The rarity tier of the voucher
 * @param round - Current game round
 * @param purchasedVoucherIds - IDs of vouchers already purchased (to exclude)
 * @returns A shop item for a voucher, or null if none available
 */
function generateVoucherItem(
  rarity: Rarity,
  round: number,
  purchasedVoucherIds: string[] = []
): ShopItem | null {
  // Filter out already purchased vouchers
  const availableVouchers = getVouchersByRarity(rarity).filter(
    (v) => !purchasedVoucherIds.includes(v.id)
  );

  if (availableVouchers.length === 0) {
    // Fallback to any unpurchased voucher if none of this rarity
    const allVouchers = getVouchersByRarity('common')
      .concat(getVouchersByRarity('uncommon'))
      .concat(getVouchersByRarity('rare'))
      .concat(getVouchersByRarity('legendary'))
      .filter((v) => !purchasedVoucherIds.includes(v.id));

    if (allVouchers.length === 0) return null;
    const voucher = allVouchers[Math.floor(Math.random() * allVouchers.length)]!;
    return {
      id: generateItemId(),
      type: 'voucher',
      itemId: voucher.id,
      cost: calculatePriceWithRoundScaling(voucher.cost, voucher.rarity, round),
      sold: false,
    };
  }

  const voucher = availableVouchers[Math.floor(Math.random() * availableVouchers.length)]!;
  return {
    id: generateItemId(),
    type: 'voucher',
    itemId: voucher.id,
    cost: calculatePriceWithRoundScaling(voucher.cost, rarity, round),
    sold: false,
  };
}

/**
 * Options for shop generation
 */
export interface ShopGenerationOptions {
  purchasedVoucherIds?: string[];
}

/**
 * Generate a single shop item based on type and rarity
 *
 * @param type - The type of item to generate
 * @param rarity - The rarity of the item
 * @param round - Current game round
 * @param options - Additional options for generation
 * @returns A generated shop item
 */
export function generateItem(
  type: ItemType,
  rarity: Rarity,
  round: number,
  options: ShopGenerationOptions = {}
): ShopItem | null {
  switch (type) {
    case 'joker':
      return generateJokerItem(rarity, round);
    case 'card':
      return generateCardItem(rarity, round);
    case 'pack':
      return generatePackItem(rarity, round);
    case 'voucher':
      return generateVoucherItem(rarity, round, options.purchasedVoucherIds);
    default:
      return null;
  }
}

/**
 * Generate a complete shop with items
 *
 * @param round - Current game round (affects prices and available items)
 * @param luck - Player's luck stat (affects rarity distribution)
 * @param options - Additional options for generation (e.g., purchasedVoucherIds)
 * @returns A new ShopState with generated items
 */
export function generateShop(
  round: number = 1,
  luck: number = 0,
  options: ShopGenerationOptions = {}
): ShopState {
  const items: ShopItem[] = [];
  const itemCount = SHOP_CONFIG.itemCount;

  for (let i = 0; i < itemCount; i++) {
    const type = selectItemType();
    const rarity = selectRarity(luck);
    const item = generateItem(type, rarity, round, options);

    if (item) {
      items.push(item);
    } else {
      // If item generation failed, try again with a different type
      const fallbackType = type === 'joker' ? 'pack' : 'joker';
      const fallbackItem = generateItem(fallbackType, rarity, round, options);
      if (fallbackItem) {
        items.push(fallbackItem);
      }
    }
  }

  return {
    items,
    rerollCost: SHOP_CONFIG.rerollBaseCost,
    rerollsUsed: 0,
  };
}

/**
 * Generate shop with specific seed for testing
 *
 * @param round - Current game round
 * @param luck - Player's luck stat
 * @param seed - Random seed for deterministic generation
 * @param options - Additional options for generation
 * @returns A new ShopState with generated items
 */
export function generateShopWithSeed(
  round: number = 1,
  luck: number = 0,
  _seed: number = 0,
  options: ShopGenerationOptions = {}
): ShopState {
  // For testing purposes, we use the standard generator
  // A proper seeded random implementation would be needed for full determinism
  return generateShop(round, luck, options);
}
