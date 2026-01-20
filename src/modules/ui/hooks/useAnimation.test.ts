/**
 * useAnimation Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnimation, useSequentialAnimation, useAnimatedValue } from './useAnimation';

describe('useAnimation', () => {
  it('starts with initial state', () => {
    const { result } = renderHook(() => useAnimation());

    expect(result.current.state).toBe('initial');
    expect(result.current.isAnimating).toBe(false);
  });

  it('changes to animate state when start is called', () => {
    const { result } = renderHook(() => useAnimation());

    act(() => {
      result.current.start();
    });

    expect(result.current.state).toBe('animate');
    expect(result.current.isAnimating).toBe(true);
  });

  it('resets to initial state when reset is called', () => {
    const { result } = renderHook(() => useAnimation());

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe('initial');
    expect(result.current.isAnimating).toBe(false);
  });

  it('changes to exit state when exit is called', () => {
    const { result } = renderHook(() => useAnimation());

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.exit();
    });

    expect(result.current.state).toBe('exit');
  });

  it('calls onComplete callback when complete is called', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useAnimation({ onComplete }));

    act(() => {
      result.current.complete();
    });

    expect(onComplete).toHaveBeenCalled();
    expect(result.current.isAnimating).toBe(false);
  });

  it('returns correct motionProps', () => {
    const { result } = renderHook(() => useAnimation());

    expect(result.current.motionProps).toHaveProperty('initial', 'initial');
    expect(result.current.motionProps).toHaveProperty('animate', 'initial');
    expect(result.current.motionProps).toHaveProperty('exit', 'exit');
    expect(result.current.motionProps).toHaveProperty('onAnimationComplete');
  });

  it('starts with custom initial state', () => {
    const { result } = renderHook(() =>
      useAnimation({ initialState: 'animate' })
    );

    expect(result.current.state).toBe('animate');
  });
});

describe('useSequentialAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with currentStep at -1', () => {
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3 })
    );

    expect(result.current.currentStep).toBe(-1);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it('starts sequence when start is called', () => {
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3, stepDelay: 100 })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.currentStep).toBe(0);
    expect(result.current.isPlaying).toBe(true);
  });

  it('advances through steps', () => {
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3, stepDelay: 100 })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.currentStep).toBe(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.currentStep).toBe(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('completes after all steps', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3, stepDelay: 100, onComplete })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.isPlaying).toBe(false);
    expect(onComplete).toHaveBeenCalled();
  });

  it('resets sequence when reset is called', () => {
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3, stepDelay: 100 })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentStep).toBe(-1);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it('isStepActive returns correct value', () => {
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3, stepDelay: 100 })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isStepActive(0)).toBe(true);
    expect(result.current.isStepActive(1)).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isStepActive(0)).toBe(false);
    expect(result.current.isStepActive(1)).toBe(true);
  });

  it('isStepComplete returns correct value', () => {
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3, stepDelay: 100 })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isStepComplete(0)).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isStepComplete(0)).toBe(true);
    expect(result.current.isStepComplete(1)).toBe(false);
  });

  it('auto-starts when autoStart is true', () => {
    const { result } = renderHook(() =>
      useSequentialAnimation({ steps: 3, stepDelay: 100, autoStart: true })
    );

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentStep).toBe(0);
  });
});

describe('useAnimatedValue', () => {
  it('initializes with given value', () => {
    const { result } = renderHook(() =>
      useAnimatedValue({ initialValue: 100 })
    );

    expect(result.current.value).toBe(100);
    expect(result.current.displayValue).toBe('100');
  });

  it('formats value using custom format function', () => {
    const { result } = renderHook(() =>
      useAnimatedValue({
        initialValue: 1000,
        format: (v) => `$${v.toLocaleString()}`,
      })
    );

    expect(result.current.displayValue).toBe('$1,000');
  });

  it('jumps to new value immediately', () => {
    const { result } = renderHook(() =>
      useAnimatedValue({ initialValue: 0 })
    );

    act(() => {
      result.current.jump(500);
    });

    expect(result.current.value).toBe(500);
    expect(result.current.displayValue).toBe('500');
  });
});
