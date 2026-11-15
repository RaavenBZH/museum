/**
 * The error types of the transport layer. They exist so that a view can tell
 * "the museum is blocking us, come back in a few minutes" (403) from "this
 * object does not exist" (404) from "the network is down", which the project
 * brief asks for as three distinct states.
 */

/** A response arrived, but its status was not a success. */
export class MetMuseumHttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string, message: string) {
    super(message);
    this.name = 'MetMuseumHttpError';
    this.status = status;
    this.url = url;
  }
}

/**
 * The museum answered 403. Measured behaviour: roughly 140 calls in a few
 * minutes blocks the caller's IP address on every endpoint, and the block
 * clears by itself after about five minutes.
 */
export class MetMuseumRateLimitError extends MetMuseumHttpError {
  constructor(url: string) {
    super(403, url, 'The Met collection API is refusing calls from this address (HTTP 403).');
    this.name = 'MetMuseumRateLimitError';
  }
}

/** The museum answered 404: no object carries that identifier. */
export class MetMuseumNotFoundError extends MetMuseumHttpError {
  constructor(url: string) {
    super(404, url, 'The Met collection API has no resource at this address (HTTP 404).');
    this.name = 'MetMuseumNotFoundError';
  }
}

/** The request never produced a response: offline, DNS failure, CORS refusal. */
export class MetMuseumNetworkError extends Error {
  readonly url: string;

  constructor(url: string, cause: unknown) {
    super('The Met collection API could not be reached.', { cause });
    this.name = 'MetMuseumNetworkError';
    this.url = url;
  }
}

/** A successful response whose body is not the JSON shape the endpoint promises. */
export class MetMuseumPayloadError extends Error {
  readonly url: string;

  constructor(url: string, detail: string, cause?: unknown) {
    super(`The Met collection API returned an unexpected payload: ${detail}`, { cause });
    this.name = 'MetMuseumPayloadError';
    this.url = url;
  }
}

/** Maps a failing status to the error type the views branch on. */
export function httpErrorForStatus(status: number, url: string): MetMuseumHttpError {
  if (status === 403) {
    return new MetMuseumRateLimitError(url);
  }

  if (status === 404) {
    return new MetMuseumNotFoundError(url);
  }

  return new MetMuseumHttpError(status, url, `The Met collection API answered HTTP ${status}.`);
}
