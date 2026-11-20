import { render, screen } from '@testing-library/react';
import type { TooltipPayloadEntry } from 'recharts';
import { describe, expect, it } from 'vitest';
import { ChartContainer, ChartTooltipContent } from './chart';

const SEEN = { dataKey: 'seen', name: 'seen', value: 3, payload: {} } as TooltipPayloadEntry;
const TRACK = { dataKey: 'track', name: 'track', value: 1, type: 'none', payload: {} } as TooltipPayloadEntry;

describe('ChartTooltipContent', () => {
  it('shows nothing while no mark is hovered', () => {
    const { container } = render(
      <ChartTooltipContent active={false} payload={[SEEN]} describe={() => 'seen'} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('words each hovered mark the way the chart asks, on the inverted pill', () => {
    const { container } = render(
      <ChartTooltipContent
        active
        payload={[SEEN]}
        describe={(value) => `${String(value)} seen`}
      />,
    );

    expect(screen.getByText('3 seen')).toBeInTheDocument();
    expect(container.querySelector('.chart-tooltip')).toHaveClass(
      'rounded-pill',
      'bg-inverse-bg',
      'text-inverse-text',
    );
  });

  it('leaves out a mark drawn only as a ground, such as the track of a ring', () => {
    render(<ChartTooltipContent active payload={[TRACK, SEEN]} describe={(_, item) => item.name} />);

    expect(screen.queryByText('track')).not.toBeInTheDocument();
    expect(screen.getByText('seen')).toBeInTheDocument();
  });

  it('carries no border and no shadow, which the design system does not have', () => {
    const { container } = render(
      <ChartTooltipContent active payload={[SEEN]} describe={() => 'seen'} />,
    );

    expect(container.querySelector('.chart-tooltip')?.className).not.toMatch(/border|shadow/);
  });
});

describe('ChartContainer', () => {
  it('names itself and takes the size its caller gives it', () => {
    const { container } = render(
      <ChartContainer className="h-60 w-full">
        <svg />
      </ChartContainer>,
    );

    expect(container.querySelector('.chart-container')).toHaveClass('h-60', 'w-full');
  });
});
