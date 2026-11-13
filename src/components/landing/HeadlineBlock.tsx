import type { ReactNode } from 'react';
import { bentoTileClassName } from '@/components/layout/bentoTileFormats';
import { cn } from '@/lib/utils';

/**
 * The first cell of the grid: badge, headline, lead and actions, on a surface
 * card the size of six rows.
 *
 * The headline always runs over two lines and ends with a full stop; the
 * second line is set in `--color-text-subtle`, which is only legible at this
 * size and is therefore never used for anything smaller.
 */
export function HeadlineBlock({
  firstLine,
  secondLine,
  lead,
  badge,
  actions,
  className,
}: {
  firstLine: string;
  secondLine: string;
  lead: string;
  /** A `Badge`, when there is something to announce. */
  badge?: ReactNode;
  /** One primary action at most, followed by secondary ones. */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'headline-block flex flex-col justify-between gap-6 rounded-card bg-surface p-11',
        bentoTileClassName('headline'),
        className,
      )}
    >
      {badge === undefined ? null : <span className="headline-block__badge">{badge}</span>}

      <div className="headline-block__text flex flex-col gap-5">
        <h1 className="headline-block__headline text-hero">
          {firstLine}
          <br />
          <span className="headline-block__headline-second-line text-text-subtle">
            {secondLine}
          </span>
        </h1>
        <p className="headline-block__lead max-w-[480px] text-lead text-text-muted">{lead}</p>
      </div>

      {actions === undefined ? null : (
        <div className="headline-block__actions flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </section>
  );
}
