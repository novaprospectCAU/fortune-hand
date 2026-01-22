/**
 * Deck Management 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  shuffle,
  shuffleWithSeed,
  draw,
  discard,
  addToDeck,
  removeFromDeck,
  resetAndShuffle,
  getTotalCardCount,
  findCard,
} from './deck';
import { createStandardDeck, createCard, createInitialDeck, resetCardIdCounter } from './cardFactory';
import type { Deck, Card } from '@/types/interfaces';

describe('deck', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  describe('shuffle', () => {
    it('should return a new array (immutability)', () => {
      const original = createStandardDeck();
      const shuffled = shuffle(original);

      expect(shuffled).not.toBe(original);
      expect(original).toHaveLength(52); // 원본 변경 없음
    });

    it('should maintain the same number of cards', () => {
      const original = createStandardDeck();
      const shuffled = shuffle(original);

      expect(shuffled).toHaveLength(original.length);
    });

    it('should contain all original cards', () => {
      const original = createStandardDeck();
      const shuffled = shuffle(original);

      const originalIds = new Set(original.map((c) => c.id));
      const shuffledIds = new Set(shuffled.map((c) => c.id));

      expect(shuffledIds).toEqual(originalIds);
    });

    it('should produce different orders on multiple shuffles', () => {
      const original = createStandardDeck();
      const results: string[][] = [];

      // 여러 번 셔플해서 결과 수집
      for (let i = 0; i < 5; i++) {
        results.push(shuffle(original).map((c) => c.id));
      }

      // 최소한 일부 결과가 다른지 확인
      const uniqueResults = new Set(results.map((r) => r.join(',')));
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should work with empty array', () => {
      const empty: Card[] = [];
      const shuffled = shuffle(empty);

      expect(shuffled).toEqual([]);
      expect(shuffled).not.toBe(empty);
    });

    it('should work with single card', () => {
      const single = [createCard('A', 'hearts')];
      const shuffled = shuffle(single);

      expect(shuffled).toHaveLength(1);
      expect(shuffled[0]!.rank).toBe('A');
      expect(shuffled[0]!.suit).toBe('hearts');
    });
  });

  describe('shuffleWithSeed', () => {
    it('should produce the same result for the same seed', () => {
      resetCardIdCounter();
      const original1 = createStandardDeck();
      resetCardIdCounter();
      const original2 = createStandardDeck();
      const seed = 12345;

      const result1 = shuffleWithSeed(original1, seed);
      const result2 = shuffleWithSeed(original2, seed);

      // Compare rank/suit combinations since IDs may differ
      expect(result1.map((c) => `${c.rank}_${c.suit}`)).toEqual(result2.map((c) => `${c.rank}_${c.suit}`));
    });

    it('should produce different results for different seeds', () => {
      resetCardIdCounter();
      const original1 = createStandardDeck();
      resetCardIdCounter();
      const original2 = createStandardDeck();

      const result1 = shuffleWithSeed(original1, 12345);
      const result2 = shuffleWithSeed(original2, 54321);

      expect(result1.map((c) => `${c.rank}_${c.suit}`)).not.toEqual(result2.map((c) => `${c.rank}_${c.suit}`));
    });

    it('should maintain immutability', () => {
      const original = createStandardDeck();
      const shuffled = shuffleWithSeed(original, 999);

      expect(shuffled).not.toBe(original);
      expect(original).toHaveLength(52);
    });
  });

  describe('draw', () => {
    it('should draw the requested number of cards', () => {
      const deck = createInitialDeck();
      const { drawn, deck: newDeck } = draw(deck, 5);

      expect(drawn).toHaveLength(5);
      expect(newDeck.cards).toHaveLength(47);
    });

    it('should draw from the top of the deck', () => {
      const deck = createInitialDeck();
      const topCards = deck.cards.slice(0, 3).map((c) => c.id);

      const { drawn } = draw(deck, 3);

      expect(drawn.map((c) => c.id)).toEqual(topCards);
    });

    it('should maintain immutability', () => {
      const deck = createInitialDeck();
      const originalLength = deck.cards.length;

      const { deck: newDeck } = draw(deck, 5);

      expect(deck.cards).toHaveLength(originalLength);
      expect(newDeck).not.toBe(deck);
    });

    it('should reshuffle discard pile when deck is empty', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts')],
        discardPile: [
          createCard('K', 'spades'),
          createCard('Q', 'diamonds'),
          createCard('J', 'clubs'),
        ],
      };

      const { drawn, deck: newDeck } = draw(deck, 3);

      expect(drawn).toHaveLength(3);
      expect(newDeck.discardPile).toEqual([]);
      // discard pile이 cards에 합쳐짐
      expect(newDeck.cards.length).toBe(1); // 4 - 3 = 1
    });

    it('should handle drawing more cards than available', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts'), createCard('K', 'spades')],
        discardPile: [],
      };

      const { drawn, deck: newDeck } = draw(deck, 5);

      expect(drawn).toHaveLength(2); // 가능한 만큼만
      expect(newDeck.cards).toHaveLength(0);
    });

    it('should handle drawing zero cards', () => {
      const deck = createInitialDeck();
      const { drawn, deck: newDeck } = draw(deck, 0);

      expect(drawn).toHaveLength(0);
      expect(newDeck.cards).toHaveLength(52);
    });

    it('should handle empty deck with empty discard pile', () => {
      const deck: Deck = { cards: [], discardPile: [] };
      const { drawn, deck: newDeck } = draw(deck, 5);

      expect(drawn).toHaveLength(0);
      expect(newDeck.cards).toHaveLength(0);
    });
  });

  describe('discard', () => {
    it('should move cards to discard pile', () => {
      const card1 = createCard('A', 'hearts');
      const card2 = createCard('K', 'spades');
      const deck: Deck = {
        cards: [],
        discardPile: [],
      };
      const cardsToDiscard = [card1, card2];

      const newDeck = discard(deck, cardsToDiscard);

      expect(newDeck.discardPile).toHaveLength(2);
      expect(newDeck.discardPile.some(c => c.rank === 'A' && c.suit === 'hearts')).toBe(true);
      expect(newDeck.discardPile.some(c => c.rank === 'K' && c.suit === 'spades')).toBe(true);
    });

    it('should remove discarded cards from main deck', () => {
      const cardA = createCard('A', 'hearts');
      const cardK = createCard('K', 'spades');
      const cardQ = createCard('Q', 'diamonds');
      const deck: Deck = {
        cards: [cardA, cardK, cardQ],
        discardPile: [],
      };

      const newDeck = discard(deck, [cardK]);

      expect(newDeck.cards).toHaveLength(2);
      expect(newDeck.cards.find(c => c.id === cardK.id)).toBeUndefined();
    });

    it('should maintain immutability', () => {
      const card = createCard('A', 'hearts');
      const deck: Deck = {
        cards: [card],
        discardPile: [],
      };
      const originalCardsLength = deck.cards.length;

      const newDeck = discard(deck, [card]);

      expect(deck.cards).toHaveLength(originalCardsLength);
      expect(deck.discardPile).toHaveLength(0);
      expect(newDeck).not.toBe(deck);
    });

    it('should append to existing discard pile', () => {
      const card2 = createCard('2', 'clubs');
      const card3 = createCard('3', 'clubs');
      const deck: Deck = {
        cards: [],
        discardPile: [card2],
      };

      const newDeck = discard(deck, [card3]);

      expect(newDeck.discardPile).toHaveLength(2);
    });
  });

  describe('addToDeck', () => {
    it('should add cards to the bottom of the deck', () => {
      const cardA = createCard('A', 'hearts');
      const cardK = createCard('K', 'spades');
      const deck: Deck = {
        cards: [cardA],
        discardPile: [],
      };

      const newDeck = addToDeck(deck, [cardK]);

      expect(newDeck.cards).toHaveLength(2);
      expect(newDeck.cards[0]!.rank).toBe('A'); // 기존 카드가 맨 위
      expect(newDeck.cards[1]!.rank).toBe('K'); // 새 카드가 맨 아래
    });

    it('should maintain immutability', () => {
      const cardA = createCard('A', 'hearts');
      const cardK = createCard('K', 'spades');
      const deck: Deck = {
        cards: [cardA],
        discardPile: [],
      };

      const newDeck = addToDeck(deck, [cardK]);

      expect(deck.cards).toHaveLength(1);
      expect(newDeck).not.toBe(deck);
    });

    it('should not modify discard pile', () => {
      const cardQ = createCard('Q', 'diamonds');
      const cardK = createCard('K', 'spades');
      const deck: Deck = {
        cards: [],
        discardPile: [cardQ],
      };

      const newDeck = addToDeck(deck, [cardK]);

      expect(newDeck.discardPile).toEqual(deck.discardPile);
    });
  });

  describe('removeFromDeck', () => {
    it('should remove cards from main deck', () => {
      const cardA = createCard('A', 'hearts');
      const cardK = createCard('K', 'spades');
      const cardQ = createCard('Q', 'diamonds');
      const deck: Deck = {
        cards: [cardA, cardK, cardQ],
        discardPile: [],
      };

      const newDeck = removeFromDeck(deck, [cardK.id]);

      expect(newDeck.cards).toHaveLength(2);
      expect(newDeck.cards.find(c => c.id === cardK.id)).toBeUndefined();
    });

    it('should remove cards from discard pile', () => {
      const cardA = createCard('A', 'hearts');
      const cardK = createCard('K', 'spades');
      const deck: Deck = {
        cards: [],
        discardPile: [cardA, cardK],
      };

      const newDeck = removeFromDeck(deck, [cardA.id]);

      expect(newDeck.discardPile).toHaveLength(1);
      expect(newDeck.discardPile.find(c => c.id === cardA.id)).toBeUndefined();
    });

    it('should remove from both piles simultaneously', () => {
      const cardA = createCard('A', 'hearts');
      const cardK = createCard('K', 'spades');
      const deck: Deck = {
        cards: [cardA],
        discardPile: [cardK],
      };

      const newDeck = removeFromDeck(deck, [cardA.id, cardK.id]);

      expect(newDeck.cards).toHaveLength(0);
      expect(newDeck.discardPile).toHaveLength(0);
    });
  });

  describe('resetAndShuffle', () => {
    it('should combine cards and discardPile', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts'), createCard('K', 'spades')],
        discardPile: [createCard('Q', 'diamonds'), createCard('J', 'clubs')],
      };

      const newDeck = resetAndShuffle(deck);

      expect(newDeck.cards).toHaveLength(4);
      expect(newDeck.discardPile).toHaveLength(0);
    });

    it('should shuffle the combined deck', () => {
      resetCardIdCounter();
      const deck: Deck = {
        cards: createStandardDeck().slice(0, 26),
        discardPile: createStandardDeck().slice(26),
      };

      const newDeck = resetAndShuffle(deck);
      const originalOrder = [...deck.cards, ...deck.discardPile].map((c) => c.id);

      // 대부분의 경우 순서가 바뀜 (확률적으로 거의 100%)
      expect(newDeck.cards.map((c) => c.id)).not.toEqual(originalOrder);
    });

    it('should maintain immutability', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts')],
        discardPile: [createCard('K', 'spades')],
      };

      const newDeck = resetAndShuffle(deck);

      expect(deck.cards).toHaveLength(1);
      expect(deck.discardPile).toHaveLength(1);
      expect(newDeck).not.toBe(deck);
    });
  });

  describe('getTotalCardCount', () => {
    it('should return sum of cards and discardPile', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts'), createCard('K', 'spades')],
        discardPile: [createCard('Q', 'diamonds')],
      };

      expect(getTotalCardCount(deck)).toBe(3);
    });

    it('should return 0 for empty deck', () => {
      const deck: Deck = { cards: [], discardPile: [] };
      expect(getTotalCardCount(deck)).toBe(0);
    });

    it('should return 52 for standard deck', () => {
      const deck = createInitialDeck();
      expect(getTotalCardCount(deck)).toBe(52);
    });
  });

  describe('findCard', () => {
    it('should find card in main deck', () => {
      const cardA = createCard('A', 'hearts');
      const cardK = createCard('K', 'spades');
      const deck: Deck = {
        cards: [cardA, cardK],
        discardPile: [],
      };

      const found = findCard(deck, cardA.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(cardA.id);
    });

    it('should find card in discard pile', () => {
      const cardQ = createCard('Q', 'diamonds');
      const deck: Deck = {
        cards: [],
        discardPile: [cardQ],
      };

      const found = findCard(deck, cardQ.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(cardQ.id);
    });

    it('should return undefined for non-existent card', () => {
      const cardA = createCard('A', 'hearts');
      const deck: Deck = {
        cards: [cardA],
        discardPile: [],
      };

      const found = findCard(deck, 'nonexistent');

      expect(found).toBeUndefined();
    });

    it('should prefer card in main deck over discard pile', () => {
      // 동일한 ID의 카드가 양쪽에 있는 경우 (정상적으로는 발생하지 않음)
      const card1 = createCard('A', 'hearts');
      const card2 = { ...card1, enhancement: { type: 'mult' as const, value: 4 } };

      const deck: Deck = {
        cards: [card1],
        discardPile: [card2],
      };

      const found = findCard(deck, card1.id);

      // cards에서 먼저 찾으므로 enhancement가 없어야 함
      expect(found?.enhancement).toBeUndefined();
    });
  });
});
