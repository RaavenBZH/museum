import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MetMuseumRateLimitError } from '@/api/metMuseumErrors';
import type { Artwork } from '@/domain/artwork';
import { buildArtwork } from '@/test/artworkFixture';
import { DiscoveryProvider } from './DiscoveryProvider';
import { SEEN_ARTWORKS_STORAGE_KEY } from './seenArtworksStorage';
import { drawRandomArtwork } from './drawRandomArtwork';
import { fetchDiscoveryArtwork } from './fetchDiscoveryArtwork';
import { useDiscovery } from './useDiscovery';

vi.mock('./drawRandomArtwork', () => ({ drawRandomArtwork: vi.fn() }));
vi.mock('./fetchDiscoveryArtwork', () => ({ fetchDiscoveryArtwork: vi.fn() }));

const drawMock = vi.mocked(drawRandomArtwork);
const openMock = vi.mocked(fetchDiscoveryArtwork);

/** The artwork the probe asks to open by name: what a click in My Gallery does. */
const OPENED_ID = 4;

/** Every read of a named artwork is held open too, until the test answers it. */
let pendingOpens: {
  resolve: (artwork: Artwork | null) => void;
  reject: (cause: unknown) => void;
}[] = [];

async function completeOpen(artwork: Artwork | null) {
  const opening = pendingOpens.shift();

  if (opening === undefined) {
    throw new Error('No artwork is being opened.');
  }

  await act(async () => {
    opening.resolve(artwork);
  });
}

