import type { SeenArtwork } from '@/domain/seenArtwork';
import { seenArtworkByline } from './seenArtworkCaption';

/**
 * The accessible name of a card or a row, which is a link to the artwork on
 * Discover: "Wheat Field with Cypresses, Vincent van Gogh, 1889".
 *
 * It is set on the link rather than left to be computed from its content: the
 * content holds the picture's own description as well as the caption, and a
 * screen reader would read the title and the artist twice.
 */
export function seenArtworkLinkLabel(
  artwork: Pick<SeenArtwork, 'title' | 'artistName' | 'displayDate'>,
): string {
  return `${artwork.title}, ${seenArtworkByline(artwork)}`;
}
