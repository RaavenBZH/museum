/**
 * The two ways My Gallery can lay out the artworks seen, as the mockup draws
 * them: a grid of pictures, or a list of rows.
 */
export const GALLERY_LAYOUTS = ['grid', 'list'] as const;

export type GalleryLayout = (typeof GALLERY_LAYOUTS)[number];

/** The layout a gallery opens on before a visitor has chosen one. */
export const DEFAULT_GALLERY_LAYOUT: GalleryLayout = 'grid';

/** Guards what is read back from storage, which may hold anything. */
export function isGalleryLayout(value: unknown): value is GalleryLayout {
  return typeof value === 'string' && (GALLERY_LAYOUTS as readonly string[]).includes(value);
}
