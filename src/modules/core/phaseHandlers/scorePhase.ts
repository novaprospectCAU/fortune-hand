/**
 * Score Phase Handler
 *
 * Handles poker hand evaluation and score calculation.
 */

import type {
  Card,
  HandResult,
  ScoreCalculation,
  AppliedBonus,
  Joker,
  SlotResult,
  GamePhase,
} from '@/types/interfaces';
import { evaluateHand, calculateScore, evaluateJokers } from '../moduleIntegration';

export interface ScorePhaseInput {
  playedCards: Card[];
  jokers: Joker[];
  slotResult: SlotResult | null;
}

export interface ScorePhaseOutput {
  handResult: HandResult;
  scoreCalculation: ScoreCalculation;
}

/**
 * Execute score phase logic
 */
export function executeScorePhase(input: ScorePhaseInput): ScorePhaseOutput {
  const { playedCards, jokers, slotResult } = input;

  // Evaluate the poker hand
  const handResult = evaluateHand(playedCards);

  // Collect all bonuses
  const bonuses: AppliedBonus[] = [];

  // Get joker bonuses
  const jokerBonuses = evaluateJokers(jokers, {
    phase: 'SCORE_PHASE' as GamePhase,
    playedCards,
    handResult,
    slotResult: slotResult ?? undefined,
  });
  bonuses.push(...jokerBonuses);

  // Apply slot score multiplier
  const slotMultiplier = slotResult?.effects.cardBonus.scoreMultiplier ?? 1;
  if (slotMultiplier !== 1) {
    bonuses.push({
      source: 'Slot Bonus',
      type: 'xmult',
      value: slotMultiplier,
    });
  }

  // Calculate final score
  const scoreCalculation = calculateScore(handResult, bonuses);

  return {
    handResult,
    scoreCalculation,
  };
}

/**
 * Check if score phase can be entered
 */
export function canEnterScorePhase(currentPhase: GamePhase): boolean {
  return currentPhase === 'PLAY_PHASE';
}
