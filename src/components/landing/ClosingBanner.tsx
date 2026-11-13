import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The inverted band that closes the page, below the grid and as wide as it.
 *
 * Its second line uses `--color-inverse-muted` rather than the subtle colour
 * of a headline on a surface, because the band has reversed the palette: that
 * is the token that stays legible on an inverted background.
 *
 * It can carry an artwork as texture. The picture is covered by a veil of
 * `--color-inverse-bg` at 90 %, which is the band's own colour: the veil
 * follows the mode, so it darkens in Sand and lightens in Cocoa, and the
 * headline keeps the same contrast in both. The picture is decorative — it is
 * never the subject, it has no alternative text and is hidden from assistive
 * technology.
 *
 * The band is a `group`, so the texture grows by 5 % when the pointer is
 * anywhere over it, exactly as an artwork card does. The veil does not move
 * with it: only the picture underneath shifts, which is what makes the band
 * feel alive without the headline moving a pixel.
 */
export function ClosingBanner({
  firstLine,
  secondLine,
  action,
  textureImageUrl,
  className,
}: {
  firstLine: string;
  secondLine: string;
  /** A `ButtonLink` with the `inverse` variant. */
  action: ReactNode;
  /** A decorative artwork behind the band; omitted leaves the surface plain. */
  textureImageUrl?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'closing-banner group relative flex flex-col items-start gap-8 overflow-hidden rounded-card bg-inverse-bg p-14 text-inverse-text desktop:flex-row desktop:items-end desktop:justify-between',
        className,
      )}
    >
      {textureImageUrl === undefined ? null : (
        <>
          <img
            className="closing-banner__texture absolute inset-0 size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            src={textureImageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <span
            className="closing-banner__veil absolute inset-0 bg-inverse-bg/90"
            aria-hidden="true"
          />
        </>
      )}

      <h2 className="closing-banner__headline relative text-display">
        {firstLine}
        <br />
        <span className="closing-banner__headline-second-line text-inverse-muted">
          {secondLine}
        </span>
      </h2>
      <div className="closing-banner__action relative">{action}</div>
    </section>
  );
}
