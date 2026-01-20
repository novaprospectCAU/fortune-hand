// 타입 안전한 상수 정의

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type Rank = typeof RANKS[number];

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export type Suit = typeof SUITS[number];

export const HAND_TYPES = [
  'high_card',
  'pair',
  'two_pair',
  'three_of_a_kind',
  'straight',
  'flush',
  'full_house',
  'four_of_a_kind',
  'straight_flush',
  'royal_flush',
] as const;
export type HandType = typeof HAND_TYPES[number];

export const HAND_RANKINGS: Record<HandType, number> = {
  high_card: 0,
  pair: 1,
  two_pair: 2,
  three_of_a_kind: 3,
  straight: 4,
  flush: 5,
  full_house: 6,
  four_of_a_kind: 7,
  straight_flush: 8,
  royal_flush: 9,
};

export const BASE_HAND_VALUES: Record<HandType, { chips: number; mult: number }> = {
  high_card: { chips: 5, mult: 1 },
  pair: { chips: 10, mult: 2 },
  two_pair: { chips: 20, mult: 2 },
  three_of_a_kind: { chips: 30, mult: 3 },
  straight: { chips: 30, mult: 4 },
  flush: { chips: 35, mult: 4 },
  full_house: { chips: 40, mult: 4 },
  four_of_a_kind: { chips: 60, mult: 7 },
  straight_flush: { chips: 100, mult: 8 },
  royal_flush: { chips: 100, mult: 8 },
};

export const CARD_CHIP_VALUES: Record<Rank, number> = {
  'A': 11,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
};

export const RANK_VALUES: Record<Rank, number> = {
  'A': 14, // 또는 1 (스트레이트에서)
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
};

export const SLOT_SYMBOLS = ['card', 'target', 'gold', 'chip', 'star', 'skull', 'wild'] as const;
export type SlotSymbol = typeof SLOT_SYMBOLS[number];

export const SYMBOL_EMOJIS: Record<SlotSymbol, string> = {
  card: '🃏',
  target: '🎯',
  gold: '💰',
  chip: '🎰',
  star: '⭐',
  skull: '💀',
  wild: '🌟',
};

export const RARITIES = ['common', 'uncommon', 'rare', 'legendary'] as const;
export type Rarity = typeof RARITIES[number];

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  legendary: '#f59e0b',
};

// 게임 설정 기본값
export const DEFAULT_GAME_CONFIG = {
  startingGold: 100,
  startingHands: 4,
  startingDiscards: 3,
  handSize: 8,
  maxSelectCards: 5,
  maxJokers: 5,
} as const;
