/**
 * effects.ts 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultEffects,
  mergeEffects,
  calculateEffects,
  isPositiveEffect,
  summarizeEffects,
} from './effects';
import { getCombination } from './symbols';
import type { SlotSymbol, SlotEffects } from '@/types/interfaces';

describe('effects', () => {
  describe('createDefaultEffects', () => {
    it('should return effects with all zeros/defaults', () => {
      const effects = createDefaultEffects();

      expect(effects.cardBonus.extraDraw).toBe(0);
      expect(effects.cardBonus.handSize).toBe(0);
      expect(effects.cardBonus.scoreMultiplier).toBe(1);

      expect(effects.rouletteBonus.safeZoneBonus).toBe(0);
      expect(effects.rouletteBonus.maxMultiplier).toBe(0);
      expect(effects.rouletteBonus.freeSpins).toBe(0);

      expect(effects.instant.gold).toBe(0);
      expect(effects.instant.chips).toBe(0);

      expect(effects.penalty.discardCards).toBe(0);
      expect(effects.penalty.skipRoulette).toBe(false);
      expect(effects.penalty.loseGold).toBe(0);
    });
  });

  describe('mergeEffects', () => {
    it('should add numeric values', () => {
      const base = createDefaultEffects();
      const addition: Partial<SlotEffects> = {
        instant: { gold: 10, chips: 20 },
      };

      const result = mergeEffects(base, addition);

      expect(result.instant.gold).toBe(10);
      expect(result.instant.chips).toBe(20);
    });

    it('should multiply scoreMultiplier', () => {
      const base = createDefaultEffects();
      base.cardBonus.scoreMultiplier = 2;

      const addition: Partial<SlotEffects> = {
        cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 2 },
      };

      const result = mergeEffects(base, addition);

      expect(result.cardBonus.scoreMultiplier).toBe(4);
    });

    it('should OR boolean values (skipRoulette)', () => {
      const base = createDefaultEffects();
      const addition: Partial<SlotEffects> = {
        penalty: { discardCards: 0, skipRoulette: true, loseGold: 0 },
      };

      const result = mergeEffects(base, addition);

      expect(result.penalty.skipRoulette).toBe(true);
    });

    it('should preserve base values when addition is partial', () => {
      const base = createDefaultEffects();
      base.instant.gold = 5;

      const addition: Partial<SlotEffects> = {
        instant: { gold: 10, chips: 0 },
      };

      const result = mergeEffects(base, addition);

      expect(result.instant.gold).toBe(15);
    });
  });

  describe('calculateEffects', () => {
    it('should return combination effects for triple', () => {
      const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = ['gold', 'gold', 'gold'];
      const combo = getCombination('gold_triple')!;

      const effects = calculateEffects(symbols, combo);

      expect(effects.instant.gold).toBe(50);
      expect(effects.instant.chips).toBe(0);
    });

    it('should sum individual effects when no combination', () => {
      const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = ['card', 'gold', 'target'];

      const effects = calculateEffects(symbols, null);

      // card gives +1 extraDraw, gold gives +10 gold, target gives +10 safeZone
      expect(effects.cardBonus.extraDraw).toBe(1);
      expect(effects.instant.gold).toBe(10);
      expect(effects.rouletteBonus.safeZoneBonus).toBe(10);
    });

    it('should handle skull penalties', () => {
      const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = ['skull', 'skull', 'card'];

      const effects = calculateEffects(symbols, null);

      expect(effects.penalty.discardCards).toBe(2); // 2 skulls = 2 discards
      expect(effects.cardBonus.extraDraw).toBe(1); // 1 card bonus
    });

    it('should ignore wild individual effects', () => {
      const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = ['wild', 'card', 'gold'];

      const effects = calculateEffects(symbols, null);

      // wild has no individual effect
      expect(effects.cardBonus.extraDraw).toBe(1); // only card
      expect(effects.instant.gold).toBe(10); // only gold
    });

    it('should return jackpot effects for star triple', () => {
      const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = ['star', 'star', 'star'];
      const combo = getCombination('star_triple')!;

      const effects = calculateEffects(symbols, combo);

      expect(effects.instant.gold).toBe(100);
      expect(effects.instant.chips).toBe(200);
      expect(effects.cardBonus.extraDraw).toBe(6);
      expect(effects.cardBonus.scoreMultiplier).toBe(4);
    });

    it('should return skull triple effects', () => {
      const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = ['skull', 'skull', 'skull'];
      const combo = getCombination('skull_triple')!;

      const effects = calculateEffects(symbols, combo);

      expect(effects.penalty.discardCards).toBe(2);
      expect(effects.penalty.skipRoulette).toBe(true);
      expect(effects.penalty.loseGold).toBe(10);
    });
  });

  describe('isPositiveEffect', () => {
    it('should return true for positive-only effects', () => {
      const effects = createDefaultEffects();
      effects.instant.gold = 10;

      expect(isPositiveEffect(effects)).toBe(true);
    });

    it('should return false for penalty effects', () => {
      const effects = createDefaultEffects();
      effects.penalty.discardCards = 1;

      expect(isPositiveEffect(effects)).toBe(false);
    });

    it('should return false for mixed effects with penalty', () => {
      const effects = createDefaultEffects();
      effects.instant.gold = 10;
      effects.penalty.loseGold = 5;

      expect(isPositiveEffect(effects)).toBe(false);
    });

    it('should return true for default effects (no positive, no negative)', () => {
      const effects = createDefaultEffects();

      // Default has scoreMultiplier = 1 which isn't positive
      // and no penalties, so it's neutral -> not positive
      expect(isPositiveEffect(effects)).toBe(false);
    });
  });

  describe('summarizeEffects', () => {
    it('should return empty array for default effects', () => {
      const effects = createDefaultEffects();
      const summary = summarizeEffects(effects);

      expect(summary).toEqual([]);
    });

    it('should summarize instant rewards', () => {
      const effects = createDefaultEffects();
      effects.instant.gold = 10;
      effects.instant.chips = 20;

      const summary = summarizeEffects(effects);

      expect(summary).toContain('+10 Gold');
      expect(summary).toContain('+20 Chips');
    });

    it('should summarize card bonuses', () => {
      const effects = createDefaultEffects();
      effects.cardBonus.extraDraw = 2;
      effects.cardBonus.handSize = 1;
      effects.cardBonus.scoreMultiplier = 2;

      const summary = summarizeEffects(effects);

      expect(summary).toContain('+2 Extra Draw');
      expect(summary).toContain('+1 Hand Size');
      expect(summary).toContain('x2 Score Multiplier');
    });

    it('should summarize roulette bonuses', () => {
      const effects = createDefaultEffects();
      effects.rouletteBonus.safeZoneBonus = 20;
      effects.rouletteBonus.maxMultiplier = 2;
      effects.rouletteBonus.freeSpins = 1;

      const summary = summarizeEffects(effects);

      expect(summary).toContain('+20% Safe Zone');
      expect(summary).toContain('+2x Max Multiplier');
      expect(summary).toContain('+1 Free Spins');
    });

    it('should summarize penalties', () => {
      const effects = createDefaultEffects();
      effects.penalty.discardCards = 2;
      effects.penalty.skipRoulette = true;
      effects.penalty.loseGold = 10;

      const summary = summarizeEffects(effects);

      expect(summary).toContain('-2 Cards (Discard)');
      expect(summary).toContain('Skip Roulette');
      expect(summary).toContain('-10 Gold');
    });
  });
});
