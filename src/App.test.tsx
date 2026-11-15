import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { DiscoveryProvider } from '@/hooks/DiscoveryProvider';
import { drawRandomArtwork } from '@/hooks/drawRandomArtwork';
import { buildArtwork } from '@/test/artworkFixture';

// The museum is never called: the shell is being tested, not the transport.
vi.mock('@/hooks/drawRandomArtwork', () => ({ drawRandomArtwork: vi.fn() }));

const drawMock = vi.mocked(drawRandomArtwork);
const starryNight = buildArtwork({ id: 1, title: 'The Starry Night' });
const sunflowers = buildArtwork({ id: 2, title: 'Sunflowers' });

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
  drawMock.mockResolvedValueOnce(starryNight).mockResolvedValueOnce(sunflowers);
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
    renderApp('/gallery');
    await settleDraws();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'This page does not exist.',
    );
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
