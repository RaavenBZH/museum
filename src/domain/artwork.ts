import type { MetObjectResource } from '@/api/metMuseumObjects';

/**
 * The application's model of an artwork, mapped once from the museum's
 * payload. Every field that the collection API leaves empty on some
 * departments is `null` here rather than `''`, so that a view can ask "is it
 * there?" instead of "is it the empty string?".
 *
 * This is the only place allowed to interpret the raw fields, and it carries
 * the two traps measured on the API:
 *
 * - `culture` and `period` are empty on whole departments, so they are
 *   optional like everything else, never load-bearing;
 * - the payload's own `isOnView` flag is wrong — objects the search returns as
 *   on view carry `isOnView: false`. The gallery number is the one honest
 *   signal, so it is what the model keeps.
 */
/**
 * What stands in for an artist the museum has not recorded. It is wording
 * about a missing field of the model, so it is held with the model: the
 * cartel and the landing page would otherwise word the same absence twice.
 */
export const UNKNOWN_ARTIST_LABEL = 'Artist unrecorded';

export type ArtworkSize = {
  heightCm: number;
  widthCm: number;
  depthCm: number | null;
};

export type Artwork = {
  id: number;
  /** Never empty: the object's name, then a stated fallback, stand in for it. */
  title: string;
  artistName: string | null;
  artistBio: string | null;
  artistNationality: string | null;
  /** "1853 – 1890", only when both ends are known. */
  artistLifeSpan: string | null;
  /** Free text from the API: "1889", "ca. 1830–32". To display, never to sort. */
  displayDate: string | null;
  objectName: string | null;
  classification: string | null;
  culture: string | null;
  period: string | null;
  medium: string | null;
  /** The museum's own dimension sentence, inches and centimetres mixed. */
  dimensionsText: string | null;
  /** Parsed centimetres, when the payload carries a measured overall size. */
  size: ArtworkSize | null;
  department: string | null;
  /** Filled means the work hangs in that gallery; see the note above. */
  galleryNumber: string | null;
  accessionNumber: string | null;
  accessionYear: string | null;
  creditLine: string | null;
  repository: string | null;
  isPublicDomain: boolean;
  /** Shown instead of a public-domain mention when the work is not CC0. */
  rights: string | null;
  museumPageUrl: string | null;
  /**
   * The picture to show, or `null` when the museum has none.
   *
   * This is `primaryImageSmall`, the museum's "web-large" file, and not
   * `primaryImage`: measured on object 437937, the first is 142 kB and the
   * second 2.93 MB — twenty-one times heavier for a file no screen of this
   * application ever needs, since the largest frame is 620 px tall. The
   * original stays unused until something here wants to zoom.
   */
  imageUrl: string | null;
};

/** The title shown when the museum gives neither a title nor an object name. */
export const UNTITLED_ARTWORK_TITLE = 'Untitled';

function text(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
}

function flag(value: unknown): boolean {
  return value === true;
}

function centimetres(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function lifeSpan(begin: unknown, end: unknown): string | null {
  const from = text(begin);
  const to = text(end);

  return from !== null && to !== null ? `${from} – ${to}` : null;
}

/**
 * The overall measurements, when the payload carries them. The API nests them
 * under the first `measurements` entry, and a height without a width is of no
 * use to a frame, so both are required.
 */
function size(value: unknown): ArtworkSize | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const overall: unknown = value[0];

  if (typeof overall !== 'object' || overall === null) {
    return null;
  }

  const measured: unknown = (overall as { elementMeasurements?: unknown }).elementMeasurements;

  if (typeof measured !== 'object' || measured === null) {
    return null;
  }

  const { Height, Width, Depth } = measured as Record<string, unknown>;
  const heightCm = centimetres(Height);
  const widthCm = centimetres(Width);

  if (heightCm === null || widthCm === null) {
    return null;
  }

  return { heightCm, widthCm, depthCm: centimetres(Depth) };
}

/** Turns one museum payload into the model the views are written against. */
export function toArtwork(resource: MetObjectResource): Artwork {
  return {
    id: resource.objectID,
    title: text(resource.title) ?? text(resource.objectName) ?? UNTITLED_ARTWORK_TITLE,
    artistName: text(resource.artistDisplayName),
    artistBio: text(resource.artistDisplayBio),
    artistNationality: text(resource.artistNationality),
    artistLifeSpan: lifeSpan(resource.artistBeginDate, resource.artistEndDate),
    displayDate: text(resource.objectDate),
    objectName: text(resource.objectName),
    classification: text(resource.classification),
    culture: text(resource.culture),
    period: text(resource.period),
    medium: text(resource.medium),
    dimensionsText: text(resource.dimensions),
    size: size(resource.measurements),
    department: text(resource.department),
    galleryNumber: text(resource.GalleryNumber),
    accessionNumber: text(resource.accessionNumber),
    accessionYear: text(resource.accessionYear),
    creditLine: text(resource.creditLine),
    repository: text(resource.repository),
    isPublicDomain: flag(resource.isPublicDomain),
    rights: text(resource.rightsAndReproduction),
    museumPageUrl: text(resource.objectURL),
    imageUrl: text(resource.primaryImageSmall) ?? text(resource.primaryImage),
  };
}

/** `Artist, Title, 1889` — the alternative text of the picture. */
export function artworkImageDescription(artwork: Artwork): string {
  return [artwork.artistName, artwork.title, artwork.displayDate]
    .filter((part): part is string => part !== null)
    .join(', ');
}

/**
 * The proportions of the artwork, width over height, for a frame that shows
 * it at its real shape. `null` when the museum gives no measurements, which
 * happens often enough that a frame must have a shape of its own to fall back
 * on.
 */
export function artworkAspectRatio(artwork: Artwork): number | null {
  return artwork.size === null ? null : artwork.size.widthCm / artwork.size.heightCm;
}
