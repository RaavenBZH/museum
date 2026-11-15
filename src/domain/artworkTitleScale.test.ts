import { describe, expect, it } from 'vitest';
import { ARTWORK_TITLE_LENGTH_BREAKPOINTS, artworkTitleScale } from './artworkTitleScale';

describe('artworkTitleScale', () => {
  it('sets a short title at the largest step', () => {
    expect(artworkTitleScale('In the Sun')).toBe('xl');
    expect(artworkTitleScale('Christ Healing the Sick')).toBe('xl');
  });

  it('steps down once a title becomes a phrase', () => {
    expect(artworkTitleScale('The Bodmer Oak, Fontainebleau Forest')).toBe('l');
    expect(artworkTitleScale('Still Life: A Basket of Grapes and Other Fruit')).toBe('l');
  });

  it('steps down again for a title that is a sentence', () => {
    expect(
      artworkTitleScale(
        "Madonna and Child with the Donor, Pietro de' Lardi, Presented by Saint Nicholas",
      ),
    ).toBe('m');
  });

  it('reaches the smallest step for the longest titles of the museum', () => {
    expect(
      artworkTitleScale(
        'Portrait of a Woman (Marianna Panciatichi, marchesa Paolucci delle Roncole, 1835–1919, or her sister Beatrice, 1840–1921)',
      ),
    ).toBe('s');
  });

  it('changes step exactly on its breakpoints', () => {
    const { xl, l, m } = ARTWORK_TITLE_LENGTH_BREAKPOINTS;

    expect(artworkTitleScale('x'.repeat(xl))).toBe('xl');
    expect(artworkTitleScale('x'.repeat(xl + 1))).toBe('l');
    expect(artworkTitleScale('x'.repeat(l))).toBe('l');
    expect(artworkTitleScale('x'.repeat(l + 1))).toBe('m');
    expect(artworkTitleScale('x'.repeat(m))).toBe('m');
    expect(artworkTitleScale('x'.repeat(m + 1))).toBe('s');
  });

  it('ignores the space around a title, which the museum sometimes leaves', () => {
    expect(artworkTitleScale(`  ${'x'.repeat(24)}  `)).toBe('xl');
  });
});
