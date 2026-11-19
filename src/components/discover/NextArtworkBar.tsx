import { useId } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * The band under the artwork: the way to the next one, where the eye already
 * is once it has finished looking.
 *
 * It holds one action and one line, and nothing else. The band of the
 * discarded layouts carried a counter of what had been seen; the retained one
 * drops it, and the count belongs to My Gallery, which is the screen that
 * keeps score.
 *
 * For the first seconds of an artwork the action is held shut, and the line
 * beside it says so and counts down. It is held with `aria-disabled` rather
 * than `disabled`: a real `disabled` would take the button out of the tab
 * order, and the line explaining the wait is tied to the button, so a reader
 * on the keyboard would be left with neither the button nor its reason.
 *
 * It is held shut for one other reason: a visitor who asked for the next
 * artwork before one was held in advance is waiting for a call. The artwork
 * they were looking at stays on screen, and this line is what says that the
 * next one is on its way.
 *
 * Its button is the inverse variant and not the accent one: the accent is a
 * surface for the page background, and on an inverted block the system puts
 * the block's own text colour under the label instead.
 *
 * Once open, the next artwork is already loaded, so the button reveals it
 * without a wait.
 */
export function NextArtworkBar({
  isContemplating,
  isAwaitingNext = false,
  secondsLeft,
  onNext,
}: {
  /** True while the visitor is being given a moment to look. */
  isContemplating: boolean;
  /** True while the artwork they asked for is still being drawn. */
  isAwaitingNext?: boolean;
  /** Whole seconds left before the action opens. */
  secondsLeft: number;
  onNext: () => void;
}) {
  // The band holds its own action shut, and each reason to hold it is named
  // once: the caller says what is happening, not what to do about it.
  const isLocked = isContemplating || isAwaitingNext;
  // Generated rather than written down: two bands on one screen would
  // otherwise name the same heading and the same line.
  const titleId = useId();
  const waitId = useId();
  const waitLine = isAwaitingNext
    ? 'Drawing the next artwork…'
    : isContemplating
      ? `Take a moment with this one — ${secondsLeft} s`
      : 'The next artwork stays a surprise.';

  return (
    <section
      className="next-artwork-bar flex flex-wrap items-center justify-between gap-6 rounded-card bg-inverse-bg p-6 text-inverse-text desktop:p-8"
      aria-labelledby={titleId}
    >
      <div className="next-artwork-bar__text flex min-w-0 flex-1 flex-col gap-2">
        <h2 id={titleId} className="next-artwork-bar__title text-tile-title">
          What next?
        </h2>
        <p id={waitId} className="next-artwork-bar__lead text-lead text-inverse-muted">
          {waitLine}
        </p>
      </div>

      <Button
        variant="inverse"
        onClick={isLocked ? undefined : onNext}
        aria-disabled={isLocked}
        aria-describedby={waitId}
      >
        Discover another
      </Button>
    </section>
  );
}
