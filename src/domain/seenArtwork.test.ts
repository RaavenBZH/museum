import { describe, expect, it } from 'vitest';
import { buildArtwork } from '@/test/artworkFixture';
import { parseSeenArtworks, toSeenArtwork } from './seenArtwork';

const kept = {
  id: 437984,
  title: 'Wheat Field with Cypresses',
  artistName: 'Vincent van Gogh',
  displayDate: '1889',
  imageUrl: 'https://images.metmuseum.org/web-large/DT1567.jpg',
  repository: 'Metropolitan Museum of Art, New York, NY',
  size: { heightCm: 73, widthCm: 93.4, depthCm: null },
};

describe('toSeenArtwork', () => {
  it('keeps what a card and a row show, and nothing else', () => {
    const seen = toSeenArtwork(buildArtwork());

    expect(Object.keys(seen).sort()).toEqual(
      ['artistName', 'displayDate', 'id', 'imageUrl', 'repository', 'size', 'title'].sort(),
    );
  });
});

describe('parseSeenArtworks', () => {
  it('reads back what was kept', () => {
    expect(parseSeenArtworks([kept])).toEqual([kept]);
  });

  it('keeps the absences the model allows', () => {
    const unrecorded = { ...kept, artistName: null, imageUrl: null, size: null };

    expect(parseSeenArtworks([unrecorded])).toEqual([unrecorded]);
  });

  it('drops an entry that no longer has the shape of a seen artwork', () => {
    expect(
      parseSeenArtworks([
        kept,
        { ...kept, id: 'not-a-number' },
        { ...kept, id: 2, title: 7 },
        { ...kept, id: 3, size: { heightCm: '73' } },
        null,
      ]),
    ).toEqual([kept]);
  });

  it('keeps an artwork stored twice once, where it was first seen', () => {
    const other = { ...kept, id: 1, title: 'Other' };

    expect(parseSeenArtworks([kept, other, { ...kept, title: 'Again' }])).toEqual([kept, other]);
  });

  it('answers with nothing rather than failing on storage it cannot read', () => {
    expect(parseSeenArtworks({ seen: [kept] })).toEqual([]);
    expect(parseSeenArtworks('[]')).toEqual([]);
  });
});
