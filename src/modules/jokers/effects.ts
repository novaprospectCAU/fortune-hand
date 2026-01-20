/**
 * Joker Effect System
 *
 * Applies joker effects and converts them to AppliedBonus
 */

import type {
  Joker,
  JokerContext,
  JokerEffect,
  AppliedBonus,
  SlotModifiers,
  SlotEffects,
} from '@/types/interfaces';

/**
 * Effect application result
 * Contains bonuses for score calculation and other effects that need separate handling
 */
export interface EffectResult {
  /** Bonuses to apply to score calculation */
  bonuses: AppliedBonus[];
  /** Gold to add immediately */
  goldToAdd: number;
  /** Slot modifier to apply */
  slotModifier: Partial<SlotModifiers> | null;
  /** Roulette modifier to apply */
  rouletteModifier: Partial<SlotEffects['rouletteBonus']> | null;
  /** Number of retriggers */
  retriggerCount: number;
  /** Custom handler name (if any) */
  customHandler: string | null;
}

/**
 * Create an empty effect result
 */
function createEmptyResult(): EffectResult {
  return {
    bonuses: [],
    goldToAdd: 0,
    slotModifier: null,
    rouletteModifier: null,
    retriggerCount: 0,
    customHandler: null,
  };
}

/**
 * Apply a joker's effect and return the result
 * @param joker - The joker whose effect to apply
 * @param context - The current game context (for context-dependent effects)
 * @returns The effect result with bonuses and other modifiers
 */
export function applyEffect(joker: Joker, context: JokerContext): EffectResult {
  const result = createEmptyResult();
  const effect = joker.effect;

  switch (effect.type) {
    case 'add_chips':
      result.bonuses.push({
        source: joker.name,
        type: 'chips',
        value: effect.value,
      });
      break;

    case 'add_mult':
      result.bonuses.push({
        source: joker.name,
        type: 'mult',
        value: effect.value,
      });
      break;

    case 'multiply':
      result.bonuses.push({
        source: joker.name,
        type: 'xmult',
        value: effect.value,
      });
      break;

    case 'add_gold':
      result.goldToAdd = effect.value;
      break;

    case 'modify_slot':
      result.slotModifier = effect.modification;
      break;

    case 'modify_roulette':
      result.rouletteModifier = effect.modification;
      break;

    case 'retrigger':
      result.retriggerCount = effect.count;
      break;

    case 'custom':
      result.customHandler = effect.handler;
      break;

    default:
      // Exhaustive check - should never reach here
      break;
  }

  return result;
}

/**
 * Get bonuses from a joker effect (simplified version for M1)
 * Only returns AppliedBonus[], other effects are handled separately
 * @param joker - The joker whose effect to convert
 * @param _context - The current game context (unused in M1, will be used in M2)
 * @returns Array of applied bonuses
 */
export function getAppliedBonuses(
  joker: Joker,
  _context: JokerContext
): AppliedBonus[] {
  const effect = joker.effect;

  switch (effect.type) {
    case 'add_chips':
      return [{ source: joker.name, type: 'chips', value: effect.value }];

    case 'add_mult':
      return [{ source: joker.name, type: 'mult', value: effect.value }];

    case 'multiply':
      return [{ source: joker.name, type: 'xmult', value: effect.value }];

    case 'add_gold':
      // Gold is handled separately, not as a bonus
      return [];

    case 'modify_slot':
      // Slot modifiers are handled separately
      return [];

    case 'modify_roulette':
      // Roulette modifiers are handled separately
      return [];

    case 'retrigger':
      // Retrigger is handled in poker module
      return [];

    case 'custom':
      // Custom handlers will be implemented in M2
      return [];

    default:
      return [];
  }
}

/**
 * Check if a joker effect type produces score bonuses
 * @param effectType - The effect type to check
 * @returns true if the effect produces score bonuses
 */
export function isScoreBonusEffect(effectType: JokerEffect['type']): boolean {
  return (
    effectType === 'add_chips' ||
    effectType === 'add_mult' ||
    effectType === 'multiply'
  );
}

/**
 * Get slot modifiers from a joker (if applicable)
 * @param joker - The joker to check
 * @returns Slot modifiers or null
 */
export function getSlotModifier(joker: Joker): Partial<SlotModifiers> | null {
  if (joker.effect.type === 'modify_slot') {
    return joker.effect.modification;
  }
  return null;
}

/**
 * Get roulette modifiers from a joker (if applicable)
 * @param joker - The joker to check
 * @returns Roulette modifiers or null
 */
export function getRouletteModifier(
  joker: Joker
): Partial<SlotEffects['rouletteBonus']> | null {
  if (joker.effect.type === 'modify_roulette') {
    return joker.effect.modification;
  }
  return null;
}

/**
 * Get retrigger count from a joker (if applicable)
 * @param joker - The joker to check
 * @returns Retrigger count or 0
 */
export function getRetriggerCount(joker: Joker): number {
  if (joker.effect.type === 'retrigger') {
    return joker.effect.count;
  }
  return 0;
}
