/**
 * A response cache keyed by URL, with two jobs:
 *
 * 1. **Serve what is already known.** The same object is read by the list, the
 *    detail view and the chart sample, and `GET /objects` is read on every
 *    department change. The museum's data changes once a day at most, so a
 *    second call for the same URL is pure waste — and waste here is what
 *    triggers the IP block.
 * 2. **Collapse simultaneous calls.** Two components asking for the same
 *    object at the same moment share one request instead of sending two.
 *
 * It holds no React: it is a plain object, which is what makes it testable
 * without mounting anything and shareable by the hooks layer later on.
 */
const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;
const DEFAULT_CACHE_MAX_ENTRIES = 500;

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

export type ResponseCache = {
  /**
   * Returns the cached value for `key`, the pending call for `key`, or starts
   * `load` and caches what it resolves to. A rejection is never cached.
   */
  load: <T>(key: string, load: () => Promise<T>, ttlMs?: number) => Promise<T>;
  /**
   * Drops the call in flight for `key`, so the next caller starts a new one
   * instead of joining a request that is being abandoned. Settled values are
   * kept: forgetting a *pending* call is not forgetting what is known.
   */
  forget: (key: string) => void;
  /** How many settled responses are held, pending calls excluded. */
  readonly size: number;
  /** Forgets everything; the pages never need it, the tests do. */
  clear: () => void;
};

export type ResponseCacheOptions = {
  ttlMs?: number;
  /** Oldest entries are dropped past this count, to bound the memory of a long session. */
  maxEntries?: number;
  /** Injected by the tests so that expiry can be observed without waiting. */
  now?: () => number;
};

export function createResponseCache(options: ResponseCacheOptions = {}): ResponseCache {
  const {
    ttlMs: defaultTtlMs = DEFAULT_CACHE_TTL_MS,
    maxEntries = DEFAULT_CACHE_MAX_ENTRIES,
    now = Date.now,
  } = options;

  const entries = new Map<string, CacheEntry>();
  const pending = new Map<string, Promise<unknown>>();

  function remember(key: string, value: unknown, ttlMs: number): void {
    // Re-inserting moves the key to the end of the iteration order, so the
    // first key is always the least recently stored one.
    entries.delete(key);
    entries.set(key, { value, expiresAt: now() + ttlMs });

    while (entries.size > maxEntries) {
      const oldestKey = entries.keys().next().value;

      if (oldestKey === undefined) {
        return;
      }

      entries.delete(oldestKey);
    }
  }

  return {
    load<T>(key: string, load: () => Promise<T>, ttlMs: number = defaultTtlMs): Promise<T> {
      const entry = entries.get(key);

      if (entry !== undefined) {
        if (entry.expiresAt > now()) {
          return Promise.resolve(entry.value as T);
        }

        entries.delete(key);
      }

      const alreadyPending = pending.get(key);

      if (alreadyPending !== undefined) {
        return alreadyPending as Promise<T>;
      }

      // A call only ever removes its own entry: one that was forgotten — an
      // abandoned request — settles after the request that replaced it has
      // been registered, and clearing the key then would leave that one
      // unlisted, so the next caller would start a third.
      const settle = () => {
        if (pending.get(key) === call) {
          pending.delete(key);
        }
      };

      const call: Promise<T> = load().then(
        (value) => {
          settle();
          remember(key, value, ttlMs);

          return value;
        },
        (error: unknown) => {
          // A failure is not a result: the next caller must be free to retry.
          settle();

          throw error;
        },
      );

      pending.set(key, call);

      return call;
    },

    forget(key: string): void {
      pending.delete(key);
    },

    get size(): number {
      return entries.size;
    },

    clear(): void {
      entries.clear();
      pending.clear();
    },
  };
}
