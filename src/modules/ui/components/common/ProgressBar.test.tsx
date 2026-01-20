/**
 * ProgressBar Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders progress bar with correct value', () => {
    render(<ProgressBar value={50} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows label when showLabel is true with percentage format', () => {
    render(<ProgressBar value={50} max={100} showLabel labelFormat="percentage" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows label with value format', () => {
    render(<ProgressBar value={50} max={100} showLabel labelFormat="value" />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('shows label with fraction format', () => {
    render(<ProgressBar value={50} max={100} showLabel labelFormat="fraction" />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('does not exceed 100% width', () => {
    render(<ProgressBar value={150} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '150');
    // The visual bar should be capped at 100%
  });

  it('does not go below 0% width', () => {
    render(<ProgressBar value={-10} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '-10');
    // The visual bar should be capped at 0%
  });

  it('applies primary variant styles by default', () => {
    const { container } = render(<ProgressBar value={50} />);
    const bar = container.querySelector('.bg-primary');
    expect(bar).toBeInTheDocument();
  });

  it('applies success variant styles', () => {
    const { container } = render(<ProgressBar value={50} variant="success" />);
    const bar = container.querySelector('.bg-green-500');
    expect(bar).toBeInTheDocument();
  });

  it('applies warning variant styles', () => {
    const { container } = render(<ProgressBar value={50} variant="warning" />);
    const bar = container.querySelector('.bg-amber-500');
    expect(bar).toBeInTheDocument();
  });

  it('applies danger variant styles', () => {
    const { container } = render(<ProgressBar value={50} variant="danger" />);
    const bar = container.querySelector('.bg-red-500');
    expect(bar).toBeInTheDocument();
  });

  it('applies small size styles', () => {
    const { container } = render(<ProgressBar value={50} size="sm" />);
    const track = container.querySelector('.h-1');
    expect(track).toBeInTheDocument();
  });

  it('applies large size styles', () => {
    const { container } = render(<ProgressBar value={50} size="lg" />);
    const track = container.querySelector('.h-4');
    expect(track).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProgressBar value={50} className="custom-class" />);
    expect(screen.getByRole('progressbar').parentElement).toHaveClass('custom-class');
  });
});
