import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ArtworkFactSection as ArtworkFactSectionModel } from '@/domain/artworkFacts';
import { ArtworkFactSection } from './ArtworkFactSection';

const essentials: ArtworkFactSectionModel = {
  title: 'The essentials',
  facts: [
    { label: 'Medium', value: 'Oil on canvas' },
    { label: 'Dimensions', value: '73.2 × 93.4 cm' },
  ],
};

const museum: ArtworkFactSectionModel = {
  title: 'In the museum',
  facts: [{ label: 'Gallery', value: '822' }],
};

describe('ArtworkFactSection', () => {
  it('sets each field as a label and its value, under the block heading', () => {
    const { container } = render(<ArtworkFactSection section={essentials} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('The essentials');
    expect(screen.getByText('Medium').tagName).toBe('DT');
    expect(screen.getByText('Oil on canvas').tagName).toBe('DD');
    expect(container.querySelectorAll('.artwork-fact-section__row')).toHaveLength(2);
  });

  it('takes the heading level it is given, for a block nested under another', () => {
    render(<ArtworkFactSection section={museum} headingLevel={3} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('In the museum');
  });

  it('sets the labels in the sans face: a field name is prose, not a figure', () => {
    render(<ArtworkFactSection section={essentials} />);

    expect(screen.getByText('Medium')).toHaveClass('text-caption-meta', 'text-text-muted');
    expect(screen.getByText('Medium')).not.toHaveClass('font-mono');
  });

  it('holds rows and nothing else: the way out to the museum is not a field', () => {
    render(<ArtworkFactSection section={museum} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows no link in a block that has none', () => {
    render(<ArtworkFactSection section={essentials} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
