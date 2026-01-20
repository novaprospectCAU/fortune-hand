/**
 * Phase Handlers Tests
 */

import { describe, it, expect } from 'vitest';
import {
  executeSlotPhase,
  canEnterSlotPhase,
  executeDrawPhase,
  canEnterDrawPhase,
  selectCard,
  deselectCard,
  discardSelected,
  canPlayHand,
  executeScorePhase,
  canEnterScorePhase,
  executeRouletteSpin,
  skipRoulette,
  isRouletteSkipped,
  executeRewardPhase,
  getPhaseAfterReward,
  initializeShop,
  executeBuyItem,
  executeReroll,
  canEnterShopPhase,
} from './index';
import { createStandardDeck, shuffle } from '../moduleIntegration';
import type { Card, Deck, SlotResult, SlotEffects, ShopState } from '@/types/interfaces';

function createMockSlotResult(overrides?: Partial<SlotResult>): SlotResult {
  const defaultEffects: SlotEffects = {
    cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 1 },
    rouletteBonus: { safeZoneBonus: 0, maxMultiplier: 0, freeSpins: 0 },
    instant: { gold: 0, chips: 0 },
    penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
  };

  return {
    symbols: ['card', 'card', 'card'],
    isJackpot: false,
    effects: defaultEffects,
    ...overrides,
  };
}

describe('Slot Phase', () => {
  describe('executeSlotPhase', () => {
    it('should return slot result and gold change', () => {
      const result = executeSlotPhase({ jokers: [] });
      expect(result.slotResult).toBeDefined();
      expect(typeof result.goldChange).toBe('number');
    });
  });

  describe('canEnterSlotPhase', () => {
    it('should allow from IDLE', () => {
      expect(canEnterSlotPhase('IDLE')).toBe(true);
    });

    it('should allow from REWARD_PHASE', () => {
      expect(canEnterSlotPhase('REWARD_PHASE')).toBe(true);
    });

    it('should allow from SHOP_PHASE', () => {
      expect(canEnterSlotPhase('SHOP_PHASE')).toBe(true);
    });

    it('should not allow from PLAY_PHASE', () => {
      expect(canEnterSlotPhase('PLAY_PHASE')).toBe(false);
    });
  });
});

describe('Draw Phase', () => {
  describe('executeDrawPhase', () => {
    it('should draw cards up to hand size', () => {
      const deck: Deck = { cards: shuffle(createStandardDeck()), discardPile: [] };
      const result = executeDrawPhase({
        deck,
        hand: [],
        slotResult: null,
        baseHandSize: 8,
      });

      expect(result.hand.length).toBe(8);
      expect(result.drawnCards.length).toBe(8);
      expect(result.deck.cards.length).toBe(44);
    });

    it('should apply extra draw from slot', () => {
      const deck: Deck = { cards: shuffle(createStandardDeck()), discardPile: [] };
      const slotResult = createMockSlotResult({
        effects: {
          ...createMockSlotResult().effects,
          cardBonus: { extraDraw: 2, handSize: 0, scoreMultiplier: 1 },
        },
      });

      const result = executeDrawPhase({
        deck,
        hand: [],
        slotResult,
        baseHandSize: 8,
      });

      // Should draw base (8) + extra (2) but capped at hand size (8)
      expect(result.hand.length).toBe(8);
    });

    it('should apply discard penalty from slot', () => {
      const deck: Deck = { cards: shuffle(createStandardDeck()), discardPile: [] };
      const existingHand = deck.cards.slice(0, 3);
      const slotResult = createMockSlotResult({
        effects: {
          ...createMockSlotResult().effects,
          penalty: { discardCards: 2, skipRoulette: false, loseGold: 0 },
        },
      });

      const result = executeDrawPhase({
        deck: { cards: deck.cards.slice(3), discardPile: [] },
        hand: existingHand,
        slotResult,
        baseHandSize: 8,
      });

      // Should discard 2 from existing hand, then draw to fill
      expect(result.deck.discardPile.length).toBe(2);
    });
  });

  describe('canEnterDrawPhase', () => {
    it('should allow from SLOT_PHASE', () => {
      expect(canEnterDrawPhase('SLOT_PHASE')).toBe(true);
    });

    it('should not allow from other phases', () => {
      expect(canEnterDrawPhase('PLAY_PHASE')).toBe(false);
      expect(canEnterDrawPhase('IDLE')).toBe(false);
    });
  });
});

