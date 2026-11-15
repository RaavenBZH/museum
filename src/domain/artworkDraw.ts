/**
 * The random draw. Discovery works on a department's identifier list, which
 * the API serves whole in one call, so drawing an artwork costs nothing beyond
 * reading that list — it is a pick in an array, not a query.
 *
 * A draw never repeats an artwork the visitor has already seen, until the
 * whole list has been seen; then a fresh round starts, because refusing to
 * draw anything at all would be worse than showing a known work again.
 */
export type RandomNumberGenerator = () => number;

export function drawArtworkId(
  objectIDs: readonly number[],
  excludedIds: readonly number[] = [],
  random: RandomNumberGenerator = Math.random,
): number | null {
  if (objectIDs.length === 0) {
    return null;
  }

  const excluded = new Set(excludedIds);
  const candidates = objectIDs.filter((id) => !excluded.has(id));
  const pool = candidates.length > 0 ? candidates : objectIDs;

  return pool[Math.min(Math.floor(random() * pool.length), pool.length - 1)];
}
