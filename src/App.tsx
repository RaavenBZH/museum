import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';

export function App() {
  return (
    <div className="app-shell mx-auto flex min-h-dvh w-full max-w-page flex-col px-4 desktop:px-10">
      <AppHeader />

      <main className="app-shell__main flex flex-1 flex-col gap-5 py-10">
        <h1 className="app-shell__title max-w-[480px] text-hero">
          Learn the collection.
          <br />
          <span className="app-shell__title-second-line text-text-subtle">
            One artwork at a time.
          </span>
        </h1>
        <p className="app-shell__lead max-w-[480px] text-lead text-text-muted">
          Discover the Metropolitan Museum of Art collection one artwork at a time, and build a
          gallery of everything you have seen.
        </p>
      </main>

      <AppFooter />
    </div>
  );
}
