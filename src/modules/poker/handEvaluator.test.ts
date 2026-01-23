/**
 * Hand Evaluator Tests
 *
 * 모든 포커 핸드 타입의 판정 로직 테스트
 */

import { describe, it, expect } from 'vitest';
import type { Card } from '@/types/interfaces';
import { evaluateHand, compareHands, groupByRank, groupBySuit } from './handEvaluator';

// Helper to create cards easily
function createCard(rank: Card['rank'], suit: Card['suit'], options?: Partial<Card>): Card {
  return {
    id: `${rank}_${suit}`,
    rank,
    suit,
    ...options,
  };
}

// Helper to create wild cards (uses 'A' as placeholder rank, but isWild overrides behavior)
function createWildCard(id: string): Card {
  return {
    id,
    rank: 'A', // Placeholder rank, will be treated as wild
    suit: 'hearts', // Placeholder suit
    isWild: true,
  };
}

describe('groupByRank', () => {
  it('should group cards by rank', () => {
    const cards = [
      createCard('A', 'hearts'),
      createCard('A', 'spades'),
      createCard('K', 'hearts'),
    ];
    const groups = groupByRank(cards);

    expect(groups.get('A')?.length).toBe(2);
    expect(groups.get('K')?.length).toBe(1);
  });
});

describe('groupBySuit', () => {
  it('should group cards by suit', () => {
    const cards = [
      createCard('A', 'hearts'),
      createCard('K', 'hearts'),
      createCard('Q', 'spades'),
    ];
    const groups = groupBySuit(cards);

    expect(groups.get('hearts')?.length).toBe(2);
    expect(groups.get('spades')?.length).toBe(1);
  });
});

