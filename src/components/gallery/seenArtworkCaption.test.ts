import { describe, expect, it } from 'vitest';
import { seenArtworkByline } from './seenArtworkCaption';

describe('seenArtworkByline', () => {
  it('writes the artist then the date, as the mockup does', () => {
    expect(seenArtworkByline({ artistName: 'Claude Monet', displayDate: '1919' })).toBe(
      'Claude Monet, 1919',
    );
  });

  it('leaves out a date the museum does not give', () => {
    expect(seenArtworkByline({ artistName: 'Claude Monet', displayDate: null })).toBe(
      'Claude Monet',
    );
  });

  it('says the artist is unrecorded rather than leaving the line empty', () => {
    expect(seenArtworkByline({ artistName: null, displayDate: '1500' })).toBe(
      'Artist unrecorded, 1500',
    );
  });
});
