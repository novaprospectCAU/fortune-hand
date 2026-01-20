/**
 * Play Phase Handler
 *
 * Handles card selection and playing.
 */

import type { Card, Deck, GamePhase } from '@/types/interfaces';
import { discard, draw, shuffle } from '../moduleIntegration';
import { DEFAULT_GAME_CONFIG } from '@/data/constants';

export interface PlayPhaseInput {
  hand: Card[];
  selectedCards: Card[];
  deck: Deck;
  discardsRemaining: number;
}

export interface SelectCardResult {
  success: boolean;
  selectedCards: Card[];
  error?: string;
}

export interface DiscardResult {
  success: boolean;
  hand: Card[];
  deck: Deck;
  discardsRemaining: number;
  drawnCards: Card[];
  error?: string;
}

/**
 * Select a card from hand
 */
export function selectCard(input: PlayPhaseInput, cardId: string): SelectCardResult {
  const card = input.hand.find(c => c.id === cardId);

  if (!card) {
    return {
      success: false,
      selectedCards: input.selectedCards,
      error: 'Card not found in hand',
    };
  }

  if (input.selectedCards.some(c => c.id === cardId)) {
    return {
      success: false,
      selectedCards: input.selectedCards,
      error: 'Card already selected',
    };
  }

  if (input.selectedCards.length >= DEFAULT_GAME_CONFIG.maxSelectCards) {
    return {
      success: false,
      selectedCards: input.selectedCards,
      error: 'Maximum cards selected',
    };
  }

  return {
    success: true,
    selectedCards: [...input.selectedCards, card],
  };
}

/**
 * Deselect a card
 */
export function deselectCard(input: PlayPhaseInput, cardId: string): SelectCardResult {
  if (!input.selectedCards.some(c => c.id === cardId)) {
    return {
      success: false,
      selectedCards: input.selectedCards,
      error: 'Card not selected',
    };
  }

  return {
    success: true,
    selectedCards: input.selectedCards.filter(c => c.id !== cardId),
  };
}

/**
 * Discard selected cards and draw new ones
 */
export function discardSelected(input: PlayPhaseInput): DiscardResult {
  if (input.selectedCards.length === 0) {
    return {
      success: false,
      hand: input.hand,
      deck: input.deck,
      discardsRemaining: input.discardsRemaining,
      drawnCards: [],
      error: 'No cards selected',
    };
  }

  if (input.discardsRemaining <= 0) {
    return {
      success: false,
      hand: input.hand,
      deck: input.deck,
      discardsRemaining: input.discardsRemaining,
      drawnCards: [],
      error: 'No discards remaining',
    };
  }

  // Remove selected cards from hand
  const newHand = input.hand.filter(
    c => !input.selectedCards.some(s => s.id === c.id)
  );

  // Add to discard pile
  let newDeck = discard(input.deck, input.selectedCards);

  // Reshuffle if needed
  const drawCount = input.selectedCards.length;
  if (newDeck.cards.length < drawCount && newDeck.discardPile.length > 0) {
    const reshuffled = shuffle([...newDeck.cards, ...newDeck.discardPile]);
    newDeck = { cards: reshuffled, discardPile: [] };
  }

  // Draw new cards
  const { drawn, deck: finalDeck } = draw(newDeck, drawCount);

  return {
    success: true,
    hand: [...newHand, ...drawn],
    deck: finalDeck,
    discardsRemaining: input.discardsRemaining - 1,
    drawnCards: drawn,
  };
}

/**
 * Validate that selected cards can be played
 */
export function canPlayHand(selectedCards: Card[]): { valid: boolean; error?: string } {
  if (selectedCards.length === 0) {
    return { valid: false, error: 'No cards selected' };
  }

  if (selectedCards.length > DEFAULT_GAME_CONFIG.maxSelectCards) {
    return { valid: false, error: 'Too many cards selected' };
  }

  return { valid: true };
}

/**
 * Check if play phase can be entered
 */
export function canEnterPlayPhase(currentPhase: GamePhase): boolean {
  return currentPhase === 'DRAW_PHASE';
}
