/**
 * Sidebar Component
 *
 * Displays jokers, resources, and run information.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Joker } from '@/types/interfaces';
import { staggerContainer, listItem } from '../../animations/variants';

export interface SidebarProps {
  gold: number;
  handsRemaining: number;
  discardsRemaining: number;
  jokers: Joker[];
  maxJokers: number;
  deckCount?: number;
  className?: string;
  collapsed?: boolean;
  onJokerClick?: (joker: Joker) => void;
  onViewDeck?: () => void;
}

const rarityBorderColors = {
  common: 'border-rarity-common',
  uncommon: 'border-rarity-uncommon',
  rare: 'border-rarity-rare',
  legendary: 'border-rarity-legendary',
};

export function Sidebar({
  gold,
  handsRemaining,
  discardsRemaining,
  jokers,
  maxJokers,
  deckCount,
  className,
  collapsed = false,
  onJokerClick,
  onViewDeck,
}: SidebarProps) {
  return (
    <aside
      className={clsx(
        'bg-game-surface border-l border-game-border',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-64 sm:w-72 lg:w-64',
        'flex flex-col',
        className
      )}
    >
      {/* Resources Section */}
      <div className="p-3 sm:p-4 border-b border-game-border">
        <h3
          className={clsx(
            'text-slate-400 text-xs uppercase tracking-wider mb-3',
            collapsed && 'sr-only'
          )}
        >
          Resources
        </h3>

        {/* Gold */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 text-lg sm:text-xl" aria-hidden="true">$</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-slate-400 text-xs sm:text-sm">Gold</div>
              <motion.div
                key={gold}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-amber-400 font-bold text-xl sm:text-2xl"
              >
                {gold}
              </motion.div>
            </div>
          )}
        </div>

        {/* Hands Remaining */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 text-base sm:text-lg" aria-hidden="true">H</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-slate-400 text-xs sm:text-sm">Hands</div>
              <motion.div
                key={handsRemaining}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-blue-400 font-bold text-xl sm:text-2xl"
              >
                {handsRemaining}
              </motion.div>
            </div>
          )}
        </div>

        {/* Discards Remaining */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-red-400 text-base sm:text-lg" aria-hidden="true">D</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-slate-400 text-xs sm:text-sm">Discards</div>
              <motion.div
                key={discardsRemaining}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-red-400 font-bold text-xl sm:text-2xl"
              >
                {discardsRemaining}
              </motion.div>
            </div>
          )}
        </div>

        {/* View Deck Button */}
        {onViewDeck && (
          <button
            onClick={onViewDeck}
            className={clsx(
              'mt-4 w-full py-2 px-3 rounded-lg',
              'bg-game-card hover:bg-game-border transition-colors',
              'text-slate-400 hover:text-white text-sm',
              'flex items-center justify-center gap-2',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          >
            {collapsed ? (
              <span title="View Deck">D</span>
            ) : (
              <>
                <span>View Deck</span>
                {deckCount !== undefined && (
                  <span className="text-xs text-slate-500">({deckCount})</span>
                )}
                <span className="text-xs text-slate-600 ml-auto">[D]</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Jokers Section */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3
            className={clsx(
              'text-slate-400 text-xs uppercase tracking-wider',
              collapsed && 'sr-only'
            )}
          >
            Jokers
          </h3>
          {!collapsed && (
            <span className="text-slate-500 text-xs sm:text-sm">
              {jokers.length}/{maxJokers}
            </span>
          )}
        </div>

        {/* Joker List */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {jokers.map((joker, index) => (
            <motion.button
              key={joker.id}
              variants={listItem}
              custom={index}
              onClick={() => onJokerClick?.(joker)}
              className={clsx(
                'w-full p-3 sm:p-3.5 rounded-lg',
                'bg-game-card border-2',
                rarityBorderColors[joker.rarity],
                'hover:bg-game-border active:bg-game-border transition-colors',
                'text-left focus:outline-none focus:ring-2 focus:ring-primary',
                // Touch-friendly sizing
                'min-h-[44px] touch-manipulation'
              )}
            >
              {collapsed ? (
                <div
                  className="w-8 h-8 flex items-center justify-center text-lg"
                  title={joker.name}
                >
                  J
                </div>
              ) : (
                <>
                  <div className="font-medium text-white text-sm sm:text-base">
                    {joker.name}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm line-clamp-2 mt-1">
                    {joker.description}
                  </div>
                </>
              )}
            </motion.button>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: maxJokers - jokers.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className={clsx(
                'p-2 rounded-lg',
                'bg-game-card/50 border-2 border-dashed border-game-border',
                collapsed ? 'h-12' : 'h-16 sm:h-20',
                'flex items-center justify-center'
              )}
            >
              {!collapsed && (
                <span className="text-slate-600 text-xs sm:text-sm">Empty</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </aside>
  );
}

export default Sidebar;
