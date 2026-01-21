/**
 * DeckViewer Component
 *
 * Modal that displays all cards in the current deck.
 */

import React from 'react';
import type { Card as CardType, Deck } from '@/types/interfaces';
import { Modal } from '../common/Modal';
import { Card } from '@/modules/cards/components/Card';

export interface DeckViewerProps {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sort cards by suit then rank
 */
function sortCards(cards: CardType[]): CardType[] {
  const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
  const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  return [...cards].sort((a, b) => {
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });
}

export function DeckViewer({ deck, isOpen, onClose }: DeckViewerProps): React.ReactElement {
  const sortedDeckCards = sortCards(deck.cards);
  const sortedDiscardCards = sortCards(deck.discardPile);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deck (${deck.cards.length} cards)`}
      size="xl"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {/* Deck Cards */}
        <div className="mb-6">
          <h3 className="text-sm text-slate-400 mb-3">
            Draw Pile ({deck.cards.length})
          </h3>
          {deck.cards.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sortedDeckCards.map((card) => (
                <Card key={card.id} card={card} size="sm" disabled />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No cards in draw pile</p>
          )}
        </div>

        {/* Discard Pile */}
        <div>
          <h3 className="text-sm text-slate-400 mb-3">
            Discard Pile ({deck.discardPile.length})
          </h3>
          {deck.discardPile.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sortedDiscardCards.map((card) => (
                <Card key={card.id} card={card} size="sm" disabled />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No cards in discard pile</p>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-game-border">
          <h4 className="text-xs text-slate-500 mb-2">Special Card Indicators</h4>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span><span className="text-purple-400">Purple border</span> = Wild</span>
            <span><span className="text-amber-400">Gold border</span> = Gold card</span>
            <span><span className="text-green-400">Green border</span> = Triggers Slot</span>
            <span><span className="text-blue-400">Blue border</span> = Triggers Roulette</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default DeckViewer;
