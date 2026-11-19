import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MetMuseumRateLimitError } from '@/api/metMuseumErrors';
import type { Artwork } from '@/domain/artwork';
import { buildArtwork } from '@/test/artworkFixture';
import { DiscoveryProvider } from './DiscoveryProvider';
import { drawRandomArtwork } from './drawRandomArtwork';
import { useDiscovery } from './useDiscovery';

vi.mock('./drawRandomArtwork', () => ({ drawRandomArtwork: vi.fn() }));

const drawMock = vi.mocked(drawRandomArtwork);

/**
 * Every draw is held open until the test resolves it, so that "the next
 * artwork appears without waiting for a call" can be observed: the assertion
 * is made while the call that refills the buffer is still in flight.
 */
let pendingDraws: {
  resolve: (artwork: Artwork | null) => void;
  reject: (cause: unknown) => void;
}[] = [];

function excludedIdsOfDraw(index: number): readonly number[] {
  return drawMock.mock.calls[index][0].excludedIds;
}

/** Resolves the oldest draw still in flight, and lets React settle. */
async function completeDraw(artwork: Artwork | null) {
  const draw = pendingDraws.shift();

  if (draw === undefined) {
    throw new Error('No draw is in flight.');
  }

  await act(async () => {
    draw.resolve(artwork);
  });
}

async function failDraw(cause: unknown) {
  const draw = pendingDraws.shift();

  if (draw === undefined) {
    throw new Error('No draw is in flight.');
  }

  await act(async () => {
    draw.reject(cause);
  });
}

/** Shows the run as plain text, so the tests read it the way a screen would. */
function DiscoveryProbe() {
  const { hasStarted, artwork, isDrawing, isAwaitingNext, nextImageUrl, error, start, next, retry } =
    useDiscovery();

  return (
    <div>
      <p>started: {String(hasStarted)}</p>
      <p>artwork: {artwork === null ? 'none' : artwork.title}</p>
      <p>drawing: {String(isDrawing)}</p>
      <p>awaiting: {String(isAwaitingNext)}</p>
      <p>next picture: {nextImageUrl ?? 'none'}</p>
      <p>error: {error ?? 'none'}</p>
      <button type="button" onClick={start}>
        start
      </button>
      <button type="button" onClick={next}>
        next
      </button>
      <button type="button" onClick={retry}>
        retry
      </button>
    </div>
  );
}

function renderRun() {
  return render(
    <DiscoveryProvider>
      <DiscoveryProbe />
    </DiscoveryProvider>,
  );
}

const starryNight = buildArtwork({ id: 1, title: 'The Starry Night' });
const sunflowers = buildArtwork({ id: 2, title: 'Sunflowers' });
const cypresses = buildArtwork({ id: 3, title: 'Cypresses' });

beforeEach(() => {
  pendingDraws = [];
  drawMock.mockImplementation(
    () =>
      new Promise((resolve, reject) => {
        pendingDraws.push({ resolve, reject });
      }),
  );
});

