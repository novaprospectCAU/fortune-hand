/**
 * Hand Ranks Tests
 *
 * 핸드 타입 상수 및 유틸리티 함수 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  getHandRanking,
  getBaseHandValue,
  rankToNumber,
  rankToChips,
  rankToNumberLow,
  compareHandTypes,
  HAND_TYPE_PRIORITY,
  BASE_HAND_VALUES,
  HAND_RANKINGS,
} from './handRanks';

describe('getHandRanking', () => {
  it('should return correct ranking for each hand type', () => {
    expect(getHandRanking('high_card')).toBe(0);
    expect(getHandRanking('pair')).toBe(1);
    expect(getHandRanking('two_pair')).toBe(2);
    expect(getHandRanking('three_of_a_kind')).toBe(3);
    expect(getHandRanking('straight')).toBe(4);
    expect(getHandRanking('flush')).toBe(5);
    expect(getHandRanking('full_house')).toBe(6);
    expect(getHandRanking('four_of_a_kind')).toBe(7);
    expect(getHandRanking('straight_flush')).toBe(8);
    expect(getHandRanking('royal_flush')).toBe(9);
  });
});

describe('getBaseHandValue', () => {
  it('should return correct base chips and mult for high card', () => {
    const { chips, mult } = getBaseHandValue('high_card');
    expect(chips).toBe(5);
    expect(mult).toBe(1);
  });

  it('should return correct base chips and mult for pair', () => {
    const { chips, mult } = getBaseHandValue('pair');
    expect(chips).toBe(10);
    expect(mult).toBe(2);
  });

  it('should return correct base chips and mult for royal flush', () => {
    const { chips, mult } = getBaseHandValue('royal_flush');
    expect(chips).toBe(100);
    expect(mult).toBe(8);
  });

  it('should return correct base chips and mult for all hand types', () => {
    expect(getBaseHandValue('two_pair')).toEqual({ chips: 20, mult: 2 });
    expect(getBaseHandValue('three_of_a_kind')).toEqual({ chips: 30, mult: 3 });
    expect(getBaseHandValue('straight')).toEqual({ chips: 30, mult: 4 });
    expect(getBaseHandValue('flush')).toEqual({ chips: 35, mult: 4 });
    expect(getBaseHandValue('full_house')).toEqual({ chips: 40, mult: 4 });
    expect(getBaseHandValue('four_of_a_kind')).toEqual({ chips: 60, mult: 7 });
    expect(getBaseHandValue('straight_flush')).toEqual({ chips: 100, mult: 8 });
  });
});

describe('rankToNumber', () => {
  it('should return 14 for Ace', () => {
    expect(rankToNumber('A')).toBe(14);
  });

  it('should return correct values for number cards', () => {
    expect(rankToNumber('2')).toBe(2);
    expect(rankToNumber('5')).toBe(5);
    expect(rankToNumber('10')).toBe(10);
  });

  it('should return correct values for face cards', () => {
    expect(rankToNumber('J')).toBe(11);
    expect(rankToNumber('Q')).toBe(12);
    expect(rankToNumber('K')).toBe(13);
  });
});

describe('rankToChips', () => {
  it('should return 11 for Ace', () => {
    expect(rankToChips('A')).toBe(11);
  });

  it('should return face value for number cards', () => {
    expect(rankToChips('2')).toBe(2);
    expect(rankToChips('5')).toBe(5);
    expect(rankToChips('10')).toBe(10);
  });

  it('should return 10 for face cards', () => {
    expect(rankToChips('J')).toBe(10);
    expect(rankToChips('Q')).toBe(10);
    expect(rankToChips('K')).toBe(10);
  });
});

describe('rankToNumberLow', () => {
  it('should return 1 for Ace (low)', () => {
    expect(rankToNumberLow('A')).toBe(1);
  });

  it('should return same as rankToNumber for other cards', () => {
    expect(rankToNumberLow('2')).toBe(2);
    expect(rankToNumberLow('K')).toBe(13);
    expect(rankToNumberLow('10')).toBe(10);
  });
});

describe('compareHandTypes', () => {
  it('should return positive when first hand is stronger', () => {
    expect(compareHandTypes('royal_flush', 'high_card')).toBeGreaterThan(0);
    expect(compareHandTypes('pair', 'high_card')).toBeGreaterThan(0);
  });

  it('should return negative when first hand is weaker', () => {
    expect(compareHandTypes('high_card', 'royal_flush')).toBeLessThan(0);
    expect(compareHandTypes('high_card', 'pair')).toBeLessThan(0);
  });

  it('should return 0 for equal hand types', () => {
    expect(compareHandTypes('pair', 'pair')).toBe(0);
    expect(compareHandTypes('royal_flush', 'royal_flush')).toBe(0);
  });
});

describe('HAND_TYPE_PRIORITY', () => {
  it('should be in descending order of strength', () => {
    expect(HAND_TYPE_PRIORITY[0]).toBe('royal_flush');
    expect(HAND_TYPE_PRIORITY[HAND_TYPE_PRIORITY.length - 1]).toBe('high_card');
  });

  it('should contain all hand types', () => {
    expect(HAND_TYPE_PRIORITY.length).toBe(10);
    expect(HAND_TYPE_PRIORITY).toContain('pair');
    expect(HAND_TYPE_PRIORITY).toContain('flush');
    expect(HAND_TYPE_PRIORITY).toContain('straight');
  });
});

describe('BASE_HAND_VALUES', () => {
  it('should have entries for all hand types', () => {
    const handTypes = Object.keys(BASE_HAND_VALUES);
    expect(handTypes.length).toBe(10);
  });

  it('should have higher chip values for stronger hands', () => {
    expect(BASE_HAND_VALUES.royal_flush.chips).toBeGreaterThan(BASE_HAND_VALUES.high_card.chips);
    expect(BASE_HAND_VALUES.four_of_a_kind.chips).toBeGreaterThan(BASE_HAND_VALUES.pair.chips);
  });
});

describe('HAND_RANKINGS', () => {
  it('should have entries for all hand types', () => {
    const handTypes = Object.keys(HAND_RANKINGS);
    expect(handTypes.length).toBe(10);
  });

  it('should have royal_flush as highest rank', () => {
    const maxRank = Math.max(...Object.values(HAND_RANKINGS));
    expect(HAND_RANKINGS.royal_flush).toBe(maxRank);
  });

  it('should have high_card as lowest rank', () => {
    const minRank = Math.min(...Object.values(HAND_RANKINGS));
    expect(HAND_RANKINGS.high_card).toBe(minRank);
  });
});
