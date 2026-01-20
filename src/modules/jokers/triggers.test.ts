/**
 * Tests for triggers module
 */

import { describe, it, expect } from 'vitest';
import {
  shouldTrigger,
  matchesCardCondition,
  cardMatchesCondition,
  matchesSymbolCondition,
  countMatchingCards,
  getMatchingCards,
} from './triggers';
import type { Joker, JokerContext, Card, SlotResult } from '@/types/interfaces';

// Helper to create test cards
function createCard(
  rank: Card['rank'],
  suit: Card['suit'],
  id?: string
): Card {
  return {
    id: id ?? `${rank}_${suit}`,
    rank,
    suit,
  };
}

// Helper to create test joker
function createJoker(
  trigger: Joker['trigger'],
  effect: Joker['effect'] = { type: 'add_mult', value: 1 }
): Joker {
  return {
    id: 'test_joker',
    name: 'Test Joker',
    description: 'Test description',
    rarity: 'common',
    cost: 10,
    trigger,
    effect,
  };
}

// Helper to create test context
function createContext(overrides: Partial<JokerContext> = {}): JokerContext {
  return {
    phase: 'IDLE',
    ...overrides,
  };
}

// Helper to create slot result
function createSlotResult(
  symbols: [string, string, string]
): SlotResult {
  return {
    symbols: symbols as SlotResult['symbols'],
    isJackpot: false,
    effects: {
      cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 1 },
      rouletteBonus: { safeZoneBonus: 0, maxMultiplier: 0, freeSpins: 0 },
      instant: { gold: 0, chips: 0 },
      penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
    },
  };
}

