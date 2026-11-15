/**
 * Which step of the artwork-title scale a title is set at.
 *
 * The museum's titles are not of one kind. Most are a few words — "In the
 * Sun", "Saint Andrew" — and carry the screen at full size. Some are a
 * sentence: "Madonna and Child with the Donor, Pietro de' Lardi, Presented by
 * Saint Nicholas". A few are a paragraph, naming the sitter, their title and
 * their dates. Set at one size, the short ones look timid or the long ones
 * take the whole card.
 *
 * So the size is a function of the length, in four steps. The thresholds were
 * measured on 24 artworks drawn at random from European Paintings: 10 titles
 * fitted in 24 characters, 8 more stopped at 40, 4 at 80, and one reached 167.
 *
 * Counting characters is deliberately crude — it ignores the width of the
 * glyphs and the width of the column. It is also stable, pure and testable,
 * which a measurement of rendered text is not, and the four steps are wide
 * enough that a letter either way changes nothing.
 */
export type ArtworkTitleScale = 'xl' | 'l' | 'm' | 's';

/** The longest title each step holds, in characters. */
export const ARTWORK_TITLE_LENGTH_BREAKPOINTS = {
  xl: 24,
  l: 48,
  m: 90,
} as const;

export function artworkTitleScale(title: string): ArtworkTitleScale {
  const { length } = title.trim();

  if (length <= ARTWORK_TITLE_LENGTH_BREAKPOINTS.xl) {
    return 'xl';
  }

  if (length <= ARTWORK_TITLE_LENGTH_BREAKPOINTS.l) {
    return 'l';
  }

  return length <= ARTWORK_TITLE_LENGTH_BREAKPOINTS.m ? 'm' : 's';
}
