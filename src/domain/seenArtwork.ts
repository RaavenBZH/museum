import type { Artwork } from '@/domain/artwork';

/**
 * What My Gallery keeps of an artwork once it has been seen: what its card and
 * its row show, and nothing else.
 *
 * The full record holds some thirty fields, the museum's long credit lines
 * among them; the gallery shows seven. Keeping only those is what lets every
 * artwork a visitor has ever been shown fit in the browser's storage, and what
 * lets the gallery open without asking the museum anything at all — a
 * returning visitor with fifty artworks behind them would otherwise spend
 * fifty calls, a third of the way to the IP block, on reopening one screen.
 */
export type SeenArtwork = Pick<
  Artwork,
  'id' | 'title' | 'artistName' | 'displayDate' | 'imageUrl' | 'repository' | 'size'
>;

export function toSeenArtwork(artwork: Artwork): SeenArtwork {
  const { id, title, artistName, displayDate, imageUrl, repository, size } = artwork;

  return { id, title, artistName, displayDate, imageUrl, repository, size };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableText(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return typeof value === 'string' ? value : undefined;
}

function storedSize(value: unknown): SeenArtwork['size'] | undefined {
  if (value === null) {
    return null;
  }

  if (
    !isRecord(value) ||
    typeof value.heightCm !== 'number' ||
    typeof value.widthCm !== 'number' ||
    (value.depthCm !== null && typeof value.depthCm !== 'number')
  ) {
    return undefined;
  }

  return { heightCm: value.heightCm, widthCm: value.widthCm, depthCm: value.depthCm };
}

function storedArtwork(value: unknown): SeenArtwork | null {
  if (!isRecord(value) || !Number.isSafeInteger(value.id) || typeof value.title !== 'string') {
    return null;
  }

  const artistName = nullableText(value.artistName);
  const displayDate = nullableText(value.displayDate);
  const imageUrl = nullableText(value.imageUrl);
  const repository = nullableText(value.repository);
  const size = storedSize(value.size);

  if (
    artistName === undefined ||
    displayDate === undefined ||
    imageUrl === undefined ||
    repository === undefined ||
    size === undefined
  ) {
    return null;
  }

  return {
    id: value.id as number,
    title: value.title,
    artistName,
    displayDate,
    imageUrl,
    repository,
    size,
  };
}

/**
 * Reads back what the browser kept, whatever it holds.
 *
 * Storage is written by this application but read across its versions, and it
 * can be edited by hand: an entry that no longer has the shape of a seen
 * artwork is dropped rather than allowed to break the screen, and an artwork
 * kept twice is kept once, in the order it was first seen.
 */
export function parseSeenArtworks(value: unknown): SeenArtwork[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<number>();
  const artworks: SeenArtwork[] = [];

  for (const entry of value) {
    const artwork = storedArtwork(entry);

    if (artwork !== null && !seenIds.has(artwork.id)) {
      seenIds.add(artwork.id);
      artworks.push(artwork);
    }
  }

  return artworks;
}
