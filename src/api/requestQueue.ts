/**
 * The museum documents 80 requests per second, but the measured behaviour is
 * harsher: about 140 calls in a few minutes earn a 403 on every endpoint for
 * roughly five minutes. Spacing the calls 400 ms apart avoided the block
 * entirely, so every call of the transport layer goes through this queue:
 * one request at a time, never closer than `minIntervalMs`.
 */
export const DEFAULT_MIN_REQUEST_INTERVAL_MS = 400;

export type RequestQueue = {
  /** Runs `task` once the previous one is done and the interval has elapsed. */
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
      const scheduled = tail.then(async () => {
        const waitMs = nextSlotAt - now();

        if (waitMs > 0) {
          await delay(waitMs);
        }

        nextSlotAt = now() + minIntervalMs;

        return task();
      });

      // The chain must survive a failing task, otherwise one error would stop
      // every later call; the rejection still reaches the caller through
      // `scheduled`.
      tail = scheduled.catch(() => undefined);

      return scheduled;
    },
  };
}
