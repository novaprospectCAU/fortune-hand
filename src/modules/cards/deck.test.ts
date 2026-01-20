/**
 * Deck Management 테스트
 */

import { describe, it, expect } from 'vitest';
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
import { createStandardDeck, createCard, createInitialDeck } from './cardFactory';
import type { Deck, Card } from '@/types/interfaces';

describe('deck', () => {
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
      expect(shuffled[0].id).toBe('A_hearts');
    });
  });

  describe('shuffleWithSeed', () => {
    it('should produce the same result for the same seed', () => {
      const original = createStandardDeck();
      const seed = 12345;

      const result1 = shuffleWithSeed(original, seed);
      const result2 = shuffleWithSeed(original, seed);

      expect(result1.map((c) => c.id)).toEqual(result2.map((c) => c.id));
    });

    it('should produce different results for different seeds', () => {
      const original = createStandardDeck();

      const result1 = shuffleWithSeed(original, 12345);
      const result2 = shuffleWithSeed(original, 54321);

      expect(result1.map((c) => c.id)).not.toEqual(result2.map((c) => c.id));
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
      const deck: Deck = {
        cards: [],
        discardPile: [],
      };
      const cardsToDiscard = [
        createCard('A', 'hearts'),
        createCard('K', 'spades'),
      ];

      const newDeck = discard(deck, cardsToDiscard);

      expect(newDeck.discardPile).toHaveLength(2);
      expect(newDeck.discardPile.map((c) => c.id)).toContain('A_hearts');
      expect(newDeck.discardPile.map((c) => c.id)).toContain('K_spades');
    });

    it('should remove discarded cards from main deck', () => {
      const deck: Deck = {
        cards: [
          createCard('A', 'hearts'),
          createCard('K', 'spades'),
          createCard('Q', 'diamonds'),
        ],
        discardPile: [],
      };

      const newDeck = discard(deck, [createCard('K', 'spades')]);

      expect(newDeck.cards).toHaveLength(2);
      expect(newDeck.cards.map((c) => c.id)).not.toContain('K_spades');
    });

    it('should maintain immutability', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts')],
        discardPile: [],
      };
      const originalCardsLength = deck.cards.length;

      const newDeck = discard(deck, [createCard('A', 'hearts')]);

      expect(deck.cards).toHaveLength(originalCardsLength);
      expect(deck.discardPile).toHaveLength(0);
      expect(newDeck).not.toBe(deck);
    });

    it('should append to existing discard pile', () => {
      const deck: Deck = {
        cards: [],
        discardPile: [createCard('2', 'clubs')],
      };

      const newDeck = discard(deck, [createCard('3', 'clubs')]);

      expect(newDeck.discardPile).toHaveLength(2);
    });
  });

  describe('addToDeck', () => {
    it('should add cards to the bottom of the deck', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts')],
        discardPile: [],
      };

      const newDeck = addToDeck(deck, [createCard('K', 'spades')]);

      expect(newDeck.cards).toHaveLength(2);
      expect(newDeck.cards[0].id).toBe('A_hearts'); // 기존 카드가 맨 위
      expect(newDeck.cards[1].id).toBe('K_spades'); // 새 카드가 맨 아래
    });

    it('should maintain immutability', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts')],
        discardPile: [],
      };

      const newDeck = addToDeck(deck, [createCard('K', 'spades')]);

      expect(deck.cards).toHaveLength(1);
      expect(newDeck).not.toBe(deck);
    });

    it('should not modify discard pile', () => {
      const deck: Deck = {
        cards: [],
        discardPile: [createCard('Q', 'diamonds')],
      };

      const newDeck = addToDeck(deck, [createCard('K', 'spades')]);

      expect(newDeck.discardPile).toEqual(deck.discardPile);
    });
  });

  describe('removeFromDeck', () => {
    it('should remove cards from main deck', () => {
      const deck: Deck = {
        cards: [
          createCard('A', 'hearts'),
          createCard('K', 'spades'),
          createCard('Q', 'diamonds'),
        ],
        discardPile: [],
      };

      const newDeck = removeFromDeck(deck, ['K_spades']);

      expect(newDeck.cards).toHaveLength(2);
      expect(newDeck.cards.map((c) => c.id)).not.toContain('K_spades');
    });

    it('should remove cards from discard pile', () => {
      const deck: Deck = {
        cards: [],
        discardPile: [
          createCard('A', 'hearts'),
          createCard('K', 'spades'),
        ],
      };

      const newDeck = removeFromDeck(deck, ['A_hearts']);

      expect(newDeck.discardPile).toHaveLength(1);
      expect(newDeck.discardPile.map((c) => c.id)).not.toContain('A_hearts');
    });

    it('should remove from both piles simultaneously', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts')],
        discardPile: [createCard('K', 'spades')],
      };

      const newDeck = removeFromDeck(deck, ['A_hearts', 'K_spades']);

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
      const deck: Deck = {
        cards: [createCard('A', 'hearts'), createCard('K', 'spades')],
        discardPile: [],
      };

      const found = findCard(deck, 'A_hearts');

      expect(found).toBeDefined();
      expect(found?.id).toBe('A_hearts');
    });

    it('should find card in discard pile', () => {
      const deck: Deck = {
        cards: [],
        discardPile: [createCard('Q', 'diamonds')],
      };

      const found = findCard(deck, 'Q_diamonds');

      expect(found).toBeDefined();
      expect(found?.id).toBe('Q_diamonds');
    });

    it('should return undefined for non-existent card', () => {
      const deck: Deck = {
        cards: [createCard('A', 'hearts')],
        discardPile: [],
      };

      const found = findCard(deck, 'nonexistent');

      expect(found).toBeUndefined();
    });

    it('should prefer card in main deck over discard pile', () => {
      // 동일한 ID의 카드가 양쪽에 있는 경우 (정상적으로는 발생하지 않음)
      const card1 = createCard('A', 'hearts');
      const card2 = { ...createCard('A', 'hearts'), enhancement: { type: 'mult' as const, value: 4 } };

      const deck: Deck = {
        cards: [card1],
        discardPile: [card2],
      };

      const found = findCard(deck, 'A_hearts');

      // cards에서 먼저 찾으므로 enhancement가 없어야 함
      expect(found?.enhancement).toBeUndefined();
    });
  });
});
