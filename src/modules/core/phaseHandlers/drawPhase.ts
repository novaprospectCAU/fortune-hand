/**
 * Draw Phase Handler
 *
 * Handles drawing cards after the slot spin.
 */

import type { Card, Deck, SlotResult, GamePhase } from '@/types/interfaces';
import { draw, discard, shuffle } from '../moduleIntegration';

export interface DrawPhaseInput {
  deck: Deck;
  hand: Card[];
  slotResult: SlotResult | null;
  baseHandSize: number;
}

export interface DrawPhaseOutput {
  deck: Deck;
  hand: Card[];
  drawnCards: Card[];
}

/**
 * Execute draw phase logic
 */
export function executeDrawPhase(input: DrawPhaseInput): DrawPhaseOutput {
  let { deck, hand } = input;
  const { slotResult, baseHandSize } = input;

  // Apply slot penalties first (discard cards)
  const penaltyDiscard = slotResult?.effects.penalty.discardCards ?? 0;
  if (penaltyDiscard > 0 && hand.length > 0) {
    const cardsToDiscard = hand.slice(0, Math.min(penaltyDiscard, hand.length));
    deck = discard(deck, cardsToDiscard);
    hand = hand.filter(c => !cardsToDiscard.includes(c));
  }

  // Calculate draw count with slot bonus
  const extraDraw = slotResult?.effects.cardBonus.extraDraw ?? 0;
  const handSizeBonus = slotResult?.effects.cardBonus.handSize ?? 0;
  const maxHandSize = baseHandSize + handSizeBonus;
  const drawCount = Math.min(maxHandSize - hand.length, baseHandSize + extraDraw);

  // Reshuffle if needed
  if (deck.cards.length < drawCount && deck.discardPile.length > 0) {
    const reshuffled = shuffle([...deck.cards, ...deck.discardPile]);
    deck = { cards: reshuffled, discardPile: [] };
  }

  // Draw cards
  const actualDrawCount = Math.min(drawCount, deck.cards.length);
  const { drawn, deck: newDeck } = draw(deck, actualDrawCount);

  return {
    deck: newDeck,
    hand: [...hand, ...drawn],
    drawnCards: drawn,
  };
}

/**
 * Check if draw phase can be entered
 */
export function canEnterDrawPhase(currentPhase: GamePhase): boolean {
  return currentPhase === 'SLOT_PHASE';
}