async function failOpen(cause: unknown) {
  const opening = pendingOpens.shift();

  if (opening === undefined) {
    throw new Error('No artwork is being opened.');
  }

  await act(async () => {
    opening.reject(cause);
  });
}

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
  const {
    hasStarted,
    artwork,
    isDrawing,
    isAwaitingNext,
    nextImageUrl,
    seen,
    error,
    openFailure,
    start,
    next,
    retry,
    open,
  } = useDiscovery();

  return (
    <div>
      <p>started: {String(hasStarted)}</p>
      <p>artwork: {artwork === null ? 'none' : artwork.title}</p>
      <p>drawing: {String(isDrawing)}</p>
      <p>awaiting: {String(isAwaitingNext)}</p>
      <p>next picture: {nextImageUrl ?? 'none'}</p>
      <p>seen: {seen.map((kept) => kept.title).join(' · ') || 'none'}</p>
      <p>error: {error ?? 'none'}</p>
      <p>open error: {openFailure === null ? 'none' : openFailure.message}</p>
      <p>failed artwork: {openFailure === null ? 'none' : openFailure.artworkId}</p>
      <button type="button" onClick={start}>
        start
      </button>
      <button type="button" onClick={next}>
        next
      </button>
      <button type="button" onClick={retry}>
        retry
      </button>
      <button type="button" onClick={() => open(OPENED_ID)}>
        open
      </button>
      <button type="button" onClick={() => open(2)}>
        open the held one
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
const irises = buildArtwork({ id: OPENED_ID, title: 'Irises' });

/** Irises, as an earlier visit left it in storage. */
function rememberIrises() {
  localStorage.setItem(
    SEEN_ARTWORKS_STORAGE_KEY,
    JSON.stringify([
      {
        id: OPENED_ID,
        title: 'Irises',
        artistName: null,
        displayDate: null,
        beginYear: null,
        medium: null,
        imageUrl: null,
        repository: null,
        size: null,
      },
    ]),
  );
}

beforeEach(() => {
  // What has been seen is kept in storage, which outlives a test: every test
  // starts from a visitor who has seen nothing.
  localStorage.clear();
  pendingDraws = [];
  pendingOpens = [];
  openMock.mockReset();
  openMock.mockImplementation(
    () =>
      new Promise((resolve, reject) => {
        pendingOpens.push({ resolve, reject });
      }),
  );
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

  it('keeps every artwork it reveals, in the order it revealed them', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);
    await completeDraw(sunflowers);

    // The one held behind is not seen until it is shown.
    expect(screen.getByText('seen: The Starry Night')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'next' }));

    expect(screen.getByText('seen: The Starry Night · Sunflowers')).toBeInTheDocument();
  });

  it('writes what it has seen to storage, so the gallery outlives a reload', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);

    const stored = JSON.parse(localStorage.getItem(SEEN_ARTWORKS_STORAGE_KEY) ?? '[]');

    expect(stored).toEqual([expect.objectContaining({ id: 1, title: 'The Starry Night' })]);
  });

  it('reads back what an earlier visit has seen, and never draws it again', async () => {
    localStorage.setItem(
      SEEN_ARTWORKS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 1,
          title: 'The Starry Night',
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

    renderRun();

    expect(screen.getByText('seen: The Starry Night')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(excludedIdsOfDraw(0)).toEqual([1]);
  });

  it('opens a named artwork onto the screen, and draws the next one behind it', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'open' }));

    // Opening starts the run: the draw is for the artwork after this one.
    expect(screen.getByText('started: true')).toBeInTheDocument();
    expect(openMock).toHaveBeenCalledWith(OPENED_ID, expect.anything());
    expect(drawMock).toHaveBeenCalledTimes(1);

    // The draw lands first, and waits behind the artwork being opened.
    await completeDraw(sunflowers);
    expect(screen.getByText('artwork: none')).toBeInTheDocument();
    expect(screen.getByText('drawing: false')).toBeInTheDocument();

    await completeOpen(irises);
    expect(screen.getByText('artwork: Irises')).toBeInTheDocument();
    expect(screen.getByText('seen: Irises')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'next' }));
    expect(screen.getByText('artwork: Sunflowers')).toBeInTheDocument();
  });

  it('keeps an artwork already seen once in the gallery, and leaves the draw in flight alone', async () => {
    rememberIrises();
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);

    // One draw is in flight to refill the buffer.
    expect(drawMock).toHaveBeenCalledTimes(2);

    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await completeOpen(irises);

    expect(screen.getByText('artwork: Irises')).toBeInTheDocument();
    expect(screen.getByText('seen: Irises · The Starry Night')).toBeInTheDocument();
    // Neither what was seen nor what is held changed, so the draw in flight
    // was neither abandoned nor sent a second time.
    expect(drawMock).toHaveBeenCalledTimes(2);
  });

  it('opens the artwork held in advance at once, without reading it again', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);
    await completeDraw(sunflowers);

    await userEvent.click(screen.getByRole('button', { name: 'open the held one' }));

    expect(screen.getByText('artwork: Sunflowers')).toBeInTheDocument();
    expect(openMock).not.toHaveBeenCalled();
  });

  it('reads a named artwork once, however many times it is asked for', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await userEvent.click(screen.getByRole('button', { name: 'open' }));

    expect(openMock).toHaveBeenCalledTimes(1);

    await completeOpen(irises);
    await userEvent.click(screen.getByRole('button', { name: 'open' }));

    // Already on screen: nothing to read.
    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it('says why an artwork could not be opened, and lets the run go on', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await failOpen(new MetMuseumRateLimitError('any-url'));

    expect(screen.getByText(/open error: The museum is refusing calls/)).toBeInTheDocument();
    expect(screen.getByText('error: none')).toBeInTheDocument();

    // The draw that started with it lands on screen, since nothing holds its place.
    await completeDraw(sunflowers);
    expect(screen.getByText('artwork: Sunflowers')).toBeInTheDocument();
  });

  it('shows the draw that waited behind a failed opening, without drawing again', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'open' }));

    // The draw lands first and waits behind the artwork being opened.
    await completeDraw(sunflowers);
    expect(drawMock).toHaveBeenCalledTimes(1);

    await failOpen(new MetMuseumRateLimitError('any-url'));

    // The place it was waiting for is free: it takes it at once, and only the
    // slot behind it is refilled.
    expect(screen.getByText('artwork: Sunflowers')).toBeInTheDocument();
    expect(screen.getByText('drawing: false')).toBeInTheDocument();
    expect(drawMock).toHaveBeenCalledTimes(2);
  });

  it('leaves the draw in flight alone when an artwork never seen is opened', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);

    // One draw is in flight, to refill the buffer.
    expect(drawMock).toHaveBeenCalledTimes(2);
    const inFlight = drawMock.mock.calls[1][0].signal;

    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await completeOpen(irises);

    // Irises joins what was seen, which used to restart the draw: the call on
    // its way was abandoned and a second one sent.
    expect(screen.getByText('seen: The Starry Night · Irises')).toBeInTheDocument();
    expect(inFlight?.aborted).toBe(false);
    expect(drawMock).toHaveBeenCalledTimes(2);
  });

  it('drops a draw that brings back the artwork just opened, and draws again', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
    await completeDraw(starryNight);
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await completeOpen(irises);

    // The draw started before Irises was opened did not know to exclude it.
    await completeDraw(irises);

    expect(screen.getByText('seen: The Starry Night · Irises')).toBeInTheDocument();
    expect(screen.getByText('next picture: none')).toBeInTheDocument();
    expect(drawMock).toHaveBeenCalledTimes(3);
    expect(excludedIdsOfDraw(2)).toEqual(expect.arrayContaining([starryNight.id, irises.id]));
  });

  it('names the artwork a failure belongs to', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await failOpen(new MetMuseumRateLimitError('any-url'));

    expect(screen.getByText(`failed artwork: ${OPENED_ID}`)).toBeInTheDocument();
  });

  it('refuses to open an artwork the museum serves no picture for', async () => {
    renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await completeOpen(null);

    expect(screen.getByText(/open error: The museum serves no picture/)).toBeInTheDocument();
    expect(screen.getByText('seen: none')).toBeInTheDocument();
  });

  it('abandons the read of a named artwork when it is unmounted', async () => {
    const { unmount } = renderRun();
    await userEvent.click(screen.getByRole('button', { name: 'open' }));

    const [, options] = openMock.mock.calls[0];

    unmount();

    expect(options?.signal?.aborted).toBe(true);
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
