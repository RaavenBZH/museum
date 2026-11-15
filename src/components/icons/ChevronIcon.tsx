import { cn } from '@/lib/utils';

/**
 * The chevron of a disclosure, drawn at the stroke on a 24 x 24 viewBox and
 * rendered at 18 px like every other icon of the system.
 *
 * It points down when the thing it controls is folded and up when it is open,
 * so it states the state and not the action. It is decorative either way: the
 * button's own label says which of the two it is, and `aria-expanded` says it
 * again for a screen reader.
 */
export function ChevronIcon({
  direction,
  className,
}: {
  direction: 'up' | 'down';
  className?: string;
}) {
  return (
    <svg
      className={cn('chevron-icon', className)}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'up' ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
    </svg>
  );
}
