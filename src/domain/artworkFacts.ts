import type { Artwork } from './artwork';

/**
 * The fields of an artwork, arranged the way the cartel reads them: the
 * essentials first, then the artist, then the rest of the museum record,
 * which stays folded until it is asked for.
 *
 * Every row is dropped when its field is empty, which is the normal case on
 * this API — `culture` and `period` are empty on whole departments, galleries
 * are filled on some and never on others. A block with no row left disappears
 * with them, so the cartel never shows an empty heading.
 *
 * No field appears twice: the collection, the medium, the size and the
 * repository are in the essentials, so the folded record does not repeat them.
 *
 * These are pure functions over the model: they are what makes the cartel
 * testable without a browser and without the network.
 */
export type ArtworkFact = {
  label: string;
  value: string;
};

export type ArtworkFactLink = {
  label: string;
  href: string;
};

export type ArtworkFactSection = {
  title: string;
  facts: ArtworkFact[];
};

/** `73.2` and `92` rather than `73.2000` and `92.0`. */
export function formatCentimetres(value: number): string {
  return `${Number(value.toFixed(1))}`;
}

function formatSize(artwork: Artwork): string | null {
  if (artwork.size === null) {
    return null;
  }

  const { heightCm, widthCm } = artwork.size;

  return `${formatCentimetres(heightCm)} × ${formatCentimetres(widthCm)} cm`;
}

function formatSurfaceArea(artwork: Artwork): string | null {
  if (artwork.size === null) {
    return null;
  }

  return `${((artwork.size.heightCm * artwork.size.widthCm) / 10_000).toFixed(2)} m²`;
}

function facts(rows: readonly (readonly [string, string | null])[]): ArtworkFact[] {
  return rows
    .filter((row): row is readonly [string, string] => row[1] !== null)
    .map(([label, value]) => ({ label, value }));
}

/**
 * The heading of the unfolded block. Every other block of the record names
 * itself from here, so this one does too rather than from the component.
 */
export const ESSENTIAL_FACTS_TITLE = 'The essentials';

/**
 * What a visitor asks first: what it is made of, how big it is, where it is
 * kept and which collection it was drawn from. These are also the fields the
 * API fills most reliably.
 */
export function artworkEssentialFacts(artwork: Artwork): ArtworkFact[] {
  return facts([
    ['Medium', artwork.medium],
    ['Dimensions', formatSize(artwork)],
    ['Surface area', formatSurfaceArea(artwork)],
    ['Held at', artwork.repository],
    ['Collection', artwork.department],
  ]);
}

/**
 * The artist, shown unfolded beside the artwork: who they were, not what they
 * made. `null` when the museum knows nothing about them, which is common on
 * the older departments.
 */
export function artworkArtistSection(artwork: Artwork): ArtworkFactSection | null {
  const artistFacts = facts([
    ['Nationality', artwork.artistNationality],
    ['Born – died', artwork.artistLifeSpan],
    ['Biography', artwork.artistBio],
  ]);

  return artistFacts.length === 0 ? null : { title: 'The artist', facts: artistFacts };
}

/**
 * The way out to the museum's own page for this object, when the payload names
 * it. It belongs to the artwork and not to any one block of the record, which
 * is why it is read on its own: the cartel sets it at the foot of the card,
 * under everything.
 */
export function artworkMuseumLink(artwork: Artwork): ArtworkFactLink | null {
  return artwork.museumPageUrl === null
    ? null
    : { label: 'View on metmuseum.org', href: artwork.museumPageUrl };
}

/**
 * The rest of the record, folded away under one button: the fields a visitor
 * reads when they want to go further.
 */
export function artworkRecordSections(artwork: Artwork): ArtworkFactSection[] {
  const sections: ArtworkFactSection[] = [
    {
      title: 'The artwork',
      facts: facts([
        ['Object type', artwork.objectName],
        ['Classification', artwork.classification],
        ['Culture', artwork.culture],
        ['Period', artwork.period],
        [
          'Depth',
          artwork.size?.depthCm === undefined || artwork.size?.depthCm === null
            ? null
            : `${formatCentimetres(artwork.size.depthCm)} cm`,
        ],
        ['Museum dimensions', artwork.dimensionsText],
      ]),
    },
    {
      title: 'In the museum',
      facts: facts([
        ['Gallery', artwork.galleryNumber],
        ['Accession number', artwork.accessionNumber],
        ['Accession year', artwork.accessionYear],
        ['Credit line', artwork.creditLine],
        // The rights are what a reader needs when the image is not CC0, and
        // the mention of the public domain is what they need when it is.
        ['Image rights', artwork.isPublicDomain ? 'Public domain' : artwork.rights],
      ]),
    },
  ];

  return sections.filter((section) => section.facts.length > 0);
}
