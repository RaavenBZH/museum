import { useId, type ReactNode } from 'react';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { CenturyComparisonChart } from '@/components/statistics/CenturyComparisonChart';
import { MediumPieChart } from '@/components/statistics/MediumPieChart';
import { Button } from '@/components/ui/Button';
import type { CenturyCount, MediumCount } from '@/domain/galleryInsights';
import { cn } from '@/lib/utils';

/**
 * "More about my gallery": a folded section under the progress card, with two
 * charts that each answer one question about the artworks seen.
 *
 * It is folded by default because the ring above already answers the first
 * question a visitor has. The page owns whether it is open, and has the
 * counts it shows asked for ahead of time, so this component holds no state
 * of its own and the chart is there the moment it unfolds.
 *
 * The folded part stays in the page under `hidden`, so `aria-expanded` and
 * `aria-controls` describe an element that exists, as on the wall label.
 */
function InsightCard({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead: string;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();

  return (
    <section
      className={cn('gallery-insights__card flex min-w-0 flex-col gap-4 rounded-card bg-surface p-6 desktop:p-8', className)}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="gallery-insights__title flex items-center gap-2.5 text-caption-title">
        <span className="size-2 shrink-0 rounded-pill bg-accent" aria-hidden="true" />
        {title}
      </h2>
      <p className="gallery-insights__lead text-lead text-text-muted">{lead}</p>
      {children}
    </section>
  );
}

export function GalleryInsights({
  isOpen,
  onToggle,
  centuries,
  centuriesError,
  onRetryCenturies,
  mediums,
  className,
}: {
  isOpen: boolean;
  onToggle: () => void;
  /** `null` while the museum is being counted. */
  centuries: readonly CenturyCount[] | null;
  centuriesError: string | null;
  onRetryCenturies: () => void;
  mediums: readonly MediumCount[];
  className?: string;
}) {
  const panelId = useId();

  return (
    <div className={cn('gallery-insights flex flex-col items-start gap-6', className)}>
      <Button
        className="gallery-insights__disclosure"
        variant="secondary"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {isOpen ? 'Hide the details' : 'More about my gallery'}
        <ChevronIcon direction={isOpen ? 'up' : 'down'} />
      </Button>

      <div
        id={panelId}
        className={cn('gallery-insights__panel w-full gap-6 desktop:grid-cols-12', isOpen && 'grid')}
        hidden={!isOpen}
      >
        <InsightCard
          className="desktop:col-span-7"
          title="By century"
          lead="Your artworks, by the century they were painted in."
        >
          {centuriesError !== null ? (
            <div className="gallery-insights__error flex flex-col items-start gap-3" role="alert">
              <p className="text-caption-title">{centuriesError}</p>
              <Button variant="secondary" onClick={onRetryCenturies}>
                Try again
              </Button>
            </div>
          ) : centuries === null ? (
            <p className="gallery-insights__counting text-caption-meta text-text-muted" role="status">
              Counting the paintings of each century…
            </p>
          ) : (
            <CenturyComparisonChart rows={centuries} />
          )}
        </InsightCard>

        <InsightCard
          className="desktop:col-span-5"
          title="By medium"
          lead="What your artworks are made of."
        >
          {mediums.length === 0 ? (
            <p className="gallery-insights__empty text-caption-meta text-text-muted">
              Nothing to count yet.
            </p>
          ) : (
            <MediumPieChart rows={mediums} />
          )}
        </InsightCard>
      </div>
    </div>
  );
}
