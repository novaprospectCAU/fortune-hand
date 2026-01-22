/**
 * Cards Module - Public API
 *
 * 카드 데이터 및 덱 관리 모듈
 *
 * 이 모듈의 책임:
 * - 표준 52장 덱 생성
 * - 덱 셔플, 드로우, 버리기
 * - 특수 카드 데이터 관리
 * - 카드 UI 컴포넌트
 *
 * 이 모듈이 절대 하지 않는 것:
 * - 포커 핸드 판정 (poker 모듈 담당)
 * - 점수 계산
 * - 조커 효과 처리
 */

// ============================================================
// 카드 생성 함수
// ============================================================
export {
  createCard,
  createStandardDeck,
  createEmptyDeck,
  createInitialDeck,
} from './cardFactory';

// ============================================================
// 덱 조작 함수
// ============================================================
export {
  shuffle,
  shuffleWithSeed,
  draw,
  discard,
  addToDeck,
  removeFromDeck,
  resetAndShuffle,
  getTotalCardCount,
  findCard,
} from './deck';

// ============================================================
// 특수 카드 관련 함수
// ============================================================
export {
  getAllSpecialCards,
  getSpecialCardById,
  getSpecialCardCost,
  getSpecialCardRarity,
  getSpecialCardDetails,
  getAllEnhancements,
  getEnhancementById,
  applyEnhancement,
  removeEnhancement,
  isSpecialCard,
  getSpecialCardsByRarity,
} from './specialCards';

// ============================================================
// 특수 카드 트리거 시스템
// ============================================================
export {
  detectTriggers,
  getTriggerEffects,
  countSlotTriggers,
  countRouletteTriggers,
  hasTriggerType,
  mergeSlotResults,
} from './triggers';

export type {
  TriggerResult,
  TriggerEffect,
} from './triggers';

// ============================================================
// UI 컴포넌트
// ============================================================
export {
  Card,
  Hand,
  SelectionInfo,
  CardStack,
  DeckDisplay,
} from './components';

export type {
  CardProps,
  HandProps,
  SelectionInfoProps,
  CardStackProps,
  DeckDisplayProps,
} from './components';

// ============================================================
// CardsModule 인터페이스 구현 (타입 준수 확인용)
// ============================================================
import type { CardsModule } from '@/types/interfaces';
import { createStandardDeck } from './cardFactory';
import { shuffle, draw, discard, addToDeck } from './deck';

/**
 * CardsModule 인터페이스를 만족하는 객체
 * 다른 모듈에서 이 모듈을 사용할 때 타입 안전성 보장
 */
export const cardsModule: CardsModule = {
  createStandardDeck,
  shuffle,
  draw,
  discard,
  addToDeck,
};
