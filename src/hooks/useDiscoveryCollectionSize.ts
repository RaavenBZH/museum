import { useCallback, useEffect, useState } from 'react';
import { fetchObjectIds } from '@/api/metMuseumObjects';
import { describeCollectionError } from '@/domain/collectionError';
import { DISCOVERY_COLLECTION } from '@/domain/discoveryCollection';

/** Where the last known size is kept, so the gallery can state it at once. */
export const COLLECTION_SIZE_STORAGE_KEY = 'museum:discovery-collection-size';

type CollectionSizeState = {
  /** How many artworks Discover can draw from; `null` until it is known. */
  collectionSize: number | null;
  error: string | null;
};

function readStoredSize(): number | null {
  try {
    const stored = Number(localStorage.getItem(COLLECTION_SIZE_STORAGE_KEY));

    return Number.isSafeInteger(stored) && stored > 0 ? stored : null;
  } catch {
    return null;
  }
}

function storeSize(collectionSize: number): void {
  try {
    localStorage.setItem(COLLECTION_SIZE_STORAGE_KEY, String(collectionSize));
  } catch {
    // Storage can be blocked; the size is simply read again next time.
  }
}

/**
 * The size of the collection Discover draws from, which is the whole that My
 * Gallery measures a visitor's progress against.
 *
 * It reads the very identifier list the draw reads, through the same cached
 * call. That call takes about two seconds at the museum, and the size changes
 * once in a long while, so the last size known is kept in this browser and
 * stated at once: the ring is drawn on arrival, and the call only confirms it
 * in the background. A failure is only reported when there is no size at all
 * to show — a museum that is slow today does not take yesterday's count away.
 */
export function useDiscoveryCollectionSize(): CollectionSizeState & { retry: () => void } {
  const [state, setState] = useState<CollectionSizeState>(() => ({
    collectionSize: readStoredSize(),
    error: null,
  }));
  // A number, not a flag, so that a second retry restarts the read too.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setState((current) => ({ ...current, error: null }));

    fetchObjectIds(DISCOVERY_COLLECTION, { signal })
      .then(({ total }) => {
        if (!signal.aborted) {
          storeSize(total);
          setState({ collectionSize: total, error: null });
        }
      })
      .catch((cause: unknown) => {
        // A read the visitor walked away from is not a failure to report, and
        // a size already on screen is better than an error in its place.
        if (!signal.aborted) {
          setState((current) =>
            current.collectionSize === null
              ? { collectionSize: null, error: describeCollectionError(cause) }
              : current,
          );
        }
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
