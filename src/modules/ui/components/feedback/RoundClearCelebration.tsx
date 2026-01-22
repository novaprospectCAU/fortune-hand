/**
 * Round Clear Celebration Component
 *
 * Displays a celebratory animation when a round is cleared successfully.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface RoundClearCelebrationProps {
  isVisible: boolean;
  round: number;
  score: number;
  targetScore: number;
  onComplete?: () => void;
}

/**
 * Confetti particle component
 */
function Confetti({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomDuration = 2 + Math.random() * 2;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${randomX}%`,
        top: -20,
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: '100vh',
        rotate: randomRotation + 720,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

/**
 * Star burst component
 */
function StarBurst() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.5, 2], opacity: [0, 1, 0] }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="w-64 h-64 rounded-full bg-gradient-radial from-yellow-400/50 to-transparent" />
    </motion.div>
  );
}

/** Confetti color palette */
const CONFETTI_COLORS = ['#fbbf24', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

export function RoundClearCelebration({
  isVisible,
  round,
  score,
  targetScore,
  onComplete,
}: RoundClearCelebrationProps) {
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
      }));
      setConfettiPieces(pieces);

      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]); // Only depend on isVisible to prevent re-running on callback change

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Star burst effect */}
          <StarBurst />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((piece) => (
              <Confetti key={piece.id} delay={piece.delay} color={piece.color} />
            ))}
          </div>

          {/* Main content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 p-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          >
            {/* Trophy/Star icon */}
            <motion.div
              className="text-8xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
                repeatType: 'reverse',
              }}
            >
              🏆
            </motion.div>

            {/* Round clear text */}
            <motion.h1
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Round {round} Clear!
            </motion.h1>

            {/* Score display */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-400 text-lg">Final Score</p>
              <p className="text-4xl font-bold text-white">
                {score.toLocaleString()}
                <span className="text-gray-500 text-2xl"> / {targetScore.toLocaleString()}</span>
              </p>
            </motion.div>

            {/* Continue hint */}
            <motion.p
              className="text-gray-400 text-sm mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 1.5, duration: 1.5, repeat: Infinity }}
            >
              Continuing to shop...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RoundClearCelebration;