describe('DiscoveryProvider', () => {
  it('draws nothing at all before the visitor starts', () => {
    renderRun();

    expect(drawMock).not.toHaveBeenCalled();
    expect(screen.getByText('started: false')).toBeInTheDocument();
    expect(screen.getByText('artwork: none')).toBeInTheDocument();
    expect(screen.getByText('drawing: false')).toBeInTheDocument();
  });

  it('draws two artworks on arrival: the one shown and the one held behind it', async () => {
    renderRun();

    await userEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(drawMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('drawing: true')).toBeInTheDocument();

    await completeDraw(starryNight);

    // The first artwork is on screen, and the second is already being fetched.
    expect(screen.getByText('artwork: The Starry Night')).toBeInTheDocument();
    expect(drawMock).toHaveBeenCalledTimes(2);

    await completeDraw(sunflowers);

    // Two artworks loaded, and no third call: the buffer holds exactly one.
    expect(drawMock).toHaveBeenCalledTimes(2);
  });

  it('shows the artwork held in advance at once, and refills behind it', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);
    await completeDraw(sunflowers);

    await userEvent.click(screen.getByRole('button', { name: 'next' }));

    // Nothing has been resolved since the click: the artwork on screen is the
    // one that was already loaded.
    expect(screen.getByText('artwork: Sunflowers')).toBeInTheDocument();
    expect(screen.getByText('drawing: false')).toBeInTheDocument();

    // And exactly one call was sent, to hold the following one in advance.
    expect(drawMock).toHaveBeenCalledTimes(3);

    await completeDraw(cypresses);

    expect(drawMock).toHaveBeenCalledTimes(3);
  });

  it('never draws an artwork it has shown or is already holding', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(excludedIdsOfDraw(0)).toEqual([]);

    await completeDraw(starryNight);

    expect(excludedIdsOfDraw(1)).toEqual([1]);

    await completeDraw(sunflowers);
    await userEvent.click(screen.getByRole('button', { name: 'next' }));

    expect(excludedIdsOfDraw(2)).toEqual([1, 2]);
  });

  it('keeps the artwork on screen when the visitor moves on before the next one is held', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);

    // The second draw is still in flight when the visitor asks for the next one.
    await userEvent.click(screen.getByRole('button', { name: 'next' }));

    // Nothing is emptied: the artwork stays until its replacement lands.
    expect(screen.getByText('artwork: The Starry Night')).toBeInTheDocument();
    expect(screen.getByText('drawing: false')).toBeInTheDocument();
    expect(screen.getByText('awaiting: true')).toBeInTheDocument();

    await completeDraw(sunflowers);

    expect(screen.getByText('artwork: Sunflowers')).toBeInTheDocument();
    expect(screen.getByText('awaiting: false')).toBeInTheDocument();
  });

  it('never re-issues a draw that is already in flight', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);

    // The buffer is empty again, so one draw is in flight. Asking for the next
    // artwork while it is must not abandon it and send it a second time: the
    // effect's cleanup only fires when its two dependencies change identity,
    // and every dispatch made during a draw keeps them. One `case` of the
    // reducer rebuilding `seenIds` or `ahead` for nothing would double the
    // calls to the museum without a single test failing anywhere else.
    expect(drawMock).toHaveBeenCalledTimes(2);

    await userEvent.click(screen.getByRole('button', { name: 'next' }));

    expect(drawMock).toHaveBeenCalledTimes(2);

    await completeDraw(sunflowers);

    // And once it has landed, exactly one draw is started to refill the buffer.
    expect(drawMock).toHaveBeenCalledTimes(3);
  });

  it('offers the picture of the artwork held in advance, for the screen to fetch', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);

    expect(screen.getByText('next picture: none')).toBeInTheDocument();

    await completeDraw(sunflowers);

    expect(
      screen.getByText(`next picture: ${sunflowers.imageUrl ?? 'none'}`),
    ).toBeInTheDocument();
  });

  it('starts once: arriving on the screen again draws nothing', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);
    await completeDraw(sunflowers);

    await userEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(screen.getByText('artwork: The Starry Night')).toBeInTheDocument();
    expect(drawMock).toHaveBeenCalledTimes(2);
  });

  it('says which refusal the museum answered with, and draws again on retry', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await failDraw(new MetMuseumRateLimitError('https://collectionapi.metmuseum.org/'));

    expect(screen.getByText(/error: The museum is refusing calls/)).toBeInTheDocument();
    expect(screen.getByText('drawing: false')).toBeInTheDocument();
    expect(drawMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'retry' }));

    expect(screen.getByText('error: none')).toBeInTheDocument();
    expect(drawMock).toHaveBeenCalledTimes(2);

    await completeDraw(starryNight);

    expect(screen.getByText('artwork: The Starry Night')).toBeInTheDocument();
  });

  it('says so when the collection has nothing to draw', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(null);

    expect(
      screen.getByText('error: This collection has no artwork with a picture to show.'),
    ).toBeInTheDocument();
  });

  it('abandons the draw in flight when it is unmounted', async () => {
    const { unmount } = renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));

    unmount();

    // The answer arrives after the screen is gone: nothing must be updated,
    // and React would warn if the provider dispatched here.
    await act(async () => {
      pendingDraws[0].resolve(starryNight);
    });

    expect(drawMock).toHaveBeenCalledTimes(1);
  });
});
