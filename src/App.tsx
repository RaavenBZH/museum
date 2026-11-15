import { Route, Routes } from 'react-router';
import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import type { MainNavigationItem } from '@/components/layout/MainNavigation';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * The destinations of the bar, in order: the home, then the two modes of the
 * product.
 *
 * The home is a screen of its own and not one of the modes: it presents them
 * and shows a first set of artworks, which is why the logotype and `Home` lead
 * to the same place while `Discover` has its own route.
 *
 * `My Gallery` is in the bar because the home already offers it; until its
 * screen exists, its address is served by the "not found" page, which says so
 * rather than failing silently.
 *
 * A timed mode was drawn and dropped: it is not being built, so it is in
 * neither the bar nor the home.
 */
const MAIN_NAVIGATION: readonly MainNavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'My Gallery', href: '/gallery' },
];

/**
 * The page shell: the bar, the screen the address names, the footer.
 *
 * The bar marks the current destination itself, from the router — see
 * `MainNavigation` — so this shell has nothing to say about it and the mark
 * and the screen can never disagree.
 *
 * The boundary is around the screen alone and not around the shell: a screen
 * that throws is replaced, while the bar and the foot stay where they are, so
 * the visitor keeps the way out.
 */
export function App() {
  return (
    <div className="app-shell mx-auto flex min-h-dvh w-full max-w-page flex-col px-4 desktop:px-10">
      <AppHeader navigation={MAIN_NAVIGATION} />

      <main className="app-shell__main flex flex-1 flex-col py-6">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <AppFooter />
    </div>
  );
}
