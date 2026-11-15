import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTEMPLATION_SECONDS, useArtworkContemplation } from './useArtworkContemplation';

function ContemplationProbe({ artworkId }: { artworkId: number | null }) {
  const { isLocked, secondsLeft } = useArtworkContemplation(artworkId);

  return (
    <p>
      locked: {String(isLocked)} · {secondsLeft}
    </p>
  );
}

/**
 * Lets the given number of seconds pass. One second at a time, because each
 * timer is only scheduled by the render the previous one caused.
 */
function passSeconds(seconds: number) {
  for (let second = 0; second < seconds; second += 1) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
}

describe('useArtworkContemplation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('holds the way shut as soon as an artwork is on screen', () => {
    render(<ContemplationProbe artworkId={1} />);

    expect(screen.getByText(`locked: true · ${CONTEMPLATION_SECONDS}`)).toBeInTheDocument();
  });

  it('counts down in whole seconds, then opens', () => {
    render(<ContemplationProbe artworkId={1} />);

    passSeconds(1);
    expect(screen.getByText('locked: true · 2')).toBeInTheDocument();

    passSeconds(1);
    expect(screen.getByText('locked: true · 1')).toBeInTheDocument();

    passSeconds(1);
    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();
  });

  it('stays open once it has opened', () => {
    render(<ContemplationProbe artworkId={1} />);

    passSeconds(30);

    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();
  });

  it('starts again on the next artwork, and only on it', () => {
    const { rerender } = render(<ContemplationProbe artworkId={1} />);

    passSeconds(CONTEMPLATION_SECONDS);
    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();

    rerender(<ContemplationProbe artworkId={1} />);
    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();

    rerender(<ContemplationProbe artworkId={2} />);
    expect(screen.getByText(`locked: true · ${CONTEMPLATION_SECONDS}`)).toBeInTheDocument();
  });

  it('holds nothing shut while there is no artwork to look at', () => {
    render(<ContemplationProbe artworkId={null} />);

    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();
  });

  it('drops its timer when it is unmounted', () => {
    const { unmount } = render(<ContemplationProbe artworkId={1} />);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
