import { cn } from '@/lib/utils';

/**
 * The logotype: a four-bar mark followed by the product name.
 *
 * The mark is 19 x 23 at its natural size: two columns of 8px-wide bars set
 * 3px apart. The top-left and bottom-right bars stand 12px tall and carry the
 * text colour; the other two are 8px and carry the accent. The bottom-right
 * bar is raised 4px, so the two columns are flush at the top and at the
 * bottom while their gaps sit at different heights.
 *
 * `public/favicon.svg` repeats this geometry: a favicon is a separate
 * document and cannot reuse a component.
 */
export function BrandLogo() {
  return (
    <span className="brand-logo inline-flex items-center gap-2.5 text-logo">
      <svg
        className="brand-logo__mark"
        width="19"
        height="23"
        viewBox="0 0 19 23"
        fill="none"
        aria-hidden="true"
      >
        <rect className="brand-logo__bar" y="0" width="8" height="12" rx="2" fill="currentColor" />
        <rect
          className="brand-logo__bar"
          x="11"
          y="0"
          width="8"
          height="8"
          rx="2"
          fill="var(--color-accent)"
        />
        <rect
          className="brand-logo__bar"
          y="15"
          width="8"
          height="8"
          rx="2"
          fill="var(--color-accent)"
        />
        <rect
          className="brand-logo__bar"
          x="11"
          y="11"
          width="8"
          height="12"
          rx="2"
          fill="currentColor"
        />
      </svg>
      <span className="brand-logo__name">Met Museum Explorer</span>
    </span>
  );
}

/**
 * The logotype as a link home, which is what it is in the header: clicking a
 * product's name is the one way back every site has, so the bar offers it
 * twice on purpose — here and on its `Home` item.
 *
 * Only the bar carries the current-page mark, so this link has no
 * `aria-current`: two marked links for one destination would say the same
 * thing twice to a screen reader.
 *
 * It is a real anchor, like `ButtonLink`, so it keeps its keyboard behaviour,
 * its context menu and its middle click.
 */
export function BrandLogoLink({ className }: { className?: string }) {
  return (
    <a className={cn('brand-logo-link inline-flex no-underline', className)} href="/">
      <BrandLogo />
    </a>
  );
}
