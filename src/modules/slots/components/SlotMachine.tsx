/**
 * 슬롯머신 전체 UI 컴포넌트
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SlotSymbol, SlotModifiers, SlotResult } from '@/types/interfaces';
import type { ReelState } from '../types';
import { Reel } from './Reel';
import { spin as spinSlot } from '../slotMachine';
import { summarizeEffects, isPositiveEffect } from '../effects';
import { findCombinationForSymbols } from '../symbols';

interface SlotMachineProps {
  onSpinComplete: (result: SlotResult) => void;
  modifiers?: SlotModifiers;
  disabled?: boolean;
  autoSpin?: boolean;
}

// 각 릴의 정지 딜레이 (ms)
const REEL_STOP_DELAYS = [500, 800, 1100];
const SPIN_DURATION = 1500;

export function SlotMachine({
  onSpinComplete,
  modifiers,
  disabled = false,
  // Reserved for future game loop integration
  autoSpin: _autoSpin = false,
}: SlotMachineProps) {
  const [reelStates, setReelStates] = useState<[ReelState, ReelState, ReelState]>([
    'idle',
    'idle',
    'idle',
  ]);
  const [currentResult, setCurrentResult] = useState<SlotResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  const handleSpin = useCallback(() => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    setShowEffects(false);

    // 1. 결과 미리 계산
    const result = spinSlot(modifiers);
    setCurrentResult(result);

    // 2. 모든 릴 스피닝 시작
    setReelStates(['spinning', 'spinning', 'spinning']);

    // 3. 일정 시간 후 순차적으로 정지
    setTimeout(() => {
      setReelStates(['stopping', 'spinning', 'spinning']);
    }, REEL_STOP_DELAYS[0]);

    setTimeout(() => {
      setReelStates(['stopped', 'stopping', 'spinning']);
    }, REEL_STOP_DELAYS[1]);

    setTimeout(() => {
      setReelStates(['stopped', 'stopped', 'stopping']);
    }, REEL_STOP_DELAYS[2]);

    // 4. 모든 릴 정지 후 결과 처리
    setTimeout(() => {
      setReelStates(['stopped', 'stopped', 'stopped']);
      setIsSpinning(false);
      setShowEffects(true);
      onSpinComplete(result);
    }, SPIN_DURATION);
  }, [isSpinning, disabled, modifiers, onSpinComplete]);

  // 자동 스핀 (게임 루프용)
  // useEffect(() => {
  //   if (autoSpin && !isSpinning && !disabled) {
  //     handleSpin();
  //   }
  // }, [autoSpin, isSpinning, disabled, handleSpin]);

  const symbols: [SlotSymbol | null, SlotSymbol | null, SlotSymbol | null] = currentResult
    ? currentResult.symbols
    : [null, null, null];

  const combination = currentResult
    ? findCombinationForSymbols(currentResult.symbols)
    : null;

  const effectSummary = currentResult ? summarizeEffects(currentResult.effects) : [];
  const isPositive = currentResult ? isPositiveEffect(currentResult.effects) : true;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md mx-auto px-2">
      {/* 슬롯 머신 본체 */}
      <div className="relative w-full">
        {/* 배경 프레임 - 모바일에서는 크기 축소 */}
        <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-b from-amber-900 to-amber-950 rounded-xl sm:rounded-2xl shadow-2xl" />
        <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg sm:rounded-xl" />

        {/* 릴 컨테이너 */}
        <div className="relative flex justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-950 rounded-lg border-2 sm:border-4 border-amber-700">
          {/* 장식 볼트 - 모바일에서는 작게 */}
          <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-amber-600 rounded-full border border-amber-400 sm:border-2" />
          <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-amber-600 rounded-full border border-amber-400 sm:border-2" />
          <div className="absolute -bottom-1 sm:-bottom-2 -left-1 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-amber-600 rounded-full border border-amber-400 sm:border-2" />
          <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-amber-600 rounded-full border border-amber-400 sm:border-2" />

          {/* 릴 */}
          <Reel finalSymbol={symbols[0]} state={reelStates[0]} delay={100} />
          <Reel finalSymbol={symbols[1]} state={reelStates[1]} delay={100} />
          <Reel finalSymbol={symbols[2]} state={reelStates[2]} delay={100} />
        </div>

        {/* 잭팟 표시 */}
        <AnimatePresence>
          {currentResult?.isJackpot && showEffects && (
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2"
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <div className="px-4 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full text-black font-bold text-sm shadow-lg">
                JACKPOT!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 조합 이름 표시 */}
      <AnimatePresence>
        {combination && showEffects && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center px-2"
          >
            <span
              className={`text-base sm:text-lg font-bold ${
                currentResult?.isJackpot ? 'text-yellow-400' : 'text-slate-300'
              }`}
            >
              {combination.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 효과 표시 */}
      <AnimatePresence>
        {showEffects && effectSummary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-full px-2"
          >
            {effectSummary.map((effect, index) => (
              <motion.span
                key={effect}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isPositive
                    ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
                    : 'bg-red-900/50 text-red-400 border border-red-700'
                }`}
              >
                {effect}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 스핀 버튼 - 터치 친화적 */}
      <motion.button
        onClick={handleSpin}
        disabled={isSpinning || disabled}
        className={`
          px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-bold
          text-base sm:text-lg uppercase tracking-wider
          transition-all duration-200 shadow-lg
          min-h-[48px] touch-manipulation w-full max-w-xs
          ${
            isSpinning || disabled
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-b from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600 active:from-red-600 active:to-red-800'
          }
        `}
        whileHover={!isSpinning && !disabled ? { scale: 1.02 } : undefined}
        whileTap={!isSpinning && !disabled ? { scale: 0.98 } : undefined}
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </motion.button>
    </div>
  );
}
