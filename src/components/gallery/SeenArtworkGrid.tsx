import { Link } from 'react-router';
import { artworkAspectRatio, artworkImageDescription } from '@/domain/artwork';
import { formatArtworkSize } from '@/domain/artworkFacts';
import { discoverArtworkPath } from '@/domain/discoveryRoute';
import type { SeenArtwork } from '@/domain/seenArtwork';
import { cn } from '@/lib/utils';
import { seenArtworkByline } from './seenArtworkCaption';
import { seenArtworkLinkLabel } from './seenArtworkLink';
import { SeenArtworkPicture } from './SeenArtworkPicture';

/** An object the museum has not measured keeps the stage's fallback shape. */
const FALLBACK_ASPECT_RATIO = 4 / 3;

/**
 * The grid of My Gallery: every seen artwork at its real proportions, its
 * caption under it — title, artist and date, then its size in the monospace
 * family.
 *
 * As drawn in the mockup, columns are at least 240 px wide and as many as the
 * width holds, 32 px between rows and 24 px between columns; below 761 px it
 * is two columns, 24 px and 12 px apart. Pictures keep their own proportions,
 * so the rows are aligned at their top and not stretched to a common height.
 *
 * Each card is one link, picture and caption together, to the artwork on
 * Discover: a router link, so the run is not reloaded, on a real anchor, so it
 * keeps its keyboard focus, its middle click and its context menu. Hovering
 * it zooms the picture inside its frame, as on every artwork card.
 */
export function SeenArtworkGrid({
  artworks,
  className,
}: {
  artworks: readonly SeenArtwork[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'seen-artwork-grid m-0 grid list-none grid-cols-2 items-start gap-x-3 gap-y-6 p-0 desktop:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] desktop:gap-x-6 desktop:gap-y-8',
        className,
      )}
    >
      {artworks.map((artwork) => {
        const size = formatArtworkSize(artwork);

        return (
          <li key={artwork.id} className="seen-artwork-grid__item">
            <Link
              className="seen-artwork-grid__link group block rounded-image text-text no-underline"
              to={discoverArtworkPath(artwork.id)}
              aria-label={seenArtworkLinkLabel(artwork)}
            >
              <figure className="seen-artwork-grid__figure m-0 flex flex-col gap-3">
                <SeenArtworkPicture
                  className="seen-artwork-grid__picture bg-surface"
                  src={artwork.imageUrl}
                  alt={artworkImageDescription(artwork)}
                  style={{ aspectRatio: artworkAspectRatio(artwork) ?? FALLBACK_ASPECT_RATIO }}
                />
                <figcaption className="seen-artwork-grid__caption flex min-w-0 flex-col gap-1">
                  <span className="seen-artwork-grid__title text-caption-title">{artwork.title}</span>
                  <span className="seen-artwork-grid__byline text-caption-meta text-text-muted">
                    {seenArtworkByline(artwork)}
                  </span>
                  {size === null ? null : (
                    <span className="seen-artwork-grid__size font-mono text-mono text-text-muted">
                      {size}
                    </span>
                  )}
                </figcaption>
              </figure>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
