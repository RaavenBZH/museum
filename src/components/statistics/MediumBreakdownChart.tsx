import { formatCount } from '@/domain/discoveryProgress';
import type { MediumCount } from '@/domain/galleryInsights';
import { cn } from '@/lib/utils';

/**
 * What the artworks seen are made of: one bar per medium, the most frequent
 * first, each as long as its count against the most frequent. Ranked bars on
 * one baseline compare mediums more exactly than any ring would, and every
 * row is named and counted, so a bar is never read from its colour alone.
 */
export function MediumBreakdownChart({
  rows,
  className,
}: {
  rows: readonly MediumCount[];
  className?: string;
}) {
  const largest = Math.max(...rows.map((row) => row.count), 1);

  return (
    <ul className={cn('medium-breakdown-chart m-0 flex list-none flex-col gap-4 p-0', className)}>
      {rows.map((row) => (
        <li key={row.key} className="medium-breakdown-chart__row flex flex-col gap-2">
          <div className="medium-breakdown-chart__heading flex items-baseline justify-between gap-3">
            <span className="medium-breakdown-chart__label min-w-0 text-caption-title">{row.label}</span>
            <span className="medium-breakdown-chart__figure shrink-0 font-mono text-mono text-text-muted">
              {formatCount(row.count)}
            </span>
          </div>
          <div
            className="medium-breakdown-chart__track h-2 overflow-hidden rounded-pill bg-surface-muted"
            aria-hidden="true"
          >
            <div
              className="medium-breakdown-chart__bar h-full rounded-pill bg-accent"
              style={{ width: `${(row.count / largest) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
