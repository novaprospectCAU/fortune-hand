/**
 * 점수 계산 모듈
 *
 * 핸드 결과와 보너스를 받아 최종 점수를 계산합니다.
 * 보너스 적용 순서: chips -> mult -> xmult
 */

import type { AppliedBonus, Card, HandResult, ScoreCalculation } from '@/types/interfaces';
import { CARD_CHIP_VALUES } from './handRanks';

// 최대 retrigger 횟수 제한 (무한 루프 방지)
const MAX_RETRIGGER_COUNT = 10;

/**
 * 카드의 칩 값을 계산합니다.
 * 골드 카드는 0칩 (대신 골드 제공)
 */
export function getCardChipValue(card: Card): number {
  // 골드 카드는 칩 대신 골드를 주므로 칩 값 0
  if (card.isGold) return 0;

  // 기본 칩 값
  let chips = CARD_CHIP_VALUES[card.rank];

  // 카드 강화 보너스 (chips 타입)
  if (card.enhancement?.type === 'chips') {
    chips += card.enhancement.value;
  }

  return chips;
}

/**
 * 점수에 기여한 카드들의 총 칩 값을 계산합니다.
 */
export function calculateCardChips(scoringCards: Card[]): number {
  return scoringCards.reduce((total, card) => total + getCardChipValue(card), 0);
}

/**
 * 카드의 retrigger 횟수를 계산합니다.
 * @param card - 체크할 카드
 * @returns 총 발동 횟수 (원래 1번 + retrigger 횟수)
 */
function getCardTriggerCount(card: Card): number {
  if (card.enhancement?.type === 'retrigger') {
    // 무한 루프 방지: 최대값 제한, 최소값 보장 (음수 방지)
    const retriggerCount = Math.max(0, Math.min(card.enhancement.value, MAX_RETRIGGER_COUNT));
    return 1 + retriggerCount; // 원래 1번 + retrigger 횟수
  }
  return 1; // 기본값: 1번만 발동
}

/**
 * 핸드 결과와 보너스를 받아 최종 점수를 계산합니다.
 *
 * 점수 계산 순서:
 * 1. 기본 chips = 핸드 타입 기본 칩 + 카드 칩 합계 (retrigger 적용)
 * 2. 기본 mult = 핸드 타입 기본 배수 + 카드 mult 강화 (retrigger 적용)
 * 3. chips 보너스 적용 (순서대로 더하기)
 * 4. mult 보너스 적용 (순서대로 더하기)
 * 5. xmult 보너스 적용 (순서대로 곱하기)
 * 6. 최종 점수 = chips * mult
 *
 * @param handResult 핸드 판정 결과
 * @param bonuses 적용할 보너스 배열 (조커, 슬롯 등에서 제공)
 * @returns ScoreCalculation - 점수 계산 과정 및 최종 점수
 */
export function calculateScore(
  handResult: HandResult,
  bonuses: AppliedBonus[] = []
): ScoreCalculation {
  // 1. 기본 칩 계산: 핸드 타입 기본값 + 카드 칩 합계 (retrigger 적용)
  let chipTotal = handResult.baseChips;
  let totalCardChips = 0;

  // 각 카드의 칩 값을 retrigger 횟수만큼 계산
  for (const card of handResult.scoringCards) {
    const cardChipValue = getCardChipValue(card);
    const triggerCount = getCardTriggerCount(card);
    totalCardChips += cardChipValue * triggerCount;
  }

  chipTotal += totalCardChips;

  // 2. 기본 배수 + 카드 강화 보너스 (mult 타입, retrigger 적용)
  let multTotal = handResult.baseMult;

  for (const card of handResult.scoringCards) {
    if (card.enhancement?.type === 'mult') {
      const triggerCount = getCardTriggerCount(card);
      multTotal += card.enhancement.value * triggerCount;
    }
  }

  // 적용된 보너스 추적 (카드 칩은 별도로 추적)
  const appliedBonuses: AppliedBonus[] = [];

  // 카드 칩을 보너스로 기록 (투명성을 위해)
  if (totalCardChips > 0) {
    appliedBonuses.push({
      source: 'Card chips',
      type: 'chips',
      value: totalCardChips,
    });
  }

  // 카드 강화 보너스 (chips 타입) 추적
  for (const card of handResult.scoringCards) {
    if (card.enhancement?.type === 'chips') {
      const suitLetter = card.suit.charAt(0).toUpperCase();
      const triggerCount = getCardTriggerCount(card);
      const totalValue = card.enhancement.value * triggerCount;

      appliedBonuses.push({
        source: `Enhancement: ${card.rank}${suitLetter}${triggerCount > 1 ? ` (x${triggerCount})` : ''}`,
        type: 'chips',
        value: totalValue,
      });
    }
  }

  // 카드 강화 보너스 (mult 타입) 추적
  for (const card of handResult.scoringCards) {
    if (card.enhancement?.type === 'mult') {
      const suitLetter = card.suit.charAt(0).toUpperCase();
      const triggerCount = getCardTriggerCount(card);
      const totalValue = card.enhancement.value * triggerCount;

      appliedBonuses.push({
        source: `Enhancement: ${card.rank}${suitLetter}${triggerCount > 1 ? ` (x${triggerCount})` : ''}`,
        type: 'mult',
        value: totalValue,
      });
    }
  }

  // Retrigger 자체를 보너스로 추적
  for (const card of handResult.scoringCards) {
    if (card.enhancement?.type === 'retrigger') {
      const suitLetter = card.suit.charAt(0).toUpperCase();

      appliedBonuses.push({
        source: `Retrigger: ${card.rank}${suitLetter}`,
        type: 'chips',
        value: 0, // retrigger는 다른 효과를 배가하므로 직접적인 값은 0
      });
    }
  }

  // 3. chips 보너스 적용 (순서대로)
  const chipBonuses = bonuses.filter(b => b.type === 'chips');
  for (const bonus of chipBonuses) {
    chipTotal += bonus.value;
    appliedBonuses.push(bonus);
  }

  // 4. mult 보너스 적용 (순서대로)
  const multBonuses = bonuses.filter(b => b.type === 'mult');
  for (const bonus of multBonuses) {
    multTotal += bonus.value;
    appliedBonuses.push(bonus);
  }

  // 5. xmult 보너스 적용 (순서대로)
  const xmultBonuses = bonuses.filter(b => b.type === 'xmult');
  for (const bonus of xmultBonuses) {
    multTotal *= bonus.value;
    appliedBonuses.push(bonus);
  }

  // 6. 최종 점수 계산
  const finalScore = Math.floor(chipTotal * multTotal);

  return {
    handResult,
    chipTotal,
    multTotal,
    appliedBonuses,
    finalScore,
  };
}

