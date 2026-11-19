import type { CSSProperties } from 'react';
import { ArtworkImage } from '@/components/artwork/ArtworkImage';
import { cn } from '@/lib/utils';
import { useNearViewport } from './useNearViewport';

/**
 * The picture of a seen artwork, fetched only once it comes near the screen.
 *
 * A gallery can hold hundreds of artworks, and each picture is some 140 kB
 * from the museum's image server: loading them all on arrival would download
 * tens of megabytes for a screen the visitor sees a dozen of at a time. Until
 * the card is near, its frame is drawn empty at its final size, so nothing
 * below it moves when the picture arrives.
 *
 * Once near, the picture is the ordinary artwork image, with the browser's own
 * lazy loading on top: the two work at different distances and do not fight.
 */
export function SeenArtworkPicture({
  src,
  alt,
  style,
  compact = false,
  className,
}: {
  src: string | null;
  alt: string;
  /** True for a thumbnail: its fallback is worded to fit a small square. */
  compact?: boolean;
  /** The frame's size or proportions, set by the grid or the list. */
  style?: CSSProperties;
  className?: string;
}) {
  const { ref, isNear } = useNearViewport<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        'seen-artwork-picture relative flex overflow-hidden rounded-image bg-surface-muted',
        className,
      )}
      style={style}
    >
      {isNear ? (
        <ArtworkImage className="bg-transparent" src={src} alt={alt} compact={compact} />
      ) : null}
    </div>
  );
}
