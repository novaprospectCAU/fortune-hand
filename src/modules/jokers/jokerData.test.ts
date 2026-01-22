/**
 * Tests for jokerData module
 */

import { describe, it, expect } from 'vitest';
import {
  getJokerById,
  getAllJokers,
  getJokersByRarity,
  getJokersByTriggerType,
  getJokerCount,
} from './jokerData';

describe('jokerData', () => {
  describe('getJokerById', () => {
    it('should return a joker by its ID', () => {
      const joker = getJokerById('lucky_seven');
      expect(joker).toBeDefined();
      expect(joker?.id).toBe('lucky_seven');
      expect(joker?.name).toBe('Lucky Seven');
    });

    it('should return undefined for non-existent ID', () => {
      const joker = getJokerById('non_existent_joker');
      expect(joker).toBeUndefined();
    });

    it('should return correct joker data structure', () => {
      const joker = getJokerById('lucky_seven');
      expect(joker).toMatchObject({
        id: 'lucky_seven',
        name: 'Lucky Seven',
        description: '×7 Mult if hand has a 7',
        rarity: 'uncommon',
        cost: 65,
        trigger: { type: 'on_play', cardCondition: { rank: '7' } },
        effect: { type: 'multiply', value: 7 },
      });
    });
  });

  describe('getAllJokers', () => {
    it('should return an array of jokers', () => {
      const jokers = getAllJokers();
      expect(Array.isArray(jokers)).toBe(true);
      expect(jokers.length).toBeGreaterThan(0);
    });

    it('should return a copy of the jokers array', () => {
      const jokers1 = getAllJokers();
      const jokers2 = getAllJokers();
      expect(jokers1).not.toBe(jokers2);
    });

    it('should contain all known jokers', () => {
      const jokers = getAllJokers();
      const ids = jokers.map((j) => j.id);
      expect(ids).toContain('lucky_seven');
      expect(ids).toContain('high_roller');
      expect(ids).toContain('echo');
      expect(ids).toContain('fortune_teller');
    });
  });

  describe('getJokersByRarity', () => {
    it('should return common jokers', () => {
      const commonJokers = getJokersByRarity('common');
      expect(commonJokers.length).toBeGreaterThan(0);
      commonJokers.forEach((joker) => {
        expect(joker.rarity).toBe('common');
      });
    });

    it('should return uncommon jokers', () => {
      const uncommonJokers = getJokersByRarity('uncommon');
      expect(uncommonJokers.length).toBeGreaterThan(0);
      uncommonJokers.forEach((joker) => {
        expect(joker.rarity).toBe('uncommon');
      });
    });

    it('should return rare jokers', () => {
      const rareJokers = getJokersByRarity('rare');
      expect(rareJokers.length).toBeGreaterThan(0);
      rareJokers.forEach((joker) => {
        expect(joker.rarity).toBe('rare');
      });
    });

    it('should return legendary jokers', () => {
      const legendaryJokers = getJokersByRarity('legendary');
      expect(legendaryJokers.length).toBeGreaterThan(0);
      legendaryJokers.forEach((joker) => {
        expect(joker.rarity).toBe('legendary');
      });
    });
  });

  describe('getJokersByTriggerType', () => {
    it('should return on_play jokers', () => {
      const jokers = getJokersByTriggerType('on_play');
      expect(jokers.length).toBeGreaterThan(0);
      jokers.forEach((joker) => {
        expect(joker.trigger.type).toBe('on_play');
      });
    });

    it('should return on_score jokers', () => {
      const jokers = getJokersByTriggerType('on_score');
      expect(jokers.length).toBeGreaterThan(0);
      jokers.forEach((joker) => {
        expect(joker.trigger.type).toBe('on_score');
      });
    });

    it('should return on_slot jokers', () => {
      const jokers = getJokersByTriggerType('on_slot');
      expect(jokers.length).toBeGreaterThan(0);
      jokers.forEach((joker) => {
        expect(joker.trigger.type).toBe('on_slot');
      });
    });

    it('should return on_roulette jokers', () => {
      const jokers = getJokersByTriggerType('on_roulette');
      expect(jokers.length).toBeGreaterThan(0);
      jokers.forEach((joker) => {
        expect(joker.trigger.type).toBe('on_roulette');
      });
    });

    it('should return passive jokers', () => {
      const jokers = getJokersByTriggerType('passive');
      expect(jokers.length).toBeGreaterThan(0);
      jokers.forEach((joker) => {
        expect(joker.trigger.type).toBe('passive');
      });
    });
  });

  describe('getJokerCount', () => {
    it('should return the total number of jokers', () => {
      const count = getJokerCount();
      const allJokers = getAllJokers();
      expect(count).toBe(allJokers.length);
    });

    it('should return a positive number', () => {
      const count = getJokerCount();
      expect(count).toBeGreaterThan(0);
    });
  });
});
