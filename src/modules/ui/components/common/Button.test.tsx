/**
 * Button Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} loading>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button onClick={() => {}} loading>Click me</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(
      <Button onClick={() => {}} variant="primary">Primary</Button>
    );
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button onClick={() => {}} variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });

  it('applies correct size styles', () => {
    const { rerender } = render(
      <Button onClick={() => {}} size="sm">Small</Button>
    );
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5');

    rerender(<Button onClick={() => {}} size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
  });

  it('applies fullWidth style when specified', () => {
    render(<Button onClick={() => {}} fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('has correct accessibility attributes when disabled', () => {
    render(<Button onClick={() => {}} disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeDisabled();
  });
});
