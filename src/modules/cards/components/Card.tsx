/**
 * Card Component - 개별 카드 UI
 * 카드의 시각적 표현과 상호작용 담당
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Card as CardType } from '@/types/interfaces';
import { isSpecialCard } from '../specialCards';

/**
 * 무늬별 기호 매핑
 */
const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '\u2665', // ♥
  diamonds: '\u2666', // ♦
  clubs: '\u2663', // ♣
  spades: '\u2660', // ♠
};

/**
 * 무늬별 색상 (빨강/검정)
 */
const SUIT_COLORS: Record<string, string> = {
  hearts: '#ef4444',
  diamonds: '#ef4444',
  clubs: '#1f2937',
  spades: '#1f2937',
};

/**
 * 특수 카드 테두리 색상
 */
const SPECIAL_BORDER_COLORS = {
  wild: '#a855f7', // 보라
  gold: '#f59e0b', // 골드
  slot: '#22c55e', // 초록
  roulette: '#3b82f6', // 파랑
};

/**
 * 강화 배경 색상
 */
const ENHANCEMENT_BG_COLORS: Record<string, string> = {
  mult: 'rgba(239, 68, 68, 0.1)', // 빨강 투명
  chips: 'rgba(59, 130, 246, 0.1)', // 파랑 투명
  gold: 'rgba(245, 158, 11, 0.1)', // 골드 투명
  retrigger: 'rgba(168, 85, 247, 0.1)', // 보라 투명
};

export interface CardProps {
  card: CardType;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 카드 크기별 스타일 (모바일 반응형)
 */
const SIZE_STYLES = {
  sm: {
    width: 'w-12 sm:w-14',
    height: 'h-16 sm:h-20',
    fontSize: 'text-xs sm:text-sm',
    rankSize: 'text-base sm:text-lg',
  },
  md: {
    width: 'w-16 sm:w-20',
    height: 'h-24 sm:h-28',
    fontSize: 'text-sm sm:text-base',
    rankSize: 'text-lg sm:text-xl',
  },
  lg: {
    width: 'w-20 sm:w-24 md:w-28',
    height: 'h-28 sm:h-36 md:h-40',
    fontSize: 'text-base sm:text-lg',
    rankSize: 'text-xl sm:text-2xl md:text-3xl',
  },
};

/**
 * 카드 특수 속성에 따른 테두리 색상 결정
 */
function getSpecialBorderColor(card: CardType): string | undefined {
  if (card.isWild) return SPECIAL_BORDER_COLORS.wild;
  if (card.isGold) return SPECIAL_BORDER_COLORS.gold;
  if (card.triggerSlot) return SPECIAL_BORDER_COLORS.slot;
  if (card.triggerRoulette) return SPECIAL_BORDER_COLORS.roulette;
  return undefined;
}

/**
 * Card 컴포넌트
 * 개별 카드의 시각적 표현과 상호작용 처리
 */
function CardComponent({
  card,
  selected = false,
  onClick,
  disabled = false,
  faceDown = false,
  size = 'md',
}: CardProps) {
  const sizeStyle = SIZE_STYLES[size];
  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const specialBorder = getSpecialBorderColor(card);
  const enhancementBg = card.enhancement
    ? ENHANCEMENT_BG_COLORS[card.enhancement.type]
    : undefined;

  // 카드 뒷면
  if (faceDown) {
    return (
      <motion.div
        className={`${sizeStyle.width} ${sizeStyle.height} rounded-lg cursor-pointer
          bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-blue-600
          flex items-center justify-center shadow-md`}
        whileHover={!disabled ? { scale: 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        onClick={!disabled ? onClick : undefined}
      >
        <div className="w-3/4 h-3/4 rounded border border-blue-500 bg-blue-700/50" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        ${sizeStyle.width} ${sizeStyle.height} rounded-lg
        bg-white border-2 shadow-md
        flex flex-col relative
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${selected ? 'ring-2 ring-yellow-400 ring-offset-1 sm:ring-offset-2' : ''}
        touch-manipulation select-none
      `}
      style={{
        borderColor: specialBorder || '#d1d5db',
        backgroundColor: enhancementBg || 'white',
      }}
      initial={false}
      animate={{
        y: selected ? -8 : 0,
        boxShadow: selected
          ? '0 8px 25px rgba(0, 0, 0, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={!disabled ? onClick : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* 왼쪽 상단 랭크/무늬 */}
      <div
        className={`absolute top-1 left-1 ${sizeStyle.fontSize} font-bold leading-none`}
        style={{ color: suitColor }}
      >
        <div>{card.rank}</div>
        <div className="text-center">{suitSymbol}</div>
      </div>

      {/* 중앙 무늬 */}
      <div
        className={`flex-1 flex items-center justify-center ${sizeStyle.rankSize}`}
        style={{ color: suitColor }}
      >
        {suitSymbol}
      </div>

      {/* 오른쪽 하단 랭크/무늬 (뒤집힌) */}
      <div
        className={`absolute bottom-1 right-1 ${sizeStyle.fontSize} font-bold leading-none rotate-180`}
        style={{ color: suitColor }}
      >
        <div>{card.rank}</div>
        <div className="text-center">{suitSymbol}</div>
      </div>

      {/* 특수 카드 표시 */}
      {isSpecialCard(card) && (
        <div className="absolute top-1 right-1 text-xs">
          {card.isWild && <span title="Wild">W</span>}
          {card.isGold && <span title="Gold">G</span>}
          {card.triggerSlot && <span title="Slot">S</span>}
          {card.triggerRoulette && <span title="Roulette">R</span>}
        </div>
      )}

      {/* 강화 표시 */}
      {card.enhancement && (
        <div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-1 rounded"
          style={{
            backgroundColor:
              card.enhancement.type === 'mult'
                ? '#ef4444'
                : card.enhancement.type === 'chips'
                  ? '#3b82f6'
                  : card.enhancement.type === 'gold'
                    ? '#f59e0b'
                    : '#a855f7',
            color: 'white',
          }}
        >
          +{card.enhancement.value}
        </div>
      )}
    </motion.div>
  );
}

export const Card = memo(CardComponent);
