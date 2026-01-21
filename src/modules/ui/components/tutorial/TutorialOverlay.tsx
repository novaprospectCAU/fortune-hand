/**
 * TutorialOverlay Component
 *
 * Main tutorial component that orchestrates the tutorial experience.
 * Manages step progression, highlights, and integrates with game state.
 */

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TutorialHighlight } from './TutorialHighlight';
import { TutorialStep } from './TutorialStep';
import { useTutorial } from '../../hooks/useTutorial';
import type { GamePhase } from '@/types/interfaces';

export interface TutorialOverlayProps {
  /** Current game phase - used to determine which tutorial step to show */
  currentPhase: GamePhase;
  /** Whether the tutorial is enabled */
  enabled?: boolean;
  /** Callback when tutorial is completed */
  onComplete?: () => void;
  /** Callback when tutorial is skipped */
  onSkip?: () => void;
}

export function TutorialOverlay({
  currentPhase,
  enabled = true,
  onComplete,
  onSkip,
}: TutorialOverlayProps) {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    canAdvance,
  } = useTutorial();

  // Auto-advance when phase changes if the tutorial expects it
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Check if current step is phase-locked and we've entered that phase
    if (currentStepData.phase && currentStepData.phase === currentPhase && canAdvance) {
      // Don't auto-advance on IDLE phase (welcome screen)
      if (currentPhase !== 'IDLE') {
        // Small delay to let the phase change settle
        const timer = setTimeout(() => {
          // Only auto-advance if we're still on a step that matches the phase
          const stepData = currentStepData;
          if (stepData?.phase === currentPhase) {
            // Mark that we've seen this phase
            // The actual advancement is still manual via Next button
          }
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [currentPhase, currentStepData, isActive, canAdvance]);

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
      onComplete?.();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSkip = () => {
    skipTutorial();
    onSkip?.();
  };

  // Don't render if tutorial is not enabled or not active
  if (!enabled || !isActive || !currentStepData) {
    return null;
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Highlight effect */}
          <TutorialHighlight
            targetId={currentStepData.highlight}
            isActive={true}
          />

          {/* Tutorial step positioned relative to viewport */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 50 }}
          >
            <div className="relative w-full h-full">
              <TutorialStep
                title={currentStepData.title}
                content={currentStepData.content}
                currentStep={currentStep + 1} // Convert to 1-indexed
                totalSteps={totalSteps}
                position={currentStepData.position as any}
                isFirst={isFirstStep}
                isLast={isLastStep}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSkip={handleSkip}
                showSkip={true}
              />
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TutorialOverlay;
