import { describe, expect, it } from 'vitest';
import type { SeenArtwork } from './seenArtwork';
import {
  COLLECTION_CENTURIES,
  centuryCounts,
  centuryLabel,
  centuryOf,
  mediumCounts,
  type CollectionCentury,
} from './galleryInsights';

function seen(id: number, beginYear: number | null, medium: string | null = null): SeenArtwork {
  return {
    id,
    title: `Artwork ${id}`,
    artistName: null,
    displayDate: null,
    beginYear,
    medium,
    imageUrl: null,
    repository: null,
    size: null,
  };
}

/** The counts the museum's search gave for department 11 on 2026-11-20. */
const MEASURED: Record<CollectionCentury, number> = {
  1200: 6,
  1300: 60,
  1400: 202,
  1500: 286,
  1600: 472,
  1700: 425,
  1800: 960,
  1900: 61,
};

describe('centuryOf', () => {
  it('places a year in the century of its first year', () => {
    expect(centuryOf(1889)).toBe(1800);
    expect(centuryOf(1800)).toBe(1800);
    expect(centuryOf(1565)).toBe(1500);
  });

  it('places nothing outside the centuries of the collection, or without a year', () => {
    expect(centuryOf(1150)).toBeNull();
    expect(centuryOf(2001)).toBeNull();
    expect(centuryOf(null)).toBeNull();
  });
});

describe('centuryLabel', () => {
  it('names the 1200s the thirteenth century, as a reader counts them', () => {
    expect(centuryLabel(1200)).toBe('13th c.');
    expect(centuryLabel(1900)).toBe('20th c.');
  });
});

describe('centuryCounts', () => {
  it('counts the artworks seen by century, beside the works the collection holds from it', () => {
    const rows = centuryCounts(MEASURED, [
      seen(1, 1889),
      seen(2, 1874),
      seen(3, 1565),
      seen(4, 1653),
    ]);
    const nineteenth = rows.find((row) => row.century === 1800);

    expect(nineteenth).toEqual({
      century: 1800,
      label: '19th c.',
      collectionCount: 960,
      seenCount: 2,
    });
  });

  it('keeps every century of the collection, in order, even one nothing was seen in', () => {
    const rows = centuryCounts(MEASURED, []);

    expect(rows.map((row) => row.century)).toEqual([...COLLECTION_CENTURIES]);
    expect(rows.every((row) => row.seenCount === 0)).toBe(true);
  });

  it('leaves out an artwork it cannot place, rather than guessing a century', () => {
    const rows = centuryCounts(MEASURED, [seen(1, 1889), seen(2, null), seen(3, 1100)]);

    expect(rows.reduce((sum, row) => sum + row.seenCount, 0)).toBe(1);
  });
});

describe('mediumCounts', () => {
  it('ranks the mediums of the artworks seen, the most frequent first', () => {
    const rows = mediumCounts([
      seen(1, null, 'Oil on canvas'),
      seen(2, null, 'Oil on canvas'),
      seen(3, null, 'Tempera on wood'),
    ]);

    expect(rows.map((row) => [row.label, row.count])).toEqual([
      ['Oil on canvas', 2],
      ['Tempera on wood', 1],
    ]);
  });

  it('counts one medium once, whatever its case or its surrounding spaces', () => {
    const rows = mediumCounts([seen(1, null, 'Oil on canvas'), seen(2, null, ' oil on canvas ')]);

    expect(rows).toEqual([{ key: 'oil on canvas', label: 'Oil on canvas', count: 2 }]);
  });

  it('folds the tail into one row that says how many mediums it holds', () => {
    const mediums = ['A', 'A', 'A', 'B', 'B', 'C', 'D', 'E'];
    const rows = mediumCounts(
      mediums.map((medium, index) => seen(index, null, medium)),
      3,
    );

    expect(rows.map((row) => [row.label, row.count])).toEqual([
      ['A', 3],
      ['B', 2],
      ['3 other mediums', 3],
    ]);
  });

  it('names a single leftover medium rather than hiding it behind "1 other"', () => {
    // Three rows allowed, three mediums: the third is named, not folded.
    const rows = mediumCounts(
      ['A', 'B', 'C'].map((medium, index) => seen(index, null, medium)),
      3,
    );

    expect(rows.map((row) => row.label)).toEqual(['A', 'B', 'C']);
  });

  it('leaves out an artwork whose medium is not recorded', () => {
    const rows = mediumCounts([seen(1, null, 'Oil on canvas'), seen(2, null, null)]);

    expect(rows).toEqual([{ key: 'oil on canvas', label: 'Oil on canvas', count: 1 }]);
  });
});
