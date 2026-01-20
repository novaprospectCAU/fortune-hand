/**
 * Badge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-slate-600');
  });

  it('applies primary variant styles', () => {
    render(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText('Primary')).toHaveClass('bg-primary');
  });

  it('applies secondary variant styles', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-500');
  });

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-amber-500');
  });

  it('applies danger variant styles', () => {
    render(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText('Danger')).toHaveClass('bg-red-500');
  });

  it('applies rarity styles when rarity is provided', () => {
    const { rerender } = render(<Badge rarity="common">Common</Badge>);
    expect(screen.getByText('Common')).toHaveClass('bg-rarity-common');

    rerender(<Badge rarity="uncommon">Uncommon</Badge>);
    expect(screen.getByText('Uncommon')).toHaveClass('bg-rarity-uncommon');

    rerender(<Badge rarity="rare">Rare</Badge>);
    expect(screen.getByText('Rare')).toHaveClass('bg-rarity-rare');

    rerender(<Badge rarity="legendary">Legendary</Badge>);
    expect(screen.getByText('Legendary')).toHaveClass('bg-rarity-legendary');
  });

  it('applies small size styles', () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
  });

  it('applies medium size styles', () => {
    render(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('px-2', 'py-1', 'text-sm');
  });

  it('applies large size styles', () => {
    render(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1.5', 'text-base');
  });

  it('applies rounded-full when rounded is true', () => {
    render(<Badge rounded>Rounded</Badge>);
    expect(screen.getByText('Rounded')).toHaveClass('rounded-full');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});
