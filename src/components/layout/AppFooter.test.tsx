import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppFooter } from './AppFooter';

describe('AppFooter', () => {
  it('credits the museum and the API, each one linked where it is named', () => {
    render(<AppFooter />);

    expect(screen.getByRole('link', { name: 'Metropolitan Museum of Art (opens in a new tab)' })).toHaveAttribute(
      'href',
      'https://www.metmuseum.org',
    );
    expect(screen.getByRole('link', { name: 'Collection API (opens in a new tab)' })).toHaveAttribute(
      'href',
      'https://metmuseum.github.io',
    );
  });

  it('opens both of them in a tab of their own, without leaking the referrer', () => {
    render(<AppFooter />);

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    }
  });

  it('does not turn the product name into a link to the museum', () => {
    render(<AppFooter />);

    expect(screen.getByText('Met Museum Explorer').closest('a')).toBeNull();
  });
});
