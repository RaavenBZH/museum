import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildArtwork } from '@/test/artworkFixture';
import { CONTEMPLATION_SECONDS } from '@/hooks/useArtworkContemplation';
import { DiscoveryContext, type DiscoveryContextValue } from '@/hooks/DiscoveryContext';
import { DiscoverPage } from './DiscoverPage';

/**
 * The page is a container: it is rendered against a run written by hand, so
 * that each of its states is reachable without the museum. It is served at the
 * two addresses of the application, and `/discover` alone stands in for the
 * run once an artwork's address has been left.
 */
function renderPage(run: Partial<DiscoveryContextValue> = {}, address = '/discover') {
  const discovery: DiscoveryContextValue = {
    hasStarted: true,
    artwork: null,
    isDrawing: false,
    isAwaitingNext: false,
    nextImageUrl: null,
    seen: [],
    error: null,
    openFailure: null,
    start: vi.fn(),
    next: vi.fn(),
    retry: vi.fn(),
    open: vi.fn(),
    ...run,
  };

  render(
    <MemoryRouter initialEntries={[address]}>
      <DiscoveryContext.Provider value={discovery}>
        <Routes>
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/discover/:artworkId" element={<DiscoverPage />} />
          <Route path="/gallery" element={<p>My Gallery screen</p>} />
        </Routes>
      </DiscoveryContext.Provider>
    </MemoryRouter>,
  );

  return discovery;
}

/** The moment the screen gives the visitor to look, without waiting for it. */
function passContemplation() {
  for (let second = 0; second < CONTEMPLATION_SECONDS; second += 1) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
}

