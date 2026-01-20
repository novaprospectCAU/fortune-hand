/**
 * Slot Phase Handler
 *
 * Handles the slot machine spin at the start of each turn.
 */

import type { SlotResult, Joker, GamePhase } from '@/types/interfaces';
import { spin, evaluateJokers } from '../moduleIntegration';

export interface SlotPhaseInput {
  jokers: Joker[];
}

export interface SlotPhaseOutput {
  slotResult: SlotResult;
  goldChange: number;
}

/**
 * Execute slot phase logic
 */
export function executeSlotPhase(input: SlotPhaseInput): SlotPhaseOutput {
  // Evaluate jokers for slot modifiers (future use)
  evaluateJokers(input.jokers, {
    phase: 'SLOT_PHASE' as GamePhase,
  });

  // Spin the slot machine
  const slotResult = spin();

  // Calculate gold change from instant effects and penalties
  const goldChange =
    slotResult.effects.instant.gold - slotResult.effects.penalty.loseGold;

  return {
    slotResult,
    goldChange,
  };
}

/**
 * Check if slot phase can be entered
 */
export function canEnterSlotPhase(currentPhase: GamePhase): boolean {
  return (
    currentPhase === 'IDLE' ||
    currentPhase === 'REWARD_PHASE' ||
    currentPhase === 'SHOP_PHASE'
  );
}
