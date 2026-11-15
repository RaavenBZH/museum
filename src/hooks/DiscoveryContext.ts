import { createContext } from 'react';
import type { Artwork } from '@/domain/artwork';

/**
 * The state of the discovery run, held above the screens so that it survives
 * leaving Discover and coming back to it: that is the whole point of the
 * context — a visitor who walks to My Gallery and returns finds the artwork
 * they were looking at, not a new draw.
 *
 * It lives in memory only. Reloading the page starts a new run, which is
 * honest for a session-long game and costs nothing to explain.
 */
export type DiscoveryContextValue = {
  /** False until the run is started, which arriving on Discover does. */
  hasStarted: boolean;
  /** The artwork on screen. `null` only until the first one has landed. */
  artwork: Artwork | null;
  /** The first draw is under way and there is nothing to show yet. */
  isDrawing: boolean;
  /**
   * The visitor has asked for the next artwork and it is still being drawn.
   * The one on screen stays there until it arrives: emptying the screen for a
   * waiting panel would be a blink for nothing.
   */
  isAwaitingNext: boolean;
  /**
   * The picture of the artwork held in advance, so a screen can have the
   * browser fetch it while this one is being read. Holding the record and not
   * the picture would make "already loaded" a half-truth: the data arrives
   * instantly and the image still has to be downloaded.
   */
  nextImageUrl: string | null;
  /** What to tell the visitor when the collection API refused. */
  error: string | null;
  start: () => void;
  next: () => void;
  retry: () => void;
};

export const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);
