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
 * It is hidden below 761 px, where the header keeps only the logotype and the
 * mode switch.
 */
export function MainNavigation({
  items,
  currentHref,
  className,
}: {
  items: readonly MainNavigationItem[];
  /** The `href` of the destination being shown, if it is one of the items. */
  currentHref?: string;
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
      {items.map((item) => {
        const isCurrent = item.href === currentHref;

        return (
          <a
            key={item.href}
            className={cn(
              'main-navigation__link inline-flex min-h-10 items-center rounded-pill px-4 text-caption-short no-underline',
              isCurrent && 'main-navigation__link--current bg-inverse-bg text-inverse-text',
            )}
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
