import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { Artwork } from '@/domain/artwork';
import { describeCollectionError } from '@/domain/collectionError';
import { toSeenArtwork, type SeenArtwork } from '@/domain/seenArtwork';
import {
  DiscoveryContext,
  type DiscoveryContextValue,
  type OpenFailure,
} from './DiscoveryContext';
import { drawRandomArtwork } from './drawRandomArtwork';
import { fetchDiscoveryArtwork } from './fetchDiscoveryArtwork';
import { readSeenArtworks, writeSeenArtworks } from './seenArtworksStorage';

/**
 * How many artworks are held beyond the one on screen. One is enough and one
 * is the most that is defensible: the museum blocks a caller that asks too
 * often, so the application keeps exactly what it needs to answer the next
 * click instantly — the visitor's click then costs no wait, and the call it
 * triggers refills the slot while they are reading.
 *
 * Arriving on Discover therefore draws two artworks: the one revealed, and the
 * one waiting behind it.
 */
const ARTWORKS_HELD_AHEAD = 1;

type DiscoveryState = {
  hasStarted: boolean;
  artwork: Artwork | null;
  /** Already loaded, waiting their turn, in the order they will be shown. */
  ahead: Artwork[];
  /**
   * Everything revealed so far, in the order it was revealed, kept across
   * visits: no artwork is drawn twice, and My Gallery shows them all.
   */
  seen: SeenArtwork[];
  /** The visitor asked for the next artwork before one was held in advance. */
  isAwaitingNext: boolean;
  error: string | null;
  /**
   * The artwork the visitor asked to open by name — from My Gallery, or its
   * address — while it is being read. It holds the screen's place: what a draw
   * brings in meanwhile waits behind it instead of taking its spot.
   */
  openingId: number | null;
  /**
   * Which artwork could not be opened, and why. It names the artwork so that a
   * screen at another address never shows a failure that is not its own. It
   * never stops the run.
   */
  openFailure: OpenFailure | null;
  /**
   * How many draws have landed. It is what asks the effect for the next draw:
   * a count changes once per landed draw, where the list of excluded artworks
   * also changes when an artwork is merely opened — and a draw restarted for
   * that would throw away the call already on its way.
   */
  drawsLanded: number;
};

type DiscoveryAction =
  | { type: 'started' }
  | { type: 'drawn'; artwork: Artwork }
  | { type: 'exhausted' }
  | { type: 'failed'; message: string }
  | { type: 'advanced' }
  | { type: 'retried' }
  | { type: 'openRequested'; artworkId: number }
  | { type: 'opened'; artwork: Artwork }
  | { type: 'openFailed'; artworkId: number; message: string };

const INITIAL_STATE: DiscoveryState = {
  hasStarted: false,
  artwork: null,
  ahead: [],
  seen: [],
  isAwaitingNext: false,
  error: null,
  openingId: null,
  openFailure: null,
  drawsLanded: 0,
};

/**
 * `seen` with the artwork added, or the very same list when it is already in
 * it — which is the usual case, since an artwork is opened from the gallery of
 * what has been seen. Keeping the list's identity is what keeps the draw in
 * flight from being abandoned and sent again.
 */
function withSeen(seen: SeenArtwork[], artwork: Artwork): SeenArtwork[] {
  return seen.some((kept) => kept.id === artwork.id) ? seen : [...seen, toSeenArtwork(artwork)];
}

/** `ahead` without that artwork, or the very same list when it is not held. */
function withoutHeld(ahead: Artwork[], artworkId: number): Artwork[] {
  return ahead.some((held) => held.id === artworkId)
    ? ahead.filter((held) => held.id !== artworkId)
    : ahead;
}

