/**
 * ScorePopup Component
 *
 * Animated popup showing score calculation with chips, mult, and final score.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { clsx } from 'clsx';
import { scorePopup } from '../../animations/variants';
import type { AppliedBonus } from '@/types/interfaces';

export interface ScorePopupProps {
  chips: number;
  mult: number;
  finalScore: number;
  bonuses?: AppliedBonus[];
  isVisible: boolean;
  position?: { x: number; y: number };
  onComplete?: () => void;
  className?: string;
}

export function ScorePopup({
  chips,
  mult,
  finalScore,
  bonuses = [],
  isVisible,
  position,
  onComplete,
  className,
}: ScorePopupProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  // Animated counter for final score
  const springScore = useSpring(0, {
    stiffness: 50,
    damping: 20,
  });

  useEffect(() => {
    if (isVisible) {
      // Reset state
      setDisplayScore(0);
      setShowFinal(false);

      // Show final score after chips and mult animation
      const finalTimer = setTimeout(() => {
        setShowFinal(true);
        springScore.set(finalScore);
      }, 800);

      // Call onComplete after full animation
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 2500);

      return () => {
        clearTimeout(finalTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, finalScore, springScore, onComplete]);

  useEffect(() => {
    const unsubscribe = springScore.on('change', (value) => {
      setDisplayScore(Math.round(value));
    });
    return unsubscribe;
  }, [springScore]);

  const positionStyle = position
    ? { left: position.x, top: position.y }
    : {};

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={scorePopup}
          initial="initial"
          animate="animate"
          exit="exit"
          className={clsx(
            'fixed z-50 pointer-events-none',
            !position && 'inset-0 flex items-center justify-center',
            className
          )}
          style={positionStyle}
        >
          <div className="flex flex-col items-center gap-3">
            {/* Chips and Mult */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0 }}
              className="flex items-center gap-3 text-2xl font-bold"
            >
              {/* Chips */}
              <motion.span
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-blue-400"
              >
                {chips.toLocaleString()}
              </motion.span>

              <span className="text-slate-400">x</span>

              {/* Mult */}
              <motion.span
                initial={{ x: 20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-red-400"
              >
                {mult.toLocaleString()}
              </motion.span>
            </motion.div>

            {/* Applied Bonuses */}
            {bonuses.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {bonuses.map((bonus, index) => (
                  <motion.span
                    key={`${bonus.source}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={clsx(
                      'px-2 py-1 rounded text-sm font-medium',
                      bonus.type === 'chips'
                        ? 'bg-blue-500/20 text-blue-300'
                        : bonus.type === 'mult'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-purple-500/20 text-purple-300'
                    )}
                  >
                    {bonus.source}: +{bonus.value}
                    {bonus.type === 'xmult' && 'x'}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Final Score */}
            {showFinal && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                }}
                className="mt-2"
              >
                <div className="text-5xl font-bold text-amber-400 drop-shadow-lg">
                  {displayScore.toLocaleString()}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ScorePopup;
