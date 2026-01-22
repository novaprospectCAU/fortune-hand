/**
 * JokerCard Component
 *
 * Displays a single joker card with its information and trigger state
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Joker } from '@/types/interfaces';
import { RARITY_COLORS } from '@/data/constants';
import { useI18n, type TranslationKey } from '@/modules/ui';

export interface JokerCardProps {
  /** The joker to display */
  joker: Joker;
  /** Whether this joker is currently triggered/active */
  isTriggered?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Whether the card is in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function JokerCard({
  joker,
  isTriggered = false,
  onClick,
  compact = false,
  className,
}: JokerCardProps) {
  const { t } = useI18n();
  const rarityColor = RARITY_COLORS[joker.rarity];

  // Get translated name and description
  const nameKey = `joker_${joker.id}` as TranslationKey;
  const descKey = `joker_${joker.id}_desc` as TranslationKey;
  const rarityKey = `rarity_${joker.rarity}` as TranslationKey;

  const displayName = t(nameKey) !== nameKey ? t(nameKey) : joker.name;
  const displayDesc = t(descKey) !== descKey ? t(descKey) : joker.description;
  const displayRarity = t(rarityKey) !== rarityKey ? t(rarityKey) : joker.rarity.charAt(0).toUpperCase() + joker.rarity.slice(1);

  return (
    <motion.div
      className={clsx(
        'relative rounded-lg overflow-hidden cursor-pointer',
        'border-2 transition-all duration-200',
        'bg-gradient-to-br from-gray-800 to-gray-900',
        compact ? 'w-16 h-20' : 'w-28 h-36',
        isTriggered && 'ring-2 ring-yellow-400 ring-opacity-75',
        className
      )}
      style={{
        borderColor: rarityColor,
        boxShadow: isTriggered
          ? `0 0 20px ${rarityColor}80, 0 0 40px ${rarityColor}40`
          : `0 2px 8px rgba(0, 0, 0, 0.3)`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      animate={
        isTriggered
          ? {
              boxShadow: [
                `0 0 20px ${rarityColor}80, 0 0 40px ${rarityColor}40`,
                `0 0 30px ${rarityColor}90, 0 0 60px ${rarityColor}50`,
                `0 0 20px ${rarityColor}80, 0 0 40px ${rarityColor}40`,
              ],
            }
          : {}
      }
      transition={{
        duration: 0.8,
        repeat: isTriggered ? Infinity : 0,
      }}
    >
      {/* Rarity indicator bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: rarityColor }}
      />

      {/* Card content */}
      <div
        className={clsx(
          'flex flex-col items-center justify-center h-full',
          compact ? 'p-1' : 'p-2'
        )}
      >
        {/* Joker icon/emoji */}
        <div className={clsx('text-center', compact ? 'text-lg' : 'text-2xl')}>
          {getJokerIcon(joker)}
        </div>

        {/* Joker name */}
        {!compact && (
          <div className="mt-1 text-center">
            <span className="text-xs font-medium text-white line-clamp-2">
              {displayName}
            </span>
          </div>
        )}

        {/* Triggered indicator */}
        {isTriggered && (
          <motion.div
            className="absolute inset-0 bg-yellow-400 pointer-events-none"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>

      {/* Tooltip on hover (full mode only) */}
      {!compact && (
        <div
          className={clsx(
            'absolute inset-0 opacity-0 hover:opacity-100',
            'bg-black/90 p-2 flex flex-col justify-center',
            'transition-opacity duration-200'
          )}
        >
          <span className="text-xs font-bold text-white text-center">
            {displayName}
          </span>
          <span className="text-[10px] text-gray-300 text-center mt-1 leading-tight">
            {displayDesc}
          </span>
          <span
            className="text-[10px] font-medium text-center mt-1"
            style={{ color: rarityColor }}
          >
            {displayRarity}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Get an icon/emoji for a joker based on its trigger type and effect
 */
function getJokerIcon(joker: Joker): string {
  // First check effect type for more specific icons
  switch (joker.effect.type) {
    case 'add_gold':
      return '\uD83D\uDCB0'; // money bag
    case 'multiply':
      return '\u00D7'; // multiplication sign
    case 'retrigger':
      return '\uD83D\uDD04'; // repeat
    case 'modify_slot':
      return '\uD83C\uDFB0'; // slot machine
    case 'modify_roulette':
      return '\uD83C\uDFAF'; // target
  }

  // Then check trigger type
  switch (joker.trigger.type) {
    case 'on_play':
      return '\uD83C\uDCCF'; // playing card
    case 'on_score':
      return '\uD83D\uDCCA'; // chart
    case 'on_slot':
      return '\uD83C\uDFB0'; // slot machine
    case 'on_roulette':
      return '\uD83C\uDFAF'; // target
    case 'passive':
      return '\u2728'; // sparkles
    default:
      return '\uD83C\uDCCF'; // default joker
  }
}

export default JokerCard;
