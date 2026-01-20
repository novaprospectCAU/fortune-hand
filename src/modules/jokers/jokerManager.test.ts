/**
 * Tests for jokerManager module
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateJokers,
  evaluateJokersFull,
  getSlotModifiersFromJokers,
  getRouletteModifiersFromJokers,
  getRetriggerCountFromJokers,
  getTriggeredJokers,
} from './jokerManager';
import type { Joker, JokerContext, Card } from '@/types/interfaces';

// Helper to create test joker
function createJoker(
  id: string,
  trigger: Joker['trigger'],
  effect: Joker['effect']
): Joker {
  return {
    id,
    name: `Joker ${id}`,
    description: `Test joker ${id}`,
    rarity: 'common',
    cost: 10,
    trigger,
    effect,
  };
}

// Helper to create test card
function createCard(rank: Card['rank'], suit: Card['suit']): Card {
  return { id: `${rank}_${suit}`, rank, suit };
}

describe('jokerManager', () => {
  describe('evaluateJokers', () => {
    it('should return empty array when no jokers', () => {
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const bonuses = evaluateJokers([], context);
      expect(bonuses).toHaveLength(0);
    });

    it('should return bonuses from triggered jokers', () => {
      const jokers = [
        createJoker('j1', { type: 'on_score' }, { type: 'add_mult', value: 10 }),
        createJoker('j2', { type: 'on_score' }, { type: 'add_chips', value: 50 }),
      ];
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const bonuses = evaluateJokers(jokers, context);

      expect(bonuses).toHaveLength(2);
      expect(bonuses).toContainEqual({
        source: 'Joker j1',
        type: 'mult',
        value: 10,
      });
      expect(bonuses).toContainEqual({
        source: 'Joker j2',
        type: 'chips',
        value: 50,
      });
    });

    it('should not return bonuses from non-triggered jokers', () => {
      const jokers = [
        createJoker('j1', { type: 'on_score' }, { type: 'add_mult', value: 10 }),
        createJoker('j2', { type: 'on_play' }, { type: 'add_chips', value: 50 }),
      ];
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const bonuses = evaluateJokers(jokers, context);

      expect(bonuses).toHaveLength(1);
      expect(bonuses[0]?.source).toBe('Joker j1');
    });

    it('should respect card conditions', () => {
      const jokers = [
        createJoker(
          'j1',
          { type: 'on_play', cardCondition: { rank: '7' } },
          { type: 'add_mult', value: 77 }
        ),
      ];
      const context: JokerContext = {
        phase: 'PLAY_PHASE',
        playedCards: [createCard('7', 'hearts')],
      };
      const bonuses = evaluateJokers(jokers, context);

      expect(bonuses).toHaveLength(1);
      expect(bonuses[0]?.value).toBe(77);
    });

    it('should preserve joker order (important for xmult)', () => {
      const jokers = [
        createJoker('j1', { type: 'on_score' }, { type: 'add_mult', value: 5 }),
        createJoker('j2', { type: 'on_score' }, { type: 'multiply', value: 2 }),
        createJoker('j3', { type: 'on_score' }, { type: 'add_chips', value: 30 }),
      ];
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const bonuses = evaluateJokers(jokers, context);

      expect(bonuses).toHaveLength(3);
      expect(bonuses[0]?.type).toBe('mult');
      expect(bonuses[1]?.type).toBe('xmult');
      expect(bonuses[2]?.type).toBe('chips');
    });

    it('should not return bonuses for non-bonus effects', () => {
      const jokers = [
        createJoker('j1', { type: 'on_score' }, { type: 'add_gold', value: 10 }),
        createJoker(
          'j2',
          { type: 'on_slot' },
          { type: 'modify_slot', modification: {} }
        ),
      ];
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const bonuses = evaluateJokers(jokers, context);

      expect(bonuses).toHaveLength(0);
    });
  });

  describe('evaluateJokersFull', () => {
    it('should return complete evaluation result', () => {
      const jokers = [
        createJoker('j1', { type: 'on_score' }, { type: 'add_mult', value: 10 }),
        createJoker('j2', { type: 'passive' }, { type: 'add_gold', value: 5 }),
      ];
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const result = evaluateJokersFull(jokers, context);

      expect(result.bonuses).toHaveLength(1);
      expect(result.goldToAdd).toBe(5);
      expect(result.triggeredJokerIds).toContain('j1');
      expect(result.triggeredJokerIds).toContain('j2');
    });

    it('should accumulate gold from multiple jokers', () => {
      const jokers = [
        createJoker('j1', { type: 'passive' }, { type: 'add_gold', value: 5 }),
        createJoker('j2', { type: 'passive' }, { type: 'add_gold', value: 10 }),
      ];
      const context: JokerContext = { phase: 'IDLE' };
      const result = evaluateJokersFull(jokers, context);

      expect(result.goldToAdd).toBe(15);
    });

    it('should merge slot modifiers', () => {
      const jokers = [
        createJoker(
          'j1',
          { type: 'on_slot' },
          { type: 'modify_slot', modification: { symbolWeights: { star: 10 } } }
        ),
        createJoker(
          'j2',
          { type: 'on_slot' },
          { type: 'modify_slot', modification: { symbolWeights: { skull: 0 } } }
        ),
      ];
      const context: JokerContext = { phase: 'SLOT_PHASE' };
      const result = evaluateJokersFull(jokers, context);

      expect(result.slotModifiers.symbolWeights).toEqual({
        star: 10,
        skull: 0,
      });
    });

    it('should merge roulette modifiers', () => {
      const jokers = [
        createJoker(
          'j1',
          { type: 'on_roulette' },
          { type: 'modify_roulette', modification: { safeZoneBonus: 20 } }
        ),
        createJoker(
          'j2',
          { type: 'on_roulette' },
          { type: 'modify_roulette', modification: { maxMultiplier: 2 } }
        ),
      ];
      const context: JokerContext = { phase: 'ROULETTE_PHASE' };
      const result = evaluateJokersFull(jokers, context);

      expect(result.rouletteModifiers.safeZoneBonus).toBe(20);
      expect(result.rouletteModifiers.maxMultiplier).toBe(2);
    });

    it('should accumulate retrigger counts', () => {
      const jokers = [
        createJoker('j1', { type: 'on_play' }, { type: 'retrigger', count: 1 }),
        createJoker('j2', { type: 'on_play' }, { type: 'retrigger', count: 2 }),
      ];
      const context: JokerContext = {
        phase: 'PLAY_PHASE',
        playedCards: [createCard('A', 'spades')],
      };
      const result = evaluateJokersFull(jokers, context);

      expect(result.retriggerCount).toBe(3);
    });
  });

  describe('getSlotModifiersFromJokers', () => {
    it('should return combined slot modifiers', () => {
      const jokers = [
        createJoker(
          'j1',
          { type: 'on_slot' },
          { type: 'modify_slot', modification: { symbolWeights: { star: 10 } } }
        ),
        createJoker('j2', { type: 'on_score' }, { type: 'add_mult', value: 5 }),
      ];
      const modifiers = getSlotModifiersFromJokers(jokers);

      expect(modifiers.symbolWeights).toEqual({ star: 10 });
    });

    it('should return empty object when no slot modifiers', () => {
      const jokers = [
        createJoker('j1', { type: 'on_score' }, { type: 'add_mult', value: 5 }),
      ];
      const modifiers = getSlotModifiersFromJokers(jokers);

      expect(modifiers).toEqual({});
    });
  });

  describe('getRouletteModifiersFromJokers', () => {
    it('should return combined roulette modifiers', () => {
      const jokers = [
        createJoker(
          'j1',
          { type: 'on_roulette' },
          { type: 'modify_roulette', modification: { safeZoneBonus: 30 } }
        ),
        createJoker(
          'j2',
          { type: 'on_roulette' },
          { type: 'modify_roulette', modification: { maxMultiplier: 2 } }
        ),
      ];
      const modifiers = getRouletteModifiersFromJokers(jokers);

      expect(modifiers.safeZoneBonus).toBe(30);
      expect(modifiers.maxMultiplier).toBe(2);
    });

    it('should accumulate same modifier types', () => {
      const jokers = [
        createJoker(
          'j1',
          { type: 'on_roulette' },
          { type: 'modify_roulette', modification: { safeZoneBonus: 20 } }
        ),
        createJoker(
          'j2',
          { type: 'on_roulette' },
          { type: 'modify_roulette', modification: { safeZoneBonus: 10 } }
        ),
      ];
      const modifiers = getRouletteModifiersFromJokers(jokers);

      expect(modifiers.safeZoneBonus).toBe(30);
    });
  });

  describe('getRetriggerCountFromJokers', () => {
    it('should return total retrigger count for triggered jokers', () => {
      const jokers = [
        createJoker('j1', { type: 'on_play' }, { type: 'retrigger', count: 1 }),
        createJoker(
          'j2',
          { type: 'on_play', cardCondition: { rank: 'A' } },
          { type: 'retrigger', count: 2 }
        ),
      ];
      const context: JokerContext = {
        phase: 'PLAY_PHASE',
        playedCards: [createCard('A', 'hearts')],
      };
      const count = getRetriggerCountFromJokers(jokers, context);

      expect(count).toBe(3);
    });

    it('should not count retriggers from non-triggered jokers', () => {
      const jokers = [
        createJoker('j1', { type: 'on_play' }, { type: 'retrigger', count: 1 }),
        createJoker(
          'j2',
          { type: 'on_play', cardCondition: { rank: 'A' } },
          { type: 'retrigger', count: 2 }
        ),
      ];
      const context: JokerContext = {
        phase: 'PLAY_PHASE',
        playedCards: [createCard('K', 'hearts')], // No Ace
      };
      const count = getRetriggerCountFromJokers(jokers, context);

      expect(count).toBe(1); // Only j1 triggers
    });
  });

  describe('getTriggeredJokers', () => {
    it('should return only triggered jokers', () => {
      const jokers = [
        createJoker('j1', { type: 'on_score' }, { type: 'add_mult', value: 10 }),
        createJoker('j2', { type: 'on_play' }, { type: 'add_chips', value: 50 }),
        createJoker('j3', { type: 'passive' }, { type: 'add_gold', value: 5 }),
      ];
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const triggered = getTriggeredJokers(jokers, context);

      expect(triggered).toHaveLength(2);
      expect(triggered.map((j) => j.id)).toContain('j1');
      expect(triggered.map((j) => j.id)).toContain('j3');
      expect(triggered.map((j) => j.id)).not.toContain('j2');
    });

    it('should return empty array when no jokers trigger', () => {
      const jokers = [
        createJoker('j1', { type: 'on_roulette' }, { type: 'add_mult', value: 10 }),
      ];
      const context: JokerContext = { phase: 'SCORE_PHASE' };
      const triggered = getTriggeredJokers(jokers, context);

      expect(triggered).toHaveLength(0);
    });
  });
});
