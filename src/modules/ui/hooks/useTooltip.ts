/**
 * useTooltip Hook
 *
 * Custom hook for managing tooltip state and positioning.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface UseTooltipOptions {
  /** Default position */
  position?: TooltipPosition;
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Offset from trigger element (px) */
  offset?: number;
}

export interface TooltipCoordinates {
  x: number;
  y: number;
  position: TooltipPosition;
}

export interface UseTooltipReturn {
  /** Whether tooltip is visible */
  isVisible: boolean;
  /** Current position */
  position: TooltipPosition;
  /** Calculated coordinates for tooltip */
  coordinates: TooltipCoordinates | null;
  /** Show the tooltip */
  show: () => void;
  /** Hide the tooltip */
  hide: () => void;
  /** Toggle tooltip visibility */
  toggle: () => void;
  /** Props to spread on trigger element */
  triggerProps: {
    ref: React.RefObject<HTMLElement>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    'aria-describedby': string | undefined;
  };
  /** ID for the tooltip element */
  tooltipId: string;
}

let tooltipIdCounter = 0;

export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const {
    position: defaultPosition = 'top',
    showDelay = 200,
    hideDelay = 0,
    disabled = false,
    offset = 8,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>(defaultPosition);
  const [coordinates, setCoordinates] = useState<TooltipCoordinates | null>(null);

  const triggerRef = useRef<HTMLElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipIdRef = useRef<string>(`tooltip-${++tooltipIdCounter}`);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Calculate position based on trigger element
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return null;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalPosition = defaultPosition;
    let x = 0;
    let y = 0;

    // Check if there's enough space for the preferred position
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    // Auto-adjust position if needed
    if (defaultPosition === 'top' && spaceTop < 50) {
      finalPosition = 'bottom';
    } else if (defaultPosition === 'bottom' && spaceBottom < 50) {
      finalPosition = 'top';
    } else if (defaultPosition === 'left' && spaceLeft < 100) {
      finalPosition = 'right';
    } else if (defaultPosition === 'right' && spaceRight < 100) {
      finalPosition = 'left';
    }

    // Calculate coordinates based on position
    switch (finalPosition) {
      case 'top':
        x = rect.left + rect.width / 2;
        y = rect.top - offset;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + offset;
        break;
      case 'left':
        x = rect.left - offset;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + offset;
        y = rect.top + rect.height / 2;
        break;
    }

    return { x, y, position: finalPosition };
  }, [defaultPosition, offset]);

  const show = useCallback(() => {
    if (disabled) return;

    // Clear any pending hide
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = setTimeout(() => {
      const coords = calculatePosition();
      if (coords) {
        setCoordinates(coords);
        setPosition(coords.position);
      }
      setIsVisible(true);
    }, showDelay);
  }, [disabled, showDelay, calculatePosition]);

  const hide = useCallback(() => {
    // Clear any pending show
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [hideDelay]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  const triggerProps = {
    ref: triggerRef as React.RefObject<HTMLElement>,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    'aria-describedby': isVisible ? tooltipIdRef.current : undefined,
  };

  return {
    isVisible,
    position,
    coordinates,
    show,
    hide,
    toggle,
    triggerProps,
    tooltipId: tooltipIdRef.current,
  };
}

/**
 * useTooltipGroup Hook
 *
 * Manages a group of tooltips where only one can be visible at a time.
 */
export interface UseTooltipGroupOptions {
  /** Show delay (ms) */
  showDelay?: number;
  /** Hide delay (ms) */
  hideDelay?: number;
}

export interface UseTooltipGroupReturn {
  /** ID of currently active tooltip (if any) */
  activeId: string | null;
  /** Register a tooltip */
  register: (id: string) => {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
  };
  /** Hide all tooltips */
  hideAll: () => void;
}

export function useTooltipGroup(
  options: UseTooltipGroupOptions = {}
): UseTooltipGroupReturn {
  const { showDelay = 200, hideDelay = 100 } = options;

  const [activeId, setActiveId] = useState<string | null>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const register = useCallback(
    (id: string) => {
      return {
        isVisible: activeId === id,
        show: () => {
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }

          showTimeoutRef.current = setTimeout(() => {
            setActiveId(id);
          }, showDelay);
        },
        hide: () => {
          if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
          }

          hideTimeoutRef.current = setTimeout(() => {
            setActiveId((current) => (current === id ? null : current));
          }, hideDelay);
        },
      };
    },
    [activeId, showDelay, hideDelay]
  );

  const hideAll = useCallback(() => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setActiveId(null);
  }, []);

  return {
    activeId,
    register,
    hideAll,
  };
}

export default useTooltip;
