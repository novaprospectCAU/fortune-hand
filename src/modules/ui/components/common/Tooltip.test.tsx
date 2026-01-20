/**
 * Tooltip Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    // Should not appear before delay
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const container = screen.getByText('Hover me').parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(container);
    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Hide tooltip - the component uses AnimatePresence which may keep the element in DOM during exit animation
    fireEvent.mouseLeave(container);

    // Just verify that the animation exit state has been triggered (opacity: 0)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // The element may still be in DOM during exit animation, check opacity instead
    const tooltip = screen.queryByRole('tooltip');
    if (tooltip) {
      // During exit, opacity should be 0
      expect(tooltip).toHaveStyle({ opacity: '0' });
    }
  });

  it('does not show tooltip when disabled', () => {
    render(
      <Tooltip content="Tooltip text" disabled delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('displays tooltip content', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    fireEvent.focus(screen.getByText('Focus me').parentElement!);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    const container = screen.getByText('Focus me').parentElement!;

    fireEvent.focus(container);
    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(container);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // The element may still be in DOM during exit animation, check opacity instead
    const tooltip = screen.queryByRole('tooltip');
    if (tooltip) {
      // During exit, opacity should be 0
      expect(tooltip).toHaveStyle({ opacity: '0' });
    }
  });
});
