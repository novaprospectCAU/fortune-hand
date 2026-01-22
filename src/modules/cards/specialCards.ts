/**
 * Special Cards - 특수 카드 데이터 로더
 * cards.json에서 특수 카드와 강화 정보를 로드
 */

import type { Card, CardEnhancement, Suit, Rank } from '@/types/interfaces';
import cardsData from '@/data/cards.json';

/**
 * 특수 카드 JSON 데이터 타입
 */
interface SpecialCardData {
  id: string;
  name: string;
  description: string;
  isWild?: boolean;
  isGold?: boolean;
  isGlass?: boolean;
  triggerSlot?: boolean;
  triggerRoulette?: boolean;
  baseRank?: string;
  baseSuit?: string;
  goldValue?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  shopCost: number;
}

/**
 * 강화 데이터 타입
 */
interface EnhancementData {
  id: string;
  name: string;
  description: string;
  type: CardEnhancement['type'];
  value: number;
}

/**
 * 특수 카드 데이터를 Card 객체로 변환
 * @param data - JSON에서 로드한 특수 카드 데이터
 * @returns Card 객체
 */
function convertSpecialCardData(data: SpecialCardData): Card {
  return {
    id: data.id,
    // 특수 카드는 기본 무늬/랭크가 있거나 없을 수 있음
    suit: (data.baseSuit as Suit) || 'spades',
    rank: (data.baseRank as Rank) || 'A',
    isWild: data.isWild,
    isGold: data.isGold,
    isGlass: data.isGlass,
    triggerSlot: data.triggerSlot,
    triggerRoulette: data.triggerRoulette,
  };
}

/**
 * 모든 특수 카드 로드
 * @returns 특수 카드 배열
 */
export function getAllSpecialCards(): Card[] {
  const specialCards = cardsData.specialCards as SpecialCardData[];
  return specialCards.map(convertSpecialCardData);
}

/**
 * ID로 특수 카드 조회
 * @param id - 특수 카드 ID
 * @returns 특수 카드 또는 undefined
 */
export function getSpecialCardById(id: string): Card | undefined {
  const specialCards = cardsData.specialCards as SpecialCardData[];
  const data = specialCards.find((c) => c.id === id);
  return data ? convertSpecialCardData(data) : undefined;
}

/**
 * 특수 카드 상점 가격 조회
 * @param id - 특수 카드 ID
 * @returns 가격 또는 0
 */
export function getSpecialCardCost(id: string): number {
  const specialCards = cardsData.specialCards as SpecialCardData[];
  const data = specialCards.find((c) => c.id === id);
  return data?.shopCost ?? 0;
}

/**
 * 특수 카드 희귀도 조회
 * @param id - 특수 카드 ID
 * @returns 희귀도 또는 'common'
 */
export function getSpecialCardRarity(
  id: string
): 'common' | 'uncommon' | 'rare' | 'legendary' {
  const specialCards = cardsData.specialCards as SpecialCardData[];
  const data = specialCards.find((c) => c.id === id);
  return data?.rarity ?? 'common';
}

/**
 * 특수 카드 상세 정보 조회 (상점 표시용)
 * @param id - 특수 카드 ID
 * @returns 이름, 설명, 희귀도, 카드 정보
 */
export function getSpecialCardDetails(
  id: string
): {
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  cardInfo: {
    suit: Suit;
    rank: Rank;
    isWild?: boolean;
    isGold?: boolean;
    isGlass?: boolean;
    triggerSlot?: boolean;
    triggerRoulette?: boolean;
  };
} | undefined {
  const specialCards = cardsData.specialCards as SpecialCardData[];
  const data = specialCards.find((c) => c.id === id);
  if (!data) return undefined;

  return {
    name: data.name,
    description: data.description,
    rarity: data.rarity,
    cardInfo: {
      suit: (data.baseSuit as Suit) || 'spades',
      rank: (data.baseRank as Rank) || 'A',
      isWild: data.isWild,
      isGold: data.isGold,
      isGlass: data.isGlass,
      triggerSlot: data.triggerSlot,
      triggerRoulette: data.triggerRoulette,
    },
  };
}

/**
 * 모든 강화 종류 로드
 * @returns 강화 데이터 배열
 */
export function getAllEnhancements(): EnhancementData[] {
  return cardsData.enhancements as EnhancementData[];
}

/**
 * ID로 강화 조회
 * @param id - 강화 ID
 * @returns 강화 데이터 또는 undefined
 */
export function getEnhancementById(id: string): EnhancementData | undefined {
  const enhancements = cardsData.enhancements as EnhancementData[];
  return enhancements.find((e) => e.id === id);
}

/**
 * 카드에 강화 적용
 * @param card - 강화할 카드
 * @param enhancementId - 강화 ID
 * @returns 강화가 적용된 새 카드 (불변성 유지)
 */
export function applyEnhancement(card: Card, enhancementId: string): Card {
  const enhancement = getEnhancementById(enhancementId);
  if (!enhancement) {
    return card;
  }

  return {
    ...card,
    enhancement: {
      type: enhancement.type,
      value: enhancement.value,
    },
  };
}

/**
 * 카드에서 강화 제거
 * @param card - 강화를 제거할 카드
 * @returns 강화가 제거된 새 카드 (불변성 유지)
 */
export function removeEnhancement(card: Card): Card {
  const { enhancement: _, ...cardWithoutEnhancement } = card;
  return cardWithoutEnhancement;
}

/**
 * 카드가 특수 카드인지 확인
 * @param card - 확인할 카드
 * @returns 특수 카드 여부
 */
export function isSpecialCard(card: Card): boolean {
  return !!(card.isWild || card.isGold || card.isGlass || card.triggerSlot || card.triggerRoulette);
}

/**
 * 희귀도별 특수 카드 필터링
 * @param rarity - 희귀도
 * @returns 해당 희귀도의 특수 카드 배열
 */
export function getSpecialCardsByRarity(
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
): Card[] {
  const specialCards = cardsData.specialCards as SpecialCardData[];
  return specialCards
    .filter((c) => c.rarity === rarity)
    .map(convertSpecialCardData);
}
