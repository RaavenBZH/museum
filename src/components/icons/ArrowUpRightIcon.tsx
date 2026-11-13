import { cn } from '@/lib/utils';

/**
 * The diagonal arrow of the design system, used inside the 40 px accent
 * circle of the action tile and nowhere else.
 *
 * Decorative for the same reason as the right arrow: the tile carries its own
 * label.
 *
 * On hover it slides 2 px up and 2 px right, which is where it points, under
 * the same `motion-safe` guard as the right arrow.
 */
export function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        'arrow-up-right-icon transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5',
        className,
      )}
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
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
