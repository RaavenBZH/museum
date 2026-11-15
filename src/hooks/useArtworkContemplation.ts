import { useEffect, useState } from 'react';

/**
 * Holds the way to the next artwork shut for a moment after one appears.
 *
 * Three seconds is not a throttle for the museum's sake — the next artwork is
 * already loaded, so clicking fast costs no extra call. It is for the
 * visitor's: discovery is worth nothing if the artwork is gone before it has
 * been looked at, and a button that can be hammered invites hammering.
 *
 * The delay restarts whenever the artwork changes, which is the only thing
 * that can restart it, and it restarts **during the render** that brings the
 * new artwork in. Resetting it from an effect would leave one painted frame in
 * which the new artwork is on screen and the way out is already open — long
 * enough for a held key to take it.
 *
 * The artwork and its countdown are therefore one state value: they always
 * change together, and reading one without the other is what the frame above
 * would have done.
 *
 * It counts in whole seconds and down to zero, so the screen can say how long
 * is left rather than holding a button shut for no stated reason.
 */
export const CONTEMPLATION_SECONDS = 3;

type Contemplation = {
  artworkId: number | null;
  secondsLeft: number;
};

function startFor(artworkId: number | null): Contemplation {
  return { artworkId, secondsLeft: artworkId === null ? 0 : CONTEMPLATION_SECONDS };
}

export function useArtworkContemplation(artworkId: number | null): {
  /** True while the next artwork must not be asked for yet. */
  isLocked: boolean;
  /** Whole seconds left, 0 once the way is open. */
  secondsLeft: number;
} {
  const [contemplation, setContemplation] = useState(() => startFor(artworkId));

  // A new artwork resets the countdown here, in the render that brings it in:
  // React re-renders with the new state before anything reaches the screen.
  if (contemplation.artworkId !== artworkId) {
    setContemplation(startFor(artworkId));
  }

  // This render already reads the fresh countdown, so it does not depend on
  // React discarding the output of the pass that triggered the reset.
  const { secondsLeft } =
    contemplation.artworkId === artworkId ? contemplation : startFor(artworkId);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const tick = setTimeout(() => {
      setContemplation((current) => ({ ...current, secondsLeft: current.secondsLeft - 1 }));
    }, 1000);

    return () => clearTimeout(tick);
  }, [secondsLeft]);

  return { isLocked: secondsLeft > 0, secondsLeft };
}
