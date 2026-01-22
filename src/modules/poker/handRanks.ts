/**
 * 포커 핸드 타입별 기본 점수 및 순위 정의
 *
 * BASE_HAND_VALUES는 @/data/constants.ts에서 가져오지만,
 * 이 파일에서는 추가적인 핸드 관련 상수와 유틸리티를 정의합니다.
 */

import type { HandType, Rank } from '@/types/interfaces';
import { BASE_HAND_VALUES, HAND_RANKINGS, RANK_VALUES, CARD_CHIP_VALUES } from '@/data/constants';

// Re-export for convenience
export { BASE_HAND_VALUES, HAND_RANKINGS, CARD_CHIP_VALUES };

/**
 * 핸드 타입의 순위를 가져옵니다 (높을수록 강함)
 */
export function getHandRanking(handType: HandType): number {
  return HAND_RANKINGS[handType];
}

/**
 * 핸드 타입의 기본 칩과 배수를 가져옵니다
 */
export function getBaseHandValue(handType: HandType): { chips: number; mult: number } {
  return BASE_HAND_VALUES[handType];
}

/**
 * 랭크를 숫자 값으로 변환 (A=14, K=13, ..., 2=2)
 */
export function rankToNumber(rank: Rank): number {
  return RANK_VALUES[rank];
}

/**
 * 랭크를 칩 값으로 변환 (점수 계산용)
 */
export function rankToChips(rank: Rank): number {
  return CARD_CHIP_VALUES[rank];
}

/**
 * A를 1로 취급할 때의 랭크 값 (로우 스트레이트용)
 */
export function rankToNumberLow(rank: Rank): number {
  if (rank === 'A') return 1;
  return RANK_VALUES[rank];
}

/**
 * 핸드 타입 우선순위 배열 (판정 순서대로 - 높은 핸드부터)
 */
export const HAND_TYPE_PRIORITY: HandType[] = [
  'pentagon',           // 5장 스페이드 A (×100)
  'royal_quintuple',    // 5장 같은 무늬 같은 수 (×30)
  'quintuple',          // 5장 같은 수 (×25)
  'royal_flush',        // 로열 플러시 (×30)
  'four_of_a_kind',     // 포카드 (×20)
  'straight_flush',     // 스트레이트 플러시 (×16)
  'full_house',         // 풀하우스 (×13)
  'flush',              // 플러시 (×10)
  'straight',           // 스트레이트 (×8)
  'three_of_a_kind',    // 트리플 (×6)
  'two_pair',           // 투페어 (×4)
  'pair',               // 원페어 (×2)
  'high_card',          // 하이카드 (×1)
];

/**
 * 두 핸드 타입을 비교 (양수: a가 강함, 음수: b가 강함, 0: 동등)
 */
export function compareHandTypes(a: HandType, b: HandType): number {
  return HAND_RANKINGS[a] - HAND_RANKINGS[b];
}
