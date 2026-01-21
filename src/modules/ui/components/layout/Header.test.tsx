/**
 * Header Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  const defaultProps = {
    round: 1,
    targetScore: 1000,
    currentScore: 500,
    phase: 'PLAY_PHASE' as const,
  };

  it('renders round number', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Round')).toBeInTheDocument();
  });

  it('renders current and target score', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('renders phase label', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Play Hand')).toBeInTheDocument();
  });

  it('shows correct phase for each game phase', () => {
    const { rerender } = render(<Header {...defaultProps} phase="SLOT_PHASE" />);
    expect(screen.getByText('Slot Spin')).toBeInTheDocument();

    rerender(<Header {...defaultProps} phase="DRAW_PHASE" />);
    expect(screen.getByText('Draw Cards')).toBeInTheDocument();

    rerender(<Header {...defaultProps} phase="SCORE_PHASE" />);
    expect(screen.getByText('Scoring')).toBeInTheDocument();

    rerender(<Header {...defaultProps} phase="ROULETTE_PHASE" />);
    expect(screen.getByText('Roulette')).toBeInTheDocument();

    rerender(<Header {...defaultProps} phase="SHOP_PHASE" />);
    expect(screen.getByText('Shop')).toBeInTheDocument();

    rerender(<Header {...defaultProps} phase="GAME_OVER" />);
    expect(screen.getByText('Game Over')).toBeInTheDocument();
  });

  it('shows green color when score meets target', () => {
    render(<Header {...defaultProps} currentScore={1000} targetScore={1000} />);
    const scoreElements = screen.getAllByText('1,000');
    // First one should be the current score with green color
    expect(scoreElements[0]).toHaveClass('text-green-400');
  });

  it('applies custom className', () => {
    const { container } = render(<Header {...defaultProps} className="custom-class" />);
    expect(container.querySelector('header')).toHaveClass('custom-class');
  });

  it('updates round display when round changes', () => {
    const { rerender } = render(<Header {...defaultProps} round={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<Header {...defaultProps} round={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
