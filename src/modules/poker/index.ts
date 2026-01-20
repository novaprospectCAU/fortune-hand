/**
 * Poker Module - Public API
 *
 * 포커 핸드 판정 및 점수 계산 모듈
 *
 * @example
 * ```typescript
 * import { evaluateHand, calculateScore } from '@/modules/poker';
 *
 * const cards = [
 *   { id: 'A_hearts', rank: 'A', suit: 'hearts' },
 *   { id: 'K_hearts', rank: 'K', suit: 'hearts' },
 *   // ...
 * ];
 *
 * const handResult = evaluateHand(cards);
 * const scoreCalc = calculateScore(handResult, bonuses);
 * ```
 */

// Hand Evaluation
export { evaluateHand, compareHands, groupByRank, groupBySuit } from './handEvaluator';

// Scoring
export {
  calculateScore,
  calculateCardChips,
  getCardChipValue,
  formatScoreBreakdown,
  createEmptyScoreCalculation,
} from './scoring';

// Hand Ranks & Constants
export {
  BASE_HAND_VALUES,
  HAND_RANKINGS,
  CARD_CHIP_VALUES,
  HAND_TYPE_PRIORITY,
  getHandRanking,
  getBaseHandValue,
  rankToNumber,
  rankToChips,
  rankToNumberLow,
  compareHandTypes,
} from './handRanks';

// Re-export types for convenience
export type {
  Card,
  HandResult,
  HandType,
  ScoreCalculation,
  AppliedBonus,
  Rank,
  Suit,
} from '@/types/interfaces';
