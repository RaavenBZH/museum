import { metMuseumClient, type MetMuseumClient } from './metMuseumClient';
import { MetMuseumNotFoundError, MetMuseumPayloadError } from './metMuseumErrors';
import { objectIdsUrl, objectUrl, type ObjectIdsQuery } from './metMuseumEndpoints';

/**
 * The two services of the `objects` resource, chained: the identifier list is
 * read and cached first, and one object is only read once its identifier is
 * known to belong to that list.
 *
 * Both return the museum's payload as it comes off the wire: turning it into
 * the application's model is the job of the domain layer, the only one allowed
 * to decide what a missing field means.
 */

/** `GET /objects` answers with a total and the matching identifiers. */
export type ObjectIdsResult = {
  total: number;
  objectIDs: number[];
};

/**
 * One object as the museum serves it. Only `objectID` is guaranteed; the other
 * 57 fields are declared `unknown` because their presence depends on the
 * department, and the domain layer narrows them.
 */
export type MetObjectResource = { objectID: number } & Record<string, unknown>;

export type ObjectRequestOptions = {
  signal?: AbortSignal;
  /** Replaced by the tests; the application always uses the shared client. */
  client?: MetMuseumClient;
  /**
   * The collection the identifier is checked against before the object is
   * read: the same query that {@link fetchObjectIds} was called with. Defaults
   * to the whole collection.
   */
  within?: ObjectIdsQuery;
};

/** One hour: the museum refreshes its records daily, and the list is large. */
export const OBJECT_IDS_CACHE_TTL_MS = 60 * 60 * 1000;
/** Six hours: a published object's fields are stable for a browsing session. */
export const OBJECT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The identifier lists are long — 371 365 entries for the whole collection —
 * so each list is turned into a set once and that set is kept beside it. The
 * map is keyed by the list itself and holds it weakly: when the cached
 * response is dropped, its set goes with it.
 */
const objectIdSets = new WeakMap<number[], Set<number>>();

function objectIdSet(objectIDs: number[]): Set<number> {
  const known = objectIdSets.get(objectIDs);

  if (known !== undefined) {
    return known;
  }

  const built = new Set(objectIDs);

  objectIdSets.set(objectIDs, built);

  return built;
}

/**
 * The identifiers of the collection, optionally restricted to some departments
 * or to the records changed since a date.
 *
 * The answer carries identifiers only — there is no batch endpoint — so a view
 * paginates this list itself and calls {@link fetchObject} for the page it
 * shows.
 */
export async function fetchObjectIds(
  query: ObjectIdsQuery = {},
  options: ObjectRequestOptions = {},
): Promise<ObjectIdsResult> {
  const { signal, client = metMuseumClient } = options;
  const url = objectIdsUrl(query);
  const payload = await client.getJson<unknown>(url, {
    signal,
    ttlMs: OBJECT_IDS_CACHE_TTL_MS,
  });

  if (!isRecord(payload) || typeof payload.total !== 'number') {
    throw new MetMuseumPayloadError(url, 'no numeric "total" field');
  }

  // A query that matches nothing answers `objectIDs: null`, which would break
  // every caller that maps over the list.
  if (payload.objectIDs === null || payload.objectIDs === undefined) {
    return { total: payload.total, objectIDs: [] };
  }

  if (
    !Array.isArray(payload.objectIDs) ||
    payload.objectIDs.some((id) => typeof id !== 'number')
  ) {
    throw new MetMuseumPayloadError(url, '"objectIDs" is not a list of numbers');
  }

  return { total: payload.total, objectIDs: payload.objectIDs as number[] };
}

/**
 * The full record of one object.
 *
 * The identifier is checked against the cached answer of `GET /objects`
 * before the museum is called, so the detail endpoint is only ever addressed
 * with an identifier that exists. An unknown identifier fails here, without
 * spending a call — and a call spent on a 404 is a call closer to the IP
 * block. The check costs nothing once the list is cached, which it is as soon
 * as a view has asked for one.
 *
 * This is also the call that is repeated the most — the grid, the detail view
 * and the chart sample all ask for the same identifiers — so it is the one the
 * response cache exists for.
 */
export async function fetchObject(
  objectID: number,
  options: ObjectRequestOptions = {},
): Promise<MetObjectResource> {
  const { signal, client = metMuseumClient, within = {} } = options;
  const url = objectUrl(objectID);
  const { objectIDs } = await fetchObjectIds(within, { signal, client });

  if (!objectIdSet(objectIDs).has(objectID)) {
    throw new MetMuseumNotFoundError(url);
  }

  const payload = await client.getJson<unknown>(url, { signal, ttlMs: OBJECT_CACHE_TTL_MS });

  if (!isRecord(payload) || typeof payload.objectID !== 'number') {
    throw new MetMuseumPayloadError(url, 'no numeric "objectID" field');
  }

  return payload as MetObjectResource;
}
