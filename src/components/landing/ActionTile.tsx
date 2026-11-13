import { ArrowUpRightIcon } from '@/components/icons/ArrowUpRightIcon';
import { bentoTileClassName } from '@/components/layout/bentoTileFormats';
import { cn } from '@/lib/utils';

/**
 * The inverted tile that closes the grid: a counter at the top, the accent
 * circle holding the diagonal arrow beside it, and the label at the bottom.
 *
 * It is a link the size of a small tile, so it reads as one more cell of the
 * grid rather than as a button dropped into it.
 *
 * Like the closing band, it can carry an artwork as texture under a veil of
 * its own background colour at 90 %, so the veil follows the mode and the
 * label keeps its contrast. The picture is decorative and hidden from
 * assistive technology, and it grows by 5 % on hover like any other picture
 * in the grid — the tile is already a `group` for its arrow.
 *
 * The counter is optional, and left out rather than guessed: a tile that
 * announced a number nobody had counted would be worse than a tile that
 * announces nothing. The arrow stays at the top either way, so the tile keeps
 * its shape.
 */
export function ActionTile({
  href,
  label,
  counter,
  textureImageUrl,
  className,
}: {
  href: string;
  label: string;
  /** Says how much lies behind the link, e.g. "24 artworks", when it is known. */
  counter?: string;
  /** A decorative artwork behind the tile; omitted leaves the surface plain. */
  textureImageUrl?: string;
  className?: string;
}) {
  return (
    <a
      className={cn(
        'action-tile group relative flex flex-col justify-between overflow-hidden rounded-card bg-inverse-bg p-5.5 text-inverse-text no-underline',
        bentoTileClassName('action'),
        className,
      )}
      href={href}
    >
      {textureImageUrl === undefined ? null : (
        <>
          <img
            className="action-tile__texture absolute inset-0 size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            src={textureImageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <span className="action-tile__veil absolute inset-0 bg-inverse-bg/90" aria-hidden="true" />
        </>
      )}

      <span
        className={cn(
          'action-tile__head relative flex items-center gap-2',
          // With no counter the arrow is alone on its line, and `justify-between`
          // would send it to the left, where the tile has nothing to balance it.
          counter === undefined ? 'justify-end' : 'justify-between',
        )}
      >
        {counter === undefined ? null : (
          <span className="action-tile__counter font-mono text-mono text-inverse-muted">
            {counter}
          </span>
        )}
        <span className="action-tile__arrow inline-flex size-10 items-center justify-center rounded-pill bg-accent text-on-accent transition-colors group-hover:bg-accent-hover">
          <ArrowUpRightIcon />
        </span>
      </span>
      <span className="action-tile__label relative text-tile-title">{label}</span>
    </a>
  );
}
