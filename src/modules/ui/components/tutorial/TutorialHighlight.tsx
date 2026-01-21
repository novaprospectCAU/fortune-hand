/**
 * TutorialHighlight Component
 *
 * Creates a spotlight effect to highlight specific UI elements during tutorial.
 * Darkens the rest of the screen and adds a glowing border around the target element.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { zIndex } from '../../styles/theme';

export interface TutorialHighlightProps {
  /** CSS selector or data-tutorial-id of the element to highlight */
  targetId: string | null;
  /** Whether the highlight is active */
  isActive: boolean;
  /** Padding around the highlighted element */
  padding?: number;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialHighlight({
  targetId,
  isActive,
  padding = 8,
}: TutorialHighlightProps) {
  const [rect, setRect] = useState<HighlightRect | null>(null);

  useEffect(() => {
    if (!isActive || !targetId) {
      setRect(null);
      return;
    }

    // Find the target element
    const targetElement = document.querySelector(`[data-tutorial-id="${targetId}"]`);

    if (!targetElement) {
      console.warn(`Tutorial: Element with data-tutorial-id="${targetId}" not found`);
      setRect(null);
      return;
    }

    // Get element position and size
    const updateRect = () => {
      const domRect = targetElement.getBoundingClientRect();
      setRect({
        top: domRect.top - padding,
        left: domRect.left - padding,
        width: domRect.width + padding * 2,
        height: domRect.height + padding * 2,
      });
    };

    updateRect();

    // Update on window resize
    window.addEventListener('resize', updateRect);

    // Update on scroll
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [targetId, isActive, padding]);

  if (!isActive || !rect) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: zIndex.modal - 1 }}
      aria-hidden="true"
    >
      {/* Dark overlay with cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tutorial-mask">
            {/* White background */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout for the highlighted element */}
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                opacity: 1,
              }}
              transition={{ duration: 0.3 }}
              rx={8}
              fill="black"
            />
          </mask>
        </defs>
        {/* Apply mask to create darkened overlay */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Glowing border around highlighted element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          opacity: 1,
        }}
        transition={{ duration: 0.3 }}
        className={clsx(
          'absolute rounded-lg',
          'ring-4 ring-primary ring-opacity-80',
          'shadow-[0_0_30px_rgba(99,102,241,0.5)]'
        )}
        style={{
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.3)',
        }}
      />

      {/* Pulse animation for extra emphasis */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute rounded-lg ring-2 ring-primary"
      />
    </div>
  );
}

export default TutorialHighlight;
