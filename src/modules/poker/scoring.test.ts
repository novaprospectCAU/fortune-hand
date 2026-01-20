/**
 * Scoring Module Tests
 *
 * 점수 계산 로직 및 보너스 적용 순서 테스트
 */

import { describe, it, expect } from 'vitest';
import type { AppliedBonus, Card, HandResult } from '@/types/interfaces';
import {
  calculateScore,
  calculateCardChips,
  getCardChipValue,
  formatScoreBreakdown,
  createEmptyScoreCalculation,
} from './scoring';

// Helper to create cards easily
function createCard(rank: Card['rank'], suit: Card['suit'], options?: Partial<Card>): Card {
  return {
    id: `${rank}_${suit}`,
    rank,
    suit,
    ...options,
  };
}

// Helper to create a hand result
function createHandResult(
  handType: HandResult['handType'],
  scoringCards: Card[],
  baseChips: number,
  baseMult: number
): HandResult {
  return {
    handType,
    rank: 0,
    scoringCards,
    baseChips,
    baseMult,
  };
}

describe('getCardChipValue', () => {
  it('should return correct chip value for number cards', () => {
    expect(getCardChipValue(createCard('2', 'hearts'))).toBe(2);
    expect(getCardChipValue(createCard('5', 'hearts'))).toBe(5);
    expect(getCardChipValue(createCard('9', 'hearts'))).toBe(9);
    expect(getCardChipValue(createCard('10', 'hearts'))).toBe(10);
  });

  it('should return 10 for face cards', () => {
    expect(getCardChipValue(createCard('J', 'hearts'))).toBe(10);
    expect(getCardChipValue(createCard('Q', 'hearts'))).toBe(10);
    expect(getCardChipValue(createCard('K', 'hearts'))).toBe(10);
  });

  it('should return 11 for Ace', () => {
    expect(getCardChipValue(createCard('A', 'hearts'))).toBe(11);
  });

  it('should return 0 for gold cards', () => {
    const goldCard = createCard('A', 'hearts', { isGold: true });
    expect(getCardChipValue(goldCard)).toBe(0);
  });

  it('should add enhancement bonus for chips type', () => {
    const enhancedCard = createCard('5', 'hearts', {
      enhancement: { type: 'chips', value: 30 },
    });
    expect(getCardChipValue(enhancedCard)).toBe(35); // 5 + 30
  });
});

describe('calculateCardChips', () => {
  it('should sum chip values of all cards', () => {
    const cards = [
      createCard('A', 'hearts'),  // 11
      createCard('K', 'hearts'),  // 10
      createCard('Q', 'hearts'),  // 10
      createCard('J', 'hearts'),  // 10
      createCard('10', 'hearts'), // 10
    ];
    expect(calculateCardChips(cards)).toBe(51);
  });

  it('should exclude gold card chips', () => {
    const cards = [
      createCard('A', 'hearts', { isGold: true }), // 0
      createCard('K', 'hearts'),  // 10
    ];
    expect(calculateCardChips(cards)).toBe(10);
  });

  it('should return 0 for empty array', () => {
    expect(calculateCardChips([])).toBe(0);
  });
});

