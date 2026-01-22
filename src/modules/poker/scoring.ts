/**
 * 점수 계산 모듈
 *
 * 새로운 점수 시스템:
 * 점수 = (관련 카드들의 합) × (핸드 배수 + 보너스 배수)
 */

import type { AppliedBonus, Card, HandResult, HandType, ScoreCalculation } from '@/types/interfaces';
import { CARD_CHIP_VALUES } from './handRanks';
import { HAND_MULTIPLIERS } from '@/data/constants';

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
 * 핸드 타입에 따라 점수에 사용할 카드들의 합을 계산합니다.
 */
function getScoringCardSum(handType: HandType, scoringCards: Card[]): number {
  // 모든 카드의 칩 값 합계
  const allSum = scoringCards.reduce((sum, card) => sum + getCardChipValue(card), 0);

  switch (handType) {
    case 'high_card': {
      // 가장 큰 카드 1장만
      if (scoringCards.length === 0) return 0;
      return Math.max(...scoringCards.map(c => getCardChipValue(c)));
    }
    case 'pair': {
      // 페어인 2장만
      const rankCounts = new Map<string, Card[]>();
      for (const card of scoringCards) {
        const existing = rankCounts.get(card.rank) || [];
        existing.push(card);
        rankCounts.set(card.rank, existing);
      }
      for (const [, cards] of rankCounts) {
        if (cards.length >= 2) {
          return cards.slice(0, 2).reduce((sum, c) => sum + getCardChipValue(c), 0);
        }
      }
      return 0;
    }
    case 'two_pair': {
      // 투페어 4장
      const rankCounts = new Map<string, Card[]>();
      for (const card of scoringCards) {
        const existing = rankCounts.get(card.rank) || [];
        existing.push(card);
        rankCounts.set(card.rank, existing);
      }
      let sum = 0;
      let pairsFound = 0;
      for (const [, cards] of rankCounts) {
        if (cards.length >= 2 && pairsFound < 2) {
          sum += cards.slice(0, 2).reduce((s, c) => s + getCardChipValue(c), 0);
          pairsFound++;
        }
      }
      return sum;
    }
    case 'three_of_a_kind': {
      // 트리플 3장
      const rankCounts = new Map<string, Card[]>();
      for (const card of scoringCards) {
        const existing = rankCounts.get(card.rank) || [];
        existing.push(card);
        rankCounts.set(card.rank, existing);
      }
      for (const [, cards] of rankCounts) {
        if (cards.length >= 3) {
          return cards.slice(0, 3).reduce((sum, c) => sum + getCardChipValue(c), 0);
        }
      }
      return 0;
    }
    case 'four_of_a_kind': {
      // 포카드 4장
      const rankCounts = new Map<string, Card[]>();
      for (const card of scoringCards) {
        const existing = rankCounts.get(card.rank) || [];
        existing.push(card);
        rankCounts.set(card.rank, existing);
      }
      for (const [, cards] of rankCounts) {
        if (cards.length >= 4) {
          return cards.slice(0, 4).reduce((sum, c) => sum + getCardChipValue(c), 0);
        }
      }
      return 0;
    }
    // 나머지는 모든 카드 합계
    case 'straight':
    case 'flush':
    case 'full_house':
    case 'straight_flush':
    case 'royal_flush':
    case 'quintuple':
    case 'royal_quintuple':
    case 'pentagon':
    default:
      return allSum;
  }
}

/**
 * 핸드 결과와 보너스를 받아 최종 점수를 계산합니다.
 *
 * 새로운 점수 공식:
 * 점수 = (관련 카드들의 합) × (핸드 배수 + 보너스 배수)
 *
 * @param handResult 핸드 판정 결과
 * @param bonuses 적용할 보너스 배열 (조커, 슬롯 등에서 제공)
 * @returns ScoreCalculation - 점수 계산 과정 및 최종 점수
 */
export function calculateScore(
  handResult: HandResult,
  bonuses: AppliedBonus[] = []
): ScoreCalculation {
  // 1. 핸드 타입에 따른 카드 합 계산
  let chipTotal = getScoringCardSum(handResult.handType, handResult.scoringCards);

  // 2. 기본 배수 (핸드 타입별 배수)
  let multTotal = HAND_MULTIPLIERS[handResult.handType] ?? 1;

  // 카드 강화 보너스 (mult 타입, retrigger 적용)
  for (const card of handResult.scoringCards) {
    if (card.enhancement?.type === 'mult') {
      const triggerCount = getCardTriggerCount(card);
      multTotal += card.enhancement.value * triggerCount;
    }
  }

  // 적용된 보너스 추적
  const appliedBonuses: AppliedBonus[] = [];

  // 카드 합계 기록
  if (chipTotal > 0) {
    appliedBonuses.push({
      source: 'Card sum',
      type: 'chips',
      value: chipTotal,
    });
  }

  // 카드 강화 보너스 추적
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

  // 3. chips 보너스 적용 (카드 합에 추가)
  const chipBonuses = bonuses.filter(b => b.type === 'chips');
  for (const bonus of chipBonuses) {
    chipTotal += bonus.value;
    appliedBonuses.push(bonus);
  }

  // 4. mult 보너스 적용 (배수에 추가)
  const multBonuses = bonuses.filter(b => b.type === 'mult');
  for (const bonus of multBonuses) {
    multTotal += bonus.value;
    appliedBonuses.push(bonus);
  }

  // 5. xmult 보너스 적용 (배수에 곱하기)
  const xmultBonuses = bonuses.filter(b => b.type === 'xmult');
  for (const bonus of xmultBonuses) {
    multTotal *= bonus.value;
    appliedBonuses.push(bonus);
  }

  // 6. 최종 점수 계산: 칩 총합 × 배수
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
