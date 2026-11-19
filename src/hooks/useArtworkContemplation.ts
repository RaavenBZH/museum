import { useEffect, useState } from 'react';

/**
 * Holds the way to the next artwork shut for a moment after one appears.
 *
 * Three seconds is not a throttle for the museum's sake — the next artwork is
 * already loaded, so clicking fast costs no extra call. It is for the
 * visitor's: discovery is worth nothing if the artwork is gone before it has
 * been looked at, and a button that can be hammered invites hammering.
 *
 * It counts in whole seconds and down to zero, so the screen can say how long
 * is left rather than holding a button shut for no stated reason.
 */
export const CONTEMPLATION_SECONDS = 3;

/**
 * The countdown of one artwork's moment, and nothing else.
 *
 * It knows nothing about which artwork is on screen, and keeps no copy of it:
 * the only thing in its state is the number of seconds left, which is raw and
 * driven by time alone. A new artwork restarts the countdown the way React
 * restarts state — by identity. The caller mounts it afresh per artwork with a
 * `key`, so the first render of a new artwork already carries a full moment
 * and there is no painted frame in which a new artwork is on screen while the
 * way out is still open.
 */
export function useArtworkContemplation(): {
  /** True while the next artwork must not be asked for yet. */
  isLocked: boolean;
  /** Whole seconds left, 0 once the way is open. */
  secondsLeft: number;
} {
  const [secondsLeft, setSecondsLeft] = useState(CONTEMPLATION_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const tick = setTimeout(() => {
      setSecondsLeft((left) => left - 1);
    }, 1000);

    return () => clearTimeout(tick);
  }, [secondsLeft]);

  return { isLocked: secondsLeft > 0, secondsLeft };
}
