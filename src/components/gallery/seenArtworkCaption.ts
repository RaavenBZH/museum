import { UNKNOWN_ARTIST_LABEL } from '@/domain/artwork';
import type { SeenArtwork } from '@/domain/seenArtwork';

/**
 * "Vincent van Gogh, 1889" — the second line of a card and of a row, the way
 * the mockup writes it. The grid and the list word it alike, so it is written
 * once.
 */
export function seenArtworkByline(artwork: Pick<SeenArtwork, 'artistName' | 'displayDate'>): string {
  const artist = artwork.artistName ?? UNKNOWN_ARTIST_LABEL;

  return artwork.displayDate === null ? artist : `${artist}, ${artwork.displayDate}`;
}
