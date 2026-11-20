/**
 * Every URL of the Met collection API is built here, so that no other file in
 * the project knows the museum's host name.
 *
 * `v1` serves the object endpoints; `search` is served by `v1.1` alone, the
 * version the museum kept when it withdrew `v1/search` on 1 October 2026.
 */
const MET_COLLECTION_API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';
const MET_SEARCH_API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1.1';

/**
 * The query that matches every record. The search endpoint requires a `q`,
 * and has no "everything" flag of its own: `*` is how it is asked for no
 * restriction on the terms.
 */
const EVERY_RECORD_QUERY = '*';

/**
 * The filter `GET /objects` accepts. The museum also reads a `metadataDate`,
 * which is not built here because no screen asks for it: an endpoint this file
 * cannot show in use is a parameter nobody maintains.
 */
export type ObjectIdsQuery = {
  /** Keep only the objects of these departments, as returned by `GET /departments`. */
  departmentIds?: number[];
};

/**
 * `GET /objects` — the identifiers of the collection, as a single list.
 * It returns identifiers only: reading one object costs one more call to
 * {@link objectUrl}, which is why the responses are cached.
 */
export function objectIdsUrl(query: ObjectIdsQuery = {}): string {
  const url = new URL(`${MET_COLLECTION_API_BASE_URL}/objects`);
  const { departmentIds } = query;

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

  return url.toString();
}

/** `GET /objects/{objectID}` — the 58 fields of one object. */
export function objectUrl(objectID: number): string {
  if (!Number.isSafeInteger(objectID) || objectID <= 0) {
    throw new RangeError('objectUrl: an object identifier is a positive integer.');
  }

  return `${MET_COLLECTION_API_BASE_URL}/objects/${objectID}`;
}

/** A span of years, both ends included, as the search endpoint reads them. */
export type YearSpan = {
  beginYear: number;
  endYear: number;
};

/**
 * `GET v1.1/search` restricted to one department and one span of years — read
 * for its `total`, which is how many works the museum dates within the span.
 *
 * It is the only way to count works by period without reading them one by
 * one: the search states the total of a query outright, where `GET /objects`
 * would hand over every identifier and leave the dates to be read object by
 * object.
 */
export function departmentPeriodSearchUrl(departmentId: number, span: YearSpan): string {
  if (!Number.isSafeInteger(departmentId) || departmentId <= 0) {
    throw new RangeError('departmentPeriodSearchUrl: a department identifier is a positive integer.');
  }

  if (
    !Number.isSafeInteger(span.beginYear) ||
    !Number.isSafeInteger(span.endYear) ||
    span.beginYear > span.endYear
  ) {
    throw new RangeError('departmentPeriodSearchUrl: a span runs from one year to a later one.');
  }

  const url = new URL(`${MET_SEARCH_API_BASE_URL}/search`);

  url.searchParams.set('q', EVERY_RECORD_QUERY);
  url.searchParams.set('departmentId', String(departmentId));
  url.searchParams.set('dateBegin', String(span.beginYear));
  url.searchParams.set('dateEnd', String(span.endYear));

  return url.toString();
}
