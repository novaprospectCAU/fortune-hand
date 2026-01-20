/**
 * Joker Trigger System
 *
 * Determines whether a joker should trigger based on the current game context
 */

import type {
  Joker,
  JokerContext,
  CardCondition,
  Card,
  SlotResult,
  SlotSymbol,
  Rank,
} from '@/types/interfaces';
import { RANK_VALUES } from '@/data/constants';

/**
 * Check if a joker should trigger based on the current context
 * @param joker - The joker to check
 * @param context - The current game context
 * @returns true if the joker should trigger
 */
export function shouldTrigger(joker: Joker, context: JokerContext): boolean {
  const trigger = joker.trigger;

  switch (trigger.type) {
    case 'on_score':
      return context.phase === 'SCORE_PHASE';

    case 'on_play':
      return (
        context.phase === 'PLAY_PHASE' &&
        matchesCardCondition(context.playedCards, trigger.cardCondition)
      );

    case 'on_slot':
      return (
        context.phase === 'SLOT_PHASE' &&
        matchesSymbolCondition(context.slotResult, trigger.symbolCondition)
      );

    case 'on_roulette':
      return context.phase === 'ROULETTE_PHASE';

    case 'passive':
      return true;

    default:
      // Exhaustive check - should never reach here
      return false;
  }
}

/**
 * Check if played cards match the card condition
 * @param cards - The cards that were played
 * @param condition - The condition to match
 * @returns true if any card matches the condition (or no condition specified)
 */
export function matchesCardCondition(
  cards: Card[] | undefined,
  condition: CardCondition | undefined
): boolean {
  // If no condition, always match
  if (!condition) {
    return true;
  }

  // If no cards, cannot match any condition
  if (!cards || cards.length === 0) {
    return false;
  }

  // Check if any card matches all specified conditions
  return cards.some((card) => cardMatchesCondition(card, condition));
}

/**
 * Check if a single card matches the condition
 * @param card - The card to check
 * @param condition - The condition to match
 * @returns true if the card matches all specified parts of the condition
 */
export function cardMatchesCondition(
  card: Card,
  condition: CardCondition
): boolean {
  // Check suit condition
  if (condition.suit !== undefined && card.suit !== condition.suit) {
    return false;
  }

  // Check rank condition (exact match)
  if (condition.rank !== undefined && card.rank !== condition.rank) {
    return false;
  }

  // Check minRank condition
  if (condition.minRank !== undefined) {
    const cardValue = getRankValue(card.rank);
    if (cardValue < condition.minRank) {
      return false;
    }
  }

  // Check maxRank condition
  if (condition.maxRank !== undefined) {
    const cardValue = getRankValue(card.rank);
    if (cardValue > condition.maxRank) {
      return false;
    }
  }

  return true;
}

/**
 * Get the numeric value of a rank for comparison
 * @param rank - The rank to convert
 * @returns The numeric value
 */
function getRankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

/**
 * Check if slot result matches the symbol condition
 * @param result - The slot result
 * @param symbol - The symbol condition to match
 * @returns true if any symbol in the result matches (or no condition specified)
 */
export function matchesSymbolCondition(
  result: SlotResult | undefined,
  symbol: SlotSymbol | undefined
): boolean {
  // If no symbol condition, always match
  if (!symbol) {
    return true;
  }

  // If no result, cannot match any condition
  if (!result) {
    return false;
  }

  // Check if any of the three symbols match
  return result.symbols.includes(symbol);
}

/**
 * Count how many cards in the array match the condition
 * @param cards - The cards to check
 * @param condition - The condition to match
 * @returns The number of matching cards
 */
export function countMatchingCards(
  cards: Card[],
  condition: CardCondition
): number {
  return cards.filter((card) => cardMatchesCondition(card, condition)).length;
}

/**
 * Get all cards that match the condition
 * @param cards - The cards to check
 * @param condition - The condition to match
 * @returns Array of matching cards
 */
export function getMatchingCards(
  cards: Card[],
  condition: CardCondition
): Card[] {
  return cards.filter((card) => cardMatchesCondition(card, condition));
}
