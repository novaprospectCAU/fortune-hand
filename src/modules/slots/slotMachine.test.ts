/**
 * slotMachine.ts 테스트
 */

import { describe, it, expect } from 'vitest';
import { spin, spinWithResult, createSeededRandom, calculateJackpotProbability } from './slotMachine';
import type { SlotSymbol } from '@/types/interfaces';

describe('slotMachine', () => {
  describe('createSeededRandom', () => {
    it('should generate deterministic sequence with same seed', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(12345);

      const seq1 = [rng1.next(), rng1.next(), rng1.next()];
      const seq2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(seq1).toEqual(seq2);
    });

    it('should generate different sequences with different seeds', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(54321);

      const seq1 = [rng1.next(), rng1.next(), rng1.next()];
      const seq2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(seq1).not.toEqual(seq2);
    });

    it('should generate values between 0 and 1', () => {
      const rng = createSeededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });

  describe('spin', () => {
    it('should return valid SlotResult', () => {
      const result = spin();

      expect(result).toHaveProperty('symbols');
      expect(result).toHaveProperty('isJackpot');
      expect(result).toHaveProperty('effects');

      expect(result.symbols).toHaveLength(3);
    });

    it('should return consistent results with seeded random', () => {
      const rng1 = createSeededRandom(999);
      const rng2 = createSeededRandom(999);

      const result1 = spin(undefined, rng1);
      const result2 = spin(undefined, rng2);

      expect(result1.symbols).toEqual(result2.symbols);
      expect(result1.isJackpot).toBe(result2.isJackpot);
    });

    it('should apply guaranteed symbol modifier', () => {
      const result = spin({ guaranteedSymbol: 'star' });

      // All symbols should be star
      expect(result.symbols[0]).toBe('star');
      expect(result.symbols[1]).toBe('star');
      expect(result.symbols[2]).toBe('star');
      expect(result.isJackpot).toBe(true);
    });

    it('should detect jackpot for star triple', () => {
      const result = spin({ guaranteedSymbol: 'star' });
      expect(result.isJackpot).toBe(true);
    });

    it('should return valid effects structure', () => {
      const result = spin();

      expect(result.effects).toHaveProperty('cardBonus');
      expect(result.effects).toHaveProperty('rouletteBonus');
      expect(result.effects).toHaveProperty('instant');
      expect(result.effects).toHaveProperty('penalty');

      expect(result.effects.cardBonus).toHaveProperty('extraDraw');
      expect(result.effects.cardBonus).toHaveProperty('handSize');
      expect(result.effects.cardBonus).toHaveProperty('scoreMultiplier');
    });

    it('should apply reroll modifier to remove skulls', () => {
      // With enough rerolls, skulls should be replaced
      const results: SlotSymbol[][] = [];

      // Run multiple times with reroll
      for (let i = 0; i < 100; i++) {
        const rng = createSeededRandom(i);
        const result = spin({ rerollCount: 3 }, rng);
        results.push([...result.symbols]);
      }

      // At least some results should have had skulls replaced
      // (This is probabilistic, but should pass with high probability)
      const totalSymbols = results.flat();
      const skullCount = totalSymbols.filter((s) => s === 'skull').length;

      // With 3 rerolls, skull count should be significantly reduced
      // but not eliminated (can still appear if rerolled symbol is also skull)
      expect(skullCount).toBeLessThan(totalSymbols.length * 0.1); // Less than 10% skulls
    });
  });

  describe('spinWithResult', () => {
    it('should return result with specified symbols', () => {
      const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = ['card', 'gold', 'star'];
      const result = spinWithResult(symbols);

      expect(result.symbols).toEqual(symbols);
    });

    it('should correctly detect triple combination', () => {
      const result = spinWithResult(['gold', 'gold', 'gold']);

      expect(result.isJackpot).toBe(false);
      expect(result.effects.instant.gold).toBe(25); // Gold Rush bonus
    });

    it('should correctly detect jackpot', () => {
      const result = spinWithResult(['star', 'star', 'star']);

      expect(result.isJackpot).toBe(true);
      expect(result.effects.instant.gold).toBe(50);
      expect(result.effects.instant.chips).toBe(100);
    });

    it('should handle wild combinations', () => {
      const result = spinWithResult(['gold', 'wild', 'gold']);

      expect(result.effects.instant.gold).toBe(25); // Should count as Gold Rush
    });
  });

  describe('calculateJackpotProbability', () => {
    it('should return a value between 0 and 1', () => {
      const prob = calculateJackpotProbability();

      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1);
    });

    it('should be relatively low (less than 1%)', () => {
      const prob = calculateJackpotProbability();

      // star weight is 5, wild is 5, total is 100
      // Combined probability = (5+5)/100 = 0.1
      // Jackpot = 0.1^3 = 0.001 = 0.1%
      expect(prob).toBeLessThan(0.01);
    });

    it('should increase with higher star weight modifier', () => {
      const normalProb = calculateJackpotProbability();
      const boostedProb = calculateJackpotProbability({
        symbolWeights: { star: 50 }, // 10x normal
      });

      expect(boostedProb).toBeGreaterThan(normalProb);
    });
  });

  describe('probability distribution (statistical test)', () => {
    it('should roughly match expected probabilities over many spins', () => {
      const counts: Record<SlotSymbol, number> = {
        card: 0,
        target: 0,
        gold: 0,
        chip: 0,
        star: 0,
        skull: 0,
        wild: 0,
      };

      const iterations = 3000;

      // Use seeded random for reproducibility
      for (let i = 0; i < iterations; i++) {
        const rng = createSeededRandom(i);
        const result = spin(undefined, rng);

        for (const symbol of result.symbols) {
          counts[symbol]++;
        }
      }

      const totalSymbols = iterations * 3;

      // Expected weights: card=25, target=20, gold=20, chip=15, star=5, skull=10, wild=5
      // Total = 100
      const expectedRatios: Record<SlotSymbol, number> = {
        card: 0.25,
        target: 0.2,
        gold: 0.2,
        chip: 0.15,
        star: 0.05,
        skull: 0.1,
        wild: 0.05,
      };

      // Allow 5% deviation for statistical variance
      for (const [symbol, expectedRatio] of Object.entries(expectedRatios) as [
        SlotSymbol,
        number,
      ][]) {
        const actualRatio = counts[symbol] / totalSymbols;
        expect(actualRatio).toBeCloseTo(expectedRatio, 1); // Within 0.1
      }
    });
  });
});
