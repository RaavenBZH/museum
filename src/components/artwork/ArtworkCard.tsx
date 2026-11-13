import { ArtworkImage } from '@/components/artwork/ArtworkImage';
import {
  bentoTileClassName,
  type BentoTileFormat,
} from '@/components/layout/bentoTileFormats';
import { DatePill } from '@/components/ui/DatePill';
import { cn } from '@/lib/utils';

/** The four tile formats an artwork can take; the other two are not artworks. */
export type ArtworkCardFormat = Exclude<BentoTileFormat, 'headline' | 'action'>;

/**
 * Two title lines plus the 4 px gap, read from the type scale rather than
 * written as a length, so the box follows the tokens if they ever move.
 */
const ARTWORK_CARD_CLIPPED_CAPTION =
  'artwork-card__caption-text--clipped h-[calc(2*var(--text-caption-title--line-height)*var(--text-caption-title)+0.25rem)] overflow-hidden';

export interface ArtworkCardProps {
  /** Chosen from the proportions of the artwork, by whoever builds the grid. */
  format: ArtworkCardFormat;
  title: string;
  /** Full name, or a stated fallback: the collection API often has no artist. */
  artist: string;
  /** Display year, free text from the API ("1913", "ca. 1831"). */
  year: string;
  /** `null` when the artwork has no picture; see `ArtworkImage`. */
  imageUrl: string | null;
  /** Where the artwork opens: every tile leads to its own detail view. */
  href: string;
  className?: string;
}

/**
 * One artwork in the bento grid: a surface card holding the picture and, below
 * it, the caption. Nothing is ever drawn on top of the picture.
 *
 * Every caption has the same two lines, whatever the tile holding it: the
 * title with the year aligned right, then the artist. A tile that dropped the
 * title would make the same artwork read differently depending on where the
 * grid happened to place it, which is exactly what a caption must not do.
 *
 * What varies is only what the width forces: a long title wraps to two lines
 * and stops there, and a long name is cut with an ellipsis. Nothing else
 * answers to the format — the year in particular is drawn the same way in all
 * four, with no surface of its own.
 *
 * The card is a `group`: hovering anywhere on it, caption included, zooms the
 * picture slightly. The whole card is one link, so the whole card is one
 * target, and the picture is what says so.
 *
 * On a small tile the caption is given the height of two title lines, and what
 * does not fit is cut. So a one-line title leaves room for the artist, and a
 * title that takes both lines pushes the artist exactly out of the box — no
 * half-line of text showing, and no measuring: the three heights involved come
 * from the type scale and resolve to 19.5 + 4 + 18.2 px against a 43 px box.
 * The name stays in the markup, so the link and the picture still carry it.
 */
export function ArtworkCard({
  format,
  title,
  artist,
  year,
  imageUrl,
  href,
  className,
}: ArtworkCardProps) {
  return (
    <a
      className={cn(
        'artwork-card group flex flex-col gap-2 rounded-card bg-surface p-2.5 no-underline',
        bentoTileClassName(format),
        className,
      )}
      href={href}
      aria-label={`${title}, ${artist}, ${year}`}
    >
      <ArtworkImage src={imageUrl} alt={`${artist}, ${title}, ${year}`} />

      <span className="artwork-card__caption flex flex-col px-2.5 pt-1 pb-2">
        <span
          className={cn(
            'artwork-card__caption-text flex flex-col gap-1',
            format === 'small' && ARTWORK_CARD_CLIPPED_CAPTION,
          )}
        >
          <span className="artwork-card__caption-line flex items-baseline justify-between gap-3">
            <span className="artwork-card__title line-clamp-2 min-w-0 flex-1 text-caption-title">
              {title}
            </span>
            <DatePill className="min-w-0 max-w-[45%] truncate">{year}</DatePill>
          </span>
          <span className="artwork-card__artist truncate text-caption-meta text-text-muted">
            {artist}
          </span>
        </span>
      </span>
    </a>
  );
}
