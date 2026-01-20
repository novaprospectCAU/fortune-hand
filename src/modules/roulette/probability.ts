/**
 * Roulette probability calculations
 *
 * Handles segment selection based on weighted probabilities
 * and probability normalization.
 */

import type { RouletteSegment } from '@/types/interfaces';

/**
 * Selects a segment based on probability weights.
 * Uses a weighted random selection algorithm.
 *
 * @param segments - Array of roulette segments with probabilities
 * @param randomValue - Optional random value (0-1) for testing
 * @returns The selected segment
 */
export function selectSegment(
  segments: RouletteSegment[],
  randomValue?: number
): RouletteSegment {
  if (segments.length === 0) {
    throw new Error('Cannot select from empty segments array');
  }

  // Filter out segments with 0 or negative probability
  const validSegments = segments.filter((s) => s.probability > 0);

  if (validSegments.length === 0) {
    // If all probabilities are 0, return first segment as fallback
    return segments[0]!;
  }

  // Calculate total probability
  const totalProbability = validSegments.reduce(
    (sum, segment) => sum + segment.probability,
    0
  );

  // Generate random number between 0 and totalProbability
  const random = (randomValue ?? Math.random()) * totalProbability;

  // Find the segment that this random number falls into
  let cumulative = 0;
  for (const segment of validSegments) {
    cumulative += segment.probability;
    if (random < cumulative) {
      return segment;
    }
  }

  // Fallback to last valid segment (shouldn't reach here normally)
  return validSegments[validSegments.length - 1]!;
}

/**
 * Normalizes segment probabilities so they sum to 100.
 * Preserves relative proportions between segments.
 *
 * @param segments - Array of segments to normalize
 * @returns New array with normalized probabilities
 */
export function normalizeSegments(
  segments: RouletteSegment[]
): RouletteSegment[] {
  if (segments.length === 0) {
    return [];
  }

  const totalProbability = segments.reduce(
    (sum, segment) => sum + Math.max(0, segment.probability),
    0
  );

  // If total is already 100 or 0, return as-is (with negative probabilities clamped)
  if (totalProbability === 0) {
    // Distribute equally if all probabilities are 0 or negative
    const equalProbability = 100 / segments.length;
    return segments.map((segment) => ({
      ...segment,
      probability: equalProbability,
    }));
  }

  // Normalize so total equals 100
  const scaleFactor = 100 / totalProbability;
  return segments.map((segment) => ({
    ...segment,
    probability: Math.max(0, segment.probability) * scaleFactor,
  }));
}

/**
 * Distributes extra probability among non-zero multiplier segments.
 * Used when reducing the probability of the "bust" (0x) segment.
 *
 * @param segments - Array of segments (will be mutated)
 * @param extraProbability - The probability to distribute
 */
export function distributeExtraProbability(
  segments: RouletteSegment[],
  extraProbability: number
): void {
  // Find segments that can receive extra probability (non-zero multiplier)
  const recipients = segments.filter(
    (s) => s.multiplier > 0 && s.probability > 0
  );

  if (recipients.length === 0) {
    return;
  }

  // Distribute proportionally based on existing probabilities
  const totalRecipientProbability = recipients.reduce(
    (sum, s) => sum + s.probability,
    0
  );

  for (const segment of recipients) {
    const share =
      (segment.probability / totalRecipientProbability) * extraProbability;
    segment.probability += share;
  }
}

/**
 * Calculates the angle (in degrees) for a given segment based on its probability.
 *
 * @param segment - The segment to calculate angle for
 * @param segments - All segments in the wheel
 * @returns The angle in degrees that this segment spans
 */
export function calculateSegmentAngle(
  segment: RouletteSegment,
  segments: RouletteSegment[]
): number {
  const normalized = normalizeSegments(segments);
  const normalizedSegment = normalized.find((s) => s.id === segment.id);
  if (!normalizedSegment) {
    return 0;
  }
  return (normalizedSegment.probability / 100) * 360;
}

/**
 * Calculates the starting angle for a segment in the wheel.
 *
 * @param segmentIndex - The index of the segment
 * @param segments - All segments in the wheel
 * @returns The starting angle in degrees
 */
export function calculateSegmentStartAngle(
  segmentIndex: number,
  segments: RouletteSegment[]
): number {
  const normalized = normalizeSegments(segments);
  let startAngle = 0;

  for (let i = 0; i < segmentIndex; i++) {
    const seg = normalized[i];
    if (seg) {
      startAngle += (seg.probability / 100) * 360;
    }
  }

  return startAngle;
}

/**
 * Determines which segment will be selected for a given final wheel angle.
 *
 * @param finalAngle - The final angle of the wheel (in degrees)
 * @param segments - All segments in the wheel
 * @returns The segment at that angle
 */
export function getSegmentAtAngle(
  finalAngle: number,
  segments: RouletteSegment[]
): RouletteSegment {
  const normalized = normalizeSegments(segments);

  // Normalize angle to 0-360 range
  const normalizedAngle = ((finalAngle % 360) + 360) % 360;

  let cumulative = 0;
  for (const segment of normalized) {
    cumulative += (segment.probability / 100) * 360;
    if (normalizedAngle < cumulative) {
      return segment;
    }
  }

  return normalized[normalized.length - 1]!;
}
