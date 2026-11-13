import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from './HomePage';
import { HOME_FEATURED_ARTWORKS } from './homeFeaturedArtworks';

describe('HomePage', () => {
  it('opens on the headline, as the only first-level heading of the page', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Discover art.');
  });

  it('shows every featured artwork, each one linking to its own detail view', () => {
    render(<HomePage />);

    for (const artwork of HOME_FEATURED_ARTWORKS) {
      const link = screen.getByRole('link', {
        name: `${artwork.title}, ${artwork.artist}, ${artwork.year}`,
      });

      expect(link).toHaveAttribute('href', artwork.href);
    }
  });

  it('points every artwork at a real object of the collection', () => {
    for (const artwork of HOME_FEATURED_ARTWORKS) {
      expect(artwork.href).toMatch(/^\/artworks\/\d+$/);
    }
  });

  it('offers the modes instead of repeating the screen it is showing', () => {
    render(<HomePage />);

    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover');
    expect(screen.getByRole('link', { name: 'Start playing' })).toHaveAttribute(
      'href',
      '/play',
    );
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });

  it('shows no counter on the gallery tile, because nothing has counted it yet', () => {
    const { container } = render(<HomePage />);
    const tile = container.querySelector('.action-tile');

    expect(within(tile as HTMLElement).getByText('My Gallery')).toBeInTheDocument();
    expect(tile?.querySelector('.action-tile__counter')).toBeNull();
  });
});