describe('evaluateHand', () => {
  describe('Royal Flush', () => {
    it('should detect royal flush', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('royal_flush');
      expect(result.scoringCards.length).toBe(5);
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(30);
    });

    it('should detect royal flush with extra cards', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
        createCard('9', 'hearts'),
        createCard('2', 'spades'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('royal_flush');
    });
  });

  describe('Straight Flush', () => {
    it('should detect straight flush', () => {
      const cards = [
        createCard('9', 'clubs'),
        createCard('8', 'clubs'),
        createCard('7', 'clubs'),
        createCard('6', 'clubs'),
        createCard('5', 'clubs'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('straight_flush');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(16);
    });

    it('should detect low straight flush (A-2-3-4-5)', () => {
      const cards = [
        createCard('A', 'diamonds'),
        createCard('2', 'diamonds'),
        createCard('3', 'diamonds'),
        createCard('4', 'diamonds'),
        createCard('5', 'diamonds'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('straight_flush');
    });

    it('should not detect straight flush without same suit', () => {
      const cards = [
        createCard('9', 'clubs'),
        createCard('8', 'clubs'),
        createCard('7', 'hearts'), // Different suit
        createCard('6', 'clubs'),
        createCard('5', 'clubs'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).not.toBe('straight_flush');
    });
  });

  describe('Four of a Kind', () => {
    it('should detect four of a kind', () => {
      const cards = [
        createCard('7', 'hearts'),
        createCard('7', 'diamonds'),
        createCard('7', 'clubs'),
        createCard('7', 'spades'),
        createCard('K', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('four_of_a_kind');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(20);
    });

    it('should include kicker in scoring cards', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('A', 'spades'),
        createCard('K', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('four_of_a_kind');
      expect(result.scoringCards.length).toBe(5);
    });
  });

  describe('Full House', () => {
    it('should detect full house', () => {
      const cards = [
        createCard('Q', 'hearts'),
        createCard('Q', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('8', 'hearts'),
        createCard('8', 'spades'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('full_house');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(13);
    });

    it('should prefer higher three of a kind', () => {
      const cards = [
        createCard('K', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('2', 'hearts'),
        createCard('2', 'spades'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('full_house');
      const tripleCard = result.scoringCards.find(c => c.rank === 'K');
      expect(tripleCard).toBeDefined();
    });
  });

  describe('Flush', () => {
    it('should detect flush', () => {
      const cards = [
        createCard('A', 'spades'),
        createCard('10', 'spades'),
        createCard('7', 'spades'),
        createCard('4', 'spades'),
        createCard('2', 'spades'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('flush');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(10);
    });

    it('should select top 5 cards for flush', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createCard('9', 'hearts'),
        createCard('8', 'hearts'),
        createCard('2', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).not.toBe('royal_flush'); // No 10
      expect(result.handType).not.toBe('straight_flush'); // Not sequential (missing 10)
      expect(result.handType).toBe('flush');
      expect(result.scoringCards.length).toBe(5);
    });
  });

  describe('Straight', () => {
    it('should detect high straight (10-J-Q-K-A)', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'spades'),
        createCard('Q', 'diamonds'),
        createCard('J', 'clubs'),
        createCard('10', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('straight');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(8);
    });

    it('should detect low straight (A-2-3-4-5)', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('2', 'spades'),
        createCard('3', 'diamonds'),
        createCard('4', 'clubs'),
        createCard('5', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('straight');
    });

    it('should detect middle straight', () => {
      const cards = [
        createCard('8', 'hearts'),
        createCard('7', 'spades'),
        createCard('6', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('4', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('straight');
    });

    it('should not wrap around (Q-K-A-2-3)', () => {
      const cards = [
        createCard('Q', 'hearts'),
        createCard('K', 'spades'),
        createCard('A', 'diamonds'),
        createCard('2', 'clubs'),
        createCard('3', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).not.toBe('straight');
    });
  });

  describe('Three of a Kind', () => {
    it('should detect three of a kind', () => {
      const cards = [
        createCard('9', 'hearts'),
        createCard('9', 'diamonds'),
        createCard('9', 'clubs'),
        createCard('K', 'spades'),
        createCard('2', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('three_of_a_kind');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(6);
    });
  });

  describe('Two Pair', () => {
    it('should detect two pair', () => {
      const cards = [
        createCard('J', 'hearts'),
        createCard('J', 'diamonds'),
        createCard('5', 'clubs'),
        createCard('5', 'spades'),
        createCard('A', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('two_pair');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(4);
    });

    it('should select highest two pairs when more than two pairs exist', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
        createCard('Q', 'diamonds'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('two_pair');
      // Should have A and K pairs, not Q
      const hasA = result.scoringCards.some(c => c.rank === 'A');
      const hasK = result.scoringCards.some(c => c.rank === 'K');
      expect(hasA).toBe(true);
      expect(hasK).toBe(true);
    });
  });

  describe('Pair', () => {
    it('should detect pair', () => {
      const cards = [
        createCard('10', 'hearts'),
        createCard('10', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createCard('7', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('pair');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(2);
    });
  });

  describe('High Card', () => {
    it('should detect high card when no other hand', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createCard('9', 'hearts'), // Not 10, so no straight
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('high_card');
      expect(result.baseChips).toBe(0);
      expect(result.baseMult).toBe(1);
    });

    it('should return high cards in order', () => {
      const cards = [
        createCard('2', 'hearts'),
        createCard('5', 'diamonds'),
        createCard('K', 'clubs'),
        createCard('9', 'spades'),
        createCard('7', 'hearts'),
      ];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('high_card');
      expect(result.scoringCards[0]?.rank).toBe('K');
    });
  });

  describe('Empty Hand', () => {
    it('should handle empty card array', () => {
      const cards: Card[] = [];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('high_card');
      expect(result.scoringCards.length).toBe(0);
      expect(result.baseChips).toBe(5);
      expect(result.baseMult).toBe(1);
    });
  });

  describe('Single Card', () => {
    it('should handle single card', () => {
      const cards = [createCard('A', 'hearts')];
      const result = evaluateHand(cards);

      expect(result.handType).toBe('high_card');
      expect(result.scoringCards.length).toBe(1);
    });
  });

  describe('Wild Card Support', () => {
    it('should use wild card to make highest possible hand (straight beats pair)', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('J', 'spades'),
        createWildCard('wild_1'),
      ];
      const result = evaluateHand(cards);

      // Wild should become 10 to make a straight (10-J-Q-K-A), which beats a pair
      expect(result.handType).toBe('straight');
    });

    it('should use wild card to complete a pair when no better hand possible', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'diamonds'),
        createCard('9', 'clubs'),
        createCard('7', 'spades'),
        createWildCard('wild_1'),
      ];
      const result = evaluateHand(cards);

      // No straight/flush possible, wild should become A to make a pair
      expect(result.handType).toBe('pair');
    });

    it('should use wild card to complete a straight', () => {
      const cards = [
        createCard('10', 'hearts'),
        createCard('J', 'diamonds'),
        createCard('Q', 'clubs'),
        createCard('K', 'spades'),
        createWildCard('wild_1'),
      ];
      const result = evaluateHand(cards);

      // Wild should become A or 9 to make a straight
      expect(result.handType).toBe('straight');
    });

    it('should use wild card to complete a flush', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts'),
        createCard('Q', 'hearts'),
        createCard('J', 'hearts'),
        createWildCard('wild_1'),
      ];
      const result = evaluateHand(cards);

      // Wild should become 10 of hearts to make royal flush
      // or any hearts to make at least a flush
      expect(['royal_flush', 'straight_flush', 'flush']).toContain(result.handType);
    });

    it('should use wild card to complete four of a kind', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createCard('A', 'clubs'),
        createCard('K', 'spades'),
        createWildCard('wild_1'),
      ];
      const result = evaluateHand(cards);

      // Wild should become A to make four of a kind
      expect(result.handType).toBe('four_of_a_kind');
    });

    it('should make best hand with multiple wild cards', () => {
      const cards = [
        createCard('A', 'hearts'),
        createCard('A', 'diamonds'),
        createWildCard('wild_1'),
        createWildCard('wild_2'),
        createCard('K', 'hearts'),
      ];
      const result = evaluateHand(cards);

      // With 2 wilds + 2 Aces, should be four of a kind (AA + 2 wild As)
      expect(result.handType).toBe('four_of_a_kind');
    });
  });
});

describe('compareHands', () => {
  it('should rank royal flush higher than straight flush', () => {
    const royalFlush = evaluateHand([
      createCard('A', 'hearts'),
      createCard('K', 'hearts'),
      createCard('Q', 'hearts'),
      createCard('J', 'hearts'),
      createCard('10', 'hearts'),
    ]);
    const straightFlush = evaluateHand([
      createCard('9', 'clubs'),
      createCard('8', 'clubs'),
      createCard('7', 'clubs'),
      createCard('6', 'clubs'),
      createCard('5', 'clubs'),
    ]);

    expect(compareHands(royalFlush, straightFlush)).toBeGreaterThan(0);
  });

  it('should rank four of a kind higher than full house', () => {
    const fourOfAKind = evaluateHand([
      createCard('7', 'hearts'),
      createCard('7', 'diamonds'),
      createCard('7', 'clubs'),
      createCard('7', 'spades'),
      createCard('K', 'hearts'),
    ]);
    const fullHouse = evaluateHand([
      createCard('K', 'hearts'),
      createCard('K', 'diamonds'),
      createCard('K', 'clubs'),
      createCard('Q', 'hearts'),
      createCard('Q', 'spades'),
    ]);

    expect(compareHands(fourOfAKind, fullHouse)).toBeGreaterThan(0);
  });

  it('should compare same hand types by rank', () => {
    const highPair = evaluateHand([
      createCard('A', 'hearts'),
      createCard('A', 'diamonds'),
      createCard('K', 'clubs'),
      createCard('Q', 'spades'),
      createCard('J', 'hearts'),
    ]);
    const lowPair = evaluateHand([
      createCard('2', 'hearts'),
      createCard('2', 'diamonds'),
      createCard('K', 'clubs'),
      createCard('Q', 'spades'),
      createCard('J', 'hearts'),
    ]);

    expect(compareHands(highPair, lowPair)).toBeGreaterThan(0);
    expect(compareHands(lowPair, highPair)).toBeLessThan(0);
  });

  it('should return 0 for equal hands', () => {
    const hand1 = evaluateHand([
      createCard('A', 'hearts'),
      createCard('A', 'diamonds'),
      createCard('K', 'clubs'),
      createCard('Q', 'spades'),
      createCard('J', 'hearts'),
    ]);
    const hand2 = evaluateHand([
      createCard('A', 'clubs'),
      createCard('A', 'spades'),
      createCard('K', 'hearts'),
      createCard('Q', 'diamonds'),
      createCard('J', 'clubs'),
    ]);

    expect(compareHands(hand1, hand2)).toBe(0);
  });
});
