/**
 * 점수 계산 모듈
 *
 * 핸드 결과와 보너스를 받아 최종 점수를 계산합니다.
 * 보너스 적용 순서: chips -> mult -> xmult
 */

import type { AppliedBonus, Card, HandResult, ScoreCalculation } from '@/types/interfaces';
import { CARD_CHIP_VALUES } from './handRanks';

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
 * 핸드 결과와 보너스를 받아 최종 점수를 계산합니다.
 *
 * 점수 계산 순서:
 * 1. 기본 chips = 핸드 타입 기본 칩 + 카드 칩 합계
 * 2. 기본 mult = 핸드 타입 기본 배수
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
  // 1. 기본 칩 계산: 핸드 타입 기본값 + 카드 칩 합계
  const cardChips = calculateCardChips(handResult.scoringCards);
  let chipTotal = handResult.baseChips + cardChips;

  // 2. 기본 배수
  let multTotal = handResult.baseMult;

  // 카드 강화 보너스 (mult 타입) 적용
  for (const card of handResult.scoringCards) {
    if (card.enhancement?.type === 'mult') {
      multTotal += card.enhancement.value;
    }
  }

  // 적용된 보너스 추적 (카드 칩은 별도로 추적)
  const appliedBonuses: AppliedBonus[] = [];

  // 카드 칩을 보너스로 기록 (투명성을 위해)
  if (cardChips > 0) {
    appliedBonuses.push({
      source: 'Card chips',
      type: 'chips',
      value: cardChips,
    });
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
