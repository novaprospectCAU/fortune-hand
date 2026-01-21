/**
 * useTutorial Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTutorial } from './useTutorial';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useTutorial', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with tutorial active if not completed', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.isActive).toBe(true);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isSkipped).toBe(false);
    expect(result.current.currentStep).toBe(0);
  });

  it('should initialize with tutorial inactive if completed', () => {
    localStorageMock.setItem('fortune-hand-tutorial-completed', 'true');

    const { result } = renderHook(() => useTutorial());

    expect(result.current.isActive).toBe(false);
    expect(result.current.isCompleted).toBe(true);
  });

  it('should initialize with tutorial inactive if skipped', () => {
    localStorageMock.setItem('fortune-hand-tutorial-skipped', 'true');

    const { result } = renderHook(() => useTutorial());

    expect(result.current.isActive).toBe(false);
    expect(result.current.isSkipped).toBe(true);
  });

  it('should advance to next step', () => {
    const { result } = renderHook(() => useTutorial());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('should go to previous step', () => {
    const { result } = renderHook(() => useTutorial());

    // Go to step 2
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(2);

    // Go back to step 1
    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('should not go below step 0', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.currentStep).toBe(0);

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('should not advance beyond last step', () => {
    const { result } = renderHook(() => useTutorial());

    const totalSteps = result.current.totalSteps;

    // Advance to last step (0-indexed, so totalSteps - 1 is the last step)
    act(() => {
      for (let i = 0; i < totalSteps - 1; i++) {
        result.current.nextStep();
      }
    });

    expect(result.current.currentStep).toBe(totalSteps - 1);
    expect(result.current.isLastStep).toBe(true);

    // Try to advance further
    act(() => {
      result.current.nextStep();
    });

    // Should still be on last step
    expect(result.current.currentStep).toBe(totalSteps - 1);
  });

  it('should mark tutorial as completed', () => {
    const { result } = renderHook(() => useTutorial());

    act(() => {
      result.current.completeTutorial();
    });

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isActive).toBe(false);
    expect(localStorageMock.getItem('fortune-hand-tutorial-completed')).toBe('true');
  });

  it('should mark tutorial as skipped', () => {
    const { result } = renderHook(() => useTutorial());

    act(() => {
      result.current.skipTutorial();
    });

    expect(result.current.isSkipped).toBe(true);
    expect(result.current.isActive).toBe(false);
    expect(localStorageMock.getItem('fortune-hand-tutorial-skipped')).toBe('true');
  });

  it('should reset tutorial', () => {
    const { result } = renderHook(() => useTutorial());

    // Complete tutorial
    act(() => {
      result.current.completeTutorial();
    });

    expect(result.current.isCompleted).toBe(true);

    // Reset
    act(() => {
      result.current.resetTutorial();
    });

    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isSkipped).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isActive).toBe(true);
    expect(localStorageMock.getItem('fortune-hand-tutorial-completed')).toBeNull();
    expect(localStorageMock.getItem('fortune-hand-tutorial-skipped')).toBeNull();
  });

  it('should start tutorial manually', () => {
    localStorageMock.setItem('fortune-hand-tutorial-completed', 'true');

    const { result } = renderHook(() => useTutorial());

    expect(result.current.isActive).toBe(false);

    act(() => {
      result.current.startTutorial();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.currentStep).toBe(0);
  });

  it('should correctly identify first step', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.isFirstStep).toBe(true);

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.isFirstStep).toBe(false);
  });

  it('should correctly identify last step', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.isLastStep).toBe(false);

    // Advance to last step
    act(() => {
      for (let i = 0; i < result.current.totalSteps - 1; i++) {
        result.current.nextStep();
      }
    });

    expect(result.current.isLastStep).toBe(true);
  });

  it('should return current step data', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.currentStepData).toBeTruthy();
    expect(result.current.currentStepData?.id).toBe('welcome');
  });

  it('should return null step data when inactive', () => {
    localStorageMock.setItem('fortune-hand-tutorial-completed', 'true');

    const { result } = renderHook(() => useTutorial());

    expect(result.current.currentStepData).toBeNull();
  });

  it('should update canAdvance based on current step', () => {
    const { result } = renderHook(() => useTutorial());

    expect(result.current.canAdvance).toBe(true);

    // Advance to last step
    act(() => {
      for (let i = 0; i < result.current.totalSteps - 1; i++) {
        result.current.nextStep();
      }
    });

    expect(result.current.canAdvance).toBe(false);
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Save original setItem
    const originalSetItem = localStorageMock.setItem;

    // Mock localStorage to throw error
    localStorageMock.setItem = () => {
      throw new Error('Storage error');
    };

    const { result } = renderHook(() => useTutorial());

    act(() => {
      result.current.completeTutorial();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save tutorial completion status:',
      expect.any(Error)
    );

    // Restore
    localStorageMock.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });
});
