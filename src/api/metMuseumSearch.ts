import { metMuseumClient, type MetMuseumClient } from './metMuseumClient';
import { departmentPeriodSearchUrl, type YearSpan } from './metMuseumEndpoints';
import { MetMuseumPayloadError } from './metMuseumErrors';
import { isRecord } from '@/lib/isRecord';

/**
 * Twenty-four hours: how the museum dates its collection changes over years,
 * and these counts are only worth asking for once a day.
 */
export const PERIOD_COUNT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type SearchRequestOptions = {
  signal?: AbortSignal;
  /** Replaced by the tests; the application always uses the shared client. */
  client?: MetMuseumClient;
};

/**
 * How many works of one department the museum dates within a span of years,
 * read from the `total` of a search restricted to both.
 *
 * The identifiers the search returns beside it are ignored on purpose: this
 * call counts, and the only honest count the API offers is the one it states.
 */
export async function fetchDepartmentPeriodCount(
  departmentId: number,
  span: YearSpan,
  options: SearchRequestOptions = {},
): Promise<number> {
  const { signal, client = metMuseumClient } = options;
  const url = departmentPeriodSearchUrl(departmentId, span);
  const payload = await client.getJson<unknown>(url, { signal, ttlMs: PERIOD_COUNT_CACHE_TTL_MS });
  if (!isRecord(payload) || typeof payload.total !== 'number') {
    throw new MetMuseumPayloadError(url, 'no numeric "total" field');
  }

  return payload.total;
}
