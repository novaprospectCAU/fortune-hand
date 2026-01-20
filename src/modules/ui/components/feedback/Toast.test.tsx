/**
 * Toast Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast, ToastContainer } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast message', () => {
    render(
      <Toast
        id="test"
        message="Test message"
        isVisible={true}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    render(
      <Toast
        id="test"
        message="Test message"
        isVisible={false}
        onDismiss={() => {}}
      />
    );

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast
        id="test"
        message="Test message"
        isVisible={true}
        onDismiss={handleDismiss}
      />
    );

    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(handleDismiss).toHaveBeenCalledWith('test');
  });

  it('auto-dismisses after duration', async () => {
    const handleDismiss = vi.fn();
    render(
      <Toast
        id="test"
        message="Test message"
        isVisible={true}
        onDismiss={handleDismiss}
        duration={1000}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(handleDismiss).toHaveBeenCalledWith('test');
  });

  it('does not auto-dismiss when duration is 0', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast
        id="test"
        message="Test message"
        isVisible={true}
        onDismiss={handleDismiss}
        duration={0}
      />
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(handleDismiss).not.toHaveBeenCalled();
  });

  it('applies success variant styles', () => {
    const { container } = render(
      <Toast
        id="test"
        message="Success message"
        variant="success"
        isVisible={true}
        onDismiss={() => {}}
      />
    );

    expect(container.querySelector('.bg-green-900\\/80')).toBeInTheDocument();
  });

  it('applies error variant styles', () => {
    const { container } = render(
      <Toast
        id="test"
        message="Error message"
        variant="error"
        isVisible={true}
        onDismiss={() => {}}
      />
    );

    expect(container.querySelector('.bg-red-900\\/80')).toBeInTheDocument();
  });

  it('applies warning variant styles', () => {
    const { container } = render(
      <Toast
        id="test"
        message="Warning message"
        variant="warning"
        isVisible={true}
        onDismiss={() => {}}
      />
    );

    expect(container.querySelector('.bg-amber-900\\/80')).toBeInTheDocument();
  });

  it('has correct role for accessibility', () => {
    render(
      <Toast
        id="test"
        message="Test message"
        isVisible={true}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const toasts = [
      { id: '1', message: 'Toast 1' },
      { id: '2', message: 'Toast 2' },
      { id: '3', message: 'Toast 3' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={() => {}} />);

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
  });

  it('calls onDismiss with correct id when toast is dismissed', () => {
    const handleDismiss = vi.fn();
    const toasts = [
      { id: '1', message: 'Toast 1' },
      { id: '2', message: 'Toast 2' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={handleDismiss} />);

    const dismissButtons = screen.getAllByLabelText('Dismiss notification');
    fireEvent.click(dismissButtons[0]!);

    expect(handleDismiss).toHaveBeenCalledWith('1');
  });

  it('renders empty when no toasts', () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={() => {}} />
    );

    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });

  it('applies position class for top-right', () => {
    const { container } = render(
      <ToastContainer
        toasts={[{ id: '1', message: 'Test' }]}
        onDismiss={() => {}}
        position="top-right"
      />
    );

    expect(container.firstChild).toHaveClass('top-4', 'right-4');
  });

  it('applies position class for bottom-left', () => {
    const { container } = render(
      <ToastContainer
        toasts={[{ id: '1', message: 'Test' }]}
        onDismiss={() => {}}
        position="bottom-left"
      />
    );

    expect(container.firstChild).toHaveClass('bottom-4', 'left-4');
  });
});