/**
 * 점수 계산 과정을 문자열로 포맷팅합니다 (디버깅/UI용)
 */
export function formatScoreBreakdown(calculation: ScoreCalculation): string {
  const { handResult, chipTotal, multTotal, appliedBonuses, finalScore } = calculation;

  const lines: string[] = [
    `Hand: ${handResult.handType}`,
    `Base: ${handResult.baseChips} chips x ${handResult.baseMult} mult`,
    '',
    'Bonuses:',
  ];

  for (const bonus of appliedBonuses) {
    if (bonus.type === 'chips') {
      lines.push(`  +${bonus.value} chips (${bonus.source})`);
    } else if (bonus.type === 'mult') {
      lines.push(`  +${bonus.value} mult (${bonus.source})`);
    } else if (bonus.type === 'xmult') {
      lines.push(`  x${bonus.value} mult (${bonus.source})`);
    }
  }

  lines.push('');
  lines.push(`Total: ${chipTotal} chips x ${multTotal} mult = ${finalScore}`);

  return lines.join('\n');
}

/**
 * 빈 점수 계산 결과 생성 (카드가 없는 경우 등)
 */
export function createEmptyScoreCalculation(): ScoreCalculation {
  return {
    handResult: {
      handType: 'high_card',
      rank: 0,
      scoringCards: [],
      baseChips: 0,
      baseMult: 0,
    },
    chipTotal: 0,
    multTotal: 0,
    appliedBonuses: [],
    finalScore: 0,
  };
}

/**
 * 카드 강화 중 gold 타입의 총 골드를 계산합니다.
 * 점수에 기여한 카드들 중 gold enhancement가 있으면 해당 골드를 반환합니다.
 * retrigger 강화가 있는 경우 골드도 배가됩니다.
 *
 * @param scoringCards 점수에 기여한 카드 배열
 * @returns 총 골드 값
 */
export function calculateGoldFromEnhancements(scoringCards: Card[]): number {
  return scoringCards.reduce((total, card) => {
    if (card.enhancement?.type === 'gold') {
      const triggerCount = getCardTriggerCount(card);
      return total + (card.enhancement.value * triggerCount);
    }
    return total;
  }, 0);
}

/**
 * Retrigger enhancement 구현
 *
 * retrigger enhancement는 카드의 칩 값과 강화 효과를 재발동시킵니다.
 *
 * 구현된 내용:
 * 1. 카드의 칩 값이 retrigger 횟수만큼 배가됨
 * 2. 카드의 chips/mult 강화 효과가 retrigger 횟수만큼 배가됨
 * 3. 무한 루프 방지: MAX_RETRIGGER_COUNT 상수로 제한
 * 4. gold 강화는 별도 계산되므로 retrigger 적용 시 calculateGoldFromEnhancements에서 처리됨
 *
 * 향후 확장 고려사항:
 * - 이벤트 시스템과의 통합 (카드 플레이 이벤트 재발행)
 * - 조커와의 상호작용 (조커가 retrigger된 카드에 반응하는지)
 * - 특수 카드 효과 재발동 (triggerSlot, triggerRoulette)
 */
