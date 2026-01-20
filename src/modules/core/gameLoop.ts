/**
 * Game Loop - Phase Transitions and Game Flow
 *
 * Manages the game state machine and phase transitions.
 */

import type { GamePhase, GameState, GameConfig } from '@/types/interfaces';
import { DEFAULT_GAME_CONFIG } from '@/data/constants';
import roundsData from '@/data/rounds.json';

/**
 * Phase transition map
 * Defines the default next phase for each phase.
 * Special transitions (like REWARD_PHASE -> SHOP_PHASE) are handled conditionally.
 */
export const PHASE_TRANSITIONS: Record<GamePhase, GamePhase> = {
  IDLE: 'SLOT_PHASE',
  SLOT_PHASE: 'DRAW_PHASE',
  DRAW_PHASE: 'PLAY_PHASE',
  PLAY_PHASE: 'SCORE_PHASE',
  SCORE_PHASE: 'ROULETTE_PHASE',
  ROULETTE_PHASE: 'REWARD_PHASE',
  REWARD_PHASE: 'SLOT_PHASE', // May transition to SHOP_PHASE or GAME_OVER
  SHOP_PHASE: 'SLOT_PHASE', // Starts next round
  GAME_OVER: 'IDLE',
};

/**
 * Get the target score for a given round
 */
export function getTargetScoreForRound(round: number): number {
  const roundConfig = roundsData.rounds.find(r => r.round === round);
  if (roundConfig) {
    return roundConfig.targetScore;
  }
  // For endless mode (beyond round 8)
  const lastRound = roundsData.rounds[roundsData.rounds.length - 1];
  if (!lastRound) {
    return 300; // fallback
  }
  const additionalRounds = round - lastRound.round;
  return lastRound.targetScore + additionalRounds * roundsData.endlessScoreIncrement;
}

/**
 * Get round bonuses (extra hands/discards)
 */
export function getRoundBonuses(round: number): { handsBonus: number; discardsBonus: number } {
  const roundConfig = roundsData.rounds.find(r => r.round === round);
  if (roundConfig) {
    return {
      handsBonus: roundConfig.handsBonus,
      discardsBonus: roundConfig.discardsBonus,
    };
  }
  return { handsBonus: 0, discardsBonus: 0 };
}

/**
 * Get the next phase based on current state
 */
export function getNextPhase(state: GameState): GamePhase {
  const currentPhase = state.phase;

  // Special transition: REWARD_PHASE
  if (currentPhase === 'REWARD_PHASE') {
    // Check if round is complete (no more hands or target met)
    if (state.handsRemaining <= 0 || state.currentScore >= state.targetScore) {
      // Check if target was met
      if (state.currentScore >= state.targetScore) {
        return 'SHOP_PHASE';
      } else {
        return 'GAME_OVER';
      }
    }
    // Continue to next turn
    return 'SLOT_PHASE';
  }

  // Special transition: SHOP_PHASE starts new round
  if (currentPhase === 'SHOP_PHASE') {
    return 'SLOT_PHASE';
  }

  return PHASE_TRANSITIONS[currentPhase];
}

/**
 * Check if a phase transition is valid
 */
export function isValidTransition(from: GamePhase, to: GamePhase): boolean {
  // From IDLE, can only go to SLOT_PHASE
  if (from === 'IDLE') {
    return to === 'SLOT_PHASE';
  }

  // From GAME_OVER, can only go to IDLE
  if (from === 'GAME_OVER') {
    return to === 'IDLE';
  }

  // From REWARD_PHASE, can go to SLOT_PHASE, SHOP_PHASE, or GAME_OVER
  if (from === 'REWARD_PHASE') {
    return to === 'SLOT_PHASE' || to === 'SHOP_PHASE' || to === 'GAME_OVER';
  }

  // Standard transitions
  return PHASE_TRANSITIONS[from] === to;
}

/**
 * Create default game config with round scores
 */
export function createDefaultConfig(): GameConfig {
  const roundScores = roundsData.rounds.map(r => r.targetScore);

  return {
    startingGold: DEFAULT_GAME_CONFIG.startingGold,
    startingHands: DEFAULT_GAME_CONFIG.startingHands,
    startingDiscards: DEFAULT_GAME_CONFIG.startingDiscards,
    handSize: DEFAULT_GAME_CONFIG.handSize,
    maxJokers: DEFAULT_GAME_CONFIG.maxJokers,
    roundScores,
  };
}

/**
 * Create merged game config from partial config
 */
export function mergeGameConfig(partial?: Partial<GameConfig>): GameConfig {
  const defaultConfig = createDefaultConfig();
  if (!partial) {
    return defaultConfig;
  }
  return {
    ...defaultConfig,
    ...partial,
  };
}

/**
 * Check if an action is valid in the current phase
 */
export function isActionValidInPhase(action: string, phase: GamePhase): boolean {
  const validActions: Record<GamePhase, string[]> = {
    IDLE: ['startGame'],
    SLOT_PHASE: ['spinSlot'],
    DRAW_PHASE: [], // Drawing is automatic
    PLAY_PHASE: ['selectCard', 'deselectCard', 'playHand', 'discardSelected'],
    SCORE_PHASE: [], // Scoring is automatic
    ROULETTE_PHASE: ['spinRoulette', 'skipRoulette'],
    REWARD_PHASE: [], // Reward is automatic
    SHOP_PHASE: ['buyItem', 'rerollShop', 'leaveShop'],
    GAME_OVER: ['startGame'],
  };

  return validActions[phase]?.includes(action) ?? false;
}
