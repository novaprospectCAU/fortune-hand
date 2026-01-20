/**
 * Framer Motion animation variants
 *
 * Reusable animation presets for consistent UI animations.
 */

import type { Variants } from 'framer-motion';

// Basic fade animation
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide up animation
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Slide down animation
export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Slide left animation
export const slideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Slide right animation
export const slideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Scale in animation
export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

// Score popup animation (floats up and fades)
export const scorePopup: Variants = {
  initial: { scale: 0, y: 0, opacity: 0 },
  animate: {
    scale: 1,
    y: -50,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Modal animation
export const modal: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Overlay/backdrop animation
export const overlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Card flip animation
export const cardFlip: Variants = {
  initial: { rotateY: 180, opacity: 0 },
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    rotateY: -180,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

// Button press animation
export const buttonPress: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  disabled: { opacity: 0.5, scale: 1 },
};

// List item stagger animation
export const listItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
    },
  }),
  exit: { opacity: 0, y: -20 },
};

// Tooltip animation
export const tooltip: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

// Toast notification animation
export const toast: Variants = {
  initial: { opacity: 0, x: 50, y: 0 },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: { duration: 0.2 },
  },
};

// Pulse animation for emphasis
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
};

// Shake animation for errors
export const shake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// Bounce animation
export const bounce: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

// Glow animation
export const glow: Variants = {
  initial: { boxShadow: '0 0 0px currentColor' },
  animate: {
    boxShadow: [
      '0 0 0px currentColor',
      '0 0 20px currentColor',
      '0 0 0px currentColor',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
};

// Phase transition animation
export const phaseTransition: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.5,
    transition: { duration: 0.3 },
  },
};

// Container animation for staggered children
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Progress bar fill animation
export const progressFill: Variants = {
  initial: { scaleX: 0 },
  animate: (value: number) => ({
    scaleX: value,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  }),
};

// Number counter animation helper
export interface CounterVariants {
  initial: { opacity: number };
  animate: { opacity: number; transition: { duration: number } };
}

export function createCounterVariants(duration = 0.5): CounterVariants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration },
    },
  };
}
