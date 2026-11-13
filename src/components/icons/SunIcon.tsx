/**
 * The sun of the mode switch, drawn at the stroke on a 24 x 24 viewBox and
 * rendered at 18 px like the two arrows.
 *
 * It stands for the Sand mode. The button around it carries an `aria-label`,
 * so the drawing itself is decorative; it also never moves on hover, because
 * the state it marks is told by the pill behind it and not by the icon.
 */
export function SunIcon() {
  return (
    <svg
      className="sun-icon"
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
