import { describe, expect, it } from 'vitest';
import { buildArtwork, buildObjectResource } from '@/test/artworkFixture';
import {
  artworkAspectRatio,
  artworkImageDescription,
  toArtwork,
  UNTITLED_ARTWORK_TITLE,
} from './artwork';

describe('toArtwork', () => {
  it('maps a full museum payload onto the model', () => {
    expect(toArtwork(buildObjectResource())).toEqual(buildArtwork());
  });

  it('turns every empty field into null rather than an empty string', () => {
    const artwork = toArtwork(
      buildObjectResource({
        artistDisplayName: '',
        artistNationality: '   ',
        objectDate: '',
        medium: '',
        department: '',
        GalleryNumber: '',
        creditLine: '',
        objectURL: '',
      }),
    );

    expect(artwork.artistName).toBeNull();
    expect(artwork.artistNationality).toBeNull();
    expect(artwork.displayDate).toBeNull();
    expect(artwork.medium).toBeNull();
    expect(artwork.department).toBeNull();
    expect(artwork.galleryNumber).toBeNull();
    expect(artwork.creditLine).toBeNull();
    expect(artwork.museumPageUrl).toBeNull();
  });

  it('never leaves the title empty: the object name, then a stated fallback', () => {
    expect(toArtwork(buildObjectResource({ title: '' })).title).toBe('Painting');
    expect(toArtwork(buildObjectResource({ title: '', objectName: '' })).title).toBe(
      UNTITLED_ARTWORK_TITLE,
    );
  });

  it('shows the web picture rather than the archive original, which is 21× heavier', () => {
    expect(toArtwork(buildObjectResource()).imageUrl).toBe(
      'https://images.metmuseum.org/web/437984.jpg',
    );
  });

  it('falls back to the original, then states that there is no picture at all', () => {
    expect(toArtwork(buildObjectResource({ primaryImageSmall: '' })).imageUrl).toBe(
      'https://images.metmuseum.org/full/437984.jpg',
    );
    expect(
      toArtwork(buildObjectResource({ primaryImage: '', primaryImageSmall: '' })).imageUrl,
    ).toBeNull();
  });

  it('reads the overall measurements, and refuses a half-measured object', () => {
    expect(
      toArtwork(
        buildObjectResource({
          measurements: [
            { elementName: 'Overall', elementMeasurements: { Height: 10, Width: 20, Depth: 3 } },
          ],
        }),
      ).size,
    ).toEqual({ heightCm: 10, widthCm: 20, depthCm: 3 });

    expect(
      toArtwork(
        buildObjectResource({
          measurements: [{ elementName: 'Overall', elementMeasurements: { Height: 10 } }],
        }),
      ).size,
    ).toBeNull();
    expect(toArtwork(buildObjectResource({ measurements: [] })).size).toBeNull();
    expect(toArtwork(buildObjectResource({ measurements: undefined })).size).toBeNull();
  });

  it('keeps the gallery number and ignores the payload flag that lies about it', () => {
    // Measured on the API: works the search returns as on view carry
    // `isOnView: false` while their gallery number is filled.
    const artwork = toArtwork(buildObjectResource({ isOnView: false, GalleryNumber: '822' }));

    expect(artwork.galleryNumber).toBe('822');
    expect(artwork).not.toHaveProperty('isOnView');
  });

  it('only calls a work public domain when the payload says so', () => {
    expect(toArtwork(buildObjectResource({ isPublicDomain: 'true' })).isPublicDomain).toBe(false);
    expect(toArtwork(buildObjectResource({ isPublicDomain: false })).isPublicDomain).toBe(false);
  });
});

describe('artworkAspectRatio', () => {
  it('is the width over the height of the real object', () => {
    expect(artworkAspectRatio(buildArtwork({ size: { heightCm: 50, widthCm: 100, depthCm: null } }))).toBe(2);
  });

  it('has nothing to say about an unmeasured artwork', () => {
    expect(artworkAspectRatio(buildArtwork({ size: null }))).toBeNull();
  });
});

describe('artworkImageDescription', () => {
  it('names the artist, the title and the date', () => {
    expect(artworkImageDescription(buildArtwork())).toBe(
      'Vincent van Gogh, Wheat Field with Cypresses, 1889',
    );
  });

  it('skips what the museum does not give, keeping the title alone if need be', () => {
    expect(
      artworkImageDescription(buildArtwork({ artistName: null, displayDate: null })),
    ).toBe('Wheat Field with Cypresses');
  });
});
