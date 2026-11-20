import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CenturyCount } from '@/domain/galleryInsights';
import { CenturyComparisonChart } from './CenturyComparisonChart';

const ROWS: CenturyCount[] = [
  { century: 1500, label: '16th c.', collectionCount: 286, seenCount: 1 },
  { century: 1800, label: '19th c.', collectionCount: 960, seenCount: 3 },
];

describe('CenturyComparisonChart', () => {
  it('gives a screen reader every figure as a table, in works, century by century', () => {
    render(<CenturyComparisonChart rows={ROWS} />);

    const table = screen.getByRole('table', { name: 'Your artworks by century' });
    const nineteenth = within(table).getByRole('row', { name: /19th c\./ });

    expect(within(nineteenth).getByText('3')).toBeInTheDocument();
    expect(within(nineteenth).getByText('960')).toBeInTheDocument();
  });

  it('draws one series, so it needs no legend and states no percentage', () => {
    const { container } = render(<CenturyComparisonChart rows={ROWS} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('%');
  });

  it('puts no keyboard stop in the drawing, which the table already reads out', () => {
    const { container } = render(<CenturyComparisonChart rows={ROWS} />);

    expect(container.querySelector('.century-comparison-chart__plot')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(container.querySelector('[tabindex]:not([tabindex="-1"])')).toBeNull();
  });
});
