/**
 * The crescent of the mode switch, the counterpart of [`SunIcon`](./SunIcon.tsx)
 * and drawn to the same rules.
 *
 * It stands for the Cocoa mode, and is decorative for the same reason: the
 * button around it is labelled.
 */
export function MoonIcon() {
  return (
    <svg
      className="moon-icon"
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
