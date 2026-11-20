import { useEffect, useState } from 'react';

/**
 * How far ahead of the viewport an artwork starts loading: about one row of
 * the grid, so that a picture is already arriving when it scrolls into view
 * rather than starting then.
 */
const NEAR_VIEWPORT_MARGIN = '240px 0px';

/**
 * Tells a card whether it has come near the screen yet, and keeps saying so
 * once it has: a picture that has been fetched is not dropped again on the way
 * back up.
 *
 * It is the state of one card and of nothing else — like the folded record of
 * the wall label — which is why it sits beside the components that use it rather
 * than in `hooks/`, whose state is the application's. A browser without
 * `IntersectionObserver` is treated as one where everything is near: the
 * gallery then loads everything, which is what it would do without this.
 */
export function useNearViewport<T extends Element>(): {
  ref: (element: T | null) => void;
  isNear: boolean;
} {
  const [element, setElement] = useState<T | null>(null);
  const [isNear, setIsNear] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (element === null || isNear) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true);
        }
      },
      { rootMargin: NEAR_VIEWPORT_MARGIN },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, isNear]);

  return { ref: setElement, isNear };
}
