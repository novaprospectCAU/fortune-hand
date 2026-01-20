/**
 * 릴 컴포넌트 (스핀 애니메이션 포함)
 */

import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SlotSymbol } from '@/types/interfaces';
import type { ReelState } from '../types';
import { Symbol } from './Symbol';
import { getAllSymbols } from '../symbols';

interface ReelProps {
  finalSymbol: SlotSymbol | null;
  state: ReelState;
  delay?: number;
  onStop?: () => void;
}

// 스핀 중 보여줄 심볼들
const ALL_SYMBOLS = getAllSymbols().map((s) => s.id);

function ReelComponent({ finalSymbol, state, delay = 0, onStop }: ReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState<SlotSymbol | null>(null);
  const [spinIndex, setSpinIndex] = useState(0);

  // 스피닝 애니메이션
  useEffect(() => {
    if (state === 'spinning') {
      setDisplaySymbol(null);
      const interval = setInterval(() => {
        setSpinIndex((prev) => (prev + 1) % ALL_SYMBOLS.length);
      }, 80); // 빠른 심볼 변경

      return () => clearInterval(interval);
    }
  }, [state]);

  // 정지 처리
  useEffect(() => {
    if (state === 'stopping') {
      const timeout = setTimeout(() => {
        setDisplaySymbol(finalSymbol);
        onStop?.();
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [state, finalSymbol, delay, onStop]);

  // idle 상태일 때 finalSymbol 표시
  useEffect(() => {
    if (state === 'idle' || state === 'stopped') {
      setDisplaySymbol(finalSymbol);
    }
  }, [state, finalSymbol]);

  const currentSymbol: SlotSymbol | null = state === 'spinning'
    ? (ALL_SYMBOLS[spinIndex] ?? 'card')
    : displaySymbol;

  return (
    <div className="relative w-20 h-20 overflow-hidden rounded-xl bg-slate-900 border-2 border-slate-700 shadow-inner">
      <AnimatePresence mode="wait">
        {state === 'spinning' ? (
          <motion.div
            key={`spinning-${spinIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            <Symbol symbol={currentSymbol} size="lg" />
          </motion.div>
        ) : (
          <motion.div
            key="stopped"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Symbol
              symbol={currentSymbol}
              size="lg"
              isHighlighted={state === 'stopped'}
              animate
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 빛나는 테두리 효과 (정지 시) */}
      {state === 'stopped' && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-yellow-400/50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}

export const Reel = memo(ReelComponent);
