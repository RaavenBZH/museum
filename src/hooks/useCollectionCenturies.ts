import { useEffect, useState } from 'react';
import { fetchDepartmentPeriodCount } from '@/api/metMuseumSearch';
import { describeCollectionError } from '@/domain/collectionError';
import { DISCOVERY_DEPARTMENT_ID } from '@/domain/discoveryCollection';
import { COLLECTION_CENTURIES, type CollectionCentury } from '@/domain/galleryInsights';
import { isRecord } from '@/lib/isRecord';
import { readStorage, writeStorage } from '@/hooks/browserStorage';

/** Where the last counts are kept, with the moment they were made. */
export const COLLECTION_CENTURIES_STORAGE_KEY = 'museum:collection-centuries';

/**
 * A day: how the museum dates its collection changes over years, and counts a
 * day old are as good as new ones.
 */
export const COLLECTION_CENTURIES_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type CenturyCounts = Readonly<Record<CollectionCentury, number>>;

type CenturyCountsState = {
  /** The department's works per century; `null` until every century is in. */
  counts: CenturyCounts | null;
  error: string | null;
};

type StoredCounts = {
  counts: CenturyCounts;
  /** When they were counted, in milliseconds since the epoch. */
  countedAt: number;
};

function readStoredCounts(): StoredCounts | null {
  const stored = readStorage(COLLECTION_CENTURIES_STORAGE_KEY);

  if (stored === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (
      !isRecord(parsed) ||
      typeof parsed.countedAt !== 'number' ||
      !isRecord(parsed.counts) ||
      COLLECTION_CENTURIES.some(
        (century) => typeof (parsed.counts as Record<string, unknown>)[century] !== 'number',
      )
    ) {
      return null;
    }

    return { counts: parsed.counts as CenturyCounts, countedAt: parsed.countedAt };
  } catch {
    return null;
  }
}

/**
 * How many paintings of the discovery collection the museum dates in each
 * century, one search per century — ready before anyone asks for them.
 *
 * Eight searches spaced by the request queue take a few seconds, so they are
 * not left for the moment "More about my gallery" is unfolded: they start as
 * soon as My Gallery opens, and the chart is there when the section is. The
 * counts are then kept in this browser for a day, and a visit within that day
 * draws the chart at once without asking the museum anything.
 */
export function useCollectionCenturies(): CenturyCountsState & { retry: () => void } {
  // Read once, on the first render: counts kept by an earlier visit are shown
  // at once, whatever their age, while fresher ones are being asked for.
  const [stored] = useState(readStoredCounts);
  const [state, setState] = useState<CenturyCountsState>({
    counts: stored?.counts ?? null,
    error: null,
  });
  // A number, not a flag, so that a second retry restarts the count too.
  const [attempt, setAttempt] = useState(0);

  const isFresh =
    stored !== null && Date.now() - stored.countedAt < COLLECTION_CENTURIES_MAX_AGE_MS;

  useEffect(() => {
    if (isFresh && attempt === 0) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    Promise.all(
      COLLECTION_CENTURIES.map((century) =>
        fetchDepartmentPeriodCount(
          DISCOVERY_DEPARTMENT_ID,
          { beginYear: century, endYear: century + 99 },
          { signal },
        ),
      ),
    )
      .then((totals) => {
        if (signal.aborted) {
          return;
        }

        const counts = Object.fromEntries(
          COLLECTION_CENTURIES.map((century, index) => [century, totals[index]]),
        ) as Record<CollectionCentury, number>;

        writeStorage(
          COLLECTION_CENTURIES_STORAGE_KEY,
          JSON.stringify({ counts, countedAt: Date.now() }),
        );
        setState({ counts, error: null });
      })
      .catch((cause: unknown) => {
        // A count the visitor walked away from is not a failure, and counts
        // already on screen are better than an error in their place.
        if (!signal.aborted) {
          setState((current) =>
            current.counts === null
              ? { counts: null, error: describeCollectionError(cause) }
              : current,
          );
        }
      });

    return () => controller.abort();
  }, [isFresh, attempt]);

  const retry = () => {
    setState({ counts: null, error: null });
    setAttempt((current) => current + 1);
  };

  return { ...state, retry };
}
