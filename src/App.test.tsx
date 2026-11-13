import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

describe('App', () => {
  it('renders the headline as the page title', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Discover art.');
  });

  it('marks Home as the current destination, since the shell shows the home', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    // "Discover" and "My Gallery" also name buttons and tiles, so the bar is
    // asked on its own.
    const bar = within(screen.getByRole('navigation', { name: 'Main navigation' }));

    expect(bar.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(bar.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover');
    expect(bar.getByRole('link', { name: 'Discover' })).not.toHaveAttribute('aria-current');
    expect(bar.getByRole('link', { name: 'My Gallery' })).not.toHaveAttribute('aria-current');
    expect(bar.getByRole('link', { name: 'Play' })).not.toHaveAttribute('aria-current');
  });
});
