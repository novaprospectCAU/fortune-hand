/**
 * Slots 모듈 Public API
 *
 * 외부에서는 이 파일을 통해서만 slots 모듈에 접근
 */

// 핵심 함수
export { spin, spinWithResult, createSeededRandom, calculateJackpotProbability } from './slotMachine';
export { getSymbolProbabilities, getSymbolEmoji, getAllSymbols, getSymbol } from './symbols';
export { calculateEffects, summarizeEffects, isPositiveEffect, createDefaultEffects } from './effects';

// UI 컴포넌트
export { SlotMachine, Symbol, Reel } from './components';

// 내부 타입 (필요한 경우만 export)
export type { SymbolData, ReelState, SlotMachineState, RandomGenerator } from './types';
