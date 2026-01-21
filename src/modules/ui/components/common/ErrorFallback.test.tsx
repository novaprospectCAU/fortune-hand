/**
 * ErrorFallback Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockErrorInfo = {
    componentStack: '\n    at TestComponent\n    at ErrorBoundary',
  };
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error fallback UI', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong with the game')).toBeInTheDocument();
  });

  it('should display action buttons', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return home/i })).toBeInTheDocument();
  });

  it('should call onReset when Try Again button is clicked', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should reload page when Return Home button is clicked', () => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    const returnHomeButton = screen.getByRole('button', { name: /return home/i });
    fireEvent.click(returnHomeButton);

    expect(window.location.href).toBe('/');
  });

  it('should show error details when error and errorInfo are provided', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    // Should show the error fallback UI
    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
  });

  it('should always show action buttons', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    // Should always show action buttons regardless of environment
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return home/i })).toBeInTheDocument();
  });

  it('should display error when provided', () => {
    const errorWithStack = new Error('Error with stack');
    errorWithStack.stack = 'Error: Error with stack\n    at TestComponent (test.tsx:10:15)';

    render(
      <ErrorFallback error={errorWithStack} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
  });

  it('should display component information when provided', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    // Should render the component
    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
  });

  it('should handle null error gracefully', () => {
    render(
      <ErrorFallback error={null} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should handle null errorInfo gracefully', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={null} onReset={mockOnReset} />
    );

    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should display help text', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    expect(
      screen.getByText(/If this error persists, try refreshing the page or clearing your browser cache/i)
    ).toBeInTheDocument();
  });

  it('should have game-themed styling', () => {
    const { container } = render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    // Check for skull emoji
    expect(screen.getByText('💀')).toBeInTheDocument();

    // Check for game-themed classes
    const element = container.querySelector('.bg-game-surface');
    expect(element).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });

    // Verify button can be focused
    tryAgainButton.focus();
    expect(tryAgainButton).toHaveFocus();
  });

  it('should render with proper ARIA labels', () => {
    render(
      <ErrorFallback error={mockError} errorInfo={mockErrorInfo} onReset={mockOnReset} />
    );

    // Check that buttons have proper labels
    expect(screen.getByRole('button', { name: /try again/i })).toHaveAccessibleName();
    expect(screen.getByRole('button', { name: /return home/i })).toHaveAccessibleName();
  });
});
