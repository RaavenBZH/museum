import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A muted pill holding an accent pill: the accent names the state ("New"),
 * the rest of the pill names what is in that state.
 *
 * The state is carried by a word, never by the accent alone, so the badge
 * still reads when colour is unavailable.
 */
export function Badge({
  highlight,
  children,
  className,
}: {
  highlight: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'badge inline-flex items-center gap-2 rounded-pill bg-surface-muted py-1.5 pr-3 pl-1.5 text-caption-meta font-medium text-text',
        className,
      )}
    >
      {/* `text-mono` is a size, not a family: the badge stays in the sans
       * face, because the monospace family is reserved for figures. */}
      <span className="badge__highlight rounded-pill bg-accent px-2 py-0.75 text-mono text-on-accent">
        {highlight}
      </span>
      {children}
    </span>
  );
}
