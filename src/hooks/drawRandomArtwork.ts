import { fetchObject, fetchObjectIds } from '@/api/metMuseumObjects';
import { toArtwork, type Artwork } from '@/domain/artwork';
import { drawArtworkId } from '@/domain/artworkDraw';
import { DISCOVERY_COLLECTION } from '@/domain/discoveryCollection';

/**
 * One random artwork of the discovery collection, in two calls that are both
 * cached: the department's identifier list, then the drawn object.
 *
 * The list is read first and read once — the response cache serves every
 * later draw from memory — so the second draw onwards costs a single call.
 * Drawing from that list is also what guarantees the identifier exists before
 * `GET /objects/{objectID}` is addressed at all.
 *
 * **An artwork without a picture is drawn again.** The identifier list cannot
 * be filtered on images — `hasImages` belongs to the search endpoint, whose
 * answer is paginated 500 at a time and would cost six calls to cover this
 * department — so the filtering happens here, after the object is read. A
 * screen built on one large picture cannot show a work the museum has never
 * photographed: object 437107, Monet's "Landscape: The Parc Monceau", carries
 * an empty `primaryImage` and an empty `primaryImageSmall`.
 *
 * It costs little. Measured on 20 objects drawn at random from this department
 * on 2026-11-15, 3 had no picture — 15 %, well above the 6 % the museum's data
 * shows overall — so the expected cost is about a fifth of a call per draw. A
 * work rejected once is already in the response cache, so drawing it again
 * later costs nothing at all, and the draw happens while the visitor is
 * reading the artwork on screen, so a retry is invisible.
 *
 * The collection it draws from is `DISCOVERY_COLLECTION`, European Paintings.
 */

/**
 * How many objects one draw will read before giving up. At the measured 15 %,
 * five imageless works in a row happens about once in thirteen thousand
 * draws; the cap is there so that a department the museum has not photographed
 * at all cannot turn a draw into an endless loop.
 */
export const MAX_DRAW_ATTEMPTS = 5;

export async function drawRandomArtwork({
  excludedIds,
  signal,
}: {
  /** Artworks already seen or already held in advance; never drawn twice. */
  excludedIds: readonly number[];
  signal?: AbortSignal;
}): Promise<Artwork | null> {
  const { objectIDs } = await fetchObjectIds(DISCOVERY_COLLECTION, { signal });
  const imagelessIds: number[] = [];

  for (let attempt = 0; attempt < MAX_DRAW_ATTEMPTS; attempt += 1) {
    const drawnId = drawArtworkId(objectIDs, [...excludedIds, ...imagelessIds]);

    // A draw lands on a work it has already rejected when the collection has
    // nothing left but works without a picture: `drawArtworkId` starts a fresh
    // round rather than drawing nothing, which is right for what has been seen
    // and wrong for what cannot be shown.
    if (drawnId === null || imagelessIds.includes(drawnId)) {
      return null;
    }

    const artwork = toArtwork(
      await fetchObject(drawnId, { signal, within: DISCOVERY_COLLECTION }),
    );

    if (artwork.imageUrl !== null) {
      return artwork;
    }

    imagelessIds.push(drawnId);
  }

  return null;
}
