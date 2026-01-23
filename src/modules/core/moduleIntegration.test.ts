/**
 * Module Integration Tests
 *
 * Tests for the internal module integrations.
 */

import { describe, it, expect } from 'vitest';
import {
  createStandardDeck,
  shuffle,
  draw,
  discard,
  addToDeck,
  spin,
  evaluateHand,
  calculateScore,
  getDefaultRouletteConfig,
  rouletteSpin,
  applyRouletteBonuses,
  evaluateJokers,
  generateShop,
  buyItem,
  rerollShop,
} from './moduleIntegration';
import type { Card, Deck, AppliedBonus, Joker, SlotEffects } from '@/types/interfaces';

describe('Cards Module Integration', () => {
  describe('createStandardDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createStandardDeck();
      expect(deck.length).toBe(52);
    });

    it('should have all suits', () => {
      const deck = createStandardDeck();
      const suits = new Set(deck.map(c => c.suit));
      expect(suits.size).toBe(4);
      expect(suits.has('hearts')).toBe(true);
      expect(suits.has('diamonds')).toBe(true);
      expect(suits.has('clubs')).toBe(true);
      expect(suits.has('spades')).toBe(true);
    });

    it('should have all ranks', () => {
      const deck = createStandardDeck();
      const ranks = new Set(deck.map(c => c.rank));
      expect(ranks.size).toBe(13);
    });

    it('should have unique card IDs', () => {
      const deck = createStandardDeck();
      const ids = new Set(deck.map(c => c.id));
      expect(ids.size).toBe(52);
    });
  });

  describe('shuffle', () => {
    it('should return array of same length', () => {
      const deck = createStandardDeck();
      const shuffled = shuffle(deck);
      expect(shuffled.length).toBe(deck.length);
    });

    it('should contain all original elements', () => {
      const deck = createStandardDeck();
      const shuffled = shuffle(deck);
      const originalIds = new Set(deck.map(c => c.id));
      const shuffledIds = new Set(shuffled.map(c => c.id));
      expect(shuffledIds).toEqual(originalIds);
    });

    it('should not modify original array', () => {
      const deck = createStandardDeck();
      const originalFirst = deck[0];
      shuffle(deck);
      expect(deck[0]).toBe(originalFirst);
    });
  });

  describe('draw', () => {
    it('should draw specified number of cards', () => {
      const deck: Deck = { cards: createStandardDeck(), discardPile: [] };
      const { drawn, deck: newDeck } = draw(deck, 5);

      expect(drawn.length).toBe(5);
      expect(newDeck.cards.length).toBe(47);
    });

    it('should not draw more cards than available', () => {
      const deck: Deck = { cards: createStandardDeck().slice(0, 3), discardPile: [] };
      const { drawn, deck: newDeck } = draw(deck, 5);

      expect(drawn.length).toBe(3);
      expect(newDeck.cards.length).toBe(0);
    });

    it('should preserve discard pile', () => {
      const discardPile = createStandardDeck().slice(0, 3);
      const deck: Deck = { cards: createStandardDeck(), discardPile };
      const { deck: newDeck } = draw(deck, 5);

      expect(newDeck.discardPile.length).toBe(3);
    });
  });

  describe('discard', () => {
    it('should add cards to discard pile', () => {
      const deck: Deck = { cards: createStandardDeck(), discardPile: [] };
      const toDiscard = deck.cards.slice(0, 3);
      const newDeck = discard(deck, toDiscard);

      expect(newDeck.discardPile.length).toBe(3);
      expect(newDeck.discardPile).toEqual(toDiscard);
    });

    it('should preserve existing discard pile', () => {
      const existingDiscard = createStandardDeck().slice(0, 2);
      const deck: Deck = { cards: createStandardDeck(), discardPile: existingDiscard };
      const toDiscard = deck.cards.slice(0, 3);
      const newDeck = discard(deck, toDiscard);

      expect(newDeck.discardPile.length).toBe(5);
    });
  });

  describe('addToDeck', () => {
    it('should add cards to deck', () => {
      const deck: Deck = { cards: [], discardPile: [] };
      const cards = createStandardDeck().slice(0, 5);
      const newDeck = addToDeck(deck, cards);

      expect(newDeck.cards.length).toBe(5);
    });
  });
});

describe('Slots Module Integration', () => {
  describe('spin', () => {
    it('should return a slot result', () => {
      const result = spin();
      expect(result.symbols).toBeDefined();
      expect(result.symbols.length).toBe(3);
      expect(result.isJackpot).toBeDefined();
      expect(result.effects).toBeDefined();
    });

    it('should return valid symbols', () => {
      const validSymbols = ['card', 'target', 'gold', 'chip', 'star', 'skull', 'wild'];
      const result = spin();

      for (const symbol of result.symbols) {
        expect(validSymbols).toContain(symbol);
      }
    });

    it('should have complete effects structure', () => {
      const result = spin();

      expect(result.effects.cardBonus).toBeDefined();
      expect(result.effects.rouletteBonus).toBeDefined();
      expect(result.effects.instant).toBeDefined();
      expect(result.effects.penalty).toBeDefined();
    });
  });
});

