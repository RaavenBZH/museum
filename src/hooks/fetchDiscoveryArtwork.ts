import { fetchObject } from '@/api/metMuseumObjects';
import { toArtwork, type Artwork } from '@/domain/artwork';
import { DISCOVERY_COLLECTION } from '@/domain/discoveryCollection';

/**
 * One named artwork of the discovery collection, read to be hung on the
 * Discover screen: what opening an artwork of My Gallery, or its address,
 * costs.
 *
 * The identifier is checked against the collection's cached identifier list
 * before the museum is asked for the object, so an address naming an object of
 * another department, or none at all, is refused without spending a call.
 *
 * `null` when the museum serves no picture for it: Discover is built around
 * the picture, and an artwork it cannot hang is one it cannot open either.
 */
export async function fetchDiscoveryArtwork(
  artworkId: number,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Artwork | null> {
  const artwork = toArtwork(await fetchObject(artworkId, { signal, within: DISCOVERY_COLLECTION }));

  return artwork.imageUrl === null ? null : artwork;
}
