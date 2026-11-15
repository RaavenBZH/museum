import type { MetObjectResource } from '@/api/metMuseumObjects';
import type { Artwork } from '@/domain/artwork';

/**
 * The fixtures of the artwork tests: one museum payload and one model, both
 * built from real fields of object 437984 ("Wheat Field with Cypresses"), with
 * only the parts a test cares about overridden.
 *
 * They live under `src/test/` because they belong to the tests alone: no
 * screen and no layer imports them.
 */
export function buildObjectResource(
  overrides: Record<string, unknown> = {},
): MetObjectResource {
  return {
    objectID: 437984,
    isPublicDomain: true,
    primaryImage: 'https://images.metmuseum.org/full/437984.jpg',
    primaryImageSmall: 'https://images.metmuseum.org/web/437984.jpg',
    department: 'European Paintings',
    objectName: 'Painting',
    title: 'Wheat Field with Cypresses',
    culture: '',
    period: '',
    artistDisplayName: 'Vincent van Gogh',
    artistDisplayBio: 'Dutch, Zundert 1853–1890 Auvers-sur-Oise',
    artistNationality: 'Dutch',
    artistBeginDate: '1853',
    artistEndDate: '1890',
    objectDate: '1889',
    objectBeginDate: 1889,
    objectEndDate: 1889,
    medium: 'Oil on canvas',
    dimensions: '28 7/8 × 36 3/4 in. (73.2 × 93.4 cm)',
    measurements: [
      {
        elementName: 'Overall',
        elementMeasurements: { Height: 73.2, Width: 93.4 },
      },
    ],
    creditLine: 'Purchase, The Annenberg Foundation Gift, 1993',
    classification: 'Paintings',
    rightsAndReproduction: '',
    repository: 'Metropolitan Museum of Art, New York, NY',
    objectURL: 'https://www.metmuseum.org/art/collection/search/437984',
    accessionNumber: '1993.132',
    accessionYear: '1993',
    GalleryNumber: '822',
    isOnView: false,
    ...overrides,
  };
}

export function buildArtwork(overrides: Partial<Artwork> = {}): Artwork {
  return {
    id: 437984,
    title: 'Wheat Field with Cypresses',
    artistName: 'Vincent van Gogh',
    artistBio: 'Dutch, Zundert 1853–1890 Auvers-sur-Oise',
    artistNationality: 'Dutch',
    artistLifeSpan: '1853 – 1890',
    displayDate: '1889',
    objectName: 'Painting',
    classification: 'Paintings',
    culture: null,
    period: null,
    medium: 'Oil on canvas',
    dimensionsText: '28 7/8 × 36 3/4 in. (73.2 × 93.4 cm)',
    size: { heightCm: 73.2, widthCm: 93.4, depthCm: null },
    department: 'European Paintings',
    galleryNumber: '822',
    accessionNumber: '1993.132',
    accessionYear: '1993',
    creditLine: 'Purchase, The Annenberg Foundation Gift, 1993',
    repository: 'Metropolitan Museum of Art, New York, NY',
    isPublicDomain: true,
    rights: null,
    museumPageUrl: 'https://www.metmuseum.org/art/collection/search/437984',
    imageUrl: 'https://images.metmuseum.org/web/437984.jpg',
    ...overrides,
  };
}
