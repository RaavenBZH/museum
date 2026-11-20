import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GalleryInsights } from './GalleryInsights';

type Props = ComponentProps<typeof GalleryInsights>;

const CENTURIES: NonNullable<Props['centuries']> = [
  { century: 1800, label: '19th c.', collectionCount: 960, seenCount: 2 },
];

function renderInsights(props: Partial<Props> = {}) {
  const values: Props = {
    isOpen: true,
    onToggle: vi.fn(),
    centuries: CENTURIES,
    centuriesError: null,
    onRetryCenturies: vi.fn(),
    mediums: [{ key: 'oil on canvas', label: 'Oil on canvas', count: 2 }],
    ...props,
  };

  render(<GalleryInsights {...values} />);

  return values;
}

describe('GalleryInsights', () => {
  it('stays folded until asked, and names what it unfolds', async () => {
    const user = userEvent.setup();
    const { onToggle } = renderInsights({ isOpen: false });

    const disclosure = screen.getByRole('button', { name: 'More about my gallery' });

    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('heading', { name: 'By century' })).not.toBeInTheDocument();

    await user.click(disclosure);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows the two charts once unfolded, each with the question it answers', () => {
    renderInsights();

    expect(screen.getByRole('button', { name: 'Hide the details' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('heading', { level: 2, name: 'By century' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'By medium' })).toBeInTheDocument();
    expect(
      screen.getByText('Your artworks, by the century they were painted in.'),
    ).toBeInTheDocument();
  });

  it('adds no note under the charts', () => {
    const { container } = render(
      <GalleryInsights
        isOpen
        onToggle={() => {}}
        centuries={CENTURIES}
        centuriesError={null}
        onRetryCenturies={() => {}}
        mediums={[]}
      />,
    );

    expect(container.querySelector('.gallery-insights__note')).toBeNull();
  });

  it('says it is counting while the museum answers', () => {
    renderInsights({ centuries: null });

    expect(screen.getByRole('status')).toHaveTextContent('Counting the paintings of each century…');
  });

  it('reports a refusal from the museum, and counts again on demand', async () => {
    const user = userEvent.setup();
    const { onRetryCenturies } = renderInsights({
      centuries: null,
      centuriesError: 'The museum is not answering.',
    });

    expect(screen.getByRole('alert')).toHaveTextContent('The museum is not answering.');

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetryCenturies).toHaveBeenCalledTimes(1);
  });

  it('says there is nothing to count yet, rather than drawing an empty chart', () => {
    renderInsights({ mediums: [] });

    expect(screen.getByText('Nothing to count yet.')).toBeInTheDocument();
  });
});
