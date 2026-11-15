import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Artwork } from '@/domain/artwork';
import { describeCollectionError } from '@/domain/collectionError';
import { DiscoveryContext, type DiscoveryContextValue } from './DiscoveryContext';
import { drawRandomArtwork } from './drawRandomArtwork';

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
export const ARTWORKS_HELD_AHEAD = 1;

type DiscoveryState = {
  hasStarted: boolean;
  artwork: Artwork | null;
  /** Already loaded, waiting their turn, in the order they will be shown. */
  ahead: Artwork[];
  /** Everything revealed so far, so that no artwork is drawn twice. */
  seenIds: number[];
  /** The visitor asked for the next artwork before one was held in advance. */
  isAwaitingNext: boolean;
  error: string | null;
};

type DiscoveryAction =
  | { type: 'started' }
  | { type: 'drawn'; artwork: Artwork }
  | { type: 'exhausted' }
  | { type: 'failed'; message: string }
  | { type: 'advanced' }
  | { type: 'retried' };

const INITIAL_STATE: DiscoveryState = {
  hasStarted: false,
  artwork: null,
  ahead: [],
  seenIds: [],
  isAwaitingNext: false,
  error: null,
};

function discoveryReducer(state: DiscoveryState, action: DiscoveryAction): DiscoveryState {
  switch (action.type) {
    case 'started':
      return state.hasStarted ? state : { ...state, hasStarted: true };

    case 'drawn':
      // Straight on screen if nothing is shown yet, or if the visitor is
      // waiting for it; otherwise it waits its turn behind the one on screen.
      return state.artwork === null || state.isAwaitingNext
        ? {
            ...state,
            artwork: action.artwork,
            seenIds: [...state.seenIds, action.artwork.id],
            isAwaitingNext: false,
            error: null,
          }
        : { ...state, ahead: [...state.ahead, action.artwork], error: null };

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
        seenIds: [...state.seenIds, next.id],
      };
    }

    case 'exhausted':
      return { ...state, error: 'This collection has no artwork with a picture to show.' };

    case 'failed':
      return { ...state, error: action.message };

    case 'retried':
      return { ...state, error: null };
  }
}

/**
 * Owns the discovery run: what is on screen, what is held in advance, what has
 * been seen, and the single draw that keeps the buffer full.
 *
 * It is mounted above the router, so the run survives every move between
 * screens: walking to the home page and back to Discover finds the artwork
 * that was on show, with no new draw and no new call. Nothing is persisted
 * though — a reload of the page is a new run.
 *
 * The run starts when a screen asks for it, not when this provider mounts:
 * mounting happens as soon as the application opens, and drawing there would
 * spend two calls on the museum for a visitor who only reads the home page.
 *
 * Every call is made from the effect below and nowhere else, so there is one
 * place where a draw can be cancelled and one place that can fail. The screen
 * only ever dispatches intentions — start, next, retry.
 */
export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(discoveryReducer, INITIAL_STATE);
  const { hasStarted, artwork, ahead, seenIds, isAwaitingNext, error } = state;

  const excludedIds = useMemo(
    () => [...seenIds, ...ahead.map((held) => held.id)],
    [seenIds, ahead],
  );

  // What is on screen does not count while the visitor is already waiting for
  // its replacement: that draw is the one being waited on, not an advance.
  const loadedCount = (artwork === null || isAwaitingNext ? 0 : 1) + ahead.length;
  const needsDraw = hasStarted && error === null && loadedCount < 1 + ARTWORKS_HELD_AHEAD;

  useEffect(() => {
    if (!needsDraw) {
      return;
    }

    const controller = new AbortController();

    void drawRandomArtwork({ excludedIds, signal: controller.signal })
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

    // Unmounting abandons the draw in flight. Nothing else cancels one: the
    // two dependencies keep their identity while a draw is under way — the
    // state only changes when it lands — so this effect runs once per draw and
    // never races itself.
    return () => controller.abort();
  }, [needsDraw, excludedIds]);

  const start = useCallback(() => dispatch({ type: 'started' }), []);
  const next = useCallback(() => dispatch({ type: 'advanced' }), []);
  const retry = useCallback(() => dispatch({ type: 'retried' }), []);

  // Memoised, or every consumer of the context would re-render on every render
  // of this provider.
  const discovery = useMemo<DiscoveryContextValue>(
    () => ({
      hasStarted,
      artwork,
      isDrawing: hasStarted && artwork === null && error === null,
      isAwaitingNext: isAwaitingNext && error === null,
      nextImageUrl: ahead[0]?.imageUrl ?? null,
      error,
      start,
      next,
      retry,
    }),
    [hasStarted, artwork, ahead, isAwaitingNext, error, start, next, retry],
  );

  return <DiscoveryContext.Provider value={discovery}>{children}</DiscoveryContext.Provider>;
}
