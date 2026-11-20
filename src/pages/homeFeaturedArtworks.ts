import type { ArtworkCardProps } from '@/components/artwork/ArtworkCard';
import { discoverArtworkPath } from '@/domain/discoveryRoute';

/**
 * The seven artworks of the home page.
 *
 * They are a **fixed editorial selection**: the home page is the door of the
 * product and must always open on the same, deliberately composed grid,
 * whatever the API answers — and opening it costs no call to the museum.
 * Discovery mode is where the collection is drawn at random.
 *
 * Each one is a real object of the API, picked in the collection Discover
 * draws from, European Paintings, so every tile opens its own record on
 * Discover at `/discover/<id>`. Every field is the API's own value for that
 * object — `title`, `artistDisplayName`, `objectDate`, `primaryImageSmall` —
 * read on 2026-11-20, so nothing here is invented. All seven are in the
 * public domain, which is why the API serves their pictures: the museum
 * withholds the picture of a work still under copyright.
 *
 * The format of each tile follows the shape of the painting it holds, and the
 * order is the order of the grid; it spans three centuries, from Bruegel's
 * 1565 to Van Gogh's 1889.
 */
const artwork = (
  objectId: number,
  artwork: Omit<ArtworkCardProps, 'href'>,
): ArtworkCardProps => ({ ...artwork, href: discoverArtworkPath(objectId) });

export const HOME_FEATURED_ARTWORKS: readonly ArtworkCardProps[] = [
  artwork(436105, {
    format: 'wide',
    title: 'The Death of Socrates',
    artist: 'Jacques Louis David',
    year: '1787',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-13139-001.jpg',
  }),
  artwork(435809, {
    format: 'small',
    title: 'The Harvesters',
    artist: 'Pieter Bruegel the Elder',
    year: '1565',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP119115.jpg',
  }),
  artwork(437873, {
    format: 'portrait',
    title: 'Philip IV (1605–1665), King of Spain',
    artist: 'Velázquez (Diego Rodríguez de Silva y Velázquez)',
    year: 'probably 1624',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP239023.jpg',
  }),
  artwork(436965, {
    format: 'panoramic',
    title: 'The Monet Family in Their Garden at Argenteuil',
    artist: 'Edouard Manet',
    year: '1874',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-25465-001.jpg',
  }),
  artwork(436532, {
    format: 'portrait',
    title: 'Self-Portrait with a Straw Hat (obverse: The Potato Peeler)',
    artist: 'Vincent van Gogh',
    year: '1887',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1502_cropped2.jpg',
  }),
  artwork(436535, {
    format: 'small',
    title: 'Wheat Field with Cypresses',
    artist: 'Vincent van Gogh',
    year: '1889',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-42549-001.jpg',
  }),
  artwork(435826, {
    format: 'small',
    title: 'The Love Song',
    artist: 'Sir Edward Burne-Jones',
    year: '1868–77',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP323394.jpg',
  }),
];
