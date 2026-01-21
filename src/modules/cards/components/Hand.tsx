/**
 * Hand Component - 플레이어 손패 UI
 * 여러 카드를 손패 형태로 배치하고 선택 관리
 */

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card as CardType } from '@/types/interfaces';
import { Card } from './Card';

export interface HandProps {
  cards: CardType[];
  selectedIds: string[];
  onCardClick: (cardId: string) => void;
  onCardHover?: (card: CardType | null) => void;
  maxSelect?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 카드 겹침 정도 (음수 마진) - 모바일에서는 더 많이 겹침
 */
const OVERLAP_STYLES = {
  sm: '-ml-6 sm:-ml-4',
  md: '-ml-8 sm:-ml-6',
  lg: '-ml-10 sm:-ml-8',
};

/**
 * 손패 컨테이너 패딩
 */
const CONTAINER_PADDING = {
  sm: 'pl-6 sm:pl-4',
  md: 'pl-8 sm:pl-6',
  lg: 'pl-10 sm:pl-8',
};

/**
 * Hand 컴포넌트
 * 플레이어의 손패를 부채꼴 형태로 표시
 */
function HandComponent({
  cards,
  selectedIds,
  onCardClick,
  onCardHover,
  maxSelect = 5,
  disabled = false,
  size = 'md',
}: HandProps) {
  const selectedSet = new Set(selectedIds);
  const isMaxSelected = selectedIds.length >= maxSelect;

  const handleCardClick = useCallback(
    (cardId: string) => {
      const isSelected = selectedSet.has(cardId);

      // 이미 선택된 카드는 항상 선택 해제 가능
      if (isSelected) {
        onCardClick(cardId);
        return;
      }

      // 최대 선택 수에 도달하면 새 카드 선택 불가
      if (isMaxSelected) {
        return;
      }

      onCardClick(cardId);
    },
    [selectedSet, isMaxSelected, onCardClick]
  );

  // 카드 각도 계산 (부채꼴 배치) - 모바일에서는 각도 감소
  const getCardRotation = (index: number, total: number): number => {
    if (total <= 1) return 0;
    // 모바일에서는 더 평평하게
    const maxAngle = Math.min(total * 2.5, 15); // 최대 15도 (기존 20도)
    const step = maxAngle / (total - 1);
    return -maxAngle / 2 + step * index;
  };

  // 카드 Y 오프셋 계산 (아치 형태) - 모바일에서는 더 평평하게
  const getCardYOffset = (index: number, total: number): number => {
    if (total <= 1) return 0;
    const middle = (total - 1) / 2;
    const distance = Math.abs(index - middle);
    // 모바일에서는 아치 효과 감소
    return distance * distance * 1.5; // 기존 2에서 1.5로 감소
  };

  return (
    <div
      className={`flex items-end justify-center ${CONTAINER_PADDING[size]} py-2 sm:py-4 overflow-x-auto`}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => {
          const isSelected = selectedSet.has(card.id);
          const isDisabled =
            disabled || (!isSelected && isMaxSelected);
          const rotation = getCardRotation(index, cards.length);
          const yOffset = getCardYOffset(index, cards.length);

          return (
            <motion.div
              key={card.id}
              className={`${index > 0 ? OVERLAP_STYLES[size] : ''}`}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: yOffset,
                scale: 1,
                rotate: rotation,
                zIndex: isSelected ? 100 : index,
              }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.05,
              }}
              style={{
                transformOrigin: 'bottom center',
              }}
              whileHover={!disabled && !isDisabled ? {
                y: isSelected ? yOffset - 8 : yOffset - 6,
                zIndex: 100,
              } : undefined}
              onMouseEnter={() => onCardHover?.(card)}
              onMouseLeave={() => onCardHover?.(null)}
            >
              <Card
                card={card}
                selected={isSelected}
                onClick={() => handleCardClick(card.id)}
                disabled={isDisabled}
                size={size}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* 손패가 비어있을 때 */}
      {cards.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          No cards in hand
        </div>
      )}
    </div>
  );
}

export const Hand = memo(HandComponent);

/**
 * 선택된 카드 수 표시 컴포넌트
 */
export interface SelectionInfoProps {
  selected: number;
  max: number;
}

export function SelectionInfo({ selected, max }: SelectionInfoProps) {
  return (
    <div className="text-center text-sm text-gray-600 mt-2">
      Selected: <span className="font-bold">{selected}</span> / {max}
    </div>
  );
}
