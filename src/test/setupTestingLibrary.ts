import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without injected globals, so React Testing Library cannot
// register its own teardown: unmount rendered trees between tests here.
afterEach(cleanup);

// jsdom does not implement `window.matchMedia`, which the theme provider uses
// to read the system colour-scheme preference. The stub reports "light" and
// never emits a change, which is the right default for tests.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList => {
    const mediaQueryList = new EventTarget() as EventTarget & {
      matches: boolean;
      media: string;
      onchange: null;
      addListener: () => void;
      removeListener: () => void;
    };

    mediaQueryList.matches = false;
    mediaQueryList.media = query;
    mediaQueryList.onchange = null;
    // Deprecated aliases, still part of the DOM type.
    mediaQueryList.addListener = () => {};
    mediaQueryList.removeListener = () => {};

    return mediaQueryList as unknown as MediaQueryList;
  };
}
