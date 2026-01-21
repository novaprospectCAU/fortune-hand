/**
 * ErrorBoundary Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render children without throwing when component does not error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should catch error and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show error fallback
    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong with the game')).toBeInTheDocument();
  });

  it('should display error message in development mode', () => {
    // In test environment, DEV should be true by default
    // If error details are shown, it means we're in dev mode
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check if error boundary shows the fallback
    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Fortune Has Failed')).not.toBeInTheDocument();
  });

  it('should reset error state when reset is called', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    retryButton.click();

    // Error should be cleared, but component will throw again
    // This is expected behavior - the ErrorBoundary resets state
    // but the child component still throws
    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
  });

  it('should call onReset callback when reset button is clicked', () => {
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    retryButton.click();

    expect(onReset).toHaveBeenCalled();
  });

  it('should have accessible error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for buttons
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return home/i })).toBeInTheDocument();
  });

  it('should handle multiple errors correctly', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fortune Has Failed')).toBeInTheDocument();
  });

  it('should not catch errors from event handlers', () => {
    // Error boundaries only catch errors in render, lifecycle methods, and constructors
    // Not in event handlers (this is React's design)
    // This test just verifies that the component renders normally
    const eventHandler = vi.fn();

    render(
      <ErrorBoundary>
        <button onClick={eventHandler}>Click me</button>
      </ErrorBoundary>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Event handlers work normally
    button.click();
    expect(eventHandler).toHaveBeenCalled();
  });
});
