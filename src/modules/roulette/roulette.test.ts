/**
 * Tests for roulette.ts
 */

import { describe, it, expect } from 'vitest';
import {
  spin,
  skip,
  getDefaultConfig,
  applyBonuses,
  calculateTargetAngle,
  validateConfig,
} from './roulette';
import type {
  RouletteConfig,
  RouletteSegment,
  SlotEffects,
} from '@/types/interfaces';

describe('roulette', () => {
  // Test fixtures
  const createTestConfig = (): RouletteConfig => ({
    segments: [
      { id: 'zero', multiplier: 0, probability: 20, color: '#ef4444' },
      { id: 'one', multiplier: 1, probability: 30, color: '#6b7280' },
      { id: 'two', multiplier: 2, probability: 25, color: '#22c55e' },
      { id: 'three', multiplier: 3, probability: 15, color: '#3b82f6' },
      { id: 'five', multiplier: 5, probability: 8, color: '#eab308' },
      { id: 'ten', multiplier: 10, probability: 2, color: '#a855f7' },
    ],
    spinDuration: 3000,
  });

  describe('spin', () => {
    it('should return correct result for deterministic random value', () => {
      const config = createTestConfig();
      const baseScore = 100;

      // Random value 0 -> first segment (0x)
      const result1 = spin({ baseScore, config }, 0);
      expect(result1.segment.id).toBe('zero');
      expect(result1.segment.multiplier).toBe(0);
      expect(result1.finalScore).toBe(0);
      expect(result1.wasSkipped).toBe(false);

      // Random value 0.5 -> third segment (2x)
      const result2 = spin({ baseScore, config }, 0.5);
      expect(result2.segment.id).toBe('two');
      expect(result2.segment.multiplier).toBe(2);
      expect(result2.finalScore).toBe(200);
      expect(result2.wasSkipped).toBe(false);

      // Random value 0.99 -> last segment (10x)
      const result3 = spin({ baseScore, config }, 0.99);
      expect(result3.segment.id).toBe('ten');
      expect(result3.segment.multiplier).toBe(10);
      expect(result3.finalScore).toBe(1000);
      expect(result3.wasSkipped).toBe(false);
    });

    it('should calculate correct final score', () => {
      const config = createTestConfig();
      const baseScore = 1500;

      // Get 3x multiplier segment
      const result = spin({ baseScore, config }, 0.8);
      expect(result.segment.multiplier).toBe(3);
      expect(result.finalScore).toBe(4500);
    });

    it('should handle zero base score', () => {
      const config = createTestConfig();
      const result = spin({ baseScore: 0, config }, 0.5);
      expect(result.finalScore).toBe(0);
    });
  });

  describe('skip', () => {
    it('should return result with multiplier 1', () => {
      const result = skip(100);

      expect(result.segment.multiplier).toBe(1);
      expect(result.finalScore).toBe(100);
      expect(result.wasSkipped).toBe(true);
    });

    it('should preserve base score exactly', () => {
      const baseScores = [0, 1, 100, 1234567];

      for (const baseScore of baseScores) {
        const result = skip(baseScore);
        expect(result.finalScore).toBe(baseScore);
      }
    });

    it('should have skip segment id', () => {
      const result = skip(100);
      expect(result.segment.id).toBe('skip');
      expect(result.segment.probability).toBe(0);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return valid config from balance.json', () => {
      const config = getDefaultConfig();

      expect(config.segments).toBeDefined();
      expect(config.segments.length).toBeGreaterThan(0);
      expect(config.spinDuration).toBe(3000);
    });

    it('should include all required segments', () => {
      const config = getDefaultConfig();

      // Check for low multiplier segment (0.5x or similar)
      const lowMultSegment = config.segments.find((s) => s.multiplier < 1);
      expect(lowMultSegment).toBeDefined();

      // Check for high multiplier segment (at least 10x)
      const highMultSegment = config.segments.find((s) => s.multiplier >= 10);
      expect(highMultSegment).toBeDefined();

      // Check for very high multiplier segment (100x)
      const veryHighMultSegment = config.segments.find((s) => s.multiplier >= 100);
      expect(veryHighMultSegment).toBeDefined();
    });

    it('should have probabilities that sum to ~100', () => {
      const config = getDefaultConfig();
      const total = config.segments.reduce((sum, s) => sum + s.probability, 0);

      expect(total).toBeCloseTo(100, 1);
    });
  });

  describe('applyBonuses', () => {
    it('should reduce bust segment probability with safeZoneBonus', () => {
      const config = createTestConfig();
      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 10,
        maxMultiplier: 0,
        freeSpins: 0,
      };

      const modified = applyBonuses(config, bonuses);
      const bustSegment = modified.segments.find((s) => s.multiplier === 0);

      // Original was 20%, should now be ~10%
      expect(bustSegment?.probability).toBeLessThan(15);
    });

    it('should not reduce bust below 0', () => {
      const config = createTestConfig();
      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 100, // More than bust probability
        maxMultiplier: 0,
        freeSpins: 0,
      };

      const modified = applyBonuses(config, bonuses);
      const bustSegment = modified.segments.find((s) => s.multiplier === 0);

      expect(bustSegment?.probability).toBeGreaterThanOrEqual(0);
    });

    it('should add high multiplier segment with maxMultiplier bonus', () => {
      const config = createTestConfig();
      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 0,
        maxMultiplier: 5, // Add 5 to max (10 -> 15x)
        freeSpins: 0,
      };

      const modified = applyBonuses(config, bonuses);
      const newHighSegment = modified.segments.find((s) => s.multiplier === 15);

      expect(newHighSegment).toBeDefined();
      expect(newHighSegment?.probability).toBeGreaterThan(0);
    });

    it('should normalize probabilities after applying bonuses', () => {
      const config = createTestConfig();
      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 10,
        maxMultiplier: 5,
        freeSpins: 0,
      };

      const modified = applyBonuses(config, bonuses);
      const total = modified.segments.reduce((sum, s) => sum + s.probability, 0);

      expect(total).toBeCloseTo(100, 1);
    });

    it('should not mutate original config', () => {
      const config = createTestConfig();
      const originalBustProb = config.segments.find(
        (s) => s.multiplier === 0
      )?.probability;

      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 10,
        maxMultiplier: 0,
        freeSpins: 0,
      };

      applyBonuses(config, bonuses);

      const unchangedBustProb = config.segments.find(
        (s) => s.multiplier === 0
      )?.probability;

      expect(unchangedBustProb).toBe(originalBustProb);
    });

    it('should handle zero bonuses', () => {
      const config = createTestConfig();
      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 0,
        maxMultiplier: 0,
        freeSpins: 0,
      };

      const modified = applyBonuses(config, bonuses);

      // Should be effectively the same (but normalized)
      expect(modified.segments.length).toBe(config.segments.length);
    });
  });

  describe('calculateTargetAngle', () => {
    it('should return angle that lands on target segment', () => {
      const config = createTestConfig();
      const targetSegment = config.segments[0]!; // 'zero' segment

      const angle = calculateTargetAngle(targetSegment, config, 5);

      // Should include at least 5 full rotations (1800 degrees)
      expect(angle).toBeGreaterThanOrEqual(1800);
    });

    it('should return multiple rotations worth of angle', () => {
      const config = createTestConfig();
      const targetSegment = config.segments[1]!;

      const angle3 = calculateTargetAngle(targetSegment, config, 3);
      const angle5 = calculateTargetAngle(targetSegment, config, 5);

      expect(angle5).toBeGreaterThan(angle3);
      expect(angle5 - angle3).toBeCloseTo(720, 10); // 2 extra rotations
    });

    it('should handle missing segment gracefully', () => {
      const config = createTestConfig();
      const nonExistentSegment: RouletteSegment = {
        id: 'nonexistent',
        multiplier: 999,
        probability: 0,
        color: '#fff',
      };

      const angle = calculateTargetAngle(nonExistentSegment, config, 5);

      // Should still return valid angle (just rotations)
      expect(angle).toBe(1800); // 5 * 360
    });
  });

  describe('validateConfig', () => {
    it('should return true for valid config', () => {
      const config = createTestConfig();
      expect(validateConfig(config)).toBe(true);
    });

    it('should throw for empty segments', () => {
      const config: RouletteConfig = {
        segments: [],
        spinDuration: 3000,
      };

      expect(() => validateConfig(config)).toThrow(
        'RouletteConfig must have at least one segment'
      );
    });

    it('should throw for non-positive spinDuration', () => {
      const config: RouletteConfig = {
        segments: [
          { id: 'a', multiplier: 1, probability: 100, color: '#fff' },
        ],
        spinDuration: 0,
      };

      expect(() => validateConfig(config)).toThrow(
        'spinDuration must be positive'
      );
    });

    it('should throw for segment without id', () => {
      const config: RouletteConfig = {
        segments: [
          { id: '', multiplier: 1, probability: 100, color: '#fff' },
        ],
        spinDuration: 3000,
      };

      expect(() => validateConfig(config)).toThrow(
        'Each segment must have an id'
      );
    });

    it('should throw for negative multiplier', () => {
      const config: RouletteConfig = {
        segments: [
          { id: 'a', multiplier: -1, probability: 100, color: '#fff' },
        ],
        spinDuration: 3000,
      };

      expect(() => validateConfig(config)).toThrow(
        'Segment multiplier cannot be negative'
      );
    });

    it('should throw for negative probability', () => {
      const config: RouletteConfig = {
        segments: [
          { id: 'a', multiplier: 1, probability: -10, color: '#fff' },
        ],
        spinDuration: 3000,
      };

      expect(() => validateConfig(config)).toThrow(
        'Segment probability cannot be negative'
      );
    });
  });

  describe('integration', () => {
    it('should work with default config', () => {
      const config = getDefaultConfig();
      const baseScore = 1000;

      // Run multiple spins
      const results: number[] = [];
      for (let i = 0; i < 100; i++) {
        const result = spin({ baseScore, config }, i / 100);
        results.push(result.finalScore);
      }

      // Should have some scores < baseScore (low multiplier like 0.5)
      expect(results.some((r) => r < baseScore)).toBe(true);

      // Should have some scores > baseScore (high multiplier)
      expect(results.some((r) => r > baseScore)).toBe(true);
    });

    it('should improve odds with bonuses', () => {
      const config = getDefaultConfig();
      const bonuses: SlotEffects['rouletteBonus'] = {
        safeZoneBonus: 20,
        maxMultiplier: 0,
        freeSpins: 0,
      };

      const modifiedConfig = applyBonuses(config, bonuses);

      // Count low scores (below base) over many samples
      let originalLowScores = 0;
      let modifiedLowScores = 0;
      const samples = 1000;
      const baseScore = 100;

      for (let i = 0; i < samples; i++) {
        const r = i / samples;
        if (spin({ baseScore, config }, r).finalScore < baseScore) {
          originalLowScores++;
        }
        if (spin({ baseScore, config: modifiedConfig }, r).finalScore < baseScore) {
          modifiedLowScores++;
        }
      }

      // Modified should have fewer low scores (safeZoneBonus reduces low multiplier probability)
      expect(modifiedLowScores).toBeLessThanOrEqual(originalLowScores);
    });
  });
});
