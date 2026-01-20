/**
 * useTooltip Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTooltip, useTooltipGroup } from './useTooltip';

describe('useTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with tooltip hidden', () => {
    const { result } = renderHook(() => useTooltip());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.coordinates).toBe(null);
  });

  it('shows tooltip after delay when show is called', () => {
    const { result } = renderHook(() =>
      useTooltip({ showDelay: 100 })
    );

    act(() => {
      result.current.show();
    });

    expect(result.current.isVisible).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('hides tooltip when hide is called', () => {
    const { result } = renderHook(() =>
      useTooltip({ showDelay: 0, hideDelay: 0 })
    );

    act(() => {
      result.current.show();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.hide();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('does not show tooltip when disabled', () => {
    const { result } = renderHook(() =>
      useTooltip({ disabled: true, showDelay: 0 })
    );

    act(() => {
      result.current.show();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('toggles tooltip visibility', () => {
    const { result } = renderHook(() =>
      useTooltip({ showDelay: 0, hideDelay: 0 })
    );

    act(() => {
      result.current.toggle();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.toggle();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('returns correct triggerProps', () => {
    const { result } = renderHook(() => useTooltip());

    expect(result.current.triggerProps).toHaveProperty('ref');
    expect(result.current.triggerProps).toHaveProperty('onMouseEnter');
    expect(result.current.triggerProps).toHaveProperty('onMouseLeave');
    expect(result.current.triggerProps).toHaveProperty('onFocus');
    expect(result.current.triggerProps).toHaveProperty('onBlur');
  });

  it('returns unique tooltipId', () => {
    const { result: result1 } = renderHook(() => useTooltip());
    const { result: result2 } = renderHook(() => useTooltip());

    expect(result1.current.tooltipId).not.toBe(result2.current.tooltipId);
    expect(result1.current.tooltipId).toMatch(/^tooltip-\d+$/);
  });

  it('cancels pending show on hide', () => {
    const { result } = renderHook(() =>
      useTooltip({ showDelay: 100 })
    );

    act(() => {
      result.current.show();
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      result.current.hide();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('uses default position', () => {
    const { result } = renderHook(() =>
      useTooltip({ position: 'bottom' })
    );

    expect(result.current.position).toBe('bottom');
  });
});

describe('useTooltipGroup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no active tooltip', () => {
    const { result } = renderHook(() => useTooltipGroup());

    expect(result.current.activeId).toBe(null);
  });

  it('shows registered tooltip when show is called', () => {
    const { result } = renderHook(() =>
      useTooltipGroup({ showDelay: 0 })
    );

    const tooltip1 = result.current.register('tooltip-1');

    act(() => {
      tooltip1.show();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.activeId).toBe('tooltip-1');
  });

  it('only shows one tooltip at a time', () => {
    const { result } = renderHook(() =>
      useTooltipGroup({ showDelay: 0 })
    );

    const tooltip1 = result.current.register('tooltip-1');
    const tooltip2 = result.current.register('tooltip-2');

    act(() => {
      tooltip1.show();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.activeId).toBe('tooltip-1');

    act(() => {
      tooltip2.show();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.activeId).toBe('tooltip-2');
  });

  it('hides tooltip when hide is called', () => {
    const { result } = renderHook(() =>
      useTooltipGroup({ showDelay: 0, hideDelay: 0 })
    );

    const tooltip1 = result.current.register('tooltip-1');

    act(() => {
      tooltip1.show();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.activeId).toBe('tooltip-1');

    act(() => {
      tooltip1.hide();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.activeId).toBe(null);
  });

  it('hideAll hides all tooltips', () => {
    const { result } = renderHook(() =>
      useTooltipGroup({ showDelay: 0 })
    );

    const tooltip1 = result.current.register('tooltip-1');

    act(() => {
      tooltip1.show();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    act(() => {
      result.current.hideAll();
    });

    expect(result.current.activeId).toBe(null);
  });

  it('registered tooltip reports correct isVisible', () => {
    const { result } = renderHook(() =>
      useTooltipGroup({ showDelay: 0 })
    );

    let tooltip1 = result.current.register('tooltip-1');
    let tooltip2 = result.current.register('tooltip-2');

    expect(tooltip1.isVisible).toBe(false);
    expect(tooltip2.isVisible).toBe(false);

    act(() => {
      tooltip1.show();
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Re-register to get updated values
    tooltip1 = result.current.register('tooltip-1');
    tooltip2 = result.current.register('tooltip-2');

    expect(tooltip1.isVisible).toBe(true);
    expect(tooltip2.isVisible).toBe(false);
  });
});
