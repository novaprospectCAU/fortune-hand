/**
 * Roulette Phase Handler
 *
 * Handles the optional roulette multiplier spin.
 */

import type {
  RouletteResult,
  SlotResult,
  Joker,
  GamePhase,
} from '@/types/interfaces';
import {
  getDefaultRouletteConfig,
  rouletteSpin,
  applyRouletteBonuses,
  evaluateJokers,
} from '../moduleIntegration';

export interface RoulettePhaseInput {
  baseScore: number;
  slotResult: SlotResult | null;
  jokers: Joker[];
}

export interface RoulettePhaseOutput {
  rouletteResult: RouletteResult;
}

/**
 * Check if roulette is forced to be skipped (due to slot penalty)
 */
export function isRouletteSkipped(slotResult: SlotResult | null): boolean {
  return slotResult?.effects.penalty.skipRoulette ?? false;
}

/**
 * Execute roulette spin
 */
export function executeRouletteSpin(input: RoulettePhaseInput): RoulettePhaseOutput {
  const { baseScore, slotResult, jokers } = input;

  // Check if skipped by penalty
  if (isRouletteSkipped(slotResult)) {
    return {
      rouletteResult: createSkippedResult(baseScore),
    };
  }

  // Get base config
  let config = getDefaultRouletteConfig();

  // Apply slot bonuses
  if (slotResult) {
    config = applyRouletteBonuses(config, slotResult.effects.rouletteBonus);
  }

  // Evaluate jokers for roulette modifications (future use)
  evaluateJokers(jokers, {
    phase: 'ROULETTE_PHASE' as GamePhase,
  });

  // Spin the roulette
  const rouletteResult = rouletteSpin({
    baseScore,
    config,
  });

  return {
    rouletteResult,
  };
}

/**
 * Skip roulette and keep base score
 */
export function skipRoulette(baseScore: number): RoulettePhaseOutput {
  return {
    rouletteResult: createSkippedResult(baseScore),
  };
}

/**
 * Create a skipped roulette result
 */
function createSkippedResult(baseScore: number): RouletteResult {
  return {
    segment: {
      id: 'skip',
      multiplier: 1,
      probability: 100,
      color: '#888888',
    },
    finalScore: baseScore,
    wasSkipped: true,
  };
}

/**
 * Check if roulette phase can be entered
 */
export function canEnterRoulettePhase(currentPhase: GamePhase): boolean {
  return currentPhase === 'SCORE_PHASE';
}