describe('triggers', () => {
  describe('shouldTrigger', () => {
    describe('on_score trigger', () => {
      it('should trigger during SCORE_PHASE', () => {
        const joker = createJoker({ type: 'on_score' });
        const context = createContext({ phase: 'SCORE_PHASE' });
        expect(shouldTrigger(joker, context)).toBe(true);
      });

      it('should not trigger during other phases', () => {
        const joker = createJoker({ type: 'on_score' });
        const phases = [
          'IDLE',
          'SLOT_PHASE',
          'DRAW_PHASE',
          'PLAY_PHASE',
          'ROULETTE_PHASE',
        ] as const;

        phases.forEach((phase) => {
          const context = createContext({ phase });
          expect(shouldTrigger(joker, context)).toBe(false);
        });
      });
    });

    describe('on_play trigger', () => {
      it('should trigger during PLAY_PHASE without condition', () => {
        const joker = createJoker({ type: 'on_play' });
        const context = createContext({
          phase: 'PLAY_PHASE',
          playedCards: [createCard('7', 'hearts')],
        });
        expect(shouldTrigger(joker, context)).toBe(true);
      });

      it('should trigger when card condition matches', () => {
        const joker = createJoker({
          type: 'on_play',
          cardCondition: { rank: '7' },
        });
        const context = createContext({
          phase: 'PLAY_PHASE',
          playedCards: [createCard('7', 'hearts')],
        });
        expect(shouldTrigger(joker, context)).toBe(true);
      });

      it('should not trigger when card condition does not match', () => {
        const joker = createJoker({
          type: 'on_play',
          cardCondition: { rank: '7' },
        });
        const context = createContext({
          phase: 'PLAY_PHASE',
          playedCards: [createCard('K', 'hearts')],
        });
        expect(shouldTrigger(joker, context)).toBe(false);
      });

      it('should not trigger during other phases', () => {
        const joker = createJoker({ type: 'on_play' });
        const context = createContext({
          phase: 'SCORE_PHASE',
          playedCards: [createCard('7', 'hearts')],
        });
        expect(shouldTrigger(joker, context)).toBe(false);
      });
    });

    describe('on_slot trigger', () => {
      it('should trigger during SLOT_PHASE without condition', () => {
        const joker = createJoker({ type: 'on_slot' });
        const context = createContext({
          phase: 'SLOT_PHASE',
          slotResult: createSlotResult(['gold', 'gold', 'gold']),
        });
        expect(shouldTrigger(joker, context)).toBe(true);
      });

      it('should trigger when symbol condition matches', () => {
        const joker = createJoker({
          type: 'on_slot',
          symbolCondition: 'star',
        });
        const context = createContext({
          phase: 'SLOT_PHASE',
          slotResult: createSlotResult(['star', 'gold', 'chip']),
        });
        expect(shouldTrigger(joker, context)).toBe(true);
      });

      it('should not trigger when symbol condition does not match', () => {
        const joker = createJoker({
          type: 'on_slot',
          symbolCondition: 'star',
        });
        const context = createContext({
          phase: 'SLOT_PHASE',
          slotResult: createSlotResult(['gold', 'gold', 'chip']),
        });
        expect(shouldTrigger(joker, context)).toBe(false);
      });
    });

    describe('on_roulette trigger', () => {
      it('should trigger during ROULETTE_PHASE', () => {
        const joker = createJoker({ type: 'on_roulette' });
        const context = createContext({ phase: 'ROULETTE_PHASE' });
        expect(shouldTrigger(joker, context)).toBe(true);
      });

      it('should not trigger during other phases', () => {
        const joker = createJoker({ type: 'on_roulette' });
        const context = createContext({ phase: 'SLOT_PHASE' });
        expect(shouldTrigger(joker, context)).toBe(false);
      });
    });

    describe('passive trigger', () => {
      it('should always trigger regardless of phase', () => {
        const joker = createJoker({ type: 'passive' });
        const phases = [
          'IDLE',
          'SLOT_PHASE',
          'DRAW_PHASE',
          'PLAY_PHASE',
          'SCORE_PHASE',
          'ROULETTE_PHASE',
        ] as const;

        phases.forEach((phase) => {
          const context = createContext({ phase });
          expect(shouldTrigger(joker, context)).toBe(true);
        });
      });
    });
  });

  describe('matchesCardCondition', () => {
    it('should return true when no condition is specified', () => {
      const cards = [createCard('K', 'hearts')];
      expect(matchesCardCondition(cards, undefined)).toBe(true);
    });

    it('should return false when cards is undefined', () => {
      expect(matchesCardCondition(undefined, { rank: '7' })).toBe(false);
    });

    it('should return false when cards is empty', () => {
      expect(matchesCardCondition([], { rank: '7' })).toBe(false);
    });

    it('should return true when any card matches', () => {
      const cards = [
        createCard('K', 'hearts'),
        createCard('7', 'diamonds'),
        createCard('A', 'spades'),
      ];
      expect(matchesCardCondition(cards, { rank: '7' })).toBe(true);
    });

    it('should return false when no card matches', () => {
      const cards = [
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds'),
        createCard('A', 'spades'),
      ];
      expect(matchesCardCondition(cards, { rank: '7' })).toBe(false);
    });
  });

  describe('cardMatchesCondition', () => {
    it('should match by suit', () => {
      const card = createCard('K', 'diamonds');
      expect(cardMatchesCondition(card, { suit: 'diamonds' })).toBe(true);
      expect(cardMatchesCondition(card, { suit: 'hearts' })).toBe(false);
    });

    it('should match by rank', () => {
      const card = createCard('7', 'hearts');
      expect(cardMatchesCondition(card, { rank: '7' })).toBe(true);
      expect(cardMatchesCondition(card, { rank: 'K' })).toBe(false);
    });

    it('should match by minRank', () => {
      const card = createCard('10', 'hearts'); // value 10
      expect(cardMatchesCondition(card, { minRank: 8 })).toBe(true);
      expect(cardMatchesCondition(card, { minRank: 10 })).toBe(true);
      expect(cardMatchesCondition(card, { minRank: 11 })).toBe(false);
    });

    it('should match by maxRank', () => {
      const card = createCard('10', 'hearts'); // value 10
      expect(cardMatchesCondition(card, { maxRank: 12 })).toBe(true);
      expect(cardMatchesCondition(card, { maxRank: 10 })).toBe(true);
      expect(cardMatchesCondition(card, { maxRank: 9 })).toBe(false);
    });

    it('should match combined conditions', () => {
      const card = createCard('K', 'diamonds'); // value 13
      expect(
        cardMatchesCondition(card, { suit: 'diamonds', minRank: 10 })
      ).toBe(true);
      expect(
        cardMatchesCondition(card, { suit: 'hearts', minRank: 10 })
      ).toBe(false);
    });

    it('should handle Ace correctly', () => {
      const ace = createCard('A', 'spades'); // value 14
      expect(cardMatchesCondition(ace, { minRank: 14 })).toBe(true);
      expect(cardMatchesCondition(ace, { maxRank: 14 })).toBe(true);
    });
  });

  describe('matchesSymbolCondition', () => {
    it('should return true when no condition is specified', () => {
      const result = createSlotResult(['gold', 'chip', 'skull']);
      expect(matchesSymbolCondition(result, undefined)).toBe(true);
    });

    it('should return false when result is undefined', () => {
      expect(matchesSymbolCondition(undefined, 'star')).toBe(false);
    });

    it('should return true when symbol is in result', () => {
      const result = createSlotResult(['gold', 'star', 'chip']);
      expect(matchesSymbolCondition(result, 'star')).toBe(true);
    });

    it('should return false when symbol is not in result', () => {
      const result = createSlotResult(['gold', 'gold', 'chip']);
      expect(matchesSymbolCondition(result, 'star')).toBe(false);
    });
  });

  describe('countMatchingCards', () => {
    it('should count cards matching the condition', () => {
      const cards = [
        createCard('7', 'hearts'),
        createCard('7', 'diamonds'),
        createCard('K', 'spades'),
      ];
      expect(countMatchingCards(cards, { rank: '7' })).toBe(2);
    });

    it('should return 0 when no cards match', () => {
      const cards = [
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds'),
      ];
      expect(countMatchingCards(cards, { rank: '7' })).toBe(0);
    });

    it('should count by suit', () => {
      const cards = [
        createCard('7', 'diamonds'),
        createCard('K', 'diamonds'),
        createCard('A', 'diamonds'),
        createCard('Q', 'hearts'),
      ];
      expect(countMatchingCards(cards, { suit: 'diamonds' })).toBe(3);
    });
  });

  describe('getMatchingCards', () => {
    it('should return cards matching the condition', () => {
      const cards = [
        createCard('7', 'hearts'),
        createCard('7', 'diamonds'),
        createCard('K', 'spades'),
      ];
      const matching = getMatchingCards(cards, { rank: '7' });
      expect(matching).toHaveLength(2);
      expect(matching.every((c) => c.rank === '7')).toBe(true);
    });

    it('should return empty array when no cards match', () => {
      const cards = [
        createCard('K', 'hearts'),
        createCard('Q', 'diamonds'),
      ];
      const matching = getMatchingCards(cards, { rank: '7' });
      expect(matching).toHaveLength(0);
    });
  });
});
