/**
 * UI Theme - Colors, spacing, and design tokens
 *
 * This file provides the theme constants for the Fortune's Hand game.
 * It complements the TailwindCSS configuration with programmatic access to colors.
 */

export const colors = {
  // Main colors
  primary: '#6366f1',    // Indigo
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',

  secondary: '#8b5cf6',  // Violet
  secondaryDark: '#7c3aed',
  secondaryLight: '#a78bfa',

  accent: '#f59e0b',     // Amber (Gold)
  accentDark: '#d97706',
  accentLight: '#fbbf24',

  // Status colors
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Card suit colors
  hearts: '#ef4444',
  diamonds: '#ef4444',
  clubs: '#1f2937',
  spades: '#1f2937',

  // Rarity colors
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  legendary: '#f59e0b',

  // Background colors
  bg: {
    primary: '#0f172a',
    secondary: '#1e293b',
    card: '#334155',
    overlay: 'rgba(15, 23, 42, 0.8)',
  },

  // Border colors
  border: {
    default: '#475569',
    light: '#64748b',
    focus: '#6366f1',
  },

  // Text colors
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    inverse: '#0f172a',
  },
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
} as const;

export const fontSize = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  '4xl': '2.5rem', // 40px
  '5xl': '3rem',   // 48px
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
  toast: 60,
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: (color: string) => `0 0 20px ${color}, 0 0 40px ${color}`,
} as const;

// Utility function to get rarity color
export function getRarityColor(rarity: 'common' | 'uncommon' | 'rare' | 'legendary'): string {
  return colors[rarity];
}

// Utility function to get suit color
export function getSuitColor(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'): string {
  return colors[suit];
}

// Utility function to check if a suit is red
export function isRedSuit(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  zIndex,
  shadows,
} as const;

export default theme;
