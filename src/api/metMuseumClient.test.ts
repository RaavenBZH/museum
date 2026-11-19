import { describe, expect, it, vi } from 'vitest';
import { createMetMuseumClient } from './metMuseumClient';
import {
  MetMuseumHttpError,
  MetMuseumNetworkError,
  MetMuseumNotFoundError,
  MetMuseumPayloadError,
  MetMuseumRateLimitError,
} from './metMuseumErrors';
import { createRequestQueue } from './requestQueue';

const url = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

/** The queue of the tests runs immediately: the spacing is tested on its own. */
function immediateQueue() {
  return createRequestQueue({ minIntervalMs: 0, now: () => 0, delay: () => Promise.resolve() });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function clientWith(fetchImpl: typeof fetch) {
  return createMetMuseumClient({ fetchImpl, queue: immediateQueue() });
}

describe('createMetMuseumClient', () => {
  it('reads the JSON body of a successful response', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1, objectIDs: [1] }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);

    await expect(client.getJson(url)).resolves.toEqual({ total: 1, objectIDs: [1] });
    expect(fetchImpl).toHaveBeenCalledWith(url, {
      headers: { Accept: 'application/json' },
      signal: expect.any(AbortSignal),
    });
  });

  it('checks the status before the body, and names the three failures apart', async () => {
    const readBody = vi.fn();
    const failing = (status: number) =>
      clientWith(
        vi.fn(async () => {
          const response = jsonResponse({ message: 'ignored' }, status);
          response.json = readBody;

          return response;
        }) as unknown as typeof fetch,
      );

    await expect(failing(403).getJson(url)).rejects.toBeInstanceOf(MetMuseumRateLimitError);
    await expect(failing(404).getJson(url)).rejects.toBeInstanceOf(MetMuseumNotFoundError);
    await expect(failing(500).getJson(url)).rejects.toBeInstanceOf(MetMuseumHttpError);
    expect(readBody).not.toHaveBeenCalled();
  });

  it('reports a request that never reached the museum as a network error', async () => {
    const client = clientWith(
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }) as unknown as typeof fetch,
    );

    await expect(client.getJson(url)).rejects.toBeInstanceOf(MetMuseumNetworkError);
  });

  it('reports a body that is not JSON as a payload error', async () => {
    const client = clientWith(
      vi.fn(async () => new Response('<html>maintenance</html>', { status: 200 })) as unknown as typeof fetch,
    );

    await expect(client.getJson(url)).rejects.toBeInstanceOf(MetMuseumPayloadError);
  });

  it('calls the museum once for two reads of the same address', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1 }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);

    await client.getJson(url);
    await client.getJson(url);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('calls the museum once for two simultaneous reads of the same address', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1 }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);

    await Promise.all([client.getJson(url), client.getJson(url)]);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rejects at once when the caller aborts, and spends no call on it', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1 }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);
    const controller = new AbortController();

    const aborted = client.getJson(url, { signal: controller.signal });
    controller.abort();

    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' });

    // Nobody was left waiting, so the museum was never asked: this is the
    // budget that an abandoned draw would otherwise spend.
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('keeps the request for the callers that are still waiting', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1 }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);
    const leaving = new AbortController();

    const abandoned = client.getJson(url, { signal: leaving.signal });
    const waiting = client.getJson(url);

    leaving.abort();

    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' });
    // One caller leaving must not take the answer away from the other.
    await expect(waiting).resolves.toEqual({ total: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('serves a caller that asks again in the same turn from the same request', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1 }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);
    const first = new AbortController();

    // What a remount does: abandon the wait, then ask for the same URL again
    // before the turn is over. React does exactly this in development.
    const abandoned = client.getJson(url, { signal: first.signal });

    first.abort();

    const remounted = client.getJson(url, { signal: new AbortController().signal });

    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' });
    await expect(remounted).resolves.toEqual({ total: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('starts a new request for a caller that arrives after the last one left', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1 }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);
    const controller = new AbortController();

    const abandoned = client.getJson(url, { signal: controller.signal });
    controller.abort();
    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' });

    // The dropped call is not remembered as a result, so the next visitor is
    // served a real answer rather than the abandonment.
    await expect(client.getJson(url)).resolves.toEqual({ total: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rejects immediately when the signal is already aborted', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ total: 1 }));
    const client = clientWith(fetchImpl as unknown as typeof fetch);

    await expect(
      client.getJson(url, { signal: AbortSignal.abort() }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
