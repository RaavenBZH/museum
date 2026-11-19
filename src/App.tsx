import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { NoticePanel } from '@/components/layout/NoticePanel';
import type { MainNavigationItem } from '@/components/layout/MainNavigation';
import { useTheme } from '@/hooks/useTheme';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * The only screen that is loaded on demand. It is the one that draws a chart,
 * and the charting library costs more gzipped than the whole rest of the
 * application: measured on this project, 111 kB against 70 kB. Behind
 * `lazy`, that weight goes into a chunk of its own and the two screens that
 * show artworks never pay for it.
 */
const loadGalleryPage = () => import('@/pages/GalleryPage');

const GalleryPage = lazy(() =>
  loadGalleryPage().then((module) => ({ default: module.GalleryPage })),
);

/**
 * How long the shell waits, at most, for the browser to be idle before it
 * fetches the gallery's chunk anyway.
 */
const GALLERY_PREFETCH_DEADLINE_MS = 3000;

/**
 * The destinations of the bar, in order: the home, then the two modes of the
 * product.
 *
 * The home is a screen of its own and not one of the modes: it presents them
 * and shows a first set of artworks, which is why the logotype and `Home` lead
 * to the same place while `Discover` has its own route.
 *
 * `My Gallery` opens on the collection itself: how the museum's records are
 * spread across its departments. The artworks a visitor has kept belong there
 * too and are not built yet; the screen shows what it can actually count.
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
 *
 * The display mode is read here and handed down as props, because everything
 * under `components/` is presentation without state: the shell is the lowest
 * place that can read the run and the mode and still pass them on.
 */
export function App() {
  const { resolvedMode, setMode } = useTheme();

  // The gallery's chunk is split off so that the first screen never waits for
  // it — but nothing makes the visitor wait for it later either: once the
  // screen in front of them is done and the browser is idle, it is fetched in
  // the background, and opening My Gallery no longer pays for the charting
  // library. A browser without idle callbacks waits the same deadline instead.
  useEffect(() => {
    const prefetch = () => {
      void loadGalleryPage();
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idle = window.requestIdleCallback(prefetch, { timeout: GALLERY_PREFETCH_DEADLINE_MS });

      return () => window.cancelIdleCallback(idle);
    }

    const timer = setTimeout(prefetch, GALLERY_PREFETCH_DEADLINE_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-shell mx-auto flex min-h-dvh w-full max-w-page flex-col px-4 desktop:px-10">
      <AppHeader
        navigation={MAIN_NAVIGATION}
        themeMode={resolvedMode}
        onThemeModeChange={setMode}
      />

      <main className="app-shell__main flex flex-1 flex-col py-6">
        <ErrorBoundary>
          <Suspense
            fallback={
              <NoticePanel
                className="app-shell__loading"
                title="Opening the screen…"
                lead="Loading the part of the application this screen needs."
                role="status"
                isBusy
              />
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/discover/:artworkId" element={<DiscoverPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <AppFooter />
    </div>
  );
}
