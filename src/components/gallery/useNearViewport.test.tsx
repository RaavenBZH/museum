import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubIntersectionObserver } from '@/test/intersectionObserverStub';
import { useNearViewport } from './useNearViewport';

function NearProbe() {
  const { ref, isNear } = useNearViewport<HTMLParagraphElement>();

  return <p ref={ref}>near: {String(isNear)}</p>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useNearViewport', () => {
  it('says far until the element comes near the screen', () => {
    stubIntersectionObserver();
    render(<NearProbe />);

    expect(screen.getByText('near: false')).toBeInTheDocument();
  });

  it('says near once it has come close, and stops watching', () => {
    const viewport = stubIntersectionObserver();
    render(<NearProbe />);

    act(() => {
      viewport.scrollAllIntoView();
    });

    expect(screen.getByText('near: true')).toBeInTheDocument();
    expect(viewport.watchedCount).toBe(0);
  });

  it('stops watching when the element goes away', () => {
    const viewport = stubIntersectionObserver();
    const { unmount } = render(<NearProbe />);

    unmount();

    expect(viewport.watchedCount).toBe(0);
  });

  it('treats everything as near in a browser that cannot tell', () => {
    // jsdom itself has no IntersectionObserver.
    render(<NearProbe />);

    expect(screen.getByText('near: true')).toBeInTheDocument();
  });
});
