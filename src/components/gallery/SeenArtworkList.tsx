import { Link } from 'react-router';
import { artworkImageDescription } from '@/domain/artwork';
import { formatArtworkSize } from '@/domain/artworkFacts';
import { discoverArtworkPath } from '@/domain/discoveryRoute';
import type { SeenArtwork } from '@/domain/seenArtwork';
import { cn } from '@/lib/utils';
import { seenArtworkByline } from './seenArtworkCaption';
import { seenArtworkLinkLabel } from './seenArtworkLink';
import { SeenArtworkPicture } from './SeenArtworkPicture';

/**
 * The list of My Gallery: one surface card, one row per seen artwork — a
 * square thumbnail, the title over the artist and date, where it is kept, and
 * its size in the monospace family.
 *
 * As drawn in the mockup, the thumbnail is 72 px and the columns share the
 * width two to one and a half, then 150 px for the size; below 761 px the row
 * keeps only a 56 px thumbnail and the title, and the rest is the grid's job.
 *
 * Each row is one link to the artwork on Discover, as each card of the grid
 * is: the whole row is the target, and hovering it zooms the thumbnail.
 */
export function SeenArtworkList({
  artworks,
  className,
}: {
  artworks: readonly SeenArtwork[];
  className?: string;
}) {
  return (
    // `list-none` makes Safari drop the list role, and with it the count.
    <ul
      role="list"
      className={cn(
        'seen-artwork-list m-0 flex list-none flex-col gap-1 rounded-card bg-surface p-2',
        className,
      )}
    >
      {artworks.map((artwork) => (
        <li key={artwork.id} className="seen-artwork-list__item">
          <Link
            className="seen-artwork-list__row group grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 rounded-image p-2 text-text no-underline transition-colors hover:bg-surface-muted desktop:grid-cols-[72px_minmax(0,2fr)_minmax(0,1.5fr)_150px] desktop:gap-4"
            to={discoverArtworkPath(artwork.id)}
            aria-label={seenArtworkLinkLabel(artwork)}
          >
            <SeenArtworkPicture
              className="seen-artwork-list__thumbnail size-14 desktop:size-18"
              compact
              src={artwork.imageUrl}
              alt={artworkImageDescription(artwork)}
            />
            <div className="seen-artwork-list__identity flex min-w-0 flex-col gap-1">
              <span className="seen-artwork-list__title text-caption-title">{artwork.title}</span>
              <span className="seen-artwork-list__byline text-caption-meta text-text-muted">
                {seenArtworkByline(artwork)}
              </span>
            </div>
            <span className="seen-artwork-list__repository hidden text-caption-meta text-text-muted desktop:block">
              {artwork.repository ?? ''}
            </span>
            <span className="seen-artwork-list__size hidden font-mono text-mono text-text-muted desktop:block">
              {formatArtworkSize(artwork) ?? ''}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
