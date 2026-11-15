import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArtworkStage } from './ArtworkStage';

describe('ArtworkStage', () => {
  it('shows the picture with the artwork as its alternative text', () => {
    render(
      <ArtworkStage
        imageUrl="https://images.metmuseum.org/full/437984.jpg"
        imageAlt="Vincent van Gogh, Wheat Field with Cypresses, 1889"
        aspectRatio={1.276}
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Vincent van Gogh, Wheat Field with Cypresses, 1889' }),
    ).toHaveAttribute('src', 'https://images.metmuseum.org/full/437984.jpg');
  });

  it('frames the artwork at its real proportions, within its height budget', () => {
    const { container } = render(
      <ArtworkStage imageUrl="/full.jpg" imageAlt="An artwork" aspectRatio={2} />,
    );

    expect(container.querySelector('.artwork-stage__frame')).toHaveStyle({
      aspectRatio: '2',
      maxWidth: '1240px',
    });
  });

  it('keeps a shape of its own for an artwork the museum has not measured', () => {
    const { container } = render(
      <ArtworkStage imageUrl="/full.jpg" imageAlt="An artwork" aspectRatio={null} />,
    );

    expect(container.querySelector('.artwork-stage__frame')).toHaveStyle({
      aspectRatio: String(4 / 3),
    });
  });

  it('says so in words when the museum has no picture of the artwork', () => {
    render(<ArtworkStage imageUrl={null} imageAlt="An artwork" aspectRatio={1} />);

    expect(screen.getByText('No image available')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
