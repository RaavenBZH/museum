import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  readSeenArtworks,
  SEEN_ARTWORKS_STORAGE_KEY,
  writeSeenArtworks,
} from './seenArtworksStorage';

const kept = {
  id: 1,
  title: 'The Starry Night',
  artistName: 'Vincent van Gogh',
  displayDate: '1889',
  beginYear: 1889,
  medium: 'Oil on canvas',
  imageUrl: null,
  repository: null,
  size: null,
};

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('seen artworks storage', () => {
  it('reads back what it wrote', () => {
    writeSeenArtworks([kept]);

    expect(readSeenArtworks()).toEqual([kept]);
  });

  it('reads nothing for a visitor who has seen nothing', () => {
    expect(readSeenArtworks()).toEqual([]);
  });

  it('reads nothing rather than failing on storage that is not JSON', () => {
    localStorage.setItem(SEEN_ARTWORKS_STORAGE_KEY, '{not json');

    expect(readSeenArtworks()).toEqual([]);
  });

  it('keeps going when the browser refuses to store anything', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });

    expect(() => writeSeenArtworks([kept])).not.toThrow();
  });
});
