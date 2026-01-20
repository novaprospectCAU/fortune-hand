/**
 * Slots 모듈 내부 타입 정의
 * 외부 공개 타입은 @/types/interfaces.ts 사용
 */

import type { SlotSymbol, SlotEffects } from '@/types/interfaces';

/**
 * 심볼 데이터 (JSON에서 로드)
 */
export interface SymbolData {
  id: SlotSymbol;
  emoji: string;
  name: string;
  description: string;
  weight: number;
}

/**
 * 심볼 조합 정의
 */
export interface CombinationData {
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol];
  name: string;
  isJackpot?: boolean;
  effects: SlotEffects;
}

/**
 * 단일 심볼 효과 (부분적)
 */
export interface SingleSymbolEffect {
  cardBonus?: Partial<SlotEffects['cardBonus']>;
  rouletteBonus?: Partial<SlotEffects['rouletteBonus']>;
  instant?: Partial<SlotEffects['instant']>;
  penalty?: Partial<SlotEffects['penalty']>;
}

/**
 * symbols.json 파일 구조
 */
export interface SymbolsJsonData {
  symbols: SymbolData[];
  combinations: Record<string, Omit<CombinationData, 'symbols'> & { symbols: SlotSymbol[] }>;
  singleEffects: Record<SlotSymbol, SingleSymbolEffect>;
}

/**
 * 릴 상태 (애니메이션용)
 */
export type ReelState = 'idle' | 'spinning' | 'stopping' | 'stopped';

/**
 * 슬롯머신 상태 (UI용)
 */
export interface SlotMachineState {
  reels: [ReelState, ReelState, ReelState];
  currentSymbols: [SlotSymbol | null, SlotSymbol | null, SlotSymbol | null];
  isSpinning: boolean;
}

/**
 * 시드 기반 난수 생성기 인터페이스
 */
export interface RandomGenerator {
  next(): number; // 0-1 사이 값 반환
}
