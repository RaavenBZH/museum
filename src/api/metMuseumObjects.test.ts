import { describe, expect, it, vi } from 'vitest';
import { createMetMuseumClient, type MetMuseumClient } from './metMuseumClient';
import { MetMuseumNotFoundError, MetMuseumPayloadError } from './metMuseumErrors';
import { createRequestQueue } from './requestQueue';
import {
  fetchObject,
  fetchObjectIds,
  OBJECT_CACHE_TTL_MS,
  OBJECT_IDS_CACHE_TTL_MS,
} from './metMuseumObjects';

const COLLECTION_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
const EUROPEAN_PAINTINGS_URL = `${COLLECTION_URL}?departmentIds=11`;
const SUNFLOWERS_URL = `${COLLECTION_URL}/436524`;

/**
 * A client that answers each address with its own payload, and records the
 * calls. An address it does not know would be a call the services should not
 * have made, so it fails the test loudly.
 */
function clientAnswering(payloads: Record<string, unknown>): MetMuseumClient {
  return {
    getJson: vi.fn(async (url: string) => {
      if (!(url in payloads)) {
        throw new Error(`The service called an unexpected address: ${url}`);
      }

      return payloads[url];
    }) as MetMuseumClient['getJson'],
  };
}

describe('fetchObjectIds', () => {
  it('reads the identifiers of the whole collection', async () => {
    const client = clientAnswering({ [COLLECTION_URL]: { total: 2, objectIDs: [1, 2] } });

    await expect(fetchObjectIds({}, { client })).resolves.toEqual({ total: 2, objectIDs: [1, 2] });
    expect(client.getJson).toHaveBeenCalledWith(COLLECTION_URL, {
      signal: undefined,
      ttlMs: OBJECT_IDS_CACHE_TTL_MS,
    });
  });

  it('passes the department filter and the caller signal down to the client', async () => {
    const client = clientAnswering({ [EUROPEAN_PAINTINGS_URL]: { total: 0, objectIDs: null } });
    const { signal } = new AbortController();

    await fetchObjectIds({ departmentIds: [11] }, { client, signal });

    expect(client.getJson).toHaveBeenCalledWith(EUROPEAN_PAINTINGS_URL, {
      signal,
      ttlMs: OBJECT_IDS_CACHE_TTL_MS,
    });
  });

  it('turns the "no result" answer into an empty list', async () => {
    const client = clientAnswering({ [COLLECTION_URL]: { total: 0, objectIDs: null } });

    await expect(fetchObjectIds({}, { client })).resolves.toEqual({ total: 0, objectIDs: [] });
  });

  it('refuses a payload that is not the promised shape', async () => {
    await expect(
      fetchObjectIds({}, { client: clientAnswering({ [COLLECTION_URL]: { objectIDs: [1] } }) }),
    ).rejects.toBeInstanceOf(MetMuseumPayloadError);
    await expect(
      fetchObjectIds(
        {},
        { client: clientAnswering({ [COLLECTION_URL]: { total: 1, objectIDs: ['1'] } }) },
      ),
    ).rejects.toBeInstanceOf(MetMuseumPayloadError);
  });
});

describe('fetchObject', () => {
  const sunflowers = { objectID: 436524, title: 'Sunflowers', culture: '' };

  it('reads the identifier list first, then the object, leaving its fields untouched', async () => {
    const client = clientAnswering({
      [COLLECTION_URL]: { total: 2, objectIDs: [436524, 436535] },
      [SUNFLOWERS_URL]: sunflowers,
    });

    await expect(fetchObject(436524, { client })).resolves.toEqual(sunflowers);
    expect(client.getJson).toHaveBeenNthCalledWith(1, COLLECTION_URL, {
      signal: undefined,
      ttlMs: OBJECT_IDS_CACHE_TTL_MS,
    });
    expect(client.getJson).toHaveBeenNthCalledWith(2, SUNFLOWERS_URL, {
      signal: undefined,
      ttlMs: OBJECT_CACHE_TTL_MS,
    });
  });

  it('checks the identifier against the department that was listed', async () => {
    const client = clientAnswering({
      [EUROPEAN_PAINTINGS_URL]: { total: 1, objectIDs: [436524] },
      [SUNFLOWERS_URL]: sunflowers,
    });

    await expect(
      fetchObject(436524, { client, within: { departmentIds: [11] } }),
    ).resolves.toEqual(sunflowers);
  });

  it('fails on an identifier the collection does not hold, without calling the museum for it', async () => {
    const client = clientAnswering({
      [COLLECTION_URL]: { total: 1, objectIDs: [436535] },
    });

    await expect(fetchObject(436524, { client })).rejects.toBeInstanceOf(MetMuseumNotFoundError);
    expect(client.getJson).toHaveBeenCalledTimes(1);
    expect(client.getJson).not.toHaveBeenCalledWith(SUNFLOWERS_URL, expect.anything());
  });

  it('refuses an identifier that cannot exist, before any call at all', async () => {
    const client = clientAnswering({});

    await expect(fetchObject(0, { client })).rejects.toThrow(RangeError);
    expect(client.getJson).not.toHaveBeenCalled();
  });

  it('refuses a payload without an identifier', async () => {
    const client = clientAnswering({
      [COLLECTION_URL]: { total: 1, objectIDs: [436524] },
      [SUNFLOWERS_URL]: { message: 'ObjectID not found' },
    });

    await expect(fetchObject(436524, { client })).rejects.toBeInstanceOf(MetMuseumPayloadError);
  });

  it('costs one list call for a whole page of objects, through the shared client', async () => {
    const payloads: Record<string, unknown> = {
      [COLLECTION_URL]: { total: 2, objectIDs: [436524, 436535] },
      [SUNFLOWERS_URL]: sunflowers,
      [`${COLLECTION_URL}/436535`]: { objectID: 436535 },
    };
    const fetchImpl = vi.fn(async (url: string) =>
      Response.json(payloads[url] ?? { message: 'Not a valid object' }),
    );
    const client = createMetMuseumClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      queue: createRequestQueue({ minIntervalMs: 0, now: () => 0, delay: () => Promise.resolve() }),
    });

    await Promise.all([fetchObject(436524, { client }), fetchObject(436535, { client })]);

    // One list call shared by both objects, then one call per object: the
    // check against the identifiers is free from the second object onwards.
    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      COLLECTION_URL,
      SUNFLOWERS_URL,
      `${COLLECTION_URL}/436535`,
    ]);

    // An identifier that is not in the list never reaches the museum.
    await expect(fetchObject(1, { client })).rejects.toBeInstanceOf(MetMuseumNotFoundError);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});
