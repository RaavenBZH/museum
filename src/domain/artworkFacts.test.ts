import { describe, expect, it } from 'vitest';
import { buildArtwork } from '@/test/artworkFixture';
import {
  artworkArtistSection,
  artworkEssentialFacts,
  artworkMuseumLink,
  artworkRecordSections,
  formatCentimetres,
} from './artworkFacts';

describe('formatCentimetres', () => {
  it('keeps one decimal at most, and none when there is nothing to show', () => {
    expect(formatCentimetres(73.2)).toBe('73.2');
    expect(formatCentimetres(92)).toBe('92');
    expect(formatCentimetres(73.247)).toBe('73.2');
  });
});

describe('artworkEssentialFacts', () => {
  it('states what a visitor asks first, in the order the cartel reads it', () => {
    expect(artworkEssentialFacts(buildArtwork())).toEqual([
      { label: 'Medium', value: 'Oil on canvas' },
      { label: 'Dimensions', value: '73.2 × 93.4 cm' },
      { label: 'Surface area', value: '0.68 m²' },
      { label: 'Held at', value: 'Metropolitan Museum of Art, New York, NY' },
      { label: 'Collection', value: 'European Paintings' },
    ]);
  });

  it('drops a fact the museum does not give instead of showing an empty row', () => {
    const facts = artworkEssentialFacts(
      buildArtwork({ medium: null, size: null, department: null }),
    );

    expect(facts.map((fact) => fact.label)).toEqual(['Held at']);
  });

  it('has nothing to show for an artwork with none of those fields', () => {
    expect(
      artworkEssentialFacts(
        buildArtwork({ medium: null, size: null, repository: null, department: null }),
      ),
    ).toEqual([]);
  });
});

describe('artworkArtistSection', () => {
  it('is the artist block, shown unfolded beside the artwork', () => {
    expect(artworkArtistSection(buildArtwork())).toEqual({
      title: 'The artist',
      facts: [
        { label: 'Nationality', value: 'Dutch' },
        { label: 'Born – died', value: '1853 – 1890' },
        { label: 'Biography', value: 'Dutch, Zundert 1853–1890 Auvers-sur-Oise' },
      ],
    });
  });

  it('is nothing at all when the museum knows nothing about the artist', () => {
    expect(
      artworkArtistSection(
        buildArtwork({ artistNationality: null, artistLifeSpan: null, artistBio: null }),
      ),
    ).toBeNull();
  });
});

describe('artworkMuseumLink', () => {
  it('is the page of the museum for that object', () => {
    expect(artworkMuseumLink(buildArtwork())).toEqual({
      label: 'View on metmuseum.org',
      href: 'https://www.metmuseum.org/art/collection/search/437984',
    });
  });

  it('is nothing when the payload names no page', () => {
    expect(artworkMuseumLink(buildArtwork({ museumPageUrl: null }))).toBeNull();
  });
});

describe('artworkRecordSections', () => {
  it('folds the rest of the record into two blocks', () => {
    expect(artworkRecordSections(buildArtwork()).map((section) => section.title)).toEqual([
      'The artwork',
      'In the museum',
    ]);
  });

  it('never repeats what the essentials or the artist block already show', () => {
    const labels = artworkRecordSections(buildArtwork()).flatMap((section) =>
      section.facts.map((fact) => fact.label),
    );

    for (const shown of [
      'Medium',
      'Dimensions',
      'Surface area',
      'Held at',
      'Collection',
      'Department',
      'Nationality',
      'Biography',
    ]) {
      expect(labels).not.toContain(shown);
    }
  });

  it('states the depth of an object that has one', () => {
    const [artworkBlock] = artworkRecordSections(
      buildArtwork({ size: { heightCm: 100, widthCm: 200, depthCm: 4 } }),
    );

    expect(artworkBlock.facts).toEqual(
      expect.arrayContaining([{ label: 'Depth', value: '4 cm' }]),
    );
  });

  it('states the rights when the image is not in the public domain', () => {
    const [, museum] = artworkRecordSections(
      buildArtwork({ isPublicDomain: false, rights: '© The artist’s estate' }),
    );

    expect(museum.facts).toEqual(
      expect.arrayContaining([{ label: 'Image rights', value: '© The artist’s estate' }]),
    );
  });

  it('says the image is public domain when it is', () => {
    const [, museum] = artworkRecordSections(buildArtwork());

    expect(museum.facts).toEqual(
      expect.arrayContaining([{ label: 'Image rights', value: 'Public domain' }]),
    );
  });

  it('holds fields only: the way out to the museum is read on its own', () => {
    for (const section of artworkRecordSections(buildArtwork())) {
      expect(section).not.toHaveProperty('link');
    }
  });

  it('drops a block whose every field is empty', () => {
    const sections = artworkRecordSections(
      buildArtwork({
        objectName: null,
        classification: null,
        culture: null,
        period: null,
        size: null,
        dimensionsText: null,
      }),
    );

    expect(sections.map((section) => section.title)).toEqual(['In the museum']);
  });
});
