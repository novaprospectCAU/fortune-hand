/**
 * Card Factory - 카드 생성 함수
 * 표준 52장 덱 및 개별 카드 생성
 */

import type { Card, Suit, Rank } from '@/types/interfaces';
import { RANKS, SUITS } from '@/data/constants';

/**
 * 카드 ID 생성용 카운터
 * 각 카드가 고유 ID를 갖도록 함
 */
let cardIdCounter = 0;

/**
 * 고유 카드 ID 생성
 */
function generateCardId(rank: Rank, suit: Suit): string {
  return `${rank}_${suit}_${++cardIdCounter}`;
}

/**
 * 단일 카드 생성
 * @param rank - 카드 랭크 (A, 2-10, J, Q, K)
 * @param suit - 카드 무늬 (hearts, diamonds, clubs, spades)
 * @returns 생성된 카드 객체
 */
export function createCard(rank: Rank, suit: Suit): Card {
  return {
    id: generateCardId(rank, suit),
    rank,
    suit,
  };
}

/**
 * 표준 52장 덱 생성
 * 모든 무늬와 랭크 조합으로 52장의 카드를 생성
 * @returns 52장의 카드 배열
 */
export function createStandardDeck(): Card[] {
  const cards: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(rank, suit));
    }
  }

  return cards;
}

/**
 * 빈 덱 구조 생성
 * @returns 빈 cards와 discardPile을 가진 Deck 객체
 */
export function createEmptyDeck() {
  return {
    cards: [] as Card[],
    discardPile: [] as Card[],
  };
}

/**
 * 초기화된 덱 생성 (셔플되지 않은 52장)
 * @returns cards에 52장이 있고 discardPile이 빈 Deck 객체
 */
export function createInitialDeck() {
  return {
    cards: createStandardDeck(),
    discardPile: [] as Card[],
  };
}
