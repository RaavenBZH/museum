import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ArtworkCard, type ArtworkCardFormat, type ArtworkCardProps } from './ArtworkCard';

const greatWave: ArtworkCardProps = {
  format: 'small',
  title: 'Under the Wave off Kanagawa',
  artist: 'Katsushika Hokusai',
  year: 'ca. 1830-32',
  imageUrl: 'https://images.metmuseum.org/great-wave.jpg',
  href: '/artworks/36491',
};

const everyFormat: readonly ArtworkCardFormat[] = ['wide', 'panoramic', 'portrait', 'small'];

describe('ArtworkCard', () => {
  it('opens the artwork, and names the link without repeating the picture', () => {
    render(<ArtworkCard {...greatWave} />, { wrapper: MemoryRouter });

    const link = screen.getByRole('link', {
      name: 'Under the Wave off Kanagawa, Katsushika Hokusai, ca. 1830-32',
    });

    expect(link).toHaveAttribute('href', '/artworks/36491');
  });

  it('describes the picture as artist, title and year', () => {
    render(<ArtworkCard {...greatWave} />, { wrapper: MemoryRouter });

    expect(
      screen.getByRole('img', {
        name: 'Katsushika Hokusai, Under the Wave off Kanagawa, ca. 1830-32',
      }),
    ).toBeInTheDocument();
  });

  it.each(everyFormat)('shows title, artist and year on a %s tile', (format) => {
    render(<ArtworkCard {...greatWave} format={format} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Under the Wave off Kanagawa')).toBeInTheDocument();
    expect(screen.getByText('Katsushika Hokusai')).toBeInTheDocument();
    expect(screen.getByText('ca. 1830-32')).toBeInTheDocument();
  });

  it('gives the caption the same shape whatever the tile', () => {
    const shapes = everyFormat.map((format) => {
      const { container, unmount } = render(<ArtworkCard {...greatWave} format={format} />, {
        wrapper: MemoryRouter,
      });
      const caption = container.querySelector('.artwork-card__caption')?.className;
      unmount();
      return caption;
    });

    expect(new Set(shapes).size).toBe(1);
  });

  it('keeps the artist in the markup on a small tile, and lets the box cut it', () => {
    const { container, rerender } = render(<ArtworkCard {...greatWave} format="small" />, {
      wrapper: MemoryRouter,
    });

    // Two title lines plus the gap: a one-line title leaves room for the
    // artist, a two-line title pushes it out. Only the small tile is clipped.
    expect(container.querySelector('.artwork-card__caption-text')).toHaveClass(
      'artwork-card__caption-text--clipped',
    );
    expect(screen.getByText('Katsushika Hokusai')).toBeInTheDocument();

    rerender(<ArtworkCard {...greatWave} format="portrait" />);

    expect(container.querySelector('.artwork-card__caption-text')).not.toHaveClass(
      'artwork-card__caption-text--clipped',
    );
  });

  it('draws the year the same way on every format', () => {
    const { container, rerender } = render(<ArtworkCard {...greatWave} format="wide" />, {
      wrapper: MemoryRouter,
    });
    const shapes = everyFormat.map((format) => {
      rerender(<ArtworkCard {...greatWave} format={format} />);
      return container.querySelector('.date-pill')?.className;
    });

    expect(new Set(shapes).size).toBe(1);
  });

  it('says so in words when the artwork has no picture', () => {
    render(<ArtworkCard {...greatWave} imageUrl={null} />, { wrapper: MemoryRouter });

    expect(screen.getByText('No image available')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
