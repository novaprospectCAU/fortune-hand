/**
 * Special Card Triggers Tests
 */

import { describe, it, expect } from 'vitest';
import type { Card, SlotResult } from '@/types/interfaces';
import {
  detectTriggers,
  getTriggerEffects,
  countSlotTriggers,
  countRouletteTriggers,
  hasTriggerType,
  mergeSlotResults,
} from './triggers';

// Test data
const normalCard: Card = {
  id: 'test_normal',
  suit: 'hearts',
  rank: '5',
};

const slotTriggerCard: Card = {
  id: 'slot_seven',
  suit: 'hearts',
  rank: '7',
  triggerSlot: true,
};

const rouletteTriggerCard: Card = {
  id: 'roulette_king',
  suit: 'diamonds',
  rank: 'K',
  triggerRoulette: true,
};

const bothTriggerCard: Card = {
  id: 'dual_trigger',
  suit: 'spades',
  rank: 'A',
  triggerSlot: true,
  triggerRoulette: true,
};

describe('detectTriggers', () => {
  it('should detect no triggers in normal cards', () => {
    const result = detectTriggers([normalCard, { ...normalCard, id: 'test_2' }]);
    expect(result.hasSlotTrigger).toBe(false);
    expect(result.hasRouletteTrigger).toBe(false);
    expect(result.slotTriggerCards).toHaveLength(0);
    expect(result.rouletteTriggerCards).toHaveLength(0);
  });

  it('should detect slot trigger', () => {
    const result = detectTriggers([normalCard, slotTriggerCard]);
    expect(result.hasSlotTrigger).toBe(true);
    expect(result.hasRouletteTrigger).toBe(false);
    expect(result.slotTriggerCards).toHaveLength(1);
    expect(result.slotTriggerCards[0]).toBe(slotTriggerCard);
  });

  it('should detect roulette trigger', () => {
    const result = detectTriggers([normalCard, rouletteTriggerCard]);
    expect(result.hasSlotTrigger).toBe(false);
    expect(result.hasRouletteTrigger).toBe(true);
    expect(result.rouletteTriggerCards).toHaveLength(1);
    expect(result.rouletteTriggerCards[0]).toBe(rouletteTriggerCard);
  });

  it('should detect both trigger types', () => {
    const result = detectTriggers([slotTriggerCard, rouletteTriggerCard]);
    expect(result.hasSlotTrigger).toBe(true);
    expect(result.hasRouletteTrigger).toBe(true);
    expect(result.slotTriggerCards).toHaveLength(1);
    expect(result.rouletteTriggerCards).toHaveLength(1);
  });

  it('should detect multiple triggers of same type', () => {
    const result = detectTriggers([
      slotTriggerCard,
      { ...slotTriggerCard, id: 'slot_seven_2' },
      normalCard,
    ]);
    expect(result.hasSlotTrigger).toBe(true);
    expect(result.slotTriggerCards).toHaveLength(2);
  });

  it('should detect card with both trigger types', () => {
    const result = detectTriggers([bothTriggerCard]);
    expect(result.hasSlotTrigger).toBe(true);
    expect(result.hasRouletteTrigger).toBe(true);
    expect(result.slotTriggerCards).toHaveLength(1);
    expect(result.rouletteTriggerCards).toHaveLength(1);
    expect(result.slotTriggerCards[0]).toBe(bothTriggerCard);
    expect(result.rouletteTriggerCards[0]).toBe(bothTriggerCard);
  });

  it('should handle empty card array', () => {
    const result = detectTriggers([]);
    expect(result.hasSlotTrigger).toBe(false);
    expect(result.hasRouletteTrigger).toBe(false);
    expect(result.slotTriggerCards).toHaveLength(0);
    expect(result.rouletteTriggerCards).toHaveLength(0);
  });
});

