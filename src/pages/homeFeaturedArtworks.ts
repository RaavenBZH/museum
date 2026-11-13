import type { ArtworkCardProps } from '@/components/artwork/ArtworkCard';

/**
 * The seven artworks of the home page.
 *
 * They are a **fixed editorial selection**, not a result from the collection
 * API: the home page is the door of the product and must always open on the
 * same, deliberately composed grid, whatever the API answers. Discovery mode
 * is where the collection is drawn at random.
 *
 * Every field is the API's own value for that object id — `title`,
 * `artistDisplayName`, `objectDate`, `primaryImageSmall` — so nothing here is
 * invented, and each tile links to the detail view of its real object. The
 * seven are all public domain, which is why their pictures can be shown.
 *
 * Two gaps of the API are visible in the list and handled rather than hidden:
 * the Babylonian lion panel has no artist, and the rule for the year is the
 * one the domain layer will follow — `objectDate` when it reads as a date,
 * `objectBeginDate` when it is missing or is a sentence.
 *
 * The order is the order of the grid, and it spans twenty-six centuries, so
 * the date reads from `ca. 604–562 BCE` to 1889.
 */
const artwork = (
  objectId: number,
  artwork: Omit<ArtworkCardProps, 'href'>,
): ArtworkCardProps => ({ ...artwork, href: `/artworks/${objectId}` });

export const HOME_FEATURED_ARTWORKS: readonly ArtworkCardProps[] = [
  artwork(436105, {
    format: 'wide',
    title: 'The Death of Socrates',
    artist: 'Jacques Louis David',
    year: '1787',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-13139-001.jpg',
  }),
  artwork(11145, {
    format: 'small',
    title: 'The Veteran in a New Field',
    artist: 'Winslow Homer',
    year: '1865',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ad/web-large/DP102298.jpg',
  }),
  artwork(199708, {
    format: 'portrait',
    title: 'Seasons and Elements (Air)',
    artist: 'Charles Le Brun',
    year: 'ca. 1683',
    imageUrl: 'https://images.metmuseum.org/CRDImages/es/web-large/DT814.jpg',
  }),
  artwork(322585, {
    format: 'panoramic',
    title: 'Panel with striding lion',
    artist: 'Unknown',
    year: 'ca. 604–562 BCE',
    imageUrl: 'https://images.metmuseum.org/CRDImages/an/web-large/DT891.jpg',
  }),
  artwork(436532, {
    format: 'portrait',
    title: 'Self-Portrait with a Straw Hat',
    artist: 'Vincent van Gogh',
    year: '1887',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1502_cropped2.jpg',
  }),
  artwork(39799, {
    format: 'small',
    title: 'Under the Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: 'ca. 1830–32',
    imageUrl: 'https://images.metmuseum.org/CRDImages/as/web-large/DP141042.jpg',
  }),
  artwork(435826, {
    format: 'small',
    title: 'The Love Song',
    artist: 'Sir Edward Burne-Jones',
    year: '1868–77',
    imageUrl: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP323394.jpg',
  }),
];