describe('Play Phase', () => {
  function createTestHand(): Card[] {
    return [
      { id: 'A_hearts', suit: 'hearts', rank: 'A' },
      { id: 'K_hearts', suit: 'hearts', rank: 'K' },
      { id: 'Q_hearts', suit: 'hearts', rank: 'Q' },
      { id: 'J_hearts', suit: 'hearts', rank: 'J' },
      { id: '10_hearts', suit: 'hearts', rank: '10' },
    ];
  }

  describe('selectCard', () => {
    it('should select a card from hand', () => {
      const hand = createTestHand();
      const result = selectCard(
        { hand, selectedCards: [], deck: { cards: [], discardPile: [] }, discardsRemaining: 3 },
        'A_hearts'
      );

      expect(result.success).toBe(true);
      expect(result.selectedCards.length).toBe(1);
    });

    it('should not select card not in hand', () => {
      const hand = createTestHand();
      const result = selectCard(
        { hand, selectedCards: [], deck: { cards: [], discardPile: [] }, discardsRemaining: 3 },
        'invalid_card'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Card not found in hand');
    });

    it('should not select more than 5 cards', () => {
      const hand = createTestHand();
      const selectedCards = hand.slice(0, 5);

      const result = selectCard(
        { hand: [...hand, { id: '9_hearts', suit: 'hearts', rank: '9' }], selectedCards, deck: { cards: [], discardPile: [] }, discardsRemaining: 3 },
        '9_hearts'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Maximum cards selected');
    });
  });

  describe('deselectCard', () => {
    it('should deselect a selected card', () => {
      const hand = createTestHand();
      const selectedCards = [hand[0]!];

      const result = deselectCard(
        { hand, selectedCards, deck: { cards: [], discardPile: [] }, discardsRemaining: 3 },
        'A_hearts'
      );

      expect(result.success).toBe(true);
      expect(result.selectedCards.length).toBe(0);
    });

    it('should fail for non-selected card', () => {
      const hand = createTestHand();

      const result = deselectCard(
        { hand, selectedCards: [], deck: { cards: [], discardPile: [] }, discardsRemaining: 3 },
        'A_hearts'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Card not selected');
    });
  });

  describe('discardSelected', () => {
    it('should discard and draw new cards', () => {
      const hand = createTestHand();
      const deck: Deck = { cards: createStandardDeck().slice(5), discardPile: [] };
      const selectedCards = [hand[0]!];

      const result = discardSelected({
        hand,
        selectedCards,
        deck,
        discardsRemaining: 3,
      });

      expect(result.success).toBe(true);
      expect(result.hand.length).toBe(5);
      expect(result.discardsRemaining).toBe(2);
      expect(result.drawnCards.length).toBe(1);
    });

    it('should fail with no cards selected', () => {
      const result = discardSelected({
        hand: createTestHand(),
        selectedCards: [],
        deck: { cards: [], discardPile: [] },
        discardsRemaining: 3,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No cards selected');
    });

    it('should fail with no discards remaining', () => {
      const hand = createTestHand();
      const result = discardSelected({
        hand,
        selectedCards: [hand[0]!],
        deck: { cards: [], discardPile: [] },
        discardsRemaining: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No discards remaining');
    });
  });

  describe('canPlayHand', () => {
    it('should validate non-empty selection', () => {
      const result = canPlayHand([{ id: 'test', suit: 'hearts', rank: 'A' }]);
      expect(result.valid).toBe(true);
    });

    it('should reject empty selection', () => {
      const result = canPlayHand([]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No cards selected');
    });
  });
});

describe('Score Phase', () => {
  describe('executeScorePhase', () => {
    it('should calculate score for played cards', () => {
      const playedCards: Card[] = [
        { id: 'A_hearts', suit: 'hearts', rank: 'A' },
        { id: 'A_diamonds', suit: 'diamonds', rank: 'A' },
      ];

      const result = executeScorePhase({
        playedCards,
        jokers: [],
        slotResult: null,
      });

      expect(result.handResult.handType).toBe('pair');
      expect(result.scoreCalculation.finalScore).toBeGreaterThan(0);
    });

    it('should apply slot score multiplier', () => {
      const playedCards: Card[] = [
        { id: 'A_hearts', suit: 'hearts', rank: 'A' },
        { id: 'A_diamonds', suit: 'diamonds', rank: 'A' },
      ];

      const slotResult = createMockSlotResult({
        effects: {
          ...createMockSlotResult().effects,
          cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 2 },
        },
      });

      const result = executeScorePhase({
        playedCards,
        jokers: [],
        slotResult,
      });

      // Score should be higher with 2x multiplier
      const baseResult = executeScorePhase({
        playedCards,
        jokers: [],
        slotResult: null,
      });

      expect(result.scoreCalculation.finalScore).toBeGreaterThan(
        baseResult.scoreCalculation.finalScore
      );
    });
  });

  describe('canEnterScorePhase', () => {
    it('should allow from PLAY_PHASE', () => {
      expect(canEnterScorePhase('PLAY_PHASE')).toBe(true);
    });
  });
});

describe('Roulette Phase', () => {
  describe('isRouletteSkipped', () => {
    it('should return true when penalty says skip', () => {
      const slotResult = createMockSlotResult({
        effects: {
          ...createMockSlotResult().effects,
          penalty: { discardCards: 0, skipRoulette: true, loseGold: 0 },
        },
      });

      expect(isRouletteSkipped(slotResult)).toBe(true);
    });

    it('should return false normally', () => {
      expect(isRouletteSkipped(null)).toBe(false);
      expect(isRouletteSkipped(createMockSlotResult())).toBe(false);
    });
  });

  describe('executeRouletteSpin', () => {
    it('should spin roulette', () => {
      const result = executeRouletteSpin({
        baseScore: 100,
        slotResult: null,
        jokers: [],
      });

      expect(result.rouletteResult).toBeDefined();
      expect(result.rouletteResult.wasSkipped).toBe(false);
    });

    it('should skip when forced by slot', () => {
      const slotResult = createMockSlotResult({
        effects: {
          ...createMockSlotResult().effects,
          penalty: { discardCards: 0, skipRoulette: true, loseGold: 0 },
        },
      });

      const result = executeRouletteSpin({
        baseScore: 100,
        slotResult,
        jokers: [],
      });

      expect(result.rouletteResult.wasSkipped).toBe(true);
      expect(result.rouletteResult.finalScore).toBe(100);
    });
  });

  describe('skipRoulette', () => {
    it('should return skipped result', () => {
      const result = skipRoulette(100);

      expect(result.rouletteResult.wasSkipped).toBe(true);
      expect(result.rouletteResult.finalScore).toBe(100);
      expect(result.rouletteResult.segment.multiplier).toBe(1);
    });
  });
});

describe('Reward Phase', () => {
  describe('executeRewardPhase', () => {
    it('should accumulate score', () => {
      const result = executeRewardPhase({
        currentScore: 100,
        targetScore: 300,
        gold: 100,
        hand: [],
        deck: { cards: [], discardPile: [] },
        playedCards: [],
        slotResult: null,
        scoreCalculation: {
          handResult: { handType: 'pair', rank: 10, scoringCards: [], baseChips: 10, baseMult: 2 },
          chipTotal: 10,
          multTotal: 2,
          appliedBonuses: [],
          finalScore: 20,
        },
        rouletteResult: {
          segment: { id: 'two', multiplier: 2, probability: 100, color: '#fff' },
          finalScore: 40,
          wasSkipped: false,
        },
        handsRemaining: 3,
      });

      expect(result.newScore).toBe(140); // 100 + 40
      expect(result.turnScore).toBe(40);
      expect(result.handsRemaining).toBe(2);
    });

    it('should detect round completion on target met', () => {
      const result = executeRewardPhase({
        currentScore: 280,
        targetScore: 300,
        gold: 100,
        hand: [],
        deck: { cards: [], discardPile: [] },
        playedCards: [],
        slotResult: null,
        scoreCalculation: {
          handResult: { handType: 'pair', rank: 10, scoringCards: [], baseChips: 10, baseMult: 2 },
          chipTotal: 10,
          multTotal: 2,
          appliedBonuses: [],
          finalScore: 50,
        },
        rouletteResult: null,
        handsRemaining: 3,
      });

      expect(result.isRoundComplete).toBe(true);
      expect(result.isRoundSuccess).toBe(true);
    });

    it('should detect game over on failure', () => {
      const result = executeRewardPhase({
        currentScore: 100,
        targetScore: 300,
        gold: 100,
        hand: [],
        deck: { cards: [], discardPile: [] },
        playedCards: [],
        slotResult: null,
        scoreCalculation: null,
        rouletteResult: null,
        handsRemaining: 1, // Last hand
      });

      expect(result.isRoundComplete).toBe(true);
      expect(result.isRoundSuccess).toBe(false);
    });
  });

  describe('getPhaseAfterReward', () => {
    it('should return SLOT_PHASE if not complete', () => {
      expect(getPhaseAfterReward(false, false)).toBe('SLOT_PHASE');
    });

    it('should return SHOP_PHASE on success', () => {
      expect(getPhaseAfterReward(true, true)).toBe('SHOP_PHASE');
    });

    it('should return GAME_OVER on failure', () => {
      expect(getPhaseAfterReward(true, false)).toBe('GAME_OVER');
    });
  });
});

describe('Shop Phase', () => {
  describe('initializeShop', () => {
    it('should generate new shop if none exists', () => {
      const result = initializeShop({
        round: 1,
        gold: 100,
        shopState: null,
        jokers: [],
        maxJokers: 5,
      });

      expect(result.shopState).toBeDefined();
      expect(result.shopState.items.length).toBeGreaterThan(0);
    });

    it('should return existing shop', () => {
      const existingShop: ShopState = {
        items: [{ id: 'test', type: 'joker', itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = initializeShop({
        round: 1,
        gold: 100,
        shopState: existingShop,
        jokers: [],
        maxJokers: 5,
      });

      expect(result.shopState).toBe(existingShop);
    });
  });

  describe('executeBuyItem', () => {
    it('should buy item', () => {
      const shop: ShopState = {
        items: [{ id: 'item1', type: 'joker', itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = executeBuyItem(shop, 'item1', 100, [], 5);

      expect(result.success).toBe(true);
      expect(result.newGold).toBe(50);
      expect(result.shopState.items[0]?.sold).toBe(true);
    });

    it('should reject if max jokers reached', () => {
      const shop: ShopState = {
        items: [{ id: 'item1', type: 'joker', itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const existingJokers = Array(5).fill({
        id: 'j',
        name: 'J',
        description: '',
        rarity: 'common',
        trigger: { type: 'passive' },
        effect: { type: 'add_mult', value: 1 },
        cost: 10,
      });

      const result = executeBuyItem(shop, 'item1', 100, existingJokers, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Maximum jokers reached');
    });
  });

  describe('executeReroll', () => {
    it('should reroll shop', () => {
      const shop: ShopState = {
        items: [{ id: 'item1', type: 'joker', itemId: 'j1', cost: 50, sold: false }],
        rerollCost: 5,
        rerollsUsed: 0,
      };

      const result = executeReroll(shop, 100, 1);

      expect(result.success).toBe(true);
      expect(result.newGold).toBe(95);
      expect(result.shopState.rerollsUsed).toBe(1);
    });

    it('should fail without enough gold', () => {
      const shop: ShopState = {
        items: [],
        rerollCost: 50,
        rerollsUsed: 0,
      };

      const result = executeReroll(shop, 30, 1);

      expect(result.success).toBe(false);
    });
  });

  describe('canEnterShopPhase', () => {
    it('should allow from REWARD_PHASE', () => {
      expect(canEnterShopPhase('REWARD_PHASE')).toBe(true);
    });
  });
});
