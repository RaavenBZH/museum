import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppHeader } from './AppHeader';

const navigation = [
  { label: 'Discover', href: '/discover' },
  { label: 'My Gallery', href: '/gallery' },
];

/**
 * The bar reads the address being shown from the router, so it is rendered at
 * a given address. The display mode comes in as a prop: the bar owns no state.
 */
function renderHeader(address = '/') {
  return render(
    <MemoryRouter initialEntries={[address]}>
      <AppHeader navigation={navigation} themeMode="sand" onThemeModeChange={() => {}} />
    </MemoryRouter>,
  );
}

describe('AppHeader', () => {
  it('keeps the navigation in the middle column, whatever the sides hold', () => {
    const { container } = renderHeader();

    expect(container.querySelector('.main-navigation')).toHaveClass('col-start-2');
    expect(container.querySelector('.app-header__action')).toHaveClass('col-start-3');
  });

  it('carries the day / night switch alone, on a phone as well', () => {
    const { container } = renderHeader();

    expect(screen.getByRole('group', { name: 'Display mode' })).toBeInTheDocument();
    expect(container.querySelector('.theme-mode-switch')).not.toHaveClass('hidden');
    // There is no account and no settings screen, so the slot offers neither.
    expect(screen.queryByRole('button', { name: /sign in|settings/i })).not.toBeInTheDocument();
  });

  it('takes the logotype home, the way back every site has', () => {
    renderHeader('/');

    const logotype = screen.getByRole('link', { name: 'Met Museum Explorer' });

    expect(logotype).toHaveAttribute('href', '/');
    // The bar alone marks the current page, so one destination is not announced
    // as current by two links.
    expect(logotype).not.toHaveAttribute('aria-current');
  });

  it('marks the current destination for assistive technology too', () => {
    renderHeader('/gallery');

    expect(screen.getByRole('link', { name: 'My Gallery' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Discover' })).not.toHaveAttribute('aria-current');
  });
});