describe('DiscoverPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts the run by arriving, with nothing to click', () => {
    const discovery = renderPage({ hasStarted: false, isDrawing: true });

    expect(discovery.start).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Start discovering' })).not.toBeInTheDocument();
  });

  it('goes straight to the artwork of a run already under way', () => {
    renderPage({ hasStarted: true, artwork: buildArtwork() });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Wheat Field with Cypresses',
    );
  });

  it('keeps the artwork on screen while the next one is being drawn', () => {
    renderPage({ hasStarted: true, artwork: buildArtwork(), isAwaitingNext: true });

    // No waiting panel in its place, and the action is shut until it lands.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Wheat Field with Cypresses',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Drawing the next artwork…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discover another' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('shows the artwork, its cartel and the way to the next one', () => {
    renderPage({ hasStarted: true, artwork: buildArtwork() });

    expect(
      screen.getByRole('img', { name: 'Vincent van Gogh, Wheat Field with Cypresses, 1889' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'The essentials' })).toBeInTheDocument();
    expect(screen.getByText('European Paintings')).toBeInTheDocument();
    expect(screen.getByText('Oil on canvas')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'The artist' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'What next?' })).toBeInTheDocument();
  });

  it('keeps the full museum record folded under the cartel, the museum link with it', async () => {
    renderPage({ hasStarted: true, artwork: buildArtwork() });

    expect(screen.getByText('1993.132')).not.toBeVisible();
    expect(screen.queryByRole('link', { name: /View on metmuseum.org/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'See the full record' }));

    expect(screen.getByText('1993.132')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'View on metmuseum.org (opens in a new tab)' }),
    ).toHaveAttribute('href', 'https://www.metmuseum.org/art/collection/search/437984');
  });

  // The clock is faked here, so the click is fired directly: `userEvent`
  // waits on real timers of its own and would never return.
  it('holds the next artwork shut for a moment, then asks the run for it', () => {
    vi.useFakeTimers();

    const discovery = renderPage({ hasStarted: true, artwork: buildArtwork() });
    const action = screen.getByRole('button', { name: 'Discover another' });

    expect(action).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(/Take a moment with this one/)).toBeInTheDocument();

    passContemplation();

    expect(action).not.toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(action);

    expect(discovery.next).toHaveBeenCalledTimes(1);
  });

  it('opens the artwork its address names, rather than starting a draw', () => {
    const discovery = renderPage({ hasStarted: false }, '/discover/437984');

    expect(discovery.open).toHaveBeenCalledWith(437984);
    expect(discovery.start).not.toHaveBeenCalled();
  });

  it('says the artwork is being opened until it is the one on screen', () => {
    // Another artwork is on screen: the one asked for is still being read.
    renderPage({ artwork: buildArtwork({ id: 1, title: 'The Starry Night' }) }, '/discover/437984');

    expect(screen.getByRole('status')).toHaveTextContent('Opening the artwork…');
    expect(screen.queryByText('The Starry Night')).not.toBeInTheDocument();
  });

  it('shows the artwork its address names, with its whole cartel', () => {
    renderPage({ artwork: buildArtwork() }, '/discover/437984');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Wheat Field with Cypresses',
    );
    expect(screen.getByRole('button', { name: 'Discover another' })).toBeInTheDocument();
  });

  it('says plainly when an address names no artwork, and offers the way back', () => {
    const discovery = renderPage({}, '/discover/not-a-number');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'This address names no artwork',
    );
    expect(screen.getByRole('link', { name: 'Back to My Gallery' })).toHaveAttribute(
      'href',
      '/gallery',
    );
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover');
    // Nothing is asked of the museum for an address it could not answer.
    expect(discovery.open).not.toHaveBeenCalled();
  });

  it('says why an artwork could not be opened, and offers the way back', () => {
    renderPage(
      { openFailure: { artworkId: 437984, message: 'The museum has no record for this artwork.' } },
      '/discover/437984',
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This artwork cannot be opened');
    expect(screen.getByRole('alert')).toHaveTextContent('The museum has no record for this artwork.');
    expect(screen.getByRole('link', { name: 'Back to My Gallery' })).toBeInTheDocument();
  });

  it('never shows the failure of another artwork at this address', () => {
    renderPage(
      { openFailure: { artworkId: 123, message: 'The museum has no record for this artwork.' } },
      '/discover/437984',
    );

    // The failure belongs to 123; this address is still opening 437984.
    expect(screen.queryByText('This artwork cannot be opened')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Opening the artwork…');
  });

  it('opens the artwork again on demand, after the museum failed to answer', () => {
    const discovery = renderPage(
      { openFailure: { artworkId: 437984, message: 'The museum is not answering.' } },
      '/discover/437984',
    );

    vi.mocked(discovery.open).mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(discovery.open).toHaveBeenCalledWith(437984);
  });

  it('shows the artwork asked for even when the draw behind it failed', () => {
    renderPage(
      {
        artwork: buildArtwork({ id: 437984, title: 'Wheat Field with Cypresses' }),
        error: 'The museum is not answering.',
      },
      '/discover/437984',
    );

    // That failure belongs to the next artwork, and waits for it to be asked.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Wheat Field with Cypresses',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('returns to the run address when the next artwork is asked for from an artwork', () => {
    vi.useFakeTimers();

    const discovery = renderPage({ artwork: buildArtwork() }, '/discover/437984');

    passContemplation();
    fireEvent.click(screen.getByRole('button', { name: 'Discover another' }));

    expect(discovery.next).toHaveBeenCalledTimes(1);
    // The address names what is on screen, and what comes next is the run's.
    expect(discovery.start).toHaveBeenCalled();
    expect(screen.queryByText('This address names no artwork')).not.toBeInTheDocument();
  });

  it('has the browser fetch the picture of the artwork held in advance', () => {
    renderPage({
      hasStarted: true,
      artwork: buildArtwork(),
      nextImageUrl: 'https://images.metmuseum.org/web/436535.jpg',
    });

    // The record of the next artwork is already in memory; its picture is all
    // that stands between a click and the artwork appearing.
    expect(
      document.head.querySelector(
        'link[rel="preload"][as="image"][href="https://images.metmuseum.org/web/436535.jpg"]',
      ),
    ).toBeInTheDocument();
  });

  it('says the first draw is under way, and announces it as a state', () => {
    renderPage({ hasStarted: true, isDrawing: true });

    const drawing = screen.getByRole('status');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Drawing an artwork…');
    expect(drawing).toHaveAttribute('aria-busy', 'true');
    expect(drawing).toHaveTextContent('Reading the collection');
  });

  it('shows the refusal of the museum, and offers to try again', async () => {
    const discovery = renderPage({
      hasStarted: true,
      error: 'The museum is refusing calls for the moment.',
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'The collection is not answering',
    );
    // A refusal is announced, not only drawn.
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The museum is refusing calls for the moment.',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(discovery.retry).toHaveBeenCalledTimes(1);
  });

  it('shows one first-level heading in every state, and the artwork title is it', () => {
    renderPage({ hasStarted: true, artwork: buildArtwork() });

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
