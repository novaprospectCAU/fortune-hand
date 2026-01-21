/**
 * GameLayout Component
 *
 * Main game layout with header, sidebar, main area, and footer.
 * Responsive design: sidebar collapses on mobile.
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import type { GameState } from '@/types/interfaces';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { MobileHelper } from './MobileHelper';

export interface GameLayoutProps {
  gameState: Partial<GameState>;
  children: React.ReactNode;
  className?: string;
  onPlay?: () => void;
  onDiscard?: () => void;
  onSpinRoulette?: () => void;
  onSkipRoulette?: () => void;
  onContinue?: () => void;
  onJokerClick?: (joker: GameState['jokers'][0]) => void;
  deckCount?: number;
  onViewDeck?: () => void;
}

export function GameLayout({
  gameState,
  children,
  className,
  onPlay,
  onDiscard,
  onSpinRoulette,
  onSkipRoulette,
  onContinue,
  onJokerClick,
  deckCount,
  onViewDeck,
}: GameLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    phase = 'IDLE',
    round = 1,
    targetScore = 0,
    currentScore = 0,
    gold = 0,
    handsRemaining = 0,
    discardsRemaining = 0,
    jokers = [],
    maxJokers = 5,
    selectedCards = [],
    slotResult = null,
    rouletteResult = null,
  } = gameState;

  const maxSelectCards = 5; // From game config

  return (
    <>
      <MobileHelper />
      <div
        className={clsx(
          'h-screen max-h-screen bg-game-bg text-white',
          'flex flex-col overflow-hidden',
          // Use dynamic viewport height on supported browsers
          'supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh]',
          className
        )}
      >
      {/* Header */}
      <Header
        round={round}
        targetScore={targetScore}
        currentScore={currentScore}
        phase={phase}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Game Area */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4">
          {children}
        </main>

        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar
            gold={gold}
            handsRemaining={handsRemaining}
            discardsRemaining={discardsRemaining}
            jokers={jokers}
            maxJokers={maxJokers}
            collapsed={false}
            onJokerClick={onJokerClick}
            deckCount={deckCount}
            onViewDeck={onViewDeck}
          />
        </div>
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={clsx(
          'md:hidden fixed bottom-20 right-3 z-20',
          'w-14 h-14 rounded-full',
          'bg-game-surface border-2 border-game-border',
          'flex items-center justify-center',
          'text-slate-400 hover:text-white active:text-white',
          'transition-all duration-150',
          'shadow-lg active:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          // Touch-friendly sizing (min 44px)
          'touch-manipulation'
        )}
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {sidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-72 sm:w-80 max-w-[85vw]">
            <Sidebar
              gold={gold}
              handsRemaining={handsRemaining}
              discardsRemaining={discardsRemaining}
              jokers={jokers}
              maxJokers={maxJokers}
              collapsed={false}
              onJokerClick={(joker) => {
                onJokerClick?.(joker);
                setSidebarOpen(false);
              }}
              deckCount={deckCount}
              onViewDeck={onViewDeck}
              className="h-full shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer
        phase={phase}
        selectedCardsCount={selectedCards.length}
        maxSelectCards={maxSelectCards}
        handsRemaining={handsRemaining}
        discardsRemaining={discardsRemaining}
        hasSlotResult={!!slotResult}
        hasRouletteResult={!!rouletteResult}
        onPlay={onPlay}
        onDiscard={onDiscard}
        onSpinRoulette={onSpinRoulette}
        onSkipRoulette={onSkipRoulette}
        onContinue={onContinue}
      />
      </div>
    </>
  );
}

export default GameLayout;
