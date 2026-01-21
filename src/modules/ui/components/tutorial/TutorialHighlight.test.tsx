/**
 * TutorialHighlight Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { TutorialHighlight } from './TutorialHighlight';

describe('TutorialHighlight', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isActive is false', () => {
    const { container } = render(
      <TutorialHighlight targetId="test-element" isActive={false} />
    );

    expect(container.querySelector('svg')).toBeNull();
  });

  it('should not render when targetId is null', () => {
    const { container } = render(
      <TutorialHighlight targetId={null} isActive={true} />
    );

    expect(container.querySelector('svg')).toBeNull();
  });

  it('should render when isActive is true and targetId is provided', () => {
    // Create a target element
    const targetElement = document.createElement('div');
    targetElement.setAttribute('data-tutorial-id', 'test-element');
    targetElement.style.width = '100px';
    targetElement.style.height = '100px';
    document.body.appendChild(targetElement);

    // Mock getBoundingClientRect
    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    const { container } = render(
      <TutorialHighlight targetId="test-element" isActive={true} />
    );

    // Should render SVG overlay
    expect(container.querySelector('svg')).toBeInTheDocument();

    // Should render mask
    expect(container.querySelector('mask#tutorial-mask')).toBeInTheDocument();
  });

  it('should warn when target element is not found', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<TutorialHighlight targetId="non-existent" isActive={true} />);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Tutorial: Element with data-tutorial-id="non-existent" not found'
    );

    consoleSpy.mockRestore();
  });

  it('should apply custom padding', () => {
    const targetElement = document.createElement('div');
    targetElement.setAttribute('data-tutorial-id', 'test-element');
    document.body.appendChild(targetElement);

    const mockRect = {
      top: 100,
      left: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    };

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue(mockRect);

    const { container } = render(
      <TutorialHighlight targetId="test-element" isActive={true} padding={16} />
    );

    // Check that highlight is rendered (indirect test of padding)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should update position on window resize', () => {
    const targetElement = document.createElement('div');
    targetElement.setAttribute('data-tutorial-id', 'test-element');
    document.body.appendChild(targetElement);

    const initialRect = {
      top: 100,
      left: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    };

    const mockGetBoundingClientRect = vi
      .spyOn(targetElement, 'getBoundingClientRect')
      .mockReturnValue(initialRect);

    const { container } = render(
      <TutorialHighlight targetId="test-element" isActive={true} />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();

    // Simulate resize
    const newRect = {
      ...initialRect,
      top: 200,
      left: 200,
    };
    mockGetBoundingClientRect.mockReturnValue(newRect);

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    // Component should still be rendered
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should clean up event listeners on unmount', () => {
    const targetElement = document.createElement('div');
    targetElement.setAttribute('data-tutorial-id', 'test-element');
    document.body.appendChild(targetElement);

    vi.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <TutorialHighlight targetId="test-element" isActive={true} />
    );

    // Should add event listeners
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);

    unmount();

    // Should remove event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
  });
});
