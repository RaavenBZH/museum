import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { MediumCount } from '@/domain/galleryInsights';
import { MediumBreakdownChart } from './MediumBreakdownChart';

const ROWS: MediumCount[] = [
  { key: 'oil on canvas', label: 'Oil on canvas', count: 18 },
  { key: 'other-mediums', label: '4 other mediums', count: 9 },
];

describe('MediumBreakdownChart', () => {
  it('names every medium and counts its works', () => {
    render(<MediumBreakdownChart rows={ROWS} />);

    expect(screen.getByText('Oil on canvas')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('4 other mediums')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('draws each bar against the most frequent medium', () => {
    render(<MediumBreakdownChart rows={ROWS} />);

    const bars = [...document.querySelectorAll<HTMLElement>('.medium-breakdown-chart__bar')];

    expect(bars.map((bar) => bar.style.width)).toEqual(['100%', '50%']);
  });
});
