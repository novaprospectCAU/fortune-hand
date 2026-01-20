/**
 * Deck Management - 덱 조작 함수
 * 셔플, 드로우, 버리기, 추가 등 덱 관련 모든 작업
 * 모든 함수는 불변성을 유지 (원본 수정 없음)
 */

import type { Card, Deck } from '@/types/interfaces';

/**
 * Fisher-Yates 셔플 알고리즘
 * 카드 배열을 무작위로 섞음 (원본 유지)
 * @param cards - 섞을 카드 배열
 * @returns 새로운 셔플된 카드 배열
 */
export function shuffle(cards: Card[]): Card[] {
  const result = [...cards];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }

  return result;
}

/**
 * 시드 기반 Fisher-Yates 셔플 (테스트용)
 * 동일한 시드로 항상 동일한 결과 보장
 * @param cards - 섞을 카드 배열
 * @param seed - 난수 생성 시드
 * @returns 새로운 셔플된 카드 배열
 */
export function shuffleWithSeed(cards: Card[], seed: number): Card[] {
  const result = [...cards];

  // 간단한 시드 기반 난수 생성기 (Mulberry32)
  let state = seed;
  const random = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }

  return result;
}

/**
 * 덱에서 카드 드로우
 * 덱에 카드가 부족하면 discardPile을 셔플해서 보충
 * @param deck - 현재 덱 상태
 * @param count - 드로우할 카드 수
 * @returns 드로우된 카드와 새로운 덱 상태
 */
export function draw(
  deck: Deck,
  count: number
): { drawn: Card[]; deck: Deck } {
  let { cards, discardPile } = deck;

  // 카드 부족 시 discardPile 셔플해서 보충
  if (cards.length < count && discardPile.length > 0) {
    cards = [...cards, ...shuffle(discardPile)];
    discardPile = [];
  }

  // 요청한 수만큼 드로우 (가능한 만큼만)
  const drawCount = Math.min(count, cards.length);
  const drawn = cards.slice(0, drawCount);
  const remaining = cards.slice(drawCount);

  return {
    drawn,
    deck: {
      cards: remaining,
      discardPile,
    },
  };
}

/**
 * 카드를 버린 카드 더미로 이동
 * @param deck - 현재 덱 상태
 * @param cards - 버릴 카드들
 * @returns 새로운 덱 상태
 */
export function discard(deck: Deck, cards: Card[]): Deck {
  const cardIds = new Set(cards.map((c) => c.id));

  return {
    cards: deck.cards.filter((c) => !cardIds.has(c.id)),
    discardPile: [...deck.discardPile, ...cards],
  };
}

/**
 * 덱에 새 카드 추가 (맨 아래에 추가)
 * 특수 카드 구매 시 사용
 * @param deck - 현재 덱 상태
 * @param cards - 추가할 카드들
 * @returns 새로운 덱 상태
 */
export function addToDeck(deck: Deck, cards: Card[]): Deck {
  return {
    cards: [...deck.cards, ...cards],
    discardPile: deck.discardPile,
  };
}

/**
 * 덱에서 특정 카드 제거
 * @param deck - 현재 덱 상태
 * @param cardIds - 제거할 카드 ID 배열
 * @returns 새로운 덱 상태
 */
export function removeFromDeck(deck: Deck, cardIds: string[]): Deck {
  const idsToRemove = new Set(cardIds);

  return {
    cards: deck.cards.filter((c) => !idsToRemove.has(c.id)),
    discardPile: deck.discardPile.filter((c) => !idsToRemove.has(c.id)),
  };
}

/**
 * 덱 초기화 (모든 카드를 cards로 모으고 셔플)
 * @param deck - 현재 덱 상태
 * @returns 셔플된 새로운 덱 상태
 */
export function resetAndShuffle(deck: Deck): Deck {
  const allCards = [...deck.cards, ...deck.discardPile];

  return {
    cards: shuffle(allCards),
    discardPile: [],
  };
}

/**
 * 덱의 총 카드 수 반환
 * @param deck - 덱 상태
 * @returns 총 카드 수 (cards + discardPile)
 */
export function getTotalCardCount(deck: Deck): number {
  return deck.cards.length + deck.discardPile.length;
}

/**
 * 덱에서 특정 카드 찾기
 * @param deck - 덱 상태
 * @param cardId - 찾을 카드 ID
 * @returns 찾은 카드 또는 undefined
 */
export function findCard(deck: Deck, cardId: string): Card | undefined {
  return (
    deck.cards.find((c) => c.id === cardId) ||
    deck.discardPile.find((c) => c.id === cardId)
  );
}
