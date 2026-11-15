import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { MainNavigation, type MainNavigationItem } from './MainNavigation';

const items: readonly MainNavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'My Gallery', href: '/gallery' },
];

/**
 * Its links read the current destination from the router, so a test opens an
 * address rather than naming the current item.
 */
function renderNavigation(address = '/') {
  return render(
    <MemoryRouter initialEntries={[address]}>
      <MainNavigation items={items} />
    </MemoryRouter>,
  );
}

describe('MainNavigation', () => {
  it('is reachable by its accessible name', () => {
    renderNavigation();

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('gives every link the same weight and size, so nothing moves on a change', () => {
    const { container } = renderNavigation('/gallery');
    const links = [...container.querySelectorAll('.main-navigation__link')];

    expect(links).toHaveLength(items.length);
    links.forEach((link) => {
      expect(link).toHaveClass('font-semibold', 'text-caption-short');
    });
  });

  it('marks the current destination with more than a colour', () => {
    renderNavigation('/gallery');

    expect(screen.getByRole('link', { name: 'My Gallery' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Discover' })).not.toHaveAttribute('aria-current');
  });
});
