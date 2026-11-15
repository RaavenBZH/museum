import {
  MetMuseumNetworkError,
  MetMuseumNotFoundError,
  MetMuseumRateLimitError,
} from '@/api/metMuseumErrors';

/**
 * What to tell the visitor when the collection API refuses. The three cases
 * are genuinely different and must not share one message: the IP block clears
 * by itself in a few minutes, a missing object never will, and a network
 * failure is on this side of the wire.
 */
export function describeCollectionError(error: unknown): string {
  if (error instanceof MetMuseumRateLimitError) {
    return 'The museum is refusing calls for the moment. It clears by itself after a few minutes — try again then.';
  }

  if (error instanceof MetMuseumNotFoundError) {
    return 'The museum has no record for this artwork.';
  }

  if (error instanceof MetMuseumNetworkError) {
    return 'The museum could not be reached. Check your connection and try again.';
  }

  return 'Something went wrong while reading the collection. Try again.';
}
