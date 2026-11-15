import type { MainNavigationItem } from '@/components/layout/MainNavigation';
import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { HomePage } from '@/pages/HomePage';

/**
 * The destinations of the bar, in order: the home, then the two modes of the
 * product.
 *
 * The home is a screen of its own and not one of the modes: it presents them
 * and shows a first set of artworks, which is why the logotype and `Home` lead
 * to the same place while `Discover` has its own route. That screen is the one
 * the home's main action opens, so it does not exist yet.
 *
 * A timed mode was drawn and dropped: it is not being built, so it is in
 * neither the bar nor the home.
 */
const MAIN_NAVIGATION: readonly MainNavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'My Gallery', href: '/gallery' },
];

/** The screen the shell is showing; it becomes the router's business later. */
const CURRENT_HREF = '/';

/**
 * The page shell: the bar, the screen, the footer. It shows the home page,
 * since the application has no router yet; the screen it renders is the only
 * thing that will change when it gains one.
 */
export function App() {
  return (
    <div className="app-shell mx-auto flex min-h-dvh w-full max-w-page flex-col px-4 desktop:px-10">
      <AppHeader navigation={MAIN_NAVIGATION} currentHref={CURRENT_HREF} />

      <main className="app-shell__main flex flex-1 flex-col py-6">
        <HomePage />
      </main>

      <AppFooter />
    </div>
  );
}
