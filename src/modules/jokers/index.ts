/**
 * Jokers Module
 *
 * Public API for the jokers module
 *
 * This module provides:
 * - Joker data access (getJokerById, getAllJokers)
 * - Joker evaluation (evaluateJokers, evaluateJokersFull)
 * - Trigger checking (shouldTrigger)
 * - Effect application (applyEffect, getAppliedBonuses)
 * - UI components (JokerCard, JokerList)
 */

// Data access
export {
  getJokerById,
  getAllJokers,
  getJokersByRarity,
  getJokersByTriggerType,
  getJokerCount,
} from './jokerData';

// Trigger system
export {
  shouldTrigger,
  matchesCardCondition,
  cardMatchesCondition,
  matchesSymbolCondition,
  countMatchingCards,
  getMatchingCards,
} from './triggers';

// Effect system
export {
  applyEffect,
  getAppliedBonuses,
  isScoreBonusEffect,
  getSlotModifier,
  getRouletteModifier,
  getRetriggerCount,
} from './effects';
export type { EffectResult } from './effects';

// Joker manager (main evaluation)
export {
  evaluateJokers,
  evaluateJokersFull,
  getSlotModifiersFromJokers,
  getRouletteModifiersFromJokers,
  getRetriggerCountFromJokers,
  getTriggeredJokers,
} from './jokerManager';
export type { JokerEvaluationResult } from './jokerManager';

// UI Components
export { JokerCard, JokerList } from './components';
export type { JokerCardProps, JokerListProps } from './components';

// Re-export types from interfaces for convenience
export type {
  Joker,
  JokerTrigger,
  JokerEffect,
  JokerContext,
  CardCondition,
  AppliedBonus,
} from '@/types/interfaces';
