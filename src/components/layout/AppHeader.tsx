import { BrandLogoLink } from '@/components/brand/BrandLogo';
import {
  MainNavigation,
  type MainNavigationItem,
} from '@/components/layout/MainNavigation';
import { Button } from '@/components/ui/Button';

/**
 * The bar at the top of every screen: logotype, navigation, one action. The
 * logotype is a link home, so the way back is where a visitor looks for it
 * first.
 *
 * It is laid out in three columns rather than with `space-between`, because
 * the navigation has to sit on the centre of the page and not on the centre
 * of whatever space is left between two slots of very different widths. The
 * side columns are `minmax(0, 1fr)` so they stay equal whatever they hold, and
 * the middle column is sized to its content, which puts it on the axis.
 *
 * The columns are named on the items instead of being left to automatic
 * placement: the navigation is `display: none` below 761 px and so stops being
 * a grid item at all, and without `col-start-3` the action would slide into
 * the middle column on a phone.
 */
export function AppHeader({
  navigation,
  currentHref,
}: {
  navigation: readonly MainNavigationItem[];
  /** The `href` of the screen being shown, if it is one of the items. */
  currentHref?: string;
}) {
  return (
    <header className="app-header grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 py-6">
      <BrandLogoLink />
      <MainNavigation className="col-start-2" items={navigation} currentHref={currentHref} />
      <span className="app-header__action col-start-3 justify-self-end">
        <Button variant="text">Settings</Button>
      </span>
    </header>
  );
}
