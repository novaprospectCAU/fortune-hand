/**
 * Shop Module - Pricing System
 *
 * Handles price calculation based on rarity and other factors.
 * All price-related constants come from balance.json.
 */

import type { Rarity } from '@/data/constants';

/**
 * Base prices for different item types
 */
export const BASE_PRICES: Record<string, number> = {
  joker: 40,
  card: 20,
  pack: 30,
  voucher: 50,
};

/**
 * Rarity multipliers for price calculation
 */
export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2.5,
  legendary: 5,
};

/**
 * Calculate the final price for an item based on its base price and rarity
 *
 * @param basePrice - The base price of the item
 * @param rarity - The rarity tier of the item
 * @returns The calculated final price (rounded to nearest integer)
 */
export function calculatePrice(basePrice: number, rarity: Rarity): number {
  const multiplier = RARITY_MULTIPLIERS[rarity] ?? 1;
  return Math.round(basePrice * multiplier);
}

/**
 * Calculate price with round scaling
 * Higher rounds have slightly higher prices
 *
 * @param basePrice - The base price of the item
 * @param rarity - The rarity tier of the item
 * @param round - The current game round
 * @returns The calculated final price with round scaling
 */
export function calculatePriceWithRoundScaling(
  basePrice: number,
  rarity: Rarity,
  round: number
): number {
  const baseCalculation = calculatePrice(basePrice, rarity);
  // 5% increase per round after round 1, max 50% increase
  const roundMultiplier = 1 + Math.min((round - 1) * 0.05, 0.5);
  return Math.round(baseCalculation * roundMultiplier);
}

/**
 * Get the base price for an item type
 *
 * @param itemType - The type of item (joker, card, pack, voucher)
 * @returns The base price for that item type
 */
export function getBasePrice(itemType: string): number {
  return BASE_PRICES[itemType] ?? 30;
}
