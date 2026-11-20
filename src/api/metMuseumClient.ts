import {
  httpErrorForStatus,
  MetMuseumNetworkError,
  MetMuseumPayloadError,
  MetMuseumTimeoutError,
} from './metMuseumErrors';
import { createRequestQueue, type RequestQueue } from './requestQueue';
import { createResponseCache, type ResponseCache } from './responseCache';

/**
 * The only place in the project that calls `fetch`. It reads JSON over `GET`,
 * and composes the guarantees the Met API needs:
 *
 * - the HTTP status is checked **before** the body is read;
 * - the calls are spaced by a {@link RequestQueue}, to stay under the IP block;
 * - identical URLs are served from a {@link ResponseCache}, which also collapses
 *   two simultaneous calls for the same URL into one request;
 * - a request whose every caller has given up is abandoned, signal and all.
 */
export type GetJsonOptions = {
  /**
   * Gives up this caller's wait when it unmounts or changes parameters, and
   * drops the request itself once **every** caller waiting on it has gone:
   * each URL in flight counts its waiters, so one component leaving never
   * takes the answer away from another that is still waiting for it.
   *
   * A dropped request costs the museum nothing, which is the point — the
   * budget that earns the IP block is spent by calls nobody is waiting for.
   */
  signal?: AbortSignal;
  /** Overrides the cache lifetime for this URL. */
  ttlMs?: number;
};

export type MetMuseumClient = {
  getJson: <T>(url: string, options?: GetJsonOptions) => Promise<T>;
};

/**
 * How long one call may take, body included, before it is given up. A
 * healthy answer takes well under two seconds; the museum's throttling can
 * leave a request hanging for a minute or more. Without a bound the screen
 * waiting on that request would say "loading" forever — with one, it says the
 * museum is not answering and offers to try again.
 */
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;

export type MetMuseumClientOptions = {
  fetchImpl?: typeof fetch;
  /** Replaced by the tests, so that a timeout can be observed without waiting. */
  requestTimeoutMs?: number;
  queue?: RequestQueue;
  cache?: ResponseCache;
};

function abortError(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The request was aborted.', 'AbortError');
}

/**
 * One caller's wait on a shared request, which several callers may share.
 * The request is dropped when the last of them leaves, and not before.
 */
type InFlightRequest = {
  controller: AbortController;
  waiters: number;
};

const ABANDONED_REASON = 'Every caller gave up waiting for this request.';

/**
 * Rejects as soon as `signal` aborts, and tells the caller's departure to
 * `onAbandon` so that the shared request can be dropped once nobody is left.
 */
function raceAbort<T>(call: Promise<T>, signal: AbortSignal, onAbandon?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      onAbandon?.();
      reject(abortError(signal));
    };

    signal.addEventListener('abort', onAbort, { once: true });
    call.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

export function createMetMuseumClient(options: MetMuseumClientOptions = {}): MetMuseumClient {
  const {
    fetchImpl = globalThis.fetch.bind(globalThis),
    requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    queue = createRequestQueue(),
    cache = createResponseCache(),
  } = options;

  const inFlight = new Map<string, InFlightRequest>();

  async function performGet(url: string, signal: AbortSignal): Promise<unknown> {
    // The queue may have held this call back long enough for every caller to
    // leave. Checking here is what makes an abandoned draw cost nothing.
    if (signal.aborted) {
      throw abortError(signal);
    }

    // One signal for `fetch` that ends the call either way: every caller gave
    // up, or the museum took too long. Reading the body is covered too, since
    // a response can arrive and then stall.
    const call = new AbortController();
    const giveUp = () => call.abort();
    const timer = setTimeout(giveUp, requestTimeoutMs);

    signal.addEventListener('abort', giveUp, { once: true });

    // An abort reaches `fetch` and the body as a rejection like any other; it
    // is not a fault of the museum's and must not be reported as one.
    const failure = (fallback: () => Error): unknown => {
      if (signal.aborted) {
        return abortError(signal);
      }

      return call.signal.aborted ? new MetMuseumTimeoutError(url, requestTimeoutMs) : fallback();
    };

    try {
      let response: Response;

      try {
        response = await fetchImpl(url, {
          headers: { Accept: 'application/json' },
          signal: call.signal,
        });
      } catch (cause) {
        throw failure(() => new MetMuseumNetworkError(url, cause));
      }

      if (!response.ok) {
        throw httpErrorForStatus(response.status, url);
      }

      try {
        return await response.json();
      } catch (cause) {
        throw failure(() => new MetMuseumPayloadError(url, 'the body is not valid JSON', cause));
      }
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', giveUp);
    }
  }

  /** Starts one request for `url` and keeps its controller while it lasts. */
  function startRequest(url: string): Promise<unknown> {
    const controller = new AbortController();
    const request: InFlightRequest = { controller, waiters: 0 };

    inFlight.set(url, request);

    return queue.schedule(() => performGet(url, controller.signal)).finally(() => {
      // Identity, not the key: a retry after a failure has its own request.
      if (inFlight.get(url) === request) {
        inFlight.delete(url);
      }
    });
  }

  /**
   * Drops a request nobody is waiting for any more, and only then.
   *
   * It drops it on the spot rather than at the end of the turn: the queue
   * holds calls back by design, so a request abandoned before its turn comes
   * is never sent at all. A component that unmounts and mounts again in the
   * same turn — which is what React does in development — therefore sends one
   * call and not two: the first is dropped unsent, and the second is a fresh
   * request rather than the one being abandoned.
   */
  function dropIfAbandoned(url: string, request: InFlightRequest): void {
    if (request.waiters > 0 || inFlight.get(url) !== request) {
      return;
    }

    inFlight.delete(url);
    // The pending call goes with it: the next caller must start a fresh
    // request rather than join the one being abandoned.
    cache.forget(url);
    request.controller.abort(new DOMException(ABANDONED_REASON, 'AbortError'));
  }

  return {
    getJson<T>(url: string, { signal, ttlMs }: GetJsonOptions = {}): Promise<T> {
      // A caller that has already given up must not spend a call.
      if (signal?.aborted === true) {
        return Promise.reject(abortError(signal));
      }

      const call = cache.load(url, () => startRequest(url), ttlMs) as Promise<T>;
      const request = inFlight.get(url);

      if (request === undefined) {
        // Served from the cache: there is no request to wait on or to drop.
        return signal === undefined ? call : raceAbort(call, signal);
      }

      request.waiters += 1;

      if (signal === undefined) {
        // A caller that cannot give up keeps the request alive for everyone.
        return call;
      }

      return raceAbort(call, signal, () => {
        request.waiters -= 1;

        dropIfAbandoned(url, request);
      });
    },
  };
}

/**
 * The client the application uses. It is a single instance on purpose: the
 * cache and the spacing of the calls are only worth anything if every view
 * shares them.
 */
export const metMuseumClient = createMetMuseumClient();
