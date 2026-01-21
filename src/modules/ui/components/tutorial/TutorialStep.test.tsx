/**
 * TutorialStep Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorialStep } from './TutorialStep';

describe('TutorialStep', () => {
  const defaultProps = {
    title: 'Test Step',
    content: 'This is a test step content',
    currentStep: 1,
    totalSteps: 5,
    isFirst: false,
    isLast: false,
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    onSkip: vi.fn(),
  };

  it('should render step title and content', () => {
    render(<TutorialStep {...defaultProps} />);

    expect(screen.getByText('Test Step')).toBeInTheDocument();
    expect(screen.getByText('This is a test step content')).toBeInTheDocument();
  });

  it('should display current step number', () => {
    render(<TutorialStep {...defaultProps} />);

    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('should render progress dots', () => {
    const { container } = render(<TutorialStep {...defaultProps} />);

    const dots = container.querySelectorAll('.rounded-full');
    expect(dots).toHaveLength(5);
  });

  it('should call onNext when Next button is clicked', () => {
    const onNext = vi.fn();

    render(<TutorialStep {...defaultProps} onNext={onNext} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should call onPrevious when Previous button is clicked', () => {
    const onPrevious = vi.fn();

    render(<TutorialStep {...defaultProps} onPrevious={onPrevious} />);

    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('should call onSkip when Skip button is clicked', () => {
    const onSkip = vi.fn();

    render(<TutorialStep {...defaultProps} onSkip={onSkip} showSkip={true} />);

    const skipButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('should disable Previous button on first step', () => {
    render(<TutorialStep {...defaultProps} isFirst={true} />);

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('should show "Finish" instead of "Next" on last step', () => {
    render(<TutorialStep {...defaultProps} isLast={true} />);

    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
  });

  it('should hide Skip button when showSkip is false', () => {
    render(<TutorialStep {...defaultProps} showSkip={false} />);

    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
  });

  it('should render multiline content correctly', () => {
    const multilineContent = 'Line 1\nLine 2\nLine 3';

    render(<TutorialStep {...defaultProps} content={multilineContent} />);

    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
    expect(screen.getByText('Line 3')).toBeInTheDocument();
  });

  it('should apply center position styling', () => {
    const { container } = render(
      <TutorialStep {...defaultProps} position="center" />
    );

    const stepContainer = container.querySelector('.fixed');
    expect(stepContainer).toHaveClass('-translate-x-1/2');
    expect(stepContainer).toHaveClass('-translate-y-1/2');
  });

  it('should apply top position styling', () => {
    const { container } = render(
      <TutorialStep {...defaultProps} position="top" />
    );

    const stepContainer = container.querySelector('.fixed');
    expect(stepContainer).toHaveClass('bottom-full');
  });

  it('should apply bottom position styling', () => {
    const { container } = render(
      <TutorialStep {...defaultProps} position="bottom" />
    );

    const stepContainer = container.querySelector('.fixed');
    expect(stepContainer).toHaveClass('top-full');
  });

  it('should not render arrow for center position', () => {
    const { container } = render(
      <TutorialStep {...defaultProps} position="center" />
    );

    const arrows = container.querySelectorAll('.border-\\[12px\\]');
    expect(arrows).toHaveLength(0);
  });

  it('should render arrow for non-center positions', () => {
    const { container } = render(
      <TutorialStep {...defaultProps} position="top" />
    );

    const arrows = container.querySelectorAll('.border-\\[12px\\]');
    expect(arrows.length).toBeGreaterThan(0);
  });

  it('should highlight completed steps in progress dots', () => {
    const { container } = render(
      <TutorialStep {...defaultProps} currentStep={3} totalSteps={5} />
    );

    const dots = container.querySelectorAll('.rounded-full');

    // First 3 dots should be highlighted (bg-primary)
    expect(dots[0]).toHaveClass('bg-primary');
    expect(dots[1]).toHaveClass('bg-primary');
    expect(dots[2]).toHaveClass('bg-primary');

    // Last 2 dots should not be highlighted (bg-slate-600)
    expect(dots[3]).toHaveClass('bg-slate-600');
    expect(dots[4]).toHaveClass('bg-slate-600');
  });
});
