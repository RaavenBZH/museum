/**
 * How far a visitor has got through the collection Discover draws from: the
 * one figure the My Gallery ring and its headline state.
 *
 * The whole is the collection's identifier list, the very list the draw picks
 * from — so the figure and the draw can never disagree about what "every
 * artwork" means.
 */
export type DiscoveryProgress = {
  seenCount: number;
  collectionSize: number;
  /** Of the collection, between 0 and 1. */
  share: number;
  /** What is still to be drawn. */
  leftCount: number;
};

export function discoveryProgress(seenCount: number, collectionSize: number): DiscoveryProgress {
  const seen = Math.max(seenCount, 0);
  const size = Math.max(collectionSize, 0);

  return {
    seenCount: seen,
    collectionSize: size,
    // Bounded: the museum can withdraw objects, and a visitor who saw one that
    // has since left the list must not read more than everything.
    share: size === 0 ? 0 : Math.min(seen / size, 1),
    leftCount: Math.max(size - seen, 0),
  };
}

/** "2,650" — the collection is large enough to need the grouping. */
export function formatCount(count: number): string {
  return String(Math.round(count)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * "71 %", and never "0 %" once something has been seen: a visitor who has
 * looked at seven artworks out of 2 650 has not seen none of them.
 */
export function formatShare(share: number): string {
  const percent = share * 100;

  if (percent > 0 && percent < 0.5) {
    return '< 1 %';
  }

  return `${Math.round(percent)} %`;
}

/** "07" — the mockup sets small counts on two digits, so a column of them aligns. */
export function padCount(count: number): string {
  return String(Math.max(Math.round(count), 0)).padStart(2, '0');
}

/** "1 artwork", "7 artworks". */
export function artworkCountLabel(count: number): string {
  return `${padCount(count)} ${count === 1 ? 'artwork' : 'artworks'}`;
}
