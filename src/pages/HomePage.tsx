import { ArtworkCard } from '@/components/artwork/ArtworkCard';
import { ActionTile } from '@/components/landing/ActionTile';
import { ClosingBanner } from '@/components/landing/ClosingBanner';
import { HeadlineBlock } from '@/components/landing/HeadlineBlock';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { HOME_FEATURED_ARTWORKS } from './homeFeaturedArtworks';
import { CLOSING_BANNER_TEXTURE, GALLERY_TILE_TEXTURE } from './homeTextures';

/**
 * The home page: the headline, a bento grid of artworks to open one by one,
 * then the band that closes the page.
 *
 * It presents the modes rather than being one of them, so its primary button
 * leads to Discover and the closing band repeats that offer at the foot of a
 * long scroll.
 *
 * It holds no state and calls nothing. The artworks it shows are a fixed
 * selection — see `homeFeaturedArtworks` — so this page stays a composition of
 * presentation components, and the collection API is reached from the screens
 * that actually need it.
 */
export function HomePage() {
  return (
    <div className="home-page flex flex-col gap-6">
      <BentoGrid>
        <HeadlineBlock
          firstLine="Discover art."
          secondLine="The way you want."
          lead="Discover the Metropolitan Museum of Art collection one artwork at a time, and build a gallery of everything you have seen."
          badge={<Badge highlight="In progress">My Gallery</Badge>}
          actions={
            <>
              <ButtonLink variant="primary" href="/discover">
                Discover
              </ButtonLink>
              <ButtonLink variant="secondary" href="/gallery">
                My Gallery
              </ButtonLink>
            </>
          }
        />

        {HOME_FEATURED_ARTWORKS.map((artwork) => (
          <ArtworkCard key={artwork.href} {...artwork} />
        ))}

        <ActionTile href="/gallery" label="My Gallery" textureImageUrl={GALLERY_TILE_TEXTURE} />
      </BentoGrid>

      <ClosingBanner
        firstLine="A new way to learn."
        secondLine="One artwork at a time."
        textureImageUrl={CLOSING_BANNER_TEXTURE}
        action={
          <ButtonLink variant="inverse" href="/discover">
            Start discovering
          </ButtonLink>
        }
      />
    </div>
  );
}
