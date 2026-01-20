/**
 * Core Module - Public API
 *
 * This module manages the game state and flow.
 */

// Main store export
export { useGameStore } from './store';
export type { GameStore } from './store';

// Event system exports
export {
  createEventEmitter,
  getGameEventEmitter,
  resetGameEventEmitter,
} from './eventSystem';

// Game loop exports
export {
  PHASE_TRANSITIONS,
  getNextPhase,
  getTargetScoreForRound,
  getRoundBonuses,
  createDefaultConfig,
  mergeGameConfig,
  isActionValidInPhase,
  isValidTransition,
} from './gameLoop';

// Phase handler exports
export * from './phaseHandlers';

// Re-export types from interfaces for convenience
export type {
  GameState,
  GameActions,
  GameConfig,
  GamePhase,
  GameEvent,
  EventEmitter,
} from '@/types/interfaces';
