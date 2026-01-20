/**
 * useAnimation Hook
 *
 * Custom hook for managing animation state and callbacks.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseAnimationOptions {
  /** Initial animation state */
  initialState?: 'initial' | 'animate' | 'exit';
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Auto-reset after animation */
  autoReset?: boolean;
  /** Delay before auto-reset (ms) */
  resetDelay?: number;
}

export interface UseAnimationReturn {
  /** Current animation state */
  state: 'initial' | 'animate' | 'exit';
  /** Whether animation is playing */
  isAnimating: boolean;
  /** Start the animation */
  start: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Trigger exit animation */
  exit: () => void;
  /** Set animation as complete */
  complete: () => void;
  /** Props to spread on motion component */
  motionProps: {
    initial: string;
    animate: string;
    exit: string;
    onAnimationComplete: () => void;
  };
}

export function useAnimation(options: UseAnimationOptions = {}): UseAnimationReturn {
  const {
    initialState = 'initial',
    onComplete,
    autoReset = false,
    resetDelay = 0,
  } = options;

  const [state, setState] = useState<'initial' | 'animate' | 'exit'>(initialState);
  const [isAnimating, setIsAnimating] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    setIsAnimating(true);
    setState('animate');
  }, []);

  const reset = useCallback(() => {
    setIsAnimating(false);
    setState('initial');
  }, []);

  const exit = useCallback(() => {
    setState('exit');
  }, []);

  const complete = useCallback(() => {
    setIsAnimating(false);
    onComplete?.();

    if (autoReset) {
      resetTimeoutRef.current = setTimeout(() => {
        reset();
      }, resetDelay);
    }
  }, [onComplete, autoReset, resetDelay, reset]);

  const motionProps = {
    initial: 'initial',
    animate: state,
    exit: 'exit',
    onAnimationComplete: complete,
  };

  return {
    state,
    isAnimating,
    start,
    reset,
    exit,
    complete,
    motionProps,
  };
}

/**
 * useSequentialAnimation Hook
 *
 * Manages a sequence of animations that play one after another.
 */
export interface UseSequentialAnimationOptions {
  /** Number of steps in the sequence */
  steps: number;
  /** Delay between steps (ms) */
  stepDelay?: number;
  /** Callback when all steps complete */
  onComplete?: () => void;
  /** Auto-start on mount */
  autoStart?: boolean;
}

export interface UseSequentialAnimationReturn {
  /** Current step (0-indexed) */
  currentStep: number;
  /** Whether sequence is playing */
  isPlaying: boolean;
  /** Whether sequence is complete */
  isComplete: boolean;
  /** Start the sequence */
  start: () => void;
  /** Reset the sequence */
  reset: () => void;
  /** Skip to specific step */
  goToStep: (step: number) => void;
  /** Check if a step is active */
  isStepActive: (step: number) => boolean;
  /** Check if a step is complete */
  isStepComplete: (step: number) => boolean;
}

export function useSequentialAnimation(
  options: UseSequentialAnimationOptions
): UseSequentialAnimationReturn {
  const { steps, stepDelay = 300, onComplete, autoStart = false } = options;

  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-start
  useEffect(() => {
    if (autoStart) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    setIsPlaying(true);
    setIsComplete(false);
    setCurrentStep(0);

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= steps) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsPlaying(false);
          setIsComplete(true);
          onComplete?.();
          return prev;
        }
        return next;
      });
    }, stepDelay);
  }, [steps, stepDelay, onComplete]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentStep(-1);
    setIsPlaying(false);
    setIsComplete(false);
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, steps - 1)));
  }, [steps]);

  const isStepActive = useCallback(
    (step: number) => currentStep === step,
    [currentStep]
  );

  const isStepComplete = useCallback(
    (step: number) => currentStep > step,
    [currentStep]
  );

  return {
    currentStep,
    isPlaying,
    isComplete,
    start,
    reset,
    goToStep,
    isStepActive,
    isStepComplete,
  };
}

/**
 * useAnimatedValue Hook
 *
 * Tracks animated number values with formatting.
 */
export interface UseAnimatedValueOptions {
  /** Initial value */
  initialValue?: number;
  /** Format function for display */
  format?: (value: number) => string;
  /** Spring stiffness */
  stiffness?: number;
  /** Spring damping */
  damping?: number;
}

export interface UseAnimatedValueReturn {
  /** Current animated value */
  value: number;
  /** Formatted display value */
  displayValue: string;
  /** Set new target value */
  set: (value: number) => void;
  /** Immediately jump to value */
  jump: (value: number) => void;
}

export function useAnimatedValue(
  options: UseAnimatedValueOptions = {}
): UseAnimatedValueReturn {
  const {
    initialValue = 0,
    format = (v) => v.toLocaleString(),
    stiffness = 100,
  } = options;

  const [value, setValue] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(format(initialValue));
  const targetRef = useRef(initialValue);
  const animationRef = useRef<number | null>(null);

  // Simple spring simulation
  const animate = useCallback(() => {
    const target = targetRef.current;
    const diff = target - value;

    if (Math.abs(diff) < 0.5) {
      setValue(target);
      setDisplayValue(format(target));
      return;
    }

    const spring = diff * (stiffness / 1000);
    const newValue = value + spring;

    setValue(newValue);
    setDisplayValue(format(Math.round(newValue)));

    animationRef.current = requestAnimationFrame(animate);
  }, [value, format, stiffness]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const set = useCallback(
    (newValue: number) => {
      targetRef.current = newValue;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    },
    [animate]
  );

  const jump = useCallback(
    (newValue: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      targetRef.current = newValue;
      setValue(newValue);
      setDisplayValue(format(newValue));
    },
    [format]
  );

  return {
    value,
    displayValue,
    set,
    jump,
  };
}

export default useAnimation;
