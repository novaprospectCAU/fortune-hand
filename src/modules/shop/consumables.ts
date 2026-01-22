/**
 * Consumables Module - Card Manipulation System
 *
 * Consumables allow players to modify their deck:
 * - Remove cards from the deck
 * - Transform cards into random cards with effects
 * - Duplicate cards with all their properties
 */

import type { Consumable } from '@/types/interfaces';
import consumablesData from '@/data/consumables.json';

/**
 * Get consumable by ID
 *
 * @param id - The consumable ID
 * @returns The consumable data, or undefined if not found
 */
export function getConsumableById(id: string): Consumable | undefined {
  return consumablesData.consumables.find((c) => c.id === id) as Consumable | undefined;
}

/**
 * Get all consumables
 *
 * @returns Array of all consumables
 */
export function getAllConsumables(): Consumable[] {
  return consumablesData.consumables as Consumable[];
}

/**
 * Get consumables filtered by rarity
 *
 * @param rarity - The rarity level
 * @returns Array of consumables with that rarity
 */
export function getConsumablesByRarity(
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
): Consumable[] {
  return consumablesData.consumables.filter((c) => c.rarity === rarity) as Consumable[];
}

/**
 * Get consumables filtered by type
 *
 * @param type - The consumable type
 * @returns Array of consumables with that type
 */
export function getConsumablesByType(
  type: 'card_remover' | 'card_transformer' | 'card_duplicator'
): Consumable[] {
  return consumablesData.consumables.filter((c) => c.type === type) as Consumable[];
}
