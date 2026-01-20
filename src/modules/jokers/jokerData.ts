/**
 * Joker Data Loader
 *
 * Loads and provides access to joker data from JSON
 */

import jokersJson from '@/data/jokers.json';
import type { Joker } from '@/types/interfaces';

// Type assertion for JSON import
interface JokersJsonData {
  jokers: Joker[];
}

const jokersData = jokersJson as JokersJsonData;

// Create a map for O(1) lookup by ID
const jokerMap = new Map<string, Joker>(
  jokersData.jokers.map((joker) => [joker.id, joker])
);

/**
 * Get a joker by its ID
 * @param id - The unique identifier of the joker
 * @returns The joker if found, undefined otherwise
 */
export function getJokerById(id: string): Joker | undefined {
  return jokerMap.get(id);
}

/**
 * Get all jokers
 * @returns Array of all jokers
 */
export function getAllJokers(): Joker[] {
  return [...jokersData.jokers];
}

/**
 * Get jokers filtered by rarity
 * @param rarity - The rarity to filter by
 * @returns Array of jokers with the specified rarity
 */
export function getJokersByRarity(rarity: Joker['rarity']): Joker[] {
  return jokersData.jokers.filter((joker) => joker.rarity === rarity);
}

/**
 * Get jokers filtered by trigger type
 * @param triggerType - The trigger type to filter by
 * @returns Array of jokers with the specified trigger type
 */
export function getJokersByTriggerType(
  triggerType: Joker['trigger']['type']
): Joker[] {
  return jokersData.jokers.filter((joker) => joker.trigger.type === triggerType);
}

/**
 * Get the total count of jokers
 * @returns The number of jokers in the data
 */
export function getJokerCount(): number {
  return jokersData.jokers.length;
}
