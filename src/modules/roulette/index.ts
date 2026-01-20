/**
 * Roulette Module - Public API
 *
 * Exports the roulette functionality for use by other modules.
 */

// Core roulette functions
export {
  spin,
  skip,
  getDefaultConfig,
  applyBonuses,
  calculateTargetAngle,
  validateConfig,
} from './roulette';

// Probability utilities (internal, but exported for testing)
export {
  selectSegment,
  normalizeSegments,
  distributeExtraProbability,
  calculateSegmentAngle,
  calculateSegmentStartAngle,
  getSegmentAtAngle,
} from './probability';

// UI Components
export { RouletteWheel } from './components/RouletteWheel';
export { Segment } from './components/Segment';
export { SpinButton } from './components/SpinButton';

// Re-export types for convenience
export type {
  RouletteConfig,
  RouletteSegment,
  RouletteInput,
  RouletteResult,
} from '@/types/interfaces';
