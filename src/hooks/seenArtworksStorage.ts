import { parseSeenArtworks, type SeenArtwork } from '@/domain/seenArtwork';

/**
 * Where the artworks a visitor has been shown are kept between visits: this
 * browser's local storage, under one key.
 *
 * Storage is a convenience and never a requirement. It can be unavailable — a
 * private window, blocked site data — or full, and every access is therefore
 * guarded: when it fails, the gallery holds what this visit has seen and
 * forgets it on reload, which is what it did before it had storage at all.
 */
export const SEEN_ARTWORKS_STORAGE_KEY = 'museum:seen-artworks';

export function readSeenArtworks(): SeenArtwork[] {
  try {
    const stored = localStorage.getItem(SEEN_ARTWORKS_STORAGE_KEY);

    return stored === null ? [] : parseSeenArtworks(JSON.parse(stored));
  } catch {
    return [];
  }
}

export function writeSeenArtworks(artworks: readonly SeenArtwork[]): void {
  try {
    localStorage.setItem(SEEN_ARTWORKS_STORAGE_KEY, JSON.stringify(artworks));
  } catch {
    // Full or blocked: this visit still remembers what it has seen.
  }
}
