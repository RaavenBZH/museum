import { parseSeenArtworks, type SeenArtwork } from '@/domain/seenArtwork';
import { readStorage, writeStorage } from '@/hooks/browserStorage';

/**
 * Where the artworks a visitor has been shown are kept between visits: this
 * browser's local storage, under one key.
 *
 * Storage is a convenience and never a requirement: when it fails — see
 * `browserStorage` — the gallery holds what this visit has seen and forgets
 * it on reload, which is what it did before it had storage at all.
 */
export const SEEN_ARTWORKS_STORAGE_KEY = 'museum:seen-artworks';

export function readSeenArtworks(): SeenArtwork[] {
  const stored = readStorage(SEEN_ARTWORKS_STORAGE_KEY);

  if (stored === null) {
    return [];
  }

  try {
    return parseSeenArtworks(JSON.parse(stored));
  } catch {
    // Not JSON: written by hand or by something else. Nothing usable is kept.
    return [];
  }
}

export function writeSeenArtworks(artworks: readonly SeenArtwork[]): void {
  writeStorage(SEEN_ARTWORKS_STORAGE_KEY, JSON.stringify(artworks));
}
