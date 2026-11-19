import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SeenArtwork } from '@/domain/seenArtwork';
import { DiscoveryContext, type DiscoveryContextValue } from '@/hooks/DiscoveryContext';
import { useDiscoveryCollectionSize } from '@/hooks/useDiscoveryCollectionSize';
import { GalleryPage } from './GalleryPage';

vi.mock('@/hooks/useDiscoveryCollectionSize', () => ({
  useDiscoveryCollectionSize: vi.fn(),
}));

const sizeMock = vi.mocked(useDiscoveryCollectionSize);

function seenArtwork(id: number, title: string): SeenArtwork {
  return {
    id,
    title,
    artistName: 'Vincent van Gogh',
    displayDate: '1889',
    imageUrl: null,
    repository: 'Metropolitan Museum of Art, New York, NY',
    size: null,
  };
}

const SEEN = [seenArtwork(1, 'The Starry Night'), seenArtwork(2, 'Sunflowers')];

/**
 * The screen is a container: the run and the collection size are written by
 * hand, so each of its states is reachable without the museum.
 */
function renderPage({
  seen = SEEN,
  size = {},
}: {
  seen?: readonly SeenArtwork[];
  size?: Partial<ReturnType<typeof useDiscoveryCollectionSize>>;
} = {}) {
  const collectionSize = { collectionSize: 2650, error: null, retry: vi.fn(), ...size };
  const discovery: DiscoveryContextValue = {
    hasStarted: true,
    artwork: null,
    isDrawing: false,
    isAwaitingNext: false,
    nextImageUrl: null,
    seen,
    error: null,
    openFailure: null,
    start: vi.fn(),
    next: vi.fn(),
    retry: vi.fn(),
    open: vi.fn(),
  };

  sizeMock.mockReturnValue(collectionSize);
  render(
    <MemoryRouter>
      <DiscoveryContext.Provider value={discovery}>
        <GalleryPage />
      </DiscoveryContext.Provider>
    </MemoryRouter>,
  );

  return collectionSize;
}

describe('GalleryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The layout chosen is kept in storage, which outlives a test.
    localStorage.clear();
  });

  it('opens on how much of the collection has been seen, as the only h1', () => {
    renderPage({ seen: Array.from({ length: 53 }, (_, index) => seenArtwork(index + 1, 'Any')) });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'You have seen 53 artworks.',
    );
  });

  it('says in one line what the count is out of', () => {
    renderPage();

    // [REQ-03]: a visualisation states what it shows and on which sample.
    expect(
      screen.getByText(
        'Out of the 2,650 in European Paintings.',
      ),
    ).toBeInTheDocument();
  });

  it('draws the ring, with what is left under the share', () => {
    renderPage();

    expect(
      screen.getByRole('img', {
        name: '2 of the 2,650 artworks of European Paintings seen, or < 1 %; 2,648 left',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('2,648 left')).toBeInTheDocument();
  });

  it('holds only the ring and the summary, with no progress by collection', () => {
    renderPage();

    expect(screen.queryByRole('heading', { name: 'By collection' })).not.toBeInTheDocument();
    expect(screen.queryByText('2 / 2,650')).not.toBeInTheDocument();
  });

  it('leads back to Discover', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Continue discovering' })).toHaveAttribute(
      'href',
      '/discover',
    );
  });

  it('shows the last artwork seen first', () => {
    renderPage();

    const titles = [...document.querySelectorAll('.seen-artwork-grid__title')].map(
      (title) => title.textContent,
    );

    expect(titles).toEqual(['Sunflowers', 'The Starry Night']);
  });

  it('groups the artworks under the collection they come from', () => {
    renderPage();

    expect(screen.getByRole('region', { name: 'European Paintings' })).toBeInTheDocument();
    expect(screen.getByText('02 artworks')).toBeInTheDocument();
  });

  it('opens on the grid, and switches to the list and back', async () => {
    const user = userEvent.setup();

    renderPage();
    expect(document.querySelector('.seen-artwork-grid')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'List' }));

    expect(document.querySelector('.seen-artwork-list')).toBeInTheDocument();
    expect(document.querySelector('.seen-artwork-grid')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Grid' }));

    expect(document.querySelector('.seen-artwork-grid')).toBeInTheDocument();
  });

  it('opens on the layout the visitor chose last time', async () => {
    const user = userEvent.setup();

    renderPage();
    await user.click(screen.getByRole('button', { name: 'List' }));
    cleanup();

    // A new visit to the screen, as after a trip to Discover or a reload.
    renderPage();

    expect(document.querySelector('.seen-artwork-list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('invites a visitor who has seen nothing to start', () => {
    renderPage({ seen: [] });

    expect(screen.getByRole('heading', { level: 2, name: 'No artwork seen yet.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover');
  });

  it('keeps the gallery on screen while the collection is being counted', () => {
    renderPage({ size: { collectionSize: null } });

    expect(screen.getByRole('status')).toHaveTextContent('Counting the collection…');
    expect(screen.getByRole('region', { name: 'European Paintings' })).toBeInTheDocument();
  });

  it('reports a refusal from the museum, and offers to count again', async () => {
    const user = userEvent.setup();
    const { retry } = renderPage({
      size: { collectionSize: null, error: 'The museum is refusing calls for the moment.' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('The museum is refusing calls');

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
