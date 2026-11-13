import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppHeader } from './AppHeader';

const navigation = [
  { label: 'Discover', href: '/discover' },
  { label: 'Play', href: '/play' },
];

describe('AppHeader', () => {
  it('keeps the navigation in the middle column, whatever the sides hold', () => {
    const { container } = render(<AppHeader navigation={navigation} />);

    expect(container.querySelector('.main-navigation')).toHaveClass('col-start-2');
    expect(container.querySelector('.app-header__action')).toHaveClass('col-start-3');
  });

  it('offers settings rather than a sign-in, since there is no account', () => {
    render(<AppHeader navigation={navigation} />);

    expect(screen.getByRole('button', { name: 'Settings' })).toHaveClass('button--text');
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('takes the logotype home, the way back every site has', () => {
    render(<AppHeader navigation={navigation} currentHref="/" />);

    const logotype = screen.getByRole('link', { name: 'Met Museum Explorer' });

    expect(logotype).toHaveAttribute('href', '/');
    // The bar alone marks the current page, so one destination is not announced
    // as current by two links.
    expect(logotype).not.toHaveAttribute('aria-current');
  });

  it('marks the current destination for assistive technology too', () => {
    render(<AppHeader navigation={navigation} currentHref="/play" />);

    expect(screen.getByRole('link', { name: 'Play' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Discover' })).not.toHaveAttribute('aria-current');
  });
});
