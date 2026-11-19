/**
 * The addresses of the Discover screen: the run itself, and one artwork of it.
 *
 * `/discover/{objectID}` is the address an artwork of My Gallery opens at. It
 * names the museum's own identifier, so it is a clean, shareable address for
 * one artwork — the detail view of the collection Discover draws from.
 */
export const DISCOVER_PATH = '/discover';

export function discoverArtworkPath(artworkId: number): string {
  return `${DISCOVER_PATH}/${artworkId}`;
}

/**
 * The identifier an address names, or `null` when it names none: only a
 * positive whole number written in digits is an identifier of the museum.
 * "12abc", "-4", "1e3" and "0" are refused here, before anything is asked of
 * the museum.
 */
export function parseArtworkIdParam(param: string | undefined): number | null {
  if (param === undefined || !/^\d+$/.test(param)) {
    return null;
  }

  const artworkId = Number(param);

  return Number.isSafeInteger(artworkId) && artworkId > 0 ? artworkId : null;
}
