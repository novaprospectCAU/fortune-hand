/**
 * Tutorial Integration Example
 *
 * This file shows how to integrate the tutorial system into your game.
 * Copy relevant parts to your main App or GameLayout component.
 *
 * @file This is an example/documentation file only
 * @ts-nocheck - Example code, intentional unused variables
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import { TutorialOverlay, useTutorial } from '@/modules/ui';
import { useGameStore } from '@/modules/core/store';

/**
 * Example 1: Basic Integration
 *
 * Add TutorialOverlay to your main game component.
 */
export function GameWithTutorial() {
  const currentPhase = useGameStore((state) => state.phase);

  return (
    <div className="game-container">
      {/* Your game UI */}
      <div className="game-content">
        {/* Slot Machine */}
        <div data-tutorial-id="slot-machine">
          {/* <SlotMachine /> */}
        </div>

        {/* Card Hand */}
        <div data-tutorial-id="hand-area">
          {/* <CardHand /> */}
        </div>

        {/* Action Buttons */}
        <div data-tutorial-id="action-buttons">
          {/* <ActionButtons /> */}
        </div>

        {/* Roulette */}
        <div data-tutorial-id="roulette-wheel">
          {/* <Roulette /> */}
        </div>

        {/* Score Display */}
        <div data-tutorial-id="score-display">
          {/* <ScoreDisplay /> */}
        </div>

        {/* Shop Items */}
        <div data-tutorial-id="shop-items">
          {/* <ShopItems /> */}
        </div>
      </div>

      {/* Tutorial Overlay - Add this! */}
      <TutorialOverlay
        currentPhase={currentPhase}
        enabled={true}
        onComplete={() => {
          console.log('Tutorial completed!');
          // Optional: Show achievement, play sound, etc.
        }}
        onSkip={() => {
          console.log('Tutorial skipped');
          // Optional: Track analytics
        }}
      />
    </div>
  );
}

/**
 * Example 2: With Settings Integration
 *
 * Add a button to restart tutorial from settings menu.
 */
export function SettingsMenu() {
  const { isCompleted, isSkipped, resetTutorial, startTutorial } = useTutorial();

  const handleRestartTutorial = () => {
    resetTutorial();
    // Optional: Navigate to game start or reload
    window.location.reload();
  };

  return (
    <div className="settings-menu">
      <h2>Settings</h2>

      {/* Tutorial Section */}
      <div className="settings-section">
        <h3>Tutorial</h3>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-slate-300">
              Status:{' '}
              {isCompleted
                ? 'Completed'
                : isSkipped
                ? 'Skipped'
                : 'In Progress'}
            </p>
          </div>

          <button
            onClick={handleRestartTutorial}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Restart Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Conditional Tutorial
 *
 * Only show tutorial on first game start.
 */
export function GameWithConditionalTutorial() {
  const currentPhase = useGameStore((state) => state.phase);
  const { isActive } = useTutorial();

  // Only enable tutorial if it's active (not completed or skipped)
  return (
    <div className="game-container">
      {/* Game UI */}
      <div className="game-content">
        {/* ... game components ... */}
      </div>

      {/* Only render tutorial if active */}
      {isActive && (
        <TutorialOverlay
          currentPhase={currentPhase}
          enabled={true}
        />
      )}
    </div>
  );
}

/**
 * Example 4: Manual Tutorial Control
 *
 * Control tutorial progression manually based on game events.
 */
export function GameWithManualTutorial() {
  const currentPhase = useGameStore((state) => state.phase);
  const {
    isActive,
    currentStep,
    nextStep,
    previousStep,
    currentStepData,
  } = useTutorial();

  // You can manually advance the tutorial based on game events
  const handleCardPlayed = () => {
    // If on card tutorial step, advance
    if (currentStepData?.id === 'card_play') {
      nextStep();
    }
  };

  return (
    <div className="game-container">
      {/* Game UI with manual tutorial triggers */}
      <div className="game-content">
        <button onClick={handleCardPlayed}>
          Play Card
        </button>
      </div>

      {/* Tutorial */}
      <TutorialOverlay
        currentPhase={currentPhase}
        enabled={isActive}
      />
    </div>
  );
}

/**
 * Example 5: Custom Tutorial Steps
 *
 * Show custom tooltips for specific game elements.
 */
export function GameWithCustomTooltips() {
  const { currentStepData, isActive } = useTutorial();

  return (
    <div className="game-container">
      {/* Show custom highlights based on current step */}
      <div className="slot-machine-container">
        {currentStepData?.highlight === 'slot-machine' && (
          <div className="absolute top-0 left-0 animate-bounce">
            👇 Click here to spin!
          </div>
        )}
        <div data-tutorial-id="slot-machine">
          {/* <SlotMachine /> */}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: Tutorial with Analytics
 *
 * Track tutorial progress with analytics.
 */
export function GameWithTutorialAnalytics() {
  const currentPhase = useGameStore((state) => state.phase);

  const handleTutorialComplete = () => {
    // Track completion
    console.log('Tutorial completed');
    // analytics.track('tutorial_completed');
  };

  const handleTutorialSkip = () => {
    // Track skip
    console.log('Tutorial skipped');
    // analytics.track('tutorial_skipped', { step: currentStep });
  };

  return (
    <div className="game-container">
      {/* Game UI */}

      <TutorialOverlay
        currentPhase={currentPhase}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </div>
  );
}

/**
 * Example 7: Tutorial with Keyboard Shortcuts
 *
 * Add keyboard navigation to tutorial.
 */
export function GameWithKeyboardTutorial() {
  const currentPhase = useGameStore((state) => state.phase);
  const { nextStep, previousStep, skipTutorial, isActive } = useTutorial();

  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'Enter':
          nextStep();
          break;
        case 'ArrowLeft':
          previousStep();
          break;
        case 'Escape':
          if (confirm('Skip tutorial?')) {
            skipTutorial();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, nextStep, previousStep, skipTutorial]);

  return (
    <div className="game-container">
      {/* Game UI */}

      <TutorialOverlay currentPhase={currentPhase} />

      {/* Keyboard hints */}
      {isActive && (
        <div className="fixed bottom-4 right-4 bg-game-card p-3 rounded-lg text-sm">
          <p className="text-slate-300">
            ← → Navigate | Enter Next | Esc Skip
          </p>
        </div>
      )}
    </div>
  );
}
