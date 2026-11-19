import { describe, expect, it } from 'vitest';
import {
  artworkCountLabel,
  discoveryProgress,
  formatCount,
  formatShare,
  padCount,
} from './discoveryProgress';

describe('discoveryProgress', () => {
  it('divides what was seen by the collection the draw picks from', () => {
    expect(discoveryProgress(53, 2650)).toEqual({
      seenCount: 53,
      collectionSize: 2650,
      share: 0.02,
      leftCount: 2597,
    });
  });

  it('never reads more than everything, should the museum withdraw an object', () => {
    expect(discoveryProgress(12, 10)).toMatchObject({ share: 1, leftCount: 0 });
  });

  it('reads nothing at all of an empty collection', () => {
    expect(discoveryProgress(0, 0)).toMatchObject({ share: 0, leftCount: 0 });
  });
});

describe('formatShare', () => {
  it('reads as whole points', () => {
    expect(formatShare(0.71)).toBe('71 %');
    expect(formatShare(0)).toBe('0 %');
  });

  it('never says none once something has been seen', () => {
    expect(formatShare(7 / 2650)).toBe('< 1 %');
  });
});

describe('the counts', () => {
  it('groups the size of the collection', () => {
    expect(formatCount(2650)).toBe('2,650');
    expect(formatCount(7)).toBe('7');
  });

  it('sets small counts on two digits, as the mockup does', () => {
    expect(padCount(7)).toBe('07');
    expect(padCount(123)).toBe('123');
  });

  it('agrees the noun with the count', () => {
    expect(artworkCountLabel(1)).toBe('01 artwork');
    expect(artworkCountLabel(7)).toBe('07 artworks');
  });
});
