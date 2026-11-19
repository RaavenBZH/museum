import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';

export interface MainNavigationItem {
  label: string;
  href: string;
}

/**
 * The pill navigation of the header. The current destination is marked by an
 * inverted pill *and* by `aria-current`, so the mark does not rest on colour
 * alone.
 *
 * Both marks come from the router: `NavLink` compares its own address to the
 * one being shown, so the mark and the screen can never disagree, and no
 * screen has to be told which of its links is the current one. `end` is what
 * makes the home item behave — without it every address counts as being
 * "under" `/`, and Home would be marked on every screen.
 *
 * Every link is semibold and at the same size, the current one included: a weight
 * or size change would make the word itself grow and move its neighbours each
 * time the destination changes, so the pill carries the whole mark and the row
 * never reflows.
 *
 * It is hidden below 761 px, where the header keeps only the logotype and the
 * mode switch.
 *
 * Its items are router links rather than plain anchors: they are the way back
 * to a screen that holds state — the discovery run — and a full page load
 * would throw that state away. They still render as real anchors with a real
 * `href`, so middle click and "open in a new tab" keep working.
 */
export function MainNavigation({
  items,
  className,
}: {
  items: readonly MainNavigationItem[];
  className?: string;
}) {
  return (
    <nav
      className={cn(
        'main-navigation hidden gap-1 rounded-pill bg-surface p-1 desktop:flex',
        className,
      )}
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <NavLink
          key={item.href}
          className={({ isActive }) =>
            cn(
              'main-navigation__link inline-flex min-h-11 items-center rounded-pill px-4 text-caption-short font-semibold no-underline',
              isActive && 'main-navigation__link--current bg-inverse-bg text-inverse-text',
            )
          }
          to={item.href}
          end
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
