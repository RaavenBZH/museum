import { describe, expect, it, vi } from 'vitest';
import type { MetMuseumClient } from './metMuseumClient';
import { MetMuseumPayloadError } from './metMuseumErrors';
import { fetchDepartmentPeriodCount, PERIOD_COUNT_CACHE_TTL_MS } from './metMuseumSearch';

const NINETEENTH_CENTURY_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1.1/search?q=*&departmentId=11&dateBegin=1800&dateEnd=1899';

function clientAnswering(payload: unknown): MetMuseumClient {
  return {
    getJson: vi.fn(async (url: string) => {
      if (url !== NINETEENTH_CENTURY_URL) {
        throw new Error(`The service called an unexpected address: ${url}`);
      }

      return payload;
    }) as MetMuseumClient['getJson'],
  };
}

const span = { beginYear: 1800, endYear: 1899 };

describe('fetchDepartmentPeriodCount', () => {
  it('reads the total the search states, and ignores the identifiers beside it', async () => {
    const client = clientAnswering({ total: 960, objectIDs: [1, 2, 3] });

    await expect(fetchDepartmentPeriodCount(11, span, { client })).resolves.toBe(960);
  });

  it('keeps the answer for a day, and passes the caller signal down', async () => {
    const client = clientAnswering({ total: 960, objectIDs: [] });
    const signal = new AbortController().signal;

    await fetchDepartmentPeriodCount(11, span, { client, signal });

    expect(client.getJson).toHaveBeenCalledWith(NINETEENTH_CENTURY_URL, {
      signal,
      ttlMs: PERIOD_COUNT_CACHE_TTL_MS,
    });
  });

  it('counts a span the museum reports as empty', async () => {
    const client = clientAnswering({ total: 0, objectIDs: null });

    await expect(fetchDepartmentPeriodCount(11, span, { client })).resolves.toBe(0);
  });

  it('refuses a payload with no total, rather than counting it as nothing', async () => {
    const client = clientAnswering({ objectIDs: [1] });

    await expect(fetchDepartmentPeriodCount(11, span, { client })).rejects.toThrow(
      MetMuseumPayloadError,
    );
  });
});
