/**
 * The foot of every screen: the product on the left, its sources on the right.
 *
 * The two sources are named and linked where they are named: the museum, whose
 * collection this is, and the public API the artwork data comes from. They are
 * the only links in the application that leave it, so they open in a tab of
 * their own and carry `rel="noreferrer"`.
 *
 * They are underlined, and separated by words rather than by a space. Set side
 * by side and bare, they read as one long phrase, and nothing tells a reader
 * where the first link ends and the second begins.
 *
 * The product name is deliberately not a link to the museum: this application
 * is not published by the Metropolitan Museum of Art, and a logotype pointing
 * at metmuseum.org would suggest that it is.
 */
export function AppFooter() {
  return (
    <footer className="app-footer flex flex-wrap items-center justify-between gap-4 pt-8 pb-10 text-caption-meta text-text-muted">
      <span className="app-footer__product">Met Museum Explorer</span>
      <span className="app-footer__source">
        Artwork data from the{' '}
        <a
          className="app-footer__link underline underline-offset-2"
          href="https://www.metmuseum.org"
          target="_blank"
          rel="noreferrer"
        >
          Metropolitan Museum of Art
        </a>
        , through its{' '}
        <a
          className="app-footer__link underline underline-offset-2"
          href="https://metmuseum.github.io"
          target="_blank"
          rel="noreferrer"
        >
          Collection API
        </a>
        .
      </span>
    </footer>
  );
}
