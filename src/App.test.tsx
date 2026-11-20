import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { ThemeProvider } from '@/hooks/ThemeProvider';
import { DiscoveryProvider } from '@/hooks/DiscoveryProvider';
import { drawRandomArtwork } from '@/hooks/drawRandomArtwork';
import { fetchDiscoveryArtwork } from '@/hooks/fetchDiscoveryArtwork';
import { SEEN_ARTWORKS_STORAGE_KEY } from '@/hooks/seenArtworksStorage';
import { buildArtwork } from '@/test/artworkFixture';

// The museum is never called: the shell is being tested, not the transport.
vi.mock('@/hooks/drawRandomArtwork', () => ({ drawRandomArtwork: vi.fn() }));
vi.mock('@/hooks/fetchDiscoveryArtwork', () => ({ fetchDiscoveryArtwork: vi.fn() }));
vi.mock('@/api/metMuseumObjects', () => ({
  fetchObjectIds: vi.fn(async () => ({ total: 2650, objectIDs: [] })),
}));

const drawMock = vi.mocked(drawRandomArtwork);
const openMock = vi.mocked(fetchDiscoveryArtwork);
const starryNight = buildArtwork({ id: 1, title: 'The Starry Night' });
const sunflowers = buildArtwork({ id: 2, title: 'Sunflowers' });
const irises = buildArtwork({ id: 3, title: 'Irises', artistName: 'Vincent van Gogh' });

/** The shell reads the display mode, the address and the discovery run. */
function renderApp(address = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[address]}>
        <DiscoveryProvider>
          <App />
        </DiscoveryProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

/** Lets the draws that are in flight land. */
async function settleDraws() {
  await act(async () => {});
}

beforeEach(() => {
  // What has been seen outlives a test in storage; every test starts afresh.
  localStorage.clear();
  // Reset first: a draw a test did not use would otherwise be handed to the
  // next test as its first one.
  drawMock.mockReset();
  drawMock.mockResolvedValueOnce(starryNight).mockResolvedValueOnce(sunflowers);
  openMock.mockReset();
  openMock.mockResolvedValue(irises);
});

describe('App', () => {
  it('serves the home page at the root, and draws nothing there', async () => {
    renderApp('/');
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Discover art.');
    expect(drawMock).not.toHaveBeenCalled();
  });

  it('draws an artwork as soon as the discovery address is opened', async () => {
    renderApp('/discover');
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Starry Night');
  });

  it('serves the "not found" screen at an address it does not know', async () => {
    renderApp('/nowhere');
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'This page does not exist.',
    );
  });

  it('serves the collection chart at the gallery address, loaded on demand', async () => {
    renderApp('/gallery');

    // The screen that carries the charting library is behind `lazy`, so it
    // arrives after its chunk does — which, with the whole suite running at
    // once, can take longer than the default second.
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: /You have seen \d+ artworks?\./ },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    // Nothing is drawn there: the gallery shows what was seen, it draws nothing.
    expect(drawMock).not.toHaveBeenCalled();
  });

  it('opens the artwork an address names, and draws the next one behind it', async () => {
    renderApp('/discover/3');
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Irises');
    expect(openMock).toHaveBeenCalledWith(3, expect.anything());
    // The run starts behind it, so the next artwork is ready when asked for;
    // the drawn one waits its turn rather than taking the screen.
    expect(drawMock).toHaveBeenCalledTimes(1);
  });

  it('opens an artwork of the home page on Discover, never on the "not found" screen', async () => {
    const wheatField = buildArtwork({ id: 436535, title: 'Wheat Field with Cypresses' });

    openMock.mockResolvedValue(wheatField);
    renderApp('/');

    await userEvent.click(
      screen.getByRole('link', { name: 'Wheat Field with Cypresses, Vincent van Gogh, 1889' }),
    );
    await settleDraws();

    expect(openMock).toHaveBeenCalledWith(436535, expect.anything());
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Wheat Field with Cypresses',
    );
  });

  it('opens an artwork of My Gallery on Discover when it is clicked', async () => {
    localStorage.setItem(
      SEEN_ARTWORKS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 3,
          title: 'Irises',
          artistName: 'Vincent van Gogh',
          displayDate: '1889',
          beginYear: 1889,
          medium: 'Oil on canvas',
          imageUrl: null,
          repository: null,
          size: null,
        },
      ]),
    );
    renderApp('/gallery');

    await userEvent.click(
      await screen.findByRole('link', { name: 'Irises, Vincent van Gogh, 1889' }),
    );
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Irises');
  });

  it('marks the current destination from the address itself', async () => {
    renderApp('/discover');
    await settleDraws();

    // "Discover" and "My Gallery" also name buttons and tiles, so the bar is
    // asked on its own.
    const bar = within(screen.getByRole('navigation', { name: 'Main navigation' }));

    expect(bar.getByRole('link', { name: 'Discover' })).toHaveAttribute('aria-current', 'page');
    expect(bar.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(bar.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('keeps the artwork on the way to the home page and back, without drawing again', async () => {
    renderApp('/discover');
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Starry Night');

    const bar = () => within(screen.getByRole('navigation', { name: 'Main navigation' }));

    await userEvent.click(bar().getByRole('link', { name: 'Home' }));
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Discover art.');

    await userEvent.click(bar().getByRole('link', { name: 'Discover' }));
    await settleDraws();

    // The same artwork, and no third call: the run is held above the router,
    // and moving between screens never reloads the application.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Starry Night');
    expect(drawMock).toHaveBeenCalledTimes(2);
  });

  it('keeps the artwork on the way out through the home page button too', async () => {
    renderApp('/discover');
    await settleDraws();

    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('link', {
        name: 'Home',
      }),
    );
    await settleDraws();

    // The home page's own button, not the one in the bar above it.
    await userEvent.click(
      within(screen.getByRole('main')).getByRole('link', { name: 'Discover' }),
    );
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Starry Night');
    expect(drawMock).toHaveBeenCalledTimes(2);
  });
});
