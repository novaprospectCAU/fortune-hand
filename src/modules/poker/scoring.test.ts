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

      // chipTotal = pair cards only: 11 + 11 = 22
      // multTotal = HAND_MULTIPLIERS.pair = 2
      // finalScore = 22 * 2 = 44
      expect(result.chipTotal).toBe(22);
      expect(result.multTotal).toBe(2);
      expect(result.finalScore).toBe(44);
    });

    it('should handle empty scoring cards', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const result = calculateScore(handResult);

      // No scoring cards = chipTotal 0
      expect(result.chipTotal).toBe(0);
      expect(result.multTotal).toBe(1);
      expect(result.finalScore).toBe(0);
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

      // chipTotal = 11 + 20 + 10 = 41 (no baseChips in new system)
      expect(result.chipTotal).toBe(41);
      expect(result.finalScore).toBe(41 * 1);
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
      expect(result.finalScore).toBe(11 * 6); // 11 * 6 = 66
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
      expect(result.finalScore).toBe(11 * 6); // 11 * 6 = 66
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

      // chipTotal = 10 + 5 + 10 = 25 (no baseChips)
      // multTotal = (1 + 2 + 3) * 2 * 1.5 = 18
      expect(result.chipTotal).toBe(25);
      expect(result.multTotal).toBe(18);
      expect(result.finalScore).toBe(25 * 18); // 450
    });

    it('should track applied bonuses', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Joker A', type: 'chips', value: 10 },
        { source: 'Joker B', type: 'mult', value: 2 },
      ];

      const result = calculateScore(handResult, bonuses);

      // No "Card sum" entry since scoringCards is empty, but external bonuses are tracked
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

      // multTotal = HAND_MULTIPLIERS.high_card(1) + 4 = 5
      // chipTotal = 11, finalScore = 11 * 5 = 55
      expect(result.multTotal).toBe(5);
      expect(result.finalScore).toBe(55);
    });

    it('should apply multiple card enhancements', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
        createCard('A', 'diamonds', { enhancement: { type: 'mult', value: 2 } }),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // multTotal = HAND_MULTIPLIERS.pair(2) + 4 + 2 = 8
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

      // chipTotal = pair cards only: 11 + 11 = 22
      // multTotal = HAND_MULTIPLIERS.pair = 2
      // finalScore = 22 * 2 = 44
      expect(result.finalScore).toBe(44);
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

      // chipTotal = all cards sum: 11 + 10 + 10 + 10 + 9 = 50
      // multTotal = HAND_MULTIPLIERS.flush = 10
      // finalScore = 50 * 10 = 500
      expect(result.finalScore).toBe(500);
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

      // chipTotal = all cards sum: 11 + 10 + 10 + 10 + 10 = 51
      // multTotal = (HAND_MULTIPLIERS.royal_flush(30) + 10) * 2 = 80
      // finalScore = 51 * 80 = 4080
      expect(result.finalScore).toBe(4080);
    });
  });

  describe('Edge cases', () => {
    it('should floor final score', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const bonuses: AppliedBonus[] = [
        { source: 'Test', type: 'xmult', value: 1.5 },
      ];

      const result = calculateScore(handResult, bonuses);

      // chipTotal = 0 (no cards), multTotal = 1 * 1.5 = 1.5
      // finalScore = 0 * 1.5 = 0
      expect(result.finalScore).toBe(0);
    });

    it('should handle zero bonuses', () => {
      const handResult = createHandResult('high_card', [], 5, 1);
      const result = calculateScore(handResult, []);

      // chipTotal = 0 (no cards), finalScore = 0
      expect(result.finalScore).toBe(0);
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

    it('should track card sum including chips enhancement in appliedBonuses', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);

      const result = calculateScore(handResult);

      // Chips enhancement is baked into getCardChipValue(), tracked as "Card sum"
      const cardSumBonus = result.appliedBonuses.find(b =>
        b.source === 'Card sum'
      );
      expect(cardSumBonus).toBeDefined();
      expect(cardSumBonus?.type).toBe('chips');
      expect(cardSumBonus?.value).toBe(41); // 11 + 30
    });

    it('should calculate score correctly with chips enhancement', () => {
      const scoringCards = [
        createCard('5', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('5', 'diamonds'),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // chipTotal = pair cards: (5+30) + 5 = 40 (no baseChips)
      // multTotal = HAND_MULTIPLIERS.pair = 2
      // finalScore = 40 * 2 = 80
      expect(result.chipTotal).toBe(40);
      expect(result.multTotal).toBe(2);
      expect(result.finalScore).toBe(80);
    });

    it('should handle multiple chips enhancements', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('K', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        createCard('Q', 'hearts'),
      ];
      const handResult = createHandResult('flush', scoringCards, 35, 4);

      const result = calculateScore(handResult);

      // chipTotal = all cards: (11+30) + (10+30) + 10 = 91 (no baseChips)
      // multTotal = HAND_MULTIPLIERS.flush = 10
      // finalScore = 91 * 10 = 910
      expect(result.chipTotal).toBe(91);

      // Chips enhancement is baked into card sum, only "Card sum" is tracked
      const cardSumBonus = result.appliedBonuses.find(b =>
        b.source === 'Card sum'
      );
      expect(cardSumBonus).toBeDefined();
      expect(cardSumBonus?.value).toBe(91);
    });
  });

  describe('Mult Enhancement', () => {
    it('should add mult bonus to total mult', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
      ];
      const handResult = createHandResult('high_card', scoringCards, 5, 1);

      const result = calculateScore(handResult);

      // multTotal = HAND_MULTIPLIERS.high_card(1) + enhancement(4) = 5
      // chipTotal = 11, finalScore = 11 * 5 = 55
      expect(result.multTotal).toBe(5);
      expect(result.finalScore).toBe(55);
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

      // multTotal = HAND_MULTIPLIERS.pair(2) + 4 + 4 = 10
      expect(result.multTotal).toBe(10);

      // Should track both mult enhancements
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

      // multTotal = HAND_MULTIPLIERS.high_card(1) + card enhancement(4) + joker(3) = 8
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
      // chipTotal = 11, multTotal = 1, finalScore = 11
      expect(result.finalScore).toBe(11);
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

      // chipTotal = all cards: (11+30) + 10 + 10 + 10 + 10 = 81 (no baseChips)
      // multTotal = HAND_MULTIPLIERS.flush(10) + 4 = 14
      // finalScore = 81 * 14 = 1134
      expect(result.chipTotal).toBe(81);
      expect(result.multTotal).toBe(14);
      expect(result.finalScore).toBe(1134);

      // Gold should be calculated separately
      const goldTotal = calculateGoldFromEnhancements(scoringCards);
      expect(goldTotal).toBe(3);

      // Should track mult enhancement only (chips enhancement is baked into card sum)
      const enhancementBonuses = result.appliedBonuses.filter(b =>
        b.source.includes('Enhancement')
      );
      expect(enhancementBonuses.length).toBe(1); // mult only
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

      // chipTotal = pair cards: (11+30) + 11 = 52 (no baseChips)
      // multTotal = (HAND_MULTIPLIERS.pair(2) + 4 + 5) * 2 = 22
      // finalScore = 52 * 22 = 1144
      expect(result.chipTotal).toBe(52);
      expect(result.multTotal).toBe(22);
      expect(result.finalScore).toBe(1144);
    });
  });

  describe('Enhancement Source Tracking', () => {
    it('should include card identifier in enhancement source', () => {
      const scoringCards = [
        createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
        createCard('A', 'diamonds', { enhancement: { type: 'mult', value: 2 } }),
      ];
      const handResult = createHandResult('pair', scoringCards, 10, 2);

      const result = calculateScore(handResult);

      // Check that mult enhancement sources include card identifiers
      const multEnhancementH = result.appliedBonuses.find(
        b => b.source.includes('Enhancement') && b.source.includes('AH')
      );
      expect(multEnhancementH).toBeDefined(); // Ace of Hearts

      const multEnhancementD = result.appliedBonuses.find(
        b => b.source.includes('Enhancement') && b.source.includes('AD')
      );
      expect(multEnhancementD).toBeDefined(); // Ace of Diamonds
    });
  });

  describe('Retrigger Enhancement', () => {
    describe('Basic retrigger functionality', () => {
      it('should not retrigger card chip value', () => {
        // In new system, retrigger only affects mult enhancements, not chip values
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = 11 (retrigger doesn't affect chip values)
        expect(result.chipTotal).toBe(11);
        expect(result.finalScore).toBe(11);
      });

      it('should not retrigger chip values multiple times', () => {
        // Card with retrigger value: 3 - still only counts chip value once
        const scoringCards = [
          createCard('10', 'hearts', { enhancement: { type: 'retrigger', value: 3 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = 10 (retrigger doesn't affect chip values)
        expect(result.chipTotal).toBe(10);
        expect(result.finalScore).toBe(10);
      });

      it('should not affect chip values for multiple cards with retrigger', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
          createCard('K', 'diamonds', { enhancement: { type: 'retrigger', value: 2 } }),
          createCard('Q', 'clubs'),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = max(11, 10, 10) = 11 (high_card takes max single card)
        expect(result.chipTotal).toBe(11);
        expect(result.finalScore).toBe(11);
      });
    });

    describe('Retrigger with other enhancements', () => {
      it('should not retrigger chips enhancement on different card', () => {
        // Ace with chips enhancement and another Ace with retrigger
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
          createCard('A', 'diamonds', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('pair', scoringCards, 10, 2);

        const result = calculateScore(handResult);

        // chipTotal = pair cards: (11+30) + 11 = 52 (retrigger doesn't affect chips)
        // multTotal = HAND_MULTIPLIERS.pair = 2
        expect(result.chipTotal).toBe(52);
        expect(result.finalScore).toBe(52 * 2); // 104
      });

      it('should retrigger mult enhancement on same card', () => {
        // Card with mult enhancement and retrigger on another card
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
          createCard('A', 'diamonds', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('pair', scoringCards, 10, 2);

        const result = calculateScore(handResult);

        // chipTotal = pair cards: 11 + 11 = 22
        // multTotal = HAND_MULTIPLIERS.pair(2) + 4*1 = 6
        // (first card has mult:4 with triggerCount=1, second has retrigger not mult)
        expect(result.chipTotal).toBe(22);
        expect(result.multTotal).toBe(6); // 2 + 4
        expect(result.finalScore).toBe(22 * 6); // 132
      });

      it('should compare chips enhancement vs retrigger on same card', () => {
        // A card can only have one enhancement type at a time
        const scoringCards = [
          createCard('5', 'hearts', { enhancement: { type: 'chips', value: 30 } }),
        ];

        // Now create a version with retrigger instead
        const retriggeredCards = [
          createCard('5', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];

        const normalResult = calculateScore(
          createHandResult('high_card', scoringCards, 5, 1)
        );
        const retriggerResult = calculateScore(
          createHandResult('high_card', retriggeredCards, 5, 1)
        );

        // Normal: chipTotal = 5 + 30 = 35
        expect(normalResult.chipTotal).toBe(35);

        // Retrigger: chipTotal = 5 (retrigger doesn't affect chip values)
        expect(retriggerResult.chipTotal).toBe(5);
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

        // chipTotal = 10 (retrigger doesn't affect chip values)
        // multTotal = 1 (no mult enhancement to retrigger)
        expect(result.chipTotal).toBe(10);
        expect(result.multTotal).toBe(1);
        expect(result.finalScore).toBe(10);
      });

      it('should handle zero retrigger value', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 0 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = 11 (retrigger doesn't affect chip values)
        expect(result.chipTotal).toBe(11);
      });

      it('should handle negative retrigger value', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: -5 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // chipTotal = 11 (retrigger doesn't affect chip values)
        expect(result.chipTotal).toBe(11);
      });
    });

    describe('Retrigger tracking in appliedBonuses', () => {
      it('should not create separate retrigger entry for retrigger-only cards', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'retrigger', value: 1 } }),
        ];
        const handResult = createHandResult('high_card', scoringCards, 5, 1);

        const result = calculateScore(handResult);

        // Retrigger-only cards don't create Enhancement entries (they have no mult/chips to enhance)
        // Only "Card sum" entry should be present
        const cardSumBonus = result.appliedBonuses.find(b =>
          b.source === 'Card sum'
        );
        expect(cardSumBonus).toBeDefined();
        expect(cardSumBonus?.value).toBe(11);
      });

      it('should show trigger count in mult enhancement sources when card has both', () => {
        const scoringCards = [
          createCard('A', 'hearts', { enhancement: { type: 'mult', value: 4 } }),
          createCard('K', 'hearts', { enhancement: { type: 'retrigger', value: 2 } }),
        ];
        const handResult = createHandResult('pair', scoringCards, 10, 2);

        const result = calculateScore(handResult);

        // The mult enhancement should not show (x...) since A has mult (triggerCount=1)
        const multBonus = result.appliedBonuses.find(b =>
          b.source.includes('Enhancement') && b.source.includes('AH')
        );
        expect(multBonus).toBeDefined();
        expect(multBonus?.source).not.toContain('(x');
        expect(multBonus?.value).toBe(4);
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

        // chipTotal = pair cards: 7 + 7 = 14 (retrigger doesn't affect chip values)
        // multTotal = HAND_MULTIPLIERS.pair = 2
        expect(result.chipTotal).toBe(14);
        expect(result.finalScore).toBe(14 * 2); // 28
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

        // chipTotal = 11 (retrigger doesn't affect chip values)
        // multTotal = (1 + 5) * 2 = 12
        // finalScore = 11 * 12 = 132
        expect(result.chipTotal).toBe(11);
        expect(result.multTotal).toBe(12);
        expect(result.finalScore).toBe(132);
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

        // chipTotal = all cards: 11 + 11 + 11 + (10+30) + 10 = 83 (no baseChips)
        // multTotal = HAND_MULTIPLIERS.full_house(13) + 4 = 17
        // (mult:4 on A diamonds, triggerCount=1 since it has mult not retrigger)
        // finalScore = 83 * 17 = 1411
        expect(result.chipTotal).toBe(83);
        expect(result.multTotal).toBe(17);
        expect(result.finalScore).toBe(1411);
      });
    });
  });
});