function discoveryReducer(state: DiscoveryState, action: DiscoveryAction): DiscoveryState {
  switch (action.type) {
    case 'started':
      return state.hasStarted ? state : { ...state, hasStarted: true };

    case 'drawn': {
      const drawsLanded = state.drawsLanded + 1;
      const { id } = action.artwork;

      // A draw started before an artwork was opened did not know to exclude
      // it, and can bring it back. Shown or held already, it is dropped, and
      // the count asks for another draw in its place.
      if (
        state.artwork?.id === id ||
        state.ahead.some((held) => held.id === id) ||
        state.seen.some((kept) => kept.id === id)
      ) {
        return { ...state, drawsLanded };
      }

      // Straight on screen if nothing is shown yet, or if the visitor is
      // waiting for it; otherwise it waits its turn behind the one on screen.
      // An artwork being opened holds the screen's place: the draw waits
      // behind it, as it would behind an artwork already shown.
      return (state.artwork === null && state.openingId === null) || state.isAwaitingNext
        ? {
            ...state,
            artwork: action.artwork,
            seen: [...state.seen, toSeenArtwork(action.artwork)],
            isAwaitingNext: false,
            error: null,
            drawsLanded,
          }
        : { ...state, ahead: [...state.ahead, action.artwork], error: null, drawsLanded };
    }

    case 'advanced': {
      const [next, ...rest] = state.ahead;

      // Nothing held in advance: the artwork on screen stays there until the
      // draw the effect is about to start lands on it.
      if (next === undefined) {
        return { ...state, isAwaitingNext: true };
      }

      return {
        ...state,
        artwork: next,
        ahead: rest,
        seen: [...state.seen, toSeenArtwork(next)],
      };
    }

    case 'exhausted':
      return { ...state, error: 'This collection has no artwork with a picture to show.' };

    case 'failed':
      return { ...state, error: action.message };

    case 'retried':
      return { ...state, error: null };

    case 'openRequested': {
      const { artworkId } = action;

      // Already on screen, or already being read: asking again — a remount, a
      // second click, React's own double effect in development — costs nothing.
      if (state.artwork?.id === artworkId) {
        return state.openingId === null && state.openFailure === null
          ? state
          : { ...state, openingId: null, openFailure: null };
      }

      if (state.openingId === artworkId) {
        return state;
      }

      // Held in advance: it is already in memory, so it goes on screen at once
      // and the draw behind refills the slot it leaves.
      const held = state.ahead.find((artwork) => artwork.id === artworkId);

      if (held !== undefined) {
        return {
          ...state,
          hasStarted: true,
          artwork: held,
          ahead: withoutHeld(state.ahead, artworkId),
          seen: withSeen(state.seen, held),
          isAwaitingNext: false,
          openingId: null,
          openFailure: null,
        };
      }

      // Opening an artwork starts the run as well, so that the next one is
      // already being drawn while this one is read.
      return { ...state, hasStarted: true, openingId: artworkId, openFailure: null };
    }

    case 'opened':
      // An answer for an artwork that is no longer the one asked for is late.
      if (state.openingId !== action.artwork.id) {
        return state;
      }

      return {
        ...state,
        artwork: action.artwork,
        // A draw could have brought the very same artwork in meanwhile.
        ahead: withoutHeld(state.ahead, action.artwork.id),
        seen: withSeen(state.seen, action.artwork),
        isAwaitingNext: false,
        openingId: null,
        openFailure: null,
      };

    case 'openFailed': {
      if (state.openingId !== action.artworkId) {
        return state;
      }

      const failed: DiscoveryState = {
        ...state,
        openingId: null,
        openFailure: { artworkId: action.artworkId, message: action.message },
      };

      // The draw that landed while the screen was kept for this artwork waits
      // behind an empty screen. It goes on screen now, so Discover shows it at
      // once instead of drawing again to fill a place that is already filled.
      const [held, ...rest] = state.ahead;

      if (state.artwork !== null || held === undefined) {
        return failed;
      }

      return { ...failed, artwork: held, ahead: rest, seen: withSeen(state.seen, held) };
    }
  }
}

/**
 * Owns the discovery run: what is on screen, what is held in advance, what has
 * been seen, and the single draw that keeps the buffer full.
 *
 * It is mounted above the router, so the run survives every move between
 * screens: walking to the home page and back to Discover finds the artwork
 * that was on show, with no new draw and no new call.
 *
 * What has been seen survives a reload too: it is kept in this browser's
 * storage, read back when the provider mounts and written whenever it grows.
 * A reload is still a new run — the artwork on screen is drawn again — but it
 * is never one already seen, and My Gallery keeps every one of them.
 *
 * The run starts when a screen asks for it, not when this provider mounts:
 * mounting happens as soon as the application opens, and drawing there would
 * spend two calls on the museum for a visitor who only reads the home page.
 *
 * Every call is made from the two effects below and nowhere else — the draw
 * that keeps the buffer full, and the reading of an artwork opened by name —
 * so there is one place where each can be cancelled and one place where each
 * can fail. The screens only ever dispatch intentions: start, next, retry and
 * open.
 */
