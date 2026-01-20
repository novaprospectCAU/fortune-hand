/**
 * 심볼 데이터 로더 및 확률 계산
 */

import type { SlotSymbol, SlotModifiers } from '@/types/interfaces';
import type { SymbolData, SymbolsJsonData, CombinationData, SingleSymbolEffect } from './types';
import symbolsJson from '@/data/symbols.json';

// 타입 캐스팅으로 JSON 데이터 로드
const data = symbolsJson as SymbolsJsonData;

/**
 * 모든 심볼 데이터 가져오기
 */
export function getAllSymbols(): SymbolData[] {
  return data.symbols;
}

/**
 * 특정 심볼 데이터 가져오기
 */
export function getSymbol(id: SlotSymbol): SymbolData | undefined {
  return data.symbols.find((s) => s.id === id);
}

/**
 * 심볼 ID로 이모지 가져오기
 */
export function getSymbolEmoji(id: SlotSymbol): string {
  const symbol = getSymbol(id);
  return symbol?.emoji ?? '?';
}

/**
 * 심볼 확률 계산
 * modifier가 있으면 가중치 조정
 */
export function getSymbolProbabilities(
  modifiers?: SlotModifiers
): Map<SlotSymbol, number> {
  const symbols = getAllSymbols();
  const weightMap = new Map<SlotSymbol, number>();

  // 기본 가중치 설정
  for (const symbol of symbols) {
    let weight = symbol.weight;

    // modifier로 가중치 조정
    if (modifiers?.symbolWeights && modifiers.symbolWeights[symbol.id] !== undefined) {
      weight = modifiers.symbolWeights[symbol.id]!;
    }

    weightMap.set(symbol.id, weight);
  }

  // 전체 가중치 합계
  let totalWeight = 0;
  for (const weight of weightMap.values()) {
    totalWeight += weight;
  }

  // 확률로 변환 (0-1)
  const probabilityMap = new Map<SlotSymbol, number>();
  for (const [id, weight] of weightMap) {
    probabilityMap.set(id, totalWeight > 0 ? weight / totalWeight : 0);
  }

  return probabilityMap;
}

/**
 * 확률 기반 심볼 선택
 * @param random 0-1 사이의 난수
 * @param modifiers 확률 조정용 modifier
 */
export function selectSymbolByProbability(
  random: number,
  modifiers?: SlotModifiers
): SlotSymbol {
  // 보장된 심볼이 있으면 바로 반환
  if (modifiers?.guaranteedSymbol) {
    return modifiers.guaranteedSymbol;
  }

  const probabilities = getSymbolProbabilities(modifiers);
  let cumulative = 0;

  for (const [symbol, probability] of probabilities) {
    cumulative += probability;
    if (random < cumulative) {
      return symbol;
    }
  }

  // fallback (부동소수점 오차 대비)
  return 'card';
}

/**
 * 조합 데이터 가져오기 (tripleKey로)
 */
export function getCombination(key: string): CombinationData | undefined {
  const combo = data.combinations[key];
  if (!combo) return undefined;

  return {
    symbols: combo.symbols as [SlotSymbol, SlotSymbol, SlotSymbol],
    name: combo.name,
    isJackpot: combo.isJackpot,
    effects: combo.effects,
  };
}

/**
 * 모든 조합 데이터 가져오기
 */
export function getAllCombinations(): CombinationData[] {
  return Object.entries(data.combinations).map(([_, combo]) => ({
    symbols: combo.symbols as [SlotSymbol, SlotSymbol, SlotSymbol],
    name: combo.name,
    isJackpot: combo.isJackpot,
    effects: combo.effects,
  }));
}

/**
 * 단일 심볼 효과 가져오기
 */
export function getSingleSymbolEffect(id: SlotSymbol): SingleSymbolEffect {
  return data.singleEffects[id] ?? {};
}

/**
 * 심볼 배열로 조합 찾기
 * wild 심볼을 고려하여 매칭
 */
export function findCombinationForSymbols(
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol]
): CombinationData | null {
  // wild가 아닌 심볼들 추출
  const nonWildSymbols = symbols.filter((s) => s !== 'wild');

  // 모두 wild인 경우 - star_triple (jackpot) 반환
  if (nonWildSymbols.length === 0) {
    return getCombination('star_triple') ?? null;
  }

  // wild가 있는 경우: 나머지 심볼이 모두 같으면 그 심볼의 triple 조합
  if (symbols.includes('wild')) {
    const uniqueNonWild = [...new Set(nonWildSymbols)];

    // 나머지 심볼이 모두 같은 종류면 triple 조합
    if (uniqueNonWild.length === 1) {
      const baseSymbol = uniqueNonWild[0];
      const tripleKey = `${baseSymbol}_triple`;
      return getCombination(tripleKey) ?? null;
    }

    // 나머지 심볼이 다르면 조합 없음
    return null;
  }

  // wild가 없는 경우: 3개 모두 같은지 체크
  if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
    const tripleKey = `${symbols[0]}_triple`;
    return getCombination(tripleKey) ?? null;
  }

  return null;
}

/**
 * 심볼이 jackpot 조합인지 체크
 */
export function isJackpotCombination(
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol]
): boolean {
  const combination = findCombinationForSymbols(symbols);
  return combination?.isJackpot ?? false;
}
