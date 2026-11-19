import { render as renderInDocument, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { SeenArtwork } from '@/domain/seenArtwork';
import { SeenArtworkGrid } from './SeenArtworkGrid';
import { SeenArtworkList } from './SeenArtworkList';

const SEEN: SeenArtwork[] = [
  {
    id: 437984,
    title: 'Wheat Field with Cypresses',
    artistName: 'Vincent van Gogh',
    displayDate: '1889',
    imageUrl: 'https://images.example/wheat.jpg',
    repository: 'Metropolitan Museum of Art, New York, NY',
    size: { heightCm: 73, widthCm: 93.4, depthCm: null },
  },
  {
    id: 1,
    title: 'Saint John',
    artistName: null,
    displayDate: null,
    imageUrl: null,
    repository: null,
    size: null,
  },
];

/** Each card is a router link, so the views are rendered inside a router. */
function render(view: ReactElement) {
  return renderInDocument(<MemoryRouter>{view}</MemoryRouter>);
}

describe.each([
  ['SeenArtworkGrid', SeenArtworkGrid],
  ['SeenArtworkList', SeenArtworkList],
])('%s', (_name, View) => {
  it('shows every artwork, each with its title and who made it when', () => {
    render(<View artworks={SEEN} />);

    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Wheat Field with Cypresses')).toBeInTheDocument();
    expect(within(items[0]).getByText('Vincent van Gogh, 1889')).toBeInTheDocument();
  });

  it('gives the size in centimetres, height first', () => {
    render(<View artworks={SEEN} />);

    expect(screen.getByText('73 × 93.4 cm')).toBeInTheDocument();
  });

  it('says a picture is missing in words that fit the frame', () => {
    render(<View artworks={SEEN} />);

    // The list's thumbnails are 56 and 72 px: the long wording would be cut.
    const wording = View === SeenArtworkList ? 'No image' : 'No image available';

    expect(screen.getByText(wording)).toBeInTheDocument();
  });

  it('words a missing artist the way the rest of the application does', () => {
    render(<View artworks={SEEN} />);

    expect(screen.getByText('Artist unrecorded')).toBeInTheDocument();
  });

  it('opens each artwork on Discover, at its own address', () => {
    render(<View artworks={SEEN} />);

    expect(
      screen.getByRole('link', { name: 'Wheat Field with Cypresses, Vincent van Gogh, 1889' }),
    ).toHaveAttribute('href', '/discover/437984');
    // An artist the museum has not recorded is named as the caption names it.
    expect(screen.getByRole('link', { name: 'Saint John, Artist unrecorded' })).toHaveAttribute(
      'href',
      '/discover/1',
    );
  });

  it('makes the whole card the target, so its picture zooms when it is hovered', () => {
    render(<View artworks={SEEN} />);

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveClass('group');
      expect(link.querySelector('.seen-artwork-picture')).toBeInTheDocument();
    }
  });

  it('names each picture by its artist, title and date', () => {
    // No IntersectionObserver in jsdom, so every picture is loaded at once.
    render(<View artworks={SEEN} />);

    expect(
      screen.getByRole('img', { name: 'Vincent van Gogh, Wheat Field with Cypresses, 1889' }),
    ).toBeInTheDocument();
  });
});

describe('SeenArtworkGrid', () => {
  it('frames each picture at the real proportions of the artwork', () => {
    const { container } = render(<SeenArtworkGrid artworks={SEEN} />);
    const frames = [...container.querySelectorAll<HTMLElement>('.seen-artwork-grid__picture')];

    // The browser writes a ratio back as "1.28 / 1".
    expect(parseFloat(frames[0].style.aspectRatio)).toBeCloseTo(93.4 / 73);
    // Unmeasured: the stage's fallback shape.
    expect(parseFloat(frames[1].style.aspectRatio)).toBeCloseTo(4 / 3);
  });
});

describe('SeenArtworkList', () => {
  it('says where each artwork is kept', () => {
    render(<SeenArtworkList artworks={SEEN} />);

    expect(screen.getByText('Metropolitan Museum of Art, New York, NY')).toBeInTheDocument();
  });

  it('shows which row the pointer is on, a step off the card', () => {
    const { container } = render(<SeenArtworkList artworks={SEEN} />);

    for (const row of container.querySelectorAll('.seen-artwork-list__row')) {
      expect(row).toHaveClass('hover:bg-surface-muted', 'transition-colors');
    }
  });

  it('is one surface card, as the mockup draws it', () => {
    const { container } = render(<SeenArtworkList artworks={SEEN} />);

    expect(container.querySelector('.seen-artwork-list')).toHaveClass('rounded-card', 'bg-surface');
  });
});
