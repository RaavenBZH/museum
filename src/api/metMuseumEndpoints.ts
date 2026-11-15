/**
 * Every URL of the Met collection API is built here, so that no other file in
 * the project knows the museum's host name.
 *
 * `v1` is the only version that serves the object endpoints; `v1.1` exists for
 * `search` alone, which is not built here because nothing calls it yet.
 */
const MET_COLLECTION_API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

/** The filters `GET /objects` accepts. Both are optional and combine. */
export type ObjectIdsQuery = {
  /** Keep only the objects of these departments, as returned by `GET /departments`. */
  departmentIds?: number[];
  /** Keep only the objects whose record changed on or after this `YYYY-MM-DD` date. */
  metadataDate?: string;
};

const METADATA_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `GET /objects` — the identifiers of the collection, as a single list.
 * It returns identifiers only: reading one object costs one more call to
 * {@link objectUrl}, which is why the responses are cached.
 */
export function objectIdsUrl(query: ObjectIdsQuery = {}): string {
  const url = new URL(`${MET_COLLECTION_API_BASE_URL}/objects`);
  const { departmentIds, metadataDate } = query;

  if (departmentIds !== undefined) {
    if (departmentIds.length === 0) {
      throw new RangeError('objectIdsUrl: departmentIds cannot be an empty list.');
    }

    if (departmentIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
      throw new RangeError('objectIdsUrl: every department identifier must be a positive integer.');
    }

    // The museum reads this one parameter as a comma-separated list, and the
    // order of the identifiers decides the order of the answer, so it is kept.
    url.searchParams.set('departmentIds', departmentIds.join(','));
  }

  if (metadataDate !== undefined) {
    if (!METADATA_DATE_PATTERN.test(metadataDate)) {
      throw new RangeError('objectIdsUrl: metadataDate must be formatted as YYYY-MM-DD.');
    }

    url.searchParams.set('metadataDate', metadataDate);
  }

  return url.toString();
}

/** `GET /objects/{objectID}` — the 58 fields of one object. */
export function objectUrl(objectID: number): string {
  if (!Number.isSafeInteger(objectID) || objectID <= 0) {
    throw new RangeError('objectUrl: an object identifier is a positive integer.');
  }

  return `${MET_COLLECTION_API_BASE_URL}/objects/${objectID}`;
}
