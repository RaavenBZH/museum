import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTEMPLATION_SECONDS, useArtworkContemplation } from './useArtworkContemplation';

function ContemplationProbe() {
  const { isLocked, secondsLeft } = useArtworkContemplation();

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
    render(<ContemplationProbe />);

    expect(screen.getByText(`locked: true · ${CONTEMPLATION_SECONDS}`)).toBeInTheDocument();
  });

  it('counts down in whole seconds, then opens', () => {
    render(<ContemplationProbe />);

    passSeconds(1);
    expect(screen.getByText('locked: true · 2')).toBeInTheDocument();

    passSeconds(1);
    expect(screen.getByText('locked: true · 1')).toBeInTheDocument();

    passSeconds(1);
    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();
  });

  it('stays open once it has opened', () => {
    render(<ContemplationProbe />);

    passSeconds(30);

    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();
  });

  it('keeps counting the same moment while it stays on the same artwork', () => {
    const { rerender } = render(<ContemplationProbe />);

    passSeconds(CONTEMPLATION_SECONDS);
    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();

    // Re-rendering is not a new artwork: only a new key is, which is what the
    // Discover screen gives it.
    rerender(<ContemplationProbe />);
    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();
  });

  it('starts a full moment again when the caller mounts it for a new artwork', () => {
    const { rerender } = render(<ContemplationProbe key={1} />);

    passSeconds(CONTEMPLATION_SECONDS);
    expect(screen.getByText('locked: false · 0')).toBeInTheDocument();

    rerender(<ContemplationProbe key={2} />);

    expect(screen.getByText(`locked: true · ${CONTEMPLATION_SECONDS}`)).toBeInTheDocument();
  });

  it('drops its timer when it is unmounted', () => {
    const { unmount } = render(<ContemplationProbe />);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
