/**
 * Shop Module - Pack System
 *
 * Handles card pack opening logic.
 * Packs contain random combinations of standard and special cards.
 */

import type { Card } from '@/types/interfaces';
import type { Rarity } from '@/data/constants';
import { createCard } from '@/modules/cards/cardFactory';
import { getSpecialCardsByRarity, getAllSpecialCards } from '@/modules/cards/specialCards';
import { RANKS, SUITS } from '@/data/constants';
import packsData from '@/data/packs.json';
import balanceData from '@/data/balance.json';

/**
 * Pack definition from JSON data
 */
export interface PackData {
  id: string;
  name: string;
  description: string;
  cost: number;
  cardCount: number;
  guaranteedRarity: Rarity | null;
  specialCardWeight: number; // 0-1, probability of getting a special card
  rarity: Rarity;
}

/**
 * Pack opening result
 */
export interface PackResult {
  packId: string;
  cards: Card[];
  hasSpecialCards: boolean;
}

/**
 * Get all available packs
 */
export function getAllPacks(): PackData[] {
  return packsData.packs as PackData[];
}

/**
 * Get pack by ID
 */
export function getPackById(id: string): PackData | undefined {
  const packs = packsData.packs as PackData[];
  return packs.find((p) => p.id === id);
}

/**
 * Get packs by rarity
 */
export function getPacksByRarity(rarity: Rarity): PackData[] {
  const packs = packsData.packs as PackData[];
  return packs.filter((p) => p.rarity === rarity);
}

/**
 * Select a rarity based on weighted probabilities
 * @param seed - Optional seed for testing
 */
function selectRarity(seed?: number): Rarity {
  const weights = balanceData.rarityWeights;
  const entries = Object.entries(weights) as [Rarity, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let random = seed !== undefined ? seed : Math.random();
  random = random * totalWeight;

  for (const [rarity, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return rarity;
    }
  }

  return 'common';
}

/**
 * Generate a random standard card
 */
function generateStandardCard(): Card {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)]!;
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)]!;
  return createCard(rank, suit);
}

/**
 * Generate a random special card based on rarity
 */
function generateSpecialCard(rarity?: Rarity): Card {
  let specialCards: Card[] = [];

  if (rarity) {
    specialCards = getSpecialCardsByRarity(rarity);
  }

  // If no cards of that rarity, get all special cards
  if (specialCards.length === 0) {
    specialCards = getAllSpecialCards();
  }

  // If still no special cards, return a standard card
  if (specialCards.length === 0) {
    return generateStandardCard();
  }

  const randomIndex = Math.floor(Math.random() * specialCards.length);
  const selectedCard = specialCards[randomIndex]!;

  // Create a unique ID for this instance
  return {
    ...selectedCard,
    id: `${selectedCard.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  };
}

/**
 * Open a card pack and return the cards inside
 *
 * @param packId - The ID of the pack to open
 * @param seed - Optional seed for deterministic testing
 * @returns PackResult with the cards obtained
 */
export function openPack(packId: string, seed?: number): PackResult | null {
  const pack = getPackById(packId);

  if (!pack) {
    return null;
  }

  const cards: Card[] = [];
  let hasSpecialCards = false;
  let guaranteedSpecialGiven = false;

  for (let i = 0; i < pack.cardCount; i++) {
    // Determine if this card should be a special card
    const shouldBeSpecial = Math.random() < pack.specialCardWeight;

    // First card gets the guaranteed rarity if specified
    if (i === 0 && pack.guaranteedRarity && !guaranteedSpecialGiven) {
      cards.push(generateSpecialCard(pack.guaranteedRarity));
      hasSpecialCards = true;
      guaranteedSpecialGiven = true;
      continue;
    }

    if (shouldBeSpecial) {
      // Generate special card with weighted rarity
      const rarity = selectRarity(seed);
      cards.push(generateSpecialCard(rarity));
      hasSpecialCards = true;
    } else {
      // Generate standard card
      cards.push(generateStandardCard());
    }
  }

  return {
    packId: pack.id,
    cards,
    hasSpecialCards,
  };
}

/**
 * Calculate the value of a pack's potential contents
 * Used for pricing and balancing
 */
export function calculatePackValue(packId: string): number {
  const pack = getPackById(packId);
  if (!pack) return 0;

  // Base value per card
  const baseValuePerCard = 5;

  // Value multiplier for special cards
  const specialCardMultiplier = 2;

  // Calculate expected value
  const standardCardValue = baseValuePerCard * (1 - pack.specialCardWeight);
  const specialCardValue = baseValuePerCard * specialCardMultiplier * pack.specialCardWeight;

  const expectedValuePerCard = standardCardValue + specialCardValue;
  return Math.floor(expectedValuePerCard * pack.cardCount);
}

/**
 * Get the display name for a pack
 */
export function getPackName(packId: string): string {
  const pack = getPackById(packId);
  return pack?.name ?? 'Unknown Pack';
}

/**
 * Get the description for a pack
 */
export function getPackDescription(packId: string): string {
  const pack = getPackById(packId);
  return pack?.description ?? '';
}

/**
 * Get the rarity of a pack
 */
export function getPackRarity(packId: string): Rarity {
  const pack = getPackById(packId);
  return pack?.rarity ?? 'common';
}
