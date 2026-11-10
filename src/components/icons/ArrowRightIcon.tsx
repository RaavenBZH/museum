import { cn } from '@/lib/utils';

/**
 * The right arrow of the design system, drawn at the stroke on a 24 x 24
 * viewBox and rendered at 18 px.
 *
 * It follows the label of a primary or inverse button and never appears on
 * its own, so it is always decorative: `aria-hidden` is not optional here,
 * the adjacent label already names the action.
 *
 * On hover it slides 2 px the way it points — the direction it already means,
 * made momentary. The movement is `motion-safe` only: a reader who has asked
 * the system for less motion still gets the colour change, which is what
 * carries the state.
 */
export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        'arrow-right-icon transition-transform motion-safe:group-hover:translate-x-0.5',
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
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
