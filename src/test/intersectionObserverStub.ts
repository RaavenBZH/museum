import { vi } from 'vitest';

/**
 * jsdom has no `IntersectionObserver`, so it cannot say when something scrolls
 * into view. This stand-in records what is observed, and lets a test bring an
 * element into view by hand.
 */
export function stubIntersectionObserver() {
  const observed = new Map<Element, IntersectionObserverCallback>();

  class IntersectionObserverStub {
    private readonly callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }

    observe(element: Element) {
      observed.set(element, this.callback);
    }

    disconnect() {
      for (const [element, callback] of observed) {
        if (callback === this.callback) {
          observed.delete(element);
        }
      }
    }
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

  return {
    /** How many elements are waiting to come into view. */
    get watchedCount() {
      return observed.size;
    },
    /** Brings every watched element into view, as a scroll would. */
    scrollAllIntoView() {
      for (const [element, callback] of [...observed]) {
        callback(
          [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }
    },
  };
}
