/**
 * The museum documents 80 requests per second, but the measured behaviour is
 * harsher: about 140 calls in a few minutes earn a 403 on every endpoint for
 * roughly five minutes. Spacing the calls 400 ms apart avoided the block
 * entirely, so every call of the transport layer goes through this queue:
 * calls start in the order they were asked for, never closer than
 * `minIntervalMs`.
 *
 * It spaces the **starts** and does not wait for a call to end. The museum's
 * throttling does not always answer with a 403: it can also leave a request
 * hanging for a minute. A queue that waited for each call to finish would let
 * that one request hold every call behind it — the next draw, the artwork a
 * visitor asked to open — and the whole application would stop answering
 * while the museum was merely slow on one object. What protects against the
 * block is how often calls start, and that is what is kept.
 */
const DEFAULT_MIN_REQUEST_INTERVAL_MS = 400;

export type RequestQueue = {
  /** Starts `task` once its turn has come and the interval since the last start has elapsed. */
  schedule: <T>(task: () => Promise<T>) => Promise<T>;
};

export type RequestQueueOptions = {
  minIntervalMs?: number;
  /** Injected by the tests so that they do not wait for real time to pass. */
  delay?: (ms: number) => Promise<void>;
  now?: () => number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createRequestQueue(options: RequestQueueOptions = {}): RequestQueue {
  const {
    minIntervalMs = DEFAULT_MIN_REQUEST_INTERVAL_MS,
    delay = sleep,
    now = Date.now,
  } = options;

  let tail: Promise<unknown> = Promise.resolve();
  let nextSlotAt = 0;

  return {
    schedule<T>(task: () => Promise<T>): Promise<T> {
      // The chain holds the waiting only: it moves on as soon as this call's
      // slot has come, whatever the call then does.
      const slot = tail.then(async () => {
        const waitMs = nextSlotAt - now();

        if (waitMs > 0) {
          await delay(waitMs);
        }

        nextSlotAt = now() + minIntervalMs;
      });

      tail = slot;

      return slot.then(task);
    },
  };
}
