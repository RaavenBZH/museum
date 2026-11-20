import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { HomePage } from './HomePage';
import { HOME_FEATURED_ARTWORKS } from './homeFeaturedArtworks';

describe('HomePage', () => {
  it('opens on the headline, as the only first-level heading of the page', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Discover art.');
  });

  it('shows every featured artwork, each one linking to its own detail view', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    for (const artwork of HOME_FEATURED_ARTWORKS) {
      const link = screen.getByRole('link', {
        name: `${artwork.title}, ${artwork.artist}, ${artwork.year}`,
      });

      expect(link).toHaveAttribute('href', artwork.href);
    }
  });

  it('opens every artwork on Discover, at the address of its record', () => {
    for (const artwork of HOME_FEATURED_ARTWORKS) {
      // `/artworks/<id>` once led nowhere: the record of an artwork lives at
      // `/discover/<id>`, which the router serves.
      expect(artwork.href).toMatch(/^\/discover\/\d+$/);
    }
  });

  it('features seven different artworks', () => {
    const addresses = HOME_FEATURED_ARTWORKS.map((artwork) => artwork.href);

    expect(new Set(addresses).size).toBe(7);
  });

  it('offers the modes instead of repeating the screen it is showing', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover');
    expect(screen.getByRole('link', { name: 'Start discovering' })).toHaveAttribute(
      'href',
      '/discover',
    );
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });

  it('shows no counter on the gallery tile, because nothing has counted it yet', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    // The tile is the gallery link that holds a picture; the headline's button does not.
    const tile = screen
      .getAllByRole('link', { name: /My Gallery/ })
      .find((link) => link.querySelector('img') !== null);

    expect(tile).toBeDefined();
    // A counter would be a figure on the tile; there is none to read.
    expect(within(tile as HTMLElement).queryByText(/\d/)).not.toBeInTheDocument();
  });
});
