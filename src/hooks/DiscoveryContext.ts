import { createContext } from 'react';
import type { Artwork } from '@/domain/artwork';
import type { SeenArtwork } from '@/domain/seenArtwork';

/**
 * The state of the discovery run, held above the screens so that it survives
 * leaving Discover and coming back to it: that is the whole point of the
 * context — a visitor who walks to My Gallery and returns finds the artwork
 * they were looking at, not a new draw.
 *
 * The artwork on screen lives in memory only, so reloading the page draws a
 * new one; what has been seen is kept in the browser's storage, so it is never
 * drawn again and My Gallery keeps it.
 */
/** Which artwork could not be opened, and what to tell the visitor. */
export type OpenFailure = {
  artworkId: number;
  message: string;
};

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
  /** Every artwork revealed so far, oldest first, this visit and earlier ones. */
  seen: readonly SeenArtwork[];
  /** What to tell the visitor when the collection API refused. */
  error: string | null;
  /**
   * The artwork asked for by name that could not be opened, and why: unknown
   * to the collection, without a picture, or refused by the museum. It names
   * the artwork, so a screen shows it only at that artwork's address. The run
   * itself goes on.
   */
  openFailure: OpenFailure | null;
  start: () => void;
  next: () => void;
  retry: () => void;
  /**
   * Puts one named artwork on screen — from My Gallery, or from its address —
   * and starts the run behind it if it was not started. Asking for the
   * artwork already on screen, or already being read, does nothing.
   */
  open: (artworkId: number) => void;
};

export const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);
