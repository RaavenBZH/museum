import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompletionDonutChart } from './CompletionDonutChart';

function renderRing(share = 0.71) {
  return render(
    <CompletionDonutChart
      share={share}
      shareLabel="71 %"
      remainderLabel="768 left"
      description="1,882 of the 2,650 artworks of European Paintings seen, or 71 %; 768 left"
      tooltip="1,882 of 2,650 seen"
    />,
  );
}

describe('CompletionDonutChart', () => {
  it('states the share in the middle of the ring, as the mockup does', () => {
    renderRing();

    expect(screen.getByText('71 %')).toBeInTheDocument();
  });

  it('says under the share how many artworks are left', () => {
    renderRing();

    expect(screen.getByText('768 left')).toBeInTheDocument();
  });

  it('is one image named by the sentence it draws', () => {
    renderRing();

    expect(screen.getByRole('img')).toHaveAccessibleName(
      '1,882 of the 2,650 artworks of European Paintings seen, or 71 %; 768 left',
    );
  });

  it('keeps the 220 px square of the mockup', () => {
    const { container } = renderRing();
    const ring = container.querySelector<HTMLElement>('.completion-donut-chart');

    expect(ring?.style.width).toBe('160px');
    expect(ring?.style.height).toBe('160px');
  });

  it('draws an accent arc over an unbroken track', () => {
    const { container } = renderRing();
    const fills = [...container.querySelectorAll('.recharts-pie-sector path')].map((sector) =>
      sector.getAttribute('fill'),
    );

    expect(fills).toEqual(['var(--color-surface-muted)', 'var(--color-accent)']);
  });

  it('puts no keyboard stop inside the image, since there is nothing to operate', () => {
    const { container } = renderRing();

    // `-1` takes an element out of the tab order; anything else puts it in.
    expect(container.querySelector('[tabindex]:not([tabindex="-1"])')).toBeNull();
    expect(container.querySelector('[role="application"]')).toBeNull();
  });
});
