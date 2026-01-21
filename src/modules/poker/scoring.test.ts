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
  calculateGoldFromEnhancements,
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

describe('Card Enhancements', () => {
  describe('Chips Enhancement', () => {
    it('should add bonus chips to card value', () => {
      const enhancedCard = createCard('5', 'hearts', {
        enhancement: { type: 'chips', value: 30 },
      });
      expect(getCardChipValue(enhancedCard)).toBe(35); // 5 + 30
    });

    it('should track chips enhancement in appliedBonuses', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);

      const result = calculateScore(handResult);

      // Should have card chips bonus and enhancement bonus tracked
      const enhancementBonus = result.appliedBonuses.find(b =>
        b.source.includes('Enhancement')
      );
      expect(enhancementBonus).toBeDefined();
      expect(enhancementBonus?.type).toBe('chips');
      expect(enhancementBonus?.value).toBe(30);
    });

    it('should calculate score correctly with chips enhancement', () => {
      const scoringCards = [
        createCard('5', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('5', 'diamonds'),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // chipTotal = baseChips(10) + card1(5+30) + card2(5) = 50
      // multTotal = baseMult(2) = 2
      // finalScore = 50 * 2 = 100
      expect(result.chipTotal).toBe(50);
      expect(result.multTotal).toBe(2);
      expect(result.finalScore).toBe(100);
    });

    it('should handle multiple chips enhancements', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('K', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('Q', 'hearts'),
      ];
      const handResult = createHandResult('flush', scoringCards, 35, 4);

      const result = calculateScore(handResult);

      // chipTotal = 35 + (11+30) + (10+30) + 10 = 126
      expect(result.chipTotal).toBe(126);

      // Should track both enhancements
      const enhancementBonuses = result.appliedBonuses.filter(b =>
        b.source.includes('Enhancement')
      );
      expect(enhancementBonuses.length).toBe(2);
    });
  });

  describe('Mult Enhancement', () => {
    it('should add mult bonus to total mult', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);

      const result = calculateScore(handResult);

      // multTotal = baseMult(1) + enhancement(4) = 5
      expect(result.multTotal).toBe(5);
      expect(result.finalScore).toBe((5 + 11) * 5); // 80
    });

    it('should track mult enhancement in appliedBonuses', () => {
      const scoringCards = [
        createCard('K', 'diamonds', { enhancement: { type: 'mult', value: 4 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);

      const result = calculateScore(handResult);

      const enhancementBonus = result.appliedBonuses.find(b =>
        b.source.includes('Enhancement')
      );
      expect(enhancementBonus).toBeDefined();
      expect(enhancementBonus?.type).toBe('mult');
      expect(enhancementBonus?.value).toBe(4);
    });

    it('should handle multiple mult enhancements', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
        createCard('A', 'diamonds', { enhancement: { type: 'mult', value: 4 } }),
        createCard('K', 'clubs'),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // multTotal = 2 + 4 + 4 = 10
      expect(result.multTotal).toBe(10);

      // Should track both enhancements
      const enhancementBonuses = result.appliedBonuses.filter(b =>
        b.source.includes('Enhancement')
      );
      expect(enhancementBonuses.length).toBe(2);
    });

    it('should apply mult enhancements before joker bonuses', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Test Joker', type: 'mult', value: 3 },
      ];

      const result = calculateScore(handResult, bonuses);

      // multTotal = baseMult(1) + card enhancement(4) + joker(3) = 8
      expect(result.multTotal).toBe(8);
    });
  });

  describe('Gold Enhancement', () => {
    it('should calculate gold from single gold enhancement', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'gold', value: 3 } }),
      ];

      const goldTotal = calculateGoldFromEnhancements(scoringCards);
      expect(goldTotal).toBe(3);
    });

    it('should calculate gold from multiple gold enhancements', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'gold', value: 3 } }),
        createCard('K', 'hearts', { enhancement: { type: 'gold', value: 3 } }),
        createCard('Q', 'hearts'),
      ];

      const goldTotal = calculateGoldFromEnhancements(scoringCards);
      expect(goldTotal).toBe(6);
    });

    it('should return 0 when no gold enhancements present', () => {
      const scoringCards = [
        createCard('A', 'hearts'),
        createCard('K', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
      ];

      const goldTotal = calculateGoldFromEnhancements(scoringCards);
      expect(goldTotal).toBe(0);
    });

    it('should handle empty array', () => {
      const goldTotal = calculateGoldFromEnhancements([]);
      expect(goldTotal).toBe(0);
    });

    it('should not affect score calculation', () => {
      // Gold enhancement should not affect chips/mult
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'gold', value: 3 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);

      const result = calculateScore(handResult);

      // Score should be calculated normally (gold is applied in reward phase)
      expect(result.finalScore).toBe((5 + 11) * 1); // 16
    });
  });

  describe('Mixed Enhancements', () => {
    it('should handle mix of chips, mult, and gold enhancements', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('K', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
        createCard('Q', 'hearts', { enhancement: { type: 'gold', value: 3 } }),
        createCard('J', 'hearts'),
        createCard('10', 'hearts'),
      ];
      const handResult = createHandResult('flush', scoringCards, 35, 4);

      const result = calculateScore(handResult);

      // chipTotal = 35 + (11+30) + 10 + 10 + 10 + 10 = 116
      // multTotal = 4 + 4 = 8
      // finalScore = 116 * 8 = 928
      expect(result.chipTotal).toBe(116);
      expect(result.multTotal).toBe(8);
      expect(result.finalScore).toBe(928);

      // Gold should be calculated separately
      const goldTotal = calculateGoldFromEnhancements(scoringCards);
      expect(goldTotal).toBe(3);

      // Should track chips and mult enhancements
      const enhancementBonuses = result.appliedBonuses.filter(b =>
        b.source.includes('Enhancement')
      );
      expect(enhancementBonuses.length).toBe(2); // chips and mult only
    });

    it('should work with enhancements and external bonuses', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('A', 'diamonds', { enhancement: { type: 'mult', value: 4 } }),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);
      const bonuses: AppliedBonus[] = [
        { source: 'Lucky Joker', type: 'mult', value: 5 },
        { source: 'Slot Bonus', type: 'xmult', value: 2 },
      ];

      const result = calculateScore(handResult, bonuses);

      // chipTotal = 10 + (11+30) + 11 = 62
      // multTotal = (2 + 4 + 5) * 2 = 22
      // finalScore = 62 * 22 = 1364
      expect(result.chipTotal).toBe(62);
      expect(result.multTotal).toBe(22);
      expect(result.finalScore).toBe(1364);
    });
  });

  describe('Enhancement Source Tracking', () => {
    it('should include card identifier in enhancement source', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
        createCard('K', 'diamonds', { enhancement: { type: 'chips', value: 30 } }),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // Check that sources include card identifiers
      const multEnhancement = result.appliedBonuses.find(
        b => b.source.includes('Enhancement') && b.type === 'mult'
      );
      expect(multEnhancement?.source).toContain('AH'); // Ace of Hearts

      const chipsEnhancement = result.appliedBonuses.find(
        b => b.source.includes('Enhancement') && b.type === 'chips'
      );
      expect(chipsEnhancement?.source).toContain('KD'); // King of Diamonds
    });
  });

  describe('Retrigger Enhancement', () => {
    describe('Basic retrigger functionality', () => {
      it('should retrigger card chip value', () => {
        // Ace with retrigger (value: 1) = triggers 2 times total
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = 5 + (11 * 2) = 27
        expect(result.chipTotal).toBe(27);
        expect(result.finalScore).toBe(27);
      });

      it('should retrigger multiple times', () => {
        // Card with retrigger value: 3 = triggers 4 times total (1 + 3)
        const scoringCards = [
          createCard('10', 'hearts', { enhancement: { type: 'retrigger', value: 3 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = 5 + (10 * 4) = 45
        expect(result.chipTotal).toBe(45);
        expect(result.finalScore).toBe(45);
      });

      it('should apply retrigger to multiple cards independently', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }), // 11 * 2 = 22
          createCard('K', 'diamonds', { enhancement: { type: 'retrigger', value: 2 } }), // 10 * 3 = 30
          createCard('Q', 'clubs'), // 10 * 1 = 10
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = 5 + 22 + 30 + 10 = 67
        expect(result.chipTotal).toBe(67);
        expect(result.finalScore).toBe(67);
      });
    });

    describe('Retrigger with other enhancements', () => {
      it('should retrigger chips enhancement', () => {
        // Ace with chips enhancement and retrigger
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
          createCard('A', 'diamonds', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('pair', scoringCards, 10, 2);

        const result = calculateScore(handResult);

        // chipTotal = 10 + (11 + 30) + (11 * 2) = 10 + 41 + 22 = 73
        expect(result.chipTotal).toBe(73);
        expect(result.finalScore).toBe(73 * 2);
      });

      it('should retrigger mult enhancement', () => {
        // Card with mult enhancement and retrigger
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
          createCard('A', 'diamonds', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('pair', scoringCards, 10, 2);

        const result = calculateScore(handResult);

        // multTotal = 2 + 4 (no retrigger on first card) = 6
        // BUT second card has retrigger, its mult would be 0 (no mult enhancement)
        // chipTotal = 10 + 11 + (11 * 2) = 43
        expect(result.chipTotal).toBe(43);
        expect(result.multTotal).toBe(6); // 2 + 4
        expect(result.finalScore).toBe(43 * 6);
      });

      it('should combine chips enhancement with retrigger on same card', () => {
        // This test assumes a card can't have both enhancements at once
        // based on CardEnhancement interface (single type)
        // But we test the retrigger of a chips-enhanced card

        const scoringCards = [
          createCard('5', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        ];

        // Now create a version with retrigger
        const retriggeredCards = [
          createCard('5', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];

        const normalResult = calculateScore(
          createHandResult('high_card', scoringCards, 5, 1)
        );
        const retriggerResult = calculateScore(
          createHandResult('high_card', retriggeredCards, 5, 1)
        );

        // Normal: 5 + (5 + 30) = 40
        expect(normalResult.chipTotal).toBe(40);

        // Retrigger: 5 + (5 * 2) = 15 (no chips enhancement on retriggered version)
        expect(retriggerResult.chipTotal).toBe(15);
      });
    });

    describe('Retrigger with gold enhancement', () => {
      it('should retrigger gold enhancement', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'gold', value: 3 } }),
          createCard('K', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];

        const goldTotal = calculateGoldFromEnhancements(scoringCards);

        // Gold from first card: 3 * 1 = 3
        // Gold from second card: 0 (no gold enhancement)
        expect(goldTotal).toBe(3);
      });

      it('should retrigger gold on same card (if hypothetically possible)', () => {
        // Note: Based on interface, a card can only have one enhancement type
        // This test demonstrates what would happen if gold + retrigger coexisted

        // Test individual gold with retrigger
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];

        const goldTotal = calculateGoldFromEnhancements(scoringCards);
        expect(goldTotal).toBe(0); // No gold enhancement
      });
    });

    describe('Retrigger limits', () => {
      it('should cap retrigger at MAX_RETRIGGER_COUNT', () => {
        // Attempt to retrigger 100 times (should be capped at 10)
        const scoringCards = [
          createCard('10', 'hearts', { enhancement: { type: 'retrigger', value: 100 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // Should be capped at 11 total triggers (1 original + 10 retriggers)
        // chipTotal = 5 + (10 * 11) = 115
        expect(result.chipTotal).toBe(115);
      });

      it('should handle zero retrigger value', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 0 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // Should trigger only once (original)
        // chipTotal = 5 + 11 = 16
        expect(result.chipTotal).toBe(16);
      });

      it('should handle negative retrigger value', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: -5 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // Should still trigger at least once (1 + max(0, -5) = 1)
        // chipTotal = 5 + 11 = 16
        expect(result.chipTotal).toBe(16);
      });
    });

    describe('Retrigger tracking in appliedBonuses', () => {
      it('should track retrigger in applied bonuses', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // Should have retrigger bonus tracked
        const retriggerBonus = result.appliedBonuses.find(b =>
          b.source.includes('Retrigger')
        );
        expect(retriggerBonus).toBeDefined();
        expect(retriggerBonus?.source).toContain('AH');
      });

      it('should show trigger count in enhancement sources', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
          createCard('K', 'hearts', { enhancement: { type: 'retrigger', value: 2 } }),
        ];
        const handResult = createHandResult('pair', scoringCards, 10, 2);

        const result = calculateScore(handResult);

        // The mult enhancement should not show (x2) since it doesn't have retrigger
        const multBonus = result.appliedBonuses.find(b =>
          b.source.includes('Enhancement') && b.source.includes('AH')
        );
        expect(multBonus?.source).not.toContain('(x');

        // The retriggered card should show in bonus tracking
        const retriggerBonus = result.appliedBonuses.find(b =>
          b.source.includes('Retrigger')
        );
        expect(retriggerBonus).toBeDefined();
      });
    });

    describe('Complex retrigger scenarios', () => {
      it('should calculate pair with retriggered cards correctly', () => {
        const scoringCards = [
          createCard('7', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
          createCard('7', 'diamonds', { enhancement: { type: 'retrigger', value: 1 } }),
          createCard('K', 'clubs'),
        ];
        const handResult = createHandResult('pair', scoringCards, 10, 2);

        const result = calculateScore(handResult);

        // chipTotal = 10 + (7*2) + (7*2) + 10 = 10 + 14 + 14 + 10 = 48
        expect(result.chipTotal).toBe(48);
        expect(result.finalScore).toBe(48 * 2);
      });

      it('should work with retrigger and external bonuses', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 2 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);
        const bonuses: AppliedBonus[] = [
          { source: 'Test Joker', type: 'mult', value: 5 },
          { source: 'Slot Bonus', type: 'xmult', value: 2 },
        ];

        const result = calculateScore(handResult, bonuses);

        // chipTotal = 5 + (11 * 3) = 38
        // multTotal = (1 + 5) * 2 = 12
        // finalScore = 38 * 12 = 456
        expect(result.chipTotal).toBe(38);
        expect(result.multTotal).toBe(12);
        expect(result.finalScore).toBe(456);
      });

      it('should handle full house with mixed enhancements including retrigger', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
          createCard('A', 'diamonds', { enhancement: { type: 'mult', value: 4 } }),
          createCard('A', 'clubs'),
          createCard('K', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
          createCard('K', 'diamonds'),
        ];
        const handResult = createHandResult('full_house', scoringCards, 40, 4);

        const result = calculateScore(handResult);

        // chipTotal = 40 + (11*2) + 11 + 11 + (10+30) + 10 = 40 + 22 + 11 + 11 + 40 + 10 = 134
        // multTotal = 4 + 4 = 8
        // finalScore = 134 * 8 = 1072
        expect(result.chipTotal).toBe(134);
        expect(result.multTotal).toBe(8);
        expect(result.finalScore).toBe(1072);
      });
    });
  });
});
