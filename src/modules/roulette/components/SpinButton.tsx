/**
 * SpinButton component - Button to trigger roulette spin or skip
 */

import { motion } from 'framer-motion';

interface SpinButtonProps {
  onSpin: () => void;
  onSkip: () => void;
  isSpinning: boolean;
  disabled?: boolean;
  baseScore: number;
}

/**
 * Renders spin and skip buttons for the roulette phase.
 *
 * Features:
 * - Animated hover and click effects
 * - Displays current base score
 * - Disables during spin animation
 */
export function SpinButton({
  onSpin,
  onSkip,
  isSpinning,
  disabled = false,
  baseScore,
}: SpinButtonProps) {
  const isDisabled = isSpinning || disabled;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Current Score Display */}
      <div className="text-center">
        <span className="text-gray-400 text-sm">Base Score</span>
        <div className="text-2xl font-bold text-white">
          {baseScore.toLocaleString()}
        </div>
      </div>

      {/* Button Container */}
      <div className="flex gap-3">
        {/* Spin Button */}
        <motion.button
          onClick={onSpin}
          disabled={isDisabled}
          whileHover={isDisabled ? {} : { scale: 1.05 }}
          whileTap={isDisabled ? {} : { scale: 0.95 }}
          className={`
            px-6 py-3 rounded-lg font-bold text-lg
            transition-colors duration-200
            ${
              isDisabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-amber-500/30'
            }
          `}
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Spinning...
            </span>
          ) : (
            'SPIN!'
          )}
        </motion.button>

        {/* Skip Button */}
        <motion.button
          onClick={onSkip}
          disabled={isDisabled}
          whileHover={isDisabled ? {} : { scale: 1.05 }}
          whileTap={isDisabled ? {} : { scale: 0.95 }}
          className={`
            px-6 py-3 rounded-lg font-medium text-lg
            transition-colors duration-200
            ${
              isDisabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
            }
          `}
        >
          Skip (1x)
        </motion.button>
      </div>

      {/* Risk Warning */}
      {!isDisabled && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-xs text-center max-w-xs"
        >
          Spin to multiply your score! But beware - you might lose it all...
        </motion.p>
      )}
    </div>
  );
}

export default SpinButton;
