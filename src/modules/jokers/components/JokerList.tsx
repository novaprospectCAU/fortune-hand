/**
 * JokerList Component
 *
 * Displays a list of jokers with empty slot indicators
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import type { Joker } from '@/types/interfaces';
import { JokerCard } from './JokerCard';

export interface JokerListProps {
  /** Array of jokers to display */
  jokers: Joker[];
  /** Maximum number of joker slots */
  maxSlots: number;
  /** IDs of jokers that are currently triggered */
  triggeredIds?: string[];
  /** Handler for clicking on a joker */
  onJokerClick?: (joker: Joker) => void;
  /** Handler for clicking on an empty slot */
  onEmptySlotClick?: (index: number) => void;
  /** Whether to use compact mode */
  compact?: boolean;
  /** Orientation of the list */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

export function JokerList({
  jokers,
  maxSlots,
  triggeredIds = [],
  onJokerClick,
  onEmptySlotClick,
  compact = false,
  orientation = 'horizontal',
  className,
}: JokerListProps) {
  // Create array of slots (filled jokers + empty slots)
  const slots = Array.from({ length: maxSlots }, (_, index) => ({
    index,
    joker: jokers[index],
  }));

  return (
    <div
      className={clsx(
        'flex gap-2',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {slots.map(({ index, joker }) =>
          joker ? (
            <motion.div
              key={joker.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <JokerCard
                joker={joker}
                isTriggered={triggeredIds.includes(joker.id)}
                onClick={() => onJokerClick?.(joker)}
                compact={compact}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${index}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptySlot
                onClick={() => onEmptySlotClick?.(index)}
                compact={compact}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Empty slot component showing available joker slot
 */
interface EmptySlotProps {
  onClick?: () => void;
  compact?: boolean;
}

function EmptySlot({ onClick, compact = false }: EmptySlotProps) {
  return (
    <motion.div
      className={clsx(
        'rounded-lg border-2 border-dashed border-gray-600',
        'bg-gray-800/30 flex items-center justify-center',
        'cursor-pointer transition-colors duration-200',
        'hover:border-gray-500 hover:bg-gray-800/50',
        compact ? 'w-16 h-20' : 'w-28 h-36'
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span
        className={clsx('text-gray-600', compact ? 'text-xl' : 'text-3xl')}
      >
        +
      </span>
    </motion.div>
  );
}

export default JokerList;
