/**
 * Roulette module - Core logic
 *
 * Handles roulette spinning, configuration, and bonus application.
 */

import type {
  RouletteConfig,
  RouletteInput,
  RouletteResult,
  RouletteSegment,
  SlotEffects,
} from '@/types/interfaces';
import balanceData from '@/data/balance.json';
import {
  selectSegment,
  normalizeSegments,
  distributeExtraProbability,
} from './probability';

/**
 * Spins the roulette wheel and returns the result.
 *
 * @param input - The roulette input containing baseScore and config
 * @param randomValue - Optional random value (0-1) for testing
 * @returns The roulette result with selected segment and final score
 */
export function spin(
  input: RouletteInput,
  randomValue?: number
): RouletteResult {
  const segment = selectSegment(input.config.segments, randomValue);

  return {
    segment,
    finalScore: input.baseScore * segment.multiplier,
    wasSkipped: false,
  };
}

/**
 * Creates a skip result (multiplier of 1, no risk).
 *
 * @param baseScore - The base score to preserve
 * @returns A roulette result with wasSkipped=true
 */
export function skip(baseScore: number): RouletteResult {
  const skipSegment: RouletteSegment = {
    id: 'skip',
    multiplier: 1,
    probability: 0,
    color: '#6b7280',
  };

  return {
    segment: skipSegment,
    finalScore: baseScore,
    wasSkipped: true,
  };
}

/**
 * Returns the default roulette configuration from balance.json.
 *
 * @returns The default RouletteConfig
 */
export function getDefaultConfig(): RouletteConfig {
  const rouletteConfig = balanceData.roulette;

  return {
    segments: rouletteConfig.segments.map((s) => ({
      id: s.id,
      multiplier: s.multiplier,
      probability: s.probability,
      color: s.color,
    })),
    spinDuration: rouletteConfig.spinDuration,
  };
}

/**
 * Applies slot bonuses to the roulette configuration.
 *
 * Bonuses can:
 * - safeZoneBonus: Reduce the probability of the 0x (bust) segment
 * - maxMultiplier: Add a new high-multiplier segment
 * - freeSpins: (Handled by game loop, not config)
 *
 * @param config - The base roulette configuration
 * @param bonuses - The roulette bonuses from slot effects
 * @returns A new RouletteConfig with bonuses applied
 */
export function applyBonuses(
  config: RouletteConfig,
  bonuses: SlotEffects['rouletteBonus']
): RouletteConfig {
  // Deep clone segments to avoid mutation
  const segments: RouletteSegment[] = config.segments.map((s) => ({ ...s }));

  // Apply safeZoneBonus: reduce 0x multiplier probability
  if (bonuses.safeZoneBonus > 0) {
    const zeroSegment = segments.find((s) => s.multiplier === 0);
    if (zeroSegment && zeroSegment.probability > 0) {
      const reduction = Math.min(
        bonuses.safeZoneBonus,
        zeroSegment.probability
      );
      zeroSegment.probability -= reduction;
      // Distribute the reduced probability to other segments
      distributeExtraProbability(segments, reduction);
    }
  }

  // Apply maxMultiplier: add a new high-multiplier segment
  if (bonuses.maxMultiplier > 0) {
    const maxExisting = Math.max(...segments.map((s) => s.multiplier));
    const newMultiplier = maxExisting + bonuses.maxMultiplier;

    // Take probability from the current highest multiplier segment
    const highestSegment = segments.find((s) => s.multiplier === maxExisting);
    if (highestSegment && highestSegment.probability > 0) {
      // Take half of the highest segment's probability for the new segment
      const newProbability = Math.min(highestSegment.probability / 2, 1);
      highestSegment.probability -= newProbability;

      // Add new high-multiplier segment
      segments.push({
        id: `bonus_${newMultiplier}x`,
        multiplier: newMultiplier,
        probability: newProbability,
        color: '#ffd700', // Gold color for bonus segments
      });
    }
  }

  // Normalize to ensure probabilities sum to 100
  const normalizedSegments = normalizeSegments(segments);

  return {
    segments: normalizedSegments,
    spinDuration: config.spinDuration,
  };
}

/**
 * Calculates the target rotation angle for the wheel to land on a specific segment.
 *
 * @param segment - The segment to land on
 * @param config - The roulette configuration
 * @param extraRotations - Number of full rotations before stopping (default: 5)
 * @returns The target angle in degrees
 */
export function calculateTargetAngle(
  segment: RouletteSegment,
  config: RouletteConfig,
  extraRotations: number = 5
): number {
  const normalized = normalizeSegments(config.segments);
  const segmentIndex = normalized.findIndex((s) => s.id === segment.id);

  if (segmentIndex === -1) {
    return extraRotations * 360;
  }

  // Calculate the starting angle of the target segment
  let startAngle = 0;
  for (let i = 0; i < segmentIndex; i++) {
    startAngle += (normalized[i].probability / 100) * 360;
  }

  // Calculate the center of the segment
  const segmentAngle = (normalized[segmentIndex].probability / 100) * 360;
  const centerAngle = startAngle + segmentAngle / 2;

  // Add extra rotations and adjust so the pointer (at top/0 degrees) lands on the segment
  // The wheel rotates clockwise, so we need to calculate where the segment will be
  // when the wheel stops with the pointer at 0 degrees
  const targetAngle = extraRotations * 360 + (360 - centerAngle);

  return targetAngle;
}

/**
 * Validates that a RouletteConfig is properly formed.
 *
 * @param config - The configuration to validate
 * @returns True if valid, throws Error if invalid
 */
export function validateConfig(config: RouletteConfig): boolean {
  if (!config.segments || config.segments.length === 0) {
    throw new Error('RouletteConfig must have at least one segment');
  }

  if (config.spinDuration <= 0) {
    throw new Error('spinDuration must be positive');
  }

  for (const segment of config.segments) {
    if (!segment.id) {
      throw new Error('Each segment must have an id');
    }
    if (segment.multiplier < 0) {
      throw new Error('Segment multiplier cannot be negative');
    }
    if (segment.probability < 0) {
      throw new Error('Segment probability cannot be negative');
    }
  }

  return true;
}
