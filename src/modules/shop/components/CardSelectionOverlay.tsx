/**
 * Card Selection Overlay - 소모품 사용 시 카드 선택 오버레이
 * 덱에서 카드를 선택하여 제거/변환/복제할 수 있게 합니다.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card as CardType, Consumable } from '@/types/interfaces';
import { Card } from '@/modules/cards/components/Card';
import { useI18n, type TranslationKey } from '@/modules/ui';

export interface CardSelectionOverlayProps {
  consumable: Consumable;
  deckCards: CardType[];
  onConfirm: (selectedCardIds: string[]) => void;
  onCancel: () => void;
}

type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

/**
 * Get title based on consumable type
 */
function getTitle(type: Consumable['type'], t: TranslateFn): string {
  switch (type) {
    case 'card_remover':
      return t('selectCardsToRemove');
    case 'card_transformer':
      return t('selectCardsToTransform');
    case 'card_duplicator':
      return t('selectCardsToDuplicate');
    default:
      return t('selectCards');
  }
}

/**
 * Get icon based on consumable type
 */
function getIcon(type: Consumable['type']): string {
  switch (type) {
    case 'card_remover':
      return '🗑️';
    case 'card_transformer':
      return '✨';
    case 'card_duplicator':
      return '📋';
    default:
      return '🃏';
  }
}

/**
 * Get description based on consumable type
 */
function getDescription(
  type: Consumable['type'],
  selectLimit: number,
  t: TranslateFn
): string {
  switch (type) {
    case 'card_remover':
      return t('removeCardDesc', { n: selectLimit });
    case 'card_transformer':
      return t('transformCardDesc', { n: selectLimit });
    case 'card_duplicator':
      return t('duplicateCardDesc', { n: selectLimit });
    default:
      return t('selectUpToN', { n: selectLimit });
  }
}

export function CardSelectionOverlay({
  consumable,
  deckCards,
  onConfirm,
  onCancel,
}: CardSelectionOverlayProps) {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(cardId)) {
          // Deselect
          return prev.filter((id) => id !== cardId);
        } else if (prev.length < (consumable.selectLimit ?? 1)) {
          // Select (if under limit)
          return [...prev, cardId];
        }
        return prev;
      });
    },
    [consumable.selectLimit]
  );

  const handleConfirm = useCallback(() => {
    onConfirm(selectedIds);
  }, [selectedIds, onConfirm]);

  const title = getTitle(consumable.type, t);
  const icon = getIcon(consumable.type);
  const description = getDescription(consumable.type, consumable.selectLimit ?? 1, t);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="flex flex-col items-center gap-4 p-6 bg-gray-900 rounded-xl border border-gray-700 max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="text-4xl mb-2"
            >
              {icon}
            </motion.div>
            <motion.h2
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-white"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm mt-1"
            >
              {description}
            </motion.p>
          </div>

          {/* Selection count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-2 text-lg"
          >
            <span className="text-gray-400">{t('selected')}:</span>
            <span
              className={`font-bold ${
                selectedIds.length === consumable.selectLimit
                  ? 'text-yellow-400'
                  : 'text-white'
              }`}
            >
              {selectedIds.length} / {consumable.selectLimit}
            </span>
          </motion.div>

          {/* Card grid */}
          <div className="flex-1 overflow-y-auto w-full">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 p-2">
              {deckCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * Math.min(index, 20) }}
                  className="cursor-pointer"
                >
                  <Card
                    card={card}
                    size="sm"
                    selected={selectedIds.includes(card.id)}
                    onClick={() => handleCardClick(card.id)}
                    disabled={
                      !selectedIds.includes(card.id) &&
                      selectedIds.length >= (consumable.selectLimit ?? 1)
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-2"
          >
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-8 py-2 rounded-lg font-bold transition-colors ${
                selectedIds.length > 0
                  ? 'bg-primary hover:bg-primary/80 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {consumable.type === 'card_remover'
                ? selectedIds.length > 0
                  ? t('removeCards', { n: selectedIds.length })
                  : t('skipRemoval')
                : consumable.type === 'card_transformer'
                  ? selectedIds.length > 0
                    ? t('transformCards', { n: selectedIds.length })
                    : t('skipTransform')
                  : selectedIds.length > 0
                    ? t('duplicateCards', { n: selectedIds.length })
                    : t('skipDuplicate')}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CardSelectionOverlay;
