/**
 * RouletteWheel component - Animated roulette wheel with Framer Motion
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RouletteConfig, RouletteResult } from '@/types/interfaces';
import { Segment } from './Segment';
import { normalizeSegments } from '../probability';
import { spin, calculateTargetAngle } from '../roulette';

/** Probability threshold below which segments are hidden from the wheel visual */
const HIDDEN_SEGMENT_THRESHOLD = 3;

interface RouletteWheelProps {
  config: RouletteConfig;
  onSpinComplete: (result: RouletteResult) => void;
  baseScore: number;
  disabled?: boolean;
  /** Preview result from Fortune Teller joker - shows which segment will be selected */
  previewResult?: RouletteResult | null;
}

// Mobile-responsive wheel size
const WHEEL_SIZE_DESKTOP = 300;
const WHEEL_RADIUS_DESKTOP = WHEEL_SIZE_DESKTOP / 2 - 10;
const CENTER_DESKTOP = WHEEL_SIZE_DESKTOP / 2;

/**
 * Animated roulette wheel component.
 *
 * Features:
 * - SVG-based wheel rendering
 * - Framer Motion rotation animation
 * - Custom easing for realistic spin deceleration
 * - Pointer indicator at top
 */
export function RouletteWheel({
  config,
  onSpinComplete,
  baseScore,
  disabled = false,
  previewResult = null,
}: RouletteWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pendingResult, setPendingResult] = useState<RouletteResult | null>(
    null
  );
  const [showJackpot, setShowJackpot] = useState(false);

  // Preview segment ID from Fortune Teller joker
  const previewSegmentId = previewResult?.segment.id;

  // Normalize segments for consistent rendering
  const normalizedSegments = useMemo(
    () => normalizeSegments(config.segments),
    [config.segments]
  );

  // Filter segments for visual display (hide low probability segments, but always show jackpot)
  const visibleSegments = useMemo(
    () => normalizedSegments.filter((s) =>
      s.probability > HIDDEN_SEGMENT_THRESHOLD || s.multiplier >= 100
    ),
    [normalizedSegments]
  );

  // Renormalize visible segments so they add up to 100% for display purposes
  const visualSegmentData = useMemo(() => {
    const totalVisibleProb = visibleSegments.reduce((sum, s) => sum + s.probability, 0);
    let currentAngle = 0;
    return visibleSegments.map((segment) => {
      // Scale probability to fill the wheel
      const scaledProb = (segment.probability / totalVisibleProb) * 100;
      const sweepAngle = (scaledProb / 100) * 360;
      const data = {
        segment,
        startAngle: currentAngle,
        sweepAngle,
      };
      currentAngle += sweepAngle;
      return data;
    });
  }, [visibleSegments]);

  // Handle spin
  const handleSpin = useCallback(() => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);

    // Use preview result from Fortune Teller if available, otherwise spin normally
    const result = previewResult ?? spin({ baseScore, config });
    setPendingResult(result);

    // Calculate target angle to land on the selected segment
    const extraRotations = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const targetAngle = calculateTargetAngle(
      result.segment,
      config,
      extraRotations
    );

    // Set the new rotation (cumulative to prevent snapping)
    setRotation((prev) => prev + targetAngle);
  }, [isSpinning, disabled, baseScore, config, previewResult]);

  // Handle animation complete
  const handleAnimationComplete = useCallback(() => {
    setIsSpinning(false);
    if (pendingResult) {
      // Check for jackpot (100x multiplier)
      if (pendingResult.segment.multiplier >= 100) {
        setShowJackpot(true);
        // Delay the completion to show jackpot animation
        setTimeout(() => {
          setShowJackpot(false);
          onSpinComplete(pendingResult);
          setPendingResult(null);
        }, 2500);
      } else {
        onSpinComplete(pendingResult);
        setPendingResult(null);
      }
    }
  }, [pendingResult, onSpinComplete]);

  // Find highlighted segment (the result segment when spinning completes)
  const highlightedSegmentId = pendingResult?.segment.id;

  return (
    <div className="relative inline-block w-full max-w-xs mx-auto">
      {/* Pointer indicator at top */}
      <div className="absolute left-1/2 -top-1 sm:-top-2 -translate-x-1/2 z-10">
        <div
          className="w-0 h-0 border-l-[10px] sm:border-l-[12px] border-r-[10px] sm:border-r-[12px] border-t-[16px] sm:border-t-[20px]
                     border-l-transparent border-r-transparent border-t-yellow-400
                     drop-shadow-lg"
        />
      </div>

      {/* Wheel container */}
      <motion.div
        initial={false}
        animate={{ rotate: rotation }}
        transition={{
          duration: isSpinning ? config.spinDuration / 1000 : 0,
          ease: [0.2, 0.8, 0.2, 1], // Custom easeOut curve
        }}
        onAnimationComplete={isSpinning ? handleAnimationComplete : undefined}
        className="cursor-pointer touch-manipulation"
        onClick={handleSpin}
      >
        {/* Mobile SVG */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${WHEEL_SIZE_DESKTOP} ${WHEEL_SIZE_DESKTOP}`}
          className="drop-shadow-xl w-full h-auto max-w-[240px] sm:max-w-[300px] mx-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Outer ring */}
          <circle
            cx={CENTER_DESKTOP}
            cy={CENTER_DESKTOP}
            r={WHEEL_RADIUS_DESKTOP + 5}
            fill="none"
            stroke="#374151"
            strokeWidth="8"
          />

          {/* Segments (only visible ones) */}
          {visualSegmentData.map(({ segment, startAngle, sweepAngle }) => (
            <Segment
              key={segment.id}
              segment={segment}
              startAngle={startAngle}
              sweepAngle={sweepAngle}
              radius={WHEEL_RADIUS_DESKTOP}
              centerX={CENTER_DESKTOP}
              centerY={CENTER_DESKTOP}
              isHighlighted={
                !isSpinning && highlightedSegmentId === segment.id
              }
              isPreview={!isSpinning && previewSegmentId === segment.id}
            />
          ))}

          {/* Center circle */}
          <circle
            cx={CENTER_DESKTOP}
            cy={CENTER_DESKTOP}
            r={30}
            fill="#1f2937"
            stroke="#374151"
            strokeWidth="3"
          />
          <circle cx={CENTER_DESKTOP} cy={CENTER_DESKTOP} r={20} fill="#374151" />

          {/* Center decoration */}
          <text
            x={CENTER_DESKTOP}
            y={CENTER_DESKTOP}
            fill="#fbbf24"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            SPIN
          </text>
        </svg>
      </motion.div>

      {/* Spinning indicator */}
      {isSpinning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-t-yellow-400 border-transparent"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      )}

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-900/50 rounded-full flex items-center justify-center cursor-not-allowed">
          <span className="text-gray-400 font-medium">Disabled</span>
        </div>
      )}

      {/* Jackpot (100x) celebration overlay */}
      <AnimatePresence>
        {showJackpot && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background flash */}
            <motion.div
              className="absolute inset-0 bg-yellow-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0, 0.3, 0] }}
              transition={{ duration: 0.5, times: [0, 0.1, 0.2, 0.3, 0.5] }}
            />

            {/* Radial burst effect */}
            <motion.div
              className="absolute w-[200vmax] h-[200vmax] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 2] }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />

            {/* Main jackpot text */}
            <motion.div
              className="relative flex flex-col items-center gap-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
              transition={{ duration: 0.6, ease: 'backOut' }}
            >
              {/* Crown icon */}
              <motion.div
                className="text-6xl sm:text-8xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [-5, 5, -5, 5, 0],
                }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                👑
              </motion.div>

              {/* JACKPOT text */}
              <motion.h1
                className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-500"
                style={{
                  textShadow: '0 0 40px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.4)',
                  WebkitTextStroke: '2px rgba(255,255,255,0.3)',
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                JACKPOT!
              </motion.h1>

              {/* 100x text */}
              <motion.div
                className="text-4xl sm:text-6xl font-bold text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                ×100
              </motion.div>

              {/* Score display */}
              {pendingResult && (
                <motion.div
                  className="text-2xl sm:text-3xl font-semibold text-yellow-300 mt-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {pendingResult.finalScore.toLocaleString()} pts!
                </motion.div>
              )}
            </motion.div>

            {/* Particle effects - coins/stars */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl sm:text-3xl"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.3,
                  ease: 'easeOut',
                }}
              >
                {i % 2 === 0 ? '⭐' : '💰'}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RouletteWheel;
