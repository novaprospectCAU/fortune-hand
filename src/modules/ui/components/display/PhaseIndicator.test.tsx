/**
 * PhaseIndicator Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhaseIndicator } from './PhaseIndicator';

describe('PhaseIndicator', () => {
  it('renders phase label for IDLE', () => {
    render(<PhaseIndicator phase="IDLE" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders phase label for SLOT_PHASE', () => {
    render(<PhaseIndicator phase="SLOT_PHASE" />);
    expect(screen.getByText('Slot Spin')).toBeInTheDocument();
  });

  it('renders phase label for DRAW_PHASE', () => {
    render(<PhaseIndicator phase="DRAW_PHASE" />);
    expect(screen.getByText('Draw Cards')).toBeInTheDocument();
  });

  it('renders phase label for PLAY_PHASE', () => {
    render(<PhaseIndicator phase="PLAY_PHASE" />);
    expect(screen.getByText('Play Hand')).toBeInTheDocument();
  });

  it('renders phase label for SCORE_PHASE', () => {
    render(<PhaseIndicator phase="SCORE_PHASE" />);
    expect(screen.getByText('Scoring')).toBeInTheDocument();
  });

  it('renders phase label for ROULETTE_PHASE', () => {
    render(<PhaseIndicator phase="ROULETTE_PHASE" />);
    expect(screen.getByText('Roulette')).toBeInTheDocument();
  });

  it('renders phase label for REWARD_PHASE', () => {
    render(<PhaseIndicator phase="REWARD_PHASE" />);
    expect(screen.getByText('Rewards')).toBeInTheDocument();
  });

  it('renders phase label for SHOP_PHASE', () => {
    render(<PhaseIndicator phase="SHOP_PHASE" />);
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  it('renders phase label for GAME_OVER', () => {
    render(<PhaseIndicator phase="GAME_OVER" />);
    expect(screen.getByText('Game Over')).toBeInTheDocument();
  });

  it('shows icon when showIcon is true', () => {
    render(<PhaseIndicator phase="SLOT_PHASE" showIcon />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<PhaseIndicator phase="SLOT_PHASE" showIcon={false} />);
    expect(screen.queryByText('S')).not.toBeInTheDocument();
  });

  it('applies small size styles', () => {
    render(<PhaseIndicator phase="PLAY_PHASE" size="sm" />);
    expect(screen.getByText('Play Hand')).toHaveClass('text-xs');
  });

  it('applies medium size styles', () => {
    render(<PhaseIndicator phase="PLAY_PHASE" size="md" />);
    expect(screen.getByText('Play Hand')).toHaveClass('text-sm');
  });

  it('applies large size styles', () => {
    render(<PhaseIndicator phase="PLAY_PHASE" size="lg" />);
    expect(screen.getByText('Play Hand')).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PhaseIndicator phase="PLAY_PHASE" className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('shows status dot when showDot is true', () => {
    const { container } = render(<PhaseIndicator phase="PLAY_PHASE" showDot />);
    expect(container.querySelector('.rounded-full.w-2')).toBeInTheDocument();
  });
});
