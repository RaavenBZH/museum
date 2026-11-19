import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArtworkCartel } from '@/components/discover/ArtworkCartel';
import { ArtworkStage } from '@/components/discover/ArtworkStage';
import { NextArtworkBar } from '@/components/discover/NextArtworkBar';
import { NoticePanel } from '@/components/layout/NoticePanel';
import { Button, ButtonRouterLink } from '@/components/ui/Button';
import { artworkAspectRatio, artworkImageDescription } from '@/domain/artwork';
import {
  artworkArtistSection,
  artworkEssentialFacts,
  artworkMuseumLink,
  artworkRecordSections,
} from '@/domain/artworkFacts';
import { artworkTitleScale } from '@/domain/artworkTitleScale';
import { DISCOVER_PATH, parseArtworkIdParam } from '@/domain/discoveryRoute';
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
 * as props. It holds no state and makes no call: it tells the run what the
 * visitor asked for — start, open, next — and the run does the calling.
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
 *
 * At `/discover/{objectID}` the screen shows that one artwork — the one a
 * visitor clicked in My Gallery, or whose address they were given — with its
 * whole cartel, as if it had been drawn. An address that names no artwork,
 * an artwork outside the collection or one without a picture each say so and
 * offer the way back, never a blank screen. Asking for the next artwork from
 * there returns to `/discover`, so the address always names what is shown.
 */

/**
 * The band under the artwork, with the moment it owes the visitor.
 *
 * It is a component of its own for one reason: the countdown has to start
 * over on every artwork, and the way React starts state over is by identity.
 * The page gives it the artwork's id as its `key`, so each artwork gets a
 * fresh band with a full moment, and the countdown never has to hold a copy
 * of the artwork it belongs to.
 */
function NextArtworkSection({
  isAwaitingNext,
  onNext,
}: {
  isAwaitingNext: boolean;
  onNext: () => void;
}) {
  const { isLocked, secondsLeft } = useArtworkContemplation();

  return (
    <NextArtworkBar
      isContemplating={isLocked}
      isAwaitingNext={isAwaitingNext}
      secondsLeft={secondsLeft}
      onNext={onNext}
    />
  );
}
export function DiscoverPage() {
  const {
    artwork,
    isDrawing,
    isAwaitingNext,
    nextImageUrl,
    error,
    openFailure,
    start,
    next,
    retry,
    open,
  } = useDiscovery();
  const navigate = useNavigate();
  const { artworkId: artworkIdParam } = useParams();
  const isNamedAddress = artworkIdParam !== undefined;
  const requestedId = parseArtworkIdParam(artworkIdParam);

  // Arriving on the screen is what starts the run, and arriving at an
  // artwork's address is what opens it. Both are no-ops when repeated, so
  // coming back draws nothing and reads nothing again.
  useEffect(() => {
    if (!isNamedAddress) {
      start();
    } else if (requestedId !== null) {
      open(requestedId);
    }
  }, [isNamedAddress, requestedId, start, open]);

  // From an artwork's address, the next artwork is the run's, not this
  // address's: going back to `/discover` keeps the address true to the screen.
  const handleNext = useCallback(() => {
    next();

    if (isNamedAddress) {
      navigate(DISCOVER_PATH);
    }
  }, [next, isNamedAddress, navigate]);

  const wayBack = (
    <div className="discover-page__way-back flex flex-wrap items-center gap-3">
      <ButtonRouterLink variant="primary" to="/gallery">
        Back to My Gallery
      </ButtonRouterLink>
      <ButtonRouterLink variant="secondary" to={DISCOVER_PATH}>
        Discover
      </ButtonRouterLink>
    </div>
  );

  if (isNamedAddress && requestedId === null) {
    return (
      <NoticePanel
        className="discover-page__unknown-address"
        title="This address names no artwork"
        lead="An artwork opens at /discover/ followed by its number in the museum's collection, and this one is not a number."
        action={wayBack}
      />
    );
  }

  // Only this address's own failure: one left by another artwork would
  // otherwise show for a frame before this one is asked for.
  if (isNamedAddress && requestedId !== null && openFailure?.artworkId === requestedId) {
    return (
      <NoticePanel
        className="discover-page__open-error"
        title="This artwork cannot be opened"
        lead={openFailure.message}
        role="alert"
        action={
          <div className="discover-page__open-error-actions flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => open(requestedId)}>
              Try again
            </Button>
            <ButtonRouterLink variant="secondary" to="/gallery">
              Back to My Gallery
            </ButtonRouterLink>
          </div>
        }
      />
    );
  }

  // The artwork asked for by its address comes first: a draw failing behind it
  // — the one meant for "Discover another" — must not take its place. That
  // failure is shown when the visitor actually asks for the next artwork.
  const isShowingRequested = isNamedAddress && artwork !== null && artwork.id === requestedId;

  if (error !== null && !isShowingRequested) {
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

  if (isNamedAddress && artwork?.id !== requestedId) {
    return (
      <NoticePanel
        className="discover-page__opening"
        title="Opening the artwork…"
        lead="Reading its record in the collection of the Metropolitan Museum of Art."
        role="status"
        isBusy
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
        <NextArtworkSection key={artwork.id} isAwaitingNext={isAwaitingNext} onNext={handleNext} />
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
