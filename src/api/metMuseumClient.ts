import {
  httpErrorForStatus,
  MetMuseumNetworkError,
  MetMuseumPayloadError,
} from './metMuseumErrors';
import { createRequestQueue, type RequestQueue } from './requestQueue';
import { createResponseCache, type ResponseCache } from './responseCache';

/**
 * The only place in the project that calls `fetch`. It reads JSON over `GET`,
 * and composes the three guarantees the Met API needs:
 *
 * - the HTTP status is checked **before** the body is read;
 * - the calls are spaced by a {@link RequestQueue}, to stay under the IP block;
 * - identical URLs are served from a {@link ResponseCache}, which also collapses
 *   two simultaneous calls for the same URL into one request.
 */
export type GetJsonOptions = {
  /**
   * Abandons the wait when the caller unmounts or changes parameters. The
   * shared request itself is left running: another component may be waiting on
   * the very same promise, and its answer still fills the cache, so the next
   * mount is served without a call.
   */
  signal?: AbortSignal;
  /** Overrides the cache lifetime for this URL. */
  ttlMs?: number;
};

export type MetMuseumClient = {
  getJson: <T>(url: string, options?: GetJsonOptions) => Promise<T>;
};

export type MetMuseumClientOptions = {
  fetchImpl?: typeof fetch;
  queue?: RequestQueue;
  cache?: ResponseCache;
};

function abortError(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The request was aborted.', 'AbortError');
}

/** Rejects as soon as `signal` aborts, without touching the shared request. */
function raceAbort<T>(call: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError(signal));

    signal.addEventListener('abort', onAbort, { once: true });
    call.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

export function createMetMuseumClient(options: MetMuseumClientOptions = {}): MetMuseumClient {
  const {
    fetchImpl = globalThis.fetch.bind(globalThis),
    queue = createRequestQueue(),
    cache = createResponseCache(),
  } = options;

  async function performGet(url: string): Promise<unknown> {
    let response: Response;

    try {
      response = await fetchImpl(url, { headers: { Accept: 'application/json' } });
    } catch (cause) {
      throw new MetMuseumNetworkError(url, cause);
    }

    if (!response.ok) {
      throw httpErrorForStatus(response.status, url);
    }

    try {
      return await response.json();
    } catch (cause) {
      throw new MetMuseumPayloadError(url, 'the body is not valid JSON', cause);
    }
  }

  return {
    getJson<T>(url: string, { signal, ttlMs }: GetJsonOptions = {}): Promise<T> {
      // A caller that has already given up must not spend a call.
      if (signal?.aborted === true) {
        return Promise.reject(abortError(signal));
      }

      const call = cache.load(url, () => queue.schedule(() => performGet(url)), ttlMs) as Promise<T>;

      return signal === undefined ? call : raceAbort(call, signal);
    },
  };
}

/**
 * The client the application uses. It is a single instance on purpose: the
 * cache and the spacing of the calls are only worth anything if every view
 * shares them.
 */
export const metMuseumClient = createMetMuseumClient();
