/**
 * Framer Motion spring configurations
 *
 * Predefined spring physics settings for consistent motion feel.
 */

import type { SpringOptions } from 'framer-motion';

// Gentle spring - slow and smooth
export const gentleSpring: SpringOptions = {
  stiffness: 120,
  damping: 14,
  mass: 1,
};

// Default spring - balanced
export const defaultSpring: SpringOptions = {
  stiffness: 200,
  damping: 20,
  mass: 1,
};

// Snappy spring - quick and responsive
export const snappySpring: SpringOptions = {
  stiffness: 400,
  damping: 30,
  mass: 1,
};

// Bouncy spring - playful with overshoot
export const bouncySpring: SpringOptions = {
  stiffness: 300,
  damping: 10,
  mass: 1,
};

// Stiff spring - very quick, minimal overshoot
export const stiffSpring: SpringOptions = {
  stiffness: 500,
  damping: 35,
  mass: 1,
};

// Wobbly spring - lots of overshoot
export const wobblySpring: SpringOptions = {
  stiffness: 180,
  damping: 12,
  mass: 1,
};

// Heavy spring - slow and weighted
export const heavySpring: SpringOptions = {
  stiffness: 100,
  damping: 20,
  mass: 2,
};

// Light spring - quick and light
export const lightSpring: SpringOptions = {
  stiffness: 300,
  damping: 25,
  mass: 0.5,
};

// Button spring - optimized for button interactions
export const buttonSpring: SpringOptions = {
  stiffness: 450,
  damping: 30,
  mass: 0.8,
};

// Modal spring - smooth entrance for modals
export const modalSpring: SpringOptions = {
  stiffness: 350,
  damping: 25,
  mass: 1,
};

// Card spring - for card animations
export const cardSpring: SpringOptions = {
  stiffness: 250,
  damping: 20,
  mass: 1,
};

// Score spring - for score animations
export const scoreSpring: SpringOptions = {
  stiffness: 280,
  damping: 22,
  mass: 1,
};

// Tooltip spring - quick appearance
export const tooltipSpring: SpringOptions = {
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

// Slot spring - for slot machine reels
export const slotSpring: SpringOptions = {
  stiffness: 150,
  damping: 18,
  mass: 1.5,
};

// Roulette spring - for roulette wheel
export const rouletteSpring: SpringOptions = {
  stiffness: 80,
  damping: 15,
  mass: 2,
};

// Named spring presets for easy access
export const springs = {
  gentle: gentleSpring,
  default: defaultSpring,
  snappy: snappySpring,
  bouncy: bouncySpring,
  stiff: stiffSpring,
  wobbly: wobblySpring,
  heavy: heavySpring,
  light: lightSpring,
  button: buttonSpring,
  modal: modalSpring,
  card: cardSpring,
  score: scoreSpring,
  tooltip: tooltipSpring,
  slot: slotSpring,
  roulette: rouletteSpring,
} as const;

export default springs;
