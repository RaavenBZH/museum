import { ArtworkImage } from '@/components/artwork/ArtworkImage';

/**
 * The stage: one artwork on a surface panel, framed at the proportions of the
 * real object rather than cropped to a fixed shape. A tall painting stands
 * tall and a panorama lies wide, which is the one thing a reproduction can
 * still say about the object itself.
 *
 * The frame is sized from the ratio so that it never exceeds the panel, and
 * the 620 px figure is its height budget: at that height a 2:1 panorama is
 * 1240 px wide, which is wider than the column, so the frame shrinks to fit
 * instead.
 *
 * The panel takes the height of the frame it holds and nothing else: a fixed
 * height would be a raw length the system does not have, and a tall portrait
 * would overflow it.
 *
 * An artwork without measurements — the museum leaves them out often enough —
 * keeps the frame on the landscape shape most of the collection takes, rather
 * than inventing a size.
 */
const FRAME_HEIGHT_BUDGET_PX = 620;
const FALLBACK_ASPECT_RATIO = 4 / 3;

export function ArtworkStage({
  imageUrl,
  imageAlt,
  aspectRatio,
}: {
  /** `null` when the museum has no picture of this artwork. */
  imageUrl: string | null;
  imageAlt: string;
  /** Width over height, or `null` when the artwork is not measured. */
  aspectRatio: number | null;
}) {
  const ratio = aspectRatio ?? FALLBACK_ASPECT_RATIO;

  return (
    <section
      className="artwork-stage flex justify-center rounded-card bg-surface p-4 desktop:p-6"
      aria-label="Artwork on show"
    >
      <div
        className="artwork-stage__frame flex w-full overflow-hidden rounded-image"
        style={{
          aspectRatio: ratio,
          maxWidth: `${Math.round(FRAME_HEIGHT_BUDGET_PX * ratio)}px`,
        }}
      >
        <ArtworkImage src={imageUrl} alt={imageAlt} priority />
      </div>
    </section>
  );
}
