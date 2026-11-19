import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GalleryCollectionGroup } from './GalleryCollectionGroup';

describe('GalleryCollectionGroup', () => {
  it('is a region named for its collection, with what it holds and how many were seen', () => {
    render(
      <GalleryCollectionGroup
        name="European Paintings"
        description="Paintings from the thirteenth to the early twentieth century."
        countLabel="07 artworks"
      >
        <p>artworks</p>
      </GalleryCollectionGroup>,
    );

    expect(screen.getByRole('region', { name: 'European Paintings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('European Paintings');
    expect(screen.getByText(/thirteenth to the early twentieth century/)).toBeInTheDocument();
    expect(screen.getByText('07 artworks')).toBeInTheDocument();
    expect(screen.getByText('artworks')).toBeInTheDocument();
  });
});
