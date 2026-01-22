/**
 * Card Factory 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCard,
  createStandardDeck,
  createEmptyDeck,
  createInitialDeck,
  resetCardIdCounter,
} from './cardFactory';
import { RANKS, SUITS } from '@/data/constants';

describe('cardFactory', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  describe('createCard', () => {
    it('should create a card with correct id format', () => {
      const card = createCard('A', 'hearts');

      // ID format: {rank}_{suit}_{counter}
      expect(card.id).toMatch(/^A_hearts_\d+$/);
      expect(card.rank).toBe('A');
      expect(card.suit).toBe('hearts');
    });

    it('should create cards for all ranks', () => {
      for (const rank of RANKS) {
        const card = createCard(rank, 'spades');
        expect(card.rank).toBe(rank);
        expect(card.id).toMatch(new RegExp(`^${rank}_spades_\\d+$`));
      }
    });

    it('should create cards for all suits', () => {
      for (const suit of SUITS) {
        const card = createCard('K', suit);
        expect(card.suit).toBe(suit);
        expect(card.id).toMatch(new RegExp(`^K_${suit}_\\d+$`));
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

    it('should generate unique IDs for each card', () => {
      const card1 = createCard('A', 'hearts');
      const card2 = createCard('A', 'hearts');
      expect(card1.id).not.toBe(card2.id);
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

    it('should contain all expected rank and suit combinations', () => {
      const deck = createStandardDeck();

      for (const suit of SUITS) {
        for (const rank of RANKS) {
          const found = deck.find((c) => c.rank === rank && c.suit === suit);
          expect(found).toBeDefined();
        }
      }
    });

    it('should return a new array on each call', () => {
      resetCardIdCounter();
      const deck1 = createStandardDeck();
      resetCardIdCounter();
      const deck2 = createStandardDeck();

      expect(deck1).not.toBe(deck2);
      // Cards should have same rank/suit but different IDs due to counter
      expect(deck1.map(c => `${c.rank}_${c.suit}`)).toEqual(deck2.map(c => `${c.rank}_${c.suit}`));
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

    it('should have the same rank/suit combinations as createStandardDeck', () => {
      resetCardIdCounter();
      const deck = createInitialDeck();
      resetCardIdCounter();
      const standardDeck = createStandardDeck();

      const deckCombos = deck.cards.map(c => `${c.rank}_${c.suit}`);
      const standardCombos = standardDeck.map(c => `${c.rank}_${c.suit}`);

      expect(deckCombos).toEqual(standardCombos);
    });
  });
});
