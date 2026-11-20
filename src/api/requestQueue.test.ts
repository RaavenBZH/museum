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
  it('starts the tasks in the order they were scheduled', async () => {
    const clock = createTestClock();
    const queue = createRequestQueue({ minIntervalMs: 400, now: clock.now, delay: clock.delay });
    const started: string[] = [];

    await Promise.all([
      queue.schedule(async () => started.push('first')),
      queue.schedule(async () => started.push('second')),
      queue.schedule(async () => started.push('third')),
    ]);

    expect(started).toEqual(['first', 'second', 'third']);
  });

  it('never lets a call that hangs hold the ones behind it', async () => {
    const clock = createTestClock();
    const queue = createRequestQueue({ minIntervalMs: 400, now: clock.now, delay: clock.delay });

    // What the museum does when it throttles: a request that never answers.
    void queue.schedule(() => new Promise<never>(() => {}));

    await expect(queue.schedule(async () => 'next')).resolves.toBe('next');
  });

  it('still spaces the start of a call from the start of the one before', async () => {
    const clock = createTestClock();
    const delay = vi.fn(clock.delay);
    const queue = createRequestQueue({ minIntervalMs: 400, now: clock.now, delay });

    void queue.schedule(() => new Promise<never>(() => {}));
    await queue.schedule(async () => 'second');

    expect(delay).toHaveBeenCalledWith(400);
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
