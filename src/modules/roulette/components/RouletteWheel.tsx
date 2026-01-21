/**
 * RouletteWheel component - Animated roulette wheel with Framer Motion
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { RouletteConfig, RouletteResult } from '@/types/interfaces';
import { Segment } from './Segment';
import { normalizeSegments } from '../probability';
import { spin, calculateTargetAngle } from '../roulette';

interface RouletteWheelProps {
  config: RouletteConfig;
  onSpinComplete: (result: RouletteResult) => void;
  baseScore: number;
  disabled?: boolean;
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
}: RouletteWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pendingResult, setPendingResult] = useState<RouletteResult | null>(
    null
  );

  // Normalize segments for consistent rendering
  const normalizedSegments = useMemo(
    () => normalizeSegments(config.segments),
    [config.segments]
  );

  // Calculate segment angles
  const segmentData = useMemo(() => {
    let currentAngle = 0;
    return normalizedSegments.map((segment) => {
      const sweepAngle = (segment.probability / 100) * 360;
      const data = {
        segment,
        startAngle: currentAngle,
        sweepAngle,
      };
      currentAngle += sweepAngle;
      return data;
    });
  }, [normalizedSegments]);

  // Handle spin
  const handleSpin = useCallback(() => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);

    // Determine the result first
    const result = spin({ baseScore, config });
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
  }, [isSpinning, disabled, baseScore, config]);

  // Handle animation complete
  const handleAnimationComplete = useCallback(() => {
    setIsSpinning(false);
    if (pendingResult) {
      onSpinComplete(pendingResult);
      setPendingResult(null);
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
        animate={{ rotate: rotation }}
        transition={{
          duration: config.spinDuration / 1000,
          ease: [0.2, 0.8, 0.2, 1], // Custom easeOut curve
        }}
        onAnimationComplete={handleAnimationComplete}
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

          {/* Segments */}
          {segmentData.map(({ segment, startAngle, sweepAngle }) => (
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
    </div>
  );
}

export default RouletteWheel;
