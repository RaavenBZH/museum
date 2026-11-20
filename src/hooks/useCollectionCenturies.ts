import { useCallback, useEffect, useState } from 'react';
import { fetchDepartmentPeriodCount } from '@/api/metMuseumSearch';
import { describeCollectionError } from '@/domain/collectionError';
import { DISCOVERY_DEPARTMENT_ID } from '@/domain/discoveryCollection';
import { COLLECTION_CENTURIES, type CollectionCentury } from '@/domain/galleryInsights';

type CenturyCountsState = {
  /** The department's works per century; `null` until every century is in. */
  counts: Readonly<Record<CollectionCentury, number>> | null;
  error: string | null;
};

const UNKNOWN: CenturyCountsState = { counts: null, error: null };

/**
 * How many paintings of the discovery collection the museum dates in each
 * century, one search per century.
 *
 * It asks only once `enabled` is true — when the visitor unfolds the section
 * that shows them. Eight calls spent on every visit to My Gallery, for a chart
 * most visits never open, would be eight calls closer to the IP block for
 * nothing. Once asked, the answers are cached for a day, so folding and
 * unfolding again costs nothing.
 */
export function useCollectionCenturies(enabled: boolean): CenturyCountsState & {
  retry: () => void;
} {
  const [state, setState] = useState<CenturyCountsState>(UNKNOWN);
  // A number, not a flag, so that a second retry restarts the count too.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) {
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

        setState({ counts, error: null });
      })
      .catch((cause: unknown) => {
        // A count the visitor folded away or walked off is not a failure.
        if (!signal.aborted) {
          setState({ counts: null, error: describeCollectionError(cause) });
        }
      });

    return () => controller.abort();
  }, [enabled, attempt]);

  const retry = useCallback(() => {
    setState(UNKNOWN);
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
