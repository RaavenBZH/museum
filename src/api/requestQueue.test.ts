import { describe, expect, it, vi } from 'vitest';
import { createRequestQueue } from './requestQueue';

/** A clock the test moves itself, so that no test waits for real time. */
function createTestClock() {
  let current = 0;

  return {
    now: () => current,
    delay: (ms: number) => {
      current += ms;

      return Promise.resolve();
    },
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe('createRequestQueue', () => {
  it('runs one task at a time, in the order they were scheduled', async () => {
    const clock = createTestClock();
    const queue = createRequestQueue({ minIntervalMs: 400, now: clock.now, delay: clock.delay });
    const events: string[] = [];
    let releaseFirst = () => {};

    const first = queue.schedule(async () => {
      events.push('first started');
      await new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
      events.push('first done');
    });
    const second = queue.schedule(async () => {
      events.push('second started');
    });

    await Promise.resolve();
    expect(events).toEqual(['first started']);

    releaseFirst();
    await Promise.all([first, second]);

    expect(events).toEqual(['first started', 'first done', 'second started']);
  });

  it('waits for the interval between two calls', async () => {
    const clock = createTestClock();
    const delay = vi.fn(clock.delay);
    const queue = createRequestQueue({ minIntervalMs: 400, now: clock.now, delay });

    await queue.schedule(async () => 'first');
    clock.advance(150);
    await queue.schedule(async () => 'second');

    expect(delay).toHaveBeenCalledTimes(1);
    expect(delay).toHaveBeenCalledWith(250);
  });

  it('does not wait when the caller is already late', async () => {
    const clock = createTestClock();
    const delay = vi.fn(clock.delay);
    const queue = createRequestQueue({ minIntervalMs: 400, now: clock.now, delay });

    await queue.schedule(async () => 'first');
    clock.advance(900);
    await queue.schedule(async () => 'second');

    expect(delay).not.toHaveBeenCalled();
  });

  it('keeps running later tasks after one of them fails', async () => {
    const clock = createTestClock();
    const queue = createRequestQueue({ minIntervalMs: 0, now: clock.now, delay: clock.delay });

    const failing = queue.schedule(async () => {
      throw new Error('403');
    });

    await expect(failing).rejects.toThrow('403');
    await expect(queue.schedule(async () => 'next')).resolves.toBe('next');
  });
});
