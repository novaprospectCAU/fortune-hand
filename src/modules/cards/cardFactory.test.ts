/**
 * Card Factory 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  createCard,
  createStandardDeck,
  createEmptyDeck,
  createInitialDeck,
} from './cardFactory';
import { RANKS, SUITS } from '@/data/constants';

describe('cardFactory', () => {
  describe('createCard', () => {
    it('should create a card with correct id format', () => {
      const card = createCard('A', 'hearts');

      expect(card.id).toBe('A_hearts');
      expect(card.rank).toBe('A');
      expect(card.suit).toBe('hearts');
    });

    it('should create cards for all ranks', () => {
      for (const rank of RANKS) {
        const card = createCard(rank, 'spades');
        expect(card.rank).toBe(rank);
        expect(card.id).toBe(`${rank}_spades`);
      }
    });

    it('should create cards for all suits', () => {
      for (const suit of SUITS) {
        const card = createCard('K', suit);
        expect(card.suit).toBe(suit);
        expect(card.id).toBe(`K_${suit}`);
      }
    });

    it('should not include special card properties by default', () => {
      const card = createCard('10', 'diamonds');

      expect(card.isWild).toBeUndefined();
      expect(card.isGold).toBeUndefined();
      expect(card.triggerSlot).toBeUndefined();
      expect(card.triggerRoulette).toBeUndefined();
      expect(card.enhancement).toBeUndefined();
    });
  });

  describe('createStandardDeck', () => {
    it('should create exactly 52 cards', () => {
      const deck = createStandardDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have no duplicate cards', () => {
      const deck = createStandardDeck();
      const ids = deck.map((card) => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(52);
    });

    it('should have 13 cards per suit', () => {
      const deck = createStandardDeck();

      for (const suit of SUITS) {
        const suitCards = deck.filter((card) => card.suit === suit);
        expect(suitCards).toHaveLength(13);
      }
    });

    it('should have 4 cards per rank', () => {
      const deck = createStandardDeck();

      for (const rank of RANKS) {
        const rankCards = deck.filter((card) => card.rank === rank);
        expect(rankCards).toHaveLength(4);
      }
    });

    it('should contain all expected card combinations', () => {
      const deck = createStandardDeck();
      const idSet = new Set(deck.map((c) => c.id));

      for (const suit of SUITS) {
        for (const rank of RANKS) {
          expect(idSet.has(`${rank}_${suit}`)).toBe(true);
        }
      }
    });

    it('should return a new array on each call', () => {
      const deck1 = createStandardDeck();
      const deck2 = createStandardDeck();

      expect(deck1).not.toBe(deck2);
      expect(deck1).toEqual(deck2);
    });
  });

  describe('createEmptyDeck', () => {
    it('should create a deck with empty cards array', () => {
      const deck = createEmptyDeck();
      expect(deck.cards).toEqual([]);
    });

    it('should create a deck with empty discardPile', () => {
      const deck = createEmptyDeck();
      expect(deck.discardPile).toEqual([]);
    });
  });

  describe('createInitialDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createInitialDeck();
      expect(deck.cards).toHaveLength(52);
    });

    it('should create a deck with empty discardPile', () => {
      const deck = createInitialDeck();
      expect(deck.discardPile).toEqual([]);
    });

    it('should have the same cards as createStandardDeck', () => {
      const deck = createInitialDeck();
      const standardDeck = createStandardDeck();

      expect(deck.cards).toEqual(standardDeck);
    });
  });
});
