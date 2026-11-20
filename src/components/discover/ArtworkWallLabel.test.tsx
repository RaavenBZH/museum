import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { UNKNOWN_ARTIST_LABEL } from '@/domain/artwork';
import type { ArtworkFactSection } from '@/domain/artworkFacts';
import { ArtworkWallLabel } from './ArtworkWallLabel';

const essentials = [
  { label: 'Medium', value: 'Oil on canvas' },
  { label: 'Collection', value: 'European Paintings' },
];

const artistSection: ArtworkFactSection = {
  title: 'The artist',
  facts: [{ label: 'Nationality', value: 'Dutch' }],
};

const recordSections: ArtworkFactSection[] = [
  { title: 'The artwork', facts: [{ label: 'Classification', value: 'Paintings' }] },
  { title: 'In the museum', facts: [{ label: 'Gallery', value: '822' }] },
];

const museumLink = {
  label: 'View on metmuseum.org',
  href: 'https://www.metmuseum.org/art/collection/search/437984',
};

function renderWallLabel(overrides: Partial<Parameters<typeof ArtworkWallLabel>[0]> = {}) {
  return render(
    <ArtworkWallLabel
      title="Wheat Field with Cypresses"
      titleScale="l"
      artistName="Vincent van Gogh"
      displayDate="1889"
      essentials={essentials}
      artistSection={artistSection}
      recordSections={recordSections}
      museumLink={museumLink}
      {...overrides}
    />,
  );
}

describe('ArtworkWallLabel', () => {
  it('sets the title at the step it is given, so a long one does not take the card', () => {
    const { container } = renderWallLabel({ titleScale: 's' });

    expect(container.querySelector('.artwork-wall-label__title')).toHaveClass(
      'text-artwork-title-s',
    );
    expect(container.querySelector('.artwork-wall-label__title')).not.toHaveClass(
      'text-artwork-title-xl',
    );
  });

  it('opens on the artwork, its author and its date', () => {
    renderWallLabel();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Wheat Field with Cypresses',
    );
    expect(screen.getByText('Vincent van Gogh')).toBeInTheDocument();
    expect(screen.getByText('· 1889')).toBeInTheDocument();
  });

  it('says in words that the artist is unrecorded, rather than leaving a blank', () => {
    renderWallLabel({ artistName: null, displayDate: null });

    expect(screen.getByText(UNKNOWN_ARTIST_LABEL)).toBeInTheDocument();
  });

  it('shows the essentials and the artist without being asked', () => {
    renderWallLabel();

    expect(screen.getByRole('heading', { level: 2, name: 'The essentials' })).toBeInTheDocument();
    expect(screen.getByText('Oil on canvas')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'The artist' })).toBeInTheDocument();
    expect(screen.getByText('Dutch')).toBeInTheDocument();
  });

  it('keeps the rest of the record folded until it is asked for', async () => {
    renderWallLabel();

    const disclosure = screen.getByRole('button', { name: 'See the full record' });

    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    // The record stays in the page and is hidden, so what the button says it
    // controls is an element that exists.
    expect(screen.getByText('Paintings')).not.toBeVisible();

    await userEvent.click(disclosure);

    expect(screen.getByRole('button', { name: 'Hide the full record' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Paintings')).toBeVisible();
    expect(screen.getByText('822')).toBeVisible();
  });

  it('folds the record back, and names what the button controls', async () => {
    const { container } = renderWallLabel();
    const disclosure = screen.getByRole('button', { name: 'See the full record' });
    const recordId = disclosure.getAttribute('aria-controls');

    // Named and present even while folded, which is what makes aria-controls
    // and aria-expanded true statements. The name is generated, so what is
    // asserted is that it points at the record and not at nothing.
    expect(recordId).not.toBeNull();
    expect(container.querySelector(`#${recordId}`)).toHaveClass('artwork-wall-label__record');

    await userEvent.click(screen.getByRole('button', { name: 'See the full record' }));
    await userEvent.click(screen.getByRole('button', { name: 'Hide the full record' }));

    expect(screen.getByText('Paintings')).not.toBeVisible();
  });

  it('is one button form, the secondary one of the system', () => {
    renderWallLabel();

    const disclosure = screen.getByRole('button', { name: 'See the full record' });

    expect(disclosure).toHaveClass('button', 'button--secondary');
  });

  it('sets the folded blocks under the blocks that are always shown', async () => {
    renderWallLabel();
    await userEvent.click(screen.getByRole('button', { name: 'See the full record' }));

    expect(screen.getByRole('heading', { level: 3, name: 'The artwork' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'In the museum' })).toBeInTheDocument();
  });

  it('offers nothing to unfold when the museum has nothing more to say', () => {
    renderWallLabel({ recordSections: [], artistSection: null, museumLink: null });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'The artist' })).not.toBeInTheDocument();
  });

  it('still offers the way out when the link is all the museum has left to give', () => {
    renderWallLabel({ recordSections: [], artistSection: null });

    expect(screen.getByRole('button', { name: 'See the full record' })).toBeInTheDocument();
  });

  it('closes the folded record with the way out to the museum, outside every block', async () => {
    renderWallLabel();

    // Hidden with the rest of the record, so it is not offered at all until
    // the visitor asks for it.
    expect(screen.queryByRole('link', { name: /View on metmuseum.org/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'See the full record' }));

    const link = screen.getByRole('link', {
      name: 'View on metmuseum.org (opens in a new tab)',
    });

    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', museumLink.href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    // Last thing in the record the disclosure controls, and in none of its blocks.
    const recordId = screen
      .getByRole('button', { name: 'Hide the full record' })
      .getAttribute('aria-controls');

    expect(document.getElementById(recordId ?? '')?.lastElementChild).toBe(link);
    // Every block lists its fields; the way out is not one of them.
    for (const field of screen.getAllByRole('definition')) {
      expect(field).not.toContainElement(link);
    }
  });

  it('shows no way out when the museum names no page for the object', () => {
    renderWallLabel({ museumLink: null });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
