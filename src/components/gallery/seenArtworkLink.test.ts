import { describe, expect, it } from 'vitest';
import { seenArtworkLinkLabel } from './seenArtworkLink';

describe('seenArtworkLinkLabel', () => {
  it('names the artwork by its title, then the caption under it', () => {
    expect(
      seenArtworkLinkLabel({
        title: 'Wheat Field with Cypresses',
        artistName: 'Vincent van Gogh',
        displayDate: '1889',
      }),
    ).toBe('Wheat Field with Cypresses, Vincent van Gogh, 1889');
  });

  it('words a missing artist the way the caption does', () => {
    expect(
      seenArtworkLinkLabel({ title: 'Saint John', artistName: null, displayDate: null }),
    ).toBe('Saint John, Artist unrecorded');
  });
});