describe('getTriggerEffects', () => {
  it('should return empty array for normal cards', () => {
    const effects = getTriggerEffects([normalCard]);
    expect(effects).toHaveLength(0);
  });

  it('should create slot spin effect', () => {
    const effects = getTriggerEffects([slotTriggerCard]);
    expect(effects).toHaveLength(1);
    expect(effects[0]?.type).toBe('slot_spin');
    expect(effects[0]?.source).toBe(slotTriggerCard);
    expect(effects[0]?.description).toContain('7 of hearts');
    expect(effects[0]?.description).toContain('slot spin');
  });

  it('should create roulette spin effect', () => {
    const effects = getTriggerEffects([rouletteTriggerCard]);
    expect(effects).toHaveLength(1);
    expect(effects[0]?.type).toBe('roulette_spin');
    expect(effects[0]?.source).toBe(rouletteTriggerCard);
    expect(effects[0]?.description).toContain('K of diamonds');
    expect(effects[0]?.description).toContain('roulette');
  });

  it('should create multiple effects', () => {
    const effects = getTriggerEffects([slotTriggerCard, rouletteTriggerCard]);
    expect(effects).toHaveLength(2);
    const slotEffect = effects.find(e => e.type === 'slot_spin');
    const rouletteEffect = effects.find(e => e.type === 'roulette_spin');
    expect(slotEffect).toBeDefined();
    expect(rouletteEffect).toBeDefined();
  });

  it('should create two effects for card with both triggers', () => {
    const effects = getTriggerEffects([bothTriggerCard]);
    expect(effects).toHaveLength(2);
    expect(effects[0]?.type).toBe('slot_spin');
    expect(effects[1]?.type).toBe('roulette_spin');
  });
});

describe('countSlotTriggers', () => {
  it('should count zero for normal cards', () => {
    expect(countSlotTriggers([normalCard])).toBe(0);
  });

  it('should count slot trigger cards', () => {
    expect(countSlotTriggers([slotTriggerCard])).toBe(1);
    expect(countSlotTriggers([slotTriggerCard, normalCard])).toBe(1);
    expect(countSlotTriggers([slotTriggerCard, slotTriggerCard])).toBe(2);
  });

  it('should handle empty array', () => {
    expect(countSlotTriggers([])).toBe(0);
  });

  it('should count card with both triggers', () => {
    expect(countSlotTriggers([bothTriggerCard])).toBe(1);
  });
});

describe('countRouletteTriggers', () => {
  it('should count zero for normal cards', () => {
    expect(countRouletteTriggers([normalCard])).toBe(0);
  });

  it('should count roulette trigger cards', () => {
    expect(countRouletteTriggers([rouletteTriggerCard])).toBe(1);
    expect(countRouletteTriggers([rouletteTriggerCard, normalCard])).toBe(1);
    expect(countRouletteTriggers([rouletteTriggerCard, rouletteTriggerCard])).toBe(2);
  });

  it('should handle empty array', () => {
    expect(countRouletteTriggers([])).toBe(0);
  });

  it('should count card with both triggers', () => {
    expect(countRouletteTriggers([bothTriggerCard])).toBe(1);
  });
});

describe('hasTriggerType', () => {
  it('should detect slot triggers', () => {
    expect(hasTriggerType([normalCard], 'slot')).toBe(false);
    expect(hasTriggerType([slotTriggerCard], 'slot')).toBe(true);
    expect(hasTriggerType([normalCard, slotTriggerCard], 'slot')).toBe(true);
  });

  it('should detect roulette triggers', () => {
    expect(hasTriggerType([normalCard], 'roulette')).toBe(false);
    expect(hasTriggerType([rouletteTriggerCard], 'roulette')).toBe(true);
    expect(hasTriggerType([normalCard, rouletteTriggerCard], 'roulette')).toBe(true);
  });

  it('should work with card having both triggers', () => {
    expect(hasTriggerType([bothTriggerCard], 'slot')).toBe(true);
    expect(hasTriggerType([bothTriggerCard], 'roulette')).toBe(true);
  });
});

