import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One collection of My Gallery: its name, one line on what it holds, how many
 * artworks of it have been seen, then those artworks.
 *
 * The mockup groups the gallery by collection; the application draws from one
 * department of the museum, so there is one group, named for it.
 */
export function GalleryCollectionGroup({
  name,
  description,
  countLabel,
  children,
  className,
}: {
  name: string;
  description: string;
  /** "07 artworks", set in the monospace family at the end of the heading. */
  countLabel: string;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();

  return (
    <section
      className={cn('gallery-collection-group flex flex-col gap-5 pb-14', className)}
      aria-labelledby={titleId}
    >
      <div className="gallery-collection-group__heading flex flex-wrap items-baseline justify-between gap-3">
        <div className="gallery-collection-group__naming flex flex-wrap items-baseline gap-4">
          <h2 id={titleId} className="gallery-collection-group__title text-tile-title">
            {name}
          </h2>
          <p className="gallery-collection-group__description text-caption-title font-normal text-text-muted">
            {description}
          </p>
        </div>
        <span className="gallery-collection-group__count font-mono text-mono text-text-muted">
          {countLabel}
        </span>
      </div>

      {children}
    </section>
  );
}
