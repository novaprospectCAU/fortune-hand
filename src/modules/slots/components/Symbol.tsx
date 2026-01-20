/**
 * 단일 심볼 렌더링 컴포넌트
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { SlotSymbol } from '@/types/interfaces';
import { getSymbolEmoji, getSymbol } from '../symbols';

interface SymbolProps {
  symbol: SlotSymbol | null;
  size?: 'sm' | 'md' | 'lg';
  isHighlighted?: boolean;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-2xl',
  md: 'w-16 h-16 text-4xl',
  lg: 'w-20 h-20 text-5xl',
} as const;

function SymbolComponent({ symbol, size = 'md', isHighlighted = false, animate = false }: SymbolProps) {
  if (symbol === null) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center bg-slate-800 rounded-lg border-2 border-slate-700`}
      >
        <span className="text-slate-600">?</span>
      </div>
    );
  }

  const emoji = getSymbolEmoji(symbol);
  const symbolData = getSymbol(symbol);

  const baseClasses = `${sizeClasses[size]} flex items-center justify-center rounded-lg border-2 transition-all duration-200`;

  const highlightClasses = isHighlighted
    ? 'border-yellow-400 bg-yellow-900/30 shadow-lg shadow-yellow-400/20'
    : 'border-slate-600 bg-slate-800';

  // 특수 심볼 스타일
  const symbolStyles: Record<SlotSymbol, string> = {
    card: 'hover:border-blue-400',
    target: 'hover:border-orange-400',
    gold: 'hover:border-yellow-400',
    chip: 'hover:border-green-400',
    star: 'hover:border-purple-400',
    skull: 'hover:border-red-400',
    wild: 'hover:border-pink-400',
  };

  if (animate) {
    return (
      <motion.div
        className={`${baseClasses} ${highlightClasses} ${symbolStyles[symbol]}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        title={symbolData?.description}
      >
        <span role="img" aria-label={symbolData?.name ?? symbol}>
          {emoji}
        </span>
      </motion.div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${highlightClasses} ${symbolStyles[symbol]}`}
      title={symbolData?.description}
    >
      <span role="img" aria-label={symbolData?.name ?? symbol}>
        {emoji}
      </span>
    </div>
  );
}

export const Symbol = memo(SymbolComponent);