describe('mergeSlotResults', () => {
  const baseResult: SlotResult = {
    symbols: ['card', 'card', 'card'],
    isJackpot: false,
    effects: {
      cardBonus: { extraDraw: 1, handSize: 0, scoreMultiplier: 1 },
      rouletteBonus: { safeZoneBonus: 0, maxMultiplier: 0, freeSpins: 0 },
      instant: { gold: 0, chips: 0 },
      penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
    },
  };

  it('should return null for empty array', () => {
    expect(mergeSlotResults([])).toBeNull();
  });

  it('should return single result unchanged', () => {
    const result = mergeSlotResults([baseResult]);
    expect(result).toEqual(baseResult);
  });

  it('should merge jackpot status (any jackpot = jackpot)', () => {
    const jackpotResult = { ...baseResult, isJackpot: true };
    const merged = mergeSlotResults([baseResult, jackpotResult]);
    expect(merged?.isJackpot).toBe(true);
  });

  it('should sum card bonuses (extraDraw and handSize)', () => {
    const result1 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        cardBonus: { extraDraw: 2, handSize: 1, scoreMultiplier: 1 },
      },
    };
    const result2 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        cardBonus: { extraDraw: 1, handSize: 0, scoreMultiplier: 1 },
      },
    };

    const merged = mergeSlotResults([result1, result2]);
    expect(merged?.effects.cardBonus.extraDraw).toBe(3);
    expect(merged?.effects.cardBonus.handSize).toBe(1);
  });

  it('should multiply score multipliers', () => {
    const result1 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 2 },
      },
    };
    const result2 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 1.5 },
      },
    };

    const merged = mergeSlotResults([result1, result2]);
    expect(merged?.effects.cardBonus.scoreMultiplier).toBe(3);
  });

  it('should sum roulette bonuses', () => {
    const result1 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        rouletteBonus: { safeZoneBonus: 20, maxMultiplier: 1, freeSpins: 1 },
      },
    };
    const result2 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        rouletteBonus: { safeZoneBonus: 10, maxMultiplier: 2, freeSpins: 0 },
      },
    };

    const merged = mergeSlotResults([result1, result2]);
    expect(merged?.effects.rouletteBonus.safeZoneBonus).toBe(30);
    expect(merged?.effects.rouletteBonus.maxMultiplier).toBe(3);
    expect(merged?.effects.rouletteBonus.freeSpins).toBe(1);
  });

  it('should sum instant rewards', () => {
    const result1 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        instant: { gold: 10, chips: 50 },
      },
    };
    const result2 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        instant: { gold: 5, chips: 30 },
      },
    };

    const merged = mergeSlotResults([result1, result2]);
    expect(merged?.effects.instant.gold).toBe(15);
    expect(merged?.effects.instant.chips).toBe(80);
  });

  it('should take maximum penalties', () => {
    const result1 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        penalty: { discardCards: 2, skipRoulette: false, loseGold: 5 },
      },
    };
    const result2 = {
      ...baseResult,
      effects: {
        ...baseResult.effects,
        penalty: { discardCards: 1, skipRoulette: true, loseGold: 10 },
      },
    };

    const merged = mergeSlotResults([result1, result2]);
    expect(merged?.effects.penalty.discardCards).toBe(2);
    expect(merged?.effects.penalty.skipRoulette).toBe(true);
    expect(merged?.effects.penalty.loseGold).toBe(10);
  });

  it('should merge multiple results correctly', () => {
    const results = [
      {
        ...baseResult,
        effects: {
          cardBonus: { extraDraw: 1, handSize: 0, scoreMultiplier: 2 },
          rouletteBonus: { safeZoneBonus: 10, maxMultiplier: 0, freeSpins: 1 },
          instant: { gold: 5, chips: 20 },
          penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
        },
      },
      {
        ...baseResult,
        effects: {
          cardBonus: { extraDraw: 2, handSize: 1, scoreMultiplier: 1.5 },
          rouletteBonus: { safeZoneBonus: 5, maxMultiplier: 1, freeSpins: 0 },
          instant: { gold: 10, chips: 30 },
          penalty: { discardCards: 1, skipRoulette: false, loseGold: 5 },
        },
      },
      {
        ...baseResult,
        isJackpot: true,
        effects: {
          cardBonus: { extraDraw: 1, handSize: 0, scoreMultiplier: 1 },
          rouletteBonus: { safeZoneBonus: 20, maxMultiplier: 2, freeSpins: 1 },
          instant: { gold: 50, chips: 100 },
          penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
        },
      },
    ];

    const merged = mergeSlotResults(results);
    expect(merged?.isJackpot).toBe(true);
    expect(merged?.effects.cardBonus.extraDraw).toBe(4);
    expect(merged?.effects.cardBonus.handSize).toBe(1);
    expect(merged?.effects.cardBonus.scoreMultiplier).toBe(3); // 2 * 1.5 * 1
    expect(merged?.effects.rouletteBonus.safeZoneBonus).toBe(35);
    expect(merged?.effects.rouletteBonus.maxMultiplier).toBe(3);
    expect(merged?.effects.rouletteBonus.freeSpins).toBe(2);
    expect(merged?.effects.instant.gold).toBe(65);
    expect(merged?.effects.instant.chips).toBe(150);
    expect(merged?.effects.penalty.discardCards).toBe(1);
    expect(merged?.effects.penalty.loseGold).toBe(5);
  });
});