export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(discoveryReducer, INITIAL_STATE, (initial) => ({
    ...initial,
    seen: readSeenArtworks(),
  }));
  const {
    hasStarted,
    artwork,
    ahead,
    seen,
    isAwaitingNext,
    error,
    openingId,
    openFailure,
    drawsLanded,
  } = state;

  // What a draw must not bring back, read when the draw starts rather than
  // watched by it: the list grows when an artwork is opened, and that must not
  // restart a draw already under way. It is kept current by an effect declared
  // before the draw's, so a draw always starts with the latest list.
  const excludedIds = useRef<number[]>([]);

  useEffect(() => {
    excludedIds.current = [...seen.map((kept) => kept.id), ...ahead.map((held) => held.id)];
  }, [seen, ahead]);

  // Storage is outside React, so keeping it in step is an effect: one write
  // each time an artwork is revealed, and none while a draw is under way.
  useEffect(() => {
    writeSeenArtworks(seen);
  }, [seen]);

  // What is on screen does not count while the visitor is already waiting for
  // its replacement: that draw is the one being waited on, not an advance. An
  // artwork being opened counts as on screen: it is the one the visitor will
  // see, and the draw is for the one after it.
  const isScreenTaken = (artwork !== null || openingId !== null) && !isAwaitingNext;
  const loadedCount = (isScreenTaken ? 1 : 0) + ahead.length;
  const needsDraw = hasStarted && error === null && loadedCount < 1 + ARTWORKS_HELD_AHEAD;

  useEffect(() => {
    if (!needsDraw) {
      return;
    }

    const controller = new AbortController();

    void drawRandomArtwork({ excludedIds: excludedIds.current, signal: controller.signal })
      .then((drawn) => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch(drawn === null ? { type: 'exhausted' } : { type: 'drawn', artwork: drawn });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch({ type: 'failed', message: describeCollectionError(cause) });
      });

    // Unmounting abandons the draw in flight, and so does the screen no longer
    // needing one. Nothing else cancels it: the count only moves when a draw
    // lands, so opening an artwork or asking for the next one while a draw is
    // under way leaves that draw alone.
    return () => controller.abort();
  }, [needsDraw, drawsLanded]);

  // The second of the two places that call the museum: reading the one artwork
  // the visitor asked to open. It runs once per request, and abandoning it — a
  // new request, or the provider going away — drops the call.
  useEffect(() => {
    if (openingId === null) {
      return;
    }

    const controller = new AbortController();

    void fetchDiscoveryArtwork(openingId, { signal: controller.signal })
      .then((opened) => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch(
          opened === null
            ? {
                type: 'openFailed',
                artworkId: openingId,
                message: 'The museum serves no picture for this artwork, so Discover cannot show it.',
              }
            : { type: 'opened', artwork: opened },
        );
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch({
          type: 'openFailed',
          artworkId: openingId,
          message: describeCollectionError(cause),
        });
      });

    return () => controller.abort();
  }, [openingId]);

  const start = useCallback(() => dispatch({ type: 'started' }), []);
  const next = useCallback(() => dispatch({ type: 'advanced' }), []);
  const retry = useCallback(() => dispatch({ type: 'retried' }), []);
  const open = useCallback(
    (artworkId: number) => dispatch({ type: 'openRequested', artworkId }),
    [],
  );

  // Memoised, or every consumer of the context would re-render on every render
  // of this provider.
  const discovery = useMemo<DiscoveryContextValue>(
    () => ({
      hasStarted,
      artwork,
      isDrawing: hasStarted && artwork === null && openingId === null && error === null,
      isAwaitingNext: isAwaitingNext && error === null,
      nextImageUrl: ahead[0]?.imageUrl ?? null,
      seen,
      error,
      openFailure,
      start,
      next,
      retry,
      open,
    }),
    [
      hasStarted,
      artwork,
      ahead,
      seen,
      isAwaitingNext,
      error,
      openingId,
      openFailure,
      start,
      next,
      retry,
      open,
    ],
  );

  return <DiscoveryContext.Provider value={discovery}>{children}</DiscoveryContext.Provider>;
}
