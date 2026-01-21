/**
 * Pack Open Overlay - 카드 구매 결과 오버레이
 * 상점에서 팩 또는 카드를 구매했을 때 획득한 카드를 표시
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { Card as CardType } from '@/types/interfaces';
import { Card } from '@/modules/cards/components/Card';

export interface PackOpenOverlayProps {
  cards: CardType[] | null;
  onClose: () => void;
}

export function PackOpenOverlay({ cards, onClose }: PackOpenOverlayProps) {
  if (!cards || cards.length === 0) return null;

  const isSingleCard = cards.length === 1;
  const title = isSingleCard ? '🃏 Card Acquired!' : '🎁 Pack Opened!';
  const subtitle = isSingleCard
    ? '1 card added to your deck'
    : `${cards.length} cards added to your deck`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="flex flex-col items-center gap-6 p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-white"
          >
            {title}
          </motion.h2>

          {/* Cards */}
          <div className="flex gap-4 flex-wrap justify-center">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{
                  rotateY: 180,
                  opacity: 0,
                  y: 50,
                }}
                animate={{
                  rotateY: 0,
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2 + index * 0.15,
                  type: 'spring',
                  damping: 15,
                  stiffness: 200,
                }}
                className="transform-gpu"
              >
                <Card card={card} size="lg" />
              </motion.div>
            ))}
          </div>

          {/* Card count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + cards.length * 0.15 }}
            className="text-gray-400 text-sm"
          >
            {subtitle}
          </motion.p>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + cards.length * 0.15 }}
            onClick={onClose}
            className="
              mt-2 px-8 py-3 rounded-lg font-bold
              bg-primary hover:bg-primary/80 text-white
              transition-colors
            "
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PackOpenOverlay;
