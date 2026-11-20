import type { SeenArtwork } from '@/domain/seenArtwork';

/**
 * The figures behind the "More about my gallery" charts: two questions a
 * visitor can ask of what they have seen, each answered against a stated
 * sample.
 *
 * 1. **Which centuries have I explored?** The artworks seen, counted by the
 *    century they were begun in, each beside how many works the museum holds
 *    from that century.
 * 2. **What are the works I have met made of?** The mediums of the artworks
 *    seen, as the museum records them, the most frequent first.
 */

/**
 * The centuries the department's paintings come from, by their first year.
 * Measured on 2026-11-20, the museum's search counts 6 works in the 1200s and
 * 61 in the 1900s, and none outside; a work whose dates span two centuries is
 * counted in neither, which the chart says.
 */
export const COLLECTION_CENTURIES = [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900] as const;

export type CollectionCentury = (typeof COLLECTION_CENTURIES)[number];

/** The century a year belongs to, by its first year, or `null` outside them. */
export function centuryOf(year: number | null): CollectionCentury | null {
  if (year === null) {
    return null;
  }

  const start = Math.floor(year / 100) * 100;

  return (COLLECTION_CENTURIES as readonly number[]).includes(start)
    ? (start as CollectionCentury)
    : null;
}

/** "13th c." — the 1200s are the thirteenth century. */
export function centuryLabel(century: CollectionCentury): string {
  const ordinal = century / 100 + 1;

  return `${ordinal}th c.`;
}

export type CenturyCount = {
  century: CollectionCentury;
  label: string;
  /** How many works of the department the museum dates in this century. */
  collectionCount: number;
  /** How many of the artworks seen were begun in it. */
  seenCount: number;
};

/**
 * The artworks seen, counted century by century, each beside the number of
 * works the museum holds from that century. Every century of the collection
 * is kept, in order, even one nothing was seen in.
 */
export function centuryCounts(
  collectionCounts: Readonly<Record<CollectionCentury, number>>,
  seen: readonly SeenArtwork[],
): CenturyCount[] {
  const seenByCentury = new Map<CollectionCentury, number>();

  for (const artwork of seen) {
    const century = centuryOf(artwork.beginYear);

    if (century !== null) {
      seenByCentury.set(century, (seenByCentury.get(century) ?? 0) + 1);
    }
  }

  return COLLECTION_CENTURIES.map((century) => ({
    century,
    label: centuryLabel(century),
    collectionCount: collectionCounts[century],
    seenCount: seenByCentury.get(century) ?? 0,
  }));
}

export type MediumCount = {
  key: string;
  label: string;
  count: number;
};

/**
 * The slices of the medium pie: four mediums on their own and the rest as
 * one, which is as many as the pie has fills that tell apart.
 */
export const MAX_MEDIUM_ROWS = 5;

/**
 * Counts the mediums of the artworks seen, the most frequent first, the tail
 * folded into one row that says how many mediums it holds.
 *
 * The museum writes a medium as free text, so two spellings of one technique
 * would count apart; only case and surrounding spaces are evened out, which
 * is all that can be done without inventing a classification it does not
 * make.
 */
export function mediumCounts(
  seen: readonly SeenArtwork[],
  maxRows: number = MAX_MEDIUM_ROWS,
): MediumCount[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const artwork of seen) {
    const label = artwork.medium?.trim() ?? '';

    // Seen before the medium was kept, or recorded without one.
    if (label === '') {
      continue;
    }

    const key = label.toLowerCase();
    const entry = counts.get(key);

    counts.set(key, { label: entry?.label ?? label, count: (entry?.count ?? 0) + 1 });
  }

  const ranked = [...counts.entries()]
    .map(([key, { label, count }]) => ({ key, label, count }))
    // Most frequent first; equal counts in alphabetical order, so the list
    // does not reshuffle from one render to the next.
    .sort((one, other) => other.count - one.count || one.label.localeCompare(other.label));

  const named = ranked.slice(0, Math.max(maxRows - 1, 0));
  const folded = ranked.slice(named.length);
  const shown = folded.length === 1 ? ranked.slice(0, named.length + 1) : named;

  const rows: MediumCount[] = shown.map(({ key, label, count }) => ({ key, label, count }));

  if (folded.length > 1) {
    rows.push({
      key: 'other-mediums',
      label: `${folded.length} other mediums`,
      count: folded.reduce((sum, entry) => sum + entry.count, 0),
    });
  }

  return rows;
}
