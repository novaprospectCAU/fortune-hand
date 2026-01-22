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
  'quintuple',
  'royal_quintuple',
  'pentagon',
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
  straight_flush: 7,
  four_of_a_kind: 8,  // 포커
  royal_flush: 9,
  quintuple: 10,
  royal_quintuple: 11,
  pentagon: 12,
};

// 새로운 점수 시스템: 관련 카드의 합 * 배수
// chips는 더 이상 사용하지 않고, mult만 사용
export const HAND_MULTIPLIERS: Record<HandType, number> = {
  high_card: 1,         // 가장 큰 수 * 1
  pair: 2,              // 페어 합 * 2
  two_pair: 4,          // 4장 합 * 4
  three_of_a_kind: 6,   // 트리플 합 * 6
  straight: 8,          // 모든 카드 합 * 8
  flush: 10,            // 모든 카드 합 * 10
  full_house: 13,       // 모든 카드 합 * 13
  straight_flush: 16,   // 모든 카드 합 * 16
  four_of_a_kind: 20,   // 포커 4장 합 * 20
  royal_flush: 30,      // 모든 카드 합 * 30
  quintuple: 25,        // 모든 카드 합 * 25
  royal_quintuple: 30,  // 모든 카드 합 * 30
  pentagon: 100,        // 모든 카드 합 * 100 (5장 스페이드 A)
};

// 기존 호환성을 위해 유지 (나중에 제거 가능)
export const BASE_HAND_VALUES: Record<HandType, { chips: number; mult: number }> = {
  high_card: { chips: 0, mult: 1 },
  pair: { chips: 0, mult: 2 },
  two_pair: { chips: 0, mult: 4 },
  three_of_a_kind: { chips: 0, mult: 6 },
  straight: { chips: 0, mult: 8 },
  flush: { chips: 0, mult: 10 },
  full_house: { chips: 0, mult: 13 },
  four_of_a_kind: { chips: 0, mult: 20 },
  straight_flush: { chips: 0, mult: 16 },
  royal_flush: { chips: 0, mult: 30 },
  quintuple: { chips: 0, mult: 25 },
  royal_quintuple: { chips: 0, mult: 30 },
  pentagon: { chips: 0, mult: 100 },
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
  startingSlotSpins: 4,  // 라운드당 슬롯 스핀 횟수
  handSize: 8,
  maxSelectCards: 5,
  maxJokers: 5,
} as const;

// 점수 기반 골드 보상 설정
export const SCORING_CONFIG = {
  goldPerScore: 0.02,    // 점수당 골드 (1000점 = 20골드)
  minGoldPerRound: 10,   // 라운드당 최소 골드
  maxGoldPerRound: 100,  // 라운드당 최대 골드
  roundBonusGold: [0, 5, 10, 15, 20, 25, 30, 40], // 라운드별 추가 골드
} as const;

/**
 * 점수 기반 골드 보상 계산
 */
export function calculateGoldReward(score: number, round: number = 1): number {
  const rawGold = Math.floor(score * SCORING_CONFIG.goldPerScore);
  const baseGold = Math.min(SCORING_CONFIG.maxGoldPerRound, Math.max(SCORING_CONFIG.minGoldPerRound, rawGold));
  const roundBonus = SCORING_CONFIG.roundBonusGold[Math.min(round - 1, SCORING_CONFIG.roundBonusGold.length - 1)] ?? 0;
  return baseGold + roundBonus;
}
