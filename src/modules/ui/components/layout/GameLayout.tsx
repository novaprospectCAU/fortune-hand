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

export interface GameLayoutProps {
  gameState: Partial<GameState>;
  children: React.ReactNode;
  className?: string;
  onPlay?: () => void;
  onDiscard?: () => void;
  onSpinSlot?: () => void;
  onSkipSlot?: () => void;
  onSpinRoulette?: () => void;
  onSkipRoulette?: () => void;
  onContinue?: () => void;
  onJokerClick?: (joker: GameState['jokers'][0]) => void;
}

export function GameLayout({
  gameState,
  children,
  className,
  onPlay,
  onDiscard,
  onSpinSlot,
  onSkipSlot,
  onSpinRoulette,
  onSkipRoulette,
  onContinue,
  onJokerClick,
}: GameLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    phase = 'IDLE',
    round = 1,
    targetScore = 0,
    currentScore = 0,
    gold = 0,
    handsRemaining = 0,
    discardsRemaining = 0,
    slotSpinsRemaining = 0,
    jokers = [],
    maxJokers = 5,
    selectedCards = [],
  } = gameState;

  const maxSelectCards = 5; // From game config

  return (
    <div
      className={clsx(
        'min-h-screen bg-game-bg text-white',
        'flex flex-col',
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
      <div className="flex-1 flex overflow-hidden">
        {/* Main Game Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Sidebar - Hidden on mobile by default */}
        <div className="hidden md:block">
          <Sidebar
            gold={gold}
            handsRemaining={handsRemaining}
            discardsRemaining={discardsRemaining}
            jokers={jokers}
            maxJokers={maxJokers}
            collapsed={sidebarCollapsed}
            onJokerClick={onJokerClick}
          />
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={clsx(
          'md:hidden fixed bottom-20 right-4 z-20',
          'w-12 h-12 rounded-full',
          'bg-game-surface border border-game-border',
          'flex items-center justify-center',
          'text-slate-400 hover:text-white',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary'
        )}
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-64">
            <Sidebar
              gold={gold}
              handsRemaining={handsRemaining}
              discardsRemaining={discardsRemaining}
              jokers={jokers}
              maxJokers={maxJokers}
              collapsed={false}
              onJokerClick={onJokerClick}
              className="h-full"
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
        slotSpinsRemaining={slotSpinsRemaining}
        onPlay={onPlay}
        onDiscard={onDiscard}
        onSpinSlot={onSpinSlot}
        onSkipSlot={onSkipSlot}
        onSpinRoulette={onSpinRoulette}
        onSkipRoulette={onSkipRoulette}
        onContinue={onContinue}
      />
    </div>
  );
}

export default GameLayout;
