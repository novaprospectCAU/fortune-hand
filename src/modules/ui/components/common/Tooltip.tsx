/**
 * Tooltip Component
 *
 * A tooltip that appears on hover with customizable position.
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { tooltip as tooltipVariants } from '../../animations/variants';
import { zIndex } from '../../styles/theme';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles = {
  top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-game-card border-x-transparent border-b-transparent',
  bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-game-card border-x-transparent border-t-transparent',
  left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-game-card border-y-transparent border-r-transparent',
  right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-game-card border-y-transparent border-l-transparent',
};

export function Tooltip({
  content,
  position = 'top',
  delay = 200,
  children,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={tooltipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              'absolute whitespace-nowrap',
              'px-3 py-2 rounded-lg',
              'bg-game-card text-white text-sm',
              'shadow-lg border border-game-border',
              'pointer-events-none',
              positionStyles[position],
              className
            )}
            style={{ zIndex: zIndex.tooltip }}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={clsx(
                'absolute w-0 h-0',
                'border-[6px]',
                arrowStyles[position]
              )}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tooltip;
