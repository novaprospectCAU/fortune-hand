/**
 * Special Card Triggers
 *
 * Handles detection and effects of special cards that trigger during gameplay.
 * - triggerSlot: Cards that activate mini slot spins
 * - triggerRoulette: Cards that grant extra roulette spins
 */

import type { Card, SlotResult } from '@/types/interfaces';

/**
 * Result of checking for card triggers
 */
export interface TriggerResult {
  hasSlotTrigger: boolean;
  hasRouletteTrigger: boolean;
  slotTriggerCards: Card[];
  rouletteTriggerCards: Card[];
}

/**
 * Effect that should be applied from a trigger
 */
export interface TriggerEffect {
  type: 'slot_spin' | 'roulette_spin';
  source: Card;
  description: string;
}

/**
 * Detect special card triggers in a set of cards
 *
 * @param cards - Cards to check for triggers
 * @returns Trigger detection result
 */
export function detectTriggers(cards: Card[]): TriggerResult {
  const slotTriggerCards: Card[] = [];
  const rouletteTriggerCards: Card[] = [];

  for (const card of cards) {
    if (card.triggerSlot) {
      slotTriggerCards.push(card);
    }
    if (card.triggerRoulette) {
      rouletteTriggerCards.push(card);
    }
  }

  return {
    hasSlotTrigger: slotTriggerCards.length > 0,
    hasRouletteTrigger: rouletteTriggerCards.length > 0,
    slotTriggerCards,
    rouletteTriggerCards,
  };
}

/**
 * Get all trigger effects from played cards
 *
 * @param cards - Cards that were played
 * @returns Array of effects to apply
 */
export function getTriggerEffects(cards: Card[]): TriggerEffect[] {
  const effects: TriggerEffect[] = [];
  const triggers = detectTriggers(cards);

  // Add slot spin effects
  for (const card of triggers.slotTriggerCards) {
    effects.push({
      type: 'slot_spin',
      source: card,
      description: `${card.rank} of ${card.suit} triggered a mini slot spin!`,
    });
  }

  // Add roulette spin effects
  for (const card of triggers.rouletteTriggerCards) {
    effects.push({
      type: 'roulette_spin',
      source: card,
      description: `${card.rank} of ${card.suit} granted an extra roulette spin!`,
    });
  }

  return effects;
}

/**
 * Count how many slot spins should be triggered
 *
 * @param cards - Cards to check
 * @returns Number of slot spins to trigger
 */
export function countSlotTriggers(cards: Card[]): number {
  return cards.filter(card => card.triggerSlot).length;
}

/**
 * Count how many roulette spins should be triggered
 *
 * @param cards - Cards to check
 * @returns Number of roulette spins to grant
 */
export function countRouletteTriggers(cards: Card[]): number {
  return cards.filter(card => card.triggerRoulette).length;
}

/**
 * Check if any card in the set has a specific trigger type
 *
 * @param cards - Cards to check
 * @param triggerType - Type of trigger to look for
 * @returns True if at least one card has the trigger
 */
export function hasTriggerType(
  cards: Card[],
  triggerType: 'slot' | 'roulette'
): boolean {
  if (triggerType === 'slot') {
    return cards.some(card => card.triggerSlot);
  } else {
    return cards.some(card => card.triggerRoulette);
  }
}

/**
 * Merge multiple slot results (for when multiple cards trigger slots)
 * Takes the best of each bonus category
 *
 * @param results - Array of slot results to merge
 * @returns Merged slot result with cumulative effects
 */
export function mergeSlotResults(results: SlotResult[]): SlotResult | null {
  if (results.length === 0) {
    return null;
  }

  if (results.length === 1) {
    return results[0]!;
  }

  // Start with the first result
  const merged: SlotResult = {
    symbols: results[0]!.symbols,
    isJackpot: results.some(r => r.isJackpot),
    effects: {
      cardBonus: {
        extraDraw: 0,
        handSize: 0,
        scoreMultiplier: 1,
      },
      rouletteBonus: {
        safeZoneBonus: 0,
        maxMultiplier: 0,
        freeSpins: 0,
      },
      instant: {
        gold: 0,
        chips: 0,
      },
      penalty: {
        discardCards: 0,
        skipRoulette: false,
        loseGold: 0,
      },
    },
  };

  // Sum up all effects
  for (const result of results) {
    // Card bonuses - sum draws/hand size, multiply scoreMultipliers
    merged.effects.cardBonus.extraDraw += result.effects.cardBonus.extraDraw;
    merged.effects.cardBonus.handSize += result.effects.cardBonus.handSize;
    merged.effects.cardBonus.scoreMultiplier *= result.effects.cardBonus.scoreMultiplier;

    // Roulette bonuses - sum all values
    merged.effects.rouletteBonus.safeZoneBonus += result.effects.rouletteBonus.safeZoneBonus;
    merged.effects.rouletteBonus.maxMultiplier += result.effects.rouletteBonus.maxMultiplier;
    merged.effects.rouletteBonus.freeSpins += result.effects.rouletteBonus.freeSpins;

    // Instant rewards - sum all
    merged.effects.instant.gold += result.effects.instant.gold;
    merged.effects.instant.chips += result.effects.instant.chips;

    // Penalties - take worst case (max penalties)
    merged.effects.penalty.discardCards = Math.max(
      merged.effects.penalty.discardCards,
      result.effects.penalty.discardCards
    );
    merged.effects.penalty.skipRoulette = merged.effects.penalty.skipRoulette || result.effects.penalty.skipRoulette;
    merged.effects.penalty.loseGold = Math.max(
      merged.effects.penalty.loseGold,
      result.effects.penalty.loseGold
    );
  }

  return merged;
}
