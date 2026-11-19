import { cn } from '@/lib/utils';

/**
 * Three ruled lines with their bullets: the list side of My Gallery's layout
 * switch. Drawn at the stroke of the system on a 24 x 24 viewBox, rendered at
 * 18 px, and always beside the word it stands for, so it is decorative.
 */
export function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('list-icon', className)}
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
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}
