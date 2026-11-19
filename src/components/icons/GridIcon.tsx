import { cn } from '@/lib/utils';

/**
 * Four squares: the grid side of My Gallery's layout switch. Drawn at the
 * stroke of the system on a 24 x 24 viewBox, rendered at 18 px, and always
 * beside the word it stands for, so it is decorative.
 */
export function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('grid-icon', className)}
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
      <path d="M3 3h7v7H3z" />
      <path d="M14 3h7v7h-7z" />
      <path d="M14 14h7v7h-7z" />
      <path d="M3 14h7v7H3z" />
    </svg>
  );
}
