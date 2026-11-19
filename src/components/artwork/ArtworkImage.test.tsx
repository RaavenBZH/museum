import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArtworkImage } from './ArtworkImage';

describe('ArtworkImage', () => {
  it('shows the picture, named by the artwork it reproduces', () => {
    render(
      <ArtworkImage
        src="https://images.metmuseum.org/full/437984.jpg"
        alt="Vincent van Gogh, Wheat Field with Cypresses, 1889"
      />,
    );

    const picture = screen.getByRole('img', {
      name: 'Vincent van Gogh, Wheat Field with Cypresses, 1889',
    });

    expect(picture).toHaveAttribute('src', 'https://images.metmuseum.org/full/437984.jpg');
    expect(picture).toHaveClass('object-cover');
  });

  it('says in words that there is no picture, rather than showing a hole', () => {
    render(<ArtworkImage src={null} alt="Wheat Field with Cypresses" />);

    expect(screen.getByText('No image available')).toBeInTheDocument();
    // A missing picture is a normal state of this collection, not an error:
    // about six artworks in a hundred come back without one.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps the frame whether there is a picture or not', () => {
    const { container, rerender } = render(<ArtworkImage src="/full.jpg" alt="An artwork" />);

    expect(container.querySelector('.artwork-image')).toHaveClass(
      'rounded-image',
      'bg-surface-muted',
      'overflow-hidden',
    );

    rerender(<ArtworkImage src={null} alt="An artwork" />);

    expect(container.querySelector('.artwork-image')).toHaveClass('rounded-image');
  });

  it('words the absence to fit a thumbnail, rather than cutting it', () => {
    render(<ArtworkImage src={null} alt="" compact />);

    expect(screen.getByText('No image')).toBeInTheDocument();
    expect(screen.queryByText('No image available')).not.toBeInTheDocument();
  });
});
