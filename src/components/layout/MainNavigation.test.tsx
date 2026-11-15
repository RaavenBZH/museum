import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MainNavigation, type MainNavigationItem } from './MainNavigation';

const items: readonly MainNavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'My Gallery', href: '/gallery' },
];

describe('MainNavigation', () => {
  it('is reachable by its accessible name', () => {
    render(<MainNavigation items={items} />);

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('gives every link the same weight and size, so nothing moves on a change', () => {
    const { container } = render(<MainNavigation items={items} currentHref="/gallery" />);
    const links = [...container.querySelectorAll('.main-navigation__link')];

    expect(links).toHaveLength(items.length);
    links.forEach((link) => {
      expect(link).toHaveClass('font-semibold', 'text-caption-short');
    });
  });

  it('marks the current destination with more than a colour', () => {
    render(<MainNavigation items={items} currentHref="/gallery" />);

    expect(screen.getByRole('link', { name: 'My Gallery' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Discover' })).not.toHaveAttribute('aria-current');
  });
});
