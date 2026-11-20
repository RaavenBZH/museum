import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { MediumCount } from '@/domain/galleryInsights';
import { MediumPieChart } from './MediumPieChart';

const ROWS: MediumCount[] = [
  { key: 'oil on canvas', label: 'Oil on canvas', count: 18 },
  { key: 'oil on wood', label: 'Oil on wood', count: 5 },
  { key: 'other-mediums', label: '3 other mediums', count: 4 },
];

describe('MediumPieChart', () => {
  it('names every slice in words with its count, so no slice is read from its colour', () => {
    render(<MediumPieChart rows={ROWS} />);

    const legend = screen.getByRole('list');
    const entries = within(legend).getAllByRole('listitem');

    expect(entries).toHaveLength(3);
    expect(entries[0]).toHaveTextContent('Oil on canvas18');
    expect(entries[2]).toHaveTextContent('3 other mediums4');
  });

  it('draws one slice per medium, the most frequent in the accent, parted by the surface', () => {
    const { container } = render(<MediumPieChart rows={ROWS} />);
    const slices = [...container.querySelectorAll('.recharts-pie-sector path')];

    expect(slices).toHaveLength(3);
    expect(slices[0]).toHaveAttribute('fill', 'var(--color-accent)');
    expect(slices[0]).toHaveAttribute('stroke', 'var(--color-surface)');
  });

  it('gives each legend entry the fill of its own slice', () => {
    const { container } = render(<MediumPieChart rows={ROWS} />);
    const swatches = [...container.querySelectorAll<HTMLElement>('.medium-pie-chart__swatch')];
    const slices = [...container.querySelectorAll('.recharts-pie-sector path')];

    expect(swatches.map((swatch) => swatch.style.background)).toEqual(
      slices.map((slice) => slice.getAttribute('fill')),
    );
  });

  it('puts no keyboard stop in the drawing, which the legend already reads out', () => {
    const { container } = render(<MediumPieChart rows={ROWS} />);

    expect(container.querySelector('.medium-pie-chart__plot')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(container.querySelector('[tabindex]:not([tabindex="-1"])')).toBeNull();
  });
});
