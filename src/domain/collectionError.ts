import {
  MetMuseumNetworkError,
  MetMuseumNotFoundError,
  MetMuseumRateLimitError,
  MetMuseumTimeoutError,
} from '@/api/metMuseumErrors';

/**
 * What to tell the visitor when the collection API refuses. The four cases
 * are genuinely different and must not share one message: the IP block and
 * the slowdown that often comes instead of it clear by themselves in a few
 * minutes, a missing object never will, and a network failure is on this side
 * of the wire.
 */
export function describeCollectionError(error: unknown): string {
  if (error instanceof MetMuseumRateLimitError) {
    return 'The museum is refusing calls for the moment. It clears by itself after a few minutes — try again then.';
  }

  // What the museum's throttling usually looks like: no refusal, no answer.
  if (error instanceof MetMuseumTimeoutError) {
    return 'The museum is not answering. It slows down after many calls and recovers within a few minutes — try again then.';
  }

  if (error instanceof MetMuseumNotFoundError) {
    return 'The museum has no record for this artwork.';
  }

  if (error instanceof MetMuseumNetworkError) {
    return 'The museum could not be reached. Check your connection and try again.';
  }

  return 'Something went wrong while reading the collection. Try again.';
}
