/**
 * Tests for effects module
 */

import { describe, it, expect } from 'vitest';
import {
  applyEffect,
  getAppliedBonuses,
  isScoreBonusEffect,
  getSlotModifier,
  getRouletteModifier,
  getRetriggerCount,
} from './effects';
import type { Joker, JokerContext } from '@/types/interfaces';

// Helper to create test joker
function createJoker(effect: Joker['effect']): Joker {
  return {
    id: 'test_joker',
    name: 'Test Joker',
    description: 'Test description',
    rarity: 'common',
    cost: 10,
    trigger: { type: 'on_score' },
    effect,
  };
}

// Helper to create test context
function createContext(): JokerContext {
  return {
    phase: 'SCORE_PHASE',
  };
}

describe('effects', () => {
  describe('applyEffect', () => {
    it('should handle add_chips effect', () => {
      const joker = createJoker({ type: 'add_chips', value: 50 });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(1);
      expect(result.bonuses[0]).toEqual({
        source: 'Test Joker',
        type: 'chips',
        value: 50,
      });
      expect(result.goldToAdd).toBe(0);
      expect(result.slotModifier).toBeNull();
    });

    it('should handle add_mult effect', () => {
      const joker = createJoker({ type: 'add_mult', value: 77 });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(1);
      expect(result.bonuses[0]).toEqual({
        source: 'Test Joker',
        type: 'mult',
        value: 77,
      });
    });

    it('should handle multiply effect', () => {
      const joker = createJoker({ type: 'multiply', value: 2 });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(1);
      expect(result.bonuses[0]).toEqual({
        source: 'Test Joker',
        type: 'xmult',
        value: 2,
      });
    });

    it('should handle add_gold effect', () => {
      const joker = createJoker({ type: 'add_gold', value: 10 });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(0);
      expect(result.goldToAdd).toBe(10);
    });

    it('should handle modify_slot effect', () => {
      const joker = createJoker({
        type: 'modify_slot',
        modification: { symbolWeights: { star: 10 } },
      });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(0);
      expect(result.slotModifier).toEqual({ symbolWeights: { star: 10 } });
    });

    it('should handle modify_roulette effect', () => {
      const joker = createJoker({
        type: 'modify_roulette',
        modification: { safeZoneBonus: 30 },
      });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(0);
      expect(result.rouletteModifier).toEqual({ safeZoneBonus: 30 });
    });

    it('should handle retrigger effect', () => {
      const joker = createJoker({ type: 'retrigger', count: 1 });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(0);
      expect(result.retriggerCount).toBe(1);
    });

    it('should handle custom effect', () => {
      const joker = createJoker({ type: 'custom', handler: 'fortuneTeller' });
      const result = applyEffect(joker, createContext());

      expect(result.bonuses).toHaveLength(0);
      expect(result.customHandler).toBe('fortuneTeller');
    });
  });

  describe('getAppliedBonuses', () => {
    it('should return chips bonus for add_chips', () => {
      const joker = createJoker({ type: 'add_chips', value: 100 });
      const bonuses = getAppliedBonuses(joker, createContext());

      expect(bonuses).toHaveLength(1);
      expect(bonuses[0]).toEqual({
        source: 'Test Joker',
        type: 'chips',
        value: 100,
      });
    });

    it('should return mult bonus for add_mult', () => {
      const joker = createJoker({ type: 'add_mult', value: 5 });
      const bonuses = getAppliedBonuses(joker, createContext());

      expect(bonuses).toHaveLength(1);
      expect(bonuses[0]).toEqual({
        source: 'Test Joker',
        type: 'mult',
        value: 5,
      });
    });

    it('should return xmult bonus for multiply', () => {
      const joker = createJoker({ type: 'multiply', value: 3 });
      const bonuses = getAppliedBonuses(joker, createContext());

      expect(bonuses).toHaveLength(1);
      expect(bonuses[0]).toEqual({
        source: 'Test Joker',
        type: 'xmult',
        value: 3,
      });
    });

    it('should return empty array for non-bonus effects', () => {
      const nonBonusEffects: Joker['effect'][] = [
        { type: 'add_gold', value: 10 },
        { type: 'modify_slot', modification: {} },
        { type: 'modify_roulette', modification: {} },
        { type: 'retrigger', count: 1 },
        { type: 'custom', handler: 'test' },
      ];

      nonBonusEffects.forEach((effect) => {
        const joker = createJoker(effect);
        const bonuses = getAppliedBonuses(joker, createContext());
        expect(bonuses).toHaveLength(0);
      });
    });
  });

  describe('isScoreBonusEffect', () => {
    it('should return true for add_chips', () => {
      expect(isScoreBonusEffect('add_chips')).toBe(true);
    });

    it('should return true for add_mult', () => {
      expect(isScoreBonusEffect('add_mult')).toBe(true);
    });

    it('should return true for multiply', () => {
      expect(isScoreBonusEffect('multiply')).toBe(true);
    });

    it('should return false for other effects', () => {
      expect(isScoreBonusEffect('add_gold')).toBe(false);
      expect(isScoreBonusEffect('modify_slot')).toBe(false);
      expect(isScoreBonusEffect('modify_roulette')).toBe(false);
      expect(isScoreBonusEffect('retrigger')).toBe(false);
      expect(isScoreBonusEffect('custom')).toBe(false);
    });
  });

  describe('getSlotModifier', () => {
    it('should return modifier for modify_slot effect', () => {
      const joker = createJoker({
        type: 'modify_slot',
        modification: { symbolWeights: { skull: 0, wild: 15 } },
      });
      const modifier = getSlotModifier(joker);

      expect(modifier).toEqual({ symbolWeights: { skull: 0, wild: 15 } });
    });

    it('should return null for other effects', () => {
      const joker = createJoker({ type: 'add_chips', value: 50 });
      const modifier = getSlotModifier(joker);

      expect(modifier).toBeNull();
    });
  });

  describe('getRouletteModifier', () => {
    it('should return modifier for modify_roulette effect', () => {
      const joker = createJoker({
        type: 'modify_roulette',
        modification: { maxMultiplier: 2, safeZoneBonus: 20 },
      });
      const modifier = getRouletteModifier(joker);

      expect(modifier).toEqual({ maxMultiplier: 2, safeZoneBonus: 20 });
    });

    it('should return null for other effects', () => {
      const joker = createJoker({ type: 'add_mult', value: 10 });
      const modifier = getRouletteModifier(joker);

      expect(modifier).toBeNull();
    });
  });

  describe('getRetriggerCount', () => {
    it('should return count for retrigger effect', () => {
      const joker = createJoker({ type: 'retrigger', count: 2 });
      const count = getRetriggerCount(joker);

      expect(count).toBe(2);
    });

    it('should return 0 for other effects', () => {
      const joker = createJoker({ type: 'add_chips', value: 50 });
      const count = getRetriggerCount(joker);

      expect(count).toBe(0);
    });
  });
});
