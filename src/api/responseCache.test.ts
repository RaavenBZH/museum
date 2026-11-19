import { describe, expect, it, vi } from 'vitest';
import { createResponseCache } from './responseCache';

describe('createResponseCache', () => {
  it('serves a second read of the same key without calling again', async () => {
    const cache = createResponseCache();
    const load = vi.fn(async () => ({ total: 2 }));

    await expect(cache.load('/objects', load)).resolves.toEqual({ total: 2 });
    await expect(cache.load('/objects', load)).resolves.toEqual({ total: 2 });
    expect(load).toHaveBeenCalledTimes(1);
    expect(cache.size).toBe(1);
  });

  it('collapses two simultaneous reads of the same key into one call', async () => {
    const cache = createResponseCache();
    const load = vi.fn(async () => 'one request');

    const [first, second] = await Promise.all([
      cache.load('/objects/1', load),
      cache.load('/objects/1', load),
    ]);

    expect(first).toBe('one request');
    expect(second).toBe('one request');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('keeps different keys apart', async () => {
    const cache = createResponseCache();

    await expect(cache.load('/objects/1', async () => 1)).resolves.toBe(1);
    await expect(cache.load('/objects/2', async () => 2)).resolves.toBe(2);
    expect(cache.size).toBe(2);
  });

  it('calls again once the entry has expired', async () => {
    let current = 0;
    const cache = createResponseCache({ ttlMs: 1000, now: () => current });
    const load = vi.fn(async () => 'fresh');

    await cache.load('/objects', load);
    current = 999;
    await cache.load('/objects', load);
    expect(load).toHaveBeenCalledTimes(1);

    current = 1001;
    await cache.load('/objects', load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('honours a lifetime given for one key only', async () => {
    let current = 0;
    const cache = createResponseCache({ ttlMs: 1000, now: () => current });
    const load = vi.fn(async () => 'stable');

    await cache.load('/objects/1', load, 10_000);
    current = 5000;

    await cache.load('/objects/1', load, 10_000);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failure, so the next caller can retry', async () => {
    const cache = createResponseCache();
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('HTTP 403'))
      .mockResolvedValueOnce('retried');

    await expect(cache.load('/objects', load)).rejects.toThrow('HTTP 403');
    expect(cache.size).toBe(0);
    await expect(cache.load('/objects', load)).resolves.toBe('retried');
  });

  it('drops the oldest entries past the maximum it is allowed to hold', async () => {
    const cache = createResponseCache({ maxEntries: 2 });
    const load = vi.fn(async () => 'value');

    await cache.load('/objects/1', load);
    await cache.load('/objects/2', load);
    await cache.load('/objects/3', load);
    expect(cache.size).toBe(2);

    await cache.load('/objects/1', load);
    expect(load).toHaveBeenCalledTimes(4);
    await cache.load('/objects/3', load);
    expect(load).toHaveBeenCalledTimes(4);
  });

  it('forgets a call in flight, so the next caller starts a new one', async () => {
    const cache = createResponseCache();
    const load = vi.fn(async () => 'first');

    const abandoned = cache.load('key', load);
    cache.forget('key');

    await expect(cache.load('key', vi.fn(async () => 'second'))).resolves.toBe('second');
    await expect(abandoned).resolves.toBe('first');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('keeps what it knows when a call in flight is forgotten', async () => {
    const cache = createResponseCache();

    await cache.load('key', async () => 'value');
    cache.forget('key');

    // Only the pending call is dropped: a settled answer is still known.
    await expect(cache.load('key', async () => 'other')).resolves.toBe('value');
    expect(cache.size).toBe(1);
  });

  it('forgets everything when cleared', async () => {
    const cache = createResponseCache();
    const load = vi.fn(async () => 'value');

    await cache.load('/objects', load);
    cache.clear();
    await cache.load('/objects', load);

    expect(load).toHaveBeenCalledTimes(2);
  });
});
