import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { BrandLogo, BrandLogoLink } from './BrandLogo';

describe('BrandLogo', () => {
  it('names the product, with its mark left to the eye alone', () => {
    const { container } = render(<BrandLogo />);

    expect(screen.getByText('Met Museum Explorer')).toBeInTheDocument();
    expect(container.querySelector('.brand-logo__mark')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('BrandLogoLink', () => {
  it('is a link home, and does not claim to be the current page', () => {
    render(
      <MemoryRouter>
        <BrandLogoLink />
      </MemoryRouter>,
    );

    const logotype = screen.getByRole('link', { name: 'Met Museum Explorer' });

    expect(logotype).toHaveAttribute('href', '/');
    expect(logotype).not.toHaveAttribute('aria-current');
  });
});
