/**
 * TutorialStep Component
 *
 * Displays a single tutorial step with title, content, and navigation.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Button } from '../common/Button';
import { modal } from '../../animations/variants';

export interface TutorialStepProps {
  /** Step title */
  title: string;
  /** Step content (supports newlines) */
  content: string;
  /** Current step number (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Position of the tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Whether this is the first step */
  isFirst: boolean;
  /** Whether this is the last step */
  isLast: boolean;
  /** Callback for next button */
  onNext: () => void;
  /** Callback for previous button */
  onPrevious: () => void;
  /** Callback for skip button */
  onSkip: () => void;
  /** Whether to show skip button */
  showSkip?: boolean;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-4',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-4',
  left: 'right-full top-1/2 -translate-y-1/2 mr-4',
  right: 'left-full top-1/2 -translate-y-1/2 ml-4',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-game-surface border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-game-surface border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-game-surface border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-game-surface border-y-transparent border-l-transparent',
  center: '',
};

export function TutorialStep({
  title,
  content,
  currentStep,
  totalSteps,
  position = 'center',
  isFirst,
  isLast,
  onNext,
  onPrevious,
  onSkip,
  showSkip = true,
}: TutorialStepProps) {
  // Split content by newlines for formatting
  const paragraphs = content.split('\n').filter(p => p.trim());

  return (
    <motion.div
      variants={modal}
      initial="initial"
      animate="animate"
      exit="exit"
      className={clsx(
        'fixed',
        'bg-game-surface rounded-xl shadow-2xl',
        'border-2 border-primary',
        'max-w-md w-full',
        'pointer-events-auto',
        position === 'center' ? 'p-6' : 'p-5',
        positionStyles[position]
      )}
      style={{
        zIndex: 50, // Above highlight
      }}
    >
      {/* Arrow pointer (except for center position) */}
      {position !== 'center' && (
        <div
          className={clsx(
            'absolute w-0 h-0',
            'border-[12px]',
            arrowStyles[position]
          )}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Step {currentStep} of {totalSteps}</span>
            {/* Progress dots */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i < currentStep ? 'bg-primary' : 'bg-slate-600'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {showSkip && (
          <button
            onClick={onSkip}
            className={clsx(
              'text-sm text-slate-400 hover:text-white',
              'transition-colors',
              'ml-4'
            )}
            aria-label="Skip tutorial"
          >
            Skip
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-6 space-y-2">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-slate-200 leading-relaxed whitespace-pre-line"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer - Navigation buttons */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={isFirst}
          className="flex-1"
        >
          Previous
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onNext}
          className="flex-1"
        >
          {isLast ? 'Finish' : 'Next'}
        </Button>
      </div>
    </motion.div>
  );
}

export default TutorialStep;
