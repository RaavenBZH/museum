import { describe, expect, it } from 'vitest';
import {
  MetMuseumNetworkError,
  MetMuseumNotFoundError,
  MetMuseumPayloadError,
  MetMuseumRateLimitError,
  MetMuseumTimeoutError,
} from '@/api/metMuseumErrors';
import { describeCollectionError } from './collectionError';

const url = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/1';

describe('describeCollectionError', () => {
  it('tells the visitor a museum that does not answer will recover', () => {
    const message = describeCollectionError(new MetMuseumTimeoutError(url, 20_000));

    expect(message).toContain('not answering');
    expect(message).toContain('try again');
    // Not the network message: the connection is fine, the museum is slow.
    expect(message).not.toBe(describeCollectionError(new MetMuseumNetworkError(url, null)));
  });

  it('tells the visitor the block clears by itself', () => {
    expect(describeCollectionError(new MetMuseumRateLimitError(url))).toContain(
      'clears by itself',
    );
  });

  it('gives each failure its own message', () => {
    const messages = [
      describeCollectionError(new MetMuseumRateLimitError(url)),
      describeCollectionError(new MetMuseumNotFoundError(url)),
      describeCollectionError(new MetMuseumNetworkError(url, new TypeError('offline'))),
      describeCollectionError(new MetMuseumPayloadError(url, 'not JSON')),
    ];

    expect(new Set(messages).size).toBe(messages.length);
  });

  it('still has something to say about an error it does not know', () => {
    expect(describeCollectionError(new Error('boom'))).not.toBe('');
    expect(describeCollectionError('boom')).not.toBe('');
  });
});
