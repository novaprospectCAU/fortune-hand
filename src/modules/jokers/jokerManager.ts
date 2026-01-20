/**
 * Joker Manager
 *
 * Main orchestrator for evaluating joker effects during gameplay
 */

import type {
  Joker,
  JokerContext,
  AppliedBonus,
  SlotModifiers,
  SlotEffects,
} from '@/types/interfaces';
import { shouldTrigger } from './triggers';
import {
  applyEffect,
  getAppliedBonuses,
  getSlotModifier,
  getRouletteModifier,
  getRetriggerCount,
  type EffectResult,
} from './effects';

/**
 * Result of evaluating all jokers
 */
export interface JokerEvaluationResult {
  /** Bonuses to apply to score calculation */
  bonuses: AppliedBonus[];
  /** Total gold to add */
  goldToAdd: number;
  /** Combined slot modifiers */
  slotModifiers: Partial<SlotModifiers>;
  /** Combined roulette modifiers */
  rouletteModifiers: Partial<SlotEffects['rouletteBonus']>;
  /** Total retrigger count */
  retriggerCount: number;
  /** IDs of jokers that triggered */
  triggeredJokerIds: string[];
}

/**
 * Evaluate all jokers and return their combined effects
 * Main function used by the core module during gameplay
 *
 * @param jokers - Array of jokers to evaluate
 * @param context - Current game context
 * @returns Combined evaluation result with all bonuses and modifiers
 */
export function evaluateJokers(
  jokers: Joker[],
  context: JokerContext
): AppliedBonus[] {
  const bonuses: AppliedBonus[] = [];

  for (const joker of jokers) {
    if (shouldTrigger(joker, context)) {
      bonuses.push(...getAppliedBonuses(joker, context));
    }
  }

  return bonuses;
}

/**
 * Evaluate all jokers with full effect details
 * Extended version that returns all effect types, not just bonuses
 *
 * @param jokers - Array of jokers to evaluate
 * @param context - Current game context
 * @returns Full evaluation result with all effects
 */
export function evaluateJokersFull(
  jokers: Joker[],
  context: JokerContext
): JokerEvaluationResult {
  const result: JokerEvaluationResult = {
    bonuses: [],
    goldToAdd: 0,
    slotModifiers: {},
    rouletteModifiers: {},
    retriggerCount: 0,
    triggeredJokerIds: [],
  };

  for (const joker of jokers) {
    if (shouldTrigger(joker, context)) {
      const effectResult = applyEffect(joker, context);

      // Collect bonuses
      result.bonuses.push(...effectResult.bonuses);

      // Accumulate gold
      result.goldToAdd += effectResult.goldToAdd;

      // Merge slot modifiers
      if (effectResult.slotModifier) {
        result.slotModifiers = mergeSlotModifiers(
          result.slotModifiers,
          effectResult.slotModifier
        );
      }

      // Merge roulette modifiers
      if (effectResult.rouletteModifier) {
        result.rouletteModifiers = mergeRouletteModifiers(
          result.rouletteModifiers,
          effectResult.rouletteModifier
        );
      }

      // Accumulate retriggers
      result.retriggerCount += effectResult.retriggerCount;

      // Track triggered joker
      result.triggeredJokerIds.push(joker.id);
    }
  }

  return result;
}

/**
 * Get all slot modifiers from active jokers
 * Used during SLOT_PHASE to modify spin behavior
 *
 * @param jokers - Array of jokers to check
 * @returns Combined slot modifiers
 */
export function getSlotModifiersFromJokers(
  jokers: Joker[]
): Partial<SlotModifiers> {
  const modifiers: Partial<SlotModifiers> = {};

  for (const joker of jokers) {
    const modifier = getSlotModifier(joker);
    if (modifier) {
      Object.assign(modifiers, mergeSlotModifiers(modifiers, modifier));
    }
  }

  return modifiers;
}

/**
 * Get all roulette modifiers from active jokers
 * Used during ROULETTE_PHASE to modify spin behavior
 *
 * @param jokers - Array of jokers to check
 * @returns Combined roulette modifiers
 */
export function getRouletteModifiersFromJokers(
  jokers: Joker[]
): Partial<SlotEffects['rouletteBonus']> {
  const modifiers: Partial<SlotEffects['rouletteBonus']> = {};

  for (const joker of jokers) {
    const modifier = getRouletteModifier(joker);
    if (modifier) {
      Object.assign(modifiers, mergeRouletteModifiers(modifiers, modifier));
    }
  }

  return modifiers;
}

/**
 * Get total retrigger count from jokers
 * Used during PLAY_PHASE for card retrigger effects
 *
 * @param jokers - Array of jokers to check
 * @param context - Current game context
 * @returns Total retrigger count
 */
export function getRetriggerCountFromJokers(
  jokers: Joker[],
  context: JokerContext
): number {
  let total = 0;

  for (const joker of jokers) {
    if (shouldTrigger(joker, context)) {
      total += getRetriggerCount(joker);
    }
  }

  return total;
}

/**
 * Get list of jokers that would trigger in the current context
 * Useful for UI to highlight active jokers
 *
 * @param jokers - Array of jokers to check
 * @param context - Current game context
 * @returns Array of jokers that would trigger
 */
export function getTriggeredJokers(
  jokers: Joker[],
  context: JokerContext
): Joker[] {
  return jokers.filter((joker) => shouldTrigger(joker, context));
}

/**
 * Merge two slot modifiers, combining symbol weights
 */
function mergeSlotModifiers(
  base: Partial<SlotModifiers>,
  additional: Partial<SlotModifiers>
): Partial<SlotModifiers> {
  const result = { ...base };

  if (additional.symbolWeights) {
    result.symbolWeights = {
      ...base.symbolWeights,
      ...additional.symbolWeights,
    };
  }

  if (additional.guaranteedSymbol) {
    result.guaranteedSymbol = additional.guaranteedSymbol;
  }

  if (additional.rerollCount !== undefined) {
    result.rerollCount = (base.rerollCount ?? 0) + additional.rerollCount;
  }

  return result;
}

/**
 * Merge two roulette modifiers, adding bonuses
 */
function mergeRouletteModifiers(
  base: Partial<SlotEffects['rouletteBonus']>,
  additional: Partial<SlotEffects['rouletteBonus']>
): Partial<SlotEffects['rouletteBonus']> {
  const result = { ...base };

  if (additional.safeZoneBonus !== undefined) {
    result.safeZoneBonus =
      (base.safeZoneBonus ?? 0) + additional.safeZoneBonus;
  }

  if (additional.maxMultiplier !== undefined) {
    result.maxMultiplier =
      (base.maxMultiplier ?? 0) + additional.maxMultiplier;
  }

  if (additional.freeSpins !== undefined) {
    result.freeSpins = (base.freeSpins ?? 0) + additional.freeSpins;
  }

  return result;
}
