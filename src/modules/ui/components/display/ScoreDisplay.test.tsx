/**
 * ScoreDisplay Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from './ScoreDisplay';

describe('ScoreDisplay', () => {
  it('renders current score', () => {
    render(<ScoreDisplay currentScore={500} targetScore={1000} />);
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('renders target score when showTarget is true', () => {
    render(<ScoreDisplay currentScore={500} targetScore={1000} showTarget />);
    expect(screen.getByText('/ 1,000')).toBeInTheDocument();
  });

  it('hides target score when showTarget is false', () => {
    render(<ScoreDisplay currentScore={500} targetScore={1000} showTarget={false} />);
    expect(screen.queryByText('/ 1,000')).not.toBeInTheDocument();
  });

  it('renders progress bar when showProgress is true', () => {
    const { container } = render(
      <ScoreDisplay currentScore={500} targetScore={1000} showProgress />
    );
    expect(container.querySelector('.bg-game-card')).toBeInTheDocument();
  });

  it('hides progress bar when showProgress is false', () => {
    const { container } = render(
      <ScoreDisplay currentScore={500} targetScore={1000} showProgress={false} />
    );
    // Should not have the progress bar container class
    expect(container.querySelectorAll('.bg-game-card').length).toBe(0);
  });

  it('shows green color when score meets target', () => {
    render(<ScoreDisplay currentScore={1000} targetScore={1000} />);
    expect(screen.getByText('1,000')).toHaveClass('text-green-400');
  });

  it('applies small size styles', () => {
    render(<ScoreDisplay currentScore={500} targetScore={1000} size="sm" />);
    expect(screen.getByText('500')).toHaveClass('text-xl');
  });

  it('applies medium size styles', () => {
    render(<ScoreDisplay currentScore={500} targetScore={1000} size="md" />);
    expect(screen.getByText('500')).toHaveClass('text-3xl');
  });

  it('applies large size styles', () => {
    render(<ScoreDisplay currentScore={500} targetScore={1000} size="lg" />);
    expect(screen.getByText('500')).toHaveClass('text-5xl');
  });

  it('formats numbers with locale separators', () => {
    render(<ScoreDisplay currentScore={1234567} targetScore={10000000} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ScoreDisplay
        currentScore={500}
        targetScore={1000}
        className="custom-class"
      />
    );
    expect(screen.getByText('500').parentElement).toHaveClass('custom-class');
  });
});
