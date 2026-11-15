import { describe, expect, it } from 'vitest';
import { objectIdsUrl, objectUrl } from './metMuseumEndpoints';

describe('objectIdsUrl', () => {
  it('addresses the whole collection when no filter is given', () => {
    expect(objectIdsUrl()).toBe('https://collectionapi.metmuseum.org/public/collection/v1/objects');
  });

  it('joins the departments into the single parameter the museum reads', () => {
    expect(objectIdsUrl({ departmentIds: [11, 6] })).toBe(
      'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11%2C6',
    );
  });

  it('carries both filters at once', () => {
    expect(objectIdsUrl({ departmentIds: [11], metadataDate: '2026-11-13' })).toBe(
      'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11&metadataDate=2026-11-13',
    );
  });

  it('refuses a filter that would address the whole collection by mistake', () => {
    expect(() => objectIdsUrl({ departmentIds: [] })).toThrow(RangeError);
    expect(() => objectIdsUrl({ departmentIds: [0] })).toThrow(RangeError);
    expect(() => objectIdsUrl({ departmentIds: [1.5] })).toThrow(RangeError);
  });

  it('refuses a date the museum would ignore', () => {
    expect(() => objectIdsUrl({ metadataDate: '13/11/2026' })).toThrow(RangeError);
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
