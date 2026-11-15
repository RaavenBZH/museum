import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ActionTile } from './ActionTile';

describe('ActionTile', () => {
  it('leads where its label says, and says how much is behind it', () => {
    render(<ActionTile href="/gallery" label="My Gallery" counter="24 artworks" />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole('link', { name: /My Gallery/ })).toHaveAttribute('href', '/gallery');
    expect(screen.getByText('24 artworks')).toBeInTheDocument();
  });
});

describe('ActionTile texture', () => {
  it('hides the background artwork from assistive technology, being decorative', () => {
    const { container } = render(
      <ActionTile
        href="/gallery"
        label="My Gallery"
        textureImageUrl="https://images.metmuseum.org/peonies.jpg"
      />,
      { wrapper: MemoryRouter },
    );
    const texture = container.querySelector('.action-tile__texture');

    expect(texture).toHaveAttribute('alt', '');
    expect(texture).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.action-tile__veil')).toBeInTheDocument();
  });

  it('leaves the surface plain when no artwork is given', () => {
    const { container } = render(<ActionTile href="/gallery" label="My Gallery" />, {
      wrapper: MemoryRouter,
    });

    expect(container.querySelector('.action-tile__texture')).toBeNull();
  });
});
