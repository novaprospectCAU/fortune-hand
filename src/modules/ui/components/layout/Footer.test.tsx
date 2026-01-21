/**
 * Footer Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  const defaultProps = {
    phase: 'PLAY_PHASE' as const,
    selectedCardsCount: 0,
    maxSelectCards: 5,
    handsRemaining: 4,
    discardsRemaining: 3,
  };

  it('renders Play Hand button in PLAY_PHASE', () => {
    render(<Footer {...defaultProps} />);
    expect(screen.getByText(/Play Hand/)).toBeInTheDocument();
  });

  it('renders Discard button in PLAY_PHASE', () => {
    render(<Footer {...defaultProps} />);
    expect(screen.getByText(/Discard/)).toBeInTheDocument();
  });

  it('shows selected cards count in PLAY_PHASE', () => {
    render(<Footer {...defaultProps} selectedCardsCount={3} />);
    expect(screen.getByText('Selected: 3/5')).toBeInTheDocument();
  });

  it('calls onPlay when Play Hand button is clicked', () => {
    const handlePlay = vi.fn();
    render(<Footer {...defaultProps} selectedCardsCount={1} onPlay={handlePlay} />);

    fireEvent.click(screen.getByText(/Play Hand/));
    expect(handlePlay).toHaveBeenCalled();
  });

  it('calls onDiscard when Discard button is clicked', () => {
    const handleDiscard = vi.fn();
    render(<Footer {...defaultProps} selectedCardsCount={1} onDiscard={handleDiscard} />);

    fireEvent.click(screen.getByText(/Discard/));
    expect(handleDiscard).toHaveBeenCalled();
  });

  it('disables Play Hand when no cards selected', () => {
    render(<Footer {...defaultProps} selectedCardsCount={0} />);
    expect(screen.getByText(/Play Hand/)).toBeDisabled();
  });

  it('disables Discard when no cards selected', () => {
    render(<Footer {...defaultProps} selectedCardsCount={0} />);
    expect(screen.getByText(/Discard/)).toBeDisabled();
  });

  it('disables Discard when no discards remaining', () => {
    render(<Footer {...defaultProps} selectedCardsCount={1} discardsRemaining={0} />);
    expect(screen.getByText(/Discard/)).toBeDisabled();
  });

  it('disables Play Hand when no hands remaining', () => {
    render(<Footer {...defaultProps} selectedCardsCount={1} handsRemaining={0} />);
    expect(screen.getByText(/Play Hand/)).toBeDisabled();
  });

  it('renders Spin Slot button in SLOT_PHASE', () => {
    render(<Footer {...defaultProps} phase="SLOT_PHASE" />);
    expect(screen.getByText(/Spin Slot/)).toBeInTheDocument();
  });

  it('calls onSpinSlot when Spin Slot button is clicked', () => {
    const handleSpinSlot = vi.fn();
    render(<Footer {...defaultProps} phase="SLOT_PHASE" slotSpinsRemaining={1} onSpinSlot={handleSpinSlot} />);

    fireEvent.click(screen.getByText(/Spin Slot/));
    expect(handleSpinSlot).toHaveBeenCalled();
  });

  it('renders roulette buttons in ROULETTE_PHASE', () => {
    render(<Footer {...defaultProps} phase="ROULETTE_PHASE" />);
    expect(screen.getByText('Keep Score')).toBeInTheDocument();
    expect(screen.getByText('Spin Roulette')).toBeInTheDocument();
  });

  it('calls onSpinRoulette when Spin Roulette is clicked', () => {
    const handleSpinRoulette = vi.fn();
    render(<Footer {...defaultProps} phase="ROULETTE_PHASE" onSpinRoulette={handleSpinRoulette} />);

    fireEvent.click(screen.getByText('Spin Roulette'));
    expect(handleSpinRoulette).toHaveBeenCalled();
  });

  it('calls onSkipRoulette when Keep Score is clicked', () => {
    const handleSkipRoulette = vi.fn();
    render(<Footer {...defaultProps} phase="ROULETTE_PHASE" onSkipRoulette={handleSkipRoulette} />);

    fireEvent.click(screen.getByText('Keep Score'));
    expect(handleSkipRoulette).toHaveBeenCalled();
  });

  it('renders Continue button in SCORE_PHASE', () => {
    render(<Footer {...defaultProps} phase="SCORE_PHASE" />);
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('renders Leave Shop button in SHOP_PHASE', () => {
    render(<Footer {...defaultProps} phase="SHOP_PHASE" />);
    expect(screen.getByText('Leave Shop')).toBeInTheDocument();
  });

  it('renders Play Again button in GAME_OVER', () => {
    render(<Footer {...defaultProps} phase="GAME_OVER" />);
    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('renders Start Game button in IDLE', () => {
    render(<Footer {...defaultProps} phase="IDLE" />);
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });
});
