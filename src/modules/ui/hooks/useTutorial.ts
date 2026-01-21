/**
 * useTutorial Hook
 *
 * Manages tutorial state, progression, and persistence.
 * Stores completion status in localStorage.
 */

import { useState, useCallback } from 'react';
import tutorialData from '@/data/tutorial.json';

const TUTORIAL_STORAGE_KEY = 'fortune-hand-tutorial-completed';
const TUTORIAL_SKIP_KEY = 'fortune-hand-tutorial-skipped';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  phase: string | null;
  highlight: string | null;
  position: string;
}

export interface TutorialState {
  /** Whether the tutorial is currently active */
  isActive: boolean;
  /** Current step index (0-based) */
  currentStep: number;
  /** Current step data */
  currentStepData: TutorialStep | null;
  /** Total number of steps */
  totalSteps: number;
  /** Whether this is the first step */
  isFirstStep: boolean;
  /** Whether this is the last step */
  isLastStep: boolean;
  /** Whether the tutorial has been completed */
  isCompleted: boolean;
  /** Whether the tutorial has been skipped */
  isSkipped: boolean;
  /** Whether we can advance to next step */
  canAdvance: boolean;
}

export interface TutorialActions {
  /** Move to next step */
  nextStep: () => void;
  /** Move to previous step */
  previousStep: () => void;
  /** Skip the tutorial */
  skipTutorial: () => void;
  /** Complete the tutorial */
  completeTutorial: () => void;
  /** Reset the tutorial (for testing) */
  resetTutorial: () => void;
  /** Start the tutorial */
  startTutorial: () => void;
}

export type UseTutorialReturn = TutorialState & TutorialActions;

/**
 * Check if tutorial has been completed
 */
function checkTutorialCompleted(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Check if tutorial has been skipped
 */
function checkTutorialSkipped(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_SKIP_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark tutorial as completed
 */
function markTutorialCompleted(): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  } catch (error) {
    console.warn('Failed to save tutorial completion status:', error);
  }
}

/**
 * Mark tutorial as skipped
 */
function markTutorialSkipped(): void {
  try {
    localStorage.setItem(TUTORIAL_SKIP_KEY, 'true');
  } catch (error) {
    console.warn('Failed to save tutorial skip status:', error);
  }
}

/**
 * Clear tutorial completion status
 */
function clearTutorialStatus(): void {
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    localStorage.removeItem(TUTORIAL_SKIP_KEY);
  } catch (error) {
    console.warn('Failed to clear tutorial status:', error);
  }
}

/**
 * Tutorial hook
 */
export function useTutorial(): UseTutorialReturn {
  const steps = tutorialData.steps as TutorialStep[];
  const totalSteps = steps.length;

  // Check initial status from localStorage
  const [isCompleted, setIsCompleted] = useState(checkTutorialCompleted);
  const [isSkipped, setIsSkipped] = useState(checkTutorialSkipped);
  const [currentStep, setCurrentStep] = useState(0);

  // Tutorial is active if not completed and not skipped
  const isActive = !isCompleted && !isSkipped;

  // Current step data
  const currentStepData = isActive && steps[currentStep] ? steps[currentStep] : null;

  // Navigation state
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const canAdvance = currentStep < totalSteps - 1;

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    if (canAdvance) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canAdvance]);

  /**
   * Move to previous step
   */
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  /**
   * Skip the tutorial
   */
  const skipTutorial = useCallback(() => {
    setIsSkipped(true);
    markTutorialSkipped();
  }, []);

  /**
   * Complete the tutorial
   */
  const completeTutorial = useCallback(() => {
    setIsCompleted(true);
    markTutorialCompleted();
  }, []);

  /**
   * Reset the tutorial (for testing or settings)
   */
  const resetTutorial = useCallback(() => {
    clearTutorialStatus();
    setIsCompleted(false);
    setIsSkipped(false);
    setCurrentStep(0);
  }, []);

  /**
   * Start the tutorial manually
   */
  const startTutorial = useCallback(() => {
    clearTutorialStatus();
    setIsCompleted(false);
    setIsSkipped(false);
    setCurrentStep(0);
  }, []);

  return {
    // State
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    isCompleted,
    isSkipped,
    canAdvance,
    // Actions
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    resetTutorial,
    startTutorial,
  };
}

export default useTutorial;
