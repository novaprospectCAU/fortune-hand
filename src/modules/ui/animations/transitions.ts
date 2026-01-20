/**
 * Framer Motion transition configurations
 *
 * Predefined transition settings for various animation scenarios.
 */

import type { Transition } from 'framer-motion';
import { springs } from './springs';

// Instant - no animation
export const instant: Transition = {
  duration: 0,
};

// Quick - fast and snappy
export const quick: Transition = {
  duration: 0.15,
  ease: 'easeOut',
};

// Default - balanced timing
export const defaultTransition: Transition = {
  duration: 0.25,
  ease: 'easeInOut',
};

// Smooth - slower and more elegant
export const smooth: Transition = {
  duration: 0.4,
  ease: 'easeInOut',
};

// Slow - deliberate and noticeable
export const slow: Transition = {
  duration: 0.6,
  ease: 'easeInOut',
};

// Spring transitions
export const springDefault: Transition = {
  type: 'spring',
  ...springs.default,
};

export const springSnappy: Transition = {
  type: 'spring',
  ...springs.snappy,
};

export const springBouncy: Transition = {
  type: 'spring',
  ...springs.bouncy,
};

export const springGentle: Transition = {
  type: 'spring',
  ...springs.gentle,
};

// Ease curves
export const easeOut: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // Ease out cubic
};

export const easeIn: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 1, 1], // Ease in cubic
};

export const easeInOut: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // Ease in-out cubic
};

// Anticipate - slight pullback before animation
export const anticipate: Transition = {
  duration: 0.4,
  ease: [0.36, 0, 0.66, -0.56],
};

// Overshoot - goes past target then settles
export const overshoot: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 15,
};

// Specific use-case transitions
export const modalEnter: Transition = {
  type: 'spring',
  ...springs.modal,
};

export const modalExit: Transition = {
  duration: 0.15,
  ease: 'easeIn',
};

export const buttonTap: Transition = {
  type: 'spring',
  ...springs.button,
};

export const tooltipTransition: Transition = {
  type: 'spring',
  ...springs.tooltip,
};

export const cardFlipTransition: Transition = {
  type: 'spring',
  ...springs.card,
};

export const scorePopupTransition: Transition = {
  type: 'spring',
  ...springs.score,
};

export const toastEnter: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const toastExit: Transition = {
  duration: 0.2,
  ease: 'easeIn',
};

// Stagger configuration
export const staggerChildren = (staggerTime = 0.1): Transition => ({
  staggerChildren: staggerTime,
  delayChildren: 0,
});

export const staggerChildrenReverse = (staggerTime = 0.05): Transition => ({
  staggerChildren: staggerTime,
  staggerDirection: -1,
});

// Delay helper
export const withDelay = (delay: number, transition: Transition = defaultTransition): Transition => ({
  ...transition,
  delay,
});

// Duration override helper
export const withDuration = (duration: number, transition: Transition = defaultTransition): Transition => ({
  ...transition,
  duration,
});

// Named transition presets
export const transitions = {
  instant,
  quick,
  default: defaultTransition,
  smooth,
  slow,
  springDefault,
  springSnappy,
  springBouncy,
  springGentle,
  easeOut,
  easeIn,
  easeInOut,
  anticipate,
  overshoot,
  modalEnter,
  modalExit,
  buttonTap,
  tooltip: tooltipTransition,
  cardFlip: cardFlipTransition,
  scorePopup: scorePopupTransition,
  toastEnter,
  toastExit,
} as const;

export default transitions;
