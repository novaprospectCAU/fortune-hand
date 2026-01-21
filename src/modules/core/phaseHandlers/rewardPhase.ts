/**
 * Reward Phase Handler
 *
 * Handles applying final scores and determining round outcome.
 */

import type {
  Card,
  Deck,
  SlotResult,
  ScoreCalculation,
  RouletteResult,
  GamePhase,
} from '@/types/interfaces';
import { discard } from '../moduleIntegration';
import { calculateGoldFromEnhancements } from '@/modules/poker/scoring';

export interface RewardPhaseInput {
  currentScore: number;
  targetScore: number;
  gold: number;
  hand: Card[];
  deck: Deck;
  playedCards: Card[];
  slotResult: SlotResult | null;
  scoreCalculation: ScoreCalculation | null;
  rouletteResult: RouletteResult | null;
  handsRemaining: number;
}

export interface RewardPhaseOutput {
  newScore: number;
  newGold: number;
  hand: Card[];
  deck: Deck;
  handsRemaining: number;
  turnScore: number;
  isRoundComplete: boolean;
  isRoundSuccess: boolean;
}

/**
 * Execute reward phase logic
 */
export function executeRewardPhase(input: RewardPhaseInput): RewardPhaseOutput {
  const {
    currentScore,
    targetScore,
    gold,
    hand,
    deck,
    playedCards,
    slotResult,
    scoreCalculation,
    rouletteResult,
    handsRemaining,
  } = input;

  // Calculate turn score
  let turnScore = 0;
  if (rouletteResult && !rouletteResult.wasSkipped) {
    turnScore = rouletteResult.finalScore;
  } else if (scoreCalculation) {
    turnScore = scoreCalculation.finalScore;
  }

  // Add instant chips from slot
  turnScore += slotResult?.effects.instant.chips ?? 0;

  // Calculate gold changes
  const goldFromSlot = slotResult?.effects.instant.gold ?? 0;
  const goldPenalty = slotResult?.effects.penalty.loseGold ?? 0;

  // Calculate gold from card enhancements (gold seal)
  const goldFromEnhancements =
    scoreCalculation?.handResult.scoringCards
      ? calculateGoldFromEnhancements(scoreCalculation.handResult.scoringCards)
      : 0;

  const newGold = Math.max(0, gold + goldFromSlot + goldFromEnhancements - goldPenalty);

  // Update score
  const newScore = currentScore + turnScore;

  // Discard played cards
  const newHand = hand.filter(c => !playedCards.some(p => p.id === c.id));
  const newDeck = discard(deck, playedCards);

  // Calculate new hands remaining
  const newHandsRemaining = handsRemaining - 1;

  // Determine round outcome
  const isRoundComplete = newHandsRemaining <= 0 || newScore >= targetScore;
  const isRoundSuccess = newScore >= targetScore;

  return {
    newScore,
    newGold,
    hand: newHand,
    deck: newDeck,
    handsRemaining: newHandsRemaining,
    turnScore,
    isRoundComplete,
    isRoundSuccess,
  };
}

/**
 * Check if reward phase can be entered
 */
export function canEnterRewardPhase(currentPhase: GamePhase): boolean {
  return currentPhase === 'ROULETTE_PHASE';
}

/**
 * Determine next phase after reward
 */
export function getPhaseAfterReward(
  isRoundComplete: boolean,
  isRoundSuccess: boolean
): GamePhase {
  if (!isRoundComplete) {
    return 'SLOT_PHASE';
  }
  if (isRoundSuccess) {
    return 'SHOP_PHASE';
  }
  return 'GAME_OVER';
}
