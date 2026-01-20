/**
 * GoldDisplay Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoldDisplay } from './GoldDisplay';

describe('GoldDisplay', () => {
  it('renders gold amount', () => {
    render(<GoldDisplay amount={100} />);
    expect(screen.getByLabelText('100 gold')).toBeInTheDocument();
  });

  it('renders gold icon when showIcon is true', () => {
    render(<GoldDisplay amount={100} showIcon />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('hides gold icon when showIcon is false', () => {
    render(<GoldDisplay amount={100} showIcon={false} />);
    expect(screen.queryByText('$')).not.toBeInTheDocument();
  });

  it('formats amount with locale separators', () => {
    render(<GoldDisplay amount={1234567} />);
    expect(screen.getByLabelText('1234567 gold')).toBeInTheDocument();
  });

  it('applies small size styles', () => {
    render(<GoldDisplay amount={100} size="sm" />);
    expect(screen.getByLabelText('100 gold')).toHaveClass('text-sm');
  });

  it('applies medium size styles', () => {
    render(<GoldDisplay amount={100} size="md" />);
    expect(screen.getByLabelText('100 gold')).toHaveClass('text-lg');
  });

  it('applies large size styles', () => {
    render(<GoldDisplay amount={100} size="lg" />);
    expect(screen.getByLabelText('100 gold')).toHaveClass('text-2xl');
  });

  it('applies amber color to amount', () => {
    render(<GoldDisplay amount={100} />);
    expect(screen.getByLabelText('100 gold')).toHaveClass('text-amber-400');
  });

  it('applies custom className', () => {
    render(<GoldDisplay amount={100} className="custom-class" />);
    expect(screen.getByLabelText('100 gold').parentElement).toHaveClass('custom-class');
  });

  it('handles zero amount', () => {
    render(<GoldDisplay amount={0} />);
    expect(screen.getByLabelText('0 gold')).toBeInTheDocument();
  });

  it('handles negative amount', () => {
    render(<GoldDisplay amount={-50} />);
    expect(screen.getByLabelText('-50 gold')).toBeInTheDocument();
  });
});
