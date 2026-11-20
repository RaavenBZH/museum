import { describe, expect, it } from 'vitest';
import { departmentPeriodSearchUrl, objectIdsUrl, objectUrl } from './metMuseumEndpoints';

describe('objectIdsUrl', () => {
  it('addresses the whole collection when no filter is given', () => {
    expect(objectIdsUrl()).toBe('https://collectionapi.metmuseum.org/public/collection/v1/objects');
  });

  it('joins the departments into the single parameter the museum reads', () => {
    expect(objectIdsUrl({ departmentIds: [11, 6] })).toBe(
      'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11%2C6',
    );
  });

  it('refuses a filter that would address the whole collection by mistake', () => {
    expect(() => objectIdsUrl({ departmentIds: [] })).toThrow(RangeError);
    expect(() => objectIdsUrl({ departmentIds: [0] })).toThrow(RangeError);
    expect(() => objectIdsUrl({ departmentIds: [1.5] })).toThrow(RangeError);
  });
});

describe('departmentPeriodSearchUrl', () => {
  it('counts one department over a span of years, through the search the museum kept', () => {
    // v1.1 is the only version that still serves search, and it requires a
    // query: `*` asks for every record.
    expect(departmentPeriodSearchUrl(11, { beginYear: 1800, endYear: 1899 })).toBe(
      'https://collectionapi.metmuseum.org/public/collection/v1.1/search?q=*&departmentId=11&dateBegin=1800&dateEnd=1899',
    );
  });

  it('refuses a span that runs backwards, or a department that cannot exist', () => {
    expect(() => departmentPeriodSearchUrl(11, { beginYear: 1900, endYear: 1800 })).toThrow(
      RangeError,
    );
    expect(() => departmentPeriodSearchUrl(0, { beginYear: 1800, endYear: 1899 })).toThrow(
      RangeError,
    );
  });
});

describe('objectUrl', () => {
  it('addresses one object by its identifier', () => {
    expect(objectUrl(436535)).toBe(
      'https://collectionapi.metmuseum.org/public/collection/v1/objects/436535',
    );
  });

  it('refuses an identifier that cannot exist, rather than spending a call', () => {
    expect(() => objectUrl(0)).toThrow(RangeError);
    expect(() => objectUrl(-1)).toThrow(RangeError);
    expect(() => objectUrl(Number.NaN)).toThrow(RangeError);
  });
});
