import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { DiscoveryProvider } from '@/hooks/DiscoveryProvider';
import { ThemeProvider } from '@/hooks/ThemeProvider';

const loaded = vi.hoisted(() => ({ gallery: 0 }));

// Counts when the gallery's chunk is actually loaded, without changing it.
vi.mock('@/pages/GalleryPage', async (importOriginal) => {
  loaded.gallery += 1;

  return importOriginal();
});

function renderHome() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <DiscoveryProvider>
          <App />
        </DiscoveryProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('App, prefetching the gallery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('fetches the gallery chunk in the background once the first screen is idle', async () => {
    let idle: (() => void) | undefined;

    vi.stubGlobal('requestIdleCallback', (callback: () => void) => {
      idle = callback;

      return 1;
    });
    vi.stubGlobal('cancelIdleCallback', vi.fn());

    const { unmount } = renderHome();

    // Nothing is fetched while the first screen is still busy.
    expect(loaded.gallery).toBe(0);

    idle?.();
    await vi.dynamicImportSettled();

    expect(loaded.gallery).toBe(1);

    // Unmounted while the idle stubs are still in place: the shell cancels
    // its idle callback on the way out.
    unmount();
  });
});
