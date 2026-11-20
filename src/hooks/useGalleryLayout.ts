import { useState } from 'react';
import {
  DEFAULT_GALLERY_LAYOUT,
  isGalleryLayout,
  type GalleryLayout,
} from '@/domain/galleryLayout';
import { readStorage, writeStorage } from '@/hooks/browserStorage';

/** Where the visitor's choice of layout is kept, beside the artworks seen. */
export const GALLERY_LAYOUT_STORAGE_KEY = 'museum:gallery-layout';

function readStoredLayout(): GalleryLayout {
  const stored = readStorage(GALLERY_LAYOUT_STORAGE_KEY);

  return isGalleryLayout(stored) ? stored : DEFAULT_GALLERY_LAYOUT;
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

  const setLayout = (nextLayout: GalleryLayout) => {
    setStoredLayout(nextLayout);
    writeStorage(GALLERY_LAYOUT_STORAGE_KEY, nextLayout);
  };

  return [layout, setLayout];
}
