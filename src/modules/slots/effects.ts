/**
 * 심볼 조합 → SlotEffects 변환
 */

import type { SlotSymbol, SlotEffects } from '@/types/interfaces';
import type { CombinationData } from './types';
import { getSingleSymbolEffect } from './symbols';

/**
 * 기본 SlotEffects 생성 (모든 값 0/false)
 */
export function createDefaultEffects(): SlotEffects {
  return {
    cardBonus: {
      extraDraw: 0,
      handSize: 0,
      scoreMultiplier: 1,
    },
    rouletteBonus: {
      safeZoneBonus: 0,
      maxMultiplier: 0,
      freeSpins: 0,
    },
    instant: {
      gold: 0,
      chips: 0,
    },
    penalty: {
      discardCards: 0,
      skipRoulette: false,
      loseGold: 0,
    },
  };
}

/**
 * 두 SlotEffects 병합 (값 합산)
 */
export function mergeEffects(base: SlotEffects, addition: Partial<SlotEffects>): SlotEffects {
  return {
    cardBonus: {
      extraDraw: base.cardBonus.extraDraw + (addition.cardBonus?.extraDraw ?? 0),
      handSize: base.cardBonus.handSize + (addition.cardBonus?.handSize ?? 0),
      scoreMultiplier: base.cardBonus.scoreMultiplier * (addition.cardBonus?.scoreMultiplier ?? 1),
    },
    rouletteBonus: {
      safeZoneBonus: base.rouletteBonus.safeZoneBonus + (addition.rouletteBonus?.safeZoneBonus ?? 0),
      maxMultiplier: base.rouletteBonus.maxMultiplier + (addition.rouletteBonus?.maxMultiplier ?? 0),
      freeSpins: base.rouletteBonus.freeSpins + (addition.rouletteBonus?.freeSpins ?? 0),
    },
    instant: {
      gold: base.instant.gold + (addition.instant?.gold ?? 0),
      chips: base.instant.chips + (addition.instant?.chips ?? 0),
    },
    penalty: {
      discardCards: base.penalty.discardCards + (addition.penalty?.discardCards ?? 0),
      skipRoulette: base.penalty.skipRoulette || (addition.penalty?.skipRoulette ?? false),
      loseGold: base.penalty.loseGold + (addition.penalty?.loseGold ?? 0),
    },
  };
}

/**
 * 단일 심볼 효과를 SlotEffects로 변환
 */
function singleSymbolToEffects(symbol: SlotSymbol): Partial<SlotEffects> {
  const effect = getSingleSymbolEffect(symbol);

  const result: Partial<SlotEffects> = {};

  if (effect.cardBonus) {
    result.cardBonus = {
      extraDraw: effect.cardBonus.extraDraw ?? 0,
      handSize: effect.cardBonus.handSize ?? 0,
      scoreMultiplier: effect.cardBonus.scoreMultiplier ?? 1,
    };
  }

  if (effect.rouletteBonus) {
    result.rouletteBonus = {
      safeZoneBonus: effect.rouletteBonus.safeZoneBonus ?? 0,
      maxMultiplier: effect.rouletteBonus.maxMultiplier ?? 0,
      freeSpins: effect.rouletteBonus.freeSpins ?? 0,
    };
  }

  if (effect.instant) {
    result.instant = {
      gold: effect.instant.gold ?? 0,
      chips: effect.instant.chips ?? 0,
    };
  }

  if (effect.penalty) {
    result.penalty = {
      discardCards: effect.penalty.discardCards ?? 0,
      skipRoulette: effect.penalty.skipRoulette ?? false,
      loseGold: effect.penalty.loseGold ?? 0,
    };
  }

  return result;
}

/**
 * 심볼 배열로 효과 계산
 * 조합이 있으면 조합 효과, 없으면 개별 심볼 효과 합산
 */
export function calculateEffects(
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol],
  combination: CombinationData | null
): SlotEffects {
  // 조합이 있으면 조합 효과 반환
  if (combination) {
    return { ...combination.effects };
  }

  // 조합이 없으면 개별 심볼 효과 합산
  let effects = createDefaultEffects();

  for (const symbol of symbols) {
    // wild는 개별 효과 없음
    if (symbol === 'wild') continue;

    const symbolEffect = singleSymbolToEffects(symbol);
    effects = mergeEffects(effects, symbolEffect);
  }

  return effects;
}

/**
 * 효과가 긍정적인지 부정적인지 판단
 */
export function isPositiveEffect(effects: SlotEffects): boolean {
  // 긍정적 효과 체크
  const hasPositive =
    effects.cardBonus.extraDraw > 0 ||
    effects.cardBonus.handSize > 0 ||
    effects.cardBonus.scoreMultiplier > 1 ||
    effects.rouletteBonus.safeZoneBonus > 0 ||
    effects.rouletteBonus.maxMultiplier > 0 ||
    effects.rouletteBonus.freeSpins > 0 ||
    effects.instant.gold > 0 ||
    effects.instant.chips > 0;

  // 부정적 효과 체크
  const hasNegative =
    effects.penalty.discardCards > 0 ||
    effects.penalty.skipRoulette ||
    effects.penalty.loseGold > 0;

  // 긍정적 효과만 있거나, 둘 다 없으면 긍정
  return hasPositive && !hasNegative;
}

/**
 * 효과 요약 문자열 생성
 */
export function summarizeEffects(effects: SlotEffects): string[] {
  const summary: string[] = [];

  // Card bonuses
  if (effects.cardBonus.extraDraw > 0) {
    summary.push(`+${effects.cardBonus.extraDraw} Extra Draw`);
  }
  if (effects.cardBonus.handSize > 0) {
    summary.push(`+${effects.cardBonus.handSize} Hand Size`);
  }
  if (effects.cardBonus.scoreMultiplier > 1) {
    summary.push(`x${effects.cardBonus.scoreMultiplier} Score Multiplier`);
  }

  // Roulette bonuses
  if (effects.rouletteBonus.safeZoneBonus > 0) {
    summary.push(`+${effects.rouletteBonus.safeZoneBonus}% Safe Zone`);
  }
  if (effects.rouletteBonus.maxMultiplier > 0) {
    summary.push(`+${effects.rouletteBonus.maxMultiplier}x Max Multiplier`);
  }
  if (effects.rouletteBonus.freeSpins > 0) {
    summary.push(`+${effects.rouletteBonus.freeSpins} Free Spins`);
  }

  // Instant rewards
  if (effects.instant.gold > 0) {
    summary.push(`+${effects.instant.gold} Gold`);
  }
  if (effects.instant.chips > 0) {
    summary.push(`+${effects.instant.chips} Chips`);
  }

  // Penalties
  if (effects.penalty.discardCards > 0) {
    summary.push(`-${effects.penalty.discardCards} Cards (Discard)`);
  }
  if (effects.penalty.skipRoulette) {
    summary.push('Skip Roulette');
  }
  if (effects.penalty.loseGold > 0) {
    summary.push(`-${effects.penalty.loseGold} Gold`);
  }

  return summary;
}