describe('calculateScore', () => {
  describe('Basic calculation', () => {
    it('should calculate basic score correctly', () => {
      const scoringCards = [
        createCard('A', 'hearts'),  // 11
        createCard('A', 'diamonds'), // 11
        createCard('K', 'clubs'),    // 10
        createCard('Q', 'spades'),   // 10
        createCard('J', 'hearts'),   // 10
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // chipTotal = baseChips(10) + cardChips(52) = 62
      // multTotal = baseMult(2) = 2
      // finalScore = 62 * 2 = 124
      expect(result.chipTotal).toBe(62);
      expect(result.multTotal).toBe(2);
      expect(result.finalScore).toBe(124);
    });

    it('should handle empty scoring cards', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const result = calculateScore(handResult);

      expect(result.chipTotal).toBe(5);
      expect(result.multTotal).toBe(1);
      expect(result.finalScore).toBe(5);
    });
  });

  describe('Bonus application order', () => {
    it('should apply chips bonuses first', () => {
      const scoringCards = [createCard('A', 'hearts')]; // 11 chips
      const handResult = createHandResult('high_card', scoringCards, 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Test Joker 1', type: 'chips', value: 20 },
        { source: 'Test Joker 2', type: 'chips', value: 10 },
      ];

      const result = calculateScore(handResult, bonuses);

      // chipTotal = 5 + 11 + 20 + 10 = 46
      expect(result.chipTotal).toBe(46);
      expect(result.finalScore).toBe(46 * 1);
    });

    it('should apply mult bonuses after chips', () => {
      const scoringCards = [createCard('A', 'hearts')]; // 11 chips
      const handResult = createHandResult('high_card', scoringCards, 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Test Joker 1', type: 'mult', value: 3 },
        { source: 'Test Joker 2', type: 'mult', value: 2 },
      ];

      const result = calculateScore(handResult, bonuses);

      // multTotal = 1 + 3 + 2 = 6
      expect(result.multTotal).toBe(6);
      expect(result.finalScore).toBe(16 * 6); // (5 + 11) * 6 = 96
    });

    it('should apply xmult bonuses last (multiplicatively)', () => {
      const scoringCards = [createCard('A', 'hearts')]; // 11 chips
      const handResult = createHandResult('high_card', scoringCards, 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Test Joker 1', type: 'xmult', value: 2 },
        { source: 'Test Joker 2', type: 'xmult', value: 3 },
      ];

      const result = calculateScore(handResult, bonuses);

      // multTotal = 1 * 2 * 3 = 6
      expect(result.multTotal).toBe(6);
      expect(result.finalScore).toBe(16 * 6); // (5 + 11) * 6 = 96
    });

    it('should apply all bonus types in correct order', () => {
      const scoringCards = [createCard('10', 'hearts')]; // 10 chips
      const handResult = createHandResult('high_card', scoringCards, 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Joker A', type: 'chips', value: 5 },
        { source: 'Joker B', type: 'mult', value: 2 },
        { source: 'Joker C', type: 'xmult', value: 2 },
        { source: 'Joker D', type: 'chips', value: 10 },  // Should still be applied with other chips
        { source: 'Joker E', type: 'mult', value: 3 },     // Should still be applied with other mults
        { source: 'Joker F', type: 'xmult', value: 1.5 },  // Should still be applied with other xmults
      ];

      const result = calculateScore(handResult, bonuses);

      // chipTotal = 5 + 10 + 5 + 10 = 30
      // multTotal = (1 + 2 + 3) * 2 * 1.5 = 6 * 3 = 18
      expect(result.chipTotal).toBe(30);
      expect(result.multTotal).toBe(18);
      expect(result.finalScore).toBe(30 * 18); // 540
    });

    it('should track applied bonuses', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Joker A', type: 'chips', value: 10 },
        { source: 'Joker B', type: 'mult', value: 2 },
      ];

      const result = calculateScore(handResult, bonuses);

      expect(result.appliedBonuses.length).toBe(2);
      expect(result.appliedBonuses.some(b => b.source === 'Joker A')).toBe(true);
      expect(result.appliedBonuses.some(b => b.source === 'Joker B')).toBe(true);
    });
  });

  describe('Card enhancement bonuses', () => {
    it('should apply card mult enhancement', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);

      const result = calculateScore(handResult);

      // multTotal = 1 + 4 = 5
      expect(result.multTotal).toBe(5);
    });

    it('should apply multiple card enhancements', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
        createCard('K', 'hearts', { enhancement: { type: 'mult', value: 2 } }),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // multTotal = 2 + 4 + 2 = 8
      expect(result.multTotal).toBe(8);
    });
  });

  describe('Real game scenarios', () => {
    it('should calculate pair of Aces correctly', () => {
      const scoringCards = [
        createCard('A', 'hearts'),   // 11
        createCard('A', 'diamonds'), // 11
        createCard('K', 'clubs'),    // 10
        createCard('Q', 'spades'),   // 10
        createCard('J', 'hearts'),   // 10
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // chipTotal = 10 + 52 = 62
      // multTotal = 2
      // finalScore = 62 * 2 = 124
      expect(result.finalScore).toBe(124);
    });

    it('should calculate flush correctly', () => {
      const scoringCards = [
        createCard('A', 'hearts'),  // 11
        createCard('K', 'hearts'),  // 10
        createCard('Q', 'hearts'),  // 10
        createCard('J', 'hearts'),  // 10
        createCard('9', 'hearts'),  // 9
      ];
      const handResult = createHandResult('flush', scoringCards, 35, 4);

      const result = calculateScore(handResult);

      // chipTotal = 35 + 50 = 85
      // multTotal = 4
      // finalScore = 85 * 4 = 340
      expect(result.finalScore).toBe(340);
    });

    it('should calculate royal flush with bonuses', () => {
      const scoringCards = [
        createCard('A', 'hearts'),  // 11
        createCard('K', 'hearts'),  // 10
        createCard('Q', 'hearts'),  // 10
        createCard('J', 'hearts'),  // 10
        createCard('10', 'hearts'), // 10
      ];
      const handResult = createHandResult('royal_flush', scoringCards, 100, 8);
      const bonuses: AppliedBonus[] = [
        { source: 'Slot Bonus', type: 'xmult', value: 2 },
        { source: 'Lucky Joker', type: 'mult', value: 10 },
      ];

      const result = calculateScore(handResult, bonuses);

      // chipTotal = 100 + 51 = 151
      // multTotal = (8 + 10) * 2 = 36
      // finalScore = 151 * 36 = 5436
      expect(result.finalScore).toBe(5436);
    });
  });

  describe('Edge cases', () => {
    it('should floor final score', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Test', type: 'xmult', value: 1.5 },
      ];

      const result = calculateScore(handResult, bonuses);

      // 5 * 1.5 = 7.5 -> 7
      expect(result.finalScore).toBe(7);
    });

    it('should handle zero bonuses', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const result = calculateScore(handResult, []);

      expect(result.finalScore).toBe(5);
      expect(result.appliedBonuses.length).toBe(0);
    });
  });
});

describe('formatScoreBreakdown', () => {
  it('should format score breakdown as readable string', () => {
    const scoringCards = [createCard('A', 'hearts')];
    const handResult = createHandResult('pair', scoringCards, 10, 2);
    const bonuses: AppliedBonus[] = [
      { source: 'Test Joker', type: 'chips', value: 5 },
    ];
    const calculation = calculateScore(handResult, bonuses);

    const breakdown = formatScoreBreakdown(calculation);

    expect(breakdown).toContain('Hand: pair');
    expect(breakdown).toContain('Base: 10 chips x 2 mult');
    expect(breakdown).toContain('+5 chips (Test Joker)');
  });
});

describe('createEmptyScoreCalculation', () => {
  it('should create empty score calculation', () => {
    const result = createEmptyScoreCalculation();

    expect(result.handResult.handType).toBe('high_card');
    expect(result.chipTotal).toBe(0);
    expect(result.multTotal).toBe(0);
    expect(result.finalScore).toBe(0);
    expect(result.appliedBonuses.length).toBe(0);
  });
});
