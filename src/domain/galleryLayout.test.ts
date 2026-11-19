import { describe, expect, it } from 'vitest';
import { DEFAULT_GALLERY_LAYOUT, GALLERY_LAYOUTS, isGalleryLayout } from './galleryLayout';

describe('isGalleryLayout', () => {
  it('accepts the two layouts of the gallery', () => {
    for (const layout of GALLERY_LAYOUTS) {
      expect(isGalleryLayout(layout)).toBe(true);
    }
  });

  it('rejects anything else that storage may hold', () => {
    for (const value of ['', 'Grid', 'table', null, undefined, 1, ['grid']]) {
      expect(isGalleryLayout(value)).toBe(false);
    }
  });

  it('opens on the grid, as the mockup does', () => {
    expect(DEFAULT_GALLERY_LAYOUT).toBe('grid');
  });
});
