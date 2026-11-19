import { useCallback, useState } from 'react';
import {
  DEFAULT_GALLERY_LAYOUT,
  isGalleryLayout,
  type GalleryLayout,
} from '@/domain/galleryLayout';

/** Where the visitor's choice of layout is kept, beside the artworks seen. */
export const GALLERY_LAYOUT_STORAGE_KEY = 'museum:gallery-layout';

function readStoredLayout(): GalleryLayout {
  try {
    const stored = localStorage.getItem(GALLERY_LAYOUT_STORAGE_KEY);

    return isGalleryLayout(stored) ? stored : DEFAULT_GALLERY_LAYOUT;
  } catch {
    // Storage can be unavailable (private browsing, blocked site data).
    return DEFAULT_GALLERY_LAYOUT;
  }
}

/**
 * Grid or list, as the visitor last chose it on My Gallery.
 *
 * The choice is kept in this browser's storage, so it holds across a visit to
 * Discover — which unmounts the gallery — and across a reload. It is a
 * convenience of one viewer and nothing depends on it: when storage is
 * unavailable, the gallery opens on the grid and the choice lasts as long as
 * the screen does.
 */
export function useGalleryLayout(): [GalleryLayout, (layout: GalleryLayout) => void] {
  const [layout, setStoredLayout] = useState<GalleryLayout>(readStoredLayout);

  const setLayout = useCallback((nextLayout: GalleryLayout) => {
    setStoredLayout(nextLayout);

    try {
      localStorage.setItem(GALLERY_LAYOUT_STORAGE_KEY, nextLayout);
    } catch {
      // The layout still applies on this screen even if it cannot be saved.
    }
  }, []);

  return [layout, setLayout];
}
