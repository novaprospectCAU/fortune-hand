/**
 * CardStack Component - 덱/버린 카드 더미 UI
 * 카드 더미를 시각적으로 표시
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

export interface CardStackProps {
  count: number;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'deck' | 'discard';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

/**
 * 스택 크기별 스타일
 */
const SIZE_STYLES = {
  sm: {
    width: 'w-14',
    height: 'h-20',
    fontSize: 'text-sm',
    countSize: 'text-lg',
  },
  md: {
    width: 'w-20',
    height: 'h-28',
    fontSize: 'text-base',
    countSize: 'text-xl',
  },
  lg: {
    width: 'w-28',
    height: 'h-40',
    fontSize: 'text-lg',
    countSize: 'text-2xl',
  },
};

/**
 * 변형별 스타일
 */
const VARIANT_STYLES = {
  deck: {
    bg: 'bg-gradient-to-br from-blue-800 to-blue-900',
    border: 'border-blue-600',
    shadow: 'shadow-blue-900/30',
  },
  discard: {
    bg: 'bg-gradient-to-br from-gray-700 to-gray-800',
    border: 'border-gray-600',
    shadow: 'shadow-gray-900/30',
  },
};

/**
 * CardStack 컴포넌트
 * 덱 또는 버린 카드 더미 표시
 */
function CardStackComponent({
  count,
  label,
  onClick,
  disabled = false,
  variant = 'deck',
  size = 'md',
  showCount = true,
}: CardStackProps) {
  const sizeStyle = SIZE_STYLES[size];
  const variantStyle = VARIANT_STYLES[variant];

  // 스택 층 수 계산 (최대 5층)
  const layers = Math.min(Math.ceil(count / 10), 5);

  // 빈 덱 표시
  if (count === 0) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`
            ${sizeStyle.width} ${sizeStyle.height} rounded-lg
            border-2 border-dashed border-gray-400
            flex items-center justify-center
            bg-gray-100
          `}
        >
          <span className="text-gray-400 text-sm">Empty</span>
        </div>
        {label && (
          <span className={`${sizeStyle.fontSize} text-gray-500 mt-1`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative cursor-pointer"
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        onClick={!disabled && onClick ? onClick : undefined}
      >
        {/* 스택 층들 (아래 카드들) */}
        {Array.from({ length: layers }).map((_, i) => (
          <div
            key={i}
            className={`
              ${sizeStyle.width} ${sizeStyle.height} rounded-lg
              ${variantStyle.bg} border-2 ${variantStyle.border}
              ${i === layers - 1 ? '' : 'absolute'}
              shadow-lg ${variantStyle.shadow}
            `}
            style={{
              top: i * -2,
              left: i * 1,
              zIndex: i,
            }}
          />
        ))}

        {/* 맨 위 카드 (카운트 표시) */}
        <div
          className={`
            ${sizeStyle.width} ${sizeStyle.height} rounded-lg
            ${variantStyle.bg} border-2 ${variantStyle.border}
            flex items-center justify-center
            shadow-lg ${variantStyle.shadow}
            absolute top-0 left-0
          `}
          style={{
            top: (layers - 1) * -2,
            left: (layers - 1) * 1,
            zIndex: layers,
          }}
        >
          {showCount && (
            <span
              className={`${sizeStyle.countSize} font-bold text-white drop-shadow-md`}
            >
              {count}
            </span>
          )}

          {/* 덱 패턴 */}
          <div className="absolute inset-2 rounded border border-white/20" />
        </div>
      </motion.div>

      {/* 라벨 */}
      {label && (
        <span className={`${sizeStyle.fontSize} text-gray-600 mt-2 font-medium`}>
          {label}
        </span>
      )}
    </div>
  );
}

export const CardStack = memo(CardStackComponent);

/**
 * 덱과 버린 카드 더미를 함께 표시하는 컴포넌트
 */
export interface DeckDisplayProps {
  deckCount: number;
  discardCount: number;
  onDeckClick?: () => void;
  onDiscardClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function DeckDisplay({
  deckCount,
  discardCount,
  onDeckClick,
  onDiscardClick,
  size = 'md',
}: DeckDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      <CardStack
        count={deckCount}
        label="Deck"
        variant="deck"
        onClick={onDeckClick}
        size={size}
      />
      <CardStack
        count={discardCount}
        label="Discard"
        variant="discard"
        onClick={onDiscardClick}
        size={size}
      />
    </div>
  );
}
