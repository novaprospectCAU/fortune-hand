/**
 * 슬롯머신 핵심 로직
 */

import type { SlotSymbol, SlotModifiers, SlotResult } from '@/types/interfaces';
import type { RandomGenerator } from './types';
import { selectSymbolByProbability, findCombinationForSymbols } from './symbols';
import { calculateEffects } from './effects';

/**
 * 기본 난수 생성기 (Math.random 사용)
 */
const defaultRandom: RandomGenerator = {
  next: () => Math.random(),
};

/**
 * 시드 기반 난수 생성기 생성
 * Mulberry32 알고리즘 사용 (빠르고 충분한 품질)
 */
export function createSeededRandom(seed: number): RandomGenerator {
  let state = seed;

  return {
    next: () => {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/**
 * 단일 릴에서 심볼 선택
 */
function selectSymbol(
  modifiers?: SlotModifiers,
  random: RandomGenerator = defaultRandom
): SlotSymbol {
  return selectSymbolByProbability(random.next(), modifiers);
}

/**
 * 슬롯 스핀 실행
 * @param modifiers 확률 조정 modifier (조커 효과 등)
 * @param random 난수 생성기 (테스트용 시드 주입 가능)
 */
export function spin(
  modifiers?: SlotModifiers,
  random: RandomGenerator = defaultRandom
): SlotResult {
  // 1. 각 릴에서 심볼 선택
  const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = [
    selectSymbol(modifiers, random),
    selectSymbol(modifiers, random),
    selectSymbol(modifiers, random),
  ];

  // 2. reroll 처리 (modifier에 rerollCount가 있으면)
  if (modifiers?.rerollCount && modifiers.rerollCount > 0) {
    for (let i = 0; i < modifiers.rerollCount; i++) {
      // skull이 있으면 reroll
      const skullIndex = symbols.findIndex((s) => s === 'skull');
      if (skullIndex !== -1) {
        symbols[skullIndex] = selectSymbol(modifiers, random);
      }
    }
  }

  // 3. 조합 판정
  const combination = findCombinationForSymbols(symbols);
  const isJackpot = combination?.isJackpot ?? false;

  // 4. 효과 계산
  const effects = calculateEffects(symbols, combination);

  return {
    symbols,
    isJackpot,
    effects,
  };
}

/**
 * 특정 결과로 스핀 (테스트/디버그용)
 */
export function spinWithResult(
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol]
): SlotResult {
  const combination = findCombinationForSymbols(symbols);
  const isJackpot = combination?.isJackpot ?? false;
  const effects = calculateEffects(symbols, combination);

  return {
    symbols,
    isJackpot,
    effects,
  };
}

/**
 * 잭팟 확률 계산 (정보 표시용)
 */
export function calculateJackpotProbability(modifiers?: SlotModifiers): number {
  // star 3개가 나올 확률
  // wild도 고려해야 하지만 단순화를 위해 star 확률만 계산
  const probabilities = new Map<SlotSymbol, number>();
  const symbols: SlotSymbol[] = ['card', 'target', 'gold', 'chip', 'star', 'skull', 'wild'];

  // 가중치 계산
  const weights: Record<SlotSymbol, number> = {
    card: 25,
    target: 20,
    gold: 20,
    chip: 15,
    star: 5,
    skull: 10,
    wild: 5,
  };

  // modifier 적용
  if (modifiers?.symbolWeights) {
    for (const [symbol, weight] of Object.entries(modifiers.symbolWeights)) {
      if (weight !== undefined) {
        weights[symbol as SlotSymbol] = weight;
      }
    }
  }

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  for (const symbol of symbols) {
    probabilities.set(symbol, weights[symbol] / totalWeight);
  }

  const starProb = probabilities.get('star') ?? 0;
  const wildProb = probabilities.get('wild') ?? 0;

  // star 또는 wild가 3개 나올 확률
  // P(jackpot) = P(star|wild)^3 (단순화된 계산)
  const jackpotSymbolProb = starProb + wildProb;
  return Math.pow(jackpotSymbolProb, 3);
}
