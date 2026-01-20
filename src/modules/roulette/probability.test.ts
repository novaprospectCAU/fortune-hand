/**
 * Tests for probability.ts
 */

import { describe, it, expect } from 'vitest';
import {
  selectSegment,
  normalizeSegments,
  distributeExtraProbability,
  calculateSegmentAngle,
  calculateSegmentStartAngle,
  getSegmentAtAngle,
} from './probability';
import type { RouletteSegment } from '@/types/interfaces';

describe('probability', () => {
  // Test fixtures
  const defaultSegments: RouletteSegment[] = [
    { id: 'zero', multiplier: 0, probability: 20, color: '#ef4444' },
    { id: 'one', multiplier: 1, probability: 30, color: '#6b7280' },
    { id: 'two', multiplier: 2, probability: 25, color: '#22c55e' },
    { id: 'three', multiplier: 3, probability: 15, color: '#3b82f6' },
    { id: 'five', multiplier: 5, probability: 8, color: '#eab308' },
    { id: 'ten', multiplier: 10, probability: 2, color: '#a855f7' },
  ];

  describe('selectSegment', () => {
    it('should select segment based on random value', () => {
      // Random value 0 should select first segment (0-20%)
      const result1 = selectSegment(defaultSegments, 0);
      expect(result1.id).toBe('zero');

      // Random value 0.19 should still be in first segment
      const result2 = selectSegment(defaultSegments, 0.19);
      expect(result2.id).toBe('zero');

      // Random value 0.25 should be in second segment (20-50%)
      const result3 = selectSegment(defaultSegments, 0.25);
      expect(result3.id).toBe('one');

      // Random value 0.55 should be in third segment (50-75%)
      const result4 = selectSegment(defaultSegments, 0.55);
      expect(result4.id).toBe('two');

      // Random value 0.99 should be in last segment
      const result5 = selectSegment(defaultSegments, 0.99);
      expect(result5.id).toBe('ten');
    });

    it('should throw error for empty segments', () => {
      expect(() => selectSegment([])).toThrow(
        'Cannot select from empty segments array'
      );
    });

    it('should skip segments with 0 probability', () => {
      const segments: RouletteSegment[] = [
        { id: 'zero', multiplier: 0, probability: 0, color: '#ef4444' },
        { id: 'one', multiplier: 1, probability: 100, color: '#6b7280' },
      ];

      // With first segment having 0 probability, any random value should select second
      for (let i = 0; i <= 10; i++) {
        const result = selectSegment(segments, i / 10);
        expect(result.id).toBe('one');
      }
    });

    it('should handle all segments with 0 probability', () => {
      const segments: RouletteSegment[] = [
        { id: 'zero', multiplier: 0, probability: 0, color: '#ef4444' },
        { id: 'one', multiplier: 1, probability: 0, color: '#6b7280' },
      ];

      // Should return first segment as fallback
      const result = selectSegment(segments, 0.5);
      expect(result.id).toBe('zero');
    });

    it('should produce correct distribution over many samples', () => {
      const samples = 10000;
      const counts: Record<string, number> = {};

      for (let i = 0; i < samples; i++) {
        const randomValue = i / samples;
        const segment = selectSegment(defaultSegments, randomValue);
        counts[segment.id] = (counts[segment.id] || 0) + 1;
      }

      // Check distribution is approximately correct (within 2%)
      expect(counts['zero']).toBeGreaterThanOrEqual(samples * 0.18);
      expect(counts['zero']).toBeLessThanOrEqual(samples * 0.22);

      expect(counts['one']).toBeGreaterThanOrEqual(samples * 0.28);
      expect(counts['one']).toBeLessThanOrEqual(samples * 0.32);

      expect(counts['ten']).toBeGreaterThanOrEqual(samples * 0.01);
      expect(counts['ten']).toBeLessThanOrEqual(samples * 0.03);
    });
  });

  describe('normalizeSegments', () => {
    it('should normalize probabilities to sum to 100', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 10, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 20, color: '#fff' },
        { id: 'c', multiplier: 3, probability: 20, color: '#fff' },
      ];

      const normalized = normalizeSegments(segments);
      const total = normalized.reduce((sum, s) => sum + s.probability, 0);

      expect(total).toBeCloseTo(100, 5);
      expect(normalized[0].probability).toBeCloseTo(20, 5);
      expect(normalized[1].probability).toBeCloseTo(40, 5);
      expect(normalized[2].probability).toBeCloseTo(40, 5);
    });

    it('should return empty array for empty input', () => {
      const result = normalizeSegments([]);
      expect(result).toEqual([]);
    });

    it('should handle all zero probabilities', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 0, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 0, color: '#fff' },
      ];

      const normalized = normalizeSegments(segments);

      // Should distribute equally
      expect(normalized[0].probability).toBeCloseTo(50, 5);
      expect(normalized[1].probability).toBeCloseTo(50, 5);
    });

    it('should clamp negative probabilities to 0', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: -10, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 50, color: '#fff' },
      ];

      const normalized = normalizeSegments(segments);

      expect(normalized[0].probability).toBe(0);
      expect(normalized[1].probability).toBe(100);
    });

    it('should not mutate original segments', () => {
      const original: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 50, color: '#fff' },
      ];

      const normalized = normalizeSegments(original);

      expect(original[0].probability).toBe(50);
      expect(normalized[0].probability).toBe(100);
    });
  });

  describe('distributeExtraProbability', () => {
    it('should distribute probability to non-zero multiplier segments', () => {
      const segments: RouletteSegment[] = [
        { id: 'zero', multiplier: 0, probability: 10, color: '#fff' },
        { id: 'one', multiplier: 1, probability: 50, color: '#fff' },
        { id: 'two', multiplier: 2, probability: 40, color: '#fff' },
      ];

      distributeExtraProbability(segments, 10);

      // Zero multiplier segment should not receive extra
      expect(segments[0].probability).toBe(10);

      // 50/(50+40) * 10 = 5.55... added to segment 'one'
      expect(segments[1].probability).toBeCloseTo(55.56, 1);

      // 40/(50+40) * 10 = 4.44... added to segment 'two'
      expect(segments[2].probability).toBeCloseTo(44.44, 1);
    });

    it('should handle no eligible recipients', () => {
      const segments: RouletteSegment[] = [
        { id: 'zero', multiplier: 0, probability: 100, color: '#fff' },
      ];

      // Should not throw
      distributeExtraProbability(segments, 10);
      expect(segments[0].probability).toBe(100);
    });
  });

  describe('calculateSegmentAngle', () => {
    it('should calculate correct angle for segment', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 25, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 75, color: '#fff' },
      ];

      const angleA = calculateSegmentAngle(segments[0], segments);
      const angleB = calculateSegmentAngle(segments[1], segments);

      expect(angleA).toBeCloseTo(90, 5); // 25% of 360
      expect(angleB).toBeCloseTo(270, 5); // 75% of 360
    });

    it('should return 0 for non-existent segment', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 100, color: '#fff' },
      ];

      const nonExistent: RouletteSegment = {
        id: 'b',
        multiplier: 2,
        probability: 50,
        color: '#fff',
      };

      expect(calculateSegmentAngle(nonExistent, segments)).toBe(0);
    });
  });

  describe('calculateSegmentStartAngle', () => {
    it('should calculate correct start angles', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 25, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 25, color: '#fff' },
        { id: 'c', multiplier: 3, probability: 50, color: '#fff' },
      ];

      expect(calculateSegmentStartAngle(0, segments)).toBeCloseTo(0, 5);
      expect(calculateSegmentStartAngle(1, segments)).toBeCloseTo(90, 5);
      expect(calculateSegmentStartAngle(2, segments)).toBeCloseTo(180, 5);
    });
  });

  describe('getSegmentAtAngle', () => {
    it('should return correct segment for given angle', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 25, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 25, color: '#fff' },
        { id: 'c', multiplier: 3, probability: 50, color: '#fff' },
      ];

      expect(getSegmentAtAngle(0, segments).id).toBe('a');
      expect(getSegmentAtAngle(45, segments).id).toBe('a');
      expect(getSegmentAtAngle(90, segments).id).toBe('b');
      expect(getSegmentAtAngle(135, segments).id).toBe('b');
      expect(getSegmentAtAngle(180, segments).id).toBe('c');
      expect(getSegmentAtAngle(270, segments).id).toBe('c');
      expect(getSegmentAtAngle(350, segments).id).toBe('c');
    });

    it('should handle angles > 360', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 50, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 50, color: '#fff' },
      ];

      expect(getSegmentAtAngle(360, segments).id).toBe('a');
      expect(getSegmentAtAngle(450, segments).id).toBe('a');
      expect(getSegmentAtAngle(540, segments).id).toBe('b');
    });

    it('should handle negative angles', () => {
      const segments: RouletteSegment[] = [
        { id: 'a', multiplier: 1, probability: 50, color: '#fff' },
        { id: 'b', multiplier: 2, probability: 50, color: '#fff' },
      ];

      expect(getSegmentAtAngle(-90, segments).id).toBe('b');
      expect(getSegmentAtAngle(-180, segments).id).toBe('b');
    });
  });
});
