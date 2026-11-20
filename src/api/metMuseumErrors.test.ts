import { describe, expect, it } from 'vitest';
import {
  httpErrorForStatus,
  MetMuseumHttpError,
  MetMuseumNotFoundError,
  MetMuseumRateLimitError,
  MetMuseumTimeoutError,
} from './metMuseumErrors';

const url = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/1';

describe('httpErrorForStatus', () => {
  it('tells the IP block apart from a missing object', () => {
    const blocked = httpErrorForStatus(403, url);
    const missing = httpErrorForStatus(404, url);

    expect(blocked).toBeInstanceOf(MetMuseumRateLimitError);
    expect(missing).toBeInstanceOf(MetMuseumNotFoundError);
    expect(blocked).not.toBeInstanceOf(MetMuseumNotFoundError);
  });

  it('keeps the status and the address of any other failure', () => {
    const failure = httpErrorForStatus(500, url);

    expect(failure).toBeInstanceOf(MetMuseumHttpError);
    expect(failure.status).toBe(500);
    expect(failure.url).toBe(url);
    expect(failure.message).toContain('500');
  });
});

describe('MetMuseumTimeoutError', () => {
  it('names the address and the wait it gave up after', () => {
    const error = new MetMuseumTimeoutError('https://example.test/objects/1', 20_000);

    expect(error.name).toBe('MetMuseumTimeoutError');
    expect(error.url).toBe('https://example.test/objects/1');
    expect(error.message).toContain('20 s');
  });
});
