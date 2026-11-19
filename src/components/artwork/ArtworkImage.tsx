import { cn } from '@/lib/utils';

/**
 * The image frame of an artwork card: a concentric rounded window filling the
 * height left by the caption, with the image cropped rather than distorted or
 * letterboxed.
 *
 * About six artworks in a hundred come back from the collection API without a
 * picture, so a missing image is a normal state, not an error: `src` is
 * nullable and the fallback says so in words.
 *
 * `priority` says the picture is the point of the screen rather than one tile
 * of a grid: it is then loaded eagerly and asked for first. Left alone, the
 * picture waits until it is near the viewport, which is what a card in a long
 * grid should do and exactly what the artwork on show must not do — the one
 * thing a visitor is waiting for cannot be the last thing requested.
 *
 * `compact` is for a thumbnail. "No image available" needs about 160 px of
 * width at the caption size, a 56 px thumbnail has 24 px once padded, and the
 * frame crops whatever overflows — the words would be cut, which is worse
 * than none. A thumbnail says "No image", with almost no padding, so it can
 * wrap onto two short lines inside its square.
 *
 * The picture grows by 5 % when the card around it is hovered. The frame keeps
 * `overflow: hidden`, so the artwork is cropped a little further rather than
 * spilling, and the card does not move a pixel: nothing below it reflows. The
 * zoom is `motion-safe` only, and the fallback never moves — there is nothing
 * to look closer at.
 */
export function ArtworkImage({
  src,
  alt,
  priority = false,
  compact = false,
  className,
}: {
  src: string | null;
  alt: string;
  /** True for the one picture a screen is built around. */
  priority?: boolean;
  /** True for a thumbnail, whose fallback has to fit a small square. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'artwork-image relative flex-1 overflow-hidden rounded-image bg-surface-muted',
        className,
      )}
    >
      {src === null ? (
        <p
          className={cn(
            'artwork-image__fallback absolute inset-0 flex items-center justify-center text-center text-caption-meta text-text-muted',
            compact ? 'p-1' : 'p-4',
          )}
        >
          {compact ? 'No image' : 'No image available'}
        </p>
      ) : (
        <img
          className="artwork-image__picture absolute inset-0 size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
        />
      )}
    </div>
  );
}
