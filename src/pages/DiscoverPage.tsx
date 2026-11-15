import { useEffect } from 'react';
import { ArtworkCartel } from '@/components/discover/ArtworkCartel';
import { ArtworkStage } from '@/components/discover/ArtworkStage';
import { NextArtworkBar } from '@/components/discover/NextArtworkBar';
import { NoticePanel } from '@/components/layout/NoticePanel';
import { Button } from '@/components/ui/Button';
import { artworkAspectRatio, artworkImageDescription } from '@/domain/artwork';
import {
  artworkArtistSection,
  artworkEssentialFacts,
  artworkMuseumLink,
  artworkRecordSections,
} from '@/domain/artworkFacts';
import { artworkTitleScale } from '@/domain/artworkTitleScale';
import { useArtworkContemplation } from '@/hooks/useArtworkContemplation';
import { useDiscovery } from '@/hooks/useDiscovery';

/**
 * The Discover screen: one artwork at a time, drawn at random, with its
 * record beside it.
 *
 * Arriving here draws an artwork at once — there is nothing to ask and
 * nothing to click. The visitor came to Discover to see something, so the
 * only wait is the one call it takes, and the screen says so while it lasts.
 * Arriving *back* here draws nothing: the run is held above the router, so
 * walking to the home page and returning finds the same artwork, with no new
 * call to the museum.
 *
 * The artwork and the way to the next one share the left column, which stays
 * on screen while the cartel on the right is read: the picture is what the
 * visitor came for, so it does not scroll away under the record. Below
 * 761 px the two columns become one, the picture first.
 *
 * It is a container and nothing else — it reads the run, turns the model into
 * the rows the cartel needs, and hands everything to presentation components
 * as props. It holds no state and makes no call: arriving here neither starts
 * a run nor draws anything by itself.
 *
 * Three states, and they are all reachable: the first draw says it is under
 * way, a refusal from the museum says which refusal it was and offers to try
 * again, and a drawn artwork takes the whole screen. Once an artwork is on
 * screen it stays there, even while the next one is being drawn: a waiting
 * panel in its place would be a blink for nothing.
 *
 * While this artwork is being read, the browser fetches the picture of the
 * one held behind it: the record is already in memory, so the picture is all
 * that stands between a click and the next artwork.
 *
 * The way to the next artwork opens a few seconds after one appears — see
 * `useArtworkContemplation`. The delay is held here rather than in the run,
 * because it is about this screen's reading and not about the draw: leaving
 * Discover and coming back gives the artwork a fresh moment, which is right.
 */
export function DiscoverPage() {
  const { artwork, isDrawing, isAwaitingNext, nextImageUrl, error, start, next, retry } =
    useDiscovery();
  const { isLocked, secondsLeft } = useArtworkContemplation(artwork?.id ?? null);

  // Arriving on the screen is what starts the run. Starting again is a no-op,
  // so coming back to Discover draws nothing.
  useEffect(() => {
    start();
  }, [start]);

  if (error !== null) {
    return (
      <NoticePanel
        className="discover-page__error"
        title="The collection is not answering"
        lead={error}
        role="alert"
        action={
          <Button variant="primary" onClick={retry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (artwork === null) {
    return (
      <NoticePanel
        className="discover-page__drawing"
        title="Drawing an artwork…"
        lead="Reading the collection of the Metropolitan Museum of Art."
        role="status"
        isBusy={isDrawing}
      />
    );
  }

  return (
    <div className="discover-page grid items-start gap-6 desktop:grid-cols-12">
      {/* React hoists this into the document head. */}
      {nextImageUrl === null ? null : <link rel="preload" as="image" href={nextImageUrl} />}

      <div className="discover-page__artwork flex flex-col gap-6 desktop:col-span-7 desktop:sticky desktop:top-6">
        <ArtworkStage
          imageUrl={artwork.imageUrl}
          imageAlt={artworkImageDescription(artwork)}
          aspectRatio={artworkAspectRatio(artwork)}
        />
        <NextArtworkBar
          isLocked={isLocked || isAwaitingNext}
          isAwaitingNext={isAwaitingNext}
          secondsLeft={secondsLeft}
          onNext={next}
        />
      </div>

      <ArtworkCartel
        className="discover-page__cartel desktop:col-span-5"
        title={artwork.title}
        titleScale={artworkTitleScale(artwork.title)}
        artistName={artwork.artistName}
        displayDate={artwork.displayDate}
        essentials={artworkEssentialFacts(artwork)}
        artistSection={artworkArtistSection(artwork)}
        recordSections={artworkRecordSections(artwork)}
        museumLink={artworkMuseumLink(artwork)}
      />
    </div>
  );
}