describe('Poker Module Integration', () => {
  function createCard(rank: string, suit: string): Card {
    return {
      id: `${rank}_${suit}`,
      rank: rank as Card['rank'],
      suit: suit as Card['suit'],
    };
  }

  describe('evaluateHand', () => {
    it('should detect a pair', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('pair');
    });

    it('should detect two pair', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'spades'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('two_pair');
    });

    it('should detect three of a kind', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('three_of_a_kind');
    });

    it('should detect a straight', () => {
      const cards = [
        createCard('5', 'hearts'),
        createCard('6', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('8', 'spades'),
        createCard('9', 'hearts'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('straight');
    });

    it('should detect a flush', () => {
      const cards = [
        createCard('2', 'hearts'),
        createCard('5', 'hearts'),
        createCard('7', 'hearts'),
        createCard('9', 'hearts'),
        createCard('K', 'hearts'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('flush');
    });

    it('should detect full house', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createCard('K', 'hearts'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('full_house');
    });

    it('should detect four of a kind', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('four_of_a_kind');
    });

    it('should detect high card', () => {
      const cards = [
        createCard('2', 'hearts'),
        createCard('5', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('9', 'spades'),
        createCard('K', 'hearts'),
      ];
      const result = evaluateHand(cards);
      expect(result.handType).toBe('high_card');
    });

    it('should handle empty hand', () => {
      const result = evaluateHand([]);
      expect(result.handType).toBe('high_card');
      expect(result.scoringCards).toEqual([]);
    });
  });

  describe('calculateScore', () => {
    it('should calculate base score correctly', () => {
      const handResult = {
        handType: 'pair' as const,
        rank: 14,
        scoringCards: [createCard('A', 'hearts'), createCard('A', 'diamonds')],
        baseChips: 0,
        baseMult: 2,
      };

      const score = calculateScore(handResult, []);

      // pair card sum = 11 + 11 = 22
      // HAND_MULTIPLIERS.pair = 2
      // 22 * 2 = 44
      expect(score.finalScore).toBe(44);
    });

    it('should apply chip bonuses', () => {
      const handResult = {
        handType: 'pair' as const,
        rank: 14,
        scoringCards: [createCard('A', 'hearts'), createCard('A', 'diamonds')],
        baseChips: 0,
        baseMult: 2,
      };

      const bonuses: AppliedBonus[] = [
        { source: 'Test', type: 'chips', value: 20 },
      ];

      const score = calculateScore(handResult, bonuses);
      // (22 + 20) * 2 = 84
      expect(score.finalScore).toBe(84);
    });

    it('should apply mult bonuses', () => {
      const handResult = {
        handType: 'pair' as const,
        rank: 14,
        scoringCards: [createCard('A', 'hearts'), createCard('A', 'diamonds')],
        baseChips: 0,
        baseMult: 2,
      };

      const bonuses: AppliedBonus[] = [
        { source: 'Test', type: 'mult', value: 3 },
      ];

      const score = calculateScore(handResult, bonuses);
      // 22 * (2 + 3) = 110
      expect(score.finalScore).toBe(110);
    });

    it('should apply xmult bonuses', () => {
      const handResult = {
        handType: 'pair' as const,
        rank: 14,
        scoringCards: [createCard('A', 'hearts'), createCard('A', 'diamonds')],
        baseChips: 0,
        baseMult: 2,
      };

      const bonuses: AppliedBonus[] = [
        { source: 'Test', type: 'xmult', value: 2 },
      ];

      const score = calculateScore(handResult, bonuses);
      // 22 * (2 * 2) = 88
      expect(score.finalScore).toBe(88);
    });
  });
});

describe('Roulette Module Integration', () => {
  describe('getDefaultRouletteConfig', () => {
    it('should return a valid config', () => {
      const config = getDefaultRouletteConfig();
      expect(config.segments).toBeDefined();
      expect(config.segments.length).toBeGreaterThan(0);
      expect(config.spinDuration).toBeDefined();
    });
  });

  describe('rouletteSpin', () => {
    it('should return a result', () => {
      const config = getDefaultRouletteConfig();
      const result = rouletteSpin({ baseScore: 100, config });

      expect(result.segment).toBeDefined();
      expect(result.finalScore).toBeDefined();
      expect(result.wasSkipped).toBe(false);
    });

    it('should apply multiplier to base score', () => {
      const config = {
        segments: [{ id: 'test', multiplier: 2, probability: 100, color: '#fff' }],
        spinDuration: 1000,
      };
      const result = rouletteSpin({ baseScore: 100, config });

      expect(result.finalScore).toBe(200);
    });
  });

  describe('applyRouletteBonuses', () => {
    it('should modify config with bonuses', () => {
      const config = getDefaultRouletteConfig();
      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 10,
        maxMultiplier: 1,
        freeSpins: 0,
      };

      const newConfig = applyRouletteBonuses(config, bonuses);

      // Should have modified probabilities/multipliers
      expect(newConfig.segments.length).toBe(config.segments.length);
    });
  });
});

describe('Jokers Module Integration', () => {
  describe('evaluateJokers', () => {
    it('should return empty array for no jokers', () => {
      const bonuses = evaluateJokers([], { phase: 'SCORE_PHASE' });
      expect(bonuses).toEqual([]);
    });

    it('should evaluate on_score jokers in SCORE_PHASE', () => {
      const jokers: Joker[] = [
        {
          id: 'test',
          name: 'Test Joker',
          description: 'Test',
          rarity: 'common',
          trigger: { type: 'on_score' },
          effect: { type: 'add_mult', value: 5 },
          cost: 50,
        },
      ];

      const bonuses = evaluateJokers(jokers, { phase: 'SCORE_PHASE' });
      expect(bonuses.length).toBe(1);
      expect(bonuses[0]?.type).toBe('mult');
      expect(bonuses[0]?.value).toBe(5);
    });

    it('should not trigger on_score jokers in other phases', () => {
      const jokers: Joker[] = [
        {
          id: 'test',
          name: 'Test Joker',
          description: 'Test',
          rarity: 'common',
          trigger: { type: 'on_score' },
          effect: { type: 'add_mult', value: 5 },
          cost: 50,
        },
      ];

      const bonuses = evaluateJokers(jokers, { phase: 'PLAY_PHASE' });
      expect(bonuses.length).toBe(0);
    });

    it('should always trigger passive jokers', () => {
      const jokers: Joker[] = [
        {
          id: 'test',
          name: 'Passive Joker',
          description: 'Test',
          rarity: 'common',
          trigger: { type: 'passive' },
          effect: { type: 'add_chips', value: 10 },
          cost: 50,
        },
      ];

      const bonuses = evaluateJokers(jokers, { phase: 'SLOT_PHASE' });
      expect(bonuses.length).toBe(1);
    });
  });
});

describe('Shop Module Integration', () => {
  describe('generateShop', () => {
    it('should generate shop items', () => {
      const shop = generateShop(1, 0);
      expect(shop.items.length).toBeGreaterThan(0);
      expect(shop.rerollCost).toBeDefined();
      expect(shop.rerollsUsed).toBe(0);
    });

    it('should generate items with valid types', () => {
      const shop = generateShop(1, 0);
      for (const item of shop.items) {
        expect(['joker', 'card', 'pack', 'voucher', 'consumable']).toContain(item.type);
        expect(item.cost).toBeGreaterThan(0);
        expect(item.sold).toBe(false);
      }
    });
  });

  describe('buyItem', () => {
    it('should buy item with enough gold', () => {
      const shop = {
        items: [{ id: 'item1', type: 'joker' as const, itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = buyItem(shop, 'item1', 100);
      expect(result.success).toBe(true);
      expect(result.newGold).toBe(50);
    });

    it('should fail without enough gold', () => {
      const shop = {
        items: [{ id: 'item1', type: 'joker' as const, itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = buyItem(shop, 'item1', 30);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not enough gold');
    });

    it('should fail for non-existent item', () => {
      const shop = {
        items: [{ id: 'item1', type: 'joker' as const, itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = buyItem(shop, 'item2', 100);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found');
    });

    it('should fail for already sold item', () => {
      const shop = {
        items: [{ id: 'item1', type: 'joker' as const, itemId: 'j1', cost: 50, sold: true }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = buyItem(shop, 'item1', 100);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Already sold');
    });
  });

  describe('rerollShop', () => {
    it('should reroll with enough gold', () => {
      const shop = {
        items: [{ id: 'item1', type: 'joker' as const, itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = rerollShop(shop, 100, 1);
      expect(result.success).toBe(true);
      expect(result.newGold).toBe(95);
      expect(result.shop.rerollsUsed).toBe(1);
    });

    it('should fail without enough gold', () => {
      const shop = {
        items: [{ id: 'item1', type: 'joker' as const, itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = rerollShop(shop, 3, 1);
      expect(result.success).toBe(false);
    });

    it('should increase reroll cost', () => {
      const shop = {
        items: [{ id: 'item1', type: 'joker' as const, itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = rerollShop(shop, 100, 1);
      expect(result.shop.rerollCost).toBeGreaterThan(5);
    });
  });
});
