import { cn } from '@/lib/utils';

/**
 * The year of an artwork, set in the monospace family because it is a figure.
 *
 * It has one form everywhere, and that form carries no surface of its own. A
 * year that sat on a pill in some tiles and bare in others would read as a
 * label on those tiles and as plain text on the rest, which is the kind of
 * difference a grid of cards cannot afford: the same field must look the same
 * in every tile. The surface is reserved for things that really are labels,
 * which is `Badge`.
 */
export function DatePill({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn('date-pill whitespace-nowrap font-mono text-mono text-text-muted', className)}
    >
      {children}
    </span>
  );
}
