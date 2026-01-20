/**
 * RoundInfo Component
 *
 * Displays round number and remaining hands/discards.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface RoundInfoProps {
  round: number;
  handsRemaining: number;
  discardsRemaining: number;
  maxHands?: number;
  maxDiscards?: number;
  layout?: 'horizontal' | 'vertical' | 'compact';
  className?: string;
}

export function RoundInfo({
  round,
  handsRemaining,
  discardsRemaining,
  maxHands,
  maxDiscards,
  layout = 'horizontal',
  className,
}: RoundInfoProps) {
  const isHorizontal = layout === 'horizontal';
  const isCompact = layout === 'compact';

  return (
    <div
      className={clsx(
        'flex',
        isHorizontal ? 'flex-row items-center gap-6' : 'flex-col gap-3',
        isCompact && 'flex-row items-center gap-4',
        className
      )}
    >
      {/* Round Number */}
      <div
        className={clsx(
          'flex items-center',
          isCompact ? 'gap-1' : 'gap-2'
        )}
      >
        <span
          className={clsx(
            'text-slate-400',
            isCompact ? 'text-xs' : 'text-sm'
          )}
        >
          Round
        </span>
        <motion.span
          key={round}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={clsx(
            'font-bold text-white',
            isCompact ? 'text-base' : 'text-xl'
          )}
        >
          {round}
        </motion.span>
      </div>

      {/* Divider */}
      {!isCompact && (
        <div
          className={clsx(
            'bg-game-border',
            isHorizontal ? 'w-px h-8' : 'h-px w-full'
          )}
          aria-hidden="true"
        />
      )}

      {/* Hands Remaining */}
      <div
        className={clsx(
          'flex items-center',
          isCompact ? 'gap-1' : 'gap-2'
        )}
      >
        <div
          className={clsx(
            'flex items-center justify-center rounded',
            isCompact
              ? 'w-5 h-5 text-xs'
              : 'w-7 h-7 text-sm',
            'bg-blue-500/20 text-blue-400'
          )}
          aria-hidden="true"
        >
          H
        </div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={handsRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={clsx(
              'font-bold',
              isCompact ? 'text-sm' : 'text-base',
              handsRemaining === 0 ? 'text-red-400' : 'text-blue-400'
            )}
          >
            {handsRemaining}
          </motion.span>
          {maxHands !== undefined && (
            <span className="text-slate-500 text-sm">
              /{maxHands}
            </span>
          )}
        </div>
        {!isCompact && (
          <span className="text-slate-400 text-sm">
            {handsRemaining === 1 ? 'Hand' : 'Hands'}
          </span>
        )}
      </div>

      {/* Discards Remaining */}
      <div
        className={clsx(
          'flex items-center',
          isCompact ? 'gap-1' : 'gap-2'
        )}
      >
        <div
          className={clsx(
            'flex items-center justify-center rounded',
            isCompact
              ? 'w-5 h-5 text-xs'
              : 'w-7 h-7 text-sm',
            'bg-red-500/20 text-red-400'
          )}
          aria-hidden="true"
        >
          D
        </div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={discardsRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={clsx(
              'font-bold',
              isCompact ? 'text-sm' : 'text-base',
              discardsRemaining === 0 ? 'text-slate-500' : 'text-red-400'
            )}
          >
            {discardsRemaining}
          </motion.span>
          {maxDiscards !== undefined && (
            <span className="text-slate-500 text-sm">
              /{maxDiscards}
            </span>
          )}
        </div>
        {!isCompact && (
          <span className="text-slate-400 text-sm">
            {discardsRemaining === 1 ? 'Discard' : 'Discards'}
          </span>
        )}
      </div>
    </div>
  );
}

export default RoundInfo;
