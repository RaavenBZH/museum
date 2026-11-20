import { useId, useState } from 'react';
import { GalleryLayoutSwitch } from '@/components/gallery/GalleryLayoutSwitch';
import { GalleryCollectionGroup } from '@/components/gallery/GalleryCollectionGroup';
import { GalleryInsights } from '@/components/gallery/GalleryInsights';
import { SeenArtworkGrid } from '@/components/gallery/SeenArtworkGrid';
import { SeenArtworkList } from '@/components/gallery/SeenArtworkList';
import { NoticePanel } from '@/components/layout/NoticePanel';
import { CompletionDonutChart } from '@/components/statistics/CompletionDonutChart';
import { Button, ButtonRouterLink } from '@/components/ui/Button';
import {
  artworkCountLabel,
  discoveryProgress,
  formatCount,
  formatShare,
} from '@/domain/discoveryProgress';
import { centuryCounts, mediumCounts } from '@/domain/galleryInsights';
import {
  DISCOVERY_COLLECTION_DESCRIPTION,
  DISCOVERY_COLLECTION_NAME,
} from '@/domain/discoveryCollection';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useCollectionCenturies } from '@/hooks/useCollectionCenturies';
import { useDiscoveryCollectionSize } from '@/hooks/useDiscoveryCollectionSize';
import { useGalleryLayout } from '@/hooks/useGalleryLayout';

/**
 * My Gallery, as the mockup draws it: how much of the collection has been
 * seen, then every artwork seen so far, in a grid or a list.
 *
 * The opening card holds the ring, the sentence that states its share with the
 * way back to Discover under it, and the progress by collection. The whole is
 * the identifier list Discover draws from, European Paintings, so "every
 * artwork" means the same thing here and there.
 *
 * The artworks are the run's own memory — every one Discover has revealed, on
 * this visit and earlier ones — and they open without a call to the museum:
 * the gallery keeps what a card needs. Newest first, since the last artwork
 * seen is the one a visitor is most likely to come looking for. Each picture
 * is fetched only as it comes near the screen.
 *
 * Under the card, "More about my gallery" unfolds two more charts — the
 * centuries explored and the mediums met — so the
 * figures of the gallery answer more than one question.
 *
 * It is a container: it reads the run, the collection size, the layout the
 * visitor last chose and the counts by century,
 * and hands everything to presentation components as props.
 */
export function GalleryPage() {
  const titleId = useId();
  const { seen } = useDiscovery();
  const { collectionSize, error, retry } = useDiscoveryCollectionSize();
  const [layout, setLayout] = useGalleryLayout();
  // Whether "More about my gallery" is unfolded. The counts it shows are asked
  // for as soon as the page opens, so they are ready when it unfolds.
  const [areInsightsOpen, setAreInsightsOpen] = useState(false);
  const centuries = useCollectionCenturies();

  const newestFirst = [...seen].reverse();

  return (
    <div className="gallery-page flex flex-col">
      {error !== null ? (
        <NoticePanel
          className="gallery-page__error"
          title="The collection cannot be counted"
          lead={error}
          role="alert"
          action={
            <Button variant="primary" onClick={retry}>
              Try again
            </Button>
          }
        />
      ) : collectionSize === null ? (
        <NoticePanel
          className="gallery-page__counting"
          title="Counting the collection…"
          lead={`Reading how many artworks ${DISCOVERY_COLLECTION_NAME} holds.`}
          role="status"
          isBusy
        />
      ) : (
        <GalleryProgressCard
          titleId={titleId}
          seenCount={seen.length}
          collectionSize={collectionSize}
        />
      )}

      <GalleryInsights
        className="gallery-page__insights mt-6"
        isOpen={areInsightsOpen}
        onToggle={() => setAreInsightsOpen((isOpen) => !isOpen)}
        centuries={centuries.counts === null ? null : centuryCounts(centuries.counts, seen)}
        centuriesError={centuries.error}
        onRetryCenturies={centuries.retry}
        mediums={mediumCounts(seen)}
      />

      {/* An empty gallery has nothing to lay out, so it offers no switch. */}
      {newestFirst.length === 0 ? null : (
        <div className="gallery-page__toolbar mt-11 mb-10 flex justify-end">
          <GalleryLayoutSwitch layout={layout} onLayoutChange={setLayout} />
        </div>
      )}

      {newestFirst.length === 0 ? (
        <section className="gallery-page__empty mt-11 flex flex-col items-start gap-5 pb-14">
          <h2 className="gallery-page__empty-title text-tile-title">No artwork seen yet.</h2>
          <p className="gallery-page__empty-lead text-lead text-text-muted">
            Draw one in Discover and it will be kept here, with every one after it.
          </p>
          <ButtonRouterLink variant="primary" to="/discover">
            Discover
          </ButtonRouterLink>
        </section>
      ) : (
        <GalleryCollectionGroup
          className="gallery-page__collection"
          name={DISCOVERY_COLLECTION_NAME}
          description={DISCOVERY_COLLECTION_DESCRIPTION}
          countLabel={artworkCountLabel(newestFirst.length)}
        >
          {layout === 'grid' ? (
            <SeenArtworkGrid artworks={newestFirst} />
          ) : (
            <SeenArtworkList artworks={newestFirst} />
          )}
        </GalleryCollectionGroup>
      )}
    </div>
  );
}

/**
 * The opening card of the mockup, once the size of the collection is known:
 * the ring, then the sentence and the way back beside it.
 *
 * It holds two blocks, so it is only as wide as they are: the card hugs its
 * content instead of stretching across the page, and the summary is held to
 * the 480 px measure of the home page's lead, so the sentence never runs into
 * a line too long to read. Below 761 px the two blocks stack.
 */
function GalleryProgressCard({
  titleId,
  seenCount,
  collectionSize,
}: {
  titleId: string;
  seenCount: number;
  collectionSize: number;
}) {
  const progress = discoveryProgress(seenCount, collectionSize);
  const share = formatShare(progress.share);
  const seen = formatCount(progress.seenCount);
  const size = formatCount(progress.collectionSize);
  const left = formatCount(progress.leftCount);
  const noun = progress.seenCount === 1 ? 'artwork' : 'artworks';

  return (
    <section
      className="gallery-page__intro flex flex-wrap items-center gap-x-10 gap-y-6 rounded-card bg-surface p-6 desktop:px-10 desktop:py-6"
      aria-labelledby={titleId}
    >
      <CompletionDonutChart
        className="gallery-page__ring"
        share={progress.share}
        shareLabel={share}
        remainderLabel={`${left} left`}
        description={`${seen} of the ${size} artworks of ${DISCOVERY_COLLECTION_NAME} seen, or ${share}; ${left} left`}
        tooltip={`${seen} of ${size} seen`}
      />

      <div className="gallery-page__summary flex min-w-0 flex-[1_1_240px] flex-col gap-2">
        <h1 id={titleId} className="gallery-page__title text-headline">
          {`You have seen ${seen} ${noun}.`}
        </h1>
        <p className="gallery-page__lead text-lead text-text-muted">
          {`Out of the ${size} in ${DISCOVERY_COLLECTION_NAME}.`}
        </p>
      </div>

      {/* Before anything is seen, the way to Discover is the empty gallery's
          own action below: one primary for one destination. */}
      {seenCount === 0 ? null : (
        <ButtonRouterLink className="gallery-page__action shrink-0" variant="primary" to="/discover">
          Continue discovering
        </ButtonRouterLink>
      )}
    </section>
  );
}
