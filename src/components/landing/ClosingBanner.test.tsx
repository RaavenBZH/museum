import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonLink } from '@/components/ui/Button';
import { ClosingBanner } from './ClosingBanner';

describe('ClosingBanner', () => {
  it('closes the page with a second-level headline and one action', () => {
    render(
      <ClosingBanner
        firstLine="Nineteen collections."
        secondLine="One at a time."
        action={
          <ButtonLink variant="inverse" href="/discover">
            Start discovering
          </ButtonLink>
        }
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Nineteen collections.');
    expect(screen.getByRole('link', { name: 'Start discovering' })).toHaveAttribute(
      'href',
      '/discover',
    );
  });
});

describe('ClosingBanner texture', () => {
  it('hides the background artwork from assistive technology, being decorative', () => {
    const { container } = render(
      <ClosingBanner
        firstLine="A new way to learn."
        secondLine="Make it a game."
        textureImageUrl="https://images.metmuseum.org/wheat-field.jpg"
        action={null}
      />,
    );
    const texture = container.querySelector('.closing-banner__texture');

    expect(texture).toHaveAttribute('alt', '');
    expect(texture).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.closing-banner__veil')).toBeInTheDocument();
  });

  it('leaves the surface plain when no artwork is given', () => {
    const { container } = render(
      <ClosingBanner firstLine="A new way to learn." secondLine="Make it a game." action={null} />,
    );

    expect(container.querySelector('.closing-banner__texture')).toBeNull();
    expect(container.querySelector('.closing-banner__veil')).toBeNull();
  });
});
