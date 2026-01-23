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
  glass: '#06b6d4', // 시안
  slot: '#22c55e', // 초록
  roulette: '#3b82f6', // 파랑
};

/**
 * 강화 배경 그라데이션 (더 눈에 띄게)
 */
const ENHANCEMENT_GRADIENTS: Record<string, string> = {
  mult: 'linear-gradient(135deg, #fff 0%, #fecaca 50%, #fca5a5 100%)', // 빨강 그라데이션
  chips: 'linear-gradient(135deg, #fff 0%, #bfdbfe 50%, #93c5fd 100%)', // 파랑 그라데이션
  gold: 'linear-gradient(135deg, #fff 0%, #fef08a 50%, #fde047 100%)', // 골드 그라데이션
  retrigger: 'linear-gradient(135deg, #fff 0%, #e9d5ff 50%, #d8b4fe 100%)', // 보라 그라데이션
};

/**
 * 특수 카드 글로우 효과
 */
const SPECIAL_GLOW_SHADOWS: Record<string, string> = {
  wild: '0 0 12px rgba(168, 85, 247, 0.6), inset 0 0 8px rgba(168, 85, 247, 0.1)', // 보라 글로우
  gold: '0 0 12px rgba(245, 158, 11, 0.6), inset 0 0 8px rgba(245, 158, 11, 0.1)', // 골드 글로우
  glass: '0 0 15px rgba(6, 182, 212, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3)', // 시안 글로우 + 투명 효과
  slot: '0 0 12px rgba(34, 197, 94, 0.6), inset 0 0 8px rgba(34, 197, 94, 0.1)', // 초록 글로우
  roulette: '0 0 12px rgba(59, 130, 246, 0.6), inset 0 0 8px rgba(59, 130, 246, 0.1)', // 파랑 글로우
};

/**
 * 특수 카드 배경색
 */
const SPECIAL_BACKGROUNDS: Record<string, string> = {
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(6,182,212,0.2) 50%, rgba(255,255,255,0.8) 100%)',
  gold: 'linear-gradient(135deg, #fff 0%, #fef3c7 50%, #fde68a 100%)',
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
 * 카드 크기별 스타일 (모바일 반응형 - 더 큰 카드)
 */
const SIZE_STYLES = {
  sm: {
    width: 'w-16 sm:w-18',
    height: 'h-24 sm:h-26',
    fontSize: 'text-sm sm:text-base',
    rankSize: 'text-lg sm:text-xl',
  },
  md: {
    width: 'w-20 sm:w-24',
    height: 'h-28 sm:h-34',
    fontSize: 'text-base sm:text-lg',
    rankSize: 'text-2xl sm:text-2xl',
  },
  lg: {
    width: 'w-28 sm:w-32 md:w-36',
    height: 'h-40 sm:h-44 md:h-52',
    fontSize: 'text-lg sm:text-xl',
    rankSize: 'text-3xl sm:text-3xl md:text-4xl',
  },
};

/**
 * 카드 특수 속성에 따른 테두리 색상 결정
 */
function getSpecialBorderColor(card: CardType): string | undefined {
  if (card.isGlass) return SPECIAL_BORDER_COLORS.glass;
  if (card.isWild) return SPECIAL_BORDER_COLORS.wild;
  if (card.isGold) return SPECIAL_BORDER_COLORS.gold;
  if (card.triggerSlot) return SPECIAL_BORDER_COLORS.slot;
  if (card.triggerRoulette) return SPECIAL_BORDER_COLORS.roulette;
  return undefined;
}

/**
 * 특수 카드 글로우 효과 결정
 */
function getSpecialGlow(card: CardType): string | undefined {
  if (card.isGlass) return SPECIAL_GLOW_SHADOWS.glass;
  if (card.isWild) return SPECIAL_GLOW_SHADOWS.wild;
  if (card.isGold) return SPECIAL_GLOW_SHADOWS.gold;
  if (card.triggerSlot) return SPECIAL_GLOW_SHADOWS.slot;
  if (card.triggerRoulette) return SPECIAL_GLOW_SHADOWS.roulette;
  return undefined;
}

/**
 * 특수 카드 배경색 결정
 */
function getSpecialBackground(card: CardType): string | undefined {
  if (card.isGlass) return SPECIAL_BACKGROUNDS.glass;
  if (card.isGold) return SPECIAL_BACKGROUNDS.gold;
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
  const suitColor = card.isGlass ? '#0891b2' : SUIT_COLORS[card.suit];
  const suitSymbol = card.isGlass ? '◇' : SUIT_SYMBOLS[card.suit];
  const specialBorder = getSpecialBorderColor(card);
  const specialGlow = getSpecialGlow(card);
  const specialBackground = getSpecialBackground(card);
  const enhancementGradient = card.enhancement
    ? ENHANCEMENT_GRADIENTS[card.enhancement.type]
    : undefined;
  const hasSpecialEffect = specialBorder || enhancementGradient || specialBackground;

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

  // 특수 효과가 있는 카드는 테두리를 두껍게
  const borderWidth = hasSpecialEffect ? 3 : 2;

  return (
    <motion.div
      className={`
        ${sizeStyle.width} ${sizeStyle.height} rounded-lg
        bg-white shadow-md
        flex flex-col relative
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        touch-manipulation select-none
      `}
      style={{
        borderWidth: selected ? '3px' : `${borderWidth}px`,
        borderStyle: 'solid',
        borderColor: selected ? '#facc15' : (specialBorder || '#d1d5db'),
        background: specialBackground || enhancementGradient || 'white',
        outline: selected ? '2px solid #facc15' : 'none',
        outlineOffset: '1px',
      }}
      initial={false}
      animate={{
        boxShadow: selected
          ? `0 8px 25px rgba(0, 0, 0, 0.2)${specialGlow ? `, ${specialGlow}` : ''}`
          : specialGlow || '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={!disabled ? onClick : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
          {card.isGlass && <span title="Glass">💎</span>}
          {card.isWild && <span title="Wild">🌟</span>}
          {card.isGold && <span title="Gold">💰</span>}
          {card.triggerSlot && <span title="Slot">🎰</span>}
          {card.triggerRoulette && <span title="Roulette">🎯</span>}
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

export const Card = memo(CardComponent, (prev, next) => {
  // Custom comparison: ignore onClick reference changes
  return (
    prev.card === next.card &&
    prev.selected === next.selected &&
    prev.disabled === next.disabled &&
    prev.faceDown === next.faceDown &&
    prev.size === next.size
  );
});
